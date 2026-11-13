"use strict";
/* Plan nach Gewichtung: Reglerwerte je Muskelgruppe (zusammen 100 %), Anzahl der Übungen, Trainingsart und Ausrüstung; verteilt nach größtem Rest und zieht passende Übungen */
/* Übungen, aus denen „Plan nach Gewichtung“ zieht: alles, was zur gewählten Trainingsart und Ausrüstung passt (nichts gewählt = alles);
   ohne Dehnübungen und ausgeblendete */
function stGenPool(f){   // f: { train:[...], ausr:[...] }
  f = f || {};
  var train = selArr(f.train), ausr = selArr(f.ausr);
  return EXERCISES.filter(function(ex){
    return ex.main !== "stretch" && !libHidden("ex:"+ex.id) && trainPasst(ex, train) && ausrPasst(ex, ausr);
  });
}
function stGenBauen(w, n, f){
  var tot = MUSKEL_GRP.reduce(function(a, g){ return a + (w[g.id] || 0); }, 0);
  if(!tot) return [];
  var q = MUSKEL_GRP.map(function(g){ var raw = (w[g.id] || 0)*n/tot; return { g:g.id, k:Math.floor(raw), rest:raw - Math.floor(raw) }; });
  var diff = n - q.reduce(function(a, x){ return a + x.k; }, 0);
  q.slice().sort(function(a, b){ return b.rest - a.rest; }).slice(0, diff).forEach(function(x){ x.k++; });
  var pools = {};
  stGenPool(f).forEach(function(ex){
    var v = mgVerteilung(ex), best = null;
    Object.keys(v).forEach(function(g){ if(best === null || v[g] > v[best]) best = g; });
    if(best) (pools[best] = pools[best] || []).push(ex.id);
  });
  var aus = [];
  q.forEach(function(x){ shuffle(pools[x.g] || []).slice(0, x.k).forEach(function(id){ aus.push(id); }); });
  return aus;
}
/* Körpermodell oben: je höher die Gewichtung einer Gruppe, desto kräftiger rot (ab 35 % voll), 0 % bleibt grau; folgt der gewählten Ansicht (grob/fein) */
function stGenFigurHTML(w){
  var wert = {}, fein = kkFeinAn();
  MUSKEL_GRP.forEach(function(g){
    var v = Math.min(1, (w[g.id] || 0)/35);
    (KK_GRUPPE_ZONEN[g.id] || []).forEach(function(z){
      var k = fein ? z : (KK_F2G[z] || z);
      wert[k] = Math.max(wert[k] || 0, v);
    });
  });
  return koerperPaar(wert);
}
/* Regler für „Nach Gewichtung“ (sitzen im Zusammenstell-Fenster, js/13-teilen-editor.js): Körpermodell, Hinweis, ein Regler je Muskelgruppe und die Zahl der Übungen.
   g = { w:{gruppe:0-100}, n }. Es sind immer genau 100 % zu verteilen. */
function genReglerHTML(g){
  var w = g.w;
  return '<div class="gen-figur" data-genfig>'+stGenFigurHTML(w)+'<small>'+esc(t("genFigur"))+'</small></div>'+
    '<div class="tm-hint sp-gen-hint">'+esc(t("genHint"))+'</div><div class="card gen-card">'+
    MUSKEL_GRP.map(function(m){
      return '<div class="gen-row"><label for="gw-'+m.id+'">'+esc(t(m.key))+'</label><input type="range" id="gw-'+m.id+'" data-gw="'+m.id+'" min="0" max="100" step="1" value="'+(w[m.id] || 0)+'">'+
        '<b data-gp="'+m.id+'">'+(w[m.id] || 0)+'%</b></div>';
    }).join("")+
    '<div class="gen-row"><label for="gw-n">'+esc(t("genAnz"))+'</label><input type="range" id="gw-n" min="3" max="20" step="1" value="'+g.n+'"><b data-gn>'+g.n+'</b></div></div>';
}
function genReglerBinden(root, g){
  var w = g.w;
  /* Wer einen Regler verschiebt, nimmt den anderen im gleichen Verhältnis etwas weg bzw. gibt ihnen etwas */
  function verteilen(id, v){
    var andere = MUSKEL_GRP.filter(function(m){ return m.id !== id; }), rest = 100 - v;
    var so = andere.reduce(function(a, m){ return a + (w[m.id] || 0); }, 0), sum = 0, gross = andere[0];
    andere.forEach(function(m){
      w[m.id] = so ? Math.round((w[m.id] || 0)*rest/so) : Math.round(rest/andere.length);
      sum += w[m.id];
      if(w[m.id] > w[gross.id]) gross = m;
    });
    w[gross.id] = Math.max(0, w[gross.id] + rest - sum);   // Rundungsrest
    w[id] = v;
    var fg = root.querySelector("[data-genfig]"), kl = fg && fg.querySelector("small");
    if(fg) fg.innerHTML = stGenFigurHTML(w) + (kl ? kl.outerHTML : "");
    MUSKEL_GRP.forEach(function(m){
      var r = root.querySelector("#gw-"+m.id), b = root.querySelector('[data-gp="'+m.id+'"]');
      if(r) r.value = w[m.id];
      if(b) b.textContent = w[m.id]+"%";
    });
  }
  root.querySelectorAll("[data-gw]").forEach(function(el){ el.addEventListener("input", function(){ verteilen(el.getAttribute("data-gw"), +el.value); }); });
  var nn = root.querySelector("#gw-n");
  if(nn) nn.addEventListener("input", function(){ g.n = +nn.value; var gn = root.querySelector("[data-gn]"); if(gn) gn.textContent = nn.value; });
}
/* Plan aus den Reglern anlegen und öffnen (Katalog › Meine ist sein Ort; er steht sofort dort) */
function genPlanErstellen(g, f){
  var ids = stGenBauen(g.w, g.n, f);
  if(!ids.length){ showToast(t("genZero")); return false; }
  var p = { id:uid(), name:t("genName"), ids:ids, updatedAt:Date.now() };
  stPlaene().push(p); save();
  stPlanAktiv = p.id; stPlanBauen = false; stPlanQuery = "";
  go("#katalog");
  return true;
}

/* Vorschlag für den nächsten Satz: in der offenen Runde der letzte Satz, sonst Arbeitsgewicht und die Wiederholungen vom letzten Mal.
   Nach einem übernommenen Steigerungs-Tipp beginnt man wieder unten im Wiederholungsbereich. erstes: noch nie trainiert und kein Gewicht eingestellt. */
function studioVorschlag(id){
  if(studioPR && studioPR.id !== id) studioPR = null;
  var e = studioEintrag(id) || {}, z = studioZiel(id), h = studioOffen(e);
  if(h && h.s.length) return { kg:h.s[h.s.length-1][0], wdh:h.s[h.s.length-1][1] };
  var vor = studioLetzte(id, false), va = vor ? arbeitsSaetze(vor) : [];
  var kg = e.kg != null ? e.kg : (vor ? (rundeArbeitsKg(vor) || 0) : 0);
  var amKg = va.filter(function(x){ return x[0] === kg; }), wdh = amKg.length ? amKg[0][1] : va.length ? va[0][1] : z.wdh;
  if(e.erhoeht && (!vor || e.erhoeht >= vor.at)) wdh = studioBereich(id).min;
  return { kg:kg, wdh:wdh, erstes:!vor && e.kg == null };
}
/* ---------- Die eine Steigerungsregel (doppelte Progression, 2026-11-12) ----------
   Gilt überall gleich: Satz-Training, Übungskarte, Plan-Ansicht und die Auswertung am Ende.
   - Steigern: in den letzten zwei Runden mit dem Arbeitsgewicht alle Ziel-Sätze mit dem oberen Rand des Bereichs (Ziel + 2) → +1 Gewichtsstufe,
     gerundet auf Vielfache des Schritts. Wäre die Stufe mehr als 10 % des Gewichts (z. B. 4 → 6,5 kg), stattdessen einmal die Wiederholungen
     anheben (Ziel + 2); beim nächsten Mal folgt der größere Sprung mit Hinweis. Ohne Gewicht: Ziel + 2 Wiederholungen.
   - Zurücknehmen: in den letzten zwei Runden im Schnitt unter der Untergrenze des Bereichs → etwa 10 % weniger Gewicht (mindestens eine Stufe).
   - Kein Tipp, wenn danach schon angepasst wurde (übernommen oder von Hand) und in der Leichtwoche; Runden der Leichtwoche (l.leicht) zählen nicht.
     Keine Rücknahme in der ersten Runde nach einer Erhöhung. Nach mehr als 14 Tagen Pause: leichter (~10 %) wieder einsteigen.
     Gezählt wird in Runden, nicht nach Uhrzeit. (Fachliche Prüfung 2026-11-12: ACSM-Rahmen 2–10 %, „2-für-2“.)
   mitOffen: die offene Runde zählt als fertig (Auswertung direkt am Ende des Trainings). */
