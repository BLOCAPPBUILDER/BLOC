"use strict";
/* ============ Plan-Assistent (Workout-Builder › „Trainingsplan erstellen lassen“) ============
   Ein paar Fragen (Ziel, Zeit, Ort, Einschränkungen …) und BLOC baut daraus eigene BLOCs und einen Trainingsplan (settings.programme) und legt ihn in den Kalender.
   Läuft als Fenster über dem Baukasten (kein eigener Bereich), jederzeit abbrechbar; später lässt sich der Plan über langes Drücken auf der Plankarte anpassen
   (Assistent mit den gespeicherten Antworten, p.assi). Alles lokal, nichts wird geladen oder gesendet.
   Aufbau eines erzeugten Plans: p = { id, name, items:[„plan:ID“ | „run“ je Trainingstag], tage, wochen, wp:[{ tag, i, art?, name? }] (Wochenplan für den Kalender),
   assi:{ Antworten }, info:Text, gen:true }; die BLOCs (settings.stPlaene) tragen gen:Plan-ID. Sätze, Wiederholungen und Pause je Übung stehen wie überall in
   settings.studio[id] (nur gesetzt, wo noch nichts eingestellt ist). Die Regeln stehen in PA_REGELN (Zahlen), den Listen (Ausschlüsse) und paErzeuge (Aufbau);
   sie sind Orientierung für gesunde Erwachsene, keine Beratung. Quellen: docs/PLAN-ASSISTENT.md. */

