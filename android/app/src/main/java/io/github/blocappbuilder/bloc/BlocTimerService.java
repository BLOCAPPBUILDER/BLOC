package io.github.blocappbuilder.bloc;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.SoundPool;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.SystemClock;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.core.app.NotificationCompat;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * Timer im Hintergrund: Vordergrund-Dienst mit Medien-Anzeige (wie bei Musik-Apps: Workout-Name, Phase, Fortschrittsbalken, Pause-Knopf).
 * Solange die App nicht sichtbar ist, spielt der Dienst die Signaltöne selbst (die Klänge rendert die Web-Seite vorab als WAV, siehe klaenge());
 * Musik anderer Apps läuft weiter (kein Audio-Fokus, SoundPool mischt sich dazu). Ein Teil-Wecker (PARTIAL_WAKE_LOCK) hält die CPU wach,
 * damit die Töne auch bei ausgeschaltetem Bildschirm pünktlich kommen - nur solange ein Timer läuft. Es wird nichts gespeichert oder übertragen.
 */
public class BlocTimerService extends Service {
    static final String KANAL = "bloc_timer_medien";
    static final int NR = 4711;
    static final String X_TITEL = "titel", X_NAMEN = "namen", X_ENDEN = "enden", X_DAUERN = "dauern", X_PAUSE = "pause", X_FERTIG = "fertig",
        X_TON = "ton", X_CUE_AT = "cueAt", X_CUE_ART = "cueArt", X_KLANG = "klang", X_LAUT = "laut",
        X_TXT_PAUSE = "txtPause", X_TXT_WEITER = "txtWeiter";
    static final String AKTION_PAUSE = "io.github.blocappbuilder.bloc.TIMER_PAUSE", AKTION_WEITER = "io.github.blocappbuilder.bloc.TIMER_WEITER";

    private final Handler handler = new Handler(Looper.getMainLooper());
    private String titel = "BLOC", fertig = "", klang = "", txtPause = "Pause", txtWeiter = "Weiter";
    private String[] namen = new String[0];
    private long[] enden = new long[0], dauern = new long[0];
    private boolean pause = false, ton = false;
    private long[] cueAt = new long[0];
    private String[] cueArt = new String[0];
    private float laut = 1f;
    private final Runnable weiter = this::anzeigen;
    private final Runnable tonTakt = this::toeneSpielen;
    private int naechsterCue = 0;