var PROG_SPRUNG = 0.10, PROG_PAUSE_TAGE = 14, KOERPER_MAX = 20, KOERPER_NEU = 10, RPE_LEICHT = 7, PROG_DOPPEL_MAX = 0.20;
/* Tage seit der letzten Runde (jede Runde, auch Leichtwoche), in Kalendertagen - nicht in Millisekunden, sonst hängt es an der Uhrzeit (Test 3, P2) */
function studioPauseTage(e, mitOffen){
  var o = studioOffen(e), l = ((e && e.log) || []).filter(function(x){ return x.s && x.s.length && (mitOffen || x !== o); });
  if(!l.length) return 0;
  var a = new Date(l[l.length-1].at), b = new Date(); a.setHours(12, 0, 0, 0); b.setHours(12, 0, 0, 0);
  return Math.round((b - a)/86400000);
}
/* Läuft die Übung nach Zeit? Entscheidend sind die eingetragenen Sätze (Satz [kg, s, "n", 0, 1]) - so stimmen Anzeige und Steigerung überein (Test 3, P4) */
function studioNachZeit(id){
  var e = studioEintrag(id), log = (e && e.log) || [];
  for(var i = log.length - 1; i >= 0; i--) if(log[i].s && log[i].s.length) return log[i].s.some(function(x){ return x[4] === 1; });
  return studioEinheit(id) === "zeit";
}
/* Höchster oberer Rand des Wiederholungsbereichs, wenn das Ziel statt des Gewichts steigt (fachliche Prüfung Test 2): Grundübungen 15, sonst 20 */
function studioWdhGrenze(ex){
  var v = typeof mgVerteilung === "function" && ex ? mgVerteilung(ex) : {};
  return Object.keys(v).filter(function(k){ return v[k] >= 0.25; }).length >= 2 ? 15 : 20;
}
function studioRunter(kg, s){   // etwa 10 % weniger, auf Vielfache des Schritts, mindestens eine Stufe
  var r = Math.round(kg*0.9/s)*s;
  if(r >= kg - 1e-9) r = (Math.ceil(kg/s - 1e-9) - 1)*s;
  return Math.round(r*100)/100;
}
/* Assistierte Geräte (Dip/Klimmzug assistiert): das Gewicht ist Unterstützung - Fortschritt heißt weniger kg (Test 4, Q4) */
function studioAssistiert(id){ return /^assisted-/.test(String(id)); }
function studioProg(id, mitOffen){
  var e = studioEintrag(id), ex = findExercise(id);
  if(!e || !e.log || !ex) return null;
  if(studioNachZeit(id)) return studioProgZeit(id, mitOffen);
  var z = studioZiel(id), b = studioBereich(id), o = studioOffen(e);
  var l = e.log.filter(function(x){ return arbeitsSaetze(x).length && !x.leicht && (mitOffen || x !== o); });
  if(!l.length) return null;
  var kg = studioNurBlock(ex) ? 0 : studioArbeitsKg(id), letzte0 = l[l.length-1], pTage = studioPauseTage(e, false);
  var assist = studioAssistiert(id);
  if(!mitOffen && kg > 0 && pTage > PROG_PAUSE_TAGE && !(e.erhoeht && e.erhoeht >= letzte0.at) && !(e.manuell && e.manuell >= letzte0.at)){
    if(assist) return { art:"assistRunter", kg:Math.round((kg + z.schritt)*100)/100, alt:kg, tage:pTage, pause:true };   // nach Pause: etwas mehr Unterstützung
    var r0 = studioRunter(kg, z.schritt);   // lange Pause: etwas leichter wieder einsteigen
    if(r0 > 0) return { art:"pause", kg:r0, alt:kg, tage:pTage };
  }
  if(l.length < 2) return null;
  var zwei = l.slice(-2), letzte = zwei[1];
  if(e.erhoeht && e.erhoeht >= letzte.at) return null;
  if(e.manuell && e.manuell >= letzte.at) return null;
  function amGewicht(x){ return arbeitsSaetze(x).filter(function(s){ return satzTyp(s) !== "d" && (kg > 0 ? s[0] >= kg - 1e-9 : true); }); }
  function geschafft(x){
    var w = amGewicht(x).map(function(s){ return s[1]; }).sort(function(p, q){ return q - p; }).slice(0, z.saetze);
    return w.length >= z.saetze && w.every(function(n){ return n >= b.max; });
  }
  function verfehlt(x){
    var a = amGewicht(x);
    return a.length > 0 && a.reduce(function(s, q){ return s + q[1]; }, 0)/a.length < b.min;
  }
  if(assist && kg > 0){   // umgekehrte Richtung: geschafft → eine Stufe weniger Unterstützung, verfehlt → eine Stufe mehr
    if(zwei.every(geschafft)){
      var sA = zwei[0].at; for(var iA = l.length - 3; iA >= 0 && geschafft(l[iA]); iA--) sA = l[iA].at;
      var wen = Math.round(Math.max(0, kg - z.schritt)*100)/100;
      return { art:"assist", kg:wen, alt:kg, max:b.max, min:b.min, seit:sA };
    }
    if(zwei.every(verfehlt) && !(e.erhoeht && e.erhoeht > zwei[0].at)) return { art:"assistRunter", kg:Math.round((kg + z.schritt)*100)/100, alt:kg, wdh:b.min };
    return null;
  }
  if(zwei.every(geschafft)){
    var seit = zwei[0].at; for(var i = l.length - 3; i >= 0 && geschafft(l[i]); i--) seit = l[i].at;   // wie lange die Übung schon „bereit“ ist (gerechte Verteilung der Tipps)
    var basis = e.zielBasis || z.wdh, min0 = Math.max(Math.min(5, basis), basis - 2), max0 = basis + 2;   // nach der Erhöhung gilt das ursprüngliche Ziel
    if(kg > 0){
      var s = z.schritt, neu = Math.round((Math.floor(kg/s + 1e-9) + 1)*s*100)/100;
      /* RPE (wenn eingetragen, Test 4, Q3, Entscheidung Kevin): zuletzt RPE 10 am oberen Rand → noch nicht steigern;
         beide Runden höchstens RPE 7 (RIR ≥ 3) → zwei Stufen, solange das höchstens 20 % sind */
      var rpeL = arbeitsSaetze(letzte).map(function(x){ return x[3] > 0 ? x[3] : 0; }).filter(Boolean);
      var rpeAlle = zwei.reduce(function(acc, x){ return acc.concat(arbeitsSaetze(x).map(function(q){ return q[3] > 0 ? q[3] : 0; })); }, []);
      if(rpeL.length && Math.max.apply(null, rpeL) >= 10) return null;
      var rpeLeicht = rpeAlle.length && rpeAlle.every(function(r){ return r > 0 && r <= RPE_LEICHT; });
      if(rpeLeicht){ var neu2 = Math.round((neu + s)*100)/100; if((neu2 - kg)/kg <= PROG_DOPPEL_MAX + 1e-9) neu = neu2; else rpeLeicht = false; }
      var gross = (neu - kg)/kg > PROG_SPRUNG + 1e-9 && !rpeLeicht;
      var grenze = studioWdhGrenze(ex);   // neuer oberer Rand (Ziel + 2 + 2) höchstens 15 bzw. 20
      if(gross && !e.zielBasis && z.wdh > 6 && z.wdh + 4 <= grenze) return { art:"wdh", grund:"sprung", wdh:z.wdh + 2, alt:z.wdh, max:b.max, sprung:neu, seit:seit };
      /* Nach einer Rücknahme nicht sofort wieder denselben Sprung: erst die Wiederholungen festigen (bis Ziel + 4, höchstens 20) */
      /* Zweimal an derselben Stufe gescheitert: erst ein Satz mehr (bis 5), statt denselben Sprung ein drittes Mal (fachliche Prüfung Test 2) */
      if(e.ruecknahmeKg && e.ruecknahmeN >= 2 && neu >= e.ruecknahmeKg - 1e-9 && !e.satzPlus && z.saetze < 5)
        return { art:"satz", saetze:z.saetze + 1, alt:z.saetze, kg:kg, sprung:neu, seit:seit, tempo:true };
      if(e.ruecknahmeKg && neu >= e.ruecknahmeKg - 1e-9 && z.wdh > 6 && z.wdh < basis + 4 && z.wdh + 4 <= grenze)   // Hauptübungen mit Ziel bis 6 Wdh.: nur über Gewicht
        return { art:"wdh", grund:"nachRueck", wdh:z.wdh + 2, alt:z.wdh, max:b.max, sprung:neu, seit:seit, tempo:true };
      return { art:"kg", kg:neu, alt:kg, prozent:Math.round((neu/kg - 1)*100), max:b.max, min:min0, max0:max0, gross:gross, seit:seit, rpeLeicht:!!rpeLeicht };
    }
    /* Ohne Gewicht: Ziel +2 bis 20 Wdh., danach eine schwerere Variante und das Ziel wieder 8–12 (fachliche Prüfung, Test 2) */
    if(z.wdh + 4 <= KOERPER_MAX) return { art:"wdh", wdh:z.wdh + 2, alt:z.wdh, max:b.max, seit:seit };   // oberer Rand höchstens 20
    return { art:"varianteWdh", max:b.max, wdhNeu:KOERPER_NEU, min:KOERPER_NEU - 2, max0:KOERPER_NEU + 2, seit:seit, naechste:studioNaechsteStufe(id) };
  }
  if(zwei.every(verfehlt) && !(e.erhoeht && e.erhoeht > zwei[0].at)){   // erst nach zwei Runden mit dem neuen Gewicht zurücknehmen
    if(kg > 0){
      var r = studioRunter(kg, z.schritt);
      return r > 0 ? { art:"runter", kg:r, alt:kg, wdh:b.min } : null;
    }
    if(e.vorStufe && findExercise(e.vorStufe)) return { art:"stufeZurueck", naechste:e.vorStufe };   // neue Stufe zweimal klar verfehlt: zurück zur alten anbieten
    return z.wdh > 4 ? { art:"wdhRunter", wdh:Math.max(2, z.wdh - 2), alt:z.wdh } : null;
  }
  return null;
}
/* Halte- und Trageübungen (Sätze × Sekunden, Satz [kg, s, "n", 0, 1]): dieselbe Idee über die Zeit (fachliche Prüfung 2026-11-12).
   Zwei Runden lang alle Ziel-Sätze die volle Zielzeit gehalten → +5 s (bis 60 s); danach mit Gewicht (z. B. Farmer Carry) die nächste Stufe und wieder 30 s,
   ohne Gewicht eine schwerere Variante. Zweimal im Schnitt unter 75 % der Zielzeit → 5 s weniger (nicht unter 15 s). */
var ZEIT_SCHRITT = 5, ZEIT_MAX = 60, ZEIT_NEU = 30, ZEIT_MIN = 15;
function studioProgZeit(id, mitOffen){
  var e = studioEintrag(id), ex = findExercise(id), z = studioZiel(id), o = studioOffen(e), ziel = studioTimer(id).work;
  function sek(x){ return arbeitsSaetze(x).filter(function(s){ return s[4] === 1; }).map(function(s){ return s[1]; }); }
  var l = e.log.filter(function(x){ return sek(x).length && !x.leicht && (mitOffen || x !== o); });
  if(!l.length || !(ziel > 0)) return null;
  var l0 = l[l.length-1];
  var pT = studioPauseTage(e, false);
  if(!mitOffen && pT > PROG_PAUSE_TAGE && !(e.erhoeht && e.erhoeht >= l0.at) && !(e.manuell && e.manuell >= l0.at) && ziel - ZEIT_SCHRITT >= ZEIT_MIN)
    return { art:"zeitRunter", grund:"pause", sek:ziel - ZEIT_SCHRITT, alt:ziel, tage:pT };   // lange Pause: etwas kürzer wieder einsteigen
  if(l.length < 2) return null;
  var zwei = l.slice(-2), letzte = zwei[1];
  if(e.erhoeht && e.erhoeht >= letzte.at) return null;
  if(e.manuell && e.manuell >= letzte.at) return null;
  var kg = studioNurBlock(ex) ? 0 : studioArbeitsKg(id);
  function geschafft(x){ var w = sek(x).sort(function(p, q){ return q - p; }).slice(0, z.saetze); return w.length >= z.saetze && w.every(function(n){ return n >= ziel; }); }
  function verfehlt(x){ var w = sek(x); return w.reduce(function(a, n){ return a + n; }, 0)/w.length < ziel*0.75; }
  if(zwei.every(geschafft)){
    var seit = zwei[0].at; for(var i = l.length - 3; i >= 0 && geschafft(l[i]); i--) seit = l[i].at;
    if(ziel + ZEIT_SCHRITT <= ZEIT_MAX) return { art:"zeit", sek:ziel + ZEIT_SCHRITT, alt:ziel, seit:seit };
    if(kg > 0){ var s = z.schritt, neu = Math.round((Math.floor(kg/s + 1e-9) + 1)*s*100)/100; return { art:"kg", kg:neu, alt:kg, prozent:Math.round((neu/kg - 1)*100), zeitNeu:ZEIT_NEU, sekAlt:ziel, seit:seit }; }
    return { art:"variante", alt:ziel, seit:seit, naechste:studioNaechsteStufe(id) };
  }
  if(zwei.every(verfehlt) && e.vorStufe && findExercise(e.vorStufe) && kg === 0) return { art:"stufeZurueck", naechste:e.vorStufe, zeit:true };
  if(zwei.every(verfehlt) && !(e.erhoeht && e.erhoeht > zwei[0].at) && ziel - ZEIT_SCHRITT >= ZEIT_MIN) return { art:"zeitRunter", sek:ziel - ZEIT_SCHRITT, alt:ziel };
  return null;
}
/* Tipps für ein Training: höchstens zwei Steigerungen auf einmal (in der Reihenfolge des Plans, große Übungen stehen vorn), in der Leichtwoche keine.
   Rücknahmen (zurück, nach Pause) sind Sicherheitshinweise und zählen nicht mit. Gibt { id: Tipp } zurück. */
var PROG_MAX_TIPPS = 2;
/* Höchstens zwei Steigerungen je Training - gerecht verteilt (Test 2, N1): die Übungen, die am längsten „bereit“ sind, kommen zuerst (tp.seit),
   bei Gleichstand die Reihenfolge des Plans. Die übrigen stehen in studioTippsWartend (Hinweis „bereit für mehr“ auf der Karte). */