/* ---------- Texte ---------- */
var PAT = {
  de:{
    titel:"Trainingsplan erstellen", abbrechen:"Abbrechen", zurueck:"Zurück", weiter:"Weiter", ueberspringen:"Überspringen", fertigBtn:"Plan erstellen", fertig:"Fertig",
    frageVon:"Frage {n} von {m}", uebersicht:"Übersicht", aendern:"ändern", erstellt:"Dein Plan ist fertig", erstelltSub:"Er liegt jetzt im Kalender. Du findest ihn unter Tools › Trainingsplan.",
    ansehen:"Ansehen", ausKalender:"Aus Kalender nehmen", ausKalenderOk:"Plan aus dem Kalender genommen: {n} Termine entfernt", inKalender:"In Kalender übertragen", inKalenderOk:"{n} Termine im Kalender",
    angepasst:"Plan angepasst", planAnpassen:"Plan anpassen", planKalAus:"Ganzen Plan aus dem Kalender nehmen", planKalEin:"Ganzen Plan in den Kalender übertragen", planWeg:"Plan löschen",
    planWegQ:"Plan löschen?", planWegT:"„{n}“ mit allen dazugehörigen BLOCs und Terminen.", abbruchQ:"Abbrechen?", abbruchT:"Deine Antworten gehen verloren.", verwerfen:"Verwerfen", weiterMachen:"Weitermachen",
    eintrag:"Trainingsplan erstellen lassen", eintragSub:"Ein paar Fragen, dann baut BLOC deinen Plan und legt ihn in den Kalender",
    q_ziel:"Was ist dein Hauptziel?", h_ziel:"Danach richten sich Übungen, Wiederholungen und Pausen.",
    q_fokus:"Welche Bereiche sollen mehr Aufmerksamkeit bekommen?", h_fokus:"Optional. Der Plan bleibt ausgewogen, die Zone bekommt etwas mehr Gewicht.",
    q_niveau:"Wie aktiv bist du aktuell?", h_niveau:"Das bestimmt Startumfang und Tempo der Steigerung.",
    q_tage:"An welchen Tagen willst du trainieren?", h_tage:"Tippe die Wochentage an. Zwei Kraft-Einheiten pro Woche sind ein guter Start.",
    q_dauer:"Wie viel Zeit hast du pro Einheit?", h_dauer:"Aufwärmen und Dehnen zählen mit.",
    q_ort:"Wo und womit trainierst du?", h_ort:"Mehrfachwahl: Übungen passen sich an.",
    q_einschr:"Gibt es etwas, worauf wir Rücksicht nehmen sollen?", h_einschr:"Betroffene Bewegungen werden durch Alternativen ersetzt. Das ersetzt keine ärztliche Beratung.",
    q_impact:"Wie sieht es mit Sprüngen aus?", h_impact:"Sprünge und harte Landungen belasten Gelenke.",
    q_sport:"Machst du schon einen anderen Sport?", h_sport:"Optional. Er kommt als fester Termin in den Kalender und zählt als Belastung: Am Tag danach wird nicht an den Beinen trainiert.",
    q_laufen:"Soll Laufen dazu?", h_laufen:"BLOC Run begleitet dich mit der Aufzeichnung.",
    q_mobility:"Und Beweglichkeit?", h_mobility:"Kurz dehnen und mobilisieren.",
    q_fertig:"Alles bereit?", h_fertig:"Prüfe die Übersicht. Antippen ändert eine Antwort.",
    z_muskel:"Muskelaufbau", z_muskel_s:"Kräftiger und definierter", z_kraft:"Kraft", z_kraft_s:"Stärker werden", z_abnehmen:"Abnehmen", z_abnehmen_s:"Aktiver, mehr Energieumsatz",
    z_ausdauer:"Ausdauer", z_ausdauer_s:"Länger durchhalten", z_allgemein:"Allgemein fit", z_allgemein_s:"Von allem etwas", z_beweglich:"Beweglichkeit", z_beweglich_s:"Locker und beweglich",
    f_ober:"Oberkörper", f_beine:"Beine & Po", f_rumpf:"Rumpf", f_ruecken:"Rücken & Haltung", f_ausgew:"Ausgewogen",
    n_gar:"Gerade gar nicht", n_gar_s:"Ich fange neu an", n_unreg:"Unregelmäßig", n_unreg_s:"Mal ja, mal nein", n_n12:"1–2× pro Woche", n_n12_s:"Regelmäßig, aber wenig", n_n3:"3× oder öfter", n_n3_s:"Ich trainiere regelmäßig",
    d_20:"20 min", d_30:"30 min", d_45:"45 min", d_60:"60 min oder mehr",
    o_heim0:"Zuhause ohne Geräte", o_heim1:"Zuhause mit Kurzhantel oder Band", o_studio:"Fitnessstudio", o_draussen:"Draußen, Stange oder Park",
    e_keine:"Keine", e_knie:"Knie", e_schulter:"Schulter", e_ruecken:"Rücken", e_handgelenk:"Handgelenk", e_sprung:"Sprunggelenk",
    i_gerne:"Gerne mit Sprüngen", i_gerne_s:"Auch explosiv und mit Cardio-Sprüngen", i_schonend:"Lieber gelenkschonend", i_schonend_s:"Ohne Sprünge und harte Landungen",
    sp_name:"Sportart, z. B. Fußball", sp_tag:"An welchem Tag?", sp_keiner:"Kein anderer Sport",
    l_kein:"Kein Laufen", l_ein:"Einsteiger", l_ein_s:"Geh-Lauf-Intervalle", l_reg:"Ich laufe regelmäßig", l_reg_s:"Lauf-Einheiten dazu",
    m_nach:"Nach jeder Einheit", m_nach_s:"Kurz dehnen am Ende", m_tag:"Eigener Tag", m_tag_s:"Eine eigene Mobility-Einheit", m_nein:"Nein, danke",
    s_leicht:"Leicht", s_leicht_s:"Sanft und machbar", s_mittel:"Mittel", s_mittel_s:"Fordernd, aber fair", s_schwer:"Schwer", s_schwer_s:"Hart, für Geübte",
    schwerTitel:"Wie fordernd soll es sein?", mehr:"Weitere Optionen", alter:"Altersbereich", a_u50:"unter 50", a_50:"50–64", a_65:"65+", wochenT:"Planlänge", wochenN:"{n} Wochen",
    k_ziel:"Ziel", k_fokus:"Fokus", k_niveau:"Aktivität", k_tage:"Tage", k_dauer:"Zeit", k_ort:"Ort", k_einschr:"Einschränkungen", k_impact:"Impact", k_sport:"Anderer Sport", k_laufen:"Laufen", k_mobility:"Mobility", k_schwer:"Schwierigkeit",
    tagePro:"{n} Tage pro Woche", einheitenSumme:"{n} Einheiten pro Woche · {m} Wochen", keinFokus:"ausgewogen",
    gk:"Ganzkörper", ok:"Oberkörper", uk:"Unterkörper", cardio:"Intervall-Cardio", mob:"Mobility", erh:"Aktive Erholung", lauf:"Lauf", lauf_ein:"Geh-Lauf-Intervalle", sportName:"Sport", sportSub:"Fester Termin",
    planName:"{z} · {n}× pro Woche", blocName:"{z} · {t}", aufwaermen:"Aufwärmen", dehnen:"Dehnen",
    einEinheit:"Mit nur einer Einheit pro Woche bleibt jede Muskelgruppe bei einmal pro Woche. Zwei Einheiten sind besser (WHO: mindestens zwei Tage Krafttraining).",
    info0:"Starte mit 5 bis 10 Minuten Aufwärmen. Dehnen kommt ans Ende.",
    info1:"Höre jeden Satz {r} Wiederholungen vor dem Muskelversagen auf; bis zum Versagen musst du nicht gehen. Schaffst du in allen Sätzen die obere Wiederholungszahl, nimm eine Wiederholung mehr oder eine schwerere Variante, bei Geräten 2 bis 5 % mehr Gewicht.",
    info2:"Leichtwoche in Woche {n}: etwa 60 % der Sätze, Gewicht gleich oder etwas leichter und bis zu 4 Wiederholungen in Reserve, damit du dich erholst.",
    info3:"Laufen für Einsteiger: im Wechsel 1 Minute laufen und 1,5 bis 2 Minuten gehen, bis zu dreimal pro Woche mit Ruhetag dazwischen, jede Woche etwas länger laufen.",
    info3b:"Laufumfang vorsichtig steigern, etwa 10 % pro Woche, nie mehr als 30 %.",
    info4:"Bei Schmerzen (nicht bei Muskelbrennen), Schwindel oder Druck auf der Brust sofort abbrechen. Bei Vorerkrankungen vorher ärztlich abklären. Orientierung, keine medizinische Beratung.",
    info5:"Ab 65: dazu eine Gleichgewichts-Übung (sicher an Wand oder Stuhl), langsam und kontrolliert, feste Standfläche.",
    info6:"Nach dem Sport „{s}“ bleibt der Unterkörper zwei Tage ohne schwere Belastung.",
    mehrere:"Mehrere möglich", waehleMind:"Wähle mindestens eine Option.", bauen:"Plan wird zusammengestellt …", lokal:"Wird nur auf deinem Gerät erstellt.", spaeter:"Du kannst den Plan später durch langes Drücken auf die Plankarte anpassen.", uebernehmen:"Änderungen übernehmen", abbruchT2:"Deine Antworten gehen verloren.", zurueckPfeil:"Zurück zur vorigen Frage",
    leichtwoche:"Leichtwoche", lauf_w:"Geh-Lauf: {a} Min laufen, {b} Min gehen · {n}×", who:"Etwa {m} Minuten Training pro Woche, {k} Krafttage. WHO: 150 bis 300 Minuten moderate Aktivität und mindestens zwei Krafttage pro Woche.", schwerNein:"Für dein Niveau nicht vorgesehen",
    quelle:"Grundlage: WHO-Leitlinien 2020, ACSM Position Stand 2026 und weitere offene Studien (quellen.html). Zahlen für Sätze, Pausen und Steigerung sind Empfehlungen von BLOC."
  },
  en:{
    titel:"Create a training plan", abbrechen:"Cancel", zurueck:"Back", weiter:"Next", ueberspringen:"Skip", fertigBtn:"Create plan", fertig:"Done",
    frageVon:"Question {n} of {m}", uebersicht:"Overview", aendern:"change", erstellt:"Your plan is ready", erstelltSub:"It is in your calendar now. Find it under Tools › Training plan.",
    ansehen:"View", ausKalender:"Remove from calendar", ausKalenderOk:"Plan removed from the calendar: {n} sessions", inKalender:"Add to calendar", inKalenderOk:"{n} sessions in the calendar",
    angepasst:"Plan updated", planAnpassen:"Adjust plan", planKalAus:"Remove whole plan from calendar", planKalEin:"Add whole plan to calendar", planWeg:"Delete plan",
    planWegQ:"Delete plan?", planWegT:"“{n}” with all its BLOCs and sessions.", abbruchQ:"Cancel?", abbruchT:"Your answers will be lost.", verwerfen:"Discard", weiterMachen:"Keep going",
    eintrag:"Have a training plan created", eintragSub:"A few questions, then BLOC builds your plan and puts it in the calendar",
    q_ziel:"What is your main goal?", h_ziel:"Exercises, reps and rest follow from this.",
    q_fokus:"Which areas should get more attention?", h_fokus:"Optional. The plan stays balanced; the area gets a bit more weight.",
    q_niveau:"How active are you right now?", h_niveau:"This sets the starting volume and how fast it builds.",
    q_tage:"Which days do you want to train?", h_tage:"Tap the weekdays. Two strength sessions a week are a good start.",
    q_dauer:"How much time per session?", h_dauer:"Warm-up and stretching are included.",
    q_ort:"Where and with what do you train?", h_ort:"Choose several: exercises adapt.",
    q_einschr:"Is there anything we should take into account?", h_einschr:"Affected movements are swapped for alternatives. This does not replace medical advice.",
    q_impact:"How about jumps?", h_impact:"Jumps and hard landings load the joints.",
    q_sport:"Do you already do another sport?", h_sport:"Optional. It goes into the calendar as a fixed date and counts as load: no leg training the day after.",
    q_laufen:"Add running?", h_laufen:"BLOC Run records it for you.",
    q_mobility:"And mobility?", h_mobility:"Short stretching and mobilising.",
    q_fertig:"All set?", h_fertig:"Check the overview. Tap an answer to change it.",
    z_muskel:"Build muscle", z_muskel_s:"Stronger and more defined", z_kraft:"Strength", z_kraft_s:"Get stronger", z_abnehmen:"Lose weight", z_abnehmen_s:"More active, more energy use",
    z_ausdauer:"Endurance", z_ausdauer_s:"Last longer", z_allgemein:"General fitness", z_allgemein_s:"A bit of everything", z_beweglich:"Mobility", z_beweglich_s:"Loose and flexible",
    f_ober:"Upper body", f_beine:"Legs & glutes", f_rumpf:"Core", f_ruecken:"Back & posture", f_ausgew:"Balanced",
    n_gar:"Not at all right now", n_gar_s:"I am starting fresh", n_unreg:"Irregularly", n_unreg_s:"Sometimes yes, sometimes no", n_n12:"1–2× a week", n_n12_s:"Regular, but little", n_n3:"3× or more", n_n3_s:"I train regularly",
    d_20:"20 min", d_30:"30 min", d_45:"45 min", d_60:"60 min or more",
    o_heim0:"At home, no equipment", o_heim1:"At home with dumbbells or band", o_studio:"Gym", o_draussen:"Outdoors, bar or park",
    e_keine:"None", e_knie:"Knee", e_schulter:"Shoulder", e_ruecken:"Back", e_handgelenk:"Wrist", e_sprung:"Ankle",
    i_gerne:"Jumps are fine", i_gerne_s:"Explosive moves and jumping cardio too", i_schonend:"Easy on the joints", i_schonend_s:"No jumps or hard landings",
    sp_name:"Sport, e.g. football", sp_tag:"On which day?", sp_keiner:"No other sport",
    l_kein:"No running", l_ein:"Beginner", l_ein_s:"Walk-run intervals", l_reg:"I run regularly", l_reg_s:"Add running sessions",
    m_nach:"After every session", m_nach_s:"Short stretch at the end", m_tag:"Its own day", m_tag_s:"A separate mobility session", m_nein:"No, thanks",
    s_leicht:"Easy", s_leicht_s:"Gentle and doable", s_mittel:"Medium", s_mittel_s:"Demanding but fair", s_schwer:"Hard", s_schwer_s:"Tough, for experienced",
    schwerTitel:"How demanding should it be?", mehr:"More options", alter:"Age range", a_u50:"under 50", a_50:"50–64", a_65:"65+", wochenT:"Plan length", wochenN:"{n} weeks",
    k_ziel:"Goal", k_fokus:"Focus", k_niveau:"Activity", k_tage:"Days", k_dauer:"Time", k_ort:"Place", k_einschr:"Limitations", k_impact:"Impact", k_sport:"Other sport", k_laufen:"Running", k_mobility:"Mobility", k_schwer:"Difficulty",
    tagePro:"{n} days a week", einheitenSumme:"{n} sessions a week · {m} weeks", keinFokus:"balanced",
    gk:"Full body", ok:"Upper body", uk:"Lower body", cardio:"Interval cardio", mob:"Mobility", erh:"Active recovery", lauf:"Run", lauf_ein:"Walk-run intervals", sportName:"Sport", sportSub:"Fixed date",
    planName:"{z} · {n}× a week", blocName:"{z} · {t}", aufwaermen:"Warm-up", dehnen:"Stretching",
    einEinheit:"With one session a week every muscle group is trained once. Two sessions are better (WHO: at least two days of strength training).",
    info0:"Start with 5 to 10 minutes of warm-up. Stretching comes at the end.",
    info1:"Stop every set {r} reps before muscle failure; you do not have to go to failure. If you reach the upper rep number in all sets, add one rep or take a harder variation, with equipment 2 to 5 % more weight.",
    info2:"Easy week in week {n}: about 60 % of the sets, same weight or a little lighter and up to 4 reps in reserve so you recover.",
    info3:"Running for beginners: alternate 1 minute running and 1.5 to 2 minutes walking, up to three times a week with a rest day between, run a little longer each week.",
    info3b:"Increase running volume carefully, about 10 % a week, never more than 30 %.",
    info4:"Stop at once if you feel pain (not muscle burn), dizziness or chest pressure. Check with a doctor first if you have a medical condition. Guidance, not medical advice.",
    info5:"From 65: add a balance exercise (safe at a wall or chair), slow and controlled, stable stance.",
    info6:"After your sport “{s}” the lower body stays free of heavy loads for two days.",
    mehrere:"Several possible", waehleMind:"Choose at least one option.", bauen:"Putting your plan together …", lokal:"Created on your device only.", spaeter:"You can adjust the plan later by long-pressing the plan card.", uebernehmen:"Apply changes", abbruchT2:"Your answers will be lost.", zurueckPfeil:"Back to the previous question",
    leichtwoche:"Easy week", lauf_w:"Walk-run: {a} min run, {b} min walk · {n}×", who:"About {m} minutes of training per week, {k} strength days. WHO: 150 to 300 minutes of moderate activity and at least two strength days per week.", schwerNein:"Not planned for your level",
    quelle:"Basis: WHO guidelines 2020, ACSM position stand 2026 and further open studies (quellen.html). Numbers for sets, rest and progression are BLOC recommendations."
  }
};
function pt(k, v){
  var l = PAT[currentLang() === "en" ? "en" : "de"], s = l[k] !== undefined ? l[k] : (PAT.de[k] !== undefined ? PAT.de[k] : k);
  if(v) Object.keys(v).forEach(function(x){ s = s.split("{"+x+"}").join(v[x]); });
  return s;
}

