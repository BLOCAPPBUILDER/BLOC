package io.github.blocappbuilder.bloc.wear;

import android.graphics.Canvas;
import android.graphics.Path;
import android.graphics.RectF;
import android.os.SystemClock;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/**
 * Startseite: Liste wie bei Wear OS (Krone oder Wischen), Einträge werden zum Rand hin kleiner.
 * Aufbau wie die App: Play, Favoriten, Workout, Mobility & Stretch, Timer, Run.
 */
class MenueBildschirm extends Bildschirm {

    private static final class Eintrag {
        String titel = "", unter = "", typ = "";
        Zeichner.Icon icon;
        boolean haupt, info, zurueck;
        Runnable aktion;
        float h() { return info ? 44 : zurueck ? 24 : 38; }
    }

    private final List<String> stapel = new ArrayList<>();
    private String seite = "start", kopf = "";
    private final List<Eintrag> liste = new ArrayList<>();
    private final List<Float> mitten = new ArrayList<>();
    private float pos = 0, ziel = 0;
    private long kroneZeit = 0;
    private boolean zieht = false;
    private final SimpleDateFormat uhrzeit = new SimpleDateFormat("H:mm", Locale.GERMANY);

    MenueBildschirm(UhrAnsicht uhr) { super(uhr); oeffne("start", false); }

    void neuAufbauen() { oeffne(seite, false); }

    private void oeffne(String id, boolean merken) {
        if (merken) stapel.add(seite);
        seite = id;
        liste.clear();
        Daten d = uhr.daten;
        switch (id) {
            case "start":
                kopf = "";
                add("Play", d.heute != null ? "Heute: " + d.heute.name : "Kein Programm aktiv", PLAY, true, () -> oeffne("play", true));
                add("Favoriten", d.favoriten.size() + " gespeichert", STERN, false, () -> oeffne("fav", true));
                add("Workout", "BLOCs & Katalog", HANTEL, false, () -> oeffne("workout", true));
                add("Mobility & Stretch", "BLOCs & Katalog", MOBIL, false, () -> oeffne("mob", true));
                add("Timer", "Gespeicherte Timer", UHR, false, () -> oeffne("timer", true));
                add("Run", "GPS übers Handy", RUN, false, () -> uhr.zeige(new LaufBildschirm(uhr)));
                break;
            case "play":
                kopf = "PLAY";
                Eintrag i = add(d.programmName.isEmpty() ? "Kein Programm" : d.programmName, d.programmInfo, null, false, null);
                i.info = true;
                if (d.heute != null) add("Starten", d.heute.name + " · " + d.heute.info, PLAY, true, () -> starte(d.heute));
                if (!d.tage.isEmpty()) add("Anderen Tag wählen", d.tage.size() + " weitere", HANTEL, false, () -> oeffne("tage", true));
                break;
            case "tage":
                kopf = "PROGRAMM";
                for (Daten.Tag t : d.tage) { Eintrag e = add(t.name, t.info, HANTEL, false, () -> starte(t.w)); e.typ = typ(t.w); }
                break;
            case "fav": kopf = "FAVORITEN"; workouts(d.favoriten, STERN); break;
            case "workout":
                kopf = "WORKOUT";
                add("Meine BLOCs", d.workoutBlocs.size() + " BLOCs", HANTEL, false, () -> oeffne("wblocs", true));
                add("Katalog", "Fertige Workouts", KATALOG, false, () -> oeffne("wkat", true));
                break;
            case "wblocs": kopf = "WORKOUT · MEINE BLOCS"; workouts(d.workoutBlocs, HANTEL); break;
            case "wkat": kopf = "WORKOUT · KATALOG"; workouts(d.workoutKatalog, KATALOG); break;
            case "mob":
                kopf = "MOBILITY & STRETCH";
                add("Meine BLOCs", d.mobBlocs.size() + " BLOCs", MOBIL, false, () -> oeffne("mblocs", true));
                add("Katalog", "Fertige Routinen", KATALOG, false, () -> oeffne("mkat", true));
                break;
            case "mblocs": kopf = "MOBILITY · MEINE BLOCS"; workouts(d.mobBlocs, MOBIL); break;
            case "mkat": kopf = "MOBILITY · KATALOG"; workouts(d.mobKatalog, KATALOG); break;
            case "timer": kopf = "TIMER"; workouts(d.timer, UHR); break;
        }
        if (!id.equals("start")) {
            Eintrag zu = new Eintrag();
            zu.titel = "‹ Zurück"; zu.zurueck = true; zu.aktion = this::zurueckIntern;
            liste.add(0, zu);
        }
        mitten.clear();
        float y = 0;
        for (Eintrag e : liste) { mitten.add(y + e.h() / 2); y += e.h() + 5; }
        int erst = id.equals("start") ? 0 : Math.min(1, liste.size() - 1);
        pos = ziel = mitten.isEmpty() ? 0 : mitten.get(erst);
    }