var studioTippsWartend = [];
/* „Nicht jetzt“ (Test 4, Q1/Q9, Entscheidung Kevin): ein Steigerungs-Tipp ruht danach vier Runden dieser Übung; die Plätze gehen solange an andere */
var TIPP_RUHE_RUNDEN = 4;
function studioTippRuht(id){
  var e = studioEintrag(id); if(!e || !e.tippRuhe) return false;
  var n = (e.log || []).filter(function(l){ return l.at > e.tippRuhe && arbeitsSaetze(l).length; }).length;
  return n < TIPP_RUHE_RUNDEN;
}
function studioTippAblehnen(id){ var a = studioAlle(), en = a[id] || (a[id] = { log:[] }); en.tippRuhe = Date.now(); save(); }
function studioTippSicher(tp){ return tp.art === "runter" || tp.art === "wdhRunter" || tp.art === "pause" || tp.art === "zeitRunter" || tp.art === "stufeZurueck" || tp.art === "assistRunter"; }
function studioTipps(ids, leicht, mitOffen){
  var o = {}, steig = [];
  studioTippsWartend = [];
  if(leicht) return o;
  ids.forEach(function(id, k){
    var tp = studioProg(id, mitOffen); if(!tp) return;
    if(studioTippSicher(tp)) o[id] = tp;
    else if(!studioTippRuht(id)){ var ex = findExercise(id); steig.push({ id:id, tp:tp, k:k, grund:ex && studioWdhGrenze(ex) === 15 ? 0 : 1 }); }   // „Nicht jetzt“: ruht
  });
  // längste Wartezeit zuerst, bei Gleichstand Grundübungen, dann die Reihenfolge des Plans; ohne Wartezeit hinten
  steig.sort(function(a, b){ return ((a.tp.seit || Infinity) - (b.tp.seit || Infinity)) || a.grund - b.grund || a.k - b.k; });
  steig.forEach(function(x, i){ if(i < PROG_MAX_TIPPS) o[x.id] = x.tp; else studioTippsWartend.push(x.id); });
  return o;
}
/* Kalibrieren (Test 4, Q5): in den ersten zwei Runden einer Übung mit Gewicht, wenn alle Ziel-Sätze heute am oberen Rand lagen, fragt die Satzkarte
   „Wie schwer war das?“. „Leicht“ → zwei Stufen mehr (höchstens +20 %, mindestens eine Stufe), danach nicht mehr fragen. */
function studioKalibrierFrage(id, h){
  var e = studioEintrag(id), ex = findExercise(id);
  if(!e || !h || e.kalibriert || !ex || studioNurBlock(ex) || studioAssistiert(id) || studioNachZeit(id)) return false;
  var runden = (e.log || []).filter(function(l){ return arbeitsSaetze(l).length; }).length;
  if(runden > 2) return false;
  var z = studioZiel(id), b = studioBereich(id), a = arbeitsSaetze(h);
  return a.length >= z.saetze && a.every(function(x){ return x[0] > 0 && x[1] >= b.max; });
}
function studioKalibrieren(id, leicht){
  var a = studioAlle(), en = a[id] || (a[id] = { log:[] }), z = studioZiel(id), kg = studioArbeitsKg(id), neu = null;
  en.kalibriert = true;
  if(leicht && kg > 0){
    var s = z.schritt, grenze = /squat|deadlift/.test(id) ? 0.10 : PROG_DOPPEL_MAX;   // Kniebeuge und Kreuzheben höchstens +10 %
    var zwei = Math.round((Math.floor(kg/s + 1e-9) + 2)*s*100)/100, max = Math.floor(kg*(1 + grenze)/s + 1e-9)*s;
    neu = Math.round(Math.max(Math.round((Math.floor(kg/s + 1e-9) + 1)*s*100)/100, Math.min(zwei, max))*100)/100;
    en.kg = neu; en.erhoeht = Date.now();
  }
  save();
  return neu;
}
/* Variantenketten (LZ_KETTEN, leicht → schwer; „Passt es nicht?“ im Infofenster nutzt dieselben): die nächste Stufe einer Übung ohne Gewicht.
   Nur Kraftketten - Sprung- und Cardio-Ketten werden nicht per Tipp gesteigert (KETTE_OHNE_TIPP). */
var KETTE_OHNE_TIPP = { "jump-squats":1, "jump-forward-squats":1, "tuck-jumps":1, "plank-burpees":1, "burpees":1, "burpee-squat-jumps":1, "jump-forward-burpees":1, "burpee-pull-ups":1,
  "jumping-jacks":1, "high-knees":1, "sprint-in-place":1, "lateral-hops":1, "skater-jumps":1,
  "clap-push-ups":1, "dragon-flags":1, "jump-lunges":1, "pistol-squats":1 };   // Fortgeschritten: nie automatisch   // Power-/Sprungübungen: nur über „Passt es nicht?“, nicht per Tipp (fachliche Prüfung)
var KETTE_BEWEGLICH = { "pistol-assist":1, "pistol-squats":1 };
var KETTE_STANGE = /^hanging-|toes-to-bar|pull-ups?$|chin-ups|scapular-pull-ups|negative-pull-ups/;   // nächste Stufe braucht eine Stange: Hinweis   // nächste Stufe braucht viel Beweglichkeit: Hinweis im Tipp
var KETTE_START_KURZ = { "copenhagen-plank":15, "hollow-hold":15, "l-sit":15 };   // anspruchsvolle Halteübungen starten kürzer
function studioNaechsteStufe(id){
  if(KETTE_OHNE_TIPP[id] || typeof leichterSchwerer !== "function") return null;
  var lz = leichterSchwerer(id);
  return lz && lz.s && !KETTE_OHNE_TIPP[lz.s] ? lz.s : null;
}
/* Übung in einem BLOC durch die nächste Stufe ersetzen (Block-Zugehörigkeit und Modus wandern mit); die neue Übung startet unten im Bereich bzw. mit 25 s */
var KETTE_START_SEK = 25;
function ketteStartSek(id){ return KETTE_START_KURZ[id] || KETTE_START_SEK; }
function planVarianteTauschen(p, alt, neu, zeit, zurueck){
  if(!p || !Array.isArray(p.ids) || p.ids.indexOf(alt) < 0 || p.ids.indexOf(neu) > -1 || !findExercise(neu)) return false;
  if(zurueck){   // zurück zur alten Stufe: deren Ziel und Verlauf gelten weiter
    p.ids[p.ids.indexOf(alt)] = neu;
    if(p.blk && p.blk[alt]){ p.blk[neu] = p.blk[alt]; delete p.blk[alt]; }
    if(p.modus && p.modus[alt]){ p.modus[neu] = p.modus[alt]; delete p.modus[alt]; }
    var ea = studioAlle()[alt]; if(ea){ delete ea.vorStufe; ea.erhoeht = Date.now(); }
    var eb = studioAlle()[neu]; if(eb) eb.erhoeht = Date.now();
    p.updatedAt = Date.now(); save(); return true;
  }
  p.ids[p.ids.indexOf(alt)] = neu;
  if(p.blk && p.blk[alt]){ p.blk[neu] = p.blk[alt]; delete p.blk[alt]; }
  if(p.modus && p.modus[alt]){ p.modus[neu] = p.modus[alt]; delete p.modus[alt]; }
  var a = studioAlle(), za = studioZiel(alt), en = a[neu] || (a[neu] = { log:[] });
  en.ziel = { saetze:za.saetze, wdh:KOERPER_NEU };
  if(zeit){ en.einheit = "zeit"; en.timer = { reps:za.saetze, work:ketteStartSek(neu), rest:(a[alt] && a[alt].pause) || 60 }; }
  en.vorStufe = alt;   // zweimal klar verfehlt: zurück zur alten Variante anbieten
  delete en.erhoeht;
  if(a[alt] && a[alt].pause && en.pause == null) en.pause = a[alt].pause;
  p.updatedAt = Date.now(); save();
  return true;
}
function studioSteigerTippText(v){
  if(v.art === "kg" && v.zeitNeu) return t("tippZeitKg", { alt:v.sekAlt, neu:studioKg(v.kg), s:v.zeitNeu });
  if(v.art === "zeit") return t("tippZeit", { alt:v.alt, neu:v.sek });
  if(v.art === "zeitRunter") return v.grund === "pause" ? t("tippPauseZeit", { d:v.tage, neu:v.sek }) : t("tippZeitRunter", { alt:v.alt, neu:v.sek });
  if(v.art === "assist") return t("tippAssist", { max:v.max, neu:studioKg(v.kg), min:v.min });
  if(v.art === "assistRunter") return v.pause ? t("tippAssistPause", { d:v.tage, neu:studioKg(v.kg) }) : t("tippAssistRunter", { w:v.wdh, neu:studioKg(v.kg) });
  if(v.art === "stufeZurueck") return t("tippStufeZurueck", { n:tplText(findExercise(v.naechste).name) });
  if(v.art === "variante") return v.naechste ? t("tippVarianteNeuZeit", { alt:v.alt, n:tplText(findExercise(v.naechste).name), s:ketteStartSek(v.naechste) }) : t("tippVariante", { alt:v.alt });
  if(v.art === "satz") return t("tippSatz", { kg:studioKg(v.sprung), n:v.saetze });
  if(v.art === "varianteWdh") return v.naechste ? t("tippVarianteNeu", { max:v.max, n:tplText(findExercise(v.naechste).name), min:v.min, max0:v.max0 })+(KETTE_BEWEGLICH[v.naechste] ? " "+t("tippBeweglich") : "")+(KETTE_STANGE.test(v.naechste) ? " "+t("tippStange") : "") : t("tippVarianteWdh", { max:v.max, min:v.min, max0:v.max0 });
  if(v.tempo) return studioSteigerTippText(Object.assign({}, v, { tempo:false }))+" "+t("tippTempo");
  if(v.art === "kg") return t("tippKg", { max:v.max, neu:studioKg(v.kg), p:v.prozent, min:v.min, max0:v.max0 })+(v.rpeLeicht ? " "+t("tippRpeLeicht") : "")+(v.gross ? " "+t("tippGross") : "");
  if(v.art === "runter") return t("tippRunter", { w:v.wdh, neu:studioKg(v.kg) });
  if(v.art === "pause") return t("tippPause", { d:v.tage, neu:studioKg(v.kg) });
  if(v.art === "wdhRunter") return t("tippWdhRunter", { neu:v.wdh });
  if(v.grund === "nachRueck") return t("tippNachRueck", { kg:studioKg(v.sprung), neu:v.wdh });
  return v.grund === "sprung" ? t("tippSprung", { max:v.max, kg:studioKg(v.sprung), neu:v.wdh }) : t("tippWdh", { max:v.max, neu:v.wdh });
}
function studioTippKurz(v){
  if(v.art === "zeit" || v.art === "zeitRunter") return (v.art === "zeit" ? "↑ " : "↓ ")+t("tippKurzZeit", { n:v.sek });
  if(v.art === "stufeZurueck") return "↓ "+tplText(findExercise(v.naechste).name);
  if(v.art === "assist" || v.art === "assistRunter") return (v.art === "assist" ? "↑ " : "↓ ")+t("tippKurzAssist", { kg:studioKg(v.kg) });
  if((v.art === "variante" || v.art === "varianteWdh") && v.naechste) return "↑ "+tplText(findExercise(v.naechste).name);
  if(v.art === "variante" || v.art === "varianteWdh") return "↑ "+t("tippKurzVariante");
  if(v.art === "satz") return "↑ "+t("tippKurzSatz", { n:v.saetze });
  return v.art === "kg" ? "↑ "+t("tippKurzKg", { kg:studioKg(v.kg), p:v.prozent }) : v.art === "runter" || v.art === "pause" ? "↓ "+t("tippKurzKg2", { kg:studioKg(v.kg) })
    : (v.art === "wdhRunter" ? "↓ " : "↑ ")+t("tippKurzWdh", { n:v.wdh });
}
/* Tipp übernehmen: Gewicht bzw. Wiederholungsziel setzen. Nach einer Gewichtserhöhung gilt wieder das ursprüngliche Wiederholungsziel (falls es wegen
   eines zu großen Sprungs angehoben war). Gibt das neue Gewicht zurück (oder null). */
