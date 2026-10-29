"use strict";
/* ============ Studio ============
   Übungen an Geräten und mit freien Gewichten als Kacheln. Jede Übung hat „ihre Karte“ (#studio/<id>):
   Gewicht × Wiederholungen eintragen (vorausgefüllt), danach läuft die Pause, Verlauf, Notiz und
   Steigerung nach der doppelten Progression (Ziel zweimal hintereinander geschafft -> Gewicht hoch).
   Daten: settings.studio[id] = { kg, pause, notiz, zuletzt, log:[{ at, s:[[kg, wdh], …] }], ziel:{ saetze, wdh }, timer:{ reps, work, rest },
   modus:"timer" } - nur auf dem Gerät. kg, pause und ziel stellt man im Plan (Zeile je Übung) oder auf der Übungskarte ein, beides ist dasselbe. */
var studioQuery = "", studioPause = null;
function studioAlle(){ return state.db.settings.studio || (state.db.settings.studio = {}); }
function studioEintrag(id){ return (state.db.settings.studio || {})[id] || null; }
/* Ziel einer Übung: Sätze × Wiederholungen. Voreinstellung aus STUDIO_ZIEL, überschrieben von dem, was im Plan oder auf der Karte eingestellt wurde
   (settings.studio[id].ziel = { saetze, wdh }) - es gilt überall gleich: Plan, Übungskarte, Timer und die Steigerung nach der doppelten Progression. */
function studioZiel(id){
  var ex = findExercise(id), e = studioEintrag(id), g = e && e.ziel;
  // Übungen ohne Gewicht (nur Block) bringen ihre Satzzahl aus Air mit; Wiederholungen sind dort frei wählbar (Voreinstellung 12)
  var z = STUDIO_ZIEL[id] || [studioNurBlock(ex) ? ((e && e.timer && e.timer.reps) || ex.setReps || 3) : 3, 12, 2.5];
  // schritt: Gewichtsschritt der +/−-Knöpfe, je Übung einstellbar (Karte), sonst die Voreinstellung
  return { saetze:g && g.saetze > 0 ? g.saetze : z[0], wdh:g && g.wdh > 0 ? g.wdh : z[1], schritt:e && e.schritt > 0 ? e.schritt : z[2] };
}
/* Arbeitsgewicht: was zuletzt eingestellt oder benutzt wurde (sonst das Gewicht des ersten Satzes der letzten Einheit, sonst 0) */
function studioArbeitsKg(id){
  var e = studioEintrag(id) || {};
  if(e.kg != null) return e.kg;
  var l = e.log && e.log.length ? e.log[e.log.length-1] : null, a = l ? arbeitsSaetze(l) : [];
  return a.length ? a[0][0] : (l && l.s.length ? l.s[0][0] : 0);
}
/* Jüngste Einheit mit Sätzen; mitHeute = false überspringt heutige Sätze („Letztes Mal“ auf der Karte, wo „Heute“ schon dasteht) */
function studioLetzte(id, mitHeute){
  var e = studioEintrag(id), log = (e && e.log) || [], heute = studioTag(Date.now());
  for(var i = log.length-1; i >= 0; i--){
    if(log[i].s.length && (mitHeute || studioTag(log[i].at) !== heute)) return log[i];
  }
  return null;
}
function studioLetzteText(l){   // „40×12 · 40×11 · 38×10“
  return l.s.map(satzText).join(" · ");
}
function studioTagText(ts){
  return new Date(ts).toLocaleDateString(currentLang(), { weekday:"short", day:"numeric", month:"numeric" });
}
/* Fortschritt je Woche: aus [[Zeitpunkt, Wert], …] wird je Kalenderwoche (Montag) der beste Wert -
   beim Gewicht der höchste, bei Zeiten der niedrigste. Die Kurve zeigt echte Wochenabstände. */
function wochenWerte(liste, niedrigGut, summe){   // summe: je Woche zusammenzählen (Volumen) statt den besten Wert nehmen
  var je = {};
  liste.forEach(function(x){
    var d = new Date(x[0]); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    var w = Math.round(d.getTime() / 6048e5);
    if(summe) je[w] = (je[w] || 0) + x[1];
    else je[w] = w in je ? (niedrigGut ? Math.min(je[w], x[1]) : Math.max(je[w], x[1])) : x[1];
  });
  return Object.keys(je).map(Number).sort(function(a, b){ return a - b; }).map(function(w){ return { w:w, v:je[w] }; });
}
function wochenKurve(pts, cls){
  if(pts.length < 2) return "";
  var vs = pts.map(function(q){ return q.v; }), mx = Math.max.apply(null, vs), mn = Math.min.apply(null, vs), sp = mx - mn || 1;
  var w0 = pts[0].w, wb = pts[pts.length-1].w - w0 || 1;
  return '<svg class="wo-kurve '+(cls || "")+'" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="'+
    pts.map(function(q){ return ((q.w - w0)/wb*100).toFixed(1)+","+(mx === mn ? 15 : 26 - (q.v - mn)/sp*22).toFixed(1); }).join(" ")+'"/></svg>';
}
/* Wochenwerte je Sicht: "kg" bestes Gewicht, "rm" geschätztes 1RM, "vol" Volumen (Gewicht × Wiederholungen, alle Arbeitssätze der Woche) */
function studioWochen(id, sicht){
  var e = studioEintrag(id), log = (e && e.log || []).filter(function(l){ return arbeitsSaetze(l).length; });
  if(!sicht && studioNurBlock(findExercise(id))) sicht = "wdh";   // ohne Gewicht zählen die Wiederholungen: "wdh" beste Wiederholungen je Satz, "wsum" alle der Woche
  if(sicht === "vol") return wochenWerte(log.map(function(l){ return [l.at, studioVolumen(l)]; }), false, true).slice(-16);
  if(sicht === "wsum") return wochenWerte(log.map(function(l){ return [l.at, studioWdhSumme(l)]; }), false, true).slice(-16);
  return wochenWerte(log.map(function(l){
    var a = arbeitsSaetze(l);
    return [l.at, Math.max.apply(null, a.map(function(x){ return sicht === "rm" ? satzSchaetzung1RM(x) : sicht === "wdh" ? x[1] : x[0]; }))];
  }), false).slice(-16);
}
/* Satztypen: ein Satz ist [kg, wdh] oder [kg, wdh, typ] mit typ "w" (Aufwärmen), "d" (Drop) oder "f" (bis Versagen). Aufwärmsätze zählen nicht
   in Bestgewicht, Volumen, geschätztes 1RM und die Steigerung. */
var SATZ_TYPEN = ["n", "w", "d", "f"];   // normal · Aufwärmen · Drop · bis Versagen
function satzTyp(x){ return x[2] === "w" || x[2] === "d" || x[2] === "f" ? x[2] : "n"; }
function arbeitsSaetze(l){ return (l.s || []).filter(function(x){ return satzTyp(x) !== "w"; }); }
function satzSchaetzung1RM(x){ return x[1] <= 1 ? x[0] : x[0]*(1 + Math.min(x[1], 10)/30); }   // Epley, ab 10 Wiederholungen gedeckelt: darüber wird die Schätzung unzuverlässig
function studioVolumen(l){ return arbeitsSaetze(l).reduce(function(a, x){ return a + x[0]*x[1]; }, 0); }
function studioWdhSumme(l){ return arbeitsSaetze(l).reduce(function(a, x){ return a + x[1]; }, 0); }
/* RPE/RIR je Satz (Einstellungen › Training, settings.anstrengung = "rpe" | "rir" | ""): der Satz trägt als vierte Stelle die RPE (6–10; RIR = 10 − RPE) */
function anstrengungModus(){ var a = state.db.settings.anstrengung; return a === "rpe" || a === "rir" ? a : ""; }
function anstrengungText(rpe){ return anstrengungModus() === "rir" ? "RIR "+(10 - rpe) : "RPE "+rpe; }
function satzText(x){   // „40×12“, ohne Gewicht „12 Wdh.“, bei besonderen Sätzen mit Kürzel davor („Aufw. 20×10“), mit Anstrengung „40×12 @ RPE 8“
  var ty = satzTyp(x);
  return (ty === "n" ? "" : t("satzTyp_"+ty)+" ")+(x[0] > 0 ? studioKg(x[0])+"×"+x[1] : x[1]+" "+t("wdhKurz"))+(x[3] > 0 ? " @ "+anstrengungText(x[3]) : "");
}
/* Geschätztes 1RM und Bestgewicht über alle Einheiten (nur Arbeitssätze); davor = nur Einheiten vor dem Index i.
   wdh: die meisten Wiederholungen in einem Satz, wsum: die meisten in einer Einheit (für Übungen ohne Gewicht),
   wBest: die meisten Wiederholungen beim Bestgewicht (mehr Wiederholungen bei gleichem Gewicht ist ein Fortschritt, auch über 10 Wdh.) */
function studioBestwerte(log, bis){
  var kg = 0, rm = 0, vol = 0, wdh = 0, wsum = 0, wBest = 0;
  log.forEach(function(l, i){
    if(bis != null && i >= bis) return;
    arbeitsSaetze(l).forEach(function(x){
      if(x[0] > kg){ kg = x[0]; wBest = x[1]; } else if(x[0] === kg){ wBest = Math.max(wBest, x[1]); }
      rm = Math.max(rm, satzSchaetzung1RM(x)); wdh = Math.max(wdh, x[1]);
    });
    vol = Math.max(vol, studioVolumen(l)); wsum = Math.max(wsum, studioWdhSumme(l));
  });
  return { kg:kg, rm:rm, vol:vol, wdh:wdh, wsum:wsum, wBest:wBest };
}
/* Neuer Rekord einer Einheit gegenüber allem davor: mit Gewicht Bestgewicht, 1RM oder mehr Wiederholungen beim Bestgewicht,
   ohne Gewicht die meisten Wiederholungen in einem Satz */
