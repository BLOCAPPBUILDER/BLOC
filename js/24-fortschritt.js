"use strict";
/* ============ Fortschritt: frei zusammenstellbare Auswertungen (dritter Reiter der unteren Leiste) ============
   Fortschritt und Deep Dive stehen hier zusammen. Jede Auswertung ist eine Kachel; welche zu sehen sind und in welcher Reihenfolge, steht in
   settings.fortschrittKacheln (Liste von Schlüsseln, Standard: Tage am Stück, gehobenes Gewicht, Gewichte & Verläufe). Unten steht „Weitere Auswertungen hinzufügen“.
   Kachel lange drücken und ziehen verschiebt sie (wie auf Tools); auf die Fläche „Entfernen“ gezogen oder nach dem Halten ohne Ziehen im Menü verschwindet sie.
   Die Inhalte kommen aus statModule (js/12-uebung-statistik.js) und ddModule (js/21-koerper.js). Alles lokal, nichts wird geladen oder gesendet. */
var FK_STANDARD = ["logbuch"];
/* g = Gruppe im Auswahlfenster, gross = ganze Breite (sonst halbe Breite im versetzten Raster) */
var FK_MODULE = [
  { id:"logbuch", g:"gewichte", gross:1 },
  { id:"woche", g:"training", gross:1 }, { id:"who", g:"training", gross:1 }, { id:"verlauf", g:"training", gross:1 }, { id:"rueckblick", g:"training", gross:1 },
  { id:"kalender", g:"training", gross:1 }, { id:"blocs", g:"training", gross:1 }, { id:"trainings", g:"training", gross:1 }, { id:"einblicke", g:"training", gross:1 },
  { id:"lauf_best", g:"lauf", gross:1 }, { id:"lauf_pacing", g:"lauf", gross:1 }, { id:"lauf_regel", g:"lauf", gross:1 }, { id:"lauf_trend", g:"lauf", gross:1 }, { id:"lauf_puls", g:"lauf", gross:1 },
  { id:"b-katalog", g:"bereiche", gross:1 }, { id:"b-warm", g:"bereiche", gross:1 }, { id:"b-intervall", g:"bereiche", gross:1 }, { id:"b-run", g:"bereiche", gross:1 },
  { id:"dd_freq", g:"muskeln", gross:1 }, { id:"dd_woche", g:"muskeln", gross:1 }, { id:"dd_balance", g:"muskeln", gross:1 }, { id:"dd_anteil", g:"muskeln", gross:1 }, { id:"dd_idee", g:"muskeln", gross:1 }
];
var FK_GRUPPEN = ["gewichte", "training", "lauf", "bereiche", "muskeln"];
function fkDef(id){ for(var i = 0; i < FK_MODULE.length; i++) if(FK_MODULE[i].id === id) return FK_MODULE[i]; return null; }
function fkName(id){
  if(id.indexOf("b-") === 0){ var d = bereichDaten(id.slice(2)); return d ? d[1] : id; }
  return t("fk_"+id);
}
/* gespeicherte Auswahl, bereinigt (nur bekannte Schlüssel, jeder einmal); ohne Eintrag gilt der Standard */
function fkWahl(){
  var roh = state.db.settings.fortschrittKacheln, l = [];
  (Array.isArray(roh) ? roh : FK_STANDARD).forEach(function(id){ if(typeof id === "string" && fkDef(id) && l.indexOf(id) < 0) l.push(id); });
  return l;
}
function fkSpeichern(ids){ state.db.settings.fortschrittKacheln = ids; save(); }
/* Zahlen auf einen Blick: feste Reihe oben (nicht verschiebbar); jede Zahl ist eine Fläche, Antippen zeigt ihren Verlauf */
function fkZahlenHTML(Z){
  if(!Z.length) return "";
  return '<section class="fk-blick" aria-label="'+esc(t("fkBlick"))+'"><h2 class="fk-blick-titel">'+esc(t("fkBlick"))+'</h2><div class="fk-blick-raster">'+Z.map(function(z){
    return '<button type="button" class="card fz-mini" data-zahl="'+esc(z.id)+'" aria-label="'+esc(z.titel+": "+z.wert+" "+z.einheit)+'"><span class="fz-ico">'+svgIcon(z.ico)+'</span><span class="fz-wert"><b>'+esc(z.wert)+'</b><span>'+esc(z.einheit)+'</span></span><small>'+esc(z.titel)+'</small></button>';
  }).join("")+'</div><p class="fk-blick-hint">'+esc(t("fkBlickHint"))+'</p></section>';
}
/* Verlauf zu einer Zahl: gibt es ihn schon als Kachel auf der Seite (Tage und Zeit im Verlauf, Kilometer im Run-Bereich), springt die Seite dorthin; sonst öffnet sich ein Fenster mit dem Diagramm */
var FK_SCHON = { tage:"verlauf", zeit:"verlauf", km:"b-run" };
function fkZahlTippen(id, st, Z){
  var ziel = FK_SCHON[id], el = ziel && app.querySelector('[data-fk="'+ziel+'"]');
  if(el){
    if(id === "tage" || id === "zeit"){ statModus = id === "tage" ? "n" : "zeit"; renderFortschritt(); el = app.querySelector('[data-fk="'+ziel+'"]'); }
    var det = el.querySelector("details"); if(det) det.open = true;
    el.scrollIntoView({ behavior:"smooth", block:"center" });
    el.classList.add("fk-blitz"); setTimeout(function(){ el.classList.remove("fk-blitz"); }, 1400);
    return;
  }
  fkZahlSheet(id, st, Z);
}
function fkZahlSheet(id, st, Z){
  var root = document.getElementById("overlayRoot"), z = Z.filter(function(x){ return x.id === id; })[0], gran = "woche";
  if(!z) return;
  function zeichnen(){
    var g = st.graph(id, gran);
    root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet fk-sheet fk-graphsheet" role="dialog" aria-label="'+esc(z.titel)+'"><h3>'+esc(z.titel)+'</h3>'+
      '<div class="fz-wert fk-gross-wert"><b>'+esc(z.wert)+'</b><span>'+esc(z.einheit)+'</span></div><p class="fk-gsub">'+esc(z.sub)+(z.sub2 ? " · "+esc(z.sub2) : "")+'</p>'+
      '<div class="sk-kopf stat-gran"><span class="stat-seg">'+[["woche", "statGranWoche"], ["monat", "statGranMonat"], ["jahr", "statGranJahr"]].map(function(q){
        return '<button type="button" data-fkg="'+q[0]+'" class="'+(gran === q[0] ? "active" : "")+'">'+esc(t(q[1]))+'</button>'; }).join("")+'</span></div>'+
      (g.hatDaten ? g.html+'<div class="sk-unter">'+esc(g.hinweis+" – "+t("statWischen"))+'</div>' : '<div class="sk-unter">'+esc(t("fkNoData"))+'</div>')+
      '<div class="btn-row"><button class="btn btn-primary" data-ok>'+esc(t("fkFertig"))+'</button></div></div></div>';
    root.querySelectorAll(".bscroll").forEach(function(b){ b.scrollLeft = b.scrollWidth; });
    root.querySelectorAll("[data-fkg]").forEach(function(b){ b.addEventListener("click", function(){ gran = b.getAttribute("data-fkg"); zeichnen(); }); });
    root.querySelector("[data-ok]").addEventListener("click", zu);
    root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
  }
  function zu(){ root.innerHTML = ""; }
  zeichnen();
}
function fkKachelHTML(id, M){
  var d = fkDef(id), inhalt = M[id];
  if(!inhalt) inhalt = '<div class="card stat-karte fk-leerkarte"><div class="sk-kopf"><b>'+esc(fkName(id))+'</b></div><div class="sk-unter">'+esc(t("fkNoData"))+'</div></div>';
  return '<div class="fk '+(d && d.gross ? 'fk-gross' : 'fk-klein')+'" data-fk="'+esc(id)+'">'+inhalt+'</div>';
}
function renderFortschritt(){
  var st = statModule(), dd = ddModule(), M = {}, wahl = fkWahl();
  Object.keys(st.M).forEach(function(k){ M[k] = st.M[k]; });
  Object.keys(dd.M).forEach(function(k){ M[k] = dd.M[k]; });
  function neu(){ var y = window.scrollY; renderFortschritt(); window.scrollTo(0, y); }
  app.innerHTML =
    topbar(t("tabFortschritt"), { back:"#home", right:kopfSymboleNeu() }) +
    fkZahlenHTML(st.zahlen)+
    (wahl.length ? '<div class="fk-raster">'+wahl.map(function(id){ return fkKachelHTML(id, M); }).join("")+'</div>'
                 : '<div class="card fk-leerseite">'+svgIcon('<path d="M4 4v16h16"/><path d="M8 15l3.5-4.5 3 2.5L20 7"/>')+'<p>'+esc(t("fkLeer"))+'</p></div>')+
    '<button type="button" class="btn btn-secondary fk-hinzu" data-fkhinzu>'+ICON_PLUS+' '+esc(t("fkHinzu"))+'</button>'+
    (wahl.length ? '<p class="tools-hinweis">'+esc(t("fkHinweis"))+'</p>' : '')+
    '<div style="height:90px"></div>';
  var zurueck = app.querySelector(".topbar .back"); if(zurueck) zurueck.classList.add("zeigen");
  bindCommon();
  st.bind(neu); dd.bind(neu);
  app.querySelectorAll("[data-zahl]").forEach(function(b){ b.addEventListener("click", function(){ fkZahlTippen(b.getAttribute("data-zahl"), st, st.zahlen); }); });
  app.querySelector("[data-fkhinzu]").addEventListener("click", function(){ fkWaehlenSheet(); });
  var raster = app.querySelector(".fk-raster");
  if(raster) kachelZiehen(raster, {
    tile:".fk", id:"data-fk",
    speichern:fkSpeichern,
    loeschen:function(id){ fkSpeichern(fkWahl().filter(function(x){ return x !== id; })); neu(); },
    menue:function(el, id){
      openActionSheet(fkName(id), [
        { ico:P_TRASH, label:t("fkEntfernen"), danger:true, fn:function(){ fkSpeichern(fkWahl().filter(function(x){ return x !== id; })); neu(); } }
      ]);
    }
  });
}
/* Auswahlfenster: alle Auswertungen nach Gruppen; Antippen schaltet an oder aus, „Fertig“ zeichnet die Seite neu */
function fkWaehlenSheet(){
  var root = document.getElementById("overlayRoot");
  function zeichnen(){
    var wahl = fkWahl(), alt = root.querySelector(".fk-liste"), oben = alt ? alt.scrollTop : 0;
    root.innerHTML = '<div class="confirm-overlay"><div class="confirm-sheet fk-sheet" role="dialog" aria-label="'+esc(t("fkWaehlen"))+'"><h3>'+esc(t("fkWaehlen"))+'</h3><p>'+esc(t("fkWaehlenText"))+'</p><div class="fk-liste">'+
      FK_GRUPPEN.map(function(g){
        return '<div class="fk-gruppe">'+esc(t("fkG_"+g))+'</div>'+FK_MODULE.filter(function(m){ return m.g === g; }).map(function(m){
          var an = wahl.indexOf(m.id) > -1;
          return '<button type="button" class="fk-zeile'+(an ? ' an' : '')+'" data-fkw="'+esc(m.id)+'" aria-pressed="'+an+'"><span>'+esc(fkName(m.id))+'</span><i aria-hidden="true">'+(an ? '✓' : '+')+'</i></button>';
        }).join("");
      }).join("")+'</div><div class="btn-row"><button class="btn btn-primary" data-ok>'+esc(t("fkFertig"))+'</button></div></div></div>';
    var liste = root.querySelector(".fk-liste"); if(liste) liste.scrollTop = oben;
    root.querySelectorAll("[data-fkw]").forEach(function(b){
      b.addEventListener("click", function(){
        var id = b.getAttribute("data-fkw"), w = fkWahl(), i = w.indexOf(id);
        if(i > -1) w.splice(i, 1); else w.push(id);
        fkSpeichern(w); zeichnen();
      });
    });
    root.querySelector("[data-ok]").addEventListener("click", zu);
    root.querySelector(".confirm-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("confirm-overlay")) zu(); });
  }
  function zu(){ root.innerHTML = ""; renderFortschritt(); }
  zeichnen();
}