function studioTippUebernehmen(id, tp){
  var a = studioAlle(), en = a[id] || (a[id] = { log:[] }), z = studioZiel(id);
  if(tp.art === "zeit" || tp.art === "zeitRunter"){
    en.timer = en.timer || {}; en.timer.work = tp.sek;
  } else if(tp.art === "variante" || tp.art === "stufeZurueck"){
    /* nur gemerkt: Tausch der Übung passiert im BLOC (planVarianteTauschen) bzw. die Variante wählt man selbst */
  } else if(tp.art === "satz"){
    en.satzPlus = z.saetze; en.ziel = { saetze:tp.saetze, wdh:z.wdh };   // ein Satz mehr; die alte Satzzahl ist gemerkt
  } else if(tp.art === "varianteWdh"){
    en.ziel = { saetze:z.saetze, wdh:tp.wdhNeu };   // schwerere Variante: Ziel wieder unten
  } else if(tp.art === "assist" || tp.art === "assistRunter"){
    en.kg = tp.kg;
  } else if(tp.art === "kg" || tp.art === "runter" || tp.art === "pause"){
    en.kg = tp.kg;
    if(tp.art === "runter"){ en.ruecknahmeN = en.ruecknahmeKg === tp.alt ? (en.ruecknahmeN || 1) + 1 : 1; en.ruecknahmeKg = tp.alt; }
    else if(tp.art === "kg"){
      delete en.ruecknahmeKg; delete en.ruecknahmeN;
      if(en.satzPlus){ en.ziel = { saetze:en.satzPlus, wdh:(en.ziel && en.ziel.wdh) || z.wdh }; delete en.satzPlus; }   // nach dem Sprung wieder die alte Satzzahl
    }
    if(tp.art === "runter" && en.zielBasis){ en.ziel = { saetze:z.saetze, wdh:en.zielBasis }; delete en.zielBasis; }   // Gewicht runter: angehobenes Wdh.-Ziel zurück   // nach einer Rücknahme denselben Sprung nicht sofort wieder
    if(tp.zeitNeu){ en.timer = en.timer || {}; en.timer.work = tp.zeitNeu; }
    if(tp.art === "kg" && en.zielBasis){ en.ziel = { saetze:(en.ziel && en.ziel.saetze) || z.saetze, wdh:en.zielBasis }; delete en.zielBasis; }   // Satzzahl von oben (evtl. schon zurückgesetzt) behalten
  } else {
    if((tp.grund === "sprung" || tp.grund === "nachRueck") && !en.zielBasis) en.zielBasis = z.wdh;
    en.ziel = { saetze:z.saetze, wdh:tp.wdh };
  }
  en.erhoeht = Date.now(); save();
  return tp.art === "kg" || tp.art === "runter" || tp.art === "pause" || tp.art === "assist" || tp.art === "assistRunter" ? tp.kg : null;
}
/* Leichtwoche: steht heute im Kalender ein Termin aus dem Plan-Assistenten mit Leichtwoche, zu dem dieser BLOC gehört? */
function planLeichtHeute(planId){
  if(!planId || typeof kalAn !== "function") return false;
  if((state.db.settings.leichtAus || {})[kalTagKey(Date.now())+"|"+planId]) return false;   // heute bewusst normal trainiert
  return kalAn(kalTagKey(Date.now())).some(function(e){
    if(!e.leicht) return false;
    if(e.art === "plan") return e.ref === planId;
    var pg = e.art === "programm" && typeof programmFinde === "function" ? programmFinde(e.ref) : null;
    return !!pg && pg.items.indexOf("plan:"+planId) > -1;
  });
}
function leichtSaetze(n){ return Math.max(1, Math.round(n*0.6)); }   // Leichtwoche: etwa 60 % der Sätze (3 → 2, 4 → 2, 5 → 3)
function studioPauseStop(){
  if(!studioPause) return;
  clearInterval(studioPause.uhr);
  schedCancel();
  studioPause = null;
}
var ICON_STATS = '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>';
/* Leiste oben in der Karte: „Statistik“, Kurzfassung, kleine Kurve - ein Tipp öffnet das Statistik-Fenster */
/* Statistik-Kachel für Studio: immer sichtbar, eigene Zeile über dem Inhalt (so überdeckt sie keine Figur).
   Ohne Kurve steht eine gestrichelte Platzhalterlinie, ein Tipp öffnet in jedem Fall das Statistik-Fenster. */
function statsLeisteHTML(attr, kurz, pts, farbe){
  var kurve = wochenKurve(pts, "ssl-kurve") ||
    '<svg class="wo-kurve ssl-kurve leer" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,15 100,15"/></svg>';
  return '<button type="button" class="st-stats-leiste" '+attr+(farbe ? ' style="--cat:'+farbe+'"' : '')+'>'+
    '<span class="ssl-ico">'+svgIcon(ICON_STATS)+'</span>'+
    '<span class="ssl-text"><b>'+esc(t("stStats"))+'</b><small>'+esc(kurz)+'</small></span>'+
    kurve+
    '<span class="ssl-chev">'+ICON_CHEV+'</span></button>';
}
function studioStatsLeiste(id){
  var e = studioEintrag(id) || {}, log = (e.log || []).filter(function(l){ return arbeitsSaetze(l).length; }), kurz = t("stStatsNone");
  if(log.length) kurz = studioNurBlock(findExercise(id)) ? t("stStatsKurzWdh", { w:studioBestwerte(log).wdh, n:log.length })
    : t("stStatsKurz", { kg:studioKg(studioBestwerte(log).kg), n:log.length });
  return statsLeisteHTML("data-ststats", kurz, studioWochen(id));
}
/* Diagramm je Woche. fmt formatiert die Achsenwerte (Standard: Gewicht), schritt ist der Abstand, wenn alle Werte gleich sind.
   Ohne Punkte zeichnet es nur das leere Gerüst - dann sieht man trotzdem, was hier entsteht. */
function wochenDiagramm(pts, einheit, fmt, schritt){
  fmt = fmt || studioKg; schritt = schritt || 1;
  var B = 300, H = 130, l = 34, r = 10, o = 10, u = 22, leer = !pts.length;
  var vs = pts.map(function(q){ return q.v; }), mx = leer ? 0 : Math.max.apply(null, vs), mn = leer ? 0 : Math.min.apply(null, vs);
  if(mx === mn){ mx += schritt; mn = Math.max(0, mn - schritt); }
  var w0 = leer ? 0 : pts[0].w, wb = leer ? 1 : (pts[pts.length-1].w - w0 || 1);
  function X(q){ return l + (pts.length === 1 ? .5 : (q.w - w0)/wb) * (B - l - r); }
  function Y(q){ return o + (1 - (q.v - mn)/(mx - mn)) * (H - o - u); }
  function datum(w){ return new Date(w * 6048e5 - 216e6).toLocaleDateString(currentLang(), { day:"numeric", month:"numeric" }); }
  return '<svg class="wo-diagramm'+(leer ? ' leer' : '')+'" viewBox="0 0 '+B+' '+H+'" role="img" aria-label="'+esc(t("stWeekly"))+'">'+
    '<path class="wd-gitter" d="M'+l+' '+o+'H'+(B-r)+'M'+l+' '+((o+H-u)/2)+'H'+(B-r)+'M'+l+' '+(H-u)+'H'+(B-r)+'"/>'+
    '<text class="wd-txt" x="'+(l-5)+'" y="'+(o+4)+'" text-anchor="end">'+(leer ? '–' : fmt(mx))+'</text>'+
    '<text class="wd-txt" x="'+(l-5)+'" y="'+(H-u+4)+'" text-anchor="end">'+(leer ? '–' : fmt(mn))+'</text>'+
    (leer ? '' : '<text class="wd-txt" x="'+l+'" y="'+(H-5)+'">'+datum(pts[0].w)+'</text>')+
    (pts.length > 1 ? '<text class="wd-txt" x="'+(B-r)+'" y="'+(H-5)+'" text-anchor="end">'+datum(pts[pts.length-1].w)+'</text>' : '')+
    '<text class="wd-txt" x="'+(B/2)+'" y="'+(H-5)+'" text-anchor="middle">'+esc(einheit)+'</text>'+
    (pts.length > 1 ? '<polyline class="wd-linie" points="'+pts.map(function(q){ return X(q).toFixed(1)+","+Y(q).toFixed(1); }).join(" ")+'"/>' : '')+
    pts.map(function(q){ return '<circle class="wd-punkt" cx="'+X(q).toFixed(1)+'" cy="'+Y(q).toFixed(1)+'" r="3.5"/>'; }).join("")+'</svg>';
}
/* Statistik-Fenster für Studio. o: { titel, farbe, zahlen:[[Wert, Beschriftung] …], wochen, fmt, schritt, einheit,
   suffix (hinter dem Verlauf, z. B. " kg"), seit, hatDaten, leerText, letzteTitel, letzte:[[links, rechts] …] }.
   Ohne Daten bleibt alles stehen (Zahlen als „–“, leeres Diagramm), dazu ein kurzer Hinweis. */
