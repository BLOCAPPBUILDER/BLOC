"use strict";
/* ============ Lauf-Tracker ============
   GPS-Lauf mit Zeit, Kilometern, Pace, Kilometer-Zwischenzeiten und Routenlinie. Bewusst ohne Hintergrundkarte:
   Die Position wird nur auf dem Gerät verarbeitet, nichts geht ins Internet. Der Bildschirm bleibt an (Wake Lock);
   im Hintergrund oder bei gesperrtem Handy zeichnet eine Web-App nicht zuverlässig auf - dafür gibt es „Abdunkeln“.
   Gespeichert: settings.runs = [{ id, at, dur (ms, ohne Pausen), dist (m), pts:[[lat,lon]…], splits:[ms bis km 1, 2, …], art:"rad" (nur bei Radfahrten) }].
   Ein laufender Lauf wird alle 10 s als settings.runLive gesichert (falls die Seite beendet wird). */
var RUN_GENAU = 35;   // Fixes mit schlechterer Genauigkeit (m) werden ignoriert
var RUN_MAX_MS = 12;  // schneller als 12 m/s (43 km/h) gilt als GPS-Sprung
var RUN_MAX_RAD = 25; // auf dem Rad erst ab 25 m/s (90 km/h)
var run = null;       // laufende Aufzeichnung
var runWake = null;
function runMeter(a, b){   // Haversine
  var R = 6371000, r = Math.PI/180, dLat = (b[0]-a[0])*r, dLon = (b[1]-a[1])*r;
  var h = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return 2*R*Math.asin(Math.min(1, Math.sqrt(h)));
}
function runPace(sek, m){   // „5:32“ min/km
  if(!m || m < 20 || !sek) return "–:––";
  var p = sek/(m/1000), min = Math.floor(p/60), s = Math.round(p%60);
  if(s === 60){ min++; s = 0; }
  return min > 59 ? "–:––" : min+":"+(s < 10 ? "0" : "")+s;
}
/* Einstellungen: Auto-Pause (settings.runAuto = Sekunden Stillstand, 0 = aus) und Intervall (settings.runIv = { an, lauf, geh } in Sekunden) */
function runAutoSek(){ return 5; }   // Auto-Pause ist fest auf 5 s gestellt (keine Einstellung mehr)
function runIvEinst(){
  var a = state.db.settings.runIv || {};
  return { an:!!a.an, lauf:clamp(Math.round(+a.lauf) || 60, 10, 900), geh:clamp(Math.round(+a.geh) || 60, 10, 900) };
}
function runKm(m){ return (m/1000).toFixed(2).replace(".", currentLang() === "en" ? "." : ","); }
/* Art der Aufzeichnung: „lauf“ (zu Fuß, Pace in min/km) oder „rad“ (Tempo in km/h). Die letzte Wahl merkt settings.runArt; gespeichert wird art:"rad" nur bei Fahrten */
function runArt(){ return state.db.settings.runArt === "rad" ? "rad" : "lauf"; }
function runIstRad(x){ return !!x && x.art === "rad"; }
function runKmh(sek, m){   // „24,5“ km/h
  if(!m || m < 20 || !sek) return "–,–";
  var v = (m/1000)/(sek/3600);
  return v > 99.9 ? "–,–" : v.toFixed(1).replace(".", currentLang() === "en" ? "." : ",");
}
/* Tempo-Wert und Einheit je nach Art: Lauf „5:32“ + „/km“, Rad „24,5“ + „km/h“ */
function runTempo(x, sek, m){ return runIstRad(x) ? runKmh(sek, m) : runPace(sek, m); }
function runTempoEinheit(x){ return runIstRad(x) ? "km/h" : "/km"; }
function runZeit(r){ return (r.pauseAb || Date.now()) - r.start - r.pausenMs; }
function runWachen(an){
  if(!an){ if(runWake){ try{ runWake.release(); }catch(e){} runWake = null; } return; }
  if(!("wakeLock" in navigator)) return;
  navigator.wakeLock.request("screen").then(function(wl){ runWake = wl; }).catch(function(){});
}
document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "visible" && run){ if(!run.pauseAb) runWachen(true); runAnzeige(); } });   // nach dem Entsperren sofort nachziehen (Zeit, Strecke, Karte)

/* Ein GPS-Punkt: filtert Ungenaues, Stillstand-Rauschen und Sprünge, zählt Strecke und Kilometer-Zwischenzeiten */
function runPunkt(lat, lon, acc, ts, speed){
  var r = run;
  if(!r) return;
  r.fixAm = Date.now();   // letzter Standort: Auto-Pause braucht frische Punkte (siehe runAutoPruefen)
  if(r.pauseAb){
    if(r.auto){ r.gps = acc; r.fehler = 0; runAutoWeiter(lat, lon, acc, speed); }
    return;
  }
  r.gps = acc; r.fehler = 0; r.n++; r.sumAcc += acc;
  if(acc > RUN_GENAU) return;
  if(speed != null && speed >= 1) r.lastMove = Date.now();   // das Gerät meldet selbst Bewegung
  var p = [Math.round(lat*1e5)/1e5, Math.round(lon*1e5)/1e5];
  if(!r.letzte){ r.letzte = { p:p, ts:ts }; if(!r.pts.length) r.pts.push(p); return; }
  var dt = (ts - r.letzte.ts)/1000;
  if(dt <= 0) return;
  var d = runMeter(r.letzte.p, p);
  if(d < Math.max(3, acc*0.5)) return;   // Rauschen im Stand
  if(d/dt > (r.art === "rad" ? RUN_MAX_RAD : RUN_MAX_MS)) return;           // Sprung
  var vor = r.dist, nun = runZeit(r);
  if(speed == null || speed >= 0.5) r.lastMove = Date.now();   // Zittern im Stand (Tempo ~0) zählt nicht als Bewegung
  r.dist += d; r.letzte = { p:p, ts:ts };
  while(Math.floor(r.dist/1000) > r.splits.length){   // Kilometer-Marke überschritten: Zeit anteilig berechnen
    var k = r.splits.length + 1, anteil = (k*1000 - vor)/(r.dist - vor);
    r.splits.push(Math.round(r.tZ + anteil*(nun - r.tZ)));
    runAnsage(k);
  }
  r.tZ = nun;
  if(!r.pts.length || runMeter(r.pts[r.pts.length-1], p) >= 5) r.pts.push(p);
  r.verlauf.push({ t:nun, d:r.dist });
  while(r.verlauf.length > 2 && nun - r.verlauf[1].t > 60000) r.verlauf.shift();   // nur die letzte Minute für „Tempo jetzt“
}
/* Auto-Pause: steht man länger als die eingestellte Zeit (Strecke wächst nicht, Gerät meldet kaum Tempo), pausiert der Lauf.
   Die Stehzeit wird herausgerechnet (die Pause beginnt beim letzten Schritt, nicht erst bei der Erkennung). Weiter geht es von selbst,
   sobald man sich ≥ 10 m vom Pausenort entfernt oder das Gerät ≥ 1,5 m/s meldet. GPS zittert im Stand, daher mindestens 5 s. */
function runAutoPruefen(){
  var r = run, sek = runAutoSek();
  if(!r || !sek || r.pauseAb || !r.letzte || r.fehler) return;
  if(Date.now() - r.lastMove < sek*1000) return;
  if(Date.now() - (r.fixAm || 0) > 3000) return;   // kaum Standorte (Bildschirm dunkel, Sparmodus, schwaches Signal) heißt nicht „steht still“: dann nicht pausieren
  r.pauseAb = r.lastMove; r.auto = true; r.pausePos = r.letzte.p;
  vibrate(120);
  runAnzeige();
}
function runAutoWeiter(lat, lon, acc, speed){
  var r = run;
  if(acc > RUN_GENAU) return;
  var weg = r.pausePos ? runMeter(r.pausePos, [lat, lon]) : 0;
  if(weg < Math.max(8, acc) && !(speed != null && speed >= 1.2)) return;
  r.pausenMs += Date.now() - r.pauseAb; r.pauseAb = 0; r.auto = false; r.letzte = null; r.lastMove = Date.now();
  vibrate(120);
  runAnzeige();
}
/* Intervall-Lauf: Laufen und Gehen im Wechsel nach der Laufzeit (ohne Pausen); Signalton, Vibration und Ansage beim Wechsel, Tick in den letzten 3 s */
function runIvTick(){
  var r = run, iv = r && r.iv;
  if(!iv || r.pauseAb) return;
  var sek = runZeit(r)/1000, zyk = iv.lauf + iv.geh, pos = sek % zyk, lauf = pos < iv.lauf;
  var rest = Math.ceil((lauf ? iv.lauf : zyk) - pos), runde = Math.floor(sek/zyk) + 1, ph = (lauf ? "l" : "g") + runde;
  if(r.ivPhase !== ph){
    var erst = r.ivPhase == null;
    r.ivPhase = ph; r.ivTick = null;
    if(!erst){
      try{ phaseBeep(lauf ? "work" : "rest"); }catch(e){}
      vibrate(lauf ? [150, 80, 150] : 250);
      if(runAnsageEinst().every && !r.stumm) runSag(t(lauf ? "runSagLauf" : "runSagGeh"));
    }
  } else if(rest <= 3 && r.ivTick !== rest){ r.ivTick = rest; try{ phaseBeep("tick"); }catch(e){} }
  var el = document.getElementById("run-iv");
  if(el){
    var txt = t(lauf ? "runIvLauf" : "runIvGeh")+" · "+fmtUhr(rest*1000)+" · "+t("runIvRunde", { n:runde });
    if(el.textContent !== txt) el.textContent = txt;
    el.className = "run-iv "+(lauf ? "lauf" : "geh");
  }
}
/* Ansagen alle N Kilometer (settings.runAnsage = { every:0|1|2|3|5, was:"km"|"pace"|"alles" }); 0 = aus.
   Gesprochen wird in der App-Sprache. „Pace“ ist die der letzten N Kilometer, „alles“ nimmt Gesamtzeit und Ø-Pace dazu. */
