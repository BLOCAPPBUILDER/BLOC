"use strict";
/* ============ Timer-Motor: Schritte, Takt, Pause, Beenden; Service Worker ============
   (Der Dateiname stammt vom früheren Walzenzähler des Designs C60, das es nicht mehr gibt.) */
/* Abgelaufene Schritte nachholen. War die App länger im Hintergrund, können mehrere
   Schritte vorbei sein - dann direkt zum richtigen springen (nicht nur einen weiter).
   Gibt true zurück, wenn gewechselt wurde. */
function advanceIfDue(){
  if(!playerState || playerState.paused) return false;
  var steps = playerState.steps, now = Date.now();
  if(!steps[playerState.idx] || steps[playerState.idx].phase==="done" || playerState.endAt > now) return false;
  var idx = playerState.idx + 1, startAt = playerState.endAt, skipped = 0, spaet = now - playerState.endAt > 1000;   // spät: im Hintergrund hängen geblieben
  while(steps[idx] && steps[idx].phase!=="done" && startAt + steps[idx].duration*1000 <= now){
    startAt += steps[idx].duration*1000; idx++; skipped++;
  }
  if(playerState.rafId) cancelAnimationFrame(playerState.rafId);
  enterStep(idx, { startAt:startAt, quiet: skipped > 0 });
  if((skipped > 0 || spaet) && playerState && !playerState.paused) planAudio(true);   // Tonplan an die echte Position anpassen (auch bei nur einem abgelaufenen Schritt)
  return true;
}
/* Im Hintergrund läuft requestAnimationFrame nicht - ein Intervall hält die Logik
   (Schrittwechsel, Vibration, Ansagen, Tonplan verlängern) trotzdem am Laufen. */
var bgTicker = null;
function startBgTicker(){
  stopBgTicker();
  bgTicker = setInterval(function(){
    if(!playerState){ stopBgTicker(); return; }
    if(document.hidden) advanceIfDue();
  }, 500);
}
function stopBgTicker(){ if(bgTicker){ clearInterval(bgTicker); bgTicker = null; } }
/* Beim Drehen des Handys die Wiederholungs-Quadrate an die neue Breite anpassen */
window.addEventListener("resize", function(){
  if(playerState && playerState.steps[playerState.idx]) updateDots(playerState.steps[playerState.idx]);
});
/* Zurück aus dem Hintergrund (andere App, gesperrter Bildschirm): Anzeige sofort richtigstellen, dann - sobald der Audio-Takt
   wieder läuft - alle Töne neu an die Wanduhr binden (immer, auch wenn gerade ein Schritt nachgeholt wurde) */
function beimWiederkehren(){
  if(document.visibilityState!=="visible" || !playerState || playerState.paused) return;
  advanceIfDue();
  audioBereit(function(){ if(playerState && !playerState.paused) planAudio(true); });
}
document.addEventListener("visibilitychange", beimWiederkehren);
window.addEventListener("pageshow", beimWiederkehren);
window.addEventListener("focus", beimWiederkehren);
var audioPruefAm = 0;
/* Sicherheitsnetz im Bildlauf: läuft der Audio-Takt aus dem Gleichschritt (Context erst nach dem Plan angelaufen,
   Kopfhörer-Wechsel), wird neu geplant; geprüft wird höchstens einmal pro Sekunde */
function audioDriftPruefen(){
  var jetzt = Date.now();
  if(jetzt - audioPruefAm < 1000) return;
  audioPruefAm = jetzt;
  if(Math.abs(audioAbweichung()) > 0.15) planAudio(true);
}

