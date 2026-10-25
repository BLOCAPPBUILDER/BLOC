/* BLOC - Programmlogik, Teil 1: Daten-Aliase, Speicher, Sprache, Hilfsfunktionen. Alle Teile (js/*.js) laufen als gewöhnliche Skripte nacheinander im gemeinsamen Gültigkeitsbereich, Reihenfolge siehe index.html. */
"use strict";
/* Inhaltsdaten (Übungen, Workouts, Posen) stehen in daten.js - hier unter den gewohnten Namen */
var BLOC_DATEN = window.BLOC_DATEN;
var BAND_ARTEN = BLOC_DATEN.BAND_ARTEN, BAND_HOEHE = BLOC_DATEN.BAND_HOEHE, BAND_ANKER = BLOC_DATEN.BAND_ANKER, BAND_ANKER_EXTRA = BLOC_DATEN.BAND_ANKER_EXTRA;   // Befestigung des Widerstandsbands
var AUFWAERM_IDS = BLOC_DATEN.AUFWAERM_IDS, AUFWAERM_UEBUNGEN = BLOC_DATEN.AUFWAERM_UEBUNGEN, EX_INT = BLOC_DATEN.EX_INT || {},
    LIB_FOKUS_TAUSCH = BLOC_DATEN.LIB_FOKUS_TAUSCH || {}, LIB_WORKOUT_INFO = BLOC_DATEN.LIB_WORKOUT_INFO || {},
    STUDIO_GRUPPEN = BLOC_DATEN.STUDIO_GRUPPEN || [], STUDIO_ZIEL = BLOC_DATEN.STUDIO_ZIEL || {},
    STUDIO_GERAET = BLOC_DATEN.STUDIO_GERAET || {}, STUDIO_GERAETE = BLOC_DATEN.STUDIO_GERAETE || [];
