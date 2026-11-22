"use strict";
/* ============ Router ============ */
/* Eigener Navigations-Stack (rein im Speicher): "Zurück" geht immer zur tatsächlich
   zuvor besuchten Seite zurück, egal von wo man eine Ansicht geöffnet hat.
   Im echten Browser-Verlauf liegt dabei höchstens EIN zusätzlicher Eintrag ("Wächter"),
   solange man nicht auf der Startseite ist. Die Android-Zurück-Taste/-Geste landet so
   in unserem popstate-Handler und geht eine Seite zurück (bzw. schließt erst ein offenes
   Fenster); erst auf der Startseite verlässt sie die App. */
var navStack = ["#home"];
var navGuard = false;     // liegt gerade ein Wächter-Eintrag im Verlauf?
var navSkipPop = 0;       // selbst ausgelöste history.back()-Aufrufe, die popstate ignorieren soll

function navTop(){ return navStack[navStack.length-1]; }
function setUrl(hash){ try{ history.replaceState(history.state, "", hash); }catch(e){} }
function syncGuard(){
  if(navStack.length > 1 && !navGuard){
    try{ history.pushState({ bloc:1 }, "", navTop()); navGuard = true; }catch(e){ setUrl(navTop()); }
  } else if(navStack.length <= 1 && navGuard){
    navGuard = false; navSkipPop++;
    history.back();   // Wächter entfernen - popstate setzt danach die Adresse
  } else {
    setUrl(navTop());
  }
}
/* Die Hauptseiten (Heute · Training · Kalender · Fortschritt): Heute ist immer die oberste Stufe. Wer zu einer Hauptseite wechselt, hat danach nur Heute dahinter -
   „Zurück“ (Pfeil oder Android-Taste/-Geste) führt dann zu Heute, nicht durch die zuletzt besuchten Hauptseiten, und erst von Heute aus verlässt man die App. */
var HAUPTSEITEN = ["#training", "#kalender", "#koerper", "#stats"];
function go(hash){
  var neueSeite = navTop() !== hash;
  if(hash === '#home' || (HAUPTSEITEN.indexOf(hash) > -1 && hash !== '#koerper')) progKontext = null;   // ein Trainingsplan-Kontext endet mit dem Wechsel auf eine andere Hauptseite
  if(hash === "#home") navStack = ["#home"];
  else if(HAUPTSEITEN.indexOf(hash) > -1) navStack = ["#home", hash];
  else if(neueSeite) navStack.push(hash);
  syncGuard();
  render();
  if(neueSeite) window.scrollTo(0, 0);   // neue Seite beginnt immer oben
}
/* Weiterleitung von einer Seite ohne Inhalt (z. B. Deckblatt ohne Entwurf nach dem Neuladen): die tote Seite wird im Stack ERSETZT, nicht überdeckt -
   sonst führt „Zurück“ wieder auf die tote Seite, die leitet erneut weiter (Endlosschleife, die Zurück-Taste tut dann nichts mehr). */
function goErsetze(hash){
  if(navStack.length > 1) navStack.pop();
  if(hash === "#home") navStack = ["#home"];
  else if(navTop() !== hash) navStack.push(hash);
  syncGuard();
  render();
}
function goBack(fallback){
  if(navStack.length > 1){
    navStack.pop();
    syncGuard();
    render();
  } else {
    go(fallback);
  }
}
/* Die aktuelle Seite kommt aus dem Stack, nicht aus location.hash: nach history.back()
   hinkt die Adresse kurz hinterher. */
