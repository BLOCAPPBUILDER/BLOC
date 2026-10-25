"use strict";
/* ============ Bibliothek ============ */
var EXERCISES = EXERCISE_ROWS.map(function(x){
  return { id:x[0], name:{ de:x[1], en:x[2] }, cats:x[3].split(" "), perSide:!!x[6],
           reps: x[6] ? x[4]*2 : x[4], setReps:x[4], workSec:x[5], restSec: x[9]!=null ? x[9] : 10, hint:{ de:x[7], en:x[8] } };
});
var LIB_WORKOUTS = LIB_WORKOUT_ROWS.map(function(x){
  var tm = x[6] ? x[6].split("/").map(Number) : null;   // einheitliche Zeiten, z. B. 3×40 s / 20 s
  return { id:x[0], name:{ de:x[1], en:x[2] }, focus:x[3], exercises:x[4].split(" "), restAfterSec:x[5],
           tm: tm ? { reps:tm[0], work:tm[1], rest:tm[2] } : null };
});

function tplText(obj){ return obj ? (obj[currentLang()] || obj.de || "") : ""; }
function findExercise(id){
  if(EX_ALIAS[id]) id = EX_ALIAS[id];
  for(var i=0;i<EXERCISES.length;i++) if(EXERCISES[i].id===id) return EXERCISES[i];
  return null;
}
function findLibWorkout(id){
  for(var i=0;i<LIB_WORKOUTS.length;i++) if(LIB_WORKOUTS[i].id===id) return LIB_WORKOUTS[i];
  return null;
}
function catName(id){
  for(var i=0;i<LIB_CATS.length;i++) if(LIB_CATS[i].id===id) return tplText(LIB_CATS[i]);
  return t("catMix");
}
/* Übung als Block in der Form, die Player und Dauerberechnung kennen */
function exBlock(ex){
  return { id:"ex-"+ex.id, ex:ex.id, name:tplText(ex.name), reps:ex.reps, workSec:ex.workSec,
           restSec:ex.restSec, sides:ex.perSide, hint:tplText(ex.hint) };
}
var libBlockCache = {};
function libQuickWorkout(blocks, rest, name, id){
  blocks.forEach(function(b){ libBlockCache[b.id] = b; });
  return { id:id, name:name, items: blocks.map(function(b, i){
    // b.after: eigene Pause nach dieser Übung (z. B. 10 s zwischen Dehnübungen), sonst die gemeinsame
    var nb = blocks[i+1];   // beginnt mit der nächsten Übung ein neuer BLOC (Workout-Planer), steht in der Pause die Frage danach
    return { blockId:b.id, restAfterSec: i < blocks.length-1 ? (b.after != null ? b.after : rest) : 0, nextBloc: nb && nb.bloc ? nb.bloc : "" };
  }) };
}
function libWorkoutRun(lw){
  var bl = lw.exercises.map(findExercise).filter(Boolean).map(function(ex){
    var b = exBlock(ex);
    // eigene Zeiten des Programms (z. B. High Pulse 40/20) - Dehnübungen behalten ihre Haltezeiten
    if(lw.tm && ex.cats.indexOf("stretch") < 0){ b.reps = lw.tm.reps; b.workSec = lw.tm.work; b.restSec = lw.tm.rest; }
    return b;
  });
  return libQuickWorkout(bl, lw.restAfterSec, tplText(lw.name), "lib-"+lw.id);
}
function exerciseRun(ex){ return libQuickWorkout([exBlock(ex)], 0, tplText(ex.name), "libex-"+ex.id); }

/* Blockangabe, z. B. „6×30s/10s“ oder „3×30s je Seite/10s“ */
function blockSpec(b){
  if(b.sides) return Math.ceil(b.reps/2)+'&times;'+b.workSec+'s '+t("perSide")+'/'+b.restSec+'s';
  return b.reps+'&times;'+b.workSec+'s/'+b.restSec+'s';
}

/* Ausblenden: Schlüssel "ex:<id>" bzw. "wo:<id>" */
function libHidden(key){ return (state.db.settings.hiddenLib||[]).indexOf(key) > -1; }
function libHide(key){
  var h = (state.db.settings.hiddenLib||[]).slice();
  if(h.indexOf(key) < 0) h.push(key);
  state.db.settings.hiddenLib = h; save();
}

/* Übung als eigenen Block übernehmen - gibt es schon einen Block aus derselben Übung, wird der genommen */
/* zwischen: Blöcke eines noch nicht gespeicherten Timer-Workouts - landen erst mit „Speichern“ unter Meine */
function adoptExercise(ex, zwischen){
  var alle = state.db.blocks.concat(zwischen || []);
  for(var i=0;i<alle.length;i++){
    var b = alle[i];
    if(b.ex===ex.id && b.reps===ex.reps && b.workSec===ex.workSec && b.restSec===ex.restSec) return b;
  }
  var nb = { id:uid(), ex:ex.id, name:tplText(ex.name), reps:ex.reps, workSec:ex.workSec, restSec:ex.restSec,
             sides:ex.perSide, hint:tplText(ex.hint), updatedAt:Date.now() };
  if(zwischen){ zwischen.push(nb); return nb; }
  state.db.blocks.push(nb);
  save();
  return nb;
}
EXERCISES.forEach(function(ex){ ex.level = EX_LEVEL[ex.id] || 2; ex.equip = (EX_EQUIP[ex.id] || "none").split(" "); });
/* Bodyweight = alles ohne GerÃ¤t: jede Ãbung ohne AusrÃ¼stung (auch Burpees, Jumping Jacks â¦) zÃ¤hlt dazu, nur DehnÃ¼bungen nicht */
function bwDazu(ex){ if(ex.equip.every(function(e){ return e === "none"; }) && ex.cats.indexOf("stretch") < 0 && ex.cats.indexOf("bw") < 0) ex.cats.push("bw"); }
EXERCISES.forEach(bwDazu);

var EX_MAIN = {};
Object.keys(EX_MAIN_ROWS).forEach(function(k){ EX_MAIN_ROWS[k].split(" ").forEach(function(id){ EX_MAIN[id] = k; }); });
/* Eigene Übungen bekommen ihre Hauptkategorie aus Fokus und Ausrüstung */
function deriveMain(ex){
  if(ex.cats.indexOf("stretch") > -1) return "stretch";
  if(ex.equip.every(function(e){ return e==="bar" || e==="dip"; }) || ex.cats.indexOf("calis") > -1) return "stange";
  if(ex.cats.indexOf("cardio") > -1) return "ausdauer";
  if(ex.cats.length === 1 && ex.cats[0] === "core") return "rumpf";
  return "kraft";
}
EXERCISES.forEach(function(ex){ ex.main = EX_MAIN[ex.id] || "kraft"; });
function mainCat(id){ for(var i=0;i<MAIN_CATS.length;i++) if(MAIN_CATS[i].id===id) return MAIN_CATS[i]; return MAIN_CATS[0]; }
function mainMatch(sel, main){ sel = selArr(sel); return !sel.length || sel.indexOf(main) > -1; }
/* Dehn- und Mobility-Übungen stehen in gemischten Workouts immer am Ende (Reihenfolge sonst unverändert) */
/* fuerWorkout: ohne Fitnessstudio-Übungen (für die Air-Gruppen) und ohne Dehnen; Workouts mit Timer und Pläne nehmen alles außer Dehnen (fuerBau) */
var STUDIO_NUR = {};
STUDIO_GRUPPEN.forEach(function(g){ g.ids.split(" ").forEach(function(id){ STUDIO_NUR[id] = true; }); });
function fuerWorkout(ex){ return !STUDIO_NUR[ex.id] && ex.main !== "stretch"; }
/* Freiluft-Übungen (ohne Ausrüstung „Fitnessstudio“) */
function fuerAir(ex){ return fuerWorkout(ex) && ex.equip.indexOf("gym") < 0; }
/* Fitnessstudio-Übungen (Geräte, Kabel, Langhantel, alles mit Ausrüstung „Fitnessstudio“): hier stehen Gewicht × Wiederholungen vorn, ein Timer ist optional */
function exIstStudio(ex){ return !!ex && (!!STUDIO_NUR[ex.id] || (ex.equip || []).indexOf("gym") > -1 || (ex.equip || []).indexOf("db") > -1); }   // Kurzhantel-Training gehört zum Fitnessstudio (Gym)
/* Was in Workouts mit Timer, Plänen und Überrasch mich vorkommen darf: alle Übungen außer Dehnen (die haben ihren eigenen Bereich) */
function fuerBau(ex){ return ex.main !== "stretch"; }
/* Farbe der Kachel: Fitnessstudio hellgrün, sonst Air blau (bzw. die Farbe des Bereichs, z. B. Mobility & Stretch) */
function exFarbe(ex){ return exIstStudio(ex) ? "var(--gym-color)" : 'var(--bereich, '+catVar(ex.cats[0])+')'; }
function exIsMobility(id){ var ex = id && findExercise(id); return !!(ex && ex.main === "stretch"); }
function stretchLast(items, idOf){
  var a = [], b = [];
  items.forEach(function(it){ (exIsMobility(idOf(it)) ? b : a).push(it); });
  return a.concat(b);
}
/* Hauptkategorien eines Workouts (für die Kacheln - ein Workout kann in mehreren stehen):
   jede Kategorie, die mindestens ein Viertel der Übungen stellt, sonst die häufigste */
function woMains(exs){
  var n = {}, out = [];
  exs.forEach(function(ex){ n[ex.main] = (n[ex.main]||0) + 1; });
  MAIN_CATS.forEach(function(c){ if(n[c.id] && n[c.id] >= exs.length/4) out.push(c.id); });
  if(!out.length && exs.length){
    var best = null;
    MAIN_CATS.forEach(function(c){ if(n[c.id] && (!best || n[c.id] > n[best])) best = c.id; });
    out.push(best);
  }
  return out;
}