function runAnsageEinst(){
  var a = state.db.settings.runAnsage || {};
  return { every:(+a.every >= 0 && +a.every <= 10 && +a.every === Math.floor(+a.every)) ? +a.every : 1, was:["km", "pace", "alles"].indexOf(a.was) > -1 ? a.was : "pace" };
}
function runSag(text, sprache){
  try{
    if(!window.speechSynthesis) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text), de = (sprache || currentLang()) !== "en";
    u.lang = de ? "de-DE" : "en-GB"; u.rate = 1; u.volume = 1;
    var voices = speechSynthesis.getVoices() || [];
    var v = voices.filter(function(x){ return x.lang && x.lang.toLowerCase().indexOf(de ? "de" : "en") === 0 && x.localService; })[0] ||
            voices.filter(function(x){ return x.lang && x.lang.toLowerCase().indexOf(de ? "de" : "en") === 0; })[0];
    if(v) u.voice = v;
    speechSynthesis.speak(u);
  }catch(e){}
}
function runSprechPace(sek, m, de){   // „6 Minuten 7 Sekunden“
  var p = Math.round(sek/(m/1000)), min = Math.floor(p/60), s = p%60;
  return de ? min+" Minuten"+(s ? " "+s+" Sekunden" : "") : min+" minutes"+(s ? " "+s+" seconds" : "");
}
function runSprechZeit(ms, de){
  var s = Math.round(ms/1000), h = Math.floor(s/3600), m = Math.floor(s%3600/60), x = s%60, out = [];
  if(de){ if(h) out.push(h+" Stunden"); if(m) out.push(m+" Minuten"); if(x && !h) out.push(x+" Sekunden"); }
  else { if(h) out.push(h+" hours"); if(m) out.push(m+" minutes"); if(x && !h) out.push(x+" seconds"); }
  return out.join(" ");
}
function runSprechKmh(ms, m, de){   // „24,5 Kilometer pro Stunde“
  var v = (m/1000)/(ms/3600000), z = v.toFixed(1).replace(".", de ? "," : ".");
  return de ? z+" Kilometer pro Stunde" : z+" kilometres per hour";
}
function runAnsageText(k, splits, e, de, rad){
  var seg = splits[k-1] - (k - e.every > 0 ? splits[k-e.every-1] : 0);
  var txt = de ? k+(k === 1 ? " Kilometer." : " Kilometer.") : k+(k === 1 ? " kilometre." : " kilometres.");
  if(e.was !== "km") txt += rad ? (de ? " Tempo " : " Speed ")+runSprechKmh(seg, e.every*1000, de)+"."
    : de ? " Pace "+runSprechPace(seg/1000, e.every*1000, true)+" pro Kilometer." : " Pace "+runSprechPace(seg/1000, e.every*1000, false)+" per kilometre.";
  if(e.was === "alles"){
    txt += de ? " Zeit "+runSprechZeit(splits[k-1], true)+"." : " Time "+runSprechZeit(splits[k-1], false)+".";
    if(k > e.every) txt += rad ? (de ? " Durchschnitt " : " Average ")+runSprechKmh(splits[k-1], k*1000, de)+"."
      : de ? " Durchschnitt "+runSprechPace(splits[k-1]/1000, k*1000, true)+"." : " Average "+runSprechPace(splits[k-1]/1000, k*1000, false)+".";
  }
  return txt;
}
/* Pace-Vorgabe (optional, aus „Eigener Lauf“): nach jedem Kilometer sagt die App, wie weit man vom Ziel liegt */
function runPaceHinweis(r, k){
  if(!r.ziel || !r.ziel.pace || r.art === "rad" || !r.splits[k-1]) return "";
  var de = currentLang() !== "en", seg = (r.splits[k-1] - (k > 1 ? r.splits[k-2] : 0))/1000, diff = Math.round(seg - r.ziel.pace), n = Math.abs(diff);
  if(n < 3) return de ? "Im Plan." : "On target.";
  if(diff > 0) return de ? n+" Sekunden zu langsam." : n+" seconds too slow.";
  return de ? n+" Sekunden schneller als geplant." : n+" seconds faster than planned.";
}
function runAnsage(k){
  var r = run, e = runAnsageEinst();
  if(!r || r.stumm) return;
  var extra = runPaceHinweis(r, k), regulaer = e.every && k % e.every === 0;
  if(!regulaer && !extra) return;
  var txt = regulaer ? runAnsageText(k, r.splits, e, currentLang() !== "en", r.art === "rad") : "";
  if(extra) txt += (txt ? " " : "") + extra;
  (r.gesagt || (r.gesagt = [])).push(txt);
  runSag(txt);
}
/* „Lauf starten“: erst ein Countdown (20 s, beliebig oft +10 s), damit man das Handy wegstecken kann und das GPS Zeit zum Finden hat.
   Während des Countdowns läuft nur die Suche nach dem Signal - Zeit und Strecke zählen erst ab „Los“. */