var EX_ALIAS = BLOC_DATEN.EX_ALIAS, LIB_CATS = BLOC_DATEN.LIB_CATS, EXERCISE_ROWS = BLOC_DATEN.EXERCISE_ROWS,
    LIB_WORKOUT_ROWS = BLOC_DATEN.LIB_WORKOUT_ROWS, EX_LEVEL = BLOC_DATEN.EX_LEVEL, EX_EQUIP = BLOC_DATEN.EX_EQUIP, LZ_KETTEN = BLOC_DATEN.LZ_KETTEN || [], MAIN_CATS = BLOC_DATEN.MAIN_CATS,
    EX_MAIN_ROWS = BLOC_DATEN.EX_MAIN_ROWS, EQUIPS = BLOC_DATEN.EQUIPS, EX_SUCH_ALIAS = BLOC_DATEN.EX_SUCH_ALIAS, Q = BLOC_DATEN.Q,
    qSwap = BLOC_DATEN.qSwap, qMirror = BLOC_DATEN.qMirror, qShift = BLOC_DATEN.qShift, qWith = BLOC_DATEN.qWith, gHand = BLOC_DATEN.gHand,
    gDB = BLOC_DATEN.gDB, gKB = BLOC_DATEN.gKB, gBar = BLOC_DATEN.gBar, gBox = BLOC_DATEN.gBox, gWall = BLOC_DATEN.gWall, gPole = BLOC_DATEN.gPole,
    gBench = BLOC_DATEN.gBench, P_ST = BLOC_DATEN.P_ST, P_STF = BLOC_DATEN.P_STF, P_STH = BLOC_DATEN.P_STH, P_STUP = BLOC_DATEN.P_STUP,
    P_SQ = BLOC_DATEN.P_SQ, P_SQH = BLOC_DATEN.P_SQH, P_DSQ = BLOC_DATEN.P_DSQ, P_JUMP = BLOC_DATEN.P_JUMP, P_JUP = BLOC_DATEN.P_JUP,
    P_PH = BLOC_DATEN.P_PH, P_PL = BLOC_DATEN.P_PL, P_FP = BLOC_DATEN.P_FP, P_LB = BLOC_DATEN.P_LB, P_LBK = BLOC_DATEN.P_LBK, P_LF = BLOC_DATEN.P_LF,
    P_HG = BLOC_DATEN.P_HG, P_Q4 = BLOC_DATEN.P_Q4, P_F = BLOC_DATEN.P_F, P_HANG = BLOC_DATEN.P_HANG, P_PULL = BLOC_DATEN.P_PULL,
    P_L0 = BLOC_DATEN.P_L0, P_L1 = BLOC_DATEN.P_L1, P_WALK1 = BLOC_DATEN.P_WALK1, ILLU_POSES = BLOC_DATEN.ILLU_POSES, P_FLEGS = BLOC_DATEN.P_FLEGS,
    P_HANGS = BLOC_DATEN.P_HANGS, G_ROW = BLOC_DATEN.G_ROW, G_PB = BLOC_DATEN.G_PB, G_SB = BLOC_DATEN.G_SB, G_KB = BLOC_DATEN.G_KB,
    G_PT = BLOC_DATEN.G_PT, G_MONKEY = BLOC_DATEN.G_MONKEY, qScale = BLOC_DATEN.qScale, J_ST = BLOC_DATEN.J_ST, J_SQB = BLOC_DATEN.J_SQB,
    J_SQF = BLOC_DATEN.J_SQF, J_AIR = BLOC_DATEN.J_AIR, J_TUCK = BLOC_DATEN.J_TUCK, B_SQH = BLOC_DATEN.B_SQH, B_PL = BLOC_DATEN.B_PL,
    B_PUL = BLOC_DATEN.B_PUL, BP_HANG = BLOC_DATEN.BP_HANG, BP_PULL = BLOC_DATEN.BP_PULL, jSeq = BLOC_DATEN.jSeq, ILLU_SEQ = BLOC_DATEN.ILLU_SEQ,
    qSide = BLOC_DATEN.qSide, qTwist = BLOC_DATEN.qTwist, gBall = BLOC_DATEN.gBall, RT_SC = BLOC_DATEN.RT_SC, RT_ST = BLOC_DATEN.RT_ST,
    RT_BEINE = BLOC_DATEN.RT_BEINE, RT_FL = BLOC_DATEN.RT_FL, RT_FC = BLOC_DATEN.RT_FC, RT_FR = BLOC_DATEN.RT_FR, RT_FLC = BLOC_DATEN.RT_FLC,
    RT_FRC = BLOC_DATEN.RT_FRC, V_ARCH = BLOC_DATEN.V_ARCH, V_SNOW = BLOC_DATEN.V_SNOW, ILLU_VIEW2 = BLOC_DATEN.ILLU_VIEW2,
    EX_INFO = BLOC_DATEN.EX_INFO, EX_POSTURE = BLOC_DATEN.EX_POSTURE, EX_MUSCLES = BLOC_DATEN.EX_MUSCLES, EX_GRIFF = BLOC_DATEN.EX_GRIFF || {};

/* ============ Storage ============ */
var DB_KEY = "sporttimer-data-v1";

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function defaultDB(){
  return {
    v: DB_VERSION,
    blocks: [],
    workouts: [],
    myWorkouts: [],   // eigene Workouts aus Bibliotheksübungen - getrennt von den Timer-Workouts
    customEx: [],     // selbst angelegte Übungen
    history: [],      // nur Übungen der letzten 14 Tage { at, ex:[ids] } - für „Überrasch mich“
    settings: { theme:"system", sound:true, soundStyle:"klangschale", space:true, vibration:true, keepAwake:true, countIn:true, volume:0.6, voice:true, voiceMix:true }
  };
}
/* Frischer Start (nichts gespeichert, oder „Alles zurücksetzen“): Aussehen „New“ in Dunkel.
   Bestehende Stände und Sicherungen ohne diese Felder bleiben bei defaultDB() = Klassik, damit sich dort nichts verstellt. */
