"use strict";
/* ============ Katalog ============
   Air und Studio unter einem Dach (2026-10-10), seit 2026-10-12 mit den Reitern Katalog · Baukasten:
   - Katalog: zwei Abteilungen „Meine“ (eigene Workouts mit Timer und Pläne mit Gewicht × Wiederholungen) und „Workoutkatalog“
     (fertige Workouts nach Fokus, mit Ort-Schalter und Filter); dazu eine Karte „Übungskatalog“ (eigene Seite #uebungskatalog:
     alle Übungen nach Bereichen, Filter, eigene Übung anlegen).
   - Baukasten: „Überrasch mich“ öffnet das Zusammenstell-Fenster (openSurprise) mit den zwei Wegen Zufall · Nach Gewichtung; „Selber bauen“ führt
     ohne Zwischenfenster gleich in die Übungsauswahl (Ort und Art stehen im Baukasten schon).
   Die Seiten selbst liegen in renderKatalogWorkouts, renderLibrary (Meine), renderKatalogUebungen und renderKatalogBaukasten; die Plan-Seite
   (renderStudioPlan) öffnet sich aus „Meine“. Hier stehen Kopf, Reiter, aufklappbare Bereiche und die Zuordnung. */
var KAT_TABS = ["baukasten", "blocs", "katalog"];
var katOffen = {};   // Bereiche: true = aufgeklappt, false = zugeklappt, fehlt = Standard (offen bei Filter oder Suche, sonst zu); nur für diesen Besuch

/* Letzter Reiter; Nutzer der früheren Seiten Air und Studio landen dort, wo sie zuletzt waren */
function katTab(){
  var s = state.db.settings;
  // frühere Reiter: „Meine“ heißt jetzt BLOCs, der Katalog ist eine Seite hinter dem Baukasten, „Übungen“ heißt Baukasten
  if(s.katTab === "meine" || (s.katTab === "workouts" && s.katAbt === "meine")) s.katTab = "blocs";
  else if(s.katTab === "workouts") s.katTab = s.katAbt === "uebungen" ? "baukasten" : "katalog";
  else if(s.katTab === "uebungen") s.katTab = "baukasten";
  if(KAT_TABS.indexOf(s.katTab) > -1) return s.katTab;
  if(s.libTab === "mine") return "blocs";
  return "baukasten";
}
/* Abteilung im Katalog: „workouts“ (Workoutkatalog) oder „meine“ (eigene Workouts und Pläne) */
function katAbt(){ return state.db.settings.katAbt === "uebungen" ? "uebungen" : "workouts"; }   // „workouts“ (Workoutkatalog) | „uebungen“ (Übungskatalog, nur über #uebungskatalog)
function katZuMeine(){ state.db.settings.katTab = "blocs"; }   // BLOCs: die gespeicherten BLOCs und Workouts
function katTabSetzen(tab){
  var s = state.db.settings;
  s.katTab = tab; stPlanAktiv = null; stPlanBauen = false; stPlanQuery = "";
  save();
}

/* ---------- Zuordnung der Übungen zu Bereichen ----------
   Studio-Übungen behalten ihre Gruppe aus STUDIO_GRUPPEN. Alle anderen (Air) kommen dorthin, wo ihr erster Hauptmuskel liegt;
   Ausdauerübungen bilden den Bereich Cardio. So steht jede Übung genau einmal da, und die Gruppen-Chips des Filters gelten für alle. */
var KAT_GRUPPEN = [
  { id:"brust", key:"mgBrust" }, { id:"ruecken", key:"mgRuecken" }, { id:"schulter", key:"mgSchulter" }, { id:"arme", key:"mgArme" },
  { id:"bauch", key:"mgBauch" }, { id:"core", key:"mgRumpf" }, { id:"beine", key:"mgBeine" }, { id:"po", key:"mgPo" }, { id:"cardio", key:"katCardio" }
];
var KAT_VON_MUSKEL = { brust:"brust", ruecken:"ruecken", schulter:"schulter", arme:"arme", bauch:"bauch", rumpf:"core", beine:"beine", po:"po" };
var katKurat = null;
function katKuratiert(){
  if(!katKurat){ katKurat = {}; STUDIO_GRUPPEN.forEach(function(g){ g.ids.split(" ").forEach(function(id){ katKurat[id] = g.id; }); }); }
  return katKurat;
}
/* Eigene Übungen: Bereich aus den gewählten Kategorien (nur wo sie eindeutig sind), sonst nur unter „Eigene Übungen“ */
var KAT_VON_KATEGORIE = { cardio:"cardio", back:"ruecken", legs:"beine", core:"bauch", arms:"arme" };
function katBereichEigene(ex){
  var l = (ex.cats || []).map(function(c){ return KAT_VON_KATEGORIE[c]; }).filter(Boolean);
  return l.length ? l[0] : "";
}
function katGruppeVon(ex){
  if(ex.custom) return "eigene";
  var k = katKuratiert()[ex.id];
  if(k && k !== "beine" && k !== "bauch") return k;   // Beine und Bauch der Studio-Liste werden unten nach Hauptmuskel auf Bauch, Core, Beine und Po verteilt
  if(ex.main === "ausdauer") return "cardio";
  var m = EX_MUSCLES[ex.id], griff = "";
  if(m && m[0]){
    var teile = m[0].toLowerCase().split(/[,;\/·]| und /);
    for(var i = 0; i < teile.length; i++){
      for(var j = 0; j < MUSKEL_GRP.length; j++){
        if(!MUSKEL_GRP[j].re.test(teile[i])) continue;
        // „Unterarme (Griff)“ allein macht eine Übung nicht zur Armübung, solange etwas Besseres folgt
        if(MUSKEL_GRP[j].id === "arme" && /unterarm|griff/.test(teile[i]) && !/bizeps|trizeps/.test(teile[i])){ griff = "arme"; break; }
        // Bauch plus ein anderer Hauptmuskel (z. B. „Tiefe Bauchmuskeln, Schultern“) = Mischübung: steht unter Core
        if(MUSKEL_GRP[j].id === "bauch" && teile.some(function(x, n){ return n !== i && MUSKEL_GRP.some(function(g){ return g.id !== "bauch" && g.re.test(x); }); })) return "core";
        return KAT_VON_MUSKEL[MUSKEL_GRP[j].id];
      }
    }
    if(griff) return griff;
  }
  var v = mgVerteilung(ex), best = "", bw = 0;
  Object.keys(v).forEach(function(g){ if(v[g] > bw){ bw = v[g]; best = g; } });
  return KAT_VON_MUSKEL[best] || k || (ex.main === "rumpf" ? "bauch" : "beine");
}
var KAT_ICON_UHR = '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>';
function katIcon(id){ return STUDIO_GRUPPEN_ICON[id] || CAT_ICON[id] || CAT_ICON.weight; }
/* Bereiche der Übungen: [{ id, name, ids }] in der Reihenfolge Brust, Rücken, Schultern, Arme, Bauch, Beine, Cardio, Eigene.
   Ohne Dehnübungen (die stehen unter Mobility & Stretch) und ohne ausgeblendete. */
