"use strict";
/* ============ Trainingskalender ============
   Wochen- oder Monatsansicht (Montag zuerst). Einträge: eigene Workouts (Nach Zeit), Pläne (Nach Sätzen), Workouts aus dem Katalog, Mobility & Stretch,
   Run (frei oder mit Ziel in km) und ein Zufallstraining („Überrasch mich“ erst am Tag selbst).
   Hinzufügen nur über „+ Hinzufügen“ am Tag (BLOC, Workout aus dem Katalog, TrainingsBLOC, Run – je ein Teil). Im Monat
   wählt ein Tipp den Tag, seine Einträge stehen unter dem Raster. Einträge verschiebt man über ihr Menü
   („Auf einen anderen Tag“). Daten: settings.kalender = { e:[{ id, tag:"JJJJ-MM-TT", art, ref, name, km, erledigt, at }] }
   - nur auf dem Gerät, wie alles andere. Art: workout | plan | lib | run | zufall; bei run steht rad:true für eine Radfahrt.
   „Woche kopieren“ legt alle Einträge der Woche auf die gleichen Wochentage der nächsten 1-12 Wochen. */
var kalAnsicht = "woche";      // "woche" | "monat"
var kalBasis = null;           // ein Tag der angezeigten Woche bzw. des Monats
var kalAuswahl = null;         // im Monat gewählter Tag (Einträge stehen unter dem Raster)
var KAL_FARBE = { workout:"var(--tp-color)", plan:"var(--gym-color, var(--bl-color))", lib:"var(--tp-color)", run:"var(--run-color, #e5573f)", zufall:"var(--accent)", programm:"var(--accent)" };

/* ---------- Daten ---------- */
function kalListe(){
  var s = state.db.settings;
  if(!s.kalender || !Array.isArray(s.kalender.e)) s.kalender = { e:[] };
  return s.kalender.e;
}
function kalTagKey(d){
  var x = new Date(d);
  return x.getFullYear()+"-"+("0"+(x.getMonth()+1)).slice(-2)+"-"+("0"+x.getDate()).slice(-2);
}
function kalTagDatum(key){ var p = String(key).split("-"); return new Date(+p[0], +p[1]-1, +p[2], 12, 0, 0, 0); }   // Mittag: sicher gegen Sommerzeit
function kalMontag(d){ var x = new Date(d); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
function kalPlus(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function kalKW(d){   // ISO-Kalenderwoche
  var x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  var tag = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - tag);
  var j0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x - j0)/86400000 + 1)/7);
}
function kalAn(tag){
  return kalListe().filter(function(e){ return e.tag === tag; }).sort(function(a, b){ return (a.at || 0) - (b.at || 0); });
}
function kalFinde(id){ var l = kalListe(); for(var i = 0; i < l.length; i++) if(l[i].id === id) return l[i]; return null; }
function kalHinzu(tag, o){
  var e = { id:uid(), tag:tag, art:o.art, ref:o.ref || "", name:o.name || "", km:+o.km || 0, at:Date.now() };   // erledigt fehlt: das ergibt sich aus den Trainings des Tages
  if(o.rad) e.rad = true;   // Run-Eintrag mit dem Rad statt zu Fuß
  kalListe().push(e); save();
  return e;
}
/* Erledigt ergibt sich von allein: ist an dem Tag ein Training dieser Art gelaufen (Run, sonst Workout/Plan/Timer), gilt der Eintrag
   als abgehakt - der Reihe nach, je Training einer. e.erledigt === true bzw. false ist die eigene Entscheidung (abhaken bzw. zurücknehmen). */
