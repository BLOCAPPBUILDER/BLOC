"use strict";
/* ============ Install guide ============ */
function stepRow(n, text){
  return '<div class="step-row"><div class="step-num">'+n+'</div><div class="step-text">'+text+'</div></div>';
}
function renderInstallGuide(){
  var androidQuick = (isAndroid() && deferredInstallPrompt) ?
    '<div class="card" style="text-align:center;">'+
      '<button type="button" class="btn btn-primary" data-install-now>'+ICON_DOWNLOAD+' '+t("installNow")+'</button>'+
      '<div style="font-size:13px;color:var(--text-dim);margin-top:8px;">'+t("androidQuickNote")+'</div>'+
    '</div>' : "";
  function steps(list){ return list.map(function(text, i){ return stepRow(i+1, text); }).join(""); }
  app.innerHTML =
    topbar(t("installApp"), { back:"#settings" }) +
    '<div class="section-title">iPhone &amp; iPad (Safari)</div>'+
    '<div class="card">'+steps(t("iosSteps"))+'</div>'+
    '<div class="section-title">Android (Chrome)</div>'+
    androidQuick+
    '<div class="card">'+steps(t("androidSteps"))+'</div>'+
    '<div class="empty" style="padding:16px 8px;">'+t("installOutro")+'</div>';
  bindCommon();
}

/* ============ Confirm sheet ============ */
function confirmSheet(title, desc, actionLabel, onConfirm){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet">'+
    '<h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p>'+
    '<div class="btn-row"><button class="btn btn-secondary" data-cancel>'+t("cancel")+'</button>'+
    '<button class="btn btn-danger" style="background:var(--danger);color:#fff" data-ok>'+esc(actionLabel)+'</button></div>'+
    '</div></div>';
  function close(){ root.innerHTML=""; }
  root.querySelector("[data-cancel]").addEventListener("click", close);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) close(); });
  root.querySelector("[data-ok]").addEventListener("click", function(){ close(); onConfirm(); });
}

/* ============ Sound-Kachel-Menü ============ */
function openSoundSheet(onClose){
  var root = document.getElementById("overlayRoot");
  var current = state.db.settings.soundStyle;
  function tiles(){   // nur noch Klangschale und Triangel
    return Object.keys(SOUND_STYLES).map(function(key){
      return '<button type="button" class="sound-tile'+(key===current?" active":"")+'" data-pick="'+key+'">'+esc(soundLabel(key))+'</button>';
    }).join("");
  }
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet">'+
    '<h3>'+t("chooseSound")+'</h3>'+
    '<div class="sound-tiles">'+tiles()+'</div>'+
    '<button type="button" class="btn btn-secondary" data-cancel style="margin-top:4px;">'+t("close")+'</button>'+
    '</div></div>';
  function close(){ root.innerHTML=""; if(onClose) onClose(); }
  root.querySelector("[data-cancel]").addEventListener("click", close);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) close(); });
  root.querySelectorAll("[data-pick]").forEach(function(btn){
    btn.addEventListener("click", function(){
      state.db.settings.soundStyle = btn.getAttribute("data-pick");
      save();
      phaseBeep("work");
      root.querySelectorAll(".sound-tile").forEach(function(t){ t.classList.remove("active"); });
      btn.classList.add("active");
    });
  });
}

/* ============ Audio & Haptics ============ */
var actx = null, audioBus = null;
function audioCtx(){
  tonStandard();
  if(!actx){ var AC = window.AudioContext || window.webkitAudioContext; if(AC) actx = new AC(); }
  return actx;
}
/* Musik anderer Apps (Spotify & Co.) soll weiterlaufen: Signaltöne und Ansagen mischen sich dazu.
   iPhone/iPad (Safari 16.4+): Audio-Sitzung "ambient" statt Wiedergabe, die andere Apps anhält.
   Nachteil dort: Bei eingeschaltetem Stumm-Schalter bleiben die Töne stumm.
   (Die frühere „Anzeige auf dem Sperrbildschirm“ spielte dafür eine stumme Endlosschleife ab -
   die hielt Spotify an und wurde deshalb 2026-09 ganz entfernt.) */
