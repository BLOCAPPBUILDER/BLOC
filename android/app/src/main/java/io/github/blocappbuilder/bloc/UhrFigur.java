package io.github.blocappbuilder.bloc;

import android.graphics.Canvas;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.Path;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Strichfiguren aus BLOC (ILLU in js/02-bibliothek.js, Pose A und B) – gleiche Fassung wie in der Uhr-App (wear/Figur.java),
 * hier für das Cover der Medien-Anzeige.
 * Die SVG-Bausteine werden einmal in Android-Pfade übersetzt; die zweite Pose blendet weich über.
 * (Masken der App werden hier weggelassen, sie verdecken nur kleine Überschneidungen.)
 */
final class UhrFigur {
    private static final class Teil { final Path pfad = new Path(); float dicke = 5.2f, deck = 1f; boolean fuellen; }

    private final List<Teil> a, b;
    private static final Map<String, UhrFigur> CACHE = new HashMap<>();

    private UhrFigur(List<Teil> a, List<Teil> b) { this.a = a; this.b = b; }

    static int alpha(int farbe, float a) {
        int al = Math.round(((farbe >>> 24) & 0xFF) * Math.max(0, Math.min(1, a)));
        return (farbe & 0x00FFFFFF) | (al << 24);
    }

    /** Figur direkt aus SVG-Text (vom Cover), ohne Zwischenspeicher-Kennung */
    static UhrFigur aus(String svg) { return svg == null || svg.isEmpty() ? null : new UhrFigur(lies(svg), null); }

    static UhrFigur hole(String id) {
        if (id == null) return null;
        UhrFigur f = CACHE.get(id);
        if (f != null) return f;
        String[] q = DATEN.get(id);
        if (q == null) return null;
        f = new UhrFigur(lies(q[0]), q[1] != null ? lies(q[1]) : null);
        CACHE.put(id, f);
        return f;
    }

    private static final Pattern ELEM = Pattern.compile("<(path|circle)([^>]*)/>");
    private static final Pattern ATTR = Pattern.compile("([a-z-]+)=\"([^\"]*)\"");

    private static List<Teil> lies(String svg) {
        List<Teil> out = new ArrayList<>();
        String ohneMaske = svg.replaceAll("<mask.*?</mask>", "");
        Matcher m = ELEM.matcher(ohneMaske);
        while (m.find()) {
            Map<String, String> at = new HashMap<>();
            Matcher am = ATTR.matcher(m.group(2));
            while (am.find()) at.put(am.group(1), am.group(2));
            String kl = at.containsKey("class") ? at.get("class") : "";
            Teil t = new Teil();
            if (kl.contains("lb")) t.deck = 0.55f;
            if (kl.contains("tr")) t.dicke = 8.4f;
            if (kl.contains("br")) t.dicke = 11f;
            if (kl.contains("nk")) t.dicke = 4.4f;
            if (kl.contains("ip")) { t.dicke = 3.4f; t.deck = 0.75f; }
            if (m.group(1).equals("circle")) {
                float cx = f(at.get("cx")), cy = f(at.get("cy")), r = f(at.get("r"));
                t.pfad.addCircle(cx, cy, r, Path.Direction.CW);
                t.fuellen = true;
                if (kl.contains("ipf")) t.deck = 0.75f;
            } else {
                pfadLesen(at.get("d"), t.pfad);
            }
            out.add(t);
        }
        return out;
    }

    private static float f(String s) { return s == null ? 0 : Float.parseFloat(s); }