function parseHash(){
  var h = navTop().replace(/^#\/?/, "");
  var parts = h.split("/").filter(Boolean);
  return parts;
}

/* System-Zurück (Android-Taste/-Geste, Browser-Zurück) */
window.addEventListener("popstate", function(){
  if(navSkipPop > 0){ navSkipPop--; setUrl(navTop()); return; }
  // 0. Geteilter Link bei bereits laufender App (#import/…): Der Browser meldet auch das als popstate. Das ist kein „Zurück“, sondern ein neuer Eintrag oben im Verlauf - der dient ab jetzt als Wächter.
  var neuerHash = location.hash || "";
  if(neuerHash.indexOf("#import/") === 0 && navTop() !== neuerHash){
    navGuard = true;
    go(neuerHash);
    return;
  }
  navGuard = false;
  // 1. offenes Einblendfenster schließen (so, als hätte man daneben getippt)
  var ov = document.getElementById("overlayRoot");
  if(ov && ov.innerHTML){
    var bg = ov.querySelector(".confirm-overlay");
    if(bg) bg.click();
    if(ov.innerHTML) ov.innerHTML = "";
    if(infoTimer){ clearInterval(infoTimer); infoTimer = null; }
    syncGuard();
    return;
  }
  // 1b. Neues, nicht gespeichertes Workout: erst fragen (Speichern · Verwerfen)
  if(bauVerlassenFrage()){ syncGuard(); return; }
  // 1c. Plan-Bau und Gewichtung liegen auf der Katalogseite: Zurück geht erst zur Liste (wie der Pfeil oben), nicht gleich zur Startseite
  if(katPlanVerlassen()){ syncGuard(); return; }
  // 2. laufender Timer: nicht einfach weg - erst nachfragen
  if(document.getElementById("playerRoot").innerHTML && playerState){
    var st = playerState.steps[playerState.idx];
    if(st && st.phase === "done") exitPlayer();
    else { beendenFragen(); syncGuard(); }
    return;
  }
  // 3. eine Seite zurück; auf der Startseite bleibt kein Wächter übrig -> nächstes Zurück verlässt die App
  if(navStack.length > 1) navStack.pop();
  syncGuard();
  render();
});
/* Fallback: falls sich der Hash doch einmal außerhalb von go()/goBack() ändert
   (z.B. ein von Hand geänderter Link). */
window.addEventListener("hashchange", function(){
  var h = location.hash || "#home";
  if(navTop() === h) return;
  if(h === "#home") navStack = ["#home"]; else navStack.push(h);
  syncGuard();
  render();
});
/* Daten dauerhaft behalten: der Browser soll sie auch bei knappem Speicher nicht von sich aus löschen */
function datenDauerhaft(){
  try{ if(navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(function(ja){ if(!ja) navigator.storage.persist(); }).catch(function(){}); }catch(e){}
}
window.addEventListener("load", datenDauerhaft);
window.addEventListener("load", function(){
  var initial = location.hash || "#home";
  navStack = initial === "#home" ? ["#home"] : ["#home", initial];
  setUrl("#home");
  syncGuard();
  applyTheme();
  render();
  if(ERSTER_START && initial === "#home" && !state.db.settings.introGesehen) setTimeout(openIntro, 250);
  if(DB_GERETTET) setTimeout(function(){ showToast(t("datenGerettet")); }, 600);
  registerSW();
  maybeShowInstallTip();
});

/* ============ Direkter Installations-Button (Android/Chrome) ============ */
var deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", function(e){
  e.preventDefault();
  deferredInstallPrompt = e;
  render();
});
window.addEventListener("appinstalled", function(){
  deferredInstallPrompt = null;
  render();
});
function triggerInstall(){
  if(!deferredInstallPrompt) return;
  var promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  promptEvent.prompt();
  render();
}

/* ============ Theme ============ */
/* Farbe der Browser-/Statusleiste passend zum Seitenhintergrund */
var THEME_BAR_COLORS = { light:"#f5f5f2", dark:"#121214" };
function applyTheme(){
  var t = state.db.settings.theme;
  var root = document.documentElement;
  if(THEME_BAR_COLORS[t]) root.setAttribute("data-theme", t);
  else root.removeAttribute("data-theme");
  /* Das Aussehen ist immer Modern (das frühere Classic und die Einstellung dazu sind entfernt); das Attribut bleibt, weil layout-new.css darauf aufbaut */
  root.setAttribute("data-layout", "new");
  /* Glas-Design (layout-new.css): im Dunkel, auch wenn „System“ gewählt ist und das Gerät dunkel läuft; Hell bleibt wie es ist */
  var systemDunkel = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if(t === "dark" || (!THEME_BAR_COLORS[t] && systemDunkel)) root.setAttribute("data-glas", "1");
  else root.removeAttribute("data-glas");
  leistenFarbeAbgleichen();
}
/* Statusleiste des Handys: Der Timer und das Satz-Training sind in allen Designs dunkel (Glas auf dunklem Foto) - solange sie offen sind, ist auch die
   Leiste dunkel (sonst steht über dem dunklen Timer eine helle Leiste). Sonst passt sie zum gewählten Design. Die App kann die Farbe nur über das
   Meta-Feld theme-color setzen. */