function tickLoop(){
  if(playerState.rafId) cancelAnimationFrame(playerState.rafId);
  function frame(){
    if(!playerState || playerState.paused){ return; }
    var step = playerState.steps[playerState.idx];
    if(!step || step.phase==="done") return;
    if(advanceIfDue()) return;
    audioDriftPruefen();
    var remaining = playerState.endAt - Date.now();
    playerState.remainingMs = remaining;
    var remSec = Math.ceil(remaining/1000);
    var timeEl = document.getElementById("pl-time");
    if(timeEl) timeEl.textContent = fmtTime(remSec);
    ringSet(step.duration ? remaining / (step.duration*1000) : 0);
    // letzte 3 Sekunden: Ring pulsiert im Sekundentakt
    var rw = document.getElementById("pl-ringwrap");
    if(rw) rw.classList.toggle("pulse", remaining <= 3000 && remaining > 0);
    updateProgress();
    playerState.rafId = requestAnimationFrame(frame);
  }
  frame();
}

function bindPlayPause(){
  var btn = document.getElementById("pl-playpause");
  if(!btn) return;
  btn.onclick = function(){
    if(playerState.paused){
      playerState.paused = false;
      playerState.endAt = Date.now() + playerState.remainingMs;
      btn.querySelector("span").innerHTML = ICON_PAUSE;
      requestWakeLock();
      planAudio(true);
      tickLoop();
    } else {
      playerState.remainingMs = Math.max(0, playerState.endAt - Date.now());
      playerState.paused = true;
      schedCancel();
      btn.querySelector("span").innerHTML = ICON_PLAY;
      if(playerState.rafId) cancelAnimationFrame(playerState.rafId);
    }
  };
}

function bindPlayerControls(){
  var root = document.getElementById("playerRoot");
  root.addEventListener("click", function(e){
    if(e.target.closest("[data-exit]")){
      confirmSheet(t("endQ"), t("endText"), t("endBtn"), exitPlayer);
    }
    if(e.target.closest("[data-skip]")){
      if(playerState.rafId) cancelAnimationFrame(playerState.rafId);
      enterStep(playerState.idx+1, { manual:true });
    }
    if(e.target.closest("[data-restart]")){
      var step = playerState.steps[playerState.idx];
      playerState.remainingMs = step.duration*1000;
      playerState.endAt = Date.now() + playerState.remainingMs;
      playerState.paused = false;
      var ppBtn = document.getElementById("pl-playpause");
      if(ppBtn) ppBtn.querySelector("span").innerHTML = ICON_PAUSE;
      if(playerState.rafId) cancelAnimationFrame(playerState.rafId);
      planAudio(true);
      tickLoop();
    }
    if(e.target.closest("[data-plsave]")){   // Training speichern mitten im Workout (Pause und Anzeige laufen weiter)
      openTrainingSpeichern(playerTrainingKontext());
    }
    if(e.target.closest("[data-vol-toggle]")){
      document.getElementById("pl-vol-pop").classList.toggle("hidden");
    }
  });
  var volRange = document.getElementById("pl-vol-range");
  var volVal = document.getElementById("pl-vol-val");
  volRange.addEventListener("input", function(){
    state.db.settings.volume = parseInt(volRange.value)/100;
    volVal.textContent = volRange.value+"%";
    save();
  });
  volRange.addEventListener("change", function(){
    phaseBeep(playerState.steps[playerState.idx].phase==="done" ? "done" : "work");
    planAudio(true);   // eingeplante Töne mit der neuen Lautstärke
  });
}

function exitPlayer(){
  var ziel = (typeof programmKontextFuer === "function" && playerState && programmKontextFuer(programmRefAusQuelle(playerState.source))) ? "#koerper" : "#home";   // aus einem Trainingsplan zurück in die Arena
  try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
  schedCancel();
  stopBgTicker();
  if(playerState && playerState.steps[playerState.idx].phase!=="done") logHistory(true);
  if(playerState && playerState.rafId) cancelAnimationFrame(playerState.rafId);
  playerState = null;
  releaseWakeLock();
  document.getElementById("playerRoot").innerHTML = "";
  leistenFarbeAbgleichen();   // Statusleiste wieder passend zum gewählten Design
  go(ziel);
}

/* ============ Service worker ============ */
function registerSW(){
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").catch(function(){});
  }
}


/* Start: ab hier sind alle Teile geladen */
tonMischen(true);   // von Anfang an: Musik anderer Apps läuft weiter
