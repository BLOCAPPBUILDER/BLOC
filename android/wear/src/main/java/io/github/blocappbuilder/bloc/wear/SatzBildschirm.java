package io.github.blocappbuilder.bloc.wear;

import android.graphics.Canvas;
import android.os.SystemClock;

/**
 * Satz für Satz (Fitnessbereich): Ring aussen = Sätze der Übung, Kreise rechts unten = Übungen.
 * Linse oder Stift antippen = ändern (erst Gewicht, dann Wiederholungen; Krone oder − / +).
 * Haken = Satz eintragen, danach Satzpause (Länge je Übung, wie auf dem Handy). Waagerecht wischen wechselt die Übung.
 * In der Pause die Linse antippen = letzten Satz korrigieren. Sind alle Sätze drin oder wischt man zurück, kommt der Abschluss:
 * Haken = Training fertig (das Handy speichert es), links = weiter trainieren, rechts = letzten Satz korrigieren.
 */
class SatzBildschirm extends Bildschirm {
    private final Daten.Workout w;
    private final Sitzung sitzung;
    private int ue = 0, mod = 0;          // mod: 0 nichts, 1 Gewicht, 2 Wiederholungen
    private int satz, wdh;                // satz: der nächste einzutragende Satz
    private float kg;
    private boolean pauseLaeuft = false, angehalten = false, ende = false, gesendet = false;
    private float rest = 0, restD = 90;
    private long letzt = SystemClock.uptimeMillis(), wechselZeit = SystemClock.uptimeMillis();
    private int richtung = 0;
    /** Rückfrage bei ungewöhnlich schwerem Gewicht: bis wann ein zweiter Haken gilt */
    private long schwerBis = 0;
    private float schwerKg = 0;
    /** Letzter Satz (zum Korrigieren) */
    private int lUe = -1, lSatz, lWdh;
    private float lKg;
    private long lAt;
    private boolean korr = false;
    private int vorWdh, vorUe;
    private float vorKg;

    SatzBildschirm(UhrAnsicht uhr, Daten.Workout w) {
        super(uhr);
        this.w = w;
        sitzung = Sitzung.fuer(uhr.activity, w.id);
        for (int i = 0; i < w.uebungen.size(); i++) if (!fertig(i)) { ue = i; break; }   // nach einer Unterbrechung dort weiter
        if (!w.uebungen.isEmpty()) laden();
        uhr.activity.vibriere(60);
        if (sitzung.gesamt() > 0) uhr.hinweis("Weiter bei Satz " + satz);
        else if (w.leichtHeute()) uhr.hinweis("Leichtwoche: weniger Sätze");
    }

    private Daten.Uebung u() { return w.uebungen.get(ue); }
    private int ziel(Daten.Uebung u) { return w.saetze(u); }
    private void laden() { Daten.Uebung u = u(); satz = sitzung.saetze(u.id) + 1; wdh = u.wdh; kg = u.kg; mod = 0; schwerBis = 0; }
    private void merken() { Daten.Uebung u = u(); u.wdh = wdh; u.kg = kg; }
    private boolean fertig(int i) { Daten.Uebung x = w.uebungen.get(i); return sitzung.saetze(x.id) >= ziel(x); }
    private boolean allesFertig() { for (int i = 0; i < w.uebungen.size(); i++) if (!fertig(i)) return false; return true; }
    /** Nächste Übung mit offenen Sätzen (reihum), sonst die eigene */
    private int naechsteOffene() {
        for (int k = 1; k <= w.uebungen.size(); k++) { int i = (ue + k) % w.uebungen.size(); if (!fertig(i)) return i; }
        return ue;
    }

    private void zu(int i, int r) {
        merken();
        ue = i;
        laden();
        richtung = r;
        wechselZeit = SystemClock.uptimeMillis();
        uhr.activity.vibriere(20);
    }

    private void wechsle(int r) {
        if (w.uebungen.size() < 2) return;
        zu((ue + r + w.uebungen.size()) % w.uebungen.size(), r);
    }