function katalogGruppen(){
  var out = KAT_GRUPPEN.map(function(g){ return { id:g.id, name:t(g.key), ids:[] }; }), by = {};
  out.forEach(function(g){ by[g.id] = g; });
  var eigene = { id:"eigene", name:t("stOwn"), ids:[], eigene:true };
  EXERCISES.forEach(function(ex){
    if(ex.main === "stretch" || libHidden("ex:"+ex.id)) return;
    var g = katGruppeVon(ex);
    if(g === "eigene"){
      eigene.ids.push(ex.id);   // immer unter „Eigene Übungen“ ...
      var bg = katBereichEigene(ex); if(bg && by[bg]) by[bg].ids.push(ex.id);   // ... und zusätzlich in ihrem Bereich
    } else (by[g] || by.beine).ids.push(ex.id);
  });
  out.push(eigene);
  return out;
}
function katGruppeIds(gruppen){   // Übungs-ID -> Bereich
  var m = {};
  gruppen.forEach(function(g){ g.ids.forEach(function(id){ m[id] = g.id; }); });
  return m;
}

/* ---------- Aufklappbare Bereiche ---------- */
/* extra: HTML vor der Anzahl (z. B. „2 gewählt“); gym: nur Fitnessstudio-Inhalt - das Symbol ist dann hellgrün, sonst blau (Freiluft) */
function katZeileHTML(id, ico, name, n, inhalt, offen, extra, gym){
  return '<details class="st-air-gr kat-gr'+(gym ? ' kat-gym' : '')+'" data-katgr="'+esc(id)+'"'+(offen ? ' open' : '')+'><summary>'+
    '<span class="sag-ico">'+svgIcon(ico)+'</span><b>'+esc(name)+'</b>'+(extra || '')+
    '<span class="lbl-hint">'+n+'</span><span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+inhalt+'</details>';
}
function katOffenStd(id, standard){ return katOffen[id] === undefined ? !!standard : !!katOffen[id]; }
/* Antippen klappt auf/zu (selbst umgeschaltet, damit der Zustand fürs Neuzeichnen bekannt ist); während einer Suche bleiben alle offen.
   suche: Funktion, die den aktuellen Suchtext liefert (oder weggelassen) */
function katBinden(suche){
  app.querySelectorAll("details.kat-gr > summary").forEach(function(sm){
    sm.addEventListener("click", function(e){
      e.preventDefault();
      if(suche && suche()) return;
      var d = sm.parentNode; d.open = !d.open; katOffen[d.getAttribute("data-katgr")] = d.open;
    });
  });
}
/* Nach applySearch: bei einer Suche alle Bereiche mit Treffern offen, ohne Treffer weg; ohne Suche wieder wie gemerkt. standard: offen bei Filter */
function katSuche(q, standard){
  app.querySelectorAll("details.kat-gr").forEach(function(d){
    var id = d.getAttribute("data-katgr");
    d.open = !!q || katOffenStd(id, standard);
    d.style.display = !q || Array.prototype.some.call(d.querySelectorAll("[data-q]"), function(k){ return k.style.display !== "none"; }) ? "" : "none";
  });
}

/* ---------- Kopf: Titel, Reiter, Überrasch mich ---------- */
function katKopfHTML(tab, right){
  function b(k, label){ return '<button type="button" data-kattab="'+k+'" class="'+(tab === k ? 'active' : '')+'">'+esc(label)+'</button>'; }
  var kopf = bereichKopfNeuHTML("kat", t("katalog"), t("katKicker"), right || "", { klar:true, foto:"img/neu-d-katalog.jpg", fotoHell:"img/neu-h-halle.jpg", zurueck:"#home", ohneSuche:(right || "").indexOf("lib-lupe") > -1 }) +
    '<div class="rz kat-rz" style="--rz:var(--text)">'+b("baukasten", t("katTabBaukasten"))+b("blocs", t("katTabBlocs"))+'</div>'+
    (tab !== "katalog" ? '<p class="dd-fussnote kat-fav-hinweis">'+esc(t("katFavHinweis"))+'</p>' : '');
  if(tab !== "katalog") return kopf;
  // Katalog (Seite hinter dem Baukasten): Trainingsart, Ausrüstung und Muskel stehen im Filter
  return kopf + '<div class="kat-seitentitel">'+esc(t("katTabKatalog"))+'</div>';
}
/* Ort: Fitnessstudio (Workouts mit Geräten oder Langhantel) oder Freiluft (alles andere: zuhause, draußen, mit Kurzhantel, Band, Stange) */
var KAT_ICON_STUDIO = '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>';
var KAT_ICON_FREI = '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>';
/* Ort eines Workouts für Farbe und Anzeige in Suche, Kalender und Heute: Fitnessstudio, sonst Freiluft */
function katWoOrt(exs){ return exs.some(exIstStudio) ? "studio" : "frei"; }
var KAT_FOTO = { studio:"img/ort-fitnessstudio.jpg", frei:"img/ort-freiluft.jpg" };   // Fotos für Pläne in „Meine“ (Fitnessstudio, Freiluft; Pexels, siehe quellen.html)
/* Beim Bauen gibt es keinen Ort mehr (alles ist fließend): gewählt wird die Trainingsart im Filter (settings.stTrain, Mehrfachwahl, leer = alles).
   Schon gewählte Übungen bleiben im Plan, auch wenn sie nicht zur Wahl passen. */
