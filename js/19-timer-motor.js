"use strict";
/* ============ Timer engine ============ */
function buildSteps(w){
  var steps = [];
  var mitGew = !!w.mitGewicht;   // Plan-Workout: Gewicht auch bei Freiluft-Übungen eintragen
  w = { id:w.id, name:w.name, items:workoutItems(w) };   // Blöcke mit Wiederholungen (times) hintereinander ausgeschrieben
  var b0 = findBlock(w.items[0] ? w.items[0].blockId : null);
  steps.push({ phase:"prep", label:"Bereit machen", duration:5, blockName: b0 ? b0.name : "", ex: b0 && b0.ex || "", kg: "", exNr:1 });
  var exNr = 0;   // die wievielte Übung (Block) im Workout - nur für die Anzeige oben
  for(var i=0;i<w.items.length;i++){
    var it = w.items[i];
    var b = findBlock(it.blockId);
    if(!b) continue;
    exNr++;
    for(var r=0;r<b.reps;r++){
      var bn = b.sides ? b.name+" · "+(r%2===0 ? t("left") : t("right")) : b.name;
      steps.push({ phase:"work", label:b.name, blockName:bn, duration:b.workSec, rep:r+1, totalReps:b.reps,
                   hint:b.hint||"", ex:b.ex||"", side: b.sides ? (r%2===0 ? "left" : "right") : "", stretch: exIsStretch(b.ex), kg: "", exNr:exNr });
      if(r < b.reps-1){
        steps.push({ phase:"rest", label:b.name, blockName:b.name, duration:b.restSec, rep:r+1, totalReps:b.reps, ex:b.ex||"",
                     side: b.sides ? (r%2===0 ? "left" : "right") : "", stretch: exIsStretch(b.ex), kg: "", exNr:exNr });
      }
    }
    if(i < w.items.length-1 && (it.restAfterSec>0 || it.nextBloc)){
      var nb = findBlock(w.items[i+1].blockId);
      steps.push({ phase:"blockrest", label:"Blockpause", titel: it.nextBloc ? t("blocBereit", { name:it.nextBloc }) : "", blockName: nb?nb.name:"", duration:it.nextBloc ? Math.max(it.restAfterSec, 30) : it.restAfterSec, ex: nb && nb.ex || "", kg: "", exNr:exNr+1 });
    }
  }
  steps.push({ phase:"done", label:"Fertig", duration:0, exNr:exNr+1 });
  steps.exCount = exNr;
  /* Zähler oben im Timer: nur Übungseinheiten (Arbeitsphasen), Pausen zählen nicht mit.
     In Vorbereitung und Pausen steht die Nummer der nächsten Einheit. */
  var units = 0;
  steps.forEach(function(st){ if(st.phase==="work") st.unit = ++units; });
  var next = units;
  for(var k=steps.length-1;k>=0;k--){
    if(steps[k].phase==="work") next = steps[k].unit;
    else steps[k].unit = steps[k].phase==="done" ? units : next;
  }
  steps.units = units;
  return steps;
}

var playerState = null;

function workoutForSource(source){
  if(!source) return null;
  if(source.type==="draft"){
    return coverDraft && coverDraft.items.length ? draftRun(coverDraft) : null;
  }
  if(source.type==="mine"){
    var mw = findMy(source.id);
    return mw ? myRun(mw) : null;
  }
  if(source.type==="libworkout"){
    var lw = findLibWorkout(source.id);
    return lw ? libWorkoutRun(lw) : null;
  }
  if(source.type==="exercise"){
    var ex = findExercise(source.id);
    return ex ? exerciseRun(ex) : null;
  }
  if(source.type==="studio"){
    var sx = findExercise(source.id);
    return sx ? studioRun(sx) : null;
  }
  if(source.type==="block"){
    var b = findBlock(source.id);
    return b ? { id:"quick-"+b.id, name:b.name, items:[{blockId:b.id, restAfterSec:0}] } : null;
  }
  return findWorkout(source.id);
}

