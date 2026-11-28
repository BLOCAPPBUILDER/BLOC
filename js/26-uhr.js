"use strict";
/* ============ BLOC auf der Uhr (Wear OS) ============
   Die Handy-App schickt der Uhr, was sie zum Auswählen braucht: Programm (Play), Favoriten, BLOCs und Katalog (Workout, Mobility & Stretch),
   Timer, dazu die Strichfiguren der Übungen. Weg: BlocUhrPlugin → Wear-OS-Verbindung (Data Layer, Pfad /bloc/uhr) – direkt zwischen
   Handy und Uhr, ohne Konto und ohne Server. Gebaut wird nur in der App; die Uhr wählt aus und startet.
   Zurück kommen eingetragene Sätze (Satz für Satz): die App holt sie beim Öffnen ab und trägt sie ein wie auf der Übungskarte.
   Nur in der Android-App; im Browser passiert hier nichts. */
var uhrSyncTimer = 0, uhrLetztesJson = "", uhrBautGerade = false;

function uhrExName(id){ var ex = findExercise(id); return ex ? tplText(ex.name) : ""; }

/* Timer-Schritte wie im Player (buildSteps), schlank für die Uhr */
function uhrSchritte(run){
  var st = buildSteps(run), out = [];
  st.forEach(function(s){
    var ph = s.phase === "blockrest" ? "rest" : s.phase;
    out.push({ ph:ph, d:Math.round(s.duration || 0), name:s.ex ? uhrExName(s.ex) : "", fig:s.ex || "", block:s.blockName || "",
               r:s.rep || 1, n:s.totalReps || 1 });
  });
  return out;
}

function uhrWorkout(ref, figuren){
  try{
    var o = kalAufloesen(progEintrag(ref));
    if(!o.ok) return null;
    var w = { id:ref, name:o.name, info:o.sub || "" }, run = null;
    if(ref.indexOf("plan:") === 0){
      var p = stPlanFind(ref.slice(5));
      if(!p) return null;
      if(planStartArt(p) === "timer"){   // wie planMw, aber ohne zu speichern (die Uhr darf nichts verändern)
        var vorh = (state.db.myWorkouts || []).filter(function(x){ return x.fromPlan === p.id; })[0];
        run = myRun(vorh || { id:"uhr-"+p.id, name:p.name, mode:"individual", reps:6, work:30, rest:10,
                              blockRest:p.blockRest != null ? p.blockRest : 45, items:planMitItems(p) });
      }
      else {
        w.art = "saetze";
        w.uebungen = stPlanIds(p).map(function(id){
          var z = studioZiel(id), e = studioEintrag(id) || {}, l = studioLetzte(id, true);
          figuren[id] = 1;
          return { id:id, name:uhrExName(id), fig:id, saetze:z.saetze, wdh:z.wdh, kg:e.kg || 0, zuletzt:l ? studioLetzteText(l) : "" };
        });
        return w;
      }
    }
    else if(ref.indexOf("my:") === 0){ var mw = findMy(ref.slice(3)); if(mw) run = myRun(mw); }
    else if(ref.indexOf("lib:") === 0){ var lw = findLibWorkout(ref.slice(4)); if(lw) run = libWorkoutRun(lw); }
    else if(ref.indexOf("tw:") === 0){ run = findWorkout(ref.slice(3)); }
    if(!run || !run.items) return null;
    w.art = "timer";
    w.schritte = uhrSchritte(run);
    w.schritte.forEach(function(s){ if(s.fig) figuren[s.fig] = 1; });
    return w;
  }catch(e){ return null; }
}

