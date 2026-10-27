"use strict";
/* ============ Eigene Übung anlegen / bearbeiten ============ */
var exEditVorgabe = null;   // Vorgaben für eine neue eigene Übung (z. B. aus dem Studio: Ausrüstung Fitnessstudio)
function renderExEdit(id){
  var isNew = id === "new";
  var c = isNew ? null : findCustom(id);
  if(!isNew && !c){ goBack("#library"); return; }
  // Entwurf nur im Speicher, bis „Speichern“ getippt wird
  var d = c ? JSON.parse(JSON.stringify(c)) : Object.assign({ name:"", cats:[], equip:["none"], perSide:false, reps:4, work:30, rest:15, hint:"" }, exEditVorgabe || {});
  exEditVorgabe = null;
  function draw(){
    app.innerHTML =
      topbar(t(isNew ? "exNewTitle" : "exEditTitle"), { back:"#library" }) +
      '<div class="card">'+
        '<label for="x-name">'+t("exName")+'</label>'+
        '<input type="text" id="x-name" value="'+esc(d.name)+'" maxlength="40" placeholder="'+esc(t("exName"))+'">'+
        '<label>'+t("exFocus")+' <span class="lbl-hint">'+esc(t("exFocusHint"))+'</span></label>'+
        '<div class="sp-chips">'+LIB_CATS.map(function(cc){
          return '<button type="button" class="lib-chip'+(d.cats.indexOf(cc.id)>-1?' active':'')+'" data-xcat="'+cc.id+'" aria-pressed="'+(d.cats.indexOf(cc.id)>-1)+'">'+catIcon(cc.id)+esc(tplText(cc))+'</button>';
        }).join("")+'</div>'+
        '<label>'+t("exEquip")+'</label>'+
        '<div class="sp-chips">'+EQUIPS.map(function(e){
          return '<button type="button" class="lib-chip'+(d.equip.indexOf(e.id)>-1?' active':'')+'" data-xequip="'+e.id+'" aria-pressed="'+(d.equip.indexOf(e.id)>-1)+'">'+svgIcon(EQUIP_ICON[e.id])+esc(tplText(e))+'</button>';
        }).join("")+'</div>'+
      '</div>'+
      '<div class="card">'+
        toggleRow("x-side", t("exPerSide"), t("exPerSideDesc"), d.perSide)+
        '<label>'+t("exReco")+'</label>'+
        '<div class="tm-grid"><div><label>'+t("tmReps")+'</label>'+stepperHTML("x-reps", d.reps, 1, 30, 1)+'</div>'+
        '<div><label>'+t("tmWork")+'</label>'+stepperHTML("x-work", d.work, 5, 600, 5)+'</div>'+
        '<div><label>'+t("tmRest")+'</label>'+stepperHTML("x-rest", d.rest, 0, 300, 5)+'</div></div>'+
        '<label for="x-hint">'+t("exHint")+'</label>'+
        '<input type="text" id="x-hint" value="'+esc(d.hint||"")+'" maxlength="80" placeholder="'+esc(t("exHintPh"))+'">'+
      '</div>'+
      '<button class="btn btn-primary" data-xsave>'+ICON_SAVE+' '+t("exSave")+'</button>'+
      (isNew ? '' : '<button class="btn btn-danger" data-xdel>'+ICON_TRASH+' '+t("exDelete")+'</button>')+
      '<div style="height:60px"></div>';
    bindCommon();
    var nameIn = app.querySelector("#x-name"), hintIn = app.querySelector("#x-hint");
    nameIn.addEventListener("input", function(){ d.name = nameIn.value; });
    hintIn.addEventListener("input", function(){ d.hint = hintIn.value; });
    function lesen(){
      d.reps = parseInt(app.querySelector("#x-reps").value)||1;
      d.work = parseInt(app.querySelector("#x-work").value)||5;
      d.rest = parseInt(app.querySelector("#x-rest").value)||0;
    }
    bindSteppers(app.querySelector(".tm-grid"), lesen);
    bindToggle("x-side", function(v){ d.perSide = v; });
    app.querySelectorAll("[data-xcat]").forEach(function(b){ b.addEventListener("click", function(){
      lesen(); d.cats = selToggle(d.cats, b.getAttribute("data-xcat")); var y = window.scrollY; draw(); window.scrollTo(0, y);
    }); });
    app.querySelectorAll("[data-xequip]").forEach(function(b){ b.addEventListener("click", function(){
      lesen(); d.equip = selToggle(d.equip, b.getAttribute("data-xequip")); var y = window.scrollY; draw(); window.scrollTo(0, y);
    }); });
    app.querySelector("[data-xsave]").addEventListener("click", function(){
      lesen();
      d.name = (d.name || "").trim();
      if(!d.name){ showToast(t("exNameMissing")); nameIn.focus(); return; }
      d.hint = (d.hint || "").trim();
      if(!state.db.customEx) state.db.customEx = [];
      if(isNew){ d.id = "my-"+uid(); state.db.customEx.push(d); }
      else {
        for(var i=0;i<state.db.customEx.length;i++) if(state.db.customEx[i].id===id) state.db.customEx[i] = d;
      }
      save(); syncCustomEx();
      showToast(t("exSaved"));
      goBack("#library");
    });
    var del = app.querySelector("[data-xdel]");
    if(del) del.addEventListener("click", function(){
      confirmSheet(t("exDeleteQ"), t("exDeleteText"), t("del"), function(){
        deleteCustomExNow(id);
        goBack("#library");
      });
    });
  }
  draw();
}

/* ============ Kurzes Trainings-Gedächtnis ============ */
/* Kein Verlauf und keine Statistik mehr (Kalender, Streak & Co. wurden entfernt). Gemerkt werden
   nur die Übungen der letzten Tage, damit „Überrasch mich“ sie meiden kann, und die Dauer für die
   schlanke Wochenzeile auf der Startseite:
   state.db.history = [{ at, ex:[Übungs-IDs], dur:Sekunden }], ältere Einträge als 14 Tage fallen weg. */
function bereichVonQuelle(src){
  var ty = src && src.type;
  if(ty === "studio") return "timer";
  if(ty === "workout" || ty === "block") return "intervall";   // eigene Timer-Workouts und Blöcke
  if(ty === "libworkout"){ var lw = findLibWorkout(src.id); return libIstWarmDehn(lw) ? "warm" : "lib"; }
  if(ty === "mine"){ var mw = (state.db.myWorkouts || []).filter(function(x){ return x.id === src.id; })[0]; return mw && (mw.ws === "warm" || mw.ws === "dehn") ? "warm" : "lib"; }
  if(ty === "exercise") return exIsMobility(src.id) ? "warm" : "lib";
  return "lib";
}
/* Wochensummen für die Statistik: Einträge, die aus dem Kurz-Verlauf fallen, wandern als Summe in settings.statW[Montag] = { bn, bs, a:{ bereich:{ n, s } } } (über Jahre) -
   so bleibt der Fortschritt über Monate sichtbar, ohne einzelne Trainings aufzubewahren. Nur lokal. */
function logHistory(partial){
  if(!playerState || playerState.logged) return;
  var steps = playerState.steps, idx = playerState.idx, ex = [], work = 0, dur = 0;
  steps.slice(0, idx+1).forEach(function(st, i){
    if(i < idx || st.phase === "done") dur += st.duration || 0;
    if(st.phase!=="work" || !st.ex) return;
    work += st.duration;
    if(ex.indexOf(st.ex) < 0) ex.push(st.ex);
  });
  if(partial && work < 60) return;   // kurz reingeschnuppert zählt nicht
  playerState.logged = true;
  pruneHistory(state.db);
  state.db.history.push({ at:Date.now(), ex:ex, dur:dur, b:bereichVonQuelle(playerState.source) });
  save();
}
/* Übungen der letzten n Tage (für den Generator) */
/* Wochenzeile: welche Tage (Mo–So) trainiert, wie oft und wie lange - ohne Statistik, nur ein Blick */
function wocheDaten(basis){   // basis: ein Tag der gewünschten Woche (Voreinstellung: heute)
  var d = basis ? new Date(basis) : new Date(); d.setHours(0, 0, 0, 0);
  var start = d.getTime() - ((d.getDay() + 6) % 7)*86400000;   // Montag 0:00
  var tage = [0,0,0,0,0,0,0], n = 0, sek = 0;
  besucheAlle((state.db.history || []).filter(function(e){ return e; })).forEach(function(b){   // ein Besuch = ein Training (Timer bis 60 Minuten Abstand)
    if(b.von < start) return;
    var tag = Math.floor((b.von - start)/86400000);
    if(tag > 6) return;
    tage[tag] = 1; n++; sek += b.s;
  });
  var jetzt = new Date(); jetzt.setHours(0, 0, 0, 0);
  var hi = Math.round((jetzt.getTime() - start)/86400000);
  return { tage:tage, n:n, sek:sek, heute:hi >= 0 && hi <= 6 ? hi : -1, start:start };
}
/* Meine Woche als Karte: Tage (gefüllt = trainiert, Ring = im Kalender geplant), Anzahl, Dauer, Geplantes. Auf der Startseite führt sie in den Kalender;
   im Kalender (opt.kal) steht dieselbe Karte oben, ein Tipp auf einen Tag springt dorthin. opt: { basis, titel, kal } */
