package io.github.blocappbuilder.bloc;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BlocDateiPlugin.class);   // vor super.onCreate: BLOC-Dateien von außen (.bloc antippen)
        registerPlugin(BlocTimerPlugin.class);   // Timer-Anzeige in der Benachrichtigungsleiste, hält den Timer im Hintergrund am Laufen
        super.onCreate(savedInstanceState);
        // Schriftgröße wie in der Web-App: der WebView folgt sonst der Schriftgröße des Systems und macht alle Texte größer
        WebView wv = getBridge().getWebView();
        wv.getSettings().setTextZoom(100);
        // Auch unsichtbar (andere App, Bildschirm aus) behält die Seite ihre Priorität: Timer-Töne und Ansagen laufen weiter
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) wv.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
        BlocDateiPlugin.aufnehmen(this, getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        BlocDateiPlugin.aufnehmen(this, intent);   // App läuft schon: neue .bloc-Datei angetippt
    }
}
