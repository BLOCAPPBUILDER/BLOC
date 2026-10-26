"use strict";
/* ============ Einführung ============
   Fünf Seiten: Willkommen und je Bereich eine Seite in dessen Farbe mit dessen Symbol. Die Zahlen zählt die App
   selbst, damit sie mit neuen Übungen und Programmen stimmen. Beim ersten Start von selbst, sonst über die Einstellungen. */
var ICON_BAUSTEINE = '<rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><rect x="8" y="3" width="8" height="8" rx="1.5"/>';
var ICON_PERSON = '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>';
/* Seite 1: Sprache wählen (wirkt sofort, die Einführung zeichnet sich in der neuen Sprache neu) */
function introSpracheHTML(){
  return '<div class="theme-pick lang-pick intro-sprache" role="group" aria-label="'+esc(t("language"))+'">'+
    [["de", "Deutsch"], ["en", "English"]].map(function(x){
      return '<button type="button" data-introlang="'+x[0]+'" aria-pressed="'+(currentLang() === x[0])+'" class="'+(currentLang() === x[0] ? "active" : "")+'">'+x[1]+'</button>';
    }).join("")+'</div>';
}
/* Seite 2: Name, Gewicht, Größe - freiwillig, nur lokal; Gewicht und Größe nutzt die Kalorien-Schätzung (settings.koerper), der Name die Begrüßung (settings.name) */
function introProfilHTML(){
  var s = state.db.settings, k = s.koerper || {};
  function feld(id, label, wert, min, max){
    return '<label class="koerper-feld"><span>'+esc(label)+'</span><input type="number" inputmode="decimal" id="'+id+'" min="'+min+'" max="'+max+'" value="'+(wert ? esc(String(wert)) : "")+'"></label>';
  }
  return '<div class="koerper-form intro-profil"><label class="koerper-feld"><span>'+esc(t("koerperName"))+'</span>'+
    '<input type="text" id="i-name" maxlength="30" autocomplete="given-name" value="'+esc(s.name || "")+'"></label>'+
    feld("i-kg", t("koerperKg"), k.kg, 30, 250)+feld("i-cm", t("koerperCm"), k.cm, 120, 230)+'</div>';
}
function introProfilSpeichern(wurzel){
  var n = wurzel.querySelector("#i-name");
  if(!n) return;   // diese Seite war nicht zu sehen
  var s = state.db.settings, kk = s.koerper = s.koerper || {};
  function zahl(id, lo, hi){ var v = parseFloat(String(wurzel.querySelector("#"+id).value).replace(",", ".")); return v >= lo && v <= hi ? v : 0; }
  var name = String(n.value).replace(/\s+/g, " ").trim().slice(0, 30), kg = zahl("i-kg", 30, 250), cm = zahl("i-cm", 120, 230);
  if(name || n.value === "") s.name = name;
  if(kg) kk.kg = Math.round(kg*10)/10;
  if(cm) kk.cm = Math.round(cm);
  save();
}
/* Seite 3: Aufbau als kleines selbstgezeichnetes Schaubild (nur Stil nach der Vorlage von Kevin): Trainingsplan → Trainingstage (Tag A/B) → BLOCs mit Übungen.
   Die Beschriftungen kommen aus texte.js, die Zeichnung selbst ist reines SVG ohne Bilddatei. */