function bauTrainHTML(){ return trainFotosHTML("data-bauort", studioTrainWahl()); }   // Karten der Trainingsart außerhalb des Filters (Auswahl im Workout-Entwurf)
function bauTrainBinden(neu, box){
  (box || app).querySelectorAll("[data-bauort]").forEach(function(b){
    b.addEventListener("click", function(){ state.db.settings.stTrain = selToggle(studioTrainWahl(), b.getAttribute("data-bauort")); save(); neu(); });
  });
}
/* Neuer Plan: wird erst mit „Speichern“ (unten im Plan-Bau) in „Meine“ aufgenommen; bis dahin ist er ein Entwurf (p.entwurf), den die Listen nicht zeigen.
   Beim Verlassen fragt BLOC nach (Speichern oder Verwerfen); ein leerer Entwurf verschwindet ohne Frage. */
var stPlanNeuId = null;
function katPlanNeu(){
  katPlanAufraeumen();
  // standard: die im Baukasten gewählte Art (Nach Zeit → Timer, Nach Sätzen → Satz für Satz) gilt für die Übungen des Plans, solange man sie nicht einzeln umstellt
  var p = { id:uid(), name:t("planDefault", { n:stPlaene().filter(function(x){ return !x.entwurf; }).length+1 }), ids:[], updatedAt:Date.now(), entwurf:true, standard:bauModus() === "timer" ? "timer" : "saetze" };
  stPlaene().push(p); save();
  if(katTab() !== "baukasten") katZuMeine();   // aus dem Baukasten kommt „Zurück“ wieder dorthin
  stPlanAktiv = p.id; stPlanBauen = true; stPlanSel = -1; stPlanQuery = "";
  renderKatalog(); window.scrollTo(0, 0);
}
/* Entwürfe, die gerade nicht offen sind (z. B. nach einem Abbruch), und leere neue Pläne werden entfernt */
function katPlanAufraeumen(){
  var l = stPlaene(), rest = l.filter(function(x){ return !x.entwurf || x.id === stPlanAktiv; });
  if(rest.length !== l.length){ state.db.settings.stPlaene = rest; save(); }
  var id = stPlanNeuId;
  if(!id || stPlanAktiv === id) return;
  stPlanNeuId = null;
  var p = stPlanFind(id);
  if(p && !stPlanIds(p).length){ state.db.settings.stPlaene = stPlaene().filter(function(x){ return x.id !== id; }); save(); }
}
/* Plan-Bau verlassen: ein neuer Plan mit Übungen fragt erst nach (Speichern · Verwerfen · Abbrechen), ein leerer Entwurf geht ohne Frage */
function planVerlassen(p, weiter){
  if(!p || !p.entwurf){ weiter(); return; }
  function weg(){ state.db.settings.stPlaene = stPlaene().filter(function(x){ return x.id !== p.id; }); save(); }
  if(!stPlanIds(p).length){ weg(); weiter(); return; }
  openActionSheet(t("planNichtGespeichert", { n:p.name }), [
    { ico:P_CHECK, label:t("save"), fn:function(){ delete p.entwurf; p.updatedAt = Date.now(); save(); showToast(t("planGespeichert")); weiter(); } },
    { ico:P_TRASH, label:t("verwerfen"), danger:true, fn:function(){ weg(); weiter(); } }
  ]);
}
function katKopfBinden(){
  app.querySelectorAll("[data-kattab]").forEach(function(b){
    b.addEventListener("click", function(){
      var k = b.getAttribute("data-kattab");
      if(k === katTab() && !stPlanAktiv) return;
      katTabSetzen(k); renderKatalog(); window.scrollTo(0, 0);
    });
  });
  // Abteilung des Katalogs: Meine · Workoutkatalog
  app.querySelectorAll("[data-katabt]").forEach(function(b){
    b.addEventListener("click", function(){
      var a = b.getAttribute("data-katabt");
      if(a === katAbt()) return;
      state.db.settings.katAbt = a; save(); katOffen = {};
      renderKatalog(); window.scrollTo(0, 0);
    });
  });
}

/* ---------- Einstieg: die richtige Seite zum Reiter ---------- */
function renderKatalog(){
  katPlanAufraeumen();
  if(stPlanAktiv && !stPlanFind(stPlanAktiv)){ stPlanAktiv = null; stPlanBauen = false; }
  tabLeiste("katalog");   // untere Leiste auf den Listen des Bereichs, nicht im Plan-Bau (Reiterwechsel rendern nicht über render())
  if(stPlanAktiv && stPlanFind(stPlanAktiv)) return renderStudioPlan();
  stPlanAktiv = null; stPlanBauen = false; stPlanHerkunft = null;
  var tab = katTab();
  if(tab === "baukasten") return renderKatalogBaukasten();
  if(tab === "blocs") return renderLibrary();
  return katAbt() === "uebungen" ? renderKatalogUebungen() : renderKatalogWorkouts();   // Katalog (Übungskatalog nur noch über #uebungskatalog)
}

/* System-Zurück (Geste, Taste) im Plan-Bau, im geöffneten Plan oder in der Gewichtung: erst zurück zur Liste, genau wie der Pfeil oben */
function katPlanVerlassen(){
  var r = parseHash()[0];
  if((r !== "katalog" && r !== "library" && r !== "timers") || (!stPlanAktiv)) return false;
  var p = stPlanAktiv ? stPlanFind(stPlanAktiv) : null;
  planVerlassen(p, function(){
    stPlanAktiv = null; stPlanBauen = false; stPlanSel = -1; stPlanQuery = "";
    var hk = stPlanHerkunft || (p && programmKontextFuer('plan:'+p.id) ? '#koerper' : null);   // aus der Arena geöffnet: zurück dorthin
    if(hk){ stPlanHerkunft = null; goBack(hk); return; }
    renderKatalog(); window.scrollTo(0, 0);
  });
  return true;
}
/* Art im Baukasten: standardmäßig nach Zeit (Timer). Die zwei Knöpfe „Nach Zeit · Nach Sätzen“ stellen um (Nach Sätzen = Gewicht × Wiederholungen);
   die Wahl bleibt gemerkt. Dieselben Knöpfe stehen in beiden Bauseiten; dort wandern die gewählten Übungen mit. */
