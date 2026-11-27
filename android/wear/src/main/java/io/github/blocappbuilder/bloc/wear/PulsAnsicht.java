package io.github.blocappbuilder.bloc.wear;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.view.View;

/**
 * Test-Puls-Screen im BLOC-Look (Spezifikation der Design-Session, 2026-11-27):
 * vorgerendertes, weichgezeichnetes Meer-Bild, kleines Logo, Glas-Karte mit dem Puls.
 * Gezeichnet auf einer gedachten Fläche von 192 x 192 dp, die auf den runden Bildschirm skaliert wird.
 */
public class PulsAnsicht extends View {
    private static final int WEISS = Color.WHITE;
    private static final int GEDIMMT = 0xC7FFFFFF;
    private static final int GRUEN = Color.parseColor("#3FCF8E");

    private final Bitmap bild;
    private final Drawable marke;
    private final Paint pinsel = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
    private final Typeface zahl, label;
    private String puls = "–", status = "", statistik = "";
    private boolean live = false;

    public PulsAnsicht(Context ctx) {
        super(ctx);
        bild = BitmapFactory.decodeResource(getResources(), R.drawable.bg_lauf);
        marke = ctx.getDrawable(R.drawable.bloc_marke);
        setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        zahl = Typeface.create(Typeface.DEFAULT, 800, false);
        label = Typeface.create(Typeface.DEFAULT, 600, false);
    }

    public void setze(String puls, String status, boolean live, String statistik) {
        this.puls = puls; this.status = status; this.live = live; this.statistik = statistik;
        invalidate();
    }

    @Override
    protected void onDraw(Canvas c) {
        float s = Math.min(getWidth(), getHeight()) / 192f;   // 1 dp der Vorlage in Pixeln
        c.drawColor(Color.BLACK);
        if (bild != null) c.drawBitmap(bild, null, new Rect(0, 0, getWidth(), getHeight()), pinsel);
        c.save();
        c.translate((getWidth() - 192 * s) / 2f, (getHeight() - 192 * s) / 2f);
        c.scale(s, s);

        // BLOC-Marke 20 dp hoch (y 10–30), Seitenverhältnis 358:393
        if (marke != null) {
            float b = 20f * 358f / 393f;
            marke.setBounds(Math.round(96 - b / 2), 10, Math.round(96 + b / 2), 30);
            marke.draw(c);
        }
        text(c, "PULS", 96, 42, 11, label, GEDIMMT, 0.08f);

        // Glas-Karte 130 x 84, y 50–134
        RectF karte = new RectF(31, 50, 161, 134);
        pinsel.setStyle(Paint.Style.FILL); pinsel.setColor(0x24FFFFFF);
        c.drawRoundRect(karte, 16, 16, pinsel);
        pinsel.setStyle(Paint.Style.STROKE); pinsel.setStrokeWidth(1); pinsel.setColor(0x38FFFFFF);
        c.drawRoundRect(karte, 16, 16, pinsel);
        pinsel.setStyle(Paint.Style.FILL);

        text(c, puls, 96, 106, 52, zahl, WEISS, 0);
        text(c, "bpm", 96, 124, 12, label, GEDIMMT, 0);
        text(c, status, 96, 154, 12, label, live ? GRUEN : GEDIMMT, 0);
        text(c, statistik, 96, 171, 11, label, GEDIMMT, 0);
        c.restore();
    }

    /** Text mittig an x, Grundlinie y */
    private void text(Canvas c, String t, float x, float y, float groesse, Typeface schrift, int farbe, float abstand) {
        if (t == null || t.isEmpty()) return;
        pinsel.setTypeface(schrift);
        pinsel.setTextSize(groesse);
        pinsel.setColor(farbe);
        pinsel.setLetterSpacing(abstand);
        pinsel.setFontFeatureSettings("tnum");
        pinsel.setTextAlign(Paint.Align.CENTER);
        c.drawText(t, x, y, pinsel);
    }
}