function tonMischen(mischen){
  try{
    var soll = mischen ? "ambient" : "playback";
    if(navigator.audioSession && navigator.audioSession.type !== soll) navigator.audioSession.type = soll;
  }catch(e){}
}
/* Vor JEDEM Ton und jeder Ansage: mischen.
   Wichtig: auch vor der stummen Freischalt-Ansage beim Tipp auf „Los geht's“ - die kam früher
   vor dem Einstellen der Audio-Sitzung und hielt dadurch Spotify an. */
function tonStandard(){ tonMischen(true); }
/* Gemeinsamer Ausgang aller Klänge: trockenes Signal + Raumhall, am Ende ein Begrenzer,
   der nur kurz vor Übersteuern eingreift (normale Lautstärke bleibt unverändert) */
function soundOut(ctx){
  if(audioBus) return audioBus.input;
  var input = ctx.createGain();
  var wet = ctx.createGain();
  var limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.002; limiter.release.value = 0.12;
  input.connect(limiter);
  if(ctx.createConvolver){
    var room = ctx.createConvolver();
    room.buffer = roomImpulse(ctx);
    input.connect(room); room.connect(wet); wet.connect(limiter);
  }
  limiter.connect(ctx.destination);
  audioBus = { input:input, wet:wet };
  applySpace();
  return input;
}
/* 0.6: Nachhall kurzer Töne etwa 11 dB unter dem Direktschall - hörbarer Raum, noch nicht verwaschen */
function applySpace(){ if(audioBus) audioBus.wet.gain.value = state.db.settings.space ? 0.6 : 0; }
/* Künstlicher Raum als Impulsantwort: kurze Vorverzögerung, einzelne frühe Reflexionen, dann
   abklingendes Rauschen, das mit der Zeit dumpfer wird. Links und rechts verschieden - das
   ergibt die räumliche Breite. */
function roomImpulse(ctx){
  var rate = ctx.sampleRate, len = Math.floor(rate*1.8), pre = Math.floor(rate*0.012);
  var ir = ctx.createBuffer(2, len, rate);
  for(var ch=0; ch<2; ch++){
    var data = ir.getChannelData(ch), lp = 0;
    for(var i=pre; i<len; i++){
      var t = (i-pre)/(len-pre);
      lp += (0.8 - 0.65*t) * ((Math.random()*2-1) - lp);
      data[i] = lp * Math.pow(1-t, 3.2);
    }
    [0.017, 0.026, 0.039, 0.052, 0.071].forEach(function(s, j){
      var idx = Math.floor(rate*(s + ch*0.0035));
      if(idx < len) data[idx] += (j%2 ? -1 : 1) * 0.6 * Math.pow(0.78, j);
    });
  }
  return ir;
}
function withPan(ctx, dest, pan){
  if(!pan || !ctx.createStereoPanner) return dest;
  var p = ctx.createStereoPanner();
  p.pan.value = pan;
  p.connect(dest);
  return p;
}
/* Ein Teilton mit eigenem Ausklingen; mit "beat" zwei leicht verstimmte Töne, die schweben */
function addPartial(ctx, dest, freq, amp, att, decayS, now, beat, pan){
  var g = ctx.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(amp, now + att);
  g.gain.exponentialRampToValueAtTime(0.0001, now + att + decayS);
  g.connect(withPan(ctx, dest, pan));
  var freqs = beat ? [freq, freq + beat] : [freq];
  freqs.forEach(function(fr){
    var o = ctx.createOscillator();
    var share = ctx.createGain();
    o.frequency.value = fr;
    share.gain.value = 1/freqs.length;
    o.connect(share); share.connect(g);
    o.start(now); o.stop(now + att + decayS + 0.05);
  });
}
/* Anschlaggeräusch: metallisch (Hammer auf Glocke) oder weich (Schlegel auf Holz) */
function strikeNoise(ctx, dest, amp, now, soft){
  var len = soft ? 0.02 : 0.035;
  var g = ctx.createGain();
  g.gain.setValueAtTime(amp, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + len);
  g.connect(dest);
  noiseBurst(ctx, g, soft ? { f:1400, dur:len*1000, filterType:"bandpass", q:.9 }
                          : { f:2600, dur:len*1000, filterType:"highpass", q:.7 }, now);
}
/* Wellenformen alter Spielkonsolen: Rechteck mit schmalem Puls (12,5 / 25 / 50 %) und das
   stufige 4-Bit-Dreieck des Bass-Kanals (als Fourier-Reihe, damit nichts klirrt) */
