package io.github.blocappbuilder.bloc.wear;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.os.SystemClock;
import android.view.InputDevice;
import android.view.MotionEvent;
import android.view.View;

/**
 * Die eine Ansicht der Uhr-App: zeichnet Hintergrund, den aktuellen Screen und kurze Hinweise,
 * verteilt Tippen, Wischen und die Krone. Quadratische Grundfläche, alles Wichtige im runden Bereich.
 */
public class UhrAnsicht extends View {
    final Zeichner z = new Zeichner();
    Daten daten = Daten.beispiel();
    /** Aktueller Puls vom Sensor der Uhr (0 = noch keiner) */
    int puls = 0;
    final BlocUhrActivity activity;

    private final Bitmap bild;
    private final Rect ziel = new Rect();
    private Bildschirm screen;
    private float s = 1, ox = 0, oy = 0;

    private String hinweis = "";
    private long hinweisBis = 0;

    // Gesten
    private float dx0, dy0, lx, ly;
    private boolean zieht, vomRand;
    private long letzteSekunde = 0;

    public UhrAnsicht(BlocUhrActivity a) {
        super(a);
        activity = a;
        bild = BitmapFactory.decodeResource(getResources(), R.drawable.bg_lauf);
        setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        setFocusable(true);
        setFocusableInTouchMode(true);
        screen = new MenueBildschirm(this);
    }

    void zeige(Bildschirm b) { screen = b; invalidate(); }
    void menue() { zeige(new MenueBildschirm(this)); }

    void hinweis(String t) { hinweis = t; hinweisBis = SystemClock.uptimeMillis() + 1700; }

    /** Lauf vom Handy wurde auf der Uhr verlassen: nicht bei jeder Nachricht wieder öffnen */
    boolean laufVerlassen = false;

    /** Live-Stand des Handy-Laufs: in den Lauf-Screen; startet der Lauf auf dem Handy, öffnet er sich im Menü von selbst */
    void laufLive(org.json.JSONObject o) {
        boolean aktiv = o.optInt("lauf", 0) == 1;
        if (!aktiv) laufVerlassen = false;
        if (screen instanceof LaufBildschirm) { ((LaufBildschirm) screen).live(o); return; }
        if (aktiv && !laufVerlassen && screen instanceof MenueBildschirm) {
            LaufBildschirm l = new LaufBildschirm(this, true);
            zeige(l);
            l.live(o);
        }
    }

    void neueDaten(Daten d) {
        if (d == null) return;
        daten = d;
        if (screen instanceof MenueBildschirm) ((MenueBildschirm) screen).neuAufbauen();
    }

    @Override
    protected void onDraw(Canvas c) {
        long jetzt = SystemClock.uptimeMillis();
        if (jetzt - letzteSekunde >= 1000) { letzteSekunde = jetzt; screen.sekunde(); }
        int w = getWidth(), h = getHeight();
        s = Math.min(w, h) / 192f;
        ox = (w - 192 * s) / 2f;
        oy = (h - 192 * s) / 2f;
        c.drawColor(Color.BLACK);
        if (bild != null) { ziel.set(0, 0, w, h); c.drawBitmap(bild, null, ziel, z.p); }
        c.save();
        c.translate(ox, oy);
        c.scale(s, s);
        z.alpha = 1f;
        screen.zeichne(c, jetzt);
        z.alpha = 1f;
        zeichneHinweis(c, jetzt);
        c.restore();
        postInvalidateDelayed(33);   // ~30 Bilder/s für Ringe und Figuren
    }

    private void zeichneHinweis(Canvas c, long jetzt) {
        if (jetzt > hinweisBis || hinweis.isEmpty()) return;
        float rest = (hinweisBis - jetzt) / 250f, ein = Math.min(1, (1700 - (hinweisBis - jetzt)) / 200f);
        z.alpha = Math.min(1, Math.min(rest, ein));
        float b = z.breite(hinweis, 8, z.fett, 0) + 18;
        RectF r = new RectF(96 - b / 2, 24, 96 + b / 2, 40);
        z.p.setStyle(Paint.Style.FILL);
        z.p.setColor(Zeichner.mitAlpha(0xC8141A22, z.alpha));
        c.drawRoundRect(r, 8, 8, z.p);
        z.p.setStyle(Paint.Style.STROKE);
        z.p.setStrokeWidth(0.6f);
        z.p.setColor(Zeichner.mitAlpha(0x4DFFFFFF, z.alpha));
        c.drawRoundRect(r, 8, 8, z.p);
        z.p.setStyle(Paint.Style.FILL);
        z.mitte(c, hinweis, 96, 35, 8, z.fett, Zeichner.WEISS);
        z.alpha = 1f;
    }

    @Override
    public boolean onTouchEvent(MotionEvent e) {
        float x = (e.getX() - ox) / s, y = (e.getY() - oy) / s;
        switch (e.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                dx0 = lx = x; dy0 = ly = y; zieht = false; vomRand = x < 18;
                screen.runter(x, y);
                return true;
            case MotionEvent.ACTION_MOVE:
                if (!zieht && Math.hypot(x - dx0, y - dy0) > 6) { zieht = true; screen.hoch(); }
                if (zieht && Math.abs(y - dy0) > Math.abs(x - dx0)) screen.ziehen(y - ly, false);
                lx = x; ly = y;
                return true;
            case MotionEvent.ACTION_UP:
                screen.hoch();
                float dx = x - dx0, dy = y - dy0;
                if (!zieht) screen.tippen(x, y);
                else if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.3f) {
                    if (vomRand && dx > 0) zurueck(); else screen.wischen(dx);
                } else screen.ziehen(0, true);
                return true;
            case MotionEvent.ACTION_CANCEL:
                screen.hoch();
                screen.ziehen(0, true);
                return true;
        }
        return super.onTouchEvent(e);
    }

    @Override
    public boolean onGenericMotionEvent(MotionEvent e) {
        if (e.getAction() == MotionEvent.ACTION_SCROLL && e.isFromSource(InputDevice.SOURCE_ROTARY_ENCODER)) {
            screen.krone(-e.getAxisValue(MotionEvent.AXIS_SCROLL));
            return true;
        }
        return super.onGenericMotionEvent(e);
    }

    /** true = erledigt; false = App darf sich schliessen */
    boolean zurueck() {
        if (screen.zurueck()) return true;
        if (screen instanceof MenueBildschirm) return false;
        menue();
        return true;
    }
}