var RUN_VORLAUF = 20;
var runGeplant = null;   // aus dem Kalender: { name, km, t } - die Lauf-Seite zeigt es startklar, „Start“ übernimmt Name und Ziel
var runVor = null;   // { ende (ms), uhr, watch, gps, fehler, piep }
function runStart(){
  if(!navigator.geolocation){ showToast(t("runNoGps")); return; }
  if(runAnsageEinst().every && window.speechSynthesis){ try{ var u0 = new SpeechSynthesisUtterance(" "); u0.volume = 0; speechSynthesis.speak(u0); }catch(e){} }   // Sprache im Tipp freischalten (iOS)
  runVor = { ende:Date.now() + RUN_VORLAUF*1000, gps:null, fehler:0, piep:null };
  runVor.watch = navigator.geolocation.watchPosition(function(pos){ if(runVor){ runVor.gps = pos.coords.accuracy; runVor.fehler = 0; } },
    function(err){ if(runVor) runVor.fehler = err && err.code || 2; }, { enableHighAccuracy:true, maximumAge:1000, timeout:20000 });
  runWachen(true);
  runVor.uhr = setInterval(runVorTick, 250);
  renderRun();
}
function runVorStop(){
  if(!runVor) return;
  if(runVor.uhr) clearInterval(runVor.uhr);
  if(runVor.watch != null) try{ navigator.geolocation.clearWatch(runVor.watch); }catch(e){}
  runVor = null;
}
function runVorText(){
  var v = runVor;
  return v.fehler === 1 ? t("runGpsDenied") : v.fehler ? t("runGpsLost") : v.gps == null ? t("runGpsWait") : t(v.gps <= 15 ? "runGpsOk" : "runGpsWeak", { m:Math.round(v.gps) });
}
function runVorTick(){
  var v = runVor;
  if(!v) return;
  var rest = Math.ceil((v.ende - Date.now())/1000);
  if(rest <= 0) return runVorLos();
  var z = document.getElementById("run-vor"), g = document.getElementById("run-vor-gps");
  if(z && z.textContent !== String(rest)) z.textContent = rest;
  var dz = document.getElementById("run-dz"); if(dz && !run && dz.textContent !== String(rest)) dz.textContent = rest;
  if(g) g.textContent = runVorText();
  if(rest <= 3 && v.piep !== rest){ v.piep = rest; try{ phaseBeep("tick"); }catch(e){} }
}
function runVorLos(){
  runVorStop();
  try{ phaseBeep("work"); if(navigator.vibrate) navigator.vibrate(200); }catch(e){}
  if(runAnsageEinst().every) runSag(t("runLos"));
  runLosgehts();
}
function runLosgehts(){
  var art = runArt();
  run = { id:uid(), start:Date.now(), pauseAb:0, pausenMs:0, dist:0, pts:[], letzte:null, splits:[], tZ:0, verlauf:[], gps:null, fehler:0, stumm:false, gesagt:[], n:0, sumAcc:0,
    lastMove:Date.now(), auto:false, art:art, iv:art !== "rad" && runIvEinst().an ? runIvEinst() : null, ivPhase:null,
    ziel:runGeplant && Date.now() - runGeplant.t < 6*3600000 ? runGeplant : null };
  runGeplant = null;
  runLauschen();
  runWachen(true);
  run.uhr = setInterval(function(){ runAutoPruefen(); runAnzeige(); runSichern(); }, 1000);
  renderRun();
}
function runLauschen(){
  var r = run;
  r.watch = navigator.geolocation.watchPosition(function(pos){
    runPunkt(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, pos.timestamp || Date.now(), pos.coords.speed);
    runAnzeige();
  }, function(err){ r.fehler = err && err.code || 2; runAnzeige(); }, { enableHighAccuracy:true, maximumAge:1000, timeout:20000 });
}
function runStopWatch(){
  if(!run) return;
  if(run.watch != null) try{ navigator.geolocation.clearWatch(run.watch); }catch(e){}
  if(run.uhr) clearInterval(run.uhr);
  run.watch = null; run.uhr = 0;
}
function runPause(){
  if(!run) return;
  if(run.pauseAb){ run.pausenMs += Date.now() - run.pauseAb; run.pauseAb = 0; run.auto = false; run.letzte = null; run.lastMove = Date.now(); runWachen(true); }   // Lücke zählt nicht als Strecke
  else { run.pauseAb = Date.now(); run.auto = false; }
  renderRun();
}
var runSichernAm = 0;
function runSichern(){   // alle 10 s eine Kopie, damit ein beendeter Browser den Lauf nicht verschluckt
  var r = run;
  if(!r || Date.now() - runSichernAm < 10000) return;
  runSichernAm = Date.now();
  state.db.settings.runLive = { id:r.id, start:r.start, dur:runZeit(r), dist:r.dist, pts:r.pts, splits:r.splits, at:Date.now() };
  if(r.art === "rad") state.db.settings.runLive.art = "rad";
  save();
}
function runSpeichern(d){   // d: { id, start, dur, dist, pts, splits } -> in den Verlauf; zu kurze Läufe werden nicht behalten
  var s = state.db.settings;
  if(d.dist < 50){ showToast(t("runShort")); return false; }
  var x = { id:d.id, at:d.start, dur:Math.round(d.dur), dist:Math.round(d.dist), pts:d.pts, splits:d.splits };
  if(d.pause > 1000) x.pause = Math.round(d.pause);   // herausgerechnete Pausen/Stehzeit (ms)
  if(d.iv) x.iv = { lauf:d.iv.lauf, geh:d.iv.geh };
  if(d.name) x.name = d.name;
  if(d.art === "rad") x.art = "rad";
  (s.runs || (s.runs = [])).push(x);
  pruneHistory(state.db);
  state.db.history.push({ at:d.start, dur:Math.round(d.dur/1000), ex:[], b:"run" });   // zählt in der Wochenzeile
  save();
  showToast(t("runSaved"));
  return true;
}
function runBeenden(speichern){
  var r = run;
  if(!r) return;
  var dauer = runZeit(r), pausen = r.pausenMs + (r.pauseAb ? Date.now() - r.pauseAb : 0), iv = r.iv;
  runStopWatch(); runWachen(false);
  try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
  var dunkel = document.getElementById("run-dunkel"); if(dunkel) dunkel.remove();
  run = null;
  delete state.db.settings.runLive;
  var ok = speichern ? runSpeichern({ id:r.id, start:r.start, dur:dauer, dist:r.dist, pts:r.pts, splits:r.splits, pause:pausen, iv:iv, name:r.ziel && r.ziel.name, art:r.art }) : (save(), false);
  if(ok){ runNeu = r.id; go("#rundetail/"+r.id); } else renderRun();   // runNeu: Abschlusskarte oben im Detail
}
var runNeu = null;
function runBesterKm(r){   // schnellster einzelner Kilometer (ms) oder null
  var sp = r.splits || [], best = null;
  sp.forEach(function(ms, i){ var d = ms - (i ? sp[i-1] : 0); if(best === null || d < best) best = d; });
  return best;
}
/* Was bei diesem Lauf besonders war - im Vergleich zu den früheren Läufen */
function runHighlights(x){
  var rad = runIstRad(x);   // Läufe und Fahrten werden nur untereinander verglichen
  var others = (state.db.settings.runs || []).filter(function(o){ return o.id !== x.id && runIstRad(o) === rad; }), out = [];
  if(rad){
    if(!others.length) out.push(t("runErsteRad"));
    else if(x.dist > Math.max.apply(null, others.map(function(o){ return o.dist; }))) out.push(t("runLaengsteRad"));
    return out;
  }
  if(!others.length) out.push(t("runErster"));
  else {
    if(x.dist > Math.max.apply(null, others.map(function(o){ return o.dist; }))) out.push(t("runLaengster"));
    var bk = runBesterKm(x), ok = others.map(runBesterKm).filter(function(v){ return v !== null; });
    if(bk !== null && (!ok.length || bk < Math.min.apply(null, ok))) out.push(t("runSchnellsterKm", { z:fmtUhr(bk) }));
    var lang = others.filter(function(o){ return o.dist >= 1000; });
    if(x.dist >= 1000 && lang.length && x.dur/x.dist < Math.min.apply(null, lang.map(function(o){ return o.dur/o.dist; }))) out.push(t("runSchnellstePace"));
  }
  [[5000, "runM5"], [10000, "runM10"], [21097, "runMHalb"]].forEach(function(m){
    if(x.dist >= m[0] && !others.some(function(o){ return o.dist >= m[0]; })) out.push(t(m[1]));
  });
  return out;
}
/* Eigener Lauf (Modern): Ziel-Distanz und optional eine Pace-Vorgabe; „Start“ übernimmt beides wie ein Lauf aus dem Kalender (runGeplant) */
var RUN_ZIELE = [0, 3, 5, 10, 15, 21];
var RUN_PACES = [0, 270, 300, 330, 360, 390, 420, 480];   // Sekunden je Kilometer, 0 = keine Vorgabe
function runZielEinst(){ var s = state.db.settings; if(!s.runZiel || typeof s.runZiel !== "object") s.runZiel = { km:0, pace:0 }; return s.runZiel; }
/* Eigener Lauf: Strecke per Regler von „Frei“ bis zum Marathon, optional Pace-Vorgabe; als Lauf-Workout speicherbar (settings.runWorkouts) */
var RUN_MARATHON = 42.195, RUN_HALB = 21.0975;
/* Rad: Regler bis 200 km in 5-km-Schritten, ohne Marathon-Namen und ohne Pace-Vorgabe */
function runZielVonRegler(v, rad){ v = +v; if(rad) return v; return v >= 42 ? RUN_MARATHON : v === 21 ? RUN_HALB : v; }
function runReglerVonKm(km, rad){ if(rad) return Math.min(200, Math.round(km/5)*5); return km >= 42 ? 42 : Math.round(km); }
function runZielText(km, rad){
  if(!(km > 0)) return t("runZielFrei");
  if(!rad && km >= 42) return t("runMarathon");
  if(rad) return (Math.round(km*10)/10).toString().replace(".", currentLang() === "en" ? "." : ",")+" km";
  if(Math.abs(km - RUN_HALB) < .01) return t("runHalbmarathon");
  return (Math.round(km*10)/10).toString().replace(".", currentLang() === "en" ? "." : ",")+" km";
}
/* Pace-Vorgabe per Regler: 0 = frei, sonst 3:00 bis 10:00 pro Kilometer in 5-Sekunden-Schritten (Regler 1 bis 85) */
function runPaceVonRegler(v){ v = +v; return v > 0 ? 175 + 5*v : 0; }
function runPaceRegler(p){ return p > 0 ? clamp(Math.round((p - 175)/5), 1, 85) : 0; }
function runPaceText(p){ return p > 0 ? fmtUhr(p*1000)+" /km" : t("runZielFrei"); }
function runWorkouts(){ var s = state.db.settings; if(!Array.isArray(s.runWorkouts)) s.runWorkouts = []; return s.runWorkouts; }
function runWoName(w){ return runZielText(w.km, !!w.rad)+(w.pace ? " · "+fmtUhr(w.pace*1000)+" /km" : "")+(w.rad ? " · "+t("runArtRad") : ""); }
function runWoFind(id){ var l = runWorkouts(); for(var i = 0; i < l.length; i++) if(l[i].id === id) return l[i]; return null; }
function runWoSpeichern(){
  var z = runZielEinst(), rad = runArt() === "rad";
  if(!(z.km > 0)) return null;
  var l = runWorkouts(), da = l.filter(function(w){ return Math.abs(w.km - z.km) < .01 && (w.pace || 0) === (z.pace || 0) && !!w.rad === rad; })[0];
  if(da) return da;
  var w = { id:uid(), km:z.km, pace:z.pace || 0, rad:rad, at:Date.now() };
  l.push(w); save();
  return w;
}
function runEigenerLaufHTML(){
  var z = runZielEinst(), rad = runArt() === "rad", liste = runWorkouts().slice().sort(function(a, b){ return b.at - a.at; });
  function chip(attr, wert, an, text){ return '<button type="button" class="kp-chip'+(an ? ' an' : '')+'" data-'+attr+'="'+wert+'" aria-pressed="'+an+'">'+esc(text)+'</button>'; }
  /* einklappbar: die Zeile oben nennt Titel und aktuelle Strecke, der Rest steht darunter (offen/zu merkt sich runKlapp bis zum Schließen der App) */
  return '<details class="card run-eigen run-klapp" data-k="eigen"'+(runKlapp.eigen ? ' open' : '')+'><summary class="kp-titel run-ziel-kopf"><span>'+esc(t("runEigen"))+'</span><b id="run-ziel-wert">'+esc(runZielText(z.km, rad))+'</b><span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
    '<input type="range" id="run-ziel" min="0" max="'+(rad ? 200 : 42)+'" step="'+(rad ? 5 : 1)+'" value="'+runReglerVonKm(z.km, rad)+'" aria-label="'+esc(t("runZielKmL"))+'">'+
    '<div class="run-ziel-marken" aria-hidden="true"><span>'+esc(t("runZielFrei"))+'</span>'+(rad ? '<span>50</span><span>100</span><span>200</span>' : '<span>10</span><span>21</span><span>42</span>')+'</div>'+
    (z.km && !rad ? '<div class="kp-titel run-ziel-kopf" style="margin-top:12px"><span>'+esc(t("runPaceVorgabe"))+'</span><b id="run-pace-wert">'+esc(runPaceText(z.pace))+'</b></div>'+
      '<input type="range" id="run-pace" min="0" max="85" step="1" value="'+runPaceRegler(z.pace)+'" aria-label="'+esc(t("runPaceVorgabe"))+'">'+
      '<div class="run-ziel-marken" aria-hidden="true"><span>'+esc(t("runZielFrei"))+'</span><span>4:30</span><span>6:00</span><span>8:00</span><span>10:00</span></div>' : '')+
    (z.km ? '<button type="button" class="btn btn-secondary run-wo-sp" data-runwosave>'+esc(t("runWoSpeichern"))+'</button>' : '')+
    (liste.length ? '<div class="kp-titel" style="margin-top:14px">'+esc(t("runWoTitel"))+'</div><div class="run-wos">'+liste.map(function(w){
      return '<div class="run-wo"><button type="button" class="run-wo-go" data-runwostart="'+esc(w.id)+'">'+ICON_PLAY+'<b>'+esc(runWoName(w))+'</b></button>'+
        '<button type="button" class="run-wo-weg" data-runwodel="'+esc(w.id)+'" aria-label="'+esc(t("del"))+'">&times;</button></div>'; }).join("")+'</div>' : '')+
  '</details>';
}
/* Kachel oben rechts auf der Run-Seite: die insgesamt verbrauchten Kalorien aller Läufe und Fahrten (geschätzt, nur mit Körperdaten; sonst ein Link zum Eintragen und die Zahl der Läufe) */
function runHeroRechtsHTML(runs, rad){
  if(!koerperDaten()) return '<div class="rh-sub"><button type="button" class="kh-mehr" data-koerper>'+esc(t("statKcalLink"))+' &#8250;</button></div>';
  if(!runs.length) return '<div class="rh-sub">'+esc(t("runTeaser"))+'</div>';
  var sum = runs.reduce(function(a, x){ return a + runKcal(x.dist, x.dur/1000, runIstRad(x)); }, 0);
  return '<div class="rh-sub rh-kcal"><b>≈ '+esc(sum.toLocaleString(currentLang() === "en" ? "en-GB" : "de-DE"))+'</b><small>'+esc(t("runKcalGesamt"))+SEP+esc(t(rad ? "runFahrtenKurz" : "runLaeufeKurz", { n:runs.length }))+'</small></div>';
}
var runKlapp = { eigen:false, iv:false, ans:false, verlauf:true };   // welche Karten auf der Run-Seite aufgeklappt sind
function runOptionenHTML(){
  var iv = runIvEinst(), rad = runArt() === "rad";
  if(rad) return "";   // auf dem Rad gibt es nichts einzustellen (Laufen und Gehen im Wechsel gibt es nur zu Fuß)
  return '<details class="card run-opt run-klapp" data-k="iv"'+(runKlapp.iv ? ' open' : '')+'><summary class="kp-titel run-ziel-kopf"><span>'+esc(t("runIvAn"))+'</span><b>'+esc(iv.an ? fmtUhr(iv.lauf*1000)+" / "+fmtUhr(iv.geh*1000) : t("runAus"))+'</b><span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
    toggleRow("run-iv-an", esc(t("runIvAktiv")), esc(t("runIvHint")), iv.an)+
    (!rad && iv.an ? '<div class="ru-felder"><div><label>'+esc(t("runIvLaufS"))+'</label>'+stepperHTML("run-iv-lauf", iv.lauf, 10, 900, 10)+'</div>'+
      '<div><label>'+esc(t("runIvGehS"))+'</label>'+stepperHTML("run-iv-geh", iv.geh, 10, 900, 10)+'</div></div>' : '')+
    '</details>';
}
function runAnsageHTML(){
  var e = runAnsageEinst();
  function kn(attr, wert, aktiv, text){ return '<button type="button" data-'+attr+'="'+wert+'" class="'+(aktiv ? "active" : "")+'">'+esc(text)+'</button>'; }
  return '<details class="card run-ansage run-klapp" data-k="ans'+(runKlapp.ans ? '" open' : '"')+'><summary class="kp-titel run-ziel-kopf"><span>'+esc(t("runAnsagen"))+'</span><b id="run-every-wert">'+esc(e.every ? t("runAlleKm", { n:e.every }) : t("runAus"))+'</b><span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
      '<input type="range" id="run-every" min="0" max="10" step="1" value="'+e.every+'" aria-label="'+esc(t("runAnsagen"))+'">'+
      '<div class="run-ziel-marken" aria-hidden="true"><span>'+esc(t("runAus"))+'</span><span>2</span><span>5</span><span>10 km</span></div>'+
    (e.every ? '<label style="margin-top:12px">'+esc(t("runInhalt"))+'</label><div class="theme-pick wahl-pick">'+
      kn("runwas", "km", e.was === "km", t("runWasKm"))+kn("runwas", "pace", e.was === "pace", t("runWasPace"))+kn("runwas", "alles", e.was === "alles", t("runWasAlles"))+'</div>'+
      '<button type="button" class="btn btn-secondary" data-runtest>'+esc(t("runTest"))+'</button>' : '')+
    '<div class="tm-hint">'+esc(t("runAnsageHint"))+'</div></details>';
}
/* Pace je Kilometer als Balken: je schneller, desto länger; der schnellste ist kräftig. Ein angefangener Rest-Kilometer (ab 100 m) steht zuletzt */
function runKmZeilen(x){
  var sp = x.splits || [], zeilen = [], bk = runBesterKm(x);
  sp.forEach(function(ms, i){ var dauer = ms - (i ? sp[i-1] : 0); zeilen.push({ n:String(i+1), dauer:dauer, text:fmtUhr(dauer), schnell:dauer === bk && sp.length > 1 }); });
  var rest = x.dist - sp.length*1000, rz = x.dur - (sp.length ? sp[sp.length-1] : 0);
  if(rest >= 100 && rz > 0) zeilen.push({ n:"+"+runKm(rest), dauer:rz/rest*1000, text:runPace(rz/1000, rest), rest:true });
  var best = Math.min.apply(null, zeilen.map(function(z){ return z.dauer; }));
  return zeilen.map(function(z){
    var w = Math.max(25, Math.round(100*best/z.dauer));
    return '<div class="rk'+(z.schnell ? ' schnell' : '')+(z.rest ? ' rest' : '')+'"><span class="rk-n">'+esc(z.n)+'</span><span class="rk-bar"><i style="width:'+w+'%"></i></span><span class="rk-p">'+esc(z.rest ? z.text : z.text)+'<small> /km</small></span></div>';
  }).join("");
}
function runById(id){ var l = state.db.settings.runs || []; for(var i=0;i<l.length;i++) if(l[i].id === id) return l[i]; return null; }

