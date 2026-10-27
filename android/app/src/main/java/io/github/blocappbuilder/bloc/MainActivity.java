package io.github.blocappbuilder.bloc;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Schriftgröße wie in der Web-App: der WebView folgt sonst der Schriftgröße des Systems und macht alle Texte größer
        getBridge().getWebView().getSettings().setTextZoom(100);
    }
}