function frischDB(){
  var d = defaultDB();
  if(/[?&]schnelltest\b/.test(location.search)) return d;   // der Schnelltest klickt die klassischen Wege durch
  d.settings.theme = "dark";
  return d;
}
/* Frühere Designs landen beim nächsten Verwandten: System, Hell, Dunkel (Nacht entfällt seit 2026-10-23: gespeicherte Stände wechseln zu Dunkel).
   2026-10-15: C60 (intern "kodak", auch die alten Retro-Namen) entfällt und wird zu Hell. Der einmalige Hinweis darauf ist seit 2026-10-23 entfernt;
   migrateTheme bleibt, damit gespeicherte Stände und Sicherungen mit alten Werten weiter geladen werden. */
/* Weicher Verlauf für die Figuren-Übergänge (js/02-bibliothek.js); stand früher im Walzenzähler-Teil */
function easeInOutCubic(x){ return x<.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }
function migrateTheme(t){
  if(t==="kodak" || t==="retro" || t==="retro-light" || t==="retro-dark") return "light";
  if(t==="tapedeck" || t==="nacht") return "dark";
  if(t==="klar") return "system";
  return t;
}

var ICON_SAVE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
var ICON_TRASH = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>';
var ICON_VOLUME = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16.2 8.8a5 5 0 0 1 0 6.4"/><path d="M19 6a9 9 0 0 1 0 12"/></svg>';
var ICON_DOWNLOAD = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>';
/* Handgezeichnete SVG-Icons statt Unicode-Glyphen: die sitzen unabhängig von
   Schriftart/Plattform immer exakt zentriert und bleiben bei jeder Größe klar erkennbar. */
var ICON_MOON = '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>';
var ICON_PLAY = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 4.3v15.4c0 .8.9 1.3 1.6.9l12-7.7c.6-.4.6-1.4 0-1.8l-12-7.7c-.7-.4-1.6.1-1.6.9z"/></svg>';
var ICON_PAUSE = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><rect x="5.5" y="4.5" width="5" height="15" rx="1.2"/><rect x="13.5" y="4.5" width="5" height="15" rx="1.2"/></svg>';
var ICON_SKIP = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 5.2v13.6c0 .8.9 1.3 1.6.9l9.4-6.8c.6-.4.6-1.3 0-1.8L7.1 4.3c-.7-.4-1.6.1-1.6.9z"/><rect x="17" y="5" width="2.6" height="14" rx="1"/></svg>';
var ICON_RESTART = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
var ICON_SETTINGS = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2.1 2.1 0 1 1-3 3l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2.1 2.1 0 0 1-4.2 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2.1 2.1 0 1 1-3-3l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2.1 2.1 0 0 1 0-4.2h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2.1 2.1 0 1 1 3-3l.1.1a1.7 1.7 0 0 0 1.9.3H9.5a1.7 1.7 0 0 0 1-1.6V3a2.1 2.1 0 0 1 4.2 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2.1 2.1 0 1 1 3 3l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.2.7.8 1.2 1.6 1.2H21a2.1 2.1 0 0 1 0 4.2h-.1a1.7 1.7 0 0 0-1.5 1.6z"/></svg>';
var ICON_BACK = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
var ICON_CHEV = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
var ICON_BOOK = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>';
var ICON_PLUS = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
/* Workout = mehrere gestapelte Blöcke, Block = einzelne Stoppuhr */
var ICON_SHARE = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg>';
var ICON_WORKOUT = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5"/><path d="M3 16.5l9 4.5 9-4.5"/></svg>';
var ICON_BLOCK = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="7.5"/><path d="M12 14v-4"/><path d="M9.5 2.5h5"/><path d="M12 2.5v4"/></svg>';

/* Auswählbare Klänge: jeweils Liste von Tönen {f:Frequenz, d:Verzögerung(ms), dur:Dauer(ms), v:Lautstärke-Faktor, type:Wellenform} */
/* Bausteine für die natürlich klingenden Stile. Teiltöne als [Frequenzverhältnis, Lautstärke,
   Ausklingdauer relativ zur Notenlänge] - echte Glocken und Klangschalen haben unharmonische
   Obertöne, und die hohen klingen schneller aus als der Grundton. */