function startPlayer(workoutId){ launchFromSource({ type:"workout", id:workoutId }); }
function startBlockPlayer(blockId){ launchFromSource({ type:"block", id:blockId }); }

function launchFromSource(source){
  var w = workoutForSource(source);
  if(!w || !w.items.length){ go("#home"); return; }
  launchPlayer(w, source);
}

function launchPlayer(w, source){
  var steps = buildSteps(w);
  if(document.getElementById("satzRoot")){   // kommt der Timer aus dem Satz-Training (Weiter mit …): dessen Seite räumen, sie läge sonst über dem Timer
    studioPauseStop(); if(satzUhr){ clearInterval(satzUhr); satzUhr = 0; }
    app.innerHTML = "";
  }
  playerState = {
    workout: w, steps: steps, idx: 0,
    running: true, paused: false,
    endAt: 0, remainingMs: steps[0].duration*1000,
    rafId: null, source: source
  };
  document.getElementById("playerRoot").innerHTML = playerTemplate();
  leistenFarbeAbgleichen();   // Statusleiste dunkel wie der Timer
  bindPlayerControls();
  progChipBinden(document.getElementById("playerRoot"), programmRefAusQuelle(source), exitPlayer);
  var ctx = audioCtx();   // noch im Tipp freischalten (iOS)
  if(ctx && ctx.state==="suspended") try{ ctx.resume(); }catch(e){}
  schedCancel();
  rememberLastRun(w, source);
  enterStep(0, { manual:true });
  requestWakeLock();
  startBgTicker();
}


/* Zuletzt gestartet: bestimmt die Reihenfolge der Favoriten auf der Startseite.
   (Die frühere Karte „Nochmal wie letztes Mal“ gibt es auf der neuen Startseite nicht mehr.) */
function rememberLastRun(w, source){
  if(!source) return;
  markFavUsed(source);
  delete state.db.settings.lastRun;
  save();
}

/* Timer: ein ruhiges dunkles Glas-Design in allen Phasen, die Farbe wechselt nicht (nur die Beschriftung sagt, was gerade ist) */
function phaseVars(phase){
  var lb = { work:t("phWork"), rest:t("phRest"), blockrest:t("phBlockrest"), prep:t("phPrep") };
  return { bg:"#0b0d10", text:"#f4f4f6", label:lb[phase] || "" };
}

/* Wohin gehört ein Training aus dem Timer: ein Plan-Workout zu seinem Plan, eine einzelne Übung zum geöffneten Plan oder zum freien Training des Tages */
function playerTrainingKontext(){
  var src = playerState && playerState.source, p = null;
  if(src && src.type === "mine"){ var mw = findMy(src.id); if(mw && mw.fromPlan) p = stPlanFind(mw.fromPlan); }
  if(p) return { plan:p, ids:planKetteIds(p) };   // der BLOC und die folgenden BLOCs
  return trainingKontext(src && src.type === "studio" ? src.id : null);
}
function playerTrackt(){   // im Timer gibt es kein Eintragen von Sätzen mehr (Timer = nur Zeit); gespeichert wird beim Satz-Training
  return false;
}
/* Der vom Timer erzeugte Block „Sätze à 30 s“ zeigt seinen Namen im Training nicht (er steht schon in der Liste) */
function blockNameAnzeige(n){ return /^(Sätze à|Sets of) \d+ s$/.test(n || "") ? "" : (n || ""); }
function playerTemplate(){
  var vol = Math.round((state.db.settings.volume!=null?state.db.settings.volume:1)*100);
  return '<div class="player" id="playerEl">'+
    '<div id="pl-bgs" aria-hidden="true"></div>'+
    '<div class="player-top">'+
      '<button class="exit" data-exit title="'+t("endBtn")+'">&times;</button>'+
      '<div class="pl-mitte"><div class="ex-dots" id="pl-exdots" role="img"></div></div>'+
      (playerTrackt() ? '<button class="exit" data-plsave title="'+esc(t("trSpeichern"))+'" aria-label="'+esc(t("trSpeichern"))+'">'+ICON_SAVE+'</button>' : '')+
      '<button class="exit" data-vol-toggle title="'+t("volume")+'">'+ICON_VOLUME+'</button>'+
    '</div>'+
    '<div class="vol-popover hidden" id="pl-vol-pop">'+ICON_VOLUME+
      '<input type="range" id="pl-vol-range" min="0" max="100" step="5" value="'+vol+'">'+
      '<span id="pl-vol-val">'+vol+'%</span>'+
    '</div>'+
    '<div class="progressbar"><div class="progressbar-fill" id="pl-progress" style="width:0%"></div></div>'+
    '<div class="pl-logo" aria-hidden="true">BLOC</div>'+progChipHTML(programmRefAusQuelle(playerState && playerState.source))+
    '<div id="pl-body" class="player-mid"></div>'+
    '</div>';
}

