package io.github.blocappbuilder.bloc.wear;

import android.graphics.Canvas;

/** Ein Screen der Uhr-App. Koordinaten immer in der 192er-Fläche. */
abstract class Bildschirm {
    final UhrAnsicht uhr;
    final Zeichner z;
    /** Welcher der drei Knöpfe gerade gedrückt ist (1 links, 2 Mitte, 3 rechts) */
    int gedrueckt = 0;

    Bildschirm(UhrAnsicht uhr) { this.uhr = uhr; this.z = uhr.z; }

    abstract void zeichne(Canvas c, long jetzt);

    /** Antippen (ohne Wischen). Standard: Knöpfe */
    void tippen(float x, float y) { int k = knopf(x, y); if (k > 0) knopf(k); }
    void knopf(int k) { }
    void runter(float x, float y) { gedrueckt = knopf(x, y); }
    void hoch() { gedrueckt = 0; }
    /** Waagerecht gewischt (dx > 0 = nach rechts) */
    void wischen(float dx) { }
    /** Senkrecht ziehen (für Listen); fertig = Finger losgelassen */
    void ziehen(float dy, boolean fertig) { }
    /** Krone gedreht (positiv = nach unten / mehr) */
    void krone(float d) { }
    /** Zurück (Wischen vom linken Rand oder Zurück-Taste). true = selbst erledigt */
    boolean zurueck() { return false; }
    /** Einmal pro Sekunde */
    void sekunde() { }

    static int knopf(float x, float y) {
        if (Math.abs(y - Zeichner.KNOPF_Y) > 20) return 0;
        if (Math.hypot(x - Zeichner.KL_X, y - Zeichner.KNOPF_Y) < 16) return 1;
        if (Math.hypot(x - Zeichner.KM_X, y - Zeichner.KNOPF_Y) < 21) return 2;
        if (Math.hypot(x - Zeichner.KR_X, y - Zeichner.KNOPF_Y) < 16) return 3;
        return 0;
    }

    float druck(int k) { return gedrueckt == k ? 0.9f : 1f; }

    static String mmss(int s) { s = Math.max(0, s); return (s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }
    static String hmmss(long s) {
        long h = s / 3600, m = s % 3600 / 60, x = s % 60;
        return h > 0 ? h + ":" + (m < 10 ? "0" : "") + m + ":" + (x < 10 ? "0" : "") + x : m + ":" + (x < 10 ? "0" : "") + x;
    }
    static String kg(float k) {
        String s = (k == Math.floor(k)) ? String.valueOf((int) k) : String.valueOf(k);
        return s.replace('.', ',');
    }

    /** Puls-Zone 1..5 nach % der HFmax (50/60/70/80/90) */
    int zone(int bpm) {
        float p = bpm / (float) uhr.daten.hfMax;
        return p < 0.6f ? 1 : p < 0.7f ? 2 : p < 0.8f ? 3 : p < 0.9f ? 4 : 5;
    }
}
