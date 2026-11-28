package io.github.blocappbuilder.bloc.wear;

import android.graphics.Canvas;
import android.os.SystemClock;

/**
 * Satz für Satz (Fitnessbereich): Ring aussen = Sätze der Übung, Kreise rechts unten = Übungen.
 * Linse oder Stift antippen = ändern (erst Gewicht, dann Wiederholungen; Krone oder − / +).
 * Haken = Satz eintragen, danach Satzpause. Waagerecht wischen wechselt die Übung.
 */
class SatzBildschirm extends Bildschirm {
    private final Daten.Workout w;
    private int ue = 0, mod = 0;          // mod: 0 nichts, 1 Gewicht, 2 Wiederholungen
    private int satz, wdh;
    private float kg;
    private boolean pauseLaeuft = false, angehalten = false;
    private float rest = 0, restD = 90;
    private long letzt = SystemClock.uptimeMillis(), wechselZeit = SystemClock.uptimeMillis();
    private int richtung = 0;
    private long zurueckSeit = 0;

    SatzBildschirm(UhrAnsicht uhr, Daten.Workout w) {
        super(uhr);
        this.w = w;
        laden();
        uhr.activity.vibriere(60);
    }

    private Daten.Uebung u() { return w.uebungen.get(ue); }
    private void laden() { Daten.Uebung u = u(); satz = Math.min(u.satz, u.saetze); wdh = u.wdh; kg = u.kg; mod = 0; }
    private void merken() { Daten.Uebung u = u(); u.wdh = wdh; u.kg = kg; }

    private void wechsle(int r) {
        if (w.uebungen.size() < 2) return;
        merken();
        ue = (ue + r + w.uebungen.size()) % w.uebungen.size();
        laden();
        richtung = r;
        wechselZeit = SystemClock.uptimeMillis();
        uhr.activity.vibriere(20);
    }

    private boolean fertig(int i) { Daten.Uebung x = w.uebungen.get(i); return x.satz > x.saetze; }