function bauModus(){
  var m = state.db.settings.bauModus;
  return m === "gewicht" ? "gewicht" : "timer";
}
function bauArtHTML(modus, mitHinweis){
  function b(k, key){ return '<button type="button" data-bauart="'+k+'" class="'+(modus === k ? 'active' : '')+'" aria-pressed="'+(modus === k)+'">'+esc(t(key))+'</button>'; }
  return '<div class="seg-row bau-modus" role="group" aria-label="'+esc(t("bauArtTitel"))+'">'+b("timer", "bauArtZeit")+b("gewicht", "bauArtSaetze")+'</div>'+
    "";
}
/* fn(neueArt) läuft nur, wenn die andere Art gewählt wurde; die Wahl wird für den Ort gemerkt */
function bauArtBinden(modus, fn){
  app.querySelectorAll("[data-bauart]").forEach(function(b){
    b.addEventListener("click", function(){
      var k = b.getAttribute("data-bauart");
      if(k === modus) return;
      var s = state.db.settings;
      s.bauModus = k; save();
      fn(k);
    });
  });
}
/* Zeit → Sätze: das Workout mit Timer wird zum Plan (Sätze × Wiederholungen) mit denselben Übungen. Der Plan ist ein Entwurf (erst „Speichern“ nimmt ihn
   in Meine auf); ein noch nicht gespeichertes Workout wandert dabei in den Plan, ein gespeichertes bleibt. */
function bauNachSaetzen(b){
  var d = b.d, ids = [];
  d.items.forEach(function(it){ var ex = findExercise(it.ex); if(ex && ex.main !== "stretch" && ids.indexOf(it.ex) < 0) ids.push(it.ex); });
  katPlanAufraeumen();
  var l = stPlaene(), key = "my:"+d.id, p = null;
  if(!b.neu) l.forEach(function(x){ if(x.fromWo === key && !x.entwurf) p = x; });
  if(p){   // vorhandener Plan zu diesem Workout: fehlende Übungen kommen dazu
    var pl = stPlanIds(p);
    ids.forEach(function(id){ if(pl.indexOf(id) < 0) pl.push(id); });
    p.ids = pl; p.updatedAt = Date.now();
  } else {
    p = { id:uid(), name:d.name && d.name !== t("myDefaultName") ? d.name : t("planDefault", { n:l.filter(function(x){ return !x.entwurf; }).length+1 }), ids:ids, updatedAt:Date.now(), entwurf:true, standard:"saetze" };
    if(!b.neu) p.fromWo = key;
    l.push(p);
  }
  save();
  bauEntwurf = null;
  katZuMeine();
  stPlanAktiv = p.id; stPlanBauen = true; stPlanSel = -1; stPlanQuery = "";
  navStack.pop();
  if(navTop() !== "#katalog") navStack.push("#katalog");
  syncGuard(); render(); window.scrollTo(0, 0);
}
/* Sätze → Zeit: der Plan wird zum Workout mit Timer (Satz- und Pausenwerte der Übungen), zunächst als ungespeicherter Entwurf im Baukasten.
   Ein noch nicht gespeicherter Plan wandert dabei, ein gespeicherter bleibt; ein schon verknüpftes Workout wird aktualisiert und geöffnet. */
/* Katalog (fertige Workouts) öffnen: Seite hinter dem Baukasten */
function katKatalogOeffnen(){
  var s = state.db.settings;
  s.katTab = "katalog"; s.katAbt = "workouts"; stPlanAktiv = null; stPlanBauen = false; katOffen = {}; save();
  go("#katalog"); renderKatalog(); window.scrollTo(0, 0);
}
/* ---------- Baukasten: Überrasch mich, selber bauen oder aus dem Katalog ---------- */
function renderKatalogBaukasten(){
  var modus = bauModus();
  var hw = hinweise("bau2", ["katBauHint"]);
  app.innerHTML =
    katKopfHTML("baukasten", hw.knopf) +
    hw.z(0, "page-hint") +
    '<div class="bau-schritt"><span>1</span>'+esc(t("bauArtTitel"))+'</div>'+
    bauArtHTML(modus, true) +
    '<div class="bau-schritt"><span>2</span>'+esc(t("bauSchritt3"))+'</div>'+
    '<button type="button" class="bau-karte bau-sp" data-surprise><span class="bk-ico">'+svgIcon(ICON_UEBERRASCH)+'</span><span class="bk-t"><b>'+esc(t("surprise"))+'</b><small>'+esc(t("bauUeberraschSub"))+'</small></span>'+
      '<span class="bk-wuerfel" aria-hidden="true"><svg viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="20"/><circle cx="30" cy="30" r="7"/><circle cx="70" cy="30" r="7"/><circle cx="50" cy="50" r="7"/><circle cx="30" cy="70" r="7"/><circle cx="70" cy="70" r="7"/></svg></span>'+
      '<span class="bk-pfeil">'+ICON_CHEV+'</span></button>'+
    '<button type="button" class="bau-karte" data-bauselber><span class="bk-ico">'+ICON_PLUS+'</span><span class="bk-t"><b>'+esc(t("bauSelber"))+'</b><small>'+esc(t("bauSelberSub"))+'</small></span><span class="bk-pfeil">'+ICON_CHEV+'</span></button>'+
    '<button type="button" class="bau-karte" data-baukatalog><span class="bk-ico">'+svgIcon(HOME_ICON.katalog)+'</span><span class="bk-t"><b>'+esc(t("bauKatalog"))+'</b><small>'+esc(t("bauKatalogSub"))+'</small></span><span class="bk-pfeil">'+ICON_CHEV+'</span></button>'+
    '<button type="button" class="bau-karte bau-eigen" data-baueigen><span class="bk-ico">'+ICON_PLUS+'</span><span class="bk-t"><b>'+esc(t("bauEigene"))+'</b><small>'+esc(t("bauEigeneSub"))+'</small></span><span class="bk-pfeil">'+ICON_CHEV+'</span></button>'+
    '<div style="height:40px"></div>';
  bindCommon();
  katKopfBinden();
  app.querySelector("[data-baueigen]").addEventListener("click", function(){ exEditVorgabe = { equip:["gym"], cats:["weight"], reps:3, work:40, rest:60 }; go("#exedit/new"); });
  app.querySelector("[data-baukatalog]").addEventListener("click", function(){ katKatalogOeffnen(); });
  bauArtBinden(modus, function(){ renderKatalog(); });
  app.querySelector("[data-surprise]").addEventListener("click", function(){ openSurprise(); });
  // „Selber bauen“ fragt nichts mehr nach: die Art (Schritt 1) steht schon, es geht gleich in die Übungsauswahl (Trainingsart, Ausrüstung und Muskel im Filter) -
  // Workout mit Timer oder Plan mit Sätzen, Gewicht und Pausen
  app.querySelector("[data-bauselber]").addEventListener("click", function(){
    go("#katalog");
    katPlanNeu();   // immer der Plan: Übungen wählen, dann je Übung Satz für Satz oder Timer (die Art oben ist die Voreinstellung)
  });
  if(builderAuto){   // Workout-Builder auf Heute (Aussehen New): gleich Überrasch mich bzw. Selber bauen auslösen
    var baZiel = app.querySelector(builderAuto === "zufall" ? "[data-surprise]" : "[data-bauselber]");
    builderAuto = null;
    if(baZiel) baZiel.click();
  }
}