    /** Gerade Linien wie in den BLOC-Figuren: M, L, H, V (auch klein = relativ); Bögen und Kurven werden übersprungen */
    private static void pfadLesen(String d, Path p) {
        if (d == null) return;
        Matcher m = Pattern.compile("([A-Za-z])|(-?[0-9]*\\.?[0-9]+(?:e-?[0-9]+)?)").matcher(d);
        char cmd = 'M';
        float x = 0, y = 0;
        List<Object> tokens = new ArrayList<>();
        while (m.find()) tokens.add(m.group(1) != null ? (Object) m.group(1).charAt(0) : (Object) Float.parseFloat(m.group(2)));
        int i = 0;
        while (i < tokens.size()) {
            Object t = tokens.get(i);
            if (t instanceof Character) { cmd = (Character) t; i++; continue; }
            boolean paar = "MLml".indexOf(cmd) >= 0;
            if (paar && (i + 1 >= tokens.size() || tokens.get(i + 1) instanceof Character)) { i++; continue; }
            switch (cmd) {
                case 'M': x = (Float) tokens.get(i); y = (Float) tokens.get(i + 1); p.moveTo(x, y); i += 2; cmd = 'L'; break;
                case 'L': x = (Float) tokens.get(i); y = (Float) tokens.get(i + 1); p.lineTo(x, y); i += 2; break;
                case 'H': x = (Float) tokens.get(i); p.lineTo(x, y); i++; break;
                case 'V': y = (Float) tokens.get(i); p.lineTo(x, y); i++; break;
                case 'm': x += (Float) tokens.get(i); y += (Float) tokens.get(i + 1); p.moveTo(x, y); i += 2; cmd = 'l'; break;
                case 'l': x += (Float) tokens.get(i); y += (Float) tokens.get(i + 1); p.lineTo(x, y); i += 2; break;
                case 'h': x += (Float) tokens.get(i); p.lineTo(x, y); i++; break;
                case 'v': y += (Float) tokens.get(i); p.lineTo(x, y); i++; break;
                default: i++;
            }
        }
    }

    /** Zeichnet die UhrFigur in ein Quadrat der Kantenlänge g um (cx, cy); zeit in ms für den Posenwechsel */
    void zeichne(Canvas c, Paint p, float cx, float cy, float g, float deckkraft, long zeit, boolean bewegt) {
        c.save();
        c.translate(cx - g / 2, cy - g / 2);
        c.scale(g / 100f, g / 100f);
        // Boden (gepunktet)
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeCap(Paint.Cap.ROUND);
        p.setStrokeJoin(Paint.Join.ROUND);
        p.setStrokeWidth(1.5f);
        p.setPathEffect(new DashPathEffect(new float[]{1, 5}, 0));
        p.setColor(UhrFigur.alpha(0xFFFFFFFF, 0.5f * deckkraft));
        c.drawLine(6, 91, 94, 91, p);
        p.setPathEffect(null);
        float wa = 1, wb = 0;
        if (b != null && bewegt) {
            float t = (zeit % 1800) / 1800f;           // wie in der HTML: 0–38 % A, 50–88 % B
            if (t < 0.38f) { wa = 1; } else if (t < 0.5f) { wb = (t - 0.38f) / 0.12f; wa = 1 - wb; }
            else if (t < 0.88f) { wa = 0; wb = 1; } else { wa = (t - 0.88f) / 0.12f; wb = 1 - wa; }
        }
        teile(c, p, a, wa * deckkraft);
        if (b != null && wb > 0) teile(c, p, b, wb * deckkraft);
        c.restore();
        p.setStyle(Paint.Style.FILL);
        p.setStrokeCap(Paint.Cap.BUTT);
    }

    private static void teile(Canvas c, Paint p, List<Teil> l, float deck) {
        if (deck <= 0.01f) return;
        for (Teil t : l) {
            p.setColor(UhrFigur.alpha(0xFFFFFFFF, t.deck * deck));
            if (t.fuellen) { p.setStyle(Paint.Style.FILL); }
            else { p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(t.dicke); }
            c.drawPath(t.pfad, p);
        }
    }