/* ---------- Regeln (Zahlen): Sätze, Wiederholungen, Pause (s) je Ziel und Schwierigkeit ---------- */
var PA_REGELN = {
  muskel:       { leicht:[2, 12, 60],  mittel:[3, 10, 75],  schwer:[4, 8, 90]   },
  kraft:        { leicht:[3, 8, 90],   mittel:[3, 6, 120],  schwer:[4, 5, 150]  },
  abnehmen:     { leicht:[2, 12, 45],  mittel:[3, 12, 40],  schwer:[3, 15, 30]  },
  ausdauer:     { leicht:[2, 15, 40],  mittel:[3, 15, 35],  schwer:[3, 15, 30]  },
  allgemein:    { leicht:[2, 10, 60],  mittel:[3, 10, 60],  schwer:[3, 8, 75]   },
  beweglich:    { leicht:[2, 8, 45],   mittel:[2, 10, 45],  schwer:[3, 10, 45]  }
};
var PA_CARDIO = { leicht:[3, 30, 30], mittel:[3, 40, 20], schwer:[4, 45, 15] };   // Runden, Arbeit s, Pause s im Intervall-Cardio
var PA_RIR = { leicht:"3 bis 4", mittel:"2 bis 3", schwer:"1 bis 2" };   // Einsteiger schätzen die Reserve zu knapp (ACSM 2026, Halperin 2022), darum bei „leicht“ mehr Reserve
/* Übungen, die je Einschränkung wegfallen (Kennung der Übung, Teilwort) - Alternativen kommen aus dem Rest des Katalogs */
var PA_AUS = {
  impact:/jump|hop|burpee|skater|plyo|tuck-jump|frog|sprint|high-knees|fast-feet|star-|squat-jack|jumping|butt-kick|box-jump|broad|bound|stand-up|pogo|clap|rope|double-under|boxer|cross-jack|mountain-climb|lateral-shuffle/,
  knie:/lunge|pistol|sissy|cossack|shrimp|wall-sit|step-up|push-off|stair|jump|hop|burpee|skater|box|frog|bound|squat-hold|deep|duck/,
  schulter:/overhead|military|pike|handstand|dip|upright|arnold|snatch|thruster|clap|archer|planche|muscle-up|hang|skin-the-cat|jerk|clean|push-press|ring|burpee/,
  ruecken:/deadlift|good-morning|rdl|bent-over|back-extension|hyper|superman|jackknife|v-sit|sit-up|russian-twist|burpee|jump|clean|snatch|swing|windshield|toes-to-bar|leg-raise|rack-pull|pullover/,
  handgelenk:/push-up|plank|bear|crawl|handstand|burpee|dip|pike|mountain|climber|ring|walkout|inchworm|downward|archer|clap|planche|support-hold/,
  sprung:/jump|hop|skater|sprint|fast-feet|high-knees|burpee|box|rope|calf-raise|lateral|bound|plyo|tuck-jump|star-jump|jack|mountain|boxer|stair/
};
/* Hochleistungs-Fertigkeiten kommen in automatischen Plänen nie vor */
var PA_NIE = /planche|front-lever|back-lever|human-flag|one-arm|muscle-up|skin-the-cat|dragon-flag|handstand-push|ring-muscle|iron-cross/;
var PA_AUSNAHME = /forearm|elbow|incline-push|wall-push|knee-push/;   // Handgelenk: Unterarm-Varianten und leichtere Stützformen bleiben erlaubt
var PA_ORT = { heim0:["none"], heim1:["none", "db", "kb", "band"], studio:["none", "db", "kb", "band", "bar", "dip", "gym"], draussen:["none", "bar", "dip", "rope"] };
/* Slots je Einheit: Muskelgruppen in Reihenfolge der Wichtigkeit (große Übungen zuerst; Drücken und Ziehen wechseln sich ab) */
var PA_SLOTS = {
  gk:[["beine", "brust", "ruecken", "po", "bauch", "schulter", "arme", "rumpf"], ["po", "ruecken", "schulter", "beine", "brust", "rumpf", "bauch", "arme"], ["beine", "schulter", "brust", "ruecken", "rumpf", "po", "arme", "bauch"]],
  ok:[["brust", "ruecken", "schulter", "ruecken", "arme", "brust", "arme", "bauch"], ["ruecken", "brust", "schulter", "brust", "arme", "ruecken", "rumpf", "arme"]],
  uk:[["beine", "po", "beine", "bauch", "rumpf", "beine", "po", "bauch"], ["po", "beine", "beine", "rumpf", "bauch", "po", "beine", "rumpf"]]
};
var PA_FOKUS = { ober:["brust", "ruecken", "schulter"], beine:["beine", "po"], rumpf:["rumpf", "bauch"], ruecken:["ruecken", "schulter"] };
/* Tagestypen je Ziel und Zahl der Trainingstage (1 bis 6) */
var PA_TAGE = {
  muskel:    [null, ["gk"], ["gk", "gk"], ["gk", "gk", "gk"], ["ok", "uk", "ok", "uk"], ["ok", "uk", "gk", "erh", "cardio"], ["ok", "uk", "gk", "ok", "uk", "erh"]],
  kraft:     [null, ["gk"], ["gk", "gk"], ["gk", "gk", "gk"], ["ok", "uk", "ok", "uk"], ["ok", "uk", "gk", "erh", "cardio"], ["ok", "uk", "gk", "ok", "uk", "erh"]],
  allgemein: [null, ["gk"], ["gk", "gk"], ["gk", "cardio", "gk"], ["gk", "cardio", "gk", "erh"], ["gk", "cardio", "gk", "cardio", "gk"], ["gk", "cardio", "gk", "cardio", "gk", "erh"]],
  abnehmen:  [null, ["gk"], ["gk", "cardio"], ["gk", "cardio", "gk"], ["gk", "cardio", "gk", "cardio"], ["gk", "cardio", "gk", "cardio", "gk"], ["gk", "cardio", "gk", "cardio", "gk", "erh"]],
  ausdauer:  [null, ["cardio"], ["cardio", "gk"], ["cardio", "gk", "cardio"], ["cardio", "gk", "cardio", "gk"], ["cardio", "gk", "cardio", "cardio", "gk"], ["cardio", "gk", "cardio", "gk", "cardio", "erh"]],
  beweglich: [null, ["mob"], ["mob", "gk"], ["mob", "gk", "mob"], ["mob", "gk", "mob", "gk"], ["mob", "gk", "mob", "gk", "mob"], ["mob", "gk", "mob", "gk", "mob", "erh"]]
};
/* Dehnregionen je Muskelgruppe (WS_REGION_VON in js/02-bibliothek.js) */
var PA_REGION = { brust:["brust", "schulter"], ruecken:["ruecken"], schulter:["schulter", "nacken"], arme:["arme"], bauch:["rumpf", "ruecken"], rumpf:["rumpf", "ruecken"], beine:["beine", "huefte"], po:["huefte", "beine"] };

/* ---------- Antworten ---------- */
function paStandard(){
  return { ziel:"", fokus:[], niveau:"", tage:[], dauer:0, ort:[], einschr:[], impact:"", sport:null, laufen:"", mobility:"", schwer:"", alter:"u50", wochen:6 };
}
function paSchwerErlaubt(a){ return a.niveau !== "gar" && a.niveau !== "unreg" && a.alter !== "65"; }   // „Schwer“ nur ab 1–2× pro Woche aktiv und nicht ab 65
function paSchwerStandard(a){ return a.niveau === "n12" || a.niveau === "n3" ? "mittel" : "leicht"; }   // Vorgabe aus dem Aktivitätsniveau; „Schwer“ nur auf Wunsch
function paSauber(a){   // gespeicherte oder fremde Antworten auf gültige Werte bringen
  var s = paStandard(), ok = function(v, l){ return l.indexOf(v) > -1; };
  if(!a || typeof a !== "object") return s;
  if(ok(a.ziel, ["muskel", "kraft", "abnehmen", "ausdauer", "allgemein", "beweglich"])) s.ziel = a.ziel;
  s.fokus = selArr(a.fokus).filter(function(x){ return ["ober", "beine", "rumpf", "ruecken", "ausgew"].indexOf(x) > -1; });
  if(ok(a.niveau, ["gar", "unreg", "n12", "n3"])) s.niveau = a.niveau;
  s.tage = selArr(a.tage).map(Number).filter(function(d, i, l){ return d >= 0 && d <= 6 && l.indexOf(d) === i; }).sort(function(x, y){ return x - y; }).slice(0, 6);
  if(ok(+a.dauer, [20, 30, 45, 60])) s.dauer = +a.dauer;
  s.ort = selArr(a.ort).filter(function(x){ return PA_ORT[x]; });
  s.einschr = selArr(a.einschr).filter(function(x){ return PA_AUS[x] && x !== "impact"; });
  if(ok(a.impact, ["gerne", "schonend"])) s.impact = a.impact;
  if(a.sport && typeof a.sport.name === "string" && a.sport.name.trim() && a.sport.tag >= 0 && a.sport.tag <= 6) s.sport = { name:a.sport.name.trim().slice(0, 24), tag:+a.sport.tag };
  if(ok(a.laufen, ["kein", "ein", "reg"])) s.laufen = a.laufen;
  if(ok(a.mobility, ["nach", "tag", "nein"])) s.mobility = a.mobility;
  if(ok(a.schwer, ["leicht", "mittel", "schwer"])) s.schwer = a.schwer;
  if(ok(a.alter, ["u50", "50", "65"])) s.alter = a.alter;
  if(ok(+a.wochen, [4, 6, 8])) s.wochen = +a.wochen;
  if(s.schwer === "schwer" && !paSchwerErlaubt(s)) s.schwer = "mittel";
  return s;
}
function paVollstaendig(a){ return !!(a.ziel && a.niveau && a.tage.length && a.dauer && a.ort.length && a.impact); }