/* Fortschrittsring (modernes Design): zwei Halbkreise, die sich hinter einer Halbmaske drehen.
   Der Ring zeigt die Restzeit ab 12 Uhr im Uhrzeigersinn; bewegt wird nur per rotate (transform),
   ein Punkt am Ende sorgt für die runde Kappe. */
function ringHTML(){
  return '<svg class="ring2" viewBox="0 0 120 120" aria-hidden="true">'+
    '<defs><clipPath id="rc-r"><rect x="60" y="0" width="61" height="120"/></clipPath>'+
      '<clipPath id="rc-l"><rect x="-1" y="0" width="61" height="120"/></clipPath></defs>'+
    '<circle class="ring-bg" cx="60" cy="60" r="54"></circle>'+
    '<g clip-path="url(#rc-r)"><path class="ring-half" id="pl-ring-r" d="M60 114A54 54 0 0 1 60 6"/></g>'+
    '<g clip-path="url(#rc-l)"><path class="ring-half" id="pl-ring-l" d="M60 6A54 54 0 0 1 60 114"/></g>'+
    '<circle class="ring-cap" id="pl-ring-c0" cx="60" cy="6" r="3"/>'+
    '<circle class="ring-cap" id="pl-ring-c1" cx="60" cy="6" r="3"/>'+
    '<circle class="ring-cap ring-seam" id="pl-ring-c2" cx="60" cy="114" r="3"/>'+   // deckt die Naht bei 6 Uhr ab
  '</svg>';
}
function ringSet(frac){
  var r = document.getElementById("pl-ring-r");
  if(!r) return;
  var a = clamp(frac, 0, 1)*360;
  r.setAttribute("transform", "rotate("+Math.min(a, 180).toFixed(2)+" 60 60)");
  document.getElementById("pl-ring-l").setAttribute("transform", "rotate("+Math.max(0, a-180).toFixed(2)+" 60 60)");
  var c1 = document.getElementById("pl-ring-c1");
  c1.setAttribute("transform", "rotate("+a.toFixed(2)+" 60 60)");
  var sichtbar = a > .5 ? "1" : "0";
  c1.style.opacity = sichtbar; document.getElementById("pl-ring-c0").style.opacity = sichtbar;
  document.getElementById("pl-ring-c2").style.opacity = a > 181 ? "1" : "0";
}
var UA_FLAG_BG = "linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.2)), var(--ua-flag) center / cover no-repeat";
/* Phasenfarbe weich überblenden: neue Farbfläche blendet über der alten ein (nur opacity) */
function phaseBg(color){
  var host = document.getElementById("pl-bgs");
  if(!host) return;
  var top = host.lastElementChild;
  if(top && top.getAttribute("data-c") === color) return;
  var el = document.createElement("div");
  el.className = "pl-bg"; el.style.background = color; el.setAttribute("data-c", color);
  host.appendChild(el);
  var alte = Array.prototype.slice.call(host.children, 0, -1);
  setTimeout(function(){ alte.forEach(function(o){ o.remove(); }); }, 650);
}

