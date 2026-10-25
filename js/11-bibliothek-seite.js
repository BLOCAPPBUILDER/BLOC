"use strict";
/* ============ Bibliothek-Seite ============ */
function catChipsHTML(active, attr, ohne){
  var sel = selArr(active);
  var cats = [{ id:"all" }].concat(LIB_CATS.filter(function(c){ return !ohne || ohne.indexOf(c.id) < 0; }));
  return '<div class="lib-chips">'+cats.map(function(c){
    var label = c.id==="all" ? t("catAll") : tplText(c);
    var on = c.id==="all" ? !sel.length : sel.indexOf(c.id) > -1;
    return '<button type="button" class="lib-chip'+(on?' active':'')+'" '+attr+'="'+c.id+'" aria-pressed="'+on+'">'+catIcon(c.id)+esc(label)+'</button>';
  }).join("")+'</div>';
}
function showToast(text){
  var old = document.getElementById("toast");
  if(old) old.remove();
  var el = document.createElement("div");
  el.id = "toast"; el.className = "toast"; el.setAttribute("role","status");
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(function(){ el.classList.add("weg"); }, 2600);
  setTimeout(function(){ el.remove(); }, 3000);
}
var ICON_EYE_OFF = '<path d="M3 3l18 18"/><path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c5.5 0 9 5.5 9.5 7-.3.8-1.2 2.4-2.7 3.9M6.6 6.6C4.5 8 3 10.3 2.5 12c.5 1.5 4 7 9.5 7 1.8 0 3.4-.6 4.8-1.4"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>';
var ICON_EYE = '<path d="M2.5 12c.5-1.5 4-7 9.5-7s9 5.5 9.5 7c-.5 1.5-4 7-9.5 7s-9-5.5-9.5-7z"/><circle cx="12" cy="12" r="3"/>';
/* Pfad-Symbole für Menüs (openActionSheet setzt sie in ein eigenes SVG) */
var P_PLUS = '<path d="M12 5v14M5 12h14"/>', P_PLAY = '<path d="M7 4l13 8-13 8z"/>', P_CHECK = '<path d="M5 12.5l4.5 4.5L19 7"/>', P_TRASH = '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>';
var ICON_EDIT = '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>';
var ICON_FILTER = '<path d="M4 6h16M7 12h10M10 18h4"/>';
var ICON_INFO = '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>';
var ICON_COPY = '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>';
var ICON_TIMERBLOCK = '<circle cx="12" cy="14" r="7.5"/><path d="M12 14v-4M9.5 2.5h5M12 2.5v4"/>';
var ICON_DOTS = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';

/* ⋯-Menü: Nebenaktionen einer Karte als Liste mit großen Tipp-Flächen */
function openActionSheet(title, acts){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet act-sheet" role="dialog" aria-label="'+esc(title)+'">'+
    '<h3>'+esc(title)+'</h3>'+
    acts.map(function(a, i){
      return '<button type="button" class="fs-opt act-opt'+(a.danger?' danger':'')+'" data-act="'+i+'"><span class="fs-ico">'+svgIcon(a.ico)+'</span><span>'+esc(a.label)+'</span></button>';
    }).join("")+
    '<button class="btn btn-secondary" data-actclose style="margin-top:8px;">'+t("cancel")+'</button>'+
  '</div></div>';
  function close(){ root.innerHTML = ""; }
  root.querySelectorAll("[data-act]").forEach(function(b){
    b.addEventListener("click", function(){ close(); acts[parseInt(b.getAttribute("data-act"))].fn(); });
  });
  root.querySelector("[data-actclose]").addEventListener("click", close);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) close(); });
}
/* Übung per Langdruck in ein bestehendes Programm legen: in ein eigenes Workout mit Timer oder in einen Plan (Gewicht × Wiederholungen).
   Alle Übungen außer Dehnen gehen in beides; bei Fitnessstudio-Übungen steht der Plan vorn. */