    private String werte(Daten.Uebung u, int wd, float k) { return u.mitKg ? wd + (u.zeit ? " s" : "") + " × " + kg(k) + " kg" : wd + " " + u.einheit(); }

    @Override void zeichne(Canvas c, long jetzt) {
        if (w.uebungen.isEmpty()) { z.mitte(c, "Keine Übungen", 96, 96, 9, z.fett, Zeichner.WEISS); return; }
        if (pauseLaeuft && !angehalten) {
            rest -= (jetzt - letzt) / 1000f;
            if (rest <= 0) pauseVorbei();
        }
        letzt = jetzt;
        if (ende && !korr) { zeichneEnde(c, jetzt); return; }
        Daten.Uebung u = u();
        boolean pauseSicht = pauseLaeuft && !korr;
        int soll = ziel(u);

        // Ring aussen
        if (!pauseSicht) {
            z.bogen(c, 88, -120, 120, 2.2f, 0x2EFFFFFF);
            int n = Math.max(soll, 1), jetztS = korr ? lSatz : satz; float g = 4, b = (240 - g * (n - 1)) / n;
            for (int i = 0; i < n; i++) {
                float a0 = -120 + i * (b + g);
                int f = i + 1 == jetztS ? Zeichner.ORANGE : i + 1 < jetztS ? Zeichner.WEISS : 0x38FFFFFF;
                z.bogen(c, 88, a0, a0 + b, 2.8f, f);
            }
        } else z.aussenBogen(c, rest / restD, false, 1f);
        z.marke(c, 25);

        // Was gezeigt wird: in der Pause nach dem letzten Satz schon die nächste Übung
        boolean neueUe = pauseSicht && fertig(ue) && naechsteOffene() != ue;
        int zeigeI = neueUe ? naechsteOffene() : ue;
        Daten.Uebung zeig = w.uebungen.get(zeigeI);

        float ein = Math.min(1, (jetzt - wechselZeit) / 320f);
        float verschub = richtung == 0 ? 0 : (1 - ein) * 16 * richtung;
        z.alpha = ein;
        z.mitte(c, zeig.name, 96 + verschub, 37, 7.5f, z.normal, 0xE6FFFFFF);
        z.alpha = 1f;

        z.glasKreis(c, 96, 82, 40, (mod > 0 || korr) && !pauseSicht ? Zeichner.ORANGE : 0x52FFFFFF);
        c.save();
        c.translate(verschub, 0);
        z.alpha = ein;
        Figur fig = Figur.hole(zeig.fig);
        if (!pauseSicht) {
            if (fig != null) fig.zeichne(c, z.p, 96, 64, 34, ein, jetzt, true);
            // 10 × 60 kg
            String sw = String.valueOf(wdh), sk = kg(kg), eh = u.mitKg ? "kg" : u.einheit();
            float gz = 17, ge = 7;
            if (mod > 0) {   // zwischen − und + bleibt weniger Platz: lange Zahlen (112,5 kg) kleiner
                float voll = z.breite(sw, gz, z.fett, -0.03f) + (u.mitKg ? z.breite("×" + sk, gz, z.fett, -0.03f) : 0) + z.breite(eh, ge, z.normal, 0) + 2;
                if (voll > 56) gz = Math.max(11, gz * 56 / voll);
            }
            float bw = z.breite(sw, gz, z.fett, -0.03f), bx = z.breite(u.zeit ? "s ×" : "×", ge, z.normal, 0),
                  bk = u.mitKg ? z.breite(sk, gz, z.fett, -0.03f) : 0, be = z.breite(eh, ge, z.normal, 0);
            float tot = bw + (u.mitKg ? bx + bk + 3 : 0) + be + 3, x0 = 96 - tot / 2, y = 94;
            z.text(c, sw, x0, y, gz, z.fett, mod == 2 ? Zeichner.ORANGE : Zeichner.WEISS, -0.03f, android.graphics.Paint.Align.LEFT);
            float x = x0 + bw + 1.5f;
            if (u.mitKg) {
                z.text(c, u.zeit ? "s ×" : "×", x, y, ge, z.normal, 0xBFFFFFFF, 0, android.graphics.Paint.Align.LEFT); x += bx + 1.5f;
                z.text(c, sk, x, y, gz, z.fett, mod == 1 ? Zeichner.ORANGE : Zeichner.WEISS, -0.03f, android.graphics.Paint.Align.LEFT); x += bk + 1.5f;
            }
            z.text(c, eh, x, y, ge, z.normal, 0xBFFFFFFF, 0, android.graphics.Paint.Align.LEFT);
            if (mod > 0) {
                z.text(c, mod == 1 ? "GEWICHT · KRONE" : u.zeit ? "SEKUNDEN · KRONE" : "WDH. · KRONE", 96, 104, 5, z.fett, 0xB3FFFFFF, 0.12f, android.graphics.Paint.Align.CENTER);
                minusPlus(c);
            }
        } else {
            if (fig != null) fig.zeichne(c, z.p, 96, 65, 30, ein * 0.45f, jetzt, false);
            z.text(c, "SATZPAUSE", 96, 85, 5.4f, z.fett, 0xA6FFFFFF, 0.22f, android.graphics.Paint.Align.CENTER);
            z.alpha = angehalten ? 0.35f + 0.65f * (float) (0.5 + 0.5 * Math.cos(jetzt / 1600.0 * 2 * Math.PI)) : 1f;
            z.mitte(c, mmss((int) Math.ceil(rest)), 96, 104, 21, z.fett, Zeichner.WEISS);
            z.alpha = ein;
            if (lUe >= 0) z.text(c, "TIPPEN = ÄNDERN", 96, 113.5f, 4.6f, z.fett, 0x99FFFFFF, 0.1f, android.graphics.Paint.Align.CENTER);
        }
        c.restore();
        z.alpha = 1f;

        // Seiten
        int sZeig = korr ? lSatz : satz;
        z.mitte(c, (korr ? lSatz : Math.min(sZeig, Math.max(soll, sitzung.saetze(u.id)))) + "/" + soll, 35, 82, 12, z.fett, Zeichner.WEISS);
        z.text(c, "SATZ", 35, 91, 5.4f, z.fett, 0xA6FFFFFF, 0.18f, android.graphics.Paint.Align.CENTER);
        z.mitte(c, uhr.puls > 0 ? String.valueOf(uhr.puls) : "–", 157, 82, 12, z.fett, Zeichner.WEISS);
        z.text(c, uhr.puls > 0 ? "PULS · Z" + zone(uhr.puls) : "PULS", 157, 91, 5.4f, z.fett, 0xA6FFFFFF, 0.18f, android.graphics.Paint.Align.CENTER);

        // Übungs-Kreise
        for (int i = 0; i < Math.min(w.uebungen.size(), 18); i++) {
            int reihe = i / 6, k = i % 6;
            float r = 80.5f - reihe * 6.5f, a = 102 + k * 6.4f;
            int f = i == zeigeI ? Zeichner.ORANGE : fertig(i) ? 0xD9FFFFFF : 0x47FFFFFF;
            z.punkt(c, Zeichner.px(r, a), Zeichner.py(r, a), i == zeigeI ? 2.3f : 1.6f, f, false);
        }

        // unten
        if (korr) {
            z.text(c, "SATZ " + lSatz + " KORRIGIEREN", 96, 131.5f, 5.4f, z.fett, Zeichner.ORANGE, 0.16f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, "eingetragen: " + werte(u, lWdh, lKg), 96, 139.5f, 6.8f, z.fett, Zeichner.WEISS);
        } else if (!pauseSicht) {
            boolean tipp = u.tipp && sitzung.saetze(u.id) == 0;
            z.text(c, tipp ? "VORSCHLAG AUF DEM HANDY" : "ZULETZT", 96, 131.5f, 5.4f, z.fett, tipp ? Zeichner.ORANGE : 0x99FFFFFF, 0.16f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, u.zuletzt.isEmpty() ? "–" : kurz(u.zuletzt, 6.8f, 92), 96, 139.5f, 6.8f, z.fett, Zeichner.WEISS);
        } else {
            int nw = neueUe ? zeig.wdh : wdh; float nk = neueUe ? zeig.kg : kg; int ns = neueUe ? sitzung.saetze(zeig.id) + 1 : satz;
            z.text(c, "ALS NÄCHSTES", 96, 131.5f, 5.4f, z.fett, 0x99FFFFFF, 0.16f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, "Satz " + ns + " · " + werte(zeig, nw, nk), 96, 139.5f, 6.8f, z.fett, Zeichner.WEISS);
        }

        // Knöpfe
        if (korr) {
            z.knopfKlein(c, Zeichner.KL_X, druck(1), Zeichner.KREUZ);
            z.knopfGross(c, druck(2), Zeichner.ORANGE, Zeichner.WEISS, Zeichner.HAKEN);
            z.knopfKlein(c, Zeichner.KR_X, druck(3), Zeichner.STIFT);
            return;
        }
        z.knopfKlein(c, Zeichner.KL_X, druck(1), Zeichner.WEITER);
        if (pauseSicht) z.knopfGross(c, druck(2), angehalten ? Zeichner.ORANGE : 0xF5FFFFFF, angehalten ? Zeichner.WEISS : Zeichner.TINTE, angehalten ? Zeichner.PLAY : Zeichner.PAUSE);
        else z.knopfGross(c, druck(2), 0xF5FFFFFF, Zeichner.TINTE, Zeichner.HAKEN);
        z.knopfKlein(c, Zeichner.KR_X, druck(3), pauseSicht ? Zeichner.PLUS30 : Zeichner.STIFT);
    }