/* Eigene Übungen (state.db.customEx) laufen überall mit, wo Bibliotheksübungen vorkommen:
   Sie werden als ganz normale Einträge an EXERCISES angehängt (custom:true).
   Gespeichert: { id, name, cats[], equip[], perSide, reps (pro Seite), work, rest, hint } */
function customToEx(c){
  var cats = c.cats && c.cats.length ? c.cats.slice() : ["bw"];
  var equip = c.equip && c.equip.length ? c.equip.slice() : ["none"];
  var ex = { id:c.id, custom:true, name:{ de:c.name, en:c.name }, cats:cats, perSide:!!c.perSide,
           setReps:c.reps, reps: c.perSide ? c.reps*2 : c.reps, workSec:c.work, restSec:c.rest,
           hint:{ de:c.hint||"", en:c.hint||"" }, level:2, equip:equip };
  ex.main = deriveMain(ex);
  return ex;
}
function syncCustomEx(){
  for(var i=EXERCISES.length-1;i>=0;i--) if(EXERCISES[i].custom) EXERCISES.splice(i, 1);
  (state.db.customEx || []).forEach(function(c){ if(c && c.id && c.name) EXERCISES.push(customToEx(c)); });
}
function findCustom(id){
  var l = state.db.customEx || [];
  for(var i=0;i<l.length;i++) if(l[i].id===id) return l[i];
  return null;
}
syncCustomEx();
function equipName(id){ for(var i=0;i<EQUIPS.length;i++) if(EQUIPS[i].id===id) return tplText(EQUIPS[i]); return id; }
function exEquipText(ex){ return ex.equip.map(equipName).join(" / "); }
/* Geräte-Chips unter der Figur im Info-Fenster: Symbol (EQUIP_ICON) + Name der Ausrüstung; nicht im Timer (live), dort bleibt die Figur frei */
/* Griff / Aufsatz (Kabelzug, Stange): nur bei Übungen, für die es eine Angabe gibt */
function griffHTML(id){ var g = EX_GRIFF[id]; return g ? '<div class="info-griff"><b>'+esc(t("griff"))+':</b> '+esc(g[currentLang() === "en" ? 1 : 0])+'</div>' : ""; }
function gearChipsHTML(ex, live){
  if(live || !ex || !ex.equip || !ex.equip.length) return "";
  return '<div class="info-gear">'+ex.equip.map(function(g){ return '<span class="gchip">'+svgIcon(EQUIP_ICON[g] || "", "ico")+esc(equipName(g))+'</span>'; }).join("")+'</div>';
}
/* passt eine Übung zu Ausrüstung und Level? "all" = egal */
/* Mehrfachauswahl: leere Liste = alles */
function selArr(v){ return Array.isArray(v) ? v.slice() : (v && v!=="all" ? [v] : []); }
function selToggle(arr, id){ var a = selArr(arr), i = a.indexOf(id); if(i > -1) a.splice(i, 1); else a.push(id); return a; }
function catMatch(sel, cats){ sel = selArr(sel); return !sel.length || cats.some(function(c){ return sel.indexOf(c) > -1; }); }
/* Übungen, die nur an Stange oder Barren gehen, tauchen bei einem anderen Fokus (z. B. Rücken,
   Bauch) nur auf, wenn man Stange/Barren bei der Ausrüstung ausgewählt hat - oder Calisthenics
   im Fokus ist. Sonst rutschen bei „Rücken“ lauter Klimmzug-Varianten in die Liste. */
function needsBar(ex){ return ex.equip.every(function(e){ return e==="bar" || e==="dip"; }); }
function gearOk(ex, cat, equip, mains){
  cat = selArr(cat); equip = selArr(equip);
  if(!needsBar(ex) || !cat.length || cat.indexOf("calis") > -1 || selArr(mains).indexOf("stange") > -1) return true;
  return ex.equip.some(function(e){ return equip.indexOf(e) > -1; });
}
function equipMatch(sel, ex){ sel = selArr(sel); return !sel.length || ex.equip.some(function(e){ return sel.indexOf(e) > -1; }); }
/* Workout geht mit der gewählten Ausrüstung, wenn jede Übung mit einem der gewählten Dinge machbar ist */
function woEquipText(exs){
  var need = [];
  exs.forEach(function(ex){
    if(ex.equip.indexOf("none") > -1) return;
    var txt = exEquipText(ex);
    if(need.indexOf(txt) < 0) need.push(txt);
  });
  return need.length ? need.join(" \u00b7 ") : equipName("none");
}

/* Entwurf (Draft): ein Workout aus Übungen, das man anpassen kann.
   mode "uniform" = alle Übungen mit denselben Zeiten (reps/work/rest),
   mode "individual" = jede Übung mit eigenen Zeiten (Start: Empfehlung aus der Bibliothek). */
function itemFromEx(id){
  var ex = findExercise(id);
  return { ex:id, reps:ex.reps, work:ex.workSec, rest:ex.restSec };
}
/* „Für alle gleich“ gilt nicht für Dehnübungen - die behalten ihre Haltezeiten */
function itemTiming(d, it){
  return d.mode==="uniform" && !exIsStretch(it.ex) ? { reps:d.reps, work:d.work, rest:d.rest } : { reps:it.reps, work:it.work, rest:it.rest };
}
function timingText(tm, sides){
  if(sides) return Math.ceil(tm.reps/2)+'&times;'+tm.work+'s '+t("perSide")+'/'+tm.rest+'s';
  return tm.reps+'&times;'+tm.work+'s/'+tm.rest+'s';
}
function draftBlocks(d){
  var items = stretchLast(d.items.filter(function(it){ return findExercise(it.ex); }), function(it){ return it.ex; });
  return items.map(function(it, i){
    var ex = findExercise(it.ex), tm = itemTiming(d, it), next = items[i+1];
    // zwischen zwei Dehnübungen reichen 10 s zum Umsetzen
    var after = it.after != null ? it.after : (next && exIsStretch(it.ex) && exIsStretch(next.ex) ? Math.min(10, d.blockRest||0) : null);
    return { id:"dr-"+i+"-"+ex.id, ex:ex.id, name:tplText(ex.name), reps:tm.reps, workSec:tm.work, restSec:tm.rest,
             sides:ex.perSide, hint:tplText(ex.hint), after:after, bloc:it.bloc || "" };
  });
}
function draftRun(d){ return libQuickWorkout(draftBlocks(d), d.blockRest||0, d.name, "draft"); }
function draftCopy(d){ return JSON.parse(JSON.stringify(d)); }
function draftFromLib(lw){
  if(lw.tm) return { key:"lib:"+lw.id, src:"lib", name:tplText(lw.name), mode:"uniform", reps:lw.tm.reps, work:lw.tm.work, rest:lw.tm.rest,
           blockRest:lw.restAfterSec, items:lw.exercises.filter(findExercise).map(itemFromEx) };
  return { key:"lib:"+lw.id, src:"lib", name:tplText(lw.name), mode:"individual", reps:6, work:30, rest:10,
           blockRest:lw.restAfterSec, items:lw.exercises.filter(findExercise).map(itemFromEx) };
}
/* eigene Workouts aus früheren Fassungen (nur Übungs-IDs + "rest") auf das neue Format bringen */
function normMy(mw){
  if(mw.mode) return mw;
  mw.blockRest = mw.rest != null ? mw.rest : 45;
  mw.mode = "individual"; mw.reps = 6; mw.work = 30; mw.rest = 10;
  mw.items = (mw.items||[]).filter(function(x){ return typeof x==="string" ? findExercise(x) : x && findExercise(x.ex); })
    .map(function(x){ return typeof x==="string" ? itemFromEx(x) : x; });
  return mw;
}
function draftFromMy(mw){
  var d = draftCopy(normMy(mw));
  d.key = "my:"+mw.id; d.src = "my";
  return d;
}
function findMy(id){
  var l = state.db.myWorkouts || [];
  for(var i=0;i<l.length;i++) if(l[i].id===id) return normMy(l[i]);
  return null;
}
/* mitGewicht: das Workout stammt aus einem Plan (Sätze × Wiederholungen) - im Timer wird nach jedem Satz Gewicht und Wiederholungen eingetragen,
   auch bei Freiluft-Übungen mit Kurzhantel oder Kettlebell, und fließt in die Statistik */
