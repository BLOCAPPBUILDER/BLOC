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

/* Vorschlag für den nächsten Satz: heute der letzte Satz, sonst Arbeitsgewicht bzw. letztes Mal */
function studioVorschlag(id){
  if(studioPR && studioPR.id !== id) studioPR = null;
  var e = studioEintrag(id) || {}, z = studioZiel(id), log = e.log || [], heute = studioTag(Date.now());
  var h = log.length && studioTag(log[log.length-1].at) === heute ? log[log.length-1] : null;
  if(h && h.s.length) return { kg:h.s[h.s.length-1][0], wdh:h.s[h.s.length-1][1] };
  var vor = log.length ? log[log.length-1] : null, va = vor ? arbeitsSaetze(vor) : [];
  return { kg: e.kg != null ? e.kg : (va.length ? va[0][0] : 0), wdh: va.length ? va[0][1] : z.wdh };
}
/* Doppelte Progression: in den letzten zwei Einheiten mit dem Arbeitsgewicht alle Ziel-Sätze mit Ziel-Wdh. (Aufwärmsätze zählen nicht) */
function studioSteigern(id){
  var e = studioEintrag(id), z = studioZiel(id);
  if(!e || !e.log || e.log.length < 2) return null;
  var lz = arbeitsSaetze(e.log[e.log.length-1]);
  var kg = e.kg != null ? e.kg : (lz.length ? lz[0][0] : 0);
  if(!(kg > 0)) return null;
  var zwei = e.log.slice(-2);
  var ok = zwei.every(function(l){
    var gute = arbeitsSaetze(l).filter(function(x){ return x[0] >= kg && x[1] >= z.wdh; });
    return gute.length >= z.saetze;
  });
  if(!ok || (e.erhoeht && e.erhoeht >= zwei[1].at)) return null;
  return { kg:Math.round((kg + z.schritt)*100)/100, ziel:z.saetze+" × "+z.wdh };
}
/* Vorschlag zum Steigern: gleiche Arbeitslast seit mindestens zwei Wochen (mindestens zwei Einheiten) → 5 % mehr, auf den Schritt der Übung gerundet (mindestens ein Schritt);
   ohne Gewicht: zwei Wiederholungen mehr. Nimmt den strengeren Vorschlag der doppelten Progression (studioSteigern) vorweg, wenn der schon da ist. Nur ein Hinweis, die Technik entscheidet. */
