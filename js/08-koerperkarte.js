"use strict";
/* ============ Auswertung: Verteilung auf Muskelgruppen ============
   Aus den Hauptmuskeln (EX_MUSCLES) jeder Übung; Hauptmuskeln zählen voll, Hilfsmuskeln mit 0,35.
   Ohne Muskeldaten entscheidet die Kategorie. Nur Anzeige - bewertet wird nichts, ein Leg Day bleibt ein Leg Day. */
var MUSKEL_GRP = [
  { id:"brust",    key:"mgBrust",   re:/brust/ },
  { id:"ruecken",  key:"mgRuecken", re:/rücken|latissimus|rauten|trapez|nacken/ },
  { id:"schulter", key:"mgSchulter", re:/schulter/ },
  { id:"arme",     key:"mgArme",    re:/bizeps|trizeps|unterarm|griff/ },
  { id:"rumpf",    key:"mgRumpf",   re:/bauch|rumpf|schräg|core/ },
  { id:"beine",    key:"mgBeine",   re:/gesäß|oberschenkel|waden|adduktor|abduktor|hüft|schienbein|fuß|bein/ }
];
var MUSKEL_KAT = { chest:"brust", back:"ruecken", arms:"arme", core:"rumpf", legs:"beine" };
function mgVerteilung(ex){
  var res = {}, m = EX_MUSCLES[ex.id];
  function add(text, w){
    var tr = MUSKEL_GRP.filter(function(g){ return g.re.test(text.toLowerCase()); });
    tr.forEach(function(g){ res[g.id] = (res[g.id] || 0) + w/tr.length; });
  }
  if(m){ add(m[0] || "", 1); if(m[1]) add(m[1], 0.35); }
  if(!Object.keys(res).length){
    ex.cats.forEach(function(c){ if(MUSKEL_KAT[c]) res[MUSKEL_KAT[c]] = 1; });
    if(!Object.keys(res).length && ex.cats.indexOf("cardio") > -1) res.beine = 1;
  }
  return res;
}
/* Thema eines Workouts für die Foto-Wahl (Favoriten): die Muskelgruppe mit dem größten Anteil (ab 30 %, bei Gleichstand feste Rangfolge), sonst „ganz“ (gemischt).
   ids: Übungs-IDs oder Einträge { ex }. Rumpf heißt „core“. */
function workoutThema(ids, name){
  var nm = String(name || "").toLowerCase();   // der Name sagt oft mehr als die Mischung der Muskeln („Brust“, „Rücken Zug“, „Bauch & Core“, „Cardio“)
  if(/cardio|full body|ganzkörper|hiit|conditioning/.test(nm)) return "ganz";
  var NAME = [[/bauch|core|rumpf/, "core"], [/rücken|zug|pull/, "ruecken"], [/brust|push|drück/, "brust"], [/schulter/, "schulter"], [/arm|bizeps|trizeps/, "arme"], [/bein|leg|\bpo\b|gesäß|kniebeug|squat/, "beine"]];
  for(var i = 0; i < NAME.length; i++) if(NAME[i][0].test(nm)) return NAME[i][1];
  var sum = {}, tot = 0;
  (ids || []).forEach(function(x){
    var ex = findExercise(typeof x === "string" ? x : x && x.ex);
    if(!ex || ex.main === "stretch") return;
    var v = mgVerteilung(ex);
    Object.keys(v).forEach(function(g){ sum[g] = (sum[g] || 0) + v[g]; tot += v[g]; });
  });
  if(!tot) return "ganz";
  var mx = 0, best = "";
  Object.keys(sum).forEach(function(g){ if(sum[g] > mx) mx = sum[g]; });
  ["beine", "ruecken", "brust", "rumpf", "schulter", "arme"].forEach(function(g){ if(!best && (sum[g] || 0) >= mx*0.9) best = g; });   // fast gleichauf: feste Rangfolge
  return mx/tot < 0.3 ? "ganz" : (best === "rumpf" ? "core" : best);
}
function mgProzent(ids){   // Zeilen in fester Reihenfolge, Summe 100 (größter Rest)
  var sum = {}, tot = 0;
  ids.forEach(function(id){
    var ex = findExercise(id);
    if(!ex || ex.main === "stretch") return;
    var v = mgVerteilung(ex);
    Object.keys(v).forEach(function(g){ sum[g] = (sum[g] || 0) + v[g]; tot += v[g]; });
  });
  var rows = MUSKEL_GRP.map(function(g){ var raw = tot ? (sum[g.id] || 0)*100/tot : 0; return { g:g.id, key:g.key, pct:Math.floor(raw), rest:raw - Math.floor(raw) }; });
  var diff = tot ? 100 - rows.reduce(function(a, r){ return a + r.pct; }, 0) : 0;
  rows.slice().sort(function(a, b){ return b.rest - a.rest; }).slice(0, diff).forEach(function(r){ r.pct++; });
  return { rows:rows, leer:!tot };
}
/* ============ Körperkarte ============
   Zwei Silhouetten (vorn, hinten), wahlweise einfach (10 Zonen) oder mit Detailansicht (21 Zonen, größer dargestellt); gespeichert in settings.kkFein, überall gleich.
   Gerechnet wird immer fein (KK_REGELN über die Muskelnamen in EX_MUSCLES); die einfache Ansicht fasst die feinen Zonen zusammen (KK_F2G).
   Verwendet in der Übungsinfo (trainiert / unterstützt), im Kopf und in der Auswertung eines Workouts (Summe: je öfter, desto kräftiger)
   und als Filter in Air, Studio, Baukasten, Suche und Mobility & Stretch (Zonen antippen). Die Balken der Auswertung bleiben bei den sechs groben Gruppen (MUSKEL_GRP). */
