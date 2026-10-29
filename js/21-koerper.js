"use strict";
/* ============ Arena: Trainingspläne · Fortschritt (dritter Reiter der unteren Leiste) ============
   Zwei Seiten unter einem Reiter (die Wahl merkt sich settings.koerperTab):
   - Trainingspläne: Einträge, die der Reihe nach abgearbeitet werden. Ein Trainingsplan hat einen Namen, eine Liste von Einträgen (nur aus Vorhandenem: BLOCs,
     Favoriten, Workouts aus dem Katalog; Rubriken Mobility, Workout, Run, Stretch) und einen Wochenplan (Wochentage + 4/6/8/12 Wochen), der als normale
     Kalender-Einträge übernommen wird. Gespeichert wird settings.programme = [{ id, name, items:["my:ID" | "lib:ID" | "plan:ID" | "run" | "zufall"],
     tage:[0-6], wochen, pos, fav, updatedAt }]; pos = nächster Eintrag. Die Karten stehen zugeklappt; Kopieren · Teilen · Löschen per langem Drücken.
   - Fortschritt: die Statistik (renderStats).
   Alles bleibt auf dem Gerät. */
var KP_WOCHEN = [4, 6, 8, 12];
var PG_RUBRIKEN = ["mobility", "workout", "run", "stretch"];
var pgOffen = {};   // aufgeklappte Karten und Wochenpläne (nur für diesen Besuch)

function koerperTab(){
  var k = state.db.settings.koerperTab;
  return k === "fortschritt" ? "fortschritt" : k === "deepdive" ? "deepdive" : "programm";   // früher „plan“ und „uebungen“ führen zu den Trainingsplänen
}
function koerperSegHTML(){
  function b(k, label){ return '<button type="button" data-koerpertab="'+k+'" class="'+(koerperTab() === k ? 'active' : '')+'" aria-pressed="'+(koerperTab() === k)+'">'+esc(label)+'</button>'; }
  return '<div class="rz koerper-rz drei" role="group">'+b("programm", t("arenaProgramm"))+b("deepdive", t("arenaDeepDive"))+b("fortschritt", t("arenaFortschritt"))+'</div>';
}
/* Deep Dive: die Muskelgruppen auf der Körperfigur, pro Woche (alle Übungen der Woche) und pro Workout (jedes Training der Woche mit Übungen).
   Die Figur und die Zeilen (viel · am Rande · Lücken) sind die der Körperkarte (kkKopfHTML); die Daten kommen aus dem Trainingsverlauf (history[].ex). */