var SMALL_BELL_PARTIALS = [[1,1,1],[2.76,.45,.5],[5.4,.2,.28]];
var BOWL_PARTIALS = [[1,1,1],[2.71,.5,.6],[5.15,.22,.34],[8.4,.08,.2]];
/* Klangschale: weicher Anschlag, langes Ausklingen mit Schwebung */
function bowlHit(f, d, v, dur, pan){ return { f:f, d:d, v:v, dur:dur, att:18, partials:BOWL_PARTIALS, beat:1.6, pan:pan||0 }; }
/* Einfacher Zufallsgenerator mit festem Startwert: der Applaus klingt lebendig unregelmäßig, aber jedes Mal gleich */
function seededRandom(seed){
  return function(){ seed = (seed*16807) % 2147483647; return seed/2147483647; };
}
var TRIANGLE_PARTIALS = [[1,.45,1],[2.756,.75,.9],[5.404,1,.75],[8.933,.75,.55],[13.34,.5,.42],[18.64,.28,.3]];
/* Triangel: gebogener Stahlstab, sehr hell und lange klingend */
function triangleHit(f, d, v, dur, pan, beat){ return { f:f, d:d, v:v, dur:dur, att:1, partials:TRIANGLE_PARTIALS, strike:.28, beat:(beat==null ? 2.3 : beat), pan:pan||0 }; }
/* Triangel-Wirbel: der Schlegel schlägt schnell zwischen zwei Seiten hin und her, immer kräftiger */
function triangleRoll(){
  var notes = [];
  for(var i=0;i<18;i++) notes.push(triangleHit(640, i*40, .25 + .35*i/17, 420, (i%2 ? -.2 : .2), 0));
  notes.push(triangleHit(640, 760, .8, 3600));
  return notes;
}

var SOUND_STYLES = {
  /* ---- Natürlich: nachgebaute echte Klangquellen ---- */
  klangschale: { label:"Klangschale", natural:true,
    tick:[{ f:1175, d:0, v:.16, dur:600, att:4, partials:SMALL_BELL_PARTIALS }],
    work:[bowlHit(392, 0, .9, 5000)],
    rest:[bowlHit(294, 0, .75, 4500)],
    blockrest:[bowlHit(330, 0, .8, 4500)],
    prep:[bowlHit(330, 0, .8, 4500)],
    done:[bowlHit(392, 0, .8, 5000, -.2), bowlHit(523, 700, .75, 6000, .2)]
  },
  triangel: { label:"Triangel", natural:true,
    tick:[triangleHit(700, 0, .22, 500, 0, 0)],
    work:[triangleHit(640, 0, .9, 3200)],
    rest:[triangleHit(600, 0, .65, 2400)],
    blockrest:[triangleHit(640, 0, .6, 1200, -.15), triangleHit(640, 180, .6, 2600, .15)],
    prep:[triangleHit(640, 0, .6, 1200, -.15), triangleHit(640, 180, .6, 2600, .15)],
    done: triangleRoll()
  },

};
/* Es gibt nur noch Klangschale und Triangel (2026-10-19). Wer einen früheren Klang eingestellt hatte, bekommt die Klangschale;
   nur die ehemals schon auf Triangel verwiesenen Klänge (Xylophon, Glocke …) bleiben bei der Triangel. */
var REMOVED_SOUNDS = { xylophon:"triangel", kuechenwecker:"triangel", marimba:"triangel", kuhglocke:"triangel", glocke:"triangel" };
function migrateSound(key){
  if(SOUND_STYLES[key]) return key;
  return REMOVED_SOUNDS[key] || "klangschale";
}

/* Speicherformat: db.v zählt die Fassung des Formats (1 = bis zur Entfernung von Summit, 3 = ohne Summit).
   Jede Änderung am Format bekommt eine Stufe in dbMigrieren; die läuft beim Laden, beim Import und beim Wiederherstellen des Schnappschusses gleich. */