var chipWaves = {};
function chipWave(ctx, name){
  if(chipWaves[name]) return chipWaves[name];
  var N = 64, real = new Float32Array(N), imag = new Float32Array(N), k;
  if(name === "tri4"){
    var M = 512, steps = [];
    for(var j=0;j<M;j++){ var s = Math.floor(j/16); steps.push(((s < 16 ? 15 - s : s - 16)/7.5) - 1); }
    for(k=1;k<N;k++){
      var re = 0, im = 0;
      for(j=0;j<M;j++){ re += steps[j]*Math.cos(2*Math.PI*k*j/M); im += steps[j]*Math.sin(2*Math.PI*k*j/M); }
      real[k] = re*2/M; imag[k] = im*2/M;
    }
  } else {
    var duty = name === "pulse12" ? .125 : name === "pulse25" ? .25 : .5;
    for(k=1;k<N;k++) real[k] = 2/(k*Math.PI) * Math.sin(k*Math.PI*duty);
  }
  chipWaves[name] = ctx.createPeriodicWave(real, imag);
  return chipWaves[name];
}
function noiseBurst(ctx, gain, n, now){
  var durSec = n.dur/1000;
  var buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate*(durSec+0.05)), ctx.sampleRate);
  var data = buf.getChannelData(0);
  for(var i=0;i<data.length;i++){ data[i] = Math.random()*2-1; }
  var src = ctx.createBufferSource();
  src.buffer = buf;
  var filter = ctx.createBiquadFilter();
  filter.type = n.filterType || "bandpass";
  filter.frequency.value = n.f || 1200;
  filter.Q.value = n.q || 1;
  src.connect(filter); filter.connect(gain);
  src.start(now);
  src.stop(now + durSec + 0.05);
}
/* Spielt eine Notiz {f,dur,v,type,sweepTo,noise,filterType,q}: einfacher Ton, Pitch-Sweep oder
   gefiltertes Rauschen. Für die natürlichen Klänge zusätzlich:
   partials (Teiltöne mit eigenem Ausklingen), beat (Schwebung), strike (metallischer Anschlag),
   mallet (weicher Schlegel-Anschlag), att (Anschlagzeit ms), hold (Ton halten ms),
   trill (Flattern/Vibrato), breath (Atemrauschen), lp (Tiefpass gegen Schärfe),
   bursts (mehrere schnelle Rauschstöße, z.B. Klatschen), wave (Soundchip-Wellenform),
   pan (Position im Stereobild).
   at: Startzeit im Audio-Takt (ctx.currentTime-Skala) - so lassen sich Töne im Voraus einplanen.
   Rückgabe: der Ausgangsregler des Tons; disconnect() darauf bringt einen geplanten Ton zum Schweigen. */
