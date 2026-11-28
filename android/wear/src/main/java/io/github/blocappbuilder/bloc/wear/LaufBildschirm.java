package io.github.blocappbuilder.bloc.wear;

import android.graphics.Canvas;
import android.os.SystemClock;

/**
 * Lauf (Entwurf C2): Glas-Linse mit wählbarer Mitte (Pace, Puls, Distanz, Zeit), rechts Puls, unten Zeit,
 * weisser Puls-Bogen aussen. Knöpfe: X = abbrechen (zweimal tippen), Pause, Stopp = gedrückt halten.
 * GPS kommt später vom Handy (Variante A); bis dahin zeigt die Uhr Zeit und Puls.
 */
class LaufBildschirm extends Bildschirm {
    private static final String[] REIHE = {"pace", "hr", "km", "zeit"};
    private int mitte = 0;
    private long laufMs = 0, letzt = SystemClock.uptimeMillis();
    private boolean pause = false;
    private long abbrechenSeit = 0, halteStart = 0, wechselZeit = 0;
    private boolean fertig = false;
    /** Werte vom Handy (Variante A); null = noch keine */
    String pace = null, km = null;

    LaufBildschirm(UhrAnsicht uhr) { super(uhr); uhr.activity.vibriere(60); }

    private String wert(String k) {
        switch (k) {
            case "pace": return pace != null ? pace : "–";
            case "hr": return uhr.puls > 0 ? String.valueOf(uhr.puls) : "–";
            case "km": return km != null ? km : "–";
            default: return hmmss(laufMs / 1000);
        }
    }
    private static String einheit(String k) { return k.equals("pace") ? "/km" : k.equals("hr") ? "bpm" : k.equals("km") ? "km" : ""; }
    private String label(String k) {
        switch (k) {
            case "pace": return "PACE";
            case "hr": return uhr.puls > 0 ? "PULS · Z" + zone(uhr.puls) : "PULS";
            case "km": return "KM";
            default: return "ZEIT";
        }
    }

    @Override void zeichne(Canvas c, long jetzt) {
        if (!pause && !fertig) laufMs += jetzt - letzt;
        letzt = jetzt;
        z.alpha = 1f;
        // Puls-Bogen
        float anteil = uhr.puls > 0 ? Math.max(0, Math.min(1, (uhr.puls / (float) uhr.daten.hfMax - 0.5f) / 0.5f)) : 0;
        z.aussenBogen(c, anteil, true, 1f);
        z.marke(c, 25);

        String m = REIHE[mitte];
        String rechts = m.equals("hr") ? "pace" : "hr", unten = m.equals("zeit") ? "pace" : "zeit";
        String links = "km";
        for (String k : REIHE) if (!k.equals(m) && !k.equals(rechts) && !k.equals(unten)) links = k;

        float blink = pause ? 0.35f + 0.65f * (float) (0.5 + 0.5 * Math.cos(jetzt / 1600.0 * 2 * Math.PI)) : 1f;
        float ein = Math.min(1, (jetzt - wechselZeit) / 300f);

        // Linse
        z.glasKreis(c, 96, 78, 40, 0x52FFFFFF);
        c.save();
        float sk = 0.8f + 0.2f * ein;
        c.scale(sk, sk, 96, 78);
        z.alpha = ein;
        z.text(c, label(m), 96, 64, 5.4f, z.fett, 0xA6FFFFFF, 0.22f, android.graphics.Paint.Align.CENTER);
        z.alpha = ein * blink;
        String w = wert(m);
        z.mitte(c, w, 96, 88, w.length() > 5 ? 19 : 27, z.fett, Zeichner.WEISS);
        z.alpha = ein;
        z.mitte(c, einheit(m), 96, 98, 6.5f, z.normal, 0xB3FFFFFF);
        c.restore();

        // Seiten
        seite(c, links, 35, blink);
        seite(c, rechts, 157, blink);
        // unten
        z.alpha = 1f;
        String lu = label(unten), wu = wert(unten);
        float b1 = z.breite(lu, 5.4f, z.fett, 0.15f), b2 = z.breite(wu, 9, z.fett, 0);
        float x0 = 96 - (b1 + 3 + b2) / 2;
        z.text(c, lu, x0, 132, 5.4f, z.fett, 0xB3FFFFFF, 0.15f, android.graphics.Paint.Align.LEFT);
        z.alpha = blink;
        z.text(c, wu, x0 + b1 + 3, 132, 9, z.fett, Zeichner.WEISS, 0, android.graphics.Paint.Align.LEFT);
        z.alpha = 1f;

        // Knöpfe
        z.knopfKlein(c, Zeichner.KL_X, druck(1), Zeichner.KREUZ);
        z.knopfGross(c, druck(2), pause ? Zeichner.ORANGE : 0xF5FFFFFF, pause ? Zeichner.WEISS : Zeichner.TINTE, pause ? Zeichner.PLAY : Zeichner.PAUSE);
        z.knopfKlein(c, Zeichner.KR_X, druck(3), Zeichner.STOPP);
        if (halteStart > 0) {
            float a = (jetzt - halteStart) / 1200f;
            z.halteRing(c, a);
            if (a >= 1 && !fertig) beenden();
        }
    }

    private void seite(Canvas c, String k, float x, float blink) {
        z.alpha = blink;
        z.mitte(c, wert(k), x, 82, 12, z.fett, Zeichner.WEISS);
        z.alpha = 1f;
        z.text(c, label(k), x, 91, 5.4f, z.fett, 0xA6FFFFFF, 0.18f, android.graphics.Paint.Align.CENTER);
    }

    private void beenden() {
        fertig = true;
        halteStart = 0;
        uhr.activity.vibriere(250);
        uhr.hinweis("Lauf beendet ✓ " + hmmss(laufMs / 1000));
        uhr.postDelayed(uhr::menue, 1800);
    }

    @Override void runter(float x, float y) {
        super.runter(x, y);
        if (gedrueckt == 3 && !fertig) { halteStart = SystemClock.uptimeMillis(); uhr.activity.vibriere(20); }
    }

    @Override void hoch() {
        if (halteStart > 0 && !fertig) {
            if (SystemClock.uptimeMillis() - halteStart < 400) uhr.hinweis("Zum Beenden gedrückt halten");
            halteStart = 0;
        }
        super.hoch();
    }

    @Override void tippen(float x, float y) {
        if (Math.hypot(x - 96, y - 78) < 40) { mitte = (mitte + 1) % 4; wechselZeit = SystemClock.uptimeMillis(); return; }
        super.tippen(x, y);
    }

    @Override void knopf(int k) {
        if (fertig) return;
        if (k == 1) {
            long j = SystemClock.uptimeMillis();
            if (j - abbrechenSeit < 2500) { uhr.hinweis("Lauf abgebrochen · nicht gespeichert"); fertig = true; uhr.postDelayed(uhr::menue, 1400); }
            else { abbrechenSeit = j; uhr.hinweis("Nochmal tippen = abbrechen"); }
        } else if (k == 2) {
            pause = !pause;
            uhr.activity.vibriere(40);
            uhr.hinweis(pause ? "Pausiert" : "Weiter geht’s");
        }
    }

    @Override boolean zurueck() {
        long j = SystemClock.uptimeMillis();
        if (j - abbrechenSeit < 2500) return false;
        abbrechenSeit = j;
        uhr.hinweis("Nochmal wischen = abbrechen");
        return true;
    }
}