function kalAktivitaet(tag){
  var h = (state.db.history || []).filter(function(x){ return x && kalTagKey(x.at) === tag; });
  return {
    run:h.filter(function(x){ return bereichVonEintrag(x) === "run"; }).length,
    train:besuche(h.filter(function(x){ return bereichVonEintrag(x) !== "run"; })).length
  };
}
function kalStatus(tag){   // { Eintrags-ID: erledigt? }
  var a = kalAktivitaet(tag), tr = a.train, rn = a.run, res = {};
  kalAn(tag).forEach(function(e){
    var auto = false;
    if(e.art === "run"){ if(rn > 0){ rn--; auto = true; } }
    else if(tr > 0){ tr--; auto = true; }
    res[e.id] = e.erledigt === true ? true : e.erledigt === false ? false : auto;
  });
  return res;
}
function kalErledigt(e){ return !!kalStatus(e.tag)[e.id]; }
function kalVerschiebe(id, tag){
  var e = kalFinde(id);
  if(!e || e.tag === tag) return false;
  e.tag = tag; e.at = Date.now(); save();
  return true;
}
function kalEntferne(id){
  var s = state.db.settings;
  s.kalender = { e:kalListe().filter(function(e){ return e.id !== id; }) }; save();
}
/* Anzahl der Einträge und Run-Kilometer einer Reihe von Tagen (für die Kopfzeile) */
function kalSumme(tage){
  var n = 0, km = 0, ok = 0;
  tage.forEach(function(tag){ var st = kalStatus(tag); kalAn(tag).forEach(function(e){ n++; if(st[e.id]) ok++; if(e.art === "run") km += e.km || 0; }); });
  return { n:n, km:km, ok:ok };
}
/* Name, Zeile darunter und Farbe eines Eintrags; ok:false, wenn das Ziel gelöscht wurde */
/* Farbe eines Eintrags nach dem Ort seiner Übungen, wie im Katalog: Fitnessstudio rot, Freiluft blau; Mobility & Stretch grün (nur Dehnübungen) */
function kalOrtFarbe(exs){
  if(exs.length && exs.every(function(ex){ return ex.main === "stretch"; })) return "var(--ws-color)";
  return exs.length && katWoOrt(exs) === "studio" ? "var(--gym-color)" : "var(--tp-color)";
}
function kalAufloesen(e){
  var o = { name:e.name || "", sub:"", ok:true, farbe:KAL_FARBE[e.art] || "var(--accent)" };
  function exAnz(exs, dauer){ return t("exCount", { n:exs.length })+(dauer ? " · "+fmtDauerKurz(dauer) : ""); }
  if(e.art === "workout"){
    var mw = findMy(e.ref);
    if(!mw) o.ok = false;
    else {
      var exs = mw.items.map(function(it){ return findExercise(it.ex); }).filter(Boolean);
      o.name = mw.name; o.sub = exAnz(exs, workoutDuration(myRun(mw)));
      o.farbe = mw.ws ? "var(--ws-color)" : kalOrtFarbe(exs);
    }
  } else if(e.art === "plan"){
    var p = stPlanFind(e.ref);
    if(!p) o.ok = false; else { o.name = p.name; o.sub = planAnzahl(stPlanIds(p).length); o.farbe = kalOrtFarbe(stPlanIds(p).map(findExercise).filter(Boolean)); }
  } else if(e.art === "lib"){
    var lw = findLibWorkout(e.ref);
    if(!lw) o.ok = false;
    else {
      var le = lw.exercises.map(findExercise).filter(Boolean);
      o.name = tplText(lw.name); o.sub = exAnz(le, workoutDuration(libWorkoutRun(lw)));
      o.farbe = libIstWarmDehn(lw) ? "var(--ws-color)" : kalOrtFarbe(le);
    }
  } else if(e.art === "programm"){   // ganzer Trainingsplan aus der Arena
    var pg = programmFinde(e.ref);
    if(!pg) o.ok = false; else { o.name = pg.name; o.sub = pg.items.length === 1 ? t("progMeta1") : t("progMeta", { n:pg.items.length }); }
  } else if(e.art === "run"){
    o.name = e.name || t(e.rad ? "kalRadName" : "kalRunName");
    o.sub = (e.km > 0 ? runKm(e.km*1000)+" km" : t("kalRunFrei"))+(e.rad ? " · "+t("runArtRad") : "");
  } else {   // zufall
    o.name = t("kalZufall"); o.sub = t("kalZufallSub");
  }
  if(!o.name) o.name = t("kalFehlt");
  return o;
}
function kalStarten(e){
  if(e.prog && typeof programmFinde === "function"){   // Termin eines Trainingsplans: gleich los, das Training weiß, dass es dazugehört
    var pp = programmFinde(e.prog.id);
    if(pp && pp.items[e.prog.i]){ progKontext = { pid:pp.id, i:e.prog.i }; return progDirektStarten(progEintrag(pp.items[e.prog.i])); }
  }
  if(e.art === "programm"){ var pgm = programmFinde(e.ref); if(pgm && pgm.items.length) programmOeffnen(pgm, (pgm.pos || 0) % pgm.items.length); }   // Trainingsplan: die Einträge laufen der Reihe nach (Weiter mit …)
  else if(e.art === "workout"){ coverDraft = null; go("#cover/my/"+e.ref); }
  else if(e.art === "lib"){ coverDraft = null; go("#cover/lib/"+e.ref); }
  else if(e.art === "plan"){ var pl = stPlanFind(e.ref); if(pl && stPlanIds(pl).length) planAlsWorkout(pl); else go("#studioplan/"+e.ref); }
  else if(e.art === "run"){ state.db.settings.runArt = e.rad ? "rad" : "lauf"; save(); runGeplant ={ name:e.name || t(e.rad ? "kalRadName" : "kalRunName"), km:e.km || 0, rad:!!e.rad, t:Date.now() }; go("#run"); }
  else openSurprise();
}

