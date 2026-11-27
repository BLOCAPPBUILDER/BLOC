package io.github.blocappbuilder.bloc.wear;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Erste Testfassung der BLOC-Uhr-App: zeigt den Puls live vom Sensor der Uhr.
 * Noch ohne Verbindung zum Handy. Spaeter kommen Zeit, Distanz, Pace,
 * Pulszone sowie Pause/Stop dazu (Variante A: Uhr = Anzeige und Fernbedienung).
 */
public class PulsActivity extends Activity implements SensorEventListener {

    private static final int ANFRAGE_PULS = 1;
    private static final String RECHT_ALT = "android.permission.BODY_SENSORS";
    private static final String RECHT_NEU = "android.permission.health.READ_HEART_RATE";
    private static final int GRUEN = Color.parseColor("#7CE38B");

    private SensorManager sensorManager;
    private Sensor pulsSensor;
    private TextView pulsText, statusText, statistikText;
    private int max = 0;
    private long summe = 0, anzahl = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Bildschirm anlassen, solange die Test-App offen ist
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        LinearLayout wurzel = new LinearLayout(this);
        wurzel.setOrientation(LinearLayout.VERTICAL);
        wurzel.setGravity(Gravity.CENTER);
        wurzel.setBackgroundColor(Color.BLACK);

        TextView titel = text("BLOC · Puls", 14, Color.GRAY, false);
        pulsText = text("--", 56, Color.WHITE, true);
        TextView einheit = text("bpm", 14, Color.GRAY, false);
        statusText = text("Starte Sensor …", 13, GRUEN, false);
        statistikText = text("", 12, Color.GRAY, false);

        wurzel.addView(titel);
        wurzel.addView(pulsText);
        wurzel.addView(einheit);
        wurzel.addView(statusText);
        wurzel.addView(statistikText);
        setContentView(wurzel);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        pulsSensor = sensorManager != null ? sensorManager.getDefaultSensor(Sensor.TYPE_HEART_RATE) : null;
    }

    private TextView text(String inhalt, int sp, int farbe, boolean fett) {
        TextView t = new TextView(this);
        t.setText(inhalt);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(farbe);
        t.setGravity(Gravity.CENTER);
        if (fett) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private String benoetigtesRecht() {
        return Build.VERSION.SDK_INT >= 36 ? RECHT_NEU : RECHT_ALT;
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (pulsSensor == null) {
            statusText.setText("Kein Pulssensor gefunden");
            return;
        }
        if (checkSelfPermission(benoetigtesRecht()) != PackageManager.PERMISSION_GRANTED) {
            statusText.setText("Bitte Zugriff auf Puls erlauben");
            requestPermissions(new String[]{benoetigtesRecht()}, ANFRAGE_PULS);
            return;
        }
        starten();
    }

    private void starten() {
        sensorManager.registerListener(this, pulsSensor, SensorManager.SENSOR_DELAY_NORMAL);
        statusText.setText("Messe …");
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
            statusText.setText("Ohne Erlaubnis kein Puls");
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() != Sensor.TYPE_HEART_RATE || event.values.length == 0) return;
        if (event.accuracy == SensorManager.SENSOR_STATUS_NO_CONTACT) {
            statusText.setText("Kein Hautkontakt");
            return;
        }
        int bpm = Math.round(event.values[0]);
        if (bpm <= 0) {
            statusText.setText("Messe …");
            return;
        }
        pulsText.setText(String.valueOf(bpm));
        statusText.setText("Live");
        max = Math.max(max, bpm);
        summe += bpm;
        anzahl++;
        statistikText.setText("Ø " + (summe / anzahl) + " · max " + max);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (accuracy == SensorManager.SENSOR_STATUS_NO_CONTACT) statusText.setText("Kein Hautkontakt");
    }
}