function exZuProgramm(id, ws){   // ws: „warm“ / „dehn“ aus Mobility & Stretch - dann nur eigene Workouts dieses Bereichs
  var ex = findExercise(id);
  if(!ex || (ex.main === "stretch" && !ws)) return;
  var name = tplText(ex.name), s = state.db.settings;
  function fertig(pname, schon){ showToast(t(schon ? "zpAlready" : "zpAdded", { e:name, p:pname })); }
  function inWorkout(mw){
    mw = normMy(mw);
    if(mw.items.some(function(it){ return it.ex === id; })) return fertig(mw.name, true);
    mw.items.push(itemFromEx(id)); mw.updatedAt = Date.now(); save(); fertig(mw.name);
  }
  function inPlan(p){
    var l = stPlanIds(p);
    if(l.indexOf(id) > -1) return fertig(p.name, true);
    l.push(id); p.ids = l; p.updatedAt = Date.now(); save(); fertig(p.name);
  }
  function workoutWahl(){
    var acts = (state.db.myWorkouts || []).filter(function(mw){ return (mw.ws || "") === (ws || ""); })
      .map(function(mw){ return { ico:HOME_ICON.lib, label:mw.name, fn:function(){ inWorkout(mw); } }; });
    acts.push({ ico:P_PLUS, label:t(ws ? "wsNew" : "myNew"), fn:function(){
      var mw = createMyFromDraft({ name:t("myDefaultName"), mode:"individual", reps:6, work:30, rest:10, blockRest:45, items:[itemFromEx(id)], ws:ws });
      fertig(mw.name);
    } });
    openActionSheet(t("zpPickWo"), acts);
  }
  function planWahl(){
    var acts = stPlaene().filter(function(x){ return !x.entwurf; }).sort(function(a, b){ return (b.updatedAt || 0) - (a.updatedAt || 0); })
      .map(function(p){ return { ico:HOME_ICON.timer, label:p.name, fn:function(){ inPlan(p); } }; });
    acts.push({ ico:P_PLUS, label:t("planNew"), fn:function(){
      var p = { id:uid(), name:t("planDefault", { n:stPlaene().filter(function(x){ return !x.entwurf; }).length+1 }), ids:[id], updatedAt:Date.now() };
      stPlaene().push(p); save(); fertig(p.name);
    } });
    openActionSheet(t("zpPickPlan"), acts);
  }
  if(ws) return workoutWahl();   // Mobility & Stretch: direkt die eigenen Workouts dieses Bereichs
  var acts = [];
  // Fitnessstudio-Übungen: erst der Plan (Gewicht × Wiederholungen), dann das Workout mit Timer; sonst umgekehrt
  var wo = { ico:HOME_ICON.lib, label:t("zpAir"), fn:workoutWahl }, pl = { ico:HOME_ICON.timer, label:t("zpStudio"), fn:planWahl };
  if(exIstStudio(ex)) acts.push(pl, wo); else acts.push(wo, pl);
  if(!ex.custom) acts.push({ ico:ICON_EYE_OFF, label:t("hideShort"), fn:function(){ libHide("ex:"+id); showToast(t("hiddenToast")); render(); } });   // Übung ausblenden (unten im Reiter wieder einblendbar)
  openActionSheet(name, acts);
}
function moreBtn(attr, val, label){
  return '<button type="button" class="more-btn" '+attr+'="'+esc(val)+'" title="'+esc(label||t("more"))+'" aria-label="'+esc(label||t("more"))+'">'+ICON_DOTS+'</button>';
}

function hiddenBlockHTML(n, cards){
  if(!n) return "";
  return '<div class="section-title hid-head">'+svgIcon(ICON_EYE_OFF)+t("hiddenSection", { n:n })+'</div>'+
    '<div class="hid-note">'+esc(t("hiddenSectionHint"))+'</div>'+cards;
}
/* Fertige Workouts, die Stangenübungen brauchen, erscheinen bei einem anderen Fokus nur mit passender Ausrüstung */

/* Schlanke Karten: links Start, in der Mitte Name + eine Infozeile (+ Muskeln klein),
   rechts Bild, ☆ und ⋯ (alle Nebenaktionen). Ausgeblendete: nur „Einblenden“. */