var ddWoche = 0;   // 0 = diese Woche, -1 = die vorherige … (nur für diesen Besuch)
var ddModus = null;   // "ist" (nur Trainiertes) | "plan" (dazu die Termine aus dem Kalender); null = automatisch
function ddWochenStart(){
  var d = new Date(); d.setHours(0, 0, 0, 0);
  return d.getTime() - ((d.getDay() + 6) % 7)*86400000 + ddWoche*7*86400000;   // Montag 0:00 der gewählten Woche
}
/* Übungen eines Kalender-Eintrags (Workout, Katalog, BLOC); Run und Zufall haben keine feste Übungsliste */
function ddGeplantIds(e){
  var pre = e.art === "workout" ? "my:" : e.art === "lib" ? "lib:" : e.art === "plan" ? "plan:" : "";
  return pre ? pgUebungen(pre+e.ref) : [];
}
/* Die sieben Tage der Woche: ist = Übungen aus dem Trainingsverlauf, plan = Übungen der Kalender-Termine */
function ddWochenDaten(von){
  var tag = 86400000, tage = [];
  for(var i = 0; i < 7; i++) tage.push({ ist:[], plan:[] });
  function index(ms){ var d = new Date(ms); d.setHours(0, 0, 0, 0); return Math.round((d.getTime() - von)/tag); }
  (state.db.history || []).forEach(function(e){
    if(!e || !e.ex || !e.ex.length) return;
    var i = index(e.at);
    if(i >= 0 && i < 7) tage[i].ist = tage[i].ist.concat(e.ex);
  });
  kalListe().forEach(function(e){
    var i = index(kalTagDatum(e.tag).getTime());
    if(i >= 0 && i < 7) tage[i].plan = tage[i].plan.concat(ddGeplantIds(e));
  });
  return tage;
}
/* Muskelgruppen (die sechs groben), die an einem Tag mit mindestens etwa einer ganzen Übung dabei sind; reine Hilfsmuskeln (0,35) zählen nicht */
function ddGruppenTag(ids){
  var sum = {}, out = {};
  ids.forEach(function(id){
    var ex = findExercise(id);
    if(!ex || ex.main === "stretch") return;
    var v = mgVerteilung(ex);
    Object.keys(v).forEach(function(g){ sum[g] = (sum[g] || 0) + v[g]; });
  });
  Object.keys(sum).forEach(function(g){ if(sum[g] >= .45) out[g] = 1; });
  return out;
}
/* Drücken und Ziehen, Oberkörper und Unterkörper aus den feinen Zonen (Haupt- und Hilfsmuskeln wie in der Körperkarte); schulter_s und Rumpf zählen nirgends */
var DD_PUSH = ["brust_o", "brust", "schulter_v", "trizeps"], DD_PULL = ["lat", "rauten", "trapez_o", "bizeps", "schulter_h"];
var DD_OBEN = DD_PUSH.concat(DD_PULL, ["schulter_s", "unterarm"]), DD_UNTEN = ["quad", "hamstring", "gesaess", "waden", "abduktor", "adduktor"];
function ddBalance(ids){
  var s = {};
  ids.forEach(function(id){
    var ex = findExercise(id);
    if(!ex || ex.main === "stretch") return;
    var f = kkFein(ex);
    Object.keys(f.haupt).forEach(function(z){ s[z] = (s[z] || 0) + f.haupt[z]; });
    Object.keys(f.hilfe).forEach(function(z){ s[z] = (s[z] || 0) + f.hilfe[z]; });
  });
  function summe(zonen){ return zonen.reduce(function(a, z){ return a + (s[z] || 0); }, 0); }
  var push = summe(DD_PUSH), pull = summe(DD_PULL), oben = summe(DD_OBEN), unten = summe(DD_UNTEN);
  return { push:push, pull:pull, oben:oben, unten:unten };
}
function ddBalken(links, rechts, a, b){
  var gesamt = a + b, pa = gesamt ? Math.round(a*100/gesamt) : 0;
  return '<div class="dd-bal"><div class="dd-bal-k"><span>'+esc(links)+'</span><span>'+esc(rechts)+'</span></div>'+
    '<div class="dd-split'+(gesamt ? '' : ' leer')+'"><i style="width:'+(gesamt ? pa : 50)+'%"></i></div>'+
    '<div class="dd-bal-z"><b>'+(gesamt ? pa : "–")+(gesamt ? ' %' : '')+'</b><b>'+(gesamt ? (100 - pa) : "–")+(gesamt ? ' %' : '')+'</b></div></div>';
}
/* Idee für die nächste Einheit: Tag wählen (heute und die nächsten sechs) und das Workout als Termin in den Kalender legen */
function ddKalenderWahl(id){
  var lw = findLibWorkout(id); if(!lw) return;
  var heute = new Date(); heute.setHours(12, 0, 0, 0);
  var acts = [];
  for(var i = 0; i < 7; i++){
    (function(i){
      var key = kalTagKey(kalPlus(heute, i)), vor = i === 0 ? t("ddHeute")+" · " : i === 1 ? t("ddMorgen")+" · " : "";
      acts.push({ ico:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', label:vor+kalTagText(key), fn:function(){ kalHinzu(key, { art:"lib", ref:id }); showToast(t("ddKalOk", { d:kalTagText(key) })); } });
    })(i);
  }
  openActionSheet(tplText(lw.name)+" · "+t("ddKalWann"), acts);
}
function renderDeepDive(){
  var tag = 86400000, von = ddWochenStart(), bis = von + 7*tag, lang = currentLang() === "en" ? "en-GB" : "de-DE";
  function woche(a, b){ return (state.db.history || []).filter(function(e){ return e && e.at >= a && e.at < b && e.ex && e.ex.length; }).sort(function(x, y){ return y.at - x.at; }); }
  function alleIds(l){ var ids = []; l.forEach(function(e){ e.ex.forEach(function(id){ ids.push(id); }); }); return ids; }
  function datum(ms, opt){ return new Date(ms).toLocaleDateString(lang, opt); }
  var eintraege = woche(von, bis), vorher = woche(von - 7*tag, von);
  var tage = ddWochenDaten(von);
  var gibtPlan = tage.some(function(x){ return x.plan.length > 0; }), gibtIst = tage.some(function(x){ return x.ist.length > 0; });
  var modus = !gibtPlan ? "ist" : (ddModus || (gibtIst ? "ist" : "plan"));
  var tageIds = tage.map(function(x){ return x.ist.length ? x.ist : (modus === "plan" ? x.plan : []); });
  var ids = [].concat.apply([], tageIds), hatDaten = ids.length > 0;
  var kopf = ddWoche === 0 ? t("ddDiese") : datum(von, { day:"numeric", month:"short" })+" – "+datum(bis - tag, { day:"numeric", month:"short" });

  // Kennzahlen der Woche (nur Trainiertes): Trainings, Zeit, verschiedene Übungen
  var istIds = alleIds(eintraege), verschieden = {}; istIds.forEach(function(id){ verschieden[id] = 1; });
  var sek = eintraege.reduce(function(a, e){ return a + (e.dur || 0); }, 0);
  var chips = !eintraege.length ? '' : '<div class="chips-stat dd-chips"><span><b>'+eintraege.length+'</b><small>'+esc(t("ddChipTrainings"))+'</small></span>'+
    '<span><b>'+esc(sek >= 60 ? fmtDuration(Math.round(sek/60)*60) : "–")+'</b><small>'+esc(t("ddChipZeit"))+'</small></span>'+
    '<span><b>'+Object.keys(verschieden).length+'</b><small>'+esc(t("ddChipUebungen"))+'</small></span></div>';

  // Umschalter Trainiert · Mit Plan (nur, wenn es Termine im Kalender gibt)
  var umschalter = !gibtPlan ? '' : '<div class="rz dd-modus" role="group"><button type="button" data-ddmodus="ist" class="'+(modus === "ist" ? 'active' : '')+'" aria-pressed="'+(modus === "ist")+'">'+esc(t("ddIst"))+'</button>'+
    '<button type="button" data-ddmodus="plan" class="'+(modus === "plan" ? 'active' : '')+'" aria-pressed="'+(modus === "plan")+'">'+esc(t("ddPlan"))+'</button></div>';

  // Wie oft pro Muskelgruppe: Körperfigur nach Tagen (hell = 1 Tag, kräftig = 2 oder mehr), darunter die Zonen in drei Zeilen
  var zTage = {};
  tageIds.forEach(function(d){
    if(!d.length) return;
    var sm = kkSumme(d);
    Object.keys(sm).forEach(function(z){ if(sm[z] >= .9) zTage[z] = (zTage[z] || 0) + 1; });
  });
  var w = {}, z2 = [], z1 = [], z0 = [];
  kkReihe().forEach(function(z){
    var n = zTage[z] || 0;
    w[z] = n >= 2 ? 1 : n === 1 ? .38 : 0;
    if(n >= 2) z2.push(z); else if(n === 1) z1.push(z); else if(kkWichtig(z)) z0.push(z);
  });
  function zeile(kl, key, zonen){ return zonen.length ? '<div class="kk-zeile '+kl+'"><b>'+esc(t(key))+'</b> '+esc(zonen.map(kkName).join(", "))+'</div>' : ''; }
  var wochentage = [];
  for(var i = 0; i < 7; i++) wochentage.push(new Date(von + i*tag + 12*3600000).toLocaleDateString(lang, { weekday:"narrow" }));
  var gruppenTag = tageIds.map(ddGruppenTag), gruppenN = {};
  MUSKEL_GRP.forEach(function(g){ gruppenN[g.id] = gruppenTag.filter(function(x){ return x[g.id]; }).length; });
  var abgedeckt = MUSKEL_GRP.filter(function(g){ return gruppenN[g.id] >= 2; }).length;   // Gruppen mit mindestens zwei Tagen (WHO: alle großen Gruppen an mindestens 2 Tagen)

  var freqKarte = '<section class="card dd-karte dd-freq"><div class="dd-titel">'+esc(t("ddFreqTitel"))+'</div>'+
    '<div class="kk-kopf">'+koerperPaar(w)+'<div class="kk-kopf-txt">'+
      zeile("viel", "ddFreq2", z2)+zeile("rand", "ddFreq1", z1)+zeile("luecke", "ddFreq0", z0)+'</div></div>'+
    '<div class="dd-who"><span class="dd-who-m'+(abgedeckt === MUSKEL_GRP.length ? ' ok' : '')+'">'+abgedeckt+'/'+MUSKEL_GRP.length+'</span><span>'+esc(t("ddWho", { n:abgedeckt }))+'</span></div></section>';

  // Woche im Überblick: sechs Gruppen × sieben Tage (voller Punkt = trainiert, hohler Punkt = geplant), rechts die Zahl der Tage
  var kalZeilen = MUSKEL_GRP.map(function(g){
    var n = 0, punkte = tage.map(function(x, i){
      if(!gruppenTag[i][g.id]) return '<i class="dd-punkt"></i>';
      n++;
      return '<i class="dd-punkt '+(x.ist.length ? 'an' : 'plan')+'"></i>';
    }).join("");
    return '<div class="dd-kal-zeile"><span class="dd-kal-n">'+esc(t(g.key))+'</span>'+punkte+'<b class="dd-haeufig f'+Math.min(n, 2)+'">'+n+'×</b></div>';
  }).join("");
  var kalKarte = '<section class="card dd-karte"><div class="dd-titel">'+esc(t("ddKalTitel"))+'</div>'+
    '<div class="dd-kal"><div class="dd-kal-zeile dd-kal-kopf"><span></span>'+wochentage.map(function(x){ return '<small>'+esc(x)+'</small>'; }).join("")+'<span></span></div>'+kalZeilen+'</div>'+
    (hatDaten ? '<div class="dd-legende">'+esc(t("ddKalLegende"))+'</div>' : '<p class="dd-leer">'+esc(t("ddLeerKal"))+'</p><button type="button" class="btn btn-secondary dd-plan-btn" data-nav="#kalender">'+esc(t("ddPlanenBtn"))+'</button>')+'</section>';

  // Balance: Drücken ↔ Ziehen, Oberkörper ↔ Unterkörper
  var bal = ddBalance(ids);
  var balKarte = !hatDaten ? '' : '<section class="card dd-karte"><div class="dd-titel" style="display:flex;align-items:center;justify-content:space-between">'+esc(t("ddBalTitel"))+
    '<button type="button" class="info-btn" data-ddbalinfo aria-label="'+esc(t("info"))+'" title="'+esc(t("info"))+'">i</button></div>'+
    ddBalken(t("ddPush"), t("ddPull"), bal.push, bal.pull)+ddBalken(t("ddOben"), t("ddUnten"), bal.oben, bal.unten)+
    '<div class="dd-fussnote">'+esc(t("ddBalHinweis"))+'</div></section>';

  // Anteil der sechs Muskelgruppen, daneben der Unterschied zur Vorwoche (nur Trainiertes; mit Plan: die Auswahl oben)
  var r = mgProzent(ids), rv = mgProzent(alleIds(vorher)), verteilung = '';
  if(!r.leer){
    verteilung = '<section class="card dd-karte"><div class="dd-titel">'+esc(t("ddAnteil"))+'</div><div class="dd-verteilung">'+r.rows.map(function(x, i){
      var d = rv.leer ? 0 : x.pct - rv.rows[i].pct;
      return '<div class="ausw-row'+(x.pct ? '' : ' null')+'"><span class="ausw-n">'+esc(t(x.key))+'</span><span class="ausw-bar"><i style="width:'+x.pct+'%"></i></span><b>'+x.pct+'%</b>'+
        '<small class="dd-delta'+(d > 0 ? ' plus' : d < 0 ? ' minus' : '')+'">'+(Math.abs(d) >= 3 ? (d > 0 ? '+' : '−')+Math.abs(d) : '')+'</small></div>';
    }).join("")+'<div class="dd-fussnote">'+esc(t("ddHinweis"))+'</div></div></section>';
  }
  // Idee für die nächste Einheit: ein Workout aus dem Katalog für die Gruppe mit dem geringsten Anteil (wechselt von Woche zu Woche)
  var vorschlag = '';
  if(!r.leer){
    var luecke = r.rows.slice().sort(function(a, b){ return a.pct - b.pct; })[0], bereich = luecke.g === "rumpf" ? "core" : luecke.g;
    var treffer = LIB_WORKOUTS.filter(function(lw){
      if(libIstWarmDehn(lw) || libHidden("wo:"+lw.id)) return false;
      var exs = lw.exercises.map(findExercise).filter(Boolean);
      return exs.length && katWoBereich(lw, exs) === bereich;
    });
    if(treffer.length){
      var lw = treffer[Math.abs(Math.floor(von/(7*tag))) % treffer.length], exs = lw.exercises.map(findExercise).filter(Boolean);
      vorschlag = '<div class="card dd-vorschlag"><span class="dd-vs-kicker">'+esc(t("ddNaechstes"))+' · '+esc(t("ddZuKurz", { g:t(luecke.key) }))+'</span>'+
        '<button type="button" class="dd-vs-name" data-ddgo="'+esc(lw.id)+'"><b>'+esc(tplText(lw.name))+'</b><small>'+esc(exAnzText(exs.length))+SEP+esc(fmtDauerKurz(workoutDuration(libWorkoutRun(lw))))+'</small></button>'+
        '<div class="dd-vs-akt"><button type="button" class="btn btn-secondary dd-vs-kal" data-ddkal="'+esc(lw.id)+'">'+ICON_PLUS+' '+esc(t("ddKalBtn"))+'</button>'+favBtn("lib:"+lw.id)+
        '<button type="button" class="dd-vs-play" data-ddgo="'+esc(lw.id)+'" aria-label="'+esc(t("ddAnsehen"))+'">'+ICON_PLAY+'</button></div></div>';
    }
  }
  app.innerHTML =
    topbar(t("tabKoerper"), { back:"#home", right:kopfSymboleNeu("stats") }) +
    '<div class="dd-nav"><button type="button" class="iconbtn" data-ddwoche="-1" aria-label="'+esc(t("ddVor"))+'">&#8249;</button><b>'+esc(kopf)+'</b>'+
      '<button type="button" class="iconbtn" data-ddwoche="1" aria-label="'+esc(t("ddNach"))+'"'+(ddWoche >= 0 ? ' disabled' : '')+'>&#8250;</button></div>' +
    chips + umschalter + kkModusHTML() +
    (hatDaten ? freqKarte : '') + kalKarte + balKarte + verteilung + vorschlag +
    (eintraege.length ? '<div class="section-title"><span>'+esc(t("ddWorkout"))+'</span></div>'+eintraege.map(function(e){
      var dauer = e.dur > 0 ? " · "+fmtDuration(Math.max(60, Math.round(e.dur/60)*60)) : "";
      return '<section class="card dd-karte"><div class="dd-titel">'+esc(datum(e.at, { weekday:"long", day:"numeric", month:"short" }))+'</div>'+
        '<div class="dd-sub">'+esc(exAnzText(e.ex.length)+dauer)+'</div>'+kkKopfHTML(e.ex, false, { ohneModus:true })+'</section>';
    }).join("") : '') +
    '<button type="button" class="dd-link" data-zumfortschritt><span>'+esc(t("ddZuFortschritt"))+'</span><span aria-hidden="true">&#8250;</span></button>' +
    '<div style="height:90px"></div>';
  bindCommon();
  app.querySelectorAll("[data-ddbalinfo]").forEach(function(b){ b.addEventListener("click", function(){ ddInfoFenster(t("ddBalTitel"), t("ddBalInfo")); }); });
  app.querySelectorAll("[data-zumfortschritt]").forEach(function(b){ b.addEventListener("click", function(){ state.db.settings.koerperTab = "fortschritt"; save(); tabLeiste("koerper"); renderKoerper(); window.scrollTo(0, 0); }); });
  app.querySelectorAll("[data-ddwoche]").forEach(function(b){
    b.addEventListener("click", function(){ ddWoche = Math.min(0, ddWoche + (+b.getAttribute("data-ddwoche"))); renderKoerper(); window.scrollTo(0, 0); });
  });
  app.querySelectorAll("[data-ddmodus]").forEach(function(b){
    b.addEventListener("click", function(){ ddModus = b.getAttribute("data-ddmodus"); var y = window.scrollY; renderKoerper(); window.scrollTo(0, y); });
  });
  app.querySelectorAll("[data-ddkal]").forEach(function(b){ b.addEventListener("click", function(){ ddKalenderWahl(b.getAttribute("data-ddkal")); }); });
  app.querySelectorAll(".dd-vorschlag [data-fav]").forEach(function(b){ b.addEventListener("click", function(){ toggleFav(b.getAttribute("data-fav")); var y = window.scrollY; renderKoerper(); window.scrollTo(0, y); }); });
  app.querySelectorAll("[data-ddgo]").forEach(function(b){ b.addEventListener("click", function(){ coverDraft = null; go("#cover/lib/"+b.getAttribute("data-ddgo")); }); });
}
/* Kleines Infofenster mit Text (ein Tipp auf den Hintergrund oder „OK“ schließt es) */
function ddInfoFenster(titel, text){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet" role="dialog" aria-label="'+esc(titel)+'"><h3>'+esc(titel)+'</h3>'+
    '<p style="line-height:1.5;white-space:pre-line">'+esc(text)+'</p><div class="btn-row"><button class="btn btn-primary" data-ok>OK</button></div></div></div>';
  function zu(){ root.innerHTML = ""; }
  root.querySelector("[data-ok]").addEventListener("click", zu);
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target === this) zu(); });
}
function renderKoerper(){
  if(koerperTab() === "fortschritt") renderStats(); else if(koerperTab() === "deepdive") renderDeepDive(); else renderProgramme();
  var tb = app.querySelector(".topbar");
  if(tb){ tb.insertAdjacentHTML("afterend", koerperSegHTML()); var bk = tb.querySelector(".back"); if(bk) bk.classList.add("zeigen"); }   // Zurück-Knopf auch in der Arena (wie Training und Kalender)
  app.querySelectorAll("[data-koerpertab]").forEach(function(b){
    b.addEventListener("click", function(){ koerperWechseln(b.getAttribute("data-koerpertab")); });
  });
}

