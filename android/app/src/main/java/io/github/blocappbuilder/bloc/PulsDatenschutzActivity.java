package io.github.blocappbuilder.bloc;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.util.TypedValue;
import android.widget.ScrollView;
import android.widget.TextView;

import java.util.Locale;

/**
 * Pflichtseite für Health Connect: erklärt, wofür BLOC die Herzfrequenz liest.
 * Health Connect öffnet sie aus dem Erlaubnis-Dialog („Datenschutzerklärung“) und aus seinen Einstellungen.
 */
public class PulsDatenschutzActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        boolean de = "de".equals(Locale.getDefault().getLanguage());
        TextView t = new TextView(this);
        int rand = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 24, getResources().getDisplayMetrics());
        t.setPadding(rand, rand, rand, rand);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        t.setTextColor(Color.WHITE);
        t.setText(de
            ? "BLOC und deine Herzfrequenz\n\n"
              + "BLOC liest aus Health Connect nur die Herzfrequenz, und nur für den Zeitraum deiner Läufe, die du in BLOC aufzeichnest. "
              + "Daraus berechnet BLOC Durchschnitt, Maximum, Zeit in den Pulszonen und den Puls je Kilometer.\n\n"
              + "Die Werte bleiben auf diesem Gerät. BLOC schreibt nichts in Health Connect, schickt nichts an Server und gibt nichts an Dritte weiter.\n\n"
              + "Die Erlaubnis kannst du jederzeit in Health Connect unter „App-Berechtigungen“ zurücknehmen. "
              + "Die vollständige Datenschutzerklärung findest du in BLOC unter Einstellungen."
            : "BLOC and your heart rate\n\n"
              + "BLOC reads only heart rate from Health Connect, and only for the time of the runs you record in BLOC. "
              + "From it, BLOC calculates average, maximum, time in heart-rate zones and heart rate per kilometre.\n\n"
              + "The values stay on this device. BLOC writes nothing to Health Connect, sends nothing to servers and shares nothing with third parties.\n\n"
              + "You can withdraw the permission at any time in Health Connect under “App permissions”. "
              + "The full privacy policy is in BLOC under Settings.");
        ScrollView s = new ScrollView(this);
        s.setBackgroundColor(Color.parseColor("#111111"));
        s.addView(t);
        setContentView(s);
    }
}