    private void workouts(List<Daten.Workout> l, Zeichner.Icon icon) {
        if (l.isEmpty()) { Eintrag e = add("Noch nichts da", "In der BLOC-App anlegen", null, false, null); e.info = true; }
        for (Daten.Workout w : l) { Eintrag e = add(w.name, w.info, icon, false, () -> starte(w)); e.typ = typ(w); }
    }

    private static String typ(Daten.Workout w) { return w == null ? "" : w.art.equals("saetze") ? "SÄTZE" : "TIMER"; }

    private void starte(Daten.Workout w) {
        if (w == null) return;
        uhr.zeige(w.art.equals("saetze") ? new SatzBildschirm(uhr, w) : new TimerBildschirm(uhr, w));
    }

    private Eintrag add(String t, String u, Zeichner.Icon icon, boolean haupt, Runnable a) {
        Eintrag e = new Eintrag();
        e.titel = t; e.unter = u; e.icon = icon; e.haupt = haupt; e.aktion = a;
        liste.add(e);
        return e;
    }

    private boolean zurueckIntern() {
        if (stapel.isEmpty()) return false;
        oeffne(stapel.remove(stapel.size() - 1), false);
        return true;
    }

    @Override boolean zurueck() { return zurueckIntern(); }

    // ---------- Bewegung ----------
    private float grenze(float v) {
        if (mitten.isEmpty()) return 0;
        return Math.max(mitten.get(0), Math.min(mitten.get(mitten.size() - 1), v));
    }

    private void einrasten() {
        float best = pos, d = Float.MAX_VALUE;
        for (float m : mitten) if (Math.abs(m - pos) < d) { d = Math.abs(m - pos); best = m; }
        ziel = best;
    }

    @Override void ziehen(float dy, boolean fertig) {
        zieht = !fertig;
        pos = grenze(pos - dy);
        ziel = pos;
        if (fertig) einrasten();
    }

    @Override void krone(float d) {
        pos = grenze(pos + d * 22);
        ziel = pos;
        kroneZeit = SystemClock.uptimeMillis();
    }

    @Override void tippen(float x, float y) {
        for (int i = 0; i < liste.size(); i++) {
            Eintrag e = liste.get(i);
            float cy = 96 + mitten.get(i) - pos;
            float b = e.zurueck ? 70 : 136;
            if (Math.abs(y - cy) < e.h() / 2 && Math.abs(x - 96) < b / 2) {
                if (Math.abs(cy - 96) > 30) { ziel = mitten.get(i); return; }   // erst zur Mitte holen
                if (e.aktion != null) e.aktion.run();
                return;
            }
        }
    }

