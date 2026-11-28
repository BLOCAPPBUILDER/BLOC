"use strict";
/* ============ BLOC auf der Uhr (Wear OS) ============
   Die Handy-App schickt der Uhr, was sie zum Auswählen braucht: Programm (Play), Favoriten, BLOCs und Katalog (Workout, Mobility & Stretch),
   Timer, dazu die Strichfiguren der Übungen. Weg: BlocUhrPlugin → Wear-OS-Verbindung (Data Layer, Pfad /bloc/uhr) – direkt zwischen
   Handy und Uhr, ohne Konto und ohne Server. Gebaut wird nur in der App; die Uhr wählt aus und startet.
   Zurück kommen eingetragene Sätze (Satz für Satz) und „Training fertig“: die App holt sie beim Öffnen ab, trägt sie beim BLOC und am Tag des Trainings ein
   und speichert es wie „Training speichern“. Auf der Uhr gelöscht wird erst, wenn das hier gesichert ist (bestaetigen).
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

/* Test 17, B: die Werte (Ziel, Gewicht, Pause, zuletzt) gehören zum BLOC – er gilt hier kurz als geöffnet, wie in planPayload */
function uhrMitBloc(p, fn){
  var alt = stPlanAktiv;
  stPlanAktiv = p ? p.id : null;
  try{ return fn(); } finally { stPlanAktiv = alt; }
}
function uhrWorkout(ref, figuren){
  var plan = String(ref).indexOf("plan:") === 0 ? stPlanFind(ref.slice(5)) : null;
  return uhrMitBloc(plan, function(){ return uhrWorkoutBauen(ref, figuren); });
}
/* Tage (ab heute, zwei Wochen), an denen dieser BLOC in einer Leichtwoche steht */
function uhrLeichtTage(planId){
  var l = [], d = new Date();
  for(var i = 0; i < 14; i++){ var k = kalTagKey(kalPlus(d, i)); if(planLeichtAm(planId, k)) l.push(k); }
  return l;
}
function uhrWorkoutBauen(ref, figuren){
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
        var leicht = uhrLeichtTage(p.id), wartendAlt = studioTippsWartend, tipps = studioTipps(stPlanIds(p), planLeichtHeute(p.id), false);
        studioTippsWartend = wartendAlt;
        if(leicht.length) w.leicht = leicht;
        w.uebungen = stPlanIds(p).map(function(id){
          var ex = findExercise(id), z = studioZiel(id), b = studioBereich(id), e = studioEintrag(id) || {}, l = studioLetzte(id, true), koerper = studioNurBlock(ex), zeit = studioNachZeit(id);
          figuren[id] = 1;
          /* schritt/pause/mitKg/zeit: was die Uhr zum Ändern braucht (Test 17, D); tipp: auf dem Handy wartet ein Vorschlag */
          var u = { id:id, name:uhrExName(id), fig:id, saetze:z.saetze, wdh:zeit ? studioTimer(id).work : z.wdh, kg:koerper ? 0 : studioArbeitsKg(id), zuletzt:l ? studioLetzteText(l) : "",
                    schritt:z.schritt, pause:e.pause || (koerper ? 60 : 90), mitKg:koerper ? 0 : 1 };
          if(zeit) u.zeit = 1; else u.ziel = b.min+"–"+b.max;
          if(leicht.length) u.saetzeLeicht = leichtSaetze(z.saetze);
          if(tipps[id]) u.tipp = 1;
          return u;
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

/* Was ein Kalendereintrag startet (wie kalStarten): { ref, pg, i } oder null (Run, Sport, Zufall laufen nicht auf der Uhr) */
function uhrTerminRef(e){
  if(!e || e.art === "sport" || e.art === "run") return null;
  var pg = e.prog ? programmFinde(e.prog.id) : null;
  if(pg && pg.items[e.prog.i]) return uhrRefOk({ ref:pg.items[e.prog.i], pg:pg, i:e.prog.i });
  if(e.art === "programm"){ pg = programmFinde(e.ref); if(!pg || !pg.items.length) return null; var i = (pg.pos || 0) % pg.items.length; return uhrRefOk({ ref:pg.items[i], pg:pg, i:i }); }
  var vor = { plan:"plan:", workout:"my:", lib:"lib:", timer:"tw:" }[e.art];
  return vor ? { ref:vor+e.ref, pg:null, i:-1 } : null;
}
function uhrRefOk(x){ return /^(plan|my|lib|tw):/.test(x.ref) ? x : null; }
/* Heute auf der Uhr = heute auf der Startseite: ein angefangenes Training, sonst der erste offene Termin von heute (Test 17, C) */
function uhrHeute(){
  var offen = trainingOffenInfo();
  if(offen){
    var ref = "plan:"+offen.p.id, l = progSortiert().filter(function(p){ return (p.items || []).indexOf(ref) > -1; })[0];
    return { ref:ref, pg:l || null, i:l ? l.items.indexOf(ref) : -1 };
  }
  var r = null;
  heroHeutige().forEach(function(e){ if(!r) r = uhrTerminRef(e); });
  return r;
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
  // Play: was die Startseite für heute zeigt (Test 17, C); ohne Termin heute der aktive Trainingsplan
  var h = uhrHeute(), hw = h ? uhrWorkout(h.ref, figuren) : null, progs = typeof progSortiert === "function" ? progSortiert() : [];
  if(!hw) h = null;
  var pg = h && h.pg ? h.pg : progs.filter(function(p){ return p.items && p.items.length; })[0];
  if(pg || hw){
    var items = pg ? pg.items : [], i = h ? h.i : -1;
    if(!h && pg && !progAktiv(pg)){ i = (pg.pos || 0) % items.length; hw = uhrWorkout(items[i], figuren); }   // Plan ohne Termine im Kalender: weiter mit dem nächsten Eintrag
    d.programm = { name:pg ? pg.name : hw.name, info:pg ? t(items.length === 1 ? "progMeta1" : "progMeta", { n:items.length }) : hw.info, tag:kalTagKey(Date.now()), tage:[] };
    if(hw) d.programm.heute = hw;
    items.forEach(function(ref, k){
      if(hw && k === i) return;
      var w = uhrWorkout(ref, figuren);
      if(w) d.programm.tage.push({ name:(k + 1)+" · "+w.name, info:w.info, w:w });
    });
    // die nächsten Tage: bleibt die App zu, zeigt die Uhr morgen trotzdem den richtigen BLOC
    d.programm.termine = [];
    var eigene = {}, heuteD = new Date();
    for(var n = 1; n < 14; n++){
      var key = kalTagKey(kalPlus(heuteD, n)), st = kalStatus(key), tw = null;
      kalAn(key).forEach(function(e){ if(tw || st[e.id]) return; var x = uhrTerminRef(e); if(x) tw = eigene[x.ref] || (eigene[x.ref] = uhrWorkout(x.ref, figuren)); });
      if(tw) d.programm.termine.push({ tag:key, id:tw.id });
    }
    d.programm.vorrat = Object.keys(eigene).map(function(r){ return eigene[r]; }).filter(Boolean);
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

/* ---------- Sätze von der Uhr (Test 17, A) ----------
   Ein Satz von der Uhr: { workout, uebung, name, satz, wdh, kg, at, sid, zeit }; „Training fertig“: { art:"fertig", workout, sid, at }.
   sid = ein Training auf der Uhr (ältere Uhr-Fassung ohne sid: BLOC und Tag). Die Sätze kommen in Runden am Tag des Trainings (l.at) beim richtigen BLOC (l.b), l.uhr = sid.
   Gespeichert wird das Training (settings.einheiten, x.uhr = sid) mit „fertig“, wenn alle Ziel-Sätze drin sind oder 45 Minuten kein Satz mehr kam; sonst bleibt es offen („Training fortsetzen“).
   Derselbe Satz (workout + uebung + satz + at) kommt höchstens einmal; kommt er mit anderen Werten, wurde er auf der Uhr korrigiert.
   settings.uhrEin = [[Schlüssel, kg, wdh, sid, at] …] (schon übernommen), settings.uhrRest = Sätze, deren Übung es hier (noch) nicht gibt. */
var UHR_FERTIG_MS = 45*60000, UHR_EIN_MAX = 400;
function uhrPlan(ref){ return String(ref || "").indexOf("plan:") === 0 ? stPlanFind(String(ref).slice(5)) : null; }
function uhrSatzKey(s){ return [s.workout, s.uebung, s.satz, s.at].join("|"); }
function uhrSatzSauber(o){
  var at = Math.round(+o.at), jetzt = Date.now();
  if(!(at > 0 && at <= jetzt + 300000)) at = jetzt;
  return { workout:String(o.workout || ""), uebung:String(o.uebung || ""), satz:Math.round(+o.satz) || 0, zeit:!!o.zeit,
           kg:Math.max(0, Math.min(500, Math.round((+o.kg || 0)*100)/100)), wdh:Math.max(1, Math.min(o.zeit ? 3600 : 100, Math.round(+o.wdh) || 1)),
           at:at, sid:String(o.sid || (String(o.workout || "")+"|"+kalTagKey(at))) };
}
/* alle Runden eines Uhr-Trainings: [{ id, l }] in der Reihenfolge des Trainings */
function uhrRunden(sid){
  var r = [], alle = studioAlle();
  Object.keys(alle).forEach(function(id){ ((alle[id] && alle[id].log) || []).forEach(function(l){ if(l && l.uhr === sid && (l.s || []).length) r.push({ id:id, l:l }); }); });
  return r.sort(function(a, b){ return a.l.at - b.l.at; });
}
function uhrEinheit(sid){ var g = null; einheitenListe().forEach(function(x){ if(x && x.uhr === sid) g = x; }); return g; }
/* Das Arbeitsgewicht folgt dem Training wie auf der Satzkarte – aber nur im BLOC des Trainings, und nur wenn seitdem nichts Neueres war */
function uhrKgSetzen(id, l, p){
  uhrMitBloc(p, function(){
    var en = studioSchreib(id), neuer = ((studioEintrag(id) || {}).log || []).some(function(x){ return x !== l && x.at > l.at && (x.s || []).length; });
    if(!neuer && !(en.manuell > l.letzte) && !(en.erhoeht > l.letzte)){ var ak = rundeArbeitsKg(l); if(ak != null) en.kg = ak; }
    en.zuletzt = Math.max(en.zuletzt || 0, l.letzte);
  });
}
function uhrSatzEintragen(s){
  var p = uhrPlan(s.workout), b = p ? p.id : null, g = studioAlle()[s.uebung] || (studioAlle()[s.uebung] = { log:[] }), log = g.log || (g.log = []);
  var l = log.filter(function(x){ return x.uhr === s.sid; })[0], x = uhrEinheit(s.sid);
  if(!l && !x){   // auf dem Handy angefangen, auf der Uhr weiter: dieselbe offene Runde
    var o = log.filter(function(q){ return !q.zu && !q.uhr && (q.b || null) === b && q.letzte && studioTag(q.at) === studioTag(s.at) && Math.abs(s.at - q.letzte) < RUNDE_OFFEN_MS; }).pop();
    if(o){ l = o; l.uhr = s.sid; }
  }
  if(!l){
    l = { at:s.at, s:[], letzte:s.at, uhr:s.sid };
    if(b) l.b = b;
    var kgVor = uhrMitBloc(p, function(){ var e = studioEintrag(s.uebung); return e ? e.kg : undefined; });
    if(kgVor !== undefined) l.kgVor = kgVor;
    if(b && planLeichtAm(b, kalTagKey(s.at))) l.leicht = true;
    if(x){ l.zu = true; l.zuAt = x.zuAt; }   // Nachzügler zu einem schon gespeicherten Training
    var i = log.length; while(i > 0 && log[i-1].at > s.at) i--;   // das Protokoll bleibt zeitlich sortiert
    log.splice(i, 0, l);
  }
  l.s.push(s.zeit ? [s.kg, s.wdh, "n", 0, 1] : [s.kg, s.wdh]);
  l.letzte = Math.max(l.letzte || 0, s.at); l.uhrBis = Math.max(l.uhrBis || 0, s.at);
  uhrKgSetzen(s.uebung, l, p);
}
/* Auf der Uhr korrigiert: der zuletzt übernommene Wert wird ersetzt (wurde er inzwischen auf dem Handy geändert, gilt das Handy) */
function uhrSatzKorrigieren(alt, s){
  var l = ((studioAlle()[s.uebung] || {}).log || []).filter(function(x){ return x.uhr === s.sid; })[0], treffer = null;
  if(l) l.s.forEach(function(q){ if(q[0] === alt[1] && q[1] === alt[2]) treffer = q; });
  alt[1] = s.kg; alt[2] = s.wdh;
  if(!treffer) return false;
  treffer[0] = s.kg; treffer[1] = s.wdh;
  uhrKgSetzen(s.uebung, l, uhrPlan(s.workout));
  return true;
}
/* Wochenzeile und Statistik: ein Verlaufseintrag je Uhr-Training, am Tag des Trainings; mit dem Handy angefangen wird verlängert */
function uhrVerlauf(sid, von, bis, ids){
  var hs = state.db.history || (state.db.history = []), zu = +state.db.settings.rundeZu || 0, e = hs.filter(function(h){ return h && h.uhr === sid; })[0];
  if(!e) e = hs.filter(function(h){ return h && h.studio && !h.uhr && studioTag(h.studio) === studioTag(von) && !(h.studio < zu && von > zu) && !(h.studio > zu && von < zu) &&
    von <= h.studio + (h.dur || 60)*1000 + STUDIO_LUECKE && bis >= h.studio - STUDIO_LUECKE; }).pop();
  if(!e){ e = { at:von, ex:[], dur:0, studio:von, b:"timer" }; hs.push(e); }
  var ende = Math.max(bis, e.studio + Math.max(0, (e.dur || 60) - 60)*1000);
  e.uhr = sid; e.studio = Math.min(e.studio, von); e.at = Math.min(e.at, von);
  ids.forEach(function(id){ if(e.ex.indexOf(id) < 0) e.ex.push(id); });
  e.dur = Math.round((ende - e.studio)/1000) + 60;
  hs.sort(function(a, q){ return (a.at || 0) - (q.at || 0); });
}
/* Alle Ziel-Sätze des BLOCs geschafft? (Leichtwoche: deren Satzzahl) */
function uhrAllesDrin(p, runden){
  if(!p) return false;
  var n = {}, leicht = runden.some(function(r){ return r.l.leicht; });
  runden.forEach(function(r){ n[r.id] = (n[r.id] || 0) + arbeitsSaetze(r.l).length; });
  return uhrMitBloc(p, function(){ return stPlanIds(p).every(function(id){ var z = studioZiel(id).saetze; return (n[id] || 0) >= (leicht ? leichtSaetze(z) : z); }); });
}
/* Der Termin im Kalender, zu dem das Training gehört (Tag des Trainings, passender BLOC) */
function uhrTermin(x){
  var st = kalStatus(x.tag), l = kalAn(x.tag).filter(function(e){ return x.plan && ["workout", "lib", "timer", "zufall"].indexOf(e.art) < 0 && kalTerminPasst(e, x.plan); });
  function genau(e){ var pg = e.prog ? programmFinde(e.prog.id) : null; return pg && pg.items[e.prog.i] === "plan:"+x.plan ? 0 : 1; }
  return l.filter(function(e){ return !st[e.id]; }).sort(function(a, b){ return genau(a) - genau(b); })[0] || null;
}
/* Wie „Training speichern“ – am Tag des Trainings. Ein schon gespeichertes Uhr-Training wird neu gerechnet (Nachzügler, Korrektur). Liefert nur ein neues. */
function uhrSpeichern(sid){
  var r = uhrRunden(sid);
  if(!r.length) return null;
  var b = r[0].l.b || "", p = b ? stPlanFind(b) : null, tag = studioTag(r[0].l.at), x = uhrEinheit(sid), neu = !x;
  if(neu && b){   // auf dem Handy begonnene Übungen desselben Trainings gehören dazu
    Object.keys(studioAlle()).forEach(function(id){ ((studioAlle()[id] || {}).log || []).forEach(function(l){ if(!l.zu && !l.uhr && l.letzte && l.b === b && studioTag(l.at) === tag && (l.s || []).length) l.uhr = sid; }); });
    r = uhrRunden(sid);
  }
  var von = Math.min.apply(null, r.map(function(q){ return q.l.at; })), bis = Math.max.apply(null, r.map(function(q){ return q.l.letzte || q.l.at; }));
  if(neu) x = { id:uid(), tag:einheitTagKey(von), plan:b, uhr:sid };
  x.name = p ? p.name : x.name || ""; x.ex = []; x.saetze = 0; x.vol = 0; x.wdh = 0; x.rek = 0;
  r.forEach(function(q){
    var g = studioEintragAlle(q.id), i = g.log.indexOf(q.l), vor = studioBestwerteGesamt(q.id, g.log, i);
    var rekord = (i > 0 || !!g.best) && !studioAssistiert(q.id) && !q.l.leicht && studioIstRekord(studioBestwerte([q.l]), vor), a = x.ex.filter(function(y){ return y.id === q.id; })[0];
    if(a){ a.s = a.s.concat(JSON.parse(JSON.stringify(q.l.s))); a.rekord = a.rekord || rekord; }
    else x.ex.push({ id:q.id, s:JSON.parse(JSON.stringify(q.l.s)), rekord:rekord });
    x.saetze += arbeitsSaetze(q.l).length; x.vol += studioVolumen(q.l, q.id); x.wdh += studioWdhSumme(q.l); if(rekord) x.rek++;
    if(!q.l.zu){ q.l.zu = true; q.l.zuAt = bis; }
  });
  x.vol = Math.round(x.vol); x.dauer = Math.round((bis - von)/1000) + 60; x.at = bis; x.zu = true; x.zuAt = bis;
  uhrVerlauf(sid, von, bis, r.map(function(q){ return q.id; }));
  r.forEach(function(q){ studioLogKuerzen(studioEintragAlle(q.id)); });
  if(studioTag(bis) === studioTag(Date.now())) state.db.settings.rundeZu = Math.max(+state.db.settings.rundeZu || 0, bis);   // weitere Sätze heute sind ein neues Training
  var l = einheitenListe();
  if(neu){
    var pr = einheitProg(x), te = uhrTermin(x);
    if(te){ x.termin = te.id; if(te.prog) pr = te.prog.id; }
    if(pr) x.prog = pr;
    l.push(x);
    if(te && kalTerminAktiv && kalTerminAktiv.id === te.id) kalTerminAktiv = null;
    if(l.length > 1000) l.splice(0, l.length - 1000);
  }
  l.sort(function(q, w){ return (q.at || 0) - (w.at || 0); });
  return neu ? x : null;
}
/* Nachrichten der Uhr (JSON-Texte) übernehmen: { n:Sätze, korrigiert, trainings:[neu gespeicherte], rest:Sätze ohne passende Übung } */
function uhrUebernehmen(texte){
  var s = state.db.settings, ein = Array.isArray(s.uhrEin) ? s.uhrEin : (s.uhrEin = []), saetze = [], fertig = {}, beruehrt = {}, rest = [], erg = { n:0, korrigiert:0, trainings:[], rest:0 };
  var altRest = Array.isArray(s.uhrRest) ? s.uhrRest : [];
  altRest.concat(texte || []).forEach(function(txt){
    var o; try{ o = typeof txt === "string" ? JSON.parse(txt) : txt; }catch(e){ return; }
    if(!o || typeof o !== "object") return;
    if(o.art === "fertig"){ var f = uhrSatzSauber(o); fertig[f.sid] = f.at; return; }
    if(!o.uebung) return;
    saetze.push({ o:o, x:uhrSatzSauber(o) });
  });
  saetze.sort(function(a, b){ return a.x.at - b.x.at || a.x.satz - b.x.satz; });
  saetze.forEach(function(q){
    var x = q.x, key = uhrSatzKey(x), da = ein.filter(function(y){ return y[0] === key; })[0];
    if(!findExercise(x.uebung)){   // Übung gibt es hier nicht (mehr): aufheben, nicht verlieren
      var vorh = rest.map(function(y){ return uhrSatzKey(uhrSatzSauber(y)); }).indexOf(key);
      if(vorh > -1) rest[vorh] = q.o; else rest.push(q.o);
      return;
    }
    if(da){
      if(da[1] === x.kg && da[2] === x.wdh) return;   // doppelt geliefert
      if(uhrSatzKorrigieren(da, x)){ erg.korrigiert++; beruehrt[x.sid] = Math.max(beruehrt[x.sid] || 0, x.at); }
      return;
    }
    uhrSatzEintragen(x);
    ein.push([key, x.kg, x.wdh, x.sid, x.at]);
    beruehrt[x.sid] = Math.max(beruehrt[x.sid] || 0, x.at);
    erg.n++;
  });
  if(ein.length > UHR_EIN_MAX) ein.splice(0, ein.length - UHR_EIN_MAX);
  erg.rest = Math.max(0, rest.length - altRest.length);
  if(rest.length) s.uhrRest = rest.slice(-200); else delete s.uhrRest;
  /* Welche Uhr-Trainings sind zu Ende? Auch früher übernommene, die noch offen sind */
  var offen = {};
  Object.keys(studioAlle()).forEach(function(id){ ((studioAlle()[id] || {}).log || []).forEach(function(l){ if(l && l.uhr && !l.zu && (l.s || []).length) offen[l.uhr] = 1; }); });
  Object.keys(beruehrt).concat(Object.keys(offen), Object.keys(fertig)).filter(function(sid, i, l){ return l.indexOf(sid) === i; }).forEach(function(sid){
    var r = uhrRunden(sid);
    if(!r.length) return;
    var von = Math.min.apply(null, r.map(function(q){ return q.l.at; })), bis = Math.max.apply(null, r.map(function(q){ return q.l.letzte || q.l.at; })), p = r[0].l.b ? stPlanFind(r[0].l.b) : null;
    var handy = r.some(function(q){ return (q.l.letzte || 0) > (q.l.uhrBis || 0); });   // auf dem Handy weitertrainiert: dann speichert das Handy
    if(uhrEinheit(sid)){ if(beruehrt[sid]) uhrSpeichern(sid); return; }
    if(fertig[sid] || (!handy && (uhrAllesDrin(p, r) || Date.now() - bis > UHR_FERTIG_MS))){ var x = uhrSpeichern(sid); if(x) erg.trainings.push(x); }
    else if(beruehrt[sid]) uhrVerlauf(sid, von, bis, r.map(function(q){ return q.id; }));
  });
  return erg;
}
/* Sätze, die auf der Uhr eingetragen wurden, abholen und übernehmen; erst danach darf die Uhr-Verbindung sie löschen */
function uhrSaetzeAbholen(){
  if(!IST_NATIV) return Promise.resolve(null);
  var pl = nativPlugin("BlocUhr");
  if(!pl) return Promise.resolve(null);
  return pl.abholen().then(function(r){
    var l = (r && r.saetze) || [], uris = (r && r.uris) || [], erg = uhrUebernehmen(l);
    if(save() === false) return erg;   // Speicher voll: auf der Uhr liegen lassen
    if(l.length && typeof pl.bestaetigen === "function") pl.bestaetigen({ eintraege:l.map(function(j, i){ return { uri:uris[i] || "", json:j }; }) }).catch(function(){});
    if(erg.trainings.length){ var x = erg.trainings[erg.trainings.length-1]; showToast(t("uhrTraining", { n:x.name || t("trFrei"), d:kalTagText(x.tag) })); }
    else if(erg.n) showToast(erg.n === 1 ? t("uhrSaetze1") : t("uhrSaetze", { n:erg.n }));
    else if(erg.rest) showToast(t("uhrUnbekannt", { n:erg.rest }));
    if(erg.n || erg.korrigiert || erg.trainings.length){   // Startseite und Kalender zeigen es gleich
      var seite = parseHash()[0] || "home", ov = document.getElementById("overlayRoot");
      if(["home", "kalender", "stats"].indexOf(seite) > -1 && !(ov && ov.innerHTML)){ var y = window.scrollY; render(); window.scrollTo(0, y); }
    }
    return erg;
  }).catch(function(e){ console.error("BLOC: Sätze von der Uhr", e); return null; });
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
    if(!pl || typeof pl.addListener !== "function") return;
    pl.addListener("uhrBefehl", function(d){ uhrBefehl(d && d.befehl); });
    pl.addListener("uhrSatz", function(){ uhrSaetzeAbholen(); });   // neue Sätze, während die App offen ist
  })();
}