    private MediaSessionCompat sitzung;
    private SoundPool pool;
    private final Map<String, Integer> klaenge = new HashMap<>();
    private String geladenerKlang = "";
    private PowerManager.WakeLock wach;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        sitzung = new MediaSessionCompat(this, "BLOC-Timer");
        sitzung.setCallback(new MediaSessionCompat.Callback() {
            @Override public void onPause() { BlocTimerPlugin.aktionMelden("pause"); }
            @Override public void onPlay() { BlocTimerPlugin.aktionMelden("weiter"); }
        });
        sitzung.setActive(true);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && (AKTION_PAUSE.equals(intent.getAction()) || AKTION_WEITER.equals(intent.getAction()))) {
            BlocTimerPlugin.aktionMelden(AKTION_PAUSE.equals(intent.getAction()) ? "pause" : "weiter");
            vordergrund();
            return START_NOT_STICKY;
        }
        if (intent != null) {
            String t = intent.getStringExtra(X_TITEL);
            titel = t != null && !t.isEmpty() ? t : "BLOC";
            String[] n = intent.getStringArrayExtra(X_NAMEN);
            namen = n != null ? n : new String[0];
            long[] e = intent.getLongArrayExtra(X_ENDEN);
            enden = e != null && e.length == namen.length ? e : new long[namen.length];
            long[] d = intent.getLongArrayExtra(X_DAUERN);
            dauern = d != null && d.length == namen.length ? d : new long[namen.length];
            pause = intent.getBooleanExtra(X_PAUSE, false);
            String f = intent.getStringExtra(X_FERTIG);
            fertig = f != null ? f : "";
            ton = intent.getBooleanExtra(X_TON, false);
            long[] ca = intent.getLongArrayExtra(X_CUE_AT);
            String[] cr = intent.getStringArrayExtra(X_CUE_ART);
            cueAt = ca != null ? ca : new long[0];
            cueArt = cr != null && cr.length == cueAt.length ? cr : new String[cueAt.length];
            String k = intent.getStringExtra(X_KLANG);
            klang = k != null ? k : "";
            laut = intent.getFloatExtra(X_LAUT, 1f);
            String tp = intent.getStringExtra(X_TXT_PAUSE); if (tp != null) txtPause = tp;
            String tw = intent.getStringExtra(X_TXT_WEITER); if (tw != null) txtWeiter = tw;
        }
        vordergrund();
        planen();
        toenePlanen();
        wachHalten(!pause);
        return START_NOT_STICKY;   // wird die App beendet, soll kein Timer von selbst wieder auftauchen
    }

    private void vordergrund() {
        kanal();
        Notification n = bauen();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) startForeground(NR, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(NR, n);
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) { stopSelf(); }   // App aus den letzten Apps weggewischt: Timer und Anzeige weg

    @Override
    public void onDestroy() {
        handler.removeCallbacks(weiter);
        handler.removeCallbacks(tonTakt);
        wachHalten(false);
        if (sitzung != null) { sitzung.setActive(false); sitzung.release(); sitzung = null; }
        if (pool != null) { pool.release(); pool = null; }
        super.onDestroy();
    }

    /** aktueller Schritt: der erste, dessen Ende noch nicht erreicht ist (-1: alle vorbei) */
    private int aktuell() {
        long jetzt = System.currentTimeMillis();
        for (int i = 0; i < enden.length; i++) if (enden[i] > jetzt) return i;
        return -1;
    }

    private void anzeigen() {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NR, bauen());
        planen();
    }

    private void planen() {
        handler.removeCallbacks(weiter);
        if (pause) return;
        int i = aktuell();
        if (i < 0) { wachHalten(false); return; }
        handler.postDelayed(weiter, Math.max(50, enden[i] - System.currentTimeMillis() + 30));
    }

    /* ---------- Medien-Sitzung: Titel, Phase, Fortschritt der Phase, Pause/Weiter ---------- */
    private void sitzungAktualisieren(String text, long dauerMs, long vergangenMs, boolean laeuft) {
        if (sitzung == null) return;
        MediaMetadataCompat.Builder m = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, text)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, titel)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, "BLOC");
        if (dauerMs > 0) m.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, dauerMs);
        sitzung.setMetadata(m.build());
        PlaybackStateCompat.Builder s = new PlaybackStateCompat.Builder()
            .setActions(PlaybackStateCompat.ACTION_PAUSE | PlaybackStateCompat.ACTION_PLAY | PlaybackStateCompat.ACTION_PLAY_PAUSE)
            .setState(laueftZustand(laeuft), Math.max(0, vergangenMs), laeuft ? 1f : 0f, SystemClock.elapsedRealtime());
        sitzung.setPlaybackState(s.build());
    }

    private static int laueftZustand(boolean laeuft) { return laeuft ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED; }

    private Notification bauen() {
        Intent oeffnen = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (oeffnen == null) oeffnen = new Intent(this, MainActivity.class);
        oeffnen.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        PendingIntent pi = PendingIntent.getActivity(this, 0, oeffnen, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        int i = aktuell();
        String text;
        boolean laeuft = !pause && i >= 0;
        if (pause) {
            text = namen.length > 0 ? namen[0] : "";   // die Seite schickt den fertigen Text („Los! · Timer pausiert · 0:29“)
            sitzungAktualisieren(text, 0, 0, false);
        } else if (i >= 0) {
            text = namen[i];
            long dauer = dauern[i] > 0 ? dauern[i] : 0;
            sitzungAktualisieren(text, dauer, dauer > 0 ? dauer - (enden[i] - System.currentTimeMillis()) : 0, true);
        } else {
            text = fertig;
            sitzungAktualisieren(text, 0, 0, false);
        }

        Intent ip = new Intent(this, BlocTimerService.class).setAction(laeuft ? AKTION_PAUSE : AKTION_WEITER);
        PendingIntent pa = PendingIntent.getService(this, 1, ip, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(this, KANAL)
            .setSmallIcon(R.drawable.ic_stat_bloc)
            .setContentTitle(titel)
            .setContentText(text)
            .setContentIntent(pi)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setColor(0xFFF2643C)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE);
        if (i >= 0 || pause) {
            b.addAction(new NotificationCompat.Action(laeuft ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play, laeuft ? txtPause : txtWeiter, pa));
        }
        if (laeuft) {
            b.setWhen(enden[i]).setShowWhen(true).setUsesChronometer(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) b.setChronometerCountDown(true);
        }
        androidx.media.app.NotificationCompat.MediaStyle stil = new androidx.media.app.NotificationCompat.MediaStyle()
            .setMediaSession(sitzung != null ? sitzung.getSessionToken() : null);
        if (i >= 0 || pause) stil.setShowActionsInCompactView(0);
        b.setStyle(stil);
        return b.build();
    }

    private void kanal() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null || nm.getNotificationChannel(KANAL) != null) return;
        NotificationChannel k = new NotificationChannel(KANAL, "Timer", NotificationManager.IMPORTANCE_LOW);   // leise: die Töne kommen aus dem Timer selbst
        k.setDescription("Zeigt den laufenden Timer an, wenn BLOC im Hintergrund ist");
        k.setShowBadge(false);
        k.setSound(null, null);
        k.enableVibration(false);
        nm.createNotificationChannel(k);
    }

    /* ---------- Töne im Hintergrund ---------- */
    private void klaengeLaden() {
        if (klang.isEmpty() || klang.equals(geladenerKlang)) return;
        if (pool == null) {
            AudioAttributes aa = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)   // Lautstärke wie Medien, ohne Audio-Fokus: Musik läuft weiter
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
            pool = new SoundPool.Builder().setMaxStreams(6).setAudioAttributes(aa).build();
        }
        klaenge.clear();
        File ordner = new File(getCacheDir(), "bloc-klang");
        File[] dateien = ordner.listFiles();
        if (dateien != null) for (File f : dateien) {
            String name = f.getName();
            if (name.startsWith(klang + "-") && name.endsWith(".wav")) {
                String art = name.substring(klang.length() + 1, name.length() - 4);
                klaenge.put(art, pool.load(f.getAbsolutePath(), 1));
            }
        }
        geladenerKlang = klang;
    }

    private void toenePlanen() {
        handler.removeCallbacks(tonTakt);
        if (!ton || pause || cueAt.length == 0) return;
        klaengeLaden();
        long jetzt = System.currentTimeMillis();
        naechsterCue = 0;
        while (naechsterCue < cueAt.length && cueAt[naechsterCue] < jetzt - 150) naechsterCue++;
        if (naechsterCue < cueAt.length) handler.postDelayed(tonTakt, Math.max(0, cueAt[naechsterCue] - jetzt));
    }

    private void toeneSpielen() {
        long jetzt = System.currentTimeMillis();
        while (naechsterCue < cueAt.length && cueAt[naechsterCue] <= jetzt + 15) {
            Integer id = klaenge.get(cueArt[naechsterCue]);
            if (id != null && pool != null && cueAt[naechsterCue] > jetzt - 1500) pool.play(id, laut, laut, 1, 0, 1f);
            naechsterCue++;
        }
        if (ton && !pause && naechsterCue < cueAt.length) handler.postDelayed(tonTakt, Math.max(0, cueAt[naechsterCue] - System.currentTimeMillis()));
    }

    private void wachHalten(boolean an) {
        try {
            if (an) {
                if (wach == null) {
                    PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                    if (pm == null) return;
                    wach = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "BLOC:Timer");
                    wach.setReferenceCounted(false);
                }
                if (!wach.isHeld()) wach.acquire(4 * 60 * 60 * 1000L);   // höchstens 4 Stunden
            } else if (wach != null && wach.isHeld()) {
                wach.release();
            }
        } catch (Exception ignored) { }
    }
}
