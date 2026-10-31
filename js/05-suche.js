"use strict";
/* ============ Gesamtsuche ============
   Lupe auf der Startseite (neben dem Zahnrad): durchsucht Übungen, Workouts (Air und eigene),
   Timer-Workouts, Blöcke, die Bereiche und Aktionen wie „Neuer Block“. Das Feld bleibt stehen, nur die Treffer werden neu gezeichnet. */
var gesamtQuery = "";
/* Kategorien der Suche: ordnet die Gruppen der Treffer sechs Kategorien zu (Chips unter dem Suchfeld) */
var suchKat = "alle", suchZonen = [], suchKoerperAuf = false;   // Körper-Filter der Suche: gewählte Muskelgruppen, Karte offen
/* Filter der Suche (Karte wie beim Bauen eines Workouts, Bild oben entfällt): dieselben Attribute und dieselbe Logik wie im Workout-Filter (studioFilterHTML): Trainingsart (studio | cali | body, TRAIN_ARTEN)
   und Ausrüstung (AUSR_IDS), jeweils Mehrfachwahl, leer = alles. Bewusst nur im Speicher (suchTrain/suchAusr) und NICHT in settings.stTrain/stAusr,
   damit eine Suche den Filter im Workout-Bereich nicht verstellt. Die Chips sind kompakt (Text statt Fotokarten). */
var suchTrain = [], suchAusr = [], suchLib = [];   // suchLib: Kategorie-Chips (LIB_CATS) im Übungs- und Workoutkatalog, wie beim Bauen eines BLOCs
var SUCH_KATEGORIEN = ["alle", "uebungen", "workouts", "timer", "bereiche", "erstellen"];
function suchKategorie(gruppe){
  if(gruppe === t("libExercises")) return "uebungen";
  if(gruppe === t("workouts") || gruppe === t("mineMy")) return "workouts";
  if(gruppe === t("mineTimer") || gruppe === t("mineBlocks")) return "timer";
  if(gruppe === t("srAreas")) return "bereiche";
  return "erstellen";
}
function gesamtEintraege(){
  var l = [];
  function add(gruppe, titel, sub, text, fn){ l.push({ g:gruppe, k:suchKategorie(gruppe), titel:titel, sub:sub || "", text:titel+" "+(sub || "")+" "+(text || ""), fn:fn }); }
  var s = state.db.settings, neu = t("create");
  // Aktionen (auch Erstellen von Blöcken, Timer-Workouts, Workouts, Übungen, Challenges)
  add(neu, t("newBlock"), t("mineBlocks"), "block timer intervall erstellen anlegen neu create new", function(){ go("#block/"+createBlock().id); });
  add(neu, t("fabTimerWo"), t("mineTimer"), "timer workout intervall bloecke blöcke erstellen anlegen neu create new", function(){ go("#workout/"+createTimerWorkout().id); });
  add(neu, t("katFabPlan"), t("katalog"), "workout planen plan gewicht wiederholungen erstellen anlegen neu create plan weight reps", function(){ go("#katalog"); katPlanNeu(); });
  add(neu, t("genNew"), t("katalog"), "plan gewichtung nach erstellen anlegen neu create weighting", function(){ go("#katalog"); katPlanGenNeu(); });
  add(neu, t("myNew"), t("katalog"), "workout timer bauen baukasten erstellen anlegen neu create build timer workout", function(){ go("#mybuild/new"); });
  add(neu, t("exNew"), t("libExercises"), "uebung übung erstellen anlegen neu create exercise", function(){ go("#exedit/new"); });
  // Bereiche
  [["#katalog", t("katalog")], ["#intervall", t("tabTimer")], ["#run", t("runTitle")], ["#warmstretch", t("warmTitle")], ["#settings", t("settings")]].forEach(function(p){
    add(t("srAreas"), p[1], "", "", function(){ go(p[0]); });
  });
  // Workouts aus Air und eigene Workouts
  LIB_WORKOUTS.forEach(function(lw){
    if(libHidden("wo:"+lw.id)) return;
    var exs = lw.exercises.map(findExercise).filter(Boolean);
    add(t("workouts"), tplText(lw.name), t("exCount", { n:exs.length })+" · "+fmtDauerKurz(workoutDuration(libWorkoutRun(lw))), woSearchText("", exs), function(){ go("#cover/lib/"+lw.id); });
    if(!libIstWarmDehn(lw)){ l[l.length-1].welt = katWoOrt(exs); }   // Freiluft blau, Fitnessstudio orange (Aufwärmen und Dehnen gehören zu Mobility & Stretch)
    l[l.length-1].exs = exs.map(function(ex){ return ex.id; });   // für den Ausrüstungs-Filter
    l[l.length-1].cat = lw.focus;
  });
  (state.db.myWorkouts || []).map(normMy).forEach(function(mw){
    var exs = mw.items.map(function(it){ return findExercise(it.ex); }).filter(Boolean);
    add(t("mineMy"), mw.name, t("exCount", { n:exs.length }), woSearchText("", exs), function(){ go("#mybuild/"+mw.id); });
    if(!mw.ws){ l[l.length-1].welt = katWoOrt(exs); }
    l[l.length-1].exs = exs.map(function(ex){ return ex.id; });
    l[l.length-1].cat = "mix";
  });
  // Übungen
  EXERCISES.forEach(function(ex){
    if(libHidden("ex:"+ex.id)) return;
    add(t("libExercises"), tplText(ex.name), ex.cats.map(catName).join(", "), exSearchText(ex), function(){
      if(EX_INFO[ex.id]) exInfoSuche(ex.id);
      else go(ex.custom ? "#exedit/"+ex.id : "#playex/"+ex.id);
    });
    l[l.length-1].ex = ex.id;   // für den Körper-Filter der Suche
    l[l.length-1].cat = ex.cats[0];
  });
  // Timer-Workouts und Blöcke
  state.db.workouts.forEach(function(w){ add(t("mineTimer"), w.name || t("untitled"), "", "", function(){ go("#workout/"+w.id); }); });
  state.db.blocks.forEach(function(b){ add(t("mineBlocks"), b.name, blockSpec(b), "", function(){ go("#block/"+b.id); }); });
  return l;
}
/* Filterkarte der Suche: dieselbe Karte wie beim Bauen eines Workouts (Trainingsart als Fotokarten, Ausrüstung, Muskel), aber mit eigenem Speicher
   (suchTrain/suchAusr/suchZonen), damit die Suche den Filter im Workout-Bereich nicht verstellt. Auf/Zu merkt sich suchFilterAuf. */