var DB_VERSION = 3;
var SUMMIT_ARCHIV = "sporttimer-summit-archiv";   // früherer Zwischenspeicher für die Summit-Daten; wird beim Laden gelöscht, falls noch da
function dbMigrieren(db, vonV){
  if(vonV < 3) summitEntfernen(db);
  else { try{ localStorage.removeItem(SUMMIT_ARCHIV); }catch(e){} }   // Geräte, die den Zwischenspeicher schon angelegt hatten
  db.v = DB_VERSION;
}
/* Summit (Challenges) gibt es nicht mehr: alle Daten dazu werden gelöscht (der frühere Zwischenspeicher SUMMIT_ARCHIV ebenfalls). */
function summitEntfernen(db){
  var st = db.settings;
  try{ localStorage.removeItem(SUMMIT_ARCHIV); }catch(e){}
  ["myReps", "myRepUnits", "repBest", "repFilterOpen"].forEach(function(k){ delete st[k]; });
  var summitSchluessel = function(k){ return /^rep:/.test(k); };
  if(Array.isArray(st.favs)) st.favs = st.favs.filter(function(k){ return !summitSchluessel(k); });
  if(st.favUsed) Object.keys(st.favUsed).forEach(function(k){ if(summitSchluessel(k)) delete st.favUsed[k]; });
  if(Array.isArray(st.bereiche)) st.bereiche = st.bereiche.filter(function(k){ return k !== "reps"; });
  if(Array.isArray(st.fokusAus)) st.fokusAus = st.fokusAus.filter(function(k){ return k !== "reps"; });
  if(st.hinweise) delete st.hinweise.reps;
  if(st.tippAus) delete st.tippAus.summit;
  if(st.kalender && Array.isArray(st.kalender.e)) st.kalender.e = st.kalender.e.filter(function(e){ return e && e.art !== "summit"; });
  db.history = (db.history || []).filter(function(e){ return e && e.b !== "reps"; });
  if(st.statW) Object.keys(st.statW).forEach(function(w){ if(st.statW[w] && st.statW[w].a) delete st.statW[w].a.reps; });
}
/* Aus einem gelesenen Stand (localStorage, Sicherungsdatei, Schnappschuss) die Datenbank bauen */
function dbAusRoh(parsed){
  var db = defaultDB();
  db.blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
  db.workouts = Array.isArray(parsed.workouts) ? parsed.workouts : [];
  db.myWorkouts = Array.isArray(parsed.myWorkouts) ? parsed.myWorkouts : [];
  db.customEx = Array.isArray(parsed.customEx) ? parsed.customEx : [];
  db.history = Array.isArray(parsed.history) ? parsed.history : [];
  if(parsed.settings) Object.assign(db.settings, parsed.settings);
  pruneHistory(db);
  if(db.settings.bereicheV !== 3){   // einmalig: der Timer ist wieder ein eigener Bereich - bei bestehender Reihenfolge direkt nach Studio einsortieren, sonst Standard
    /* kein selArr: die Funktion steht erst in 02-bibliothek.js, beim Laden gibt es sie hier noch nicht */
    var br0 = db.settings.bereicheV === 2 && Array.isArray(db.settings.bereiche) ? db.settings.bereiche.slice() : [];
    if(!br0.length) br0 = ["lib", "timer", "intervall", "run", "warm"];
    else if(br0.indexOf("intervall") < 0){ var nach = br0.indexOf("timer") > -1 ? br0.indexOf("timer") : br0.indexOf("lib"); br0.splice(nach + 1, 0, "intervall"); }
    db.settings.bereiche = br0; db.settings.bereicheV = 3;
  }
  if(db.settings.bereicheV !== 4){   // einmalig: Mobility & Stretch ist eine Listenkachel wie die anderen (sortierbar); sie bleibt zunächst direkt unter Workout
    /* kein selArr: die Funktion steht erst in 02-bibliothek.js, beim Laden gibt es sie hier noch nicht */
    var br4 = (Array.isArray(db.settings.bereiche) ? db.settings.bereiche : []).filter(function(k){ return k !== "warm"; }), pos4 = -1;
    br4.forEach(function(k, i){ if(k === "lib" || k === "timer" || k === "katalog") pos4 = i; });
    br4.splice(pos4 + 1, 0, "warm");
    db.settings.bereiche = br4; db.settings.bereicheV = 4;
  }
  db.settings.theme = migrateTheme(db.settings.theme);
  db.settings.soundStyle = migrateSound(db.settings.soundStyle);
  /* Sprachansagen halten auf den meisten Handys Musik anderer Apps (Spotify) an -
     deshalb einmalig aus; wer sie will, schaltet sie bewusst wieder ein */
  if(!db.settings.voiceMix){ db.settings.voice = false; db.settings.voiceMix = true; }
  delete db.settings.lockScreen;   // „Anzeige auf dem Sperrbildschirm“ gibt es nicht mehr
  migrateExIds(db);
  dbMigrieren(db, +parsed.v || 1);
  return db;
}
function loadDB(){
  try{
    var raw = localStorage.getItem(DB_KEY);
    if(!raw) return frischDB();
    return dbAusRoh(JSON.parse(raw));
  }catch(e){
    /* Nicht lesbar: den Rohtext beiseitelegen, bevor der nächste save() ihn überschreibt (nur die erste Rettung bleibt liegen) */
    try{
      var roh0 = localStorage.getItem(DB_KEY);
      if(roh0 && !localStorage.getItem(DB_KEY + "-defekt")){ localStorage.setItem(DB_KEY + "-defekt", roh0); DB_GERETTET = true; }
    }catch(e2){}
    return defaultDB();
  }
}var DB_GERETTET = false;   // true: der gespeicherte Stand war nicht lesbar; der Rohtext liegt unter DB_KEY + "-defekt"