function studioIstRekord(jetzt, vor){
  if(jetzt.kg > 0 || vor.kg > 0)
    return jetzt.kg > vor.kg || jetzt.rm > vor.rm + .001 || (vor.kg > 0 && jetzt.kg === vor.kg && jetzt.wBest > vor.wBest);
  return jetzt.wdh > vor.wdh;
}
function studioTag(ts){ var d = new Date(ts); return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate(); }
function studioNurBlock(ex){
  return !!ex && !STUDIO_NUR[ex.id] && !ex.custom && ex.equip.every(function(q){ return ["db", "kb", "gym"].indexOf(q) < 0; });
}
function studioTimer(id){
  var e = studioEintrag(id) || {}, tm = e.timer || {}, ex = findExercise(id);
  if(studioNurBlock(ex))   // Vorgabe wie in Air; Runden = Sätze des Ziels, Pause = die Pause der Übung (Plan oder Karte), sonst die aus Air
    return { reps:(e.ziel && e.ziel.saetze) || tm.reps || ex.setReps || ex.reps, work:tm.work || ex.workSec,
             rest:tm.rest != null ? tm.rest : (e.pause != null ? e.pause : ex.restSec) };
  // Runden = die Sätze des Ziels (im Plan oder auf der Karte eingestellt); eine ältere Timer-Einstellung gilt, solange kein Ziel gesetzt ist
  return { reps:(e.ziel && e.ziel.saetze) || tm.reps || studioZiel(id).saetze, work:tm.work || 40, rest:tm.rest != null ? tm.rest : (e.pause || 90) };
}
function studioRun(ex){
  var tm = studioTimer(ex.id), b = exBlock(ex);
  b.id = "st-"+ex.id; b.reps = ex.perSide ? tm.reps*2 : tm.reps; b.workSec = tm.work; b.restSec = tm.rest;
  var r = libQuickWorkout([b], 0, tplText(ex.name), "studio-"+ex.id);
  r.mitGewicht = !studioNurBlock(ex);   // Übung mit Gewicht: nach jedem Satz Gewicht und Wiederholungen eintragen (auch Freiluft-Hanteln)
  return r;
}
function studioKg(v){ return (Math.round(v*100)/100).toLocaleString(currentLang()==="en" ? "en" : "de"); }
/* Ausrüstung einer Übung - für die Chips im Filter. „Fitnessstudio“ fasst alles zusammen, was es dort gibt (Geräte, Kabel, Langhantel,
   Bank mit Kurzhanteln); die übrigen Arten sind das, was man auch zuhause oder draußen hat. */
function studioArt(id){
  var eq = (findExercise(id) || {}).equip || [];
  if(eq.indexOf("gym") > -1) return "geraet";
  if(eq.indexOf("band") > -1) return "band";
  if(eq.indexOf("bar") > -1 || eq.indexOf("dip") > -1) return "stange";
  return (eq.indexOf("db") > -1 || eq.indexOf("kb") > -1) ? "frei" : "koerper";
}
/* Passt die Übung zu den gewählten Ausrüstungs-Chips? Nach den Ausrüstungs-Angaben der Übung (auch Hantel-Übungen im Studio zählen als Kurzhantel), nicht nur nach der einen Art */
function studioArtPasst(id, fArt){
  if(!fArt.length) return true;
  var eq = (findExercise(id) || {}).equip || [];
  return fArt.some(function(a){
    if(a === "frei") return eq.indexOf("db") > -1 || eq.indexOf("kb") > -1;
    if(a === "stange") return eq.indexOf("bar") > -1 || eq.indexOf("dip") > -1;
    if(a === "band") return eq.indexOf("band") > -1;
    if(a === "koerper") return !eq.some(function(e){ return e !== "none"; });
    return studioArt(id) === a;
  });
}
var STUDIO_ARTEN = ["geraet", "frei", "stange", "band", "koerper"];
/* Filter im Baukasten, auf der Übungsseite und im Plan-Bau: 1 Trainingsart (Fitnessstudio · Calisthenic-Park · Körpergewicht, Mehrfachwahl),
   2 Ausrüstung (Geräte, Kurzhantel, Kettlebell, Widerstandsband), 3 Muskel. Gespeichert in settings.stTrain und settings.stAusr; leer = alles. */
function studioTrainWahl(){ return selArr(state.db.settings.stTrain).filter(function(a){ return TRAIN_ARTEN.indexOf(a) > -1; }); }
function studioAusrWahl(){ return selArr(state.db.settings.stAusr).filter(function(a){ return AUSR_IDS.indexOf(a) > -1; }); }
function trainPasst(ex, fTrain){ return !fTrain.length || exTrainArten(ex).some(function(a){ return fTrain.indexOf(a) > -1; }); }
function ausrPasst(ex, fAusr){ return !fAusr.length || exAusr(ex).some(function(a){ return fAusr.indexOf(a) > -1; }); }
/* Trainingsart und Ausrüstung zusammen: beide müssen passen (innerhalb einer Gruppe genügt eine) */
function studioFilterOk(id, fTrain, fAusr){ var ex = findExercise(id); return !!ex && trainPasst(ex, fTrain) && ausrPasst(ex, fAusr); }
/* Gerät im Fitnessstudio: Smith, Kabelzug, Langhantel, Kurzhantel, Maschine; Auswahl in settings.stGeraete (nur noch für die Suche und Tests) */
function studioGeraetOk(id, fGer){ return !fGer.length || fGer.indexOf(STUDIO_GERAET[id]) > -1; }
/* Ausrüstung und Studio-Geräte zusammen: wer beides wählt, bekommt Übungen, die zu einer der Wahlen passen */
function studioAusrOk(id, fArt, fGer){
  if(!fArt.length && !fGer.length) return true;
  return (fArt.length > 0 && studioArtPasst(id, fArt)) || (fGer.length > 0 && studioGeraetOk(id, fGer));
}
var STUDIO_GERAET_ICON = { smith:'<path d="M6 3v18M18 3v18M6 10h12"/>', kabel:'<path d="M12 3v6M8 3h8"/><circle cx="12" cy="12" r="3"/><path d="M12 15v6"/>', lh:EQUIP_ICON.bar, kh:EQUIP_ICON.db, maschine:EQUIP_ICON.gym };
var STUDIO_AUSR_ICON = { kb:EQUIP_ICON.kb, band:EQUIP_ICON.band };
var STUDIO_ART_ICON = { geraet:CAT_ICON.weight, frei:EQUIP_ICON.kb, stange:EQUIP_ICON.bar, band:EQUIP_ICON.band, koerper:EQUIP_ICON.none };
/* Frühere Gruppen-Chips, die jetzt zur Ausrüstung gehören (Langhantel, Kurzhantel & Kettlebell, Stange & Barren, Körpergewicht), in die Ausrüstung umziehen;
   die früheren Chips „Kabel“ und „Langhantel“ stehen jetzt unter „Fitnessstudio“ */
function studioFilterAlt(){
  var s = state.db.settings, umzug = { lh:"geraet", frei:"frei", stange:"stange", air:"koerper" }, gr = selArr(s.stGruppen), neu = [], arten = selArr(s.stArten), geaendert = false;
  var muskel = { brust:1, ruecken:1, schulter:1, arme:1, bauch:"rumpf", beine:1 }, zonen = selArr(s.stZonen);
  gr.forEach(function(id){
    if(umzug[id]){ if(arten.indexOf(umzug[id]) < 0) arten.push(umzug[id]); geaendert = true; }
    else if(muskel[id]){   // Muskelgruppen sind jetzt Teil der Muskel-Auswahl (Chips + Figur): in Zonen umrechnen
      var z = KK_GRUPPE_ZONEN[muskel[id] === 1 ? id : muskel[id]] || [];
      z.forEach(function(x){ if(zonen.indexOf(x) < 0) zonen.push(x); });
      s.stZonen = zonen; geaendert = true;
    } else neu.push(id);
  });
  var arten2 = [];
  arten.forEach(function(a){ var n = (a === "kabel" || a === "lh") ? "geraet" : a; if(n !== a) geaendert = true; if(arten2.indexOf(n) < 0) arten2.push(n); });
  if(geaendert){ s.stGruppen = neu; s.stArten = arten2; save(); }
  if(!s.stFilterV2){   // früher: Ausrüstungs-Chips und Studio-Geräte -> jetzt Trainingsart und Ausrüstung
    var tr = selArr(s.stTrain), au = selArr(s.stAusr);
    function dazu(l, x){ if(l.indexOf(x) < 0) l.push(x); }
    arten2.forEach(function(a){
      if(a === "geraet") dazu(tr, "studio"); else if(a === "stange") dazu(tr, "cali"); else if(a === "koerper") dazu(tr, "body");
      else if(a === "band") dazu(au, "band"); else if(a === "frei"){ dazu(au, "kh"); dazu(au, "kb"); }
    });
    selArr(s.stGeraete).forEach(function(g){ dazu(au, g); });
    s.stTrain = tr; s.stAusr = au; s.stArten = []; s.stGeraete = []; s.stFilterV2 = 1; save();
  }
}
var STUDIO_GRUPPEN_ICON = { beine:CAT_ICON.legs, brust:'<path d="M4 8c2.5-2 5.5-2 8 0 2.5-2 5.5-2 8 0v5c-2 3-5.5 4-8 1.5C9.5 17 6 16 4 13z"/>',
  ruecken:CAT_ICON.back, schulter:'<circle cx="12" cy="6" r="2.5"/><path d="M4 18c0-5 3.5-8.5 8-8.5s8 3.5 8 8.5"/>', arme:CAT_ICON.arms,
  bauch:CAT_ICON.core, lh:CAT_ICON.weight, frei:EQUIP_ICON.kb, stange:EQUIP_ICON.bar, band:EQUIP_ICON.band, air:HOME_ICON.lib, eigene:'<path d="M12 5v14M5 12h14"/>' };
function studioKachel(id){
  var ex = findExercise(id);
  if(!ex) return "";
  var e = studioEintrag(id), last = e && e.log && e.log.length ? e.log[e.log.length-1] : null;
  var la = last ? arbeitsSaetze(last) : [], sub = la.length ? (la[0][0] > 0 ? studioKg(la[0][0])+" kg · " : "")+la.length+" × "+la[0][1] : t("stNoData");
  if(studioNurBlock(ex) && !la.length && zielGesetzt(id)){ sub = satzKurz(id).replace("×", " × "); last = null; }   // ohne Eintrag das selbst gesetzte Ziel: „3 × 12“ bzw. „3 × 40 s“
  return '<div class="fig-karte st-kachel" role="button" tabindex="0" data-studio="'+id+'" data-q="'+esc(exSearchText(ex))+'" style="--cat:'+studioFarbe(ex)+'">'+
    '<span class="fig-bild">'+(ILLU[id] ? illuHTML(id, "fig-illu") : '<span class="st-ohne">'+(ex.custom ? exSymbol(ex) : svgIcon(EQUIP_ICON.gym || EQUIP_ICON.db))+'</span>')+exFavBtn(id)+'</span>'+
    '<span class="fig-name">'+esc(tplText(ex.name))+'</span>'+kachelMuskel(ex)+(sub === t("stNoData") ? '' : '<span class="st-sub'+(last ? ' an' : '')+'">'+esc(sub)+'</span>')+
    (last ? wochenKurve(studioWochen(id), "st-spark") : '')+'</div>';
}
/* Anzahl der Übungen, die der Studio-Filter gerade zeigt (ohne Doppelte aus Favoriten/Zuletzt) */
function studioAnzahl(gruppen, fGr, artOk){
  var n = 0;
  gruppen.forEach(function(g){ if(!fGr.length || fGr.indexOf(g.id) > -1) n += g.ids.filter(artOk).length; });
  return n;
}
/* Filter der Übungen (Baukasten-Plan, Übungsseite, Workoutkatalog): in der Karte 1 Trainingsart · 2 Ausrüstung · 3 Muskel (Chips + Figur).
   opt.art: "Wo" für die fertigen Workouts (Katalog, dort ohne Trainingsart: das regelt der Ort oben), opt.extra: Schalter neben der Kopfzeile (A–Z) */