function runGpxText(r){
  var pts = (r.pts || []).map(function(p){ return '<trkpt lat="'+p[0]+'" lon="'+p[1]+'"/>'; }).join("");
  return '<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="BLOC" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>BLOC '+new Date(r.at).toISOString().slice(0, 10)+
    '</name><trkseg>'+pts+'</trkseg></trk></gpx>';
}
/* Kalorien-Schätzung für einen Lauf oder eine Radfahrt (nur mit Körperdaten, alles lokal): Laufen = Ruheumsatz in der Zeit + 1,036 kcal je kg und km (Laufkosten nach Margaria),
   Rad = MET nach Tempo (Compendium of Physical Activities 2011: unter 10 mph / 16 km/h Freizeit 4,0 · 10–12 mph 6,8 · 12–14 mph 8,0 · 14–16 mph 10,0 · ab 16 mph / 25,7 km/h 12,0)
   × Gewicht × Stunden (Fahrten werden also nicht wie Läufe gerechnet). Eine grobe Schätzung; 0 ohne Körperdaten oder ohne Strecke. */
function runKcal(dist, sek, rad){
  var kd = koerperDaten();
  if(!kd || !(dist > 50) || !(sek > 10)) return 0;
  var km = dist/1000, h = sek/3600, v = km/h;
  if(rad){ var met = v < 16.1 ? 4 : v < 19.3 ? 6.8 : v < 22.5 ? 8 : v < 25.7 ? 10 : 12; return Math.round(met*kd.kg*h); }
  return Math.round(1.036*kd.kg*km + kcalProStunde(kd)*h);
}
function runKcalText(dist, sek, rad){ var k = runKcal(dist, sek, rad); return k > 0 ? "≈ "+k.toLocaleString(currentLang() === "en" ? "en-GB" : "de-DE") : "–"; }
function runTempoJetzt(r){
  var v = r.verlauf;
  if(v.length < 2) return "–:––";
  var a = v[0], b = v[v.length-1];
  return runTempo(r, (b.t - a.t)/1000, b.d - a.d);
}
/* Fahrtrichtung in Grad (0 = Norden, im Uhrzeigersinn): aus dem letzten Stück Strecke (mindestens 12 m zurück), gegen Zittern etwas geglättet; ohne Bewegung bleibt der letzte Wert */
function runKarteKnopfHTML(){
  var fahrt = state.db.settings.runKarte === "fahrt", txt = t(fahrt ? "runKarteFahrt" : "runKarteNord");
  return '<button type="button" class="rk-modus" data-karte-modus aria-pressed="'+fahrt+'" aria-label="'+esc(txt)+'" title="'+esc(txt)+'">'+
    svgIcon(fahrt ? '<path d="M12 3.5l6.5 16-6.5-4-6.5 4z"/>' : '<circle cx="12" cy="12" r="8.5"/><path d="M12 6.5l2.6 5.5H9.4z"/><path d="M12 12v5.5"/>')+'</button>';
}
function runKurs(r){
  var p = r.pts || [], n = p.length;
  if(n < 2) return r.kurs || 0;
  var z = p[n-1];
  for(var j = n - 2; j >= 0; j--){
    if(runMeter(p[j], z) < 12) continue;
    var neu = (Math.atan2((z[1] - p[j][1])*Math.cos(z[0]*Math.PI/180), z[0] - p[j][0])*180/Math.PI + 360) % 360;
    if(r.kurs == null) r.kurs = neu; else r.kurs = (r.kurs + (((neu - r.kurs + 540) % 360) - 180)*0.5 + 360) % 360;
    return r.kurs;
  }
  return r.kurs || 0;
}
/* Live-Karte (Aufzeichnung): selbstgezeichnete Straßenstruktur und Bäume als Kulisse (keine Kartendaten, kein Netz), darüber leuchtet die gelaufene Strecke weiß,
   der Standort pulsiert. Der Ausschnitt wächst mit der Strecke mit (mindestens 160 m breit, damit die ersten Schritte nicht riesig wirken). */