function openStatistik(o){
  var root = document.getElementById("overlayRoot"), wo = o.wochen || [], fmt = o.fmt || studioKg;
  var hinweis = !o.hatDaten ? o.leerText : wo.length < 2 ? t("stOneWeek") : "";
  var innen = '<div class="st-stats-zahlen">'+o.zahlen.map(function(z){
      return '<div><b>'+esc(o.hatDaten ? z[0] : "–")+'</b><span>'+esc(z[1])+'</span></div>'; }).join("")+'</div>'+
    // sichten: [[Schlüssel, Beschriftung] …] - Umschalter für die Kurve (Gewicht · 1RM · Volumen); o.neu(Schlüssel) zeichnet das Fenster neu
    (o.sichten ? '<div class="seg-row st-sicht" role="group">'+o.sichten.map(function(s){
      return '<button type="button" data-stsicht="'+s[0]+'" class="'+(o.sicht === s[0] ? 'active' : '')+'" aria-pressed="'+(o.sicht === s[0])+'">'+esc(s[1])+'</button>'; }).join("")+'</div>' : '')+
    '<div class="wo-kopf"><span>'+esc(o.verlaufTitel)+(o.seit ? SEP+esc(t("stSince", { d:o.seit })) : '')+'</span>'+
      (wo.length > 1 ? '<b>'+fmt(wo[0].v)+' → '+fmt(wo[wo.length-1].v)+(o.suffix || '')+'</b>' : '')+'</div>'+
    wochenDiagramm(wo, o.einheit, fmt, o.schritt)+
    (hinweis ? '<p class="st-stats-hinweis">'+esc(hinweis)+'</p>' : '')+
    (o.warnung ? '<p class="st-stats-hinweis st-warnung">'+esc(o.warnung)+'</p>' : '')+
    (o.letzte && o.letzte.length ? '<div class="info-title">'+esc(o.letzteTitel)+'</div>'+o.letzte.map(function(z){
      return '<div class="st-v-zeile"><span>'+esc(z[0])+'</span><b>'+esc(z[1])+(z[2] ? '<i class="st-rekord" title="'+esc(t("stRekord"))+'">★</i>' : '')+'</b></div>'; }).join("") : '');
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet st-stats" role="dialog" aria-label="'+esc(t("stStats"))+'" style="--cat:'+o.farbe+'">'+
    '<h3>'+esc(t("stStats"))+SEP+esc(o.titel)+'</h3>'+innen+
    '<button type="button" class="btn btn-secondary" data-cancel style="margin-top:14px;">'+t("close")+'</button></div></div>';
  function zu(){ root.innerHTML = ""; }
  root.querySelector("[data-cancel]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(ev){ if(ev.target.classList.contains("confirm-overlay")) zu(); });
  root.querySelectorAll("[data-stsicht]").forEach(function(b){
    b.addEventListener("click", function(){ if(o.neu) o.neu(b.getAttribute("data-stsicht")); });
  });
}
function openStudioStats(id, sicht){
  sicht = sicht === "rm" || sicht === "vol" ? sicht : "kg";
  var ex = findExercise(id), e = studioEintrag(id) || {}, log = (e.log || []).filter(function(l){ return arbeitsSaetze(l).length; });
  var saetze = 0;
  log.forEach(function(l){ saetze += arbeitsSaetze(l).length; });
  var b = studioBestwerte(log), gesamt = log.reduce(function(a, l){ return a + studioVolumen(l); }, 0);
  var koerper = studioNurBlock(ex);   // ohne Gewicht zählen die Wiederholungen
  function kgT(v){ return studioKg(Math.round(v*10)/10)+" kg"; }
  // Rekorde automatisch erkennen: eine Einheit mit neuem Bestgewicht oder neuem geschätzten 1RM (ohne Gewicht: mehr Wiederholungen in einem Satz)
  // gegenüber allen davor trägt einen Stern
  var rekorde = log.map(function(l, i){
    if(!i || studioAssistiert(id)) return false;
    return studioIstRekord(studioBestwerte([l]), studioBestwerte(log, i));
  });
  if(koerper){
    sicht = sicht === "wsum" ? "wsum" : "wdh";
    var wsumAll = log.reduce(function(a, l){ return a + studioWdhSumme(l); }, 0);
    return openStatistik({
      titel:tplText(ex.name), farbe:studioFarbe(ex), hatDaten:log.length > 0, leerText:t("stStatsEmpty"),
      zahlen:[[String(b.wdh), t("stBestWdh")], [String(b.wsum), t("stBestWsum")], [String(wsumAll), t("stWdhGesamt")],
              [String(log.length), t("stSessions")], [String(saetze), t("stSetsAll")]],
      sichten:[["wdh", t("stSichtWdh")], ["wsum", t("stSichtWsum")]], sicht:sicht,
      neu:function(s){ openStudioStats(id, s); },
      verlaufTitel:t(sicht === "wdh" ? "stWeeklyWdh" : "stWeeklyWsum"), wochen:studioWochen(id, sicht), fmt:function(v){ return String(Math.round(v)); },
      einheit:t("wdhKurz"), suffix:" "+t("wdhKurz"),
      seit:log.length ? new Date(log[0].at).toLocaleDateString(currentLang(), { day:"numeric", month:"numeric", year:"2-digit" }) : "",
      letzteTitel:t("stLastN"),
      letzte:log.map(function(l, i){
        return [studioTag(l.at) === studioTag(Date.now()) ? t("stToday") : new Date(l.at).toLocaleDateString(currentLang(), { weekday:"short", day:"numeric", month:"numeric" }), l.s.map(satzText).join(" · "), rekorde[i]];
      }).slice(-30).reverse()
    });
  }
  var fmt = sicht === "vol" ? function(v){ return studioKg(Math.round(v)); } : function(v){ return studioKg(Math.round(v*10)/10); };
  // Rückschritt sichtbar machen: drei Runden in Folge weniger Volumen und deutlich unter dem besten - dann eher Gewicht zurücknehmen
  var v3 = log.filter(function(l){ return !l.leicht; }).slice(-3).map(studioVolumen), warnung = "";   // Leichtwoche ist kein Rückschritt
  if(v3.length === 3 && v3[0] > v3[1] && v3[1] > v3[2] && v3[2] < b.vol*0.8) warnung = t("stVolFaellt", { p:Math.round((1 - v3[2]/b.vol)*100) });
  openStatistik({
    titel:tplText(ex.name), farbe:studioFarbe(ex), hatDaten:log.length > 0, leerText:t("stStatsEmpty"), warnung:warnung,
    zahlen:[[studioKg(b.kg)+" kg", t("stBestKg")], [kgT(b.rm), t("stSchaetzung")], [kgT(b.vol), t("stBestVol")],
            [String(log.length), t("stSessions")], [String(saetze), t("stSetsAll")], [studioKg(Math.round(gesamt))+" kg", t("stVolGesamt")]],
    sichten:[["kg", t("stSichtKg")], ["rm", t("stSichtRm")], ["vol", t("stSichtVol")]], sicht:sicht,
    neu:function(s){ openStudioStats(id, s); },
    verlaufTitel:t(sicht === "kg" ? "stWeekly" : sicht === "rm" ? "stWeeklyRm" : "stWeeklyVol"), wochen:studioWochen(id, sicht), fmt:fmt,
    einheit:"kg", suffix:" kg",
    seit:log.length ? new Date(log[0].at).toLocaleDateString(currentLang(), { day:"numeric", month:"numeric", year:"2-digit" }) : "",
    letzteTitel:t("stLastN"),
    letzte:log.map(function(l, i){
      return [studioTag(l.at) === studioTag(Date.now()) ? t("stToday") : new Date(l.at).toLocaleDateString(currentLang(), { weekday:"short", day:"numeric", month:"numeric" }), l.s.map(satzText).join(" · "), rekorde[i]];
    }).slice(-30).reverse()
  });
}
function studioTimerKarte(id, titel, hinweis){
  var tm = studioTimer(id);
  return (titel ? '<div class="section-title">'+esc(titel)+'</div>' : '')+
    '<div class="card st-timer"><p class="st-timer-hint">'+esc(hinweis)+'</p>'+
      '<label>'+esc(t("stSets"))+'</label>'+stepperHTML("stt-reps", tm.reps, 1, 20, 1)+
      '<label>'+esc(t("stWork"))+'</label>'+stepperHTML("stt-work", tm.work, 5, 600, 5)+
      '<label>'+esc(t("stRest"))+'</label>'+stepperHTML("stt-rest", tm.rest, 0, 600, 5)+
      '<button type="button" class="btn btn-primary" data-sttimer style="margin-top:14px;">'+ICON_PLAY+' '+esc(t("stTimerStart"))+'</button>'+
    '</div>';
}
/* nachher: läuft nach einer Änderung (die Karte zeichnet das Ziel neu) */
function studioTimerBinden(id, eintrag, nachher){
  var stt = app.querySelector(".st-timer");
  if(!stt) return;   // Karte im Satz-Modus: kein Timer-Teil
  stt.querySelector("[data-sttimer]").addEventListener("click", function(){ studioPauseStop(); go("#playst/"+id); });
  bindSteppers(stt, function(){
    var reps = clamp(parseInt(stt.querySelector("#stt-reps").value)||3, 1, 20), en = eintrag();
    en.timer = { reps:reps,
                 work:clamp(parseInt(stt.querySelector("#stt-work").value)||40, 5, 600),
                 rest:clamp(parseInt(stt.querySelector("#stt-rest").value)||0, 0, 600) };
    // Runden = Sätze des Ziels: dieselbe Zahl wie im Plan und im Satz-Modus
    en.ziel = en.ziel || {}; en.ziel.saetze = reps; en.manuell = Date.now();
    // gehört die Übung im geöffneten Plan zu einem Supersatz oder Zirkel, gehen alle Übungen des Blocks dieselben Runden
    var pl = typeof studioModusPlan === "function" ? studioModusPlan(id) : null, bl = pl ? planBlockVon(pl, id) : null;
    if(bl) bl.ids.forEach(function(x){ var e2 = studioAlle()[x] || (studioAlle()[x] = { log:[] }); e2.ziel = e2.ziel || {}; e2.ziel.saetze = reps; });
    save();
    if(nachher) nachher();
  });
}
function studioInfoHTML(id, ex){
  var info = EX_INFO[id], lang = currentLang()==="en" ? 1 : 0;
  return info ? '<div class="section-title">'+esc(t("stInfo"))+'</div><div class="card st-info">'+
      (EX_MUSCLES[id] ? '<div class="info-mus"><div class="info-mus-t"><div><b>'+esc(musclesLabel(ex))+':</b> '+esc(musclesMain(ex))+'</div>'+
        (musclesAssist(ex) ? '<div class="info-mus-2">'+esc(t("musAssist"))+': '+esc(musclesAssist(ex))+'</div>' : '')+'</div>'+kkInfoHTML(ex)+'</div>' : '')+
      '<div class="info-title">'+t("howTo")+'</div><ol class="info-steps">'+info[lang].split("|").map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol>'+
      (EX_POSTURE[id] ? '<div class="info-title">'+t("posture")+'</div><ul class="info-posture">'+EX_POSTURE[id][lang*2].split("|").map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul>'+
        '<div class="info-avoid"><b>'+t("avoid")+':</b> '+esc(EX_POSTURE[id][lang*2+1])+'</div>' : '')+
      (ILLU2[id] ? '<button type="button" class="btn btn-secondary" data-stinfo>'+esc(t("infoLong"))+'</button>' : '')+
    '</div>' : '';
}
var studioPR = null;   // { id, art:"kg"|"rm", kg, w, vorher, rm, vorherRm } - zeigt nach einem Satz mit neuem Bestgewicht (oder neuem geschätzten 1RM) eine ruhige Zeile auf der Karte
var studioTypenOffen = false;   // Satztypen auf der Karte ausgeklappt?
var studioSatzTypWahl = "n";   // Typ des nächsten Satzes auf der Karte: n normal · w Aufwärmen · d Drop · f bis Versagen
var studioRpeWahl = 0;   // RPE (6–10) des nächsten Satzes, 0 = keine Angabe (nur wenn RPE/RIR in den Einstellungen eingeschaltet ist)
/* Langhantel-Übungen bekommen den Scheibenrechner */
function studioLanghantel(ex){ return /barbell|langhantel|bench-press|ez-?bar|ez-?stange|smith|deadlift/i.test(ex.id+" "+JSON.stringify(ex.name || "")); }
var SCHEIBEN = [25, 20, 15, 10, 5, 2.5, 1.25];
/* Scheibenrechner: welche Scheiben pro Seite auf die Stange müssen; die Stange (kg) ist einstellbar und wird gemerkt */
function openScheibenSheet(kgWert){
  var root = document.getElementById("overlayRoot"), s = state.db.settings;
  var stange = s.stangeKg > 0 ? s.stangeKg : 20, ziel = kgWert;
  function rechnen(){
    var pro = Math.max(0, (ziel - stange)/2), rest = pro, teile = [];
    SCHEIBEN.forEach(function(p){ var n = 0; while(rest + 1e-9 >= p){ rest -= p; n++; } if(n) teile.push([p, n]); });
    return { pro:pro, teile:teile, rest:Math.round(rest*1000)/1000 };
  }
  function draw(){
    var r = rechnen();
    root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet sch-sheet" role="dialog" aria-label="'+esc(t("scheibenTitel"))+'">'+
      '<h3>'+esc(t("scheibenTitel"))+'</h3>'+
      '<div class="st-eingabe">'+
        '<div class="st-feld"><label>'+esc(t("stKg"))+'</label><div class="stepper st-step"><button type="button" data-zminus>&minus;</button>'+
          '<input type="text" inputmode="decimal" id="sch-ziel" value="'+studioKg(ziel)+'"><button type="button" data-zplus>&plus;</button></div></div>'+
        '<div class="st-feld"><label>'+esc(t("scheibenStange"))+'</label><div class="stepper st-step"><button type="button" data-sminus>&minus;</button>'+
          '<input type="text" inputmode="decimal" id="sch-stange" value="'+studioKg(stange)+'"><button type="button" data-splus>&plus;</button></div></div>'+
      '</div>'+
      (ziel <= stange ? '<div class="sch-gross">'+esc(t("scheibenNurStange"))+'</div>' :
        '<div class="sch-gross">'+esc(t("scheibenProSeite"))+': '+esc(r.teile.map(function(x){ return (x[1] > 1 ? x[1]+"× " : "")+studioKg(x[0]); }).join(" + ") || "–")+'</div>'+
        r.teile.map(function(x){ return '<div class="sch-zeile"><span>'+esc(studioKg(x[0]))+' kg</span><b>'+x[1]+' ×</b></div>'; }).join("")+
        (r.rest > 0 ? '<div class="tm-hint">'+esc(t("scheibenRest", { r:studioKg(r.rest*2) }))+'</div>' : ''))+
      '<button type="button" class="btn btn-secondary" data-cancel style="margin-top:14px;">'+esc(t("close"))+'</button></div></div>';
    function zahl(sel){ var x = parseFloat(String(root.querySelector(sel).value).replace(",", ".")); return isFinite(x) && x >= 0 ? Math.min(500, x) : 0; }
    function setzen(){ ziel = zahl("#sch-ziel"); stange = Math.min(60, zahl("#sch-stange")); s.stangeKg = stange; save(); draw(); }
    root.querySelector("[data-zminus]").addEventListener("click", function(){ ziel = Math.max(0, zahl("#sch-ziel") - 2.5); setzen(); });
    root.querySelector("[data-zplus]").addEventListener("click", function(){ ziel = zahl("#sch-ziel") + 2.5; setzen(); });
    root.querySelector("[data-sminus]").addEventListener("click", function(){ stange = Math.max(0, zahl("#sch-stange") - 2.5); s.stangeKg = stange; save(); draw(); });
    root.querySelector("[data-splus]").addEventListener("click", function(){ stange = Math.min(60, zahl("#sch-stange") + 2.5); s.stangeKg = stange; save(); draw(); });
    ["#sch-ziel", "#sch-stange"].forEach(function(sel){ root.querySelector(sel).addEventListener("change", setzen); });
    function zu(){ root.innerHTML = ""; }
    root.querySelector("[data-cancel]").addEventListener("click", zu);
    root.querySelector(".confirm-overlay").addEventListener("click", function(ev){ if(ev.target.classList.contains("confirm-overlay")) zu(); });
  }
  draw();
}
function renderStudioKarte(id){
  var ex = findExercise(id);
  if(!ex){ go("#timers"); return; }
  var koerper = studioNurBlock(ex);   // Übung ohne Gewicht (Air): Sätze × Wiederholungen oder Timer, kein Gewichtsfeld
  if(studioPause && studioPause.id !== id) studioPauseStop();
  var e = studioEintrag(id) || {}, z = studioZiel(id), bereich = studioBereich(id);
  var h = studioOffen(e);   // die offene Runde von heute (nach „Training speichern“ beginnt eine neue)
  var leicht = planLeichtHeute(stPlanAktiv);
  var v = studioVorschlag(id), stg = h && h.s.length ? null : studioTipps([id], leicht)[id], pause = e.pause || (koerper ? 60 : 90);
  if(e.kg != null && !h) v.kg = e.kg;
  var letzte = studioLetzte(id, false);   // die Einheit davor: so sieht man vor Ort, was beim letzten Mal ging
  var timerModus = studioModus(id) === "timer";   // vor Ort umschaltbar: Satz für Satz eintragen oder den Timer durchlaufen lassen (Übungen ohne Gewicht starten mit dem Timer)
  /* Gehört die Übung im geöffneten Plan zu einem Supersatz oder Zirkel? Dann steht oben „danach: …“ mit Knopf zur nächsten Übung des Blocks,
     und die Pause kommt erst nach der letzten Übung der Runde. */
  var blKontext = null;
  (function(){
    var pl = stPlanAktiv ? stPlanFind(stPlanAktiv) : null, bl = pl ? planBlockVon(pl, id) : null;
    if(!bl) return;
    var i = bl.ids.indexOf(id);
    blKontext = { art:blockArt(bl.ids.length), n:bl.ids.length, i:i, next:bl.ids[(i+1) % bl.ids.length], letzte:i === bl.ids.length-1 };
  })();
  var trKontext = trainingKontext(id);   // Training speichern ist auch mitten im Workout da: Leiste unten, sobald heute etwas eingetragen ist
  if(!trainingHeute(trKontext.ids).ex.length) trKontext = { plan:trKontext.plan, ids:[] };
  app.innerHTML =
    topbar(tplText(ex.name), { back:"#timers", right:exFavBtn(id) }) +
    '<div class="card st-hero" style="--cat:'+studioFarbe(ex)+'">'+
      studioStatsLeiste(id)+
      (ILLU[id] ? (hatFoto(id)   // mit Bild: Umschalter Figur | Bild wie in der Info-Karte, Strichfigur oder Bild in derselben Bühne
        ? '<div class="st-figur info-fig">'+fotoUmschalterHTML(!!state.db.settings.infoBild)+'<div class="info-pane-fig"'+(state.db.settings.infoBild ? ' hidden' : '')+'>'+illuHTML(id, "st-illu")+'</div>'+fotoBuehneHTML(id, tplText(ex.name), !!state.db.settings.infoBild)+'</div>'
        : '<div class="st-figur">'+illuHTML(id, "st-illu")+'</div>') : (ex.custom ? '<div class="st-figur"><span class="ex-symbol big">'+exSymbol(ex)+'</span></div>' : ''))+
      bandAnkerHTML(id)+   // Band-Übung: „Band befestigen“ gehört direkt unter die bewegte Figur
      griffHTML(id)+
      (e.kg != null && !koerper ? '<div class="st-ziel">'+esc(t("stWeight"))+' '+studioKg(e.kg)+' kg</div>' : '')+   // das Ziel „3 Sätze × 12“ steht nicht mehr da (zu spezifisch)
      // Werte vom letzten Mal: ein Tipp auf einen Satz übernimmt Gewicht und Wiederholungen in die Eingabe (nur im Satz-Modus)
      (letzte ? '<div class="st-letzte"><b>'+esc(t("stLetztes"))+'</b> <span>'+esc(studioTagText(letzte.at))+'</span> '+
        letzte.s.map(function(x){
          var txt = esc(satzText(x).replace("×", " × "));
          return timerModus ? '<span class="st-satz">'+txt+'</span>' :
            '<button type="button" class="st-satz st-uebernehmen" data-ukg="'+x[0]+'" data-uw="'+x[1]+'" aria-label="'+esc(t("stUebernehmen")+" "+studioKg(x[0])+" × "+x[1])+'">'+txt+'</button>';
        }).join("")+'</div>' : '')+
      (leicht ? '<div class="st-leicht">'+esc(t("leichtHinweis", { n:leichtSaetze(z.saetze) }))+'</div>' : '')+
      (v.erstes && !koerper && !(h && h.s.length) ? '<div class="st-leicht">'+esc(t("erstesMalHinweis", { n:bereich.max }))+'</div>' : '')+
      (stg ? '<div class="st-steigern"><span>'+esc(studioSteigerTippText(stg))+'</span>'+
        '<button type="button" class="btn btn-primary" data-stup>'+esc(t("tippUebernehmen"))+'</button>'+
        (studioTippSicher(stg) ? '' : '<button type="button" class="btn btn-secondary st-tipp-nein" data-stnein>'+esc(t("tippNichtJetzt"))+'</button>')+'</div>' : '')+
      '<div class="st-heute"><b>'+esc(t("stToday"))+':</b> '+(h && h.s.length ? h.s.map(function(x, i){
        return '<span class="st-satz">'+(i+1)+'. '+esc(satzText(x).replace("×", " × "))+'</span>'; }).join("") : '<span class="st-leer">–</span>')+'</div>'+
      (blKontext ? '<div class="st-block"><span><b>'+esc(t(blKontext.art === "zirkel" ? "blkZirkel" : "blkSuper"))+'</b> · '+(blKontext.i+1)+'/'+blKontext.n+
        '<small>'+esc(t(blKontext.letzte ? "blkDannPause" : "blkDanach", { n:tplText(findExercise(blKontext.next).name) }))+'</small></span>'+
        '<button type="button" class="btn btn-primary" data-stblock="'+esc(blKontext.next)+'">'+esc(t("blkWeiter"))+' ›</button></div>' : '')+
 '<details class="st-eintrag"'+(state.db.settings.stEintragZu ? '' : ' open')+'><summary><span>'+esc(t("stEintrag"))+'</span>'+(h && h.s.length ? '<b>'+h.s.length+' '+esc(t("stHeuteN"))+'</b>' : '')+'<span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
      '<div class="seg-row st-modus" role="group" aria-label="'+esc(t("stModusTitel"))+'">'+
        '<button type="button" data-stmodus="saetze" class="'+(timerModus ? '' : 'active')+'" aria-pressed="'+!timerModus+'">'+esc(t("stModusSaetze"))+'</button>'+
        '<button type="button" data-stmodus="timer" class="'+(timerModus ? 'active' : '')+'" aria-pressed="'+timerModus+'">'+ICON_PLAY+' '+esc(t("stModusTimer"))+'</button></div>'+
      (timerModus ? studioTimerKarte(id, "", t(koerper ? "stBlockHint" : "stTimerSatzHint")).replace('<div class="card st-timer">', '<div class="st-timer">') :
      // Satztyp des nächsten Satzes: Aufwärmsätze zählen nicht in Volumen, Bestwerte und Steigerung
      '<details class="st-typ-box"'+(studioTypenOffen ? ' open' : '')+'><summary><span>'+esc(t("satzTypTitel"))+'</span><b data-sttypnow>'+esc(t("satzTypLang_"+studioSatzTypWahl))+'</b><span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
      '<div class="st-typen" role="group" aria-label="'+esc(t("satzTypTitel"))+'">'+SATZ_TYPEN.map(function(ty){
        return '<button type="button" class="fc-chip'+(studioSatzTypWahl === ty ? ' on' : '')+'" data-sttyp="'+ty+'" aria-pressed="'+(studioSatzTypWahl === ty)+'">'+esc(t("satzTypLang_"+ty))+'</button>'; }).join("")+'</div>'+
      '<button type="button" class="st-typ-faq" data-stfaq>'+esc(t("satzTypFaq"))+' ›</button></details>'+
      // Anstrengung des nächsten Satzes (RPE oder RIR, in den Einstellungen einschaltbar); nochmal antippen nimmt die Angabe zurück
      (anstrengungModus() ? '<div class="st-typen st-rpe" role="group" aria-label="'+esc(t("rpeTitel"))+'"><span>'+esc(anstrengungModus() === "rir" ? "RIR" : "RPE")+'</span>'+
        [6, 7, 8, 9, 10].map(function(r){
          return '<button type="button" class="fc-chip'+(studioRpeWahl === r ? ' on' : '')+'" data-strpe="'+r+'" aria-pressed="'+(studioRpeWahl === r)+'">'+(anstrengungModus() === "rir" ? 10 - r : r)+'</button>'; }).join("")+'</div>' : '')+
      // Übungen ohne Gewicht tragen nur die Wiederholungen ein (kein Gewichtsfeld, kein Schritt, kein Scheibenrechner)
      '<div class="st-eingabe'+(koerper ? ' eins' : '')+'">'+
        (koerper ? '' : '<div class="st-feld"><label>'+esc(t("stKg"))+'</label><div class="stepper st-step" data-min="0" data-max="500" data-step="'+z.schritt+'">'+
          '<button type="button" data-kgminus>&minus;</button><input type="text" inputmode="decimal" id="st-kg" value="'+studioKg(v.kg)+'"><button type="button" data-kgplus>&plus;</button></div></div>')+
        '<div class="st-feld"><label>'+esc(t("stReps"))+'</label><div class="stepper st-step">'+
          '<button type="button" data-wminus>&minus;</button><input type="number" inputmode="numeric" id="st-w" value="'+v.wdh+'"><button type="button" data-wplus>&plus;</button></div></div>'+
      '</div>'+
      // einstellbarer Schritt der +/−-Knöpfe; bei Langhantel-Übungen dazu der Scheibenrechner
      (koerper ? '' : '<div class="st-schritt">'+esc(t("stSchritt"))+': '+[1, 2.5, 5, 10].map(function(sc){
        return '<button type="button" class="fc-chip'+(z.schritt === sc ? ' on' : '')+'" data-stschritt="'+sc+'">'+studioKg(sc)+'</button>'; }).join("")+
        (studioLanghantel(ex) ? '<button type="button" class="st-scheiben" data-stscheiben>'+esc(t("scheibenLink"))+'</button>' : '')+'</div>')+
      '<button type="button" class="btn btn-primary st-los" data-stset>✓ '+esc(t("stSetDone"))+' '+((h ? h.s.length : 0)+1)+'</button>'+
      (studioPR ? '<div class="st-pr" role="status"><span class="st-pr-stern" aria-hidden="true">★</span><div><b>'+esc(t(studioPR.art === "rm" ? "stPrRm" : "stPrTitel"))+'</b><small>'+
        esc(studioPR.art === "wdh" ? t("stPrWdhText", { w:studioPR.w, v:studioPR.vorher }) :
            studioPR.art === "rm" ? t("stPrRmText", { rm:studioKg(Math.round(studioPR.rm*10)/10), v:studioKg(Math.round(studioPR.vorherRm*10)/10) })
                                  : t("stPrText", { kg:studioKg(studioPR.kg), w:studioPR.w, v:studioKg(studioPR.vorher) }))+'</small></div></div>' : '')+
      '<div class="st-pause" id="st-pause"'+(studioPause && studioPause.id === id ? '' : ' hidden')+'>'+
        '<span>'+esc(t("stPause"))+'</span><b id="st-pause-zeit"></b><button type="button" class="btn btn-secondary" data-stskip>'+esc(t("stSkip"))+'</button></div>'+
      '<div class="st-pausewahl">'+esc(t("stPause"))+': '+(koerper ? [30, 60, 90, 120] : [60, 90, 120, 180]).map(function(sec){
        return '<button type="button" class="fc-chip'+(pause === sec ? ' on' : '')+'" data-stpause="'+sec+'">'+(sec < 120 ? sec+" s" : (sec/60)+" min")+'</button>'; }).join("")+'</div>'+
      (h && h.s.length ? '<button type="button" class="st-undo" data-stundo>'+esc(t("stUndo"))+'</button>' : ''))+
    '</details></div>'+
    '<div class="section-title">'+esc(t("stNote"))+'</div>'+
    '<div class="card"><textarea id="st-notiz" rows="2" placeholder="'+esc(t("stNotePh"))+'">'+esc(e.notiz || "")+'</textarea></div>'+
    studioInfoHTML(id, ex)+
    gymHinweisHTML(ex)+
    '<p class="info-risk">'+esc(t("ownRisk"))+' <a href="privacy.html#haftung" target="_blank" rel="noopener">'+t("ownRiskMore")+'</a> · <a href="quellen.html" target="_blank" rel="noopener">'+t("sourcesLink")+'</a></p>'+
    (trKontext.ids.length ? trainingLeisteHTML(trKontext) : "")+
    '<div style="height:'+(trKontext.ids.length ? 96 : 40)+'px"></div>';
  bindCommon();
  fotoBinden(app.querySelector(".st-hero"), tplText(ex.name));
  var eintragBox = app.querySelector(".st-eintrag");   // Eingabe ein-/ausklappbar, die Wahl merkt sich die App (für alle Übungen)
  if(eintragBox) eintragBox.addEventListener("toggle", function(){ var zu = !eintragBox.open; if(!!state.db.settings.stEintragZu !== zu){ state.db.settings.stEintragZu = zu; save(); } });   // „toggle“ feuert auch beim ersten Zeichnen: dann nichts speichern
  function neu(){ var y = window.scrollY; renderStudioKarte(id); window.scrollTo(0, y); }
  function eintrag(){ var a = studioAlle(); return a[id] || (a[id] = { log:[] }); }
  var kgIn = app.querySelector("#st-kg"), wIn = app.querySelector("#st-w");   // im Timer-Modus gibt es keine Eingabe, ohne Gewicht kein kg-Feld
  function kgWert(){ if(!kgIn) return 0; var x = parseFloat(String(kgIn.value).replace(",", ".")); return isFinite(x) && x >= 0 ? Math.min(500, x) : 0; }
  function an(sel, fn){ var el = app.querySelector(sel); if(el) el.addEventListener("click", fn); }
  app.querySelectorAll("[data-stmodus]").forEach(function(b){
    b.addEventListener("click", function(){
      var m = b.getAttribute("data-stmodus");
      if((m === "timer") === timerModus) return;
      studioModusSetzen(id, m); neu();
    });
  });
  if(wIn){
    if(kgIn){
      an("[data-kgminus]", function(){ kgIn.value = studioKg(Math.max(0, kgWert() - z.schritt)); });
      an("[data-kgplus]", function(){ kgIn.value = studioKg(kgWert() + z.schritt); });
      kgIn.addEventListener("focus", function(){ kgIn.select(); });
    }
    an("[data-wminus]", function(){ wIn.value = Math.max(1, (parseInt(wIn.value) || 0) - 1); });
    an("[data-wplus]", function(){ wIn.value = Math.min(100, (parseInt(wIn.value) || 0) + 1); });
    wIn.addEventListener("focus", function(){ wIn.select(); });
    app.querySelectorAll("[data-ukg]").forEach(function(b){
      b.addEventListener("click", function(){ if(kgIn) kgIn.value = studioKg(+b.getAttribute("data-ukg")); wIn.value = b.getAttribute("data-uw"); });
    });
    // Satztyp und Schritt ändern sich an Ort und Stelle (kein Neuzeichnen: das Eingegebene bleibt stehen)
    app.querySelectorAll("[data-sttyp]").forEach(function(b){
      b.addEventListener("click", function(){
        studioSatzTypWahl = b.getAttribute("data-sttyp");
        var jetztEl = app.querySelector("[data-sttypnow]"); if(jetztEl) jetztEl.textContent = t("satzTypLang_"+studioSatzTypWahl);
        app.querySelectorAll("[data-sttyp]").forEach(function(c){ c.classList.toggle("on", c === b); c.setAttribute("aria-pressed", c === b); });
      });
    });
    var typSum = app.querySelector(".st-typ-box > summary");
    if(typSum) typSum.addEventListener("click", function(e){ e.preventDefault(); var d = typSum.parentNode; d.open = !d.open; studioTypenOffen = d.open; });
    var typFaq = app.querySelector("[data-stfaq]");
    if(typFaq) typFaq.addEventListener("click", function(){ go("#faq"); });
    app.querySelectorAll("[data-strpe]").forEach(function(b){
      b.addEventListener("click", function(){
        var r = +b.getAttribute("data-strpe");
        studioRpeWahl = studioRpeWahl === r ? 0 : r;
        app.querySelectorAll("[data-strpe]").forEach(function(c){ var an = +c.getAttribute("data-strpe") === studioRpeWahl; c.classList.toggle("on", an); c.setAttribute("aria-pressed", an); });
      });
    });
    app.querySelectorAll("[data-stschritt]").forEach(function(b){
      b.addEventListener("click", function(){
        z.schritt = +b.getAttribute("data-stschritt");
        eintrag().schritt = z.schritt; save();
        app.querySelectorAll("[data-stschritt]").forEach(function(c){ c.classList.toggle("on", c === b); });
      });
    });
    an("[data-stscheiben]", function(){ openScheibenSheet(kgWert()); });
  }
  an("[data-stset]", function(){
    var en = eintrag(), jetzt = Date.now(), kg = kgWert(), w = Math.max(1, Math.min(100, parseInt(wIn.value) || 1)), typ = studioSatzTypWahl;
    var davor = studioBestwerte(en.log);   // Bestwerte vor diesem Satz
    var l = studioRundeFuer(en, jetzt);
    var satz = [kg, w], rpe = anstrengungModus() ? studioRpeWahl : 0;   // typ "n" steht als Platzhalter, wenn nur die Anstrengung angegeben ist
    if(typ !== "n" || rpe) satz.push(typ);
    if(rpe) satz.push(rpe);
    l.s.push(satz);
    // Rekord: neues Bestgewicht, sonst neues geschätztes 1RM (Aufwärmsätze zählen nicht; mit Gewicht nur ab 3 Wiederholungen)
    var rm = satzSchaetzung1RM([kg, w]), zaehlt = w >= REKORD_MIN_WDH;
    studioPR = typ === "w" || studioAssistiert(id) ? null :
      kg === 0 && davor.kg === 0 ? (davor.wdh > 0 && w > davor.wdh ? { id:id, art:"wdh", w:w, vorher:davor.wdh } : null) :   // ohne Gewicht: mehr Wiederholungen
      !zaehlt ? null :
      davor.kg3 > 0 && kg > davor.kg3 ? { id:id, art:"kg", kg:kg, w:w, vorher:davor.kg3 } :
      davor.kg3 > 0 && kg === davor.kg3 && w > davor.wBest3 ? { id:id, art:"wdh", w:w, vorher:davor.wBest3 } : null;   // gleiches Gewicht, mehr Wiederholungen
    studioSatzTypWahl = "n"; studioRpeWahl = 0;
    if(!koerper){ var ak = rundeArbeitsKg(l); en.kg = ak != null ? ak : kg; }   // Arbeitsgewicht der Runde, nicht der letzte (evtl. leichte) Satz
    en.zuletzt = jetzt;
    studioVerlauf(id, jetzt);
    trainingNachSatz(id);
    save();
    vibrate([40, 30, 70]);
    satzFeedback(l.s.length, satzText(satz), !!studioPR);   // große Bestätigung mitten auf dem Bildschirm
    if(blKontext && !blKontext.letzte) studioPauseStop(); else studioPauseStart(id, pause);   // im Block geht es ohne Pause zur nächsten Übung
    neu();
  });
  an("[data-stundo]", function(){
    var en = eintrag(), l = studioOffen(en);
    if(l){ l.s.pop(); if(!l.s.length) en.log.pop(); else if(!koerper){ var ak2 = rundeArbeitsKg(l); if(ak2 != null) en.kg = ak2; } }
    studioPR = null;
    studioPauseStop(); save(); trainingNachSatz(id); neu();
  });
  an("[data-stnein]", function(){ studioTippAblehnen(id); showToast(t("tippRuhtOk")); neu(); });
  an("[data-stup]", function(){
    var plk = stPlanAktiv ? stPlanFind(stPlanAktiv) : null;
    if(stg.naechste && plk && planVarianteTauschen(plk, id, stg.naechste, stg.art === "variante", stg.art === "stufeZurueck")){ studioTippUebernehmen(id, stg); showToast(studioTippKurz(stg)); go("#studio/"+stg.naechste); return; }
    var neuKg = studioTippUebernehmen(id, stg); showToast(neuKg != null ? t("stRaised", { kg:studioKg(neuKg) }) : studioTippKurz(stg)); neu(); });
  an("[data-stskip]", function(){ studioPauseStop(); neu(); });
  an("[data-stblock]", function(){ studioPauseStop(); go("#studio/"+app.querySelector("[data-stblock]").getAttribute("data-stblock")); });
  an("[data-stinfo]", function(){ openExInfo(id, false); });
  an("[data-ststats]", function(){ openStudioStats(id); });
  an(".topbar [data-exfav]", function(){ toggleExFav(id); neu(); });
  studioTimerBinden(id, eintrag, neu);
  app.querySelectorAll("[data-stpause]").forEach(function(b){ b.addEventListener("click", function(){ eintrag().pause = +b.getAttribute("data-stpause"); save(); neu(); }); });
  var notiz = app.querySelector("#st-notiz");
  notiz.addEventListener("input", function(){ eintrag().notiz = notiz.value; save(); });
  if(trKontext.ids.length) trainingLeisteBinden(trKontext, neu);
  studioPauseZeigen();
  window.scrollTo(0, 0);   // Karte öffnet oben bei der Eingabe (neu() stellt beim Nachzeichnen die Position wieder her)
}
/* Pause nach einem Satz: Countdown auf der Karte, Signalton über den Audio-Takt (klingt auch bei aus-
   geschaltetem Bildschirm), Countdown-Töne 3-2-1 wie im Timer */
function studioPauseStart(id, sek){
  studioPauseStop();
  var ende = Date.now() + sek*1000;
  studioPause = { id:id, ende:ende, uhr:setInterval(studioPauseZeigen, 250) };
  studioPauseTonPlan();
}
function studioPauseTonPlan(){
  if(!studioPause || !state.db.settings.sound || !audioCtx()) return;
  for(var k=3; k>=1; k--) if(studioPause.ende - k*1000 > Date.now()) schedNotes(tickNotes(), studioPause.ende - k*1000);
  schedNotes(currentSoundStyle().work, studioPause.ende);
}
/* Zurück aus dem Hintergrund: der Audio-Takt stand still, die Töne der Satzpause neu an die Wanduhr binden */
document.addEventListener("visibilitychange", function(){
  if(document.visibilityState !== "visible" || !studioPause) return;
  audioBereit(function(){ if(studioPause){ schedCancel(); studioPauseTonPlan(); } });
});
function studioPauseZeigen(){
  var box = document.getElementById("st-pause"), zeit = document.getElementById("st-pause-zeit");
  if(!studioPause){ if(box) box.hidden = true; return; }
  var rest = studioPause.ende - Date.now();
  if(rest <= 0){
    clearInterval(studioPause.uhr);
    studioPause = null;
    vibrate([60, 80, 60]);
    if(box){ box.hidden = false; box.classList.add("vorbei"); if(zeit) zeit.textContent = t("stPauseEnd"); }
    return;
  }
  if(box){ box.hidden = false; box.classList.remove("vorbei"); }
  if(zeit) zeit.textContent = fmtTime(Math.ceil(rest/1000));
}
/* Studio zählt für die Wochenzeile: ein Eintrag je Training, die Dauer vom ersten bis zum letzten Satz. Ein neuer Eintrag beginnt nach
   „Training speichern“ (settings.rundeZu) oder nach mehr als 45 Minuten ohne Satz - so zählt die Zeit zwischen zwei Trainings nicht mit. */
var STUDIO_LUECKE = 45*60000;
function studioVerlauf(id, jetzt){
  pruneHistory(state.db);
  var hs = state.db.history, tag = studioTag(jetzt), e = null, zu = +state.db.settings.rundeZu || 0;
  for(var i=hs.length-1; i>=0; i--) if(hs[i].studio && studioTag(hs[i].studio) === tag){ e = hs[i]; break; }
  if(e && (e.studio < zu || jetzt - (e.studio + Math.max(0, (e.dur || 60) - 60)*1000) > STUDIO_LUECKE)) e = null;
  if(!e){ e = { at:jetzt, ex:[], dur:0, studio:jetzt, b:"timer" }; hs.push(e); }
  if(e.ex.indexOf(id) < 0) e.ex.push(id);
  e.dur = Math.round((jetzt - e.studio)/1000) + 60;
}

/* Play- und Stern-Knöpfe in Listen (Startseite, Timer-Seite) */
function bindFavItems(refresh){
  app.querySelectorAll("[data-favstart]").forEach(function(el){
    function los(){
      if(el.getAttribute("aria-disabled")) return;
      var g = el.getAttribute("data-favstart");
      if(g.indexOf("prog:") === 0){ var pg = programmFinde(g.slice(5)); if(pg && pg.items.length){ go("#koerper"); programmOeffnen(pg, (pg.pos || 0) % pg.items.length); } return; }   // Trainingsplan: in der Arena öffnen
      go(g);
    }
    el.addEventListener("click", los);
    el.addEventListener("keydown", function(e){ if(e.key==="Enter" || e.key===" "){ e.preventDefault(); los(); } });
  });
  // Langes Drücken auf eine Favoriten-Kachel: nach Rückfrage aus den Favoriten entfernen (wie auf Training/Heute mit langDruck)
  app.querySelectorAll(".fav-foto[data-favkey]").forEach(function(el){
    langDruck(el, function(){
      confirmSheet(t("favEntfernenTitel"), t("favEntfernenText", { n:el.getAttribute("data-favname") }), t("favEntfernenOk"), function(){ toggleFav(el.getAttribute("data-favkey")); refresh(); });
    });
  });
  var more = app.querySelector("[data-favall]");
  if(more) more.addEventListener("click", function(){ favShowAll = !favShowAll; var y = window.scrollY; refresh(); window.scrollTo(0, y); });
  app.querySelectorAll("[data-favgo]").forEach(function(el){
    el.addEventListener("click", function(e){
      e.stopPropagation();
      coverDraft = null;
      go("#cover/"+el.getAttribute("data-favgo"));
    });
  });
  app.querySelectorAll("[data-fav]").forEach(function(el){
    el.addEventListener("click", function(e){ e.stopPropagation(); toggleFav(el.getAttribute("data-fav")); refresh(); });
  });
  app.querySelectorAll("[data-play]").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      if(btn.disabled) return;
      go("#play/"+btn.getAttribute("data-play"));
    });
  });
  app.querySelectorAll("[data-playblock]").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      go("#playblock/"+btn.getAttribute("data-playblock"));
    });
  });
}


