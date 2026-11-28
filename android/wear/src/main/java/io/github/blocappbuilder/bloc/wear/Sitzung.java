package io.github.blocappbuilder.bloc.wear;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Ein laufendes Satz-Training auf der Uhr: Kennung (sid) fürs Handy und je Übung die eingetragenen Sätze.
 * Bleibt gespeichert, damit man nach dem Verlassen des Screens oder der App dort weitermacht (bis 4 Stunden nach dem letzten Satz).
 */
final class Sitzung {
    private static final String ABLAGE = "satzTraining";
    private static final long OFFEN_MS = 4 * 3600_000L;

    final String workout, sid;
    long letzte = 0;
    private final Map<String, Integer> saetze = new HashMap<>();

    private Sitzung(String workout, String sid) { this.workout = workout; this.sid = sid; }

    int saetze(String uebung) { Integer n = saetze.get(uebung); return n == null ? 0 : n; }
    int gesamt() { int n = 0; for (int x : saetze.values()) n += x; return n; }

    private static SharedPreferences ablage(Context c) { return c.getSharedPreferences(ABLAGE, Context.MODE_PRIVATE); }

    /** Weiter mit dem offenen Training dieses BLOCs, sonst ein neues */
    static Sitzung fuer(Context c, String workout) {
        try {
            String t = ablage(c).getString("offen", null);
            if (t != null) {
                JSONObject o = new JSONObject(t);
                if (workout.equals(o.optString("workout")) && System.currentTimeMillis() - o.optLong("letzte") < OFFEN_MS) {
                    Sitzung s = new Sitzung(workout, o.getString("sid"));
                    s.letzte = o.optLong("letzte");
                    JSONObject m = o.getJSONObject("saetze");
                    for (Iterator<String> i = m.keys(); i.hasNext(); ) { String k = i.next(); s.saetze.put(k, m.getInt(k)); }
                    return s;
                }
            }
        } catch (Exception ignored) { }
        return new Sitzung(workout, "u" + System.currentTimeMillis());
    }

    void satz(Context c, String uebung, long at) {
        saetze.put(uebung, saetze(uebung) + 1);
        letzte = at;
        try {
            JSONObject o = new JSONObject(), m = new JSONObject();
            for (Map.Entry<String, Integer> e : saetze.entrySet()) m.put(e.getKey(), e.getValue());
            o.put("workout", workout); o.put("sid", sid); o.put("letzte", letzte); o.put("saetze", m);
            ablage(c).edit().putString("offen", o.toString()).apply();
        } catch (Exception ignored) { }
    }

    /** Abgeschlossen: das nächste Mal beginnt ein neues Training */
    void beenden(Context c) { ablage(c).edit().remove("offen").apply(); }
}