var TRAIN_FOTO = { studio:"img/ort-fitnessstudio.jpg", cali:"img/ort-freiluft.jpg", body:"img/neu-h-brust-2.jpg" };
function trainZahlen(){
  var n = { studio:0, cali:0, body:0 };
  EXERCISES.forEach(function(ex){ if(ex.main === "stretch" || libHidden("ex:"+ex.id)) return; exTrainArten(ex).forEach(function(a){ n[a]++; }); });
  return n;
}
/* Die drei Trainingsarten als Fotokarten nebeneinander (Mehrfachwahl); attr = Attribut der Knöpfe (data-sttrain im Filter) */
function trainFotosHTML(attr, fTrain){
  var n = trainZahlen();
  return '<div class="ort-fotos kompakt drei" role="group" aria-label="'+esc(t("trSchritt1"))+'">'+TRAIN_ARTEN.map(function(a){
    var an = fTrain.indexOf(a) > -1;
    return '<button type="button" '+attr+'="'+a+'" class="ort-foto'+(an ? ' on' : '')+'" aria-pressed="'+an+'">'+
      '<img class="of-bild" src="'+TRAIN_FOTO[a]+'" alt="" draggable="false">'+
      '<span class="of-haken" aria-hidden="true">'+svgIcon('<path d="M5 12.5l4.5 4.5L19 7.5"/>')+'</span>'+
      '<span class="of-t"><b>'+esc(t("trArt_"+a))+'</b><small>'+esc(t("katOrtUebAnz", { n:n[a] }))+'</small></span></button>';
  }).join("")+'</div>';
}
function filterSchrittHTML(nr, titel){ return '<div class="bau-schritt af-schritt"><span>'+nr+'</span>'+esc(titel)+'</div>'; }
function studioFilterHTML(gruppen, fGr, fTrain, fAusr, anzahl, zonen, opt){
  var s = state.db.settings;
  opt = opt || {};
  var mitTrain = opt.art !== "Wo";
  var namen = fGr.map(function(id){ var g = gruppen.filter(function(x){ return x.id === id; })[0]; return g ? g.name : id; })
    .concat(mitTrain ? fTrain.map(function(a){ return t("trArt_"+a); }) : [], fAusr.map(function(g){ return t("stGer_"+g); }), zonen.map(kkName));
  /* Muskel (Chips + Figur, eine Auswahl); außer Muskeln gibt es nur noch Cardio & Ausdauer (orangenes Leuchten hinter der Figur) und Eigene Übungen */
  var extra = gruppen.filter(function(g){ return g.ids.length && !g.air && (g.id === "cardio" || g.id === "eigene"); }).map(function(g){
    return filterChip("data-stgr", g.id, fGr.indexOf(g.id) > -1, svgIcon(STUDIO_GRUPPEN_ICON[g.id] || CAT_ICON.weight), g.name); }).join("");
  return filterKarteHTML({ offen:!!s.stFilterOpen, toggle:"data-sttoggle", reset:"data-streset", n:namen.length,
    summe:namen.length ? namen.join(", ") : t(opt.art === "Wo" ? "afAlleWo" : "afAlleEx"),
    zeigen:filterZeigenText(anzahl, opt.art || "Ex"), extra:opt.extra,
    inhalt:(mitTrain ? filterSchrittHTML(1, t("trSchritt1"))+trainFotosHTML("data-sttrain", fTrain) : '')+
      filterSchrittHTML(mitTrain ? 2 : 1, t("stGerKopf"))+
      '<div class="fc-chips af-ausr">'+AUSR_IDS.map(function(g){
        return filterChip("data-stausr", g, fAusr.indexOf(g) > -1, svgIcon(STUDIO_GERAET_ICON[g] || STUDIO_AUSR_ICON[g]), t("stGer_"+g)); }).join("")+'</div>'+
      filterSchrittHTML(mitTrain ? 3 : 2, t("trSchritt3"))+
      kkMuskelHTML("data-stzone", "data-stgrp", zonen, { extra:extra, glow:fGr.indexOf("cardio") > -1, ohneLabel:true }) });
}
function studioFilterBinden(fGr, fTrain, fAusr, zonen, neuZeichnen){
  var s = state.db.settings;
  app.querySelectorAll("[data-stzone]").forEach(function(b){ b.addEventListener("click", function(){ s.stZonen = selToggle(zonen, b.getAttribute("data-stzone")); save(); neuZeichnen(); }); });
  app.querySelectorAll("[data-stgrp]").forEach(function(b){ b.addEventListener("click", function(){ s.stZonen = kkGrpToggle(zonen, b.getAttribute("data-stgrp")); save(); neuZeichnen(); }); });
  app.querySelectorAll("[data-stgr]").forEach(function(b){ b.addEventListener("click", function(){ s.stGruppen = selToggle(fGr, b.getAttribute("data-stgr")); save(); neuZeichnen(); }); });
  app.querySelectorAll("[data-sttrain]").forEach(function(b){ b.addEventListener("click", function(){ s.stTrain = selToggle(fTrain, b.getAttribute("data-sttrain")); save(); neuZeichnen(); }); });
  app.querySelectorAll("[data-stausr]").forEach(function(b){ b.addEventListener("click", function(){ s.stAusr = selToggle(fAusr, b.getAttribute("data-stausr")); save(); neuZeichnen(); }); });
  // Auf/zu steht in den Einstellungen, damit die Karte beim Neuzeichnen (nach jedem Antippen) offen bleibt - Mehrfachauswahl ohne ständiges Aufklappen
  app.querySelectorAll("[data-sttoggle]").forEach(function(b){ b.addEventListener("click", function(){ s.stFilterOpen = !s.stFilterOpen; save(); neuZeichnen(); }); });
  var zur = app.querySelector("[data-streset]");
  if(zur) zur.addEventListener("click", function(){ s.stGruppen = []; s.stTrain = []; s.stAusr = []; s.stZonen = []; save(); neuZeichnen(); });
}
/* Studio und Air sind der Katalog (js/11b-katalog.js): renderStudio zeigt den Reiter bzw. die Plan-Seite, die gerade dran ist */
function renderStudio(){ return renderKatalog(); }

/* ============ Timer ============
   Blöcke und Timer-Workouts haben eine eigene Seite (renderIntervall, Schnellwahl auf der Startseite); die Liste baut timerPanelHTML. */
/* ============ Neuer Timer (das einzige Plus auf der Timer-Seite) ============
   Zwei Stufen: Sätze (Anzahl, Zeit, Pause dazwischen) in Runden (Anzahl, Pause danach); der Zirkel ist entfallen.
   Daraus entsteht ein Timer-Workout aus einem Block mit den Sätzen, das sich wie jedes andere abspielen und im Editor ändern lässt. */