var suchFilterAuf = false;
function suchFilterKarteHTML(anzahl){
  var namen = suchTrain.map(function(a){ return t("trArt_"+a); }).concat(suchAusr.map(function(g){ return t("stGer_"+g); }), suchZonen.map(kkName));
  return filterKarteHTML({ offen:suchFilterAuf, toggle:"data-srtoggle", reset:"data-srreset", n:namen.length,
    summe:namen.length ? namen.join(", ") : t(suchKat === "workouts" ? "afAlleWo" : "afAlleEx"),
    zeigen:t(anzahl === 1 ? "srAnzeigen1" : "srAnzeigenN", { n:anzahl }),
    inhalt:filterSchrittHTML(1, t("trSchritt1"))+trainFotosHTML("data-srtrain", suchTrain)+
      filterSchrittHTML(2, t("stGerKopf"))+
      '<div class="fc-chips af-ausr">'+AUSR_IDS.map(function(g){
        return filterChip("data-srausr", g, suchAusr.indexOf(g) > -1, svgIcon(STUDIO_GERAET_ICON[g] || STUDIO_AUSR_ICON[g]), t("stGer_"+g)); }).join("")+'</div>'+
      filterSchrittHTML(3, t("trSchritt3"))+
      kkMuskelHTML("data-srzone", "data-srgrp", suchZonen, { ohneLabel:true }) });
}
/* Übung in der Suche: Antippen öffnet erst die Info-Karte (beim Stöbern startet nichts von allein), der Start liegt als Knopf in der Karte.
   Zurück aus dem Timer oder der Studio-Seite führt über den Navigations-Stack wieder zur Suche. */
