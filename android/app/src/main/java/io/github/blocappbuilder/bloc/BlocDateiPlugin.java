package io.github.blocappbuilder.bloc;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * BLOC-Datei von außen: wer eine .bloc-Datei antippt (Chat, Mail, Dateien), startet BLOC mit ACTION_VIEW/ACTION_SEND.
 * Die Datei wird hier nur gelesen (höchstens 300 KB, nur content://-Adressen, nichts wird gespeichert oder gesendet)
 * und von der Web-Seite über abholen() abgeholt; sie prüft den Inhalt und fragt, ob er gespeichert werden soll.
 */
@CapacitorPlugin(name = "BlocDatei")
public class BlocDateiPlugin extends Plugin {
    private static final int MAX_BYTES = 300000;
    private static final Object SPERRE = new Object();
    private static JSObject wartend = null;
    private static BlocDateiPlugin instanz = null;

    @Override
    public void load() {
        instanz = this;
    }

    @Override
    protected void handleOnDestroy() {
        if (instanz == this) instanz = null;
    }

    /** Holt die zuletzt empfangene Datei ab (einmalig): { text } | { zuGross: true } | { fehler: true } | {} */
    @PluginMethod
    public void abholen(PluginCall call) {
        JSObject r;
        synchronized (SPERRE) {
            r = wartend != null ? wartend : new JSObject();
            wartend = null;
        }
        call.resolve(r);
    }

    /** Aus MainActivity (onCreate und onNewIntent) aufgerufen: liest die Datei des Intents im Hintergrund */
    static void aufnehmen(final Context ctx, Intent intent) {
        if (intent == null) return;
        String aktion = intent.getAction();
        Uri uri = null;
        if (Intent.ACTION_VIEW.equals(aktion)) {
            uri = intent.getData();
        } else if (Intent.ACTION_SEND.equals(aktion)) {
            uri = streamUri(intent);
        }
        // Nur content://: file://-Adressen könnten auf die eigenen, privaten App-Dateien zeigen
        if (uri == null || !"content".equals(uri.getScheme())) return;
        // Intent verbrauchen, damit ein Neustart der Activity dieselbe Datei nicht noch einmal liest
        intent.setAction(Intent.ACTION_MAIN);
        intent.setData(null);
        intent.removeExtra(Intent.EXTRA_STREAM);
        final Uri quelle = uri;
        new Thread(new Runnable() {
            @Override
            public void run() {
                JSObject r = new JSObject();
                try (InputStream in = ctx.getContentResolver().openInputStream(quelle)) {
                    if (in == null) throw new IllegalStateException("kein Stream");
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    byte[] puffer = new byte[8192];
                    int n;
                    boolean zuGross = false;
                    while ((n = in.read(puffer)) > 0) {
                        if (out.size() + n > MAX_BYTES) { zuGross = true; break; }
                        out.write(puffer, 0, n);
                    }
                    if (zuGross) r.put("zuGross", true);
                    else r.put("text", out.toString("UTF-8"));
                } catch (Exception e) {
                    r = new JSObject();
                    r.put("fehler", true);
                }
                synchronized (SPERRE) { wartend = r; }
                BlocDateiPlugin p = instanz;
                // Nur ein Hinweis (ohne Inhalt); die Seite holt die Datei mit abholen(). Bis sie zuhört, bleibt er erhalten.
                if (p != null) p.notifyListeners("blocDatei", new JSObject(), true);
            }
        }).start();
    }

    @SuppressWarnings("deprecation")
    private static Uri streamUri(Intent intent) {
        try {
            Object o = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            return o instanceof Uri ? (Uri) o : null;
        } catch (Exception e) {
            return null;
        }
    }
}