/* ---------- Auswahl der Übungen ---------- */
function paHash(s){ var x = 7; for(var i = 0; i < s.length; i++) x = (x*31 + s.charCodeAt(i)) % 99991; return x/99991; }
function paTopGruppe(ex){ var v = mgVerteilung(ex), b = "", m = 0; Object.keys(v).forEach(function(k){ if(v[k] > m){ m = v[k]; b = k; } }); return b; }
function paAusgeschlossen(ex, a){
  var id = ex.id, imp = a.impact === "schonend" || a.niveau === "gar" || a.alter === "65", l = [];
  if(imp) l.push(PA_AUS.impact);
  a.einschr.forEach(function(e){ if(PA_AUS[e]) l.push(PA_AUS[e]); });
  if(PA_NIE.test(id)) return true;
  return l.some(function(re){ return re.test(id) && !(re !== PA_AUS.impact && PA_AUSNAHME.test(id) && re === PA_AUS.handgelenk); });
}
function paUmgebung(a){ var o = {}; a.ort.forEach(function(k){ PA_ORT[k].forEach(function(e){ o[e] = 1; }); }); return o; }
function paSchwerLevel(a){ return a.schwer || paSchwerStandard(a); }
/* Pool je Muskelgruppe für Kraft-Slots (ohne Cardio und Dehnen), je Cardio-Pool und Stretch-Pool */
function paPools(a){
  var env = paUmgebung(a), bevorzugt = Object.keys(env).filter(function(e){ return e !== "none"; }), sw = paSchwerLevel(a), nurLeicht = a.niveau === "gar" || a.alter === "65";
  var kraft = {}, cardio = [], dehnen = [];
  EXERCISES.forEach(function(ex){
    if(ex.custom || !ex.equip.every(function(q){ return env[q]; })) return;
    if(ex.main === "stretch"){ if(!paAusgeschlossen(ex, a)) dehnen.push(ex); return; }
    if(!fuerBau(ex) || paAusgeschlossen(ex, a)) return;
    if(nurLeicht && ex.level > 2) return;
    var lv = ex.level || 2;
    var sc = (sw === "leicht" ? (lv === 1 ? 3 : lv === 2 ? 1 : -4) : sw === "mittel" ? (lv === 2 ? 3 : lv === 1 ? 2 : 0) : (lv === 3 ? 3 : lv === 2 ? 2 : 0)) + paGeraet(ex, bevorzugt) + paGrundUebung(ex);
    if(a.niveau === "gar" && lv === 1) sc += 1.5;
    var o = { ex:ex, sc:sc };
    if(ex.main === "ausdauer") cardio.push(o); else { var g = paTopGruppe(ex); if(g) (kraft[g] = kraft[g] || []).push(o); }
  });
  return { kraft:kraft, cardio:cardio, dehnen:dehnen };
}
/* Mehrgelenkübungen (mehrere Muskelgruppen, mit Hilfsmuskeln) vor Isolationsübungen; vorhandene Geräte vor dem Band */
function paGrundUebung(ex){
  var v = mgVerteilung(ex), n = Object.keys(v).filter(function(k){ return v[k] >= 0.25; }).length, sek = (EX_MUSCLES[ex.id] || [])[1] ? 0.8 : 0;
  return Math.min(3, Math.max(0, n - 1)*1.2 + sek);
}
function paGeraet(ex, bevorzugt){
  var sc = 0;
  ex.equip.forEach(function(q){ if(bevorzugt.indexOf(q) < 0) return; sc += (q === "gym" || q === "db" || q === "bar" || q === "dip") ? 1.5 : q === "kb" ? 1 : q === "band" ? -0.8 : 0.5; });
  return sc;
}
function paWaehle(liste, benutzt, seed, plan){
  var best = null;
  (liste || []).forEach(function(o){
    if(benutzt[o.ex.id]) return;
    var sc = o.sc + paHash(o.ex.id + seed)*0.9 - (plan[o.ex.id] ? 2 : 0);
    if(!best || sc > best.sc) best = { ex:o.ex, sc:sc };
  });
  return best ? best.ex : null;
}
/* Aufwärmen: die ersten Übungen des passenden Aufwärm-Workouts (vor Kraft, vor HIIT, sonst ganzer Körper), ohne Ausgeschlossenes (z. B. Sprünge bei gelenkschonend) */
function paAufwaermen(a, n, typ){
  var wid = typ === "cardio" ? "warmup-hiit" : (a.ziel === "muskel" || a.ziel === "kraft" ? "warmup-kraft" : "warmup-ganz"), lw = findLibWorkout(wid);
  var l = (lw ? lw.exercises : AUFWAERM_UEBUNGEN).map(function(id){ return findExercise(id); }).filter(function(ex){ return ex && ex.main !== "stretch" && !paAusgeschlossen(ex, a); });
  return l.slice(0, n).map(function(ex){ return ex.id; });
}
function paDehnen(pools, gruppen, n, seed, benutzt){
  var regionen = {}; gruppen.forEach(function(g){ (PA_REGION[g] || []).forEach(function(r){ regionen[r] = 1; }); });
  var l = pools.dehnen.filter(function(ex){ var r = WS_REGION_VON[ex.id] || []; return r.some(function(x){ return regionen[x]; }); });
  if(l.length < n) l = pools.dehnen.slice();
  l.sort(function(x, y){ return paHash(x.id + seed) - paHash(y.id + seed); });
  var out = []; l.forEach(function(ex){ if(out.length < n && !benutzt[ex.id]) out.push(ex.id); });
  return out;
}

