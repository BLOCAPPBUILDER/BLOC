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
var suchTrain = [], suchAusr = [], suchLib = [], suchSchw = [];   // suchLib: Kategorie-Chips (LIB_CATS) im Übungs- und Workoutkatalog, wie beim Bauen eines BLOCs
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
  var namen = suchTrain.map(function(a){ return t("trArt_"+a); }).concat(suchAusr.map(function(g){ return t("stGer_"+g); }), suchZonen.map(kkName), suchKat === "workouts" ? [] : suchSchw.map(function(a){ return t("schw_"+a); }));
  return filterKarteHTML({ offen:suchFilterAuf, toggle:"data-srtoggle", reset:"data-srreset", n:namen.length,
    summe:namen.length ? namen.join(", ") : t(suchKat === "workouts" ? "afAlleWo" : "afAlleEx"),
    zeigen:t(anzahl === 1 ? "srAnzeigen1" : "srAnzeigenN", { n:anzahl }),
    inhalt:filterSchrittHTML(1, t("trSchritt1"))+trainFotosHTML("data-srtrain", suchTrain)+
      filterSchrittHTML(2, t("stGerKopf"))+
      '<div class="fc-chips af-ausr">'+AUSR_IDS.map(function(g){
        return filterChip("data-srausr", g, suchAusr.indexOf(g) > -1, svgIcon(STUDIO_GERAET_ICON[g] || STUDIO_AUSR_ICON[g]), t("stGer_"+g)); }).join("")+'</div>'+
      filterSchrittHTML(3, t("trSchritt3"))+
      kkMuskelHTML("data-srzone", "data-srgrp", suchZonen, { ohneLabel:true })+
      (suchKat === "workouts" ? '' : filterSchrittHTML(4, t("schwSchritt"))+schwChipsHTML("data-srschw", suchSchw)) });
}
/* Übung in der Suche: Antippen öffnet erst die Info-Karte (beim Stöbern startet nichts von allein), der Start liegt als Knopf in der Karte.
   Zurück aus dem Timer oder der Studio-Seite führt über den Navigations-Stack wieder zur Suche. */