var KK_ZONEN_G = {
  vorn:   { schulter:[[21,32,18,13,6],[61,32,18,13,6]], brust:[[39,34,22,21,8]],
            arme:[[13,45,10,29,5],[77,45,10,29,5],[11,76,9,27,4.5],[80,76,9,27,4.5]],
            rumpf:[[36,57,28,31,9],[40,88,20,8,4]], quad:[[35,99,14,44,6],[51,99,14,44,6]],
            waden:[[37,147,12,44,5],[51,147,12,44,5]] },
  hinten: { schulter:[[21,32,18,13,6],[61,32,18,13,6]], ruecken:[[35,31,30,34,9]], ruecken_u:[[40,67,20,20,7]],
            arme:[[13,45,10,29,5],[77,45,10,29,5],[11,76,9,27,4.5],[80,76,9,27,4.5]],
            gesaess:[[34,89,16,18,7],[50,89,16,18,7]],
            hamstring:[[35,108,14,38,6],[51,108,14,38,6]], waden:[[37,148,12,43,5],[51,148,12,43,5]] }
};
var KK_ZONEN_F = {
  vorn:   { schulter_v:[[29,32,10,13,5],[61,32,10,13,5]], schulter_s:[[21,32,8,13,5],[71,32,8,13,5]],
            brust_o:[[39,34,22,9,5]], brust:[[39,43,22,12,6]],
            bizeps:[[13,45,10,29,5],[77,45,10,29,5]], unterarm:[[11,76,9,27,4.5],[80,76,9,27,4.5]],
            bauch:[[43,57,14,29,6]], schraeg:[[35.5,57,6.5,29,3],[58,57,6.5,29,3]], huefte:[[40,88,20,8,4]],
            abduktor:[[32,90,4.5,13,2.2],[63.5,90,4.5,13,2.2]], quad:[[36,99,9.5,44,5],[54.5,99,9.5,44,5]],
            adduktor:[[45.8,99,3.8,32,1.9],[50.4,99,3.8,32,1.9]], waden:[[38,147,10,44,5],[52,147,10,44,5]] },
  hinten: { schulter_s:[[21,32,7,13,5],[72,32,7,13,5]], schulter_h:[[28,32,11,13,5],[61,32,11,13,5]],
            trapez_o:[[39,29,22,10,6]], rauten:[[41,40,18,16,5]], lat:[[33,47,9,23,4.5],[58,47,9,23,4.5]],
            ruecken_u:[[42,68,16,19,6]], trizeps:[[13,45,10,29,5],[77,45,10,29,5]], unterarm:[[11,76,9,27,4.5],[80,76,9,27,4.5]],
            gesaess:[[37,89,13,17,7],[50,89,13,17,7]], abduktor:[[32,90,4.5,13,2.2],[63.5,90,4.5,13,2.2]],
            hamstring:[[36,108,12,38,6],[52,108,12,38,6]], waden:[[38,148,10,43,5],[52,148,10,43,5]] }
};
/* Reihenfolge der Chips; wichtig = taucht in „Noch nicht dabei“ auf (kleine Hilfsmuskeln nicht) */
var KK_REIHE_G = ["schulter", "brust", "arme", "ruecken", "ruecken_u", "rumpf", "gesaess", "quad", "hamstring", "waden"];
var KK_REIHE_F = ["schulter_v", "schulter_s", "schulter_h", "brust_o", "brust", "bizeps", "trizeps", "unterarm", "trapez_o", "rauten", "lat", "ruecken_u",
                  "bauch", "schraeg", "huefte", "gesaess", "abduktor", "adduktor", "quad", "hamstring", "waden"];
