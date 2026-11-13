"use strict";
/* ============ Plan-Assistent (Workout-Builder › „Trainingsplan erstellen lassen“) ============
   Ein paar Fragen und BLOC baut daraus eigene BLOCs und Trainingspläne und legt sie in den Kalender. Die Fragen nutzen die Attribute, die BLOC schon hat:
   Ziele, Muskelgruppen, Trainingsart (Fitnessstudio · Calisthenic-Park · Körpergewicht), Ausrüstung (Geräte), Schwierigkeit, Bereiche (Workout, Run, Mobility & Stretch, Timer).
   Aufbau: Übung → BLOC → TrainingsBLOC (ein Trainingstag, enthält die BLOCs des Tages) → Plan (alle TrainingsBLOCs einer Gruppe). Jeder Trainingstag wird ein ganz normaler,
   danach frei editierbarer TrainingsBLOC (settings.programme) mit Wochentag und Wochenzahl; seine Teile sind Verweise auf vorhandene Aufwärm- und Dehn-Workouts
   (lib:…), eigene BLOCs (plan:…, settings.stPlaene, gen = Plan-Gruppe) und „run“. Alle gehören über p.gruppe zusammen; p.assi (nur am ersten Tag) hält die Antworten für „Plan anpassen“.
   Läuft als Fenster über dem Baukasten, jederzeit abbrechbar. Alles lokal, nichts wird geladen oder gesendet. Regeln und Quellen: docs/PLAN-ASSISTENT.md. Orientierung, keine Beratung. */

/* ---------- Texte ---------- */
var PAT = {
  de:{
    titel:"Trainingsplan erstellen", abbrechen:"Abbrechen", zurueck:"Zurück", weiter:"Weiter", ueberspringen:"Überspringen", fertigBtn:"Plan erstellen", fertig:"Fertig",
    frageVon:"Frage {n} von {m}", uebersicht:"Übersicht", aendern:"ändern", erstellt:"Dein Plan ist fertig", erstelltSub:"Er liegt im Kalender.",
    ansehen:"Ansehen", ausKalender:"Aus Kalender nehmen", ausKalenderOk:"Plan aus dem Kalender genommen: {n} Termine entfernt", inKalenderOk:"{n} Termine im Kalender", inKalenderOk2:"{n} Termine im Kalender",
    angepasst:"Plan angepasst", planAnpassen:"Plan anpassen", planKalAus:"Ganzen Plan aus dem Kalender nehmen", planKalEin:"Ganzen Plan in den Kalender übertragen", planWeg:"Ganzen Plan löschen",
    planWegQ:"Ganzen Plan löschen?", planWegT:"Alle Trainingstage des Plans mit ihren BLOCs und Terminen.", abbruchQ:"Abbrechen?", abbruchT:"Deine Antworten gehen verloren.", verwerfen:"Abbrechen", weiterMachen:"Weitermachen",
    eintrag:"Trainingsplan erstellen lassen", eintragSub:"Ein paar Fragen, dann baut BLOC deinen Plan aus TrainingsBLOCs und legt ihn in den Kalender",
    q_ziele:"Was sind deine Ziele?", h_ziele:"Mehrere möglich. Das erste, das du antippst, ist dein Hauptziel.",
    q_fokus:"Welche Muskeln sollen mehr Aufmerksamkeit bekommen?", h_fokus:"Optional. Tippe auf die Figur oder die Gruppen, mehrere möglich. Der Plan bleibt ausgewogen, diese Muskeln bekommen etwas mehr Gewicht.",
    q_niveau:"Wie aktiv bist du aktuell?", h_niveau:"Das bestimmt Startumfang und Tempo der Steigerung.",
    q_schwer:"Wie intensiv willst du trainieren?", h_schwer:"Von Anfänger bis schwer. Du kannst das später im Plan ändern.",
    q_tage:"An welchen Tagen willst du trainieren?", h_tage:"Tippe die Wochentage an. Jeder Tag wird ein eigener TrainingsBLOC. Zwei Krafttage pro Woche sind ein guter Start.",
    q_dauer:"Wie viel Zeit hast du pro Einheit?", h_dauer:"Das Aufwärmen zählt mit.",
    q_train:"Welche Trainingsart passt zu dir?", h_train:"Wie im Katalog, mehrere möglich. Körpergewicht geht immer dazu.",
    q_ausr:"Welche Geräte hast du?", h_ausr:"Mehrere möglich. So kommen nur Übungen vor, die du auch ausführen kannst.", g_keine:"Keine Geräte", geraetFehlt:"Hinweis: {g} kommt im Plan nicht vor. Zur gewählten Trainingsart gibt es dafür keine passende Übung. Ergänze Fitnessstudio oder Calisthenic-Park als Trainingsart oder nimm das Gerät heraus.",
    q_bereiche:"Welche BLOC-Bereiche sollen im Plan vorkommen?", h_bereiche:"Mehrere möglich. Workout ist die Basis, dazu Run und Mobility & Stretch als eigener Tag.",
    q_einschr:"Gibt es etwas, worauf wir Rücksicht nehmen sollen?", h_einschr:"Betroffene Bewegungen werden durch Alternativen ersetzt. Das ersetzt keine ärztliche Beratung.",
    q_impact:"Wie sieht es mit Sprüngen aus?", h_impact:"Sprünge und harte Landungen belasten Gelenke.",
    q_sport:"Machst du schon einen anderen Sport?", h_sport:"Optional. Er kommt als fester Termin in den Kalender und zählt als Belastung: Rund um den Sport wird nicht an den Beinen trainiert.",
    q_fertig:"Alles bereit?", h_fertig:"Prüfe die Übersicht. Antippen ändert eine Antwort.",
    z_muskel:"Muskelaufbau", z_muskel_s:"Kräftiger und definierter", z_kraft:"Kraft", z_kraft_s:"Stärker werden", z_abnehmen:"Abnehmen", z_abnehmen_s:"Aktiver, mehr Energieumsatz",
    z_ausdauer:"Ausdauer", z_ausdauer_s:"Länger durchhalten", z_allgemein:"Allgemein fit", z_allgemein_s:"Von allem etwas", z_beweglich:"Beweglichkeit", z_beweglich_s:"Locker und beweglich",
    f_ausgew:"Ausgewogen",
    n_gar:"Gerade gar nicht", n_gar_s:"Ich fange neu an", n_unreg:"Unregelmäßig", n_unreg_s:"Mal ja, mal nein", n_n12:"1–2× pro Woche", n_n12_s:"Regelmäßig, aber wenig", n_n3:"3× oder öfter", n_n3_s:"Ich trainiere regelmäßig",
    d_20:"20 min", d_30:"30 min", d_45:"45 min", d_60:"60 min oder mehr",
    t_studio:"Hanteln, Geräte, Kabel", t_cali:"Stange, Barren, Körpergewicht", t_body:"Ohne Geräte, überall",
    e_keine:"Keine", e_knie:"Knie", e_schulter:"Schulter", e_ruecken:"Rücken", e_handgelenk:"Handgelenk", e_sprung:"Sprunggelenk",
    i_gerne:"Gerne mit Sprüngen", i_gerne_s:"Auch explosiv und mit Cardio-Sprüngen", i_schonend:"Lieber gelenkschonend", i_schonend_s:"Ohne Sprünge und harte Landungen",
    sp_name:"Sportart, z. B. Fußball", sp_tag:"An welchem Tag?", sp_keiner:"Kein anderer Sport",
    b_workout:"Workout", b_workout_s:"Kraft, Calisthenics, Körpergewicht", b_run:"Run", b_run_s:"Laufen mit Aufzeichnung", b_mobility:"Mobility & Stretch", b_mobility_s:"Zusätzlich ein eigener Mobility-Tag an einem freien Wochentag", b_timer:"Timer-Intervalle", b_timer_s:"Cardio-Zirkel mit Timer",
    l_ein:"Einsteiger (Geh-Lauf)", l_reg:"Ich laufe regelmäßig", m_nach:"Nach jeder Einheit", m_tag:"Eigener Tag", m_beide:"Beides",
    s_anfaenger:"Anfänger", s_anfaenger_s:"Ruhig und sicher starten", s_leicht:"Leicht", s_leicht_s:"Sanft und machbar", s_mittel:"Mittel", s_mittel_s:"Fordernd, aber fair", s_schwer:"Schwer", s_schwer_s:"Hart, für Geübte",
    schwerTitel:"Wie intensiv?", mehr:"Weitere Optionen", alter:"Altersbereich", a_u50:"unter 50", a_50:"50–64", a_65:"65+", wochenT:"Planlänge", wochenN:"{n} Wochen",
    k_ziele:"Ziele", k_fokus:"Fokus", k_niveau:"Aktivität", k_schwer:"Intensität", k_tage:"Tage", k_dauer:"Zeit", k_train:"Trainingsart", k_ausr:"Geräte", k_bereiche:"Bereiche", k_einschr:"Einschränkungen", k_impact:"Impact", k_sport:"Anderer Sport",
    tagePro:"{n} Tage pro Woche", einheitenSumme:"{n} TrainingsBLOCs pro Woche · {m} Wochen", keinFokus:"ausgewogen", alles:"alle",
    gk:"Ganzkörper", ok:"Oberkörper", uk:"Unterkörper", cardio:"Intervall-Cardio", mob:"Mobility", erh:"Aktive Erholung", lauf:"Run", lauf_ein:"Run: Geh-Lauf", sportName:"Sport", sportSub:"Fester Termin",
    planName:"{z} · {n}× pro Woche", tagName:"{z} · Tag {n} · {p}", blocName:"{z} {t}", aufwaermen:"Aufwärmen", dehnen:"Dehnen", mainBloc:"{z} {t}",
    einEinheit:"Mit nur einem Trainingstag pro Woche bleibt jede Muskelgruppe bei einmal pro Woche. Zwei Tage sind besser (WHO: mindestens zwei Tage Krafttraining).",
    info0:"Starte mit 5 bis 10 Minuten Aufwärmen. Dehnen kannst du in den TrainingsBLOCs von Hand ergänzen.",
    info1:"Höre jeden Satz {r} Wiederholungen vor dem Muskelversagen auf; bis zum Versagen musst du nicht gehen. Schaffst du zweimal in allen Sätzen die obere Wiederholungszahl, schlägt BLOC die nächste Gewichtsstufe vor (meist 2 bis 10 % mehr), danach beginnst du wieder unten im Bereich. Ohne Gewicht: eine schwerere Variante oder mehr Wiederholungen.",
    info2:"Leichtwoche in Woche {n}: etwa 60 % der Sätze, Gewicht gleich oder etwas leichter und bis zu 4 Wiederholungen in Reserve, damit du dich erholst.",
    info3:"Laufen für Einsteiger: im Wechsel 1 Minute laufen und 1,5 bis 2 Minuten gehen, bis zu dreimal pro Woche mit Ruhetag dazwischen, jede Woche etwas länger laufen.",
    info3b:"Laufumfang vorsichtig steigern, etwa 10 % pro Woche, nie mehr als 30 %.",
    info4:"Bei Schmerzen (nicht bei Muskelbrennen), Schwindel oder Druck auf der Brust sofort abbrechen. Bei Vorerkrankungen vorher ärztlich abklären. Orientierung, keine medizinische Beratung.",
    info5:"Ab 65: dazu eine Gleichgewichts-Übung (sicher an Wand oder Stuhl), langsam und kontrolliert, feste Standfläche.",
    info6:"Nach dem Sport „{s}“ bleibt der Unterkörper zwei Tage ohne schwere Belastung.",
    quelle:"Grundlage: WHO-Leitlinien 2020, ACSM Position Stand 2026 und weitere offene Studien (quellen.html). Zahlen für Sätze, Pausen und Steigerung sind Empfehlungen von BLOC.",
    infoTitel:"Hinweise zum Plan",
    mehrere:"Mehrere möglich", waehleMind:"Wähle mindestens eine Option.", bauen:"Plan wird zusammengestellt …", lokal:"Wird nur auf deinem Gerät erstellt.", spaeter:"Du kannst jeden Trainingstag danach wie gewohnt bearbeiten, auch durch langes Drücken auf die Karte.", uebernehmen:"Änderungen übernehmen", zurueckPfeil:"Zurück zur vorigen Frage",
    leichtwoche:"Leichtwoche", lauf_w:"Geh-Lauf: {a} Min laufen, {b} Min gehen · {n}×", who:"Etwa {m} Minuten Training pro Woche, {k} Krafttage. WHO: 150 bis 300 Minuten moderate Aktivität und mindestens zwei Krafttage pro Woche.", schwerNein:"Für dein Niveau nicht vorgesehen",
    ohneZug:"Für echtes Rudern fehlt dir Stange, Band oder Gerät – deshalb trainieren Übungen im Liegen den oberen Rücken. Mit einem Widerstandsband (unter „Geräte“ wählen) baut BLOC Rudern ein.",
    whoRest:"Den Rest bis 150 Minuten schaffst du nebenbei, z. B. mit zügigen Spaziergängen, Radfahren oder Treppen im Alltag.",
    endeTitel:"Plan geschafft", endeText:"{p}: {n} von {m} Trainings erledigt. Weiter mit denselben Übungen und deinen aktuellen Gewichten?",
    endeWeiter:"Nächsten Block starten", endeNeu:"Neuen Plan erstellen", endeAus:"Ausblenden", endeOk:"{n} Termine für die nächsten {w} Wochen im Kalender",
    tageListe:"Trainingstage"
  },
  en:{
    titel:"Create a training plan", abbrechen:"Cancel", zurueck:"Back", weiter:"Next", ueberspringen:"Skip", fertigBtn:"Create plan", fertig:"Done",
    frageVon:"Question {n} of {m}", uebersicht:"Overview", aendern:"change", erstellt:"Your plan is ready", erstelltSub:"It is in your calendar.",
    ansehen:"View", ausKalender:"Remove from calendar", ausKalenderOk:"Plan removed from the calendar: {n} sessions", inKalenderOk:"{n} sessions in the calendar", inKalenderOk2:"{n} sessions in the calendar",
    angepasst:"Plan updated", planAnpassen:"Adjust plan", planKalAus:"Remove whole plan from calendar", planKalEin:"Add whole plan to calendar", planWeg:"Delete whole plan",
    planWegQ:"Delete whole plan?", planWegT:"All training days of the plan with their BLOCs and sessions.", abbruchQ:"Cancel?", abbruchT:"Your answers will be lost.", verwerfen:"Cancel", weiterMachen:"Keep going",
    eintrag:"Have a training plan created", eintragSub:"A few questions, then BLOC builds your plan from TrainingsBLOCs and puts it in the calendar",
    q_ziele:"What are your goals?", h_ziele:"Several possible. The first one you tap is your main goal.",
    q_fokus:"Which muscles should get more attention?", h_fokus:"Optional. Tap the figure or the groups, several possible. The plan stays balanced; these muscles get a bit more weight.",
    q_niveau:"How active are you right now?", h_niveau:"This sets the starting volume and how fast it builds.",
    q_schwer:"How intensely do you want to train?", h_schwer:"From beginner to hard. You can change it in the plan later.",
    q_tage:"Which days do you want to train?", h_tage:"Tap the weekdays. Each day becomes its own TrainingsBLOC. Two strength days a week are a good start.",
    q_dauer:"How much time per session?", h_dauer:"The warm-up is included.",
    q_train:"Which type of training suits you?", h_train:"As in the catalogue, several possible. Bodyweight is always included.",
    q_ausr:"Which equipment do you have?", h_ausr:"Several possible. Only exercises you can actually do will appear.", g_keine:"No equipment", geraetFehlt:"Note: {g} does not appear in the plan. There is no matching exercise for the chosen training type. Add gym or calisthenics park as a training type, or remove the equipment.",
    q_bereiche:"Which BLOC areas should the plan include?", h_bereiche:"Several possible. Workout is the base, plus Run and Mobility & Stretch as its own day.",
    q_einschr:"Is there anything we should take into account?", h_einschr:"Affected movements are swapped for alternatives. This does not replace medical advice.",
    q_impact:"How about jumps?", h_impact:"Jumps and hard landings load the joints.",
    q_sport:"Do you already do another sport?", h_sport:"Optional. It goes into the calendar as a fixed date and counts as load: no leg training around it.",
    q_fertig:"All set?", h_fertig:"Check the overview. Tap an answer to change it.",
    z_muskel:"Build muscle", z_muskel_s:"Stronger and more defined", z_kraft:"Strength", z_kraft_s:"Get stronger", z_abnehmen:"Lose weight", z_abnehmen_s:"More active, more energy use",
    z_ausdauer:"Endurance", z_ausdauer_s:"Last longer", z_allgemein:"General fitness", z_allgemein_s:"A bit of everything", z_beweglich:"Mobility", z_beweglich_s:"Loose and flexible",
    f_ausgew:"Balanced",
    n_gar:"Not at all right now", n_gar_s:"I am starting fresh", n_unreg:"Irregularly", n_unreg_s:"Sometimes yes, sometimes no", n_n12:"1–2× a week", n_n12_s:"Regular, but little", n_n3:"3× or more", n_n3_s:"I train regularly",
    d_20:"20 min", d_30:"30 min", d_45:"45 min", d_60:"60 min or more",
    t_studio:"Dumbbells, machines, cable", t_cali:"Bar, dips, bodyweight", t_body:"No equipment, anywhere",
    e_keine:"None", e_knie:"Knee", e_schulter:"Shoulder", e_ruecken:"Back", e_handgelenk:"Wrist", e_sprung:"Ankle",
    i_gerne:"Jumps are fine", i_gerne_s:"Explosive moves and jumping cardio too", i_schonend:"Easy on the joints", i_schonend_s:"No jumps or hard landings",
    sp_name:"Sport, e.g. football", sp_tag:"On which day?", sp_keiner:"No other sport",
    b_workout:"Workout", b_workout_s:"Strength, calisthenics, bodyweight", b_run:"Run", b_run_s:"Running with tracking", b_mobility:"Mobility & Stretch", b_mobility_s:"Plus its own mobility day on a free weekday", b_timer:"Timer intervals", b_timer_s:"Cardio circuit with timer",
    l_ein:"Beginner (walk-run)", l_reg:"I run regularly", m_nach:"After every session", m_tag:"Its own day", m_beide:"Both",
    s_anfaenger:"Beginner", s_anfaenger_s:"Start calm and safe", s_leicht:"Easy", s_leicht_s:"Gentle and doable", s_mittel:"Medium", s_mittel_s:"Demanding but fair", s_schwer:"Hard", s_schwer_s:"Tough, for experienced",
    schwerTitel:"How intense?", mehr:"More options", alter:"Age range", a_u50:"under 50", a_50:"50–64", a_65:"65+", wochenT:"Plan length", wochenN:"{n} weeks",
    k_ziele:"Goals", k_fokus:"Focus", k_niveau:"Activity", k_schwer:"Intensity", k_tage:"Days", k_dauer:"Time", k_train:"Training type", k_ausr:"Equipment", k_bereiche:"Areas", k_einschr:"Limitations", k_impact:"Impact", k_sport:"Other sport",
    tagePro:"{n} days a week", einheitenSumme:"{n} TrainingsBLOCs a week · {m} weeks", keinFokus:"balanced", alles:"all",
    gk:"Full body", ok:"Upper body", uk:"Lower body", cardio:"Interval cardio", mob:"Mobility", erh:"Active recovery", lauf:"Run", lauf_ein:"Run: walk-run", sportName:"Sport", sportSub:"Fixed date",
    planName:"{z} · {n}× a week", tagName:"{z} · Day {n} · {p}", blocName:"{z} {t}", aufwaermen:"Warm-up", dehnen:"Stretching", mainBloc:"{z} {t}",
    einEinheit:"With one training day a week every muscle group is trained once. Two days are better (WHO: at least two days of strength training).",
    info0:"Start with 5 to 10 minutes of warm-up. You can add stretching to the TrainingsBLOCs by hand.",
    info1:"Stop every set {r} reps before muscle failure; you do not have to go to failure. If you reach the upper rep number in all sets twice, BLOC suggests the next weight step (usually 2 to 10 % more), then you start again at the bottom of the range. Without weight: a harder variation or more reps.",
    info2:"Easy week in week {n}: about 60 % of the sets, same weight or a little lighter and up to 4 reps in reserve so you recover.",
    info3:"Running for beginners: alternate 1 minute running and 1.5 to 2 minutes walking, up to three times a week with a rest day between, run a little longer each week.",
    info3b:"Increase running volume carefully, about 10 % a week, never more than 30 %.",
    info4:"Stop at once if you feel pain (not muscle burn), dizziness or chest pressure. Check with a doctor first if you have a medical condition. Guidance, not medical advice.",
    info5:"From 65: add a balance exercise (safe at a wall or chair), slow and controlled, stable stance.",
    info6:"After your sport “{s}” the lower body stays free of heavy loads for two days.",
    quelle:"Basis: WHO guidelines 2020, ACSM position stand 2026 and further open studies (quellen.html). Numbers for sets, rest and progression are BLOC recommendations.",
    infoTitel:"Notes on the plan",
    mehrere:"Several possible", waehleMind:"Choose at least one option.", bauen:"Putting your plan together …", lokal:"Created on your device only.", spaeter:"You can edit every training day as usual afterwards, also by long-pressing its card.", uebernehmen:"Apply changes", zurueckPfeil:"Back to the previous question",
    leichtwoche:"Easy week", lauf_w:"Walk-run: {a} min run, {b} min walk · {n}×", who:"About {m} minutes of training per week, {k} strength days. WHO: 150 to 300 minutes of moderate activity and at least two strength days per week.", schwerNein:"Not planned for your level",
    ohneZug:"Real rows need a bar, band or machine – so exercises lying face down train your upper back. With a resistance band (choose it under equipment) BLOC adds rows.",
    whoRest:"You can cover the rest up to 150 minutes on the side, e.g. with brisk walks, cycling or taking the stairs.",
    endeTitel:"Plan completed", endeText:"{p}: {n} of {m} workouts done. Carry on with the same exercises and your current weights?",
    endeWeiter:"Start next block", endeNeu:"Create a new plan", endeAus:"Hide", endeOk:"{n} sessions for the next {w} weeks in your calendar",
    tageListe:"Training days"
  }
};
function pt(k, v){
  var l = PAT[currentLang() === "en" ? "en" : "de"], s = l[k] !== undefined ? l[k] : (PAT.de[k] !== undefined ? PAT.de[k] : k);
  if(v) Object.keys(v).forEach(function(x){ s = s.split("{"+x+"}").join(v[x]); });
  return s;
}