/* Satz eintragen aus dem Timer: kleines Fenster mit Gewicht und Wiederholungen (vorausgefüllt), schreibt in dasselbe Protokoll wie die Übungs-Karte */
function studioSatzLog(id, kg, w, zeit, rpe){   // zeit: w sind Sekunden (Satz mit Zeit statt Wiederholungen); rpe: 6–10 oder 0 (Test 4, Q3)
  var alle = studioAlle(), en = alle[id] || (alle[id] = { log:[] }), jetzt = Date.now();
  var l = studioRundeFuer(en, jetzt);   // nach „Training speichern“ beginnt eine neue Runde
  rpe = rpe > 0 ? rpe : 0;
  l.s.push(zeit ? [kg, w, "n", rpe, 1] : rpe ? [kg, w, "n", rpe] : [kg, w]);
  var ak = rundeArbeitsKg(l); en.kg = ak != null ? ak : kg; en.zuletzt = jetzt;   // Arbeitsgewicht der Runde, nicht der letzte Satz
  studioVerlauf(id, jetzt);
  trainingNachSatz(id);
  save();
}
function openGewichtSheet(id, nachher){
  var ex = findExercise(id), root = document.getElementById("overlayRoot");
  if(!ex) return;
  var v = studioVorschlag(id), z = studioZiel(id), e0 = studioEintrag(id), davor = studioLetzte(id, false);
  if(e0 && e0.kg != null) v.kg = e0.kg;
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet pg-sheet" role="dialog" aria-label="'+esc(tplText(ex.name))+'">'+
    '<h3>'+esc(tplText(ex.name))+'</h3>'+
    // das letzte Mal und was heute schon drin ist: ein Tipp übernimmt einen Satz
    (davor ? '<div class="st-letzte pg-letzte"><b>'+esc(t("stLetztes"))+'</b> <span>'+esc(studioTagText(davor.at))+'</span> '+
      davor.s.map(function(x){ return '<button type="button" class="st-satz st-uebernehmen" data-ukg="'+x[0]+'" data-uw="'+x[1]+'">'+esc(studioKg(x[0])+" × "+x[1])+'</button>'; }).join("")+'</div>' : '')+
    '<div class="st-eingabe">'+
      '<div class="st-feld"><label>'+esc(t("stKg"))+'</label><div class="stepper st-step"><button type="button" data-kgminus>&minus;</button>'+
        '<input type="text" inputmode="decimal" id="pg-kg" value="'+studioKg(v.kg)+'"><button type="button" data-kgplus>&plus;</button></div></div>'+
      '<div class="st-feld"><label>'+esc(t("stReps"))+'</label><div class="stepper st-step"><button type="button" data-wminus>&minus;</button>'+
        '<input type="number" inputmode="numeric" id="pg-w" value="'+v.wdh+'"><button type="button" data-wplus>&plus;</button></div></div>'+
    '</div>'+
    '<div class="btn-row"><button class="btn btn-secondary" data-cancel>'+esc(t("cancel"))+'</button>'+
    '<button class="btn btn-primary" data-ok>&#10003; '+esc(t("stSetDone"))+'</button></div></div></div>';
  var kgIn = root.querySelector("#pg-kg"), wIn = root.querySelector("#pg-w");
  function kgWert(){ var x = parseFloat(String(kgIn.value).replace(",", ".")); return isFinite(x) && x >= 0 ? Math.min(500, x) : 0; }
  function zu(){ root.innerHTML = ""; }
  root.querySelector("[data-kgminus]").addEventListener("click", function(){ kgIn.value = studioKg(Math.max(0, kgWert() - z.schritt)); });
  root.querySelector("[data-kgplus]").addEventListener("click", function(){ kgIn.value = studioKg(kgWert() + z.schritt); });
  root.querySelector("[data-wminus]").addEventListener("click", function(){ wIn.value = Math.max(1, (parseInt(wIn.value) || 0) - 1); });
  root.querySelector("[data-wplus]").addEventListener("click", function(){ wIn.value = Math.min(100, (parseInt(wIn.value) || 0) + 1); });
  root.querySelectorAll("[data-ukg]").forEach(function(b){
    b.addEventListener("click", function(){ kgIn.value = studioKg(+b.getAttribute("data-ukg")); wIn.value = b.getAttribute("data-uw"); });
  });
  root.querySelector("[data-cancel]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(ev){ if(ev.target.classList.contains("confirm-overlay")) zu(); });
  root.querySelector("[data-ok]").addEventListener("click", function(){
    var kg = kgWert(), w = Math.max(1, Math.min(100, parseInt(wIn.value) || 1));
    studioSatzLog(id, kg, w); zu();
    showToast(studioKg(kg)+" kg × "+w);
    if(nachher) nachher();
  });
}

/* „Neuer Standard“ (Ziel automatisch anheben) gibt es seit 2026-11-12 nicht mehr: es gilt nur noch die eine Steigerungsregel (studioProg). */