function runLiveKarte(r){
  var pts = r.pts || [], W = 300, H = 300, pad = 34, i, seed = pts.length ? Math.abs(Math.round(pts[0][0]*1e5 + pts[0][1]*1e5)) : 7;
  function zuf(n){ var x = Math.sin(seed*12.9898 + n*78.233)*43758.5453; return x - Math.floor(x); }
  var kulisse = '', winkel = (zuf(1)*50 - 25)*Math.PI/180, c = Math.cos(winkel), s = Math.sin(winkel);
  function lin(x1, y1, x2, y2, kl){ return '<path class="'+kl+'" d="M'+x1.toFixed(1)+' '+y1.toFixed(1)+'L'+x2.toFixed(1)+' '+y2.toFixed(1)+'"/>'; }
  function dreh(x, y){ var dx = x - W/2, dy = y - H/2; return [W/2 + dx*c - dy*s, H/2 + dx*s + dy*c]; }
  for(i = 0; i < 6; i++){   // Bäume: kleine Kronen mit Stamm
    var tx = 24 + zuf(50 + i)*(W - 48), ty = 30 + zuf(70 + i)*(H - 60);
    kulisse += '<g class="rk-baum"><circle cx="'+tx.toFixed(1)+'" cy="'+(ty - 8).toFixed(1)+'" r="8"/><path d="M'+tx.toFixed(1)+' '+(ty).toFixed(1)+'v10"/></g>';
  }
  var svg = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(t("runRoute"))+'"><defs><filter id="rk-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>'+
    '<radialGradient id="rk-rand" cx="50%" cy="50%" r="60%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>'+
    '<g class="rk-kulisse">'+kulisse+'</g>';   // ohne Raster, ohne dunklen Block: nur Bäume hinter der Strecke
  var fahrt = state.db.settings.runKarte === "fahrt";   // Karte nach Fahrtrichtung ausgerichtet (sonst Norden oben)
  if(!pts.length) return svg+'<circle class="rk-puls" cx="150" cy="150" r="10"/><circle class="rk-pos" cx="150" cy="150" r="7"/></svg>';
  if(fahrt){
    /* Ausschnitt um den Standort (etwa 120 m Radius), gedreht, so dass die Fahrtrichtung nach oben zeigt; der Standort sitzt im unteren Drittel, damit man vorausschaut */
    var kurs = runKurs(r), zp = pts[pts.length-1], rad = kurs*Math.PI/180, cs = Math.cos(rad), sn = Math.sin(rad), mx = 111320*Math.cos(zp[0]*Math.PI/180), my = 111320;
    var sk2 = (W/2 - pad)/120, cy2 = H*0.64;
    var fx = function(p){ var dx = (p[1] - zp[1])*mx, dy = (p[0] - zp[0])*my, x2 = dx*cs - dy*sn, y2 = dx*sn + dy*cs; return [W/2 + x2*sk2, cy2 - y2*sk2]; };
    var plf = pts.map(function(p){ var q = fx(p); return q[0].toFixed(1)+","+q[1].toFixed(1); }).join(" "), a1 = fx(pts[0]);
    return svg+(pts.length > 1 ? '<polyline class="rk-glow" points="'+plf+'" filter="url(#rk-glow)"/><polyline class="rk-weg" points="'+plf+'"/>' : '')+
      '<circle class="rk-start" cx="'+a1[0].toFixed(1)+'" cy="'+a1[1].toFixed(1)+'" r="4.5"/>'+
      '<circle class="rk-puls" cx="'+(W/2)+'" cy="'+cy2.toFixed(1)+'" r="10"/><path class="rk-pfeil" transform="translate('+(W/2)+' '+cy2.toFixed(1)+')" d="M0 -11L8.5 9 0 4.5-8.5 9z"/>'+
      '<g class="rk-nord" transform="translate(30 34) rotate('+(-kurs).toFixed(1)+')"><path d="M0 -13L5 3 0 0-5 3z"/><text y="-16" text-anchor="middle">N</text></g></svg>';
  }
  var minLa = 90, maxLa = -90, minLo = 180, maxLo = -180;
  pts.forEach(function(p){ minLa = Math.min(minLa, p[0]); maxLa = Math.max(maxLa, p[0]); minLo = Math.min(minLo, p[1]); maxLo = Math.max(maxLo, p[1]); });
  var mLa = (minLa + maxLa)/2, mLo = (minLo + maxLo)/2, kx = Math.cos(mLa*Math.PI/180);
  var halbLa = Math.max((maxLa - minLa)/2, 80/111320), halbLo = Math.max((maxLo - minLo)/2, 80/(111320*Math.max(kx, .2)));
  var sk = Math.min((W - 2*pad)/(2*halbLo*kx), (H - 2*pad)/(2*halbLa));
  function xy(p){ return [W/2 + (p[1] - mLo)*kx*sk, H/2 - (p[0] - mLa)*sk]; }
  var pl = pts.map(function(p){ var q = xy(p); return q[0].toFixed(1)+","+q[1].toFixed(1); }).join(" "), a0 = xy(pts[0]), z0 = xy(pts[pts.length-1]);
  return svg+(pts.length > 1 ? '<polyline class="rk-glow" points="'+pl+'" filter="url(#rk-glow)"/><polyline class="rk-weg" points="'+pl+'"/>' : '')+
    '<circle class="rk-start" cx="'+a0[0].toFixed(1)+'" cy="'+a0[1].toFixed(1)+'" r="4.5"/>'+
    '<circle class="rk-puls" cx="'+z0[0].toFixed(1)+'" cy="'+z0[1].toFixed(1)+'" r="10"/><circle class="rk-pos" cx="'+z0[0].toFixed(1)+'" cy="'+z0[1].toFixed(1)+'" r="6.5"/></svg>';
}
/* Anzeige im Aufzeichnen-Fenster aktualisieren (ohne neu zu zeichnen) */
function runAnzeige(){
  var r = run;
  if(!r) return;
  var sek = runZeit(r)/1000;
  function setze(id, txt){ var el = document.getElementById(id); if(el && el.textContent !== txt) el.textContent = txt; }
  var zeit = fmtUhr(runZeit(r)), tempo = runTempo(r, sek, r.dist);
  setze("run-kcal", runKcalText(r.dist, runZeit(r)/1000, runIstRad(r)));
  setze("run-zeit", zeit); setze("run-km", runKm(r.dist)); setze("run-pace", tempo); setze("run-jetzt", runTempoJetzt(r));
  setze("run-dz", zeit); setze("run-dk", runKm(r.dist)+" km"); setze("run-dp", tempo+" "+runTempoEinheit(r));   // abgedunkelt: Zeit, Kilometer und Tempo bleiben zu sehen
  var gps = r.fehler === 1 ? t("runGpsDenied") : r.fehler ? t("runGpsLost") : r.gps == null ? t("runGpsWait") :
    t(r.gps <= 15 ? "runGpsOk" : "runGpsWeak", { m:Math.round(r.gps) });
  setze("run-gps", r.pauseAb ? t(r.auto ? "runAutoPausiert" : "runPaused") : gps);
  var pb = app.querySelector("[data-runpause]");
  if(pb){ var pt = t(r.pauseAb ? "runResume" : "runPause"); if(pb.textContent !== pt) pb.textContent = pt; }
  runIvTick();
  var gz = document.getElementById("run-gps");
  if(gz) gz.className = "run-gps " + (r.pauseAb ? "pause" : r.fehler ? "aus" : r.gps == null ? "suche" : r.gps <= 15 ? "gut" : "mittel");
  var karte = document.getElementById("run-karte");
  if(karte && +karte.getAttribute("data-n") !== r.pts.length){ karte.setAttribute("data-n", r.pts.length); karte.innerHTML = runLiveKarte(r); }
}
function runDunkel(){
  var d = document.createElement("div");
  d.id = "run-dunkel"; d.className = "run-dunkel";
  d.innerHTML = '<div id="run-dz" class="rd-z"></div><div id="run-dk" class="rd-k"></div><div id="run-dp" class="rd-k rd-p"></div><div class="rd-h">'+esc(t("runDarkHint"))+'</div><div class="rd-balken"><i></i></div>';
  // Gegen versehentliche Berührungen in der Tasche: erst 2 s gedrückt halten (Balken füllt sich), ein kurzer Tipp tut nichts
  var tm = 0;
  function los(){ if(tm){ clearTimeout(tm); tm = 0; } d.classList.remove("halten"); }
  d.addEventListener("pointerdown", function(e){ e.preventDefault(); los(); d.classList.add("halten"); tm = setTimeout(function(){ tm = 0; d.remove(); }, 2000); });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function(ev){ d.addEventListener(ev, los); });
  d.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  document.body.appendChild(d);
  if(runVor && !run){ var dz0 = d.querySelector("#run-dz"); dz0.textContent = Math.max(1, Math.ceil((runVor.ende - Date.now())/1000)); }
  runAnzeige();
}
/* Im Lauf (nicht abgedunkelt) lösen alle Knöpfe erst nach 2 s Gedrückthalten aus, „Beenden“ nach 1 s - gegen Fehlbedienung in der Tasche oder mit nassen Händen.
   Der Knopf füllt sich währenddessen (.halten, Dauer über --halt). Ein Tastatur-Klick (detail 0) löst sofort aus, damit die Bedienung ohne Touch erreichbar bleibt. */