/* ---------- Übungskatalog (dritte Abteilung des Katalogs; #uebungskatalog führt dorthin) ---------- */
function renderKatalogUebungen(){
  tabLeiste("katalog");
  var s = state.db.settings, alle = studioAlle();
  studioFilterAlt();
  var gruppen = katalogGruppen(), vonId = katGruppeIds(gruppen), gueltig = {};
  gruppen.forEach(function(g){ gueltig[g.id] = true; });
  var fGr = selArr(s.stGruppen).filter(function(id){ return gueltig[id]; });
  var fTrain = studioTrainWahl(), fAusr = studioAusrWahl();
  var zonen = kkNorm(s.stZonen);   // Körperkarte: gewählte Muskelzonen
  /* Gezeigt werden die Übungen der gewählten Trainingsarten; die übrigen stehen unsichtbar mit im Seitentext (data-ortfremd) und erscheinen nur,
     solange etwas gesucht wird - die Suche soll nicht an der Trainingsart scheitern. */
  function artOkOhneOrt(id){ var ex = findExercise(id); return !!ex && ausrPasst(ex, fAusr) && (!zonen.length || zonePasst(ex, zonen)); }
  function artOk(id){ return artOkOhneOrt(id) && hier(id); }
  function passtOhneOrt(id){ return !!vonId[id] && (!fGr.length || fGr.indexOf(vonId[id]) > -1) && artOkOhneOrt(id); }
  function hier(id){ return trainPasst(findExercise(id), fTrain); }
  var filterAn = !!(fGr.length || fTrain.length || fAusr.length || zonen.length);
  var favs = (s.exFavs || []).filter(function(id){ return !!findExercise(id) && passtOhneOrt(id); });
  var zuletzt = Object.keys(alle).filter(function(id){ return alle[id].zuletzt && findExercise(id) && passtOhneOrt(id) && favs.indexOf(id) < 0; })
    .sort(function(a, b){ return alle[b].zuletzt - alle[a].zuletzt; }).slice(0, 6);
  var anzahl = 0;
  gruppen.forEach(function(g){ if(!fGr.length || fGr.indexOf(g.id) > -1) anzahl += g.ids.filter(artOk).length; });
  var hw = hinweise("katueb", ["katUebHint"]);
  var html = "";
  function zeile(id, ico, name, ids, offen, extra, innenPlus){
    var da = ids.filter(hier);   // sichtbar ohne Suche
    var gym = da.length > 0 && da.every(function(i){ return exIstStudio(findExercise(i)); });   // nur Fitnessstudio: hellgrünes Symbol
    var kacheln = ids.map(function(i){ var k = studioKachel(i); return hier(i) ? k : k.replace("<div ", '<div data-ortfremd="1" '); }).join("");
    var h = katZeileHTML(id, ico, name, da.length, '<div class="fig-grid">'+kacheln+(innenPlus || "")+'</div>', katOffenStd(id, offen), extra, gym);
    return da.length || !ids.length ? h : h.replace("<details ", '<details data-ortfremd="1" ');
  }
  if(favs.length) html += zeile("fav", ICON_STAR, t("stFavs"), favs, false);
  if(zuletzt.length) html += zeile("zuletzt", KAT_ICON_UHR, t("stRecent"), zuletzt, false);
  gruppen.forEach(function(g){
    if(fGr.length && fGr.indexOf(g.id) < 0) return;
    var ids = g.ids.filter(artOkOhneOrt);
    if(!ids.length && (!g.eigene || filterAn)) return;
    var neu = g.eigene ? '<button type="button" class="fig-karte st-neu" data-stnew>'+ICON_PLUS+'<span class="fig-name">'+esc(t("stOwnNew"))+'</span></button>' : '';
    html += zeile(g.id, katIcon(g.id), g.name, ids, false, "", neu);   // Bereiche stehen immer zugeklappt da (auch mit Filter); nur eine Suche klappt Treffer auf
  });
  // früher (in Air) ausgeblendete Übungen: unten gesammelt, mit „Einblenden“
  var verborgen = EXERCISES.filter(function(ex){ return ex.main !== "stretch" && libHidden("ex:"+ex.id); });
  app.innerHTML =
    katKopfHTML("katalog", hw.knopf+lupeHTML("st", studioQuery)) +
    '<button type="button" class="btn btn-secondary kat-eigene" data-stnew2>'+ICON_PLUS+' '+esc(t("exNew"))+'</button>' +
    tippZeileHTML("uebung", "tippUebung") + hw.z(0, "page-hint") +
    suchFeldHTML(studioQuery, "st", t("stSearch")) +
    studioFilterHTML(gruppen, fGr, fTrain, fAusr, anzahl, zonen) +
    html +
    '<div class="empty" data-noresult style="display:none;padding:30px 20px;">'+esc(t("stNone"))+'</div>' +
    hiddenBlockHTML(verborgen.length, verborgen.map(function(ex){ return libExCard(ex, true, exSubText(ex)); }).join("")) +
    '<button type="button" class="btn btn-secondary kat-link" data-nav="#warmstretch">'+svgIcon(HOME_ICON.warm)+' '+esc(t("katLinkMobility"))+'</button>' +
    '<div style="height:40px"></div>';
  bindCommon();
  katKopfBinden();
  app.querySelectorAll("[data-unhideone]").forEach(function(b){
    b.addEventListener("click", function(e){
      e.stopPropagation();
      var k = b.getAttribute("data-unhideone");
      s.hiddenLib = (s.hiddenLib || []).filter(function(x){ return x !== k; });
      save(); var y = window.scrollY; renderKatalogUebungen(); window.scrollTo(0, y);
    });
  });
  app.querySelectorAll("[data-studio]").forEach(function(b){
    function oeffnen(){ go("#studio/"+b.getAttribute("data-studio")); }
    b.addEventListener("click", oeffnen);
    b.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); oeffnen(); } });
    langDruck(b, function(){ exZuProgramm(b.getAttribute("data-studio")); });   // lange drücken: in ein Workout oder einen Plan legen
  });
  app.querySelectorAll("[data-exfav]").forEach(function(b){ b.addEventListener("click", function(e){
    e.stopPropagation(); toggleExFav(b.getAttribute("data-exfav"));
    var y = window.scrollY; renderKatalogUebungen(); window.scrollTo(0, y);
  }); });
  function neuZeichnen(){ var y = window.scrollY; renderKatalogUebungen(); window.scrollTo(0, y); }
  studioFilterBinden(fGr, fTrain, fAusr, zonen, neuZeichnen);
  var neu = app.querySelector("[data-stnew]");
  if(neu) neu.addEventListener("click", function(){ exEditVorgabe = { equip:["gym"], cats:["weight"], reps:3, work:40, rest:60 }; go("#exedit/new"); });
  var neu2 = app.querySelector("[data-stnew2]");   // oben auf der Seite: eigene Übung anlegen
  if(neu2) neu2.addEventListener("click", function(){ go("#exedit/new"); });
  katBinden(function(){ return studioQuery; });
  var q = app.querySelector("#st-q");
  function suchen(){
    applySearch(app, studioQuery);
    katSuche(studioQuery, false);   // bei einer Suche alle Bereiche mit Treffern offen, die übrigen weg
    // ohne Suche nur die gewählten Trainingsarten; mit Suche zählen alle Übungen
    if(!(studioQuery || "").trim()) app.querySelectorAll("[data-ortfremd]").forEach(function(el){ el.style.display = "none"; });
  }
  q.addEventListener("input", function(){ studioQuery = q.value; suchen(); });
  suchen();
}

