package io.github.blocappbuilder.bloc;

import android.content.Intent;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

/**
 * Brücke zum Timer-Dienst (BlocTimerService).
 * zeigen({ titel, pause, fertig, schritte:[{ name, ende }] }) startet bzw. aktualisiert die Anzeige, stoppen() nimmt sie weg.
 */
@CapacitorPlugin(name = "BlocTimer")
public class BlocTimerPlugin extends Plugin {

    @PluginMethod
    public void zeigen(PluginCall call) {
        try {
            JSArray schritte = call.getArray("schritte", new JSArray());
            int n = Math.min(schritte.length(), 400);
            String[] namen = new String[n];
            long[] enden = new long[n];
            for (int i = 0; i < n; i++) {
                JSONObject s = schritte.getJSONObject(i);
                namen[i] = s.optString("name", "");
                enden[i] = s.optLong("ende", 0);
            }
            Intent it = new Intent(getContext(), BlocTimerService.class);
            it.putExtra(BlocTimerService.X_TITEL, call.getString("titel", "BLOC"));
            it.putExtra(BlocTimerService.X_NAMEN, namen);
            it.putExtra(BlocTimerService.X_ENDEN, enden);
            it.putExtra(BlocTimerService.X_PAUSE, Boolean.TRUE.equals(call.getBoolean("pause", false)));
            it.putExtra(BlocTimerService.X_FERTIG, call.getString("fertig", ""));
            ContextCompat.startForegroundService(getContext(), it);
            call.resolve();
        } catch (Exception e) {
            call.reject("Timer-Anzeige nicht möglich: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stoppen(PluginCall call) {
        getContext().stopService(new Intent(getContext(), BlocTimerService.class));
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        getContext().stopService(new Intent(getContext(), BlocTimerService.class));
    }
}
