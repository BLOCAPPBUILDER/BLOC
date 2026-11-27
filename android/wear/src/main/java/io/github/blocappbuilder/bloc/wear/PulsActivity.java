package io.github.blocappbuilder.bloc.wear;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;

/**
 * Erste Testfassung der BLOC-Uhr-App: zeigt den Puls live vom Sensor der Uhr.
 * Noch ohne Verbindung zum Handy. Spaeter kommen Zeit, Distanz, Pace,
 * Pulszone sowie Pause/Stop dazu (Variante A: Uhr = Anzeige und Fernbedienung).
 */
public class PulsActivity extends Activity implements SensorEventListener {

    private static final int ANFRAGE_PULS = 1;
    private static final String RECHT_ALT = "android.permission.BODY_SENSORS";
    private static final String RECHT_NEU = "android.permission.health.READ_HEART_RATE";

    private SensorManager sensorManager;
    private Sensor pulsSensor;
    private PulsAnsicht ansicht;
    private String pulsWert = "–", statistikWert = "";
    private int max = 0;
    private long summe = 0, anzahl = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Bildschirm anlassen, solange die Test-App offen ist
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        ansicht = new PulsAnsicht(this);
        ansicht.setze("–", "Starte Sensor …", false, "");
        setContentView(ansicht);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        pulsSensor = sensorManager != null ? sensorManager.getDefaultSensor(Sensor.TYPE_HEART_RATE) : null;
    }

    private void status(String t, boolean live) {
        ansicht.setze(pulsWert, t, live, statistikWert);
    }

    private String benoetigtesRecht() {
        return Build.VERSION.SDK_INT >= 36 ? RECHT_NEU : RECHT_ALT;
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (pulsSensor == null) {
            status("Kein Pulssensor gefunden", false);
            return;
        }
        if (checkSelfPermission(benoetigtesRecht()) != PackageManager.PERMISSION_GRANTED) {
            status("Bitte Zugriff auf Puls erlauben", false);
            requestPermissions(new String[]{benoetigtesRecht()}, ANFRAGE_PULS);
            return;
        }
        starten();
    }

    private void starten() {
        sensorManager.registerListener(this, pulsSensor, SensorManager.SENSOR_DELAY_NORMAL);
        status("Messe …", false);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (sensorManager != null) sensorManager.unregisterListener(this);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != ANFRAGE_PULS) return;
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            starten();
        } else {
            status("Ohne Erlaubnis kein Puls", false);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() != Sensor.TYPE_HEART_RATE || event.values.length == 0) return;
        if (event.accuracy == SensorManager.SENSOR_STATUS_NO_CONTACT) {
            status("Kein Hautkontakt", false);
            return;
        }
        int bpm = Math.round(event.values[0]);
        if (bpm <= 0) {
            status("Messe …", false);
            return;
        }
        pulsWert = String.valueOf(bpm);
        max = Math.max(max, bpm);
        summe += bpm;
        anzahl++;
        statistikWert = "Ø " + (summe / anzahl) + " · max " + max;
        status("Live", true);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (accuracy == SensorManager.SENSOR_STATUS_NO_CONTACT) status("Kein Hautkontakt", false);
    }
}