function wocheHTML(opt){
  opt = opt || {};
  var w = wocheDaten(opt.basis), namen = t("weekDays").split(" "), plan = [0,0,0,0,0,0,0], keys = [], geplant = 0;
  for(var i = 0; i < 7; i++){
    var dd = new Date(w.start); dd.setHours(12, 0, 0, 0); dd.setDate(dd.getDate() + i);
    keys.push(typeof kalTagKey === "function" ? kalTagKey(dd) : "");
    if(typeof kalAn === "function"){ plan[i] = kalAn(keys[i]).filter(function(e){ return !kalErledigt(e); }).length; geplant += plan[i]; }
  }
  var dauer = w.sek >= 60 ? " · "+fmtDuration(Math.round(w.sek/60)*60) : "";   // unter einer Minute keine Zeitangabe
  var teile = [];
  if(w.n) teile.push((w.n === 1 ? t("weekOne") : t("weekN", { n:w.n }))+dauer);
  if(geplant) teile.push(t("kalGeplant", { n:geplant }));
  var summe = teile.length ? teile.join(" · ") : t("weekNone"), titel = opt.titel || t("weekTitle");
  var tage = w.tage.map(function(an, i){
    return '<span class="wo-tag'+(an ? ' an' : '')+(plan[i] && !an ? ' plan' : '')+(i === w.heute ? ' heute' : '')+'"'+(opt.kal ? ' data-kalgoto="'+keys[i]+'" role="button" tabindex="0"' : '')+'><i></i><small>'+esc(namen[i] || "")+'</small></span>';
  }).join("");
  var kopf = '<span class="wo-links"><b class="wo-titel">'+esc(titel)+'</b><span class="wo-summe">'+esc(summe)+'</span></span>';
  if(opt.kal) return '<div class="woche woche-kal">'+kopf+'<span class="wo-tage">'+tage+'</span></div>';
  return '<div class="woche woche-link" data-wocheauf="1" role="button" tabindex="0" aria-label="'+esc(titel+": "+summe+" – "+t("tabKalender"))+'">'+kopf+
    '<span class="wo-tage" aria-hidden="true">'+tage+'</span><span class="wo-chev" aria-hidden="true">&#8250;</span></div>';
}
/* ============ Statistik ============
   Alles aus den lokal gespeicherten Daten, nichts verlässt das Gerät. Zeigt nur Bereiche, die im Fokus (Einstellungen) eingeschaltet sind;
   der in den letzten 4 Wochen am meisten genutzte steht oben. Grundlage: Kurz-Verlauf (31 Tage) + Wochensummen (statW), bei Run die Läufe selbst. */
var statKalOffen = false;   // Kalender startet zugeklappt (nur innerhalb des Besuchs gemerkt)
var statOffen = {};   // auf- oder zugeklappte Karten (WHO, Bereiche) innerhalb des Besuchs; ohne Eintrag gilt die Voreinstellung
var statFortAnz = 5;   // wie viele Übungen unter „Fortschritt je Übung“ stehen (Mehr anzeigen: +10)
/* Große Bestätigung nach „Satz eintragen“: Haken und Satz in der Bildschirmmitte, verschwindet von selbst (fängt keine Berührungen ab) */
function satzFeedback(n, text, rekord){
  var alt = document.getElementById("satz-fb"); if(alt) alt.remove();
  var d = document.createElement("div");
  d.id = "satz-fb"; d.className = "satz-fb"+(rekord ? " rekord" : ""); d.setAttribute("role", "status");
  d.innerHTML = '<div class="sfb-haken">'+(rekord ? '★' : '✓')+'</div><div class="sfb-text"><b>'+esc(t("stSatzGespeichert", { n:n }))+'</b><span>'+esc(text)+'</span>'+
    (rekord ? '<em>'+esc(t("stSatzRekord"))+'</em>' : '')+'</div>';
  document.body.appendChild(d);
  setTimeout(function(){ d.classList.add("weg"); }, 900);
  setTimeout(function(){ d.remove(); }, 1300);
}
/* Fortschritt je Übung: erstes gegen heutiges Bestgewicht (ohne Gewicht: Wiederholungen), mit Wochenkurve; Tipp = Statistik der Übung */
function statFortschrittHTML(){
  var alle = studioAlle(), l = [];
  Object.keys(alle).forEach(function(id){
    var ex = findExercise(id), log = ((alle[id] && alle[id].log) || []).filter(function(x){ return arbeitsSaetze(x).length; });
    if(!ex || log.length < 2) return;
    var erst = studioBestwerte(log.slice(0, 1)), jetzt = studioBestwerte(log), mitKg = jetzt.kg > 0;
    l.push({ id:id, name:tplText(ex.name), n:log.length, mitKg:mitKg, von:mitKg ? erst.kg : erst.wdh, bis:mitKg ? jetzt.kg : jetzt.wdh, at:log[log.length-1].at });
  });
  var kopf = '<div class="sk-kopf"><b>'+esc(t("statFort"))+'</b><span class="sk-sub">'+esc(t("statFortSub"))+'</span></div>';
  if(!l.length) return '<div class="card stat-karte stat-fort">'+kopf+'<div class="sk-unter">'+esc(t("statFortLeer"))+'</div></div>';
  l.sort(function(a, b){ return b.at - a.at; });
  var zeilen = l.slice(0, statFortAnz).map(function(x){
    var d = Math.round((x.bis - x.von)*100)/100, p = x.von > 0 ? Math.round(d/x.von*100) : 0, einheit = x.mitKg ? " kg" : " "+t("wdhKurz");
    var delta = d > 0 ? "+"+studioKg(d)+einheit+(p ? " (+"+p+" %)" : "") : d < 0 ? "−"+studioKg(-d)+einheit : t("statFortGleich");
    return '<button type="button" class="sf-zeile" data-sfuebung="'+esc(x.id)+'"><span class="sf-links"><b>'+esc(x.name)+'</b><small>'+esc(t("statFortEinh", { n:x.n }))+'</small></span>'+
      wochenKurve(studioWochen(x.id, x.mitKg ? "kg" : "wdh"), "sf-kurve")+
      '<span class="sf-rechts"><b>'+esc(studioKg(x.von)+" → "+studioKg(x.bis)+einheit)+'</b><small class="'+(d > 0 ? 'auf' : d < 0 ? 'ab' : '')+'">'+esc(delta)+'</small></span></button>';
  }).join("");
  var rest = l.length - statFortAnz;
  return '<div class="card stat-karte stat-fort">'+kopf+zeilen+
    (rest > 0 ? '<button type="button" class="btn btn-secondary tr-mehr" data-sfmehr>'+esc(t("trMehr", { n:rest }))+'</button>' : '')+'</div>';
}
var statModus = "zeit";   // Verlauf-Diagramm: "zeit" | "n"
var statGran = "woche";   // Zeitraum je Balken: "woche" | "monat" | "jahr"
function statTage(n){ return n <= 0 ? t("statHeute") : n === 1 ? t("statGestern") : t("statVorTagen", { n:n }); }
/* Air (lib) und Studio (timer) sind seit dem Workout-Bereich eine Karte; gespeichert wird weiter getrennt, die Statistik fasst beim Anzeigen zusammen */
function statGruppe(k){ return k === "lib" || k === "timer" ? "katalog" : k; }
function statGruppen(keys){ var out = []; keys.forEach(function(k){ var g = statGruppe(k); if(out.indexOf(g) < 0) out.push(g); }); return out; }
/* Ein „Besuch“ (= ein Training): alle Timer-Einträge, zwischen denen höchstens BESUCH_LUECKE liegt; die Zeit läuft vom ersten Start bis zum Ende des letzten.
   Spanne eines Eintrags: Studio und Run speichern den Start (at), Air und Mobility das Ende. Läufe zählen immer einzeln. */