/* ---------- Daten ---------- */
/* Der frühere „Plan“ (Wochentage mit Workouts, settings.planBau) wird beim ersten Öffnen zum ersten Trainingsplan; der alte Eintrag bleibt unberührt liegen */
function programmAusAltPlan(){
  var b = state.db.settings.planBau, out = [];
  if(!b || typeof b !== "object" || !b.wahl || !Array.isArray(b.tage)) return out;
  var items = [], tage = [];
  b.tage.slice().sort(function(x, y){ return x - y; }).forEach(function(d){
    var l = Array.isArray(b.wahl[d]) ? b.wahl[d].filter(Boolean) : (b.wahl[d] ? [b.wahl[d]] : []);
    if(l.length){ tage.push(d); items = items.concat(l); }
  });
  if(items.length) out.push({ id:uid(), name:t("progName", { n:1 }), items:items, tage:tage, wochen:KP_WOCHEN.indexOf(b.wochen) > -1 ? b.wochen : 6, pos:0, updatedAt:Date.now() });
  return out;
}
function programmListe(){
  var s = state.db.settings;
  if(!Array.isArray(s.programme)){ s.programme = programmAusAltPlan(); save(); }
  s.programme.forEach(function(p){   // früherer Stern (p.fav) wandert in die Favoriten
    if(p.fav){ delete p.fav; if(!isFav('prog:'+p.id)) s.favs = (s.favs || []).concat(['prog:'+p.id]); save(); }
  });
  return s.programme;
}
/* Stern eines Trainingsplans: wie bei allen Favoriten in settings.favs (Schlüssel prog:ID), damit er auf Heute erscheint */
function progFav(p){ return isFav('prog:'+p.id); }
function programmFinde(id){ var l = programmListe(); for(var i = 0; i < l.length; i++) if(l[i].id === id) return l[i]; return null; }
function programmNeu(){
  var l = programmListe(), p = { id:uid(), name:t("progName", { n:l.length + 1 }), items:[], tage:[], wochen:null, am:"alle", pos:0, updatedAt:Date.now() };
  l.push(p); save();
  pgOffen[p.id] = true;
  return p;
}
/* Eintrag eines Trainingsplans (ref) als Kalender-Eintrag: „my:“ eigenes Workout, „lib:“ Katalog, „plan:“ BLOC (Nach Sätzen), „run“, „zufall“ */
function progEintrag(ref){
  ref = String(ref || "");
  if(ref.indexOf("my:") === 0) return { art:"workout", ref:ref.slice(3) };
  if(ref.indexOf("lib:") === 0) return { art:"lib", ref:ref.slice(4) };
  if(ref.indexOf("plan:") === 0) return { art:"plan", ref:ref.slice(5) };
  if(ref === "run") return { art:"run" };
  return { art:"zufall" };
}
function progTagName(d){   // 0 = Montag
  return new Date(2024, 0, 1 + d, 12).toLocaleDateString(currentLang() === "en" ? "en-GB" : "de-DE", { weekday:"short" }).replace(/\.$/, "");
}
/* Aktiv = im Kalender stehen noch offene Termine dieses TrainingsBLOCs (ab heute): grün umrandet, oben einsortiert */
function progAktiv(p){
  var heute = kalTagKey(Date.now());
  return kalListe().some(function(e){ return e.prog && e.prog.id === p.id && e.tag >= heute && e.erledigt !== true; });
}
function progSortiert(){
  return programmListe().map(function(p, i){ return { p:p, i:i, a:progAktiv(p) }; })
    .sort(function(x, y){ return (y.a ? 1 : 0) - (x.a ? 1 : 0) || (progFav(y.p) ? 1 : 0) - (progFav(x.p) ? 1 : 0) || x.i - y.i; }).map(function(x){ return x.p; });
}
/* Wochenplan in den Kalender: ab heute, an den gewählten Wochentagen, der Reihe nach durch die Einträge (bei mehr Einträgen als Tagen geht es in der
   nächsten Woche weiter). Frühere, noch nicht erledigte Termine dieses Trainingsplans ab heute werden dabei ersetzt. */
