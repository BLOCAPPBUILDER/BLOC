package io.github.blocappbuilder.bloc.wear;

import android.graphics.Canvas;
import android.os.SystemClock;

import org.json.JSONObject;

/**
 * Lauf (Entwurf C2, Variante A): Das Handy misst GPS, Strecke und Pace; die Uhr zeigt alles live und steuert.
 * Glas-Linse mit wählbarer Mitte (Pace, Puls, Distanz, Zeit), rechts Puls, unten Zeit, weisser Puls-Bogen aussen.
 * Knöpfe: X = abbrechen und Stopp = speichern (beide gedrückt halten), Pause/Weiter.
 * Ist das Handy nicht erreichbar, misst die Uhr allein Zeit und Puls.
 */
class LaufBildschirm extends Bildschirm {
    private static final String[] REIHE = {"pace", "hr", "km", "zeit"};
    private int mitte = 0;
    private boolean pause = false, fertig = false;
    private long abbrechenSeit = 0, halteStart = 0, halteX = 0, wechselZeit = 0;

    // Uhr allein
    private long laufMs = 0, letzt = SystemClock.uptimeMillis();
    // Handy
    private boolean handy = false, warte = false;
    private long handyZeit = 0, handyMs = 0, handyMsZeit = 0, warteSeit = 0, vorBis = 0;
    private String pace = null, km = null, einheit = "/km";

    /** vonHandy = der Lauf wurde auf dem Handy gestartet; sonst bittet die Uhr das Handy, ihn zu starten */
    LaufBildschirm(UhrAnsicht uhr, boolean vonHandy) {
        super(uhr);
        uhr.activity.vibriere(60);
        if (!vonHandy) {
            warte = true;
            warteSeit = SystemClock.uptimeMillis();
            uhr.activity.anHandy("/bloc/lauf/befehl", "start");
            uhr.hinweis("Starte Lauf auf dem Handy …");
        }
    }

    /** Live-Stand vom Handy */
    void live(JSONObject o) {
        long j = SystemClock.uptimeMillis();
        handyZeit = j;
        if (o.optInt("lauf", 0) == 0) {
            if ((handy || warte || vorBis > 0) && !fertig) {
                fertig = true;
                uhr.activity.vibriere(250);
                uhr.hinweis(o.optBoolean("gespeichert") ? "Lauf gespeichert ✓" : "Lauf beendet");
                uhr.postDelayed(uhr::menue, 1800);
            }
            return;
        }
        warte = false;
        int vor = o.optInt("vor", 0);
        if (vor > 0) { vorBis = j + vor * 1000L; return; }
        if (vorBis > 0 || !handy) { vorBis = 0; uhr.activity.vibriere(300); }
        handy = true;
        boolean p = o.optBoolean("pause");
        if (p != pause) { pause = p; uhr.hinweis(pause ? (o.optBoolean("auto") ? "Auto-Pause" : "Pausiert") : "Weiter geht’s"); }
        handyMs = o.optLong("ms", 0);
        handyMsZeit = j;
        km = o.optString("km", null);
        pace = o.optString("pace", null);
        einheit = o.optString("einheit", "/km");
    }

    private boolean getrennt(long j) { return handy && j - handyZeit > 8000; }

    private long zeitMs(long j) {
        if (handy) return handyMs + (pause || getrennt(j) ? 0 : j - handyMsZeit);
        return laufMs;
    }

    private String wert(String k, long j) {
        switch (k) {
            case "pace": return pace != null && !getrennt(j) ? pace : "–";
            case "hr": return uhr.puls > 0 ? String.valueOf(uhr.puls) : "–";
            case "km": return km != null ? km : "–";
            default: return hmmss(zeitMs(j) / 1000);
        }
    }
    private String einheitVon(String k) { return k.equals("pace") ? einheit : k.equals("hr") ? "bpm" : k.equals("km") ? "km" : ""; }
    private String label(String k) {
        switch (k) {
            case "pace": return einheit.equals("km/h") ? "TEMPO" : "PACE";
            case "hr": return uhr.puls > 0 ? "PULS · Z" + zone(uhr.puls) : "PULS";
            case "km": return "KM";
            default: return "ZEIT";
        }
    }

