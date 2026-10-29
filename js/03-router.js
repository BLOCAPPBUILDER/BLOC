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
    else { confirmSheet(t("endQ"), t("endText"), t("endBtn"), exitPlayer); syncGuard(); }
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
/* Foto-Pool für das Aussehen New: je Art mehrere Bilder. fotosZuteilen vergibt sie so, dass kein Bild doppelt vorkommt,
   solange es freie gibt: zuerst das passende der eigenen Art (ab einem festen Startpunkt, dann das nächste freie), danach das
   nächste freie aus allen anderen. Die Reihenfolge der Vergabe ist nach Schlüssel sortiert, damit es stabil bleibt. */
var FOTO_POOL = (function(){
  var P = function(n){ return "img/neu-p-" + n + ".jpg"; };
  return {
    tp:  ["img/neu-freiluft.jpg", P("freiluft-meer"), P("liegestuetz-strand"), P("liegestuetz-stadt")],
    st:  [P("studio-hantelreihe"), P("studio-gewichtsblock"), P("studio-halle"), "img/neu-workout.jpg", "img/neu-kopf.jpg"],   // Geräte zuerst (Wunsch: Workout-Karte ohne Person)
    ti:  ["img/neu-h-brust-2.jpg"],   // Timer im Dunkeln wie im Hellen (2026-10-23)
    ws:  [P("mobility-sitz"), P("mobility-ausfall")],   // ohne neu-mobility (Kopf im Profil, passte nicht zum Bereich)
    run: ["img/neu-run.jpg", P("run-licht"), P("run-strasse"), P("run-sw")],
    /* Themen für Favoriten (nach Inhalt des Workouts, siehe favFotoPool) */
    core:     ["img/neu-d-core.jpg", P("frau-kniebeuge"), P("liegestuetz-feld")],
    beine:    [P("frau-kniebeuge"), P("mobility-ausfall"), P("freiluft-meer"), P("studio-gewichtsblock")],
    ruecken:  [P("frau-klimmzug"), P("frau-latzug"), "img/neu-freiluft.jpg"],
    brust:    [P("liegestuetz-strand"), P("liegestuetz-stadt"), P("liegestuetz-feld")],
    arme:     [P("frau-klimmzug"), P("studio-hantelreihe"), P("studio-halle")],
    schulter: [P("frau-latzug"), P("studio-hantelreihe")],
    mobility: [P("mobility-sitz"), P("mobility-ausfall")],
    timer:    ["img/neu-h-brust-2.jpg", "img/neu-timer.jpg", P("studio-halle"), P("liegestuetz-feld")]
  };
})();
/* Heller Modus: helle Fotos (Pexels, siehe BilderBloc\Helle Bilder). Silhouetten und Schwarz-Weiß-Bilder bleiben dem Dunkel überlassen;
   Run behält in beiden Modi das klassische Läuferbild. Karten auf Training und Favoriten sind im Hellen „helle Karten“ (layout-new.css). */
var FOTO_POOL_HELL = {
  tp:  FOTO_POOL.tp,   // wie im Dunkel (die hellen Klimmzug-Bilder sind gelöscht)
  st:  ["img/neu-p-frau-kniebeuge.jpg"],   // Workout im Hellen: Kniebeuge (2026-10-23)
  ti:  ["img/neu-h-brust-2.jpg"],   // Timer im Hellen (2026-10-23)
  ws:  FOTO_POOL.ws,   // wie im Dunkel
  run: FOTO_POOL.run,
  core:     ["img/neu-h-core-1.jpg", "img/neu-h-core-2.jpg", "img/neu-h-kettlebell.jpg", "img/neu-h-kb-gelb.jpg"],
  beine:    ["img/neu-p-frau-kniebeuge.jpg", "img/neu-h-band.jpg", "img/neu-h-halle.jpg"],
  ruecken:  ["img/neu-p-frau-klimmzug.jpg", "img/neu-p-frau-latzug.jpg"],
  brust:    ["img/neu-h-brust-1.jpg", "img/neu-h-brust-2.jpg", "img/neu-h-rack.jpg"],
  arme:     ["img/neu-p-frau-klimmzug.jpg", "img/neu-h-kb-gelb.jpg", "img/neu-h-rack.jpg", "img/neu-h-kettlebell.jpg"],
  schulter: ["img/neu-p-frau-latzug.jpg", "img/neu-h-rack.jpg"],
  mobility: FOTO_POOL.mobility,
  timer:    ["img/neu-h-brust-2.jpg", "img/neu-h-kettlebell.jpg", "img/neu-h-kb-gelb.jpg"]
};
function fotoPool(){ return themeIstDunkel() ? FOTO_POOL : FOTO_POOL_HELL; }
/* Bildausschnitt je Foto: breite, flache Karten zeigen nur einen Streifen; hier steht, welcher Teil des Bildes dabei
   sichtbar bleiben soll (Prozent für background-position bzw. object-position). Ohne Eintrag gilt der Wert aus layout-new.css. */