function woSearchText(name, exs){
  return [name].concat(exs.map(function(ex){ return ex.name.de+" "+ex.name.en+" "+(EX_SUCH_ALIAS[ex.id] || ""); })).join(" ").toLowerCase();
}
function mainTagsHTML(mains){
  return mains.map(function(m){ var c = mainCat(m); return '<span class="main-dot" title="'+esc(tplText(c))+'">'+svgIcon(c.ico)+'</span>'; }).join("");
}
/* Farbe eines Workouts nach Ort: Fitnessstudio orange, Freiluft blau (auf Seiten eines anderen Bereichs dessen Farbe) */
function woFarbe(exs){ return katWoOrt(exs) === "studio" ? "var(--gym-color)" : "var(--bereich, var(--tp-color))"; }
function libWoCard(lw, exs, hidden, dur, mains){
  // --bereich: gesetzt auf Seiten eines anderen Bereichs (Aufwärmen & Dehnen), sonst Workouts-Grün
  return '<div class="list-item entry tpl-item lib-card'+(hidden?' is-hidden':'')+'" style="--cat:'+woFarbe(exs)+'" data-cover="lib/'+lw.id+'" data-q="'+esc(woSearchText(lw.name.de+" "+lw.name.en, exs))+'">'+
    '<button class="playbtn cat" data-cover="lib/'+lw.id+'" title="'+t("startTemplate")+'" aria-label="'+t("startTemplate")+'">'+ICON_PLAY+'</button>'+
    '<div class="meta"><div class="name">'+esc(tplText(lw.name))+'</div>'+
    '<div class="sub">'+mainTagsHTML(mains)+exAnzText(exs.length)+SEP+fmtDauerKurz(dur)+'</div>'+
    '</div>'+kkMiniHTML(exs)+   // kleine Körperfigur: welche Muskelgruppen das Workout trainiert (wie in Path › Deep Dive)
    '<div class="card-aside"><div class="card-acts">'+
      (hidden ? '<button type="button" class="tpl-adopt" data-unhideone="wo:'+lw.id+'">'+svgIcon(ICON_EYE)+' '+t("unhide")+'</button>'
              : favBtn("lib:"+lw.id)+moreBtn("data-womore", lw.id))+
    '</div></div>'+
    '<span class="pg-figs" data-pgf="lib:'+lw.id+'"></span></div>';   // die Übungen als kleine Figuren in einer eigenen Zeile (wie in der Auswahl bei Path), erst gezeichnet, wenn die Gruppe offen ist
}
/* Quadratische Übungskachel wie im Studio (Air › Übungen, Mobility & Stretch › Übungen): Figur, Name, darunter die Hauptmuskeln in Kurzform.
   Tippen = Übungsinfo (eigene Übung: bearbeiten), ▶ unten links = starten, ☆ = merken, lange drücken = in Workout oder Plan legen;
   unten rechts auf der Figur das Gerät, falls eines gebraucht wird. */