    // ---------- Zeichnen ----------
    @Override void zeichne(Canvas c, long jetzt) {
        if (!zieht && kroneZeit > 0 && jetzt - kroneZeit > 250) { einrasten(); kroneZeit = 0; }
        if (!zieht && kroneZeit == 0) pos += (ziel - pos) * 0.25f;

        for (int i = 0; i < liste.size(); i++) {
            Eintrag e = liste.get(i);
            float cy = 96 + mitten.get(i) - pos;
            if (cy < -30 || cy > 222) continue;
            float d = Math.abs(cy - 96) / 192f;
            float sk = Math.max(0.72f, 1 - d * 0.55f);
            float al = Math.max(0f, Math.min(1f, 1 - d * 1.5f));
            if (cy < 46) al *= Math.max(0, (cy - 22) / 24f);      // oben unter dem Kopf ausblenden
            if (cy > 150) al *= Math.max(0, (182 - cy) / 32f);
            if (al <= 0.02f) continue;
            c.save();
            c.scale(sk, sk, 96, cy);
            z.alpha = al;
            eintrag(c, e, cy);
            c.restore();
        }
        z.alpha = 1f;
        z.marke(c, 21);
        if (kopf.isEmpty()) z.mitte(c, uhrzeit.format(new Date()), 96, 30, 7.5f, z.halbfett, 0xCCFFFFFF);
        else z.text(c, kopf, 96, 30, 6.2f, z.fett, 0xE6FFFFFF, 0.14f, android.graphics.Paint.Align.CENTER);
        if (!uhr.daten.vomHandy) z.text(c, "BEISPIELDATEN · HANDY NICHT VERBUNDEN", 96, 180, 4.6f, z.halbfett, 0x80FFFFFF, 0.1f, android.graphics.Paint.Align.CENTER);
    }

    private void eintrag(Canvas c, Eintrag e, float cy) {
        float b = e.zurueck ? 70 : 136, h = e.h();
        RectF r = new RectF(96 - b / 2, cy - h / 2, 96 + b / 2, cy + h / 2);
        z.glasPille(c, r, h / 2, e.info);
        if (e.zurueck) { z.mitte(c, e.titel, 96, cy + 2.6f, 7.5f, z.halbfett, Zeichner.WEISS); return; }
        float tx = r.left + 10;
        if (e.icon != null) {
            float ix = r.left + 6 + 13;
            z.punkt(c, ix, cy, 13, e.haupt ? Zeichner.ORANGE : 0x2EFFFFFF, false);
            e.icon.zeichne(z, c, ix, cy, 13, Zeichner.WEISS);
            tx = ix + 13 + 7;
        }
        float maxB = r.right - 10 - tx - (e.typ.isEmpty() ? 0 : 22);
        z.text(c, kuerzen(e.titel, 10, z.fett, maxB), tx, cy - 0.5f, e.info ? 9 : 10, z.fett, Zeichner.WEISS, 0, android.graphics.Paint.Align.LEFT);
        z.text(c, kuerzen(e.unter, 6.2f, z.normal, maxB), tx, cy + 8, 6.2f, z.normal, 0xB8FFFFFF, 0, android.graphics.Paint.Align.LEFT);
        if (!e.typ.isEmpty()) z.text(c, e.typ, r.right - 10, cy + 2, 5.4f, z.fett, 0x99FFFFFF, 0.12f, android.graphics.Paint.Align.RIGHT);
    }

    private String kuerzen(String t, float g, android.graphics.Typeface f, float max) {
        if (t == null) return "";
        if (z.breite(t, g, f, 0) <= max) return t;
        String s = t;
        while (s.length() > 1 && z.breite(s + "…", g, f, 0) > max) s = s.substring(0, s.length() - 1);
        return s + "…";
    }