var FOTO_FOKUS = {
  "img/neu-p-freiluft-leiter.jpg":"50% 62%",
  "img/neu-p-freiluft-meer.jpg":"50% 76%",   // Sportplatz am Meer
  // Stangen in der Mitte
  "img/neu-freiluft.jpg":"50% 66%",          // Gerüste knapp unter der Mitte
  "img/bereich-run.jpg":"85% 50%",           // klassisches Run-Bild: Läufer rechts der Mitte
  "img/neu-run.jpg":"50% 60%",
  "img/neu-p-run-licht.jpg":"50% 70%",
  "img/neu-p-run-strasse.jpg":"50% 68%",
  "img/neu-p-run-sw.jpg":"50% 70%",
  "img/neu-mobility.jpg":"50% 25%",          // Kopf und Arme statt nur der Hände
  "img/neu-p-mobility-ausfall.jpg":"50% 35%",
  "img/neu-p-mobility-sitz.jpg":"50% 60%",
  "img/neu-workout.jpg":"50% 48%",
  "img/neu-timer.jpg":"50% 66%",             // Person auf der Box im unteren Drittel
  "img/neu-kopf.jpg":"50% 60%",
  "img/neu-p-liegestuetz-strand.jpg":"50% 70%",
  "img/neu-p-liegestuetz-stadt.jpg":"50% 55%",
  "img/neu-p-liegestuetz-feld.jpg":"50% 55%",
  "img/neu-p-studio-halle.jpg":"50% 55%",
  "img/neu-p-timer-box.jpg":"50% 62%",
  "img/neu-p-frau-latzug.jpg":"50% 38%", "img/neu-p-frau-klimmzug.jpg":"50% 40%", "img/neu-p-frau-kniebeuge.jpg":"50% 45%",
  "img/neu-h-halle.jpg":"50% 62%", "img/neu-h-rack.jpg":"50% 45%", "img/neu-h-dehnen.jpg":"50% 40%",
  "img/neu-h-band.jpg":"50% 62%", "img/neu-h-kettlebell.jpg":"50% 32%", "img/neu-h-kb-gelb.jpg":"50% 70%", "img/neu-d-kalender.jpg":"50% 45%", "img/neu-h-brust-1.jpg":"50% 50%", "img/neu-h-brust-2.jpg":"50% 66%", "img/neu-h-core-1.jpg":"50% 50%", "img/neu-h-core-2.jpg":"50% 62%", "img/neu-d-core.jpg":"50% 68%", "img/neu-d-katalog.jpg":"50% 42%"
};
function fotoFokus(pfad){ return FOTO_FOKUS[pfad] || ""; }
function fotoHash(s){ var h = 0; s = String(s); for(var i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) % 100003; return h; }
function fotosZuteilen(items){   // items: [{ key, pool }] → { key: Pfad }
  var alle = [], belegt = {}, out = {}, POOL = fotoPool();
  Object.keys(POOL).forEach(function(k){ POOL[k].forEach(function(f){ if(alle.indexOf(f) < 0) alle.push(f); }); });
  items.slice().sort(function(a, b){ return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; }).forEach(function(it){
    var pool = POOL[it.pool] || POOL.st, h = fotoHash(it.key), w = null, i, f;
    for(i = 0; i < pool.length && !w; i++){ f = pool[(h + i) % pool.length]; if(!belegt[f]) w = f; }
    var VERWANDT = { st:["st"], tp:["tp"], ti:["ti", "st"], ws:["ws"], run:["run"] };   // erst Bilder aus verwandten Arten
    (VERWANDT[it.pool] || ["st", "tp"]).forEach(function(a){
      var p2 = POOL[a] || [];
      for(i = 0; i < p2.length && !w; i++){ f = p2[(h + i) % p2.length]; if(!belegt[f]) w = f; }
    });
    for(i = 0; i < alle.length && !w; i++){ f = alle[(h + i) % alle.length]; if(!belegt[f]) w = f; }
    if(!w) w = pool[h % pool.length];   // mehr Karten als Bilder: dann darf sich eines wiederholen
    belegt[w] = true; out[it.key] = w;
  });
  return out;
}/* Foto je Bereich für heute: dieselbe Zuteilung für die Karten auf Training und die Köpfe der Bereichsseiten (kein Bild doppelt,
   wechselt von Tag zu Tag). Schlüssel wie data-bereich: katalog, warm, intervall, run. */