function exInfoSuche(id){
  var ex = findExercise(id), onChange = function(){ if(navTop() === "#search"){ var y = window.scrollY; renderSearch(); window.scrollTo(0, y); } };
  openExInfo(id, false, { onChange:onChange, zu:function(){ exZuProgramm(id); },
    play:function(){ go("#studio/"+id); } });
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
  function gewaehltIst(){ return suchKat !== "alle" || suchZonen.length > 0 || suchTrain.length > 0 || suchAusr.length > 0 || suchSchw.length > 0; }
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
      if(suchSchw.length && e.ex){ var xs2 = findExercise(e.ex); if(!xs2 || !schwPasst(xs2, suchSchw)) return false; }
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
  if(zur) zur.addEventListener("click", function(){ suchTrain = []; suchAusr = []; suchZonen = []; suchSchw = []; renderSearch(); });
  app.querySelectorAll("[data-srlib]").forEach(function(b){ b.addEventListener("click", function(){ var c = b.getAttribute("data-srlib"); suchLib = c === "all" ? [] : selToggle(suchLib, c); renderSearch(); }); });
  app.querySelectorAll("[data-srtrain]").forEach(function(b){ b.addEventListener("click", function(){ suchTrain = selToggle(suchTrain, b.getAttribute("data-srtrain")); renderSearch(); }); });
  app.querySelectorAll("[data-srschw]").forEach(function(b){ b.addEventListener("click", function(){ suchSchw = selToggle(suchSchw, b.getAttribute("data-srschw")); renderSearch(); }); });
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
  var lupe = "", rest = extra || "", lm = rest.match(/<button type="button" class="iconbtn lib-lupe[\s\S]*?<\/button>/);   // Suche der Liste ersetzt die allgemeine Lupe
  if(lm){ lupe = lm[0]; rest = rest.replace(lm[0], ""); }
  var foto = opt.foto ? (themeIstDunkel() || !opt.fotoHell ? opt.foto : opt.fotoHell) : (bereichFotosNeu()[key] || "img/neu-timer.jpg");   // sonst dasselbe Bild wie die Karte auf Training
  return '<section class="kopf-bereich'+(opt.klar ? ' klar' : '')+'">'+(opt.klar ? '' : '<img class="kb-bild" src="'+foto+'" alt="" draggable="false"'+(fotoFokus(foto) ? ' style="object-position:'+fotoFokus(foto)+'"' : '')+'>')+
    '<div class="kb-zeile">'+(opt.zurueck === false ? '<span></span>' : '<button type="button" class="iconbtn kb-rund" data-back="'+(opt.zurueck || "#training")+'" aria-label="'+esc(t("back"))+'">'+ICON_BACK+'</button>')+
    '<span class="kb-rechts">'+(lupe || '<button type="button" class="iconbtn kb-rund" data-nav="#search" aria-label="'+esc(t("search"))+'">'+svgIcon(SYM_SUCHE)+'</button>')+
      '<button type="button" class="iconbtn kb-rund" data-nav="#settings" aria-label="'+esc(t("settings"))+'">'+ICON_SETTINGS+'</button></span></div>'+
    '<div class="kb-text"><span class="kb-kicker">'+esc(kicker)+'</span><h1>'+esc(titel)+'</h1>'+(rest ? '<span class="kb-rechts kb-extra">'+rest+'</span>' : '')+'</div></section>';
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
/* Kleine Schaubilder in einzelnen Antworten (Feld v in faq.js): reines HTML/CSS ohne Bilddatei, jedes mit Beschriftung (nicht nur Farbe) und Beispielhinweis.
   Die Zahlen sind die aus dem Text der jeweiligen Antwort; Beispielwerte sind als Beispiel gekennzeichnet. */
var FAQ_VIS = {
  de: {
    titel:{ zonen:"Pulszonen im Überblick", umsatz:"Woraus dein Tagesverbrauch besteht", rir:"Beispiel: zehn Wiederholungen, zwei in Reserve", doppelt:"Beispiel: doppelte Progression (8 bis 12 Wiederholungen)", eiweiss:"Beispiel: 70 kg Körpergewicht", minimal:"Beispiel: Minimalplan für die Woche" },
    zonenZ:[["Leicht", "57–63 %", "ganze Sätze"], ["Moderat", "64–76 %", "kurze Sätze"], ["Intensiv", "77–95 %", "einzelne Worte"]], zonenFuss:"Zonen in Prozent des Maximalpulses; darunter der Sprechtest. Orientierung, keine feste Grenze.",
    umsatzT:[["Ruheumsatz", "60–70 %"], ["Alltag + Training", "Rest"], ["Verdauung", "≈ 10 %"]], umsatzFuss:"Grobe Anteile bei vielen Menschen; bei dir können sie abweichen.",
    rirGeschafft:"10 geschafft", rirReserve:"2 noch möglich = 2 in Reserve", rirFuss:"0 in Reserve heißt: Es ging keine saubere Wiederholung mehr.",
    dpWoche:"Woche", dpHinweis:"Im Bereich 8 bis 12 hoch, dann Gewicht rauf und wieder bei 8 beginnen. Gewichte sind ein Beispiel.", dpKg:"kg",
    eiwT:[["Empfehlung für Erwachsene (DGE)", "0,8 g/kg", "56 g"], ["Orientierung im Krafttraining", "ca. 1,6 g/kg", "112 g"]], eiwFuss:"Gesamtzufuhr pro Tag, Rechenbeispiel.",
    tage:["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], minEinheit:"Ganzkörper", minChips:["Bein", "Zug", "Druck"], minFuss:"Zwei kurze Einheiten pro Woche, je eine Bein-, Zug- und Druckübung."
  },
  en: {
    titel:{ zonen:"Heart-rate zones at a glance", umsatz:"What your daily energy use is made of", rir:"Example: ten repetitions, two in reserve", doppelt:"Example: double progression (8 to 12 repetitions)", eiweiss:"Example: 70 kg body weight", minimal:"Example: minimal weekly plan" },
    zonenZ:[["Easy", "57–63%", "full sentences"], ["Moderate", "64–76%", "short sentences"], ["Vigorous", "77–95%", "single words"]], zonenFuss:"Zones as a percentage of maximum heart rate; below it the talk test. A guide, not a hard limit.",
    umsatzT:[["Resting", "60–70%"], ["Daily life + exercise", "rest"], ["Digestion", "≈ 10%"]], umsatzFuss:"Rough shares in many people; yours may differ.",
    rirGeschafft:"10 done", rirReserve:"2 still possible = 2 in reserve", rirFuss:"0 in reserve means no clean repetition was left.",
    dpWoche:"Week", dpHinweis:"Work up within 8 to 12, then add weight and start at 8 again. Weights are an example.", dpKg:"kg",
    eiwT:[["Recommendation for adults (DGE)", "0.8 g/kg", "56 g"], ["Guide for strength training", "approx. 1.6 g/kg", "112 g"]], eiwFuss:"Total intake per day, worked example.",
    tage:["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], minEinheit:"Full body", minChips:["Legs", "Pull", "Push"], minFuss:"Two short sessions per week, one leg, one pull and one push exercise each."
  }
};
function faqVisualHTML(key){
  var d = FAQ_VIS[currentLang() === "en" ? "en" : "de"], h = "", i;
  function fuss(s){ return '<p class="fv-fuss">'+esc(s)+'</p>'; }
  if(key === "zonen"){
    h = '<div class="fv-zonen">'+d.zonenZ.map(function(z, n){ return '<div class="fv-z fv-z'+(n + 1)+'"><b>'+esc(z[0])+'</b><span>'+esc(z[1])+'</span><small>'+esc(z[2])+'</small></div>'; }).join("")+'</div>'+fuss(d.zonenFuss);
  } else if(key === "umsatz"){
    var br = [65, 25, 10];
    h = '<div class="fv-stapel" role="img" aria-label="'+esc(d.umsatzT.map(function(x){ return x[0]+" "+x[1]; }).join(", "))+'">'+br.map(function(w, n){ return '<span class="fv-s fv-s'+(n + 1)+'" style="flex:'+w+'"></span>'; }).join("")+'</div>'+
      '<ul class="fv-legende">'+d.umsatzT.map(function(x, n){ return '<li><i class="fv-s'+(n + 1)+'"></i><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></li>'; }).join("")+'</ul>'+fuss(d.umsatzFuss);
  } else if(key === "rir"){
    h = '<div class="fv-rir" role="img" aria-label="'+esc(d.rirGeschafft+", "+d.rirReserve)+'">';
    for(i = 0; i < 12; i++) h += '<i class="'+(i < 10 ? "an" : "frei")+'"></i>';
    h += '</div><div class="fv-rir-t"><span>'+esc(d.rirGeschafft)+'</span><span>'+esc(d.rirReserve)+'</span></div>'+fuss(d.rirFuss);
  } else if(key === "doppelt"){
    var reps = [8, 10, 12, 8], kg = ["40", "40", "40", "42,5"];
    if(currentLang() === "en") kg = ["40", "40", "40", "42.5"];
    h = '<div class="fv-dp" role="img" aria-label="'+esc(d.titel.doppelt)+'">'+reps.map(function(r, n){
      return '<div class="fv-dps'+(n === 3 ? " neu" : "")+'"><span class="fv-bar"><i style="height:'+Math.round(100*r/12)+'%"></i></span><b>3×'+r+'</b><small>'+esc(kg[n]+" "+d.dpKg)+'</small><em>'+esc(d.dpWoche+" "+(n + 1))+'</em></div>'; }).join("")+'</div>'+fuss(d.dpHinweis);
  } else if(key === "eiweiss"){
    h = '<div class="fv-eiw">'+d.eiwT.map(function(x, n){ return '<div class="fv-eiwz"><div class="fv-eiwk"><span>'+esc(x[0])+'</span><b>'+esc(x[2])+'</b></div><span class="fv-eiwb"><i class="fv-s'+(n ? 3 : 1)+'" style="width:'+(n ? 100 : 50)+'%"></i></span><small>'+esc(x[1])+'</small></div>'; }).join("")+'</div>'+fuss(d.eiwFuss);
  } else if(key === "minimal"){
    h = '<div class="fv-woche">'+d.tage.map(function(tg, n){ var an = n === 1 || n === 4; return '<div class="fv-tag'+(an ? " an" : "")+'"><span>'+esc(tg)+'</span>'+(an ? '<b>'+esc(d.minEinheit)+'</b>' : '')+'</div>'; }).join("")+'</div>'+
      '<div class="fv-chips">'+d.minChips.map(function(c){ return '<span>'+esc(c)+'</span>'; }).join("")+'</div>'+fuss(d.minFuss);
  }
  return h ? '<div class="faq-vis"><p class="fv-titel">'+esc(d.titel[key])+'</p>'+h+'</div>' : "";
}
function faqHTML(){
  var F = window.BLOC_FAQ;
  if(!F) return "";
  var sp = currentLang() === "en" ? "en" : "de", h = '<section class="faq faq-bereich" aria-labelledby="faq-titel"><button type="button" class="sec-head faq-kopf" data-faqtoggle aria-expanded="false"><span class="section-title" id="faq-titel">'+esc(t("faqTitel"))+'</span></button>'+
    '<details class="faq-hinweis" role="note"><summary>'+esc(t("faqHinweisKurz"))+'</summary><p>'+F.hinweis[sp]+'</p></details><div class="faq-inhalt" hidden>', gruppe = -1;
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
      (x.k ? '<p><b>'+esc(t("faqKurz"))+':</b> '+x.k+'</p>'+(f.v ? faqVisualHTML(f.v) : "")+'<ul>'+(x.p || []).map(function(p){ return '<li>'+p+'</li>'; }).join("")+'</ul>'
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
/* Aussehen „New“: Seite „Tools“ - die oberste Kachel steht groß (Standard: Workout-Builder), die übrigen versetzt in zwei Spalten, die letzte bei ungerader Zahl über die ganze Breite.
   Reihenfolge in settings.toolsReihe; Kachel lange drücken (0,5 s) und ziehen verschiebt sie. */
/* Farbstärke je Foto auf Tools: aus der Sättigung der kräftigsten Bildanteile (90. Perzentil) gemessen, damit alle Kacheln nach dem Angleichen gleich kräftig wirken (Ziel 0,36) */
var FOTO_SAT = { "img/neu-h-hanteln-orange.jpg":.5, "img/neu-wissen.jpg":1, "img/neu-p-dehnung-silhouette.jpg":1, "img/neu-p-frau-kniebeuge.jpg":.68, "img/neu-h-rack.jpg":.63, "img/neu-faq.jpg":.52, "img/neu-protein.jpg":.82, "img/bereich-run.jpg":.68, "img/neu-p-mobility-sitz.jpg":1, "img/neu-p-mobility-ausfall.jpg":1, "img/neu-h-brust-2.jpg":.78 };
var TOOLS_KEYS = ["katalog", "run", "plan", "warm", "intervall", "protein", "faq"];   // Standardreihenfolge: Protein Tracker und Wissensaustausch ganz unten
function toolsReihe(){
  var r = [];
  selArr(state.db.settings.toolsReihe).forEach(function(k){ if(TOOLS_KEYS.indexOf(k) > -1 && r.indexOf(k) < 0) r.push(k); });
  if(r.length && r.indexOf("plan") < 0){ var ri = r.indexOf("run"); r.splice(ri < 0 ? r.length : ri + 1, 0, "plan"); }   // gespeicherte Reihenfolge ohne Trainingsplan: er steht nach Run
  TOOLS_KEYS.forEach(function(k){ if(r.indexOf(k) < 0) r.push(k); });
  return r;
}
function toolDaten(k){
  if(k === "plan") return ["#koerper", t("tabKoerper"), t("toolsSubPlan")];
  if(k === "protein") return ["#protein", protT("titel"), t("toolsSubProtein")];
  if(k === "faq") return ["#faq", t("faqTitel"), t("faqKachelSub", { n:(window.BLOC_FAQ ? window.BLOC_FAQ.fragen.length : 0) })];
  var d = bereichDaten(k).slice();   // auf den Kacheln stehen kurze Untertitel (die ausführlichen bleiben auf den Seiten selbst)
  if(k === "run" && !run) d[2] = t("toolsSubRun");
  else if(k === "warm") d[2] = t("toolsSubWarm");
  else if(k === "intervall" && !(state.db.workouts.length || state.db.blocks.length)) d[2] = t("toolsSubTimer");
  return d;
}
function toolKachelHTML(k){
  var d = toolDaten(k);
  return '<div class="tk" data-tool="'+k+'" data-nav="'+d[0]+'" role="button" tabindex="0">'+
    '<i class="tk-foto" aria-hidden="true"></i>'+
    '<span class="tk-glas"><span class="tk-ico">'+svgIcon(HOME_ICON[k])+'</span>'+
      '<span class="tk-text"><b>'+esc(d[1])+'</b><small>'+String(d[2]).split(" · ").map(function(x){ return '<em>'+esc(x)+'</em>'; }).join("")+'</small></span></span></div>';
}
/* Größe und Spalte hängen an der Stelle: Stelle 1 = groß, danach abwechselnd links und rechts (rechts etwas nach unten versetzt), die letzte bei ungerader Restzahl über die ganze Breite */
function toolsKlassen(raster){
  var kids = raster.children, n = kids.length;
  Array.prototype.forEach.call(kids, function(el, i){
    el.classList.toggle("tk-gross", i === 0);
    el.classList.toggle("tk-r", i > 0 && (i-1)%2 === 1);
    el.classList.toggle("tk-voll", i > 0 && i === n-1 && (n-1)%2 === 1);
  });
}
var kachelZieht = false;   // solange eine Kachel gezogen wird, darf die Seite nicht mitscrollen
document.addEventListener("touchmove", function(e){ if(kachelZieht && e.cancelable) e.preventDefault(); }, { passive:false });
/* Kacheln durch langes Drücken (0,5 s) verschieben; gilt für Tools und Fortschritt.
   o.tile        Selektor einer Kachel im Raster
   o.id          Attribut mit dem Schlüssel der Kachel
   o.klassen     (raster) setzt nach jeder Umordnung Größe/Spalte neu (optional)
   o.speichern   (ids) merkt die neue Reihenfolge
   o.loeschen    (id) entfernt die Kachel; dann erscheint beim Ziehen eine Ablagefläche zum Entfernen, und Loslassen ohne Bewegen öffnet o.menue (optional)
   o.menue       (el, id) Menü, wenn die Kachel gehalten und ohne Ziehen losgelassen wird (optional) */
function kachelZiehen(raster, o){
  var tm = 0, x0 = 0, y0 = 0, el = null, geist = null, korb = null, korb2 = null, imKorb = false, bewegt = false, sx = 0, sy = 0, lx = 0, ly = 0, ox = 0, oy = 0, raf = 0, reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(err){}
  function warteStop(){ if(tm){ clearTimeout(tm); tm = 0; } }
  function ziel(){
    var best = null;
    Array.prototype.forEach.call(raster.children, function(k){
      if(k === el) return;
      var r = k.getBoundingClientRect();
      if(lx >= r.left && lx <= r.right && ly >= r.top && ly <= r.bottom) best = k;
    });
    return best;
  }
  /* Die gedrückte Kachel bleibt im Dokument stehen (sonst bricht der Finger-Kontakt ab); verschoben werden die anderen um sie herum */
  function umordnen(nach){
    var kids = Array.prototype.slice.call(raster.children), i = kids.indexOf(el), j = kids.indexOf(nach);
    if(i < 0 || j < 0 || i === j) return;
    var vorher = new Map();
    kids.forEach(function(k){ vorher.set(k, k.getBoundingClientRect()); });
    kids.splice(i, 1); kids.splice(j, 0, el);
    var idx = kids.indexOf(el);
    kids.slice(0, idx).forEach(function(k){ raster.insertBefore(k, el); });
    var ref = el.nextSibling;
    kids.slice(idx+1).reverse().forEach(function(k){ raster.insertBefore(k, ref); ref = k; });
    if(o.klassen) o.klassen(raster);
    bewegt = true;
    if(reduce || !el.animate) return;
    Array.prototype.forEach.call(raster.children, function(k){
      if(k === el) return;
      var a = vorher.get(k), r = k.getBoundingClientRect();
      if(!a || Math.abs(a.width - r.width) > 2 || Math.abs(a.height - r.height) > 2) return;
      var dx = a.left - r.left, dy = a.top - r.top;
      if(Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      k.animate([{ transform:"translate("+dx+"px,"+dy+"px)" }, { transform:"none" }], { duration:200, easing:"ease-out" });
    });
  }
  function korbPruefen(){   // zwei Ablageflächen: die Mülltonne oben und die Fläche unten
    var treffer = false;
    [korb, korb2].forEach(function(k){
      if(!k) return;
      var r = k.getBoundingClientRect(), drin = lx >= r.left - 12 && lx <= r.right + 12 && ly >= r.top - 12 && ly <= r.bottom + 12;
      k.classList.toggle("aktiv", drin); if(drin) treffer = true;
    });
    imKorb = treffer;
  }
  function tick(){
    if(!geist) return;
    if(!imKorb){ if(ly < 90) window.scrollBy(0, -10); else if(ly > window.innerHeight - 90) window.scrollBy(0, 10); }
    korbPruefen();
    if(!imKorb){ var z = ziel(); if(z) umordnen(z); }
    raf = requestAnimationFrame(tick);
  }
  function bewegen(e){
    lx = e.clientX; ly = e.clientY;
    if(geist){ geist.style.left = (lx - ox)+"px"; geist.style.top = (ly - oy)+"px"; if(Math.abs(lx - sx) + Math.abs(ly - sy) > 8) bewegt = true; }
    else if(tm && Math.abs(lx - x0) + Math.abs(ly - y0) > 10) warteStop();   // wischt der Finger vorher, scrollt die Seite ganz normal
  }
  function ende(){
    warteStop();
    document.removeEventListener("pointermove", bewegen); document.removeEventListener("pointerup", ende); document.removeEventListener("pointercancel", ende);
    if(!geist) return;
    cancelAnimationFrame(raf);
    var g = geist, k = el, weg = imKorb && o.loeschen, still = !bewegt && o.menue; geist = null; kachelZieht = false;
    langDruckSperre = Date.now() + 500;   // der Klick nach dem Loslassen öffnet nichts
    if(korb){ korb.remove(); korb = null; }
    if(korb2){ korb2.remove(); korb2 = null; }
    if(weg){
      g.style.transition = "transform .16s ease, opacity .16s ease"; g.style.transform = "scale(.5)"; g.style.opacity = "0";
      setTimeout(function(){ if(g.parentNode) g.parentNode.removeChild(g); }, 170);
      o.loeschen(k.getAttribute(o.id));
      return;
    }
    var r = k.getBoundingClientRect();
    g.style.transition = "left .16s ease, top .16s ease, width .16s ease, height .16s ease, transform .16s ease";
    g.style.left = r.left+"px"; g.style.top = r.top+"px"; g.style.width = r.width+"px"; g.style.height = r.height+"px"; g.style.transform = "none";
    setTimeout(function(){ k.classList.remove("tk-platz"); if(g.parentNode) g.parentNode.removeChild(g); }, 170);
    if(still){ o.menue(k, k.getAttribute(o.id)); return; }
    o.speichern(Array.prototype.map.call(raster.children, function(c){ return c.getAttribute(o.id); }));
  }
  function start(k, px, py){
    var r = k.getBoundingClientRect();
    el = k; lx = sx = px; ly = sy = py; ox = px - r.left; oy = py - r.top; bewegt = false; imKorb = false;
    geist = k.cloneNode(true); geist.removeAttribute("data-nav"); geist.classList.add("tk-geist");
    geist.style.left = r.left+"px"; geist.style.top = r.top+"px"; geist.style.width = r.width+"px"; geist.style.height = r.height+"px";
    document.body.appendChild(geist);
    k.classList.add("tk-platz");
    if(o.loeschen){
      korb = document.createElement("div"); korb.className = "kachel-korb"; korb.textContent = t("fkKorb");
      document.body.appendChild(korb);
      korb2 = document.createElement("div"); korb2.className = "kachel-tonne"; korb2.setAttribute("aria-hidden", "true"); korb2.innerHTML = svgIcon(P_TRASH);
      document.body.appendChild(korb2);
    }
    kachelZieht = true; langDruckSperre = Date.now() + 700;
    try { if(navigator.vibrate) navigator.vibrate(15); } catch(err){}
    raf = requestAnimationFrame(tick);
  }
  raster.addEventListener("pointerdown", function(e){
    var k = e.target.closest ? e.target.closest(o.tile) : null;
    if(!k || geist || (e.pointerType === "mouse" && e.button !== 0)) return;
    x0 = lx = e.clientX; y0 = ly = e.clientY; warteStop();
    document.addEventListener("pointermove", bewegen); document.addEventListener("pointerup", ende); document.addEventListener("pointercancel", ende);
    tm = setTimeout(function(){ tm = 0; start(k, lx, ly); }, 500);
  });
  raster.addEventListener("contextmenu", function(e){ e.preventDefault(); });
}
function toolsZiehenBinden(raster){
  kachelZiehen(raster, { tile:".tk", id:"data-tool", klassen:toolsKlassen, speichern:function(ids){ state.db.settings.toolsReihe = ids; save(); } });
}
function renderTraining(){
  var reihe = toolsReihe();
  app.innerHTML =
    topbar(t("tabTraining"), { back:"#home", right:kopfSymboleNeu("training") }) +
    '<div class="training-seite">'+
      '<div class="tools-raster">'+reihe.map(toolKachelHTML).join("")+'</div>'+
    '</div>';
  var bkT = app.querySelector(".topbar .back"); if(bkT) bkT.classList.add("zeigen");   // Zurück-Knopf auch auf Training (wie in Path und Kalender)
  bindCommon();
  /* Abwechslung: je Bereich ein Bild aus dem Pool, von Tag zu Tag wechselnd, kein Bild doppelt; dieselben Bilder tragen die Köpfe der Bereichsseiten */
  var fotos = bereichFotosNeu();
  app.querySelectorAll(".tools-raster .tk").forEach(function(el){
    var k = el.getAttribute("data-tool"), ft = el.querySelector(".tk-foto");
    if(!ft) return;
    var pfad = k === "plan" ? "img/neu-h-hanteln-orange.jpg" : k === "katalog" ? "img/neu-p-frau-kniebeuge.jpg" : k === "faq" ? "img/neu-wissen.jpg" : k === "protein" ? "img/neu-protein.jpg" : fotos[k];
    if(!pfad) return;
    var pos = k === "plan" ? "50% 74%" : k === "katalog" ? (fotoFokus(pfad) || "50% 30%") : k === "faq" ? "50% 50%" : k === "protein" ? "50% 27%" : (fotoFokus(pfad) || "50% 50%");
    ft.style.backgroundImage = "url(" + pfad + ")"; ft.style.backgroundPosition = pos;
    ft.style.setProperty("--sat", FOTO_SAT[pfad] !== undefined ? FOTO_SAT[pfad] : ".74");   // jedes Foto auf dieselbe Farbstärke
  });
  var raster = app.querySelector(".tools-raster");
  toolsKlassen(raster);
  toolsZiehenBinden(raster);
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