function stepBodyHTML(step){
  if(step.phase==="done"){
    var total = fmtDuration(workoutDuration(playerState.workout));
    return '<div class="done-screen"><h2>'+t("doneTitle")+'</h2><p>'+esc(playerState.workout.name)+' &middot; '+total+'</p>'+
      '<div class="btn-row" style="width:100%;max-width:300px;">'+
        '<button class="btn btn-secondary" data-again>'+ICON_RESTART+' '+t("again")+'</button>'+
        '<button class="btn btn-primary" data-finish>'+t("finish")+'</button>'+
      '</div></div>';
  }
  var pv = phaseVars(step.phase);
  var repInfo = step.totalReps ? '<div class="rep-dots" id="pl-dots"></div>' : "";
  // Vorbereitung und Blockpause: die Figur macht die kommende Übung vor und steht im Mittelpunkt
  var vorschau = (step.phase==="blockrest" || step.phase==="prep") && step.ex && ILLU[step.ex];
  var timeHTML = '<div class="ring-wrap'+(vorschau ? ' mit-figur' : '')+'" id="pl-ringwrap">'+ringHTML()+
        (vorschau ? illuHTML(step.ex, "pl-vorschau") : '')+'<div class="time" id="pl-time">'+esc(fmtTime(step.duration))+'</div></div>';
  var phLabel = step.titel || pv.label;
  if(step.stretch){
    if(step.phase==="work") phLabel = t("phHold");
    else if(step.phase==="rest") phLabel = t(step.side ? "phSwitch" : "phRelax");
  }
  /* pl-a / pl-b sind im Hochformat unsichtbar (display:contents) - im Querformat
     steht die Uhr links, Beschriftung und Tasten rechts daneben */
  return '<div class="pl-a"><div class="phase-label">'+phLabel+'</div>'+
    '<div class="block-label">'+esc(blockNameAnzeige(step.blockName))+
      (step.ex && EX_INFO[step.ex] ? ' <button type="button" class="info-btn" data-plinfo="'+step.ex+'" title="'+t("info")+'" aria-label="'+t("info")+'">i</button>' : '')+(step.kg ? '<small class="pl-kg">'+esc(step.kg)+'</small>' : '')+'</div>'+
    (step.kg && step.ex && step.phase !== "done" ? '<button type="button" class="pl-kg-btn" data-plkg="'+step.ex+'">'+esc(t("stSetDone"))+'</button>' : '')+
    (step.phase==="work" && step.ex && ILLU[step.ex] ? illuHTML(step.ex, "pl-illu") : "")+
    '</div>'+   // Hinweis zur Übung steht in der Info (ⓘ), im Timer bleibt es ruhig
    timeHTML+
    '<div class="pl-b">'+repInfo+
    '<div class="next-up" id="pl-next"></div>'+
    '<div class="player-controls">'+
      '<button class="ctrl-btn" data-skip title="'+t("skip")+'">'+ICON_SKIP+'</button>'+
      '<button class="ctrl-btn main" id="pl-playpause" title="'+t("pause")+'"><span>'+ICON_PAUSE+'</span></button>'+
      '<button class="ctrl-btn" data-restart title="'+t("restartPhase")+'">'+ICON_RESTART+'</button>'+
    '</div></div>';
}

function nextStepPreview(idx){
  var steps = playerState.steps;
  if(idx+1 >= steps.length) return "";
  var n = steps[idx+1];
  if(n.phase==="done") return t("thenDone");
  function welche(st){ return st.phase==="prep" || st.phase==="blockrest" ? st.blockName : st.label; }
  if(welche(n) === welche(steps[idx])) return "";
  var time = " ("+fmtTime(n.duration)+")";
  /* Bei Arbeitsphasen nur der Blockname - „Als nächstes: Los!“ klänge holprig */
  if(n.phase==="work") return t("upNext")+" "+esc(n.blockName||"")+time;
  return t("upNext")+" "+phaseVars(n.phase).label+(n.blockName? SEP+esc(n.blockName):"")+time;
}