/* Offene Termine dieses TrainingsBLOCs ab heute aus dem Kalender nehmen (erledigte bleiben); liefert die Anzahl */
function programmAusKalender(p){
  var heute = kalTagKey(Date.now()), alt = kalListe().length;
  state.db.settings.kalender = { e:kalListe().filter(function(e){ return !(e.prog && e.prog.id === p.id && e.tag >= heute && e.erledigt !== true); }) };
  save();
  return alt - kalListe().length;
}
/* Jeder gewählte Wochentag bekommt genau einen Kalender-Baustein: den TrainingsBLOC selbst (er enthält die BLOCs des Tages).
   Ohne gewählte Dauer gilt nur die nächste Woche; frühere offene Termine dieses TrainingsBLOCs ab heute werden dabei ersetzt. */
function programmUebernehmen(p){
  if(!p.items.length || !p.tage.length) return 0;
  var start = new Date(); start.setHours(12, 0, 0, 0);
  var wochen = p.wochen || 1;
  programmAusKalender(p);
  var anzahl = 0;
  for(var d = 0; d < wochen*7; d++){
    var tag = kalPlus(start, d);
    if(p.tage.indexOf((tag.getDay() + 6) % 7) < 0) continue;
    var e = kalHinzu(kalTagKey(tag), { art:"programm", ref:p.id });
    e.prog = { id:p.id, i:0 };
    anzahl++;
  }
  save();
  return anzahl;
}
/* „Weiter mit …“ nach einem erledigten Eintrag: der Trainingsplan, in dem er vorkommt (heutiger Termin zuerst, dann Favoriten), und der nächste Eintrag darin */
var progBericht = [];   // Auswertungen der BLOCs, die in diesem Durchgang des Trainingsplans fertig wurden (kommen am Schluss gesammelt, zum Wischen)
var progKontext = null;   // { pid, i }: der Trainingsplan, aus dem das laufende Training gestartet wurde (Karte, „Weiter mit …“, Kalender-Termin, Hauptknopf)
function programmStarten(p, i, behalten){
  if(!p || !p.items[i]) return;
  if(!behalten) progBericht = [];   // neuer Durchgang
  var o = progEintrag(p.items[i]);
  if(!kalAufloesen(o).ok) return;
  p.pos = i; save();
  progKontext = { pid:p.id, i:i };
  progDirektStarten(o);
}
/* Antippen eines Eintrags: die Karte öffnet sich im Kontext der Arena (BLOC mit Sätzen, Wiederholungen, Zeit/Sätze-Wahl und LOS GEHTS; Workouts mit dem Deckblatt);
   Änderungen dort gelten für den BLOC bzw. das Workout selbst. Zurück führt in die Arena. Das kleine '�� startet dagegen gleich. */
function programmOeffnen(p, i){
  if(!p || !p.items[i]) return;
  progBericht = [];
  var o = progEintrag(p.items[i]);
  if(!kalAufloesen(o).ok) return;
  p.pos = i; save();
  progKontext = { pid:p.id, i:i };
  if(o.art === "plan"){
    var pl = stPlanFind(o.ref);
    if(pl){ stPlanHerkunft = "#koerper"; stPlanAktiv = pl.id; stPlanBauen = false; stPlanQuery = ""; stPlanSel = -1; katZuMeine(); go("#katalog"); return; }
  } else if(o.art === "workout"){ coverDraft = null; go("#cover/my/"+o.ref); return; }
  else if(o.art === "lib"){ coverDraft = null; go("#cover/lib/"+o.ref); return; }
  progDirektStarten(o);
}
/* Ein Eintrag eines Trainingsplans startet gleich (ohne Deckblatt, ohne Umweg über Workout › BLOCs): BLOC als Timer oder Satz-Training, Workouts direkt, Run und Zufall wie im Kalender */
function progDirektStarten(o){
  if(!playerState){ var pr = document.getElementById("playerRoot"); if(pr && pr.innerHTML) pr.innerHTML = ""; }   // liegengebliebener Timer-Rest würde sonst die Seite nicht wechseln lassen
  if(o.art === "plan"){
    var pl = stPlanFind(o.ref);
    if(pl && stPlanIds(pl).length){ if(planStartArt(pl) === "timer") planAlsWorkout(pl, true); else go("#satz/"+pl.id+"/0"); return; }
  } else if(o.art === "workout"){ go("#playmy/"+o.ref); return; }
  else if(o.art === "lib"){ go("#playlib/"+o.ref); return; }
  kalStarten(o);
}
/* Gehört ref zum Eintrag? Gleich, oder ref ist ein BLOC (plan:), der aus diesem Workout entstanden ist (Train by sets auf dem Deckblatt) */
function progRefPasst(eintrag, ref){
  if(eintrag === ref) return true;
  if(String(ref).indexOf('plan:') === 0){ var pl = stPlanFind(ref.slice(5)); return !!(pl && pl.fromWo && pl.fromWo === eintrag); }
  return false;
}
/* Läuft gerade ein Eintrag eines Trainingsplans? Dann { p, i } (nur wenn ref zum gemerkten Eintrag passt) */
function programmKontextFuer(ref){
  if(!progKontext || !ref) return null;
  var p = programmFinde(progKontext.pid);
  return p && progRefPasst(p.items[progKontext.i], ref) ? { p:p, i:progKontext.i } : null;
}
/* Kleine Zeile im Training: „Trainingsplan · Name · 2/3“; Antippen zeigt die Einträge zum Wechseln */
function progChipHTML(ref){
  var k = programmKontextFuer(ref);
  if(!k) return "";
  return '<button type="button" class="pl-prog" data-plprog>'+svgIcon('<circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M8.2 19h8.3a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7h8.3"/>')+'<span>'+esc(k.p.name)+' · '+(k.i + 1)+'/'+k.p.items.length+'</span></button>';
}
function progChipBinden(box, ref, vorher){
  var b = box.querySelector("[data-plprog]"), k = programmKontextFuer(ref);
  if(!b || !k) return;
  b.addEventListener("click", function(){
    openActionSheet(k.p.name, k.p.items.map(function(r, j){
      return { ico:j === k.i ? P_CHECK : P_PLAY, label:(j + 1)+". "+kalAufloesen(progEintrag(r)).name, fn:function(){ if(j === k.i) return; if(vorher) vorher(); programmStarten(k.p, j, true); } };
    }));
  });
}
function programmWeiter(ref){
  var heute = kalTagKey(Date.now()), best = null, bi = -1;
  var kx = programmKontextFuer(ref);
  if(kx){ best = kx.p; bi = kx.i; }
  if(!best) kalAn(heute).forEach(function(e){
    if(best || !e.prog) return;
    var p = programmFinde(e.prog.id);
    if(p && p.items[e.prog.i] === ref){ best = p; bi = e.prog.i; }
  });
  if(!best) progSortiert().forEach(function(p){
    if(best) return;
    var i = p.items.indexOf(ref);
    if(i > -1){ best = p; bi = i; }
  });
  if(!best) return null;
  best.pos = (bi + 1) % best.items.length; save();
  if(bi + 1 >= best.items.length) return null;
  var next = best.items[bi + 1], o = kalAufloesen(progEintrag(next));
  var bp = best, bn = bi + 1;
  return o.ok ? { name:o.name, ref:next, start:function(behalten){ programmStarten(bp, bn, behalten !== false); } } : null;
}
/* Quelle eines gerade beendeten Trainings als Eintrag: BLOC („plan:“), eigenes Workout („my:“) oder Katalog („lib:“) */
function programmRefAusQuelle(src){
  if(!src) return "";
  if(src.type === "mine"){ var mw = findMy(src.id); return mw ? (mw.fromPlan ? "plan:"+mw.fromPlan : "my:"+src.id) : ""; }
  if(src.type === "libworkout") return "lib:"+src.id;
  if(src.type === "draft" && coverDraft && /^(lib|my):/.test(coverDraft.key || "")) return coverDraft.key;   // Deckblatt (Overview) → „Mit Timer starten“
  return "";
}
/* Der runde Hauptknopf auf Heute: ein Eintrag aus einem Trainingsplan, dessen Wochentage auf heute fallen (ohne Kalender-Termin) */
function programmHeute(){
  var wt = (new Date().getDay() + 6) % 7, p = null;
  progSortiert().forEach(function(x){ if(!p && x.items.length && x.tage.indexOf(wt) > -1) p = x; });
  if(!p) return null;
  var i = (p.pos || 0) % p.items.length;
  return { p:p, i:i, ref:p.items[i] };
}