    /** Abschluss: Haken = fertig (ans Handy), links = weiter trainieren, rechts = letzten Satz korrigieren */
    private void zeichneEnde(Canvas c, long jetzt) {
        int ist = 0, soll = 0;
        for (Daten.Uebung x : w.uebungen) { soll += ziel(x); ist += Math.min(sitzung.saetze(x.id), ziel(x)); }
        boolean alles = ist >= soll;
        z.bogen(c, 88, -120, 120, 2.2f, 0x2EFFFFFF);
        if (soll > 0 && ist > 0) z.bogen(c, 88, -120, -120 + 240f * ist / soll, 2.8f, alles ? Zeichner.WEISS : Zeichner.ORANGE);
        z.marke(c, 25);
        z.mitte(c, kurz(w.name, 7.5f, 110), 96, 37, 7.5f, z.normal, 0xE6FFFFFF);
        z.glasKreis(c, 96, 82, 40, gesendet ? 0x52FFFFFF : Zeichner.ORANGE);
        if (gesendet) {
            z.text(c, w.id.isEmpty() ? "FERTIG" : "GESPEICHERT", 96, 78, 5.4f, z.fett, 0xA6FFFFFF, 0.2f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, "Stark!", 96, 96, 17, z.fett, Zeichner.WEISS);
            z.text(c, w.id.isEmpty() ? "NUR BEISPIELDATEN" : "DAS HANDY ÜBERNIMMT ES", 96, 135, 5.4f, z.fett, 0x99FFFFFF, 0.14f, android.graphics.Paint.Align.CENTER);
        } else {
            z.text(c, alles ? "TRAINING FERTIG?" : "SCHON FERTIG?", 96, 68, 5.4f, z.fett, 0xA6FFFFFF, 0.16f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, ist + "/" + soll, 96, 91, 21, z.fett, Zeichner.WEISS);
            z.mitte(c, "Sätze", 96, 103, 7, z.normal, 0xBFFFFFFF);
            z.text(c, "HAKEN = SPEICHERN", 96, 131.5f, 5.4f, z.fett, 0x99FFFFFF, 0.14f, android.graphics.Paint.Align.CENTER);
            z.mitte(c, alles ? "Pfeil = noch ein Satz" : "Pfeil = weiter trainieren", 96, 139.5f, 6.4f, z.halbfett, Zeichner.WEISS);
            z.knopfKlein(c, Zeichner.KL_X, druck(1), Zeichner.WEITER);
            if (lUe >= 0) z.knopfKlein(c, Zeichner.KR_X, druck(3), Zeichner.STIFT);
        }
        z.knopfGross(c, druck(2), gesendet ? 0xF5FFFFFF : Zeichner.ORANGE, gesendet ? Zeichner.TINTE : Zeichner.WEISS, Zeichner.HAKEN);
    }