function myRun(mw){ var r = draftRun(normMy(mw)); if(mw.fromPlan) r.mitGewicht = true; return r; }
function createMyFromDraft(d){
  var mw = { id:uid(), name:d.name, mode:d.mode, reps:d.reps, work:d.work, rest:d.rest, blockRest:d.blockRest,
             items:draftCopy(d.items), updatedAt:Date.now() };
  if(d.ws) mw.ws = d.ws;   // „warm“ / „dehn“: gehört zu Mobility & Stretch (Reiter Meine dort), nicht zu Air
  if(!state.db.myWorkouts) state.db.myWorkouts = [];
  state.db.myWorkouts.push(mw); save();
  return mw;
}
/* Fertiges Workout übernehmen: Kopie unter „Eigene“, danach im Baukasten öffnen (ws: aus Mobility & Stretch) */
function adoptLibWorkout(lw, ws){
  var d = draftFromLib(lw);
  if(ws) d.ws = ws;
  var mw = createMyFromDraft(d);
  go("#mybuild/"+mw.id);
}
var bauNeuWs = "";   // beim Anlegen aus Mobility & Stretch: „warm“ bzw. „dehn“
/* Körperregionen der Dehnübungen (Attribute für Filter in Mobility & Stretch) */
var WS_REGIONEN = ["nacken", "schulter", "arme", "brust", "ruecken", "rumpf", "huefte", "beine"];
var WS_REGION_VON = {
  "neck-stretch":["nacken"], "chin-tuck":["nacken"], "thoracic-rotation":["ruecken", "brust"], "shoulder-stretch":["schulter"], "triceps-stretch":["arme", "schulter"], "biceps-stretch":["arme", "brust"],
  "chest-stretch":["brust", "schulter"], "wrist-stretch":["arme"], "side-bend":["rumpf"], "cat-cow":["ruecken", "rumpf"],
  "childs-pose":["ruecken", "huefte"], "sphinx-stretch":["rumpf", "ruecken"], "cobra-lift":["rumpf", "ruecken"],
  "downward-dog":["ruecken", "beine", "schulter"], "spinal-twist":["ruecken", "huefte", "rumpf"], "forward-fold":["ruecken", "beine"],
  "hip-flexor-stretch":["huefte", "beine"], "quad-stretch":["beine", "huefte"], "hamstring-stretch":["beine"], "calf-stretch":["beine"],
  "figure-four":["huefte"], "pigeon-stretch":["huefte"], "butterfly-stretch":["huefte"], "worlds-greatest":["huefte", "beine", "schulter", "ruecken"]
};
/* Mobilisation, kein Dehnen: Armkreisen erscheint nur unter Aufwärmen, nicht in den Dehn-Auswahlen */
var WS_NICHT_DEHNEN = ["arm-circles"];
function wsRegionenVon(id){ return WS_REGION_VON[id] || []; }
function wsRegionOk(id, sel){ return !sel.length || wsRegionenVon(id).some(function(r){ return sel.indexOf(r) > -1; }); }
/* Übungen eines Mobility-Bereichs: Aufwärmen (feste Liste) bzw. alle Dehnübungen */
function wsUebungen(art){
  var l = art === "warm" ? AUFWAERM_UEBUNGEN.map(findExercise) : EXERCISES.filter(function(ex){ return ex.main === "stretch" && WS_NICHT_DEHNEN.indexOf(ex.id) < 0; });
  return l.filter(function(ex){ return ex && !libHidden("ex:"+ex.id); });
}
/* Filterkarte der Körperregionen (Dehnen), dieselbe Karte wie in Air. anzahl: wie viele Einträge gerade zu sehen sind; art: Wo (Workouts) oder Ex (Übungen) */
function wsRegionFilterHTML(sel, anzahl, art, zonen, dehn){
  zonen = kkNorm(zonen);
  var ico = { nacken:'<circle cx="12" cy="7" r="3"/><path d="M8 21v-5a4 4 0 0 1 8 0v5"/>', schulter:STUDIO_GRUPPEN_ICON.schulter, arme:CAT_ICON.arms, brust:STUDIO_GRUPPEN_ICON.brust,
    ruecken:CAT_ICON.back, rumpf:CAT_ICON.core, huefte:'<path d="M6 5c0 6 2 8 6 8s6-2 6-8M9 13l-2 8M15 13l2 8"/>', beine:CAT_ICON.legs };
  var namen = sel.map(function(r){ return t("rg_"+r); }).concat(zonen.map(kkName));
  return filterKarteHTML({ offen:!!state.db.settings.wsFilterOpen, toggle:"data-wstoggle", reset:"data-wsfreset", n:namen.length,
    summe:namen.length ? namen.join(", ") : t(art === "Ex" ? "afAlleEx" : "afAlleWo"),
    zeigen:filterZeigenText(anzahl, art),
    inhalt:(dehn ? filterChipsHTML(t("afRegion"), "", WS_REGIONEN.map(function(r){
      return filterChip("data-wsreg", r, sel.indexOf(r) > -1, svgIcon(ico[r]), t("rg_"+r)); }).join("")) : '')+
      kkFilterHTML("data-wszone", zonen) });
}
function wsRegionBinden(neu){
  app.querySelectorAll("[data-wsreg]").forEach(function(b){
    b.addEventListener("click", function(e){ e.stopPropagation(); var s = state.db.settings; s.wsRegionen = selToggle(s.wsRegionen, b.getAttribute("data-wsreg")); save(); neu(); });
  });
  app.querySelectorAll("[data-wszone]").forEach(function(b){
    b.addEventListener("click", function(e){ e.stopPropagation(); var s = state.db.settings; s.wsZonen = selToggle(kkNorm(s.wsZonen), b.getAttribute("data-wszone")); save(); neu(); });
  });
  app.querySelectorAll("[data-wstoggle]").forEach(function(b){
    b.addEventListener("click", function(e){ e.stopPropagation(); var s = state.db.settings; s.wsFilterOpen = !s.wsFilterOpen; save(); neu(); });
  });
  var zur = app.querySelector("[data-wsfreset]");
  if(zur) zur.addEventListener("click", function(e){ e.stopPropagation(); state.db.settings.wsRegionen = []; state.db.settings.wsZonen = []; save(); neu(); });
}
var coverDraft = null;   // das Workout auf dem Deckblatt - Änderungen gelten nur für dieses Training

/* Farbe einer Kategorie */
function exIsStretch(id){ var ex = id && findExercise(id); return !!(ex && ex.cats.indexOf("stretch") > -1); }
function catVar(id){ return id==="mix" || id==="all" ? "var(--tp-color)" : "var(--c-"+id+")"; }
/* Farbe einer Übung im Studio: Geräte und eigene Studio-Übungen violett, Air-Übungen (z. B. mit ★) in Air-Blau */
function studioFarbe(ex){ return exIstStudio(ex) ? "var(--gym-color)" : catVar(ex.cats[0]); }
var CAT_ICON = {
  cardio:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  weight:'<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/>',
  bw:'<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M7.5 10h9M12 14l-3.5 6M12 14l3.5 6"/>',
  back:'<path d="M12 3v18M8.5 6.5h7M8 10.5h8M8.5 14.5h7M9.5 18.5h5"/>',
  legs:'<path d="M9.5 3v9l-1.5 8h3.5M14.5 3v9l1 8h3.5"/>',
  core:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r=".6"/>',
  arms:'<path d="M4 18c1.5-4 3.5-7 6.5-8.5M10.5 9.5c1-2.5 3.5-4.5 6-4.5 1.5 0 2.5 1.5 1.5 3l-2.5 3.5M15.5 11c2 .5 4 2.5 4 5-3 2.5-9 3-15.5 2"/>',
  stretch:'<circle cx="12" cy="4.5" r="2"/><path d="M5 5.5l7 3 7-3M12 8.5v5M12 13.5l-5 6.5M12 13.5l5 6.5"/>',
  mix:'<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  calis:'<path d="M3 5h18M7 5v3M17 5v3"/><circle cx="12" cy="9.5" r="2"/><path d="M8 8l4 4 4-4M12 12v5M12 17l-2.5 4M12 17l2.5 4"/>'
};
var EQUIP_ICON = {
  none:'<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M7.5 10h9M12 14l-3.5 6M12 14l3.5 6"/>',
  db:'<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/>',
  kb:'<circle cx="12" cy="15" r="5.5"/><path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11"/>',
  band:'<path d="M4 12c0-3.5 3.5-6 8-6s8 2.5 8 6-3.5 6-8 6-8-2.5-8-6z"/><path d="M8 12c2-2 6-2 8 0"/>',
  bar:'<path d="M3 6h18M7 6v4M17 6v4M7 10v9M17 10v9"/>',
  dip:'<path d="M3 9h7M14 9h7M5 9v10M8 9v10M16 9v10M19 9v10"/>',
  gym:'<path d="M5 21V3M5 7h9M14 3v10M10 13h8v3h-8zM5 17h6"/>'
};
function svgIcon(inner, cls){
  return '<svg class="'+(cls||"ico")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+inner+'</svg>';
}
/* Eigene Übungen haben keine Figur: stattdessen das Symbol ihrer ersten Kategorie (Rücken, Beine, Cardio ...) */
function exSymbol(ex){ return catIcon((ex && ex.cats && ex.cats[0]) || "weight") || catIcon("weight"); }
function catIcon(c){ return CAT_ICON[c] ? svgIcon(CAT_ICON[c]) : ""; }
function catTags(cats){
  return cats.map(function(c){ return '<span class="cat-tag">'+catIcon(c)+esc(catName(c))+'</span>'; }).join("");
}
/* Stern für einzelne Übungen - markierte stehen in Listen immer oben */
function isExFav(id){ return (state.db.settings.exFavs || []).indexOf(id) > -1; }
function toggleExFav(id){ state.db.settings.exFavs = selToggle(state.db.settings.exFavs || [], id); save(); }
function exFavBtn(id){
  var on = isExFav(id);
  return '<button type="button" class="fav-btn ex-fav'+(on?' on':'')+'" data-exfav="'+id+'" aria-pressed="'+on+'" title="'+t("favorite")+'" aria-label="'+t("favorite")+'">'+(on?'\u2605':'\u2606')+'</button>';
}
/* Suche: Name (de/en), Muskeln, Hinweis - gefiltert wird im DOM, damit die Tastatur offen bleibt */
function exSearchText(ex){
  var m = EX_MUSCLES[ex.id] || [];
  return [ex.name.de, ex.name.en, m[0], m[1], m[2], m[3], ex.hint.de, ex.hint.en, EX_SUCH_ALIAS[ex.id] || ""].join(" ").toLowerCase();
}
function searchHTML(q, pre, ph){
  ph = ph || t("searchPh");
  return '<div class="lib-search">'+svgIcon('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>', "ico s-ico")+
    '<input type="search" id="'+pre+'-q" value="'+esc(q||"")+'" placeholder="'+esc(ph)+'" autocomplete="off" aria-label="'+esc(ph)+'"></div>';
}
/* Suche überall wie in Air: Lupe oben rechts in der Leiste klappt das Suchfeld auf (bleibt offen, solange etwas gesucht wird) */
function lupeHTML(pre, q){
  return '<button type="button" class="iconbtn lib-lupe'+(q ? ' an' : '')+'" data-lupe="'+pre+'" title="'+esc(t("search"))+'" aria-label="'+esc(t("search"))+'">'+
    svgIcon('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>')+'</button>';
}
function suchFeldHTML(q, pre, ph){
  return '<div class="lib-suche'+(q ? ' offen' : '')+'" data-lsw="'+pre+'">'+searchHTML(q, pre, ph)+'</div>';
}
/* Suche tolerant: Groß/klein, Bindestriche, Leerzeichen und Umlaute egal („pull ups“ = „Pull-ups“ = „pullups“,
   „liegestutz“ = „Liegestütz“), jedes Wort für sich (Reihenfolge egal), Mehrzahl-s egal („pullups“ findet „Pull-Up“) */