/* ---------- Ansicht ---------- */
function kalNeu(){ var y = window.scrollY; renderKalender(); window.scrollTo(0, y); }
function kalEintragHTML(e){
  var o = kalAufloesen(e);
  return '<div class="kal-eintrag'+(kalErledigt(e) ? ' erledigt' : '')+(o.ok ? '' : ' fehlt')+'" data-kaleid="'+esc(e.id)+'" data-kalname="'+esc(o.name)+'" style="--kc:'+o.farbe+'" role="button" tabindex="0">'+
    '<i class="ke-balken"></i><span class="ke-text"><b>'+esc(o.name)+'</b><small>'+esc(o.ok ? o.sub : t("kalFehlt"))+'</small></span>'+
    '</div>';
}
/* Beim Öffnen der Wochenansicht: liegt der heutige Tag unter der unteren Leiste, wird er ins Bild geholt (sonst sieht man ihn erst nach dem Scrollen) */
function kalHeuteSichtbar(){
  if(kalAnsicht === "monat" || window.scrollY > 40) return;
  var h = app.querySelector(".kal-tag.heute");
  if(!h) return;
  var r = h.getBoundingClientRect();
  if(r.bottom > window.innerHeight - 112) window.scrollTo(0, Math.max(0, window.scrollY + r.bottom - (window.innerHeight - 132)));
}
/* Eine Woche bzw. einen Monat vor (+1) oder zurück (-1); per Knopf oder Wischen. gleiten: die Seite schiebt sich kurz in die Richtung des Wischens ein */
function kalBlaettern(r, gleiten){
  if(!kalBasis) kalBasis = new Date();
  kalBasis = kalAnsicht === "monat" ? new Date(kalBasis.getFullYear(), kalBasis.getMonth()+r, 1, 12) : kalPlus(kalBasis, 7*r);
  renderKalender(); window.scrollTo(0, 0);
  if(gleiten){
    app.classList.remove("kal-gleit-vor", "kal-gleit-zurueck"); void app.offsetWidth;
    app.classList.add(r > 0 ? "kal-gleit-vor" : "kal-gleit-zurueck");
    vibrate(8);
    setTimeout(function(){ app.classList.remove("kal-gleit-vor", "kal-gleit-zurueck"); }, 320);
  }
}
function renderKalender(){
  var s = state.db.settings, lang = currentLang() === "en" ? "en-GB" : "de-DE";
  if(!kalBasis) kalBasis = new Date();
  var heute = kalTagKey(Date.now()), monat = kalAnsicht === "monat";
  var namen = t("weekDays").split(" ");
  var kopfText, tage = [], html;
  if(!monat){
    var mo = kalMontag(kalBasis);
    for(var i = 0; i < 7; i++) tage.push(kalPlus(mo, i));
    var so = tage[6];
    kopfText = mo.toLocaleDateString(lang, { day:"numeric", month:"short" }).replace(/\.$/, "")+" – "+so.toLocaleDateString(lang, { day:"numeric", month:"short" });
  } else {
    var m1 = new Date(kalBasis.getFullYear(), kalBasis.getMonth(), 1, 12), start = kalMontag(m1);
    var letzter = new Date(kalBasis.getFullYear(), kalBasis.getMonth()+1, 0, 12), wochen = Math.ceil((((letzter - start)/86400000) + 1)/7);
    for(var j = 0; j < wochen*7; j++) tage.push(kalPlus(start, j));
    kopfText = m1.toLocaleDateString(lang, { month:"long", year:"numeric" });
    var imMonat = tage.filter(function(d){ return d.getMonth() === kalBasis.getMonth(); }).map(kalTagKey);
    if(!kalAuswahl || imMonat.indexOf(kalAuswahl) < 0) kalAuswahl = imMonat.indexOf(heute) > -1 ? heute : imMonat[0];   // gewählter Tag steht immer im angezeigten Monat
  }
  var sichtbar = tage.filter(function(d){ return !monat || d.getMonth() === kalBasis.getMonth(); }).map(kalTagKey);
  var sum = kalSumme(sichtbar);
  var heuteKnopf = '<button type="button" class="kal-heutebtn" data-kalheute aria-label="'+esc(t("kalHeuteSpringen"))+'">'+svgIcon('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>')+'<span>'+esc(t("kalHeute"))+'</span></button>';
  html = bereichKopfNeuHTML("kal", t("tabKalender"), t("kalKicker"), heuteKnopf, { klar:true, foto:"img/neu-d-kalender.jpg", fotoHell:"img/neu-h-kettlebell.jpg", zurueck:"#home", ohneSuche:true }) +
    '<div class="card lib-tabs-card"><div class="theme-pick lib-tabs seg-2">'+
      '<button type="button" data-kalansicht="woche" class="'+(!monat ? 'active' : '')+'">'+esc(t("kalWoche"))+'</button>'+
      '<button type="button" data-kalansicht="monat" class="'+(monat ? 'active' : '')+'">'+esc(t("kalMonat"))+'</button></div></div>'+
    '<div class="kal-nav"><button type="button" class="iconbtn" data-kalnav="-1" aria-label="'+esc(t("kalZurueck"))+'">&#8249;</button>'+
      '<div class="kn-mitte">'+(monat ? '<b>'+esc(kopfText)+'</b>' : '<b>'+esc(t("kalKW", { n:kalKW(tage[0]) }))+'</b><small>'+esc(kopfText)+'</small>')+'</div>'+
      '<button type="button" class="iconbtn" data-kalnav="1" aria-label="'+esc(t("kalVor"))+'">&#8250;</button></div>'+
    // Woche: dieselbe Karte wie „Diese Woche“ auf der Startseite (Tage mit Punkt = trainiert, Ring = geplant); Monat: nur die Summe
    (!monat ? wocheHTML({ basis:tage[0], kal:true, titel:kalTagKey(tage[0]) === kalTagKey(kalMontag(new Date())) ? t("weekTitle") : t("kalKW", { n:kalKW(tage[0]) }) })+
      (sum.km > 0 ? '<div class="kal-summe">'+esc(runKm(sum.km*1000).replace(/[,.]00$/, "")+" km Run")+'</div>' : '')+
      (sum.n ? '<button type="button" class="btn btn-secondary kal-kopieren" data-kalloeschen>'+svgIcon('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"/>')+' '+esc(t("kalAlleLoeschen"))+'</button>' : '') : '')+
    (monat ? '<div class="kal-summe">'+esc(sum.n ? t("kalGeplant", { n:sum.n })+(sum.ok ? " · "+t("kalErledigtN", { n:sum.ok }) : "")+(sum.km > 0 ? " · "+runKm(sum.km*1000).replace(/[,.]00$/, "")+" km Run" : "") : t("kalNichtsGeplant"))+'</div>' : '');
  if(!monat){
    html += tage.map(function(d, i){
      var key = kalTagKey(d), liste = kalAn(key), vorbei = key < heute;
      return '<section class="kal-tag'+(key === heute ? ' heute' : '')+(vorbei ? ' vorbei' : '')+'" data-kaltag="'+key+'">'+
        '<div class="kt-kopf"><small>'+esc(d.toLocaleDateString(lang, { weekday:"short" }).replace(/\.$/, ""))+'</small><b class="kt-nr">'+d.getDate()+'</b></div>'+
        '<div class="kt-liste">'+liste.map(kalEintragHTML).join("")+
          '<button type="button" class="kt-add" data-kaladd="'+key+'">'+svgIcon('<path d="M12 5v14M5 12h14"/>')+'<span>'+esc(t("kalAdd"))+'</span></button></div></section>';
    }).join("");
  } else {
    html += '<div class="kal-monat"><div class="km-namen">'+namen.map(function(n){ return '<small>'+esc(n)+'</small>'; }).join("")+'</div><div class="km-raster">'+
      tage.map(function(d){
        var key = kalTagKey(d), liste = kalAn(key), ausser = d.getMonth() !== kalBasis.getMonth();
        return '<button type="button" class="km-zelle'+(key === heute ? ' heute' : '')+(ausser ? ' aus' : '')+(key === kalAuswahl ? ' gewaehlt' : '')+'" data-kaltag="'+key+'" data-kaltap="'+key+'"><b>'+d.getDate()+'</b>'+
          '<span class="km-balken">'+liste.slice(0, 3).map(function(e){ return '<i class="'+(kalErledigt(e) ? 'ok' : '')+'" style="--kc:'+kalAufloesen(e).farbe+'"></i>'; }).join("")+(liste.length > 3 ? '<em>+'+(liste.length-3)+'</em>' : '')+'</span></button>';
      }).join("")+'</div></div>';
  }
  if(monat){   // gewählter Tag unter dem Raster: Einträge und „Hinzufügen“, ohne die Ansicht zu wechseln
    var datum = kalTagDatum(kalAuswahl);
    html += '<section class="kal-tag kal-panel'+(kalAuswahl === heute ? ' heute' : '')+(kalAuswahl < heute ? ' vorbei' : '')+'" data-kaltag="'+kalAuswahl+'">'+
      '<div class="kt-kopf"><small>'+esc(datum.toLocaleDateString(lang, { weekday:"short" }).replace(/\.$/, ""))+'</small><b class="kt-nr">'+datum.getDate()+'</b></div>'+
      '<div class="kt-liste"><div class="kp-titel">'+esc(kalTagText(kalAuswahl))+'</div>'+kalAn(kalAuswahl).map(kalEintragHTML).join("")+
        '<button type="button" class="kt-add" data-kaladd="'+kalAuswahl+'">'+svgIcon('<path d="M12 5v14M5 12h14"/>')+'<span>'+esc(t("kalAdd"))+'</span></button></div></section>';
  }
  html += '<div style="height:40px"></div>';
  app.innerHTML = html;
  bindCommon();
  app.querySelectorAll("[data-kalansicht]").forEach(function(b){ b.addEventListener("click", function(){ kalAnsicht = b.getAttribute("data-kalansicht"); renderKalender(); window.scrollTo(0, 0); }); });
  app.querySelectorAll("[data-kalnav]").forEach(function(b){ b.addEventListener("click", function(){ kalBlaettern(+b.getAttribute("data-kalnav"), false); }); });
  app.querySelectorAll("[data-kalgoto]").forEach(function(el){   // Tag in der Wochenkarte: zu diesem Tag springen
    function los(){
      var z = app.querySelector('.kal-tag[data-kaltag="'+el.getAttribute("data-kalgoto")+'"]');
      if(z && z.scrollIntoView) z.scrollIntoView({ block:"center", behavior:"smooth" });
    }
    el.addEventListener("click", los);
    el.addEventListener("keydown", function(ev){ if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); los(); } });
  });
  var hb = app.querySelector("[data-kalheute]");
  if(hb) hb.addEventListener("click", function(){   // „Heute“: zur aktuellen Woche bzw. zum aktuellen Monat, im Monat ist heute gewählt
    kalBasis = new Date(); kalAuswahl = kalTagKey(Date.now()); renderKalender(); window.scrollTo(0, 0);
    var z = app.querySelector(".kal-tag.heute, .kal-panel.heute");
    if(z && z.scrollIntoView) z.scrollIntoView({ block:"center", behavior:"smooth" });
  });
  app.querySelectorAll("[data-kaladd]").forEach(function(b){ b.addEventListener("click", function(){ kalHinzuMenue(b.getAttribute("data-kaladd")); }); });
  var kl = app.querySelector("[data-kalloeschen]");
  if(kl) kalHaltenLoeschen(kl, tage.map(kalTagKey));
  app.querySelectorAll("[data-kaltap]").forEach(function(b){
    b.addEventListener("click", function(){   // Monat: den Tag auswählen, die Ansicht bleibt (Einträge stehen unter dem Raster)
      var key = b.getAttribute("data-kaltap"), d = kalTagDatum(key);
      if(d.getMonth() !== kalBasis.getMonth()) kalBasis = d;   // Tag aus dem Nachbarmonat: dorthin blättern
      kalAuswahl = key; renderKalender();
      var p = app.querySelector(".kal-panel"); if(p && p.scrollIntoView) p.scrollIntoView({ block:"nearest", behavior:"smooth" });
    });
  });
  app.querySelectorAll("[data-kaleid]").forEach(function(el){
    function los(){ var e = kalFinde(el.getAttribute("data-kaleid")); if(e) kalEintragMenue(e); }
    el.addEventListener("click", los);
    el.addEventListener("keydown", function(ev){ if(ev.target === el && (ev.key === "Enter" || ev.key === " ")){ ev.preventDefault(); los(); } });
  });
}