    private String kurz(String t, float g, float max) {
        if (z.breite(t, g, z.fett, 0) <= max) return t;
        String s = t;
        while (s.length() > 1 && z.breite(s + "…", g, z.fett, 0) > max) s = s.substring(0, s.length() - 1);
        return s + "…";
    }

    private void minusPlus(Canvas c) {
        z.punkt(c, 62, 82, 6.5f, 0x33FFFFFF, false);
        z.punkt(c, 130, 82, 6.5f, 0x33FFFFFF, false);
        z.mitte(c, "−", 62, 85.5f, 10, z.fett, Zeichner.WEISS);
        z.mitte(c, "+", 130, 85.5f, 10, z.fett, Zeichner.WEISS);
    }

    private void aendern(int s) {
        Daten.Uebung u = u();
        if (mod == 1) { kg = Math.max(0, Math.min(500, Math.round((kg + u.schritt * s) * 100) / 100f)); schwerBis = 0; }
        else if (mod == 2) wdh = Math.max(u.zeit ? 5 : 1, Math.min(u.zeit ? 600 : 100, wdh + (u.zeit ? 5 : 1) * s));
        uhr.activity.vibriere(10);
    }

    private void modWeiter() { mod = u().mitKg ? (mod + 1) % 3 : (mod == 0 ? 2 : 0); if (korr && mod == 0) mod = u().mitKg ? 1 : 2; }