function suchNorm(x){
  return String(x || "").toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ").trim();
}
function suchPasst(text, q){
  var n = suchNorm(text), nz = n.replace(/ /g, ""), w = suchNorm(q);
  if(!w) return true;
  function ohneS(x){ return x.length > 3 ? x.replace(/s$/, "") : x; }
  if(nz.indexOf(ohneS(w.replace(/ /g, ""))) > -1) return true;
  return w.split(" ").every(function(x){ return n.indexOf(x) > -1 || nz.indexOf(ohneS(x)) > -1; });
}
/* Übungs-Kachel für alle Auswahlen: Figur groß, Name darunter; nr = Position(en) im Ablauf -> blau markiert.
   o: { bild (Figur-ID), name, attr, q, cat, nr, innen (im Bild), unter (unter dem Namen), klasse } */
function uebKachel(o){
  var gewaehlt = o.nr && o.nr.length;
  return '<div class="fig-karte wb-kachel'+(gewaehlt ? ' gewaehlt' : '')+(o.klasse ? ' '+o.klasse : '')+(o.bild === "russian-twists" ? ' ua-kachel' : '')+'" role="button" tabindex="0" '+o.attr+
      (o.q ? ' data-q="'+esc(o.q)+'"' : '')+' style="--cat:'+(o.cat || 'var(--accent)')+'"'+(o.nr ? ' aria-pressed="'+!!gewaehlt+'"' : '')+'>'+
    '<span class="fig-bild">'+(ILLU[o.bild] ? illuHTML(o.bild, "fig-illu") : '<span class="st-ohne">'+(o.ico || svgIcon(EQUIP_ICON.none))+'</span>')+
      (gewaehlt ? '<span class="wb-nr">'+o.nr.join("·")+'</span>' : '')+(o.innen || '')+'</span>'+
    '<span class="fig-name">'+esc(o.name)+'</span>'+(o.unter || '')+'</div>';
}
/* Antippen und Enter/Leertaste für Kacheln (Knöpfe in der Kachel, z. B. Info und Stern, zählen nicht) */
function kachelKlick(root, sel, fn){
  root.querySelectorAll(sel).forEach(function(el){
    el.addEventListener("click", function(e){ if(e.target.closest("[data-exinfo], [data-exfav]")) return; fn(el); });
    el.addEventListener("keydown", function(e){ if(e.target === el && (e.key==="Enter" || e.key===" ")){ e.preventDefault(); fn(el); } });
  });
}
/* Neu zeichnen und dabei die angetippte Kachel an ihrem Platz auf dem Bildschirm lassen: beim ersten Auswählen kommt oben etwas dazu (Ablauf,
   Körperkarte) und schöbe die Liste nach unten - die Seite wird um den Unterschied nachgeführt, man tippt einfach die nächste Übung an.
   attr/wert: Attribut und Wert der Kachel (z. B. "data-planex", "air-squats"); neuZeichnen: die Zeichenfunktion der Seite (sie hält die Scrollposition). */
function ankerNeuZeichnen(attr, wert, neuZeichnen){
  function finden(){
    var l = app.querySelectorAll("["+attr+"]");
    for(var i = 0; i < l.length; i++) if(l[i].getAttribute(attr) === wert) return l[i];
    return null;
  }
  var el = finden(), top = el ? el.getBoundingClientRect().top : null;
  neuZeichnen();
  var neu = finden();
  if(top != null && neu){ var d = neu.getBoundingClientRect().top - top; if(d) window.scrollBy(0, d); }
}
function applySearch(root, q){
  q = (q || "").trim().toLowerCase();
  var shown = 0;
  root.querySelectorAll("[data-q]").forEach(function(el){
    var ok = !q || suchPasst(el.getAttribute("data-q"), q);
    el.style.display = ok ? "" : "none";
    if(ok) shown++;
  });
  var leer = root.querySelector("[data-noresult]");
  if(leer) leer.style.display = shown ? "none" : "";
}
var libQuery = "", buildQuery = "";
/* Übungen gefiltert und sortiert (Standard = Reihenfolge der Liste, A–Z = alphabetisch) */
/* Filterreihenfolge: erst die Hauptkategorie (Kacheln), dann Fokus und Ausrüstung */
function exPasses(ex, cat, equip, mains, zonen){
  return mainMatch(mains, ex.main) && catMatch(cat, ex.cats) && equipMatch(equip, ex) && gearOk(ex, cat, equip, mains) && zonePasst(ex, zonen);
}
function sortedExercises(cat, sort, equip, mains, zonen){
  var list = EXERCISES.filter(function(ex){ return !libHidden("ex:"+ex.id) && exPasses(ex, cat, equip, mains, zonen); });
  if(sort==="az") list = list.slice().sort(function(a, b){
    return tplText(a.name).localeCompare(tplText(b.name), currentLang());
  });
  // markierte Übungen immer oben, danach die eigenen, Reihenfolge sonst unverändert
  var fav = list.filter(function(ex){ return isExFav(ex.id); });
  var own = list.filter(function(ex){ return !isExFav(ex.id) && ex.custom; });
  return fav.concat(own, list.filter(function(ex){ return !isExFav(ex.id) && !ex.custom; }));
}

/* Figur zeichnen: Rumpf kräftiger als die Glieder, schmaler Hals, Hände als Punkte.
   Der vordere Arm bekommt eine Maske (schmale Lücke im Körper dahinter) - so bleibt er
   auch vor dem Rumpf erkennbar, egal auf welchem Hintergrund. "@M@" wird pro Bild durch eine eindeutige Id ersetzt. */
/* Brustkorb: breiteres Rumpfstück von der Schulter bis knapp unter die Mitte - Oberkörper wirkt dadurch zur Taille hin schmaler */
function brustEnde(s, p){ return [ +(s[0] + (p[0]-s[0])*.45).toFixed(1), +(s[1] + (p[1]-s[1])*.45).toFixed(1) ]; }
/* Ferse: kurzes Stück hinter dem Knöchel, entgegen der Fußspitze */
function fersePunkt(ankle, toe){ return [ +(ankle[0] + (ankle[0]-toe[0])*.55).toFixed(1), +(ankle[1] + (ankle[1]-toe[1])*.55).toFixed(1) ]; }
function haloStart(s, e){ return [ +(s[0] + (e[0]-s[0])*.45).toFixed(1), +(s[1] + (e[1]-s[1])*.45).toFixed(1) ]; }
/* Bänder mit der Klasse gv (z. B. Band zwischen den Händen vor der Brust) werden über dem Körper gezeichnet, nicht dahinter */
function qSVG(q){
  var vorn = "", x = (q.x || "").replace(/<path class="ip gb gv"[^>]*\/>/g, function(m){ vorn += m; return ""; });
  if(!vorn) return qSVG0(q);
  var c = {}; for(var k in q) c[k] = q[k];
  c.x = x;
  return qSVG0(c) + vorn;
}
function qSVG0(q){
  var n = q.n, p = q.p;
  var dx = n[0]-p[0], dy = n[1]-p[1], len = Math.sqrt(dx*dx+dy*dy) || 1;
  var h = q.h || [ +(n[0] + dx/len*9).toFixed(1), +(n[1] + dy/len*9).toFixed(1) ];
  var s = [ +(n[0] - dx*.15).toFixed(1), +(n[1] - dy*.15).toFixed(1) ];   // Schulter knapp unter dem Nacken
  function limb(start, pts, hinten){
    var d = "M"+start[0]+" "+start[1];
    for(var i=0;i<pts.length;i+=2) d += "L"+pts[i]+" "+pts[i+1];
    var out = '<path'+(hinten ? ' class="lb"' : '')+' d="'+d+'"/>';
    if(start === p && pts.length >= 6){   // Bein mit Fußspitze: Ferse ergänzen
      var f = fersePunkt([pts[2], pts[3]], [pts[4], pts[5]]);
      out += '<path class="fs'+(hinten ? ' lb' : '')+'" d="M'+pts[2]+' '+pts[3]+'L'+f[0]+' '+f[1]+'"/>';
    }
    return out;
  }
  function hand(a, hinten){ return '<circle class="hd'+(hinten ? ' lb' : '')+'" cx="'+a[a.length-2]+'" cy="'+a[a.length-1]+'" r="3.3"/>'; }
  var b = brustEnde(s, p);
  var rumpf = '<path class="tr" d="M'+p[0]+' '+p[1]+'L'+s[0]+' '+s[1]+'"/><path class="br" d="M'+s[0]+' '+s[1]+'L'+b[0]+' '+b[1]+'"/>'+
    '<path class="nk" d="M'+s[0]+' '+s[1]+'L'+n[0]+' '+n[1]+'"/>';
  var koerper = q.f ? rumpf : "";
  q.l.forEach(function(l, i){ if(i>0) koerper += limb(p, l, !q.f); });
  q.a.forEach(function(a, i){ if(i>0) koerper += limb(s, a, !q.f) + hand(a, !q.f); });
  if(!q.f) koerper += rumpf;
  if(q.l[0]) koerper += limb(p, q.l[0], false);
  var kopf = '<circle cx="'+h[0]+'" cy="'+h[1]+'" r="7"/>';
  var a0 = q.a[0];
  if(!a0) return q.x + koerper + kopf;
  var hs = haloStart(s, a0), halo = "M"+hs[0]+" "+hs[1];
  for(var i=0;i<a0.length;i+=2) halo += "L"+a0[i]+" "+a0[i+1];
  return q.x + '<mask id="@M@" maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140"><rect x="-20" y="-20" width="140" height="140" fill="#fff"/>'+
    '<path d="'+halo+'" stroke="#000" stroke-width="9" fill="none"/></mask><g mask="url(#@M@)">'+koerper+'</g>'+kopf+limb(s, a0, false)+hand(a0, false);
}
var illuMaskSeq = 0;
function illuIds(svg){ var id = "im"+(illuMaskSeq++); return svg.replace(/@M@/g, id); }

