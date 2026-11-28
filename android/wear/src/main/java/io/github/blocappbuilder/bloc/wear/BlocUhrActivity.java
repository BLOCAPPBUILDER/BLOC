package io.github.blocappbuilder.bloc.wear;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.WindowManager;

import com.google.android.gms.wearable.DataClient;
import com.google.android.gms.wearable.DataEvent;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.DataItem;
import com.google.android.gms.wearable.DataMapItem;
import com.google.android.gms.wearable.Node;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.Wearable;

import org.json.JSONObject;

import java.nio.charset.StandardCharsets;

/**
 * BLOC auf der Uhr: Menü, Lauf, Timer/Intervall und Satz für Satz.
 * Daten (Programm, Favoriten, BLOCs, Katalog, Timer) kommen direkt vom Handy über die Wear-OS-Verbindung
 * (Data Layer, Pfad /bloc/uhr) – ohne Konto und ohne Server. Eingetragene Sätze gehen als Nachricht zurück.
 */
public class BlocUhrActivity extends Activity implements SensorEventListener, DataClient.OnDataChangedListener {

    static final String PFAD_DATEN = "/bloc/uhr";
    static final String PFAD_SATZ = "/bloc/satz";
    private static final int ANFRAGE_PULS = 1;

    private UhrAnsicht ansicht;
    private SensorManager sensoren;
    private Sensor pulsSensor;
    private Vibrator vibrator;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        ansicht = new UhrAnsicht(this);
        setContentView(ansicht);
        ansicht.requestFocus();
        sensoren = (SensorManager) getSystemService(SENSOR_SERVICE);
        pulsSensor = sensoren != null ? sensoren.getDefaultSensor(Sensor.TYPE_HEART_RATE) : null;
        vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
    }

    private String pulsRecht() {
        return Build.VERSION.SDK_INT >= 36 ? "android.permission.health.READ_HEART_RATE" : "android.permission.BODY_SENSORS";
    }

    @Override
    protected void onResume() {
        super.onResume();
        ansicht.requestFocus();
        if (pulsSensor != null) {
            if (checkSelfPermission(pulsRecht()) == PackageManager.PERMISSION_GRANTED) pulsStarten();
            else requestPermissions(new String[]{pulsRecht()}, ANFRAGE_PULS);
        }
        Wearable.getDataClient(this).addListener(this);
        datenHolen();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (sensoren != null) sensoren.unregisterListener(this);
        Wearable.getDataClient(this).removeListener(this);
    }

    private void pulsStarten() {
        sensoren.registerListener(this, pulsSensor, SensorManager.SENSOR_DELAY_NORMAL);
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] rechte, int[] ergebnis) {
        super.onRequestPermissionsResult(code, rechte, ergebnis);
        if (code == ANFRAGE_PULS && ergebnis.length > 0 && ergebnis[0] == PackageManager.PERMISSION_GRANTED) pulsStarten();
    }

    @Override
    public void onSensorChanged(SensorEvent e) {
        if (e.sensor.getType() != Sensor.TYPE_HEART_RATE || e.values.length == 0) return;
        if (e.accuracy == SensorManager.SENSOR_STATUS_NO_CONTACT) { ansicht.puls = 0; return; }
        int bpm = Math.round(e.values[0]);
        ansicht.puls = bpm > 25 && bpm < 250 ? bpm : 0;
    }

    @Override public void onAccuracyChanged(Sensor s, int a) { }

    void vibriere(long ms) {
        if (vibrator == null || !vibrator.hasVibrator()) return;
        vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
    }

    @Override
    public void onBackPressed() {
        if (!ansicht.zurueck()) super.onBackPressed();
    }

    // ---------- Handy ↔ Uhr ----------
    private void datenHolen() {
        Wearable.getDataClient(this).getDataItems(new Uri.Builder().scheme("wear").path(PFAD_DATEN).build())
                .addOnSuccessListener(puffer -> {
                    for (DataItem it : puffer) uebernehmen(it);
                    puffer.release();
                });
    }

    /** Die Daten kommen gezippt als Anhang (Asset); lesen und auswerten im Hintergrund */
    private void uebernehmen(DataItem it) {
        if (!PFAD_DATEN.equals(it.getUri().getPath())) return;
        com.google.android.gms.wearable.Asset a = DataMapItem.fromDataItem(it).getDataMap().getAsset("daten");
        if (a == null) return;
        Wearable.getDataClient(this).getFdForAsset(a).addOnSuccessListener(antwort -> new Thread(() -> {
            try (java.io.InputStream in = new java.util.zip.GZIPInputStream(antwort.getInputStream())) {
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                byte[] puffer = new byte[16384];
                int n;
                while ((n = in.read(puffer)) > 0) out.write(puffer, 0, n);
                Daten d = Daten.ausJson(out.toString("UTF-8"));
                if (d != null) runOnUiThread(() -> ansicht.neueDaten(d));
            } catch (Exception ignored) { }
        }).start());
    }

    @Override
    public void onDataChanged(DataEventBuffer ereignisse) {
        for (DataEvent e : ereignisse) if (e.getType() == DataEvent.TYPE_CHANGED) uebernehmen(e.getDataItem());
    }

    /** Eingetragenen Satz ans Handy schicken; ist das Handy gerade nicht da, liefert der Data Layer später nach */
    void satzEingetragen(Daten.Workout w, Daten.Uebung u, int satz, int wdh, float kg) {
        try {
            JSONObject o = new JSONObject();
            o.put("workout", w.id); o.put("uebung", u.id); o.put("name", u.name);
            o.put("satz", satz); o.put("wdh", wdh); o.put("kg", kg); o.put("at", System.currentTimeMillis());
            PutDataMapRequest r = PutDataMapRequest.create(PFAD_SATZ + "/" + System.currentTimeMillis());
            r.getDataMap().putString("json", o.toString());
            Wearable.getDataClient(this).putDataItem(r.asPutDataRequest().setUrgent());
        } catch (Exception ignored) { }
    }

    /** Für später (Lauf, Variante A): kurze Befehle ans Handy, z. B. Pause/Stopp */
    void anHandy(String pfad, String text) {
        Wearable.getNodeClient(this).getConnectedNodes().addOnSuccessListener(knoten -> {
            for (Node n : knoten) Wearable.getMessageClient(this).sendMessage(n.getId(), pfad, text.getBytes(StandardCharsets.UTF_8));
        });
    }
}