/* ---------- Plan erzeugen ---------- */
/* gibt { name, ziele, bloecke:[{ name, ids, std, modus, ziele, tag }], wp:[{ tag, art, ... }], info, wochen } zurück; legt noch nichts an */
function paErzeuge(a0){
  var a = paSauber(a0), sw = paSchwerLevel(a), r = PA_REGELN[a.ziel] ? PA_REGELN[a.ziel][sw] : PA_REGELN.allgemein[sw];
  var saetze = r[0], wdh = r[1], pause = r[2];
  if(a.niveau === "gar"){ saetze = Math.min(saetze, 2); pause += 15; }
  if(a.alter === "65"){ wdh = Math.max(wdh + 2, 10); pause += 15; } else if(a.alter === "50"){ wdh = Math.max(wdh, 8); pause += 10; }
  if(a.dauer <= 20) saetze = Math.max(2, saetze - 1);
  var days = a.tage.slice(), nTage = Math.max(1, Math.min(6, days.length)), pools = paPools(a), seedBase = a.ziel + sw + a.dauer + days.join("");
  var typen = ((PA_TAGE[a.ziel] || PA_TAGE.allgemein)[nTage] || ["gk"]).slice();
  /* Anderer Sport zählt als Belastung: am Tag davor, am Sporttag und am Tag danach keine Beine (Unterkörper/Ganzkörper werden Oberkörper, Cardio wird aktive Erholung),
     zwei Tage danach kein reiner Unterkörpertag. Bei Klettern, Kampfsport oder Schwimmen schonen die Tage rundherum stattdessen Zug und Schulter (Oberkörper wird Unterkörper). */
  if(a.sport){
    var oberSport = /klettern|boulder|kampf|box|judo|karate|ringen|schwimm/i.test(a.sport.name);
    days.forEach(function(d, i){
      var nah = d === a.sport.tag || (a.sport.tag + 1) % 7 === d || (a.sport.tag + 6) % 7 === d;
      if(nah){
        if(oberSport){ if(typen[i] === "ok" || typen[i] === "gk") typen[i] = "uk"; }
        else if(typen[i] === "uk" || typen[i] === "gk") typen[i] = "ok"; else if(typen[i] === "cardio") typen[i] = "erh";
      } else if((a.sport.tag + 2) % 7 === d && typen[i] === "uk" && !oberSport) typen[i] = "gk";   // nach intensivem Spiel sind die Beine nach 48 bis 72 Stunden noch nicht erholt (Silva 2018)
    });
  }
  /* Laufen gewünscht, aber kein Cardio-Tag im Plan: ein Tag (nicht am Sporttag und nicht am Tag danach) wird zum Lauftag - bevorzugt eine aktive Erholung, dann ein Ganzkörper- oder Unterkörpertag */
  if(a.laufen && a.laufen !== "kein" && typen.indexOf("cardio") < 0){
    var frei = function(i){ return !a.sport || (days[i] !== a.sport.tag && days[i] !== (a.sport.tag + 1) % 7); }, wahl2 = -1;
    ["erh", "gk", "uk"].forEach(function(t0){ for(var i = typen.length - 1; i >= 0; i--) if(wahl2 < 0 && typen[i] === t0 && frei(i)) wahl2 = i; });
    if(wahl2 >= 0) typen[wahl2] = "cardio";
  }
  var warmN = a.dauer <= 20 ? 2 : 3, dehnN = a.dauer >= 45 ? 4 : 3, mobNach = a.mobility !== "tag" && a.mobility !== "nein";
  var nMain = (a.dauer <= 20 ? 4 : a.dauer <= 30 ? 5 : a.dauer <= 45 ? 7 : 9) - (pause >= 120 ? 1 : 0) - (sw === "leicht" && a.dauer >= 60 ? 1 : 0);   // Übungen je Einheit (ohne Aufwärmen und Dehnen)
  var planBenutzt = {}, zaehl = { gk:0, ok:0, uk:0 }, bloecke = [], wp = [], ziele = {}, laufDa = false;
  typen.forEach(function(typ, i){
    var tag = days[i], bname = "", ids = [], modus = {}, std = "saetze", mainIds = [], seed = seedBase + i;
    if(typ === "gk" || typ === "ok" || typ === "uk"){
      var slots = PA_SLOTS[typ][zaehl[typ] % PA_SLOTS[typ].length].slice(); zaehl[typ]++;
      var fokus = []; a.fokus.forEach(function(f){ (PA_FOKUS[f] || []).forEach(function(g){ if(fokus.indexOf(g) < 0) fokus.push(g); }); });
      fokus.forEach(function(g){ if(slots.filter(function(x){ return x === g; }).length < 2 && (typ === "gk" || g === "rumpf" || g === "bauch" || (typ === "ok" && ["brust", "ruecken", "schulter"].indexOf(g) > -1) || (typ === "uk" && ["beine", "po"].indexOf(g) > -1))) slots.splice(2, 0, g); });
      var warm = paAufwaermen(a, warmN, "kraft"), benutzt = {}, gruppen = [];
      warm.forEach(function(id){ benutzt[id] = 1; });
      slots.slice(0, nMain).forEach(function(g, k){
        var ex = paWaehle(pools.kraft[g], benutzt, seed + k, planBenutzt) || paWaehle(pools.kraft[g === "po" ? "beine" : g === "bauch" ? "rumpf" : g === "rumpf" ? "bauch" : g], benutzt, seed + k, planBenutzt);
        if(ex){ benutzt[ex.id] = 1; planBenutzt[ex.id] = 1; mainIds.push(ex.id); gruppen.push(g); }
      });
      var dehn = mobNach ? paDehnen(pools, gruppen, dehnN, seed, benutzt) : [];
      var balance = a.alter === "65" && findExercise("single-leg-stand") && !benutzt["single-leg-stand"] ? ["single-leg-stand"] : [];   // ab 65: Gleichgewicht (WHO 2020, ICFSR 2021)
      ids = warm.concat(balance, mainIds, dehn);
      balance.forEach(function(id){ modus[id] = "timer"; });
      warm.forEach(function(id){ modus[id] = "timer"; }); dehn.forEach(function(id){ modus[id] = "timer"; });
      mainIds.forEach(function(id){ ziele[id] = { s:saetze, w:wdh, p:pause }; });
      bname = pt("blocName", { z:pt(typ), t:String.fromCharCode(65 + (zaehl[typ] - 1)) });
      var wset = {}; warm.forEach(function(id){ wset[id] = 1; });
      bloecke.push({ name:bname, ids:ids, std:std, modus:modus, tag:tag, i:bloecke.length, warm:wset });
      wp.push({ tag:tag, i:bloecke.length - 1 });
    } else if(typ === "cardio" && a.laufen !== "kein" && a.laufen && !laufDa){
      laufDa = true; wp.push({ tag:tag, art:"run", name:a.laufen === "ein" ? pt("lauf_ein") : pt("lauf"), i:bloecke.length, run:true }); bloecke.push({ run:true, name:pt("lauf"), tag:tag });
    } else if(typ === "cardio" || typ === "erh" || typ === "mob"){
      var cids = [], bn = "", wset2 = {};
      if(typ === "cardio"){
        var nC = a.dauer <= 20 ? 4 : a.dauer <= 30 ? 5 : a.dauer <= 45 ? 7 : 8, cb = {}, wc = paAufwaermen(a, 2, "cardio");
        wc.forEach(function(id){ cb[id] = 1; });
        for(var k = 0; k < nC; k++){ var ce = paWaehle(pools.cardio, cb, seed + "c" + k, planBenutzt); if(!ce) break; cb[ce.id] = 1; planBenutzt[ce.id] = 1; cids.push(ce.id); }
        if(cids.length < 3){   // zu wenige Cardio-Übungen (gelenkschonend): mit Kraft-Übungen für Beine/Rumpf auffüllen
          ["beine", "rumpf", "po", "bauch"].forEach(function(g){ if(cids.length >= nC) return; var ex2 = paWaehle(pools.kraft[g], cb, seed + g, planBenutzt); if(ex2){ cb[ex2.id] = 1; cids.push(ex2.id); } });
        }
        wc.forEach(function(id){ wset2[id] = 1; });
        cids = wc.concat(cids);
        bn = pt("cardio");
      } else {
        var nM = typ === "erh" ? 6 : (a.dauer >= 45 ? 10 : 8), all = ["brust", "ruecken", "schulter", "arme", "bauch", "beine", "po", "rumpf"];
        cids = paDehnen(pools, all, nM, seed, {}); bn = pt(typ === "erh" ? "erh" : "mob");
      }
      var m2 = {}; if(typ === "cardio") cids.forEach(function(id){ m2[id] = "timer"; });
      bloecke.push({ name:bn + (typ === "cardio" ? " " + String.fromCharCode(65 + bloecke.filter(function(b){ return b.cardio; }).length) : ""), ids:cids, std:"timer", modus:m2, tag:tag, cardio:typ === "cardio", mob:typ !== "cardio", i:bloecke.length, warm:wset2 });
      wp.push({ tag:tag, i:bloecke.length - 1 });
    }
  });
  /* Mobility als eigener Tag: ein freier Wochentag, nicht am Sporttag */
  if(a.mobility === "tag"){
    var frei = [0, 1, 2, 3, 4, 5, 6].filter(function(d){ return days.indexOf(d) < 0 && !(a.sport && a.sport.tag === d); });
    var wahl = frei.filter(function(d){ return days.indexOf((d + 6) % 7) < 0 && days.indexOf((d + 1) % 7) < 0; })[0];
    if(wahl === undefined) wahl = frei[0];
    if(wahl !== undefined){
      var mids = paDehnen(pools, ["brust", "ruecken", "schulter", "arme", "bauch", "beine", "po", "rumpf"], 8, seedBase + "m", {});
      bloecke.push({ name:pt("mob"), ids:mids, std:"timer", modus:{}, tag:wahl, mob:true, i:bloecke.length, warm:{} }); wp.push({ tag:wahl, i:bloecke.length - 1 });
    }
  }
  if(a.sport) wp.push({ tag:a.sport.tag, art:"sport", name:a.sport.name, i:-1 });
  wp.sort(function(x, y){ return x.tag - y.tag; });
  var info = [pt("info0"), pt("info1", { r:PA_RIR[sw] })];
  info.push(pt("info2", { n:paLeichtWochen(a.wochen).map(function(i){ return i + 1; }).join(a.wochen >= 8 ? " und " : "") }));
  if(a.laufen === "ein") info.push(pt("info3")); else if(a.laufen === "reg") info.push(pt("info3b"));
  if(a.sport) info.push(pt("info6", { s:a.sport.name }));
  if(a.alter === "65") info.push(pt("info5"));
  if(nTage === 1 && a.ziel !== "beweglich" && a.ziel !== "ausdauer") info.push(pt("einEinheit"));
  info.push(pt("info4")); info.push(pt("quelle"));
  var zielName = pt("z_" + a.ziel);
  var kraftTage = bloecke.filter(function(b){ return !b.run && !b.cardio && !b.mob; }).length;
  return { kraftTage:kraftTage, minuten:nTage*a.dauer, name:pt("planName", { z:zielName, n:nTage }), bloecke:bloecke, wp:wp, ziele:ziele, info:info.join(" "), wochen:a.wochen, saetze:saetze, wdh:wdh, pause:pause, cardio:PA_CARDIO[sw], nTage:nTage };
}