    // ---------- Icons ----------
    private static void f(Zeichner z, Canvas c, Path p, float x, float y, float g, int col, boolean strich, float dicke) {
        c.save();
        c.translate(x - g / 2, y - g / 2);
        c.scale(g / 24f, g / 24f);
        z.p.setShader(null);
        z.p.setStyle(strich ? android.graphics.Paint.Style.STROKE : android.graphics.Paint.Style.FILL);
        z.p.setStrokeWidth(dicke);
        z.p.setStrokeCap(android.graphics.Paint.Cap.ROUND);
        z.p.setStrokeJoin(android.graphics.Paint.Join.ROUND);
        z.p.setColor(Zeichner.mitAlpha(col, z.alpha));
        c.drawPath(p, z.p);
        c.restore();
        z.p.setStyle(android.graphics.Paint.Style.FILL);
    }
    static final Zeichner.Icon PLAY = (z, c, x, y, g, col) -> { Path p = new Path(); p.moveTo(8, 4.5f); p.lineTo(8, 19.5f); p.lineTo(20.5f, 12); p.close(); f(z, c, p, x, y, g, col, false, 0); };
    static final Zeichner.Icon STERN = (z, c, x, y, g, col) -> {
        Path p = new Path();
        for (int i = 0; i < 10; i++) {
            double a = Math.toRadians(-90 + i * 36); float r = i % 2 == 0 ? 9.5f : 4.2f;
            float px = 12 + r * (float) Math.cos(a), py = 12.5f + r * (float) Math.sin(a);
            if (i == 0) p.moveTo(px, py); else p.lineTo(px, py);
        }
        p.close(); f(z, c, p, x, y, g, col, false, 0);
    };
    static final Zeichner.Icon HANTEL = (z, c, x, y, g, col) -> {
        Path p = new Path();
        p.addRoundRect(new RectF(1.5f, 8, 5, 16), 1, 1, Path.Direction.CW);
        p.addRoundRect(new RectF(5.5f, 5.5f, 9, 18.5f), 1.2f, 1.2f, Path.Direction.CW);
        p.addRoundRect(new RectF(15, 5.5f, 18.5f, 18.5f), 1.2f, 1.2f, Path.Direction.CW);
        p.addRoundRect(new RectF(19, 8, 22.5f, 16), 1, 1, Path.Direction.CW);
        p.addRect(new RectF(9, 10.8f, 15, 13.2f), Path.Direction.CW);
        f(z, c, p, x, y, g, col, false, 0);
    };
    static final Zeichner.Icon MOBIL = (z, c, x, y, g, col) -> {
        Path p = new Path();
        p.moveTo(12, 8); p.lineTo(12, 14); p.moveTo(5, 9.5f); p.lineTo(12, 11); p.lineTo(19, 9.5f);
        p.moveTo(12, 14); p.lineTo(8, 20.5f); p.moveTo(12, 14); p.lineTo(16, 20.5f);
        f(z, c, p, x, y, g, col, true, 2.6f);
        Path k = new Path(); k.addCircle(12, 4.5f, 2.2f, Path.Direction.CW); f(z, c, k, x, y, g, col, false, 0);
    };
    static final Zeichner.Icon UHR = (z, c, x, y, g, col) -> {
        Path p = new Path(); p.addCircle(12, 13.5f, 7.5f, Path.Direction.CW); p.moveTo(12, 13.5f); p.lineTo(12, 9.5f); p.moveTo(10, 2.5f); p.lineTo(14, 2.5f);
        f(z, c, p, x, y, g, col, true, 2.6f);
    };
    static final Zeichner.Icon RUN = (z, c, x, y, g, col) -> {
        Path p = new Path(); p.moveTo(5, 19); p.cubicTo(8, 19, 8, 14, 12, 14); p.cubicTo(16, 14, 15, 8, 19, 8);
        f(z, c, p, x, y, g, col, true, 2.6f);
        Path k = new Path(); k.addCircle(5, 19, 2.4f, Path.Direction.CW); k.addCircle(19, 8, 2.4f, Path.Direction.CW); f(z, c, k, x, y, g, col, false, 0);
    };
    static final Zeichner.Icon KATALOG = (z, c, x, y, g, col) -> {
        Path p = new Path();
        p.addRoundRect(new RectF(3.5f, 3.5f, 10.5f, 10.5f), 1.5f, 1.5f, Path.Direction.CW);
        p.addRoundRect(new RectF(13.5f, 3.5f, 20.5f, 10.5f), 1.5f, 1.5f, Path.Direction.CW);
        p.addRoundRect(new RectF(3.5f, 13.5f, 10.5f, 20.5f), 1.5f, 1.5f, Path.Direction.CW);
        p.addRoundRect(new RectF(13.5f, 13.5f, 20.5f, 20.5f), 1.5f, 1.5f, Path.Direction.CW);
        f(z, c, p, x, y, g, col, true, 2.4f);
    };
}