function timerPlusWerte(){
  var p = state.db.settings.timerPlus || {};
  function z(v, std, min, max){ v = parseInt(v); return clamp(isNaN(v) ? std : v, min, max); }
  return { zn:1, zp:0, rn:z(p.rn, 3, 1, 20), rp:z(p.rp, 30, 0, 600), en:z(p.en, 6, 1, 30), ew:z(p.ew, 30, 5, 600), ep:z(p.ep, 10, 0, 300) };   // Zirkel gibt es nicht mehr: Sätze (en, ew, ep) und Runden (rn, rp)
}
function timerPlusSekunden(p){
  var runde = p.en*p.ew + (p.en - 1)*p.ep;   // ein Durchgang aller Sätze
  return p.rn*runde + (p.rn - 1)*p.rp;
}
function timerPlusBauen(p, name){
  var now = Date.now(), items = [], r;
  var b = { id:uid(), name:t("timerSatzBlock", { s:p.ew }), reps:p.en, workSec:p.ew, restSec:p.ep, updatedAt:now };   // die Sätze: oben im Timer die Runden (Kreise), unten die Sätze (Kästchen)
  state.db.blocks.push(b);
  for(r = 1; r <= p.rn; r++) items.push({ blockId:b.id, restAfterSec:r < p.rn ? p.rp : 0 });
  var w = { id:uid(), name:(name || "").trim() || t("timerAuto", { m:Math.max(1, Math.round(timerPlusSekunden(p)/60)) }), items:items, updatedAt:now };   // eigener Name, sonst „Timer · 12 Min“
  state.db.workouts.push(w); save();
  return w;
}
/* Werte eines Timers aus „Neuer Timer“ (ein Block, gleichmäßige Pausen zwischen den Runden); sonst null, dann öffnet sich der Editor */
function timerPlusAus(w){
  var its = w && w.items || [], b = its.length ? findBlock(its[0].blockId) : null, i;
  if(!b) return null;
  for(i = 0; i < its.length; i++){
    if(its[i].blockId !== b.id) return null;
    if(i < its.length - 1 && (its[i].restAfterSec || 0) !== (its[0].restAfterSec || 0)) return null;
  }
  return { rn:its.length, rp:its.length > 1 ? (its[0].restAfterSec || 0) : timerPlusWerte().rp, en:b.reps, ew:b.workSec, ep:b.restSec };
}
/* Timer nachträglich ändern: Sätze und Runden im selben Fenster wie beim Anlegen; komplexere Timer (mehrere Blöcke) öffnen den Editor */
function timerBearbeiten(id){
  var w = findWorkout(id), p = w && timerPlusAus(w);
  if(!w) return;
  if(!p){ go("#workout/"+id); return; }
  openTimerPlus(w, p);
}
function timerPlusAendern(w, p, name){
  var b = findBlock(w.items[0].blockId), now = Date.now(), r;
  var autoAlt = b.name === t("timerSatzBlock", { s:b.workSec });   // eigener Blockname bleibt erhalten
  b.reps = p.en; b.workSec = p.ew; b.restSec = p.ep; b.updatedAt = now;
  if(autoAlt) b.name = t("timerSatzBlock", { s:p.ew });
  w.items = []; for(r = 1; r <= p.rn; r++) w.items.push({ blockId:b.id, restAfterSec:r < p.rn ? p.rp : 0 });
  w.name = (name || "").trim() || t("timerAuto", { m:Math.max(1, Math.round(timerPlusSekunden(p)/60)) });
  w.updatedAt = now; save();
}
function openTimerPlus(bearb, vorgabe){
  var p = vorgabe ? { zn:1, zp:0, rn:vorgabe.rn, rp:vorgabe.rp, en:vorgabe.en, ew:vorgabe.ew, ep:vorgabe.ep } : timerPlusWerte(), root = document.getElementById("overlayRoot");
  if(bearb && bearb.target) bearb = null;   // als Klick-Handler aufgerufen: neuer Timer
  function zeile(label, id, v, min, max, schritt){ return '<div class="tp-zeile"><label for="'+id+'">'+esc(label)+'</label>'+stepperHTML(id, v, min, max, schritt)+'</div>'; }
  function gruppe(nr, titel, sub, zeilen){ return '<div class="tp-gruppe"><div class="tp-kopf"><i>'+nr+'</i><span><b>'+esc(titel)+'</b><small>'+esc(sub)+'</small></span></div>'+zeilen+'</div>'; }
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet tp-sheet" role="dialog" aria-label="'+esc(t("fabTimer"))+'"><h3>'+esc(bearb ? t("timerBearbeiten") : t("fabTimer"))+'</h3>'+
    '<div class="tp-name"><label for="tp-name">'+esc(t("name"))+'</label><input type="text" id="tp-name" maxlength="60" value="'+esc(bearb ? (bearb.name || "") : "")+'" placeholder="'+esc(t("timerNamePh"))+'"></div>'+
    gruppe(1, t("timerUebungen"), t("timerUebungenSub"), zeile(t("timerAnzahl"), "tp-en", p.en, 1, 30, 1)+zeile(t("timerZeitS"), "tp-ew", p.ew, 5, 600, 5)+zeile(t("timerPauseS"), "tp-ep", p.ep, 0, 300, 5))+
    gruppe(2, t("timerRunden"), t("timerRundenSub"), zeile(t("timerAnzahl"), "tp-rn", p.rn, 1, 20, 1)+zeile(t("timerPauseS"), "tp-rp", p.rp, 0, 600, 5))+
    '<div class="tp-summe" id="tp-summe"></div>'+
    '<div class="btn-row"><button class="btn btn-secondary" data-cancel>'+esc(t("cancel"))+'</button><button class="btn btn-primary" data-tpok>'+esc(bearb ? t("save") : t("create"))+'</button></div></div></div>';
  function lesen(){
    var q = {}; ["rn", "rp", "en", "ew", "ep"].forEach(function(k){ q[k] = root.querySelector("#tp-"+k).value; });
    if(bearb){   // beim Bearbeiten bleiben die Vorgaben für neue Timer unverändert
      var alt = state.db.settings.timerPlus; state.db.settings.timerPlus = q; p = timerPlusWerte(); state.db.settings.timerPlus = alt; return p;
    }
    state.db.settings.timerPlus = q; p = timerPlusWerte(); return p;
  }
  function summe(){ var q = lesen(); root.querySelector("#tp-summe").textContent = t("timerGesamt", { d:fmtDuration(timerPlusSekunden(q)), n:q.rn*q.en }); }
  bindSteppers(root, summe); root.querySelectorAll(".stepper input").forEach(function(i){ i.addEventListener("input", summe); });
  summe();
  function zu(){ root.innerHTML = ""; }
  root.querySelector("[data-cancel]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
  root.querySelector("[data-tpok]").addEventListener("click", function(){
    var q = lesen(), nm = root.querySelector("#tp-name").value;
    if(bearb){ timerPlusAendern(bearb, q, nm); zu(); render(); return; }
    save(); zu(); timerPlusBauen(q, nm); go("#intervall");
  });
}
function timerPanelHTML(hw){
  var tws = state.db.workouts.slice().sort(function(a,b){ return (b.updatedAt||0)-(a.updatedAt||0); });
  return '<div class="timer-panel">'+hw.z(0, "page-hint")+
    '<div class="section-title">'+t("mineTimer")+'</div>'+(tws.length ? tws.map(timerWorkoutRow).join("") : '<div class="fav-empty">'+esc(t("timerNoWo"))+'</div>')+'</div>';
}
function timerFabHTML(){
  return fabMenuHTML([{ key:"timerplus", label:t("fabTimer"), ico:ICON_PLUS, cls:"ti" }]);   // ein einziges Plus
}
/* Timer: eigene Seite (früher je ein Reiter in Air und Studio, mit derselben Liste). Erreichbar über die Schnellwahl auf der Startseite.
   Blöcke (eine Übung mit Runden, Arbeit, Pause) und Timer-Workouts (mehrere Blöcke hintereinander) in der Timer-Farbe (--ti-color);
   angelegt werden sie über das Plus. */
function renderIntervall(){
  var hw = hinweise("timer", ["timerHint"]);
  app.innerHTML = (themeIstDunkel() ? runHintergrundHTML("timer-bg") : "") + bereichKopfNeuHTML("intervall", t("tabTimer"), t("timerKicker"), hw.knopf, { klar:true }) +   // Zurück führt zu Training
    timerPanelHTML(hw) + '<div style="height:90px"></div>' + timerFabHTML();
  bindCommon();
  function neu(){ var y = window.scrollY; renderIntervall(); window.scrollTo(0, y); }
  function on(sel, fn){ app.querySelectorAll(sel).forEach(function(el){ el.addEventListener("click", function(e){ e.stopPropagation(); fn(el, e); }); }); }
  on("[data-play]", function(el){ if(!el.disabled) go("#play/"+el.getAttribute("data-play")); });
  on("[data-playblock]", function(el){ go("#playblock/"+el.getAttribute("data-playblock")); });
  on("[data-twedit]", function(el){ timerBearbeiten(el.getAttribute("data-twedit")); });
  on("[data-fav]", function(el){ toggleFav(el.getAttribute("data-fav")); neu(); });
  bindTrash(neu);
  bindFabMenu({ "timerplus": openTimerPlus });
}

/* ============ Studio: Mein Plan ============
   Mehrere eigene Pläne aus Studio-Übungen: settings.stPlaene = [{ id, name, ids:[Übungs-IDs in Reihenfolge], updatedAt }].
   Das Plus legt einen neuen Plan an; Übungen werden wie im Workout-Baukasten von Air durch Antippen gewählt (Nummer = Reihenfolge,
   nochmal antippen = raus). Ein Tipp auf eine Übung im fertigen Plan öffnet ihre Karte zum Eintragen. */
var stPlanHerkunft = null;   // '''#koerper''', wenn der BLOC aus einem Trainingsplan der Arena geöffnet wurde: Zurück führt dorthin
var stPlanAktiv = null, stPlanBauen = false, stPlanQuery = "", stPlanSel = -1;   // stPlanSel: im Plan-Bau ausgewählte Übung des Plans (zum Verschieben)
function stPlaene(){ var s = state.db.settings; if(!Array.isArray(s.stPlaene)) s.stPlaene = []; return s.stPlaene; }
function stPlanFind(id){ var l = stPlaene(); for(var i=0;i<l.length;i++) if(l[i].id === id) return l[i]; return null; }
function stPlanIds(p){   // nur Übungen, die es noch gibt, jede nur einmal
  var da = {};
  return (Array.isArray(p.ids) ? p.ids : []).filter(function(id){ if(da[id] || !findExercise(id)) return false; da[id] = true; return true; });
}
/* Wie eine Übung gerade gemacht wird: "saetze" (Satz für Satz eintragen) oder "timer". Im geöffneten Plan gilt die Wahl des Plans: die Einstellung der Übung
   in diesem Plan (p.modus[id]), sonst die Art, mit der der Plan angelegt wurde (p.standard = Nach Zeit → Timer, Nach Sätzen → Satz für Satz).
   Außerhalb eines Plans gilt die Wahl der Übung selbst (studio[id].modus); ohne Wahl starten Übungen mit Gewicht mit Sätzen, Übungen ohne Gewicht
   (nur Block, aus Air) mit dem Timer. */
function studioModusPlan(id){
  var p = stPlanAktiv ? stPlanFind(stPlanAktiv) : null;
  return p && stPlanIds(p).indexOf(id) > -1 ? p : null;
}
function studioModus(id){
  var p = studioModusPlan(id);
  if(p){
    var pm = (p.modus && p.modus[id]) || p.standard;
    if(pm === "timer" || pm === "saetze") return pm;
  }
  var e = studioEintrag(id);
  if(e && (e.modus === "timer" || e.modus === "saetze")) return e.modus;
  return studioNurBlock(findExercise(id)) ? "timer" : "saetze";
}
function studioModusSetzen(id, m){
  m = m === "timer" ? "timer" : "saetze";
  var p = studioModusPlan(id);
  if(p){ p.modus = p.modus || {}; p.modus[id] = m; p.updatedAt = Date.now(); }
  else { var a = studioAlle(); (a[id] || (a[id] = { log:[] })).modus = m; }
  save();
}
/* So heißen Sätze überall: „3 Sätze × 12“ (Wiederholungen) bzw. „3 Sätze × 40 s“ (Timer); nach einem Eintrag „40 kg · 3 Sätze × 12“ */
function satzName(n){ return n === 1 ? t("satzEins") : t("satzMehr", { n:n }); }
function satzZiel(id){
  var ex = findExercise(id);
  if(studioNurBlock(ex) && studioModus(id) === "timer"){ var tb = studioTimer(id); return satzName(tb.reps)+" × "+tb.work+" s"; }
  var z = studioZiel(id);
  return satzName(z.saetze)+" × "+z.wdh;
}
function satzKurz(id){   // „3×12“ bzw. „3×40 s“ für die kleinen Plan-Kacheln
  var ex = findExercise(id);
  if(studioNurBlock(ex) && studioModus(id) === "timer"){ var tb = studioTimer(id); return tb.reps+"×"+tb.work+" s"; }
  var z = studioZiel(id);
  return z.saetze+"×"+z.wdh;
}
function satzLetzter(id){
  var e = studioEintrag(id), last = e && e.log && e.log.length ? e.log[e.log.length-1] : null;
  var la = last ? arbeitsSaetze(last) : [];
  if(!la.length) return "";
  return (la[0][0] > 0 ? studioKg(la[0][0])+" kg · " : "")+satzName(la.length)+" × "+la[0][1];
}
/* Ein Ziel steht nur auf Kacheln, wenn man es selbst eingestellt hat (Sätze oder Wiederholungen im Plan oder auf der Übungskarte) - die
   Voreinstellung „3 × 12“ erscheint dort nicht, die trägt man ja selbst ein; der Timer rechnet intern weiter mit ihr. */
function zielGesetzt(id){
  var e = studioEintrag(id), z = e && e.ziel;
  return !!(z && (z.saetze > 0 || z.wdh > 0));
}
function satzZielAnzeige(id){ return zielGesetzt(id) ? satzZiel(id) : ""; }
function studioSub(id){
  return satzLetzter(id) || satzZielAnzeige(id) || t("stNoData");
}
/* Kachel in Übersicht und Baukasten (Fitnessstudio): letzter Satz bzw. selbst gesetztes Ziel, sonst leer */
function gymSatzKachel(id){
  var ex = findExercise(id);
  if(!ex || !exIstStudio(ex)) return "";
  return satzLetzter(id) || satzZielAnzeige(id);
}
/* Fitnessstudio-Übung in einem Workout mit Timer: vorn steht Gewicht × Wiederholungen („40 kg · 3 × 12“, ohne Eintrag das Ziel „3 × 12“);
   leer bei allen anderen Übungen */
function gymSatzText(id, auchFrei){   // auchFrei: im Plan-Workout zählen auch Freiluft-Übungen mit Gewicht (Kurzhantel, Kettlebell)
  var ex = findExercise(id);
  if(!exIstStudio(ex) && !(auchFrei && ex && !studioNurBlock(ex) && ex.main !== "stretch")) return "";
  return satzLetzter(id) || satzZiel(id);
}
/* Unter dem Namen einer Kachel: wofür die Übung da ist - die ersten zwei Hauptmuskeln in Kurzform, klein. Ohne Muskeldaten (eigene Übungen) entfällt die Zeile. */
function kachelMuskel(ex){ var m = ex && musclesMain(ex); return m ? '<span class="st-mus">'+esc(m.split(", ").slice(0, 2).join(", "))+'</span>' : ''; }
/* Studio-Kacheln im Plan: Muskeln und - falls schon eingetragen - der letzte Satz bzw. die Zeit (kein „–“ mehr ohne Daten) */
function studioUnter(id){
  var sub = studioSub(id);   // letzter Satz oder selbst gesetztes Ziel; ohne beides nur die Muskeln
  return kachelMuskel(findExercise(id))+(sub === t("stNoData") ? '' : '<span class="st-sub">'+esc(sub)+'</span>');
}
function planAnzahl(n){ return n === 1 ? t("planOne") : t("planN", { n:n }); }
/* ---------- Supersätze und Zirkel ----------
   Aufeinanderfolgende Übungen eines Plans können zu einem Block verbunden werden (p.blk = { Übungs-ID: Block-ID }): zwei Übungen = Supersatz,
   drei und mehr = Zirkel. Ein Block läuft abwechselnd: eine Runde = je ein Satz jeder Übung, die Pause kommt erst nach der Runde; die Sätze
   (Runden) sind für alle Übungen des Blocks gleich. */
function planBloecke(p){
  var blk = p.blk || {}, out = [], cur = null;
  stPlanIds(p).forEach(function(id){
    var b = blk[id] || null;
    if(b && cur && cur.b === b) cur.ids.push(id);
    else { cur = { b:b, ids:[id] }; out.push(cur); }
  });
  return out;
}
function blockArt(n){ return n >= 3 ? "zirkel" : "super"; }
function planBlockVon(p, id){   // der Block (mit mindestens zwei Übungen), zu dem die Übung gehört, sonst null
  var l = planBloecke(p);
  for(var i = 0; i < l.length; i++) if(l[i].ids.length > 1 && l[i].ids.indexOf(id) > -1) return l[i];
  return null;
}
/* Übung i und i+1 verbinden bzw. - wenn sie schon im selben Block stehen - dort trennen */
function planVerbinden(p, i){
  var ids = stPlanIds(p), a = ids[i], b = ids[i+1];
  if(!a || !b) return;
  var blk = p.blk = p.blk || {};
  if(blk[a] && blk[a] === blk[b]){   // trennen: alles ab i+1 bekommt einen neuen Block
    var alt = blk[a], neu = uid();
    for(var j = i+1; j < ids.length && blk[ids[j]] === alt; j++) blk[ids[j]] = neu;
  } else {                            // verbinden: auch der ganze Block der nächsten Übung kommt mit
    var bid = blk[a] || uid(), bb = blk[b];
    blk[a] = bid;
    ids.forEach(function(id){ if(id === b || (bb && blk[id] === bb)) blk[id] = bid; });
    var runden = studioZiel(a).saetze;   // alle Übungen des Blocks gehen gleich viele Runden
    planBloecke(p).forEach(function(bl){
      if(bl.b !== bid) return;
      bl.ids.forEach(function(id){ var en = studioAlle()[id] || (studioAlle()[id] = { log:[] }); en.ziel = en.ziel || {}; en.ziel.saetze = runden; });
    });
  }
  // Einzelne Übungen brauchen keine Block-ID
  var noch = {};
  planBloecke(p).forEach(function(bl){ if(bl.ids.length > 1) bl.ids.forEach(function(id){ noch[id] = bl.b; }); });
  Object.keys(blk).forEach(function(id){ if(!noch[id]) delete blk[id]; });
  p.updatedAt = Date.now(); save();
}
/* Timer-Workout aus einem Plan: Einzelübungen laufen mit allen Sätzen hintereinander, Blöcke abwechselnd (je Runde ein Satz jeder Übung, die Pause
   erst nach der Runde); beide Seiten einer einseitigen Übung gehören zu einem Satz */
function planTimerItems(p){
  var out = [];
  planBloecke(p).forEach(function(bl){
    if(bl.ids.length < 2){
      var id = bl.ids[0], ex = findExercise(id), tm = studioTimer(id);
      out.push({ ex:id, reps:ex.perSide ? tm.reps*2 : tm.reps, work:tm.work, rest:tm.rest });
      return;
    }
    var runden = Math.max.apply(null, bl.ids.map(function(id){ return studioTimer(id).reps; }));
    for(var r = 0; r < runden; r++){
      bl.ids.forEach(function(id, k){
        var ex = findExercise(id), tm = studioTimer(id), letzte = k === bl.ids.length-1;
        out.push({ ex:id, reps:ex.perSide ? 2 : 1, work:tm.work, rest:ex.perSide ? 5 : tm.rest, after:letzte ? tm.rest : 0 });
      });
    }
  });
  return out;
}
/* Der Plan als Programm (wie in Heavy): je Übung eine Zeile mit Sätzen, Wiederholungen, Gewicht und Pause zum schnellen Einstellen, darunter das letzte Mal.
   Die Werte stehen je Übung (studioZiel, Arbeitsgewicht, Pause) und gelten damit auch auf der Übungskarte und im Timer. Übungen ohne Gewicht (nur Block)
   haben Sätze, Arbeitszeit und Pause. */
function planFeldHTML(feld, label, wert, min, max, schritt){
  return '<div class="st-feld"><label>'+esc(label)+'</label><div class="stepper st-step pz-step" data-feld="'+feld+'" data-min="'+min+'" data-max="'+max+'" data-schritt="'+schritt+'">'+
    '<button type="button" data-dec aria-label="&minus;">&minus;</button>'+
    '<input type="text" inputmode="decimal" value="'+esc(studioKg(wert))+'" aria-label="'+esc(label)+'">'+
    '<button type="button" data-inc aria-label="&plus;">&plus;</button></div></div>';
}
function planZeileHTML(id, nr, bl, p){   // bl: { art, k, n, bid } - die Übung steht in einem Supersatz oder Zirkel
  var ex = findExercise(id);
  if(!ex) return "";
  var block = studioNurBlock(ex), z = studioZiel(id), tm = studioTimer(id), e = studioEintrag(id) || {}, l = studioLetzte(id, true);
  var timerModus = block || (!!p && planStartArt(p) === "timer");   // mit Timer: Sätze, Arbeitszeit und Pause je Übung einstellbar; nach Sätzen: Wiederholungen und Gewicht
  // Sätze, dann Wiederholungen (Satz-Modus) bzw. Arbeitszeit (Timer), Gewicht (nur Übungen mit Gewicht) und Pause
  var felder = planFeldHTML("saetze", t(bl ? "blkRunden" : "planSaetze"), z.saetze, 1, 20, 1)+
    (timerModus ? planFeldHTML("work", t("planArbeit"), tm.work, 5, 600, 5) : planFeldHTML("wdh", t("stReps"), z.wdh, 1, 100, 1))+
    (block ? '' : planFeldHTML("kg", t("planKg"), studioArbeitsKg(id), 0, 500, z.schritt))+
    (block ? planFeldHTML("pause", t("planPause"), tm.rest, 0, 600, 5) : planFeldHTML("pause", t("planPause"), e.pause || 90, 0, 600, 15));
  return '<div class="pz-zeile'+(bl ? ' pz-imblock' : '')+'" data-pz="'+id+'"'+(bl ? ' data-pzblk="'+esc(bl.bid)+'"' : '')+' style="--cat:'+studioFarbe(ex)+'">'+
    '<div class="pz-kopf" role="button" tabindex="0" data-studio="'+id+'" aria-label="'+esc(tplText(ex.name))+'">'+
      '<span class="pz-bild">'+(ILLU[id] ? illuStillHTML(id, "pz-illu") : '<span class="st-ohne">'+(findExercise(id) && findExercise(id).custom ? exSymbol(findExercise(id)) : svgIcon(EQUIP_ICON.gym || EQUIP_ICON.db))+'</span>')+'</span>'+
      '<span class="pz-text"><span class="pz-name"><i>'+nr+'</i> '+esc(tplText(ex.name))+'</span>'+kachelMuskel(ex)+
        (bl ? '<span class="pz-bm">'+esc(t(bl.art === "zirkel" ? "blkZirkel" : "blkSuper"))+' · '+bl.k+'/'+bl.n+'</span>' : '')+
        '<span class="pz-letzte'+(l ? ' an' : '')+'">'+(l ? esc(t("planZuletzt", { d:studioTagText(l.at), s:studioLetzteText(l) })) : esc(t("planNochNie")))+'</span>'+
        (function(){ var tp = studioSteigerTipp(id); return tp ? '<span class="pz-tipp"><span>↑ '+esc(tp.art === "kg" ? t("tippKurzKg", { kg:studioKg(tp.kg), p:tp.prozent }) : t("tippKurzWdh", { n:tp.wdh }))+'</span><button type="button" data-pzup="'+id+'">'+esc(t("tippUebernehmen"))+'</button></span>' : ''; })()+
        (e.notiz && e.notiz.trim() ? '<span class="pz-notiz">'+esc(e.notiz.trim())+'</span>' : '')+'</span>'+   // die Notiz der Übung erscheint beim nächsten Mal wieder
      '<span class="pz-pfeil" aria-hidden="true">'+ICON_CHEV+'</span></div>'+
    '<div class="st-eingabe pz-felder'+(block ? ' drei' : '')+'">'+felder+'</div></div>';
}
/* Die Zeilen des Plans: Einzelübungen und Blöcke (Supersatz, Zirkel) mit einem Knopf zwischen je zwei Übungen zum Verbinden bzw. Trennen */
function planListeHTML(p){
  var ids = stPlanIds(p), i = 0, teile = [];
  var ICON_LINK = '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>';
  function verbinder(von, verbunden){
    return '<div class="pz-verbinder"><button type="button" class="pz-link'+(verbunden ? ' an' : '')+'" data-pzlink="'+von+'" aria-label="'+esc(t(verbunden ? "blkTrennen" : "blkVerbindenTitel"))+'">'+
      svgIcon(ICON_LINK)+' '+esc(t(verbunden ? "blkTrennen" : "blkVerbinden"))+'</button></div>';
  }
  planBloecke(p).forEach(function(b){
    var art = blockArt(b.ids.length), im = b.ids.length > 1, zeilen = [];
    b.ids.forEach(function(id, k){
      zeilen.push(planZeileHTML(id, i+1, im ? { art:art, k:k+1, n:b.ids.length, bid:b.b } : null, p));
      if(k < b.ids.length-1) zeilen.push(verbinder(i, true));
      i++;
    });
    var runden = im ? studioZiel(b.ids[0]).saetze : 0;
    teile.push({ html: im ? '<div class="pz-block pz-'+art+'"><div class="pz-blockkopf"><b>'+esc(t(art === "zirkel" ? "blkZirkel" : "blkSuper"))+'</b><span>'+
        esc(t("blkRundenN", { n:runden })+" · "+t("blkAbwechselnd"))+'</span></div>'+zeilen.join("")+'</div>' : zeilen.join(""), letzte:i-1 });
  });
  return teile.map(function(x, k){ return x.html+(k < teile.length-1 ? verbinder(x.letzte, false) : ""); }).join("");
}
/* Oben auf der Plan-Seite: „Für alle gleich“ - alle Übungen auf einmal Satz für Satz oder mit Timer stellen - und die Zeiten des Timers wie im
   Workout-Baukasten (Für alle gleich: Runden, Arbeit, Pause für alle Timer-Übungen; Je Übung: die Werte der Zeilen; Pause zwischen den Übungen).
   Die Voreinstellung je Übung kommt aus der Art, mit der der Plan angelegt wurde (p.standard); einzelne Zeilen lassen sich umstellen (p.modus). */
/* Oben auf der Plan-Seite nur noch: Pause zwischen den Übungen (es gibt ein einziges „Los geht’s“, das alle Übungen im Training-Bereich laufen lässt) */
function planKopfKarteHTML(p, ids){
  var rests = [0, 15, 30, 45, 60, 90, 120], br = p.blockRest != null ? p.blockRest : 45;
  if(rests.indexOf(br) < 0) rests.push(br);
  return '<div class="card pz-kopfkarte"><label for="pk-br">'+esc(t("myRest"))+'</label>'+
    '<select id="pk-br">'+rests.sort(function(a, b){ return a - b; }).map(function(v){
      return '<option value="'+v+'"'+(v === br ? ' selected' : '')+'>'+v+' s</option>'; }).join("")+'</select></div>';
}
function planKopfKarteBinden(p, ids, neu){
  var br = app.querySelector("#pk-br");
  if(br) br.addEventListener("change", function(){ p.blockRest = parseInt(br.value) || 0; p.updatedAt = Date.now(); save(); neu(); });
}
/* ---------- Workout-Planer: ein BLOC (die Übungen mit Sätzen, Gewicht, Pause) oder mehrere hintereinander, ein „Los geht’s“ ----------
   p.folge = [BLOC-IDs]: weitere BLOCs, die nach diesem kommen. Zwischen zwei BLOCs fragt das Training „Bereit für …?“ (Pause mit Überspringen). */
/* Wie das Training läuft: nach Sätzen (Gewicht × Wiederholungen je Übung eintragen) oder mit Timer; ohne Wahl gilt die Art, mit der der BLOC angelegt wurde */
function planStartArt(p){
  if(p.startArt === "saetze" || p.startArt === "timer") return p.startArt;
  if(p.standard === "saetze" || p.standard === "timer") return p.standard;
  return bauModus() === "timer" ? "timer" : "saetze";
}
function planFolge(p){ return (Array.isArray(p.folge) ? p.folge : []).map(stPlanFind).filter(function(q){ return q && q !== p; }); }
function planKetteIds(p){   // alle Übungen des BLOCs und der folgenden, jede nur einmal (für Training speichern)
  var out = stPlanIds(p).slice();
  planFolge(p).forEach(function(q){ stPlanIds(q).forEach(function(id){ if(out.indexOf(id) < 0) out.push(id); }); });
  return out;
}
/* Entwurf zum festen BLOC machen (erscheint dann unter BLOCs) */
function planSpeichernStill(p){
  if(!p.entwurf) return;
  delete p.entwurf; p.updatedAt = Date.now(); save();
}
function planKopie(p){
  var q = JSON.parse(JSON.stringify(p));
  q.id = uid(); q.name = t("planKopieName", { n:p.name }); q.updatedAt = Date.now(); delete q.entwurf; delete q.fromWo; delete q.parent; q.folge = [];
  stPlaene().push(q); save();
  return q;
}
function planSaetzeSumme(ids){
  return ids.reduce(function(a, id){ return findExercise(id) ? a + studioZiel(id).saetze : a; }, 0);
}
function planSummeText(ids){
  return planAnzahl(ids.length)+(ids.length ? " · "+t("planSaetzeGesamt", { n:planSaetzeSumme(ids) }) : "");
}
/* fn() läuft nach jeder Änderung (Summe oben nachführen); gespeichert wird sofort. neuZeichnen: Seite neu aufbauen (nach dem Umschalten Satz ↔ Timer) */
function planZeilenBinden(root, fn, neuZeichnen, p){
  if(p) root.querySelectorAll("[data-pzlink]").forEach(function(b){   // zwei Übungen zu Supersatz oder Zirkel verbinden bzw. wieder trennen
    b.addEventListener("click", function(){ planVerbinden(p, +b.getAttribute("data-pzlink")); if(neuZeichnen) neuZeichnen(); });
  });
  root.querySelectorAll(".pz-zeile").forEach(function(zeile){
    var id = zeile.getAttribute("data-pz");
    var up = zeile.querySelector("[data-pzup]");   // Vorschlag „5 % mehr“ übernehmen: Arbeitsgewicht (bzw. Wiederholungsziel) wird gesetzt
    if(up) up.addEventListener("click", function(ev){
      ev.stopPropagation();
      var tp = studioSteigerTipp(id), a = studioAlle(), en = a[id] || (a[id] = { log:[] }); if(!tp) return;
      if(tp.art === "kg") en.kg = tp.kg; else { en.ziel = en.ziel || {}; en.ziel.wdh = tp.wdh; }
      en.erhoeht = Date.now(); save(); if(neuZeichnen) neuZeichnen();
    });
    function eintrag(){ var a = studioAlle(); return a[id] || (a[id] = { log:[] }); }
    function setzen(feld, v){
      var en = eintrag(); if(feld === "saetze" || feld === "wdh" || feld === "kg") en.manuell = Date.now();   // von Hand angepasst: gilt wieder, spätere Auto-Anhebung wertet nur neuere Einheiten aus
      if(feld === "saetze" || feld === "wdh"){ en.ziel = en.ziel || {}; en.ziel[feld] = v; }
      else if(feld === "kg") en.kg = v;
      else if(feld === "pause"){ en.pause = v; if(en.timer) delete en.timer.rest; }   // die Pause des Timers folgt der Pause der Übung
      else {   // Runden, Arbeit, Pause des Timers: nur was gesetzt wurde, der Rest folgt weiter den Voreinstellungen
        var alt = en.timer || {};
        en.timer = {};
        ["reps", "work", "rest"].forEach(function(k){ if(alt[k] != null) en.timer[k] = alt[k]; });
        en.timer[feld] = v;
      }
      if(feld === "saetze"){   // die Runden eines Blocks sind für alle seine Übungen gleich
        var bid = zeile.getAttribute("data-pzblk");
        if(bid) root.querySelectorAll('.pz-zeile[data-pzblk="'+bid+'"]').forEach(function(z2){
          var id2 = z2.getAttribute("data-pz");
          if(id2 === id) return;
          var e2 = studioAlle()[id2] || (studioAlle()[id2] = { log:[] });
          e2.ziel = e2.ziel || {}; e2.ziel.saetze = v; e2.manuell = Date.now();
          var inp = z2.querySelector('[data-feld="saetze"] input'); if(inp) inp.value = studioKg(v);
        });
      }
      save();
      fn();
    }
    zeile.querySelectorAll("[data-pzmodus]").forEach(function(b){   // je Übung: Satz für Satz oder mit Timer
      b.addEventListener("click", function(){
        var m = b.getAttribute("data-pzmodus") === "timer" ? "timer" : "saetze";
        if(studioModus(id) === m) return;
        studioModusSetzen(id, m);
        if(neuZeichnen) neuZeichnen();
      });
    });
    var start = zeile.querySelector("[data-pzstart]");   // nur diese Übung mit dem Timer starten
    if(start) start.addEventListener("click", function(){ go("#playst/"+id); });
    zeile.querySelectorAll(".pz-step").forEach(function(st){
      var feld = st.getAttribute("data-feld"), input = st.querySelector("input");
      var min = parseFloat(st.getAttribute("data-min")), max = parseFloat(st.getAttribute("data-max")), sch = parseFloat(st.getAttribute("data-schritt"));
      function wert(){ var x = parseFloat(String(input.value).replace(",", ".")); return isFinite(x) ? x : min; }
      function los(v){
        v = Math.round(Math.min(max, Math.max(min, v))*100)/100;
        input.value = studioKg(v);
        setzen(feld, v);
      }
      st.querySelector("[data-dec]").addEventListener("click", function(){ los(wert() - sch); });
      st.querySelector("[data-inc]").addEventListener("click", function(){ los(wert() + sch); });
      input.addEventListener("change", function(){ los(wert()); });
      input.addEventListener("focus", function(){ input.select(); });
    });
  });
}
/* Plan als Workout mit Timer: Air- und Studio-Übungen laufen hintereinander (Studio-Übungen mit ihren Satz- und Pausenwerten);
   eine Kopie unter Meine, die beim erneuten Starten aktualisiert wird. Öffnet das Deckblatt mit „Los geht’s“ (auch aus dem Kalender) */
/* Der BLOC (mit allen folgenden) als Workout für den Training-Bereich: Übungen nacheinander, je Satz Gewicht und Wiederholungen eintragen (mitGewicht);
   eine Kopie unter Meine, die beim erneuten Starten aktualisiert wird. direkt: gleich ins Training (ohne Deckblatt); sonst das Deckblatt (aus dem Kalender) */
function planMitItems(p){
  var items = planTimerItems(p);
  planFolge(p).forEach(function(q){
    var l = planTimerItems(q);
    if(l.length){ l[0].bloc = q.name; items = items.concat(l); }
  });
  return items;
}
function planMw(p){
  var items = planMitItems(p);
  var mw = (state.db.myWorkouts || []).filter(function(x){ return x.fromPlan === p.id; })[0];
  var br = p.blockRest != null ? p.blockRest : 45;   // Pause zwischen den Übungen
  if(mw){ mw.name = p.name; mw.items = items; mw.blockRest = br; mw.updatedAt = Date.now(); save(); }
  else { mw = createMyFromDraft({ name:p.name, mode:"individual", reps:6, work:30, rest:10, blockRest:br, items:items }); mw.fromPlan = p.id; save(); }
  return mw;
}
function planAlsWorkout(p, direkt){
  var mw = planMw(p);
  coverDraft = null;
  go((direkt ? "#playmy/" : "#cover/my/")+mw.id);
}
function renderStudioPlan(){
  var p = stPlanAktiv && stPlanFind(stPlanAktiv);
  if(!p){ stPlanAktiv = null; stPlanBauen = false; return renderKatalog(); }
  var ids = stPlanIds(p), pos = {}, html;
  ids.forEach(function(id, i){ pos[id] = [i+1]; });
  var hw = stPlanBauen ? hinweise("planbau", ["planTippen"]) : hinweise("planzeilen", ["planZeilenHint"]);
  html = topbar(p.name, { back:"#katalog", right:hw.knopf+(stPlanBauen ? lupeHTML("pl", stPlanQuery) : "") });
  if(stPlanBauen){
    /* Plan-Bau auf dem Katalog: dieselben Bereiche und Filter wie unter Übungen (Air und Studio gemeinsam), zugeklappt mit „n gewählt“;
       oben die Körperkarte des Plans (viel, am Rande, Lücken), damit man beim Antippen sieht, was noch fehlt */
    var gruppen = katalogGruppen(), da = katGruppeIds(gruppen), gueltig = {};
    gruppen.forEach(function(g){ gueltig[g.id] = true; });
    var s = state.db.settings; studioFilterAlt();
    var fGr = selArr(s.stGruppen).filter(function(id){ return gueltig[id]; });
    var fTrain = studioTrainWahl(), fAusr = studioAusrWahl();
    var zonen = kkNorm(s.stZonen), filterAn = !!(fGr.length || fTrain.length || fAusr.length || zonen.length);
    // Trainingsart, Ausrüstung und Muskel stehen im Filter (leer = alles)
    function artOk(id){ var ex = findExercise(id); return !!ex && studioFilterOk(id, fTrain, fAusr) && (!zonen.length || zonePasst(ex, zonen)); }
    var rest = ids.filter(function(id){ return !da[id]; });   // Übungen im Plan, die in keinem Bereich stehen (z. B. ausgeblendete)
    html += '<div class="card nm-weg"><label for="plan-name">'+t("name")+'</label><input type="text" id="plan-name" value="'+esc(p.name)+'" maxlength="60"></div>'+
      (ids.length ? kkKopfHTML(ids) : '')+
      // Der Plan selbst: die gewählten Übungen in ihrer Reihenfolge. Bleibt beim Scrollen oben stehen; antippen wählt eine Übung aus,
      // dann verschieben ◀ ▶ sie und ✕ nimmt sie heraus.
      '<div class="plan-sticky" id="plan-sticky"><div class="plan-sticky-kopf"><b>'+esc(t("planKopf"))+'</b><span>'+esc(ids.length ? planAnzahl(ids.length) : t("planNochLeer"))+'</span></div>'+
        (ids.length ? '<div class="wb-streifen">'+ids.map(function(id, i){
          var ex = findExercise(id);
          return ex ? '<button type="button" class="wb-mini'+(stPlanSel === i ? ' sel' : '')+'" data-plansel="'+i+'" style="--cat:'+studioFarbe(ex)+'" aria-pressed="'+(stPlanSel === i)+'" aria-label="'+esc((i+1)+". "+tplText(ex.name)+", "+satzZiel(id))+'">'+
            (ILLU[id] ? illuStillHTML(id, "wb-mini-illu") : (ex.custom ? '<span class="ex-symbol mini">'+exSymbol(ex)+'</span>' : ''))+'<span class="wb-mini-nr">'+(i+1)+'</span><span class="wb-mini-name">'+esc(tplText(ex.name))+'</span>'+(zielGesetzt(id) ? '<span class="wb-mini-sub">'+esc(satzKurz(id))+'</span>' : '')+'</button>' : "";
        }).join("")+'</div>'+
          (stPlanSel > -1 && stPlanSel < ids.length ? '<div class="plan-ctrl"><button type="button" data-planmv="-1" aria-label="'+esc(t("moveLeft"))+'"'+(stPlanSel === 0 ? ' disabled' : '')+'>&#9664;</button>'+
            '<button type="button" class="del" data-plandelsel>'+ICON_TRASH+' '+esc(t("planRaus"))+'</button>'+
            '<button type="button" data-planmv="1" aria-label="'+esc(t("moveRight"))+'"'+(stPlanSel === ids.length-1 ? ' disabled' : '')+'>&#9654;</button></div>' : '') : '')+'</div>'+
      tippZeileHTML("info", "tippInfo")+hw.z(0, "page-hint")+suchFeldHTML(stPlanQuery, "pl", t("stSearch"))+
      studioFilterHTML(gruppen, fGr, fTrain, fAusr, studioAnzahl(gruppen, fGr, artOk), zonen);
    if(rest.length) gruppen = gruppen.concat([{ id:"rest", name:t("planSonst"), ids:rest, immer:true }]);
    function planKachel(id){
      var ex = findExercise(id);
      // Angaben wie bei Übungen: letzter Satz bzw. Zeit unter dem Namen
      return ex ? uebKachel({ bild:id, name:tplText(ex.name), attr:'data-planex="'+id+'"', q:exSearchText(ex), cat:studioFarbe(ex), nr:pos[id] || [],
        unter:studioUnter(id) }) : "";
    }
    gruppen.forEach(function(g){
      if(!g.immer && fGr.length && fGr.indexOf(g.id) < 0) return;
      var gids = g.immer ? g.ids : g.ids.filter(artOk);
      if(!gids.length) return;
      var gewaehlt = gids.filter(function(id){ return pos[id]; }).length;
      html += katZeileHTML("pl-"+g.id, katIcon(g.id), g.name, gids.length,
        '<div class="fig-grid">'+gids.map(planKachel).join("")+'</div>', katOffenStd("pl-"+g.id, !!g.immer),
        gewaehlt ? '<span class="kat-n">'+esc(t("katGewaehlt", { n:gewaehlt }))+'</span>' : '',
        gids.every(function(id){ return exIstStudio(findExercise(id)); }));
    });
    html += '<div class="empty" data-noresult style="display:none;padding:30px 20px;">'+esc(t("stNone"))+'</div>'+
      (p.entwurf ? '' : '<button type="button" class="btn btn-danger" data-plandel style="margin-top:18px;">'+ICON_TRASH+' '+t("planDel")+'</button>')+
      '<div style="height:96px"></div>'+
      '<div class="wb-leiste"><div class="wb-leiste-in"><span><b>'+esc(planAnzahl(ids.length))+'</b></span>'+
      // neuer Plan: erst „Weiter“ zu Sätzen, Gewichten und Zeiten (Plan-Seite), gespeichert wird dort mit „Plan speichern“; bestehender Plan: „Fertig“
      '<span class="wb-knoepfe"><button type="button" class="btn btn-primary" data-plandone'+(p.entwurf && !ids.length ? ' disabled' : '')+'>'+(p.entwurf ? esc(t("planWeiter"))+' ›' : ICON_SAVE+' '+t("planDone"))+'</button></span></div></div>';
  } else {
    // Plan = Programm: je Übung Sätze, Wiederholungen, Gewicht und Pause gleich hier einstellen; das letzte Mal steht darunter
    html += '<div class="plan-kopf"><b id="plan-summe">'+esc(planSummeText(ids))+'</b><span class="plan-kopf-re">'+favBtn("plan:"+p.id)+'<button type="button" class="ghost plan-edit" data-planedit>'+svgIcon(ICON_EDIT)+' '+t("planEdit")+'</button></span></div>'+
      (ids.length ? hw.z(0, "page-hint") : '')+
      (ids.length ? '<div class="seg-row pz-art" role="group" aria-label="'+esc(t("planArtFrage"))+'">'+
          ['saetze', 'timer'].map(function(m){ var an = planStartArt(p) === m; return '<button type="button" data-planart="'+m+'" class="'+(an ? 'active' : '')+'" aria-pressed="'+an+'">'+(m === 'timer' ? ICON_PLAY+' ' : '')+esc(t(m === 'timer' ? 'stModusTimer' : 'stModusSaetze'))+'</button>'; }).join("")+'</div>'+
        '' : '')+
      (ids.length ? planKopfKarteHTML(p, ids) : '')+
      (ids.length ? auswertungHTML(ids) : '')+   // erst die Übersicht über die Übungen im Ganzen, dann die Zeilen
      (ids.length ? '<div class="pz-liste">'+planListeHTML(p)+'</div>' : '<div class="fav-empty">'+esc(t("planEmpty"))+'</div>')+
      // dynamische Leiste: links „Plan speichern“ (beim gespeicherten BLOC „Training speichern“), rechts immer „LOS GEHTS!“
      (ids.length ? '<div class="wb-leiste tr-leiste"><div class="wb-leiste-in">'+
        (p.entwurf ? '<button type="button" class="btn btn-secondary" data-plansave>'+ICON_SAVE+' '+esc(t("planSpeichern"))+'</button>'
          : '<button type="button" class="btn btn-secondary" data-trsave>✓ '+esc(t(einheitHeute(p) ? "trAktual" : "trSpeichern"))+'</button>')+
        '<span class="wb-knoepfe"><button type="button" class="btn btn-primary" data-planlos>'+ICON_PLAY+' '+esc(t("letsGoBig"))+'</button></span></div></div>' : '')+
      '<div style="height:'+(ids.length ? 96 : 40)+'px"></div>';
  }
  app.innerHTML = html;
  // Zurück führt zur Liste unter „Meine“, nicht aus dem Katalog heraus
  var zur = app.querySelector("[data-back]");
  if(zur){ zur.removeAttribute("data-back"); zur.addEventListener("click", function(){
    planVerlassen(p, function(){ var hk = stPlanHerkunft || (typeof programmKontextFuer === 'function' && programmKontextFuer('plan:'+p.id) ? '#koerper' : null); if(hk && !stPlanBauen){ stPlanHerkunft = null; stPlanAktiv = null; goBack(hk); return; } stPlanAktiv = p.parent && stPlanFind(p.parent) ? p.parent : null; stPlanBauen = false; stPlanQuery = ""; renderKatalog(); window.scrollTo(0, 0); });   // ein neuer, nicht gespeicherter Plan fragt nach; ein weiterer BLOC führt zurück zum Workout-Planer
  }); }
  bindCommon();
  function neu(){ var y = window.scrollY; renderKatalog(); window.scrollTo(0, y); }
  function an(sel, fn){ var el = app.querySelector(sel); if(el) el.addEventListener("click", fn); }
  an("[data-planedit]", function(){ stPlanBauen = true; stPlanSel = -1; stPlanQuery = ""; renderKatalog(); window.scrollTo(0, 0); });
  if(!stPlanBauen && ids.length && !p.entwurf) trainingLeisteBinden({ plan:p, ids:ids }, neu);
  if(!stPlanBauen && ids.length) planKopfKarteBinden(p, ids, neu);
  if(!stPlanBauen) planZeilenBinden(app, function(){   // Summe der Sätze oben nachführen
    var su = app.querySelector("#plan-summe");
    if(su) su.textContent = planSummeText(stPlanIds(p));
  }, neu, p);
  an("[data-plandone]", function(){   // Auswahl fertig: zur Plan-Seite (bei einem neuen Plan noch Entwurf - dort Sätze, Gewichte, Zeiten, dann „Plan speichern“)
    stPlanBauen = false; stPlanSel = -1; stPlanQuery = ""; renderKatalog(); window.scrollTo(0, 0);
  });
  an("[data-plansave]", function(){   // erst jetzt steht der neue BLOC unter BLOCs; nur kurzes Rütteln und ein Hinweis, man bleibt auf der Seite
    planSpeichernStill(p);
    vibrate(30); showToast(t("blocGespeichert"));
    neu();
  });
  /* Plan als Workout mit Timer: Air- und Studio-Übungen laufen hintereinander (Studio-Übungen mit ihren Satz- und Pausenwerten);
     eine Kopie unter Meine, die beim erneuten Starten aktualisiert wird */
  app.querySelectorAll("[data-planart]").forEach(function(b){ b.addEventListener("click", function(){ p.startArt = b.getAttribute("data-planart"); p.updatedAt = Date.now(); save(); neu(); }); });
  function planLos(){   // erst die Wahl darüber (nach Sätzen oder mit Timer), dann ein einziges Los geht’s in den passenden Bereich
    if(planStartArt(p) === "timer") planAlsWorkout(p, true);
    else go("#satz/"+p.id+"/0");   // nach Sätzen: Glas-Bereich zum Wischen, je Satz Gewicht × Wiederholungen eintragen
  }
  an("[data-planlos]", function(){
    if(!p.entwurf) return planLos();
    openActionSheet(t("planLosFrage"), [   // noch nicht gespeichert: nachfragen
      { ico:P_CHECK, label:t("planLosSpeichern"), fn:function(){ planSpeichernStill(p); vibrate(30); planLos(); } },
      { ico:P_PLAY, label:t("planLosOhne"), fn:planLos }
    ]);
  });
  an(".plan-kopf [data-fav]", function(){ toggleFav("plan:"+p.id); neu(); });   // sichtbar nur der Stern; Kopieren, Teilen, Löschen per langem Drücken auf die Zeile
  var pk = app.querySelector(".plan-kopf");
  if(pk && !stPlanBauen) langDruck(pk, function(){
    openActionSheet(p.name, [
      { ico:ICON_EDIT, label:t("umbenennen"), fn:function(){ umbenennenSheet(p.name, function(v){ p.name = v; p.updatedAt = Date.now(); save(); neu(); }); } },
      { ico:ICON_COPY, label:t("actCopy"), fn:function(){ var q = planKopie(p); showToast(t("planKopiert", { n:q.name })); } },
      { ico:P_SHARE, label:t("share"), fn:function(){ var mw = planMw(p); shareDraft(draftFromMy(mw)); } },
      { ico:P_TRASH, label:t("del"), danger:true, fn:function(){ var d = app.querySelector("[data-plandel]"); if(d) d.click(); else planLoeschen(); } }
    ]);
  });
  function planLoeschen(){
    confirmSheet(t("planDelQ"), "„"+p.name+"“ – "+t("cantUndo"), t("del"), function(){
      state.db.settings.stPlaene = stPlaene().filter(function(x){ return x.id !== p.id; });
      stPlanAktiv = null; stPlanBauen = false; save(); renderKatalog(); window.scrollTo(0, 0);
      showToast(t("deletedToast", { n:p.name }));
    });
  }
  an("[data-plandel]", planLoeschen);
  var nm = app.querySelector("#plan-name");
  if(nm) nm.addEventListener("input", function(){ p.name = nm.value.trim() || t("planDefault", { n:stPlaene().indexOf(p)+1 }); p.updatedAt = Date.now(); save(); });
  kachelKlick(app, "[data-planex]", function(el){
    var id = el.getAttribute("data-planex"), l = stPlanIds(p), i = l.indexOf(id);
    if(i > -1) l.splice(i, 1); else l.push(id);
    stPlanSel = -1;
    p.ids = l; p.updatedAt = Date.now(); save(); ankerNeuZeichnen("data-planex", id, neu);   // die Kachel bleibt, wo sie ist (oben kommen Körperkarte und Plan dazu)
  });
  // Plan oben: Übung antippen = auswählen, ◀ ▶ verschieben, Papierkorb nimmt sie heraus
  app.querySelectorAll("[data-plansel]").forEach(function(b){
    b.addEventListener("click", function(){ var i = +b.getAttribute("data-plansel"); stPlanSel = stPlanSel === i ? -1 : i; neu(); });
  });
  app.querySelectorAll("[data-planmv]").forEach(function(b){
    b.addEventListener("click", function(){
      var l = stPlanIds(p), j = stPlanSel + (+b.getAttribute("data-planmv"));
      if(stPlanSel < 0 || j < 0 || j >= l.length) return;
      var x = l.splice(stPlanSel, 1)[0]; l.splice(j, 0, x);
      p.ids = l; p.updatedAt = Date.now(); stPlanSel = j; save(); neu();
    });
  });
  an("[data-plandelsel]", function(){
    var l = stPlanIds(p);
    if(stPlanSel > -1 && stPlanSel < l.length){ l.splice(stPlanSel, 1); p.ids = l; p.updatedAt = Date.now(); save(); }
    stPlanSel = -1; neu();
  });
  kachelKlick(app, "[data-studio]", function(el){   // im BLOC öffnet der Tipp auf eine Übung den Wisch-Bereich bei dieser Übung (nur beim Auswählen im Plan-Bau bleibt die Übungskarte)
    var sid = el.getAttribute("data-studio");
    if(!stPlanBauen && stPlanIds(p).indexOf(sid) > -1) go("#satz/"+p.id+"/"+satzListe(p).indexOf(sid)); else go("#studio/"+sid);
  });
  app.querySelectorAll("[data-planex]").forEach(function(el){ var id = el.getAttribute("data-planex"); langDruck(el, function(){ openExInfo(id, false); }); });   // Info nur per Langdruck
  if(stPlanBauen){
    var stPl = app.querySelector("#plan-sticky"), tbPl = app.querySelector(".topbar");   // der Plan klebt direkt unter der Kopfzeile
    if(stPl && tbPl) stPl.style.top = Math.max(0, Math.round(tbPl.getBoundingClientRect().height) - 2)+"px";
    var sb = state.db.settings, gb = katalogGruppen(), gv = {}, filterB;
    gb.forEach(function(g){ gv[g.id] = true; });
    var fgB = selArr(sb.stGruppen).filter(function(id){ return gv[id]; });
    filterB = !!(fgB.length || studioTrainWahl().length || studioAusrWahl().length || kkNorm(sb.stZonen).length);
    studioFilterBinden(fgB, studioTrainWahl(), studioAusrWahl(), kkNorm(sb.stZonen), neu);
    katBinden(function(){ return stPlanQuery; });
    var q = app.querySelector("#pl-q");
    if(q){
      var suchen = function(){
        applySearch(app, stPlanQuery);
        katSuche(stPlanQuery, false);
      };
      q.addEventListener("input", function(){ stPlanQuery = q.value; suchen(); });
      if(stPlanQuery) suchen();
    }
  }
}