    @Override void zeichne(Canvas c, long jetzt) {
        if (w.uebungen.isEmpty()) { z.mitte(c, "Keine Übungen", 96, 96, 9, z.fett, Zeichner.WEISS); return; }
        if (pauseLaeuft && !angehalten) {
            rest -= (jetzt - letzt) / 1000f;
            if (rest <= 0) satzLos();
        }
        letzt = jetzt;
        Daten.Uebung u = u();

        // Ring aussen
        if (!pauseLaeuft) {
            z.bogen(c, 88, -120, 120, 2.2f, 0x2EFFFFFF);
            int n = u.saetze; float g = 4, b = (240 - g * (n - 1)) / n;
            for (int i = 0; i < n; i++) {
                float a0 = -120 + i * (b + g);
                int f = i + 1 == satz ? Zeichner.ORANGE : i + 1 < satz ? Zeichner.WEISS : 0x38FFFFFF;
                z.bogen(c, 88, a0, a0 + b, 2.8f, f);
            }
        } else z.aussenBogen(c, rest / restD, false, 1f);
        z.marke(c, 25);

        // Was gezeigt wird: in der Pause nach dem letzten Satz schon die nächste Übung
        boolean neueUe = pauseLaeuft && satz > u.saetze;
        int zeigeI = neueUe ? (ue + 1) % w.uebungen.size() : ue;
        Daten.Uebung zeig = w.uebungen.get(zeigeI);

        float ein = Math.min(1, (jetzt - wechselZeit) / 320f);
        float verschub = richtung == 0 ? 0 : (1 - ein) * 16 * richtung;
        z.alpha = ein;
        z.mitte(c, zeig.name, 96 + verschub, 37, 7.5f, z.normal, 0xE6FFFFFF);
        z.alpha = 1f;

        z.glasKreis(c, 96, 82, 40, mod > 0 && !pauseLaeuft ? Zeichner.ORANGE : 0x52FFFFFF);
        c.save();
        c.translate(verschub, 0);
        z.alpha = ein;
        Figur fig = Figur.hole(zeig.fig);
        if (!pauseLaeuft) {
            if (fig != null) fig.zeichne(c, z.p, 96, 64, 34, ein, jetzt, true);
            // 10 × 60 kg
            String sw = String.valueOf(wdh), sk = kg(kg);
            float gz = 17, ge = 7;
            float bw = z.breite(sw, gz, z.fett, -0.03f), bx = z.breite("×", ge, z.normal, 0),
                  bk = u.kg > 0 ? z.breite(sk, gz, z.fett, -0.03f) : 0, be = z.breite(u.kg > 0 ? "kg" : "Wdh.", ge, z.normal, 0);
            float tot = bw + (u.kg > 0 ? bx + bk + 3 : 0) + be + 3, x0 = 96 - tot / 2, y = 94;
            z.text(c, sw, x0, y, gz, z.fett, mod == 2 ? Zeichner.ORANGE : Zeichner.WEISS, -0.03f, android.graphics.Paint.Align.LEFT);
            float x = x0 + bw + 1.5f;
            if (u.kg > 0) {
                z.text(c, "×", x, y, ge, z.normal, 0xBFFFFFFF, 0, android.graphics.Paint.Align.LEFT); x += bx + 1.5f;
                z.text(c, sk, x, y, gz, z.fett, mod == 1 ? Zeichner.ORANGE : Zeichner.WEISS, -0.03f, android.graphics.Paint.Align.LEFT); x += bk + 1.5f;
            }
            z.text(c, u.kg > 0 ? "kg" : "Wdh.", x, y, ge, z.normal, 0xBFFFFFFF, 0, android.graphics.Paint.Align.LEFT);
            if (mod > 0) {
                z.text(c, mod == 1 ? "GEWICHT · KRONE" : "WIEDERHOLUNGEN · KRONE", 96, 104, 5, z.fett, 0xB3FFFFFF, 0.12f, android.graphics.Paint.Align.CENTER);
                minusPlus(c);
            }
        } else {
            if (fig != null) fig.zeichne(c, z.p, 96, 65, 30, ein * 0.45f, jetzt, false);
            z.text(c, "SATZPAUSE", 96, 85, 5.4f, z.fett, 0xA6FFFFFF, 0.22f, android.graphics.Paint.Align.CENTER);
            z.alpha = angehalten ? 0.35f + 0.65f * (float) (0.5 + 0.5 * Math.cos(jetzt / 1600.0 * 2 * Math.PI)) : 1f;
            z.mitte(c, mmss((int) Math.ceil(rest)), 96, 104, 21, z.fett, Zeichner.WEISS);
        }
        c.restore();
        z.alpha = 1f;

        // Seiten
        z.mitte(c, Math.min(satz, u.saetze) + "/" + u.saetze, 35, 82, 12, z.fett, Zeichner.WEISS);
        z.text(c, "SATZ", 35, 91, 5.4f, z.fett, 0xA6FFFFFF, 0.18f, android.graphics.Paint.Align.CENTER);
        z.mitte(c, uhr.puls > 0 ? String.valueOf(uhr.puls) : "–", 157, 82, 12, z.fett, Zeichner.WEISS);
        z.text(c, uhr.puls > 0 ? "PULS · Z" + zone(uhr.puls) : "PULS", 157, 91, 5.4f, z.fett, 0xA6FFFFFF, 0.18f, android.graphics.Paint.Align.CENTER);

        // Übungs-Kreise
        for (int i = 0; i < Math.min(w.uebungen.size(), 18); i++) {
            int reihe = i / 6, k = i % 6;
            float r = 80.5f - reihe * 6.5f, a = 102 + k * 6.4f;
            int f = i == zeigeI ? Zeichner.ORANGE : (i == ue ? satz > u.saetze : fertig(i)) ? 0xD9FFFFFF : 0x47FFFFFF;
            z.punkt(c, Zeichner.px(r, a), Zeichner.py(r, a), i == zeigeI ? 2.3f : 1.6f, f, false);
        }

        // unten
        if (!pauseLaeuft) {
            z.text(c, "ZULETZT", 96, 131.5f, 5.4f, z.fett, 0x99FFFFFF, 0.16f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, u.zuletzt.isEmpty() ? "–" : u.zuletzt, 96, 139.5f, 6.8f, z.fett, Zeichner.WEISS);
        } else {
            int nw = neueUe ? zeig.wdh : wdh; float nk = neueUe ? zeig.kg : kg; int ns = neueUe ? Math.min(zeig.satz, zeig.saetze) : satz;
            z.text(c, "ALS NÄCHSTES", 96, 131.5f, 5.4f, z.fett, 0x99FFFFFF, 0.16f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, "Satz " + ns + " · " + (nk > 0 ? nw + " × " + kg(nk) + " kg" : nw + " Wdh."), 96, 139.5f, 6.8f, z.fett, Zeichner.WEISS);
        }

        // Knöpfe
        z.knopfKlein(c, Zeichner.KL_X, druck(1), Zeichner.WEITER);
        if (pauseLaeuft) z.knopfGross(c, druck(2), angehalten ? Zeichner.ORANGE : 0xF5FFFFFF, angehalten ? Zeichner.WEISS : Zeichner.TINTE, angehalten ? Zeichner.PLAY : Zeichner.PAUSE);
        else z.knopfGross(c, druck(2), 0xF5FFFFFF, Zeichner.TINTE, Zeichner.HAKEN);
        z.knopfKlein(c, Zeichner.KR_X, druck(3), pauseLaeuft ? Zeichner.PLUS30 : Zeichner.STIFT);
    }

