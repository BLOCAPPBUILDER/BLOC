"use strict";
/* ============ Timer: Timer-Workouts und Blöcke ============
   Beides sind Intervall-Timer mit fest gespeicherten Zeiten - deshalb eine gemeinsame Seite
   mit zwei Reitern. Mit ☆ landet ein Eintrag auf der Startseite. */
/* Neue Timer-Workouts und Blöcke sind erst ein Entwurf - gespeichert wird nur mit „Speichern“ */
var neuEntwurf = null;   // { liste:"workouts"|"blocks", obj }
function entwurf(liste, id){ return neuEntwurf && neuEntwurf.liste === liste && neuEntwurf.obj.id === id ? neuEntwurf.obj : null; }
function entwurfSichern(liste, obj){
  if(entwurf(liste, obj.id)){
    (neuEntwurf.bloecke || []).forEach(function(b){   // nur Blöcke, die im Workout noch vorkommen
      if(obj.items && obj.items.some(function(it){ return it.blockId === b.id; })) state.db.blocks.push(b);
    });
    state.db[liste].push(obj); neuEntwurf = null;
  }
  save();
}
function createTimerWorkout(){
  var w = { id:uid(), name:t("newWorkout"), items:[], updatedAt:Date.now() };
  neuEntwurf = { liste:"workouts", obj:w, bloecke:[] };
  return w;
}
/* Timer-Workout per „Überrasch mich“ füllen: jede Übung wird ein Block (vorhandene gleiche Blöcke
   werden wiederverwendet) und hinten angehängt, mit der Blockpause der gewählten Intensität */
function blockAusItem(it){
  var ex = findExercise(it.ex);
  if(!ex) return null;
  for(var i=0;i<state.db.blocks.length;i++){
    var b = state.db.blocks[i];
    if(b.ex===ex.id && b.reps===it.reps && b.workSec===it.work && b.restSec===it.rest) return b;
  }
  var nb = { id:uid(), ex:ex.id, name:tplText(ex.name), reps:it.reps, workSec:it.work, restSec:it.rest,
             sides:ex.perSide, hint:tplText(ex.hint), updatedAt:Date.now() };
  state.db.blocks.push(nb);
  return nb;
}
function timerWorkoutFuellen(w, d){
  var items = stretchLast(d.items, function(it){ return it.ex; }), n = 0;
  if(w.items.length && !w.items[w.items.length-1].restAfterSec) w.items[w.items.length-1].restAfterSec = d.blockRest;
  items.forEach(function(it){
    var b = blockAusItem(it);
    if(!b) return;
    w.items.push({ blockId:b.id, restAfterSec: it.after != null ? it.after : d.blockRest });
    n++;
  });
  w.updatedAt = Date.now();
  save();
  showToast(t("spFilled", { n:n, w:w.name || t("untitled") }));
  var y = window.scrollY; render(); window.scrollTo(0, y);
}
/* ---------- Löschen: eigene Blöcke, Timer-Workouts und eigene Workouts ----------
   Direkt in der Liste über den Mülleimer (mit Rückfrage) oder wie bisher auf der Bearbeiten-Seite. */
