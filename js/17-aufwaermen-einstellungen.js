"use strict";
/* ============ Mobility & Stretch ============
   Aufbau wie das Workout: oben die Reiter Katalog | Baukasten. Im Katalog drei gleichrangige Abteilungen Meine · Workoutkatalog ·
   Übungskatalog; darunter wie beim Ort die Art (Aufwärmen | Dehnen), bei Dehnen mit Körperregionen als Filter (Nacken, Schultern, Rücken, Hüfte, Beine …).
   Im Baukasten: Überrasch mich (nach Zeit und Körperregion) oder Selber bauen.
   Meine = eigene Workouts dieses Bereichs (mw.ws = „warm“ / „dehn“); Übungen lassen sich per langem Drücken oder ⋯ dort einbauen. */
var wsQuery = "";
/* settings.wsTab: „baukasten“ · „blocs“ · „katalog“ (Seite hinter dem Baukasten).
   Ältere Fassungen hatten die Reiter Workouts · Übungen · Meine in wsTab - die werden hier übernommen. */
function wsTab(){   // „baukasten“ · „blocs“ (früher Meine) · „katalog“ (Seite hinter dem Baukasten)
  var s = state.db.settings;
  if(s.wsTab === "meine" || s.wsTab === "uebungen"){ s.wsAbt = s.wsTab; s.wsTab = "workouts"; }
  if(s.wsTab === "workouts") s.wsTab = s.wsAbt === "meine" ? "blocs" : s.wsAbt === "uebungen" ? "baukasten" : "katalog";
  return s.wsTab === "blocs" || s.wsTab === "katalog" ? s.wsTab : "baukasten";
}
function wsKnopf(attr, wert, aktiv, text){ return '<button type="button" data-'+attr+'="'+wert+'" class="'+(aktiv ? "active" : "")+'" aria-pressed="'+(!!aktiv)+'">'+esc(text)+'</button>'; }
/* Kopf unter der Titelleiste: Reiter, im Katalog die Abteilungen, darunter die Art (Aufwärmen | Dehnen) */
function wsKopfHTML(tab, art){
  return '<div class="rz kat-rz" style="--rz:var(--ws-color)">'+wsKnopf("wstab", "baukasten", tab === "baukasten", t("katTabBaukasten"))+wsKnopf("wstab", "blocs", tab === "blocs", t("katTabBlocs"))+'</div>'+
    (tab === "katalog" ? '<div class="kat-seitentitel">'+esc(t("katTabKatalog"))+'</div>' : '')+
    '<div class="theme-pick lib-tabs seg-2 ws-art">'+wsKnopf("wsart", "warm", art === "warm", t("wsWarm"))+wsKnopf("wsart", "dehn", art === "dehn", t("wsDehn"))+'</div>';
}
function wsKopfBinden(){
  var s = state.db.settings;
  function neuZeichnen(){ renderWarmStretch(); window.scrollTo(0, 0); }
  app.querySelectorAll("[data-wstab]").forEach(function(el){ el.addEventListener("click", function(e){ e.stopPropagation(); s.wsTab = el.getAttribute("data-wstab"); save(); neuZeichnen(); }); });
  app.querySelectorAll("[data-wsart]").forEach(function(el){ el.addEventListener("click", function(e){ e.stopPropagation(); s.wsArt = el.getAttribute("data-wsart"); save(); neuZeichnen(); }); });
}
/* Baukasten: Überrasch mich oder Selber bauen (wie im Workout) */
function renderWsBaukasten(art){
  var hw = hinweise("wsbau", ["wsBauHint"]);
  app.innerHTML =
    topbar(t("warmTitle"), { back:"#home", right:hw.knopf }) +
    wsKopfHTML("baukasten", art) +
    hw.z(0, "page-hint") +
    '<div style="--bereich:var(--ws-color)">'+
    '<button type="button" class="bau-karte bau-sp ws-bau" data-wssurprise><span class="bk-ico">'+svgIcon(ICON_UEBERRASCH)+'</span><span class="bk-t"><b>'+esc(t("surprise"))+'</b><small>'+
      esc(t(art === "dehn" ? "wsBauUeberraschDehn" : "wsBauUeberraschWarm"))+'</small></span><span class="bk-pfeil">'+ICON_CHEV+'</span></button>'+
    '<button type="button" class="bau-karte ws-bau" data-wsselber><span class="bk-ico">'+ICON_PLUS+'</span><span class="bk-t"><b>'+esc(t("bauSelber"))+'</b><small>'+
      esc(t("bauSelberSub"))+'</small></span><span class="bk-pfeil">'+ICON_CHEV+'</span></button>'+
    '<button type="button" class="bau-karte ws-bau" data-wskatalog><span class="bk-ico">'+svgIcon(HOME_ICON.katalog)+'</span><span class="bk-t"><b>'+esc(t("bauKatalog"))+'</b><small>'+
      esc(t("bauKatalogSub"))+'</small></span><span class="bk-pfeil">'+ICON_CHEV+'</span></button>'+
    '<button type="button" class="bau-karte ws-bau bau-eigen" data-wseigen><span class="bk-ico">'+ICON_PLUS+'</span><span class="bk-t"><b>'+esc(t("bauEigene"))+'</b><small>'+
      esc(t("bauEigeneSubWs"))+'</small></span><span class="bk-pfeil">'+ICON_CHEV+'</span></button></div>'+
    '<div style="height:40px"></div>';
  bindCommon();
  wsKopfBinden();
  app.querySelector("[data-wssurprise]").addEventListener("click", function(){ openWsSurprise(art); });
  app.querySelector("[data-wsselber]").addEventListener("click", function(){ bauNeuWs = art; go("#mybuild/new"); });
  app.querySelector("[data-wseigen]").addEventListener("click", function(){ exEditVorgabe = { equip:["none"], cats:["stretch"], reps:1, work:30, rest:10 }; go("#exedit/new"); });
  app.querySelector("[data-wskatalog]").addEventListener("click", function(){ var s = state.db.settings; s.wsTab = "katalog"; s.wsAbt = "workouts"; save(); renderWarmStretch(); window.scrollTo(0, 0); });
}
/* Überrasch mich für Mobility & Stretch: Dauer (und bei Dehnen die Körperregionen) wählen, daraus entsteht ein Ablauf zum Prüfen und Starten */
var WS_SP_DAUER = [5, 10, 15, 20, 30];
function buildWsSurprise(p){
  var art = p.art === "dehn" ? "dehn" : "warm", sel = art === "dehn" ? selArr(p.regionen) : [];
  var pool = wsUebungen(art).filter(function(ex){ return wsRegionOk(ex.id, sel); });
  if(!pool.length) return null;
  var recent = recentExercises(7), ziel = (p.dur || 10)*60;
  shuffle(pool);
  pool.sort(function(a, b){ return (recent[a.id] ? 1 : 0) - (recent[b.id] ? 1 : 0); });   // erst das, was länger nicht dran war (die Reihenfolge davor ist gemischt)
  var d = { key:"surprise:", src:"surprise", name:"", mode:"individual", reps:6, work:30, rest:10, blockRest:art === "dehn" ? 10 : 20, items:[], ws:art, _params:p };
  for(var i = 0; i < pool.length; i++){
    var it = itemFromEx(pool[i].id);
    if(art === "warm"){ it.reps = Math.min(it.reps, 2); it.work = Math.min(it.work, 40); }   // Aufwärmen: je Übung kurz, damit die gewählte Dauer stimmt
    it.after = 10;
    d.items.push(it);
    if(d.items.length > 2 && workoutDuration(draftRun(d)) > ziel){ d.items.pop(); break; }
  }
  if(art === "warm") d.items.sort(function(a, b){ return (EX_INT[a.ex] || 2) - (EX_INT[b.ex] || 2); });   // erst locker, dann zügiger
  d.name = t("spName", { n:Math.max(1, Math.round(workoutDuration(draftRun(d))/60)) });
  return d;
}
function openWsSurprise(art){
  var s = state.db.settings, root = document.getElementById("overlayRoot");
  var p = JSON.parse(JSON.stringify(s.wsSurprise || {}));
  p.art = art;
  if(WS_SP_DAUER.indexOf(p.dur) < 0) p.dur = 10;
  p.regionen = selArr(p.regionen).filter(function(r){ return WS_REGIONEN.indexOf(r) > -1; });
  function zu(){ root.innerHTML = ""; }
  function draw(){
    var alt = root.querySelector(".sp-sheet"), scrollAlt = alt ? alt.scrollTop : 0;
    root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet sp-sheet" style="--bereich:var(--ws-color)">'+
      '<h3>'+svgIcon(ICON_UEBERRASCH, "ico sp-h-ico")+' '+esc(t("surprise"))+' · '+esc(t(art === "dehn" ? "wsDehn" : "wsWarm"))+'</h3>'+
      '<label>'+t("spDur")+'</label><div class="sp-chips">'+WS_SP_DAUER.map(function(v){
        return '<button type="button" class="fc-chip'+(p.dur === v ? ' on' : '')+'" data-wsspdur="'+v+'">'+v+' Min</button>'; }).join("")+'</div>'+
      (art === "dehn" ? '<label>'+esc(t("afRegion"))+' <span class="lbl-hint">'+esc(t("wsSpRegionHint"))+'</span></label><div class="sp-chips">'+WS_REGIONEN.map(function(r){
        return '<button type="button" class="fc-chip'+(p.regionen.indexOf(r) > -1 ? ' on' : '')+'" data-wsspreg="'+r+'">'+esc(t("rg_"+r))+'</button>'; }).join("")+'</div>' : '')+
      '<div class="btn-row sp-foot"><button class="btn btn-secondary" data-cancel>'+t("cancel")+'</button>'+
      '<button class="btn btn-primary" data-spgo>'+t("spGo")+'</button></div>'+
    '</div></div>';
    root.querySelector(".sp-sheet").scrollTop = scrollAlt;
    root.querySelectorAll("[data-wsspdur]").forEach(function(b){ b.addEventListener("click", function(){ p.dur = parseInt(b.getAttribute("data-wsspdur")); draw(); }); });
    root.querySelectorAll("[data-wsspreg]").forEach(function(b){ b.addEventListener("click", function(){ p.regionen = selToggle(p.regionen, b.getAttribute("data-wsspreg")); draw(); }); });
    root.querySelector("[data-cancel]").addEventListener("click", zu);
    root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
    root.querySelector("[data-spgo]").addEventListener("click", function(){
      s.wsSurprise = { dur:p.dur, regionen:p.regionen }; save();
      var d = buildWsSurprise(p);
      if(!d){ showToast(t("spNone")); return; }
      zu(); coverDraft = d; go("#cover/surprise");
    });
  }
  draw();
}
function renderWarmStretch(){
  var s = state.db.settings;
  var art = s.wsArt === "dehn" ? "dehn" : "warm", wtab = wsTab();
  if(wtab === "baukasten") return renderWsBaukasten(art);
  var tab = wtab === "blocs" ? "meine" : "workouts";   // „workouts“ (Workoutkatalog) · „meine“ (BLOCs)
  var regSel = art === "dehn" && tab !== "meine" ? selArr(s.wsRegionen).filter(function(r){ return WS_REGIONEN.indexOf(r) > -1; }) : [];
  var zonSel = tab !== "meine" ? kkNorm(s.wsZonen) : [];   // Körperkarte
  var liste = "", anzahl = 0;   // anzahl: sichtbare Karten (für „N … anzeigen“)
  if(tab === "workouts"){
    var wos = art === "warm" ? AUFWAERM_IDS.map(findLibWorkout).filter(Boolean)
                             : LIB_WORKOUTS.filter(function(lw){ return lw.focus === "stretch" && AUFWAERM_IDS.indexOf(lw.id) < 0; });
    var rows = wos.filter(function(lw){ return !libHidden("wo:"+lw.id); }).map(function(lw){
      var exs = lw.exercises.map(findExercise).filter(Boolean);
      return { lw:lw, exs:exs, dur:workoutDuration(libWorkoutRun(lw)) };
    });
    rows = rows.filter(function(r){ return (!regSel.length || r.exs.some(function(ex){ return wsRegionOk(ex.id, regSel); })) &&
      (!zonSel.length || r.exs.some(function(ex){ return zonePasst(ex, zonSel); })); }).sort(function(a, b){ return a.dur - b.dur; });
    anzahl = rows.length;
    liste = rows.map(function(r){ return libWoCard(r.lw, r.exs, false, r.dur, woMains(r.exs)); }).join("");
  } else if(tab === "uebungen"){
    var exl = wsUebungen(art).filter(function(ex){ return (art !== "dehn" || wsRegionOk(ex.id, regSel)) && zonePasst(ex, zonSel); });
    anzahl = exl.length;
    liste = exl.length ? '<div class="fig-grid">'+exl.map(function(ex){ return libExKachel(ex); }).join("")+'</div>' : "";
  } else {
    (state.db.myWorkouts || []).map(normMy).filter(function(mw){ return mw.ws === art; }).forEach(function(mw){
      var exs = mw.items.map(function(it){ return findExercise(it.ex); }).filter(Boolean);
      liste += myWoCard(mw, exs, woMains(exs), workoutDuration(myRun(mw)));
    });
    if(!liste) liste = '<div class="empty" style="padding:30px 20px;">'+esc(t("wsMineEmpty"))+'</div>';
  }
  var hw = hinweise("ws", [tab === "meine" ? "wsMineIntro" : art === "warm" ? "wsIntroWarm" : "wsIntroDehn"].concat(tab === "uebungen" ? ["zpHintWs"] : []));
  app.innerHTML =
    bereichKopfNeuHTML("warm", t("warmTitle"), t("warmKicker"), hw.knopf, { klar:true }) +
    wsKopfHTML(wtab, art) +
    (tab === "uebungen" ? '<button type="button" class="btn btn-secondary kat-eigene" data-wsnewex>'+ICON_PLUS+' '+esc(t("exNew"))+'</button>' : '')+
    hw.z(0, "seiten-intro")+(tab === "workouts" ? tippZeileHTML("workout", "tippWorkout") : tab === "uebungen" ? tippZeileHTML("wsuebung", "tippWsUebung") : "")+
    suchFeldHTML(wsQuery, "ws", t("wsSearchPh"))+
    (tab === "uebungen" ? hw.z(1, "page-hint") : '')+
    (tab !== "meine" ? wsRegionFilterHTML(regSel, anzahl, tab === "uebungen" ? "Ex" : "Wo", zonSel, art === "dehn") : '')+
    // Start-Knöpfe und Figuren in der Farbe des Bereichs (wie die Kachel auf der Startseite)
    '<div style="--bereich:var(--ws-color)">'+(liste || '<div class="empty">'+t("libEmpty")+'</div>')+'</div>'+
    '<div class="empty" data-noresult style="display:none;padding:30px 20px;">'+t("noResult")+'</div>'+
    '<div style="height:40px"></div>';
  bindCommon();
  function neu(){ var y = window.scrollY; renderWarmStretch(); window.scrollTo(0, y); }
  function on(sel, fn){ app.querySelectorAll(sel).forEach(function(el){ el.addEventListener("click", function(e){ e.stopPropagation(); fn(el, e); }); }); }
  wsKopfBinden();
  wsRegionBinden(neu);
  var wq = app.querySelector("#ws-q");
  if(wq){
    applySearch(app, wsQuery);
    wq.addEventListener("input", function(){ wsQuery = wq.value; applySearch(app, wsQuery); });
  }
  var neuEx = app.querySelector("[data-wsnewex]");
  if(neuEx) neuEx.addEventListener("click", function(){ go("#exedit/new"); });
  on("[data-cover]", function(el){ if(el.disabled) return; coverDraft = null; go("#cover/"+el.getAttribute("data-cover")); });
  on("[data-fav]", function(el){ toggleFav(el.getAttribute("data-fav")); neu(); });
  on("[data-womore]", function(el){
    var lw = findLibWorkout(el.getAttribute("data-womore"));
    if(lw) woMenue(lw, neu, art);
  });
  // langes Drücken wie in Air: Workout-Karte = Menü (⋯), Übungskarte = in ein eigenes Workout einbauen
  app.querySelectorAll(".lib-card [data-womore]").forEach(function(b){
    var lw = findLibWorkout(b.getAttribute("data-womore"));
    if(lw) langDruck(b.closest(".lib-card"), function(){ woMenue(lw, neu, art); });
  });
  app.querySelectorAll("[data-exlang]").forEach(function(el){ langDruck(el, function(){ exZuProgramm(el.getAttribute("data-exlang"), art); }); });
  on("[data-playex]", function(el){ go("#playex/"+el.getAttribute("data-playex")); });
  on("[data-exedit]", function(el){ go("#exedit/"+el.getAttribute("data-exedit")); });
  on("[data-info]", function(el){ var id = el.getAttribute("data-info"); openExInfo(id, false, { onChange:neu, zu:function(){ exZuProgramm(id, art); } }); });
  airKachelBinden();
  on("[data-exfav]", function(el){ toggleExFav(el.getAttribute("data-exfav")); neu(); });
  on("[data-exmore]", function(el){
    var ex = findExercise(el.getAttribute("data-exmore"));
    if(!ex) return;
    var acts = [];
    if(ex.custom) acts.push({ ico:ICON_EDIT, label:t("edit"), fn:function(){ go("#exedit/"+ex.id); } });
    if(EX_INFO[ex.id]) acts.push({ ico:ICON_INFO, label:t("infoLong"), fn:function(){ openExInfo(ex.id, false, { onChange:neu }); } });
    acts.push({ ico:P_PLUS, label:t("zpWs"), fn:function(){ exZuProgramm(ex.id, art); } });
    acts.push({ ico:ICON_TIMERBLOCK, label:t("adoptBlockTitle"), fn:function(){ adoptExercise(ex); showToast(t("adoptedBlock", { n:tplText(ex.name) })); } });
    acts.push({ ico:ICON_EYE_OFF, label:t("hideShort"), fn:function(){ libHide("ex:"+ex.id); showToast(t("hiddenToast")); neu(); } });
    openActionSheet(tplText(ex.name), acts);
  });
  bindTrash(neu);
}

