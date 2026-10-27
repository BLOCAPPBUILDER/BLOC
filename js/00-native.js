/* ============ Native App (Capacitor, Android) ============
   Brücke zu Gerätefunktionen. Im Browser (Web-App) bleibt alles wie es war: jede Funktion hier fällt dann auf die Web-Variante zurück.
   Die Plugins werden ohne Bündler über Capacitor.registerPlugin(Name) angesprochen (Namen wie in den npm-Paketen):
   Filesystem + Share (Dateien ausgeben), KeepAwake (Display an), BackgroundGeolocation (GPS auch bei gesperrtem Bildschirm), LocalNotifications (nur die Erlaubnis für die Hinweis-Anzeige).
   Alles lokal - es wird nichts übertragen. Bauen und Testen: README, Abschnitt „Android-App“. */
var IST_NATIV = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
var nativPlugins = {};
function nativPlugin(name){
  if(!IST_NATIV) return null;
  if(!nativPlugins[name]){
    try{ nativPlugins[name] = typeof window.Capacitor.registerPlugin === "function" ? window.Capacitor.registerPlugin(name) : (window.Capacitor.Plugins && window.Capacitor.Plugins[name]) || null; }
    catch(e){ nativPlugins[name] = null; }
    if(!nativPlugins[name]) console.error("BLOC: Plugin " + name + " nicht verfügbar (capacitor.js geladen? npm run sync gelaufen?)");
  }
  return nativPlugins[name];
}
/* Version der App-Fassung (in der Web-App kommt sie vom Service Worker, hier aus dem ?v= an diesem Skript) */
var NATIV_FASSUNG = (function(){
  var s = document.currentScript, m = s && /[?&]v=([^&]+)/.exec(s.getAttribute("src") || "");
  return m ? m[1] : "";
})();
/* „Abbrechen“ im Teilen-Menü ist kein Fehler */
function nativAbbruch(e){ return !!(e && /cancel|abort/i.test((e.name || "") + " " + (e.message || e))); }

/* Datei ausgeben: in der App Teilen-Menü (Drive, Dateien, Mail …), im Browser der übliche Download */
function dateiAusgeben(name, text, mime){
  if(!IST_NATIV){
    var blob = new Blob([text], { type:mime }), url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
    return Promise.resolve();
  }
  var fs = nativPlugin("Filesystem"), sh = nativPlugin("Share");
  if(!fs || !sh) return Promise.reject(new Error("Dateien nicht verfügbar"));
  return fs.writeFile({ path:name, data:text, directory:"CACHE", encoding:"utf8" }).then(function(res){
    return sh.share({ title:name, dialogTitle:name, files:[res.uri] });
  });
}

/* navigator.share gibt es im Android-WebView nicht: einfache Texte und Links gehen über das Teilen-Menü der App */
if(IST_NATIV && !navigator.share){
  navigator.share = function(d){
    var sh = nativPlugin("Share");
    if(!sh) return Promise.reject(new Error("Teilen nicht verfügbar"));
    return sh.share({ title:d.title, text:d.text, url:d.url }).catch(function(e){
      if(nativAbbruch(e)){ var a = new Error("Abgebrochen"); a.name = "AbortError"; throw a; }
      throw e;
    });
  };
}

/* Display an (Timer und Lauf): jede Seite meldet sich mit ihrem Namen an und ab, das Display darf erst schlafen, wenn keine mehr wach hält. Liefert true, wenn die App das übernommen hat */
var nativWacher = {};
function nativWach(wer, an){
  var ka = nativPlugin("KeepAwake");
  if(!ka) return false;
  if(an) nativWacher[wer] = true; else delete nativWacher[wer];
  try{ (Object.keys(nativWacher).length ? ka.keepAwake() : ka.allowSleep()).catch(function(){}); }catch(e){}
  return true;
}

/* GPS: in der App läuft ein Vordergrund-Dienst (Hinweis in der Statusleiste), damit die Strecke auch bei gesperrtem Bildschirm weiterzählt.
   Rückgabe von gpsWatch ist ein Griff für gpsClear. Der Rückruf bekommt dieselbe Form wie bei navigator.geolocation (pos.coords, pos.timestamp). */
var nativBenachrichtigung = false;
function gpsVorhanden(){ return IST_NATIV ? !!nativPlugin("BackgroundGeolocation") : !!navigator.geolocation; }
function gpsWatch(onPos, onFehler){
  if(!IST_NATIV) return { web:navigator.geolocation.watchPosition(onPos, onFehler, { enableHighAccuracy:true, maximumAge:1000, timeout:20000 }) };
  var bg = nativPlugin("BackgroundGeolocation"), h = { nat:true, id:null, weg:false };
  function starten(){
    bg.addWatcher({ backgroundTitle:t("runBgTitel"), backgroundMessage:t("runBgText"), requestPermissions:true, stale:false, distanceFilter:0 }, function(loc, err){
      if(err){ onFehler({ code:err.code === "NOT_AUTHORIZED" ? 1 : 2, message:err.message }); return; }
      if(!loc) return;
      onPos({ coords:{ latitude:loc.latitude, longitude:loc.longitude, accuracy:loc.accuracy, speed:loc.speed, altitude:loc.altitude }, timestamp:loc.time || Date.now() });
    }).then(function(id){
      h.id = id;
      if(h.weg) bg.removeWatcher({ id:id }).catch(function(){});
    }).catch(function(e){ onFehler({ code:2, message:e && e.message }); });
  }
  /* Android 13+: der Dienst braucht die Erlaubnis für Hinweise (einmal fragen) */
  var ln = !nativBenachrichtigung && nativPlugin("LocalNotifications");
  if(ln){ nativBenachrichtigung = true; ln.requestPermissions().then(starten, starten); } else starten();
  return h;
}
function gpsClear(h){
  if(!h) return;
  if(!h.nat){ try{ navigator.geolocation.clearWatch(h.web); }catch(e){} return; }
  h.weg = true;
  if(h.id != null){ var bg = nativPlugin("BackgroundGeolocation"); if(bg) bg.removeWatcher({ id:h.id }).catch(function(){}); }
}