/* ---------- Anlegen: BLOCs, Trainingsplan, Kalender ---------- */
function paBlocLoeschen(progId){ state.db.settings.stPlaene = stPlaene().filter(function(x){ return x.gen !== progId; }); }
var PA_LAUF = [[1, 2, 8], [2, 2, 6], [3, 2, 5], [4, 2, 4], [5, 1, 4], [8, 1, 3], [10, 1, 3], [10, 1, 3]];   // Wochen des Laufeinstiegs: Minuten laufen, Minuten gehen, Wiederholungen (Praxis, an Gehen-Laufen-Programme angelehnt)
function paLeichtWochen(wochen){ return wochen >= 8 ? [3, 7] : wochen >= 6 ? [5] : [3]; }
function paKalender(p){   // Wochenplan ab heute für p.wochen Wochen in den Kalender (offene frühere Termine dieses Plans werden ersetzt); liefert die Zahl
  programmAusKalender(p);
  var start = new Date(); start.setHours(12, 0, 0, 0);
  var wochen = p.wochen || 6, n = 0;
  for(var d = 0; d < wochen*7; d++){
    var tag = kalPlus(start, d), wd = (tag.getDay() + 6) % 7;
    (p.wp || []).forEach(function(w){
      if(w.tag !== wd) return;
      var wk = Math.floor(d/7), nm = w.name;
      if(w.art === "run" && p.assi && p.assi.laufen === "ein"){ var st = PA_LAUF[Math.min(wk, PA_LAUF.length - 1)]; nm = pt("lauf_w", { a:st[0], b:st[1], n:st[2] }); }
      var o = w.art === "run" ? { art:"run", name:nm, km:0 } : w.art === "sport" ? { art:"sport", name:w.name } : progEintrag(p.items[w.i]);
      var e = kalHinzu(kalTagKey(tag), o); e.prog = { id:p.id, i:w.art === "sport" ? -1 : w.i }; n++;
      if(w.art !== "sport" && w.art !== "run" && paLeichtWochen(wochen).indexOf(wk) > -1) e.leicht = true;   // Leichtwoche: weniger Sätze
    });
  }
  save();
  return n;
}
function paAnlegen(a0, ersetze){
  var a = paSauber(a0), sp = paErzeuge(a), alt = ersetze ? programmFinde(ersetze) : null, pid = alt ? alt.id : uid();
  if(alt){ programmAusKalender(alt); paBlocLoeschen(alt.id); }
  var items = [], studio = studioAlle(), sw = paSchwerLevel(a);
  sp.bloecke.forEach(function(b){
    if(b.run){ items.push("run"); return; }
    var bl = { id:uid(), name:b.name, ids:b.ids.slice(), blockRest:b.cardio ? 60 : 0, updatedAt:Date.now(), gen:pid };
    bl.standard = b.std; if(Object.keys(b.modus).length) bl.modus = b.modus;
    stPlaene().push(bl);
    b.ids.forEach(function(id){
      var e = studio[id] || (studio[id] = { log:[] }), z = sp.ziele[id];
      if(z && !e.ziel){ e.ziel = { saetze:z.s, wdh:z.w }; if(e.pause == null) e.pause = z.p; }
      var ex0 = findExercise(id);
      if(!e.timer && ex0 && ex0.main !== "stretch" && b.modus[id] === "timer"){   // Aufwärmen bzw. Cardio-Runde
        if(b.cardio && !b.warm[id]){ var c = PA_CARDIO[sw]; e.timer = { reps:c[0], work:c[1], rest:c[2] }; } else e.timer = { reps:1, work:40, rest:10 };
      }
    });
    items.push("plan:" + bl.id);
  });
  var p = alt || { id:pid, items:[], tage:[], wochen:a.wochen, am:"alle", pos:0 };
  p.name = alt ? alt.name : sp.name; p.items = items; p.tage = a.tage.slice(); p.wochen = a.wochen; p.wp = sp.wp; p.assi = a; p.info = sp.info; p.gen = true; p.updatedAt = Date.now();
  if(!alt) programmListe().push(p);
  pgOffen[p.id] = true;
  var n = paKalender(p);
  save();
  return { p:p, n:n, sp:sp };
}