    @Override void zeichne(Canvas c, long jetzt) {
        if (!handy && !pause && !fertig && vorBis == 0 && !warte) laufMs += jetzt - letzt;
        letzt = jetzt;
        if (warte && jetzt - warteSeit > 5000) {
            warte = false;
            uhr.hinweis("Handy nicht erreichbar · Uhr misst allein");
        }
        z.alpha = 1f;
        float anteil = uhr.puls > 0 ? Math.max(0, Math.min(1, (uhr.puls / (float) uhr.daten.hfMax - 0.5f) / 0.5f)) : 0;
        z.aussenBogen(c, anteil, true, 1f);
        z.marke(c, 25);

        // Vorlauf auf dem Handy (GPS sucht): grosser Countdown
        if (vorBis > 0 || warte) {
            z.glasKreis(c, 96, 78, 40, 0x52FFFFFF);
            z.text(c, warte ? "VERBINDE" : "START IN", 96, 64, 5.4f, z.fett, 0xA6FFFFFF, 0.22f, android.graphics.Paint.Align.CENTER);
            String s = warte ? "…" : String.valueOf(Math.max(1, (int) Math.ceil((vorBis - jetzt) / 1000.0)));
            z.mitte(c, s, 96, 90, 30, z.fett, Zeichner.WEISS);
            z.mitte(c, warte ? "mit dem Handy" : "Handy sucht GPS", 96, 100, 6.2f, z.normal, 0xB3FFFFFF);
            z.knopfKlein(c, Zeichner.KL_X, druck(1), Zeichner.KREUZ);
            xRing(c, jetzt);
            return;
        }

        String m = REIHE[mitte];
        String rechts = m.equals("hr") ? "pace" : "hr", unten = m.equals("zeit") ? "pace" : "zeit";
        String links = "km";
        for (String k : REIHE) if (!k.equals(m) && !k.equals(rechts) && !k.equals(unten)) links = k;

        float blink = pause ? 0.35f + 0.65f * (float) (0.5 + 0.5 * Math.cos(jetzt / 1600.0 * 2 * Math.PI)) : 1f;
        float ein = Math.min(1, (jetzt - wechselZeit) / 300f);

        z.glasKreis(c, 96, 78, 40, 0x52FFFFFF);
        c.save();
        float sk = 0.8f + 0.2f * ein;
        c.scale(sk, sk, 96, 78);
        z.alpha = ein;
        z.text(c, label(m), 96, 64, 5.4f, z.fett, 0xA6FFFFFF, 0.22f, android.graphics.Paint.Align.CENTER);
        z.alpha = ein * blink;
        String w = wert(m, jetzt);
        z.mitte(c, w, 96, 88, w.length() > 5 ? 19 : 27, z.fett, Zeichner.WEISS);
        z.alpha = ein;
        z.mitte(c, einheitVon(m), 96, 98, 6.5f, z.normal, 0xB3FFFFFF);
        c.restore();

        seite(c, links, 35, blink, jetzt);
        seite(c, rechts, 157, blink, jetzt);
        z.alpha = 1f;
        String lu = label(unten), wu = wert(unten, jetzt) + (unten.equals("pace") ? " " + einheit : "");
        float b1 = z.breite(lu, 5.4f, z.fett, 0.15f), b2 = z.breite(wu, 9, z.fett, 0);
        float x0 = 96 - (b1 + 3 + b2) / 2;
        z.text(c, lu, x0, 132, 5.4f, z.fett, 0xB3FFFFFF, 0.15f, android.graphics.Paint.Align.LEFT);
        z.alpha = blink;
        z.text(c, wu, x0 + b1 + 3, 132, 9, z.fett, Zeichner.WEISS, 0, android.graphics.Paint.Align.LEFT);
        z.alpha = 1f;
        if (!handy) z.text(c, "NUR UHR · OHNE GPS", 96, 183, 4.6f, z.halbfett, 0x80FFFFFF, 0.1f, android.graphics.Paint.Align.CENTER);
        else if (getrennt(jetzt)) z.text(c, "HANDY GETRENNT", 96, 183, 4.6f, z.fett, Zeichner.ORANGE, 0.1f, android.graphics.Paint.Align.CENTER);

        z.knopfKlein(c, Zeichner.KL_X, druck(1), Zeichner.KREUZ);
        z.knopfGross(c, druck(2), pause ? Zeichner.ORANGE : 0xF5FFFFFF, pause ? Zeichner.WEISS : Zeichner.TINTE, pause ? Zeichner.PLAY : Zeichner.PAUSE);
        z.knopfKlein(c, Zeichner.KR_X, druck(3), Zeichner.STOPP);
        if (halteStart > 0) {
            float a = (jetzt - halteStart) / 1200f;
            z.halteRing(c, a);
            if (a >= 1 && !fertig) beenden();
        }
        xRing(c, jetzt);
    }