/* ---------- Trainingspläne ---------- */
var PG_ICON_PFEIL = '<path d="M7 10l5 5 5-5"/>';
function progZeileHTML(p, ref, i){
  var o = kalAufloesen(progEintrag(ref));
  return '<li class="pg-eintrag'+(o.ok ? '' : ' fehlt')+'" style="--kc:'+o.farbe+'" data-pgz="'+esc(p.id)+':'+i+'" role="button" tabindex="0">'+
    '<i class="pg-nr">'+(i + 1)+'</i><span class="pg-text"><b>'+esc(o.name)+'</b><small>'+esc(o.ok ? o.sub : t("kalFehlt"))+'</small></span>'+
    '<span class="pg-los" aria-hidden="true">'+svgIcon(P_PLAY)+'</span></li>';
}
function progKarteHTML(p){
  var offen = !!pgOffen[p.id], tage = p.tage.slice().sort(function(a, b){ return a - b; });
  var farben = p.items.slice(0, 4).map(function(r){ return '<i style="background:'+kalAufloesen(progEintrag(r)).farbe+'"></i>'; }).join("");
  var aktiv = progAktiv(p);
  return '<details class="pg-karte'+(aktiv ? ' pg-aktiv' : '')+'"'+(aktiv ? ' style="border-color:#2fb36b;box-shadow:0 0 0 1px #2fb36b"' : '')+' data-pg="'+esc(p.id)+'"'+(offen ? ' open' : '')+'><summary>'+
      '<span class="pg-farben" aria-hidden="true">'+(farben || '<i></i>')+'</span>'+
      '<span class="pg-kt"><b>'+esc(p.name)+'</b><small>'+esc((p.items.length === 1 ? t("progMeta1") : t("progMeta", { n:p.items.length }))+(tage.length ? " · "+tage.map(progTagName).join(" ") : ""))+'</small></span>'+
      '<button type="button" class="fav-btn'+(progFav(p) ? ' on' : '')+'" data-pgfav="'+esc(p.id)+'" aria-pressed="'+progFav(p)+'" title="'+esc(t("favorite"))+'" aria-label="'+esc(t("favorite"))+'">'+(progFav(p) ? '★' : '☆')+'</button>'+
      '<span class="pg-pfeil" aria-hidden="true">'+svgIcon(PG_ICON_PFEIL)+'</span></summary>'+
    '<div class="pg-innen">'+
      (p.items.length ? '<button type="button" class="btn btn-primary pg-go" data-pggo="'+esc(p.id)+'">'+ICON_PLAY+' '+esc(t("letsGoBig"))+'</button>' : '')+
      (p.items.length ? '<ol class="pg-liste">'+p.items.map(function(r, i){ return progZeileHTML(p, r, i); }).join("")+'</ol>' : '')+
      '<button type="button" class="pg-plus" data-pgplus="'+esc(p.id)+'">'+ICON_PLUS+'<span>'+esc(t("progPlus"))+'</span></button>'+
      '<details class="pg-woche" data-pgwoche="'+esc(p.id)+'"'+(pgOffen["w"+p.id] ? ' open' : '')+'><summary><span>'+esc(t("progWochenplan"))+'</span><small>'+
        esc(t("progWochenN", { n:p.wochen }))+'</small><span class="pg-pfeil" aria-hidden="true">'+svgIcon(PG_ICON_PFEIL)+'</span></summary>'+
        '<div class="kp-chips" role="group" aria-label="'+esc(t("progTage"))+'">'+[0, 1, 2, 3, 4, 5, 6].map(function(d){
          var an = p.tage.indexOf(d) > -1;
          return '<button type="button" class="kp-chip'+(an ? ' an' : '')+'" data-pgtag="'+esc(p.id)+':'+d+'" aria-pressed="'+an+'">'+esc(progTagName(d))+'</button>'; }).join("")+'</div>'+
        '<div class="kp-chips" role="group" aria-label="'+esc(t("planWochen"))+'">'+KP_WOCHEN.map(function(w){
          return '<button type="button" class="kp-chip'+(p.wochen === w ? ' an' : '')+'" data-pgwochen="'+esc(p.id)+':'+w+'" aria-pressed="'+(p.wochen === w)+'">'+esc(t("progWochenN", { n:w }))+'</button>'; }).join("")+'</div>'+
        '<button type="button" class="btn btn-primary kp-ok" data-pgok="'+esc(p.id)+'"'+(p.items.length && p.tage.length ? '' : ' disabled')+'>'+esc(t("progUebernehmen"))+'</button>'+
        '<button type="button" class="btn btn-secondary kp-ok" data-pgaus="'+esc(p.id)+'"'+(kalListe().some(function(e){ return e.prog && e.prog.id === p.id; }) ? '' : ' disabled')+'>'+esc(t("progAusKalender"))+'</button></details>'+
    '</div></details>';
}
function renderProgramme(){
  var liste = progSortiert();
  app.innerHTML =
    topbar(t("tabKoerper"), { back:"#home", right:kopfSymboleNeu("stats") }) +
    (liste.length ? '<div class="pg-liste-karten">'+liste.map(progKarteHTML).join("")+'</div>' : '<div class="pg-leerseite">'+svgIcon('<circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M8.2 19h8.3a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7h8.3"/>')+'<p>'+esc(t("progLeer"))+'</p></div>')+
    '<button type="button" class="btn btn-primary pg-neu" data-pgneu>'+ICON_PLUS+' '+esc(t("progNeu"))+'</button>'+
    '<div style="height:90px"></div>';
  bindCommon();
  function neu(){ var y = window.scrollY; renderKoerper(); window.scrollTo(0, y); }
  function teile(v){ var a = v.split(":"); return { p:programmFinde(a[0]), n:+a[1] }; }
  app.querySelectorAll("[data-pgneu]").forEach(function(b){ b.addEventListener("click", function(){ programmNeu(); renderKoerper(); window.scrollTo(0, 0); }); });
  app.querySelectorAll("[data-pgfav]").forEach(function(b){ b.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); var p = programmFinde(b.getAttribute("data-pgfav")); if(!p) return; toggleFav("prog:"+p.id); neu(); }); });
  app.querySelectorAll("[data-pgplus]").forEach(function(b){ b.addEventListener("click", function(){ var p = programmFinde(b.getAttribute("data-pgplus")); if(p) openProgrammWahl(p, neu); }); });
  app.querySelectorAll("[data-pggo]").forEach(function(b){ b.addEventListener("click", function(){ var p = programmFinde(b.getAttribute("data-pggo")); if(p) programmOeffnen(p, (p.pos || 0) % p.items.length); }); });
  // Karten und Wochenpläne: Antippen klappt auf/zu (selbst umgeschaltet, damit der Zustand beim Neuzeichnen bleibt)
  app.querySelectorAll("details.pg-karte > summary").forEach(function(sm){
    sm.addEventListener("click", function(e){ e.preventDefault(); var d = sm.parentNode; d.open = !d.open; pgOffen[d.getAttribute("data-pg")] = d.open; });
  });
  app.querySelectorAll("details.pg-woche > summary").forEach(function(sm){
    sm.addEventListener("click", function(e){ e.preventDefault(); var d = sm.parentNode; d.open = !d.open; pgOffen["w"+d.getAttribute("data-pgwoche")] = d.open; });
  });
  // Eintrag: Antippen startet ihn, langes Drücken: nach oben · nach unten · entfernen
  app.querySelectorAll("[data-pgz]").forEach(function(el){
    var x = teile(el.getAttribute("data-pgz")); if(!x.p) return;
    el.addEventListener("click", function(){
      if(Date.now() < langDruckSperre) return;
      programmOeffnen(x.p, x.n);
    });
    langDruck(el, function(){
      var acts = [];
      if(x.n > 0) acts.push({ ico:'<path d="M12 19V5M6 11l6-6 6 6"/>', label:t("moveUp"), fn:function(){ var a = x.p.items.splice(x.n, 1)[0]; x.p.items.splice(x.n - 1, 0, a); save(); neu(); } });
      if(x.n < x.p.items.length - 1) acts.push({ ico:'<path d="M12 5v14M6 13l6 6 6-6"/>', label:t("moveDown"), fn:function(){ var a = x.p.items.splice(x.n, 1)[0]; x.p.items.splice(x.n + 1, 0, a); save(); neu(); } });
      acts.push({ ico:P_TRASH, label:t("del"), danger:true, fn:function(){ x.p.items.splice(x.n, 1); x.p.pos = 0; x.p.updatedAt = Date.now(); save(); neu(); } });
      openActionSheet(kalAufloesen(progEintrag(x.p.items[x.n])).name, acts);
    });
  });
  app.querySelectorAll("[data-pgtag]").forEach(function(b){ b.addEventListener("click", function(){
    var x = teile(b.getAttribute("data-pgtag")); if(!x.p) return;
    var i = x.p.tage.indexOf(x.n); if(i > -1) x.p.tage.splice(i, 1); else x.p.tage.push(x.n);
    x.p.updatedAt = Date.now(); save(); pgOffen[x.p.id] = true; pgOffen["w"+x.p.id] = true; neu();
  }); });
  app.querySelectorAll("[data-pgwochen]").forEach(function(b){ b.addEventListener("click", function(){ var x = teile(b.getAttribute("data-pgwochen")); if(!x.p) return; x.p.wochen = x.n; x.p.updatedAt = Date.now(); save(); pgOffen[x.p.id] = true; pgOffen["w"+x.p.id] = true; neu(); }); });
  /* „Aus Kalender nehmen“: nur offene Termine dieses TrainingsBLOCs; das Feld bestätigt die Aktion */
  app.querySelectorAll("[data-pgaus]").forEach(function(b){ b.addEventListener("click", function(){
    var p = programmFinde(b.getAttribute("data-pgaus")); if(!p) return;
    openActionSheet(p.name, [{ ico:P_TRASH, label:t("progAusKalender"), danger:true, fn:function(){
      var n = programmAusKalender(p);
      showToast(n ? t("progAusKalenderOk", { n:n }) : t("progAusKalenderLeer"));
      neu();
    } }]);
  }); });
  /* „In den Kalender übernehmen“ öffnet nur ein Feld mit „In Kalender übertragen“; danach bleibt man im Trainingsplan */
  app.querySelectorAll("[data-pgok]").forEach(function(b){ b.addEventListener("click", function(){
    var p = programmFinde(b.getAttribute("data-pgok")); if(!p) return;
    if(!p.tage.length){ showToast(t("progKeinTag")); return; }
    openActionSheet(p.name, [{ ico:P_CHECK, label:t("progInKalender"), fn:function(){
      var n = programmUebernehmen(p);
      if(n) showToast(t("progUebernommen", { n:n }));
      neu();
    } }]);
  }); });
  // langes Drücken auf eine Karte: Kopieren · Teilen · Löschen (sichtbar bleibt nur der Stern)
  app.querySelectorAll("summary").forEach(function(sm){
    var el = sm.parentNode;
    if(!el.getAttribute || !el.classList.contains("pg-karte")) return;
    var p = programmFinde(el.getAttribute("data-pg"));
    if(p) langDruck(sm, function(){ programmMenue(p, neu); });
  });
}
/* Umbenennen per langem Drücken (Trainingsplan, BLOC, eigenes Workout): kleines Fenster mit Namensfeld */
function umbenennenSheet(alt, fn){
  var root = document.getElementById("overlayRoot");
  root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet" role="dialog" aria-label="' + esc(t("umbenennen")) + '"><h3>' + esc(t("umbenennen")) + '</h3>' +
    '<input type="text" id="umb-name" maxlength="60" value="' + esc(alt) + '"><div class="btn-row"><button class="btn btn-secondary" data-cancel>' + esc(t("cancel")) + '</button>' +
    '<button class="btn btn-primary" data-ok>' + esc(t("save")) + '</button></div></div></div>';
  function zu(){ root.innerHTML = ""; }
  var inp = root.querySelector("#umb-name"); inp.focus(); inp.select();
  function ok(){ var v = inp.value.trim(); zu(); if(v && v !== alt) fn(v); }
  root.querySelector("[data-cancel]").addEventListener("click", zu);
  root.querySelector("[data-ok]").addEventListener("click", ok);
  inp.addEventListener("keydown", function(e){ if(e.key === "Enter"){ e.preventDefault(); ok(); } });
  root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
}function programmText(p){
  return p.name+"\n"+p.items.map(function(r, i){ var o = kalAufloesen(progEintrag(r)); return (i + 1)+". "+o.name; }).join("\n");
}
function programmMenue(p, neu){
  openActionSheet(p.name, [
    { ico:ICON_EDIT, label:t("umbenennen"), fn:function(){ umbenennenSheet(p.name, function(v){ p.name = v; p.updatedAt = Date.now(); save(); neu(); }); } },
    { ico:P_SHARE, label:t("share"), fn:function(){
      var text = programmText(p);
      if(navigator.share) navigator.share({ title:p.name, text:text }).catch(function(err){ if(!err || err.name !== "AbortError") copyText(text, t("shareLinkCopied")); });
      else copyText(text, t("shareLinkCopied"));
    } },
    { ico:ICON_COPY, label:t("actCopy"), fn:function(){
      var q = JSON.parse(JSON.stringify(p)); q.id = uid(); q.name = t("planKopieName", { n:p.name }); q.updatedAt = Date.now();
      programmListe().push(q); save(); showToast(t("planKopiert", { n:q.name })); neu();
    } },
    { ico:P_TRASH, label:t("del"), danger:true, fn:function(){
      confirmSheet(t("progDelQ"), "„"+p.name+"“ – "+t("cantUndo"), t("del"), function(){
        state.db.settings.programme = programmListe().filter(function(x){ return x.id !== p.id; });
        state.db.settings.favs = (state.db.settings.favs || []).filter(function(k){ return k !== 'prog:'+p.id; }); save(); neu();
        showToast(t("deletedToast", { n:p.name }));
      });
    } }
  ]);
}
var P_SHARE = '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/>';