/* opt.manual: Start/Weiter - Signalton sofort spielen und Tonplan neu erstellen.
   Sonst (Zeit abgelaufen) kam der Signalton schon aus dem Tonplan.
   opt.startAt: wann der Schritt eigentlich begann (Date.now()-Skala) - beim Aufholen
   nach dem Hintergrund liegt das in der Vergangenheit, die Restzeit stimmt trotzdem.
   opt.quiet: keine Vibration/Ansage (übersprungene Schritte im Hintergrund) */
function enterStep(idx, opt){
  opt = opt || {};
  var steps = playerState.steps;
  if(idx >= steps.length) idx = steps.length-1;
  playerState.idx = idx;
  var step = steps[idx];
  var el = document.getElementById("playerEl");
  var pv = phaseVars(step.phase);
  el.style.setProperty("--phase-bg", pv.bg);
  el.style.setProperty("--phase-text", pv.text);
  el.setAttribute("data-phase", step.phase);
  el.style.setProperty("--pl-foto", "url(img/neu-p-freiluft-meer.jpg)");   // helles, bläuliches, geblurrtes Foto (Meer) hinter dem Glas
  // Ukraine Twist: während der ganzen Übung die wehende Flagge als Hintergrund
  var ua = step.ex === "russian-twists" && (step.phase === "work" || step.phase === "rest");
  el.classList.toggle("ua", ua);
  if(ua) el.style.setProperty("--phase-text", "#ffffff");
  phaseBg(ua ? UA_FLAG_BG : pv.bg);
  var body = document.getElementById("pl-body");
  body.innerHTML = stepBodyHTML(step);
  body.classList.remove("step-in"); void body.offsetWidth; body.classList.add("step-in");   // neuer Schritt blendet ein
  ringSet(1);
  // Fitnessstudio-Übung im Timer: Satz direkt eintragen (Gewicht × Wiederholungen); danach steht der neue letzte Satz unter dem Namen
  var kgBtn = document.querySelector("#pl-body [data-plkg]");
  if(kgBtn) kgBtn.addEventListener("click", function(){
    var exId = kgBtn.getAttribute("data-plkg");
    openGewichtSheet(exId, function(){
      var txt = gymSatzText(exId, !!playerState.workout.mitGewicht);
      playerState.steps.forEach(function(s){ if(s.ex === exId) s.kg = txt; });
      var el = document.querySelector("#pl-body .pl-kg"); if(el) el.textContent = txt;
    });
  });
  var infoBtn = document.querySelector("#pl-body [data-plinfo]");
  if(infoBtn) infoBtn.addEventListener("click", function(){ openExInfo(infoBtn.getAttribute("data-plinfo"), true); });
  updateExDots(step);

  if(step.phase!=="done"){
    playerState.endAt = (opt.startAt || Date.now()) + step.duration*1000;
    playerState.remainingMs = playerState.endAt - Date.now();
    playerState.paused = false;
    document.getElementById("pl-next").innerHTML = nextStepPreview(idx);
    updateDots(step);
    if(opt.manual){ phaseBeep(step.phase); planAudio(true); }
    else planAudio(false);
    if(!opt.quiet){
      vibrate(step.phase==="work" ? [40] : [20,60,20]);
      if(step.phase!=="work") announceStep(idx);
    }
    bindPlayPause();
    tickLoop();
  } else {
    releaseWakeLock();
    stopBgTicker();
    if(opt.manual) phaseBeep("done");
    logHistory(false);
    announceStep(idx);
    vibrate([60,80,60,80,120]);
    var doneBody = document.getElementById("pl-body");
    if(playerState.progWeiter === undefined) playerState.progWeiter = programmWeiter(programmRefAusQuelle(playerState.source));
    var pw = playerState.progWeiter, pwBtn = null;
    if(pw){
      doneBody.querySelector(".btn-row").insertAdjacentHTML("afterbegin", '<button class="btn btn-primary" data-progweiter style="width:100%">'+esc(t("progWeiter", { n:pw.name }))+' ›</button>');
      pwBtn = doneBody.querySelector("[data-progweiter]");
      pwBtn.addEventListener("click", function(){ exitPlayer(); pw.start(true); });
    }
    var finishBtn = doneBody.querySelector("[data-finish]");
    if(finishBtn) finishBtn.addEventListener("click", exitPlayer);
    var againBtn = doneBody.querySelector("[data-again]");
    if(againBtn) againBtn.addEventListener("click", function(){
      var source = playerState.source;
      if(playerState.rafId) cancelAnimationFrame(playerState.rafId);
      launchFromSource(source);
    });
  }
  updateProgress();
}