var RUN_HALTEN = 2000, RUN_HALTEN_ENDE = 1000;
function runHalten(el, fn, ms){
  if(!el) return;
  var tm = 0, fertig = false, dauer = ms || RUN_HALTEN;
  function los(){ if(tm){ clearTimeout(tm); tm = 0; } el.classList.remove("halten"); }
  el.classList.add("hold");
  el.style.setProperty("--halt", dauer+"ms");
  el.addEventListener("pointerdown", function(e){
    if(e.button) return;
    los(); fertig = false; el.classList.add("halten");
    tm = setTimeout(function(){ tm = 0; fertig = true; el.classList.remove("halten"); vibrate(60); fn(); }, dauer);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function(ev){ el.addEventListener(ev, los); });
  el.addEventListener("contextmenu", function(e){ e.preventDefault(); });
  el.addEventListener("click", function(e){ if(e.detail === 0 && !fertig) fn(); });
}
function runDunkelWeg(){ var d = document.getElementById("run-dunkel"); if(d) d.remove(); }

/* Countdown vor dem Start: große Zahl, +10 s, sofort starten, abbrechen */
function renderRunVor(){
  var v = runVor;
  app.innerHTML =
    runHintergrundHTML() + '<div class="bloc-quer" aria-hidden="true">BLOC</div>' +
    topbar(t("runTitle"), { back:"#home" }) +
    '<div class="run-weiss">' +
    '<div class="run-gross"><div class="rg-label">'+esc(t("runVorTitel"))+'</div><div id="run-vor" class="rg-zeit rg-vor">'+Math.max(1, Math.ceil((v.ende - Date.now())/1000))+'</div></div>'+
    '<div class="run-gps" id="run-vor-gps">'+esc(runVorText())+'</div>'+
    '<div class="run-knoepfe"><button type="button" class="btn btn-secondary run-dunkelbtn" data-rundark>'+svgIcon(ICON_MOON)+' '+esc(t("runDark"))+'</button>'+
      '<button type="button" class="btn btn-secondary" data-runplus>'+esc(t("runPlus10"))+'</button>'+
      '<button type="button" class="btn btn-primary" data-runjetzt>'+esc(t("runJetzt"))+'</button>'+
      '<button type="button" class="btn btn-danger" data-runabbr>'+esc(t("runAbbrechen"))+'</button></div>'+
    '</div>' +
    '<div style="height:40px"></div>';
  var zur = app.querySelector("[data-back]");
  function weg(){ runVorStop(); runDunkelWeg(); runWachen(false); renderRun(); }
  if(zur){ zur.removeAttribute("data-back"); zur.addEventListener("click", function(){ runVorStop(); runDunkelWeg(); runWachen(false); goBack("#home"); }); }
  bindCommon();
  app.querySelector("[data-rundark]").addEventListener("click", runDunkel);
  app.querySelector("[data-runplus]").addEventListener("click", function(){ if(runVor){ runVor.ende += 10000; runVor.piep = null; runVorTick(); } });
  app.querySelector("[data-runjetzt]").addEventListener("click", runVorLos);
  app.querySelector("[data-runabbr]").addEventListener("click", weg);
}
/* Aussehen „Modern“: das Läuferfoto liegt geblurrt hinter der ganzen Run-Seite (dunkel: Gegenlicht-Läufer, hell: Waldweg), darüber stehen weiße Karten */
/* Höhenlinien als Zierde: ineinanderliegende, leicht verzogene Ringe (selbst berechnet, keine Kartendaten, kein Netz) */
function runHoehenlinien(){
  function blob(cx, cy, r, ph){
    var n = 10, p = [], i, a, rr;
    for(i = 0; i < n; i++){ a = i/n*2*Math.PI; rr = r*(1 + .16*Math.sin(2*a + ph) + .09*Math.sin(3*a + 2*ph)); p.push([cx + Math.cos(a)*rr*1.15, cy + Math.sin(a)*rr]); }
    var d = "M" + p[0][0].toFixed(1) + " " + p[0][1].toFixed(1);
    for(i = 0; i < n; i++){   // geschlossene Kurve durch alle Punkte (Catmull-Rom → Bézier)
      var p0 = p[(i + n - 1) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      d += "C" + (p1[0] + (p2[0] - p0[0])/6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1])/6).toFixed(1) + " " + (p2[0] - (p3[0] - p1[0])/6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1])/6).toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return '<path d="' + d + 'Z"/>';
  }
  var s = "", k;
  for(k = 0; k < 8; k++) s += blob(90, 260, 34 + k*26, .4 + k*.12);
  for(k = 0; k < 6; k++) s += blob(330, 650, 28 + k*24, 1.7 + k*.15);
  return '<svg class="run-hoehen" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" fill="none" stroke-width="1.2">' + s + '</svg>';
}
/* Run (vor dem Start) und Timer-Seite: im Dunkel mit dem Foto-Hintergrund, im Hellen wie Workout und Mobility & Stretch (heller Grund, Felder wie sie sind).
   Das laufende Training (Lauf, Timer, Satz-Training) behält in beiden Modi seinen dunklen Hintergrund. */