/* ---------- „Hinzufügen“: nur aus Vorhandenem wählen - oben die Rubrik (Mobility · Workout · Run · Stretch), darunter Favoriten · BLOCs · Katalog ---------- */
function pgWsArt(ref){   // „warm“ | „dehn“ | „“ (Workout) eines Eintrags
  if(ref.indexOf("my:") === 0){ var mw = findMy(ref.slice(3)); return mw && mw.ws ? mw.ws : ""; }
  if(ref.indexOf("lib:") === 0){ var lw = findLibWorkout(ref.slice(4)); return lw && libIstWarmDehn(lw) ? (AUFWAERM_IDS.indexOf(lw.id) > -1 ? "warm" : "dehn") : ""; }
  return "";
}
function pgListen(rub){
  var ws = rub === "mobility" ? "warm" : rub === "stretch" ? "dehn" : "";
  function passt(ref){ return pgWsArt(ref) === ws; }
  var favs = (state.db.settings.favs || []).filter(function(k){ return /^(my|lib|plan):/.test(k) && kalAufloesen(progEintrag(k)).ok && passt(k); });
  var blocs = [];
  if(rub === "workout") stPlaene().forEach(function(p){ if(!p.entwurf && stPlanIds(p).length) blocs.push("plan:"+p.id); });
  (state.db.myWorkouts || []).map(normMy).forEach(function(mw){ if(mw.items.length && passt("my:"+mw.id)) blocs.push("my:"+mw.id); });
  var katalog = [];   // [{ name, ico, refs }]
  if(rub === "workout"){
    var je = {};
    LIB_WORKOUTS.forEach(function(lw){
      if(libIstWarmDehn(lw) || libHidden("wo:"+lw.id)) return;
      var b = katWoBereich(lw, lw.exercises.map(findExercise).filter(Boolean));
      (je[b] = je[b] || []).push("lib:"+lw.id);
    });
    KAT_WO_BEREICHE.forEach(function(b){
      if(je[b]) katalog.push({ name:b === "ganz" ? t("katGanz") : t(KAT_GRUPPEN.filter(function(g){ return g.id === b; })[0].key), ico:b === "ganz" ? HOME_ICON.katalog : katIcon(b), refs:je[b] });
    });
  } else if(ws){
    var wos = ws === "warm" ? AUFWAERM_IDS.map(findLibWorkout).filter(Boolean) : LIB_WORKOUTS.filter(function(lw){ return lw.focus === "stretch" && AUFWAERM_IDS.indexOf(lw.id) < 0; });
    var refs = wos.filter(function(lw){ return !libHidden("wo:"+lw.id); }).map(function(lw){ return "lib:"+lw.id; });
    if(refs.length) katalog.push({ name:t("katTabKatalog"), ico:HOME_ICON.warm, refs:refs });
  }
  return { favs:favs, blocs:blocs, katalog:katalog };
}
/* Übungen hinter einem Eintrag: höchstens sechs als kleine bewegte Figuren, der Rest als „+n“ */
function pgUebungen(ref){
  if(ref.indexOf("plan:") === 0){ var p = stPlanFind(ref.slice(5)); return p ? stPlanIds(p) : []; }
  if(ref.indexOf("my:") === 0){ var mw = findMy(ref.slice(3)); return mw ? normMy(mw).items.map(function(it){ return it.ex; }) : []; }
  if(ref.indexOf("lib:") === 0){ var lw = findLibWorkout(ref.slice(4)); return lw ? lw.exercises : []; }
  return [];
}
function pgFiguren(ref){
  var ids = pgUebungen(ref).filter(function(id){ return ILLU[id]; }), h = ids.slice(0, 6).map(function(id){ return illuHTML(id, "pg-fig"); }).join("");
  return h + (ids.length > 6 ? '<i class="pg-mehr">+'+(ids.length - 6)+'</i>' : '');
}
/* Kleine Übungsfiguren (.pg-figs) füllen, sobald sie zu sehen sind: nicht in zugeklappten Bereichen (Katalog, Auswahl bei Path); beim Aufklappen kommt der Rest dazu */
function pgFigurenFuellen(box){
  box.querySelectorAll(".pg-figs:not([data-fertig])").forEach(function(el){
    if(el.closest("details:not([open])")) return;
    el.setAttribute("data-fertig", "1"); el.innerHTML = pgFiguren(el.getAttribute("data-pgf"));
  });
}
document.addEventListener("toggle", function(e){ var d = e.target; if(d && d.tagName === "DETAILS" && d.open) pgFigurenFuellen(d); }, true);
function openProgrammWahl(p, neu){
  var root = document.getElementById("overlayRoot"), rub = "workout";
  function zu(){ root.innerHTML = ""; }
  var offenSek = {};   // Favoriten · BLOCs · Katalog stehen zunächst zugeklappt
  function ortFarbe(ref){   // Fitnessstudio rot, Freiluft blau (wie im Katalog), Mobility & Stretch grün
    if(rub === "mobility" || rub === "stretch") return "var(--ws-color)";
    var ids = pgUebungen(ref);
    if(!ids.length) return "";
    var s = ids.map(findExercise).filter(Boolean).filter(exIstStudio).length;
    return s*2 >= ids.length ? "var(--gym-color)" : "var(--tp-color)";
  }
  function opt(ref){
    var o = kalAufloesen(progEintrag(ref)), oc = ortFarbe(ref);
    return '<button type="button" class="bloc-opt" data-pgpick="'+esc(ref)+'"'+(oc ? ' style="--oc:'+oc+'"' : '')+'><span><b>'+esc(o.name)+'</b><small>'+esc(o.sub)+'</small><span class="pg-figs" data-pgf="'+esc(ref)+'"></span></span></button>';
  }
  function abschnitt(key, titel, n, inhalt){
    return n ? '<details class="pg-sek" data-pgsek="'+key+'"'+(offenSek[key] ? ' open' : '')+'><summary><b>'+esc(titel)+'</b><span class="lbl-hint">'+n+'</span><span class="pg-pfeil" aria-hidden="true">'+svgIcon(PG_ICON_PFEIL)+'</span></summary>'+inhalt+'</details>' : '';
  }
  function draw(){
    var sc = root.querySelector(".bloc-sheet"), y = sc ? sc.scrollTop : 0, l = pgListen(rub), html = "";
    if(rub === "run") html = opt("run");
    else {
      html += abschnitt("fav", t("pgFav"), l.favs.length, l.favs.map(opt).join(""));
      html += abschnitt("bloc", t("pgBlocs"), l.blocs.length, l.blocs.map(opt).join(""));
      html += abschnitt("kat", t("bauKatalog"), l.katalog.length, l.katalog.map(function(g){
        var gym = g.refs.length > 0 && g.refs.every(function(r){ return ortFarbe(r) === "var(--gym-color)"; });   // nur Fitnessstudio: farbiges Symbol wie im Katalog
        return katZeileHTML("pgk-"+rub+"-"+g.name, g.ico, g.name, g.refs.length, '<div class="kat-inhalt">'+g.refs.map(opt).join("")+'</div>', false, "", gym); }).join(""));
      if(rub === "workout") html += opt("zufall");
      if(!l.favs.length && !l.blocs.length && !l.katalog.length) html = '<div class="pg-leer">'+esc(t("pgNichts"))+'</div>';
    }
    root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet bloc-sheet" role="dialog" aria-label="'+esc(t("progPlus"))+'"><h3>'+esc(t("progPlus"))+'</h3>'+
      '<div class="pg-rub" role="group">'+PG_RUBRIKEN.map(function(r){ return '<button type="button" data-pgrub="'+r+'" class="'+(rub === r ? 'active' : '')+'" aria-pressed="'+(rub === r)+'">'+esc(t("pgRub_"+r))+'</button>'; }).join("")+'</div>'+
      html+'<div class="btn-row"><button class="btn btn-secondary" data-cancel>'+esc(t("cancel"))+'</button></div></div></div>';
    var neuSc = root.querySelector(".bloc-sheet"); if(neuSc) neuSc.scrollTop = y;
    root.querySelector("[data-cancel]").addEventListener("click", zu);
    root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
    // kleine bewegte Figuren der Übungen: erst füllen, wenn die Zeile zu sehen ist (zugeklappte Bereiche beim Aufklappen)
    function fuellen(box){ box.querySelectorAll(".pg-figs:not([data-fertig])").forEach(function(el){ if(el.closest("details:not([open])")) return; el.setAttribute("data-fertig", "1"); el.innerHTML = pgFiguren(el.getAttribute("data-pgf")); }); }
    fuellen(root);
    root.querySelectorAll("details").forEach(function(dt){ dt.addEventListener("toggle", function(){ if(dt.hasAttribute("data-pgsek")) offenSek[dt.getAttribute("data-pgsek")] = dt.open; if(dt.open) fuellen(dt); }); });
    root.querySelectorAll("[data-pgrub]").forEach(function(b){ b.addEventListener("click", function(){ rub = b.getAttribute("data-pgrub"); draw(); }); });
    root.querySelectorAll("[data-pgpick]").forEach(function(b){ b.addEventListener("click", function(){
      p.items.push(b.getAttribute("data-pgpick")); p.updatedAt = Date.now(); pgOffen[p.id] = true; save(); zu(); neu();
    }); });
  }
  draw();
}