/* ---------- Meine: Pläne ---------- */
/* Muskelgruppen eines Plans (die größten bis zu vier, nach Anteil) und sein Ort: Fitnessstudio, Freiluft oder beides zusammen */
function planGruppen(ids){
  var sum = {}, tot = 0;
  ids.forEach(function(id){
    var ex = findExercise(id); if(!ex) return;
    var v = mgVerteilung(ex);
    Object.keys(v).forEach(function(g){ sum[g] = (sum[g] || 0) + v[g]; tot += v[g]; });
  });
  if(!tot) return "";
  return MUSKEL_GRP.filter(function(g){ return (sum[g.id] || 0)/tot >= 0.1; })
    .sort(function(a, b){ return sum[b.id] - sum[a.id]; }).slice(0, 4).map(function(g){ return t(g.key); }).join(" · ");
}
function planOrt(ids){
  var exs = ids.map(findExercise).filter(Boolean), s = exs.filter(exIstStudio).length;
  return !exs.length ? "" : s === 0 ? t("katOrtFrei") : s === exs.length ? t("katOrtStudio") : t("katOrtBeide");
}
/* ---------- Meine: Abschnitte und Orts-Fotos ----------
   Die Abschnitte (Nach Zeit · Nach Sätzen · Gespeicherte Trainings) sind aufklappbare Karten mit Symbol, Untertitel und Zahl; offen oder zu merkt sich
   katOffen für diesen Besuch. Jeder Eintrag trägt das Foto seines Ortes (Fitnessstudio, Freiluft oder beides geteilt). */
function ortThumbHTML(ids){
  var s = 0, f = 0;
  (ids || []).forEach(function(id){ var ex = findExercise(id); if(!ex) return; if(exIstStudio(ex)) s++; else f++; });
  if(!s && !f) return "";
  function img(k){ return '<img src="'+KAT_FOTO[k]+'" alt="" draggable="false">'; }
  return '<span class="ort-thumb'+(s && f ? ' zwei' : '')+'" aria-hidden="true">'+(s ? img("studio") : '')+(f ? img("frei") : '')+'</span>';
}
/* farbe: Name der Akzentfarbe des Abschnitts (zeit | saetze | training) */
function katSektionHTML(id, farbe, ikon, titel, sub, n, inhalt){
  var offen = katOffenStd("sek-"+id, false);
  return '<details class="kat-sek kat-sek-'+farbe+'" data-katsek="'+esc(id)+'"'+(offen ? ' open' : '')+'><summary>'+
    '<span class="ks-ico">'+svgIcon(ikon)+'</span><span class="ks-t"><b>'+esc(titel)+'</b><small>'+esc(sub)+'</small></span>'+
    '<span class="ks-n">'+n+'</span><span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
    '<div class="ks-inhalt">'+inhalt+'</div></details>';
}
function katSektionBinden(){
  app.querySelectorAll("details.kat-sek > summary").forEach(function(sm){
    sm.addEventListener("click", function(e){
      e.preventDefault();
      var d = sm.parentNode; d.open = !d.open; katOffen["sek-"+d.getAttribute("data-katsek")] = d.open;
    });
  });
}
var KAT_ICON_SAETZE = KAT_ICON_STUDIO;   // Hantel
var KAT_ICON_TRAININGS = '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4M9 15l2 2 4-4"/>';
function katPlaeneHTML(){
  var pl = stPlaene().filter(function(x){ return !x.entwurf; }).sort(function(a, b){ return (b.updatedAt || 0) - (a.updatedAt || 0); });
  var inhalt = (pl.length ? pl.map(function(p){
      var ids = stPlanIds(p), namen = ids.slice(0, 3).map(function(id){ return tplText(findExercise(id).name); }).join(", ")+(ids.length > 3 ? " …" : "");
      var gr = planGruppen(ids), ort = planOrt(ids);
      return '<div class="list-item entry plan-item" data-plan="'+esc(p.id)+'" role="button" tabindex="0">'+ortThumbHTML(ids)+
        '<div class="meta"><div class="name">'+esc(p.name)+'</div><div class="sub">'+esc(planAnzahl(ids.length))+(ort ? SEP+esc(ort) : '')+'</div>'+
        (gr ? '<div class="sub pl-gruppen">'+esc(gr)+'</div>' : '')+
        (ids.length ? '<div class="sub pl-namen">'+esc(namen)+'</div>' : '')+'</div>'+
        '<div class="card-aside"><div class="card-acts">'+favBtn("plan:"+p.id)+trashBtn("plan", p.id, p.name)+'</div></div></div>';
    }).join("") : '<div class="fav-empty">'+esc(t("planNone"))+'</div>')+
    (pl.length > 1 ? auswertungHTML(pl.reduce(function(a, p){ return a.concat(stPlanIds(p)); }, []), { gesamt:true, titel:t("ausAll") }) : '');
  return katSektionHTML("saetze", "saetze", KAT_ICON_SAETZE, t("katSekSaetze"), t("katSekSaetzeSub"), pl.length, inhalt);
}
function katPlaeneBinden(){
  app.querySelectorAll("[data-plan]").forEach(function(el){
    function los(){ stPlanAktiv = el.getAttribute("data-plan"); stPlanBauen = false; stPlanSel = -1; stPlanQuery = ""; renderKatalog(); window.scrollTo(0, 0); }
    el.addEventListener("click", los);
    el.addEventListener("keydown", function(e){ if(e.target === el && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); los(); } });
  });
}
/* Deckblatt eines Fitnessstudio-Workouts: „Mit Gewichten trainieren“ legt einen Plan mit denselben Übungen an (einmal je Workout, danach wird er
   nur geöffnet) und zeigt ihn - dort stehen Gewicht × Wiederholungen vorn, „Mit Timer starten“ ist der optionale zweite Knopf */