function updateDots(step){
  var wrap = document.getElementById("pl-dots");
  if(!wrap) return;
  /* So groß wie der Platz erlaubt (bis 34 px); bei vielen Wiederholungen kleiner, notfalls zweireihig */
  var n = step.totalReps, gap = n > 12 ? 6 : 10;
  var host = wrap.parentNode.clientWidth ? wrap.parentNode : wrap.closest(".player-mid");   // pl-b ist im Hochformat display:contents
  var avail = Math.min(host.clientWidth - 70, 340);
  var size = Math.max(14, Math.min(34, Math.floor((avail - (n-1)*gap)/n)));
  wrap.style.gap = gap+"px";
  var html = "";
  var cur = step.phase === "rest" ? step.rep+1 : step.rep;   // Pause: der kommende Satz blinkt, der gerade geschaffte ist erledigt
  for(var i=1;i<=n;i++){
    var cls = i<cur ? "done" : (i===cur ? "now":"");
    html += '<span class="'+cls+'" style="width:'+size+'px;height:'+size+'px;border-radius:'+Math.max(3, Math.round(size*.15))+'px"></span>';
  }
  wrap.innerHTML = html;
}

/* Oben: ein Kreis je Übung - erledigte kräftig, die aktuelle größer, kommende blass.
   In der Pause vor einer neuen Übung pulsiert deren Kreis. Nur bei Workouts mit mehreren Übungen. */
function updateExDots(step){
  var wrap = document.getElementById("pl-exdots");
  if(!wrap) return;
  var n = playerState.steps.exCount || 0;
  if(n < 2 || n > 30){ wrap.innerHTML = ""; wrap.style.display = "none"; return; }
  wrap.style.display = "";
  var cur = step.exNr || 1, bald = step.phase === "blockrest" || step.phase === "prep";
  var avail = Math.max(60, (wrap.parentNode.clientWidth || 220) - 4), gap = n > 12 ? 5 : 8;
  var size = Math.max(6, Math.min(14, Math.floor((avail - (n-1)*gap)/n)));
  wrap.setAttribute("aria-label", t("exOf", { i:Math.min(cur, n), n:n }));
  wrap.style.gap = gap+"px";
  var html = "";
  for(var i=1;i<=n;i++){
    var cls = i < cur ? "done" : i === cur ? "now"+(bald ? " bald" : "") : "";
    html += '<span class="'+cls+'" style="width:'+size+'px;height:'+size+'px"></span>';
  }
  wrap.innerHTML = html;
}

function updateProgress(){
  var steps = playerState.steps;
  var totalDur = 0, elapsed = 0;
  for(var i=0;i<steps.length-1;i++){ totalDur += steps[i].duration; }
  for(i=0;i<playerState.idx;i++){ elapsed += steps[i].duration; }
  var step = steps[playerState.idx];
  if(step && step.phase!=="done"){
    var doneMs = (step.duration*1000 - Math.max(0,playerState.remainingMs));
    elapsed += doneMs/1000;
  } else {
    elapsed = totalDur;
  }
  var pct = totalDur>0 ? Math.min(100, elapsed/totalDur*100) : 100;
  var bar = document.getElementById("pl-progress");
  if(bar) bar.style.width = pct+"%";
}

