package io.github.blocappbuilder.bloc.wear;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;

/**
 * Zeichenhilfen im BLOC-Uhr-Look (Entwurf „Uhr-Glas-Varianten“, 2026-11-28).
 * Alle Masse in dp einer gedachten 192 x 192-Flaeche; Winkel: 0° = oben, im Uhrzeigersinn.
 */
final class Zeichner {
    static final int WEISS = Color.WHITE;
    static final int ORANGE = 0xFFFF6B47;
    static final int TINTE = 0xFF1C1C1E;
    static final int[] ZONEN = {0xFF9AA5B1, 0xFF6F92FF, 0xFF3FCF8E, 0xFFFF9F40, 0xFFFF4F45};

    final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG | Paint.LINEAR_TEXT_FLAG | Paint.SUBPIXEL_TEXT_FLAG);   // stufenlose Schrift: gezeichnet wird klein und dann skaliert
    final Typeface schwarz = Typeface.create(Typeface.DEFAULT, 900, false);
    final Typeface fett = Typeface.create(Typeface.DEFAULT, 800, false);
    final Typeface halbfett = Typeface.create(Typeface.DEFAULT, 600, false);
    final Typeface normal = Typeface.create(Typeface.DEFAULT, 500, false);
    final Typeface leicht = Typeface.create(Typeface.DEFAULT, 400, false);
    private final RectF r = new RectF();
    private final Path pfad = new Path();
    /** Gesamt-Deckkraft (z. B. zum Blinken in der Pause), 0..1 */
    float alpha = 1f;

    static int mitAlpha(int farbe, float a) {
        int al = Math.round(Color.alpha(farbe) * Math.max(0, Math.min(1, a)));
        return (farbe & 0x00FFFFFF) | (al << 24);
    }

    private void farbe(int f) { p.setColor(mitAlpha(f, alpha)); }

    // ---------- Text ----------
    float text(Canvas c, String t, float x, float y, float groesse, Typeface schrift, int f, float abstand, Paint.Align a) {
        if (t == null || t.isEmpty()) return 0;
        p.setStyle(Paint.Style.FILL);
        p.setTypeface(schrift);
        p.setTextSize(groesse);
        p.setLetterSpacing(abstand);
        p.setFontFeatureSettings("tnum");
        p.setTextAlign(a);
        p.setShader(null);
        farbe(f);
        c.drawText(t, x, y, p);
        return p.measureText(t);
    }

    float mitte(Canvas c, String t, float x, float y, float groesse, Typeface schrift, int f) {
        return text(c, t, x, y, groesse, schrift, f, 0, Paint.Align.CENTER);
    }

    float breite(String t, float groesse, Typeface schrift, float abstand) {
        p.setTypeface(schrift); p.setTextSize(groesse); p.setLetterSpacing(abstand); p.setFontFeatureSettings("tnum");
        return p.measureText(t);
    }

    /** Zahl mit kleiner Einheit, gemeinsam mittig */
    void zahlEinheit(Canvas c, String zahl, String einheit, float x, float y, float gz, float ge, int f) {
        float w1 = breite(zahl, gz, fett, -0.03f), w2 = einheit.isEmpty() ? 0 : breite(einheit, ge, normal, 0) + 1.5f;
        float x0 = x - (w1 + w2) / 2f;
        text(c, zahl, x0, y, gz, fett, f, -0.03f, Paint.Align.LEFT);
        if (!einheit.isEmpty()) text(c, einheit, x0 + w1 + 1.5f, y, ge, normal, mitAlpha(f, 0.75f), 0, Paint.Align.LEFT);
    }

    /** BLOC-Wortmarke oben */
    void marke(Canvas c, float y) {
        text(c, "BLOC", 96 + 1.4f, y, 8.5f, schwarz, ORANGE, 0.34f, Paint.Align.CENTER);
    }

    // ---------- Glas ----------
    private void glasFuellung(float x0, float y0, float x1, float y1) {
        p.setShader(new LinearGradient(x0, y0, x1, y1,
                new int[]{mitAlpha(0x38FFFFFF, alpha), mitAlpha(0x10FFFFFF, alpha), mitAlpha(0x1AFFFFFF, alpha)},
                new float[]{0f, 0.6f, 1f}, Shader.TileMode.CLAMP));
    }

    void glasKreis(Canvas c, float cx, float cy, float rad, int rand) {
        p.setStyle(Paint.Style.FILL);
        p.setColor(mitAlpha(0x22000000, alpha));
        c.drawCircle(cx, cy + 1.5f, rad + 0.5f, p);
        glasFuellung(cx - rad, cy - rad, cx + rad, cy + rad);
        c.drawCircle(cx, cy, rad, p);
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(rand == ORANGE ? 1.2f : 0.6f);
        farbe(rand);
        c.drawCircle(cx, cy, rad, p);
        p.setStyle(Paint.Style.FILL);
    }

    void glasPille(Canvas c, RectF b, float rad, boolean dunkler) {
        p.setStyle(Paint.Style.FILL);
        p.setColor(mitAlpha(0x22000000, alpha));
        r.set(b.left, b.top + 1.5f, b.right, b.bottom + 1.5f);
        c.drawRoundRect(r, rad, rad, p);
        if (dunkler) farbe(0x14FFFFFF); else glasFuellung(b.left, b.top, b.right, b.bottom);
        c.drawRoundRect(b, rad, rad, p);
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(0.6f);
        farbe(0x52FFFFFF);
        c.drawRoundRect(b, rad, rad, p);
        p.setStyle(Paint.Style.FILL);
    }

    // ---------- Bögen und Kreise ----------
    static float px(float rad, float grad) { return 96 + rad * (float) Math.sin(Math.toRadians(grad)); }
    static float py(float rad, float grad) { return 96 - rad * (float) Math.cos(Math.toRadians(grad)); }

    void bogen(Canvas c, float rad, float a0, float a1, float dicke, int f) {
        if (a1 - a0 < 0.2f) return;
        r.set(96 - rad, 96 - rad, 96 + rad, 96 + rad);
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(dicke);
        p.setStrokeCap(Paint.Cap.ROUND);
        farbe(f);
        c.drawArc(r, a0 - 90, a1 - a0, false, p);
        p.setStrokeCap(Paint.Cap.BUTT);
        p.setStyle(Paint.Style.FILL);
    }

    void punkt(Canvas c, float x, float y, float rad, int f, boolean leuchten) {
        p.setShader(null);
        p.setStyle(Paint.Style.FILL);
        if (leuchten) { farbe(mitAlpha(f, 0.35f)); c.drawCircle(x, y, rad + 1.6f, p); }
        farbe(f);
        c.drawCircle(x, y, rad, p);
    }

    void linie(Canvas c, float x0, float y0, float x1, float y1, float dicke, int f) {
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(dicke);
        p.setStrokeCap(Paint.Cap.ROUND);
        farbe(f);
        c.drawLine(x0, y0, x1, y1, p);
        p.setStrokeCap(Paint.Cap.BUTT);
        p.setStyle(Paint.Style.FILL);
    }

    /** Weisser Bogen aussen, -120° bis +120° (unten frei für die Knöpfe); Anteil 0..1 */
    void aussenBogen(Canvas c, float anteil, boolean zonenStriche, float deckkraft) {
        bogen(c, 88, -120, 120, 2.2f, 0x2EFFFFFF);
        if (zonenStriche) for (int i = 1; i < 5; i++) {
            float a = -120 + i * 48;
            linie(c, px(84, a), py(84, a), px(80.5f, a), py(80.5f, a), 1f, 0x8CFFFFFF);
        }
        float a = -120 + 240 * Math.max(0, Math.min(1, anteil));
        bogen(c, 88, -120, a, 2.6f, mitAlpha(WEISS, deckkraft));
        if (anteil > 0.002f) punkt(c, px(88, a), py(88, a), 3.4f, WEISS, true);
    }

    // ---------- Knöpfe ----------
    static final float KNOPF_Y = 160, KL_X = 61, KR_X = 131, KM_X = 96;

    void knopfKlein(Canvas c, float cx, float gedrueckt, Icon icon) {
        c.save();
        c.scale(gedrueckt, gedrueckt, cx, KNOPF_Y);
        p.setShader(null);
        p.setStyle(Paint.Style.FILL);
        farbe(0x2BFFFFFF);
        c.drawCircle(cx, KNOPF_Y, 12, p);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(0.6f);
        farbe(0x52FFFFFF);
        c.drawCircle(cx, KNOPF_Y, 12, p);
        icon.zeichne(this, c, cx, KNOPF_Y, 10, WEISS);
        c.restore();
    }

    void knopfGross(Canvas c, float gedrueckt, int grund, int vorne, Icon icon) {
        c.save();
        c.scale(gedrueckt, gedrueckt, KM_X, KNOPF_Y);
        p.setShader(null);
        p.setStyle(Paint.Style.FILL);
        farbe(0x55000000);
        c.drawCircle(KM_X, KNOPF_Y + 2.5f, 18.5f, p);
        farbe(grund);
        c.drawCircle(KM_X, KNOPF_Y, 18, p);
        icon.zeichne(this, c, KM_X, KNOPF_Y, 14, vorne);
        c.restore();
    }

    /** Orangener Halte-Ring um den rechten Knopf (Stopp gedrückt halten) */
    void halteRing(Canvas c, float anteil) {
        if (anteil <= 0) return;
        r.set(KR_X - 14.5f, KNOPF_Y - 14.5f, KR_X + 14.5f, KNOPF_Y + 14.5f);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(2f);
        p.setStrokeCap(Paint.Cap.ROUND);
        farbe(ORANGE);
        c.drawArc(r, -90, 360 * Math.min(1, anteil), false, p);
        p.setStrokeCap(Paint.Cap.BUTT);
        p.setStyle(Paint.Style.FILL);
    }

    // ---------- Icons (24er-Raster, auf Grösse g skaliert) ----------
    interface Icon { void zeichne(Zeichner z, Canvas c, float cx, float cy, float g, int f); }

    private Path icon24(float cx, float cy, float g) {
        pfad.reset();
        return pfad;
    }

    private void fuellePfad(Canvas c, Path pa, float cx, float cy, float g, int f) {
        c.save();
        c.translate(cx - g / 2, cy - g / 2);
        c.scale(g / 24f, g / 24f);
        p.setShader(null);
        p.setStyle(Paint.Style.FILL);
        farbe(f);
        c.drawPath(pa, p);
        c.restore();
    }

    private void strichPfad(Canvas c, Path pa, float cx, float cy, float g, int f, float dicke) {
        c.save();
        c.translate(cx - g / 2, cy - g / 2);
        c.scale(g / 24f, g / 24f);
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(dicke);
        p.setStrokeCap(Paint.Cap.ROUND);
        p.setStrokeJoin(Paint.Join.ROUND);
        farbe(f);
        c.drawPath(pa, p);
        c.restore();
        p.setStyle(Paint.Style.FILL);
    }

    static final Icon PAUSE = (z, c, x, y, g, f) -> {
        Path a = z.icon24(x, y, g);
        a.addRoundRect(new RectF(5, 3.5f, 9.6f, 20.5f), 1.6f, 1.6f, Path.Direction.CW);
        a.addRoundRect(new RectF(14.4f, 3.5f, 19, 20.5f), 1.6f, 1.6f, Path.Direction.CW);
        z.fuellePfad(c, a, x, y, g, f);
    };
    static final Icon PLAY = (z, c, x, y, g, f) -> {
        Path a = z.icon24(x, y, g);
        a.moveTo(7, 3.8f); a.lineTo(7, 20.2f); a.lineTo(21, 12); a.close();
        z.fuellePfad(c, a, x, y, g, f);
    };
    static final Icon STOPP = (z, c, x, y, g, f) -> {
        Path a = z.icon24(x, y, g);
        a.addRoundRect(new RectF(4, 4, 20, 20), 3.5f, 3.5f, Path.Direction.CW);
        z.fuellePfad(c, a, x, y, g, f);
    };
    static final Icon KREUZ = (z, c, x, y, g, f) -> {
        Path a = z.icon24(x, y, g);
        a.moveTo(6, 6); a.lineTo(18, 18); a.moveTo(18, 6); a.lineTo(6, 18);
        z.strichPfad(c, a, x, y, g, f, 3.4f);
    };
    static final Icon WEITER = (z, c, x, y, g, f) -> {
        Path a = z.icon24(x, y, g);
        a.moveTo(5, 4.5f); a.lineTo(5, 19.5f); a.lineTo(16.6f, 12); a.close();
        a.addRoundRect(new RectF(17.5f, 4, 20.5f, 20), 1.2f, 1.2f, Path.Direction.CW);
        z.fuellePfad(c, a, x, y, g, f);
    };
    static final Icon NEU = (z, c, x, y, g, f) -> {
        Path a = z.icon24(x, y, g);
        a.addArc(new RectF(4.5f, 4.5f, 19.5f, 19.5f), -40, 310);
        z.strichPfad(c, a, x, y, g, f, 2.8f);
        Path b = new Path();
        b.moveTo(14.5f, 2.5f); b.lineTo(20, 6.1f); b.lineTo(14.7f, 9.7f); b.close();
        z.fuellePfad(c, b, x, y, g, f);
    };
    static final Icon HAKEN = (z, c, x, y, g, f) -> {
        Path a = z.icon24(x, y, g);
        a.moveTo(4.5f, 12.5f); a.lineTo(9.5f, 17.5f); a.lineTo(19.5f, 7);
        z.strichPfad(c, a, x, y, g, f, 3.4f);
    };
    static final Icon STIFT = (z, c, x, y, g, f) -> {
        Path a = z.icon24(x, y, g);
        a.moveTo(4, 20); a.lineTo(5, 15.5f); a.lineTo(15.5f, 5); a.lineTo(19, 8.5f); a.lineTo(8.5f, 19); a.close();
        z.fuellePfad(c, a, x, y, g, f);
    };
    static final Icon PLUS30 = (z, c, x, y, g, f) -> z.mitte(c, "+30", x, y + 2.6f, 7, z.fett, f);
}