function libExKachel(ex){
  var g = ex.equip[0], mobil = exIsMobility(ex.id) || AUFWAERM_IDS.indexOf(ex.id) > -1;   // Mobility & Stretch: ohne Geräte-Symbol (2026-10-24)
  var geraet = !mobil && g && g !== "none" && EQUIP_ICON[g]
    ? '<span class="air-gear" aria-label="'+esc(exEquipText(ex))+'">'+svgIcon(EQUIP_ICON[g])+'</span>' : '';   // Kurzhantel, Kettlebell, Stange, Dip-Barren; ohne Geräte nichts
  return uebKachel({ bild:ex.id, name:tplText(ex.name), attr:(ex.custom ? 'data-exedit="' : 'data-info="')+ex.id+'" data-exlang="'+ex.id+'"', q:exSearchText(ex),
    cat:'var(--bereich, '+catVar(ex.cats[0])+')', klasse:'air-kachel', ico:ex.custom ? catIcon(ex.cats[0]) : "",
    innen:exFavBtn(ex.id)+geraet+'<button type="button" class="air-start" data-playex="'+ex.id+'" title="'+esc(t("startBlock"))+'" aria-label="'+esc(t("startBlock"))+'">'+ICON_PLAY+'</button>',
    unter:kachelMuskel(ex) });
}
function airKachelBinden(){   // Enter/Leertaste wie ein Tippen
  app.querySelectorAll(".air-kachel").forEach(function(el){
    el.addEventListener("keydown", function(e){ if(e.target === el && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); el.click(); } });
  });
}
function libExCard(ex, hidden, sub){
  var bild = ILLU[ex.id]
    ? '<button type="button" class="illu-btn" data-info="'+ex.id+'" aria-label="'+t("info")+'">'+illuHTML(ex.id, "lib-illu")+'</button>'
    : (ex.custom ? '<button type="button" class="illu-btn" data-exedit="'+ex.id+'" aria-label="'+t("edit")+'"><span class="custom-ico">'+catIcon(ex.cats[0])+'</span></button>' : '');
  var mus = musclesMain(ex);
  return '<div class="list-item entry tpl-item lib-card'+(ex.id==="russian-twists"?' ua':'')+(isExFav(ex.id)?' ex-fav-on':'')+(hidden?' is-hidden':'')+'" style="--cat:var(--bereich, '+catVar(ex.cats[0])+')" data-q="'+esc(exSearchText(ex))+'"'+' data-exlang="'+ex.id+'">'+
    '<button class="playbtn cat" data-playex="'+ex.id+'" title="'+t("startBlock")+'" aria-label="'+t("startBlock")+'">'+ICON_PLAY+'</button>'+
    '<div class="meta"><div class="name">'+esc(tplText(ex.name))+'</div>'+
    '<div class="sub">'+mainTagsHTML([ex.main])+sub+'</div>'+
    (mus ? '<div class="card-mus">'+esc(mus)+'</div>' : '')+
    '</div>'+
    '<div class="card-aside">'+bild+'<div class="card-acts">'+
      (hidden ? '<button type="button" class="tpl-adopt" data-unhideone="ex:'+ex.id+'">'+svgIcon(ICON_EYE)+' '+t("unhide")+'</button>'
              : exFavBtn(ex.id)+(ex.custom ? trashBtn("ex", ex.id, tplText(ex.name)) : '')+moreBtn("data-exmore", ex.id))+
    '</div></div></div>';
}
function exSubText(ex){
  if(ex.cats.indexOf("stretch") > -1) return stretchSubText(ex);
  return (ex.custom ? '<i>'+esc(t("customTag"))+'</i>'+SEP : '')+
    svgIcon(EQUIP_ICON[ex.equip[0]] || "", "ico sub-ico")+esc(exEquipText(ex))+SEP+
    esc(ex.cats.map(catName).join(", "));
}
function stretchSubText(ex){
  return ex.perSide
    ? (ex.setReps > 1 ? t("holdSideN", { n:ex.setReps, s:ex.workSec }) : t("holdSide", { s:ex.workSec }))
    : (ex.reps > 1 ? t("holdN", { n:ex.reps, s:ex.workSec }) : t("hold1", { s:ex.workSec }));
}

/* Kacheln der Hauptkategorien (Mehrfachauswahl, nichts gewählt = alle) */
function mainTilesHTML(sel, counts, attr, ohne){
  sel = selArr(sel);
  var kats = ohne ? MAIN_CATS.filter(function(c){ return ohne.indexOf(c.id) < 0; }) : MAIN_CATS;
  return '<div class="main-tiles"'+(ohne ? ' style="grid-template-columns:repeat('+kats.length+', minmax(0, 1fr))"' : '')+'>'+kats.map(function(c){
    var on = sel.indexOf(c.id) > -1;
    return '<button type="button" class="main-tile'+(on?' on':'')+(sel.length && !on ? ' off':'')+'" '+attr+'="'+c.id+'" aria-pressed="'+on+'">'+
      '<span class="mt-ico">'+svgIcon(c.ico)+'</span><span class="mt-name">'+esc(tplText(c))+'</span>'+
      (counts ? '<span class="mt-n">'+(counts[c.id] || 0)+'</span>' : '')+'</button>';
  }).join("")+'</div>';
}
var ICON_RESET = '<path d="M4 4v5h5"/><path d="M4.6 14a8 8 0 1 0 1.9-7.9L4 9"/>';
/* Gemeinsame Filterkarte (Air, Baukasten, Studio, Mobility & Stretch). Zu: eine Zeile mit Zusammenfassung, was gerade gilt.
   Auf: Gruppen von Chips (Training, Ausrüstung …) und unten „Zurücksetzen“ + „N … anzeigen“ (klappt zu). Auf/Zu merkt sich der Bereich selbst.
   o: { offen, toggle:"data-xtoggle", reset:"data-xfreset", n:Anzahl aktiver Filter, summe:Text der Kopfzeile, inhalt:HTML, zeigen:Text des Knopfes } */