    private void minusPlus(Canvas c) {
        z.punkt(c, 62, 82, 6.5f, 0x33FFFFFF, false);
        z.punkt(c, 130, 82, 6.5f, 0x33FFFFFF, false);
        z.mitte(c, "−", 62, 85.5f, 10, z.fett, Zeichner.WEISS);
        z.mitte(c, "+", 130, 85.5f, 10, z.fett, Zeichner.WEISS);
    }

    private void aendern(int s) {
        if (mod == 1) kg = Math.max(0, kg + 2.5f * s);
        else if (mod == 2) wdh = Math.max(1, wdh + s);
        uhr.activity.vibriere(10);
    }

    private void modWeiter() { mod = u().kg > 0 ? (mod + 1) % 3 : (mod == 0 ? 2 : 0); }

    private void satzLos() {
        pauseLaeuft = false; angehalten = false; restD = 90; mod = 0;
        if (satz > u().saetze) wechsle(1);
        wechselZeit = SystemClock.uptimeMillis();
        uhr.activity.vibriere(300);
        uhr.hinweis("Los, Satz " + satz + "!");
    }

    @Override void tippen(float x, float y) {
        if (!pauseLaeuft && mod > 0) {
            if (Math.hypot(x - 62, y - 82) < 10) { aendern(-1); return; }
            if (Math.hypot(x - 130, y - 82) < 10) { aendern(1); return; }
        }
        if (!pauseLaeuft && Math.hypot(x - 96, y - 82) < 40) { modWeiter(); return; }
        super.tippen(x, y);
    }

    @Override void knopf(int k) {
        Daten.Uebung u = u();
        if (k == 2) {
            if (!pauseLaeuft) {
                uhr.hinweis("Satz " + satz + " eingetragen ✓");
                u.zuletzt = u.kg > 0 || kg > 0 ? wdh + " × " + kg(kg) + " kg" : wdh + " Wdh.";
                merken();
                satz++; u.satz = satz;
                pauseLaeuft = true; rest = restD; mod = 0; angehalten = false;
                wechselZeit = SystemClock.uptimeMillis(); richtung = 0;
                uhr.activity.vibriere(80);
                uhr.activity.satzEingetragen(w, u, satz - 1, wdh, kg);
            } else { angehalten = !angehalten; uhr.hinweis(angehalten ? "Pause angehalten" : "Weiter"); }
        } else if (k == 1) {
            if (pauseLaeuft) { uhr.hinweis("Pause beendet"); satzLos(); }
            else { wechsle(1); uhr.hinweis("Nächste Übung"); }
        } else if (k == 3) {
            if (pauseLaeuft) { rest += 30; restD = Math.max(restD, rest); uhr.hinweis("+30 s Pause"); }
            else modWeiter();
        }
    }

    @Override void wischen(float dx) { if (!pauseLaeuft) wechsle(dx < 0 ? 1 : -1); }

    private float kroneSumme = 0;
    /** Krone im Uhrzeigersinn = mehr; kleine Drehungen werden gesammelt */
    @Override void krone(float d) {
        if (pauseLaeuft || mod == 0) return;
        kroneSumme += d;
        while (Math.abs(kroneSumme) >= 0.5f) { aendern(kroneSumme > 0 ? 1 : -1); kroneSumme -= Math.signum(kroneSumme) * 0.5f; }
    }

    @Override boolean zurueck() {
        long j = SystemClock.uptimeMillis();
        if (j - zurueckSeit < 2500) return false;
        zurueckSeit = j;
        uhr.hinweis("Nochmal wischen = beenden");
        return true;
    }
}