function introSchaubildHTML(){
  function box(x, y, w, h, cls){ return '<rect class="'+cls+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8"/>'; }
  function txt(x, y, s, cls){ return '<text class="'+cls+'" x="'+x+'" y="'+y+'" text-anchor="middle">'+esc(s)+'</text>'; }
  function bloc(x, namen){
    return box(x, 118, 100, 82, "sb-bloc")+txt(x+50, 138, "BLOC", "sb-bt")+namen.map(function(n, i){ return txt(x+50, 156+i*15, n, "sb-ex"); }).join("");
  }
  var a = [t("inExKniebeuge"), t("inExBankdruecken"), t("inExKreuzheben")], b = [t("inExKlimmzug"), t("inExRudern"), t("inExSchulterdruecken")];
  return '<svg class="intro-schaubild" viewBox="0 0 340 208" role="img" aria-label="'+esc(t("inSchaubildAlt"))+'">'+
    '<path class="sb-linie" d="M170 38V54M60 54H280M60 54V70M170 54V70M280 54V70M60 100V118M170 100V118"/>'+
    box(100, 8, 140, 30, "sb-kasten")+txt(170, 28, t("inDPlan"), "sb-t")+
    box(10, 70, 100, 30, "sb-kasten")+txt(60, 90, t("inDTag")+" A", "sb-t")+
    box(120, 70, 100, 30, "sb-kasten")+txt(170, 90, t("inDTag")+" B", "sb-t")+
    box(230, 70, 100, 30, "sb-kasten")+txt(280, 90, "Run", "sb-t")+
    bloc(10, a)+bloc(120, b)+'</svg>'+
    '<p class="intro-kette">'+esc(t("inKette"))+'</p>';
}
function introSeiten(){
  var mitgeliefert = EXERCISES.filter(function(ex){ return !ex.custom; });
  var wsEx = {};
  AUFWAERM_UEBUNGEN.forEach(function(id){ if(findExercise(id)) wsEx[id] = true; });
  mitgeliefert.forEach(function(ex){ if(ex.main === "stretch") wsEx[ex.id] = true; });
  return [
    { ico:ICON_BAUSTEINE, farbe:"var(--accent)", titel:t("in1T"), text:t("in1"), notiz:t("in1N"), extra:introSpracheHTML(), art:"sprache" },
    { ico:ICON_PERSON, farbe:"var(--accent)", titel:t("inProfilT"), text:t("inProfil"), notiz:t("inProfilN"), extra:introProfilHTML(), art:"profil" },
    { ico:ICON_BAUSTEINE, farbe:"var(--accent)", titel:t("inAufbauT"), text:t("inAufbau"), extra:introSchaubildHTML(), art:"aufbau" },
    { ico:HOME_ICON.katalog, farbe:"var(--accent)", titel:t("katalog"),
      text:t("inKat", { w:LIB_WORKOUTS.filter(function(lw){ return !libIstWarmDehn(lw); }).length, e:mitgeliefert.filter(function(ex){ return ex.main !== "stretch"; }).length }) },
    { ico:HOME_ICON.warm, farbe:"var(--ws-color)", titel:t("warmTitle"),
      text:t("in5", { p:LIB_WORKOUTS.filter(libIstWarmDehn).length, d:Object.keys(wsEx).length }) }
  ];
}
function openIntro(){
  var seiten = introSeiten(), nr = 0, root = document.getElementById("overlayRoot"), sprache0 = currentLang(), name0 = state.db.settings.name || "";
  function schliessen(){
    introProfilSpeichern(root);   // was auf der Seite „Über dich“ schon eingetippt ist, geht nicht verloren
    root.innerHTML = "";
    if(currentLang() !== sprache0 || (state.db.settings.name || "") !== name0) render();   // Sprache oder Name geändert: die Seite dahinter neu zeichnen
    if(!state.db.settings.introGesehen){ state.db.settings.introGesehen = true; }
    save();
  }
  function blaettern(d){ var n = nr + d; if(n < 0 || n >= seiten.length) return; introProfilSpeichern(root); nr = n; draw(); }
  function draw(){
    var s = seiten[nr], letzte = nr === seiten.length - 1;
    root.innerHTML = '<div class="confirm-overlay intro-overlay"><div class="confirm-sheet intro-sheet'+(s.art === "profil" || s.art === "aufbau" ? ' kompakt' : '')+'" role="dialog" aria-label="'+esc(t("introTitle"))+'" style="--intro-farbe:'+s.farbe+'">'+
      '<div class="intro-kopf"><div class="intro-punkte" aria-hidden="true">'+seiten.map(function(x, i){ return '<i class="'+(i === nr ? 'an' : '')+'"></i>'; }).join("")+'</div>'+
        (letzte ? '' : '<button type="button" class="intro-weg" data-introweg>'+esc(t("introSkip"))+'</button>')+'</div>'+
      '<div class="intro-seite"><span class="intro-ico">'+svgIcon(s.ico)+'</span>'+
        '<h2>'+esc(s.titel)+'</h2><p>'+esc(s.text)+'</p>'+(s.extra || "")+(s.notiz ? '<p class="intro-notiz">'+esc(s.notiz)+'</p>' : '')+'</div>'+
      '<div class="intro-knoepfe">'+(nr ? '<button type="button" class="btn btn-secondary" data-introzurueck>'+esc(t("back"))+'</button>' : '')+
        '<button type="button" class="btn btn-primary" data-introweiter>'+esc(t(letzte ? "letsGo" : "introNext"))+'</button></div>'+
    '</div></div>';
    var sheet = root.querySelector(".intro-sheet");
    root.querySelector("[data-introweiter]").addEventListener("click", function(){ if(letzte) schliessen(); else blaettern(1); });
    var z = root.querySelector("[data-introzurueck]"); if(z) z.addEventListener("click", function(){ blaettern(-1); });
    var w = root.querySelector("[data-introweg]"); if(w) w.addEventListener("click", schliessen);
    root.querySelectorAll("[data-introlang]").forEach(function(b){   // Sprache wählen: gilt sofort für die ganze App, die Einführung zeichnet sich neu
      b.addEventListener("click", function(){
        state.db.settings.lang = b.getAttribute("data-introlang"); save(); applyLang();
        seiten = introSeiten(); draw();
      });
    });
    root.querySelector(".intro-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("intro-overlay")) schliessen(); });   // daneben tippen, Android-Zurück
    // wischen: nach links weiter, nach rechts zurück
    var x0 = null;
    sheet.addEventListener("touchstart", function(e){ x0 = e.touches[0].clientX; }, { passive:true });
    sheet.addEventListener("touchend", function(e){
      if(x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if(Math.abs(dx) > 50) blaettern(dx < 0 ? 1 : -1);
    });
    root.querySelector("[data-introweiter]").focus();
  }
  draw();
}

/* ---------- Sprachansagen (immer Englisch) in Vorbereitung und Pausen ---------- */
function voiceOn(){
  return !!(window.speechSynthesis && playerState && playerState.source && playerState.source.type==="draft" && state.db.settings.voice !== false);
}
function sayEN(text){
  try{
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB"; u.rate = 1; u.volume = 1;
    var voices = speechSynthesis.getVoices() || [];
    var v = voices.filter(function(x){ return /^en[-_]GB/i.test(x.lang) && x.localService; })[0] ||
            voices.filter(function(x){ return /^en/i.test(x.lang) && x.localService; })[0] ||
            voices.filter(function(x){ return /^en/i.test(x.lang); })[0];
    if(v) u.voice = v;
    setTimeout(function(){ if(playerState){ tonStandard(); speechSynthesis.speak(u); } }, 650);   // nach dem Signalton
  }catch(e){}
}
function announceStep(idx){
  if(!voiceOn()) return;
  var steps = playerState.steps, cur = steps[idx], nx = steps[idx+1];
  if(cur.phase==="done"){ sayEN("Workout complete. Well done!"); return; }
  if(!nx || nx.phase!=="work") return;
  var ex = findExercise(nx.ex), name = ex ? ex.name.en : nx.label;
  var side = nx.side ? (nx.side==="left" ? " Left side." : " Right side.") : "";
  var text = "";
  if(cur.phase==="prep") text = "Get ready. First up: "+name+"."+side;
  else if(cur.phase==="blockrest") text = "Rest. Next up: "+name+"."+side;
  else if(cur.phase==="rest"){
    if(nx.side && cur.side !== nx.side) text = "Switch sides.";
    if(nx.rep === nx.totalReps && nx.totalReps > 1) text += (text ? " " : "")+"Last round.";
  }
  if(text) sayEN(text);
}

/* ============ Datensicherung: Export, Schnappschuss, Erinnerung ============ */
/* Export als Datei; der Zeitpunkt wird für die Erinnerung auf der Startseite gemerkt */
/* Teilen: die Sicherungsdatei direkt an Drive, Mail, Messenger … übergeben (Android/iOS-Teilen-Menü).
   Chrome teilt nicht jede Dateiart - geht JSON nicht, dieselbe Datei als .txt (Import liest beides). */
function backupTeilDatei(){
  var name = "bloc-sicherung-"+new Date().toISOString().slice(0,10), inhalt = JSON.stringify(state.db,null,2);
  try{
    var f = new File([inhalt], name+".json", { type:"application/json" });
    if(navigator.canShare && navigator.canShare({ files:[f] })) return f;
    f = new File([inhalt], name+".txt", { type:"text/plain" });
    if(navigator.canShare && navigator.canShare({ files:[f] })) return f;
  }catch(e){}
  return null;
}
function kannBackupTeilen(){ return !!(navigator.share && backupTeilDatei()); }
function shareBackup(danach){
  var f = backupTeilDatei();
  if(!f || !navigator.share){ exportBackup(); if(danach) danach(); return; }
  navigator.share({ files:[f], title:"BLOC" }).then(function(){
    state.db.settings.lastExport = Date.now();
    save();
    showToast(t("backupShared"));
    if(danach) danach();
  }).catch(function(e){
    if(e && e.name === "AbortError") return;   // im Teilen-Menü abgebrochen
    exportBackup(); if(danach) danach();
  });
}
function exportBackup(){
  var blob = new Blob([JSON.stringify(state.db,null,2)], {type:"application/json"});
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = "sporttimer-backup-"+new Date().toISOString().slice(0,10)+".json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  state.db.settings.lastExport = Date.now();
  save();
}
function hatEigenes(db){
  var st = (db && db.settings) || {};
  return !!(db && ((db.blocks||[]).length || (db.workouts||[]).length || (db.myWorkouts||[]).length || (db.customEx||[]).length ||
    Object.keys(st.studio || {}).length));   // auch Gewichte im Freien Training
}
/* Erinnerung an die Sicherungsdatei - bewusst selten: BLOC kopiert den Stand ohnehin alle 7 Tage auf dem Gerät (Schnappschuss, siehe unten),
   die Datei schützt zusätzlich bei neuem Handy oder gelöschten Website-Daten. Sie erscheint nur, wenn es eigene Inhalte gibt, seit 60 Tagen (oder nie)
   keine Datei gesichert wurde und es schon einen Schnappschuss gibt; × blendet sie für 30 Tage aus. Der Installations-Hinweis hat Vorrang. */
var BACKUP_TAGE = 60, BACKUP_RUHE_TAGE = 30;
function backupTipHTML(){
  if(installTipHTML()) return "";
  if(Date.now() < (state.db.settings.backupTipBis || 0)) return "";
  if(!snapZeit) return "";   // noch kein automatischer Schnappschuss (null = noch nicht nachgesehen, 0 = keiner)
  if(!hatEigenes(state.db)) return "";
  var zuletzt = state.db.settings.lastExport || 0;
  if(Date.now() - zuletzt < BACKUP_TAGE*86400000) return "";
  return '<div class="installtip"><div><b>'+t("backupTipTitle")+'</b><br>'+t("backupTipText")+
    '<div style="margin-top:10px;"><button type="button" class="btn btn-primary" style="margin:0;width:auto;padding:11px 18px;font-size:14px;" data-backup-now>'+ICON_DOWNLOAD+' '+t("backupNow")+'</button></div></div>'+
    '<button data-hidebackup aria-label="'+t("close")+'">&times;</button></div>';
}
function bindBackupTip(){
  var jetzt = app.querySelector("[data-backup-now]");
  if(jetzt) jetzt.addEventListener("click", function(){ if(kannBackupTeilen()) shareBackup(render); else { exportBackup(); render(); } });
  var weg = app.querySelector("[data-hidebackup]");
  if(weg) weg.addEventListener("click", function(){
    state.db.settings.backupTipBis = Date.now() + BACKUP_RUHE_TAGE*86400000; save();
    render();
  });
}

/* Schnappschuss: alle 7 Tage eine vollständige Kopie von state.db in IndexedDB (nicht in localStorage -
   der Platz dort gehört den eigentlichen Daten). Es gibt immer nur einen, der alte wird überschrieben.
   Klappt das Speichern nicht (voll, gesperrt), wird still beim nächsten Start neu versucht. */
var SNAP_TAGE = 7, SNAP_DB = "bloc-sicherung", SNAP_STORE = "stand", SNAP_KEY = "schnappschuss";
var snapZeit = null;   // null = noch nicht nachgesehen, 0 = keiner vorhanden, sonst Zeitpunkt (ms)
function snapOeffnen(){
  return new Promise(function(ok, fehler){
    if(!window.indexedDB){ fehler(); return; }
    var req;
    try{ req = indexedDB.open(SNAP_DB, 1); }catch(e){ fehler(e); return; }
    req.onupgradeneeded = function(){ req.result.createObjectStore(SNAP_STORE); };
    req.onsuccess = function(){ ok(req.result); };
    req.onerror = function(){ fehler(req.error); };
    req.onblocked = function(){ fehler(); };
  });
}
function snapLesen(){
  return snapOeffnen().then(function(db){
    return new Promise(function(ok, fehler){
      try{
        var q = db.transaction(SNAP_STORE, "readonly").objectStore(SNAP_STORE).get(SNAP_KEY);
        q.onsuccess = function(){ ok(q.result || null); };
        q.onerror = function(){ fehler(q.error); };
      }catch(e){ fehler(e); }
    });
  });
}
function snapSchreiben(wert){
  return snapOeffnen().then(function(db){
    return new Promise(function(ok, fehler){
      try{
        var tx = db.transaction(SNAP_STORE, "readwrite");
        tx.objectStore(SNAP_STORE).put(wert, SNAP_KEY);
        tx.oncomplete = function(){ ok(); };
        tx.onerror = tx.onabort = function(){ fehler(tx.error); };
      }catch(e){ fehler(e); }
    });
  });
}
/* Beim Start: älter als 7 Tage (oder keiner) -> neuen ablegen. Nur wenn die gespeicherten Daten
   lesbar sind - und ein leerer Stand überschreibt nie einen Schnappschuss mit eigenen Inhalten
   (sonst wäre nach versehentlichem Löschen eine Woche später auch die Kopie weg). */
function snapPruefen(){
  var lesbar = false;
  try{ var roh = localStorage.getItem(DB_KEY); lesbar = !!roh && !!JSON.parse(roh); }catch(e){}
  snapLesen().then(function(alt){
    snapZeit = alt ? alt.zeit : 0;
    if(!lesbar) return;
    if(alt && Date.now() - alt.zeit < SNAP_TAGE*86400000) return;
    if(alt && hatEigenes(alt.daten) && !hatEigenes(state.db)) return;
    var neu = { zeit:Date.now(), daten:JSON.parse(JSON.stringify(state.db)) };
    return snapSchreiben(neu).then(function(){ snapZeit = neu.zeit; });
  }).catch(function(){}).then(snapZeileAktualisieren);
}
window.addEventListener("load", snapPruefen);
function snapDatum(zeit){
  return new Date(zeit).toLocaleDateString(currentLang()==="en" ? "en-GB" : "de-DE", { day:"2-digit", month:"2-digit", year:"numeric" });
}
function snapZeileHTML(){
  if(snapZeit === null) return '<small>'+t("snapInfo")+'</small>';
  if(!snapZeit) return t("snapNone")+'<small>'+t("snapInfo")+'</small>';
  var heute = new Date(); heute.setHours(0,0,0,0);
  var tag = new Date(snapZeit); tag.setHours(0,0,0,0);
  var n = Math.round((heute - tag) / 86400000);
  var wann = n <= 0 ? t("snapToday") : n === 1 ? t("snapYesterday") : t("snapDays", { n:n });
  return t("snapAgo", { x:wann })+'<small>'+t("snapInfo")+'</small>'+
    '<button type="button" class="btn btn-secondary" data-snaprestore>'+esc(t("snapRestore", { d:snapDatum(snapZeit) }))+'</button>';
}
function snapZeileAktualisieren(){
  var el = document.getElementById("snap-zeile");
  if(!el) return;
  el.innerHTML = snapZeileHTML();
}
function bindSnapZeile(){
  var el = document.getElementById("snap-zeile");
  if(!el) return;
  if(snapZeit === null) snapLesen().then(function(s){ snapZeit = s ? s.zeit : 0; }).catch(function(){ snapZeit = 0; }).then(snapZeileAktualisieren);
  el.addEventListener("click", function(ev){
    if(!ev.target.closest("[data-snaprestore]")) return;
    snapLesen().then(function(snap){
      if(!snap || !snap.daten) return;
      var d = snapDatum(snap.zeit);
      confirmSheet(t("snapQ"), t("snapText", { d:d }), t("snapBtn"), function(){
        var db = dbAusRoh(snap.daten);
        state.db = db; save(); syncCustomEx(); applyTheme(); applyLang(); applySpace();
        go("#home");
      });
    }).catch(function(){});
  });
}