    private void pauseVorbei() {
        if (korr) { pauseLaeuft = false; uhr.activity.vibriere(300); return; }   // gerade wird korrigiert: danach geht es weiter
        satzLos();
    }

    private void satzLos() {
        pauseLaeuft = false; angehalten = false; mod = 0;
        if (fertig(ue) && naechsteOffene() != ue) zu(naechsteOffene(), 1);
        wechselZeit = SystemClock.uptimeMillis();
        uhr.activity.vibriere(300);
        uhr.hinweis("Los, Satz " + satz + "!");
    }

    /** Wie auf dem Handy: deutlich mehr als das Arbeitsgewicht (über 30 % und über 5 kg) braucht einen zweiten Haken */
    private boolean zuSchwer(Daten.Uebung u, float ref) {
        if (!u.mitKg || ref <= 0 || u.id.startsWith("assisted-") || kg <= ref * 1.3f || kg - ref <= 5) return false;
        long j = SystemClock.uptimeMillis();
        if (j < schwerBis && schwerKg == kg) return false;
        schwerBis = j + 5000; schwerKg = kg;
        uhr.hinweis("Wirklich " + kg(kg) + " kg? Nochmal ✓");
        uhr.activity.vibriere(120);
        return true;
    }

    private void eintragen() {
        Daten.Uebung u = u();
        if (zuSchwer(u, u.kg)) return;
        u.zuletzt = werte(u, wdh, kg);
        merken();
        lUe = ue; lSatz = satz; lWdh = wdh; lKg = kg; lAt = System.currentTimeMillis();
        sitzung.satz(uhr.activity, u.id, lAt);
        uhr.activity.vibriere(80);
        uhr.activity.satzEingetragen(w, u, lSatz, lWdh, lKg, lAt, sitzung.sid);
        uhr.hinweis("Satz " + lSatz + " eingetragen ✓");
        satz++;
        mod = 0; angehalten = false; richtung = 0; schwerBis = 0;
        wechselZeit = SystemClock.uptimeMillis();
        if (allesFertig()) { pauseLaeuft = false; ende = true; return; }   // letzter Satz: keine Pause mehr, gleich der Abschluss
        pauseLaeuft = true; restD = u.pause; rest = restD;
    }