    // ---------- Daten: aus BLOC übernommen (ILLU, Pose A / B) ----------
    private static final Map<String, String[]> DATEN = new HashMap<>();
    static {
        DATEN.put("burpees", new String[]{
            "<path class=\"tr\" d=\"M47 77.6L56 74.2L65 70.8\"/><path class=\"br\" d=\"M65 70.8L56.9 73.9\"/><path class=\"nk\" d=\"M65 70.8L68.2 69.6\"/><path d=\"M47 77.6L31.8 82.9L18.8 87.5L21.9 89.4\"/><path class=\"fs\" d=\"M18.8 87.5L17.1 86.5\"/><circle cx=\"76.6\" cy=\"66.4\" r=\"7\"/><path d=\"M65 70.8L65.6 79.9L65.2 89\"/><circle class=\"hd\" cx=\"65.2\" cy=\"89\" r=\"3.3\"/>",
            "<path class=\"tr\" d=\"M50 47.2L49.7 37.5L49.3 27.8\"/><path class=\"br\" d=\"M49.3 27.8L49.7 36.5\"/><path class=\"nk\" d=\"M49.3 27.8L49.2 24.4\"/><path d=\"M50 47.2L52.3 63.2L50 77.6L53 82.2\"/><path class=\"fs\" d=\"M50 77.6L48.4 75.1\"/><circle cx=\"48.9\" cy=\"15.4\" r=\"7\"/><path d=\"M49.3 27.8L56.1 22.1L62.2 15.3\"/><circle class=\"hd\" cx=\"62.2\" cy=\"15.3\" r=\"3.3\"/>"});
        DATEN.put("air-squats", new String[]{
            "<path class=\"tr\" d=\"M50 50L50 37.3L50 24.5\"/><path class=\"br\" d=\"M50 24.5L50 36\"/><path class=\"nk\" d=\"M50 24.5L50 20\"/><path d=\"M50 50L50 70L50 89L58 89\"/><path class=\"fs\" d=\"M50 89L45.6 89\"/><circle cx=\"50\" cy=\"11\" r=\"7\"/><path d=\"M50 24.5L63 25L76 25\"/><circle class=\"hd\" cx=\"76\" cy=\"25\" r=\"3.3\"/>",
            "<path class=\"tr\" d=\"M36 62L40.3 51L44.5 39.9\"/><path class=\"br\" d=\"M44.5 39.9L40.7 49.9\"/><path class=\"nk\" d=\"M44.5 39.9L46 36\"/><path d=\"M36 62L57 62L52 89L60 89\"/><path class=\"fs\" d=\"M52 89L47.6 89\"/><circle cx=\"49.2\" cy=\"27.6\" r=\"7\"/><path d=\"M44.5 39.9L60 38L74 37\"/><circle class=\"hd\" cx=\"74\" cy=\"37\" r=\"3.3\"/>"});
        DATEN.put("mountain-climbers", new String[]{
            "<path class=\"lb\" d=\"M44 72L58 76L48 86L46 89\"/><path class=\"fs lb\" d=\"M48 86L49.1 84.3\"/><path class=\"tr\" d=\"M44 72L55.9 66.9L67.8 61.8\"/><path class=\"br\" d=\"M67.8 61.8L57.1 66.4\"/><path class=\"nk\" d=\"M67.8 61.8L72 60\"/><path d=\"M44 72L28 78L12 86L9 89\"/><path class=\"fs\" d=\"M12 86L13.7 84.3\"/><circle cx=\"80.3\" cy=\"56.5\" r=\"7\"/><path d=\"M67.8 61.8L69 75L70 89\"/><circle class=\"hd\" cx=\"70\" cy=\"89\" r=\"3.3\"/>",
            "<path class=\"lb\" d=\"M44 72L28 78L12 86L9 89\"/><path class=\"fs lb\" d=\"M12 86L13.7 84.3\"/><path class=\"tr\" d=\"M44 72L55.9 66.9L67.8 61.8\"/><path class=\"br\" d=\"M67.8 61.8L57.1 66.4\"/><path class=\"nk\" d=\"M67.8 61.8L72 60\"/><path d=\"M44 72L58 76L48 86L46 89\"/><path class=\"fs\" d=\"M48 86L49.1 84.3\"/><circle cx=\"80.3\" cy=\"56.5\" r=\"7\"/><path d=\"M67.8 61.8L69 75L70 89\"/><circle class=\"hd\" cx=\"70\" cy=\"89\" r=\"3.3\"/>"});
        DATEN.put("push-ups", new String[]{
            "<path class=\"tr\" d=\"M44 72L55.9 66.9L67.8 61.8\"/><path class=\"br\" d=\"M67.8 61.8L57.1 66.4\"/><path class=\"nk\" d=\"M67.8 61.8L72 60\"/><path d=\"M44 72L28 78L12 86L9 89\"/><path class=\"fs\" d=\"M12 86L13.7 84.3\"/><circle cx=\"80.3\" cy=\"56.5\" r=\"7\"/><path d=\"M67.8 61.8L69 75L70 89\"/><circle class=\"hd\" cx=\"70\" cy=\"89\" r=\"3.3\"/>",
            "<path class=\"tr\" d=\"M44 82L55.9 80.3L67.8 78.6\"/><path class=\"br\" d=\"M67.8 78.6L57.1 80.1\"/><path class=\"nk\" d=\"M67.8 78.6L72 78\"/><path d=\"M44 82L28 85L12 87L9 89\"/><path class=\"fs\" d=\"M12 87L13.7 85.9\"/><circle cx=\"80.9\" cy=\"76.7\" r=\"7\"/><path d=\"M67.8 78.6L60 71L70 89\"/><circle class=\"hd\" cx=\"70\" cy=\"89\" r=\"3.3\"/>"});
        DATEN.put("barbell-squat", new String[]{
            "<circle class=\"ipf gm\" cx=\"47\" cy=\"20\" r=\"7\"/><path class=\"tr\" d=\"M50 50L50 37.3L50 24.5\"/><path class=\"br\" d=\"M50 24.5L50 36\"/><path class=\"nk\" d=\"M50 24.5L50 20\"/><path d=\"M50 50L50 70L50 89L58 89\"/><path class=\"fs\" d=\"M50 89L45.6 89\"/><circle cx=\"50\" cy=\"11\" r=\"7\"/><path d=\"M50 24.5L57.8 22.1L48 21\"/><circle class=\"hd\" cx=\"48\" cy=\"21\" r=\"3.3\"/>",
            "<circle class=\"ipf gm\" cx=\"43\" cy=\"35\" r=\"7\"/><path class=\"tr\" d=\"M36 62L40.3 51L44.5 39.9\"/><path class=\"br\" d=\"M44.5 39.9L40.7 49.9\"/><path class=\"nk\" d=\"M44.5 39.9L46 36\"/><path d=\"M36 62L57 62L52 89L60 89\"/><path class=\"fs\" d=\"M52 89L47.6 89\"/><circle cx=\"49.2\" cy=\"27.6\" r=\"7\"/><path d=\"M44.5 39.9L50.8 44.1L44 37\"/><circle class=\"hd\" cx=\"44\" cy=\"37\" r=\"3.3\"/>"});
        DATEN.put("bench-press", new String[]{
            "<path class=\"ip gm\" d=\"M12 73H60M15 73V89M57 73V89\"/><circle class=\"ipf gm\" cx=\"30\" cy=\"42\" r=\"7\"/><path class=\"tr\" d=\"M48 69L38.6 68.2L29.3 67.3\"/><path class=\"br\" d=\"M29.3 67.3L37.7 68.1\"/><path class=\"nk\" d=\"M29.3 67.3L26 67\"/><path d=\"M48 69L64 64L66 85L73 89\"/><path class=\"fs\" d=\"M66 85L62.1 82.8\"/><circle cx=\"16\" cy=\"66\" r=\"7\"/><path d=\"M29.3 67.3L29 56L30 44\"/><circle class=\"hd\" cx=\"30\" cy=\"44\" r=\"3.3\"/>",
            "<path class=\"ip gm\" d=\"M12 73H60M15 73V89M57 73V89\"/><circle class=\"ipf gm\" cx=\"35\" cy=\"61.5\" r=\"7\"/><path class=\"tr\" d=\"M48 69L38.6 68.2L29.3 67.3\"/><path class=\"br\" d=\"M29.3 67.3L37.7 68.1\"/><path class=\"nk\" d=\"M29.3 67.3L26 67\"/><path d=\"M48 69L64 64L66 85L73 89\"/><path class=\"fs\" d=\"M66 85L62.1 82.8\"/><circle cx=\"16\" cy=\"66\" r=\"7\"/><path d=\"M29.3 67.3L35 77.5L35 64.5\"/><circle class=\"hd\" cx=\"35\" cy=\"64.5\" r=\"3.3\"/>"});
    }

    /** Vom Handy kommen Figuren später als SVG-Text mit; hier einhängen */
    static void merke(String id, String poseA, String poseB) {
        if (id == null || poseA == null || DATEN.containsKey(id)) return;
        DATEN.put(id, new String[]{poseA, poseB});
    }
}
