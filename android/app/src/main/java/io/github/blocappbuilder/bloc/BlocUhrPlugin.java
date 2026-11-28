package io.github.blocappbuilder.bloc;

import android.net.Uri;

import java.nio.charset.StandardCharsets;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.wearable.DataClient;
import com.google.android.gms.wearable.DataEvent;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.DataItem;
import com.google.android.gms.wearable.DataMapItem;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.Node;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.Wearable;

/**
 * Verbindung zur BLOC-Uhr-App (Wear OS) über die Wear-OS-Verbindung (Data Layer):
 * direkt zwischen Handy und Uhr, ohne Konto und ohne Server.
 *  - senden: Favoriten, BLOCs, Katalog, Timer und Programm als JSON unter /bloc/uhr
 *  - abholen: auf der Uhr eingetragene Sätze und „Training fertig“ (/bloc/satz/…) lesen; sie bleiben liegen
 *  - bestaetigen: erst wenn die App sie gesichert hat, werden genau diese Nachrichten gelöscht
 *  - Ereignis „uhrSatz“: neue Sätze, während die App offen ist
 * Ohne gekoppelte Uhr bleibt alles lokal liegen und geht nirgendwohin.
 */
@CapacitorPlugin(name = "BlocUhr")
public class BlocUhrPlugin extends Plugin implements MessageClient.OnMessageReceivedListener, DataClient.OnDataChangedListener {

    private static final String PFAD_SATZ = "/bloc/satz";

    /** Befehle der Uhr beim Lauf (start, pause, weiter, stopp, abbrechen) gehen als Ereignis „uhrBefehl“ an die App */
    @Override
    public void load() {
        try { Wearable.getMessageClient(getContext()).addListener(this); } catch (Exception ignored) { }
        try { Wearable.getDataClient(getContext()).addListener(this); } catch (Exception ignored) { }
    }

    @Override
    protected void handleOnDestroy() {
        try { Wearable.getMessageClient(getContext()).removeListener(this); } catch (Exception ignored) { }
        try { Wearable.getDataClient(getContext()).removeListener(this); } catch (Exception ignored) { }
    }

    @Override
    public void onDataChanged(DataEventBuffer ereignisse) {
        boolean neu = false;
        for (DataEvent e : ereignisse) {
            String pfad = e.getDataItem().getUri().getPath();
            if (e.getType() == DataEvent.TYPE_CHANGED && pfad != null && pfad.startsWith(PFAD_SATZ)) neu = true;
        }
        if (neu) notifyListeners("uhrSatz", new JSObject());
    }

    @Override
    public void onMessageReceived(MessageEvent e) {
        if (!"/bloc/lauf/befehl".equals(e.getPath())) return;
        JSObject o = new JSObject();
        o.put("befehl", new String(e.getData(), StandardCharsets.UTF_8));
        notifyListeners("uhrBefehl", o, true);
    }

    /** Live-Stand des Laufs (Zeit, km, Pace, Pause) an die verbundene Uhr; kurze Nachricht, wird nicht gespeichert */
    @PluginMethod
    public void laufLive(PluginCall call) {
        String json = call.getString("json");
        if (json == null) { call.reject("kein json"); return; }
        try {
            byte[] daten = json.getBytes(StandardCharsets.UTF_8);
            Wearable.getNodeClient(getContext()).getConnectedNodes().addOnSuccessListener(knoten -> {
                for (Node n : knoten) Wearable.getMessageClient(getContext()).sendMessage(n.getId(), "/bloc/lauf", daten);
                call.resolve();
            }).addOnFailureListener(x -> call.resolve());
        } catch (Exception e) {
            call.resolve();
        }
    }

    @PluginMethod
    public void senden(PluginCall call) {
        String json = call.getString("json");
        if (json == null) { call.reject("kein json"); return; }
        try {
            // Gezippt als Anhang (Asset): ein Datenpaket darf sonst nur rund 100 KB gross sein
            java.io.ByteArrayOutputStream bytes = new java.io.ByteArrayOutputStream();
            try (java.util.zip.GZIPOutputStream gz = new java.util.zip.GZIPOutputStream(bytes)) {
                gz.write(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }
            PutDataMapRequest r = PutDataMapRequest.create("/bloc/uhr");
            r.getDataMap().putAsset("daten", com.google.android.gms.wearable.Asset.createFromBytes(bytes.toByteArray()));
            Wearable.getDataClient(getContext()).putDataItem(r.asPutDataRequest().setUrgent())
                    .addOnSuccessListener(x -> call.resolve())
                    .addOnFailureListener(e -> call.reject("senden fehlgeschlagen"));
        } catch (Exception e) {
            call.reject("keine Uhr-Verbindung");
        }
    }

    @PluginMethod
    public void abholen(PluginCall call) {
        try {
            DataClient dc = Wearable.getDataClient(getContext());
            Uri uri = new Uri.Builder().scheme("wear").path(PFAD_SATZ).build();
            dc.getDataItems(uri, DataClient.FILTER_PREFIX).addOnSuccessListener(puffer -> {
                JSArray l = new JSArray(), uris = new JSArray();
                for (DataItem it : puffer) {
                    String j = DataMapItem.fromDataItem(it).getDataMap().getString("json");
                    if (j == null) continue;
                    l.put(j);
                    uris.put(it.getUri().toString());
                }
                puffer.release();
                JSObject o = new JSObject();
                o.put("saetze", l);
                o.put("uris", uris);
                call.resolve(o);
            }).addOnFailureListener(e -> { JSObject o = new JSObject(); o.put("saetze", new JSArray()); call.resolve(o); });
        } catch (Exception e) {
            JSObject o = new JSObject();
            o.put("saetze", new JSArray());
            call.resolve(o);
        }
    }

    /** Gesicherte Nachrichten löschen: { eintraege:[{ uri, json }] }. Hat die Uhr eine inzwischen korrigiert (anderer Inhalt), bleibt sie für das nächste Abholen liegen. */
    @PluginMethod
    public void bestaetigen(PluginCall call) {
        try {
            JSArray l = call.getArray("eintraege", new JSArray());
            DataClient dc = Wearable.getDataClient(getContext());
            for (int i = 0; i < l.length(); i++) {
                org.json.JSONObject e = l.optJSONObject(i);
                if (e == null) continue;
                Uri uri = Uri.parse(e.optString("uri"));
                String json = e.optString("json");
                if (uri.getPath() == null || !uri.getPath().startsWith(PFAD_SATZ)) continue;
                dc.getDataItem(uri).addOnSuccessListener(it -> {
                    if (it != null && json.equals(DataMapItem.fromDataItem(it).getDataMap().getString("json"))) dc.deleteDataItems(uri);
                });
            }
        } catch (Exception ignored) { }
        call.resolve();
    }
}
