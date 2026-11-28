package io.github.blocappbuilder.bloc.wear;

import android.graphics.Canvas;
import android.os.SystemClock;

import java.util.ArrayList;
import java.util.List;

/**
 * Timer-Workout und Intervall mit Übungen (Entwurf im C2-Stil).
 * Aussen der weisse Bogen = Restzeit der Phase, in der Linse Phase und Countdown (mit Übungen: Strichfigur),
 * links die Runde, rechts der Puls, unten was als Nächstes kommt. Knöpfe: überspringen, Pause, Phase neu.
 */
class TimerBildschirm extends Bildschirm {
    private final Daten.Workout w;
    private int idx = 0;
    private float rest;                 // Restsekunden der Phase
    private boolean pause = false;
    private long letzt = SystemClock.uptimeMillis(), wechselZeit = SystemClock.uptimeMillis(), endeSeit = 0;
    private final boolean mitUebungen;
    private final List<String> uebungen = new ArrayList<>();
    private int letzterPiep = -1;

    TimerBildschirm(UhrAnsicht uhr, Daten.Workout w) {
        super(uhr);
        this.w = w;
        mitUebungen = w.mitUebungen();
        for (Daten.Schritt s : w.schritte) if (!s.name.isEmpty() && !uebungen.contains(s.name)) uebungen.add(s.name);
        rest = w.schritte.isEmpty() ? 0 : w.schritte.get(0).d;
        uhr.activity.vibriere(60);
    }

    private Daten.Schritt st() { return w.schritte.get(Math.min(idx, w.schritte.size() - 1)); }

    private void weiter() {
        if (idx < w.schritte.size() - 1) idx++;
        rest = st().d;
        wechselZeit = SystemClock.uptimeMillis();
        letzterPiep = -1;
        if (st().ph.equals("done")) { uhr.activity.vibriere(400); endeSeit = SystemClock.uptimeMillis(); }
        else uhr.activity.vibriere(st().ph.equals("work") ? 180 : 90);
    }

    private static String label(String ph) {
        switch (ph) { case "work": return "LOS!"; case "rest": return "PAUSE"; case "prep": return "LOS GEHT'S"; default: return "FERTIG"; }
    }