var LEISTE_TRAINING = "#0b0d10";
function leistenFarbeAbgleichen(){
  var meta = document.querySelector('meta[name="theme-color"]');
  if(!meta) return;
  var pr = document.getElementById("playerRoot");
  if((pr && pr.innerHTML) || document.querySelector(".satz-root")){ meta.setAttribute("content", LEISTE_TRAINING); return; }
  var t = state.db.settings.theme;
  var dunkel = !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  meta.setAttribute("content", THEME_BAR_COLORS[t] || (dunkel ? THEME_BAR_COLORS.dark : THEME_BAR_COLORS.light));
}
applyTheme();
applyLang();

/* ============ Render dispatch ============ */
var app = document.getElementById("app");

/* Leiste unten: vier Ziele (Heute · Training · Path · Kalender), Suche und Einstellungen sind Symbole in der Kopfzeile */
/* Fotos gibt es nur noch auf der Startseite und bei Tools (feste Zuordnung, keine wechselnden Bilder, Favoriten ohne Foto). */
var FOTO_FOKUS = {
  "img/bereich-run.jpg":"85% 50%",
  "img/neu-p-mobility-sitz.jpg":"50% 60%",
  "img/neu-p-dehnung-silhouette.jpg":"35% 45%",
  "img/neu-p-frau-kniebeuge.jpg":"50% 30%"
};
function fotoFokus(pfad){ return FOTO_FOKUS[pfad] || ""; }
function fotoHash(s){ var h = 0; s = String(s); for(var i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) % 100003; return h; }
function bereichFotosNeu(){
  return { run:"img/bereich-run.jpg", warm:"img/neu-p-mobility-sitz.jpg", intervall:"img/neu-p-dehnung-silhouette.jpg" };
}
var builderAuto = null;   // "zufall" | "selber": der Workout-Builder auf Heute löst im Baukasten gleich die Wahl aus
/* Kopfzeilen-Symbole im Aussehen „New“: fester Aufbau, überall nur Suche + Einstellungen rechts. Hell/Dunkel und Körperdaten stehen in den Einstellungen. */
var SYM_SUCHE = '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>';
function themeIstDunkel(){
  var th = state.db.settings.theme;
  if(th === "dark") return true;
  if(th === "light") return false;
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}
function kopfSymboleNeu(){
  var s = '<button type="button" class="iconbtn kopf-sym" data-nav="#search" aria-label="'+esc(t("search"))+'">'+svgIcon(SYM_SUCHE)+'</button>';
  s += '<button type="button" class="iconbtn kopf-sym" data-nav="#settings" aria-label="'+esc(t("settings"))+'">'+ICON_SETTINGS+'</button>';
  return s;
}
/* Runder Hauptknopf rechts neben der Leiste (New): Heute = Training starten, Training = Bauen, Kalender = Einplanen, Fortschritt = keiner */
function hauptAktionNeu(route){
  if(route === "home" && fokusAus("katalog")) return null;   // ohne Workout (Fokus) gibt es hier nichts zu starten
  if(route === "home") return { svg:P_PLAY, label:t("hauptStart"), fn:function(){
    var hk = app.querySelector("[data-herostart]");
    if(hk && hk.getAttribute("data-herostart") === "plan"){ hk.click(); return; }   // heute eingeplant: dieses Training starten
    var ph = programmHeute();                                                        // sonst: ein Programm, das heute (Wochentag) dran ist
    if(ph) return programmStarten(ph.p, ph.i);
    /* nichts im Kalender und in keinem Programm: Hinweis auf Trainingsplan bzw. Kalender-Eintrag */
    openActionSheet(t("keinePlaeneTitel"), [
      { ico:P_PLUS, label:t("keinePlaeneAnlegen"), fn:function(){ go("#koerper"); } },
      { ico:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>', label:t("keinePlaeneKalender"), fn:function(){ go("#kalender"); } }
    ]);
  } };
  if(route === "kalender") return { svg:P_PLUS, label:t("kalAdd"), fn:function(){ kalHinzuMenue(kalAnsicht === "monat" && kalAuswahl ? kalAuswahl : kalTagKey(Date.now())); } };
  return route === "home" ? null : hauptAktionNeu("home");   // der runde Knopf steht auf allen Hauptseiten (Arena › Fortschritt, Fragen: wie auf Heute)
}
var NEU_TABS = { home:"#home", training:"#training", kalender:"#kalender", koerper:"#training", stats:"#stats", faq:"#training" };   // Trainingsplan liegt unter Tools; Fortschritt hat einen eigenen Reiter
function tabLeiste(route){
  var el = document.getElementById("tabbar");
  if(!el) return;
  /* Die Leiste steht nur auf den vier Hauptseiten */
  var aktiv = NEU_TABS[route] || null;
  if(!aktiv){ el.innerHTML = ""; el.classList.add("hidden"); document.body.classList.remove("mit-tabs"); return; }
  var eintraege = [
    ["#home", t("tabHeute"), '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>'],
    ["#training", t("tabTraining"), '<path d="M6 7v10M3 10v4M18 7v10M21 10v4M6 12h12"/>'],
    ["#stats", t("tabFortschritt"), '<path d="M4 4v16h16"/><path d="M8 15l3.5-4.5 3 2.5L20 7"/>'],
    ["#kalender", t("tabKalender"), '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>']
  ];
  var tabsHTML = eintraege.map(function(x){
    return '<button type="button" class="tab'+(x[0] === aktiv ? ' active' : '')+'" data-nav="'+x[0]+'"'+(x[0] === aktiv ? ' aria-current="page"' : '')+'>'+
      (x[2] ? svgIcon(x[2]) : '<span class="ico">'+ICON_SETTINGS+'</span>')+'<span>'+esc(x[1])+'</span></button>';
  }).join("");
  var haupt = hauptAktionNeu(route);
  el.innerHTML = '<div class="pille">'+tabsHTML+'</div>'+(haupt ? '<button type="button" class="hauptknopf" data-haupt aria-label="'+esc(haupt.label)+'" title="'+esc(haupt.label)+'">'+svgIcon(haupt.svg)+'</button>' : '');
  el.classList.remove("hidden"); document.body.classList.add("mit-tabs");
  var hb = el.querySelector("[data-haupt]");
  if(hb) hb.addEventListener("click", function(){ haupt.fn(); });
  el.querySelectorAll("[data-nav]").forEach(function(b){
    b.addEventListener("click", function(){
      var h = b.getAttribute("data-nav");
      if(navTop() === h) return;
      if(h !== "#home") navStack = ["#home"];
      go(h);
    });
  });
}
/* Gewählte Filter gelten höchstens bis zum Ende des Kalendertags. Geprüft wird beim App-Start und bei der Rückkehr aus dem Hintergrund,
   nie mitten in der Bedienung: Wer um Mitternacht gerade filtert, verliert seine Auswahl nicht. Sortierung A–Z bleibt stehen. */
var FILTER_FELDER = ["stGruppen", "stArten", "stGeraete", "stTrain", "stAusr", "stSchw", "stZonen", "wsRegionen", "wsZonen", "buildCats", "buildCat", "buildEquips", "buildZonen"];
var filterTagOffen = true;
function filterTagPruefen(){
  var s = state.db.settings, heute = kalTagKey(new Date());
  if(s.filterTag === heute) return false;
  FILTER_FELDER.forEach(function(k){ delete s[k]; });
  s.filterTag = heute;
  suchTrain = []; suchAusr = []; suchZonen = []; suchSchw = []; suchLib = [];
  save();
  return true;
}
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState !== "visible" || !filterTagPruefen()) return;
  var route = parseHash()[0];
  if(["katalog", "library", "uebungskatalog", "search", "warmstretch", "mybuild"].indexOf(route) < 0) return;   // nur Seiten mit Filter neu zeichnen
  var y = window.scrollY; render(); window.scrollTo(0, y);
});
function render(){
  if(document.getElementById("playerRoot").innerHTML) return; // don't re-render behind active player
  if(filterTagOffen){ filterTagOffen = false; filterTagPruefen(); }
  setTimeout(leistenFarbeAbgleichen, 0);   // nach dem Zeichnen: Statusleiste passend (Satz-Training dunkel, sonst das gewählte Design)
  var parts = parseHash();
  var route = parts[0] || "home";
  if(route !== "katalog") builderAuto = null;   // ein nicht ausgelöster Wunsch des Workout-Builders gilt nicht für den nächsten Besuch
  tabLeiste(route);
  if(route==="home" || route==="training"){   // Filter und aufklappbare Bereiche (Air-Filter, Studio-Filter, Studio-Timer) beginnen bei jedem neuen Besuch zugeklappt
    stPlanAktiv = null; stPlanBauen = false;   // ein zuletzt geöffneter Plan gilt nicht weiter (Satz-/Timer-Wahl und Training speichern folgen sonst einem alten Plan)
    var sz = state.db.settings; delete sz.libFilterOpen; delete sz.stFilterOpen; delete sz.wsFilterOpen; delete sz.buildFilterOpen; delete sz.stTimerAuf;
    /* Gewählte Filter (Gruppe, Ausrüstung, Körperkarte; Mobility & Stretch; Übungsauswahl) werden nicht aufbewahrt: jeder neue Besuch beginnt ohne Filter.
       Sortierung A–Z und die Art des Bauens bleiben als Einstellungen stehen. */
    FILTER_FELDER.forEach(function(k){ delete sz[k]; });
    hinweisBesucht = {};   // Erklärtexte: der nächste Besuch einer Seite zählt wieder
    katOffen = {};         // Katalog: beim nächsten Besuch stehen wieder nur die Überschriften
  }
  if(studioPause && route !== "studio") studioPauseStop();
  if(route==="home") return renderHome();
  if(route==="training") return renderTraining();
  if(route==="faq") return renderFaq();
  if(route==="protein") return renderProtein();
  if(route==="satz") return renderSatzTraining(parts[1], parts[2]);
  if(route==="warmstretch") return renderWarmStretch();
  if(route==="kalender"){ renderKalender(); setTimeout(kalHeuteSichtbar, 80); return; }   // go() setzt danach nach oben: erst dann den heutigen Tag ins Bild holen
  if(route==="run") return renderRun();
  if(route==="rundetail") return renderRunDetail(parts[1]);
  if(route==="intervall") return renderIntervall();   // Timer: eigene Seite (früher je ein Reiter in Air und Studio)
  if(route==="timers"){
    if(parts[1] === "workouts" || parts[1] === "blocks"){   // frühere Timer-Reiter: jetzt die Timer-Seite
      navStack[navStack.length-1] = "#intervall"; setUrl("#intervall");
      return renderIntervall();
    }
    return renderKatalog();   // Studio ist jetzt der Katalog
  }
  if(route==="studioplan"){   // Favorit auf der Startseite: Katalog › Meine › Plan direkt geöffnet
    var sp0 = state.db.settings;
    if(stPlanFind(parts[1])){ sp0.katTab = "blocs"; stPlanAktiv = parts[1]; stPlanBauen = false; stPlanQuery = ""; }
    navStack[navStack.length-1] = "#katalog"; setUrl("#katalog");
    return renderKatalog();
  }
  if(route==="blocks"){ navStack[navStack.length-1] = "#intervall"; setUrl("#intervall"); return renderIntervall(); }
  if(route==="block") return renderBlockEdit(parts[1]);
  if(route==="workout") return renderWorkoutEdit(parts[1]);
  if(route==="settings") return renderSettings();
  if(route==="search") return renderSearch();
  if(route==="koerper") return renderKoerper();
  if(route==="stats") return renderFortschritt();
  if(route==="studio") return renderStudioKarte(parts[1]);
  if(route==="install") return renderInstallGuide();
  if(route==="play") return startPlayer(parts[1]);
  if(route==="playblock") return startBlockPlayer(parts[1]);
  if(route==="katalog" || route==="library") return renderKatalog();   // „#library“ (Air) und „#timers“ (Studio) sind jetzt der Katalog
  if(route==="uebungskatalog"){ state.db.settings.katTab = "katalog"; state.db.settings.katAbt = "uebungen"; return renderKatalog(); }
  if(route==="exedit") return renderExEdit(parts[1]);
  if(route==="import") return renderImport(parts[1]);
  if(route==="mybuild") return renderMyBuild(parts[1]);
  if(!(coverDraft && coverDraft.src === "neu" && (route === "cover" || route === "playdraft"))) bauEntwurf = null;   // Baukasten verlassen (das Deckblatt eines noch nicht gespeicherten Workouts behält den Entwurf zum Zurückkehren)
  if(route==="playmy") return launchFromSource({ type:"mine", id:parts[1] });
  if(route==="cover") return parts[1]==="surprise" || parts[1]==="shared" || parts[1]==="neu"
    ? (coverDraft && coverDraft.src===parts[1] ? renderDraftPage(coverDraft, { cover:true, back:"#library" }) : goErsetze("#library"))
    : renderCover(parts[1], parts[2]);
  if(route==="playdraft") return launchFromSource({ type:"draft" });
  if(route==="playlib") return launchFromSource({ type:"libworkout", id:parts[1] });
  if(route==="playex") return launchFromSource({ type:"exercise", id:parts[1] });
  if(route==="playst") return launchFromSource({ type:"studio", id:parts[1] });
  return renderHome();
}