function tone(n, at){
  if(!state.db.settings.sound) return null;
  var ctx = audioCtx();
  if(!ctx) return null;
  if(ctx.state==="suspended" || ctx.state==="interrupted") try{ ctx.resume(); }catch(e){}   // „interrupted“: iOS nach App-Wechsel oder Anruf
  var level = (n.v==null?0.7:n.v) * (state.db.settings.volume!=null ? state.db.settings.volume : 1);
  if(level<=0) return null;
  var now = at != null ? Math.max(at, ctx.currentTime) : ctx.currentTime, durS = n.dur/1000, att = (n.att||8)/1000, end = now + durS;
  var gain = ctx.createGain();
  gain.connect(withPan(ctx, soundOut(ctx), n.pan));

  if(n.partials){
    gain.gain.value = level;
    if(n.strike) strikeNoise(ctx, gain, n.strike, now);
    if(n.mallet) strikeNoise(ctx, gain, n.mallet, now, true);
    var sum = n.partials.reduce(function(a, p){ return a + p[1]; }, 0);
    n.partials.forEach(function(p, i){
      /* Obertöne leicht links/rechts verteilt: der Klang bekommt Breite */
      var spread = i ? (i%2 ? -1 : 1) * Math.min(.3, .1*i) : 0;
      addPartial(ctx, gain, n.f*p[0], p[1]*1.4/sum, att, durS*p[2], now, n.beat||0, spread);
    });
    return gain;
  }

  if(n.bursts){
    /* Stöße sample-genau im Audio-Takt geplant - ein Timer wäre für 9 ms Abstand zu ungenau */
    n.bursts.forEach(function(ms, i){
      var t0 = now + ms/1000, last = i === n.bursts.length-1, len = last ? durS : 0.011;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(level*(last ? 1 : .8), t0 + 0.001);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      g.connect(gain);
      noiseBurst(ctx, g, { f:n.f, q:n.q, filterType:n.filterType, dur:len*1000 }, t0);
    });
    return gain;
  }

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(level, now+att);
  if(n.hold) gain.gain.setValueAtTime(level, now + n.hold/1000);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  if(n.noise){
    noiseBurst(ctx, gain, n, now);
    return gain;
  }
  var osc = ctx.createOscillator();
  if(n.wave) osc.setPeriodicWave(chipWave(ctx, n.wave));
  else osc.type = n.type || "sine";
  osc.frequency.setValueAtTime(n.f, now);
  if(n.sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1,n.sweepTo), end);
  if(n.trill){
    var lfo = ctx.createOscillator(), depth = ctx.createGain();
    lfo.frequency.value = n.trill.rate;
    depth.gain.value = n.trill.depth;
    lfo.connect(depth); depth.connect(osc.frequency);
    lfo.start(now); lfo.stop(end + 0.05);
  }
  if(n.lp){
    var soft = ctx.createBiquadFilter();
    soft.type = "lowpass";
    soft.frequency.value = n.lp;
    osc.connect(soft); soft.connect(gain);
  } else {
    osc.connect(gain);
  }
  osc.start(now);
  osc.stop(end + 0.02);
  if(n.breath){
    var air = ctx.createGain();
    air.gain.value = n.breath;
    air.connect(gain);
    noiseBurst(ctx, air, { f:n.f, dur:n.dur, filterType:"bandpass", q:2.5 }, now);
  }
  return gain;
}
function currentSoundStyle(){
  return SOUND_STYLES[state.db.settings.soundStyle] || SOUND_STYLES.klangschale;
}
function playNotes(notes){
  tonStandard();
  if(!notes) return;
  notes.forEach(function(n){
    setTimeout(function(){ tone(n); }, n.d);
  });
}
/* Countdown-Töne (3, 2, 1) etwa so laut wie der Signalton danach: je Klangstil einmal hochgerechnet
   (lauteste Note des Starttons ÷ lauteste Note des Ticks, höchstens ×3, nie leiser als vorher) */
function tickNotes(style){
  style = style || currentSoundStyle();
  if(!style._tickLaut){
    function maxV(ns){ return (ns || []).reduce(function(m, n){ return Math.max(m, n.v == null ? .7 : n.v); }, 0); }
    var tv = maxV(style.tick), f = tv ? clamp(maxV(style.work)*.9/tv, 1, 3) : 1;
    style._tickLaut = (style.tick || []).map(function(n){ return Object.assign({}, n, { v:(n.v == null ? .7 : n.v)*f }); });
  }
  return style._tickLaut;
}
function tick(){ playNotes(tickNotes()); }
function phaseBeep(kind){ playNotes(kind === "tick" ? tickNotes() : currentSoundStyle()[kind]); }
function vibrate(pattern){
  if(!state.db.settings.vibration) return;
  if(navigator.vibrate) try{ navigator.vibrate(pattern); }catch(e){}
}

/* ============ Vorausgeplante Signaltöne ============
   Browser drosseln Timer, sobald die App im Hintergrund ist oder der Bildschirm aus geht -
   ein Signalton per setTimeout käme dann zu spät oder gar nicht. Deshalb werden alle Töne
   der nächsten Minuten (Phasenwechsel + Countdown-Piepsen) direkt im Audio-Takt eingeplant.
   Die Audio-Engine spielt sie pünktlich ab, auch wenn die Seite selbst gerade nicht rechnet.
   Pause, Weiter, "Phase neu", Lautstärke: Plan verwerfen und neu erstellen. */