    @Override void zeichne(Canvas c, long jetzt) {
        Daten.Schritt s = st();
        if (!pause && !s.ph.equals("done")) {
            rest -= (jetzt - letzt) / 1000f;
            int ganz = (int) Math.ceil(rest);
            if (ganz <= 3 && ganz >= 1 && ganz != letzterPiep) { letzterPiep = ganz; uhr.activity.vibriere(25); }
            if (rest <= 0) { weiter(); s = st(); }
        }
        letzt = jetzt;
        boolean done = s.ph.equals("done");
        float anteil = done || s.d <= 0 ? 0 : rest / s.d;
        z.aussenBogen(c, anteil, false, s.ph.equals("work") ? 1f : 0.55f);
        z.marke(c, 25);

        Figur fig = mitUebungen && !done ? Figur.hole(s.fig) : null;
        boolean nameOben = mitUebungen && !done && !s.name.isEmpty();
        float ly = nameOben ? 82 : 78;
        if (nameOben) z.mitte(c, s.name, 96, 37, 7.5f, z.normal, 0xE6FFFFFF);

        float blink = pause ? 0.35f + 0.65f * (float) (0.5 + 0.5 * Math.cos(jetzt / 1600.0 * 2 * Math.PI)) : 1f;
        float ein = Math.min(1, (jetzt - wechselZeit) / 350f);
        z.glasKreis(c, 96, ly, 40, 0x52FFFFFF);
        c.save();
        float sk = 0.8f + 0.2f * ein;
        c.scale(sk, sk, 96, ly);
        z.alpha = ein;
        String zeit = done ? "" : mmss((int) Math.ceil(rest));
        if (done) Zeichner.HAKEN.zeichne(z, c, 96, ly - 2, 26, Zeichner.WEISS);
        if (fig != null && s.ph.equals("work")) {
            fig.zeichne(c, z.p, 96, ly - 15, 34, ein, jetzt, !pause);
            z.alpha = ein * blink;
            z.mitte(c, zeit, 96, ly + 20, 21, z.fett, Zeichner.WEISS);
        } else if (fig != null) {
            fig.zeichne(c, z.p, 96, ly - 17, 30, ein * 0.45f, jetzt, false);
            z.text(c, label(s.ph), 96, ly + 3, 5.4f, z.fett, 0xA6FFFFFF, 0.22f, android.graphics.Paint.Align.CENTER);
            z.alpha = ein * blink;
            z.mitte(c, zeit, 96, ly + 21, 21, z.fett, Zeichner.WEISS);
        } else {
            z.text(c, label(s.ph), 96, ly - 13, 5.4f, z.fett, 0xA6FFFFFF, 0.22f, android.graphics.Paint.Align.CENTER);
            z.alpha = ein * blink;
            z.mitte(c, zeit, 96, ly + 10, 27, z.fett, Zeichner.WEISS);
            z.alpha = ein;
            String unter = done ? "gut gemacht" : s.ph.equals("rest") ? "kurz erholen" : s.block;
            z.mitte(c, unter, 96, ly + 20, 6.2f, s.ph.equals("work") ? z.fett : z.normal, s.ph.equals("work") ? 0xE6FFFFFF : 0xB3FFFFFF);
        }
        c.restore();
        z.alpha = 1f;

        // Seiten
        z.mitte(c, s.r + "/" + s.n, 35, 82, 12, z.fett, Zeichner.WEISS);
        z.text(c, "RUNDE", 35, 91, 5.4f, z.fett, 0xA6FFFFFF, 0.18f, android.graphics.Paint.Align.CENTER);
        z.mitte(c, uhr.puls > 0 ? String.valueOf(uhr.puls) : "–", 157, 82, 12, z.fett, Zeichner.WEISS);
        z.text(c, uhr.puls > 0 ? "PULS · Z" + zone(uhr.puls) : "PULS", 157, 91, 5.4f, z.fett, 0xA6FFFFFF, 0.18f, android.graphics.Paint.Align.CENTER);

        // Übungs-Kreise rechts unten entlang der Kontur
        if (mitUebungen && !done) uebungsPunkte(c, uebungen.size(), uebungen.indexOf(s.name));

        // unten: als Nächstes
        float uy = nameOben ? 131.5f : 130;
        if (done) {
            z.text(c, "WORKOUT", 96, uy, 5.4f, z.fett, 0x99FFFFFF, 0.16f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, "geschafft ✓", 96, uy + 8, 6.8f, z.fett, Zeichner.WEISS);
        } else if (idx + 1 < w.schritte.size()) {
            Daten.Schritt n = w.schritte.get(idx + 1);
            String was = n.ph.equals("done") ? "Fertig" : n.ph.equals("rest") ? "Pause" : (mitUebungen && !n.name.isEmpty() ? n.name : "Los!");
            z.text(c, "ALS NÄCHSTES", 96, uy, 5.4f, z.fett, 0x99FFFFFF, 0.16f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, n.d > 0 ? was + " · " + mmss(n.d) : was, 96, uy + 8, 6.8f, z.fett, Zeichner.WEISS);
        }

        // Knöpfe
        if (done) {
            z.knopfGross(c, druck(2), 0xF5FFFFFF, Zeichner.TINTE, Zeichner.HAKEN);
        } else {
            z.knopfKlein(c, Zeichner.KL_X, druck(1), Zeichner.WEITER);
            z.knopfGross(c, druck(2), pause ? Zeichner.ORANGE : 0xF5FFFFFF, pause ? Zeichner.WEISS : Zeichner.TINTE, pause ? Zeichner.PLAY : Zeichner.PAUSE);
            z.knopfKlein(c, Zeichner.KR_X, druck(3), Zeichner.NEU);
        }
    }

    /** Kreise am Rand: je Reihe bis 6, weitere Reihen nach innen (bis 18 Übungen) */
    void uebungsPunkte(Canvas c, int n, int an) {
        for (int i = 0; i < Math.min(n, 18); i++) {
            int reihe = i / 6, k = i % 6;
            float r = 80.5f - reihe * 6.5f, a = 102 + k * 6.4f;
            int f = i == an ? Zeichner.ORANGE : i < an ? 0xD9FFFFFF : 0x47FFFFFF;
            z.punkt(c, Zeichner.px(r, a), Zeichner.py(r, a), i == an ? 2.3f : 1.6f, f, false);
        }
    }

    @Override void knopf(int k) {
        if (st().ph.equals("done")) { if (k == 2) uhr.menue(); return; }
        if (k == 1) { weiter(); uhr.hinweis("Übersprungen"); }
        else if (k == 2) { pause = !pause; uhr.activity.vibriere(40); uhr.hinweis(pause ? "Pausiert" : "Weiter geht’s"); }
        else if (k == 3) { rest = st().d; wechselZeit = SystemClock.uptimeMillis(); uhr.hinweis("Phase neu"); }
    }

    private long zurueckSeit = 0;
    @Override boolean zurueck() {
        if (st().ph.equals("done")) return false;
        long j = SystemClock.uptimeMillis();
        if (j - zurueckSeit < 2500) return false;
        zurueckSeit = j;
        uhr.hinweis("Nochmal wischen = beenden");
        return true;
    }
}