function studioSteigerTipp(id){
  var e = studioEintrag(id), z = studioZiel(id);
  if(!e || !e.log || e.log.length < 2) return null;
  var tag = 86400000, heute = studioTag(Date.now());
  var l = e.log.filter(function(x){ return arbeitsSaetze(x).length && studioTag(x.at) !== heute; });   // frühere Einheiten (heute zählt nicht)
  if(l.length < 2) return null;
  function top(x){ var b = null; arbeitsSaetze(x).forEach(function(s){ if(!b || s[0] > b[0] || (s[0] === b[0] && s[1] > b[1])) b = s; }); return b; }
  var letzte = l[l.length-1], tl = top(letzte), n = 1, ab = letzte.at;
  for(var i = l.length - 2; i >= 0; i--){ var ti = top(l[i]); if(ti[0] === tl[0] && (tl[0] > 0 || ti[1] === tl[1])){ n++; ab = l[i].at; } else break; }
  if(n < 2) return null;
  var wochen = Math.floor((Date.now() - ab)/(7*tag));
  if(wochen < 2) return null;
  if(e.erhoeht && e.erhoeht >= letzte.at) return null;
  if(tl[0] > 0){
    var neu = Math.max(tl[0] + z.schritt, Math.round(tl[0]*1.05/z.schritt)*z.schritt);
    return { art:"kg", kg:Math.round(neu*100)/100, alt:tl[0], wochen:wochen, prozent:Math.round((neu/tl[0] - 1)*100) };
  }
  return { art:"wdh", wdh:tl[1] + 2, alt:tl[1], wochen:wochen };
}
function studioSteigerTippText(v){
  return v.art === "kg" ? t("tippKg", { w:v.wochen, kg:studioKg(v.alt), neu:studioKg(v.kg), p:v.prozent }) : t("tippWdh", { w:v.wochen, n:2, neu:v.wdh });
}
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
    if(!i) return false;
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
  openStatistik({
    titel:tplText(ex.name), farbe:studioFarbe(ex), hatDaten:log.length > 0, leerText:t("stStatsEmpty"),
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
  studioStandardPruefen(id, false);   // frühere Einheit mit mehr geschafft: neues Ziel übernehmen
  var ex = findExercise(id);
  if(!ex){ go("#timers"); return; }
  var koerper = studioNurBlock(ex);   // Übung ohne Gewicht (Air): Sätze × Wiederholungen oder Timer, kein Gewichtsfeld
  if(studioPause && studioPause.id !== id) studioPauseStop();
  var e = studioEintrag(id) || {}, z = studioZiel(id), log = e.log || [], heute = studioTag(Date.now());
  var h = log.length && studioTag(log[log.length-1].at) === heute ? log[log.length-1] : null;
  var v = studioVorschlag(id), stg = studioSteigern(id), pause = e.pause || (koerper ? 60 : 90);
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
      (ILLU[id] ? '<div class="st-figur">'+illuHTML(id, "st-illu")+'</div>' : (ex.custom ? '<div class="st-figur"><span class="ex-symbol big">'+exSymbol(ex)+'</span></div>' : ''))+
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
      (stg ? '<div class="st-steigern"><span>'+esc(t("stSuggest", { z:stg.ziel, kg:studioKg(stg.kg) }))+'</span>'+
        '<button type="button" class="btn btn-primary" data-stup>'+esc(t("stSuggestYes"))+'</button></div>' : '')+
      '<div class="st-heute"><b>'+esc(t("stToday"))+':</b> '+(h && h.s.length ? h.s.map(function(x, i){
        return '<span class="st-satz">'+(i+1)+'. '+esc(satzText(x).replace("×", " × "))+'</span>'; }).join("") : '<span class="st-leer">–</span>')+'</div>'+
      (blKontext ? '<div class="st-block"><span><b>'+esc(t(blKontext.art === "zirkel" ? "blkZirkel" : "blkSuper"))+'</b> · '+(blKontext.i+1)+'/'+blKontext.n+
        '<small>'+esc(t(blKontext.letzte ? "blkDannPause" : "blkDanach", { n:tplText(findExercise(blKontext.next).name) }))+'</small></span>'+
        '<button type="button" class="btn btn-primary" data-stblock="'+esc(blKontext.next)+'">'+esc(t("blkWeiter"))+' ›</button></div>' : '')+
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
    '</div>'+
    '<div class="section-title">'+esc(t("stNote"))+'</div>'+
    '<div class="card"><textarea id="st-notiz" rows="2" placeholder="'+esc(t("stNotePh"))+'">'+esc(e.notiz || "")+'</textarea></div>'+
    studioInfoHTML(id, ex)+
    gymHinweisHTML(ex)+
    '<p class="info-risk">'+esc(t("ownRisk"))+' <a href="privacy.html#haftung" target="_blank" rel="noopener">'+t("ownRiskMore")+'</a> · <a href="quellen.html" target="_blank" rel="noopener">'+t("sourcesLink")+'</a></p>'+
    (trKontext.ids.length ? trainingLeisteHTML(trKontext) : "")+
    '<div style="height:'+(trKontext.ids.length ? 96 : 40)+'px"></div>';
  bindCommon();
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
    var l = en.log.length && studioTag(en.log[en.log.length-1].at) === studioTag(jetzt) ? en.log[en.log.length-1] : null;
    var davor = studioBestwerte(en.log);   // Bestwerte vor diesem Satz
    if(!l){ l = { at:jetzt, s:[] }; en.log.push(l); if(en.log.length > 200) en.log = en.log.slice(-200); }
    var satz = [kg, w], rpe = anstrengungModus() ? studioRpeWahl : 0;   // typ "n" steht als Platzhalter, wenn nur die Anstrengung angegeben ist
    if(typ !== "n" || rpe) satz.push(typ);
    if(rpe) satz.push(rpe);
    l.s.push(satz);
    // Rekord: neues Bestgewicht, sonst neues geschätztes 1RM (Aufwärmsätze zählen nicht)
    var rm = satzSchaetzung1RM([kg, w]);
    studioPR = typ === "w" ? null :
      kg === 0 && davor.kg === 0 ? (davor.wdh > 0 && w > davor.wdh ? { id:id, art:"wdh", w:w, vorher:davor.wdh } : null) :   // ohne Gewicht: mehr Wiederholungen
      davor.kg > 0 && kg > davor.kg ? { id:id, art:"kg", kg:kg, w:w, vorher:davor.kg } :
      davor.rm > 0 && rm > davor.rm + .05 ? { id:id, art:"rm", kg:kg, w:w, rm:rm, vorherRm:davor.rm } :
      davor.kg > 0 && kg === davor.kg && w > davor.wBest ? { id:id, art:"wdh", w:w, vorher:davor.wBest } : null;   // gleiches Gewicht, mehr Wiederholungen
    studioSatzTypWahl = "n"; studioRpeWahl = 0;
    if(!koerper) en.kg = kg;
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
    var en = eintrag(), l = en.log[en.log.length-1];
    if(l && studioTag(l.at) === heute){ l.s.pop(); if(!l.s.length) en.log.pop(); }
    studioPR = null;
    studioPauseStop(); save(); trainingNachSatz(id); neu();
  });
  an("[data-stup]", function(){ var en = eintrag(); en.kg = stg.kg; en.erhoeht = Date.now(); save(); showToast(t("stRaised", { kg:studioKg(stg.kg) })); neu(); });
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
/* Studio zählt für die Wochenzeile: ein Eintrag je Tag, die Dauer vom ersten bis zum letzten Satz */
function studioVerlauf(id, jetzt){
  pruneHistory(state.db);
  var hs = state.db.history, tag = studioTag(jetzt), e = null;
  for(var i=hs.length-1; i>=0; i--) if(hs[i].studio && studioTag(hs[i].studio) === tag){ e = hs[i]; break; }
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
function studioSatzLog(id, kg, w){
  var alle = studioAlle(), en = alle[id] || (alle[id] = { log:[] }), jetzt = Date.now();
  if(!en.log) en.log = [];
  var l = en.log.length && studioTag(en.log[en.log.length-1].at) === studioTag(jetzt) ? en.log[en.log.length-1] : null;
  if(!l){ l = { at:jetzt, s:[] }; en.log.push(l); if(en.log.length > 200) en.log = en.log.slice(-200); }
  l.s.push([kg, w]);
  en.kg = kg; en.zuletzt = jetzt;
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

/* Neuer Standard: Wer mehr geschafft hat als das Ziel, hat damit ein neues Ziel. Ausgewertet wird die jüngste Einheit (Arbeitssätze):
   - mehr Sätze als das Ziel (z. B. 4 statt 3) → das Ziel hat jetzt diese Satzzahl
   - alle Ziel-Sätze (die besten, so viele wie das Ziel verlangt) mit mindestens 10 % mehr Wiederholungen → das Ziel hat diese Wiederholungen
   - alle Ziel-Sätze mit mindestens 10 % mehr Gewicht als bisher → das ist das neue Arbeitsgewicht (ein einzelner Satz zählt nicht)
   Es wird nur angehoben, nie gesenkt; jede Einheit wird einmal ausgewertet (e.stdBis/e.stdN). mitHeute: auch die heutige Einheit auswerten (beim Abschluss).
   Gibt die Änderung zurück ({ id, alt, neu, kgAlt, kgNeu }) oder null. */
function studioStandardPruefen(id, mitHeute){
  var e = studioEintrag(id);
  if(!e || !e.log || !e.log.length) return null;
  var heute = studioTag(Date.now()), idx = -1, i;
  for(i = e.log.length - 1; i >= 0; i--){
    if(!arbeitsSaetze(e.log[i]).length) continue;
    if(!mitHeute && studioTag(e.log[i].at) === heute) continue;
    idx = i; break;
  }
  if(idx < 0) return null;
  var l = e.log[idx], a = arbeitsSaetze(l), n = a.length;
  if(e.stdBis === l.at && e.stdN === n) return null;   // diese Einheit ist schon ausgewertet
  if(e.manuell && l.at <= e.manuell){ e.stdBis = l.at; e.stdN = n; save(); return null; }   // danach von Hand angepasst: die Handeinstellung gilt, diese Einheit ändert nichts mehr
  var z = studioZiel(id), neu = { saetze:z.saetze, wdh:z.wdh }, kgNeu = null, kgAlt = e.kg;
  if(n > z.saetze) neu.saetze = Math.min(n, 12);
  /* „generell“, nicht ein einzelner Satz: es zählen die besten Ziel-Sätze (so viele, wie das Ziel verlangt) - alle müssen die Marke schaffen */
  if(n >= z.saetze){
    var beste = a.slice().sort(function(x, y){ return y[0] - x[0] || y[1] - x[1]; }).slice(0, z.saetze);
    var kgMin = Math.min.apply(null, beste.map(function(x){ return x[0]; })), minW = Math.min.apply(null, beste.map(function(x){ return x[1]; }));
    if(minW >= Math.ceil(z.wdh*1.1)) neu.wdh = Math.min(minW, 100);
    var basis = studioBestwerte(e.log.slice(0, idx)).kg;
    if(kgMin > 0 && basis > 0 && kgMin >= basis*1.1 - 1e-9) kgNeu = kgMin;
  }
  e.stdBis = l.at; e.stdN = n;
  var geaendert = neu.saetze !== z.saetze || neu.wdh !== z.wdh || (kgNeu != null && kgNeu !== e.kg);
  if(neu.saetze !== z.saetze || neu.wdh !== z.wdh) e.ziel = { saetze:neu.saetze, wdh:neu.wdh };
  if(kgNeu != null) e.kg = kgNeu;
  save();
  return geaendert ? { id:id, alt:z, neu:neu, kgAlt:kgAlt, kgNeu:kgNeu } : null;
}
function studioStandardText(c){
  var teile = [];
  if(c.neu.saetze !== c.alt.saetze) teile.push(t("satzStdSaetze", { n:c.neu.saetze }));
  if(c.neu.wdh !== c.alt.wdh) teile.push(t("satzStdWdh", { n:c.neu.wdh }));
  if(c.kgNeu != null && c.kgNeu !== c.kgAlt) teile.push(studioKg(c.kgNeu)+" kg");
  return teile.join(" · ");
}