/* ---------- Regeln (Zahlen): Sätze, Wiederholungen, Pause (s) je Ziel und Intensität ---------- */
var PA_REGELN = {
  muskel:    { anfaenger:[2, 12, 75], leicht:[2, 12, 60], mittel:[3, 10, 75], schwer:[4, 8, 90]  },
  kraft:     { anfaenger:[2, 10, 90], leicht:[3, 8, 90],  mittel:[3, 6, 120], schwer:[4, 5, 150] },
  abnehmen:  { anfaenger:[2, 12, 60], leicht:[2, 12, 45], mittel:[3, 12, 40], schwer:[3, 15, 30] },
  ausdauer:  { anfaenger:[2, 15, 50], leicht:[2, 15, 40], mittel:[3, 15, 35], schwer:[3, 15, 30] },
  allgemein: { anfaenger:[2, 10, 75], leicht:[2, 10, 60], mittel:[3, 10, 60], schwer:[3, 8, 75]  },
  beweglich: { anfaenger:[2, 8, 60],  leicht:[2, 8, 45],  mittel:[2, 10, 45], schwer:[3, 10, 45] }
};
var PA_CARDIO = { anfaenger:[2, 25, 35], leicht:[3, 30, 30], mittel:[3, 40, 20], schwer:[4, 45, 15] };   // Runden, Arbeit s, Pause s im Intervall-Cardio
var PA_RIR = { anfaenger:"4", leicht:"3 bis 4", mittel:"2 bis 3", schwer:"1 bis 2" };   // Einsteiger schätzen die Reserve zu knapp (ACSM 2026, Halperin 2022), darum mehr Reserve
/* Übungen, die je Einschränkung wegfallen (Teilwörter der Übungs-Kennung); Alternativen kommen aus dem Rest des Katalogs */
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
/* Fachliche Prüfung 2026-11-12: Spezialstangen (Trap-Bar u. a.) nicht in automatische Pläne - wer „Langhantel“ wählt, hat eine gerade Stange;
   Power-/Box-Übungen wie der drehende Aufwärtshaken nicht in Muskelaufbau- und Kraftpläne; Trage- und Halteübungen laufen nach Zeit statt Wiederholungen */
