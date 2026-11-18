package io.github.blocappbuilder.bloc;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

import androidx.core.app.NotificationCompat;

/**
 * Timer im Hintergrund: Vordergrund-Dienst mit laufender Anzeige („BLOC · Arbeit · 0:29“) in der Benachrichtigungsleiste.
 * Solange er läuft, friert Android die App nicht ein - die im Audio-Takt vorgeplanten Signaltöne klingen weiter,
 * auch wenn man in eine andere App wechselt oder den Bildschirm sperrt. Musik anderer Apps läuft dabei weiter.
 * Die Web-Seite schickt die kommenden Schritte (Name + Ende als Wanduhr-Zeit); der Dienst schaltet die Anzeige
 * selbst zum nächsten Schritt weiter. Es wird nichts gespeichert oder übertragen.
 */
public class BlocTimerService extends Service {
    static final String KANAL = "bloc_timer";
    static final int NR = 4711;
    static final String X_TITEL = "titel", X_NAMEN = "namen", X_ENDEN = "enden", X_PAUSE = "pause", X_FERTIG = "fertig";

    private final Handler handler = new Handler(Looper.getMainLooper());
    private String titel = "BLOC";
    private String[] namen = new String[0];
    private long[] enden = new long[0];
    private boolean pause = false;
    private String fertig = "";
    private final Runnable weiter = this::anzeigen;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String t = intent.getStringExtra(X_TITEL);
            titel = t != null && !t.isEmpty() ? t : "BLOC";
            String[] n = intent.getStringArrayExtra(X_NAMEN);
            long[] e = intent.getLongArrayExtra(X_ENDEN);
            namen = n != null ? n : new String[0];
            enden = e != null && e.length == namen.length ? e : new long[namen.length];
            pause = intent.getBooleanExtra(X_PAUSE, false);
            String f = intent.getStringExtra(X_FERTIG);
            fertig = f != null ? f : "";
        }
        kanal();
        Notification n = bauen();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NR, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NR, n);
        }
        planen();
        return START_NOT_STICKY;   // wird die App beendet, soll kein Timer von selbst wieder auftauchen
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {   // App aus den letzten Apps weggewischt: Timer und Anzeige weg
        stopSelf();
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(weiter);
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
        if (i < 0) return;
        handler.postDelayed(weiter, Math.max(50, enden[i] - System.currentTimeMillis() + 30));
    }

    private Notification bauen() {
        Intent oeffnen = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (oeffnen == null) oeffnen = new Intent(this, MainActivity.class);
        oeffnen.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        PendingIntent pi = PendingIntent.getActivity(this, 0, oeffnen, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(this, KANAL)
            .setSmallIcon(R.drawable.ic_stat_bloc)
            .setContentTitle(titel)
            .setContentIntent(pi)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setColor(0xFFF2643C)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE);
        int i = aktuell();
        if (pause) {
            b.setContentText(namen.length > 0 ? namen[0] : "");   // die Seite schickt den fertigen Text („Arbeit · Pausiert · 0:29“)
        } else if (i >= 0) {
            b.setContentText(namen[i]);
            b.setWhen(enden[i]).setShowWhen(true).setUsesChronometer(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) b.setChronometerCountDown(true);
        } else {
            b.setContentText(fertig);
        }
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
}