function filterKarteHTML(o){
  var body = '';
  if(o.offen){
    body = '<div class="af-body">'+o.inhalt+
      '<div class="btn-row af-fuss">'+
        '<button type="button" class="btn btn-secondary af-reset" '+o.reset+(o.n ? '' : ' disabled')+'>'+svgIcon(ICON_RESET)+t("filterReset")+'</button>'+
        '<button type="button" class="btn btn-primary" '+o.toggle+'>'+esc(o.zeigen)+'</button>'+
      '</div></div>';
  }
  return '<div class="card air-filter'+(o.offen ? ' offen' : '')+'">'+
    '<div class="af-reihe">'+
    '<button type="button" class="af-kopf" '+o.toggle+' aria-expanded="'+!!o.offen+'">'+svgIcon(ICON_FILTER)+
      '<span class="af-titel"><b>'+t("filter")+'</b><small>'+esc(o.summe)+'</small></span>'+
      (o.n ? '<span class="af-n">'+o.n+'</span>' : '')+
      '<span class="tpl-chev'+(o.offen ? '' : ' zu')+'" aria-hidden="true">&#9662;</span></button>'+
    (o.extra || '')+
    '</div>'+
    body+
  '</div>';
}
function filterChipsHTML(lbl, hint, chips){
  return '<div class="af-lbl">'+esc(lbl)+(hint ? ' <span>'+esc(hint)+'</span>' : '')+'</div><div class="fc-chips">'+chips+'</div>';
}
function filterChip(attr, wert, an, ico, text){
  return '<button type="button" class="fc-chip'+(an ? ' on' : '')+'" '+attr+'="'+wert+'" aria-pressed="'+!!an+'">'+(ico || '')+esc(text)+'</button>';
}
/* Text des unteren Knopfes: „12 Workouts anzeigen“. art: Wo (Workouts) · Ex (Übungen) · Ei (Einheiten) · Pr (Programme) */
function filterZeigenText(n, art){ return n ? t("af"+art+(n === 1 ? "1" : "N"), { n:n }) : t("afNull"); }
/* Filter des Baukastens: Training, Ausrüstung (auch „Fitnessstudio“), Sortierung */
function airFilterHTML(pre, offen, cat, equip, sort, sortOpts, n, uebung, zonen){
  cat = selArr(cat); equip = selArr(equip); var mitZonen = zonen !== undefined; zonen = selArr(zonen);
  var namen = cat.map(catName).concat(equip.map(equipName), zonen.map(kkName));
  return filterKarteHTML({ offen:offen, toggle:'data-'+pre+'toggle', reset:'data-'+pre+'freset', n:namen.length,
    summe:namen.length ? namen.join(", ") : t(uebung ? "afAlleEx" : "afAlleWo"),
    zeigen:filterZeigenText(n, uebung ? "Ex" : "Wo"),
    inhalt:(mitZonen ? kkMuskelHTML('data-'+pre+'fzone', 'data-'+pre+'fgrp', zonen, { glow:cat.indexOf("cardio") > -1,
          extra:filterChip('data-'+pre+'fcat', "cardio", cat.indexOf("cardio") > -1, catIcon("cardio"), t("katCardio")) }) :
        filterChipsHTML(t("afTraining"), "", LIB_CATS.filter(function(c){ return c.id !== "stretch"; }).map(function(c){
        return filterChip('data-'+pre+'fcat', c.id, cat.indexOf(c.id) > -1, catIcon(c.id), tplText(c)); }).join("")))+
      filterChipsHTML(t("equipHave"), "", EQUIPS.filter(function(e){ return e.id !== "gym"; }).map(function(e){
        return filterChip('data-'+pre+'fequip', e.id, equip.indexOf(e.id) > -1, svgIcon(EQUIP_ICON[e.id]), tplText(e)); }).join(""))+
      '',
    /* Sortierung: kein Block mehr in der Karte, nur ein Schalter „A–Z“ neben der Kopfzeile (aus = die Standardreihenfolge der Liste: Standard bzw. Dauer) */
    extra:'<button type="button" class="af-az'+(sort === "az" ? ' on' : '')+'" data-'+pre+'fsort="'+(sort === "az" ? sortOpts[0][0] : "az")+'" aria-pressed="'+(sort === "az")+
      '" title="'+esc(t("afSortAz"))+'" aria-label="'+esc(t("afSortAz"))+'">A&ndash;Z</button>' });
}
/* Fokus eines Workouts: passt, wenn der Workout-Fokus gewählt ist oder mindestens ein Drittel der Übungen passt */
/* Workouts automatisch nach Dauer (kürzeste zuerst) oder alphabetisch */
function libWoSort(list, sort){
  return list.sort(sort === "az"
    ? function(a, b){ return a.name.localeCompare(b.name, currentLang()); }
    : function(a, b){ return (a.dur - b.dur) || a.name.localeCompare(b.name, currentLang()); });
}