function uhrDaten(){
  var figuren = {}, gesehen = {};
  function liste(refs){ return refs.map(function(r){ return uhrWorkout(r, figuren); }).filter(Boolean); }
  var lw = pgListen("workout"), lm = pgListen("mobility"), ls = pgListen("stretch");
  var favRefs = [];
  [lw, lm, ls].forEach(function(l){ l.favs.forEach(function(r){ if(!gesehen[r]){ gesehen[r] = 1; favRefs.push(r); } }); });
  function katalog(l){ var r = []; l.katalog.forEach(function(g){ r = r.concat(g.refs); }); return r.slice(0, 40); }
  var d = {
    v:1,
    hfmax:(typeof runHrMax === "function" && runHrMax()) ? Math.round(runHrMax()) : 190,
    favoriten:liste(favRefs),
    workout:{ blocs:liste(lw.blocs), katalog:liste(katalog(lw)) },
    mobility:{ blocs:liste(lm.blocs.concat(ls.blocs)), katalog:liste(katalog(lm).concat(katalog(ls))) },
    timer:liste((state.db.workouts || []).filter(function(x){ return x.items && x.items.length; }).map(function(x){ return "tw:"+x.id; }))
  };
  // Play: aktiver Trainingsplan (sonst der erste), heute = nächster Eintrag
  var progs = typeof progSortiert === "function" ? progSortiert() : [];
  var pg = progs.filter(function(p){ return p.items && p.items.length; })[0];
  if(pg){
    var i = (pg.pos || 0) % pg.items.length;
    d.programm = { name:pg.name, info:t("progMeta", { n:pg.items.length }), heute:uhrWorkout(pg.items[i], figuren), tage:[] };
    pg.items.forEach(function(ref, k){
      if(k === i) return;
      var w = uhrWorkout(ref, figuren);
      if(w) d.programm.tage.push({ name:(k + 1)+" · "+w.name, info:w.info, w:w });
    });
    if(!d.programm.heute) delete d.programm.heute;
  }
  d.figuren = {};
  function schlank(s){ return s ? s.replace(/<mask[\s\S]*?<\/mask>/g, "").replace(/ mask="[^"]*"/g, "") : null; }   // Masken braucht die Uhr nicht
  Object.keys(figuren).forEach(function(id){ if(ILLU_POSES[id] && ILLU[id]) d.figuren[id] = [schlank(ILLU[id][0]), schlank(ILLU[id][1])]; });
  return d;
}

/* Nach Änderungen (gebündelt) an die Uhr schicken; gleiche Daten werden nicht erneut geschickt */
function uhrSync(sofort){
  if(!IST_NATIV) return;
  clearTimeout(uhrSyncTimer);
  uhrSyncTimer = setTimeout(function(){
    var pl = nativPlugin("BlocUhr");
    if(!pl) return;
    var json;
    uhrBautGerade = true;
    try{ json = JSON.stringify(uhrDaten()); }catch(e){ json = ""; }
    uhrBautGerade = false;
    if(!json) return;
    if(json === uhrLetztesJson) return;
    uhrLetztesJson = json;
    pl.senden({ json:json }).catch(function(){ uhrLetztesJson = ""; });
  }, sofort ? 300 : 3000);
}

/* Sätze, die auf der Uhr eingetragen wurden, übernehmen (wie auf der Übungskarte) */
function uhrSaetzeAbholen(){
  if(!IST_NATIV) return;
  var pl = nativPlugin("BlocUhr");
  if(!pl) return;
  pl.abholen().then(function(r){
    var l = (r && r.saetze) || [], n = 0;
    l.forEach(function(txt){
      try{
        var s = JSON.parse(txt);
        if(!s.uebung || !findExercise(s.uebung)) return;
        studioSatzLog(s.uebung, Number(s.kg) || 0, Number(s.wdh) || 0);
        n++;
      }catch(e){}
    });
    if(n && typeof showToast === "function") showToast(t("uhrSaetze", { n:n }));
  }).catch(function(){});
}

if(IST_NATIV){
  /* save() umhüllen: jede gespeicherte Änderung (Favoriten, BLOCs, Programme, Timer) erreicht die Uhr */
  var uhrSaveOrig = save;
  save = function(){ var r = uhrSaveOrig.apply(this, arguments); if(!uhrBautGerade) uhrSync(false); return r; };
  speichereDB = save;
  document.addEventListener("visibilitychange", function(){ if(!document.hidden){ uhrSaetzeAbholen(); uhrSync(true); } });
  setTimeout(function(){ uhrSaetzeAbholen(); uhrSync(true); }, 2500);
}

/* ---------- Lauf: Uhr als Anzeige und Fernbedienung (Variante A) ----------
   Das Handy misst GPS, Strecke und Tempo; die Uhr zeigt Zeit, km und Pace live und steuert Start, Pause/Weiter, Stopp (speichern) und Abbrechen.
   Nachrichten gehen nur, solange ein Lauf vorbereitet wird oder läuft (und einmal am Ende). */
var uhrLaufAktiv = false, uhrLaufLetzt = 0;
function uhrLaufStand(){
  if(typeof runVor !== "undefined" && runVor) return { lauf:1, vor:Math.max(1, Math.ceil((runVor.ende - Date.now())/1000)) };
  if(typeof run === "undefined" || !run) return null;
  var r = run, sek = runZeit(r)/1000;
  return { lauf:1, pause:!!r.pauseAb, auto:!!r.auto, ms:Math.round(runZeit(r)), km:runKm(r.dist),
           pace:r.verlauf && r.verlauf.length > 1 ? runTempoJetzt(r) : runTempo(r, sek, r.dist), einheit:runTempoEinheit(r),
           gps:r.fehler ? 0 : 1 };
}
function uhrLaufSenden(ende){
  if(!IST_NATIV) return;
  var pl = nativPlugin("BlocUhr");
  if(!pl || typeof pl.laufLive !== "function") return;
  var s = ende ? { lauf:0, gespeichert:ende === "gespeichert" } : uhrLaufStand();
  if(!s){ if(uhrLaufAktiv){ uhrLaufAktiv = false; pl.laufLive({ json:JSON.stringify({ lauf:0 }) }).catch(function(){}); } return; }
  uhrLaufAktiv = s.lauf === 1;
  uhrLaufLetzt = Date.now();
  pl.laufLive({ json:JSON.stringify(s) }).catch(function(){});
}
/* Befehle von der Uhr */
function uhrBefehl(b){
  try{
    if(b === "start"){
      if((typeof run !== "undefined" && run) || (typeof runVor !== "undefined" && runVor)){ uhrLaufSenden(); return; }
      if(location.hash.indexOf("#run") !== 0) go("#run");
      setTimeout(function(){ runStart(); uhrLaufSenden(); }, 300);
      return;
    }
    if(b === "pause" && run && !run.pauseAb) runPause();
    else if(b === "weiter" && run && run.pauseAb) runPause();
    else if(b === "stopp" && run){ runBeenden(true); uhrLaufSenden("gespeichert"); return; }
    else if(b === "abbrechen"){
      if(runVor){ runVorStop(); runWachen(false); renderRun(); }
      else if(run) runBeenden(false);
      uhrLaufSenden("verworfen");
      return;
    }
    uhrLaufSenden();
  }catch(e){}
}
if(IST_NATIV){
  setInterval(function(){ if(uhrLaufStand() || uhrLaufAktiv) uhrLaufSenden(); }, 2000);
  (function(){
    var pl = nativPlugin("BlocUhr");
    if(pl && typeof pl.addListener === "function") pl.addListener("uhrBefehl", function(d){ uhrBefehl(d && d.befehl); });
  })();
}