    private void korrigieren() {
        if (lUe < 0) return;
        korr = true; vorUe = ue; vorWdh = wdh; vorKg = kg;
        ue = lUe; wdh = lWdh; kg = lKg;
        mod = u().mitKg ? 1 : 2;
        schwerBis = 0; richtung = 0;
        uhr.activity.vibriere(20);
    }

    private void korrEnde(boolean speichern) {
        Daten.Uebung u = u();
        if (speichern) {
            if (zuSchwer(u, lKg)) return;
            lWdh = wdh; lKg = kg;
            u.wdh = wdh; u.kg = kg; u.zuletzt = werte(u, wdh, kg);
            uhr.activity.satzEingetragen(w, u, lSatz, lWdh, lKg, lAt, sitzung.sid);
            uhr.hinweis("Satz " + lSatz + " geändert ✓");
            uhr.activity.vibriere(80);
        }
        korr = false; mod = 0;
        ue = vorUe;
        if (speichern && vorUe == lUe) { wdh = lWdh; kg = lKg; } else { wdh = vorWdh; kg = vorKg; }
        if (!ende && !pauseLaeuft) satzLos();
    }

    private void fertigMelden() {
        if (gesendet) { uhr.menue(); return; }
        gesendet = true; pauseLaeuft = false;
        uhr.activity.trainingFertig(w, sitzung.sid, System.currentTimeMillis());
        sitzung.beenden(uhr.activity);
        uhr.activity.vibriere(200);
    }

    @Override void tippen(float x, float y) {
        if (w.uebungen.isEmpty()) return;
        boolean linse = Math.hypot(x - 96, y - 82) < 40;
        if (ende && !korr) { super.tippen(x, y); return; }
        if (mod > 0 && (!pauseLaeuft || korr)) {
            if (Math.hypot(x - 62, y - 82) < 10) { aendern(-1); return; }
            if (Math.hypot(x - 130, y - 82) < 10) { aendern(1); return; }
        }
        if (linse) { if (pauseLaeuft && !korr) korrigieren(); else modWeiter(); return; }
        super.tippen(x, y);
    }

    @Override void knopf(int k) {
        if (w.uebungen.isEmpty()) return;
        if (korr) {
            if (k == 1) korrEnde(false); else if (k == 2) korrEnde(true); else if (k == 3) modWeiter();
            return;
        }
        if (ende) {
            if (k == 2) fertigMelden();
            else if (k == 1 && !gesendet) { ende = false; wechselZeit = SystemClock.uptimeMillis(); }
            else if (k == 3 && !gesendet) korrigieren();
            return;
        }
        if (k == 2) {
            if (!pauseLaeuft) eintragen();
            else { angehalten = !angehalten; uhr.hinweis(angehalten ? "Pause angehalten" : "Weiter"); }
        } else if (k == 1) {
            if (pauseLaeuft) { uhr.hinweis("Pause beendet"); satzLos(); }
            else { wechsle(1); uhr.hinweis("Nächste Übung"); }
        } else if (k == 3) {
            if (pauseLaeuft) { rest += 30; restD = Math.max(restD, rest); uhr.hinweis("+30 s Pause"); }
            else modWeiter();
        }
    }

    @Override void wischen(float dx) { if (!pauseLaeuft && !ende && !korr) wechsle(dx < 0 ? 1 : -1); }

    private float kroneSumme = 0;
    /** Krone im Uhrzeigersinn = mehr; kleine Drehungen werden gesammelt */
    @Override void krone(float d) {
        if (mod == 0 || (pauseLaeuft && !korr)) return;
        kroneSumme += d;
        while (Math.abs(kroneSumme) >= 0.5f) { aendern(kroneSumme > 0 ? 1 : -1); kroneSumme -= Math.signum(kroneSumme) * 0.5f; }
    }

    /** Zurück: erst der Abschluss; nochmal zurück verlässt das Training, es bleibt auf dem Handy offen */
    @Override boolean zurueck() {
        if (korr) { korrEnde(false); return true; }
        if (gesendet || sitzung.gesamt() == 0) return false;
        if (!ende) { ende = true; uhr.activity.vibriere(20); return true; }
        uhr.hinweis("Offen: auf dem Handy weiter");
        return false;
    }
}