var PA_SPEZIAL = /trap-bar|hex-bar|safety-bar|swiss-bar|cambered|landmine|meadows-row|jammer|deficit-deadlift|box-squat/;
var PA_POWER = /uppercut|punch|jab|hook-punch|boxing|shadow-box|judo-flip|rotational-overhead-press|woodchop|clean|snatch|jerk|thruster|(kettlebell|kb|db|dumbbell|russian|american|single-arm|one-arm)-swing/;
var PA_ZEIT = /carry|farmer|plate-pinch-hold|boat-hold|bridge-hold|active-hang|dead-hang|^plank$|^side-plank$|copenhagen-plank|hollow-hold|superman-hold|squat-hold|wall-sit|support-hold|^l-sit$/;
var PA_ZEIT_SEK = 35, PA_ZEIT_SEK_JE = { "superman-hold":30 };   // Startzeit; Superman Hold für Einsteiger kürzer
/* Echte Zugübung (Rudern, Latzug, Klimmzug) - nicht Tragen, aufrechtes Rudern oder Rückenstrecker */
var PA_ZUG = /(^|-)rows?(-|$)|pull-?downs?(-|$)|chin-ups?|pull-ups?/, PA_ZUG_NICHT = /upright|stretch|scapular|pull-apart|rear-delt|biceps|twist|renegade|weighted-pull/;
function paIstZug(ex){ return !!ex && PA_ZUG.test(ex.id) && !PA_ZUG_NICHT.test(ex.id) && !PA_ZEIT.test(ex.id); }
var PA_DRUCK_OHNE_ZUG = 3;   // ohne Rudermöglichkeit höchstens so viele Druckübungen je Woche
var PA_RUECKEN_ERSATZ = ["superman-hold", "reverse-snow-angels", "prone-y-raise"];   // oberer Rücken ohne Geräte, wenn kein Rudern möglich ist
function paZiehtEx(ex){ return !!ex && (paIstZug(ex) || (exProfile(ex).pattern === "pull" && !PA_ZEIT.test(ex.id) && !/upright/.test(ex.id))); }   // zählt als Ziehen (Wochenbilanz)
function paDrueckt(ex){ return !!ex && exProfile(ex).pattern === "push"; }
function paZugVertikal(ex){ return /pull-?downs?|pull-ups?|chin-ups?/.test(ex.id); }   // sonst horizontal (Rudern)
var PA_AUSNAHME = /forearm|elbow|incline-push|wall-push|knee-push/;   // Handgelenk: Unterarm-Varianten und leichtere Stützformen bleiben erlaubt
/* Slots je Einheit: Muskelgruppen in Reihenfolge der Wichtigkeit (große Übungen zuerst; Drücken und Ziehen wechseln sich ab) */
var PA_SLOTS = {
  gk:[["beine", "brust", "ruecken", "po", "bauch", "schulter", "arme", "rumpf"], ["po", "ruecken", "schulter", "beine", "brust", "rumpf", "bauch", "arme"], ["beine", "schulter", "brust", "ruecken", "rumpf", "po", "arme", "bauch"]],
  ok:[["brust", "ruecken", "schulter", "ruecken", "arme", "brust", "arme", "bauch"], ["ruecken", "brust", "schulter", "brust", "arme", "ruecken", "rumpf", "arme"]],
  uk:[["beine", "po", "beine", "bauch", "rumpf", "beine", "po", "bauch"], ["po", "beine", "beine", "rumpf", "bauch", "po", "beine", "rumpf"]]
};
/* Tagestypen je Hauptziel und Zahl der Trainingstage (1 bis 6) */
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
/* Vorhandene Aufwärm- und Dehn-Workouts als Bausteine der TrainingsBLOCs */
var PA_LIB_WARM = { kraft:"warmup-kraft", cardio:"warmup-hiit", ganz:"warmup-ganz" };
var PA_LIB_DEHN = { gk:"stretch-full", ok:"stretch-post-upper", uk:"stretch-post-legs", cardio:"stretch-post-legs", run:"stretch-post-legs", kurz:"stretch-quick", mob:["stretch-back-hips", "stretch-hips"], erh:"stretch-evening" };

/* ---------- Antworten ---------- */
var PA_ZIELE = ["muskel", "kraft", "abnehmen", "ausdauer", "allgemein", "beweglich"], PA_BEREICHE = ["workout", "run", "mobility"];
function paStandard(){
  return { ziele:[], ziel:"", fokus:[], niveau:"", schwer:"", tage:[], dauer:0, train:[], ausr:[], zonen:[], bereiche:["workout"], laufen:"", mobility:"", einschr:[], impact:"", sport:null, alter:"u50", wochen:6 };
}
function paSchwerErlaubt(a){ return a.niveau !== "gar" && a.niveau !== "unreg" && a.alter !== "65"; }   // „Schwer“ nur ab 1–2× pro Woche aktiv und nicht ab 65
function paSchwerStandard(a){ return a.niveau === "gar" ? "anfaenger" : a.niveau === "unreg" ? "leicht" : "mittel"; }   // Vorgabe aus dem Aktivitätsniveau
function paSauber(a){   // gespeicherte oder fremde Antworten auf gültige Werte bringen
  var s = paStandard(), ok = function(v, l){ return l.indexOf(v) > -1; };
  if(!a || typeof a !== "object") return s;
  var z = selArr(a.ziele).concat(a.ziel && !selArr(a.ziele).length ? [a.ziel] : []).filter(function(x, i, l){ return ok(x, PA_ZIELE) && l.indexOf(x) === i; });
  s.ziele = z; s.ziel = z[0] || "";
  var gr = MUSKEL_GRP.map(function(g){ return g.id; });
  var zo = selArr(a.zonen).length ? selArr(a.zonen) : [];
  if(!zo.length) selArr(a.fokus).filter(function(x){ return ok(x, gr); }).forEach(function(g){ (KK_GRUPPE_ZONEN[g] || []).forEach(function(z){ if(zo.indexOf(z) < 0) zo.push(z); }); });   // ältere Antworten: Gruppen
  s.zonen = kkNorm(zo);
  s.fokus = gr.filter(function(g){ return (KK_GRUPPE_ZONEN[g] || []).some(function(z){ return s.zonen.indexOf(z) > -1; }); });
  if(ok(a.niveau, ["gar", "unreg", "n12", "n3"])) s.niveau = a.niveau;
  if(ok(a.schwer, ["anfaenger", "leicht", "mittel", "schwer"])) s.schwer = a.schwer;
  s.tage = selArr(a.tage).map(Number).filter(function(d, i, l){ return d >= 0 && d <= 6 && l.indexOf(d) === i; }).sort(function(x, y){ return x - y; }).slice(0, 6);
  if(ok(+a.dauer, [20, 30, 45, 60])) s.dauer = +a.dauer;
  s.train = selArr(a.train).filter(function(x){ return ok(x, TRAIN_ARTEN); });
  if(!s.train.length && Array.isArray(a.ort)) s.train = a.ort.map(function(o){ return o === "studio" || o === "heim1" ? "studio" : o === "draussen" ? "cali" : "body"; }).filter(function(x, i, l){ return l.indexOf(x) === i; });   // ältere Antworten (Ort)
  s.ausr = selArr(a.ausr).filter(function(x){ return ok(x, AUSR_IDS) || x === "keine"; });
  if(s.ausr.indexOf("keine") > -1) s.ausr = ["keine"];
  var b = selArr(a.bereiche).filter(function(x){ return ok(x, PA_BEREICHE); });
  if(!b.length && (a.ziel || a.ziele)) b = ["workout"].concat(a.laufen && a.laufen !== "kein" ? ["run"] : [], a.mobility === "tag" ? ["mobility"] : []);   // ältere Antworten
  s.bereiche = b.length ? b : ["workout"];
  s.einschr = selArr(a.einschr).filter(function(x){ return PA_AUS[x] && x !== "impact"; });
  if(ok(a.impact, ["gerne", "schonend"])) s.impact = a.impact;
  if(a.sport && typeof a.sport.name === "string" && a.sport.name.trim() && a.sport.tag >= 0 && a.sport.tag <= 6) s.sport = { name:a.sport.name.trim().slice(0, 24), tag:+a.sport.tag };
  if(ok(a.laufen, ["ein", "reg"])) s.laufen = a.laufen;
  if(s.bereiche.indexOf("run") > -1 && !s.laufen) s.laufen = "ein";
  if(ok(a.alter, ["u50", "50", "65"])) s.alter = a.alter;
  if(ok(+a.wochen, [4, 6, 8])) s.wochen = +a.wochen;
  if(s.schwer === "schwer" && !paSchwerErlaubt(s)) s.schwer = "mittel";
  return s;
}
function paVollstaendig(a){ return !!(a.ziele.length && a.niveau && a.schwer && a.tage.length && a.dauer && a.ausr.length && a.train.length && a.bereiche.length && a.impact); }

/* ---------- Auswahl der Übungen ---------- */
function paHash(s){ var x = 7; for(var i = 0; i < s.length; i++) x = (x*31 + s.charCodeAt(i)) % 99991; return x/99991; }
function paTopGruppe(ex){ var v = mgVerteilung(ex), b = "", m = 0; Object.keys(v).forEach(function(k){ if(v[k] > m){ m = v[k]; b = k; } }); return b; }
function paAusgeschlossen(ex, a){
  var id = ex.id, imp = a.impact === "schonend" || a.niveau === "gar" || a.alter === "65", l = [];
  if(imp) l.push(PA_AUS.impact);
  a.einschr.forEach(function(e){ if(PA_AUS[e]) l.push(PA_AUS[e]); });
  if(PA_NIE.test(id) || PA_SPEZIAL.test(id)) return true;
  if(PA_POWER.test(id) && a.ziele.some(function(z){ return z === "muskel" || z === "kraft"; })) return true;
  return l.some(function(re){ return re.test(id) && !(re !== PA_AUS.impact && PA_AUSNAHME.test(id) && re === PA_AUS.handgelenk); });
}
/* Passt die Übung zu Geräten und Trainingsart? Nur was man ausführen kann: Geräte-Übungen brauchen ein gewähltes Gerät (Fitnessstudio-Maschinen ein Studio-Gerät),
   Körpergewicht geht immer, Stangenübungen nur mit Calisthenic-Park, Geräteübungen nur mit Fitnessstudio */