/* ---------- Menüs ---------- */
function kalTagText(tag){
  return kalTagDatum(tag).toLocaleDateString(currentLang() === "en" ? "en-GB" : "de-DE", { weekday:"long", day:"numeric", month:"long" });
}
function kalEintragMenue(e){
  var o = kalAufloesen(e), acts = [];
  if(o.ok) acts.push({ ico:P_PLAY, label:t("kalStart"), fn:function(){ kalStarten(e); } });
  acts.push({ ico:ICON_EDIT, label:t("kalVerschieben"), fn:function(){ kalVerschiebenMenue(e); } });
  acts.push({ ico:P_TRASH, label:t("kalLoeschen"), danger:true, fn:function(){ kalEntferne(e.id); kalNeu(); } });
  openActionSheet(o.name+" · "+kalTagText(e.tag), acts);
}
function kalVerschiebenMenue(e){
  var mo = kalMontag(kalTagDatum(e.tag)), acts = [];
  var namen = t("weekDays").split(" ");
  for(var i = 0; i < 7; i++){
    (function(i){
      var d = kalPlus(mo, i), key = kalTagKey(d);
      if(key === e.tag) return;
      acts.push({ ico:ICON_EDIT, label:(namen[i] || "")+" "+d.getDate()+"."+(d.getMonth()+1)+".", fn:function(){ kalVerschiebe(e.id, key); kalNeu(); } });
    })(i);
  }
  acts.push({ ico:ICON_EDIT, label:t("kalNaechsteWoche"), fn:function(){ kalVerschiebe(e.id, kalTagKey(kalPlus(kalTagDatum(e.tag), 7))); kalNeu(); } });
  acts.push({ ico:ICON_EDIT, label:t("kalVorherigeWoche"), fn:function(){ kalVerschiebe(e.id, kalTagKey(kalPlus(kalTagDatum(e.tag), -7))); kalNeu(); } });
  openActionSheet(t("kalVerschieben"), acts);
}
/* Auswahl mit Suche: items = [{ id, name, sub }] */
function kalPicker(titel, items, onPick){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet re-pick" role="dialog" aria-label="'+esc(titel)+'">'+
    '<h3>'+esc(titel)+'</h3>'+searchHTML("", "kp", t("wsSearchPh"))+
    '<div class="re-pick-liste">'+(items.length ? items.map(function(o){
      return '<div class="list-item entry" role="button" tabindex="0" data-kpick="'+esc(o.id)+'" data-q="'+esc(o.name+" "+(o.sub || ""))+'"><div class="meta"><div class="name">'+esc(o.name)+'</div>'+
        (o.sub ? '<div class="sub">'+esc(o.sub)+'</div>' : '')+'</div></div>';
    }).join("") : '<div class="empty" style="padding:20px;">'+esc(t("kalListeLeer"))+'</div>')+
    '<div class="empty" data-noresult style="display:none;padding:20px;">'+esc(t("noResult"))+'</div></div>'+
    '<button class="btn btn-secondary" data-reclose>'+esc(t("cancel"))+'</button></div></div>';
  function zu(){ root.innerHTML = ""; }
  var box = root.querySelector(".re-pick-liste"), q = root.querySelector("#kp-q");
  q.addEventListener("input", function(){ applySearch(box, q.value); });
  root.querySelectorAll("[data-kpick]").forEach(function(b){
    function los(){ var id = b.getAttribute("data-kpick"); zu(); onPick(id); }
    b.addEventListener("click", los);
    b.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); los(); } });
  });
  root.querySelector("[data-reclose]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
}
function kalRunSheet(tag){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet" role="dialog" aria-label="'+esc(t("kalRunTitel"))+'">'+
    '<h3>'+esc(t("kalRunTitel"))+'</h3>'+
    '<label>'+esc(t("runArt"))+'</label><div class="theme-pick wahl-pick seg-2" id="kr-art">'+
      '<button type="button" data-krart="lauf" class="active">'+esc(t("runArtLauf"))+'</button><button type="button" data-krart="rad">'+esc(t("runArtRad"))+'</button></div>'+
    '<label for="kr-n">'+esc(t("name"))+'</label><input type="text" id="kr-n" maxlength="40" value="'+esc(t("kalRunName"))+'">'+
    '<label for="kr-km">'+esc(t("kalRunZiel"))+'</label><input type="number" id="kr-km" inputmode="decimal" min="0" max="300" step="0.5" value="5">'+
    '<div class="tm-hint">'+esc(t("kalRunHint"))+'</div>'+
    '<div class="btn-row"><button class="btn btn-secondary" data-cancel>'+esc(t("cancel"))+'</button><button class="btn btn-primary" data-ok>'+esc(t("kalAdd"))+'</button></div></div></div>';
  function zu(){ root.innerHTML = ""; }
  var rad = false, nameFeld = root.querySelector("#kr-n");
  root.querySelectorAll("[data-krart]").forEach(function(b){
    b.addEventListener("click", function(){
      var neuRad = b.getAttribute("data-krart") === "rad";
      if(neuRad === rad) return;
      if(nameFeld.value === t(rad ? "kalRadName" : "kalRunName")) nameFeld.value = t(neuRad ? "kalRadName" : "kalRunName");   // nur den Vorschlagsnamen mitnehmen
      rad = neuRad;
      root.querySelectorAll("[data-krart]").forEach(function(x){ x.classList.toggle("active", x === b); });
    });
  });
  root.querySelector("[data-cancel]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
  root.querySelector("[data-ok]").addEventListener("click", function(){
    var km = clamp(parseFloat(String(root.querySelector("#kr-km").value).replace(",", ".")) || 0, 0, 300);
    var n = nameFeld.value.trim() || t(rad ? "kalRadName" : "kalRunName");
    zu(); kalHinzu(tag, { art:"run", name:n, km:km, rad:rad }); kalNeu();
  });
}
/* „Hinzufügen“ an einem Tag: genau ein Teil je Eintrag – BLOC (Nach Sätzen), Workout aus dem Katalog, TrainingsBLOC oder Run */
function kalHinzuMenue(tag){
  function fertig(art, ref){ kalHinzu(tag, { art:art, ref:ref }); kalNeu(); }
  openActionSheet(kalTagText(tag), [
    { ico:HOME_ICON.timer, label:t("kalBloc"), fn:function(){
      var items = stPlaene().filter(function(p){ return !p.entwurf; }).map(function(p){ return { id:p.id, name:p.name, sub:planAnzahl(stPlanIds(p).length) }; });
      kalPicker(t("kalBloc"), items, function(id){ fertig("plan", id); });
    } },
    { ico:HOME_ICON.lib, label:t("kalKat"), fn:function(){
      var items = LIB_WORKOUTS.filter(function(lw){ return !libIstWarmDehn(lw) && !libHidden("wo:"+lw.id); }).map(function(lw){
        var exs = lw.exercises.map(findExercise).filter(Boolean);
        return { id:lw.id, name:tplText(lw.name), sub:t("exCount", { n:exs.length })+" · "+fmtDauerKurz(workoutDuration(libWorkoutRun(lw))) };
      });
      kalPicker(t("kalKat"), items, function(id){ fertig("lib", id); });
    } },
    { ico:HOME_ICON.lib, label:t("kalMeineWo"), fn:function(){
      var items = (state.db.myWorkouts || []).map(normMy).filter(function(mw){ return !mw.ws; }).map(function(mw){
        var exs = mw.items.map(function(it){ return findExercise(it.ex); }).filter(Boolean);
        return { id:mw.id, name:mw.name, sub:t("exCount", { n:exs.length })+" · "+fmtDauerKurz(workoutDuration(myRun(mw))) };
      });
      kalPicker(t("kalMeineWo"), items, function(id){ fertig("workout", id); });
    } },
    { ico:HOME_ICON.warm, label:t("kalMob"), fn:function(){
      var items = [];
      (state.db.myWorkouts || []).map(normMy).filter(function(mw){ return mw.ws; }).forEach(function(mw){ items.push({ id:"w:"+mw.id, name:mw.name, sub:t("ownTag") }); });
      LIB_WORKOUTS.filter(function(lw){ return libIstWarmDehn(lw) && !libHidden("wo:"+lw.id); }).forEach(function(lw){ items.push({ id:"l:"+lw.id, name:tplText(lw.name), sub:"" }); });
      kalPicker(t("kalMob"), items, function(id){ fertig(id.charAt(0) === "w" ? "workout" : "lib", id.slice(2)); });
    } },
    { ico:P_PLUS, label:t("kalZufall"), fn:function(){ fertig("zufall", ""); } },
    { ico:'<circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M8.2 19h8.3a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7h8.3"/>', label:t("kalPlan"), fn:function(){
      var items = programmListe().filter(function(pg){ return pg.items.length; }).map(function(pg){ return { id:pg.id, name:pg.name, sub:pg.items.length === 1 ? t("progMeta1") : t("progMeta", { n:pg.items.length }) }; });
      kalPicker(t("kalPlan"), items, function(id){ fertig("programm", id); });
    } },
    { ico:HOME_ICON.run, label:t("kalRun"), fn:function(){ kalRunSheet(tag); } }
  ]);
}

/* ---------- Woche kopieren ---------- */
/* Alle Einträge der Woche (tage = sieben Tagesschlüssel) auf die gleichen Wochentage der nächsten n Wochen. Was dort schon gleich eingetragen ist,
   wird nicht doppelt angelegt (so lässt sich das Kopieren gefahrlos wiederholen); Erledigt-Haken werden nicht mitgenommen. Gibt die Zahl neuer Einträge zurück. */
function kalWocheKopieren(tage, n){
  var liste = kalListe(), vorhanden = liste.slice(), neu = 0;
  for(var w = 1; w <= n; w++){
    tage.forEach(function(key){
      var ziel = kalTagKey(kalPlus(kalTagDatum(key), 7*w));
      kalAn(key).forEach(function(e){
        var gleich = vorhanden.some(function(x){ return x.tag === ziel && x.art === e.art && (x.ref || "") === (e.ref || "") && (x.name || "") === (e.name || "") && (+x.km || 0) === (+e.km || 0) && !!x.rad === !!e.rad; });
        if(gleich) return;
        var k = { id:uid(), tag:ziel, art:e.art, ref:e.ref || "", name:e.name || "", km:+e.km || 0, at:Date.now() + neu };
        if(e.rad) k.rad = true;
        liste.push(k); neu++;
      });
    });
  }
  if(neu) save();
  return neu;
}
/* Alle Einträge der gezeigten Tage löschen: erst nach zwei Sekunden gedrückt halten (ein kurzer Tipp zeigt nur den Hinweis); liefert die Anzahl */
function kalAlleLoeschen(keys){
  var alt = kalListe().length;
  state.db.settings.kalender = { e:kalListe().filter(function(e){ return keys.indexOf(e.tag) < 0; }) };
  save();
  return alt - kalListe().length;
}
function kalHaltenLoeschen(btn, keys){
  var timer = null;
  function stop(){ clearTimeout(timer); btn.style.opacity = ""; }
  btn.addEventListener("pointerdown", function(e){
    if(e.button > 0) return;
    btn.style.opacity = ".55";
    timer = setTimeout(function(){
      stop();
      var n = kalAlleLoeschen(keys);
      showToast(n ? t("kalGeloescht", { n:n }) : t("kalNichtsZuLoeschen"));
      kalNeu();
    }, 2000);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function(ev){ btn.addEventListener(ev, stop); });
  btn.addEventListener("click", function(){ showToast(t("kalHaltenHint")); });
}
function kalKopierenSheet(tage, kopfText, anzahl){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet" role="dialog" aria-label="'+esc(t("kalKopierenTitel"))+'">'+
    '<h3>'+esc(t("kalKopierenTitel"))+'</h3>'+
    '<p>'+esc(t("kalKopierenText", { n:anzahl, w:kopfText }))+'</p>'+
    '<label for="kk-n">'+esc(t("kalKopierenWochen"))+'</label>'+stepperHTML("kk-n", 4, 1, 12, 1)+
    '<div class="tm-hint">'+esc(t("kalKopierenHint"))+'</div>'+
    '<div class="btn-row"><button class="btn btn-secondary" data-cancel>'+esc(t("cancel"))+'</button><button class="btn btn-primary" data-ok>'+esc(t("kalKopierenOk"))+'</button></div></div></div>';
  function zu(){ root.innerHTML = ""; }
  bindSteppers(root, function(){});
  root.querySelector("[data-cancel]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
  root.querySelector("[data-ok]").addEventListener("click", function(){
    var n = clamp(parseInt(root.querySelector("#kk-n").value) || 1, 1, 12);
    zu();
    var neu = kalWocheKopieren(tage, n);
    showToast(neu ? t("kalKopiert", { n:neu }) : t("kalKopiertNichts"));
    if(neu) kalNeu();
  });
}

/* ---------- Startseite: Kopfblock mit dem heutigen Training ---------- */
/* Dauer und Ort eines Eintrags für den Kopfblock: { sek, ort, sub } – sek 0, wenn es keine feste Dauer gibt */
function kalDauerOrt(e){
  function ortName(exs){ return t(katWoOrt(exs) === "studio" ? "katOrtStudio" : "katOrtFrei"); }
  var o = kalAufloesen(e), r = { sek:0, ort:"", sub:o.sub };
  if(e.art === "workout"){
    var mw = findMy(e.ref);
    if(mw){ r.sek = workoutDuration(myRun(mw)); r.ort = mw.ws ? t("warmTitle") : ortName(mw.items.map(function(it){ return findExercise(it.ex); }).filter(Boolean)); }
  } else if(e.art === "lib"){
    var lw = findLibWorkout(e.ref);
    if(lw){ r.sek = workoutDuration(libWorkoutRun(lw)); r.ort = libIstWarmDehn(lw) ? t("warmTitle") : ortName(lw.exercises.map(findExercise).filter(Boolean)); }
  } else if(e.art === "plan"){
    var p = stPlanFind(e.ref);
    if(p){ var ids = stPlanIds(p); r.ort = ortName(ids.map(findExercise).filter(Boolean)); r.sub = planAnzahl(ids.length)+" · "+r.ort; }
  }
  return r;
}
/* Titel (Namen mit „&“) und Zeile darunter („29 Min · Fitnessstudio“) für die heutigen Einträge */
function kalHeroInfo(liste){
  var namen = [], teile = liste.map(function(e){ namen.push(kalAufloesen(e).name); return kalDauerOrt(e); });
  var sek = teile.reduce(function(a, x){ return a + x.sek; }, 0), orte = [], sub;
  teile.forEach(function(x){ if(x.ort && orte.indexOf(x.ort) < 0) orte.push(x.ort); });
  if(sek > 0 && teile.every(function(x){ return x.sek > 0; })) sub = fmtDuration(Math.max(60, Math.round(sek/60)*60))+(orte.length ? " · "+orte.join(" + ") : "");
  else if(teile.length === 1) sub = teile[0].sub;
  else sub = t("heroAnzahl", { n:teile.length });
  return { titel:namen.join(" & "), sub:sub };
}