var ILLU_MATTE = '<rect class="illu-matte" x="14" y="3" width="72" height="94" rx="8"/>';
var ILLU = {}, ILLU2 = {};
Object.keys(ILLU_POSES).forEach(function(id){
  var pp = ILLU_POSES[id];
  ILLU[id] = [ qSVG(pp[0]), pp[1] ? qSVG(pp[1]) : null ];
});
Object.keys(ILLU_VIEW2).forEach(function(id){
  var v = ILLU_VIEW2[id];
  ILLU2[id] = [ qSVG(v.p[0]), v.p[1] ? qSVG(v.p[1]) : null ];
});
function illuStillHTML(exId, cls){
  var p = ILLU[exId];
  if(!p) return "";
  return '<svg class="illu still '+(cls||"")+'" viewBox="0 0 100 100" aria-hidden="true">'+
    '<path class="illu-floor" d="M6 91h88"/><g class="pose-a">'+illuIds(p[0])+'</g></svg>';
}
/* Bewegte Figur: zunächst Pose A als Standbild; sobald das SVG im Dokument hängt, baut
   illuSetup() daraus ein Skelett, das zwischen den Posen nur die Gelenkwinkel dreht. */
var illuReduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
/* Entwicklungshilfe zum Prüfen der Figuren: nur mit ?dev in der Adresse (kein Einfluss auf die App) */
if(/[?&](dev|schnelltest)\b/.test(location.search)) window.BLOC_DEV = { qSVG:qSVG, illuIds:illuIds, POSES:ILLU_POSES, SEQ:ILLU_SEQ, kkUnbekannt:function(){ return kkUnbekannt(); } };   // schnelltest: der Test prüft damit die Muskelnamen
function illuHTML(exId, cls, view2){
  var p = view2 ? ILLU2[exId] : ILLU[exId];
  if(!p) return "";
  var anim = p[1] && !illuReduced, oben = view2 && ILLU_VIEW2[exId].typ === "top";
  return '<svg class="illu '+(cls||"")+(anim ? " illu-anim" : " still")+'"'+(anim ? ' data-ex="'+exId+'"'+(view2 ? ' data-view="2"' : '') : '')+' viewBox="0 0 100 100" aria-hidden="true">'+
    (oben ? ILLU_MATTE : '<path class="illu-floor" d="M6 91h88"/>')+'<g class="pose-a">'+illuIds(p[0])+'</g></svg>';
}

/* ---------- Skelett-Animation ----------
   Jede Pose wird in ein Skelett zerlegt: Wurzel in der Hüfte, Wirbelsäule mit absolutem Winkel,
   daran Kopf, Beine (Oberschenkel → Unterschenkel → Fuß) und Arme ab der Schulter (Oberarm →
   Unterarm), jeweils mit Winkel relativ zum Elternknochen. Animiert werden nur diese Winkel
   (auf dem kürzesten Weg) - so bleiben Gliedmaßen gleich lang und drehen natürlich um ihre
   Gelenke, statt zwischen zwei Posen überzublenden. Geräte in der Hand wandern mit der Hand. */