/* Erster Start auf diesem Gerät = noch nichts gespeichert. Nur dann zeigt BLOC die Einführung von selbst;
   wer die App schon eingerichtet hat, findet sie in den Einstellungen. */
var ERSTER_START = (function(){ try{ return !localStorage.getItem(DB_KEY); }catch(e){ return false; } })();
var state = { db: loadDB() };

/* Speichern kann scheitern (Speicher voll, privates Fenster): dann nicht still „gespeichert“ vortäuschen, sondern warnen
   (höchstens alle 30 s, der Lauf schreibt alle paar Sekunden). Gibt true zurück, wenn es geklappt hat. */
var speichernWarnung = 0;
function save(){
  try{ localStorage.setItem(DB_KEY, JSON.stringify(state.db)); return true; }
  catch(e){
    if(Date.now() - speichernWarnung > 30000){
      speichernWarnung = Date.now();
      if(typeof showToast === "function") showToast(t("speichernFehler"));
    }
    return false;
  }
}
var speichereDB = save;   // für Stellen, die ein eigenes lokales save() haben (renderWorkoutEdit)
/* IDs zusammengelegter Übungen (EX_ALIAS) in Favoriten, Ausblendungen, eigenen Workouts und Blöcken umschreiben */
function migrateExIds(db){
  function neu(id){ return EX_ALIAS[id] || id; }
  function uniq(a){ return a.filter(function(x, i){ return a.indexOf(x) === i; }); }
  var st = db.settings;
  if(Array.isArray(st.exFavs)) st.exFavs = uniq(st.exFavs.map(neu));
  if(Array.isArray(st.hiddenLib)) st.hiddenLib = uniq(st.hiddenLib.map(function(k){ return k.indexOf("ex:")===0 ? "ex:"+neu(k.slice(3)) : k; }));
  (db.myWorkouts || []).forEach(function(mw){
    (mw.items || []).forEach(function(it, i){
      if(typeof it === "string") mw.items[i] = neu(it);
      else if(it && it.ex) it.ex = neu(it.ex);
    });
  });
  (db.blocks || []).forEach(function(b){ if(b.ex) b.ex = neu(b.ex); });
}