function katPlanAusDraft(d){
  var ids = [];
  d.items.forEach(function(it){ var ex = findExercise(it.ex); if(ex && ex.main !== "stretch" && ids.indexOf(it.ex) < 0) ids.push(it.ex); });
  if(!ids.length) return;
  var l = stPlaene(), p = null;
  l.forEach(function(x){ if(x.fromWo === d.key) p = x; });
  if(!p){
    p = { id:uid(), name:d.name || t("planDefault", { n:l.length+1 }), ids:ids, updatedAt:Date.now(), fromWo:d.key };
    l.push(p);
  }
  save();
  katZuMeine();
  stPlanAktiv = p.id; stPlanBauen = false; stPlanQuery = "";
  stPlanHerkunft = /^#cover[/]/.test(navTop()) ? navTop() : null;   // vom Deckblatt (Overview) geöffnet: Zurück führt dorthin
  go("#katalog");
}
/* Plan nach Gewichtung: öffnet das Zusammenstell-Fenster (js/13-teilen-editor.js) bei „Nach Gewichtung“ mit den Reglern; der Ort (Fitnessstudio
   oder Freiluft) entscheidet, aus welchen Übungen gezogen wird */
function katPlanGenNeu(){ openSurprise(null, "gewicht"); }
/* ---------- Katalog: fertige Workouts (derselbe Filter wie bei den Übungen) ----------
   Überschriften sind dieselben Bereiche wie bei den Übungen, dazu „Ganzkörper“. Ein Workout steht dort, wohin sein Fokus zeigt
   (Cardio, Beine, Rücken, Arme, Bauch) oder wo klar die meisten seiner Übungen liegen (mindestens 40 % und mehr als im zweiten Bereich); sonst unter Ganzkörper.
   Filter (gespeichert wie bei den Übungen: settings.stGruppen, stAusr, stZonen):
   - Gruppe und Körperkarte: mindestens ein Drittel der Übungen passt
   - Ausrüstung: jede Übung geht mit der gewählten Ausrüstung (Körpergewicht braucht nichts) - „was hast du dabei?“ */
