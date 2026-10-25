"use strict";
/* ============ Gesamtsuche ============
   Lupe auf der Startseite (neben dem Zahnrad): durchsucht Übungen, Workouts (Air und eigene),
   Timer-Workouts, Blöcke, die Bereiche und Aktionen wie „Neuer Block“. Das Feld bleibt stehen, nur die Treffer werden neu gezeichnet. */
var gesamtQuery = "";
/* Kategorien der Suche: ordnet die Gruppen der Treffer sechs Kategorien zu (Chips unter dem Suchfeld) */
var suchKat = "alle", suchZonen = [], suchKoerperAuf = false, suchOrt = "";   // Körper-Filter der Suche: gewählte Muskelgruppen, Karte offen; suchOrt: "" (beide) | "frei" | "studio"
var suchArten = [];   // Ausrüstungs-Filter der Suche (wie im Katalog: „was hast du dabei?“): frei | stange | band | koerper; leer = alles
var SUCH_ARTEN = ["frei", "stange", "band", "koerper"];
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
    if(!libIstWarmDehn(lw)){ l[l.length-1].welt = katWoOrt(exs); l[l.length-1].ort = l[l.length-1].welt; }   // Freiluft blau, Fitnessstudio orange (Aufwärmen und Dehnen gehören zu Mobility & Stretch)
    l[l.length-1].exs = exs.map(function(ex){ return ex.id; });   // für den Ausrüstungs-Filter
  });
  (state.db.myWorkouts || []).map(normMy).forEach(function(mw){
    var exs = mw.items.map(function(it){ return findExercise(it.ex); }).filter(Boolean);
    add(t("mineMy"), mw.name, t("exCount", { n:exs.length }), woSearchText("", exs), function(){ go("#mybuild/"+mw.id); });
    if(!mw.ws){ l[l.length-1].welt = katWoOrt(exs); l[l.length-1].ort = l[l.length-1].welt; }
    l[l.length-1].exs = exs.map(function(ex){ return ex.id; });
  });
  // Übungen
  EXERCISES.forEach(function(ex){
    if(libHidden("ex:"+ex.id)) return;
    add(t("libExercises"), tplText(ex.name), ex.cats.map(catName).join(", "), exSearchText(ex), function(){
      if(EX_INFO[ex.id]) openExInfo(ex.id, false, {});
      else go(ex.custom ? "#exedit/"+ex.id : "#playex/"+ex.id);
    });
    l[l.length-1].ex = ex.id;   // für den Körper-Filter der Suche
    l[l.length-1].ort = ex.main === "stretch" ? "" : exIstStudio(ex) ? "studio" : "frei";   // für den Ort-Filter
  });
  // Timer-Workouts und Blöcke
  state.db.workouts.forEach(function(w){ add(t("mineTimer"), w.name || t("untitled"), "", "", function(){ go("#workout/"+w.id); }); });
  state.db.blocks.forEach(function(b){ add(t("mineBlocks"), b.name, blockSpec(b), "", function(){ go("#block/"+b.id); }); });
  return l;
}
function renderSearch(){
  var alle = gesamtEintraege();
  suchZonen = kkNorm(suchZonen);   // nach dem Umschalten der Detailansicht passen
  app.innerHTML =
    topbar(t("srTitle"), { back:"#home" }) +
    bereichBildHTML("suche") +
    searchHTML(gesamtQuery, "gs", t("srPh")) +
    '<div class="lib-chips sr-kats">'+SUCH_KATEGORIEN.map(function(k){
      return '<button type="button" class="lib-chip'+(suchKat === k ? ' active' : '')+'" data-srkat="'+k+'" aria-pressed="'+(suchKat === k)+'">'+esc(t("srKat_"+k))+'</button>';
    }).join("")+'</div>'+
    '<div class="lib-chips sr-orte" role="group" aria-label="'+esc(t("katOrt"))+'">'+[["", t("srOrtAlle")], ["frei", t("katOrtFrei")], ["studio", t("katOrtStudio")]].map(function(o){
      return '<button type="button" class="lib-chip'+(suchOrt === o[0] ? ' active' : '')+'" data-srort="'+o[0]+'" aria-pressed="'+(suchOrt === o[0])+'">'+esc(o[1])+'</button>';
    }).join("")+'</div>'+
    '<div class="lib-chips sr-arten" role="group" aria-label="'+esc(t("equipHave"))+'">'+SUCH_ARTEN.map(function(a){
      var an = suchArten.indexOf(a) > -1;
      return '<button type="button" class="lib-chip'+(an ? ' active' : '')+'" data-srart="'+a+'" aria-pressed="'+an+'">'+esc(t("stArt_"+a))+'</button>';
    }).join("")+'</div>'+
    '<button type="button" class="sr-koerper-knopf" data-srkk aria-expanded="'+suchKoerperAuf+'">'+esc(t("kkFilter"))+(suchZonen.length ? ' · '+suchZonen.map(kkName).join(', ') : '')+'<span class="tpl-chev'+(suchKoerperAuf ? '' : ' zu')+'" aria-hidden="true">&#9662;</span></button>'+
    '<div class="sr-koerper" id="sr-kk"'+(suchKoerperAuf ? '' : ' hidden')+'>'+kkFilterHTML('data-srzone', suchZonen)+'</div>'+
    tippZeileHTML("suche", "tippUebung")+'<div id="gs-res"></div><div style="height:40px"></div>';
  bindCommon();
  var feld = app.querySelector("#gs-q"), res = app.querySelector("#gs-res");
  function zeigen(){
    var w = suchNorm(gesamtQuery), zon = suchZonen.length > 0, art = suchArten.length > 0, gewaehlt = suchKat !== "alle" || zon || art;
    if(!w && !gewaehlt){ res.innerHTML = '<div class="seiten-intro">'+esc(t("srHint"))+'</div>'; return; }
    // Muskelgruppen gewählt: nur Übungen, die diese Gruppen als Hauptmuskeln haben
    var treffer = alle.filter(function(e){
      if(zon && !(e.ex && zonePasst(findExercise(e.ex), suchZonen))) return false;
      if(art){   // Ausrüstung: Übungen genau mit dieser Ausrüstung; Workouts nur, wenn jede Übung damit geht (Körpergewicht braucht nichts)
        if(e.ex){ if(suchArten.indexOf(studioArt(e.ex)) < 0) return false; }
        else if(e.exs){ if(!e.exs.length || !e.exs.every(function(id){ var a = studioArt(id); return a === "koerper" || suchArten.indexOf(a) > -1; })) return false; }
        else return false;
      }
      if(suchOrt && e.ort && e.ort !== suchOrt) return false;   // Ort-Filter: nur Workouts und Übungen dieses Ortes
      return (suchKat === "alle" || e.k === suchKat) && (!w || suchPasst(e.text, gesamtQuery));   // ohne Suchwort zeigt eine Kategorie alle ihre Einträge
    });
    if(!treffer.length){ res.innerHTML = '<div class="empty" style="padding:30px 20px;">'+esc(t("noResult"))+'</div>'; return; }
    var html = "", gruppe = null, n = 0, reihe = [];
    treffer.forEach(function(e){ if(reihe.indexOf(e.g) < 0) reihe.push(e.g); e.n = suchPasst(e.titel, gesamtQuery) ? 0 : 1; });
    // je Gruppe zuerst die Treffer im Namen, danach die über Übungen/Hinweise (stabil)
    treffer = treffer.map(function(e, i){ return { e:e, i:i }; }).sort(function(a, b){
      return reihe.indexOf(a.e.g) - reihe.indexOf(b.e.g) || a.e.n - b.e.n || a.i - b.i; }).map(function(o){ return o.e; });
    var kacheln = "", zeilen = "";   // Air-, Studio- und Dehnübungen erscheinen als quadratische Kacheln wie unter Air › Übungen (zuerst), alles andere als Zeile
    function raster(){ if(kacheln) html += '<div class="fig-grid">'+kacheln+'</div>'; html += zeilen; kacheln = ""; zeilen = ""; }
    treffer.forEach(function(e, i){
      if(e.g !== gruppe){ raster(); gruppe = e.g; n = 0; html += '<div class="section-title">'+esc(gruppe)+'</div>'; }
      if(!gewaehlt && ++n > 12) return;   // je Gruppe die ersten zwölf; genauer tippen grenzt ein (mit gewählter Kategorie alle)
      var ex = e.ex && findExercise(e.ex);
      if(ex && (fuerAir(ex) || ex.main === "stretch") && ILLU[ex.id]){ kacheln += ex.main === "stretch" ? '<div style="display:contents;--bereich:var(--ws-color)">'+libExKachel(ex)+'</div>' : libExKachel(ex); return; }   // Dehnübungen in der Farbe von Mobility & Stretch
      if(ex && STUDIO_NUR[ex.id]){ kacheln += studioKachel(ex.id); return; }   // Studio-Übungen ebenfalls als Kacheln (antippen = Studio-Seite)
      var weltZeichen = e.welt ? '<span class="sr-welt" style="--w:'+(e.welt === "studio" ? "var(--gym-color)" : "var(--tp-color)")+'" title="'+esc(t(e.welt === "studio" ? "katOrtStudio" : "katOrtFrei"))+'">'+svgIcon(e.welt === "studio" ? KAT_ICON_STUDIO : KAT_ICON_FREI)+'</span>' : '';
      zeilen += '<div class="list-item entry" role="button" tabindex="0" data-sr="'+i+'">'+weltZeichen+'<div class="meta"><div class="name">'+esc(e.titel)+'</div>'+
        (e.sub ? '<div class="sub">'+esc(e.sub)+'</div>' : '')+'</div><span class="chip chev">'+ICON_CHEV+'</span></div>';
    });
    raster();
    res.innerHTML = html;
    // Kacheln wie in Air: antippen = Übungsinfo, ▶ = starten, ☆ = merken, lange drücken = in Workout oder Plan legen
    res.querySelectorAll("[data-info]").forEach(function(el){
      el.addEventListener("click", function(){ var id = el.getAttribute("data-info"); openExInfo(id, false, { onChange:zeigen, zu:function(){ exZuProgramm(id); } }); });
    });
    res.querySelectorAll("[data-playex]").forEach(function(el){
      el.addEventListener("click", function(ev){ ev.stopPropagation(); go("#playex/"+el.getAttribute("data-playex")); });
    });
    res.querySelectorAll("[data-exfav]").forEach(function(el){
      el.addEventListener("click", function(ev){ ev.stopPropagation(); toggleExFav(el.getAttribute("data-exfav")); zeigen(); });
    });
    res.querySelectorAll("[data-exlang]").forEach(function(el){ langDruck(el, function(){ exZuProgramm(el.getAttribute("data-exlang")); }); });
    res.querySelectorAll("[data-studio]").forEach(function(el){
      function oeffnen(){ go("#studio/"+el.getAttribute("data-studio")); }
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
      suchKat = b.getAttribute("data-srkat");
      app.querySelectorAll("[data-srkat]").forEach(function(x){ var an = x === b; x.classList.toggle("active", an); x.setAttribute("aria-pressed", String(an)); });
      zeigen();
    });
  });
  app.querySelectorAll("[data-srort]").forEach(function(b){
    b.addEventListener("click", function(){
      suchOrt = b.getAttribute("data-srort");
      app.querySelectorAll("[data-srort]").forEach(function(x){ var an = x === b; x.classList.toggle("active", an); x.setAttribute("aria-pressed", String(an)); });
      zeigen();
    });
  });
  app.querySelectorAll("[data-srart]").forEach(function(b){
    b.addEventListener("click", function(){
      suchArten = selToggle(suchArten, b.getAttribute("data-srart"));
      var an = suchArten.indexOf(b.getAttribute("data-srart")) > -1;
      b.classList.toggle("active", an); b.setAttribute("aria-pressed", String(an));
      zeigen();
    });
  });
  // Körperkarte der Suche: aufklappen, Muskelgruppen antippen (mehrere möglich)
  var kkKnopf = app.querySelector("[data-srkk]");
  kkKnopf.addEventListener("click", function(){ suchKoerperAuf = !suchKoerperAuf; renderSearch(); });
  app.querySelectorAll("[data-srzone]").forEach(function(el){
    el.addEventListener("click", function(){ suchZonen = selToggle(suchZonen, el.getAttribute("data-srzone")); renderSearch(); });
  });
  zeigen();
  if(!gesamtQuery && !suchKoerperAuf) feld.focus();
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
      h += '<h3 class="faq-gruppe">'+F.gruppen[sp][gruppe]+'</h3><div class="faq-liste">';
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