/* ---------- Langes Drücken auf BLOCs und eigene Workouts: Kopieren · Teilen · Löschen (sichtbar bleibt nur der Stern) ---------- */
function myKopie(mw){
  var q = JSON.parse(JSON.stringify(mw));
  q.id = uid(); q.name = t("planKopieName", { n:mw.name }); q.updatedAt = Date.now(); delete q.fromPlan;
  state.db.myWorkouts.push(q); save();
  return q;
}
function blocMenueBinden(neu){
  function menue(titel, kopie, teilen, el, umb){
    openActionSheet(titel, [
      { ico:ICON_EDIT, label:t("umbenennen"), fn:function(){ umbenennenSheet(titel, function(v){ umb(v); save(); neu(); }); } },
      { ico:ICON_COPY, label:t("actCopy"), fn:function(){ var q = kopie(); showToast(t("planKopiert", { n:q.name })); neu(); } },
      { ico:P_SHARE, label:t("share"), fn:teilen },
      { ico:P_TRASH, label:t("del"), danger:true, fn:function(){ var d = el.querySelector("[data-del]"); if(d) d.click(); } }
    ]);
  }
  app.querySelectorAll(".plan-item[data-plan]").forEach(function(el){
    var p = stPlanFind(el.getAttribute("data-plan"));
    if(p) langDruck(el, function(){ menue(p.name, function(){ return planKopie(p); }, function(){ shareDraft(draftFromMy(planMw(p))); }, el, function(v){ p.name = v; p.updatedAt = Date.now(); }); });
  });
  app.querySelectorAll(".my-item[data-cover]").forEach(function(el){
    var mw = findMy(el.getAttribute("data-cover").replace(/^my\//, ""));
    if(mw) langDruck(el, function(){ menue(mw.name, function(){ return myKopie(mw); }, function(){ shareDraft(draftFromMy(normMy(mw))); }, el, function(v){ mw.name = v; mw.updatedAt = Date.now(); }); });
  });
}

/* Wischen auf der obersten Ebene (Handy): nach links die Hauptseite rechts davon, nach rechts die links davon.
   Gilt für die untere Leiste Heute · Tools · Path · Kalender. Die Seite folgt dem Finger; beim Loslassen gleitet sie in die neue
   Richtung weiter, oder sie springt zurück, wenn der Wisch zu kurz war oder es keine Seite mehr gibt. Scrollen und Eingaben lösen nichts aus.
   Mit „Bewegung verringern“ im System gibt es nur den Sprung. */
var WISCH_HAUPT = ["#home", "#training", "#koerper", "#kalender"];   // Reihenfolge der unteren Leiste
var WISCH_AN = false;   // aus: im Browser ruckelt das Folgen des Fingers noch; mit der Capacitor-App wieder auf true setzen
(function(){
  var x0 = 0, y0 = 0, t0 = 0, gilt = false, waagerecht = false, bewegt = false;
  function reduziert(){ return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function ziel(dx){
    var i = WISCH_HAUPT.indexOf(location.hash);
    if(dx < 0 && i < WISCH_HAUPT.length - 1) return WISCH_HAUPT[i + 1];
    if(dx > 0 && i > 0) return WISCH_HAUPT[i - 1];
    return null;
  }
  /* Inhalt verschieben (x in Pixel); mit anim gleitet er, ohne anim folgt er dem Finger */
  function setzen(x, anim){
    if(!anim){ app.style.transition = "none"; }
    app.style.transform = x ? "translateX(" + x + "px)" : "";
    app.style.opacity = x ? String(Math.max(0.6, 1 - Math.abs(x) / (window.innerWidth * 1.2))) : "";
    if(anim){ app.style.transition = "transform .22s ease-out, opacity .22s ease-out"; }
    else { void app.offsetWidth; }   // Umbruch erzwingen, damit die nächste Animation von dieser Stelle startet
  }
  function fertig(){ setTimeout(function(){ if(!bewegt){ app.style.transition = ""; } }, 240); }
  document.addEventListener("touchstart", function(e){
    gilt = false; waagerecht = false;
    if(!WISCH_AN || e.touches.length !== 1 || WISCH_HAUPT.indexOf(location.hash) < 0) return;
    if(e.target.closest && e.target.closest("input, textarea, select, .confirm-overlay, #overlayRoot, .kal-leiste, .sheet, .re-pick-liste")) return;
    var root = document.getElementById("overlayRoot"); if(root && root.innerHTML) return;
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now(); gilt = true;
  }, { passive:true });
  document.addEventListener("touchmove", function(e){
    if(!gilt || e.touches.length !== 1) return;
    var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
    if(!waagerecht){
      if(Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)){ gilt = false; if(bewegt){ bewegt = false; setzen(0, true); fertig(); } return; }   // senkrecht: Seite scrollt
      if(Math.abs(dx) < 8) return;
      waagerecht = true;
    }
    if(reduziert()) return;
    var weit = window.innerWidth;
    bewegt = true;
    setzen(Math.max(-weit, Math.min(weit, ziel(dx) ? dx : dx * 0.2)), false);   // ohne Ziel nur ein kleines Nachgeben
  }, { passive:true });
  document.addEventListener("touchend", function(e){
    if(!gilt){ if(bewegt){ bewegt = false; setzen(0, true); fertig(); } return; }
    gilt = false;
    var t1 = e.changedTouches[0], dx = t1.clientX - x0, dy = t1.clientY - y0;
    var weg = waagerecht && Math.abs(dx) >= 50 && Date.now() - t0 <= 800 && Math.abs(dy) <= Math.abs(dx) * 0.8;
    var z = weg ? ziel(dx) : null;
    if(!bewegt){ if(z) go(z); return; }   // ohne Bewegung (kein Folgen): der Wisch zählt direkt
    bewegt = false;
    if(!z || reduziert()){ setzen(0, true); fertig(); if(z) go(z); return; }
    var weit = window.innerWidth, aus = dx < 0 ? -weit * 0.3 : weit * 0.3;
    setzen(aus, true);   // gleitet hinaus
    setTimeout(function(){
      go(z);
      setzen(-aus, false);   // neue Seite von der anderen Seite
      setzen(0, true);       // gleitet herein
      fertig();
    }, 220);
  }, { passive:true });
})();
/* Path: Reiter wechseln (Knopf oder Wischen) */
function koerperWechseln(k){ state.db.settings.koerperTab = k; save(); tabLeiste("koerper"); renderKoerper(); window.scrollTo(0, 0); }
