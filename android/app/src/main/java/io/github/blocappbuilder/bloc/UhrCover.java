package io.github.blocappbuilder.bloc;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;

import org.json.JSONObject;

/**
 * Cover-Bild für die Medien-Anzeige (Lauf und Timer), aufgebaut wie die Screens der BLOC-Uhr-App (Wear OS):
 * Meer-Hintergrund, BLOC oben, Ring aussen, Glas-Linse in der Mitte, Werte links und rechts, Zeile unten,
 * beim Intervall Übungsname über der Linse, Strichfigur darin und Kreise für die Übungen am Rand.
 * Unten bleibt Platz: dort legt die Uhr ihre eigenen Knöpfe hin. Gleiche Masse wie auf der Uhr (192er-Fläche).
 *
 * JSON je Schritt (von BLOC): l/w/e = Linse (Label, Wert, Einheit), o = Name über der Linse, f = Figur (SVG),
 * li/re = {w, l} links/rechts, ul/uw = Zeile unten (Label, Wert), r = Ring („s:n:an“ Segmente oder „a:0.4“ Bogen),
 * d = Übungs-Kreise („n:an“), p = Strecke („x,y …“ in 0..1), dim = Linse gedimmt (Pause).
 */
final class UhrCover {
    private static final int GROESSE = 384;
    private final Bitmap meer;
    private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG | Paint.LINEAR_TEXT_FLAG | Paint.SUBPIXEL_TEXT_FLAG);
    private final Typeface schwarz = Typeface.create(Typeface.DEFAULT, 900, false), fett = Typeface.create(Typeface.DEFAULT, 800, false),
            normal = Typeface.create(Typeface.DEFAULT, 500, false);
    private final RectF box = new RectF();

    UhrCover(Context ctx) { meer = BitmapFactory.decodeResource(ctx.getResources(), R.drawable.uhr_cover_bg); }

    Bitmap zeichne(String json) {
        JSONObject o;
        try { o = new JSONObject(json); } catch (Exception e) { o = new JSONObject(); }
        Bitmap b = Bitmap.createBitmap(GROESSE, GROESSE, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(b);
        if (meer != null) c.drawBitmap(meer, null, new Rect(0, 0, GROESSE, GROESSE), p);
        else c.drawColor(0xFF10161D);
        c.scale(GROESSE / 192f, GROESSE / 192f);

        ring(c, o.optString("r"));
        strecke(c, o.optString("p"));
        text(c, "BLOC", 97.4f, 25, 8.5f, schwarz, 0xFFFF6B47, 0.34f);

        String oben = o.optString("o");
        String fig = o.optString("f");
        float ly = oben.isEmpty() ? 78 : 82;
        if (!oben.isEmpty()) text(c, passend(oben, 7.5f, normal, 110), 96, 37, 7.5f, normal, 0xE6FFFFFF, 0);

        // Glas-Linse
        glasKreis(c, 96, ly, 40);
        boolean dim = o.optBoolean("dim");
        UhrFigur f = UhrFigur.aus(fig);
        String l = o.optString("l"), w = o.optString("w"), e = o.optString("e");
        if (f != null) {
            f.zeichne(c, p, 96, ly - 15, 34, dim ? 0.45f : 1f, 0, false);
            text(c, l.toUpperCase(), 96, ly + 10, 5.4f, fett, 0xA6FFFFFF, 0.22f);
            if (!w.isEmpty()) text(c, w, 96, ly + 26, groesse(w, 17, 66), fett, 0xFFFFFFFF, -0.03f);
        } else {
            text(c, l.toUpperCase(), 96, ly - 14, 5.4f, fett, 0xA6FFFFFF, 0.22f);
            text(c, w, 96, ly + 10, groesse(w, 27, 70), fett, dim ? 0x8CFFFFFF : 0xFFFFFFFF, -0.03f);
            if (!e.isEmpty()) text(c, passend(e, 6.5f, normal, 66), 96, ly + 20, 6.5f, normal, 0xB3FFFFFF, 0);
        }

        seite(c, o.optJSONObject("li"), 35);
        seite(c, o.optJSONObject("re"), 157);
        punkte(c, o.optString("d"));

        String ul = o.optString("ul"), uw = o.optString("uw");
        if (!uw.isEmpty()) {
            if (ul.length() > 6) {   // längerer Hinweis („ALS NÄCHSTES“): zweizeilig wie auf der Uhr
                text(c, ul.toUpperCase(), 96, 131.5f, 5.4f, fett, 0x99FFFFFF, 0.16f);
                text(c, passend(uw, 6.8f, fett, 110), 96, 139.5f, 6.8f, fett, 0xFFFFFFFF, 0);
            } else {
                float b1 = breite(ul.toUpperCase(), 5.4f, fett, 0.15f), b2 = breite(uw, 9, fett, 0), x0 = 96 - (b1 + 3 + b2) / 2;
                links(c, ul.toUpperCase(), x0, 132, 5.4f, fett, 0xB3FFFFFF, 0.15f);
                links(c, uw, x0 + b1 + 3, 132, 9, fett, 0xFFFFFFFF, 0);
            }
        }
        return b;
    }

    // ---------- Teile ----------
    private void glasKreis(Canvas c, float cx, float cy, float r) {
        p.setShader(null);
        p.setStyle(Paint.Style.FILL);
        p.setColor(0x22000000);
        c.drawCircle(cx, cy + 1.5f, r + 0.5f, p);
        p.setShader(new LinearGradient(cx - r, cy - r, cx + r, cy + r, new int[]{0x38FFFFFF, 0x10FFFFFF, 0x1AFFFFFF}, new float[]{0, 0.6f, 1}, Shader.TileMode.CLAMP));
        c.drawCircle(cx, cy, r, p);
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(0.6f);
        p.setColor(0x52FFFFFF);
        c.drawCircle(cx, cy, r, p);
        p.setStyle(Paint.Style.FILL);
    }

    private void seite(Canvas c, JSONObject s, float x) {
        if (s == null) return;
        String w = s.optString("w"), l = s.optString("l");
        if (!w.isEmpty()) text(c, w, x, 82, groesse(w, 12, 36), fett, 0xFFFFFFFF, -0.02f);
        if (!l.isEmpty()) text(c, l.toUpperCase(), x, 91, 5.4f, fett, 0xA6FFFFFF, 0.18f);
    }

    /** Bogen wie auf der Uhr: Radius 88, -120° bis +120° (unten frei für die Knöpfe) */
    private void bogen(Canvas c, float a0, float a1, float dicke, int farbe) {
        if (a1 - a0 < 0.2f) return;
        box.set(8, 8, 184, 184);
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(dicke);
        p.setStrokeCap(Paint.Cap.ROUND);
        p.setColor(farbe);
        c.drawArc(box, a0 - 90, a1 - a0, false, p);
        p.setStrokeCap(Paint.Cap.BUTT);
        p.setStyle(Paint.Style.FILL);
    }

    private static float px(float r, float a) { return 96 + r * (float) Math.sin(Math.toRadians(a)); }
    private static float py(float r, float a) { return 96 - r * (float) Math.cos(Math.toRadians(a)); }

    private void ring(Canvas c, String r) {
        bogen(c, -120, 120, 2.2f, 0x2EFFFFFF);
        if (r == null || r.isEmpty()) return;
        try {
            String[] t = r.split(":");
            if (t[0].equals("s")) {
                int n = Math.max(1, Math.min(40, Integer.parseInt(t[1]))), an = Integer.parseInt(t[2]);
                float g = n > 12 ? 2 : 4, b = (240 - g * (n - 1)) / n;
                for (int i = 0; i < n; i++) {
                    float a0 = -120 + i * (b + g);
                    bogen(c, a0, a0 + b, 2.8f, i + 1 == an ? 0xFFFF6B47 : i + 1 < an ? 0xFFFFFFFF : 0x38FFFFFF);
                }
            } else if (t[0].equals("a")) {
                float a = Math.max(0, Math.min(1, Float.parseFloat(t[1]))), ende = -120 + 240 * a;
                bogen(c, -120, ende, 2.6f, 0xFFFFFFFF);
                if (a > 0.002f) {
                    p.setColor(0x59FFFFFF); c.drawCircle(px(88, ende), py(88, ende), 5f, p);
                    p.setColor(0xFFFFFFFF); c.drawCircle(px(88, ende), py(88, ende), 3.4f, p);
                }
            }
        } catch (Exception ignored) { }
    }

    /** Übungs-Kreise rechts unten entlang der Kontur, je Reihe 6, weitere Reihen nach innen */
    private void punkte(Canvas c, String d) {
        if (d == null || d.isEmpty()) return;
        try {
            String[] t = d.split(":");
            int n = Math.min(18, Integer.parseInt(t[0])), an = Integer.parseInt(t[1]);
            for (int i = 0; i < n; i++) {
                float r = 80.5f - (i / 6) * 6.5f, a = 102 + (i % 6) * 6.4f;
                p.setColor(i == an ? 0xFFFF6B47 : i < an ? 0xD9FFFFFF : 0x47FFFFFF);
                c.drawCircle(px(r, a), py(r, a), i == an ? 2.3f : 1.6f, p);
            }
        } catch (Exception ignored) { }
    }

    /** Bisherige Strecke, ganz leicht hinter Linse und Werten (wächst mit jedem neuen Bild) */
    private void strecke(Canvas c, String s) {
        if (s == null || s.isEmpty()) return;
        Path pf = new Path();
        float lx = 0, ly = 0; int n = 0;
        for (String paar : s.trim().split(" ")) {
            String[] xy = paar.split(",");
            if (xy.length != 2) continue;
            try {
                float x = 40 + Float.parseFloat(xy[0]) * 112, y = 40 + Float.parseFloat(xy[1]) * 82;   // innerhalb des Rings, oberhalb der Knöpfe
                if (n++ == 0) pf.moveTo(x, y); else pf.lineTo(x, y);
                lx = x; ly = y;
            } catch (Exception ignored) { }
        }
        if (n < 2) return;
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeCap(Paint.Cap.ROUND);
        p.setStrokeJoin(Paint.Join.ROUND);
        p.setStrokeWidth(4); p.setColor(0x12FFFFFF); c.drawPath(pf, p);
        p.setStrokeWidth(1.3f); p.setColor(0x4DFFFFFF); c.drawPath(pf, p);
        p.setStyle(Paint.Style.FILL);
        p.setColor(0xCCFF6B47); c.drawCircle(lx, ly, 2.2f, p);
    }

    // ---------- Text ----------
    private float groesse(String t, float start, float max) {
        float g = start;
        while (g > 8 && breite(t, g, fett, -0.03f) > max) g -= 0.5f;
        return g;
    }

    private String passend(String t, float g, Typeface f, float max) {
        if (t == null) return "";
        if (breite(t, g, f, 0) <= max) return t;
        String s = t;
        while (s.length() > 1 && breite(s + "…", g, f, 0) > max) s = s.substring(0, s.length() - 1);
        return s + "…";
    }

    private float breite(String t, float g, Typeface f, float abstand) {
        p.setTypeface(f); p.setTextSize(g); p.setLetterSpacing(abstand); p.setFontFeatureSettings("tnum");
        return p.measureText(t);
    }

    private void text(Canvas c, String t, float x, float y, float g, Typeface f, int farbe, float abstand) { schreibe(c, t, x, y, g, f, farbe, abstand, Paint.Align.CENTER); }
    private void links(Canvas c, String t, float x, float y, float g, Typeface f, int farbe, float abstand) { schreibe(c, t, x, y, g, f, farbe, abstand, Paint.Align.LEFT); }

    private void schreibe(Canvas c, String t, float x, float y, float g, Typeface f, int farbe, float abstand, Paint.Align a) {
        if (t == null || t.isEmpty()) return;
        p.setShader(null);
        p.setStyle(Paint.Style.FILL);
        p.setTypeface(f);
        p.setTextSize(g);
        p.setLetterSpacing(abstand);
        p.setFontFeatureSettings("tnum");
        p.setTextAlign(a);
        p.setColor(farbe);
        c.drawText(t, x, y, p);
        p.setLetterSpacing(0);
    }
}