function rigFromPose(q){
  var n = q.n, p = q.p;
  var dx = n[0]-p[0], dy = n[1]-p[1], len = Math.sqrt(dx*dx+dy*dy) || 1;
  var h = q.h || [ n[0] + dx/len*9, n[1] + dy/len*9 ];
  var sa = Math.atan2(dy, dx);
  var s = [ p[0] + dx*.85, p[1] + dy*.85 ];   // Schulter knapp unter dem Nacken (wie qSVG)
  function kette(start, pts){
    var out = [], prev = start, pa = sa;
    for(var i=0;i+1<pts.length;i+=2){
      var a = Math.atan2(pts[i+1]-prev[1], pts[i]-prev[0]);
      out.push({ rel:a-pa, len:Math.sqrt(Math.pow(pts[i]-prev[0],2)+Math.pow(pts[i+1]-prev[1],2)) });
      pa = a; prev = [pts[i], pts[i+1]];
    }
    return out;
  }
  return { p:p.slice(), sa:sa, sl:len,
           head:{ rel:Math.atan2(h[1]-n[1], h[0]-n[0])-sa, len:Math.sqrt(Math.pow(h[0]-n[0],2)+Math.pow(h[1]-n[1],2)) },
           legs:q.l.map(function(l){ return kette(p, l); }), arms:q.a.map(function(a){ return kette(s, a); }) };
}
/* Fehlt in einer Pose ein Glied (oder ein Fuß), übernimmt sie es aus der anderen - es bleibt dann einfach stehen */
function rigAlign(A, B){
  function glieder(la, lb){
    var n = Math.max(la.length, lb.length), a = [], b = [];
    for(var i=0;i<n;i++){
      var ka = la[i] || lb[i], kb = lb[i] || la[i], m = Math.max(ka.length, kb.length), xa = [], xb = [];
      for(var j=0;j<m;j++){ xa.push(ka[j] || kb[j]); xb.push(kb[j] || ka[j]); }
      a.push(xa); b.push(xb);
    }
    return [a, b];
  }
  var l = glieder(A.legs, B.legs), r = glieder(A.arms, B.arms);
  A.legs = l[0]; B.legs = l[1]; A.arms = r[0]; B.arms = r[1];
}
function angLerp(a, b, t){
  var d = b - a;
  d = ((d + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI;
  return a + d*t;
}
function rigPoints(A, B, t){
  function L(a, b){ return a + (b-a)*t; }
  var p = [ L(A.p[0], B.p[0]), L(A.p[1], B.p[1]) ];
  var sa = angLerp(A.sa, B.sa, t), sl = L(A.sl, B.sl);
  var c = Math.cos(sa), si = Math.sin(sa);
  var n = [ p[0] + c*sl, p[1] + si*sl ], s = [ p[0] + c*sl*.85, p[1] + si*sl*.85 ];
  var ha = sa + angLerp(A.head.rel, B.head.rel, t), hl = L(A.head.len, B.head.len);
  function kette(start, ka, kb){
    var pts = [], prev = start, pa = sa;
    for(var i=0;i<ka.length;i++){
      var a = pa + angLerp(ka[i].rel, kb[i].rel, t), l = L(ka[i].len, kb[i].len);
      prev = [ prev[0] + Math.cos(a)*l, prev[1] + Math.sin(a)*l ];
      pts.push(prev); pa = a;
    }
    return pts;
  }
  return { p:p, n:n, s:s, h:[ n[0] + Math.cos(ha)*hl, n[1] + Math.sin(ha)*hl ],
           legs:A.legs.map(function(k, i){ return kette(p, k, B.legs[i]); }),
           arms:A.arms.map(function(k, i){ return kette(s, k, B.arms[i]); }) };
}
/* Geräte, die die Hand hält (Hantel, Kettlebell), stecken in <g class="gh" data-at="x,y">,
   Polster und Platten am Fuß (Beinstrecker, Schlitten) in <g class="gf" data-at="x,y"> */
function gearSplit(x){
  var hand = [], fest = (x || "").replace(/<g class="(gh|gf)" data-at="([\d.\-]+),([\d.\-]+)">([\s\S]*?)<\/g>/g, function(m, art, gx, gy, inner){
    hand.push({ at:[+gx, +gy], svg:m, fuss:art === "gf" });
    return "";
  });
  return { fest:fest, hand:hand };
}
function ptsD(start, pts){
  var d = "M"+start[0].toFixed(1)+" "+start[1].toFixed(1);
  pts.forEach(function(q){ d += "L"+q[0].toFixed(1)+" "+q[1].toFixed(1); });
  return d;
}
/* Widerstandsband in der Animation: Linien mit data-bd (Marken: h = Hand, f = Fuß, k = Knie, sonst fester Punkt) werden aus den festen Geräteteilen
   gelöst und in jedem Bild neu gezeichnet. Je länger das Band, desto dünner (gedehnt); ist es kürzer als in Ruhe, hängt es leicht durch. */
function bandSplit(gs){
  var re = /<path class="ip gb( gv)?" d="[^"]*" data-bd="([^"]+)"\/>/g, alle = [];
  gs.forEach(function(g){
    var l = [];
    g.fest.replace(re, function(m, v, d){
      var arr = d.split("|").map(function(s){
        var m2 = /^([hfk])(\d)$/.exec(s);
        if(m2) return { a:m2[1], i:+m2[2] };
        var xy = s.split(","); return { x:+xy[0], y:+xy[1] };
      }); arr.v = !!v; l.push(arr);
      return m;
    });
    alle.push(l);
  });
  var n = alle[0].length;
  if(!n || alle.some(function(l){ return l.length !== n || l.some(function(b, i){ return b.length !== alle[0][i].length; }); })) return null;
  gs.forEach(function(g){ g.fest = g.fest.replace(re, ""); });
  return alle;   // alle[Pose][Band] = Marken
}
function bandPunkte(spez, P){
  return spez.map(function(m){
    if(m.a === "h"){ var a = P.arms[m.i] || P.arms[0]; return a[a.length-1]; }
    if(m.a === "f"){ var l = P.legs[m.i] || P.legs[0]; return l[Math.min(1, l.length-1)]; }
    if(m.a === "k"){ var l2 = P.legs[m.i] || P.legs[0]; return l2[0]; }
    return [m.x, m.y];
  });
}
function bandLaenge(pts){ var L = 0; for(var i=1;i<pts.length;i++) L += Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]); return L; }
function bandPfad(pts, ruhe){
  var L = bandLaenge(pts), hang = Math.max(0, ruhe*1.08 - L)*.5, d = "M"+pts[0][0].toFixed(1)+" "+pts[0][1].toFixed(1);
  for(var i=1;i<pts.length;i++){
    var a = pts[i-1], b = pts[i], sl = Math.hypot(b[0]-a[0], b[1]-a[1]) || 1;
    if(hang > .6){
      var nx = -(b[1]-a[1])/sl, ny = (b[0]-a[0])/sl, s = hang*sl/(L || 1);
      if(ny < 0){ nx = -nx; ny = -ny; }   // Durchhang nach unten
      d += "Q"+((a[0]+b[0])/2 + nx*s).toFixed(1)+" "+((a[1]+b[1])/2 + ny*s).toFixed(1)+" "+b[0].toFixed(1)+" "+b[1].toFixed(1);
    } else d += "L"+b[0].toFixed(1)+" "+b[1].toFixed(1);
  }
  return { d:d, w:Math.max(1.5, Math.min(2.8, 2.6*Math.pow(ruhe*1.08/Math.max(L, 1), .9))) };
}
var illuFigs = [], illuRaf = 0, illuIO = null, illuSeq = 0;
function illuSetup(svg){
  svg.setAttribute("data-rig", "1");
  var id = svg.getAttribute("data-ex"), view2 = svg.getAttribute("data-view") === "2";
  var seq = view2 ? (ILLU_VIEW2[id] || {}).seq : ILLU_SEQ[id];
  var pp = view2 ? (ILLU_VIEW2[id] || {}).p : ILLU_POSES[id];
  if(!seq && (!pp || !pp[1])) return;
  /* Phasen: zwei Posen pendeln hin und her; Abläufe (ILLU_SEQ) laufen reihum durch */
  var qs = seq ? seq.k : [pp[0], pp[1]];
  var times = seq ? seq.t : [[ILLU_HOLD_A, ILLU_MOVE], [ILLU_HOLD_B, ILLU_MOVE]];
  var R = qs.map(rigFromPose);
  for(var pass=0; pass<2; pass++) for(var k=1; k<R.length; k++) rigAlign(R[0], R[k]);
  var gs = qs.map(function(q){ return gearSplit(q.x); });
  var bands = bandSplit(gs);   // Band-Linien laufen mit den Gliedern mit (siehe bandSplit)
  var P = R.map(function(r){ return rigPoints(r, r, 0); });
  function naechsteHand(pts, at){
    var best = 0, bd = Infinity;
    pts.arms.forEach(function(k, i){
      var e = k[k.length-1], d = Math.pow(e[0]-at[0],2) + Math.pow(e[1]-at[1],2);
      if(d < bd){ bd = d; best = i; }
    });
    return best;
  }
  function naechsterFuss(pts, at){
    var best = [0, 0], bd = Infinity;
    pts.legs.forEach(function(k, i){ k.forEach(function(e, j){
      var d = Math.pow(e[0]-at[0],2) + Math.pow(e[1]-at[1],2);
      if(d < bd){ bd = d; best = [i, j]; }
    }); });
    return best;
  }
  function anker(pt, g){ if(g.leg != null){ return pt.legs[g.leg][g.pt]; } var hk = pt.arms[g.arm]; return hk[hk.length-1]; }
  var gears = gs[0].hand.map(function(g, i){
    var gg = { at:g.at, svg:g.svg };
    if(g.fuss){ var f = naechsterFuss(P[0], g.at); gg.leg = f[0]; gg.pt = f[1]; gg.arm = -1; }
    else gg.arm = naechsteHand(P[0], g.at);
    var o = P.map(function(pt, k){
      var e = anker(pt, gg), at = gs[k].hand[i] ? gs[k].hand[i].at : null;
      return at ? [ at[0]-e[0], at[1]-e[1] ] : null;
    });
    gg.o = o.map(function(v){ return v || o[0]; });
    return gg;
  });
  var frontal = !!qs[0].f;
  var html = view2 && ILLU_VIEW2[id].typ === "top" ? ILLU_MATTE : '<path class="illu-floor" d="M6 91h88"/>';
  var gleich = gs.every(function(g){ return g.fest === gs[0].fest; });
  if(gleich || gs.length > 2) html += gs[0].fest;
  else html += '<g class="gx-a">'+gs[0].fest+'</g><g class="gx-b" style="opacity:0">'+gs[1].fest+'</g>';
  var bandVorn = "";   // Bänder mit gv liegen vor dem Körper (z. B. zwischen den Händen vor der Brust)
  if(bands) bands[0].forEach(function(b, i){ var el = '<path class="ip gb" data-band="'+i+'"/>'; if(b.v) bandVorn += el; else html += el; });
  var vorn = "";
  gears.forEach(function(g, i){
    var el = '<g class="gear" data-g="'+i+'">'+g.svg+'</g>';
    if(g.arm === 0 || g.leg === 0) vorn += el; else html += el;
  });
  vorn += bandVorn;
  var A = R[0];
  var hinten = frontal ? '' : ' class="lb"', hintenHand = frontal ? ' class="hd"' : ' class="hd lb"';
  var mid = "im"+(illuMaskSeq++), rumpf = '<path class="tr" data-spine="1"/><path class="br" data-brust="1"/><path class="nk" data-neck="1"/>';
  var koerper = frontal ? rumpf : "";
  var hintenFerse = frontal ? ' class="fs"' : ' class="fs lb"';
  A.legs.forEach(function(k, i){ if(i>0) koerper += '<path'+hinten+' data-leg="'+i+'"/>'+(k.length >= 3 ? '<path'+hintenFerse+' data-ferse="'+i+'"/>' : ''); });
  A.arms.forEach(function(k, i){ if(i>0) koerper += '<path'+hinten+' data-arm="'+i+'"/><circle'+hintenHand+' r="3.3" data-hand="'+i+'"/>'; });
  if(!frontal) koerper += rumpf;
  if(A.legs.length) koerper += '<path data-leg="0"/>'+(A.legs[0].length >= 3 ? '<path class="fs" data-ferse="0"/>' : '');
  var kopf = '<circle data-head="1" r="7"/>';
  if(A.arms.length){
    html += '<mask id="'+mid+'" maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140"><rect x="-20" y="-20" width="140" height="140" fill="#fff"/>'+
      '<path data-halo="1" stroke="#000" stroke-width="9" fill="none"/></mask><g mask="url(#'+mid+')">'+koerper+'</g>'+kopf+
      '<path data-arm="0"/><circle class="hd" r="3.3" data-hand="0"/>' + vorn;
  } else html += koerper + kopf + vorn;
  svg.innerHTML = html;
  var fig = { svg:svg, R:R, times:times, gears:gears, vis:true, seq:illuSeq++,
              speed: seq ? 1 : (findExercise(id) || {}).main === "ausdauer" ? .7 : 1,
              legs:[], arms:[], gearEls:[],
              spine:svg.querySelector("[data-spine]"), head:svg.querySelector("[data-head]"),
              neck:svg.querySelector("[data-neck]"), brust:svg.querySelector("[data-brust]"), fersen:[], halo:svg.querySelector("[data-halo]"), hands:[],
              gxa:svg.querySelector(".gx-a"), gxb:svg.querySelector(".gx-b"), bands:bands, bandEls:[], bandRuhe:[] };
  A.legs.forEach(function(k, i){ fig.legs[i] = svg.querySelector('[data-leg="'+i+'"]'); fig.fersen[i] = svg.querySelector('[data-ferse="'+i+'"]'); });
  A.arms.forEach(function(k, i){ fig.arms[i] = svg.querySelector('[data-arm="'+i+'"]'); fig.hands[i] = svg.querySelector('[data-hand="'+i+'"]'); });
  gears.forEach(function(g, i){ fig.gearEls[i] = svg.querySelector('[data-g="'+i+'"]'); });
  if(bands) bands[0].forEach(function(b, i){
    fig.bandEls[i] = svg.querySelector('[data-band="'+i+'"]');
    fig.bandRuhe[i] = Math.min.apply(null, bands.map(function(sp, k){ return bandLaenge(bandPunkte(sp[i], P[k])); }));
  });
  illuDraw(fig, { i:0, j:1 % R.length, t:0 });
  illuFigs.push(fig);
  if(illuIO) illuIO.observe(svg);
  if(!illuRaf) illuRaf = requestAnimationFrame(illuFrame);
}
/* b = { i: Phase, j: nächste Phase, t: 0..1 dazwischen } */
function illuDraw(f, b){
  var t = b.t, P = rigPoints(f.R[b.i], f.R[b.j], t);
  f.spine.setAttribute("d", ptsD(P.p, [P.s]));
  f.brust.setAttribute("d", ptsD(P.s, [brustEnde(P.s, P.p)]));
  f.neck.setAttribute("d", ptsD(P.s, [P.n]));
  f.head.setAttribute("cx", P.h[0].toFixed(1)); f.head.setAttribute("cy", P.h[1].toFixed(1));
  P.legs.forEach(function(k, i){
    f.legs[i].setAttribute("d", ptsD(P.p, k));
    if(f.fersen[i] && k.length >= 3) f.fersen[i].setAttribute("d", ptsD(k[1], [fersePunkt(k[1], k[2])]));
  });
  P.arms.forEach(function(k, i){
    f.arms[i].setAttribute("d", ptsD(P.s, k));
    var e = k[k.length-1];
    if(f.hands[i]){ f.hands[i].setAttribute("cx", e[0].toFixed(1)); f.hands[i].setAttribute("cy", e[1].toFixed(1)); }
  });
  if(f.halo && P.arms[0]) f.halo.setAttribute("d", ptsD(haloStart(P.s, P.arms[0][0]), P.arms[0]));
  f.gears.forEach(function(g, i){
    var hand = g.leg != null ? P.legs[g.leg][g.pt] : P.arms[g.arm][P.arms[g.arm].length-1], oa = g.o[b.i], ob = g.o[b.j];
    var ox = oa[0] + (ob[0]-oa[0])*t, oy = oa[1] + (ob[1]-oa[1])*t;
    f.gearEls[i].setAttribute("transform", "translate("+(hand[0]+ox-g.at[0]).toFixed(1)+" "+(hand[1]+oy-g.at[1]).toFixed(1)+")");
  });
  if(f.bands) f.bandEls.forEach(function(el, n){
    var a = bandPunkte(f.bands[b.i][n], P), c = bandPunkte(f.bands[b.j][n], P), pts = a.map(function(p, m){ return [p[0] + (c[m][0]-p[0])*t, p[1] + (c[m][1]-p[1])*t]; });
    var r = bandPfad(pts, f.bandRuhe[n]);
    el.setAttribute("d", r.d); el.style.strokeWidth = r.w.toFixed(2);
  });
  if(f.gxa){ var x = b.i === 0 ? t : 1-t; f.gxa.style.opacity = (1-x).toFixed(2); f.gxb.style.opacity = x.toFixed(2); }
}
/* Ablauf: jede Phase kurz halten, dann weiter zur nächsten. Zwei Posen: A halten, nach B, B halten, zurück.
   Ausdauerübungen etwas flotter. Easing je Übergang: "o" = abbremsen (Absprung nach oben),
   "i" = beschleunigen (Fallen/Landen), "l" = gleichmäßig (Zwischenpunkte), sonst weich an beiden Enden. */
var ILLU_HOLD_A = .38, ILLU_MOVE = .78, ILLU_HOLD_B = .26;
function illuBlend(now, f){
  var total = 0, K = f.times.length;
  f.times.forEach(function(x){ total += x[0] + x[1]; });
  var x = ((now/1000 + f.seq*.37) % (total*f.speed))/f.speed;
  for(var k=0; k<K; k++){
    var h = f.times[k][0], m = f.times[k][1], e = f.times[k][2], j = (k+1) % K;
    if(x < h) return { i:k, j:j, t:0 };
    x -= h;
    if(x < m){ var u = x/m; return { i:k, j:j, t: e === "o" ? 1-(1-u)*(1-u) : e === "i" ? u*u : e === "l" ? u : easeInOutCubic(u) }; }
    x -= m;
  }
  return { i:0, j:1 % K, t:0 };
}
function illuFrame(now){
  illuRaf = 0;
  illuFigs = illuFigs.filter(function(f){
    if(f.svg.isConnected) return true;
    if(illuIO) illuIO.unobserve(f.svg);
    return false;
  });
  if(!illuFigs.length) return;
  illuFigs.forEach(function(f){ if(f.vis) illuDraw(f, illuBlend(now, f)); });
  illuRaf = requestAnimationFrame(illuFrame);
}
if(window.IntersectionObserver){
  illuIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      for(var i=0;i<illuFigs.length;i++) if(illuFigs[i].svg === e.target){ illuFigs[i].vis = e.isIntersecting; break; }
    });
  });
}
/* neue Figuren im Dokument automatisch in Bewegung setzen */
new MutationObserver(function(){
  var neu = document.querySelectorAll("svg.illu-anim:not([data-rig])");
  for(var i=0;i<neu.length;i++) illuSetup(neu[i]);
}).observe(document.body, { childList:true, subtree:true });