function exInfoSuche(id){
  var ex = findExercise(id), onChange = function(){ if(navTop() === "#search"){ var y = window.scrollY; renderSearch(); window.scrollTo(0, y); } };
  openExInfo(id, false, { onChange:onChange, zu:function(){ exZuProgramm(id); },
    play:function(){ go(ex && STUDIO_NUR[id] ? "#studio/"+id : "#playex/"+id); } });
}
/* Kachel wie im Workout-Baukasten (13-teilen-editor): Rahmen und Farbe nach Trainingsart (Fitnessstudio rot, Calisthenic-Park blau, Körpergewicht gelb, Mobility grün) */
function suchKachel(ex){
  var g = ex.equip[0], mobil = exIsMobility(ex.id) || AUFWAERM_IDS.indexOf(ex.id) > -1;
  var geraet = !mobil && g && g !== "none" && EQUIP_ICON[g] ? '<span class="air-gear" aria-label="'+esc(exEquipText(ex))+'">'+svgIcon(EQUIP_ICON[g])+'</span>' : '';
  return uebKachel({ bild:ex.id, name:tplText(ex.name), attr:'data-info="'+ex.id+'" data-exlang="'+ex.id+'"', q:exSearchText(ex), cat:exFarbe(ex), klasse:"air-kachel",
    innen:exFavBtn(ex.id)+geraet, unter:kachelMuskel(ex)+(gymSatzKachel(ex.id) ? '<span class="st-sub an">'+esc(gymSatzKachel(ex.id))+'</span>' : '') });
}
function renderSearch(){
  var alle = gesamtEintraege();
  suchZonen = kkNorm(suchZonen);   // nach dem Umschalten der Detailansicht passen
  /* Trefferliste nach Kategorie, Filter und Suchwort (ohne Suchwort zeigt eine gewählte Kategorie oder ein Filter alle passenden Einträge) */
  function katalogIst(){ return suchKat === "uebungen" || suchKat === "workouts"; }
  function gewaehltIst(){ return suchKat !== "alle" || suchZonen.length > 0 || suchTrain.length > 0 || suchAusr.length > 0; }
  function filtern(){
    var w = suchNorm(gesamtQuery), zon = suchZonen.length > 0, tr = suchTrain.length > 0, au = suchAusr.length > 0;
    if(!w && !gewaehltIst()) return [];
    return alle.filter(function(e){
      if(zon){   // Muskelgruppen: Übungen mit diesen Hauptmuskeln, Workouts mit mindestens einer solchen Übung
        if(e.ex){ if(!zonePasst(findExercise(e.ex), suchZonen)) return false; }
        else if(e.exs){ if(!e.exs.some(function(id){ var x = findExercise(id); return x && zonePasst(x, suchZonen); })) return false; }
        else return false;
      }
      if(tr || au){   // Trainingsart und Ausrüstung wie im Workout: Übungen über trainPasst/ausrPasst, Workouts über katWoTrainOk (zwei Drittel) und ausrPasst für Studio-Übungen
        if(e.ex){ var x = findExercise(e.ex); if(!x || !trainPasst(x, suchTrain) || !ausrPasst(x, suchAusr)) return false; }
        else if(e.exs){
          var xs = e.exs.map(findExercise).filter(Boolean);
          if(!xs.length || !katWoTrainOk(xs, suchTrain)) return false;
          if(au && !xs.every(function(x){ return exTrainArt(x) !== "studio" || ausrPasst(x, suchAusr); })) return false;
        }
        else return false;
      }
      if(suchLib.length && katalogIst() && (e.ex ? !findExercise(e.ex).cats.some(function(c){ return suchLib.indexOf(c) > -1; }) : (e.exs ? suchLib.indexOf(e.cat) < 0 : true))) return false;
      return (suchKat === "alle" || e.k === suchKat) && (!w || suchPasst(e.text, gesamtQuery));
    });
  }
  app.innerHTML =
    topbar(t("srTitle"), { back:"#home" }) +
    '<div class="lib-chips sr-kats">'+SUCH_KATEGORIEN.map(function(k){
      return '<button type="button" class="lib-chip'+(suchKat === k ? ' active' : '')+'" data-srkat="'+k+'" aria-pressed="'+(suchKat === k)+'">'+esc(t("srKat_"+k))+'</button>';
    }).join("")+'</div>'+
    (katalogIst() ? catChipsHTML(suchLib, "data-srlib") : '')+
    suchFilterKarteHTML(filtern().length)+
    searchHTML(gesamtQuery, "gs", t("srPh")) +
    tippZeileHTML("suche", "tippUebung")+'<div id="gs-res"></div><div style="height:40px"></div>';
  bindCommon();
  var feld = app.querySelector("#gs-q"), res = app.querySelector("#gs-res");
  function zeigen(){
    var w = suchNorm(gesamtQuery), gewaehlt = gewaehltIst();
    if(!w && !gewaehlt){ res.innerHTML = '<div class="seiten-intro">'+esc(t("srHint"))+'</div>'; return; }
    var treffer = filtern();
    if(!treffer.length){ res.innerHTML = '<div class="empty" style="padding:30px 20px;">'+esc(t("noResult"))+'</div>'; return; }
    var html = "", gruppe = null, n = 0, reihe = [];
    treffer.forEach(function(e){ if(reihe.indexOf(e.g) < 0) reihe.push(e.g); e.n = suchPasst(e.titel, gesamtQuery) ? 0 : 1; });
    // je Gruppe zuerst die Treffer im Namen, danach die über Übungen/Hinweise (stabil)
    treffer = treffer.map(function(e, i){ return { e:e, i:i }; }).sort(function(a, b){
      return reihe.indexOf(a.e.g) - reihe.indexOf(b.e.g) || a.e.n - b.e.n || a.i - b.i; }).map(function(o){ return o.e; });
    /* Im Übungs- und Workoutkatalog ohne Suchwort: je Kategorie (Cardio, Gewicht, Bodyweight …) unter einer Zwischenüberschrift, Reihenfolge wie die Kategorie-Chips */
    var unter = katalogIst() && !w && suchLib.length !== 1;
    if(unter){
      var rang = function(e){ var r = LIB_CATS.map(function(c){ return c.id; }).indexOf(e.cat); return r < 0 ? 99 : r; };
      treffer = treffer.map(function(e, i){ return { e:e, i:i }; }).sort(function(a, b){
        return reihe.indexOf(a.e.g) - reihe.indexOf(b.e.g) || rang(a.e) - rang(b.e) || a.i - b.i; }).map(function(o){ return o.e; });
    }
    var kacheln = "", zeilen = "", katAlt = null;   // Air-, Studio- und Dehnübungen erscheinen als quadratische Kacheln wie unter Air › Übungen (zuerst), alles andere als Zeile
    function raster(){ if(kacheln) html += '<div class="fig-grid">'+kacheln+'</div>'; html += zeilen; kacheln = ""; zeilen = ""; }
    treffer.forEach(function(e, i){
      if(e.g !== gruppe){ raster(); gruppe = e.g; n = 0; katAlt = null; html += '<div class="section-title">'+esc(gruppe)+'</div>'; }
      if(unter && e.cat !== katAlt){ raster(); katAlt = e.cat; html += '<div class="sr-unter">'+esc(catName(e.cat))+'</div>'; }
      if(!gewaehlt && ++n > 12) return;   // je Gruppe die ersten zwölf; genauer tippen grenzt ein (mit gewählter Kategorie alle)
      var ex = e.ex && findExercise(e.ex);
      if(ex && !ex.custom && (ILLU[ex.id] || STUDIO_NUR[ex.id])){ kacheln += suchKachel(ex); return; }   // alle Übungen als Kacheln wie beim Bauen eines Workouts (gleiche Farben nach Trainingsart), antippen = Info-Karte
      var weltZeichen = e.welt ? '<span class="sr-welt" style="--w:'+(e.welt === "studio" ? "var(--gym-color)" : "var(--tp-color)")+'" title="'+esc(t(e.welt === "studio" ? "katOrtStudio" : "katOrtFrei"))+'">'+svgIcon(e.welt === "studio" ? KAT_ICON_STUDIO : KAT_ICON_FREI)+'</span>' : '';
      zeilen += '<div class="list-item entry" role="button" tabindex="0" data-sr="'+i+'">'+weltZeichen+'<div class="meta"><div class="name">'+esc(e.titel)+'</div>'+
        (e.sub ? '<div class="sub">'+esc(e.sub)+'</div>' : '')+'</div><span class="chip chev">'+ICON_CHEV+'</span></div>';
    });
    raster();
    res.innerHTML = html;
    // Kacheln wie in Air: antippen = Übungsinfo, ▶ = starten, ☆ = merken, lange drücken = in Workout oder Plan legen
    res.querySelectorAll("[data-info]").forEach(function(el){
      el.addEventListener("click", function(){ exInfoSuche(el.getAttribute("data-info")); });
    });
    res.querySelectorAll("[data-playex]").forEach(function(el){
      el.addEventListener("click", function(ev){ ev.stopPropagation(); go("#playex/"+el.getAttribute("data-playex")); });
    });
    res.querySelectorAll("[data-exfav]").forEach(function(el){
      el.addEventListener("click", function(ev){ ev.stopPropagation(); toggleExFav(el.getAttribute("data-exfav")); zeigen(); });
    });
    res.querySelectorAll("[data-exlang]").forEach(function(el){ langDruck(el, function(){ exZuProgramm(el.getAttribute("data-exlang")); }); });
    res.querySelectorAll("[data-studio]").forEach(function(el){
      function oeffnen(){ var id = el.getAttribute("data-studio"); if(EX_INFO[id]) exInfoSuche(id); else go("#studio/"+id); }
      el.addEventListener("click", oeffnen);
      el.addEventListener("keydown", function(ev){ if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); oeffnen(); } });
      langDruck(el, function(){ exZuProgramm(el.getAttribute("data-studio")); });
    });
    airKachelBinden();
    res.querySelectorAll("[data-sr]").forEach(function(el){
      function los(){ treffer[+el.getAttribute("data-sr")].fn(); }
      el.addEventListener("click", los);
      el.addEventListener("keydown", function(ev){ if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); los(); } });
    });
  }
  feld.addEventListener("input", function(){ gesamtQuery = feld.value; zeigen(); });
  app.querySelectorAll("[data-srkat]").forEach(function(b){
    b.addEventListener("click", function(){
      suchKat = b.getAttribute("data-srkat"); suchLib = [];
      renderSearch();   // die Kategorie-Chips des Katalogs kommen und gehen mit der Auswahl
    });
  });
  // Filterkarte: auf/zu, zurücksetzen, Trainingsart, Ausrüstung, Muskel (Chips und Figur); nach jedem Antippen neu zeichnen wie beim Workout-Filter
  app.querySelectorAll("[data-srtoggle]").forEach(function(b){ b.addEventListener("click", function(){ suchFilterAuf = !suchFilterAuf; renderSearch(); }); });
  var zur = app.querySelector("[data-srreset]");
  if(zur) zur.addEventListener("click", function(){ suchTrain = []; suchAusr = []; suchZonen = []; renderSearch(); });
  app.querySelectorAll("[data-srlib]").forEach(function(b){ b.addEventListener("click", function(){ var c = b.getAttribute("data-srlib"); suchLib = c === "all" ? [] : selToggle(suchLib, c); renderSearch(); }); });
  app.querySelectorAll("[data-srtrain]").forEach(function(b){ b.addEventListener("click", function(){ suchTrain = selToggle(suchTrain, b.getAttribute("data-srtrain")); renderSearch(); }); });
  app.querySelectorAll("[data-srausr]").forEach(function(b){ b.addEventListener("click", function(){ suchAusr = selToggle(suchAusr, b.getAttribute("data-srausr")); renderSearch(); }); });
  app.querySelectorAll("[data-srzone]").forEach(function(b){ b.addEventListener("click", function(){ suchZonen = selToggle(suchZonen, b.getAttribute("data-srzone")); renderSearch(); }); });
  app.querySelectorAll("[data-srgrp]").forEach(function(b){ b.addEventListener("click", function(){ suchZonen = kkGrpToggle(suchZonen, b.getAttribute("data-srgrp")); renderSearch(); }); });
  zeigen();
  if(!gesamtQuery && !suchFilterAuf && !gewaehltIst()) feld.focus();   // Tastatur nur beim ersten Öffnen, nicht nach dem Antippen eines Filters
}
/* Startseite: Kopf, Hinweise, Meine Woche (führt in den Kalender), Kopfblock (heutiges Training › Favoriten › Baukasten), Favoriten, darunter die Bereiche */
function renderHome(){
  var favHTML = favItemsHTML();
  var nFav = favEntries().length;
  app.innerHTML =
    kopfNeuHTML() +
    '<div class="woche-neu">'+wocheHTML()+'</div>'+heroNeuHTML()+installTipHTML()+backupTipHTML() +   // Kopf mit Foto, Woche darüber gelegt, heute geplant (die Bereiche stehen unter „Training“)
    '<div class="sec-head" data-favsek><div class="section-title">'+t("favorites")+(favHTML ? '' : ' <span class="lbl-hint bs-hinweis">'+esc(t("favEmptyKurz"))+'</span>')+'</div>'+
      (nFav > FAV_LIMIT ? '<button type="button" class="sec-link" data-favall>'+(favShowAll ? t("favLess") : t("favAllShort"))+
        '<span class="sec-link-chev'+(favShowAll?' up':'')+'">'+ICON_CHEV+'</span></button>' : '')+
    '</div>'+
    favHTML +
    builderKarteHTML();
  bindCommon();
  bindBuilderKarte();
  bindThemeToggle();
  app.querySelectorAll("[data-bereich]:not([data-bereich=\"faq\"])").forEach(function(el){ langDruck(el, openBereicheSheet); });
  var heroKnopf = app.querySelector("[data-herostart]");
  if(heroKnopf) heroKnopf.addEventListener("click", function(){
    var modus = heroKnopf.getAttribute("data-herostart");
    if(modus === "plan"){
      var h = heroHeutige();
      if(h.length === 1) return kalStarten(h[0]);
      if(h.length > 1) return openActionSheet(t("heroWaehlen"), h.map(function(e){   // mehrere heute eingeplant: Auswahl, welches jetzt startet
        var o = kalDauerOrt(e);
        return { ico:P_PLAY, label:kalAufloesen(e).name+" · "+(o.sek > 0 ? fmtDuration(Math.max(60, Math.round(o.sek/60)*60)) : o.sub), fn:function(){ kalStarten(e); } };
      }));
    }
    if(modus === "fav"){ var fs = app.querySelector("[data-favsek]"); if(fs && fs.scrollIntoView) return fs.scrollIntoView({ block:"start", behavior:"smooth" }); }
    katTabSetzen("baukasten"); go("#katalog");
  });
  bindFavItems(renderHome);
  bindBackupTip();
  var wl = app.querySelector(".woche-link");
  if(wl){   // Meine Woche klappt nicht mehr auf, sondern führt direkt in den Kalender
    var zumKalender = function(){ kalBasis = null; kalAnsicht = "woche"; go("#kalender"); };
    wl.addEventListener("click", zumKalender);
    wl.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); zumKalender(); } });
  }
  var wib = app.querySelector("[data-wasistwas]");
  if(wib) wib.addEventListener("click", openWasIstWas);
}
/* Aussehen „New“: Kopf einer Bereichsseite wie im Entwurf (Timer): Foto, Zurück und Suche oben, darunter Zeile und Titel */
/* opt (optional): { foto, fotoHell } festes Bild statt der Tageszuteilung (Kalender, Katalog); zurueck: Ziel des Zurück-Knopfs oder false (Hauptseite); ohneSuche: eigene Lupe steckt schon in extra */
function bereichKopfNeuHTML(key, titel, kicker, extra, opt){
  opt = opt || {};
  var foto = opt.foto ? (themeIstDunkel() || !opt.fotoHell ? opt.foto : opt.fotoHell) : (bereichFotosNeu()[key] || "img/neu-timer.jpg");   // sonst dasselbe Bild wie die Karte auf Training
  return '<section class="kopf-bereich'+(opt.klar ? ' klar' : '')+'">'+(opt.klar ? '' : '<img class="kb-bild" src="'+foto+'" alt="" draggable="false"'+(fotoFokus(foto) ? ' style="object-position:'+fotoFokus(foto)+'"' : '')+'>')+
    '<div class="kb-zeile">'+(opt.zurueck === false ? '<span></span>' : '<button type="button" class="iconbtn kb-rund" data-back="'+(opt.zurueck || "#training")+'" aria-label="'+esc(t("back"))+'">'+ICON_BACK+'</button>')+
    '<span class="kb-rechts">'+(extra || "")+(opt.ohneSuche ? "" : '<button type="button" class="iconbtn kb-rund" data-nav="#search" aria-label="'+esc(t("search"))+'">'+svgIcon(SYM_SUCHE)+'</button>')+'</span></div>'+
    '<div class="kb-text"><span class="kb-kicker">'+esc(kicker)+'</span><h1>'+esc(titel)+'</h1></div></section>';
}
/* Aussehen „New“: Kopf von Heute wie im Entwurf - Foto mit Logo, Symbolen und Gruß (ohne Namen: die App kennt keinen) */
/* Begrüßung: lockere Varianten je Tageszeit (texte.js, durch | getrennt); pro Tag und Tageszeit stabil, damit sie beim Neuzeichnen nicht wechselt */
function grussWort(h){
  var per = h < 11 ? "Morgen" : h < 17 ? "Tag" : "Abend", liste = t("gru" + per + "Liste").split("|");
  return liste[fotoHash(per + Math.floor(Date.now()/86400000)) % liste.length];
}
function kopfNeuHTML(){
  var h = new Date().getHours(), lang = currentLang() === "en" ? "en-GB" : "de-DE";
  var gruss = grussWort(h), name = state.db.settings.name;
  if(name) gruss += ", " + name;   // Name aus der Einführung bzw. den Körperdaten (freiwillig, nur lokal)
  var datum = new Date().toLocaleDateString(lang, { weekday:"long", day:"numeric", month:"long" });
  return '<section class="kopf-neu"><img class="kn-bild" src="img/neu-kopf.jpg" alt="" draggable="false"><img class="kn-bild kn-hell" src="img/neu-kopf-hell-meer.jpg" alt="" draggable="false"><div class="kn-tint"></div>'+
    '<div class="kn-zeile"><div class="marke-neu"><b>BLOC</b><small>Modular Training Builder</small></div><div class="kn-sym">'+kopfSymboleNeu("home")+'</div></div>'+
    '<div class="kn-gruss"><span>'+esc(datum)+'</span><b>'+esc(gruss)+'</b></div></section>';
}
/* Aussehen „New“: Karte „Heute geplant“ (Plan von heute) bzw. „Bereit für dein Training?“; gleiche Logik wie der Kopfblock, gleiches data-herostart */
function heroNeuHTML(){
  if(fokusAus("katalog")) return "";
  var heute = heroHeutige(), modus = "baukasten", label = t("heroTitel"), titel = t("heroLos"), sub = "";
  if(heute.length){ var info = kalHeroInfo(heute); modus = "plan"; label = t("heroGeplantNeu"); titel = info.titel; sub = info.sub; }
  else return "";   // nichts geplant: kein „Aus deinen Favoriten wählen“, die Seite bleibt hier leer (der Baukasten steht weiter unten)
  return '<section class="geplant-neu"><button type="button" class="gn-main" data-herostart="'+modus+'">'+
    '<span class="gn-play" aria-hidden="true">'+ICON_PLAY+'</span>'+
    '<span class="gn-text"><small>'+esc(label)+'</small><b>'+esc(titel)+'</b>'+(sub ? '<span>'+esc(sub)+'</span>' : '')+'</span>'+
    '<span class="gn-chev" aria-hidden="true">'+ICON_CHEV+'</span></button></section>';
}
/* Aussehen „New“: Workout-Builder auf Heute (Foto, zwei Wege in den Baukasten); ohne Workout (Fokus aus) entfällt er */
function builderKarteHTML(){
  if(fokusAus("katalog")) return "";
  return '<div class="sec-head"><div class="section-title">'+esc(t("builderTitel"))+'</div></div>'+
    '<section class="builder-neu"><div class="bn-text"><span class="bn-kicker">'+esc(t("builderKicker"))+'</span><b>'+esc(t("builderText"))+'</b><small>'+esc(t("builderSub"))+'</small></div>'+
    '<div class="bn-knoepfe"><button type="button" class="btn btn-primary" data-builder="zufall">'+esc(t("builderZufall"))+'</button>'+
    '<button type="button" class="btn btn-secondary" data-builder="selber">'+esc(t("builderSelber"))+'</button></div></section>';
}
function bindBuilderKarte(){
  app.querySelectorAll("[data-builder]").forEach(function(b){
    b.addEventListener("click", function(){
      builderAuto = b.getAttribute("data-builder"); katTabSetzen("baukasten"); go("#katalog");
    });
  });
}
/* Fragen & Antworten am Ende der Seite „Training“ (Inhalt: faq.js, erzeugt aus docs/FAQ-ENTWURF.md). Reine Anzeige, nichts wird gespeichert oder geladen.
   Aufklappbar mit <details>/<summary> (Tastatur und Screenreader ohne eigenes Skript); der Hinweis „keine Beratung“ steht immer sichtbar darüber.
   Die Texte in faq.js sind festes Material mit <b>/<i>/<a>, kein Nutzereingabe-Text - deshalb ohne esc(). Die Quellen heißen hier F1, F2 …, weil quellen.html eigene Nummern hat. */