function topbar(title, opts){
  opts = opts || {};
  var back = opts.back ? '<button class="iconbtn back" data-back="'+opts.back+'" title="'+t("back")+'">'+ICON_BACK+'</button>' : "";
  var right = opts.right || "";
  return '<div class="topbar'+(opts.home?' home':'')+'">'+back+'<h1><span class="ttl">'+esc(title)+'</span>'+
    (opts.sub ? '<span class="ttl-sub">'+esc(opts.sub)+'</span>' : '')+'</h1>'+right+'</div>';
}
var SEP = ' <span class="sep-dot">&middot;</span> ';

/* Erklärtexte über den Listen: bei den ersten Besuchen einer Seite stehen sie da, danach genügt ein „?“ in der Kopfzeile, das sie in einem Fenster öffnet.
   Ein Besuch = die Seite von der Startseite aus betreten (Reiter, Filter und Zurück zählen nicht); gezählt wird in settings.hinweise.
   hinweise(key, [Textschlüssel …]) gibt { knopf: das „?“ (nur wenn die Texte eingeklappt sind), z(i, klasse): Zeile i (nur solange sie noch stehen) } zurück. */
var HINWEIS_BESUCHE = 3;
var hinweisBesucht = {};   // seit dem letzten Besuch der Startseite schon gezählte Seiten
var hinweisTexte = [];     // Texte der gerade gezeigten Seite (für das Fenster)
var ICON_HILFE = '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8M12 17v.2"/>';
function hinweise(key, keys){
  var texte = hinweisTexte = keys.map(function(k){ return t(k); });
  if(!keys.length) return { knopf:"", z:function(){ return ""; } };
  var h = state.db.settings.hinweise || (state.db.settings.hinweise = {});
  if(!hinweisBesucht[key]){ hinweisBesucht[key] = true; h[key] = (h[key] || 0) + 1; save(); }
  var offen = false;   // lange Erklärtexte stehen nie mehr auf der Seite, nur noch hinter dem „?“
  return {
    knopf: offen ? "" : '<button type="button" class="iconbtn" data-hinweis title="'+esc(t("hwKnopf"))+'" aria-label="'+esc(t("hwKnopf"))+'">'+svgIcon(ICON_HILFE)+'</button>',
    z: function(i, klasse){ return offen ? '<div class="'+klasse+'">'+esc(texte[i])+'</div>' : ''; }
  };
}
function openHinweise(){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet wi-sheet" role="dialog" aria-label="'+esc(t("hwTitel"))+'">'+
    '<h3>'+esc(t("hwTitel"))+'</h3>'+
    hinweisTexte.map(function(x){ return '<p class="hw-zeile">'+esc(x)+'</p>'; }).join("")+
    '<button class="btn btn-secondary" data-ok style="margin-top:12px">'+esc(t("wiOk"))+'</button>'+
  '</div></div>';
  function zu(){ root.innerHTML = ""; }
  root.querySelector("[data-ok]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
}