/* Workout › Meine: eigene Workouts mit Timer und Pläne. Der Katalog (fertige Workouts) steht in renderKatalogWorkouts, die Übungen in
   renderKatalogUebungen (js/11b-katalog.js). */
function renderLibrary(){
  var s = state.db.settings;
  if(katTab() !== "blocs") return renderKatalog();
  ["zeit", "saetze"].forEach(function(k){ if(katOffen["sek-"+k] === undefined) katOffen["sek-"+k] = true; });   // BLOCs: Nach Zeit und Nach Sätzen stehen offen, nur das Tagebuch ist zu
  var hw = hinweise("", []);
  var eigene = "";
  (state.db.myWorkouts || []).map(normMy).forEach(function(mw){
    if(mw.ws) return;   // Aufwärm- und Dehn-Workouts liegen unter Mobility & Stretch › Meine
    var exs = mw.items.map(function(it){ return findExercise(it.ex); }).filter(Boolean);
    eigene += myWoCard(mw, exs, woMains(exs), workoutDuration(myRun(mw)));
  });
  // Mit dem Stern markierte fertige Workouts aus dem Katalog stehen hier mit dabei
  var nFav = 0;
  (s.favs || []).forEach(function(k){
    if(k.indexOf("lib:") !== 0) return;
    var lw = findLibWorkout(k.slice(4));
    if(!lw || libIstWarmDehn(lw) || libHidden("wo:"+lw.id)) return;
    var fe = lw.exercises.map(findExercise).filter(Boolean);
    eigene += libWoCard(lw, fe, false, workoutDuration(libWorkoutRun(lw)), woMains(fe)); nFav++;
  });
  var nZeit = (state.db.myWorkouts || []).filter(function(mw){ return !mw.ws; }).length + nFav;
  var list = katSektionHTML("zeit", "zeit", HOME_ICON.intervall, t("katSekZeit"), t("katSekZeitSub"), nZeit, eigene || '<div class="fav-empty">'+esc(t("myEmpty"))+'</div>')+
    katPlaeneHTML();
  app.innerHTML =
    katKopfHTML("blocs", hw.knopf) +
    list + '<div style="height:40px"></div>';
  bindCommon();
  katKopfBinden();
  function neu(){ var y = window.scrollY; renderKatalog(); window.scrollTo(0, y); }
  bindTrash(neu);
  katPlaeneBinden();
  blocMenueBinden(neu);
  katSektionBinden();
  app.querySelectorAll("[data-fav]").forEach(function(el){ el.addEventListener("click", function(e){ e.stopPropagation(); toggleFav(el.getAttribute("data-fav")); neu(); }); });
  app.querySelectorAll("[data-womore]").forEach(function(b){ b.addEventListener("click", function(e){
    e.stopPropagation(); var lw = findLibWorkout(b.getAttribute("data-womore")); if(lw) woMenue(lw, neu);
  }); });
  app.querySelectorAll("[data-cover]").forEach(function(el){ el.addEventListener("click", function(e){
    e.stopPropagation(); if(el.disabled) return; coverDraft = null; go("#cover/"+el.getAttribute("data-cover"));
  }); });
}
