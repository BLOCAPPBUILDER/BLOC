package io.github.blocappbuilder.bloc;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BlocDateiPlugin.class);   // vor super.onCreate: BLOC-Dateien von außen (.bloc antippen)
        super.onCreate(savedInstanceState);
        // Schriftgröße wie in der Web-App: der WebView folgt sonst der Schriftgröße des Systems und macht alle Texte größer
        getBridge().getWebView().getSettings().setTextZoom(100);
        BlocDateiPlugin.aufnehmen(this, getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        BlocDateiPlugin.aufnehmen(this, intent);   // App läuft schon: neue .bloc-Datei angetippt
    }
}