var KAT_WO_FOKUS_BEREICH = { cardio:"cardio", legs:"beine", back:"ruecken", arms:"arme", core:"bauch" };
var KAT_WO_BEREICHE = ["ganz", "brust", "ruecken", "schulter", "arme", "bauch", "core", "beine", "po", "cardio"];
function katWoBereich(lw, exs){
  var f = KAT_WO_FOKUS_BEREICH[lw.focus];
  if(f) return f;
  var n = {};
  exs.forEach(function(ex){ var g = katGruppeVon(ex); n[g] = (n[g] || 0) + 1; });
  var l = Object.keys(n).sort(function(a, b){ return n[b] - n[a]; });
  var best = l[0], bn = n[best] || 0, zweit = l[1] ? n[l[1]] : 0;
  // klar vorn: mindestens 40 % und mehr als der zweite - sonst ein Workout für den ganzen Körper
  return exs.length && bn >= exs.length*0.4 && bn > zweit && KAT_WO_BEREICHE.indexOf(best) > -1 ? best : "ganz";
}
/* Zahl der fertigen Workouts je Trainingsart (alle Übungen passen dazu) für die Karten im Filter */
function katTrainZahlenWo(){
  var n = { studio:0, cali:0, body:0 };
  LIB_WORKOUTS.forEach(function(lw){
    if(libIstWarmDehn(lw) || libHidden("wo:"+lw.id)) return;
    var exs = lw.exercises.map(findExercise).filter(Boolean);
    if(!exs.length) return;
    TRAIN_ARTEN.forEach(function(a){ if(exs.every(function(ex){ return trainPasst(ex, [a]); })) n[a]++; });
  });
  return n;
}
function katWoPasst(exs, fGr, fAusr, zonen){
  var n = exs.length;
  if(!n) return false;
  var drittel = Math.max(1, n/3);
  if(fGr.length && exs.filter(function(ex){ return fGr.indexOf(katGruppeVon(ex)) > -1; }).length < drittel) return false;
  if(zonen.length && exs.filter(function(ex){ return zonePasst(ex, zonen); }).length < drittel) return false;
  if(fAusr.length && !exs.every(function(ex){ return exTrainArt(ex) !== "studio" || ausrPasst(ex, fAusr); })) return false;   // Körpergewicht und Stange brauchen keine Auswahl
  return true;
}
function renderKatalogWorkouts(){
  var s = state.db.settings;
  studioFilterAlt();
  var gruppen = katalogGruppen(), gueltig = {};
  gruppen.forEach(function(g){ gueltig[g.id] = true; });
  var fGr = selArr(s.stGruppen).filter(function(id){ return gueltig[id]; });
  var fAusr = studioAusrWahl();
  var fTrain = studioTrainWahl();
  var zonen = kkNorm(s.stZonen);
  var filterAn = !!(fGr.length || fTrain.length || fAusr.length || zonen.length);
  var woSort = s.libWoSort === "az" ? "az" : "dur";
  var hw = hinweise("katwo", ["katWoHint"]);

  var rows = [];
  LIB_WORKOUTS.forEach(function(lw){
    if(libIstWarmDehn(lw)) return;
    var exs = lw.exercises.map(findExercise).filter(Boolean);
    rows.push({ lw:lw, exs:exs, name:tplText(lw.name), dur:workoutDuration(libWorkoutRun(lw)), hidden:libHidden("wo:"+lw.id),
      bereich:katWoBereich(lw, exs), mains:woMains(exs) });
  });
  var sichtbar = rows.filter(function(r){ return !r.hidden && r.exs.every(function(ex){ return trainPasst(ex, fTrain); }) && katWoPasst(r.exs, fGr, fAusr, zonen); });   // jede Übung passt zur gewählten Trainingsart
  var versteckt = rows.filter(function(r){ return r.hidden; });
  libWoSort(sichtbar, woSort);
  var je = {};
  sichtbar.forEach(function(r){ (je[r.bereich] = je[r.bereich] || []).push(libWoCard(r.lw, r.exs, false, r.dur, r.mains)); });
  var liste = "";
  var eig = gruppen.filter(function(g){ return g.eigene; })[0], eigIds = eig ? eig.ids.filter(function(id){ return !fGr.length || fGr.indexOf("eigene") > -1; }) : [];
  if(eigIds.length) liste += katZeileHTML("wo-eigene", katIcon("eigene"), t("stOwn"), eigIds.length,
    '<div class="kat-inhalt"><div class="fig-grid">'+eigIds.map(function(i){ return studioKachel(i); }).join("")+
    '<button type="button" class="fig-karte st-neu" data-stnew3>'+ICON_PLUS+'<span class="fig-name">'+esc(t("stOwnNew"))+'</span></button></div></div>', katOffenStd("wo-eigene", false), "", false);
  KAT_WO_BEREICHE.forEach(function(b){
    if(!je[b]) return;
    var name = b === "ganz" ? t("katGanz") : t(KAT_GRUPPEN.filter(function(g){ return g.id === b; })[0].key);
    liste += katZeileHTML("wo-"+b, b === "ganz" ? HOME_ICON.katalog : katIcon(b), name, je[b].length, '<div class="kat-inhalt">'+je[b].join("")+'</div>', katOffenStd("wo-"+b, false), "", fTrain.length === 1 && fTrain[0] === "studio");
  });
  if(!liste) liste = '<div class="empty" style="padding:34px 20px;">'+esc(t("katWoNone"))+'</div>';
  liste += '<div class="empty" data-noresult style="display:none;padding:30px 20px;">'+esc(t("noResult"))+'</div>';
  var az = '<button type="button" class="af-az'+(woSort === "az" ? ' on' : '')+'" data-lfsort="'+(woSort === "az" ? "dur" : "az")+'" aria-pressed="'+(woSort === "az")+
    '" title="'+esc(t("afSortAz"))+'" aria-label="'+esc(t("afSortAz"))+'">A&ndash;Z</button>';

  app.innerHTML =
    katKopfHTML("katalog", hw.knopf + lupeHTML("l", libQuery)) +
    suchFeldHTML(libQuery, "l", t("searchWoPh")) +
    tippZeileHTML("workout", "tippWorkout") + hw.z(0, "page-hint") +
    studioFilterHTML(gruppen, fGr, fTrain, fAusr, sichtbar.length, zonen, { art:"Wo", extra:az, trainZahlen:katTrainZahlenWo() }) +
    liste +
    hiddenBlockHTML(versteckt.length, versteckt.map(function(r){ return libWoCard(r.lw, r.exs, true, r.dur, r.mains); }).join("")) +
    '<div style="height:60px"></div>';
  bindCommon();
  katKopfBinden();
  function neu(){ var y = window.scrollY; renderKatalog(); window.scrollTo(0, y); }
  function on(sel, fn){ app.querySelectorAll(sel).forEach(function(el){ el.addEventListener("click", function(e){ e.stopPropagation(); fn(el, e); }); }); }
  studioFilterBinden(fGr, fTrain, fAusr, zonen, neu);
  on("[data-stnew3]", function(){ go("#exedit/new"); });
  app.querySelectorAll("[data-studio]").forEach(function(b){   // Eigene Übungen in der Rubrik: öffnen, lange drücken = in ein Workout legen
    function oeffnen(){ go("#studio/"+b.getAttribute("data-studio")); }
    b.addEventListener("click", oeffnen);
    b.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); oeffnen(); } });
    langDruck(b, function(){ exZuProgramm(b.getAttribute("data-studio")); });
  });
  on("[data-lfsort]", function(el){ s.libWoSort = el.getAttribute("data-lfsort"); save(); neu(); });
  katBinden(function(){ return libQuery; });
  var lq = app.querySelector("#l-q");
  if(lq){
    var suchen = function(){ applySearch(app, libQuery); katSuche(libQuery, false); };
    lq.addEventListener("input", function(){ libQuery = lq.value; suchen(); });
    if(libQuery) suchen();
  }
  on("[data-fav]", function(el){ toggleFav(el.getAttribute("data-fav")); neu(); });
  on("[data-cover]", function(el){ if(el.disabled) return; coverDraft = null; go("#cover/"+el.getAttribute("data-cover")); });
  on("[data-unhideone]", function(el){
    var k = el.getAttribute("data-unhideone");
    s.hiddenLib = (s.hiddenLib || []).filter(function(x){ return x !== k; });
    save(); neu();
  });
  on("[data-womore]", function(el){ var lw = findLibWorkout(el.getAttribute("data-womore")); if(lw) woMenue(lw, neu); });
  app.querySelectorAll(".lib-card [data-womore]").forEach(function(b){   // langes Drücken auf eine Karte = dasselbe Menü wie ⋯
    var lw = findLibWorkout(b.getAttribute("data-womore"));
    if(lw) langDruck(b.closest(".lib-card"), function(){ woMenue(lw, neu); });
  });
}
