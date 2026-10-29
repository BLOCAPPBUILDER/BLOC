"use strict";
/* ============ Training nach Sätzen: Glas-Bereich zum Wischen ============
   Ein BLOC (mit seinen weiteren BLOCs) als Reihe von Karten: nach links oder rechts wischen wechselt die Übung, oben zeigen Punkte, bei welcher man ist.
   Je Karte: Gewicht und Wiederholungen per Zähler, „Satz eintragen“ speichert wie die Übungskarte (studioSatzLog), danach läuft die Pause.
   Erklärungen stehen eingeklappt darunter. Route: #satz/<BLOC-ID>/<Nummer>. */
var satzLetzterTick = 0;   // letzte Sekunde, zu der der Pause-Tick vibriert hat
var satzUhr = 0;   // Zähler der Satzpause (nur eine zugleich)
/* Nach dem Speichern eines Trainings beginnt das Satz-Training von vorn: heute zählen nur die Sätze seit dem letzten Speichern (settings.satzBasis = Anzahl bei Beginn).
   Die Einträge selbst bleiben im Protokoll; Statistik und Tageswerte sehen weiterhin alle Sätze des Tages. */
function satzBasisN(id){ var b = (state.db.settings.satzBasis || {})[id]; return b && b.tag === studioTag(Date.now()) ? b.n : 0; }
function satzBasisSetzen(ids){
  var s = state.db.settings, o = s.satzBasis || (s.satzBasis = {}), tag = studioTag(Date.now());
  ids.forEach(function(id){ var e = studioEintrag(id), l = e && e.log && e.log.length ? e.log[e.log.length-1] : null; o[id] = { tag:tag, n:(l && studioTag(l.at) === tag) ? l.s.length : 0 }; });
  save();
}
function satzHeute(id){
  var e = studioEintrag(id), l = e && e.log && e.log.length ? e.log[e.log.length-1] : null;
  if(!l || studioTag(l.at) !== studioTag(Date.now())) return null;
  var s = l.s.slice(satzBasisN(id));
  return s.length ? { at:l.at, s:s } : null;
}
/* Verlauf auf der Abschlusskarte: Volumen (ohne Gewicht: Wiederholungen) der letzten gespeicherten Trainings dieses Plans und das von heute; schon ein Eintrag ergibt einen Balken */
function satzStatHTML(p, ids, d){
  // Zahlen: nur diese Runde (seit dem letzten Speichern); Balken: Tageswerte wie in den gespeicherten Trainings
  var runde = { ex:0, saetze:0, vol:0, wdh:0 }, neuStart = false;
  ids.forEach(function(id){
    var h = satzHeute(id); if(satzBasisN(id) > 0) neuStart = true;
    if(!h) return; runde.ex++; runde.saetze += arbeitsSaetze(h).length; runde.vol += studioVolumen(h); runde.wdh += studioWdhSumme(h);
  });
  runde.vol = Math.round(runde.vol);
  var key = einheitTagKey(), mitKg = d.vol > 0, wert = function(x){ return mitKg ? (x.vol || 0) : (x.wdh || 0); };
  var frueher = einheitenListe().filter(function(x){ return (x.plan || "") === p.id && x.tag !== key; }).sort(function(a, b){ return a.at - b.at; }).slice(-5).map(wert);
  var reihe = frueher.concat([mitKg ? d.vol : d.wdh]), mx = Math.max.apply(null, reihe) || 1;
  var zahlen = [[String(runde.ex), t("trUebungen")], [String(runde.saetze), t("stSetsAll")], [mitKg ? studioKg(runde.vol)+" kg" : String(runde.wdh), t(mitKg ? "stVolGesamt" : "stWdhGesamt")],
    [d.dauer && !neuStart ? fmtDuration(d.dauer >= 60 ? Math.round(d.dauer/60)*60 : d.dauer) : "–", t("trDauer")]];
  return '<div class="satz-stat"><div class="satz-stat-zahlen">'+zahlen.map(function(z){ return '<div><b>'+esc(z[0])+'</b><span>'+esc(z[1])+'</span></div>'; }).join("")+'</div>'+
    '<div class="satz-stat-balken" role="img" aria-label="'+esc(t(mitKg ? "satzStatVol" : "satzStatWdh"))+'">'+reihe.map(function(v, i){
      return '<i'+(i === reihe.length-1 ? ' class="jetzt"' : '')+' style="height:'+Math.max(8, Math.round(v/mx*100))+'%"></i>'; }).join("")+'</div>'+
    '<small>'+esc(frueher.length ? t(mitKg ? "satzStatVol" : "satzStatWdh") : t("satzStatErster"))+'</small></div>';
}
/* Zusammenfassung: je Übung der beste Satz heute und der Vergleich mit der Einheit davor (Gewicht, sonst Wiederholungen) */
function satzVergleichHTML(ids){
  var heute = studioTag(Date.now()), zeilen = [];
  function top(l){ var b = null; arbeitsSaetze(l).forEach(function(s){ if(!b || s[0] > b[0] || (s[0] === b[0] && s[1] > b[1])) b = s; }); return b; }
  function wdhSumme(l){ return arbeitsSaetze(l).reduce(function(a, s){ return a + s[1]; }, 0); }
  ids.forEach(function(id){
    var ex = findExercise(id), e = studioEintrag(id), log = (e && e.log) || [];
    var h = log.length && studioTag(log[log.length-1].at) === heute ? log[log.length-1] : null;
    if(!ex || !h || !arbeitsSaetze(h).length) return;
    var vor = null; for(var i = log.length - 2; i >= 0; i--){ if(arbeitsSaetze(log[i]).length && studioTag(log[i].at) !== heute){ vor = log[i]; break; } }
    var b = top(h), text = b[0] > 0 ? studioKg(b[0])+" kg × "+b[1] : b[1]+" "+t("stReps"), badge = t("satzErstes"), kl = "neu";
    if(vor){
      var bv = top(vor), dKg = Math.round((b[0] - bv[0])*100)/100, dW = wdhSumme(h) - wdhSumme(vor);
      if(b[0] > 0 && dKg !== 0){ badge = (dKg > 0 ? "▲ +" : "▼ −")+studioKg(Math.abs(dKg))+" kg"; kl = dKg > 0 ? "hoch" : "runter"; }
      else if(dW !== 0){ badge = (dW > 0 ? "▲ " : "▼ ")+t(dW > 0 ? "satzMehrW" : "satzWenigerW", { n:Math.abs(dW) }); kl = dW > 0 ? "hoch" : "runter"; }
      else { badge = "= "+t("satzGleich"); kl = "gleich"; }
    }
    zeilen.push('<div class="satz-vgl"><span class="satz-vgl-n">'+esc(tplText(ex.name))+'</span><span class="satz-vgl-w">'+esc(text)+'</span><span class="satz-vgl-b '+kl+'">'+esc(badge)+'</span></div>');
  });
  return zeilen.length ? '<div class="satz-vgls" aria-label="'+esc(t("satzZusammenfassung"))+'">'+zeilen.join("")+'</div>' : '';
}
function satzListe(p){
  var l = stPlanIds(p).slice();
  planFolge(p).forEach(function(q){ stPlanIds(q).forEach(function(id){ if(l.indexOf(id) < 0) l.push(id); }); });
  return l;
}
function satzKarteHTML(id, i, n){
  var ex = findExercise(id);
  if(!ex) return "";
  var koerper = studioNurBlock(ex), z = studioZiel(id), e = studioEintrag(id) || {}, log = e.log || [], heute = studioTag(Date.now());
  var h = satzHeute(id), zeitE = studioEinheit(id) === "zeit";
  var v = studioVorschlag(id), letzte = studioLetzte(id, false), fertig = h && h.s.length >= z.saetze, lang = currentLang() === "en" ? 1 : 0;
  if(e.kg != null && !h) v.kg = e.kg;
  var zeitStart = h && h.s.length && h.s[h.s.length-1][4] === 1 ? v.wdh : studioTimer(id).work;   // Zeit: Sekunden des letzten Satzes heute, sonst die Arbeitszeit der Übung
  var info = EX_INFO[id], post = EX_POSTURE[id];
  return '<section class="satz-karte" data-satzk="'+i+'" data-id="'+esc(id)+'" aria-label="'+esc((i+1)+"/"+n+" "+tplText(ex.name))+'">'+
    '<div class="satz-glas">'+
      '<h2 class="satz-name">'+esc(tplText(ex.name))+(info ? ' <button type="button" class="info-btn" data-satzinfo="'+esc(id)+'" aria-label="'+esc(t("info"))+'">i</button>' : '')+'</h2>'+
      (kachelMuskel(ex) ? '<div class="satz-mus">'+kachelMuskel(ex)+'</div>' : '')+
      griffHTML(id)+
      (ILLU[id] ? '<div class="satz-figur">'+illuHTML(id, "satz-illu")+'</div>' : (ex.custom ? '<div class="satz-figur"><span class="ex-symbol big">'+exSymbol(ex)+'</span></div>' : ''))+
      '<div class="satz-saetze" role="img" aria-label="'+esc((h ? h.s.length : 0)+" / "+z.saetze)+'">'+(function(){ var o = "", n = Math.min(z.saetze, 12), fertigeAnzahl = h ? h.s.length : 0; for(var q = 0; q < n; q++) o += '<i class="'+(q < fertigeAnzahl ? 'an' : q === fertigeAnzahl ? 'jetzt' : '')+'"></i>'; return o; })()+'</div>'+
      (function(){ var tp = h ? null : studioSteigerTipp(id); return tp ? '<div class="satz-tipp"><span>'+esc(studioSteigerTippText(tp))+'</span><button type="button" data-satztipp>'+esc(t("tippUebernehmen"))+'</button></div>' : ''; })()+
      '<div class="satz-ziel">'+esc(t("stGoal"))+' <b>'+satzName(z.saetze)+' × '+z.wdh+'</b>'+(e.kg != null && !koerper ? ' · <b>'+studioKg(e.kg)+' kg</b>' : '')+'</div>'+
      (letzte ? '<div class="satz-zeile"><span>'+esc(t("stLetztes"))+'</span>'+letzte.s.map(function(x){
        return '<button type="button" class="satz-chip" data-ukg="'+x[0]+'" data-uw="'+x[1]+'" aria-label="'+esc(t("stUebernehmen")+" "+studioKg(x[0])+" × "+x[1])+'">'+esc(satzText(x).replace("×", " × "))+'</button>'; }).join("")+'</div>' : '')+
      '<div class="satz-zeile"><span>'+esc(t("stToday"))+'</span>'+(h && h.s.length ? h.s.map(function(x, k){ return '<span class="satz-chip an">'+(k+1)+'. '+esc(satzText(x).replace("×", " × "))+'</span>'; }).join("") : '<span class="satz-leer">–</span>')+'</div>'+
      '<div class="satz-eingabe'+(koerper ? ' eins' : '')+'">'+
        (koerper ? '' : '<div class="satz-feld"><label>'+esc(t("stKg"))+'</label><div class="satz-zaehler"><button type="button" data-kgminus aria-label="&minus;">&minus;</button>'+
          '<input type="text" inputmode="decimal" class="satz-kg" value="'+studioKg(v.kg)+'" aria-label="'+esc(t("stKg"))+'"><button type="button" data-kgplus aria-label="&plus;">&plus;</button></div></div>')+
        '<div class="satz-feld"><label>'+esc(t(zeitE ? "planArbeit" : "stReps"))+'</label><div class="satz-zaehler"><button type="button" data-wminus aria-label="&minus;">&minus;</button>'+
          '<input type="number" inputmode="numeric" class="satz-w" value="'+(zeitE ? zeitStart : v.wdh)+'" aria-label="'+esc(t(zeitE ? "planArbeit" : "stReps"))+'"><button type="button" data-wplus aria-label="&plus;">&plus;</button></div></div>'+
      '</div>'+
      '<button type="button" class="satz-los" data-satzset>✓ '+esc(t("stSetDone"))+' '+((h ? h.s.length : 0)+1)+'</button>'+
      '<div class="satz-pause" hidden><span>'+esc(t("stPause"))+'</span><b></b><button type="button" data-satzskip>'+esc(t("stSkip"))+'</button></div>'+
      (fertig ? '<button type="button" class="satz-weiter" data-satzweiter>'+esc(i < n-1 ? t("satzNaechste") : t("satzFertig"))+' ›</button>' : '')+
      (info ? '<details class="satz-info"><summary>'+esc(t("stInfo"))+'<span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
        '<ol>'+info[lang].split("|").map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol>'+
        (post ? '<ul>'+post[lang*2].split("|").map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul><p><b>'+esc(t("avoid"))+':</b> '+esc(post[lang*2+1])+'</p>' : '')+'</details>' : '')+
    '</div></section>';
}
function renderSatzTraining(planId, start){
  var p = stPlanFind(planId), ids = p ? satzListe(p) : [];
  if(!p || !ids.length){ go("#katalog"); return; }
  start = clamp(parseInt(start) || 0, 0, ids.length - 1);
  ids.forEach(function(sid){ studioStandardPruefen(sid, false); });   // frühere Einheiten: neue Ziele übernehmen
  /* Ist heute schon ein Training dieses Plans gespeichert und hat eine Übung noch keinen Rundenstart (früher gespeichert, vor dem Neustart-Verhalten),
     beginnt das Satz-Training für sie von vorn - sonst stünde man wieder vor dem fertigen Stand. */
  var ohneBasis = ids.filter(function(id){ var b = (state.db.settings.satzBasis || {})[id]; return !(b && b.tag === studioTag(Date.now())); });
  if(ohneBasis.length && einheitHeute(p)) satzBasisSetzen(ohneBasis);
  var pt = stPlanAktiv && stPlanFind(stPlanAktiv) ? stPlanAktiv : (stPlanAktiv = p.id);
  app.innerHTML =
    '<div class="satz-root" id="satzRoot"><div class="satz-bg" aria-hidden="true"></div>'+
      '<div class="satz-top"><button type="button" class="exit" data-satzexit aria-label="'+esc(t("endBtn"))+'">&times;</button>'+
        '<div class="satz-punkte" role="tablist" aria-label="'+esc(p.name)+'">'+ids.map(function(id, i){
          var ex = findExercise(id); return '<button type="button" class="satz-punkt" data-satzgo="'+i+'" role="tab" aria-label="'+esc((i+1)+". "+(ex ? tplText(ex.name) : ""))+'"></button>'; }).join("")+'</div>'+
        '<button type="button" class="exit" data-satzsave aria-label="'+esc(t("trSpeichern"))+'">'+ICON_SAVE+'</button></div>'+
      '<div class="satz-logo" aria-hidden="true"><b>BLOC</b><span id="satz-nr"></span></div>'+progChipHTML("plan:"+p.id)+
      '<div class="satz-wisch" id="satzWisch">'+ids.map(function(id, i){ return satzKarteHTML(id, i, ids.length); }).join("")+'</div>'+
      '<div class="satz-fuss"><button type="button" class="satz-fertig" data-satzfertig disabled>'+esc(t("satzFertig"))+'</button></div>'+
    '</div>';
  var root = document.getElementById("satzRoot"), wisch = document.getElementById("satzWisch"), aktuell = -1;
  function breite(){ return wisch.clientWidth || 1; }
  function nr(i){
    if(i === aktuell) return; if(aktuell >= 0) vibrate(10); aktuell = i;   // kleines Klicken beim Einrasten
    root.querySelectorAll(".satz-punkt").forEach(function(d, k){ d.classList.toggle("an", k === i); d.setAttribute("aria-selected", k === i); });
    var el = document.getElementById("satz-nr"); if(el) el.textContent = (i+1)+" / "+ids.length;
  }
  function fertigKnopf(neuBereit){
    var b = root.querySelector("[data-satzfertig]"); if(!b) return;
    var ok = alleFertig() || letzteFertig(); b.disabled = !ok; b.classList.toggle("bereit", ok);
    if(ok && neuBereit){ b.classList.add("leuchtet"); vibrate([50, 40, 50, 40, 120]); setTimeout(function(){ b.classList.remove("leuchtet"); }, 1400); }
  }
  function punkteFertig(){
    root.querySelectorAll(".satz-punkt").forEach(function(d, k){
      d.classList.toggle("fertig", fertig1(ids[k]));
    });
    fertigKnopf(false);
  }
  function fertig1(id){ var h = satzHeute(id); return !!h && h.s.length >= studioZiel(id).saetze; }
  function letzteFertig(){ return fertig1(ids[ids.length-1]); }   // Fertig wird hell, sobald der letzte Satz der letzten Übung drin ist (oder alles geschafft)
  function alleFertig(){
    return ids.every(fertig1);
  }
  var abschlussGezeigt = false;
  /* Ende eines BLOCs, ruhig und mit einer klaren Hauptaktion:
     - im Trainingsplan mit weiterem Eintrag: „Speichern & weiter mit …“ (ohne Auswertung; die Auswertungen kommen gesammelt ganz am Schluss)
     - im Trainingsplan beim letzten Eintrag: „Speichern & Auswertung“ (wischen zwischen den Workouts)
     - sonst (Workout): „Speichern & fertig“, danach die Auswertung */
  function berichtEintrag(){
    var d = trainingHeute(ids), stdNeu = ids.map(function(sid){ return studioStandardPruefen(sid, true); }).filter(Boolean);   // heute mehr geschafft: das ist ab jetzt das Ziel
    return { name:p.name, html:satzStatHTML(p, ids, d)+satzVergleichHTML(ids)+satzStandardHTML(stdNeu) };
  }
  function stilleSpeicherung(){
    var e = berichtEintrag();
    trainingSpeichern({ plan:p, ids:ids }, null);
    satzBasisSetzen(ids);
    return e;
  }
  function auswertungZeigen(liste){
    var box = root.querySelector(".satz-ende") || document.createElement("div");
    box.className = "satz-ende";
    box.innerHTML = '<div class="satz-ende-glas satz-aw" role="dialog" aria-label="'+esc(t("satzAwTitel"))+'"><div class="satz-ende-logo" aria-hidden="true">BLOC</div><h2>'+esc(t("satzAwTitel"))+'</h2>'+
      '<div class="satz-aw-wisch">'+liste.map(function(x){ return '<section class="satz-aw-karte"><h3>'+esc(x.name)+'</h3>'+x.html+'</section>'; }).join("")+'</div>'+
      (liste.length > 1 ? '<div class="satz-aw-punkte" aria-hidden="true">'+liste.map(function(x, i){ return '<i'+(i === 0 ? ' class="an"' : '')+'></i>'; }).join("")+'</div>' : '')+
      '<button type="button" class="satz-los" data-awfertig>'+esc(t("satzFertig"))+'</button></div>';
    if(!box.parentNode) root.appendChild(box);
    var wi = box.querySelector(".satz-aw-wisch");
    wi.addEventListener("scroll", function(){
      var k = Math.round(wi.scrollLeft/(wi.clientWidth || 1));
      box.querySelectorAll(".satz-aw-punkte i").forEach(function(d, j){ d.classList.toggle("an", j === k); });
    });
    box.querySelector("[data-awfertig]").addEventListener("click", function(){ progBericht = []; raus(); });
    vibrate([60, 50, 60, 50, 140]); if(state.db.settings.sound) phaseBeep("done");
  }
  function abschluss(){
    abschlussGezeigt = true;
    var imPlan = !!programmKontextFuer("plan:"+p.id), pw = imPlan ? programmWeiter("plan:"+p.id) : null, d = trainingHeute(ids), box = document.createElement("div");
    var haupt = pw ? t("satzSpeichernWeiter", { n:pw.name }) : imPlan ? t("satzSpeichernAuswertung") : t("satzSpeichernFertig");
    box.className = "satz-ende";
    box.innerHTML = '<div class="satz-ende-glas satz-fertigkarte" role="dialog" aria-label="'+esc(t("satzGeschafft"))+'"><div class="satz-ende-logo" aria-hidden="true">BLOC</div><div class="satz-haken" aria-hidden="true">✓</div>'+
      '<h2>'+esc(p.name)+'</h2><p class="satz-kurz">'+esc(planAnzahl(d.ex.length)+" · "+t("planSaetzeGesamt", { n:d.saetze }))+'</p>'+
      '<button type="button" class="satz-los" data-endhaupt>'+esc(haupt)+(pw ? ' ›' : '')+'</button>'+
      '</div>';
    root.appendChild(box);
    vibrate([60, 50, 60, 50, 140]); if(state.db.settings.sound) phaseBeep("done");
    box.querySelector("[data-endhaupt]").addEventListener("click", function(){
      var e = null;
      try{ e = stilleSpeicherung(); }catch(err){ e = null; }   // auch wenn das Speichern hakt: nicht auf der Karte hängen bleiben
      if(e) progBericht.push(e);
      if(pw){
        studioPauseStop(); if(satzUhr){ clearInterval(satzUhr); satzUhr = 0; }
        box.remove();
        try{ pw.start(true); }catch(err){ showToast(t("progStartFehler")); }
        return;
      }
      auswertungZeigen(imPlan && progBericht.length ? progBericht.slice() : (e ? [e] : [berichtEintrag()]));
    });
  }
  function geheZu(i, weich){ i = clamp(i, 0, ids.length - 1); wisch.scrollTo({ left:i*breite(), behavior:weich ? "smooth" : "auto" }); nr(i); }
  wisch.addEventListener("scroll", function(){ nr(clamp(Math.round(wisch.scrollLeft/breite()), 0, ids.length - 1)); });
  /* Wischen (2026-10-24 wieder sicher): ein waagerechter Wisch wechselt genau eine Übung. Der Browser scrollt die Karten ohnehin; hier wird nur
     auf die Übung gesprungen, die beim Loslassen dran ist - auch wenn das Scrollen nicht greift. Starts auf Knöpfen und Eingaben zählen nicht. */
  var wx0 = 0, wy0 = 0, wVon = -1;
  wisch.addEventListener("touchstart", function(e){
    wVon = e.touches.length === 1 && !e.target.closest("input, select, textarea, button") ? (aktuell < 0 ? 0 : aktuell) : -1;
    wx0 = e.touches[0].clientX; wy0 = e.touches[0].clientY;
  }, { passive:true });
  wisch.addEventListener("touchend", function(e){
    if(wVon < 0) return;
    var t1 = e.changedTouches[0], dx = t1.clientX - wx0, dy = t1.clientY - wy0;
    if(Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)*0.8) return;
    geheZu(wVon + (dx < 0 ? 1 : -1), true); wVon = -1;
  }, { passive:true });
  root.querySelectorAll("[data-satzgo]").forEach(function(b){ b.addEventListener("click", function(){ geheZu(+b.getAttribute("data-satzgo"), true); }); });
  function raus(){ studioPauseStop(); if(satzUhr){ clearInterval(satzUhr); satzUhr = 0; } if(programmKontextFuer("plan:"+p.id)) go("#koerper"); else goBack("#katalog"); }
  root.querySelector("[data-satzexit]").addEventListener("click", raus);
  progChipBinden(root, "plan:"+p.id, function(){ studioPauseStop(); if(satzUhr){ clearInterval(satzUhr); satzUhr = 0; } });
  root.querySelector("[data-satzsave]").addEventListener("click", function(){ if(!root.querySelector(".satz-ende")) abschluss(); });
  function pauseZeigen(){
    var el = root.querySelector(".satz-pause:not([hidden])");
    if(!studioPause){ if(el && !el.classList.contains("vorbei")){ el.classList.add("vorbei"); el.querySelector("b").textContent = t("stPauseEnd"); } return; }
    if(studioPause.ende - Date.now() <= 0){ studioPauseZeigen(); if(el){ el.classList.add("vorbei"); el.querySelector("b").textContent = t("stPauseEnd"); } return; }   // Ende: Vibration und Anzeige übernimmt studioPauseZeigen
    var rest3 = Math.ceil((studioPause.ende - Date.now())/1000); if(rest3 <= 3 && rest3 !== satzLetzterTick){ satzLetzterTick = rest3; vibrate(18); }
    var k = root.querySelector('.satz-karte[data-id="'+studioPause.id+'"] .satz-pause');
    if(!k) return;
    k.hidden = false; k.classList.remove("vorbei"); k.querySelector("b").textContent = fmtTime(Math.max(0, Math.ceil((studioPause.ende - Date.now())/1000)));
  }
  function karteNeu(i){
    var alt = wisch.children[i], neu = document.createElement("div"), id = ids[i];
    neu.innerHTML = satzKarteHTML(id, i, ids.length);
    wisch.replaceChild(neu.firstChild, alt); bindKarte(wisch.children[i]);
  }
  function bindKarte(k){
    var id = k.getAttribute("data-id"), i = +k.getAttribute("data-satzk"), ex = findExercise(id), z = studioZiel(id), koerper = studioNurBlock(ex);
    var kgIn = k.querySelector(".satz-kg"), wIn = k.querySelector(".satz-w");
    function kgWert(){ if(!kgIn) return 0; var x = parseFloat(String(kgIn.value).replace(",", ".")); return isFinite(x) && x >= 0 ? Math.min(500, x) : 0; }
    function tipp(){ vibrate(12); }
    var a;
    if((a = k.querySelector("[data-kgminus]"))) a.addEventListener("click", function(){ tipp(); kgIn.value = studioKg(Math.max(0, kgWert() - z.schritt)); });
    if((a = k.querySelector("[data-kgplus]"))) a.addEventListener("click", function(){ tipp(); kgIn.value = studioKg(kgWert() + z.schritt); });
    var zeitE = studioEinheit(id) === "zeit", wSchritt = zeitE ? 5 : 1, wMax = zeitE ? 600 : 100;   // Zeit: Sekunden in Fünferschritten
    k.querySelector("[data-wminus]").addEventListener("click", function(){ tipp(); wIn.value = Math.max(1, (parseInt(wIn.value) || 0) - wSchritt); });
    k.querySelector("[data-wplus]").addEventListener("click", function(){ tipp(); wIn.value = Math.min(wMax, (parseInt(wIn.value) || 0) + wSchritt); });
    [kgIn, wIn].forEach(function(f){ if(f) f.addEventListener("focus", function(){ f.select(); }); });
    k.querySelectorAll("[data-ukg]").forEach(function(b){ b.addEventListener("click", function(){ tipp(); if(kgIn) kgIn.value = studioKg(+b.getAttribute("data-ukg")); wIn.value = b.getAttribute("data-uw"); }); });
    k.querySelector("[data-satzset]").addEventListener("click", function(){
      var kg = koerper ? 0 : kgWert(), w = Math.max(1, Math.min(wMax, parseInt(wIn.value) || 1)), e = studioEintrag(id) || {};
      studioSatzLog(id, kg, w, zeitE);
      vibrate([40, 30, 70]);
      var h = (studioEintrag(id).log || []).slice(-1)[0], nSatz = h ? h.s.length : 1;
      satzFeedback(nSatz, satzText(zeitE ? [kg, w, "n", 0, 1] : [kg, w]), false);
      var pause = e.pause || (koerper ? 60 : 90);
      studioPauseStart(id, pause);
      karteNeu(i); pauseZeigen(); punkteFertig();
      var neuBtn = wisch.children[i].querySelector("[data-satzset]");
      if(neuBtn){ var alt = neuBtn.textContent; neuBtn.classList.add("ok"); neuBtn.textContent = "✓ "+t("satzGespeichert", { n:nSatz }); setTimeout(function(){ neuBtn.classList.remove("ok"); neuBtn.textContent = alt; }, 900); }
      var punkte = wisch.children[i].querySelectorAll(".satz-saetze i.an"); if(punkte.length) punkte[punkte.length - 1].classList.add("pop");
      if(state.db.settings.sound) phaseBeep("tick");
      fertigKnopf(true);   // nach dem letzten Satz wird „Fertig“ hell (vorher ausgegraut); das Antippen zeigt die Zusammenfassung
    });
    if((a = k.querySelector("[data-satzskip]"))) a.addEventListener("click", function(){ studioPauseStop(); k.querySelector(".satz-pause").hidden = true; });
    if((a = k.querySelector("[data-satzweiter]"))) a.addEventListener("click", function(){
      if(i < ids.length - 1) geheZu(i + 1, true); else if(!root.querySelector(".satz-ende")) abschluss();
    });
    if((a = k.querySelector("[data-satztipp]"))) a.addEventListener("click", function(){
      var tp = studioSteigerTipp(id), en = studioAlle()[id] || (studioAlle()[id] = { log:[] }); if(!tp) return;
      if(tp.art === "kg"){ en.kg = tp.kg; if(kgIn) kgIn.value = studioKg(tp.kg); } else if(wIn) wIn.value = tp.wdh;
      en.erhoeht = Date.now(); save(); vibrate([20, 30, 40]); a.parentNode.remove();
    });
    if((a = k.querySelector("[data-satzinfo]"))) a.addEventListener("click", function(){ openExInfo(id, false); });
  }
  Array.prototype.forEach.call(wisch.children, bindKarte);
  if(satzUhr) clearInterval(satzUhr);
  satzUhr = setInterval(function(){ if(!document.getElementById("satzRoot")){ clearInterval(satzUhr); satzUhr = 0; return; } pauseZeigen(); }, 300);
  root.querySelector("[data-satzfertig]").addEventListener("click", function(){ if(!root.querySelector(".satz-ende")) abschluss(); });
  punkteFertig();
  geheZu(start, false);
  requestAnimationFrame(function(){ geheZu(start, false); });   // nach dem ersten Layout nochmals, falls die Breite erst jetzt feststeht
}
/* Zusammenfassung: wo heute mehr geschafft wurde als das Ziel, steht hier das neue Ziel (siehe studioStandardPruefen) */
function satzStandardHTML(liste){
  if(!liste || !liste.length) return "";
  return '<div class="satz-std"><b>'+esc(t("satzNeuStandard"))+'</b><small>'+esc(t("satzStdHint"))+'</small>'+
    liste.map(function(c){ var ex = findExercise(c.id); return '<div class="satz-vgl"><span class="satz-vgl-n">'+esc(ex ? tplText(ex.name) : c.id)+'</span><span class="satz-vgl-b hoch">'+esc(studioStandardText(c))+'</span></div>'; }).join("")+'</div>';
}