/* Adresse der App ohne # und Parameter - die Seite, die man weitergeben kann */
/* Als Datei geöffnet (file://) gibt es keine teilbare Adresse - dann die veröffentlichte App */
var APP_PUBLIC_URL = "https://blocappbuilder.github.io/BLOC/";
/* Versionsnummer steht nur in sw.js: die App fragt den Service Worker danach und zeigt sie unten in den
   Einstellungen. Keine Antwort (als Datei geöffnet, Service Worker noch nicht aktiv): Zeile bleibt leer. */
var appFassung = "";
function fassungZeigen(){
  var el = document.getElementById("app-version");
  if(!el) return;
  if(IST_NATIV && NATIV_FASSUNG) appFassung = NATIV_FASSUNG;
  if(appFassung){ el.textContent = "Version "+appFassung; return; }
  var sw = navigator.serviceWorker && navigator.serviceWorker.controller;
  if(!sw || !window.MessageChannel) return;
  var kanal = new MessageChannel();
  kanal.port1.onmessage = function(e){
    if(!e.data || !e.data.fassung) return;
    appFassung = String(e.data.fassung);
    var ziel = document.getElementById("app-version");
    if(ziel) ziel.textContent = "Version "+appFassung;
  };
  try{ sw.postMessage({ frage:"fassung" }, [kanal.port2]); }catch(e){}
}
function appUrl(){
  if(!/^https?:$/.test(location.protocol)) return APP_PUBLIC_URL;
  return location.origin + location.pathname.replace(/index\.html$/, "");
}
/* Einstellungen: oben offen, was man regelmäßig braucht („Wichtig“), darunter thematisch gruppiert und zugeklappt („Mehr“).
   Aufgeklappte Gruppen bleiben offen, solange man auf der Seite bleibt (die Seite zeichnet sich bei jeder Änderung neu). */
