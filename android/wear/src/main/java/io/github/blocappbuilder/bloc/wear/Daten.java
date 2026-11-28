package io.github.blocappbuilder.bloc.wear;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Was die Uhr anzeigt: Programm (Play), Favoriten, BLOCs und Katalog, Timer.
 * Kommt vom Handy (BLOC-App, Pfad /bloc/uhr als JSON). Solange nichts da ist, zeigt die Uhr Beispieldaten.
 * Gebaut wird nur in der App – die Uhr wählt aus und startet.
 */
final class Daten {

    static final class Uebung {
        String id = "", name = "", fig = "", zuletzt = "";
        int saetze = 3, wdh = 10;
        /** Satzzahl in der Leichtwoche (0 = keine) */
        int saetzeLeicht = 0;
        float kg = 0;
        /** Pause in Sekunden und Gewichtsschritt dieser Übung (wie auf dem Handy) */
        int pause = 90;
        float schritt = 2.5f;
        /** mit Gewicht; zeit: wdh sind Sekunden; tipp: auf dem Handy wartet ein Vorschlag */
        boolean mitKg = false, zeit = false, tipp = false;
        String einheit() { return zeit ? "s" : "Wdh."; }
    }

    /** heute als JJJJ-MM-TT */
    static String heuteTag() { return new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.ROOT).format(new java.util.Date()); }

    static final class Schritt {
        String ph = "work", name = "", fig = "", block = "";
        int d = 30, r = 1, n = 1;
        Schritt(String ph, int d, String name, String fig, String block, int r, int n) {
            this.ph = ph; this.d = d; this.name = name; this.fig = fig; this.block = block; this.r = r; this.n = n;
        }
    }

    static final class Workout {
        String id = "", name = "", info = "", art = "timer";   // "timer" oder "saetze"
        final List<Uebung> uebungen = new ArrayList<>();
        /** Tage mit Leichtwoche */
        final List<String> leicht = new ArrayList<>();
        boolean leichtHeute() { return leicht.contains(heuteTag()); }
        int saetze(Uebung u) { return u.saetzeLeicht > 0 && leichtHeute() ? u.saetzeLeicht : u.saetze; }
        final List<Schritt> schritte = new ArrayList<>();
        boolean mitUebungen() { for (Schritt s : schritte) if (!s.name.isEmpty()) return true; return false; }
    }

    static final class Tag { String name = "", info = ""; Workout w; }

    String programmName = "", programmInfo = "";
    private Workout heute;
    /** Tag, für den „heute“ gilt, und was an den nächsten Tagen im Kalender steht (Tag → BLOC) */
    private String heuteFuer = "";
    private final java.util.Map<String, String> termine = new java.util.HashMap<>();
    private final List<Workout> vorrat = new ArrayList<>();

    /** Der BLOC von heute wie auf der Startseite des Handys; null, wenn heute nichts ansteht */
    Workout heute() {
        if (heuteFuer.isEmpty() || heuteFuer.equals(heuteTag())) return heute;
        String id = termine.get(heuteTag());
        if (id != null) for (Workout w : vorrat) if (w.id.equals(id)) return w;
        return null;
    }
    final List<Tag> tage = new ArrayList<>();
    final List<Workout> favoriten = new ArrayList<>(), workoutBlocs = new ArrayList<>(), workoutKatalog = new ArrayList<>(),
            mobBlocs = new ArrayList<>(), mobKatalog = new ArrayList<>(), timer = new ArrayList<>();
    int hfMax = 190;
    boolean vomHandy = false;

    // ---------- vom Handy ----------
    static Daten ausJson(String text) {
        try {
            JSONObject o = new JSONObject(text);
            Daten d = new Daten();
            d.vomHandy = true;
            d.hfMax = o.optInt("hfmax", 190);
            JSONObject p = o.optJSONObject("programm");
            if (p != null) {
                d.programmName = p.optString("name");
                d.programmInfo = p.optString("info");
                if (p.has("heute")) d.heute = workout(p.getJSONObject("heute"));
                d.heuteFuer = p.optString("tag");
                liste(p.optJSONArray("vorrat"), d.vorrat);
                JSONArray te = p.optJSONArray("termine");
                if (te != null) for (int i = 0; i < te.length(); i++) d.termine.put(te.getJSONObject(i).optString("tag"), te.getJSONObject(i).optString("id"));
                JSONArray t = p.optJSONArray("tage");
                if (t != null) for (int i = 0; i < t.length(); i++) {
                    JSONObject x = t.getJSONObject(i);
                    Tag tag = new Tag();
                    tag.name = x.optString("name"); tag.info = x.optString("info");
                    if (x.has("w")) tag.w = workout(x.getJSONObject("w"));
                    d.tage.add(tag);
                }
            }
            liste(o.optJSONArray("favoriten"), d.favoriten);
            JSONObject w = o.optJSONObject("workout");
            if (w != null) { liste(w.optJSONArray("blocs"), d.workoutBlocs); liste(w.optJSONArray("katalog"), d.workoutKatalog); }
            JSONObject m = o.optJSONObject("mobility");
            if (m != null) { liste(m.optJSONArray("blocs"), d.mobBlocs); liste(m.optJSONArray("katalog"), d.mobKatalog); }
            liste(o.optJSONArray("timer"), d.timer);
            JSONObject f = o.optJSONObject("figuren");
            if (f != null) {
                JSONArray namen = f.names();
                if (namen != null) for (int i = 0; i < namen.length(); i++) {
                    String id = namen.getString(i);
                    JSONArray pz = f.getJSONArray(id);
                    Figur.merke(id, pz.optString(0, null), pz.length() > 1 && !pz.isNull(1) ? pz.optString(1, null) : null);
                }
            }
            return d;
        } catch (Exception e) {
            return null;
        }
    }

    private static void liste(JSONArray a, List<Workout> ziel) throws Exception {
        if (a == null) return;
        for (int i = 0; i < a.length(); i++) ziel.add(workout(a.getJSONObject(i)));
    }

    private static Workout workout(JSONObject o) throws Exception {
        Workout w = new Workout();
        w.id = o.optString("id"); w.name = o.optString("name"); w.info = o.optString("info");
        w.art = o.optString("art", "timer");
        JSONArray lt = o.optJSONArray("leicht");
        if (lt != null) for (int i = 0; i < lt.length(); i++) w.leicht.add(lt.optString(i));
        JSONArray u = o.optJSONArray("uebungen");
        if (u != null) for (int i = 0; i < u.length(); i++) {
            JSONObject x = u.getJSONObject(i);
            Uebung ue = new Uebung();
            ue.id = x.optString("id"); ue.name = x.optString("name"); ue.fig = x.optString("fig", ue.id);
            ue.saetze = x.optInt("saetze", 3); ue.wdh = x.optInt("wdh", 10); ue.kg = (float) x.optDouble("kg", 0);
            ue.zuletzt = x.optString("zuletzt");
            ue.pause = Math.max(10, x.optInt("pause", 90)); ue.schritt = (float) Math.max(0.25, x.optDouble("schritt", 2.5));
            ue.mitKg = x.has("mitKg") ? x.optInt("mitKg") == 1 : ue.kg > 0;
            ue.zeit = x.optInt("zeit") == 1; ue.tipp = x.optInt("tipp") == 1; ue.saetzeLeicht = x.optInt("saetzeLeicht", 0);
            w.uebungen.add(ue);
        }
        JSONArray s = o.optJSONArray("schritte");
        if (s != null) for (int i = 0; i < s.length(); i++) {
            JSONObject x = s.getJSONObject(i);
            w.schritte.add(new Schritt(x.optString("ph", "work"), x.optInt("d", 30), x.optString("name"), x.optString("fig"),
                    x.optString("block"), x.optInt("r", 1), x.optInt("n", 1)));
        }
        if (w.art.equals("timer") && (w.schritte.isEmpty() || !w.schritte.get(w.schritte.size() - 1).ph.equals("done")))
            w.schritte.add(new Schritt("done", 0, "", "", "", 1, 1));
        return w;
    }

    // ---------- Beispieldaten (bis das Handy etwas schickt) ----------
    static Workout timerWorkout(String name, String info, int arbeit, int pause, int runden, String block, String[][] ueb) {
        Workout w = new Workout();
        w.name = name; w.info = info; w.art = "timer";
        String n0 = ueb != null ? ueb[0][0] : "", f0 = ueb != null ? ueb[0][1] : "";
        w.schritte.add(new Schritt("prep", 5, n0, f0, block, 1, runden));
        for (int r = 1; r <= runden; r++) {
            String n = ueb != null ? ueb[(r - 1) % ueb.length][0] : "", f = ueb != null ? ueb[(r - 1) % ueb.length][1] : "";
            String nn = ueb != null ? ueb[r % ueb.length][0] : "", nf = ueb != null ? ueb[r % ueb.length][1] : "";
            w.schritte.add(new Schritt("work", arbeit, n, f, block, r, runden));
            if (r < runden) w.schritte.add(new Schritt("rest", pause, nn, nf, block, r, runden));
        }
        w.schritte.add(new Schritt("done", 0, "", "", block, runden, runden));
        return w;
    }

    private static Uebung ue(String name, String fig, int saetze, int wdh, float kg, String zuletzt) {
        Uebung u = new Uebung();
        u.name = name; u.fig = fig; u.id = fig; u.saetze = saetze; u.wdh = wdh; u.kg = kg; u.zuletzt = zuletzt; u.mitKg = kg > 0;
        return u;
    }

    static Workout saetzeWorkout(String name, String info, Uebung... ue) {
        Workout w = new Workout();
        w.name = name; w.info = info; w.art = "saetze";
        for (Uebung u : ue) w.uebungen.add(u);
        return w;
    }

    static Daten beispiel() {
        Daten d = new Daten();
        String[][] hiit = {{"Burpees", "burpees"}, {"Kniebeuge", "air-squats"}, {"Mountain Climbers", "mountain-climbers"}, {"Liegestütze", "push-ups"}};
        Workout beine = saetzeWorkout("Beine schwer", "3 Übungen · Sätze",
                ue("Kniebeuge", "barbell-squat", 4, 10, 60, "10 × 57,5 kg"),
                ue("Bankdrücken", "bench-press", 3, 8, 50, "8 × 47,5 kg"),
                ue("Liegestütze", "push-ups", 3, 12, 0, "12 Wdh."));
        Workout ganz = timerWorkout("Ganzkörper HIIT", "4 Übungen · 8 Runden", 40, 20, 8, "Ganzkörper", hiit);
        Workout mob = timerWorkout("Morgen-Mobility", "8 min · 4 Übungen", 45, 15, 8, "Mobility",
                new String[][]{{"Kniebeuge", "air-squats"}, {"Liegestütze", "push-ups"}});
        Workout tabata = timerWorkout("Tabata", "8 × 20 / 10", 20, 10, 8, "Tabata", null);
        Workout t3015 = timerWorkout("8 × 30 / 15", "Timer", 30, 15, 8, "Block A", null);
        Workout emom = timerWorkout("EMOM 12 min", "jede Minute neu", 60, 0, 12, "EMOM", null);
        emom.schritte.removeIf(s -> s.ph.equals("rest"));

        d.programmName = "Kraft-Aufbau · Woche 2";
        d.programmInfo = "Tag 3 von 4 · ca. 45 min";
        d.heute = beine;
        Tag t1 = new Tag(); t1.name = "Tag 1 · Push"; t1.info = "erledigt ✓"; t1.w = beine;
        Tag t2 = new Tag(); t2.name = "Tag 2 · Pull"; t2.info = "erledigt ✓"; t2.w = beine;
        Tag t4 = new Tag(); t4.name = "Tag 4 · Ganzkörper"; t4.info = "Intervall · 24 min"; t4.w = ganz;
        d.tage.add(t1); d.tage.add(t2); d.tage.add(t4);
        d.favoriten.add(beine); d.favoriten.add(mob); d.favoriten.add(tabata);
        d.workoutBlocs.add(beine); d.workoutBlocs.add(ganz);
        d.workoutKatalog.add(timerWorkout("Bodyweight Basics", "20 min · ohne Geräte", 40, 20, 10, "Basics", hiit));
        d.mobBlocs.add(mob);
        d.mobKatalog.add(timerWorkout("Dehnen nach dem Lauf", "8 min", 45, 15, 8, "Dehnen", new String[][]{{"Kniebeuge", "air-squats"}}));
        d.timer.add(t3015); d.timer.add(tabata); d.timer.add(emom);
        return d;
    }
}