/* ============ Sprache (Deutsch / Englisch) ============ */
var I18N = window.BLOC_TEXTE;   // Texte stehen in texte.js (ein Schlüssel pro Zeile)
var SOUND_LABELS_EN = {
  klangschale:"Singing bowl", triangel:"Triangle"
};
/* Ohne eigene Einstellung gilt die Sprache des Geräts */
function currentLang(){
  var l = state.db.settings.lang;
  if(l === "de" || l === "en") return l;
  var q = /[?&]lang=(de|en)(?:&|#|$)/.exec(location.search);   // ?lang=de: feste Sprache ohne Einstellung (z. B. für den Schnelltest)
  if(q) return q[1];
  return /^de/i.test(navigator.language || "") ? "de" : "en";
}
function t(key, vars){
  var s = I18N[currentLang()][key];
  if(s == null) s = I18N.de[key];
  if(vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, function(m, k){ return vars[k] != null ? vars[k] : m; });
  return s;
}
function soundLabel(key){
  var st = SOUND_STYLES[key] || SOUND_STYLES.klangschale;
  return (currentLang() === "en" && SOUND_LABELS_EN[key]) || st.label;
}
function applyLang(){ document.documentElement.lang = currentLang(); }

/* ============ Helpers ============ */
/* Millisekunden als Uhrzeit: „1:05“, ab einer Stunde „1:02:05“ (Lauf, Statistik) */
function fmtUhr(ms){
  var s = Math.max(0, Math.floor(ms/1000)), h = Math.floor(s/3600), m = Math.floor(s%3600/60), x = s%60;
  return (h ? h+":"+(m<10?"0":"")+m : m)+":"+(x<10?"0":"")+x;
}
function fmtTime(totalSec){
  totalSec = Math.max(0, Math.round(totalSec));
  var m = Math.floor(totalSec/60), s = totalSec%60;
  return m + ":" + (s<10?"0":"") + s;
}
/* Kurzform für Karten: „12:20 Min“ bricht nicht mehr mit einem einzelnen „Sek“ um (ab einer Stunde wie fmtDuration) */
function fmtDauerKurz(totalSec){
  totalSec = Math.max(0, Math.round(totalSec));
  if(totalSec >= 3600) return fmtDuration(totalSec);
  var s = totalSec%60;
  return Math.floor(totalSec/60) + ":" + (s<10?"0":"") + s + " " + t("unitMin");   // geschütztes Leerzeichen: „12:20 Min“ bricht nie in der Mitte um
}
function fmtDuration(totalSec){
  totalSec = Math.max(0, Math.round(totalSec));
  var h = Math.floor(totalSec/3600), m = Math.floor((totalSec%3600)/60), s = totalSec%60;
  if(h>0) return h+" "+t("unitH")+" " + m + " "+t("unitMin");
  if(m>0) return m + " "+t("unitMin") + (s>0? " "+s+" "+t("unitSec") : "");
  return s + " "+t("unitSec");
}
function blockDuration(b){
  return b.reps * b.workSec + Math.max(0, b.reps-1) * b.restSec;
}
function findBlock(id){
  for(var i=0;i<state.db.blocks.length;i++) if(state.db.blocks[i].id===id) return state.db.blocks[i];
  var zw = (typeof neuEntwurf!=="undefined" && neuEntwurf && neuEntwurf.bloecke) || [];
  for(var j=0;j<zw.length;j++) if(zw[j].id===id) return zw[j];
  return (typeof libBlockCache!=="undefined" && libBlockCache[id]) || null;
}
function findWorkout(id){
  for(var i=0;i<state.db.workouts.length;i++) if(state.db.workouts[i].id===id) return state.db.workouts[i];
  return null;
}
/* Einträge eines Timer-Workouts mit Wiederholungen („3 × Block A, 2 × Block B“): jeder Eintrag steht `times`-mal hintereinander (1 bis 99);
   die „Pause nach dem Block“ gilt auch zwischen den Wiederholungen, nach der letzten Wiederholung des letzten Eintrags gibt es keine. */
function workoutItems(w){
  var out = [];
  (w.items || []).forEach(function(it){
    var n = Math.max(1, Math.min(99, Math.round(+it.times) || 1));
    for(var k = 0; k < n; k++) out.push(it);
  });
  return out;
}
function workoutDuration(w){
  var total = 0, items = workoutItems(w);
  for(var i=0;i<items.length;i++){
    var b = findBlock(items[i].blockId);
    if(!b) continue;
    total += blockDuration(b);
    if(i < items.length-1) total += (items[i].restAfterSec||0);
  }
  return total;
}
function esc(str){
  return String(str==null?"":str).replace(/[&<>"']/g, function(c){
    return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];
  });
}