function bereichFotosNeu(){
  var tag = Math.floor(Date.now()/86400000), ART = { katalog:"st", warm:"ws", intervall:"ti", run:"run" }, out = {};
  var zu = fotosZuteilen(Object.keys(ART).map(function(k){ return { key:k + ":" + tag, pool:ART[k] }; }));
  Object.keys(ART).forEach(function(k){ out[k] = zu[k + ":" + tag]; });
  out.run = "img/bereich-run.jpg";   // Run behält das klassische Läuferbild (Karte und Kopf der Run-Seite)
  return out;
}var builderAuto = null;   // "zufall" | "selber": der Workout-Builder auf Heute löst im Baukasten gleich die Wahl aus
/* Kopfzeilen-Symbole im Aussehen „New“ wie im Entwurf: Heute = Hell/Dunkel + Suche + Einstellungen, Training = Suche + Einstellungen,
   Fortschritt = Einstellungen */
var SYM_SUCHE = '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>';
var SYM_SONNE = '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>';
function themeIstDunkel(){
  var th = state.db.settings.theme;
  if(th === "dark") return true;
  if(th === "light") return false;
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}
function kopfSymboleNeu(art){
  var s = "";
  if(art === "home"){
    var d = themeIstDunkel();
    s += '<button type="button" class="iconbtn kopf-sym" data-themetoggle aria-label="'+esc(t("themeWechsel"))+'">'+svgIcon(d ? ICON_MOON : SYM_SONNE)+'</button>';
  }
  if(art === "home" || art === "training")
    s += '<button type="button" class="iconbtn kopf-sym" data-nav="#search" aria-label="'+esc(t("search"))+'">'+svgIcon(SYM_SUCHE)+'</button>';
  s += '<button type="button" class="iconbtn kopf-sym" data-nav="#settings" aria-label="'+esc(t("settings"))+'">'+ICON_SETTINGS+'</button>';
  return s;
}
function bindThemeToggle(){
  var b = app.querySelector("[data-themetoggle]");
  if(b) b.addEventListener("click", function(){
    /* Wechsel: Hell ↔ Dunkel (aus „System“ wird das Gegenteil des aktuellen Aussehens) */
    var th = state.db.settings.theme;
    state.db.settings.theme = th === "light" ? "dark" : th === "dark" ? "light" : (themeIstDunkel() ? "light" : "dark");
    save(); applyTheme(); render();
  });
}
/* Runder Hauptknopf rechts neben der Leiste (New): Heute = Training starten, Training = Bauen, Kalender = Einplanen, Fortschritt = keiner */
function hauptAktionNeu(route){
  if(route === "home" && fokusAus("katalog")) return null;   // ohne Workout (Fokus) gibt es hier nichts zu starten
  if(route === "home") return { svg:P_PLAY, label:t("hauptStart"), fn:function(){
    var hk = app.querySelector("[data-herostart]");
    if(hk && hk.getAttribute("data-herostart") === "plan"){ hk.click(); return; }   // heute eingeplant: dieses Training starten
    var ph = programmHeute();                                                        // sonst: ein Programm, das heute (Wochentag) dran ist
    if(ph) return programmStarten(ph.p, ph.i);
    showToast(t("keinePlaene"));                                                    // nichts im Kalender und in keinem Programm
  } };
  if(route === "kalender") return { svg:P_PLUS, label:t("kalAdd"), fn:function(){ kalHinzuMenue(kalAnsicht === "monat" && kalAuswahl ? kalAuswahl : kalTagKey(Date.now())); } };
  return route === "home" ? null : hauptAktionNeu("home");   // der runde Knopf steht auf allen Hauptseiten (Arena › Fortschritt, Fragen: wie auf Heute)
}
var NEU_TABS = { home:"#home", training:"#training", kalender:"#kalender", koerper:"#koerper", stats:"#koerper", faq:"#training" };
function tabLeiste(route){
  var el = document.getElementById("tabbar");
  if(!el) return;
  /* Die Leiste steht nur auf den vier Hauptseiten */
  var aktiv = NEU_TABS[route] || null;
  if(!aktiv){ el.innerHTML = ""; el.classList.add("hidden"); document.body.classList.remove("mit-tabs"); return; }
  var eintraege = [
    ["#home", t("tabHeute"), '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>'],
    ["#training", t("tabTraining"), '<path d="M6 7v10M3 10v4M18 7v10M21 10v4M6 12h12"/>'],
    ["#koerper", t("tabArena"), '<circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M8.2 19h8.3a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7h8.3"/>'],
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
function render(){
  if(document.getElementById("playerRoot").innerHTML) return; // don't re-render behind active player
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
    ["stGruppen", "stArten", "stGeraete", "stTrain", "stAusr", "stZonen", "wsRegionen", "wsZonen", "buildCats", "buildCat", "buildEquips", "buildZonen"].forEach(function(k){ delete sz[k]; });
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
  if(route==="stats"){ state.db.settings.koerperTab = "fortschritt"; return renderKoerper(); }
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
    ? (coverDraft && coverDraft.src===parts[1] ? renderDraftPage(coverDraft, { cover:true, back:"#library" }) : go("#library"))
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