    /** X gedrückt halten = Lauf abbrechen (nicht speichern) */
    private void xRing(Canvas c, long jetzt) {
        if (halteX == 0) return;
        float a = (jetzt - halteX) / 2000f;   // 2 s halten: Verwerfen soll nicht aus Versehen passieren
        z.halteRing(c, a, Zeichner.KL_X);
        if (a >= 1 && !fertig) abbrechen();
    }

    private void abbrechen() {
        halteX = 0;
        if (handy || vorBis > 0 || warte) uhr.activity.anHandy("/bloc/lauf/befehl", "abbrechen");
        uhr.activity.vibriere(250);
        uhr.hinweis("Lauf abgebrochen · nicht gespeichert");
        fertig = true;
        uhr.postDelayed(uhr::menue, 1400);
    }

    private void seite(Canvas c, String k, float x, float blink, long j) {
        z.alpha = blink;
        z.mitte(c, wert(k, j), x, 82, 12, z.fett, Zeichner.WEISS);
        z.alpha = 1f;
        z.text(c, label(k), x, 91, 5.4f, z.fett, 0xA6FFFFFF, 0.18f, android.graphics.Paint.Align.CENTER);
    }

    private void beenden() {
        halteStart = 0;
        uhr.activity.vibriere(250);
        if (handy) {
            uhr.activity.anHandy("/bloc/lauf/befehl", "stopp");
            uhr.hinweis("Speichere auf dem Handy …");
            // Antwort (lauf:0) schliesst den Screen; ohne Antwort nach 5 s zurück ins Menü
            uhr.postDelayed(() -> { if (!fertig) { fertig = true; uhr.menue(); } }, 5000);
        } else {
            fertig = true;
            uhr.hinweis("Lauf beendet " + hmmss(laufMs / 1000));
            uhr.postDelayed(uhr::menue, 1800);
        }
    }

    @Override void runter(float x, float y) {
        super.runter(x, y);
        if (gedrueckt == 3 && !fertig && vorBis == 0 && !warte) { halteStart = SystemClock.uptimeMillis(); uhr.activity.vibriere(20); }
        if (gedrueckt == 1 && !fertig) { halteX = SystemClock.uptimeMillis(); uhr.activity.vibriere(20); }
    }

    @Override void hoch() {
        if (halteStart > 0 && !fertig) {
            if (SystemClock.uptimeMillis() - halteStart < 400) uhr.hinweis("Zum Beenden gedrückt halten");
            halteStart = 0;
        }
        if (halteX > 0 && !fertig) {
            if (SystemClock.uptimeMillis() - halteX < 400) uhr.hinweis("Zum Abbrechen gedrückt halten");
            halteX = 0;
        }
        super.hoch();
    }

    @Override void tippen(float x, float y) {
        if (vorBis == 0 && !warte && Math.hypot(x - 96, y - 78) < 40) { mitte = (mitte + 1) % 4; wechselZeit = SystemClock.uptimeMillis(); return; }
        super.tippen(x, y);
    }

    @Override void knopf(int k) {
        if (fertig) return;
        if (k == 2 && vorBis == 0 && !warte) {
            pause = !pause;
            if (handy) uhr.activity.anHandy("/bloc/lauf/befehl", pause ? "pause" : "weiter");
            uhr.activity.vibriere(40);
            uhr.hinweis(pause ? "Pausiert" : "Weiter geht’s");
        }
    }

    @Override boolean zurueck() {
        long j = SystemClock.uptimeMillis();
        if (j - abbrechenSeit < 2500) {
            if (handy) uhr.laufVerlassen = true;   // läuft auf dem Handy weiter, nicht gleich wieder öffnen
            return false;
        }
        abbrechenSeit = j;
        uhr.hinweis(handy ? "Lauf läuft auf dem Handy weiter · nochmal wischen" : "Nochmal wischen = abbrechen");
        return true;
    }
}