/* Verlauf-Hilfen: loadDB (oben) ruft pruneHistory schon beim Laden auf. Alles, was dafür gebraucht wird, steht deshalb in diesem ersten Teil -
   in einem späteren Teil wäre es beim Laden noch nicht da, und loadDB würde (wegen try/catch unbemerkt) mit leeren Standarddaten starten. */
/* Achtung: pruneHistory läuft schon in loadDB, also bevor diese Zeile ausgeführt wird - deshalb eine Funktion
   statt einer Variablen (eine var wäre dann noch undefined, und der ganze Verlauf fiele beim Laden weg) */
function histKeepDays(){ return 31; }   // für die Statistik der letzten Wochen; „Überrasch mich“ schaut nur auf wenige Tage zurück
/* Bereich eines Eintrags: b = "lib" (Air) | "intervall" (Timer) | "timer" (Studio) | "warm" (Mobility & Stretch) | "run". Ältere Einträge ohne b werden geschätzt
   (Timer-Workouts und Blöcke, die vor 2026-10-07 gelaufen sind, stehen als Air). */
function bereichVonEintrag(e){ return e.b || (e.studio ? "timer" : (e.ex && e.ex.length ? "lib" : "run")); }
function wocheKey(ts){
  var d = new Date(ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);
}
function pruneHistory(db){
  var since = Date.now() - histKeepDays()*86400000;
  var sw = db.settings && (db.settings.statW || (db.settings.statW = {}));
  if(sw){
    var alt = (db.history || []).filter(function(e){ return e && e.at < since; });
    if(alt.length){
      var woche = function(ts){ var k = wocheKey(ts); return sw[k] || (sw[k] = { bn:0, bs:0, a:{} }); };
      // bn/bs: Besuche aller Bereiche außer Run zusammen; a[bereich]: Besuche je Bereich (Run: jeder Lauf einzeln)
      besuche(alt.filter(function(e){ return bereichVonEintrag(e) !== "run"; })).forEach(function(b){ var w = woche(b.von); w.bn = (w.bn || 0) + 1; w.bs = (w.bs || 0) + b.s; });
      ["lib", "intervall", "timer", "warm", "run"].forEach(function(k){
        var l = alt.filter(function(e){ return bereichVonEintrag(e) === k; });
        (k === "run" ? l.map(function(e){ return besuche([e])[0]; }) : besuche(l)).forEach(function(b){
          var w = woche(b.von), a = w.a[k] || (w.a[k] = { n:0, s:0 }); a.n++; a.s += b.s;
        });
      });
    }
    var keys = Object.keys(sw).sort();
    while(keys.length > 1040) delete sw[keys.shift()];   // gut 20 Jahre; eine Woche ist nur wenige Byte groß
  }
  db.history = (db.history || []).filter(function(e){ return e && e.at >= since; })
    .map(function(e){ var x = { at:e.at, ex:e.ex || [], dur:+e.dur || 0 }; if(e.studio) x.studio = e.studio; if(e.b) x.b = e.b; return x; });
}
function besuchLuecke(){ return 60*60*1000; }   // Funktion statt Variable: loadDB läuft vor dieser Stelle
function eintragSpanne(e){
  var b = bereichVonEintrag(e), d = (+e.dur || 0)*1000;
  return (b === "timer" || b === "run") ? [e.at, e.at + d] : [e.at - d, e.at];
}
function besuche(list){
  var sp = list.map(function(e){ var x = eintragSpanne(e); return { von:x[0], bis:x[1], b:bereichVonEintrag(e) }; }).sort(function(a, b){ return a.von - b.von; }), out = [];
  sp.forEach(function(x){
    var l = out[out.length-1];
    if(l && x.von - l.bis <= besuchLuecke()){ l.bis = Math.max(l.bis, x.bis); l.n++; l.areas[x.b] = true; }
    else { var a = {}; a[x.b] = true; out.push({ von:x.von, bis:x.bis, n:1, areas:a }); }
  });
  out.forEach(function(b){ b.s = Math.max(0, (b.bis - b.von)/1000); });
  return out;
}