var einstOffen = {};
/* Einstellungen: alle Gruppen und Zeilen nach demselben Muster - Symbol links, Titel (+ Zeile darunter), rechts Pfeil */
var EINST_ICON = {
  fokus:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  darstellung:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  training:'<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  daten:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  quellen:'<path d="M5 4.5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3z"/><path d="M5 16.5a3 3 0 0 1 3-3h10"/>',
  schutz:'<path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>'
};
var ICON_UPLOAD = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M4 19h16"/></svg>';
function einstKopf(ico, titel){
  return '<div class="opt-kopf"><span class="om-ico">'+svgIcon(ico)+'</span><span class="opt-t">'+esc(titel)+'</span></div>';
}
function einstLink(href, titel, unter, ico){
  return '<a class="opt-mehr opt-link" href="'+href+'" target="_blank" rel="noopener"><span class="opt-zeile"><span class="om-ico">'+svgIcon(ico)+'</span>'+
    '<span class="meta"><span class="name">'+esc(titel)+'</span><span class="sub">'+esc(unter)+'</span></span><span class="om-chev">'+ICON_CHEV+'</span></span></a>';
}
function einstMehr(key, titel, unter, inhalt, ico, cls){
  return '<details class="opt-mehr'+(cls ? ' '+cls : '')+'" data-mehr="'+key+'"'+(einstOffen[key] ? ' open' : '')+'>'+
    '<summary>'+(ico ? '<span class="om-ico">'+svgIcon(ico)+'</span>' : '')+
      '<span class="meta"><span class="name">'+esc(titel)+'</span><span class="sub">'+esc(unter)+'</span></span>'+
      '<span class="om-chev">'+ICON_CHEV+'</span></summary>'+
    '<div class="om-inhalt">'+inhalt+'</div></details>';
}
/* Körperdaten (optional) für die Kalorien-Schätzung in der Statistik; nur lokal in den Einstellungen */
var KOERPER_PAL = [[1.4, "koerperPal1"], [1.55, "koerperPal2"], [1.75, "koerperPal3"], [2, "koerperPal4"]];   // Aktivitätsfaktor (PAL) für den Gesamtbedarf; mehr in js/23-protein.js
function koerperFormHTML(s, opt){
  var k = s.koerper || {};
  opt = opt || {};
  function feld(id, label, wert, min, max){
    return '<label class="koerper-feld"><span>'+esc(label)+'</span><input type="number" inputmode="decimal" id="'+id+'" min="'+min+'" max="'+max+'" value="'+(wert ? esc(String(wert)) : "")+'"></label>';
  }
  return '<div class="koerper-form">'+(opt.ohneName ? '' : '<label class="koerper-feld"><span>'+esc(t("koerperName"))+'</span>'+
    '<input type="text" id="k-name" maxlength="30" autocomplete="given-name" value="'+esc(s.name || "")+'"></label>')+
    feld("k-kg", t("koerperKg"), k.kg, 30, 250)+feld("k-cm", t("koerperCm"), k.cm, 120, 230)+feld("k-alter", t("koerperAlter"), k.alter, 10, 99)+
    '<div class="label" style="margin:10px 0 6px">'+esc(t("koerperSex"))+'</div><div class="seg-row" role="group">'+
    [["w", t("koerperW")], ["m", t("koerperM")], ["", t("koerperKeine")]].map(function(x){
      return '<button type="button" data-ksex="'+x[0]+'" class="'+((k.sex || "") === x[0] ? "active" : "")+'">'+esc(x[1])+'</button>'; }).join("")+'</div>'+
    '<div class="label" style="margin:10px 0 6px">'+esc(t("koerperAktiv"))+'</div><div class="seg-row seg-pal" role="group">'+
    KOERPER_PAL.map(function(x){
      return '<button type="button" data-kpal="'+x[0]+'" class="'+(+k.pal === x[0] ? "active" : "")+'">'+esc(t(x[1]))+'</button>'; }).join("")+'</div>'+
    '<div style="font-size:12px;color:var(--text-dim);margin-top:10px">'+esc(t("koerperHint"))+'</div></div>';
}
/* Körperdaten binden (in der Statistik-Ansicht, siehe openKoerperSheet): Zahlen prüfen, nur sinnvolle Werte speichern (sonst leer = keine Schätzung) */
function koerperBinden(wurzel){
  var s = state.db.settings;
  function speichern(){
    var kk = s.koerper = s.koerper || {};
    function zahl(id, lo, hi){ var v = parseFloat(String(wurzel.querySelector("#"+id).value).replace(",", ".")); return v >= lo && v <= hi ? Math.round(v*10)/10 : 0; }
    kk.kg = zahl("k-kg", 30, 250); kk.cm = Math.round(zahl("k-cm", 120, 230)); kk.alter = Math.round(zahl("k-alter", 10, 99));
    var nm = wurzel.querySelector("#k-name"); if(nm) s.name = String(nm.value).replace(/\s+/g, " ").trim().slice(0, 30);
    save();
  }
  ["k-name", "k-kg", "k-cm", "k-alter"].forEach(function(id){ var el = wurzel.querySelector("#"+id); if(el) el.addEventListener("change", speichern); });
  var nameFeld = wurzel.querySelector("#k-name"); if(nameFeld) nameFeld.addEventListener("blur", speichern);
  wurzel.querySelectorAll("[data-ksex]").forEach(function(b){
    b.addEventListener("click", function(){
      s.koerper = s.koerper || {}; s.koerper.sex = b.getAttribute("data-ksex"); save();
      wurzel.querySelectorAll("[data-ksex]").forEach(function(x){ x.classList.toggle("active", x === b); });
    });
  });
  wurzel.querySelectorAll("[data-kpal]").forEach(function(b){
    b.addEventListener("click", function(){
      s.koerper = s.koerper || {}; s.koerper.pal = +b.getAttribute("data-kpal"); save();
      wurzel.querySelectorAll("[data-kpal]").forEach(function(x){ x.classList.toggle("active", x === b); });
    });
  });
  wurzel.querySelectorAll("input[type=number]").forEach(function(el){ el.addEventListener("blur", speichern); });
}
/* Fenster „Körperdaten“ (Person-Symbol oben rechts in der Statistik); danach zeichnet die Statistik neu */
function openKoerperSheet(nachher){
  var root = document.getElementById("overlayRoot"), s = state.db.settings;
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet"><h3>'+esc(t("koerperTitel"))+'</h3>'+
    '<p style="font-size:13px;color:var(--text-dim);margin:0 0 8px">'+esc(t("koerperSub"))+'</p>'+koerperFormHTML(s)+
    '<div class="btn-row"><button class="btn btn-secondary" data-kclose>'+esc(t("close"))+'</button></div></div></div>';
  koerperBinden(root);
  function zu(){
    var aktiv = document.activeElement; if(aktiv && aktiv.blur) aktiv.blur();   // Eingabe noch übernehmen
    root.innerHTML = ""; if(nachher) nachher();
  }
  root.querySelector("[data-kclose]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(ev){ if(ev.target.classList.contains("confirm-overlay")) zu(); });
}
function renderSettings(){
  var s = state.db.settings;
  function zeile(attr, name, sub){
    return '<div class="list-item" '+attr+'>'+
      '<div class="meta"><div class="name">'+name+'</div><div class="sub">'+sub+'</div></div>'+
      '<span class="chip chev">'+ICON_CHEV+'</span></div>';
  }
  app.innerHTML =
    topbar(t("settings"), { back:"#home" }) +
    '<div class="section-title">'+t("optWichtig")+'</div>'+
    '<div class="card">'+einstKopf(EINST_ICON.darstellung, t("appearance"))+
    '<div class="theme-pick vier">'+
      themeBtn("system",t("thSystem"))+themeBtn("light",t("thLight"))+themeBtn("dark",t("thDark"))+
    '</div>'+
    '</div>'+
    '<div class="card">'+einstKopf(EINST_ICON.training, t("optTraining"))+
      '<div class="range-row"><div class="label">'+t("volume")+' <span id="f-volume-label">'+Math.round(s.volume*100)+'%</span></div>'+
      '<input type="range" id="f-volume" min="0" max="100" step="5" value="'+Math.round(s.volume*100)+'">'+
      '<div class="range-scale"><span>0</span><span>100</span></div></div>'+
      toggleRow("f-voice",t("voice"), "", s.voice !== false)+
      toggleRow("f-rpe", t("rpeSetting"), "", !!anstrengungModus())+
      (anstrengungModus() ? '<div class="seg-row rpe-wahl" role="group">'+["rpe", "rir"].map(function(m){
        return '<button type="button" data-rpemodus="'+m+'" class="'+(anstrengungModus() === m ? "active" : "")+'">'+(m === "rpe" ? t("rpeName") : t("rirName"))+'</button>'; }).join("")+'</div>' : "")+
    '</div>'+
    '<div class="card">'+einstKopf(EINST_ICON.daten, t("data"))+
      '<div class="snap-zeile" id="snap-zeile">'+snapZeileHTML()+'</div>'+
      (kannBackupTeilen() ? '<button class="btn btn-secondary" data-sharebackup>'+ICON_SHARE+' '+t("shareBackup")+'</button>' : '')+
      '<button class="btn btn-secondary" data-export>'+ICON_DOWNLOAD+' '+t("exportBackup")+'</button>'+
      '<button class="btn btn-secondary" data-import>'+ICON_UPLOAD+' '+t("importBackup")+'</button>'+
      '<input type="file" id="import-file" style="display:none">'+
    '</div>'+
    '<div class="section-title">'+t("optMehr")+'</div>'+
    einstMehr("timer", t("mehrTimer"), t("mehrTimerSub"),
      toggleRow("f-sound",t("sound"), "", s.sound)+
      '<div class="range-row" data-opensounds style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;">'+
        '<div><div class="label" style="margin:0 0 2px;">'+t("soundStyle")+'</div><div style="font-size:13px;color:var(--text-dim);">'+esc(soundLabel(s.soundStyle))+'</div></div>'+
        '<span class="chip chev">'+ICON_CHEV+'</span>'+
      '</div>'+
      toggleRow("f-space",t("space"), "", s.space), HOME_ICON.intervall)+
    einstMehr("sprache", t("language"), currentLang() === "en" ? "English" : "Deutsch",
      '<div class="theme-pick lang-pick">'+langBtn("de","Deutsch")+langBtn("en","English")+'</div>',
      '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/>')+
    einstMehr("app", t("mehrApp"), t("mehrAppSub"),
      zeile('data-intro role="button" tabindex="0"', t("introRow"), t("introRowSub"))+
      zeile('data-nav="#install"', t("installRow"), t("installRowSub"))+
      '<div class="opt-label" style="margin-top:6px">'+t("shareTitle")+'</div>'+
      '<div class="share-card"><div class="share-url" id="share-url">'+esc(appUrl())+'</div>'+
      '<button type="button" class="btn btn-secondary" data-sharecopy>'+t("shareCopy")+'</button></div>',
      '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>')+
    einstLink("quellen.html", t("sourcesRow"), t("sourcesRowSub"), EINST_ICON.quellen)+
    einstLink("privacy.html", t("privacyRow"), t("privacyRowSub"), EINST_ICON.schutz)+
    einstMehr("loeschen", t("deleteAll"), t("mehrLoeschenSub"),
      '<button class="btn btn-danger" data-reset>'+t("deleteAll")+'</button>', '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>', "opt-danger")+
    '<div class="empty" style="padding:20px 8px;">'+t("localNote")+'<br><small class="app-version" id="app-version"></small></div>';
  app.querySelectorAll("details[data-mehr]").forEach(function(d){
    d.addEventListener("toggle", function(){ einstOffen[d.getAttribute("data-mehr")] = d.open; });
  });

  bindCommon();

  function themeBtn(val, label, cls){
    var classes = (cls||"") + (s.theme===val ? " active" : "");
    return '<button data-theme="'+val+'" class="'+classes.trim()+'">'+label+'</button>';
  }
  function langBtn(val, label){
    return '<button data-lang="'+val+'" class="'+(currentLang()===val ? "active" : "")+'">'+label+'</button>';
  }
  app.querySelectorAll("[data-theme]").forEach(function(btn){
    btn.addEventListener("click", function(){
      s.theme = btn.getAttribute("data-theme");
      save(); applyTheme(); renderSettings();
    });
  });
  app.querySelectorAll("[data-lang]").forEach(function(btn){
    btn.addEventListener("click", function(){
      s.lang = btn.getAttribute("data-lang");
      save(); applyLang(); renderSettings();
    });
  });

  /* App teilen: Link kopieren, per WhatsApp oder über das Teilen-Menü des Handys */
  app.querySelector("[data-sharecopy]").addEventListener("click", function(){ copyText(appUrl(), t("shareCopied")); });
  app.querySelector("[data-intro]").addEventListener("click", openIntro);
  app.querySelector("[data-opensounds]").addEventListener("click", function(){
    openSoundSheet(function(){ renderSettings(); });
  });

  bindToggle("f-sound", function(v){ s.sound=v; save(); });
  bindToggle("f-space", function(v){ s.space=v; save(); applySpace(); phaseBeep("work"); });
  bindToggle("f-voice", function(v){ s.voice=v; save(); });
  function settingsNeu(){ var y = window.scrollY; renderSettings(); window.scrollTo(0, y); }
  bindToggle("f-rpe", function(v){ s.anstrengung = v ? (anstrengungModus() || "rpe") : ""; save(); settingsNeu(); });
  app.querySelectorAll("[data-rpemodus]").forEach(function(b){ b.addEventListener("click", function(){ s.anstrengung = b.getAttribute("data-rpemodus"); save(); settingsNeu(); }); });

  var volEl = app.querySelector("#f-volume");
  var volLabel = app.querySelector("#f-volume-label");
  volEl.addEventListener("input", function(){
    s.volume = parseInt(volEl.value)/100;
    volLabel.textContent = volEl.value+"%";
    save();
  });
  volEl.addEventListener("change", function(){
    phaseBeep("work");
  });

  app.querySelector("[data-export]").addEventListener("click", exportBackup);
  var teilBtn = app.querySelector("[data-sharebackup]");
  if(teilBtn) teilBtn.addEventListener("click", function(){ shareBackup(); });
  bindSnapZeile();
  fassungZeigen();
  app.querySelector("[data-import]").addEventListener("click", function(){
    app.querySelector("#import-file").click();
  });
  app.querySelector("#import-file").addEventListener("change", function(ev){
    var file = ev.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var parsed = JSON.parse(reader.result);
        // nur echte BLOC-Sicherungen (z. B. nicht versehentlich die Sicherung des Vokabelkastens) - sonst wäre alles weg
        var istBloc = parsed && typeof parsed === "object" && !Array.isArray(parsed.cards) &&
          (Array.isArray(parsed.blocks) || Array.isArray(parsed.workouts) || Array.isArray(parsed.myWorkouts) || (parsed.settings && typeof parsed.settings === "object"));
        if(!istBloc){ showToast(t("fileError")); return; }
        confirmSheet(t("importQ"), t("importText"), t("importBtn"), function(){
          var db = dbAusRoh(parsed);
          state.db = db; save(); syncCustomEx(); applyTheme(); applyLang(); applySpace();
          go("#home");
        });
      }catch(e){ showToast(t("fileError")); }
    };
    reader.readAsText(file);
  });
  app.querySelector("[data-reset]").addEventListener("click", function(){
    confirmSheet(t("deleteAllQ"), t("deleteAllText"), t("deleteAllBtn"), function(){
      state.db = frischDB(); save(); syncCustomEx(); applyTheme(); applyLang(); applySpace();
      go("#home");
    });
  });
}
function toggleRow(id, label, desc, checked){
  return '<div class="toggle-row"><div><div class="label">'+label+'</div>'+(desc ? '<div class="desc">'+desc+'</div>' : '')+'</div>'+
    '<label class="switch"><input type="checkbox" id="'+id+'" '+(checked?"checked":"")+'><span class="track"></span><span class="thumb"></span></label></div>';
}
function bindToggle(id, cb){
  app.querySelector("#"+id).addEventListener("change", function(e){ cb(e.target.checked); });
}