function runSeitenHintergrundHTML(){ return themeIstDunkel() ? runHintergrundHTML() : ""; }
function runHintergrundHTML(klasse){
  return '<div class="run-bg'+(klasse ? ' '+klasse : '')+'" aria-hidden="true"><i style="background-image:url('+"img/neu-p-freiluft-meer.jpg"+')"></i>'+'</div>';
}
/* Strecke mit Zwischenwerten (Modern, Lauf-Details): weiße Linie, Punkte bei jedem Kilometer, daran kleine Glas-Chips „1 km · 5:44“ */
function runStreckeNeu(x){
  var pts = x.pts || [];
  if(pts.length < 2) return '<div class="run-leer">'+esc(t("runRoutePh"))+'</div>';
  var minLa = 90, maxLa = -90, minLo = 180, maxLo = -180;
  pts.forEach(function(p){ minLa = Math.min(minLa, p[0]); maxLa = Math.max(maxLa, p[0]); minLo = Math.min(minLo, p[1]); maxLo = Math.max(maxLo, p[1]); });
  var kx = Math.cos((minLa + maxLa)/2*Math.PI/180), W = 300, H = 260, pad = 30;
  var bw = Math.max((maxLo - minLo)*kx, 1e-6), bh = Math.max(maxLa - minLa, 1e-6);
  var sk = Math.min((W - 2*pad)/bw, (H - 2*pad)/bh), ox = (W - bw*sk)/2, oy = (H - bh*sk)/2;
  function xy(p){ return [ox + (p[1] - minLo)*kx*sk, oy + (maxLa - p[0])*sk]; }
  var pl = pts.map(function(p){ var q = xy(p); return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" ");
  var sp = x.splits || [], marken = [], cum = 0, naechster = 1, i;
  for(i = 1; i < pts.length && naechster <= sp.length; i++){
    cum += runMeter(pts[i-1], pts[i]);
    if(cum >= naechster*1000){ var dauer = sp[naechster-1] - (naechster > 1 ? sp[naechster-2] : 0); marken.push({ km:naechster, p:xy(pts[i]), dauer:dauer }); naechster++; }
  }
  var schritt = Math.max(1, Math.ceil(marken.length/6)), punkte = "", chips = "";
  marken.forEach(function(m, j){
    punkte += '<circle cx="'+m.p[0].toFixed(1)+'" cy="'+m.p[1].toFixed(1)+'" r="4.5" class="rs-punkt"/>';
    if(j % schritt === 0) chips += '<span class="rs-chip'+(m.p[0]/W > .62 ? ' links' : '')+'" style="left:'+(m.p[0]/W*100).toFixed(1)+'%;top:'+(m.p[1]/H*100).toFixed(1)+'%"><b>'+m.km+' km</b><small>'+esc(fmtUhr(m.dauer))+(runIstRad(x) ? '' : ' /km')+'</small></span>';
  });
  var a = xy(pts[0]), z = xy(pts[pts.length-1]);
  return '<div class="run-strecke"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(t("runRoute"))+'">'+
    '<polyline points="'+pl+'" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'+punkte+
    '<circle cx="'+a[0].toFixed(1)+'" cy="'+a[1].toFixed(1)+'" r="5.5" class="rs-start"/><circle cx="'+z[0].toFixed(1)+'" cy="'+z[1].toFixed(1)+'" r="9" class="rs-ring"/><circle cx="'+z[0].toFixed(1)+'" cy="'+z[1].toFixed(1)+'" r="5" class="rs-ziel"/></svg>'+chips+'</div>';
}
function renderRun(){
  var s = state.db.settings;
  if(!run && !runVor) runDunkelWeg();
  if(run) return renderRunLive();
  if(runVor) return renderRunVor();
  var runs = (s.runs || []).slice().sort(function(a, b){ return b.at - a.at; });
  var live = s.runLive, art = runArt();
  var artRuns = runs.filter(function(x){ return runIstRad(x) === (art === "rad"); });   // Kachel oben: nur die gewählte Art (Laufen oder Rad)
  var km = artRuns.reduce(function(a, x){ return a + x.dist; }, 0)/1000;
  app.innerHTML =
    runSeitenHintergrundHTML() + bereichKopfNeuHTML("run", t("runTitle"), t("runKicker"), "", { klar:true }) +
    (live ?'<div class="card run-live"><b>'+esc(t("runBroken"))+'</b><div class="sub">'+esc(t("runBrokenText", { km:runKm(live.dist) }))+'</div>'+
      '<div class="btn-row"><button type="button" class="btn btn-secondary" data-runlivedel>'+esc(t("runDiscard"))+'</button>'+
      '<button type="button" class="btn btn-primary" data-runlivesave>'+esc(t("runRecover"))+'</button></div></div>' : '')+
    (runGeplant && Date.now() - runGeplant.t < 6*3600000 ? '<div class="card run-geplant"><small>'+esc(t("runGeplant"))+'</small><b>'+esc(runGeplant.name || t("kalRunName"))+'</b>'+
      (runGeplant.km > 0 ? '<div class="sub">'+esc(t("runZielKm", { km:runKm(runGeplant.km*1000) }))+'</div>' : '')+
      '<button type="button" class="btn btn-primary run-startbtn" data-runstart>'+ICON_PLAY+' '+esc(t("runStart"))+'</button>'+
      '<button type="button" class="ghost" data-rungeplantweg>'+esc(t("runGeplantWeg"))+'</button></div>' : '')+
    '<div class="card run-hero"><div class="rh-km">'+esc(runKm(km*1000))+'<small>km</small></div>'+runHeroRechtsHTML(artRuns, art === "rad")+
      '<div class="theme-pick wahl-pick seg-2 run-art" role="group" aria-label="'+esc(t("runArt"))+'">'+
        '<button type="button" data-runart="lauf" class="'+(art === "lauf" ? "active" : "")+'">'+esc(t("runArtLauf"))+'</button>'+
        '<button type="button" data-runart="rad" class="'+(art === "rad" ? "active" : "")+'">'+esc(t("runArtRad"))+'</button></div>'+
      '<button type="button" class="btn btn-primary run-startbtn" data-runstart>'+ICON_PLAY+' '+esc(t(art === "rad" ? "runStartRad" : "runStart"))+'</button></div>'+
    runEigenerLaufHTML()+runOptionenHTML()+runAnsageHTML()+
    '<details class="run-klapp run-verlauf" data-k="verlauf"'+(runKlapp.verlauf ? ' open' : '')+'><summary class="section-title"><span>'+esc(t("runVerlauf"))+'</span><span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+   // der Verlauf steht unten, einklappbar
    (runs.length ? runs.map(function(x){
      var d = new Date(x.at);
      return '<div class="list-item entry run-item" data-nav="#rundetail/'+x.id+'"><div class="meta"><div class="name">'+esc(runKm(x.dist))+' km'+(runIstRad(x) ? '<span class="run-name"> · '+esc(t("runArtRad"))+'</span>' : '')+(x.name ? '<span class="run-name"> · '+esc(x.name)+'</span>' : '')+'</div>'+
        '<div class="sub">'+esc(d.toLocaleDateString(currentLang() === "en" ? "en-GB" : "de-DE", { weekday:"short", day:"numeric", month:"short" }))+SEP+esc(fmtUhr(x.dur))+SEP+esc(runTempo(x, x.dur/1000, x.dist))+' '+runTempoEinheit(x)+'</div></div>'+
        '<div class="card-aside"><div class="card-acts">'+trashBtn("run", x.id, runKm(x.dist)+" km")+'</div></div></div>';
    }).join("") : '<div class="empty" style="padding:24px 20px;">'+esc(t("runNone"))+'</div>')+'</details>'+
    '<div class="page-hint">'+esc(t("runBetaHint"))+'</div>'+
    '<div style="height:40px"></div>';
  bindCommon();
  bindTrash(function(){ renderRun(); });
  app.querySelectorAll("details.run-klapp").forEach(function(d){ d.addEventListener("toggle", function(){ runKlapp[d.getAttribute("data-k")] = d.open; }); });
  var kh = app.querySelector("[data-koerper]"); if(kh) kh.addEventListener("click", function(){ openKoerperSheet(function(){ renderRun(); }); });
  if(app.querySelector("#run-iv-an")) bindToggle("run-iv-an", function(v){ var e = runIvEinst(); s.runIv = { an:v, lauf:e.lauf, geh:e.geh }; save(); renderRun(); });
  bindSteppers(app, function(){
    var l = app.querySelector("#run-iv-lauf"), g = app.querySelector("#run-iv-geh");
    if(l && g){ s.runIv = { an:true, lauf:clamp(parseInt(l.value) || 60, 10, 900), geh:clamp(parseInt(g.value) || 60, 10, 900) }; save(); }
  });
  app.querySelectorAll("[data-runart]").forEach(function(b){
    b.addEventListener("click", function(){
      s.runArt = b.getAttribute("data-runart") === "rad" ? "rad" : "lauf";
      var zz = runZielEinst(); if(s.runArt === "lauf" && zz.km > RUN_MARATHON) zz.km = RUN_MARATHON; if(s.runArt === "rad") zz.pace = 0;   // Laufen höchstens Marathon, Rad bis 200 km und ohne Pace-Vorgabe
      save(); renderRun();
    });
  });
  app.querySelectorAll("[data-runstart]").forEach(function(b){ b.addEventListener("click", function(){
    var z = runZielEinst();
    if(z.km > 0 && !runGeplant) runGeplant = { name:"", km:z.km, pace:z.pace || 0, rad:runArt() === "rad", t:Date.now() };   // eigener Lauf mit Ziel
    runStart();
  }); });
  var zr = app.querySelector("#run-ziel");   // Strecke: beim Ziehen nur die Anzeige, beim Loslassen speichern und neu zeichnen (Pace-Wahl und Speichern-Knopf hängen am Ziel)
  if(zr){
    zr.addEventListener("input", function(){ var el = app.querySelector("#run-ziel-wert"); if(el) el.textContent = runZielText(runZielVonRegler(zr.value, runArt() === "rad"), runArt() === "rad"); });
    zr.addEventListener("change", function(){
      var z = runZielEinst(); z.km = runZielVonRegler(zr.value, runArt() === "rad"); if(!z.km || runArt() === "rad") z.pace = 0; save();
      var y = window.scrollY; renderRun(); window.scrollTo(0, y);
    });
  }
  var ws = app.querySelector("[data-runwosave]");
  if(ws) ws.addEventListener("click", function(){ var w = runWoSpeichern(); if(w){ showToast(t("runWoGespeichert", { n:runWoName(w) })); var y = window.scrollY; renderRun(); window.scrollTo(0, y); } });
  app.querySelectorAll("[data-runwostart]").forEach(function(b){ b.addEventListener("click", function(){
    var w = runWoFind(b.getAttribute("data-runwostart")); if(!w) return;
    runGeplant = { name:runWoName(w), km:w.km, pace:w.pace || 0, rad:!!w.rad, t:Date.now() };
    s.runArt = w.rad ? "rad" : "lauf"; save();
    runStart();
  }); });
  app.querySelectorAll("[data-runwodel]").forEach(function(b){ b.addEventListener("click", function(){
    s.runWorkouts = runWorkouts().filter(function(w){ return w.id !== b.getAttribute("data-runwodel"); }); save();
    var y = window.scrollY; renderRun(); window.scrollTo(0, y);
  }); });
  var pr = app.querySelector("#run-pace");
  if(pr){
    pr.addEventListener("input", function(){ var el = app.querySelector("#run-pace-wert"); if(el) el.textContent = runPaceText(runPaceVonRegler(pr.value)); });
    pr.addEventListener("change", function(){ runZielEinst().pace = runPaceVonRegler(pr.value); save(); });
  }
  var gw = app.querySelector("[data-rungeplantweg]");
  if(gw) gw.addEventListener("click", function(){ runGeplant = null; renderRun(); });
  var ev = app.querySelector("#run-every");
  if(ev){
    ev.addEventListener("input", function(){ var n = +ev.value; app.querySelector("#run-every-wert").textContent = n ? t("runAlleKm", { n:n }) : t("runAus"); });
    ev.addEventListener("change", function(){ var e = runAnsageEinst(); s.runAnsage = { every:+ev.value, was:e.was }; save(); var y = window.scrollY; renderRun(); window.scrollTo(0, y); });
  }
  app.querySelectorAll("[data-runwas]").forEach(function(b){
    b.addEventListener("click", function(){ var e = runAnsageEinst(); s.runAnsage = { every:e.every, was:b.getAttribute("data-runwas") }; save(); renderRun(); });
  });
  var rt = app.querySelector("[data-runtest]");
  if(rt) rt.addEventListener("click", function(){   // Hörprobe: so klänge die Ansage bei 6:12 min/km
    var e = runAnsageEinst(), sp = [], k = Math.max(e.every, 1);
    for(var i = 1; i <= k; i++) sp.push(i*372000);
    runSag(runAnsageText(k, sp, e, currentLang() !== "en"));
  });
  var lv = app.querySelector("[data-runlivesave]");
  if(lv) lv.addEventListener("click", function(){
    var l = s.runLive; delete s.runLive;
    if(runSpeichern({ id:l.id, start:l.start, dur:l.dur, dist:l.dist, pts:l.pts, splits:l.splits, art:l.art })) go("#rundetail/"+l.id); else renderRun();
  });
  var ld = app.querySelector("[data-runlivedel]");
  if(ld) ld.addEventListener("click", function(){ delete s.runLive; save(); renderRun(); });
}
function renderRunLive(){
  var r = run;
  app.innerHTML =
    runHintergrundHTML() + '<div class="bloc-quer" aria-hidden="true">BLOC</div>' +
    topbar(t("runTitle"), { back:"#home", right:(runAnsageEinst().every ? '<button type="button" class="iconbtn run-laut' + (r.stumm ? ' aus' : '') + '" data-runlaut aria-pressed="' + !!r.stumm + '" aria-label="' + esc(t(r.stumm ? "runStummAus" : "runStummAn")) + '">' + ICON_VOLUME + '</button>' : '') }) +
    '<div class="run-weiss">' +
    '<div class="run-gross"><div class="rg-label">'+esc(t("runTime"))+'</div><div id="run-zeit" class="rg-zeit">0:00</div><div class="run-gps" id="run-gps"></div>'+(r.iv ? '<div class="run-iv" id="run-iv"></div>' : '')+(r.ziel && r.ziel.km > 0 ? '<div class="run-ziel">'+esc(t("runZielKm", { km:runKm(r.ziel.km*1000) }))+'</div>' : '')+'</div>'+
    '<div class="run-raster">'+
      '<div><b id="run-km">0,00</b><small>'+esc(t("runDist"))+' (km)</small></div>'+
      '<div><b id="run-pace">'+(runIstRad(r) ? '–,–' : '–:––')+'</b><small>'+esc(t(runIstRad(r) ? "runSpeedAvg" : "runPaceAvg"))+' '+runTempoEinheit(r)+'</small></div>'+
      '<div><b id="run-jetzt">'+(runIstRad(r) ? '–,–' : '–:––')+'</b><small>'+esc(t("runPaceNow"))+' '+runTempoEinheit(r)+'</small></div>'+'<div><b id="run-kcal">–</b><small>kcal</small></div></div>'+
    '<div class="run-karte-wrap"><div id="run-karte" class="run-karte" data-n="-1"></div>'+runKarteKnopfHTML()+'</div>'+
    '<div class="run-knoepfe"><button type="button" class="btn btn-secondary" data-runpause>'+esc(t(r.pauseAb ? "runResume" : "runPause"))+'</button>'+
      '<button type="button" class="btn btn-secondary run-dunkelbtn" data-rundark>'+svgIcon(ICON_MOON)+' '+esc(t("runDark"))+'</button>'+
      '<button type="button" class="btn btn-danger run-ende" data-runend>'+esc(t("runEnd"))+'</button></div>'+
    '<div class="tm-hint run-haltehint">'+esc(t("runHaltenHint"))+'</div>'+
    '</div>' +
    '<div style="height:40px"></div>';
  var zur = app.querySelector("[data-back]");
  if(zur){ zur.removeAttribute("data-back"); zur.addEventListener("click", function(){
    openActionSheet(t("runLeaveQ"), [
      { ico:P_PLAY, label:t("runKeep"), fn:function(){} },
      { ico:P_CHECK, label:t("runSave"), fn:function(){ runBeenden(true); } },
      { ico:P_TRASH, label:t("runDiscard"), danger:true, fn:function(){ runBeenden(false); } }
    ]);
  }); }
  bindCommon();   // erst nach dem Entfernen von data-back, sonst würde „Zurück“ zusätzlich die Seite verlassen
  runHalten(app.querySelector("[data-runpause]"), runPause);
  var kw = app.querySelector(".run-karte-wrap");   // Karte: Norden oben oder Fahrtrichtung oben (antippen wechselt, bleibt gespeichert)
  if(kw) kw.addEventListener("click", function(e){
    var kn = e.target.closest && e.target.closest("[data-karte-modus]"); if(!kn) return;
    var s2 = state.db.settings; s2.runKarte = s2.runKarte === "fahrt" ? "nord" : "fahrt"; save(); vibrate(10);
    var k = document.getElementById("run-karte"); if(k) k.setAttribute("data-n", "-1");
    kn.outerHTML = runKarteKnopfHTML();
    runAnzeige();
  });
  runHalten(app.querySelector("[data-rundark]"), runDunkel);
  var laut = app.querySelector("[data-runlaut]");
  if(laut) laut.addEventListener("click", function(){
    r.stumm = !r.stumm;
    if(r.stumm) try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
    renderRunLive();
  });
  var stm = app.querySelector("[data-runstumm]");
  if(stm) runHalten(stm, function(){   // Ansagen für diesen Lauf aus/an (die Einstellung bleibt)
    r.stumm = !r.stumm;
    if(r.stumm) try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
    renderRunLive();
  });
  runHalten(app.querySelector("[data-runend]"), function(){
    confirmSheet(t("runEndQ"), t("runEndText"), t("runSave"), function(){ runBeenden(true); });
  }, RUN_HALTEN_ENDE);
  runAnzeige();
}
function renderRunDetail(id){
  runDunkelWeg();
  var x = runById(id);
  if(!x) return go("#run");
  var d = new Date(x.at), sp = x.splits || [], bk = runBesterKm(x);
  var neu = runNeu === x.id;
  runNeu = null;
  var hl = neu ? runHighlights(x) : [];
  app.innerHTML =
    runHintergrundHTML() +
    topbar(t("runDetail"), { back:"#run" }) +
    // Abschlusskarte direkt nach dem Lauf: was geschafft wurde (der Lauf ist schon gespeichert)
    (neu ? '<div class="card run-fertig"><div class="rf-titel">'+esc(t("runGeschafft"))+'</div><div class="rf-km">'+esc(runKm(x.dist))+' <small>km</small></div>'+
      '<div class="rf-zeile">'+esc(fmtUhr(x.dur))+SEP+esc(runTempo(x, x.dur/1000, x.dist))+' '+runTempoEinheit(x)+(runKcal(x.dist, x.dur/1000, runIstRad(x)) ? SEP+esc(runKcalText(x.dist, x.dur/1000, runIstRad(x)))+' kcal' : '')+'</div>'+
      (hl.length ? '<ul class="rf-liste">'+hl.map(function(h){ return '<li>'+svgIcon(ICON_STAR)+'<span>'+esc(h)+'</span></li>'; }).join("")+'</ul>' : '')+
      '<div class="rf-gespeichert">'+esc(t("runGespeichert"))+'</div></div>' : '')+
    '<div class="meta-zeile">'+esc(d.toLocaleDateString(currentLang() === "en" ? "en-GB" : "de-DE", { weekday:"long", day:"numeric", month:"long", year:"numeric" }))+
      (x.iv ? SEP+esc(t("runIvMeta", { l:fmtUhr(x.iv.lauf*1000), g:fmtUhr(x.iv.geh*1000) })) : '')+(x.pause ? SEP+esc(t("runPausenMeta", { z:fmtUhr(x.pause) })) : '')+'</div>'+
    '<div class="card run-notiz"><input type="text" id="run-name" maxlength="40" value="'+esc(x.name || "")+'" placeholder="'+esc(t("runNamePh"))+'" aria-label="'+esc(t("runNamePh"))+'">'+
      '<textarea id="run-note" rows="2" maxlength="400" placeholder="'+esc(t("runNotePh"))+'" aria-label="'+esc(t("runNotePh"))+'">'+esc(x.note || "")+'</textarea></div>'+
    '<div class="run-raster"><div><b>'+esc(runKm(x.dist))+'</b><small>'+esc(t("runDist"))+' (km)</small></div><div><b>'+esc(fmtUhr(x.dur))+'</b><small>'+esc(t("runTime"))+'</small></div>'+
      '<div><b>'+esc(runTempo(x, x.dur/1000, x.dist))+'</b><small>'+esc(t(runIstRad(x) ? "runSpeedAvg" : "runPaceAvg"))+' '+runTempoEinheit(x)+'</small></div>'+(koerperDaten() ? '<div><b>'+esc(runKcalText(x.dist, x.dur/1000, runIstRad(x)))+'</b><small>kcal</small></div>' : '')+'</div>'+
    (koerperDaten() ? '<div class="sk-unter run-kcal-hinweis">'+esc(t("runKcalHint"))+'</div>' : '<button type="button" class="kh-mehr" data-koerper>'+esc(t("statKcalLink"))+' &#8250;</button>')+
    '<div class="section-title">'+esc(t("runRoute"))+'</div>'+runStreckeNeu(x)+
    (sp.length ? '<div class="section-title">'+esc(t("runSplits"))+'</div><div class="card run-kms">'+runKmZeilen(x)+'</div>' : '')+
    '<button type="button" class="btn btn-secondary" data-rungpx style="margin-top:14px;">'+esc(t("runGpx"))+'</button>'+
    '<div style="height:40px"></div>';
  bindCommon();
  var nm = app.querySelector("#run-name"), nt = app.querySelector("#run-note");
  var kb = app.querySelector("[data-koerper]"); if(kb) kb.addEventListener("click", function(){ openKoerperSheet(function(){ renderRunDetail(id); }); });
  nm.addEventListener("input", function(){ x.name = nm.value.trim(); if(!x.name) delete x.name; save(); });
  nt.addEventListener("input", function(){ x.note = nt.value.trim(); if(!x.note) delete x.note; save(); });
  app.querySelector("[data-rungpx]").addEventListener("click", function(){
    var blob = new Blob([runGpxText(x)], { type:"application/gpx+xml" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "bloc-lauf-"+new Date(x.at).toISOString().slice(0, 10)+".gpx";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
  });
}

/* Eigenes Workout als Karte (Air › Meine und Mobility & Stretch › Meine) */
function myWoCard(mw, exs, mains, dur){
  var ids = exs.map(function(e){ return e.id; }), gr = planGruppen(ids), ort = mw.ws ? "" : planOrt(ids); return '<div class="list-item entry tpl-item lib-card my-item" style="--cat:'+woFarbe(exs)+'" data-cover="my/'+mw.id+'" role="button" tabindex="0" data-q="'+esc(woSearchText(mw.name, exs))+'">'+
    '<button class="playbtn cat" data-cover="my/'+mw.id+'" '+(exs.length?'':'disabled style="opacity:.3"')+' title="'+t("startTemplate")+'" aria-label="'+t("startTemplate")+'">'+ICON_PLAY+'</button>'+(mw.ws ? '' : ortThumbHTML(ids))+
    '<div class="meta"><div class="name">'+esc(mw.name)+'</div>'+
    '<div class="sub">'+mainTagsHTML(mains)+t("exCount", { n:exs.length })+SEP+fmtDauerKurz(dur)+(ort ? SEP+esc(ort) : '')+'</div>'+(gr ? '<div class="sub pl-gruppen">'+esc(gr)+'</div>' : '')+
    '</div><div class="card-aside"><div class="card-acts">'+favBtn("my:"+mw.id)+'<button type="button" class="fav-btn my-edit" data-myedit="'+mw.id+'" title="'+t("edit")+'" aria-label="'+t("edit")+'">&#9998;</button>'+trashBtn("my", mw.id, mw.name)+'</div></div></div>';
}
/* Menü eines fertigen Workouts (⋯ und langes Drücken): unter „Meine“ speichern, ausblenden. ws: aus Mobility & Stretch */
function woMenue(lw, neu, ws){
  openActionSheet(tplText(lw.name), [
    { ico:ICON_COPY, label:t("adoptMine"), fn:function(){ adoptLibWorkout(lw, ws); } },
    { ico:ICON_EYE_OFF, label:t("hideShort"), fn:function(){ libHide("wo:"+lw.id); showToast(t("hiddenToast")); neu(); } }
  ]);
}