function paGeraetOk(ex, a){
  var art = exTrainArt(ex), arten = exTrainArten(ex), gear = a.ausr.filter(function(x){ return x !== "keine"; });
  if(art !== "body" && !arten.some(function(x){ return a.train.indexOf(x) > -1; })) return false;
  var g = exAusr(ex);
  if(g.length && !g.some(function(x){ return gear.indexOf(x) > -1; })) return false;
  if(ex.equip.indexOf("gym") > -1 && !gear.some(function(x){ return ["smith", "kabel", "lh", "maschine"].indexOf(x) > -1; })) return false;   // Studio-Übungen (Bank, Rack, Maschine) nur mit einem Studio-Gerät
  return true;
}
function paSchwerLevel(a){ return a.schwer || paSchwerStandard(a); }
/* Pool je Muskelgruppe für Kraft-Slots (ohne Cardio und Dehnen), je Cardio-Pool und Stretch-Pool */
function paPools(a){
  var sw = paSchwerLevel(a), nurLeicht = a.niveau === "gar" || a.alter === "65" || sw === "anfaenger";
  var kraft = {}, cardio = [], dehnen = [];
  EXERCISES.forEach(function(ex){
    if(ex.custom) return;
    if(ex.main === "stretch"){ if(!paAusgeschlossen(ex, a) && paGeraetOk(ex, a)) dehnen.push(ex); return; }
    if(!fuerBau(ex) || paAusgeschlossen(ex, a) || !paGeraetOk(ex, a)) return;
    if(nurLeicht && ex.level > 2) return;
    var lv = ex.level || 2, art = exTrainArt(ex);
    var sc = (sw === "anfaenger" ? (lv === 1 ? 3 : lv === 2 ? -1 : -5) : sw === "leicht" ? (lv === 1 ? 3 : lv === 2 ? 1 : -4) : sw === "mittel" ? (lv === 2 ? 3 : lv === 1 ? 2 : 0) : (lv === 3 ? 3 : lv === 2 ? 2 : 0));
    sc += paGrundUebung(ex) + paArtBonus(ex, art, a);
    if(a.niveau === "gar" && lv === 1) sc += 1.5;
    var o = { ex:ex, sc:sc };
    if(ex.main === "ausdauer") cardio.push(o); else { var g = paTopGruppe(ex); if(g) (kraft[g] = kraft[g] || []).push(o); }
  });
  return { kraft:kraft, cardio:cardio, dehnen:dehnen };
}
/* Gewählte Trainingsart und Geräte werden bevorzugt: Calisthenic-Park (Stange, Barren) deutlich, Fitnessstudio-Geräte, ausdrücklich gewählte Geräte */
function paArtBonus(ex, art, a){
  var sc = 0;
  if(a.train.indexOf("cali") > -1 && art === "cali") sc += a.train.length === 1 ? 3 : 2;
  if(a.train.indexOf("studio") > -1 && art === "studio") sc += 1.5;
  if(a.train.indexOf("body") > -1 && art === "body") sc += a.train.length === 1 ? 1.5 : 0.8;
  if(a.train.indexOf("body") < 0 && art === "body") sc -= 1;
  if(exAusr(ex).some(function(g){ return a.ausr.indexOf(g) > -1; })) sc += 2;
  var gerät = ex.equip.some(function(q){ return q === "gym" || q === "db" || q === "bar" || q === "dip"; }); if(gerät && art !== "body") sc += 0.5;
  if(ex.equip.indexOf("band") > -1) sc -= 0.8;
  return sc;
}
/* Mehrgelenkübungen (mehrere Muskelgruppen, mit Hilfsmuskeln) vor Isolationsübungen */
function paGrundUebung(ex){
  var v = mgVerteilung(ex), n = Object.keys(v).filter(function(k){ return v[k] >= 0.25; }).length, sek = (EX_MUSCLES[ex.id] || [])[1] ? 0.8 : 0;
  return Math.min(3, Math.max(0, n - 1)*1.2 + sek);
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
/* Aufwärmen aus dem passenden Aufwärm-Workout, ohne Ausgeschlossenes (z. B. Sprünge bei gelenkschonend) */
function paAufwaermen(a, n, typ){
  var wid = typ === "cardio" ? PA_LIB_WARM.cardio : (a.ziel === "muskel" || a.ziel === "kraft" ? PA_LIB_WARM.kraft : PA_LIB_WARM.ganz), lw = findLibWorkout(wid);
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
/* Eingeschränkte Pläne (Einschränkungen, gelenkschonend, Neustart, 65+) bekommen eigene, gefilterte Aufwärm- und Dehn-BLOCs statt der fertigen Workouts */
function paGefiltert(a){ return a.einschr.length > 0 || a.impact === "schonend" || a.niveau === "gar" || a.alter === "65" || a.train.indexOf("studio") < 0 && false; }
function paLibRef(id){ return findLibWorkout(id) ? "lib:" + id : null; }

/* ---------- Plan erzeugen ---------- */
/* gibt { name, tage:[{ tag, typ, name, teile:[{ lib } | { bloc:{ name, ids, std, modus, cardio, ziele } } | { run }] }], sport, info, ... } zurück; legt noch nichts an */
function paErzeuge(a0){
  var a = paSauber(a0), sw = paSchwerLevel(a), haupt = a.ziel || "allgemein", r = (PA_REGELN[haupt] || PA_REGELN.allgemein)[sw];
  var hatW = a.bereiche.indexOf("workout") > -1, hatRun = a.bereiche.indexOf("run") > -1, hatMob = a.bereiche.indexOf("mobility") > -1;
  var saetze = r[0], wdh = r[1], pause = r[2];
  if(a.niveau === "gar"){ saetze = Math.min(saetze, 2); pause += 15; }
  if(a.alter === "65"){ wdh = Math.max(wdh + 2, 10); pause += 15; } else if(a.alter === "50"){ wdh = Math.max(wdh, 8); pause += 10; }
  if(a.dauer <= 20) saetze = Math.max(2, saetze - 1);
  var days = a.tage.slice(), nTage = Math.max(1, Math.min(6, days.length)), pools = paPools(a), seedBase = haupt + sw + a.dauer + days.join("") + a.train.join("");
  var typen = ((PA_TAGE[haupt] || PA_TAGE.allgemein)[nTage] || ["gk"]).slice();
  var weitere = a.ziele.slice(1);
  /* weitere Ziele: Ausdauer/Abnehmen brauchen mindestens einen Cardio-Tag, Beweglichkeit einen Mobility-Teil */
  if((weitere.indexOf("ausdauer") > -1 || weitere.indexOf("abnehmen") > -1) && typen.indexOf("cardio") < 0 && nTage >= 2 && (hatRun || hatW)){
    for(var q = typen.length - 1; q >= 0; q--) if(typen[q] === "gk" || typen[q] === "erh"){ typen[q] = "cardio"; break; }
  }
  /* Bereiche: Cardio-Tage werden Run und/oder ein Cardio-Zirkel (Workout); ohne Workout werden Krafttage zu Run; ohne Mobility entfällt die aktive Erholung */
  var optC = []; if(hatRun) optC.push("run"); if(hatW) optC.push("cardio");
  var nC = 0, nRun = 0;
  typen = typen.map(function(t0){
    if(t0 === "cardio" || ((t0 === "gk" || t0 === "ok" || t0 === "uk") && !hatW)){
      if(!optC.length) return hatMob ? "mob" : hatW ? "gk" : "mob";
      var o = optC[nC % optC.length]; nC++;
      if(o === "run"){ if(nRun >= 3){ return hatW ? "cardio" : "mob"; } nRun++; }
      return o;
    }
    if(t0 === "erh" && !hatMob) return optC.length ? optC[(nC++) % optC.length] === "run" && nRun < 3 ? (nRun++, "run") : (hatW ? "cardio" : "mob") : (hatW ? "gk" : "mob");
    return t0;
  });
  /* Anderer Sport zählt als Belastung: am Tag davor, am Sporttag und am Tag danach keine Beine; zwei Tage danach kein reiner Unterkörpertag. Bei Klettern, Kampfsport oder Schwimmen
     schonen die Tage rundherum stattdessen Zug und Schulter. */
  if(a.sport){
    var oberSport = /klettern|boulder|kampf|box|judo|karate|ringen|schwimm/i.test(a.sport.name);
    days.forEach(function(d, i){
      var nah = d === a.sport.tag || (a.sport.tag + 1) % 7 === d || (a.sport.tag + 6) % 7 === d;
      if(nah){
        if(oberSport){ if(typen[i] === "ok" || typen[i] === "gk") typen[i] = "uk"; }
        else if(typen[i] === "uk" || typen[i] === "gk") typen[i] = hatW ? "ok" : "mob"; else if(typen[i] === "cardio" || typen[i] === "run") typen[i] = "erh";
      } else if((a.sport.tag + 2) % 7 === d && typen[i] === "uk" && !oberSport) typen[i] = "gk";   // nach intensivem Spiel sind die Beine nach 48 bis 72 Stunden noch nicht erholt (Silva 2018)
    });
  }
  /* Run gewünscht, aber kein Lauftag im Plan: ein Tag (nicht rund um den Sport) wird Lauftag */
  if(hatRun && typen.indexOf("run") < 0){
    var frei = function(i){ return !a.sport || (days[i] !== a.sport.tag && days[i] !== (a.sport.tag + 1) % 7 && days[i] !== (a.sport.tag + 6) % 7); }, wahl2 = -1;
    ["erh", "cardio", "gk", "uk", "mob"].forEach(function(t0){ for(var i = typen.length - 1; i >= 0; i--) if(wahl2 < 0 && typen[i] === t0 && frei(i)) wahl2 = i; });
    if(wahl2 >= 0) typen[wahl2] = "run";
  }
  var warmN = a.dauer <= 20 ? 2 : 3, dehnN = a.dauer >= 45 ? 4 : 3;   // Dehnen hängt nicht an den Trainingstagen: wer will, ergänzt es im TrainingsBLOC von Hand
  var nMain = (a.dauer <= 20 ? 4 : a.dauer <= 30 ? 5 : a.dauer <= 45 ? 7 : 9) - (pause >= 120 ? 1 : 0) - ((sw === "leicht" || sw === "anfaenger") && a.dauer >= 60 ? 1 : 0);   // Übungen je Einheit (ohne Aufwärmen und Dehnen)
  var planBenutzt = {}, zaehl = { gk:0, ok:0, uk:0 }, tageSpecs = [], ziele = {}, eigen = paGefiltert(a), fokusGr = a.fokus.filter(function(f){ return f !== "ausgew"; });
  function warmTeil(typ, seed){
    var ref = !eigen && paLibRef(typ === "cardio" ? PA_LIB_WARM.cardio : (haupt === "muskel" || haupt === "kraft" ? PA_LIB_WARM.kraft : PA_LIB_WARM.ganz));
    if(ref) return { lib:ref };
    var ids = paAufwaermen(a, warmN, typ === "cardio" ? "cardio" : "kraft"); if(!ids.length) return null;
    var m = {}; ids.forEach(function(id){ m[id] = "timer"; });
    return { bloc:{ name:pt("aufwaermen"), ids:ids, std:"timer", modus:m, warm:true } };
  }
  function dehnTeil(typ, gruppen, seed, idx){
    var lib = PA_LIB_DEHN[a.dauer <= 20 && (typ === "gk" || typ === "ok" || typ === "uk") ? "kurz" : typ];
    if(Array.isArray(lib)) lib = lib[idx % lib.length];
    var ref = !eigen && lib && paLibRef(lib);
    if(ref) return { lib:ref };
    var ids = paDehnen(pools, gruppen.length ? gruppen : ["brust", "ruecken", "beine", "po"], typ === "mob" ? 8 : dehnN, seed, {}); if(!ids.length) return null;
    var m = {}; ids.forEach(function(id){ m[id] = "timer"; });
    return { bloc:{ name:pt("dehnen"), ids:ids, std:"timer", modus:m, dehn:true } };
  }
  var mobIdx = 0, cardioIdx = 0, ohneZug = false;
  typen.forEach(function(typ, i){
    var tag = days[i], seed = seedBase + i, teile = [], tname = "";
    if(typ === "gk" || typ === "ok" || typ === "uk"){
      var slots = PA_SLOTS[typ][zaehl[typ] % PA_SLOTS[typ].length].slice(); zaehl[typ]++;
      fokusGr.forEach(function(g){
        var passt = typ === "gk" || (typ === "ok" && ["brust", "ruecken", "schulter", "arme"].indexOf(g) > -1) || (typ === "uk" && ["beine", "po"].indexOf(g) > -1) || g === "rumpf" || g === "bauch";
        if(passt && slots.filter(function(x){ return x === g; }).length < 2) slots.splice(2, 0, g);
      });
      var benutzt = {}, gruppen = [], mainIds = [];
      var wt = warmTeil("kraft", seed); if(wt && wt.bloc) wt.bloc.ids.forEach(function(id){ benutzt[id] = 1; });
      slots.slice(0, nMain).forEach(function(g, k){
        // Rücken-Slot: zuerst eine Zugübung, Ganzkörper A/C horizontal (Rudern), B vertikal (Latzug, Klimmzug); sonst die andere Richtung
        var vert = (zaehl[typ] - 1) % 2 === 1, zugAlle = g === "ruecken" ? (pools.kraft.ruecken || []).filter(function(o){ return paIstZug(o.ex); }) : null;
        var zugW = zugAlle ? zugAlle.filter(function(o){ return paZugVertikal(o.ex) === vert; }) : null, zug = zugW && zugW.length ? zugW : zugAlle;
        var ex = (zug && zug.length ? paWaehle(zug, benutzt, seed + k, planBenutzt) : null) || paWaehle(pools.kraft[g], benutzt, seed + k, planBenutzt) || paWaehle(pools.kraft[g === "po" ? "beine" : g === "bauch" ? "rumpf" : g === "rumpf" ? "bauch" : g], benutzt, seed + k, planBenutzt);
        if(ex){ benutzt[ex.id] = 1; planBenutzt[ex.id] = 1; mainIds.push(ex.id); gruppen.push(g); }
      });
      /* Jeder Ganzkörper- und Oberkörpertag bekommt mindestens eine Zugübung (fachliche Prüfung 2026-11-12): fehlt sie, ersetzt sie die letzte Arm- bzw. Schulterübung */
      if((typ === "gk" || typ === "ok") && !mainIds.some(function(id){ return paIstZug(findExercise(id)); })){
        var zugPool = []; Object.keys(pools.kraft).forEach(function(g2){ (pools.kraft[g2] || []).forEach(function(o){ if(paIstZug(o.ex)) zugPool.push(o); }); });
        var zx = paWaehle(zugPool, benutzt, seed + "zug", planBenutzt);
        if(zx){
          var ersetz = -1; ["arme", "schulter", "rumpf", "bauch"].forEach(function(g3){ if(ersetz < 0) for(var q2 = gruppen.length - 1; q2 >= 0; q2--) if(gruppen[q2] === g3){ ersetz = q2; break; } });
          if(ersetz < 0 && mainIds.length >= nMain) ersetz = mainIds.length - 1;
          benutzt[zx.id] = 1; planBenutzt[zx.id] = 1;
          if(ersetz >= 0){ delete benutzt[mainIds[ersetz]]; mainIds[ersetz] = zx.id; gruppen[ersetz] = "ruecken"; } else { mainIds.push(zx.id); gruppen.push("ruecken"); }
        } else {
          /* Kein Rudern möglich (z. B. nur Körpergewicht ohne Stange und Band): eine Übung für den oberen Rücken im Liegen, dazu ein Hinweis im Plan */
          ohneZug = true;   // keine echte Zugübung möglich: Hinweis im Plan, auch wenn der Ersatz schon drin ist
          var ers = PA_RUECKEN_ERSATZ.map(findExercise).filter(function(x){ return x && !benutzt[x.id] && !paAusgeschlossen(x, a); });
          if(ers.length){
            var ex2 = ers[zaehl[typ] % ers.length], ers2 = -1;
            ["arme", "schulter", "brust", "rumpf", "bauch"].forEach(function(g3){ if(ers2 < 0) for(var q3 = gruppen.length - 1; q3 >= 0; q3--) if(gruppen[q3] === g3 && paDrueckt(findExercise(mainIds[q3]))){ ers2 = q3; break; } });
            benutzt[ex2.id] = 1; planBenutzt[ex2.id] = 1;
            if(ers2 >= 0){ delete benutzt[mainIds[ers2]]; mainIds[ers2] = ex2.id; gruppen[ers2] = "ruecken"; } else { mainIds.push(ex2.id); gruppen.push("ruecken"); }
          }
        }
      }
      var balance = a.alter === "65" && findExercise("single-leg-stand") && !benutzt["single-leg-stand"] ? ["single-leg-stand"] : [];   // ab 65: Gleichgewicht (WHO 2020, ICFSR 2021)
      var modus = {}; balance.forEach(function(id){ modus[id] = "timer"; });
      mainIds.forEach(function(id){ ziele[id] = { s:saetze, w:wdh, p:pause }; });
      var bname = pt("mainBloc", { z:pt(typ), t:String.fromCharCode(65 + (zaehl[typ] - 1)) });
      tname = bname;
      if(wt) teile.push(wt);
      teile.push({ bloc:{ name:bname, ids:balance.concat(mainIds), std:"saetze", modus:modus, main:true } });
    } else if(typ === "run"){
      tname = a.laufen === "ein" ? pt("lauf_ein") : pt("lauf");
      teile.push({ run:true });
    } else if(typ === "cardio"){
      var nCd = a.dauer <= 20 ? 4 : a.dauer <= 30 ? 5 : a.dauer <= 45 ? 7 : 8, cb = {}, cids = [];
      for(var k2 = 0; k2 < nCd; k2++){ var ce = paWaehle(pools.cardio, cb, seed + "c" + k2, planBenutzt); if(!ce) break; cb[ce.id] = 1; planBenutzt[ce.id] = 1; cids.push(ce.id); }
      if(cids.length < 3){   // zu wenige Cardio-Übungen (gelenkschonend): mit Kraft-Übungen für Beine und Rumpf als Zirkel auffüllen
        ["beine", "rumpf", "po", "bauch"].forEach(function(g){ if(cids.length >= nCd) return; var ex2 = paWaehle(pools.kraft[g], cb, seed + g, planBenutzt); if(ex2){ cb[ex2.id] = 1; cids.push(ex2.id); } });
      }
      var m2 = {}; cids.forEach(function(id){ m2[id] = "timer"; });
      tname = pt("cardio") + " " + String.fromCharCode(65 + cardioIdx++);
      var wt2 = warmTeil("cardio", seed); if(wt2) teile.push(wt2);
      teile.push({ bloc:{ name:tname, ids:cids, std:"timer", modus:m2, cardio:true } });
    } else {   // mob, erh
      tname = typ === "erh" ? pt("erh") : pt("mob");
      var d1 = dehnTeil(typ, ["brust", "ruecken", "schulter", "arme", "bauch", "beine", "po", "rumpf"], seed, mobIdx++); if(d1) teile.push(d1);
      if(typ === "mob" && a.dauer >= 45){ var d2 = dehnTeil(typ, ["ruecken", "beine", "po"], seed + "b", mobIdx++); if(d2 && (!d1 || d2.lib !== d1.lib)) teile.push(d2); }
    }
    tageSpecs.push({ tag:tag, typ:typ, name:tname, teile:teile });
  });
  /* Mobility als eigener Tag: ein freier Wochentag, nicht am Sporttag */
  if(hatMob && tageSpecs.filter(function(t0){ return t0.typ === "mob"; }).length === 0 && tageSpecs.length < 7){
    var frei2 = [0, 1, 2, 3, 4, 5, 6].filter(function(d){ return days.indexOf(d) < 0 && !(a.sport && a.sport.tag === d); });
    var wahl = frei2.filter(function(d){ return days.indexOf((d + 6) % 7) < 0 && days.indexOf((d + 1) % 7) < 0; })[0];
    if(wahl === undefined) wahl = frei2[0];
    if(wahl !== undefined){
      var teile3 = [], dm = dehnTeil("mob", ["brust", "ruecken", "schulter", "arme", "bauch", "beine", "po", "rumpf"], seedBase + "m", mobIdx++); if(dm) teile3.push(dm);
      tageSpecs.push({ tag:wahl, typ:"mob", name:pt("mob"), teile:teile3, extra:true });
    }
  }
  /* Wochenbilanz (fachliche Prüfung 2026-11-12, Praxisregel für gesunde Schultern): über die Woche mindestens so viele Zug- wie Druckübungen.
     Überzählige Druckübungen werden ersetzt - zuerst Arme, dann Schulter, nur an Tagen mit mindestens zwei Druckübungen. Gilt nur für das, was der
     Assistent selbst aussucht; der fertige Plan bleibt frei änderbar. */
  (function(){
    var mains = []; tageSpecs.forEach(function(t0){ t0.teile.forEach(function(tl){ if(tl.bloc && tl.bloc.main) mains.push(tl.bloc); }); });
    var zugPool = []; Object.keys(pools.kraft).forEach(function(g){ (pools.kraft[g] || []).forEach(function(o){ if(paZiehtEx(o.ex)) zugPool.push(o); }); });
    // echte Zugübung zählt 1, Rücken-Übungen im Liegen u. Ä. nur halb (fachliche Prüfung Test 2) - ohne Rudermöglichkeit bleiben so weniger Druckübungen
    function bilanz(){ var c = { p:0, z:0 }; mains.forEach(function(b){ b.ids.forEach(function(id){ var ex = findExercise(id); if(paDrueckt(ex)) c.p++; else if(paIstZug(ex)) c.z++; else if(paZiehtEx(ex) || PA_RUECKEN_ERSATZ.indexOf(id) > -1) c.z += 0.5; }); }); return c; }
    var c = bilanz(), runde = 0;
    while(c.p > c.z && runde++ < 20){
      var best = null;
      mains.forEach(function(b, bi){
        if(b.ids.filter(function(id){ return paDrueckt(findExercise(id)); }).length < 2) return;
        b.ids.forEach(function(id, k){
          var ex = findExercise(id); if(!paDrueckt(ex)) return;
          var g = paTopGruppe(ex), rang = g === "arme" ? 3 : g === "schulter" ? 2 : 1;
          if(!best || rang > best.rang || (rang === best.rang && (bi > best.bi || (bi === best.bi && k > best.k)))) best = { b:b, bi:bi, k:k, id:id, rang:rang };
        });
      });
      if(!best) break;
      var belegt = {}; best.b.ids.forEach(function(id){ belegt[id] = 1; });
      var hatVert = best.b.ids.some(function(id){ var ex = findExercise(id); return paIstZug(ex) && paZugVertikal(ex); });
      var lieber = zugPool.filter(function(o){ return !paIstZug(o.ex) || paZugVertikal(o.ex) !== hatVert; });   // die Zug-Richtung, die dem Tag noch fehlt
      var neu = paWaehle(lieber, belegt, seedBase + "zd" + runde, planBenutzt) || paWaehle(zugPool, belegt, seedBase + "zd2" + runde, planBenutzt);
      if(!neu) break;
      ziele[neu.id] = ziele[best.id]; best.b.ids[best.k] = neu.id; planBenutzt[neu.id] = 1;
      c = bilanz();
    }
    /* Ohne echte Zugübung (kein Rudern möglich): die Ersatzübungen gleichen das Drücken nicht wirklich aus - dann höchstens 3 Druckübungen
       pro Woche (fachliche Prüfung Test 2). Überzählige werden durch Rumpf- bzw. Beinübungen ersetzt, nur an Tagen mit mindestens zwei Druckübungen. */
    if(!zugPool.some(function(o){ return paIstZug(o.ex); })){
      var ersatzPool = []; ["rumpf", "bauch", "po", "beine"].forEach(function(g){ (pools.kraft[g] || []).forEach(function(o){ if(!paDrueckt(o.ex)) ersatzPool.push(o); }); });
      for(var r2 = 0; r2 < 20 && bilanz().p > PA_DRUCK_OHNE_ZUG; r2++){
        var opfer = null;
        mains.forEach(function(b, bi){
          if(b.ids.filter(function(id){ return paDrueckt(findExercise(id)); }).length < 2) return;
          b.ids.forEach(function(id, k){ if(paDrueckt(findExercise(id))) opfer = { b:b, k:k, id:id }; });
        });
        if(!opfer) break;
        var bel = {}; opfer.b.ids.forEach(function(id){ bel[id] = 1; });
        var ers = paWaehle(ersatzPool, bel, seedBase + "oz" + r2, planBenutzt);
        if(!ers) break;
        ziele[ers.id] = ziele[opfer.id]; opfer.b.ids[opfer.k] = ers.id; planBenutzt[ers.id] = 1;
      }
    }
  })();
  tageSpecs.sort(function(x, y){ return x.tag - y.tag; });
  var info = [pt("info0"), pt("info1", { r:PA_RIR[sw] })];
  info.push(pt("info2", { n:paLeichtWochen(a.wochen).map(function(i){ return i + 1; }).join(a.wochen >= 8 ? " und " : "") }));
  if(a.laufen === "ein" && hatRun) info.push(pt("info3")); else if(a.laufen === "reg" && hatRun) info.push(pt("info3b"));
  if(a.sport) info.push(pt("info6", { s:a.sport.name }));
  if(a.alter === "65") info.push(pt("info5"));
  if(ohneZug) info.push(pt("ohneZug"));
  if(nTage === 1 && haupt !== "beweglich" && haupt !== "ausdauer") info.push(pt("einEinheit"));
  info.push(pt("info4")); info.push(pt("quelle"));
  var kraftTage = tageSpecs.filter(function(t0){ return t0.typ === "gk" || t0.typ === "ok" || t0.typ === "uk"; }).length;
  return { name:pt("planName", { z:pt("z_" + haupt), n:nTage }), tage:tageSpecs, ziele:ziele, sport:a.sport, info:info.join(" "), wochen:a.wochen, saetze:saetze, wdh:wdh, pause:pause, cardio:PA_CARDIO[sw], nTage:tageSpecs.length,
    kraftTage:kraftTage, minuten:tageSpecs.length*a.dauer };
}

/* ---------- Anlegen: BLOCs, TrainingsBLOCs je Trainingstag, Kalender ---------- */
var PA_LAUF = [[1, 2, 8], [2, 2, 6], [3, 2, 5], [4, 2, 4], [5, 1, 4], [8, 1, 3], [10, 1, 3], [10, 1, 3]];   // Wochen des Laufeinstiegs: Minuten laufen, Minuten gehen, Wiederholungen (Praxis, an Gehen-Laufen-Programme angelehnt)
function paLeichtWochen(wochen){ return wochen >= 8 ? [3, 7] : wochen >= 6 ? [5] : [3]; }
function paGruppe(gid){ return programmListe().filter(function(p){ return p.gruppe === gid; }); }
function paBlocLoeschen(gid){ state.db.settings.stPlaene = stPlaene().filter(function(x){ return x.gen !== gid; }); }
/* Termine eines Trainingstags (TrainingsBLOC): ab heute an p.tage für p.wochen Wochen; frühere offene Termine dieses TrainingsBLOCs werden ersetzt. Lauftage bekommen den Laufeinstieg Woche für Woche,
   Leichtwochen sind markiert, der andere Sport hängt als fester Termin am ersten Tag des Plans. Liefert die Zahl der Termine. */
function paKalender(p){
  programmAusKalender(p);
  var start = new Date(); start.setHours(12, 0, 0, 0);
  var wochen = p.wochen || 6, n = 0, nurLauf = p.items.length === 1 && p.items[0] === "run";
  for(var d = 0; d < wochen*7; d++){
    var tag = kalPlus(start, d), wd = (tag.getDay() + 6) % 7, wk = Math.floor(d/7);
    if(p.tage.indexOf(wd) > -1){
      var e;
      if(nurLauf){
        var nm = pt("lauf"); if(p.laufStufe){ var st = PA_LAUF[Math.min(wk, PA_LAUF.length - 1)]; nm = pt("lauf_w", { a:st[0], b:st[1], n:st[2] }); }
        e = kalHinzu(kalTagKey(tag), { art:"run", name:nm, km:0 });
      } else {
        e = kalHinzu(kalTagKey(tag), { art:"programm", ref:p.id });
        if(paLeichtWochen(wochen).indexOf(wk) > -1) e.leicht = true;   // Leichtwoche: weniger Sätze
      }
      e.prog = { id:p.id, i:0 }; n++;
    }
    if(p.sport && p.sport.tag === wd){ var es = kalHinzu(kalTagKey(tag), { art:"sport", name:p.sport.name }); es.prog = { id:p.id, i:-1 }; n++; }
  }
  save();
  return n;
}
function paKalenderGruppe(gid){ var n = 0; paGruppe(gid).forEach(function(p){ n += paKalender(p); }); return n; }
function paKalenderGruppeAus(gid){ var n = 0; paGruppe(gid).forEach(function(p){ n += programmAusKalender(p); }); return n; }
function paGruppeLoeschen(gid){
  paKalenderGruppeAus(gid); paBlocLoeschen(gid);
  var ids = paGruppe(gid).map(function(p){ return p.id; });
  state.db.settings.programme = programmListe().filter(function(p){ return p.gruppe !== gid; });
  state.db.settings.favs = (state.db.settings.favs || []).filter(function(k){ return ids.indexOf(k.replace(/^prog:/, "")) < 0; });
  save();
}
function paAnlegen(a0, ersetzeGid){
  var a = paSauber(a0), sp = paErzeuge(a), gid = ersetzeGid || uid(), sw = paSchwerLevel(a), studio = studioAlle(), liste = programmListe(), pos = liste.length;
  if(ersetzeGid){
    var alt = paGruppe(ersetzeGid); if(alt.length) pos = liste.indexOf(alt[0]);
    paKalenderGruppeAus(ersetzeGid); paBlocLoeschen(ersetzeGid);
    state.db.settings.programme = liste = liste.filter(function(p){ return p.gruppe !== ersetzeGid; }); if(pos > liste.length) pos = liste.length;
  }
  var neue = [];
  sp.tage.forEach(function(t0, k){
    var items = [];
    t0.teile.forEach(function(tl){
      if(tl.lib){ items.push(tl.lib); return; }
      if(tl.run){ items.push("run"); return; }
      var b = tl.bloc, bl = { id:uid(), name:b.name, ids:b.ids.slice(), blockRest:b.cardio ? 60 : 0, updatedAt:Date.now(), gen:gid };
      bl.standard = b.std; if(Object.keys(b.modus).length) bl.modus = b.modus;
      stPlaene().push(bl);
      b.ids.forEach(function(id){
        var e = studio[id] || (studio[id] = { log:[] }), z = sp.ziele[id], ex0 = findExercise(id);
        if(z && !e.ziel){ e.ziel = { saetze:z.s, wdh:z.w }; if(e.pause == null) e.pause = z.p; }
        if(z && PA_ZEIT.test(id) && !e.einheit){ e.einheit = "zeit"; if(!e.timer) e.timer = { reps:z.s, work:PA_ZEIT_SEK_JE[id] || PA_ZEIT_SEK, rest:z.p }; }   // Tragen und Halten: Sätze × Sekunden
        if(!e.timer && ex0 && ex0.main !== "stretch" && b.modus[id] === "timer"){   // Aufwärmen bzw. Cardio-Runde
          if(b.cardio){ var c = PA_CARDIO[sw]; e.timer = { reps:c[0], work:c[1], rest:c[2] }; } else e.timer = { reps:1, work:40, rest:10 };
        }
      });
      items.push("plan:" + bl.id);
    });
    var p = { id:uid(), name:pt("tagName", { p:sp.name, n:k + 1, z:t0.name }), items:items, tage:[t0.tag], wochen:a.wochen, am:"alle", pos:0, gruppe:gid, gen:true, updatedAt:Date.now() };
    if(t0.typ === "run" && a.laufen === "ein") p.laufStufe = true;
    if(k === 0){ p.assi = a; p.info = sp.info; p.sport = sp.sport; p.gruppeName = sp.name; }
    neue.push(p);
  });
  neue.forEach(function(p, k){ liste.splice(pos + k, 0, p); });
  state.db.settings.programme = liste;
  var n = 0; neue.forEach(function(p){ pgOffen[p.id] = false; n += paKalender(p); });
  save();
  return { gid:gid, progs:neue, n:n, sp:sp };
}

/* ---------- Planende (2026-11-12): Abschlusskarte auf der Startseite ----------
   Ein Plan aus dem Assistenten, dessen letzter Termin vorbei ist (höchstens 21 Tage), ohne Termine ab heute: „Plan geschafft“ mit
   „Nächsten Block starten“ (dieselben TrainingsBLOCs, neue Termine ab heute - die Gewichte gelten weiter, weil sie je Übung gespeichert sind),
   „Neuen Plan erstellen“ und „Ausblenden“ (gemerkt je Planende: p.endeGesehen = letzter Termin). */
/* Gruppen für das Planende: Pläne aus dem Assistenten je Gruppe, eigene TrainingsBLOCs mit Wochenplan einzeln („p:“ + ID) (Test 3, P3) */
function paEndeGruppen(){
  var g = {};
  programmListe().forEach(function(p){
    if(p.gen && p.gruppe) (g[p.gruppe] = g[p.gruppe] || []).push(p);
    else if(!p.gen && p.items.length && p.tage && p.tage.length) g["p:"+p.id] = [p];
  });
  return g;
}
function paEndeProgs(gid){ return gid.indexOf("p:") === 0 ? [programmFinde(gid.slice(2))].filter(Boolean) : paGruppe(gid); }
function paPlanEnde(){
  var heute = kalTagKey(Date.now()), grenze = kalTagKey(Date.now() - 21*86400000), best = null, gruppen = paEndeGruppen();
  Object.keys(gruppen).forEach(function(gid){
    var ids = gruppen[gid].map(function(p){ return p.id; });
    var ter = kalListe().filter(function(e){ return e.prog && ids.indexOf(e.prog.id) > -1 && e.art !== "sport"; });
    if(!ter.length || ter.some(function(e){ return e.tag > heute || (e.tag === heute && !kalErledigt(e)); })) return;   // auch am letzten Tag, sobald er erledigt ist
    var letzter = ter.reduce(function(m, e){ return e.tag > m ? e.tag : m; }, "");
    if(letzter < grenze || gruppen[gid][0].endeGesehen === letzter) return;
    var ok = ter.filter(kalErledigt).length;
    if(!best || letzter > best.letzter) best = { gid:gid, p:gruppen[gid][0], letzter:letzter, n:ok, m:ter.length };
  });
  return best;
}
/* Ist heute der letzte Termin des Plans, zu dem dieser BLOC gehört? (Auswertung: „Letztes Training des Plans geschafft“) */
function paLetzterPlantag(planId){
  var heute = kalTagKey(Date.now()), gid = null, gr = paEndeGruppen();
  Object.keys(gr).forEach(function(k){ if(gr[k].some(function(p){ return p.items.indexOf("plan:"+planId) > -1; })) gid = k; });
  if(!gid) return false;
  var ids = gr[gid].map(function(p){ return p.id; });
  var ter = kalListe().filter(function(e){ return e.prog && ids.indexOf(e.prog.id) > -1 && e.art !== "sport"; });
  return ter.some(function(e){ return e.tag === heute; }) && !ter.some(function(e){ return e.tag > heute; });
}
function paPlanEndeHTML(){
  var en = paPlanEnde();
  if(!en) return "";
  return '<section class="card plan-ende" data-planende="'+esc(en.gid)+'"><div class="pe-kopf"><span class="pe-haken" aria-hidden="true">✓</span><b>'+esc(pt("endeTitel"))+'</b></div>'+
    '<p>'+esc(pt("endeText", { p:en.p.gruppeName || en.p.name, n:en.n, m:en.m }))+'</p>'+
    '<div class="pe-knoepfe"><button type="button" class="btn btn-primary" data-peweiter>'+esc(pt("endeWeiter"))+'</button>'+
    '<button type="button" class="btn btn-secondary" data-peneu>'+esc(pt("endeNeu"))+'</button>'+
    '<button type="button" class="pe-aus" data-peaus>'+esc(pt("endeAus"))+'</button></div></section>';
}
function paPlanEndeBinden(neu){
  var box = app.querySelector("[data-planende]"), en = box ? paPlanEnde() : null;
  if(!en) return;
  function gesehen(){ paEndeProgs(en.gid).forEach(function(p){ p.endeGesehen = en.letzter; }); save(); }
  box.querySelector("[data-peweiter]").addEventListener("click", function(){
    var n = 0; paEndeProgs(en.gid).forEach(function(p){ n += programmUebernehmen(p); });   // Assistent: mit Leichtwoche (paKalender), eigener Plan: Wochenplan
    showToast(pt("endeOk", { n:n, w:en.p.wochen || 6 })); neu();
  });
  box.querySelector("[data-peneu]").addEventListener("click", function(){ gesehen(); paOeffnen(null); });
  box.querySelector("[data-peaus]").addEventListener("click", function(){ gesehen(); neu(); });
}

/* ---------- Fenster ---------- */
var paA = null, paIdx = 0, paEdit = null, paZurUebers = false, paRoot = null;
function paSchritte(){
  return [
    { id:"ziele", art:"multi", opt:[["muskel", "dumbbell"], ["kraft", "bolt"], ["abnehmen", "flame"], ["ausdauer", "run"], ["allgemein", "check"], ["beweglich", "stretch"]], pre:"z_", sub:1, spalten:2, key:"ziele" },
    { id:"fokus", art:"figur", opt_:1 },
    { id:"niveau", art:"eins", opt:[["gar", "zzz"], ["unreg", "wave"], ["n12", "one"], ["n3", "many"]], pre:"n_", sub:1, key:"niveau" },
    { id:"schwer", art:"eins", opt:[["anfaenger", "zzz"], ["leicht", "wave"], ["mittel", "one"], ["schwer", "many"]], pre:"s_", sub:1, key:"schwer" },
    { id:"tage", art:"tage" },
    { id:"dauer", art:"eins", opt:[[20, "t20"], [30, "t30"], [45, "t45"], [60, "t60"]], pre:"d_", spalten:2, key:"dauer" },
    { id:"ausr", art:"multi", opt:[["keine", "no"]].concat(AUSR_IDS.map(function(x){ return [x, "ausr"]; })), pre:"stGer_", exkl:"keine", chips:1, key:"ausr", t:1 },
    { id:"train", art:"multi", opt:TRAIN_ARTEN.map(function(x){ return [x, "foto"]; }), pre:"trArt_", key:"train", foto:1, sub2:"t_" },
    { id:"bereiche", art:"bereiche" },
    { id:"einschr", art:"multi", opt:[["keine", "ok"], ["knie", "knee"], ["schulter", "shoulder"], ["ruecken", "back"], ["handgelenk", "wrist"], ["sprung", "ankle"]], pre:"e_", exkl:"keine", chips:1, key:"einschr" },
    { id:"impact", art:"eins", opt:[["gerne", "jump"], ["schonend", "soft"]], pre:"i_", sub:1, key:"impact" },
    { id:"sport", art:"sport", opt_:1 },
    { id:"fertig", art:"fertig" }
  ];
}
var PA_ICO = {
  dumbbell:'<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/>', bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', flame:'<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.5 1 2.2 2 2.5C11 9 11 6 12 3z"/>',
  run:'<circle cx="14" cy="4.5" r="2"/><path d="M6 21l3-6 3 2v5M9 15l1-4 4-1 2 3 3 1M10 11L8 8"/>', check:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  stretch:'<circle cx="12" cy="4.5" r="2"/><path d="M5 5.5l7 3 7-3M12 8.5v5M12 13.5l-5 6.5M12 13.5l5 6.5"/>', all:'<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  zzz:'<path d="M5 6h6l-6 6h6M13 13h6l-6 6h6"/>', wave:'<path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>', one:'<path d="M12 5v14M9 8l3-3"/>', many:'<path d="M7 6v12M12 6v12M17 6v12"/>',
  t20:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>', t30:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>', t45:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>', t60:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>',
  ok:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>', knee:'<path d="M9 3l2 7-3 4 4 7M13 10l4 2"/>', shoulder:'<circle cx="12" cy="6" r="2.5"/><path d="M4 18c0-5 3.5-8.5 8-8.5s8 3.5 8 8.5"/>', wrist:'<path d="M7 20v-7l-2-3a2 2 0 0 1 3-2l2 2V5a1.5 1.5 0 0 1 3 0v4"/>', ankle:'<path d="M9 3v10l-4 3v4h12v-3l-5-2V3"/>',
  jump:'<path d="M12 19V7M7 11l5-5 5 5M6 21h12"/>', soft:'<path d="M4 17c3-5 6-5 8 0s5 5 8-2"/>', no:'<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>', cal:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  mg:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/>'
};
function paIcoOpt(s, id, ico){
  if(ico === "ausr") return STUDIO_GERAET_ICON[id] || STUDIO_AUSR_ICON[id] || PA_ICO.dumbbell;
  return PA_ICO[ico] || PA_ICO.check;
}
function paOptName(s, id){ return s.t ? (id === "keine" ? pt("g_keine") : t(s.pre + id)) : (s.pre === "trArt_" ? t("trArt_" + id) : pt(s.pre + id)); }
function paZusammen(a){
  var tn = a.tage.map(progTagName).join(" "), bereicheT = a.bereiche.map(function(b){
    var x = pt("b_" + b);
    if(b === "run" && a.laufen) x += " (" + pt("l_" + a.laufen) + ")";
    return x; }).join(", ");
  return [
    ["ziele", pt("k_ziele"), a.ziele.map(function(z){ return pt("z_" + z); }).join(", ") || "–"],
    ["fokus", pt("k_fokus"), a.zonen.length ? a.zonen.map(kkName).join(", ") : pt("keinFokus")],
    ["niveau", pt("k_niveau"), a.niveau ? pt("n_" + a.niveau) : "–"],
    ["schwer", pt("k_schwer"), a.schwer ? pt("s_" + a.schwer) : "–"],
    ["tage", pt("k_tage"), tn || "–"],
    ["dauer", pt("k_dauer"), a.dauer ? pt("d_" + a.dauer) : "–"],
    ["ausr", pt("k_ausr"), a.ausr.map(function(x){ return x === "keine" ? pt("g_keine") : t("stGer_" + x); }).join(", ") || "–"],
    ["train", pt("k_train"), a.train.map(function(x){ return t("trArt_" + x); }).join(", ") || "–"],
    ["bereiche", pt("k_bereiche"), bereicheT || "–"],
    ["einschr", pt("k_einschr"), a.einschr.length ? a.einschr.map(function(e){ return pt("e_" + e); }).join(", ") : pt("e_keine")],
    ["impact", pt("k_impact"), a.impact ? pt("i_" + a.impact) : "–"],
    ["sport", pt("k_sport"), a.sport ? a.sport.name + " · " + progTagName(a.sport.tag) : pt("sp_keiner")]
  ];
}
function paOptHTML(s, o, an){
  var id = String(o[0]), name = paOptName(s, o[0]);
  if(s.foto) return '<button type="button" class="pa-opt pa-foto'+(an ? ' an' : '')+'" data-pa-opt="'+esc(id)+'" aria-pressed="'+an+'"><img src="'+TRAIN_FOTO[id]+'" alt="" draggable="false"><span class="pa-fotot"><b>'+esc(name)+'</b><small>'+esc(pt("t_" + id))+'</small></span><i class="pa-haken" aria-hidden="true">'+svgIcon('<path d="M5 12.5l4.5 4.5L19 7"/>')+'</i></button>';
  return '<button type="button" class="pa-opt'+(an ? ' an' : '')+'" data-pa-opt="'+esc(id)+'" aria-pressed="'+an+'"><span class="pa-ico">'+svgIcon(paIcoOpt(s, o[0], o[1]))+'</span><span class="pa-ot"><b>'+esc(name)+'</b>'+((s.sub || s.pre === "z_") ? '<small>'+esc(pt(s.pre + o[0] + "_s"))+'</small>' : "")+'</span><i class="pa-haken" aria-hidden="true">'+svgIcon('<path d="M5 12.5l4.5 4.5L19 7"/>')+'</i></button>';
}
function paZeichnen(){
  var steps = paSchritte(), idx = Math.max(0, Math.min(paIdx, steps.length - 1)), s = steps[idx], a = paA, sichtbar = steps.length;
  var h = '<div class="confirm-overlay pa-overlay"><div class="confirm-sheet pa-sheet" role="dialog" aria-label="'+esc(pt("titel"))+'">'+
    '<div class="pa-kopf">'+(idx > 0 && !paZurUebers ? '<button type="button" class="pa-x pa-zurueck" data-pa-zurueck2 aria-label="'+esc(pt("zurueckPfeil"))+'">'+svgIcon('<path d="M15 5l-7 7 7 7"/>')+'</button>' : '<span class="pa-x leer" aria-hidden="true"></span>')+'<span class="pa-zaehler">'+
    esc(s.art === "fertig" ? pt("uebersicht") : pt("frageVon", { n:idx + 1, m:sichtbar - 1 }))+'</span>'+
    '<button type="button" class="pa-x" data-pa-x aria-label="'+esc(pt("abbrechen"))+'">'+svgIcon('<path d="M6 6l12 12M18 6L6 18"/>')+'</button></div>'+
    '<div class="pa-balken" role="progressbar" aria-valuemin="1" aria-valuemax="'+(sichtbar - 1)+'" aria-valuenow="'+Math.min(idx + 1, sichtbar - 1)+'">'+steps.slice(0, sichtbar - 1).map(function(x, k){ return '<i class="'+(k < idx || s.art === "fertig" ? 'fertig' : k === idx ? 'jetzt' : '')+'"></i>'; }).join("")+'</div>'+
    '<h3 class="pa-titel">'+esc(pt("q_" + s.id))+'</h3><p class="pa-hinweis">'+esc(pt("h_" + s.id))+'</p><div class="pa-body" data-pa-body>';
  var weiterOk = true;
  if(s.art === "eins" || s.art === "multi"){
    if(s.art === "multi") h += '<p class="pa-mehrere">'+esc(pt("mehrere"))+'</p>';
    var gew = s.art === "eins" ? a[s.key] : selArr(a[s.key]).map(String);
    h += '<div class="pa-opts'+(s.chips ? ' chips' : '')+(s.spalten === 2 ? ' zwei' : '')+(s.foto ? ' fotos' : '')+'" role="'+(s.art === "eins" ? "radiogroup" : "group")+'">'+s.opt.map(function(o){
      var an = s.id === "einschr" && o[0] === "keine" ? !a.einschr.length : s.id === "fokus" && o[0] === "ausgew" ? (a.fokus.indexOf("ausgew") > -1 || !a.fokus.length) : (s.art === "eins" ? String(gew) === String(o[0]) : gew.indexOf(String(o[0])) > -1);
      var nein = s.id === "schwer" && o[0] === "schwer" && !paSchwerErlaubt(a);
      var b = paOptHTML(s, o, an);
      return nein ? b.replace('<button type="button" class="pa-opt', '<button type="button" disabled title="'+esc(pt("schwerNein"))+'" class="pa-opt aus') : b;
    }).join("")+'</div>';
    weiterOk = s.opt_ ? true : (s.art === "eins" ? !!gew && String(gew) !== "" : (s.id === "einschr" ? true : gew.length > 0));
  } else if(s.art === "figur"){
    h += kkMuskelHTML("data-pazone", "data-pagrp", a.zonen, { ohneLabel:true });
    weiterOk = true;
  } else if(s.art === "tage"){
    h += '<div class="pa-tage" role="group">'+[0, 1, 2, 3, 4, 5, 6].map(function(d){ var an = a.tage.indexOf(d) > -1; return '<button type="button" class="pa-tag'+(an ? ' an' : '')+'" data-pa-tag="'+d+'" aria-pressed="'+an+'">'+esc(progTagName(d))+'</button>'; }).join("")+'</div>'+
      '<p class="pa-summe">'+esc(a.tage.length ? pt("tagePro", { n:a.tage.length }) : "")+'</p>';
    weiterOk = a.tage.length > 0;
  } else if(s.art === "bereiche"){
    h += '<p class="pa-mehrere">'+esc(pt("mehrere"))+'</p><div class="pa-opts" role="group">'+[["workout", "dumbbell"], ["run", "run"], ["mobility", "stretch"]].map(function(o){
      var an = a.bereiche.indexOf(o[0]) > -1, sub = "";
      if(an && o[0] === "run") sub = '<div class="pa-sub" role="radiogroup">'+[["ein", "l_ein"], ["reg", "l_reg"]].map(function(x){ return '<button type="button" class="pa-chip'+(a.laufen === x[0] ? ' an' : '')+'" data-pa-lauf="'+x[0]+'" aria-pressed="'+(a.laufen === x[0])+'">'+esc(pt(x[1]))+'</button>'; }).join("")+'</div>';
      return '<div class="pa-grp"><button type="button" class="pa-opt'+(an ? ' an' : '')+'" data-pa-bereich="'+o[0]+'" aria-pressed="'+an+'"><span class="pa-ico">'+svgIcon(PA_ICO[o[1]])+'</span><span class="pa-ot"><b>'+esc(pt("b_" + o[0]))+'</b><small>'+esc(pt("b_" + o[0] + "_s"))+'</small></span><i class="pa-haken" aria-hidden="true">'+svgIcon('<path d="M5 12.5l4.5 4.5L19 7"/>')+'</i></button>'+sub+'</div>';
    }).join("")+'</div>';
    weiterOk = a.bereiche.length > 0;
  } else if(s.art === "sport"){
    var sp = a.sport || { name:"", tag:-1 };
    h += '<input type="text" class="pa-eingabe" data-pa-sportname maxlength="24" value="'+esc(sp.name)+'" placeholder="'+esc(pt("sp_name"))+'" autocomplete="off">'+
      '<div class="pa-tage kl" role="group" aria-label="'+esc(pt("sp_tag"))+'">'+[0, 1, 2, 3, 4, 5, 6].map(function(d){ var an = sp.tag === d; return '<button type="button" class="pa-tag'+(an ? ' an' : '')+'" data-pa-sporttag="'+d+'" aria-pressed="'+an+'">'+esc(progTagName(d))+'</button>'; }).join("")+'</div>';
    weiterOk = !a.sport || (a.sport.name && a.sport.tag >= 0) || !a.sport.name;
  } else if(s.art === "fertig"){
    var sp2 = null, geht = paVollstaendig(a);
    if(geht){ try { sp2 = paErzeuge(a); } catch(err){ sp2 = null; } }
    var fehlt = [];
    if(sp2 && a.bereiche.indexOf("workout") > -1){   // gewählte Geräte, die im fertigen Plan gar nicht vorkommen (z. B. Langhantel, aber nur Trainingsart Körpergewicht)
      var benutzt = {};
      (sp2.tage || []).forEach(function(tg){ (tg.teile || []).forEach(function(te){ ((te.bloc && te.bloc.ids) || []).forEach(function(id){ var ex = findExercise(id); if(ex) exAusr(ex).forEach(function(g){ benutzt[g] = true; }); }); }); });
      fehlt = a.ausr.filter(function(x){ return x !== "keine" && !benutzt[x]; });
    }
    h += (fehlt.length ? '<p class="pa-warn" role="note">'+esc(pt("geraetFehlt", { g:fehlt.map(function(x){ return t("stGer_" + x); }).join(", ") }))+'</p>' : '')+
      (sp2 ? '<div class="pa-vorschau"><b>'+esc(sp2.name)+'</b><small>'+esc(pt("einheitenSumme", { n:sp2.nTage, m:a.wochen }))+'</small><small>'+esc(pt("who", { m:sp2.minuten, k:sp2.kraftTage })+(sp2.minuten < 150 ? " "+pt("whoRest") : ""))+'</small></div>' : "")+
      '<div class="pa-liste">'+paZusammen(a).map(function(r){ return '<button type="button" class="pa-zeile" data-pa-sprung="'+r[0]+'"><span>'+esc(r[1])+'</span><b>'+esc(r[2])+'</b><i>'+esc(pt("aendern"))+'</i></button>'; }).join("")+'</div>'+
      '<details class="pa-mehr"'+(paEdit ? ' open' : '')+'><summary>'+esc(pt("mehr"))+'</summary><div class="pa-mehr-in"><div class="pa-label">'+esc(pt("alter"))+'</div><div class="pa-chips">'+
        [["u50", "a_u50"], ["50", "a_50"], ["65", "a_65"]].map(function(x){ return '<button type="button" class="pa-chip'+(a.alter === x[0] ? ' an' : '')+'" data-pa-alter="'+x[0]+'" aria-pressed="'+(a.alter === x[0])+'">'+esc(pt(x[1]))+'</button>'; }).join("")+
        '</div><div class="pa-label">'+esc(pt("wochenT"))+'</div><div class="pa-chips">'+[4, 6, 8].map(function(w){ return '<button type="button" class="pa-chip'+(a.wochen === w ? ' an' : '')+'" data-pa-wochen="'+w+'" aria-pressed="'+(a.wochen === w)+'">'+esc(pt("wochenN", { n:w }))+'</button>'; }).join("")+'</div></div></details>';
    weiterOk = geht;
  }
  var letzte = s.art === "fertig";
  h += '</div>'+(!weiterOk && !letzte ? '<p class="pa-sperre" role="status">'+esc(pt("waehleMind"))+'</p>' : "")+(letzte ? '<p class="pa-lokal">'+esc(pt("lokal"))+'</p>' : "")+'<div class="pa-fuss">'+
    '<button type="button" class="btn btn-secondary" data-pa-zurueck>'+esc(idx === 0 ? pt("abbrechen") : pt("zurueck"))+'</button>'+
    '<button type="button" class="btn btn-primary" data-pa-weiter'+(weiterOk ? '' : ' disabled')+'>'+esc(letzte ? (paEdit ? pt("uebernehmen") : pt("fertigBtn")) : (s.opt_ && !paHatAntwort(s, a) ? pt("ueberspringen") : pt("weiter")))+'</button></div></div></div>';
  paRoot.innerHTML = h;
  paBinden(s, idx, steps);
}
function paHatAntwort(s, a){
  if(s.id === "fokus") return a.zonen.length > 0;
  if(s.id === "sport") return !!(a.sport && a.sport.name);
  return true;
}
function paWeiter(){
  if(paZurUebers){ paZurUebers = false; paIdx = paSchritte().length - 1; }
  else paIdx = Math.min(paSchritte().length - 1, paIdx + 1);
  paZeichnen();
}
function paBinden(s, idx, steps){
  var a = paA;
  function schliessen(){ paRoot.innerHTML = ""; paA = null; paEdit = null; }
  function abbrechen(){
    var begonnen = a.ziele.length || a.tage.length || a.train.length;
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
    if(s.id === "niveau" && !a.schwer) a.schwer = paSchwerStandard(a);
    paWeiter();
  });
  paRoot.querySelectorAll("[data-pa-opt]").forEach(function(b){
    b.addEventListener("click", function(){
      var v = b.getAttribute("data-pa-opt"), k = s.key;
      if(s.art === "eins"){
        a[k] = k === "dauer" ? +v : v;
        paZeichnen();
        setTimeout(function(){ if(paA === a && paSchritte()[paIdx] && paSchritte()[paIdx].id === s.id){ if(s.id === "niveau" && !a.schwer) a.schwer = paSchwerStandard(a); paWeiter(); } }, 240);
        return;
      }
      var l = selArr(a[k]).map(String);
      if(s.exkl && v === s.exkl){ l = v === "keine" ? [] : [v]; }
      else { l = l.filter(function(x){ return x !== s.exkl; }); var i = l.indexOf(v); if(i > -1) l.splice(i, 1); else l.push(v); }
      a[k] = l;
      if(k === "ziele") a.ziel = l[0] || "";
      paZeichnen();
    });
  });
  paRoot.querySelectorAll("[data-pazone]").forEach(function(b){ b.addEventListener("click", function(){ a.zonen = kkNorm(selToggle(a.zonen, b.getAttribute("data-pazone"))); a.fokus = []; paZeichnen(); }); });
  paRoot.querySelectorAll("[data-pagrp]").forEach(function(b){ b.addEventListener("click", function(){ a.zonen = kkNorm(kkGrpToggle(a.zonen, b.getAttribute("data-pagrp"))); a.fokus = []; paZeichnen(); }); });
  paRoot.querySelectorAll("[data-kkmodus]").forEach(function(b){ b.addEventListener("click", function(){ setTimeout(paZeichnen, 0); }); });   // Figur: Grob/Fein
  paRoot.querySelectorAll("[data-pa-bereich]").forEach(function(b){ b.addEventListener("click", function(){
    var v = b.getAttribute("data-pa-bereich"), l = a.bereiche.slice(), i = l.indexOf(v);
    if(i > -1) l.splice(i, 1); else l.push(v);
    a.bereiche = l; if(v === "run" && l.indexOf("run") > -1 && !a.laufen) a.laufen = "ein"; paZeichnen();
  }); });
  paRoot.querySelectorAll("[data-pa-lauf]").forEach(function(b){ b.addEventListener("click", function(){ a.laufen = b.getAttribute("data-pa-lauf"); paZeichnen(); }); });
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
  paRoot.querySelectorAll("[data-pa-alter]").forEach(function(b){ b.addEventListener("click", function(){ a.alter = b.getAttribute("data-pa-alter"); paZeichnen(); var o2 = paRoot.querySelector(".pa-mehr"); if(o2) o2.open = true; }); });
  paRoot.querySelectorAll("[data-pa-wochen]").forEach(function(b){ b.addEventListener("click", function(){ a.wochen = +b.getAttribute("data-pa-wochen"); paZeichnen(); var o2 = paRoot.querySelector(".pa-mehr"); if(o2) o2.open = true; }); });
  paRoot.querySelectorAll("[data-pa-sprung]").forEach(function(b){ b.addEventListener("click", function(){
    var id = b.getAttribute("data-pa-sprung"), st = paSchritte(), i = st.map(function(x){ return x.id; }).indexOf(id);
    if(i > -1){ paIdx = i; paZurUebers = true; paZeichnen(); }
  }); });
}
function paLaden(){   // kurzer Ladezustand, damit das Zusammenstellen spürbar ist
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
  var tageText = res.progs.map(function(p){ return '<div class="pa-wz"><span>'+esc(progTagName(p.tage[0]))+'</span><b>'+esc(p.name.replace(/^(.*?) · (?:Tag|Day) (\d+) · .*$/, "$2 · $1"))+'</b></div>'; }).join("");
  paRoot.innerHTML = '<div class="confirm-overlay pa-overlay"><div class="confirm-sheet pa-sheet pa-ende" role="dialog" aria-label="'+esc(pt("erstellt"))+'">'+
    '<div class="pa-haken-gross" aria-hidden="true">'+svgIcon('<path d="M5 12.5l4.5 4.5L19 7"/>')+'</div><h3 class="pa-titel">'+esc(ersetze ? pt("angepasst") : pt("erstellt"))+'</h3>'+
    '<p class="pa-hinweis">'+esc(res.sp.name)+' · '+esc(pt("inKalenderOk", { n:res.n }))+'</p>'+
    '<div class="pa-punkte" aria-hidden="true">'+[0, 1, 2, 3, 4, 5, 6].map(function(d){ var an = res.progs.some(function(p){ return p.tage.indexOf(d) > -1; }); return '<span class="'+(an ? 'an' : '')+'"><i></i><small>'+esc(progTagName(d))+'</small></span>'; }).join("")+'</div>'+
    '<div class="pa-woche">'+tageText+'</div>'+
    '<p class="pa-lokal">'+esc(pt("spaeter"))+'</p>'+
    '<div class="pa-fuss stapel"><button type="button" class="btn btn-primary" data-pa-ansehen>'+esc(pt("ansehen"))+'</button>'+
    '<button type="button" class="btn btn-secondary" data-pa-kalaus>'+esc(pt("ausKalender"))+'</button>'+
    '<button type="button" class="btn btn-secondary" data-pa-ok>'+esc(pt("fertig"))+'</button></div></div></div>';
  function zu(){ paRoot.innerHTML = ""; paA = null; paEdit = null; var rt = parseHash()[0]; if(rt === "koerper") renderKoerper(); }
  paRoot.querySelector("[data-pa-ok]").addEventListener("click", zu);
  paRoot.querySelector("[data-pa-ansehen]").addEventListener("click", function(){ paRoot.innerHTML = ""; paA = null; paEdit = null; if(parseHash()[0] === "koerper") renderKoerper(); else go("#koerper"); });
  paRoot.querySelector("[data-pa-kalaus]").addEventListener("click", function(){ var n = paKalenderGruppeAus(res.gid); showToast(pt("ausKalenderOk", { n:n })); zu(); });
}
/* Einstieg: neuer Plan (a = null) oder Anpassen (a = gespeicherte Antworten, ersetze = Gruppen-ID des Plans) */
function paOeffnen(a, ersetze){
  paRoot = document.getElementById("overlayRoot");
  paA = a ? paSauber(a) : paSauber(null); paEdit = ersetze || null; paZurUebers = false;
  paIdx = ersetze ? paSchritte().length - 1 : 0;
  paZeichnen();
}