var KK_WICHTIG_G = { schulter:1, brust:1, arme:1, ruecken:1, ruecken_u:1, rumpf:1, gesaess:1, quad:1, hamstring:1, waden:1 };
var KK_WICHTIG_F = { schulter_v:1, schulter_s:1, schulter_h:1, brust:1, bizeps:1, trizeps:1, rauten:1, lat:1, ruecken_u:1, bauch:1, schraeg:1, gesaess:1, quad:1, hamstring:1, waden:1 };
/* feine Zone -> grobe Zone und zurück */
var KK_F2G = { schulter_v:"schulter", schulter_s:"schulter", schulter_h:"schulter", brust_o:"brust", bizeps:"arme", trizeps:"arme", unterarm:"arme",
               trapez_o:"ruecken", rauten:"ruecken", lat:"ruecken", bauch:"rumpf", schraeg:"rumpf", huefte:"rumpf", abduktor:"gesaess", adduktor:"quad" };
var KK_G2F = { schulter:["schulter_v", "schulter_s", "schulter_h"], brust:["brust_o", "brust"], arme:["bizeps", "trizeps", "unterarm"], ruecken:["trapez_o", "rauten", "lat"],
               rumpf:["bauch", "schraeg", "huefte"], gesaess:["gesaess", "abduktor"], quad:["quad", "adduktor"] };
function kkFeinAn(){ return !!state.db.settings.kkFein; }
function kkReihe(){ return kkFeinAn() ? KK_REIHE_F : KK_REIHE_G; }
function kkKarte(){ return kkFeinAn() ? KK_ZONEN_F : KK_ZONEN_G; }
function kkWichtig(z){ return !!(kkFeinAn() ? KK_WICHTIG_F : KK_WICHTIG_G)[z]; }
var KK_SCHULTER = ["schulter_v", "schulter_s"];   // „Schultern“ ohne Zusatz: Drücken und Heben = vorn und seitlich
/* Muskelname (kleingeschrieben) -> feine Zonen; die erste passende Regel gilt, mehrere Zonen teilen sich das Gewicht.
   „§S“ = allgemeine Schultern: bei Ausnahmen (KK_AUSNAHME) werden die Zonen der Übung genommen, sonst KK_SCHULTER */
