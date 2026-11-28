package io.github.blocappbuilder.bloc;

import android.content.Intent;
import android.util.Base64;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Iterator;

/**
 * Brücke zum Timer-Dienst (BlocTimerService).
 * zeigen({ titel, pause, fertig, ton, klang, laut, txtPause, txtWeiter, modus:"timer"|"lauf", laufStart, schritte:[{ name, ende, dauer }], toene:[{ at, art }] })
 *   startet bzw. aktualisiert die Anzeige; mit ton:true spielt der Dienst die Töne (App im Hintergrund).
 * klaenge({ klang, dateien:{ work:"<base64 WAV>", … } }) legt die vorab gerenderten Klänge im App-Cache ab (nur lokal).
 * stoppen() nimmt alles weg. Ereignis „aktion“ ({ a:"pause"|"weiter" }): Knopf in der Benachrichtigung oder am Kopfhörer.
 */
@CapacitorPlugin(name = "BlocTimer")
public class BlocTimerPlugin extends Plugin {
    private static BlocTimerPlugin instanz = null;

    @Override
    public void load() { instanz = this; }

    static void aktionMelden(String a) {
        BlocTimerPlugin p = instanz;
        if (p == null) return;
        JSObject d = new JSObject();
        d.put("a", a);
        p.notifyListeners("aktion", d, true);
    }

    @PluginMethod
    public void zeigen(PluginCall call) {
        try {
            JSArray schritte = call.getArray("schritte", new JSArray());
            int n = Math.min(schritte.length(), 400);
            String[] namen = new String[n];
            String[] cover = new String[n];   // Cover für Uhren (JSON je Schritt, siehe UhrCover)
            long[] enden = new long[n], dauern = new long[n];
            for (int i = 0; i < n; i++) {
                JSONObject s = schritte.getJSONObject(i);
                namen[i] = s.optString("name", "");
                JSONObject cv = s.optJSONObject("cover");
                cover[i] = cv != null ? cv.toString() : "";
                enden[i] = s.optLong("ende", 0);
                dauern[i] = s.optLong("dauer", 0);
            }
            JSArray toene = call.getArray("toene", new JSArray());
            int m = Math.min(toene.length(), 2000);
            long[] cueAt = new long[m];
            String[] cueArt = new String[m];
            for (int i = 0; i < m; i++) {
                JSONObject c = toene.getJSONObject(i);
                cueAt[i] = c.optLong("at", 0);
                cueArt[i] = c.optString("art", "");
            }
            Intent it = new Intent(getContext(), BlocTimerService.class);
            it.putExtra(BlocTimerService.X_TITEL, call.getString("titel", "BLOC"));
            it.putExtra(BlocTimerService.X_NAMEN, namen);
            it.putExtra(BlocTimerService.X_COVER, cover);
            it.putExtra(BlocTimerService.X_ENDEN, enden);
            it.putExtra(BlocTimerService.X_DAUERN, dauern);
            it.putExtra(BlocTimerService.X_PAUSE, Boolean.TRUE.equals(call.getBoolean("pause", false)));
            it.putExtra(BlocTimerService.X_FERTIG, call.getString("fertig", ""));
            it.putExtra(BlocTimerService.X_TON, Boolean.TRUE.equals(call.getBoolean("ton", false)));
            it.putExtra(BlocTimerService.X_CUE_AT, cueAt);
            it.putExtra(BlocTimerService.X_CUE_ART, cueArt);
            it.putExtra(BlocTimerService.X_KLANG, call.getString("klang", ""));
            Double laut = call.getDouble("laut", 1.0);
            it.putExtra(BlocTimerService.X_LAUT, laut == null ? 1f : (float) Math.max(0, Math.min(1, laut)));
            it.putExtra(BlocTimerService.X_TXT_PAUSE, call.getString("txtPause", "Pause"));
            it.putExtra(BlocTimerService.X_TXT_WEITER, call.getString("txtWeiter", "Weiter"));
            it.putExtra(BlocTimerService.X_MODUS, call.getString("modus", "timer"));
            Double ls = call.getDouble("laufStart", 0.0);
            it.putExtra(BlocTimerService.X_LAUF_START, ls == null ? 0L : ls.longValue());
            ContextCompat.startForegroundService(getContext(), it);
            call.resolve();
        } catch (Exception e) {
            call.reject("Timer-Anzeige nicht möglich: " + e.getMessage());
        }
    }

    /** Klänge als WAV ablegen: <cache>/bloc-klang/<klang>-<art>.wav (alte Klänge anderer Stile werden gelöscht) */
    @PluginMethod
    public void klaenge(PluginCall call) {
        try {
            String klang = call.getString("klang", "");
            JSObject dateien = call.getObject("dateien", new JSObject());
            if (klang == null || !klang.matches("[a-z0-9-]{1,60}")) { call.reject("ungültiger Name"); return; }
            File ordner = new File(getContext().getCacheDir(), "bloc-klang");
            if (!ordner.exists() && !ordner.mkdirs()) { call.reject("Ordner"); return; }
            File[] alt = ordner.listFiles();
            if (alt != null) for (File f : alt) if (!f.getName().startsWith(klang + "-")) f.delete();
            Iterator<String> it = dateien.keys();
            while (it.hasNext()) {
                String art = it.next();
                if (!art.matches("[a-z]{1,20}")) continue;
                byte[] wav = Base64.decode(dateien.getString(art), Base64.DEFAULT);
                if (wav.length > 2_000_000) continue;
                try (FileOutputStream o = new FileOutputStream(new File(ordner, klang + "-" + art + ".wav"))) { o.write(wav); }
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Klänge nicht gespeichert: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stoppen(PluginCall call) {
        getContext().stopService(new Intent(getContext(), BlocTimerService.class));
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (instanz == this) instanz = null;
        getContext().stopService(new Intent(getContext(), BlocTimerService.class));
    }
}