function faqHTML(){
  var F = window.BLOC_FAQ;
  if(!F) return "";
  var sp = currentLang() === "en" ? "en" : "de", h = '<section class="faq faq-bereich" aria-labelledby="faq-titel"><button type="button" class="sec-head faq-kopf" data-faqtoggle aria-expanded="false"><span class="section-title" id="faq-titel">'+esc(t("faqTitel"))+'</span></button>'+
    '<p class="faq-hinweis" role="note">'+F.hinweis[sp]+'</p><div class="faq-inhalt" hidden>', gruppe = -1;
  F.fragen.forEach(function(f, i){
    var x = f[sp];
    if(f.g !== gruppe){
      if(gruppe >= 0) h += '</div>';
      gruppe = f.g;
      h += '<h3 class="faq-gruppe">'+F.gruppen[sp][gruppe]+'</h3>'+(F.gruppenHinweis && F.gruppenHinweis[gruppe] ? '<p class="dim faq-gruppen-hinweis">'+F.gruppenHinweis[gruppe][sp]+'</p>' : '')+'<div class="faq-liste">';
    }
    /* Felder: t Titel · k Kurzantwort (optional; mit k stehen die Absätze p als Stichpunkte, ohne k als Fließtext) · p Absätze · s „Wie sicher ist das?“ (optional) ·
       b Begriffe [[Begriff, Erklärung], …] (optional) · q Quellen-Nummern */
    h += '<details class="faq-q"><summary><span class="faq-nr" aria-hidden="true">'+(i+1)+'</span><span class="faq-t">'+x.t+'</span></summary>'+
      '<div class="faq-a">'+
      (x.k ? '<p><b>'+esc(t("faqKurz"))+':</b> '+x.k+'</p><ul>'+(x.p || []).map(function(p){ return '<li>'+p+'</li>'; }).join("")+'</ul>'
           : (x.p || []).map(function(p){ return '<p>'+p+'</p>'; }).join(""))+
      (x.s ? '<p><b>'+esc(t("faqStudie"))+':</b> '+x.s+'</p>' : '')+
      (x.b && x.b.length ? '<div class="faq-begriffe"><p><b>'+esc(t("faqBegriffe"))+'</b></p><dl>'+x.b.map(function(b){ return '<dt>'+b[0]+'</dt><dd>'+b[1]+'</dd>'; }).join("")+'</dl></div>' : '')+
      (f.q && f.q.length ? '<p class="faq-quellen"><b>'+esc(t("faqQuellen"))+':</b> '+f.q.map(function(n){ return '[F'+n+']'; }).join(" ")+'</p>' : '')+
      '</div></details>';
  });
  if(gruppe >= 0) h += '</div>';
  h += '<details class="faq-q faq-verz"><summary><span class="faq-t">'+esc(t("faqVerz"))+'</span></summary><div class="faq-a">'+
    '<p class="dim">'+esc(t("faqVerzSub"))+'</p><ol class="faq-refs">'+
    Object.keys(F.quellen).map(function(n){ return '<li value="'+n+'"><span class="faq-refnr">[F'+n+']</span> '+F.quellen[n][sp]+'</li>'; }).join("")+
    '</ol></div></details></div></section>';
  return h;
}
/* Aussehen „New“: Seite „Training“ - alle Bereiche (Workout, Mobility & Stretch, Timer, Run) als Fotokarten, darüber die Suche */
function renderTraining(){
  app.innerHTML =
    topbar(t("tabTraining"), { back:"#home", right:kopfSymboleNeu("training") }) +
    '<button type="button" class="suchfeld-neu" data-nav="#search">'+svgIcon('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>')+'<span>'+esc(t("trainingSuche"))+'</span></button>'+
    '<div class="training-seite">'+bereicheHTML().replace(/<\/div><\/div>$/, areaTile("protein", "#protein", protT("titel"), protT("kachelSub"), "var(--accent)", "zeile")+areaTile("faq", "#faq", t("faqTitel"), t("faqKachelSub", { n:(window.BLOC_FAQ ? window.BLOC_FAQ.fragen.length : 0) }), "var(--accent)", "zeile")+'</div></div>')+'</div>'+
    '<div class="sec-head"><div class="section-title"></div><button type="button" class="sec-link" data-wasistwas>'+esc(t("wiLink"))+'</button></div>';
  var bkT = app.querySelector(".topbar .back"); if(bkT) bkT.classList.add("zeigen");   // Zurück-Knopf auch auf Training (wie in Path und Kalender)
  bindCommon();
  /* Abwechslung: je Bereich ein Bild aus dem Pool, von Tag zu Tag wechselnd, kein Bild doppelt; dieselben Bilder tragen die Köpfe der Bereichsseiten */
  var fotos = bereichFotosNeu();
  app.querySelectorAll(".training-seite .area-tile[data-bereich]").forEach(function(el){
    var k = el.getAttribute("data-bereich");
    if(k === "faq"){ el.style.backgroundImage = "url(img/neu-faq.jpg)"; el.style.backgroundPosition = "50% 55%"; return; }
    if(k === "protein"){ el.style.backgroundImage = "url(img/neu-protein.jpg)"; el.style.backgroundPosition = "50% 27%"; return; }   // Hände mit den Eierschalen
    if(fotos[k]){ el.style.backgroundImage = "url(" + fotos[k] + ")"; var fk = fotoFokus(fotos[k]); if(fk) el.style.backgroundPosition = fk; }
  });
  app.querySelectorAll("[data-bereich]:not([data-bereich=\"faq\"])").forEach(function(el){ langDruck(el, openBereicheSheet); });
  var wib = app.querySelector("[data-wasistwas]");
  if(wib) wib.addEventListener("click", openWasIstWas);
}
/* Fragen & Antworten: eigene Seite (Kachel unter Run auf Training), alles aufgeklappt wie ein kleines Nachschlagewerk */
function renderFaq(){
  app.innerHTML = topbar(t("faqTitel"), { back:"#training", right:kopfSymboleNeu("training") })+faqHTML();
  var bkF = app.querySelector(".topbar .back"); if(bkF) bkF.classList.add("zeigen");   // Zurück-Pfeil oben links auch auf Wissensaustausch (im Tab-Layout sonst ausgeblendet)
  bindCommon();
  var kopf = app.querySelector(".faq-kopf"), inh = app.querySelector(".faq-inhalt");
  if(kopf) kopf.style.display = "none";
  if(inh) inh.removeAttribute("hidden");
}
/* „Was ist was?“: fünf Zeilen Klartext zu den Bereichen (nur Lesen, nichts wird geändert) */
function openWasIstWas(){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet wi-sheet" role="dialog" aria-label="'+esc(t("wiTitel"))+'">'+
    '<h3>'+esc(t("wiTitel"))+'</h3>'+
    HOME_KEYS.map(function(k){
      var d = bereichDaten(k);
      return '<div class="wi-zeile" data-bereich="'+k+'" style="--c:'+d[3]+'"><span class="at-ico">'+svgIcon(HOME_ICON[k])+'</span><div><b>'+esc(d[1])+'</b><small>'+esc(t("wi_"+k))+'</small></div></div>';
    }).join("")+
    '<p class="hw-zeile" style="margin-top:12px"><b>BLOC:</b> '+esc(t("wiBloc"))+'</p>'+
    '<p class="hw-zeile">'+esc(t("wiSort"))+'</p>'+
    '<button class="btn btn-secondary" data-ok style="margin-top:12px">'+esc(t("wiOk"))+'</button>'+
  '</div></div>';
  function zu(){ root.innerHTML = ""; }
  root.querySelector("[data-ok]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
}

/* Plus-Knopf mit Auswahlmenü (Startseite) bzw. als einfacher Knopf (eine Option) */
function fabMenuHTML(opts){
  if(opts.length === 1){
    return '<button class="fab" data-fabopt="'+opts[0].key+'" title="'+esc(opts[0].label)+'" aria-label="'+esc(opts[0].label)+'">'+ICON_PLUS+'</button>';
  }
  return '<div class="fab-backdrop hidden" data-fabclose></div>' +
    '<div class="fab-menu hidden" id="fab-menu">'+opts.map(function(o){
      return '<button type="button" class="fab-opt" data-fabopt="'+o.key+'">'+esc(o.label)+'<span class="ico '+o.cls+'">'+o.ico+'</span></button>';
    }).join("")+'</div>'+
    '<button class="fab" data-fab title="'+t("create")+'" aria-label="'+t("create")+'" aria-expanded="false">'+ICON_PLUS+'</button>';
}
function bindFabMenu(actions){
  var fab = app.querySelector("[data-fab]"), menu = app.querySelector("#fab-menu"), bd = app.querySelector("[data-fabclose]");
  function set(open){
    if(!fab) return;
    fab.classList.toggle("open", open);
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    menu.classList.toggle("hidden", !open);
    bd.classList.toggle("hidden", !open);
  }
  if(fab) fab.addEventListener("click", function(){ set(menu.classList.contains("hidden")); });
  if(bd) bd.addEventListener("click", function(){ set(false); });
  app.querySelectorAll("[data-fabopt]").forEach(function(b){
    b.addEventListener("click", function(){ set(false); var fn = actions[b.getAttribute("data-fabopt")]; if(fn) fn(); });
  });
}