var KK_REGELN = [
  [/^(ausdauer|gleichgewicht|beweglichkeit|–|-)$/, []],
  [/oberschenkel vorn und hinten/, ["quad", "hamstring"]],
  [/tiefe und schräge bauch/, ["bauch", "schraeg"]],
  [/schräg|sägemuskel/, ["schraeg"]],
  [/seitliche und hintere schulter/, ["schulter_s", "schulter_h"]],
  [/rotatorenmanschette/, ["schulter_h"]],
  [/hüftrotatoren|piriformis/, ["gesaess"]],
  [/hüftstabilisatoren|seitliche[rs]? gesäß|abduktoren|oberschenkel außen/, ["abduktor"]],
  [/adduktoren|innenschenkel/, ["adduktor"]],
  [/gesäß/, ["gesaess"]],
  [/hüftbeuger|^hüfte$/, ["huefte"]],
  [/oberschenkel vorn/, ["quad"]],
  [/oberschenkel hinten/, ["hamstring"]],
  [/oberschenkel/, ["quad", "hamstring"]],
  [/waden|achilles|fuß|schollen|schienbein/, ["waden"]],
  [/^beine$/, ["quad", "hamstring", "gesaess", "waden"]],
  [/wirbelsäule|rückenstrecker|unterer rücken/, ["ruecken_u"]],
  [/breiter rückenmuskel|latissimus/, ["lat"]],
  [/oberer trapez|nacken/, ["trapez_o"]],
  [/mittlerer trapez|unterer trapez|rauten|mittlerer rücken|schulterblatt/, ["rauten"]],
  [/trapez|oberer rücken/, ["trapez_o", "rauten"]],
  [/^rücken$/, ["trapez_o", "rauten", "lat", "ruecken_u"]],
  [/vordere schulter/, ["schulter_v"]],
  [/seitliche schulter/, ["schulter_s"]],
  [/hintere schulter/, ["schulter_h"]],
  [/schulterstabilität|schulterbeweglichkeit/, ["schulter_v", "schulter_s", "schulter_h"]],
  [/schnellkraft/, ["schulter_v", "schulter_s"]],
  [/armschwung/, ["schulter_s"]],
  [/schulter/, ["§S"]],
  [/obere brust/, ["brust_o"]],
  [/brust/, ["brust"]],
  [/trizeps/, ["trizeps"]],
  [/bizeps|oberarmmuskel/, ["bizeps"]],
  [/unterarm/, ["unterarm"]],
  [/gerader bauch|tiefe bauch|^bauch$/, ["bauch"]],
  [/rumpf|bauch/, ["bauch", "schraeg"]]
];
/* Übungen, bei denen „Schultern“ etwas Bestimmtes meint */
var KK_AUSNAHME = {
  "swimmers":["schulter_h"], "mountain-climbers":["schulter_v"], "bear-crawl":["schulter_v"], "plank-steps":["schulter_v"], "plank-shoulder-taps":["schulter_v"],
  "burpees":["schulter_v"], "jump-forward-burpees":["schulter_v"], "muscle-ups":["schulter_v", "schulter_h"], "skin-the-cat":["schulter_v", "schulter_h"],
  "archer-push-ups":["schulter_v"], "kb-clean":["schulter_v", "schulter_s"], "jumping-jacks":["schulter_s"],
  "childs-pose":["schulter_h"], "downward-dog":["schulter_h"]   // gedehnt wird die hintere Schulter (Arme über Kopf), nicht vorn/seitlich
};
/* gespeicherte Auswahl (egal ob grob oder fein, auch ältere Namen) in die Zonen der gewählten Ansicht übersetzen; Unbekanntes fällt weg */
var KK_ALT = { trapez:["trapez_o", "rauten"], beine:["quad", "hamstring", "gesaess", "waden"] };
function kkNorm(zonen){
  var out = [], fein = kkFeinAn(), reihe = kkReihe();
  selArr(zonen).forEach(function(z){
    (KK_ALT[z] || [z]).forEach(function(x){
      (fein ? (KK_G2F[x] || [x]) : [KK_F2G[x] || x]).forEach(function(y){ if(reihe.indexOf(y) > -1 && out.indexOf(y) < 0) out.push(y); });
    });
  });
  return out;
}
function kkName(zone){ return t("kkZ_"+zone); }
/* feine Werte in die gewählte Ansicht übertragen (grob: je Gruppe addiert) */
function kkAgg(m){
  if(kkFeinAn()) return m;
  var o = {};
  Object.keys(m).forEach(function(z){ var g = KK_F2G[z] || z; o[g] = (o[g] || 0) + m[z]; });
  return o;
}
/* Zonen eines Muskeltextes („Oberschenkel vorn, Gesäß“); gew = Gewicht je Muskelname; unb sammelt Namen ohne Regel;
   schulter = Zonen für allgemeine „Schultern“ (aus KK_AUSNAHME) */