/* ---------- Fenster ---------- */
var paA = null, paIdx = 0, paEdit = null, paZurUebers = false, paRoot = null, paStart = 0;
function paSchritte(){
  var a = paA, s = [
    { id:"ziel", art:"eins", opt:[["muskel", "dumbbell"], ["kraft", "bolt"], ["abnehmen", "flame"], ["ausdauer", "run"], ["allgemein", "check"], ["beweglich", "stretch"]], pre:"z_", sub:1, spalten:2 },
    { id:"fokus", art:"multi", opt:[["ober", "body"], ["beine", "legs"], ["rumpf", "core"], ["ruecken", "back"], ["ausgew", "all"]], pre:"f_", exkl:"ausgew", opt_:1 },
    { id:"niveau", art:"eins", opt:[["gar", "zzz"], ["unreg", "wave"], ["n12", "one"], ["n3", "many"]], pre:"n_", sub:1 },
    { id:"tage", art:"tage" },
    { id:"dauer", art:"eins", opt:[[20, "t20"], [30, "t30"], [45, "t45"], [60, "t60"]], pre:"d_", spalten:2 },
    { id:"ort", art:"multi", opt:[["heim0", "home"], ["heim1", "dumbbell"], ["studio", "gym"], ["draussen", "tree"]], pre:"o_" },
    { id:"einschr", art:"multi", opt:[["keine", "ok"], ["knie", "knee"], ["schulter", "shoulder"], ["ruecken", "back"], ["handgelenk", "wrist"], ["sprung", "ankle"]], pre:"e_", exkl:"keine", chips:1 },
    { id:"impact", art:"eins", opt:[["gerne", "jump"], ["schonend", "soft"]], pre:"i_", sub:1 },
    { id:"sport", art:"sport", opt_:1 }
  ];
  if(["abnehmen", "ausdauer", "allgemein"].indexOf(a.ziel) > -1) s.push({ id:"laufen", art:"eins", opt:[["kein", "no"], ["ein", "run"], ["reg", "run2"]], pre:"l_", sub:1 });
  if(["beweglich", "allgemein", "abnehmen"].indexOf(a.ziel) > -1) s.push({ id:"mobility", art:"eins", opt:[["nach", "stretch"], ["tag", "cal"], ["nein", "no"]], pre:"m_", sub:1 });
  s.push({ id:"fertig", art:"fertig" });
  return s;
}
var PA_ICO = {
  dumbbell:'<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/>', bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', flame:'<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.5 1 2.2 2 2.5C11 9 11 6 12 3z"/>',
  run:'<circle cx="14" cy="4.5" r="2"/><path d="M6 21l3-6 3 2v5M9 15l1-4 4-1 2 3 3 1M10 11L8 8"/>', run2:'<circle cx="14" cy="4.5" r="2"/><path d="M6 21l3-6 3 2v5M9 15l1-4 4-1 2 3 3 1M10 11L8 8"/>', check:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  stretch:'<circle cx="12" cy="4.5" r="2"/><path d="M5 5.5l7 3 7-3M12 8.5v5M12 13.5l-5 6.5M12 13.5l5 6.5"/>', body:'<path d="M12 3v4M7 8h10M9 8v6M15 8v6M9 14l-1 7M15 14l1 7"/>', legs:'<path d="M9 3h6l1 8-2 10M9 3l-1 8 2 10"/>',
  core:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>', back:'<path d="M12 3v18M7 7c2 1 3 3 3 5s-1 4-3 5M17 7c-2 1-3 3-3 5s1 4 3 5"/>', all:'<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  zzz:'<path d="M5 6h6l-6 6h6M13 13h6l-6 6h6"/>', wave:'<path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>', one:'<path d="M12 5v14M9 8l3-3"/>', many:'<path d="M7 6v12M12 6v12M17 6v12"/>',
  t20:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>', t30:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>', t45:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>', t60:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>',
  home:'<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>', gym:'<path d="M5 21V3M5 7h9M14 3v10M10 13h8v3h-8zM5 17h6"/>', tree:'<path d="M12 21v-6M12 15c-4 0-6-3-6-5 0-3 3-4 4-6 1 2 4 3 4 6 0 2-2 5-2 5z"/>',
  ok:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>', knee:'<path d="M9 3l2 7-3 4 4 7M13 10l4 2"/>', shoulder:'<circle cx="12" cy="6" r="2.5"/><path d="M4 18c0-5 3.5-8.5 8-8.5s8 3.5 8 8.5"/>', wrist:'<path d="M7 20v-7l-2-3a2 2 0 0 1 3-2l2 2V5a1.5 1.5 0 0 1 3 0v4"/>', ankle:'<path d="M9 3v10l-4 3v4h12v-3l-5-2V3"/>',
  jump:'<path d="M12 19V7M7 11l5-5 5 5M6 21h12"/>', soft:'<path d="M4 17c3-5 6-5 8 0s5 5 8-2"/>', no:'<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>', cal:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>'
};
function paZusammen(a){
  var tn = a.tage.map(progTagName).join(" ");
  var rows = [
    ["ziel", pt("k_ziel"), a.ziel ? pt("z_" + a.ziel) : "–"],
    ["fokus", pt("k_fokus"), a.fokus.length && a.fokus.indexOf("ausgew") < 0 ? a.fokus.map(function(f){ return pt("f_" + f); }).join(", ") : pt("keinFokus")],
    ["niveau", pt("k_niveau"), a.niveau ? pt("n_" + a.niveau) : "–"],
    ["tage", pt("k_tage"), tn || "–"],
    ["dauer", pt("k_dauer"), a.dauer ? pt("d_" + a.dauer) : "–"],
    ["ort", pt("k_ort"), a.ort.map(function(o){ return pt("o_" + o); }).join(", ") || "–"],
    ["einschr", pt("k_einschr"), a.einschr.length ? a.einschr.map(function(e){ return pt("e_" + e); }).join(", ") : pt("e_keine")],
    ["impact", pt("k_impact"), a.impact ? pt("i_" + a.impact) : "–"],
    ["sport", pt("k_sport"), a.sport ? a.sport.name + " · " + progTagName(a.sport.tag) : pt("sp_keiner")]
  ];
  if(a.laufen) rows.push(["laufen", pt("k_laufen"), pt("l_" + a.laufen)]);
  if(a.mobility) rows.push(["mobility", pt("k_mobility"), pt("m_" + a.mobility)]);
  return rows;
}
function paZeichnen(){
  var steps = paSchritte(), idx = Math.max(0, Math.min(paIdx, steps.length - 1)), s = steps[idx], a = paA, sichtbar = steps.length;
  var h = '<div class="confirm-overlay pa-overlay"><div class="confirm-sheet pa-sheet" role="dialog" aria-label="'+esc(pt("titel"))+'">'+
    '<div class="pa-kopf">'+(idx > 0 && !paZurUebers ? '<button type="button" class="pa-x pa-zurueck" data-pa-zurueck2 aria-label="'+esc(pt("zurueckPfeil"))+'">'+svgIcon('<path d="M15 5l-7 7 7 7"/>')+'</button>' : '<span class="pa-x leer" aria-hidden="true"></span>')+'<span class="pa-zaehler">'+esc(s.art === "fertig" ? pt("uebersicht") : pt("frageVon", { n:idx + 1, m:sichtbar - 1 }))+'</span>'+
    '<button type="button" class="pa-x" data-pa-x aria-label="'+esc(pt("abbrechen"))+'">'+svgIcon('<path d="M6 6l12 12M18 6L6 18"/>')+'</button></div>'+
    '<div class="pa-balken" role="progressbar" aria-valuemin="1" aria-valuemax="'+(sichtbar - 1)+'" aria-valuenow="'+Math.min(idx + 1, sichtbar - 1)+'">'+steps.slice(0, sichtbar - 1).map(function(x, k){ return '<i class="'+(k < idx || s.art === "fertig" ? 'fertig' : k === idx ? 'jetzt' : '')+'"></i>'; }).join("")+'</div>'+
    '<h3 class="pa-titel">'+esc(pt("q_" + s.id))+'</h3><p class="pa-hinweis">'+esc(pt("h_" + s.id))+'</p><div class="pa-body" data-pa-body>';
  var weiterOk = true;
  if(s.art === "eins" || s.art === "multi"){
    if(s.art === "multi") h += '<p class="pa-mehrere">'+esc(pt("mehrere"))+'</p>';
    var gew = a[s.id], sel = function(id){ return s.art === "eins" ? String(gew) === String(id) : (id === "keine" ? !a.einschr.length : selArr(gew).indexOf(String(id)) > -1 || (s.id === "ort" && selArr(gew).indexOf(id) > -1)); };
    h += '<div class="pa-opts'+(s.chips ? ' chips' : '')+(s.spalten === 2 ? ' zwei' : '')+'" role="'+(s.art === "eins" ? "radiogroup" : "group")+'">'+s.opt.map(function(o){
      var an = s.id === "einschr" && o[0] === "keine" ? !a.einschr.length : (s.art === "eins" ? String(gew) === String(o[0]) : selArr(gew).map(String).indexOf(String(o[0])) > -1);
      return '<button type="button" class="pa-opt'+(an ? ' an' : '')+'" data-pa-opt="'+esc(String(o[0]))+'" aria-pressed="'+an+'"><span class="pa-ico">'+svgIcon(PA_ICO[o[1]] || PA_ICO.check)+'</span><span class="pa-ot"><b>'+esc(pt(s.pre + o[0]))+'</b>'+(s.sub || s.pre === "z_" ? '<small>'+esc(pt(s.pre + o[0] + "_s"))+'</small>' : "")+'</span><i class="pa-haken" aria-hidden="true">'+svgIcon('<path d="M5 12.5l4.5 4.5L19 7"/>')+'</i></button>';
    }).join("")+'</div>';
    weiterOk = s.opt_ ? true : (s.art === "eins" ? !!gew : (s.id === "einschr" ? true : selArr(gew).length > 0));
  } else if(s.art === "tage"){
    h += '<div class="pa-tage" role="group">'+[0, 1, 2, 3, 4, 5, 6].map(function(d){ var an = a.tage.indexOf(d) > -1; return '<button type="button" class="pa-tag'+(an ? ' an' : '')+'" data-pa-tag="'+d+'" aria-pressed="'+an+'">'+esc(progTagName(d))+'</button>'; }).join("")+'</div>'+
      '<p class="pa-summe">'+esc(a.tage.length ? pt("tagePro", { n:a.tage.length }) : "")+'</p>';
    weiterOk = a.tage.length > 0;
  } else if(s.art === "sport"){
    var sp = a.sport || { name:"", tag:-1 };
    h += '<input type="text" class="pa-eingabe" data-pa-sportname maxlength="24" value="'+esc(sp.name)+'" placeholder="'+esc(pt("sp_name"))+'" autocomplete="off">'+
      '<div class="pa-tage kl" role="group" aria-label="'+esc(pt("sp_tag"))+'">'+[0, 1, 2, 3, 4, 5, 6].map(function(d){ var an = sp.tag === d; return '<button type="button" class="pa-tag'+(an ? ' an' : '')+'" data-pa-sporttag="'+d+'" aria-pressed="'+an+'">'+esc(progTagName(d))+'</button>'; }).join("")+'</div>';
    weiterOk = !a.sport || (a.sport.name && a.sport.tag >= 0) || !a.sport.name;
  } else if(s.art === "fertig"){
    var sw = a.schwer || paSchwerStandard(a), sp2 = null, geht = paVollstaendig(a);
    if(geht){ try { sp2 = paErzeuge(a); } catch(err){ sp2 = null; } }
    h += '<div class="pa-schwer" role="radiogroup" aria-label="'+esc(pt("schwerTitel"))+'">'+["leicht", "mittel", "schwer"].map(function(k){ var an = sw === k, nein = k === "schwer" && !paSchwerErlaubt(a); return '<button type="button" class="pa-opt kompakt'+(an ? ' an' : '')+(nein ? ' aus' : '')+'" data-pa-schwer="'+k+'"'+(nein ? ' disabled title="'+esc(pt("schwerNein"))+'"' : '')+' aria-pressed="'+an+'"><span class="pa-ot"><b>'+esc(pt("s_" + k))+'</b><small>'+esc(pt("s_" + k + "_s"))+'</small></span></button>'; }).join("")+'</div>'+
      (sp2 ? '<div class="pa-vorschau"><b>'+esc(sp2.name)+'</b><small>'+esc(pt("einheitenSumme", { n:sp2.nTage, m:a.wochen }))+'</small><small>'+esc(pt("who", { m:sp2.minuten, k:sp2.kraftTage }))+'</small></div>' : "")+
      '<div class="pa-liste">'+paZusammen(a).map(function(r){ return '<button type="button" class="pa-zeile" data-pa-sprung="'+r[0]+'"><span>'+esc(r[1])+'</span><b>'+esc(r[2])+'</b><i>'+esc(pt("aendern"))+'</i></button>'; }).join("")+'</div>'+
      '<details class="pa-mehr"'+(paEdit ? ' open' : '')+'><summary>'+esc(pt("mehr"))+'</summary><div class="pa-mehr-in"><div class="pa-label">'+esc(pt("alter"))+'</div><div class="pa-chips">'+
        [["u50", "a_u50"], ["50", "a_50"], ["65", "a_65"]].map(function(x){ return '<button type="button" class="pa-chip'+(a.alter === x[0] ? ' an' : '')+'" data-pa-alter="'+x[0]+'" aria-pressed="'+(a.alter === x[0])+'">'+esc(pt(x[1]))+'</button>'; }).join("")+
        '</div><div class="pa-label">'+esc(pt("wochenT"))+'</div><div class="pa-chips">'+[4, 6, 8].map(function(w){ return '<button type="button" class="pa-chip'+(a.wochen === w ? ' an' : '')+'" data-pa-wochen="'+w+'" aria-pressed="'+(a.wochen === w)+'">'+esc(pt("wochenN", { n:w }))+'</button>'; }).join("")+'</div></div></details>';
    weiterOk = geht;
  }
  var letzte = s.art === "fertig";
  h += '</div>'+(!weiterOk && !letzte ? '<p class="pa-sperre" role="status">'+esc(pt("waehleMind"))+'</p>' : "")+(letzte ? '<p class="pa-lokal">'+esc(pt("lokal"))+'</p>' : "")+'<div class="pa-fuss">'+
    '<button type="button" class="btn btn-secondary" data-pa-zurueck'+(idx === 0 && !paZurUebers ? '' : '')+'>'+esc(idx === 0 ? pt("abbrechen") : pt("zurueck"))+'</button>'+
    '<button type="button" class="btn btn-primary" data-pa-weiter'+(weiterOk ? '' : ' disabled')+'>'+esc(letzte ? (paEdit ? pt("uebernehmen") : pt("fertigBtn")) : (s.opt_ && !paHatAntwort(s, a) ? pt("ueberspringen") : pt("weiter")))+'</button></div></div></div>';
  paRoot.innerHTML = h;
  paBinden(s, idx, steps);
}
function paHatAntwort(s, a){
  if(s.id === "fokus") return a.fokus.length > 0;
  if(s.id === "sport") return !!(a.sport && a.sport.name);
  return true;
}
function paWeiter(steps){
  if(paZurUebers){ paZurUebers = false; paIdx = paSchritte().length - 1; }
  else paIdx = Math.min(paSchritte().length - 1, paIdx + 1);
  paZeichnen();
}
function paBinden(s, idx, steps){
  var a = paA;
  function schliessen(){ paRoot.innerHTML = ""; paA = null; paEdit = null; }
  function abbrechen(){
    var begonnen = a.ziel || a.tage.length || a.ort.length;
    if(!begonnen || paEdit) return schliessen();
    confirmSheet(pt("abbruchQ"), pt("abbruchT"), pt("verwerfen"), schliessen);
  }
  paRoot.querySelector("[data-pa-x]").addEventListener("click", abbrechen);
  paRoot.querySelector(".pa-overlay").addEventListener("click", function(e){ if(e.target.classList.contains("pa-overlay")) abbrechen(); });
  paRoot.querySelector("[data-pa-zurueck]").addEventListener("click", function(){
    if(paZurUebers){ paZurUebers = false; paIdx = steps.length - 1; return paZeichnen(); }
    if(idx === 0) return abbrechen();
    paIdx = idx - 1; paZeichnen();
  });
  var zp = paRoot.querySelector("[data-pa-zurueck2]");
  if(zp) zp.addEventListener("click", function(){ paIdx = idx - 1; paZeichnen(); });
  paRoot.querySelector("[data-pa-weiter]").addEventListener("click", function(){
    if(s.art === "fertig") return paLaden();
    if(s.id === "sport" && a.sport && (!a.sport.name || a.sport.tag < 0)) a.sport = a.sport.name ? a.sport : null;
    paWeiter(steps);
  });
  paRoot.querySelectorAll("[data-pa-opt]").forEach(function(b){
    b.addEventListener("click", function(){
      var v = b.getAttribute("data-pa-opt"), k = s.id;
      if(s.art === "eins"){
        a[k] = k === "dauer" ? +v : v;
        if(k === "niveau" && !a.schwer) {}
        paZeichnen();
        setTimeout(function(){ if(paA === a && steps[idx] && steps[idx].id === k){ if(paZurUebers){ paZurUebers = false; paIdx = paSchritte().length - 1; } else paIdx = Math.min(paSchritte().length - 1, paIdx + 1); paZeichnen(); } }, 220);
        return;
      }
      var l = selArr(a[k]);
      if(v === (s.exkl || "")){ l = v === "keine" ? [] : [v]; }
      else { l = l.filter(function(x){ return x !== s.exkl; }); var i = l.indexOf(v); if(i > -1) l.splice(i, 1); else l.push(v); }
      a[k] = l; paZeichnen();
    });
  });
  paRoot.querySelectorAll("[data-pa-tag]").forEach(function(b){ b.addEventListener("click", function(){
    var d = +b.getAttribute("data-pa-tag"), i = a.tage.indexOf(d); if(i > -1) a.tage.splice(i, 1); else if(a.tage.length < 6) a.tage.push(d); a.tage.sort(function(x, y){ return x - y; }); paZeichnen();
  }); });
  var nm = paRoot.querySelector("[data-pa-sportname]");
  if(nm) nm.addEventListener("input", function(){ var v = nm.value.slice(0, 24); a.sport = { name:v, tag:a.sport ? a.sport.tag : -1 }; var wb = paRoot.querySelector("[data-pa-weiter]"); if(wb){ wb.textContent = v.trim() ? pt("weiter") : pt("ueberspringen"); wb.disabled = !!v.trim() && (!a.sport || a.sport.tag < 0); } });
  paRoot.querySelectorAll("[data-pa-sporttag]").forEach(function(b){ b.addEventListener("click", function(){
    var d = +b.getAttribute("data-pa-sporttag"), nme = nm ? nm.value.slice(0, 24) : (a.sport ? a.sport.name : ""); a.sport = { name:nme, tag:d }; paZeichnen();
    var n2 = paRoot.querySelector("[data-pa-sportname]"); if(n2) n2.value = nme;
  }); });
  var sw = paRoot.querySelector("[data-pa-weiter]");
  if(s.id === "sport" && sw){ sw.disabled = !!(a.sport && a.sport.name && a.sport.name.trim() && a.sport.tag < 0); }
  paRoot.querySelectorAll("[data-pa-schwer]").forEach(function(b){ b.addEventListener("click", function(){ a.schwer = b.getAttribute("data-pa-schwer"); paZeichnen(); }); });
  paRoot.querySelectorAll("[data-pa-alter]").forEach(function(b){ b.addEventListener("click", function(){ a.alter = b.getAttribute("data-pa-alter"); var o = paRoot.querySelector(".pa-mehr"); paZeichnen(); var o2 = paRoot.querySelector(".pa-mehr"); if(o2) o2.open = true; }); });
  paRoot.querySelectorAll("[data-pa-wochen]").forEach(function(b){ b.addEventListener("click", function(){ a.wochen = +b.getAttribute("data-pa-wochen"); paZeichnen(); var o2 = paRoot.querySelector(".pa-mehr"); if(o2) o2.open = true; }); });
  paRoot.querySelectorAll("[data-pa-sprung]").forEach(function(b){ b.addEventListener("click", function(){
    var id = b.getAttribute("data-pa-sprung"), st = paSchritte(), i = st.map(function(x){ return x.id; }).indexOf(id);
    if(i > -1){ paIdx = i; paZurUebers = true; paZeichnen(); }
  }); });
}
function paLaden(){   // kurzer Ladezustand, damit das Zusammenstellen spürbar ist (ruhiger als ein Sprung)
  var a = paSauber(paA);
  if(!paVollstaendig(a)) return;
  paRoot.innerHTML = '<div class="confirm-overlay pa-overlay"><div class="confirm-sheet pa-sheet pa-ende" role="status"><div class="pa-ring" aria-hidden="true"></div><h3 class="pa-titel">'+esc(pt("bauen"))+'</h3></div></div>';
  var kurz = false; try { kurz = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch(err){}
  setTimeout(paFertig, kurz ? 0 : 700);
}
function paFertig(){
  var a = paSauber(paA), ersetze = paEdit;
  if(!paVollstaendig(a)) return;
  var res;
  try { res = paAnlegen(a, ersetze); } catch(err){ showToast(t("fileError")); return; }
  var p = res.p, sp = res.sp;
  var tageText = sp.wp.filter(function(w){ return w.art !== "sport"; }).map(function(w){
    var it = w.run ? pt("lauf") : sp.bloecke[w.i] && sp.bloecke[w.i].name || "";
    return '<div class="pa-wz"><span>'+esc(progTagName(w.tag))+'</span><b>'+esc(it)+'</b></div>';
  }).join("");
  paRoot.innerHTML = '<div class="confirm-overlay pa-overlay"><div class="confirm-sheet pa-sheet pa-ende" role="dialog" aria-label="'+esc(pt("erstellt"))+'">'+
    '<div class="pa-haken-gross" aria-hidden="true">'+svgIcon('<path d="M5 12.5l4.5 4.5L19 7"/>')+'</div><h3 class="pa-titel">'+esc(ersetze ? pt("angepasst") : pt("erstellt"))+'</h3>'+
    '<p class="pa-hinweis">'+esc(p.name)+' · '+esc(pt("inKalenderOk", { n:res.n }))+'</p>'+
    '<div class="pa-punkte" aria-hidden="true">'+[0, 1, 2, 3, 4, 5, 6].map(function(d){ var an = sp.wp.some(function(w){ return w.tag === d && w.art !== "sport"; }); return '<span class="'+(an ? 'an' : '')+'"><i></i><small>'+esc(progTagName(d))+'</small></span>'; }).join("")+'</div>'+
    '<div class="pa-woche">'+tageText+'</div>'+
    '<p class="pa-lokal">'+esc(pt("spaeter"))+'</p>'+
    '<div class="pa-fuss stapel"><button type="button" class="btn btn-primary" data-pa-ansehen>'+esc(pt("ansehen"))+'</button>'+
    '<button type="button" class="btn btn-secondary" data-pa-kalaus>'+esc(pt("ausKalender"))+'</button>'+
    '<button type="button" class="btn btn-secondary" data-pa-ok>'+esc(pt("fertig"))+'</button></div></div></div>';
  function zu(){ paRoot.innerHTML = ""; paA = null; paEdit = null; var rt = parseHash()[0]; if(rt === "koerper") renderKoerper(); else if(rt === "katalog") renderKatalog && renderKatalog(); }
  paRoot.querySelector("[data-pa-ok]").addEventListener("click", zu);
  paRoot.querySelector("[data-pa-ansehen]").addEventListener("click", function(){ paRoot.innerHTML = ""; paA = null; paEdit = null; pgOffen[p.id] = true; if(parseHash()[0] === "koerper") renderKoerper(); else go("#koerper"); });
  paRoot.querySelector("[data-pa-kalaus]").addEventListener("click", function(){ var n = programmAusKalender(p); showToast(pt("ausKalenderOk", { n:n })); zu(); });
}
/* Einstieg: neuer Plan (a = null) oder Anpassen (a = gespeicherte Antworten, ersetze = Plan-ID) */
function paOeffnen(a, ersetze){
  paRoot = document.getElementById("overlayRoot");
  paA = a ? paSauber(a) : paSauber(null); paEdit = ersetze || null; paZurUebers = false;
  paIdx = ersetze ? paSchritte().length - 1 : 0;
  paZeichnen();
}