function unfav(k){ state.db.settings.favs = (state.db.settings.favs || []).filter(function(x){ return x !== k; }); }
function deleteBlockNow(id){
  state.db.blocks = state.db.blocks.filter(function(x){ return x.id!==id; });
  unfav("bl:"+id);
  state.db.workouts.forEach(function(w){ w.items = w.items.filter(function(it){ return it.blockId!==id; }); });
  save();
}
function deleteTimerWorkoutNow(id){
  state.db.workouts = state.db.workouts.filter(function(x){ return x.id!==id; });
  unfav("tw:"+id);
  save();
}
function deleteMyNow(id){
  state.db.myWorkouts = (state.db.myWorkouts || []).filter(function(x){ return x.id!==id; });
  unfav("my:"+id);
  save();
}
function deleteCustomExNow(id){
  state.db.customEx = (state.db.customEx || []).filter(function(x){ return x.id !== id; });
  (state.db.myWorkouts || []).forEach(function(mw){
    if(Array.isArray(mw.items)) mw.items = mw.items.filter(function(it){ return (it && it.ex || it) !== id; });
  });
  state.db.settings.exFavs = (state.db.settings.exFavs || []).filter(function(x){ return x !== id; });
  save(); syncCustomEx();
}
function trashBtn(kind, id, name){
  var label = t("del")+": "+(name || t("untitled"));
  return '<button type="button" class="trash-btn" data-del="'+kind+':'+id+'" title="'+esc(t("del"))+'" aria-label="'+esc(label)+'">'+ICON_TRASH+'</button>';
}
/* Mülleimer in einer Liste: fragt nach, löscht und zeichnet die Liste neu */
function bindTrash(refresh){
  app.querySelectorAll("[data-del]").forEach(function(el){
    el.addEventListener("click", function(e){
      e.stopPropagation();
      var v = el.getAttribute("data-del"), kind = v.split(":")[0], id = v.slice(kind.length+1);
      if(kind === "bl"){
        var b = findBlock(id); if(!b) return;
        confirmSheet(t("deleteBlockQ"), t("deleteBlockText", { name:b.name }), t("del"), function(){ deleteBlockNow(id); refresh(); showToast(t("deletedToast", { n:b.name })); });
      } else if(kind === "tw"){
        var w = findWorkout(id); if(!w) return;
        confirmSheet(t("deleteWorkoutQ"), "„"+(w.name || t("untitled"))+"“ – "+t("cantUndo"), t("del"), function(){ deleteTimerWorkoutNow(id); refresh(); showToast(t("deletedToast", { n:w.name || t("untitled") })); });
      } else if(kind === "ex"){
        var c = findCustom(id); if(!c) return;
        confirmSheet(t("exDeleteQ"), "„"+c.name+"“ – "+t("exDeleteText"), t("del"), function(){ deleteCustomExNow(id); refresh(); showToast(t("deletedToast", { n:c.name })); });
      } else if(kind === "run"){    // Lauf-Tracker
        var lf = runById(id); if(!lf) return;
        confirmSheet(t("runDelQ"), "„"+runKm(lf.dist)+" km“ – "+t("cantUndo"), t("del"), function(){
          state.db.settings.runs = (state.db.settings.runs || []).filter(function(x){ return x.id !== id; });
          save(); refresh(); showToast(t("deletedToast", { n:runKm(lf.dist)+" km" }));
        });
      } else if(kind === "plan"){   // Studio › Mein Plan
        var pl = stPlanFind(id); if(!pl) return;
        confirmSheet(t("planDelQ"), "„"+pl.name+"“ – "+t("cantUndo"), t("del"), function(){
          state.db.settings.stPlaene = stPlaene().filter(function(x){ return x.id !== id; });
          save(); refresh(); showToast(t("deletedToast", { n:pl.name }));
        });
      } else if(kind === "my"){
        var mw = findMy(id); if(!mw) return;
        confirmSheet(t("myDeleteQ"), "„"+mw.name+"“ – "+t("cantUndo"), t("del"), function(){ deleteMyNow(id); refresh(); showToast(t("deletedToast", { n:mw.name })); });
      }
    });
  });
}
function timerWorkoutRow(w){
  var count = w.items.length;
  return '<div class="list-item entry" data-nav="#workout/'+w.id+'">'+
    '<button class="playbtn bl" data-play="'+w.id+'" '+(count?'':'disabled style="opacity:.3"')+' title="'+t("start")+'" aria-label="'+t("start")+'">'+ICON_PLAY+'</button>'+
    '<div class="meta"><div class="name">'+esc(w.name||t("untitled"))+'</div>'+
    '<div class="sub">'+count+' '+(count===1?t("blockOne"):t("blockMany"))+SEP+fmtDauerKurz(workoutDuration(w))+'</div></div>'+
    '<button type="button" class="plus-btn bearb-btn" data-twedit="'+w.id+'" title="'+esc(t("timerBearbeiten"))+'" aria-label="'+esc(t("timerBearbeiten")+": "+(w.name || t("untitled")))+'">'+svgIcon(ICON_EDIT)+'</button>'+
    favBtn("tw:"+w.id)+trashBtn("tw", w.id, w.name)+'</div>';
}
function blockRow(b){
  return '<div class="list-item entry" data-nav="#block/'+b.id+'">'+
    '<button class="playbtn bl" data-playblock="'+b.id+'" title="'+t("startBlock")+'" aria-label="'+t("startBlock")+'">'+ICON_PLAY+'</button>'+
    '<div class="meta"><div class="name">'+esc(b.name)+'</div>'+
    '<div class="sub">'+blockSpec(b)+SEP+fmtDauerKurz(blockDuration(b))+'</div></div>'+
    favBtn("bl:"+b.id)+trashBtn("bl", b.id, b.name)+'</div>';
}
/* Freies Training ist nur noch das Studio (2026-09-29). Timer-Workouts und Blöcke stehen unter Workouts › Meine. */