function kkZonenVon(text, gew, unb, schulter){
  var res = {};
  String(text || "").toLowerCase().split(/,\s*/).forEach(function(teil){
    teil = teil.trim();
    if(!teil) return;
    for(var i = 0; i < KK_REGELN.length; i++){
      if(KK_REGELN[i][0].test(teil)){
        var z = KK_REGELN[i][1];
        if(z[0] === "§S") z = schulter || KK_SCHULTER;
        z.forEach(function(x){ res[x] = (res[x] || 0) + gew/z.length; });
        return;
      }
    }
    if(unb) unb.push(teil);
  });
  return res;
}
var KK_GRUPPE_ZONEN = { brust:["brust_o", "brust"], ruecken:["trapez_o", "rauten", "lat", "ruecken_u"], schulter:["schulter_v", "schulter_s"], arme:["bizeps", "trizeps", "unterarm"], rumpf:["bauch", "schraeg"], beine:["quad", "hamstring", "gesaess", "waden"] };
/* „Core“ im Muskel-Filter ist der Oberbegriff für „Bauch & Rumpf“ und „Beine & Po“ (der Übergang ist fließend); beide bleiben einzeln wählbar */
KK_GRUPPE_ZONEN.core = KK_GRUPPE_ZONEN.rumpf.concat(KK_GRUPPE_ZONEN.beine);
/* Haupt- und Hilfszonen (fein) einer Übung; ohne Muskeltext entscheidet die grobe Gruppe (Kategorie) */
function kkFein(ex){
  var m = EX_MUSCLES[ex.id], haupt = {}, hilfe = {}, sch = KK_AUSNAHME[ex.id];
  if(m){ haupt = kkZonenVon(m[0], 1, null, sch); hilfe = kkZonenVon(m[1], .35, null, sch); }
  if(!Object.keys(haupt).length){
    Object.keys(mgVerteilung(ex)).forEach(function(g){
      var z = KK_GRUPPE_ZONEN[g] || [];
      z.forEach(function(x){ haupt[x] = (haupt[x] || 0) + 1/z.length; });
    });
  }
  return { haupt:haupt, hilfe:hilfe };
}
/* Muskelnamen in EX_MUSCLES, für die keine Regel passt (der Schnelltest prüft, dass es keine gibt) */
function kkUnbekannt(){
  var unb = [];
  Object.keys(EX_MUSCLES).forEach(function(id){ kkZonenVon(EX_MUSCLES[id][0], 1, unb); kkZonenVon(EX_MUSCLES[id][1], 1, unb); });
  return unb;
}
/* wert: { zone: 0..1 } (Anteil der Akzentfarbe); opt.sel: gewählte Zonen; opt.attr: z. B. "data-lfzone" macht die Zonen antippbar */
function koerperSVG(seite, wert, opt){
  opt = opt || {}; wert = wert || {};
  var karte = kkKarte(), sel = selArr(opt.sel), s = '<svg class="kk" viewBox="0 0 100 200" role="img" aria-label="'+esc(t(seite === "vorn" ? "kkVorn" : "kkHinten"))+'">'+
    '<circle class="hd" cx="50" cy="14" r="10"/><rect class="hd" x="45" y="23" width="10" height="8" rx="3"/>';
  Object.keys(karte[seite]).forEach(function(z){
    var v = Math.max(0, Math.min(1, wert[z] || 0)), an = sel.indexOf(z) > -1;
    s += '<g class="z'+(v ? ' an' : '')+(an ? ' sel' : '')+'" style="--p:'+Math.round(v*100)+'%"'+(opt.attr ? ' '+opt.attr+'="'+z+'" role="button" tabindex="0" aria-pressed="'+an+'" aria-label="'+esc(kkName(z))+'"' : '')+'>'+
      karte[seite][z].map(function(r){ return '<rect x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'" rx="'+r[4]+'"/>'; }).join("")+'</g>';
  });
  return s+'</svg>';
}
function koerperPaar(wert, opt){
  return '<div class="kk-paar'+(kkFeinAn() ? ' fein' : '')+'"><figure>'+koerperSVG("vorn", wert, opt)+'<figcaption>'+esc(t("kkVorn"))+'</figcaption></figure>'+
    '<figure>'+koerperSVG("hinten", wert, opt)+'<figcaption>'+esc(t("kkHinten"))+'</figcaption></figure></div>';
}
/* Schalter „Detailansicht“ (aus = 10 Zonen, an = 21 Zonen); gilt überall, ex = Übung, wenn er in einer Übungsinfo steht.
   data-kkmodus nennt den Modus, in den der Tipp wechselt */
function kkModusHTML(ex){
  var an = kkFeinAn();
  return '<div class="kk-modus"'+(ex ? ' data-kkex="'+esc(ex.id)+'"' : '')+'>'+
    '<button type="button" role="switch" aria-checked="'+an+'" data-kkmodus="'+(an ? "grob" : "fein")+'" class="'+(an ? 'on' : '')+'"><i class="kk-sw" aria-hidden="true"></i>'+esc(t("kkDetail"))+'</button></div>';
}
/* Hauptzonen und unterstützende Zonen einer Übung als Mengen (in der gewählten Ansicht) */
function kkTeile(ex){
  var f = kkFein(ex), h = kkAgg(f.haupt), l = kkAgg(f.hilfe), haupt = {}, hilfe = {};
  Object.keys(h).forEach(function(z){ if(h[z] > 0) haupt[z] = 1; });
  Object.keys(l).forEach(function(z){ if(l[z] > 0 && !haupt[z]) hilfe[z] = 1; });
  return { haupt:haupt, hilfe:hilfe };
}
/* Übungsinfo: wie oft diese Übung in den letzten 30 Tagen im Training vorkam und wann zuletzt (nur Anzeige; der Verlauf hält 31 Tage einzeln) */
function exHistorieHTML(id){
  var jetzt = Date.now(), tag = 86400000, n = 0, letzte = 0;
  (state.db.history || []).forEach(function(e){
    if(e && e.ex && e.ex.indexOf(id) > -1 && e.at >= jetzt - 30*tag){ n++; if(e.at > letzte) letzte = e.at; }
  });
  if(!n) return "";
  var d0 = new Date(jetzt); d0.setHours(0, 0, 0, 0);
  var d1 = new Date(letzte); d1.setHours(0, 0, 0, 0);
  var vor = Math.round((d0.getTime() - d1.getTime())/tag);
  return '<div class="info-historie">'+esc(t("exHistorie", { n:n, z:vor === 0 ? t("exHeute") : vor === 1 ? t("exGestern") : t("exVor", { n:vor }) }))+'</div>';
}
/* Übungsinfo: kleine Silhouetten; antippen vergrößert sie und nennt die Zonen beim Namen (kkInfoBinden) */
function kkInfoHTML(ex){
  var tl = kkTeile(ex), w = {}, dehn = !!(ex.cats && ex.cats.indexOf("stretch") > -1);   // Dehnübungen: „Dehnt“ / „Dehnt auch“ statt „Trainiert“ / „Unterstützend“
  Object.keys(tl.hilfe).forEach(function(z){ w[z] = .38; });
  Object.keys(tl.haupt).forEach(function(z){ w[z] = 1; });
  function namen(m){ return kkReihe().filter(function(z){ return m[z]; }).map(kkName).join(", "); }
  return '<button type="button" class="info-kk-knopf'+(kkFeinAn() ? ' fein' : '')+'" data-kkgross aria-expanded="false" aria-label="'+esc(t("kkGross"))+'">'+koerperPaar(w)+'</button>'+
    '<div class="info-kk-liste" hidden><div><span class="kk-punkt haupt"></span><b>'+esc(t(dehn ? "musStretched" : "kkTrainiert"))+':</b> '+esc(namen(tl.haupt))+'</div>'+
    (Object.keys(tl.hilfe).length ? '<div><span class="kk-punkt hilfe"></span><b>'+esc(t(dehn ? "musAlsoStretched" : "musAssist"))+':</b> '+esc(namen(tl.hilfe))+'</div>' : '')+'</div>'+
    kkModusHTML(ex)+exHistorieHTML(ex.id);
}
/* Ein Tipp auf die kleinen Silhouetten vergrößert sie und zeigt die Zonen mit Namen (gilt für alle Übungsinfos, auch im Studio) */
document.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("[data-kkgross]");
  if(!b) return;
  var box = b.closest(".info-mus"), auf = !box.classList.contains("gross");
  box.classList.toggle("gross", auf);
  b.setAttribute("aria-expanded", String(auf));
  box.querySelector(".info-kk-liste").hidden = !auf;
});
/* Detailansicht umschalten: gilt für die ganze App; eine offene Übungsinfo wird an Ort und Stelle neu gezeichnet, sonst die Seite */
document.addEventListener("click", function(e){
  var b = e.target.closest && e.target.closest("[data-kkmodus]");
  if(!b) return;
  var fein = b.getAttribute("data-kkmodus") === "fein";
  if(fein === kkFeinAn()) return;
  state.db.settings.kkFein = fein; save();
  var box = b.closest(".info-mus"), id = b.parentNode.getAttribute("data-kkex"), ex = id && findExercise(id);
  if(box && ex){
    var gross = box.classList.contains("gross");
    ["info-kk-knopf", "info-kk-liste", "kk-modus", "info-historie"].forEach(function(c){ var el = box.querySelector("."+c); if(el) el.parentNode.removeChild(el); });
    box.insertAdjacentHTML("beforeend", kkInfoHTML(ex));
    if(gross){ box.querySelector(".info-kk-knopf").setAttribute("aria-expanded", "true"); box.querySelector(".info-kk-liste").hidden = false; }
    return;
  }
  var y = window.scrollY; render(); window.scrollTo(0, y);
});
/* Summe über mehrere Übungen: Hauptmuskeln zählen voll, Hilfsmuskeln mit 0,35 (wie die Auswertung); je höher die Summe, desto kräftiger.
   Dehnübungen zählen nur, wenn auchDehnen gesetzt ist (Mobility & Stretch) */