function besucheAlle(list){
  var lauf = list.filter(function(e){ return bereichVonEintrag(e) === "run"; }).map(function(e){ return besuche([e])[0]; });
  return besuche(list.filter(function(e){ return bereichVonEintrag(e) !== "run"; })).concat(lauf).sort(function(a, b){ return a.von - b.von; });
}
function statWochenReihe(n, aktiv){
  var mo = new Date(); mo.setHours(0, 0, 0, 0); mo.setDate(mo.getDate() - (mo.getDay() + 6) % 7);
  var sw = state.db.settings.statW || {}, out = [], idx = {};
  var ohneRun = ["lib", "intervall", "timer", "warm"].every(function(k){ return aktiv.indexOf(k) > -1; });
  for(var i = n-1; i >= 0; i--){
    var d = new Date(mo); d.setDate(d.getDate() - 7*i); var key = wocheKey(d.getTime()), src = sw[key] || {}, ar = src.a || {}, w = { key:key, ab:d.getTime(), n:0, s:0, a:{} };
    Object.keys(ar).forEach(function(b){ if(aktiv.indexOf(b) > -1){ var g = statGruppe(b), x = w.a[g] || (w.a[g] = { n:0, s:0 }); x.n += ar[b].n || 0; x.s += ar[b].s || 0; } });
    if(ohneRun && src.bn != null){   // archivierte Besuche (alle Bereiche außer Run zusammengefasst)
      w.n = src.bn; w.s = src.bs || 0;
      if(aktiv.indexOf("run") > -1 && ar.run){ w.n += ar.run.n || 0; w.s += ar.run.s || 0; }
    } else Object.keys(w.a).forEach(function(b){ w.n += w.a[b].n; w.s += w.a[b].s; });
    idx[key] = w; out.push(w);
  }
  var live = (state.db.history || []).filter(function(e){ return e && aktiv.indexOf(bereichVonEintrag(e)) > -1; });
  statGruppen(aktiv).forEach(function(k){
    besuche(live.filter(function(e){ return statGruppe(bereichVonEintrag(e)) === k; })).forEach(function(b){
      var w = idx[wocheKey(b.von)]; if(!w) return;
      var a = w.a[k] || (w.a[k] = { n:0, s:0 }); a.n++; a.s += b.s;
    });
  });
  besucheAlle(live).forEach(function(b){ var w = idx[wocheKey(b.von)]; if(w){ w.n++; w.s += b.s; } });
  return out;
}
/* Wochen zu Balken je Woche/Monat/Jahr zusammenfassen (Monat/Jahr nach dem Montag der Woche); davor leere Balken, damit mindestens minN da sind */
function statBuckets(weeks, gran, minN){
  var out = [], lang = currentLang() === "en" ? "en-GB" : "de-DE", dayMs = 86400000;
  if(gran === "woche"){
    out = weeks.map(function(w){ var d = new Date(w.ab); return { ab:w.ab, bis:w.ab + 7*dayMs, n:w.n, s:w.s, a:w.a, label:d.getDate()+"."+(d.getMonth()+1)+"." }; });
  } else {
    var idx = {};
    weeks.forEach(function(w){
      var d = new Date(w.ab), key = gran === "jahr" ? String(d.getFullYear()) : d.getFullYear()+"-"+d.getMonth();
      var b = idx[key];
      if(!b){
        var ab = gran === "jahr" ? new Date(d.getFullYear(), 0, 1) : new Date(d.getFullYear(), d.getMonth(), 1), bis = gran === "jahr" ? new Date(d.getFullYear()+1, 0, 1) : new Date(d.getFullYear(), d.getMonth()+1, 1);
        b = idx[key] = { ab:ab.getTime(), bis:bis.getTime(), n:0, s:0, a:{}, label:gran === "jahr" ? String(d.getFullYear()) : d.toLocaleDateString(lang, { month:"short" }).replace(".", "")+" "+String(d.getFullYear()).slice(-2) };
        out.push(b);
      }
      b.n += w.n; b.s += w.s;
      Object.keys(w.a).forEach(function(k){ var x = b.a[k] || (b.a[k] = { n:0, s:0 }); x.n += w.a[k].n; x.s += w.a[k].s; });
    });
  }
  while(out.length < (minN || 0)){   // links auffüllen
    var f = out[0], ab = new Date(f.ab);
    if(gran === "woche") ab.setDate(ab.getDate() - 7); else if(gran === "monat") ab.setMonth(ab.getMonth() - 1); else ab.setFullYear(ab.getFullYear() - 1);
    var lab = gran === "woche" ? ab.getDate()+"."+(ab.getMonth()+1)+"." : gran === "jahr" ? String(ab.getFullYear()) : ab.toLocaleDateString(lang, { month:"short" }).replace(".", "")+" "+String(ab.getFullYear()).slice(-2);
    out.unshift({ ab:ab.getTime(), bis:f.ab, n:0, s:0, a:{}, label:lab });
  }
  if(gran !== "jahr" && out.length) out[out.length-1].label = t("statJetzt");
  return out;
}
/* Balkendiagramm: vals (Zahlen), labels (Text darunter), kurz (Text über dem Balken); der letzte Balken ist der laufende Zeitraum */
function statBalken(vals, labels, kurz, farbe){
  var mx = Math.max.apply(null, vals.concat([1]));
  return '<div class="bscroll"><div class="bchart'+(farbe ? ' farbe' : '')+'"'+(farbe ? ' style="--c:'+farbe+'"' : '')+'>'+vals.map(function(v, i){
    return '<div class="bc'+(i === vals.length-1 ? ' jetzt' : '')+(v ? '' : ' leer')+'" style="--i:'+Math.max(0, i - Math.max(0, vals.length - 12))+'"><span class="bw">'+(v ? esc(kurz(v)) : "")+'</span><span class="bs"><i style="height:'+(v ? Math.max(5, Math.round(100*v/mx)) : 0)+'%"></i></span><small>'+esc(labels[i])+'</small></div>';
  }).join("")+'</div></div>';
}
function statPz(sek){ var s = Math.round(sek); return Math.floor(s/60)+":"+("0"+s%60).slice(-2); }
function statMin(sek){ return sek > 0 && sek < 30 ? "<1" : String(Math.round(sek/60)); }
/* Pace-Verlauf der letzten Läufe als Linie (schneller = höher) */
function statPaceSvg(runs){
  var p = runs.map(function(x){ return x.dur/1000/(x.dist/1000); }), mn = Math.min.apply(null, p), mx = Math.max.apply(null, p), W = Math.max(300, p.length*40 + 28), H = 120, px = 14, py = 18;
  var sp = Math.max(mx - mn, 10);
  function xy(v, i){ return [(px + (p.length === 1 ? (W - 2*px)/2 : i*(W - 2*px)/(p.length - 1))).toFixed(1), (py + (v - mn)/sp*(H - 2*py)).toFixed(1)]; }   // kleine Pace (schnell) = oben
  var pts = p.map(function(v, i){ return xy(v, i); }), last = pts[pts.length-1];
  return '<div class="bscroll"><svg class="stat-linie" style="width:'+W+'px" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(t("statPaceTitel"))+'">'+
    '<line x1="'+px+'" x2="'+(W-px)+'" y1="'+(H-py/2)+'" y2="'+(H-py/2)+'" class="sl-basis"/>'+
    '<polyline points="'+pts.map(function(q){ return q.join(","); }).join(" ")+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+
    pts.map(function(q, i){ return '<circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(i === pts.length-1 ? 5 : 3)+'" class="'+(i === pts.length-1 ? 'sl-jetzt' : 'sl-punkt')+'"/>'; }).join("")+
    '<text x="'+Math.min(+last[0], W-px)+'" y="'+Math.max(10, +last[1]-9)+'" text-anchor="end" class="sl-text">'+esc(statPz(p[p.length-1]))+'</text></svg></div>';
}
/* ---------- Körperdaten und Ruheumsatz (optional; alles lokal) ----------
   Der Ruheumsatz je Stunde (Mifflin-St Jeor, ohne Größe und Geschlecht 1 kcal je kg und Stunde) dient der Kalorien-Schätzung für Läufe und Radfahrten (runKcal in js/16-lauf.js).
   Eine grobe Schätzung; Krafttraining und Co. werden nicht geschätzt (zu ungenau). */
function koerperDaten(){
  var k = state.db.settings.koerper || {}, kg = +k.kg;
  if(!(kg >= 30 && kg <= 250)) return null;
  return { kg:kg, cm:+k.cm || 0, alter:+k.alter || 0, sex:k.sex || "", pal:+k.pal || 0 };
}
function kcalProStunde(kd){
  if(kd.cm >= 120 && kd.cm <= 230 && (kd.sex === "m" || kd.sex === "w")){
    var bmr = 10*kd.kg + 6.25*kd.cm - 5*(kd.alter >= 10 ? kd.alter : 35) + (kd.sex === "m" ? 5 : -161);
    if(bmr > 600) return bmr/24;
  }
  return kd.kg;
}
/* ---------- „Mehr Einblicke“: eine zugeklappte Karte mit Volumen, letzten Rekorden, Drücken : Ziehen und Anstrengung (nur wenn Daten da sind) ---------- */
function statEinblickeHTML(voll){
  var tag = 86400000, jetzt = Date.now(), liste = einheitenListe(), teile = [], lang = currentLang() === "en" ? "en-GB" : "de-DE";
  // Volumen je Woche (kg × Wiederholungen der Arbeitssätze) aus den gespeicherten Trainings
  var wochen = voll.slice(-8), vals = wochen.map(function(w){
    return liste.filter(function(x){ return x.at >= w.ab && x.at < w.ab + 7*tag; }).reduce(function(a, x){ return a + (+x.vol || 0); }, 0);
  });
  if(vals.some(function(v){ return v > 0; })){
    var labels = wochen.map(function(w, i){ var d = new Date(w.ab); return i === wochen.length - 1 ? t("statJetzt") : d.getDate()+"."+(d.getMonth()+1)+"."; });
    teile.push('<div class="sk-unter titel">'+esc(t("statEinVol"))+'</div>'+
      statBalken(vals, labels, function(v){ return v >= 1000 ? String(Math.round(v/100)/10).replace(".", ",")+"t" : String(Math.round(v)); })+
      '<div class="sk-unter">'+esc(t("statEinVolHint"))+'</div>');
  }
  // letzte Rekorde: die schwerste Arbeitsserie der Übung an dem Tag
  var rek = [];
  liste.slice().sort(function(a, b){ return b.at - a.at; }).forEach(function(x){
    (x.ex || []).forEach(function(e){
      if(!e.rekord || rek.length >= 5) return;
      var ex = findExercise(e.id), best = null;
      arbeitsSaetze(e).forEach(function(s){ if(!best || s[0] > best[0] || (s[0] === best[0] && s[1] > best[1])) best = s; });
      if(ex && best) rek.push({ name:tplText(ex.name), satz:satzText([best[0], best[1]]), at:x.at });
    });
  });
  if(rek.length){
    teile.push('<div class="sk-unter titel">'+esc(t("statEinRek"))+'</div><div class="rekorde">'+rek.map(function(r){
      return '<div><span>'+esc(r.name)+'</span><b>'+esc(r.satz)+' ★</b><small>'+esc(new Date(r.at).toLocaleDateString(lang, { day:"numeric", month:"short" }))+'</small></div>'; }).join("")+'</div>');
  }
  // Drücken : Ziehen der letzten 4 Wochen (Arbeitssätze); ein Praxishinweis, kein Muss
  var push = 0, pull = 0, rpeSumme = 0, rpeAnz = 0;
  liste.filter(function(x){ return x.at >= jetzt - 28*tag; }).forEach(function(x){
    (x.ex || []).forEach(function(e){
      var ex = findExercise(e.id); if(!ex) return;
      var n = arbeitsSaetze(e).length, mu = exProfile(ex).pattern;
      if(mu === "push") push += n; else if(mu === "pull") pull += n;
      arbeitsSaetze(e).forEach(function(s){ if(s[3] > 0){ rpeSumme += s[3]; rpeAnz++; } });
    });
  });
  if(push + pull >= 8){
    var anteil = Math.round(100*push/(push + pull)), r = pull ? push/pull : 9;
    teile.push('<div class="sk-unter titel">'+esc(t("statEinBalance"))+'</div>'+
      '<div class="who-zeile"><span>'+esc(t("statEinDruecken"))+" : "+esc(t("statEinZiehen"))+'</span><b>'+push+' : '+pull+'</b><i class="who-bar"><u style="width:'+anteil+'%"></u></i></div>'+
      '<div class="sk-unter">'+esc(t(r > 1.4 ? "statEinPush" : r < 0.7 ? "statEinPull" : "statEinGut"))+'</div>');
  }
  if(anstrengungModus() && rpeAnz >= 6){
    teile.push('<div class="sk-unter titel">'+esc(t("statEinRpe"))+'</div><div class="chips-stat"><span><b>'+esc(anstrengungText(Math.round(rpeSumme/rpeAnz*10)/10).replace(".", currentLang() === "en" ? "." : ","))+'</b><small>'+esc(t("statEinRpeHint"))+'</small></span></div>');
  }
  if(!teile.length) return "";
  return '<details class="card stat-karte stat-kal stat-falt" data-statfalt="einblicke"'+(statOffen.einblicke ? ' open' : '')+'><summary><b>'+esc(t("statEinTitel"))+'</b>'+
    '<span class="sk-sub">'+esc(t("statEinSub"))+'</span><span class="sk-chev">'+ICON_CHEV+'</span></summary>'+teile.join("")+'</details>';
}
function renderStats(){
  var s = state.db.settings, jetzt = Date.now(), tag = 86400000, runs = s.runs || [];
  pruneHistory(state.db);
  var aktiv = BEREICH_KEYS.filter(function(k){ return !fokusAus(k); });
  var hist = (state.db.history || []).filter(function(e){ return e && aktiv.indexOf(bereichVonEintrag(e)) > -1; });
  function eintraege(k, tage){ return hist.filter(function(e){ return statGruppe(bereichVonEintrag(e)) === k && e.at >= jetzt - tage*tag; }); }
  function bes(k, tage){ return besuche(hist.filter(function(e){ return statGruppe(bereichVonEintrag(e)) === k; })).filter(function(b){ return b.von >= jetzt - tage*tag; }); }
  function summe(l){ return l.reduce(function(a, b){ return a + b.s; }, 0); }
  function dauer(sek){ return sek >= 60 ? fmtDuration(Math.round(sek/60)*60) : sek > 0 ? "<1 Min" : "–"; }
  var besA = besucheAlle(hist);
  var montag = new Date(); montag.setHours(0, 0, 0, 0); montag = montag.getTime() - ((new Date().getDay() + 6) % 7)*tag;
  function trainingsTage(von, bis){   // verschiedene Tage mit Training (nicht Einheiten): ein Tag zählt einmal, egal wie viele Trainings
    var o = {}; besA.forEach(function(b){ if(b.von >= von && b.von < bis){ var dd = new Date(b.von); o[dd.getFullYear()+"-"+dd.getMonth()+"-"+dd.getDate()] = 1; } });
    return Object.keys(o).length;
  }
  var n7 = trainingsTage(montag, jetzt + tag), nV = trainingsTage(montag - 7*tag, montag);   // Trainingstage diese Woche (ab Montag) und in der Woche davor
  var ziel = clamp(Math.round(+s.wochenZiel) || 3, 1, 7);
  var fr = jetzt;
  Object.keys(s.statW || {}).forEach(function(k){ var tt = new Date(k+"T00:00:00").getTime(); if(tt < fr) fr = tt; });
  (state.db.history || []).forEach(function(e){ if(e && e.at < fr) fr = e.at; });
  if(aktiv.indexOf("run") > -1) runs.forEach(function(x){ if(x.at < fr) fr = x.at; });
  var voll = statWochenReihe(Math.min(1040, Math.max(8, Math.ceil((jetzt - fr)/(7*tag)) + 1)), aktiv);   // alle Wochen, soweit Daten da sind
  var reihe = statBuckets(statGran === "woche" ? voll.slice(-104) : voll, statGran, statGran === "woche" ? 8 : statGran === "monat" ? 6 : 3);
  var gesamt = voll.reduce(function(a, w){ return a + w.n; }, 0);
  var serie = 0, si = voll.length - 1;
  if(si >= 0 && !voll[si].n) si--;
  while(si >= 0 && voll[si].n){ serie++; si--; }
  var einheit = t(statGran === "woche" ? "statUWoche" : statGran === "monat" ? "statUMonat" : "statUJahr");
  var labels = reihe.map(function(b){ return b.label; });
  var html = topbar(t("tabKoerper"), { back:"#home", right:kopfSymboleNeu("stats")+'<button type="button" class="iconbtn" data-koerper title="'+esc(t("koerperTitel"))+'" aria-label="'+esc(t("koerperTitel"))+'">'+svgIcon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>')+'</button>' });
  if(!aktiv.length){
    app.innerHTML = html + '<div class="card fokus-leer"><div>'+esc(t("statAlleAus"))+'</div><button type="button" class="btn btn-secondary" data-nav="#settings">'+esc(t("fokusAendern"))+'</button></div>';
    return bindCommon();
  }
  // Willkommen / Kopf
  if(!gesamt && !(aktiv.indexOf("run") > -1 && runs.length)){
    html += '<div class="card stat-hero leer"><div class="sh-text">'+esc(t("statStart"))+'</div>'+
      statBalken([0, 0, 0, 0, 0, 0, 0, 0], labels.slice(-8), function(){ return ""; }).replace('class="bchart"', 'class="bchart geist"')+'</div>';
  } else {
    var delta = n7 > nV ? t("statMehr", { n:n7 - nV }) : n7 === nV ? (n7 ? t("statGleich") : "") : t("statWeniger", { n:nV });
    var anteil = Math.min(1, n7/ziel), R = 74, U = 2*Math.PI*R, geschafft = n7 >= ziel;
    html += '<div class="card stat-hero'+(geschafft ? ' geschafft' : '')+'"><div class="stat-ring" style="--u:'+U.toFixed(1)+';--p:'+(U*anteil).toFixed(1)+'">'+
      '<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="'+R+'" class="sr-bg"/>'+(anteil > 0 ? '<circle cx="100" cy="100" r="'+R+'" class="sr-bar" transform="rotate(-90 100 100)"/>' : '')+'</svg>'+
      '<div class="sr-mitte"><b>'+n7+'</b><small>'+esc(t("statRing", { z:ziel }))+'</small></div></div>'+
      '<div class="sh-text">'+esc(t(geschafft ? "statZielGeschafft" : "statHeroWoche"))+'</div>'+
      '<div class="sh-chips">'+(delta ? '<span class="sh-delta'+(n7 > nV ? ' auf' : '')+'">'+(n7 > nV ? svgIcon('<path d="M6 15l6-6 6 6"/>') : '')+esc(delta)+'</span>' : '')+
        (serie >= 2 ? '<span class="sh-serie">'+svgIcon('<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>')+esc(t("statSerie", { n:serie }))+'</span>' : '')+'</div>'+
      '<div class="sh-ziel"><span>'+esc(t("statZiel"))+'</span><button type="button" data-ziel="-1" aria-label="−">&minus;</button><b>'+ziel+'</b><button type="button" data-ziel="1" aria-label="+">&plus;</button></div></div>';
    // Bewegungsempfehlung (WHO 2020 und Nationale Empfehlungen 2016): Orientierung, keine Diagnose
    var woche = besA.filter(function(b){ return b.von >= montag && Object.keys(b.areas).some(function(k){ return k !== "warm"; }); }), kraftTage = {}, minWo = 0;
    woche.forEach(function(b){ minWo += b.s/60; if(b.areas.lib || b.areas.timer){ var dd = new Date(b.von); kraftTage[dd.getFullYear()+"-"+dd.getMonth()+"-"+dd.getDate()] = 1; } });
    var nKraft = Object.keys(kraftTage).length, nMin = Math.round(minWo);
    function whoZeile(label, wert, ziel, text){ var p = Math.min(100, Math.round(100*wert/ziel)); return '<div class="who-zeile'+(wert >= ziel ? ' ok' : '')+'"><span>'+esc(label)+'</span><b>'+esc(text)+(wert >= ziel ? ' ✓' : '')+'</b><i class="who-bar"><u style="width:'+p+'%"></u></i></div>'; }
    // zugeklappt: oben steht nur die Zusammenfassung („95 / 150 min · 1 / 2“), die Einzelheiten und die Quelle erst beim Aufklappen
    html += '<details class="card stat-karte stat-who stat-kal stat-falt" data-statfalt="who"'+(statOffen.who ? ' open' : '')+'><summary><b>'+esc(t("statWhoTitel"))+'</b>'+
      '<span class="sk-sub">'+esc(nMin+" / 150 min · "+nKraft+" / 2")+'</span><span class="sk-chev">'+ICON_CHEV+'</span></summary>'+
      whoZeile(t("statWhoMin"), nMin, 150, nMin+" / 150 min")+whoZeile(t("statWhoKraft"), nKraft, 2, nKraft+" / 2")+
      '<div class="sk-unter">'+esc(t("statWhoHint"))+' <a class="sk-link" href="quellen.html#belegt" target="_blank" rel="noopener">'+esc(t("sourcesLink"))+'</a></div></details>';
    // Verlauf: Woche / Monat / Jahr, nach links wischen für früher
    var zeit = statModus === "zeit";
    function knopf(attr, wert, aktivWert, text){ return '<button type="button" data-'+attr+'="'+wert+'" class="'+(aktivWert === wert ? 'active' : '')+'">'+esc(text)+'</button>'; }
    html += '<div class="card stat-karte"><div class="sk-kopf"><b>'+esc(t("statVerlauf"))+'</b><span class="stat-seg">'+
      knopf("statmodus", "zeit", statModus, t("statModusZeit"))+knopf("statmodus", "n", statModus, t("statModusN"))+'</span></div>'+
      '<div class="sk-kopf stat-gran"><span class="stat-seg">'+knopf("statgran", "woche", statGran, t("statGranWoche"))+knopf("statgran", "monat", statGran, t("statGranMonat"))+knopf("statgran", "jahr", statGran, t("statGranJahr"))+'</span></div>'+
      statBalken(reihe.map(function(b){ return zeit ? b.s : b.n; }), labels, function(v){ return zeit ? statMin(v) : String(v); })+
      '<div class="sk-unter">'+esc(t(zeit ? "statMinHint" : "statNHint", { u:einheit })+" – "+t("statWischen"))+'</div>'+
      '<div class="sk-unter">'+esc(t("statBesuchHint"))+'</div></div>';
    // Rückblick „Dein Monat“: die letzten 4 Wochen gegen die 4 davor (aus den Wochensummen, alles lokal); freundlich formuliert, ohne Druck
    var w4 = voll.slice(-4), w4V = voll.slice(-8, -4), r28 = besA.filter(function(b){ return b.von >= jetzt - 28*tag; });
    function sumN(l){ return l.reduce(function(a, w){ return a + w.n; }, 0); }
    function sumS(l){ return l.reduce(function(a, w){ return a + w.s; }, 0); }
    if(sumN(w4) > 0){
      var tgR = sumN(w4), tgV = sumN(w4V), wtR = [0, 0, 0, 0, 0, 0, 0], zaehlR = {}, rekR = 0, bestR = null;
      r28.forEach(function(b){ wtR[(new Date(b.von).getDay() + 6) % 7]++; });
      var wtI = wtR.indexOf(Math.max.apply(null, wtR)), wtN = t("statWochentage").split(" ");
      hist.forEach(function(e){ if(e.at >= jetzt - 28*tag) (e.ex || []).forEach(function(id){ zaehlR[id] = (zaehlR[id] || 0) + 1; }); });
      Object.keys(zaehlR).forEach(function(id){ if(findExercise(id) && (!bestR || zaehlR[id] > zaehlR[bestR])) bestR = id; });
      einheitenListe().forEach(function(x){ if(x.at >= jetzt - 28*tag) rekR += +x.rek || 0; });
      var meil = [5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000].filter(function(m){ return gesamt >= m && gesamt - m <= 2; }).pop();
      var satzR = tgV && tgR > tgV ? (tgR - tgV === 1 ? t("statRueckPlus1") : t("statRueckPlus", { n:tgR - tgV })) : tgV && tgR === tgV ? t("statRueckGleich") : (tgR === 1 ? t("statRueckBasis1") : t("statRueckBasis", { n:tgR }));
      var chipsR = [[String(tgR), t("statRueckTage")], [dauer(sumS(w4)), t("statRueckZeit")]];
      if(r28.length >= 3) chipsR.push([wtN[wtI] || "–", t("statRueckTag")]);
      var kd = koerperDaten(), kcalR = 0;
      if(kd){
        var a4 = {}; w4.forEach(function(w){ Object.keys(w.a).forEach(function(g){ a4[g] = (a4[g] || 0) + (w.a[g].s || 0); }); });
        // Krafttraining & Co. werden nicht mehr geschätzt (zu ungenau); nur Läufe und Radfahrten, jede Einheit für sich (Rad mit der Rad-Rechnung, siehe runKcal)
        kcalR = runs.filter(function(x){ return x.at >= jetzt - 28*tag; }).reduce(function(a, x){ return a + runKcal(x.dist, x.dur/1000, runIstRad(x)); }, 0);
        if(kcalR > 0) chipsR.push(["≈ "+kcalR.toLocaleString(currentLang() === "en" ? "en-GB" : "de-DE"), t("statRueckKcal")]);
      }
      if(rekR) chipsR.push([rekR+" ★", t("statRueckRek")]);
      html += '<div class="card stat-karte"><div class="sk-kopf"><b>'+esc(t("statRueck"))+'</b></div>'+
        (meil ? '<div class="sh-chips" style="margin:2px 0 8px"><span class="sh-serie">'+svgIcon('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>')+esc(t("statMeilenstein", { n:meil }))+'</span></div>' : '')+
        '<div class="chips-stat">'+chipsR.map(function(c){ return '<span><b>'+esc(c[0])+'</b><small>'+esc(c[1])+'</small></span>'; }).join("")+'</div>'+
        '<div class="sk-unter">'+esc(satzR)+(bestR && zaehlR[bestR] >= 2 ? " "+esc(t("statRueckUebung", { name:tplText(findExercise(bestR).name), n:zaehlR[bestR] })) : "")+'</div>'+
        (kd ? (kcalR > 0 ? '<div class="sk-unter">'+esc(t("runKcalHint"))+'</div>' : "") : '<button type="button" class="kh-mehr" data-koerper>'+esc(t("statKcalLink"))+' &#8250;</button>')+'</div>';
    }
    // Kalender: letzte 4 Wochen (Tag = Start des Trainings)
    var tage = {}, mo = new Date(); mo.setHours(0, 0, 0, 0); mo.setDate(mo.getDate() - (mo.getDay() + 6) % 7 - 21);
    besA.forEach(function(b){ var d = new Date(b.von); var k = d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate(); tage[k] = (tage[k] || 0) + b.s; });
    var namen = t("weekDays").split(" "), heute = new Date(); heute.setHours(0, 0, 0, 0);
    var zellen = "", aktTage = 0;
    for(var i = 0; i < 28; i++){
      var d = new Date(mo); d.setDate(d.getDate() + i);
      var sek = tage[d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()] || 0, zukunft = d.getTime() > heute.getTime(), lv = sek <= 0 ? 0 : sek < 1200 ? 1 : sek < 2700 ? 2 : 3;
      if(sek > 0 && !zukunft) aktTage++;
      zellen += '<i class="hz l'+lv+(zukunft ? ' z' : '')+(d.getTime() === heute.getTime() ? ' heute' : '')+'" title="'+esc(d.getDate()+"."+(d.getMonth()+1)+". "+(sek ? statMin(sek)+" min" : ""))+'"></i>';
    }
    html += '<details class="card stat-karte stat-kal" data-statkal'+(statKalOffen ? ' open' : '')+'><summary><b>'+esc(t("statKalender"))+'</b><span class="sk-sub">'+esc(t("statTageAktiv", { n:aktTage }))+'</span><span class="sk-chev">'+ICON_CHEV+'</span></summary>'+
      '<div class="heat"><div class="heat-tage">'+namen.map(function(x){ return '<small>'+esc(x)+'</small>'; }).join("")+'</div><div class="heat-raster">'+zellen+'</div>'+
      '<div class="heat-legende"><small>'+esc(t("statWeniger2"))+'</small><i class="hz l0"></i><i class="hz l1"></i><i class="hz l2"></i><i class="hz l3"></i><small>'+esc(t("statMehr2"))+'</small></div></div></details>';
  }
  html += statBlocsHTML();   // die trainierten BLOCs im Verlauf (Anzahl, zuletzt, Volumen)
  html += statTrainingsHTML();   // zuletzt gespeicherte Trainings (Training speichern auf Plan-Seite, Karte und im Timer)
  html += statFortschrittHTML(); // Fortschritt je Übung (Bestgewicht erste → jetzt)
  html += statEinblickeHTML(voll);   // Mehr Einblicke (zugeklappt): Volumen, Rekorde, Drücken : Ziehen
  // Bereiche wie auf der Startseite: Workout, dann Mobility & Stretch, danach der Timer, Run zuletzt
  var folge = statGruppen(aktiv).map(function(k, i){ return { k:k, n:bes(k, 28).length, i:i }; }).sort(function(a, b){
    var fix = function(k){ return k === "katalog" ? 0 : k === "warm" ? 1 : k === "run" ? 3 : 2; };
    return fix(a.k) - fix(b.k) || b.n - a.n || a.i - b.i;
  });
  folge.forEach(function(r, ri){
    var k = r.k, d = bereichDaten(k), l = bes(k, 28), letzte = l.length ? Math.max.apply(null, l.map(function(b){ return b.bis; })) : 0;
    var vk = reihe.map(function(b){ return (b.a[k] || {}).s || 0; });
    var tageSeit = letzte ? Math.floor((new Date(jetzt).setHours(0, 0, 0, 0) - new Date(letzte).setHours(0, 0, 0, 0))/tag + 0.5) : 0;
    var sub = k === "run" && runs.length ? t("statRunSub", { n:runs.length, km:runKm(runs.reduce(function(a, x){ return a + x.dist; }, 0)) })
      : l.length ? t("statBereichSub", { n:l.length, z:dauer(summe(l)) })+" · "+statTage(tageSeit) : t("statNichts");
    var chipsK = k === "run" && runs.length ? [[String(runs.length), t("statLaeufe")], [runKm(runs.reduce(function(a, x){ return a + x.dist; }, 0)), "km"], [letzte ? statTage(tageSeit) : "–", t("statZuletzt")]]
      : l.length ? [[String(l.length), t("statChipTrainings")], [dauer(summe(l)), t("statChipZeit")], [statTage(tageSeit), t("statZuletzt")]] : null;
    // Der meistgenutzte Bereich steht aufgeklappt, die übrigen sind zu (Zusammenfassung bleibt sichtbar); merkt sich, was du auf- oder zugeklappt hast
    var bOffen = statOffen["b-"+k] !== undefined ? statOffen["b-"+k] : ri === 0 && l.length > 0;
    html += '<details class="card stat-karte stat-bereichkarte stat-kal stat-falt" data-statfalt="b-'+esc(k)+'" style="--c:'+d[3]+'"'+(bOffen ? ' open' : '')+'><summary><b class="sb-name"><i></i>'+esc(d[1])+'</b>'+
      '<span class="sk-sub">'+esc(l.length || (k === "run" && runs.length) ? sub : t("statNichts"))+'</span><span class="sk-chev">'+ICON_CHEV+'</span></summary>'+
      (chipsK ? '<div class="chips-stat">'+chipsK.map(function(c){ return '<span><b>'+esc(c[0])+'</b><small>'+esc(c[1])+'</small></span>'; }).join("")+'</div>' : '');
    if(k !== "run" && vk.some(function(v){ return v > 0; })) html += statBalken(vk, labels, statMin, d[3]);
    if(k === "run" && runs.length){
      var laeufe = runs.filter(function(x){ return !runIstRad(x); });   // Pace und Rekorde nur aus den Läufen, nicht aus Radfahrten
      var gut = laeufe.filter(function(x){ return x.dist >= 1000; }).sort(function(a, b){ return a.at - b.at; }), letzteL = gut.slice(-60);
      var wk = reihe.map(function(b){ return runs.filter(function(x){ return x.at >= b.ab && x.at < b.bis; }).reduce(function(a, x){ return a + x.dist; }, 0); });
      if(wk.some(function(v){ return v > 0; })) html += '<div class="sk-unter titel">'+esc(t("statKmPro", { u:einheit }))+'</div>'+statBalken(wk, labels, function(v){ return runKm(v).replace(/[,.]00$/, ""); }, d[3]);
      if(letzteL.length >= 2){
        html += '<div class="sk-unter titel">'+esc(t("statPaceTitel"))+'</div>'+statPaceSvg(letzteL);
        var pace = letzteL.slice(-12).map(function(x){ return x.dur/1000/(x.dist/1000); }), halb2 = Math.max(1, Math.floor(pace.length/2));
        var davor = pace.slice(0, pace.length - halb2), neu = pace.slice(-halb2);
        function avg(a){ return a.reduce(function(x, y){ return x + y; }, 0)/a.length; }
        var diff = avg(davor) - avg(neu);
        if(letzteL.length >= 4) html += '<div class="sk-unter">'+esc(diff > 5 ? t("statPaceBesser", { z:statPz(diff) }) : diff < -5 ? t("statPaceLangsamer", { z:statPz(-diff) }) : t("statPaceGleich"))+'</div>';   // erst ab vier Läufen und 5 s Unterschied: Strecke, Wetter und Tagesform schwanken stark
      }
      var rek = [];
      var l1 = laeufe.reduce(function(m, x){ return !m || x.dist > m.dist ? x : m; }, null);
      if(l1) rek.push([t("statRekLang"), runKm(l1.dist)+" km", l1.at]);
      var bk = null; laeufe.forEach(function(x){ var b = runBesterKm(x); if(b !== null && (!bk || b < bk.v)) bk = { v:b, at:x.at }; });
      if(bk) rek.push([t("statRekKm"), fmtUhr(bk.v)+" /km", bk.at]);
      var bp = gut.reduce(function(m, x){ return !m || x.dur/x.dist < m.dur/m.dist ? x : m; }, null);
      if(bp) rek.push([t("statRekPace"), runPace(bp.dur/1000, bp.dist)+" /km", bp.at]);
      if(rek.length) html += '<div class="sk-unter titel">'+esc(t("statRekorde"))+'</div><div class="rekorde">'+rek.map(function(x){
        return '<div><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b><small>'+esc(new Date(x[2]).toLocaleDateString(currentLang() === "en" ? "en-GB" : "de-DE", { day:"numeric", month:"short" }))+'</small></div>'; }).join("")+'</div>';
    }
    if(k === "katalog"){
      // Verteilung, Häufigkeit und Balance der Muskelgruppen stehen in Path › Deep Dive; Fortschritt zeigt Menge und Verlauf
      html += '<button type="button" class="dd-link" data-zumdeepdive><span>'+esc(t("statZuDeepDive"))+'</span><span aria-hidden="true">&#8250;</span></button>';
    }
    html += '</details>';
  });
  app.innerHTML = html + '<div style="height:40px"></div>';
  bindCommon();
  app.querySelectorAll("[data-zumdeepdive]").forEach(function(b){ b.addEventListener("click", function(){ state.db.settings.koerperTab = "deepdive"; save(); tabLeiste("koerper"); renderKoerper(); window.scrollTo(0, 0); }); });
  app.querySelectorAll("[data-statfalt]").forEach(function(d){
    d.addEventListener("toggle", function(){ statOffen[d.getAttribute("data-statfalt").replace(/^b-/, "b-")] = d.open; });
  });
  app.querySelectorAll("[data-sfuebung]").forEach(function(b){ b.addEventListener("click", function(){ openStudioStats(b.getAttribute("data-sfuebung")); }); });
  var sfm = app.querySelector("[data-sfmehr]");
  if(sfm) sfm.addEventListener("click", function(){ statFortAnz += 10; var y = window.scrollY; renderStats(); window.scrollTo(0, y); });
  app.querySelectorAll(".bscroll").forEach(function(b){ b.scrollLeft = b.scrollWidth; });
  var kal = app.querySelector("[data-statkal]");
  if(kal) kal.addEventListener("toggle", function(){ statKalOffen = kal.open; });
  function neu(){ var y = window.scrollY; renderStats(); window.scrollTo(0, y); }
  app.querySelectorAll("[data-statmodus]").forEach(function(b){ b.addEventListener("click", function(){ statModus = b.getAttribute("data-statmodus"); neu(); }); });
  app.querySelectorAll("[data-ziel]").forEach(function(b){ b.addEventListener("click", function(){ s.wochenZiel = clamp(ziel + (+b.getAttribute("data-ziel")), 1, 7); save(); neu(); }); });
  app.querySelectorAll("[data-statgran]").forEach(function(b){ b.addEventListener("click", function(){ statGran = b.getAttribute("data-statgran"); neu(); }); });
  app.querySelectorAll("[data-koerper]").forEach(function(b){ b.addEventListener("click", function(){ openKoerperSheet(neu); }); });
  statTrainingsBinden(neu);
}
function recentExercises(days){
  var since = Date.now() - days*86400000, out = {};
  (state.db.history || []).forEach(function(e){ if(e.at >= since) (e.ex||[]).forEach(function(id){ out[id] = true; }); });
  return out;
}

/* (Rest der Verlauf-Logik steht in 12-uebung-statistik.js) */

/* ============ Training speichern (den Tag tracken) ============
   Jeder Satz steht sofort im Protokoll der Übung; „Training speichern“ legt dazu den Tag als Ganzes ab: Übungen mit ihren Sätzen, Volumen, Dauer,
   Rekorde und eine Notiz - jederzeit auch mitten im Workout (Plan-Seite, Übungskarte, Ende des Timers). Je Plan und Tag gibt es einen Eintrag; erneutes
   Speichern aktualisiert ihn. Ohne Plan zählt alles, was heute eingetragen wurde („Freies Training“).
   Daten: settings.einheiten = [{ id, at, tag:"JJJJ-MM-TT", plan:Plan-ID oder "", name, ex:[{ id, s:[[kg, wdh, typ?]], rekord }], saetze, vol, dauer, rek, notiz }] -
   nur auf dem Gerät, höchstens 1000 Einträge. */
function einheitenListe(){ var s = state.db.settings; return Array.isArray(s.einheiten) ? s.einheiten : (s.einheiten = []); }
function einheitTagKey(ts){
  var d = new Date(ts || Date.now());
  return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);
}
/* Wohin gehört das, was gerade trainiert wird: in den geöffneten Plan (wenn die Übung darin steht), sonst ins freie Training des Tages */
function trainingFrei(){   // freies Training: alles, was heute eingetragen wurde
  var heute = studioTag(Date.now()), alle = studioAlle();
  return { plan:null, ids:Object.keys(alle).filter(function(k){
    var l = alle[k] && alle[k].log || [], z = l.length ? l[l.length-1] : null;
    return z && z.s.length && studioTag(z.at) === heute && findExercise(k);
  }) };
}
function trainingKontext(id){
  var p = stPlanAktiv ? stPlanFind(stPlanAktiv) : null;
  if(p && (!id || stPlanIds(p).indexOf(id) > -1)) return { plan:p, ids:stPlanIds(p) };
  return trainingFrei();
}
function einheitHeute(plan){
  var key = einheitTagKey(), pid = plan ? plan.id : "", gef = null;
  einheitenListe().forEach(function(x){ if(x.tag === key && (x.plan || "") === pid) gef = x; });
  return gef;
}
/* Was heute zu den Übungen eingetragen wurde (Sätze aus Karte und Timer; Übungen ohne Gewicht zählen mit, wenn sie heute im Verlauf stehen) */
function trainingHeute(ids){
  var heute = studioTag(Date.now()), hist = state.db.history || [], inHist = {}, ex = [], saetze = 0, vol = 0, rek = 0, dauer = 0, wdh = 0;
  hist.forEach(function(h){ if(h && studioTag(h.at) === heute) (h.ex || []).forEach(function(id){ inHist[id] = true; }); });
  ids.forEach(function(id){
    var e = studioEintrag(id), log = (e && e.log) || [], i = log.length-1;
    var l = i >= 0 && log[i].s.length && studioTag(log[i].at) === heute ? log[i] : null;
    if(l){
      var vor = studioBestwerte(log, i), jetzt = studioBestwerte([l]);
      var rekord = i > 0 && studioIstRekord(jetzt, vor);
      ex.push({ id:id, s:JSON.parse(JSON.stringify(l.s)), rekord:rekord });
      saetze += arbeitsSaetze(l).length; vol += studioVolumen(l); wdh += studioWdhSumme(l); if(rekord) rek++;
    } else if(inHist[id]) ex.push({ id:id, s:[], rekord:false });
  });
  hist.forEach(function(h){
    if(!h || studioTag(h.at) !== heute) return;
    if(h.studio || (h.ex || []).some(function(id){ return ids.indexOf(id) > -1; })) dauer += +h.dur || 0;
  });
  return { ex:ex, saetze:saetze, vol:Math.round(vol), wdh:wdh, rek:rek, dauer:Math.round(dauer) };
}
function trainingSpeichern(k, notiz){
  var d = trainingHeute(k.ids);
  if(!d.ex.length) return null;
  if(k.plan && k.plan.entwurf){ delete k.plan.entwurf; k.plan.updatedAt = Date.now(); }   // ein noch nicht gespeicherter Plan kommt mit dem Training unter Meine
  var l = einheitenListe(), vorh = einheitHeute(k.plan);
  var e = vorh || { id:uid(), tag:einheitTagKey(), plan:k.plan ? k.plan.id : "" };
  e.at = Date.now(); e.name = k.plan ? k.plan.name : ""; e.ex = d.ex; e.saetze = d.saetze; e.vol = d.vol; e.wdh = d.wdh; e.dauer = d.dauer; e.rek = d.rek;
  if(notiz != null) e.notiz = String(notiz).trim();
  if(!vorh) l.push(e);
  if(l.length > 1000) l.splice(0, l.length - 1000);
  save();
  return e;
}
/* Nach jedem eingetragenen Satz: heute schon gespeicherte Trainings, in denen die Übung vorkommt, führen sich selbst nach */
function trainingNachSatz(id){
  var key = einheitTagKey();
  einheitenListe().slice().forEach(function(x){
    if(x.tag !== key) return;
    var p = x.plan ? stPlanFind(x.plan) : null;
    if(x.plan && !p) return;   // der Plan wurde gelöscht: der Eintrag bleibt, wie er war
    var drin = p ? stPlanIds(p).indexOf(id) > -1 : x.ex.some(function(a){ return a.id === id; });
    if(drin) trainingSpeichern(p ? { plan:p, ids:stPlanIds(p) } : trainingFrei(), null);
  });
}
function trLeisteText(s, u){ return satzName(s)+" · "+planAnzahl(u); }   // „9 Sätze · 3 Übungen“
function trainingZahlenHTML(d){
  var zahlen = [[String(d.ex.length), t("trUebungen")], [String(d.saetze), t("stSetsAll")], [studioKg(d.vol)+" kg", t("stVolGesamt")],
    [d.dauer ? fmtDuration(d.dauer >= 60 ? Math.round(d.dauer/60)*60 : d.dauer) : "–", t("trDauer")], [String(d.rek), t("stRekord")], [String(d.wdh || 0), t("stWdhGesamt")]];
  return '<div class="st-stats-zahlen">'+zahlen.map(function(z){ return '<div><b>'+esc(z[0])+'</b><span>'+esc(z[1])+'</span></div>'; }).join("")+'</div>';
}
function trainingUebungenHTML(ex){
  return ex.map(function(x){
    var e = findExercise(x.id);
    return '<div class="st-v-zeile"><span>'+esc(e ? tplText(e.name) : x.id)+(x.rekord ? '<i class="st-rekord" title="'+esc(t("stRekord"))+'">★</i>' : '')+'</span>'+
      '<b>'+esc(x.s.length ? x.s.map(satzText).join(" · ") : "✓")+'</b></div>';
  }).join("");
}
/* Fenster „Training speichern“: Zusammenfassung des heutigen Trainings, Notiz, Speichern; k = trainingKontext(…), nachher läuft nach dem Speichern */
function openTrainingSpeichern(k, nachher){
  var root = document.getElementById("overlayRoot"), d = trainingHeute(k.ids), vorh = einheitHeute(k.plan);
  var name = k.plan ? k.plan.name : t("trFrei");
  function zu(){ root.innerHTML = ""; }
  if(!d.ex.length){
    root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet tr-sheet" role="dialog" aria-label="'+esc(t("trTitel"))+'"><h3>'+esc(t("trTitel"))+SEP+esc(name)+'</h3>'+
      '<p>'+esc(t("trLeer"))+'</p><button type="button" class="btn btn-secondary" data-cancel>'+esc(t("close"))+'</button></div></div>';
  } else {
    root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet tr-sheet" role="dialog" aria-label="'+esc(t("trTitel"))+'">'+
      '<h3>'+esc(t("trTitel"))+SEP+esc(name)+'</h3>'+
      (vorh ? '<p class="tr-schon">'+esc(t("trSchon"))+'</p>' : '')+
      trainingZahlenHTML(d)+trainingUebungenHTML(d.ex)+
      '<label for="tr-notiz" style="margin-top:12px">'+esc(t("stNote"))+'</label>'+
      '<textarea id="tr-notiz" rows="2" placeholder="'+esc(t("trNotizPh"))+'">'+esc(vorh && vorh.notiz || "")+'</textarea>'+
      '<div class="btn-row"><button class="btn btn-secondary" data-cancel>'+esc(t("cancel"))+'</button>'+
      '<button class="btn btn-primary" data-trok>✓ '+esc(t(vorh ? "trAktual" : "trSpeichern"))+'</button></div></div></div>';
    root.querySelector("[data-trok]").addEventListener("click", function(){
      trainingSpeichern(k, root.querySelector("#tr-notiz").value);
      satzBasisSetzen(k.ids);   // das Satz-Training beginnt danach von vorn
      zu(); showToast(t("trGespeichert"));
      if(nachher) nachher();
    });
  }
  root.querySelector("[data-cancel]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(ev){ if(ev.target.classList.contains("confirm-overlay")) zu(); });
}
/* Leiste unten (Plan-Seite, Übungskarte): zeigt, was heute drin ist, und speichert */
function trainingLeisteHTML(k){
  var d = trainingHeute(k.ids), vorh = einheitHeute(k.plan);
  return '<div class="wb-leiste tr-leiste"><div class="wb-leiste-in"><span>'+
    (d.ex.length ? '<b>'+esc(trLeisteText(d.saetze, d.ex.length))+'</b>' : esc(t("trNochNichts")))+(vorh ? ' · '+esc(t("trGespeichertKurz")) : '')+'</span>'+
    '<span class="wb-knoepfe"><button type="button" class="btn btn-primary" data-trsave>✓ '+esc(t(vorh ? "trAktual" : "trSpeichern"))+'</button></span></div></div>';
}
function trainingLeisteBinden(k, nachher){
  var b = app.querySelector("[data-trsave]");
  if(b) b.addEventListener("click", function(){ openTrainingSpeichern(k, nachher); });
}
function trainingsZeilenHTML(l){
  return l.map(function(x){
    var tag = new Date(x.tag+"T12:00:00").toLocaleDateString(currentLang(), { weekday:"short", day:"numeric", month:"numeric" });
    var thumb = ortThumbHTML(x.ex.map(function(a){ return a.id; }));
    return '<button type="button" class="tr-zeile" data-trdetail="'+esc(x.id)+'">'+thumb+'<span class="tr-links"><b>'+esc(tag)+'</b><small>'+esc(x.name || t("trFrei"))+'</small></span>'+
      '<span class="tr-rechts">'+esc(trLeisteText(x.saetze, x.ex.length)+(x.dauer >= 60 ? " · "+Math.round(x.dauer/60)+" min" : "")+(x.rek ? " · ★ "+x.rek : ""))+'</span></button>';
  }).join("");
}
/* Statistik: die zuletzt gespeicherten Trainings */
/* Gespeichert werden bis zu 1000 Trainings; angezeigt wird zuerst nur ein Stück (Statistik 10, Meine 15), „Mehr anzeigen“ holt jeweils 20 weitere */
var trAnzahl = { stat:10, meine:15 };
function trMehrHTML(key, gesamt){
  var rest = gesamt - trAnzahl[key];
  return rest > 0 ? '<button type="button" class="btn btn-secondary tr-mehr" data-trmehr="'+key+'">'+esc(t("trMehr", { n:rest }))+'</button>' : "";
}
/* BLOCs im Verlauf (Fortschritt): je BLOC, den du mit Sätzen trainiert und gespeichert hast, wie oft, wann zuletzt und wie sich das Volumen (Gewicht × Wiederholungen der Arbeitssätze)
   zwischen dem ersten und dem letzten der letzten fünf Trainings verändert hat. Nur Beschreibung, keine Bewertung; die Verteilung auf Muskelgruppen steht im Deep Dive. */
function statBlocsHTML(){
  var by = {}, lang = currentLang() === "en" ? "en-GB" : "de-DE";
  einheitenListe().forEach(function(x){ if(x && x.plan) (by[x.plan] = by[x.plan] || []).push(x); });
  var ids = Object.keys(by).map(function(id){ by[id].sort(function(a, b){ return a.at - b.at; }); return id; })
    .sort(function(a, b){ return by[b][by[b].length - 1].at - by[a][by[a].length - 1].at; }).slice(0, 6);
  if(!ids.length) return "";
  var zeilen = ids.map(function(id){
    var l = by[id], letzte = l[l.length - 1], p = stPlanFind(id), name = p ? p.name : (letzte.name || t("trFrei"));
    var fuenf = l.slice(-5).filter(function(x){ return +x.vol > 0; }), pct = null;
    if(fuenf.length >= 2) pct = Math.round((fuenf[fuenf.length - 1].vol - fuenf[0].vol)*100/fuenf[0].vol);
    var trend = pct === null ? '<span class="bf-trend">–</span>' : '<span class="bf-trend '+(pct > 0 ? 'plus' : pct < 0 ? 'minus' : '')+'">'+(pct > 0 ? '+' : pct < 0 ? '−' : '')+Math.abs(pct)+' %</span>';
    return '<div class="bloc-fz"><span class="bf-name"><b>'+esc(name)+'</b><small>'+esc(t("statBlocN", { n:l.length })+" · "+t("statBlocZuletzt", { d:new Date(letzte.at).toLocaleDateString(lang, { day:"numeric", month:"short" }) }))+'</small></span>'+trend+'</div>';
  }).join("");
  return '<div class="card stat-karte"><div class="sk-kopf"><b>'+esc(t("statBlocsTitel"))+'</b><span class="sk-sub">'+esc(t("statBlocsSub"))+'</span></div>'+zeilen+'<div class="sk-unter">'+esc(t("statBlocsHinweis"))+'</div></div>';
}
/* Gespeicherte Trainings (Fortschritt): eingeklappt, innen nach Muskelgruppe und Übung geordnet (nicht nach Workout oder BLOC): je Übung wie oft trainiert, wann zuletzt und der
   schwerste Arbeitssatz (★ = Rekord dabei); Antippen öffnet den Verlauf der Übung. Die Muskelgruppe ist die mit dem größten Anteil der Übung (mgVerteilung). Wer ein einzelnes Training
   ansehen, ergänzen oder löschen will, findet es unten unter „Einzelne Trainings nach Datum“. */
function exAnzText(n){ return n === 1 ? t("exCount1") : t("exCount", { n:n }); }   // „1 Übung“ statt „1 Übungen“
function statTrainingsHTML(){
  var alle = einheitenListe().slice().sort(function(a, b){ return b.at - a.at; });
  if(!alle.length) return "";
  var lang = currentLang() === "en" ? "en-GB" : "de-DE", jeEx = {};
  alle.forEach(function(x){
    (x.ex || []).forEach(function(e){
      if(!e || !findExercise(e.id)) return;
      var j = jeEx[e.id] = jeEx[e.id] || { id:e.id, n:0, letzte:0, best:null, rek:false };
      j.n++; if(x.at > j.letzte) j.letzte = x.at;
      arbeitsSaetze(e).forEach(function(s){ if(!j.best || s[0] > j.best[0] || (s[0] === j.best[0] && s[1] > j.best[1])) j.best = s; });
      if(e.rekord) j.rek = true;
    });
  });
  var gr = {};
  Object.keys(jeEx).forEach(function(id){
    var v = mgVerteilung(findExercise(id)), best = "", bw = 0;
    MUSKEL_GRP.forEach(function(g){ if((v[g.id] || 0) > bw){ bw = v[g.id]; best = g.id; } });
    if(!best) best = "beine";
    (gr[best] = gr[best] || []).push(jeEx[id]);
  });
  var gruppen = MUSKEL_GRP.filter(function(g){ return gr[g.id]; }).map(function(g){
    var l = gr[g.id].sort(function(a, b){ return b.n - a.n || b.letzte - a.letzte; });
    return '<details class="tr-gr" data-statfalt="trg-'+g.id+'"'+(statOffen["trg-"+g.id] ? ' open' : '')+'><summary><b>'+esc(t(g.key))+'</b><span class="sk-sub">'+esc(exAnzText(l.length))+'</span><span class="sk-chev">'+ICON_CHEV+'</span></summary>'+
      l.map(function(j){
        var ex = findExercise(j.id);
        return '<button type="button" class="tr-ex" data-sfuebung="'+esc(j.id)+'"><span class="te-name"><b>'+esc(tplText(ex.name))+'</b><small>'+esc(t("statBlocN", { n:j.n })+" · "+t("statBlocZuletzt", { d:new Date(j.letzte).toLocaleDateString(lang, { day:"numeric", month:"short" }) }))+'</small></span>'+
          '<span class="te-best">'+(j.best ? esc(satzText([j.best[0], j.best[1]]))+(j.rek ? ' ★' : '') : '–')+'</span></button>';
      }).join("")+'</details>';
  }).join("");
  return '<details class="card stat-karte stat-kal stat-falt stat-trainings" data-statfalt="trainings"'+(statOffen.trainings ? ' open' : '')+'><summary><b>'+esc(t("trStatTitel"))+'</b><span class="sk-sub">'+esc(t("trStatSub", { n:alle.length }))+'</span><span class="sk-chev">'+ICON_CHEV+'</span></summary>'+
    gruppen+
    '<details class="tr-gr" data-statfalt="trg-datum"'+(statOffen["trg-datum"] ? ' open' : '')+'><summary><b>'+esc(t("statTrDatum"))+'</b><span class="sk-sub">'+alle.length+'</span><span class="sk-chev">'+ICON_CHEV+'</span></summary>'+
    trainingsZeilenHTML(alle.slice(0, trAnzahl.stat))+trMehrHTML("stat", alle.length)+'</details></details>';
}
function statTrainingsBinden(neu){
  app.querySelectorAll("[data-trmehr]").forEach(function(b){
    b.addEventListener("click", function(e){ e.stopPropagation(); var k = b.getAttribute("data-trmehr"); trAnzahl[k] += 20; neu(); });
  });
  app.querySelectorAll("[data-trdetail]").forEach(function(b){
    b.addEventListener("click", function(){
      var x = null, id = b.getAttribute("data-trdetail");
      einheitenListe().forEach(function(e){ if(e.id === id) x = e; });
      if(x) openTrainingDetail(x, neu);
    });
  });
}
function openTrainingDetail(x, neu){
  var root = document.getElementById("overlayRoot");
  var tag = new Date(x.tag+"T12:00:00").toLocaleDateString(currentLang(), { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet tr-sheet" role="dialog" aria-label="'+esc(t("trTitel"))+'">'+
    '<h3>'+esc(x.name || t("trFrei"))+'</h3><p>'+esc(tag)+'</p>'+
    trainingZahlenHTML({ ex:x.ex, saetze:x.saetze, vol:x.vol, wdh:x.wdh, dauer:x.dauer, rek:x.rek })+trainingUebungenHTML(x.ex)+
    (x.notiz ? '<p class="tr-notiz">'+esc(x.notiz)+'</p>' : '')+
    '<div class="btn-row"><button class="btn btn-secondary" data-cancel>'+esc(t("close"))+'</button>'+
    '<button class="btn btn-secondary" data-trdel>'+ICON_TRASH+' '+esc(t("del"))+'</button></div></div></div>';
  function zu(){ root.innerHTML = ""; }
  root.querySelector("[data-cancel]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(ev){ if(ev.target.classList.contains("confirm-overlay")) zu(); });
  root.querySelector("[data-trdel]").addEventListener("click", function(){
    confirmSheet(t("trDelQ"), t("cantUndo"), t("del"), function(){
      state.db.settings.einheiten = einheitenListe().filter(function(e){ return e.id !== x.id; });
      save(); if(neu) neu();
    });
  });
}