function musclesMain(ex){ var m = EX_MUSCLES[ex.id]; return m ? m[currentLang()==="en" ? 2 : 0] : ""; }
function musclesAssist(ex){ var m = EX_MUSCLES[ex.id]; return m ? m[currentLang()==="en" ? 3 : 1] : ""; }
function musclesLabel(ex){ return t(ex.cats.indexOf("stretch") > -1 ? "musStretched" : "musWorked"); }

/* Info-Fenster: großes Piktogramm, Anleitung, Tipp. Im Timer läuft die Zeit sichtbar weiter. */
var infoTimer = null;
/* Farbe des Bereichs, in dem man gerade ist - Figuren in Einblendfenstern passen sich an */
function bereichsFarbe(){
  var h = navTop(), m = h.match(/^#cover\/lib\/(.+)$/);
  if(/^#warmstretch/.test(h) || (m && libIstWarmDehn(findLibWorkout(m[1])))) return "var(--ws-color)";
  return "";
}
/* Nachbarn in den Leichter/Schwerer-Ketten (Daten: LZ_KETTEN in daten.js) */
function leichterSchwerer(id){
  for(var i = 0; i < LZ_KETTEN.length; i++){
    var k = LZ_KETTEN[i], j = k.indexOf(id);
    if(j < 0) continue;
    var l = j > 0 ? k[j-1] : null, s = j < k.length-1 ? k[j+1] : null;
    if(l && !(findExercise(l) && EX_INFO[l])) l = null;
    if(s && !(findExercise(s) && EX_INFO[s])) s = null;
    return l || s ? { l:l, s:s } : null;
  }
  return null;
}
/* ---------- Befestigung des Widerstandsbands ----------
   Aufklappbare Karte unter den bewegten Figuren (Info-Fenster und Übungskarte): wo und wie das Band befestigt wird - eine kleine Skizze, die Schritte
   und bei Bedarf ein besonderer Hinweis. Daten: BAND_ARTEN, BAND_HOEHE, BAND_ANKER, BAND_ANKER_EXTRA in daten.js. */
function bandSkizze(art, h){
  var B = ' class="bs-b"', K = ' class="bs-k"', s = "";
  function hand(x, y){ return '<circle'+B+' cx="'+x+'" cy="'+y+'" r="3.4"/>'; }
  function person(x){ return '<circle'+K+' cx="'+x+'" cy="13" r="5"/><path'+K+' d="M'+x+' 18V42M'+x+' 42l-6 16M'+x+' 42l6 16"/>'; }
  if(art === "tuer"){
    var ay = { hoch:10, brust:26, huefte:38, tief:52 }[h] || 26, hy = { hoch:28, brust:26, huefte:36, tief:42 }[h] || 26;
    // Calisthenics-Park: zwei feste Pfosten mit Querstange; das Band ist in der gewünschten Höhe um den vorderen Pfosten gelegt
    s = '<path'+K+' d="M10 58V5M40 58V5M6 5H44"/>'+
        '<circle'+B+' cx="40" cy="'+ay+'" r="3.4"/><path'+B+' d="M43 '+ay+'L88 '+hy+'"/>'+hand(90, hy)+person(100)+'<path'+K+' d="M100 24L91 '+hy+'"/>';
  } else if(art === "stange"){
    s = '<path'+K+' d="M18 58V10H102V58"/><ellipse'+B+' cx="60" cy="10" rx="4.5" ry="9"/><path'+B+' d="M56 19V40M64 19V40M54 40a6 6 0 0 0 12 0"/>';
  } else if(art === "fuss"){
    s = '<rect'+K+' x="30" y="51" width="20" height="7" rx="3"/><rect'+K+' x="70" y="51" width="20" height="7" rx="3"/>'+
        '<path'+B+' d="M16 12L36 50H84L104 12"/>'+hand(16, 12)+hand(104, 12);
  } else if(art === "fuss1"){
    s = '<rect'+K+' x="30" y="51" width="20" height="7" rx="3"/><path'+B+' d="M26 50H78L94 14M26 50L16 38"/>'+hand(94, 14);
  } else if(art === "haende"){
    s = hand(30, 32)+hand(90, 32)+'<path'+B+' d="M34 32H86"/><path'+K+' d="M24 32H10M14 27l-5 5 5 5M96 32H110M106 27l5 5-5 5"/>';
  } else if(art === "knie"){
    s = '<rect'+K+' x="38" y="4" width="16" height="42" rx="7"/><rect'+K+' x="66" y="4" width="16" height="42" rx="7"/>'+
        '<rect'+B+' x="34" y="24" width="52" height="12" rx="6"/><path'+K+' d="M28 30H16M20 26l-4 4 4 4M92 30H104M100 26l4 4-4 4"/>';
  } else if(art === "knoechel"){
    s = '<path'+K+' d="M46 4V50M74 4V50M38 56H54M66 56H82"/><rect'+B+' x="40" y="40" width="40" height="11" rx="5.5"/>';
  } else if(art === "fussloop"){
    s = '<path'+K+' d="M20 8V40H54"/><ellipse'+B+' cx="44" cy="40" rx="9" ry="7"/><path'+B+' d="M50 36L90 14M52 42L96 30"/>'+hand(90, 14)+hand(96, 30);
  } else if(art === "ruecken"){
    s = '<circle'+K+' cx="62" cy="10" r="5"/><path'+K+' d="M60 16V50M60 50l-4 8M60 50l6 8"/>'+
        '<path'+B+' d="M92 28H55a5 5 0 0 0 0 10H92"/>'+hand(92, 28)+hand(92, 38);
  } else if(art === "sitzfuss"){
    s = '<circle'+K+' cx="24" cy="18" r="5"/><path'+K+' d="M24 24V52H70V40"/><rect'+B+' x="66" y="38" width="11" height="15" rx="4"/>'+
        '<path'+B+' d="M70 40L44 26M72 48L44 32"/>'+hand(44, 26)+hand(44, 32);
  }
  return '<svg class="band-skizze" viewBox="0 0 120 64" aria-hidden="true"><path'+K+' d="M3 59H117" opacity=".35"/>'+s+'</svg>';
}
function bandAnkerHTML(exId){
  var a = BAND_ANKER[exId];
  if(!a) return "";
  var lang = currentLang() === "en" ? 1 : 0, art = BAND_ARTEN[a[0]], h = a[1] && BAND_HOEHE[a[1]], extra = BAND_ANKER_EXTRA[exId];
  return '<details class="info-anker"><summary><span class="ia-t"><b>'+esc(t("bandAnkerTitel"))+'</b><small>'+esc(art.titel[lang]+(h ? " – "+h[lang] : ""))+'</small></span>'+
      '<span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
    '<div class="ia-body">'+bandSkizze(a[0], a[1])+
      '<ol class="info-steps">'+art.schritte[lang].map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol>'+
      (extra ? '<div class="info-tip">'+esc(extra[lang])+'</div>' : '')+'</div></details>';
}
/* Übersicht aller Befestigungsarten mit den Bildern (aus der Band-Info erreichbar); Texte stehen hier, nicht in texte.js */
function bandUebersichtOeffnen(exId){
  var lang = currentLang() === "en" ? 1 : 0, root = document.getElementById("overlayRoot");
  var txt = lang
    ? { titel:"Attaching the band – overview", sub:"All the ways to attach the band, with pictures. Each exercise shows its own way in the “Anchor the band” card." }
    : { titel:"Band befestigen – Übersicht", sub:"Alle Arten, das Band zu befestigen, mit Bildern. Jede Übung zeigt ihre eigene Art in der Karte „Band befestigen“." };
  var reihe = ["tuer", "stange", "fuss", "fuss1", "haende", "knie", "knoechel", "fussloop", "ruecken", "sitzfuss"];
  var karten = reihe.filter(function(k){ return BAND_ARTEN[k]; }).map(function(k){
    var a = BAND_ARTEN[k];
    return '<div class="bu-art"><div class="bu-t">'+esc(a.titel[lang])+'</div>'+bandSkizze(k, k === "tuer" ? "brust" : null)+
      '<ol class="info-steps">'+a.schritte[lang].map(function(s){ return '<li>'+esc(s)+'</li>'; }).join("")+'</ol></div>';
  }).join("");
  var sicher = ["bandS1", "bandS2", "bandS3", "bandS4", "bandS6"].map(function(k){ return '<li>'+esc(t(k))+'</li>'; }).join("");
  root.innerHTML = '<div class="confirm-overlay info-overlay"><div class="confirm-sheet info-sheet band-uebersicht" role="dialog" aria-label="'+esc(txt.titel)+'">'+
    '<div class="info-head"><div><h3>'+esc(txt.titel)+'</h3><div class="info-sub">'+esc(txt.sub)+'</div></div>'+
      '<button type="button" class="info-x" data-close aria-label="'+esc(t("close"))+'">&times;</button></div>'+
    karten+
    '<div class="info-title">'+esc(t("bandTitel"))+'</div><ul class="info-posture info-band">'+sicher+'</ul>'+
    '<button class="btn btn-secondary" data-close>'+esc(t("close"))+'</button></div></div>';
  function zu(){ root.innerHTML = ""; if(exId) openExInfo(exId); }
  root.querySelectorAll("[data-close]").forEach(function(b){ b.addEventListener("click", zu); });
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
}
document.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("[data-bandalle]");
  if(b){ e.preventDefault(); bandUebersichtOeffnen(b.getAttribute("data-bandalle")); }
});
/* Hinweise für Geräteübungen im Fitnessstudio (Info-Fenster und Übungskarte) */
function gymHinweisHTML(ex){
  if(!ex || !ex.equip || ex.equip.indexOf("gym") < 0) return "";
  return '<div class="info-title">'+t("gymTitel")+'</div><ul class="info-posture info-band">'+["gymS1", "gymS2", "gymS3"].map(function(k){ return '<li>'+esc(t(k))+'</li>'; }).join("")+'</ul>';
}
function openExInfo(exId, live, lib){
  var ex = findExercise(exId), info = EX_INFO[exId], farbe = bereichsFarbe() || (ex && studioFarbe(ex) === "var(--gym-color)" ? "var(--gym-color)" : "");
  if(!ex || !info) return;
  var lang = currentLang()==="en" ? 1 : 0;
  var steps = info[lang].split("|").map(function(s){ return '<li>'+esc(s)+'</li>'; }).join("");
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay info-overlay"><div class="confirm-sheet info-sheet" role="dialog" aria-label="'+esc(tplText(ex.name))+'"'+(farbe ? ' style="--bereich:'+farbe+'"' : '')+'>'+
    '<div class="info-head"><div><h3>'+esc(tplText(ex.name))+'</h3>'+
      '<div class="info-sub">'+blockSpec(exBlock(ex))+SEP+esc(ex.cats.map(catName).join(" · "))+'</div></div>'+
      '<button type="button" class="info-x" data-close aria-label="'+t("close")+'">&times;</button></div>'+
    (live ? '<div class="info-live"><span id="info-live-text"></span><button type="button" class="tpl-adopt" data-infopause></button></div>' : '')+
    (ILLU2[exId]
      ? '<div class="info-views"><figure>'+illuHTML(exId, "info-illu")+'<figcaption>'+t(ILLU_VIEW2[exId].haupt === "front" ? "viewFront" : "viewSide")+'</figcaption></figure>'+
        '<figure>'+illuHTML(exId, "info-illu", true)+'<figcaption>'+t({ top:"viewTop", side:"viewSide" }[ILLU_VIEW2[exId].typ] || "viewFront")+'</figcaption></figure></div>'
      : (ILLU[exId] ? illuHTML(exId, "info-illu") : (ex.custom ? '<div class="info-views"><span class="ex-symbol big">'+exSymbol(ex)+'</span></div>' : "")))+
    gearChipsHTML(ex, live)+griffHTML(exId)+
    bandAnkerHTML(exId)+   // Band-Übungen: wo und wie das Band befestigt wird (aufklappbar, unter den Figuren)
    (EX_MUSCLES[exId] ? '<div class="info-mus"><div class="info-mus-t"><div><b>'+esc(musclesLabel(ex))+':</b> '+esc(musclesMain(ex))+'</div>'+
      (musclesAssist(ex) ? '<div class="info-mus-2">'+esc(t(ex.cats.indexOf("stretch") > -1 ? "musAlsoStretched" : "musAssist"))+': '+esc(musclesAssist(ex))+'</div>' : '')+'</div>'+
      kkInfoHTML(ex)+'</div>' : '')+
    '<div class="info-title">'+t("howTo")+'</div><ol class="info-steps">'+steps+'</ol>'+
    (function(){
      var p = EX_POSTURE[exId];
      if(!p) return "";
      var cues = p[lang*2].split("|").map(function(c){ return '<li>'+esc(c)+'</li>'; }).join("");
      return '<div class="info-title">'+t("posture")+'</div><ul class="info-posture">'+cues+'</ul>'+
        '<div class="info-avoid"><b>'+t("avoid")+':</b> '+esc(p[lang*2+1])+'</div>';
    })()+
    '<div class="info-tip"><b>'+t("tip")+':</b> '+esc(tplText(ex.hint))+'</div>'+
    (ex.equip.indexOf("band") > -1 ? '<div class="info-title">'+t("bandTitel")+'</div><ul class="info-posture info-band">'+["bandS1", "bandS2", "bandS3", "bandS4", "bandS5", "bandS6"].map(function(k){ return '<li>'+esc(t(k))+'</li>'; }).join("")+'</ul><button type="button" class="tpl-adopt" data-bandalle="'+exId+'">'+esc(lang ? "All ways to attach the band, with pictures" : "Alle Befestigungsarten mit Bildern")+'</button>' : '')+
    gymHinweisHTML(ex)+
    (function(){   // Passt es nicht? Eine Zeile mit der leichteren und der schwereren Variante
      var lz = live ? null : leichterSchwerer(exId);
      if(!lz) return "";
      function knopf(id, richtung){ return id ? '<button type="button" class="lz-btn '+richtung+'" data-lz="'+id+'"><small>'+(richtung === "l" ? '‹ '+esc(t("lzLeichter")) : esc(t("lzSchwerer"))+' ›')+'</small><b>'+esc(tplText(findExercise(id).name))+'</b></button>' : '<span class="lz-leer"></span>'; }
      return '<div class="info-title">'+esc(t("lzTitel"))+'</div><div class="info-lz">'+knopf(lz.l, "l")+knopf(lz.s, "s")+'</div>';
    })()+
    (lib ? '<div class="info-lib">'+
      '<button type="button" class="tpl-adopt" data-infoblock>'+ICON_PLUS+' '+t("adoptBlock")+'</button>'+
      (lib.zu ? '<button type="button" class="tpl-adopt" data-infozu>'+ICON_PLUS+' '+t("zpAdd")+'</button>' : '')+
      '<button type="button" class="tpl-hide" data-infohide>'+t("hideEx")+'</button></div>' : '')+
    '<p class="info-risk">'+esc(t("ownRisk"))+' <a href="privacy.html#haftung" target="_blank" rel="noopener">'+t("ownRiskMore")+'</a> · <a href="quellen.html" target="_blank" rel="noopener">'+t("sourcesLink")+'</a></p>'+
    '<button class="btn btn-secondary" data-close>'+t("close")+'</button>'+
  '</div></div>';
  if(lib){
    root.querySelector("[data-infoblock]").addEventListener("click", function(){
      adoptExercise(ex); showToast(t("adoptedBlock", { n:tplText(ex.name) }));
    });
    if(lib.zu) root.querySelector("[data-infozu]").addEventListener("click", function(){ close(); lib.zu(); });
    root.querySelector("[data-infohide]").addEventListener("click", function(){
      libHide("ex:"+exId); close(); if(lib.onChange) lib.onChange();
    });
  }
  function close(){
    if(infoTimer){ clearInterval(infoTimer); infoTimer = null; }
    root.innerHTML = "";
  }
  root.querySelectorAll("[data-close]").forEach(function(b){ b.addEventListener("click", close); });
  root.querySelectorAll("[data-lz]").forEach(function(b){ b.addEventListener("click", function(){ var nach = b.getAttribute("data-lz"); close(); openExInfo(nach, false, lib); }); });
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) close(); });
  if(live){
    var pauseBtn = root.querySelector("[data-infopause]");
    function aktualisieren(){
      if(!playerState){ close(); return; }
      var st = playerState.steps[playerState.idx];
      if(st.phase==="done"){ close(); return; }
      var rem = playerState.paused ? playerState.remainingMs : playerState.endAt - Date.now();
      document.getElementById("info-live-text").innerHTML =
        (playerState.paused ? t("infoPaused") : t("infoRunning"))+SEP+'<b>'+phaseVars(st.phase).label+' '+fmtTime(Math.ceil(Math.max(0,rem)/1000))+'</b>';
      pauseBtn.textContent = playerState.paused ? t("infoResume") : t("infoPause");
    }
    pauseBtn.addEventListener("click", function(){
      var pp = document.getElementById("pl-playpause");
      if(pp) pp.click();
      aktualisieren();
    });
    aktualisieren();
    infoTimer = setInterval(aktualisieren, 250);
  }
}