function kkSumme(ids, auchDehnen){
  var sum = {};
  ids.forEach(function(id){
    var ex = findExercise(id);
    if(!ex || (ex.main === "stretch" && !auchDehnen)) return;
    var f = kkFein(ex);
    Object.keys(f.haupt).forEach(function(z){ sum[z] = (sum[z] || 0) + f.haupt[z]; });
    Object.keys(f.hilfe).forEach(function(z){ sum[z] = (sum[z] || 0) + f.hilfe[z]; });
  });
  return kkAgg(sum);
}
function kkStufe(summe){ return 1 - Math.pow(.55, summe || 0); }
function kkSummeHTML(ids){
  var sum = kkSumme(ids), w = {}, leer = [];
  kkReihe().forEach(function(z){ w[z] = kkStufe(sum[z]); if(kkWichtig(z) && (sum[z] || 0) < .3) leer.push(kkName(z)); });
  return '<div class="kk-summe">'+kkModusHTML()+koerperPaar(w)+'<p class="kk-note">'+esc(leer.length ? t("kkLuecken", { n:leer.join(", ") }) : t("kkAlle"))+'</p></div>';
}
/* Ganz kleine Körperfigur (vorn und hinten) für Workout-Karten im Katalog: nur die Silhouetten mit den trainierten Zonen, ohne Text. exs = Übungen (Objekte) */
function kkMiniHTML(exs){
  var ids = (exs || []).map(function(ex){ return ex && ex.id; }).filter(Boolean), sum = kkSumme(ids, true), w = {}, an = false;
  kkReihe().forEach(function(z){ w[z] = kkStufe(sum[z]); if(sum[z]) an = true; });
  return an ? '<span class="kk-mini" aria-hidden="true">'+koerperPaar(w)+'</span>' : '';
}
/* Kompakte Körperkarte für den Kopf eines Workouts (Deckblatt, Baukasten): Silhouetten plus drei Zeilen - viel trainiert, nur am Rande, Lücken */
function kkKopfHTML(ids, auchDehnen, opt){   // opt.ohneModus: ohne Schalter „Detailansicht“ (mehrere Karten untereinander, der Schalter steht dann einmal oben)
  var sum = kkSumme(ids, auchDehnen), w = {}, viel = [], rand = [], leer = [], max = 0, reihe = kkReihe();
  reihe.forEach(function(z){ max = Math.max(max, sum[z] || 0); });
  if(!max) return "";
  var schwelle = Math.max(1.8, max*.7);
  reihe.forEach(function(z){
    var v = sum[z] || 0;
    w[z] = kkStufe(v);
    if(v >= schwelle) viel.push(z); else if(v < .3){ if(kkWichtig(z)) leer.push(z); } else if(v < 1) rand.push(z);
  });
  function zeile(kl, key, zonen){ return zonen.length ? '<div class="kk-zeile '+kl+'"><b>'+esc(t(key))+'</b> '+esc(zonen.map(kkName).join(", "))+'</div>' : ''; }
  return '<div class="kk-kopf">'+koerperPaar(w)+'<div class="kk-kopf-txt">'+
    zeile("viel", "kkViel", viel)+zeile("rand", "kkRand", rand)+
    (leer.length ? zeile("luecke", "kkLueckeKurz", leer) : '<div class="kk-zeile ok">'+esc(t("kkKeineLuecke"))+'</div>')+
    (opt && opt.ohneModus ? '' : kkModusHTML())+'</div></div>';
}
/* Filter: Zonen antippen (mehrere möglich) */
function zonePasst(ex, zonen){
  zonen = kkNorm(zonen);
  if(!zonen.length) return true;
  if(!ex) return false;
  var h = kkTeile(ex).haupt;
  return zonen.some(function(z){ return h[z]; });
}
function kkFilterHTML(attr, sel){
  sel = kkNorm(sel);
  var w = {};
  sel.forEach(function(z){ w[z] = 1; });
  /* Aufgeräumt: Überschrift mit dem Schalter Detailansicht in einer Zeile, darunter die Silhouetten; die Zonen stehen als Liste (zugeklappt) zur Wahl,
     eine Zeile darunter zeigt die Auswahl bzw. den Hinweis */
  var auf = !!state.db.settings.kkListeAuf;
  return '<div class="af-lbl kk-lblzeile"><span>'+esc(t("kkFilter"))+'</span>'+kkModusHTML()+'</div>'+
    '<div class="kk-filter">'+koerperPaar(w, { sel:sel, attr:attr })+'</div>'+
    '<div class="kk-hinweis'+(sel.length ? ' an' : '')+'">'+esc(sel.length ? sel.map(kkName).join(", ") : t("kkTippen"))+'</div>'+
    '<details class="kk-liste-box"'+(auf ? ' open' : '')+'><summary data-kklistetoggle>'+esc(t("kkListe"))+'<span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
    '<div class="fc-chips kk-chips">'+kkReihe().map(function(z){ return filterChip(attr, z, sel.indexOf(z) > -1, "", kkName(z)); }).join("")+'</div></details>';
}
/* Muskel: Gruppen-Chips und Körperfigur sind eine Auswahl. Ein Chip (Brust, Rücken …) wählt alle Zonen seiner Gruppe, die Figur leuchtet entsprechend;
   umgekehrt leuchtet ein Chip, sobald alle Zonen seiner Gruppe gewählt sind. Gespeichert werden nur Zonen (attrZone), die Chips (attrGrp) rechnen darauf um.
   opt.extra: weitere Chips (Cardio, Eigene), opt.glow: orangenes Leuchten hinter der Figur (Cardio & Ausdauer, kein einzelner Muskel). */