var AUDIO_HORIZON_MS = 10*60*1000;
var sched = { list:[], upto:-1 };   // list: { at, node }; upto: letzter eingeplanter Schritt
function schedCancel(){
  var now = actx ? actx.currentTime : 0;
  sched.list.forEach(function(x){ if(x.at > now + 0.02) try{ x.node.disconnect(); }catch(e){} });
  sched.list = [];
  sched.upto = -1;
}
function schedNotes(notes, wallMs){
  var ctx = audioCtx();
  if(!ctx || !notes) return;
  var base = ctx.currentTime + (wallMs - Date.now())/1000;
  notes.forEach(function(n){
    var at = base + (n.d||0)/1000;
    if(at < ctx.currentTime - 0.08) return;   // schon vorbei
    var g = tone(n, at);
    if(g) sched.list.push({ at:at, node:g });
  });
}
function schedCountdown(endMs, step){
  if(step.phase==="done") return;   // Countdown-Pieps sind immer an (nicht mehr einstellbar)
  for(var k=3;k>=1;k--){
    var at = endMs - k*1000;
    if(step.duration > k && at >= Date.now() - 50) schedNotes(tickNotes(), at);
  }
}
/* full=true: alles Künftige neu planen (Countdown des laufenden Schritts inklusive);
   full=false: nur hinten anhängen, wenn der Plan zur Neige geht */
function planAudio(full){
  if(!playerState || playerState.paused) return;
  if(!state.db.settings.sound || !audioCtx()) return;
  var steps = playerState.steps, i = playerState.idx;
  if(full) schedCancel();
  else if(sched.upto > -1 && sched.upto - i >= 4) return;
  var style = currentSoundStyle(), horizon = Date.now() + AUDIO_HORIZON_MS;
  if(full) schedCountdown(playerState.endAt, steps[i]);
  var tEnd = playerState.endAt;
  for(var j=i+1; j<steps.length; j++){
    var st = steps[j];
    if(j > sched.upto){
      schedNotes(style[st.phase], tEnd);
      schedCountdown(tEnd + st.duration*1000, st);
      sched.upto = j;
    }
    if(st.phase==="done") break;
    tEnd += st.duration*1000;
    if(tEnd > horizon && j > i+4) break;
  }
  if(full) sched.ref = { ct:actx.currentTime, wall:Date.now() };   // Bezugspunkt, an dem sich Audio-Takt und Wanduhr gleichen
  // abgespielte Einträge vergessen
  var now = actx.currentTime;
  sched.list = sched.list.filter(function(x){ return x.at > now - 5; });
}
/* Der Audio-Takt (currentTime) steht still, solange der Context angehalten ist (App im Hintergrund, Bildschirm gesperrt, Mail-Check);
   die Anzeige läuft über die Wanduhr weiter. Danach käme jeder vorab eingeplante Ton um die Standzeit zu spät.
   audioAbweichung: Sekunden, um die der Audio-Takt seit dem letzten vollen Plan hinter (negativ) der Wanduhr liegt. */
function audioAbweichung(){
  if(!actx || !sched.ref || actx.state !== "running") return 0;
  return (actx.currentTime - sched.ref.ct) - (Date.now() - sched.ref.wall)/1000;
}
/* Erst planen, wenn der Audio-Takt wirklich läuft (nach 1,5 s trotzdem, falls resume() hängt - iOS ohne neue Berührung) */
function audioBereit(fn){
  var ctx = audioCtx();
  if(!ctx || ctx.state === "running"){ fn(); return; }
  var fertig = false;
  function los(){ if(!fertig){ fertig = true; fn(); } }
  try{ var p = ctx.resume(); if(p && p.then) p.then(los, los); }catch(e){}
  setTimeout(los, 1500);
}

/* ============ Wake Lock ============ */
var wakeLock = null;
function requestWakeLock(){
  if(nativWach("timer", true)) return;   // App: Display-an-Dienst statt Wake Lock des Browsers
  if(!("wakeLock" in navigator)) return;
  navigator.wakeLock.request("screen").then(function(wl){ wakeLock = wl; }).catch(function(){});
}
function releaseWakeLock(){
  if(nativWach("timer", false)) return;
  if(wakeLock){ wakeLock.release().catch(function(){}); wakeLock = null; }
}
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState==="visible" && playerState && playerState.running) requestWakeLock();
});