function kkGrpZonen(grp){ return kkNorm(KK_GRUPPE_ZONEN[grp] || []); }
function kkGrpAn(sel, grp){ var z = kkGrpZonen(grp); return z.length > 0 && z.every(function(x){ return sel.indexOf(x) > -1; }); }
function kkGrpToggle(sel, grp){
  sel = kkNorm(sel);
  var z = kkGrpZonen(grp);
  return kkGrpAn(sel, grp) ? sel.filter(function(x){ return z.indexOf(x) < 0; }) : sel.concat(z.filter(function(x){ return sel.indexOf(x) < 0; }));
}
function kkMuskelHTML(attrZone, attrGrp, sel, opt){
  opt = opt || {};
  sel = kkNorm(sel);
  var w = {};
  sel.forEach(function(z){ w[z] = 1; });
  var chips = MUSKEL_GRP.map(function(g){
    return (g.id === "rumpf" ? filterChip(attrGrp, "core", kkGrpAn(sel, "core"), svgIcon(CAT_ICON.core), t("mgCore")) : "")+
      filterChip(attrGrp, g.id, kkGrpAn(sel, g.id), svgIcon(STUDIO_GRUPPEN_ICON[g.id] || CAT_ICON.weight), t(g.key));
  }).join("")+(opt.extra || "");
  var auf = !!state.db.settings.kkListeAuf;
  return '<div class="af-lbl kk-lblzeile'+(opt.ohneLabel ? ' kk-nur-schalter' : '')+'">'+(opt.ohneLabel ? '' : '<span>'+esc(t("kkMuskel"))+'</span>')+kkModusHTML()+'</div>'+
    '<div class="fc-chips kk-grp-chips">'+chips+'</div>'+
    '<div class="kk-filter'+(opt.glow ? ' kk-glow' : '')+'">'+koerperPaar(w, { sel:sel, attr:attrZone })+'</div>'+
    '<div class="kk-hinweis'+(sel.length ? ' an' : '')+'">'+esc(sel.length ? sel.map(kkName).join(", ") : t("kkTippen"))+'</div>'+
    ('<details class="kk-liste-box"'+(auf ? ' open' : '')+'><summary data-kklistetoggle>'+esc(t("kkListe"))+'<span class="tpl-chev" aria-hidden="true">&#9662;</span></summary>'+
      '<div class="fc-chips kk-chips">'+kkReihe().map(function(z){ return filterChip(attrZone, z, sel.indexOf(z) > -1, "", kkName(z)); }).join("")+'</div></details>');
}
/* Zonenliste im Filter auf/zu (der Zustand wird gemerkt, weil der Filter nach jedem Antippen neu gezeichnet wird) */
document.addEventListener("click", function(e){
  var sm = e.target.closest && e.target.closest("[data-kklistetoggle]");
  if(!sm) return;
  e.preventDefault();
  var d = sm.parentNode; d.open = !d.open;
  state.db.settings.kkListeAuf = d.open; save();
});
function auswertungHTML(ids, opt){
  opt = opt || {};
  var r = mgProzent(ids), notiz;
  if(r.leer) notiz = t("ausEmpty");
  else if(opt.gesamt || opt.woche){
    var wenig = r.rows.filter(function(x){ return x.pct < 8; }).map(function(x){ return t(x.key); });
    notiz = wenig.length ? t(opt.woche ? "ausWoNote" : "ausAllNote", { n:wenig.join(", ") }) : t(opt.woche ? "ausWoOk" : "ausAllOk");
  } else notiz = t("ausNote");
  return '<details class="ausw card"'+(opt.offen ? ' open' : '')+'><summary><span class="ausw-t">'+esc(opt.titel || t("ausTitle"))+'</span><span class="ausw-s">'+esc(opt.sub || t("ausSum"))+'</span></summary>'+
    (r.leer ? '' : kkSummeHTML(ids))+
    (r.leer ? '' : r.rows.map(function(x){
      return '<div class="ausw-row'+(x.pct ? '' : ' null')+'"><span class="ausw-n">'+esc(t(x.key))+'</span>'+
        '<span class="ausw-bar"><i style="width:'+x.pct+'%"></i></span><b>'+x.pct+'%</b></div>';
    }).join(""))+
    '<div class="ausw-note">'+esc(notiz)+'</div></details>';
}
