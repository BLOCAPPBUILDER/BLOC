/* BLOC – Inhaltsdaten: Übungen, fertige Workouts, Kategorien, Anleitungen und Posen der Figuren.
   Unverändert aus index.html herausgelöst. index.html entpackt window.BLOC_DATEN am Anfang
   des Haupt-Skripts wieder in dieselben Variablennamen - der übrige Code bleibt gleich. */
(function(){
"use strict";

/* Zusammengelegte Dubletten: alte Übungs-ID -> Übung, die bleibt. Gespeicherte Workouts,
   Favoriten und geteilte Links mit alten IDs funktionieren so weiter. */
var EX_ALIAS = {
  "archer-row":"inverted-rows", "straight-bar-dips":"parallel-bar-dips", "korean-dips":"parallel-bar-dips",
  "bar-traverse":"monkey-bar-traverse", "slow-mountain-climbers":"mountain-climbers",
  "hip-hinge":"good-mornings", "leg-levers":"leg-raises",
  /* aussortiert (2026-09): die nächstliegende verbliebene Übung übernimmt */
  "wall-push-ups":"push-ups", "backpack-triceps":"triceps-curls", "human-flag":"hanging-l-sit"
};

/* Übungen und fertige Workouts aus der Übungsbibliothek. Sie liegen im Code, nicht im Speicher:
   Sie bleiben immer unverändert. „Übernehmen“ legt eigene, bearbeitbare Blöcke/Workouts an,
   „Ausblenden“ versteckt einen Eintrag (settings.hiddenLib), er lässt sich wieder einblenden.
   Pause innerhalb eines Blocks immer 10 s. „je Seite“: sides=true, reps zählt dann beide Seiten. */
var LIB_CATS = [
  { id:"cardio", de:"Cardio",     en:"Cardio" },
  { id:"weight", de:"Gewicht",    en:"Weights" },
  { id:"bw",     de:"Bodyweight", en:"Bodyweight" },
  { id:"back",   de:"Rücken",     en:"Back" },
  { id:"legs",   de:"Beine",      en:"Legs" },
  { id:"core",   de:"Bauch / Core", en:"Abs / Core" },
  { id:"arms",   de:"Arme",       en:"Arms" },
  { id:"calis",  de:"Calisthenics", en:"Calisthenics" },
  { id:"stretch", de:"Dehnen",    en:"Stretching" }
];
/* [id, Name DE, Name EN, Kategorien, Runden (je Seite: pro Seite), Arbeit s, je Seite?, Hinweis DE, Hinweis EN] */
var EXERCISE_ROWS = [
  ["burpees","Burpees","Burpees","cardio",6,30,0,"Ganzkörper, kontrolliertes Tempo","Full body, controlled pace"],
  ["jump-squats","Jump Squats","Jump Squats","cardio legs",6,30,0,"Explosiv, weich landen","Explosive, land softly"],
  ["mountain-climbers","Mountain Climbers","Mountain Climbers","cardio core",6,30,0,"Rumpf stabil","Keep your core stable"],
  ["high-knees","High Knees","High Knees","cardio",6,30,0,"Aktiver Armeinsatz","Drive your arms"],
  ["jumping-jacks","Jumping Jacks","Jumping Jacks","cardio",6,30,0,"Gleichmäßiger Rhythmus","Steady rhythm"],
  ["skater-jumps","Skater Jumps","Skater Jumps","cardio",6,30,0,"Seitliche Belastung","Lateral loading"],
  ["jump-lunges","Jump Lunges","Jump Lunges","cardio legs",6,30,0,"Beinwechsel im Sprung, weich landen","Switch legs in the air, land softly"],
  ["plank-burpees","Plank Burpees","Plank Burpees","cardio",6,30,0,"Ohne Liegestütz und Sprung möglich","Can be done without push-up and jump"],
  ["burpee-squat-jumps","Burpee Squat Jumps","Burpee Squat Jumps","cardio",5,30,0,"Nach dem Burpee ein voller Squat Jump","A full squat jump after the burpee"],
  ["jump-forward-squats","Jump Forward Squats","Jump Forward Squats","cardio legs",6,30,0,"Weit nach vorn springen, weich landen","Jump far forward, land softly"],
  ["jump-forward-burpees","Jump Forward Burpees","Jump Forward Burpees","cardio",5,30,0,"Burpee, dann weit nach vorn springen","Burpee, then jump far forward"],
  ["frogs","Frogs","Frogs","cardio",6,30,0,"Aus tiefer Position explosiv","Explode from a deep position"],
  ["stand-up-jumps","Stand-up Jumps","Stand-up Jumps","cardio",5,20,0,"Fortgeschritten, sauber aufstehen","Advanced, stand up cleanly"],
  ["lateral-hops","Lateral Hops","Lateral Hops","cardio",6,30,0,"Kleine schnelle Seitensprünge","Small, quick side hops"],
  ["fast-feet","Fast Feet","Fast Feet","cardio",8,20,0,"Kurze, schnelle Bodenkontakte","Short, quick ground contacts"],
  ["box-step-ups","Box Step-ups schnell","Fast Box Step-ups","cardio",6,30,0,"Stabile Stufe verwenden","Use a stable step"],
  ["sprint-in-place","Sprint auf der Stelle","Sprint in Place","cardio",8,20,0,"So schnell, wie es sauber bleibt","As fast as stays clean"],

  ["goblet-squat","Goblet Squat","Goblet Squat","weight",6,30,0,"Gewicht vor der Brust","Weight held at your chest"],
  ["kb-swing","Kettlebell Swing","Kettlebell Swing","weight",6,30,0,"Kraft aus der Hüfte","Power from the hips"],
  ["db-thruster","Dumbbell Thruster","Dumbbell Thruster","weight",5,30,0,"Kniebeuge plus Schulterdrücken","Squat plus overhead press"],
  ["romanian-deadlift","Romanian Deadlift","Romanian Deadlift","weight",6,30,0,"Rücken neutral","Neutral back"],
  ["db-deadlift","Dumbbell Deadlift","Dumbbell Deadlift","weight",6,30,0,"Gewichte körpernah","Keep the weights close"],
  ["bent-over-row","Bent-over Row","Bent-over Row","weight",6,30,0,"Schulterblätter zurück","Squeeze shoulder blades back"],
  ["one-arm-row","Einarmiges Rudern","One-arm Row","weight",3,30,1,"Seite nach jedem Intervall wechseln","Switch sides after each interval"],
  ["floor-press","Floor Press","Floor Press","weight",6,30,0,"Am Boden, kontrolliert","On the floor, controlled"],
  ["shoulder-press","Shoulder Press","Shoulder Press","weight",5,30,0,"Rumpf fest","Brace your core"],
  ["push-press","Push Press","Push Press","weight",6,30,0,"Leichter Impuls aus den Beinen","Slight drive from the legs"],
  ["weighted-reverse-lunge","Reverse Lunge mit Gewicht","Weighted Reverse Lunge","weight",6,30,0,"Alternierend","Alternate legs"],
  ["front-rack-carry","Front Rack Carry","Front Rack Carry","weight",6,40,0,"Aufrechte Haltung","Stand tall"],
  ["farmer-carry","Farmer Carry","Farmer Carry","weight",6,40,0,"Schwere, sichere Last","Heavy but safe load"],
  ["kb-clean","Kettlebell Clean","Kettlebell Clean","weight",4,20,1,"Technik vor Tempo","Technique before speed"],
  ["renegade-row","Renegade Row","Renegade Row","weight",5,20,0,"Eckige Hanteln, breiter Stand","Hex or flat dumbbells, wide stance"],

  ["push-ups","Push-ups","Push-ups","bw",6,20,0,"Bei Bedarf auf Knien","On your knees if needed"],
  ["pike-push-ups","Pike Push-ups","Pike Push-ups","bw",5,20,0,"Hüfte hoch, Kopf zwischen den Armen","Hips high, head between your arms"],
  ["triceps-dips","Triceps Dips","Triceps Dips","bw arms",5,20,0,"Stabile Bank oder Stuhl","Stable bench or chair"],
  ["squat-hold","Squat Hold","Squat Hold","bw",6,30,0,"Spannung halten","Hold the tension"],
  ["walking-lunges","Walking Lunges","Walking Lunges","bw",6,30,0,"Kontrollierte Schritte","Controlled steps"],
  ["reverse-lunges","Reverse Lunges","Reverse Lunges","bw legs",6,30,0,"Alternierend","Alternate legs"],
  ["side-lunges","Side Lunges","Side Lunges","bw legs",6,30,0,"Becken nach hinten","Push your hips back"],
  ["cossack-squats","Cossack Squats","Cossack Squats","bw legs",5,30,0,"Mobilität und Kraft","Mobility and strength"],
  ["deep-squats","Deep Squats","Deep Squats","bw legs",6,30,0,"Nur schmerzfreie Tiefe","Only as deep as feels pain-free"],
  ["pistol-assist","Pistol Squat Assist","Pistol Squat Assist","bw legs",4,20,1,"Mit Festhalten","Hold on to something"],
  ["plank-steps","Plank Steps","Plank Steps","bw",6,30,0,"Hüfte ruhig halten","Keep your hips still"],
  ["bear-crawl","Bear Crawl","Bear Crawl","bw",6,30,0,"Knie knapp über dem Boden","Knees just above the floor"],
  ["wall-sit","Wall Sit","Wall Sit","bw legs",6,30,0,"Rücken an der Wand","Back against the wall"],
  ["calf-raises","Calf Raises","Calf Raises","bw legs",6,30,0,"Oben kurz halten","Pause briefly at the top"],
  ["glute-bridge","Glute Bridge","Glute Bridge","bw legs",6,30,0,"Gesäß aktiv anspannen","Actively squeeze your glutes"],

  ["pull-ups","Pull-ups","Pull-ups","back calis",5,15,0,"Nur saubere Wiederholungen","Clean reps only",20],
  ["negative-pull-ups","Negative Pull-ups","Negative Pull-ups","back",5,20,0,"Langsam absenken","Lower slowly"],
  ["inverted-rows","Inverted Rows","Inverted Rows","back calis",6,20,0,"Nur an sicherer Stange","Only on a secure bar",15],
  ["superman-hold","Superman Hold","Superman Hold","back",6,20,0,"Kleine kontrollierte Hebung","Small, controlled lift"],
  ["reverse-snow-angels","Reverse Snow Angels","Reverse Snow Angels","back",6,30,0,"Bauchlage, Arme führen","Lying face down, guide the arms"],
  ["bird-dog","Bird Dog","Bird Dog","back",6,30,0,"Diagonal, langsam","Diagonal, slow"],
  ["prone-y-raise","Prone Y-Raise","Prone Y-Raise","back",6,20,0,"Daumen nach oben","Thumbs up"],
  ["prone-t-raise","Prone T-Raise","Prone T-Raise","back",6,20,0,"Schulterblätter aktiv","Engage your shoulder blades"],
  ["good-mornings","Good Mornings","Good Mornings","back",6,30,0,"Rücken neutral","Neutral back"],
  ["swimmers","Swimmers","Swimmers","back",6,30,0,"Kleine Wechselbewegung","Small alternating movement"],
  ["scapular-push-ups","Scapular Push-ups","Scapular Push-ups","back",6,20,0,"Arme bleiben gestreckt","Arms stay straight"],
  ["scapular-pull-ups","Scapular Pull-ups","Scapular Pull-ups","back calis",5,15,0,"Nur Schulterblätter bewegen","Move only your shoulder blades"],
  ["dead-hang","Dead Hang","Dead Hang","back calis",5,20,0,"Nur bei geeigneter Stange","Only with a suitable bar",15],

  ["air-squats","Air Squats","Air Squats","legs",6,30,0,"Knie folgen der Fußrichtung","Knees track over your toes"],
  ["split-squats","Split Squats","Split Squats","legs",3,30,1,"Stabiler Stand","Stable stance"],
  ["bulgarian-split-squats","Bulgarian Split Squats","Bulgarian Split Squats","legs",3,30,1,"Hinterer Fuß erhöht","Rear foot elevated"],
  ["forward-lunges","Forward Lunges","Forward Lunges","legs",6,30,0,"Kontrolliert abbremsen","Brake with control"],
  ["single-leg-glute-bridge","Single-leg Glute Bridge","Single-leg Glute Bridge","legs",3,30,1,"Becken waagerecht","Keep your pelvis level"],
  ["lateral-lunge-pulses","Lateral Lunge Pulses","Lateral Lunge Pulses","legs",3,30,1,"Kleine kontrollierte Pulse","Small, controlled pulses"],

  ["plank","Plank","Plank","core",6,30,0,"Gerade Körperlinie","Straight body line"],
  ["side-plank","Side Plank","Side Plank","core",3,30,1,"Hüfte oben halten","Keep your hips up"],
  ["dead-bug","Dead Bug","Dead Bug","core",6,30,0,"Lendenwirbelsäule stabil","Keep your lower back stable"],
  ["bicycle-crunches","Bicycle Crunches","Bicycle Crunches","core",6,30,0,"Nicht am Nacken ziehen","Don't pull on your neck"],
  ["leg-raises","Leg Raises","Leg Raises","core",6,30,0,"Bei Bedarf Knie beugen","Bend your knees if needed"],
  ["jackknives","V-Ups (Jackknives)","V-Ups (Jackknives)","core",5,30,0,"Arme und Beine gleichzeitig zusammenführen","Bring arms and legs together at the same time"],
  ["reverse-crunch","Reverse Crunch","Reverse Crunch","core",6,30,0,"Knie zur Brust ziehen und Becken anheben","Pull your knees in and lift your pelvis"],
  ["side-jackknives","Side Jackknives","Side Jackknives","core",3,30,1,"Seitliche Bauchmuskeln","Side abs"],
  ["hollow-hold","Hollow Hold","Hollow Hold","core",6,20,0,"Leichter mit gebeugten Knien","Easier with bent knees"],
  ["russian-twists","Ukraine Twist","Ukraine Twist","core",6,30,0,"Brustbein aufrecht","Keep your chest up"],
  ["sit-ups","Sit-ups","Sit-ups","core",6,30,0,"Kontrolliertes Tempo","Controlled pace"],
  ["toe-touches","Toe Touches","Toe Touches","core",6,30,0,"Schultern aktiv anheben","Actively lift your shoulders"],
  ["plank-shoulder-taps","Plank Shoulder Taps","Plank Shoulder Taps","core",6,30,0,"Becken ruhig","Keep your pelvis still"],
  ["toes-to-bar","Toes-to-Bar","Toes-to-Bar","core calis",4,20,0,"Nur an sicherer Stange","Only on a secure bar"],

  /* Arme ohne Gewicht (Armkreisen zählt zur Hauptkategorie Stretch / Mobility) */
  ["triceps-curls","Trizeps über Kopf (Kurzhantel)","Overhead Triceps Extension","weight arms",6,30,0,"Kurzhantel über dem Kopf, Ellbogen bleiben eng","Dumbbell overhead, keep your elbows in"],
  ["close-grip-push-ups","Enge Liegestütz","Close-grip Push-ups","arms",6,20,0,"Ellbogen streifen am Körper entlang","Elbows brush past your ribs"],
  ["diamond-push-ups","Diamant-Liegestütz","Diamond Push-ups","arms",5,20,0,"Hände bilden ein Dreieck unter der Brust","Hands form a triangle under your chest"],
  ["sphinx-push-ups","Sphinx-Liegestütz","Sphinx Push-ups","arms",5,20,0,"Vom Unterarm auf die Hände drücken","Press from forearms up to your hands"],
  ["arm-circles","Armkreisen","Arm Circles","arms",6,30,0,"Arme gestreckt auf Schulterhöhe","Arms straight at shoulder height"],

  /* Fitnessstudio: Geräte und Langhantel (Ausrüstung "gym"). Im Timer 3 Sätze × 40 s, 60 s Pause -
     im Studio-Reiter trägt man stattdessen Gewicht und Wiederholungen ein */
  ["leg-press","Beinpresse (sitzend)","Seated Leg Press","weight legs",3,40,0,"Knie folgen den Füßen, unten nicht rund werden","Knees follow your feet, don't round your back at the bottom",60],
  ["leg-press-45","Beinpresse 45° (Schlitten)","45° Leg Press","weight legs",3,40,0,"Nur so tief, wie der Po am Polster bleibt","Only as deep as your hips stay on the pad",60],
  ["leg-extension","Beinstrecker","Leg Extension","weight legs",3,40,0,"Oben kurz halten, langsam zurück","Pause at the top, lower slowly",60],
  ["leg-curl","Beinbeuger (sitzend)","Seated Leg Curl","weight legs",3,40,0,"Oberschenkel unter dem Polster fixiert","Thighs locked under the pad",60],
  ["adductor-machine","Adduktoren","Adductor Machine","weight legs",3,40,0,"Kontrolliert schließen, nicht zuschlagen","Close with control, don't slam",60],
  ["abductor-machine","Abduktoren","Abductor Machine","weight legs",3,40,0,"Oberkörper ruhig, aus der Hüfte öffnen","Keep your torso still, open from the hips",60],
  ["calf-machine","Wadenmaschine","Calf Raise Machine","weight legs",3,40,0,"Unten dehnen, oben kurz halten","Stretch at the bottom, pause at the top",60],
  ["chest-press-machine","Brustpresse","Chest Press Machine","weight",3,40,0,"Griffe auf Brusthöhe, Schultern unten","Handles at chest height, shoulders down",60],
  ["butterfly","Butterfly","Pec Deck (Butterfly)","weight",3,40,0,"Ellbogen leicht gebeugt, Brust führt","Elbows slightly bent, lead with your chest",60],
  ["pullover","Überzug (Pullover)","Dumbbell Pullover","weight",3,40,0,"Arme fast gestreckt, Rippen unten","Arms almost straight, ribs down",60],
  ["lat-pulldown","Latzug","Lat Pulldown","weight back",3,40,0,"Stange zur oberen Brust, nicht in den Nacken","Bar to your upper chest, not behind your neck",60],
  ["row-machine","Rudermaschine","Machine Row","weight back",3,40,0,"Brust am Polster, Schulterblätter zusammen","Chest on the pad, squeeze your shoulder blades",60],
  ["cable-row","Rudern am Kabel (sitzend)","Seated Cable Row","weight back",3,40,0,"Aufrecht sitzen, zum Bauchnabel ziehen","Sit tall, pull to your belly button",60],
  ["reverse-butterfly","Butterfly reverse","Reverse Fly Machine","weight back",3,40,0,"Arme auf Schulterhöhe, nach hinten öffnen","Arms at shoulder height, open backwards",60],
  ["back-extension","Rückenstrecker (Hyperextension)","Back Extension","weight back",3,40,0,"Nur bis zur Linie mit den Beinen","Only up to a straight line with your legs",60],
  ["shoulder-press-machine","Schulterpresse","Shoulder Press Machine","weight",3,40,0,"Rücken am Polster, kein Hohlkreuz","Back on the pad, no arching",60],
  ["biceps-machine","Bizepstrainer","Biceps Curl Machine","weight arms",3,40,0,"Oberarme bleiben auf dem Polster","Upper arms stay on the pad",60],
  ["cable-curl","Bizepscurl am Kabel","Cable Biceps Curl","weight arms",3,40,0,"Ellbogen bleiben am Körper","Elbows stay at your sides",60],
  ["triceps-pushdown","Trizepsdrücken am Kabel","Triceps Pushdown","weight arms",3,40,0,"Oberarme bleiben am Körper, nur Unterarme bewegen","Upper arms stay put, move only your forearms",60],
  ["skull-crusher","French Press (liegend)","Skull Crusher","weight arms",3,40,0,"Ellbogen zeigen zur Decke, Gewicht hinter den Kopf","Elbows point up, lower the weight behind your head",60],
  ["ab-crunch-machine","Bauchmaschine","Ab Crunch Machine","weight core",3,40,0,"Aus dem Bauch einrollen, nicht mit den Armen ziehen","Curl with your abs, don't pull with your arms",60],
  ["bench-press","Bankdrücken (Langhantel)","Barbell Bench Press","weight",3,40,0,"Füße fest, Stange zur unteren Brust","Feet planted, bar to your lower chest",90],
  ["barbell-squat","Kniebeuge (Langhantel)","Barbell Back Squat","weight legs",3,40,0,"Stange auf dem oberen Rücken, Brust aufrecht","Bar on your upper back, chest up",90],
  ["barbell-deadlift","Kreuzheben (Langhantel)","Barbell Deadlift","weight back legs",3,40,0,"Stange nah am Bein, Rücken gerade","Bar close to your legs, flat back",90],
  ["hack-squat", "Hackenschmidt-Kniebeuge", "Hack Squat", "weight legs", 3, 40, 0, "Rücken am Polster, tief und kontrolliert", "Back on the pad, deep and controlled", 90],
  ["smith-squat", "Kniebeuge an der Multipresse", "Smith Machine Squat", "weight legs", 3, 40, 0, "Füße etwas vor der Stange", "Feet slightly in front of the bar", 90],
  ["leg-press-single", "Beinpresse einbeinig", "Single-Leg Press", "weight legs", 3, 40, 1, "Weniger Gewicht, Knie über dem Fuß", "Less weight, knee over your foot", 60],
  ["hip-thrust", "Hip Thrust", "Hip Thrust", "weight legs", 3, 40, 0, "Oben das Gesäß fest anspannen", "Squeeze your glutes hard at the top", 90],
  ["glute-kickback-cable", "Kickback am Kabel", "Cable Glute Kickback", "weight legs", 3, 40, 1, "Nur aus der Hüfte, Rücken ruhig", "From your hip only, back still", 45],
  ["seated-calf", "Wadenheben sitzend", "Seated Calf Raise", "weight legs", 3, 40, 0, "Unten dehnen, oben halten", "Stretch at the bottom, hold at the top", 45],
  ["incline-chest-press", "Schrägbankpresse (Maschine)", "Incline Chest Press Machine", "weight", 3, 40, 0, "Griffe auf oberer Brusthöhe", "Handles at upper-chest height", 60],
  ["cable-crossover", "Kabelzug über Kreuz", "Cable Crossover", "weight", 3, 40, 0, "Arme leicht gebeugt, vor dem Körper zusammen", "Arms slightly bent, together in front", 60],
  ["incline-db-press", "Schrägbankdrücken (Kurzhantel)", "Incline Dumbbell Press", "weight", 3, 40, 0, "Bank etwa 30°", "Bench at about 30°", 90],
  ["db-fly", "Fliegende (Kurzhantel)", "Dumbbell Fly", "weight", 3, 40, 0, "Ellbogen leicht gebeugt, weiter Bogen", "Elbows slightly bent, wide arc", 60],
  ["assisted-pullup", "Klimmzug-Maschine (assistiert)", "Assisted Pull-up Machine", "weight back calis", 3, 40, 0, "Mehr Gegengewicht = leichter", "More counterweight = easier", 90],
  ["close-grip-pulldown", "Latzug eng", "Close-Grip Pulldown", "weight back", 3, 40, 0, "Enger Griff, Ellbogen nah am Körper", "Narrow grip, elbows close", 60],
  ["t-bar-row", "T-Bar-Rudern", "T-Bar Row", "weight back", 3, 40, 0, "Rücken gerade, Griff zur Brust", "Flat back, handle to your chest", 90],
  ["barbell-row", "Langhantelrudern", "Barbell Row", "weight back", 3, 40, 0, "Aus der Hüfte vorbeugen, Stange zum Bauch", "Hinge forward, bar to your belly", 90],
  ["face-pull", "Face Pull", "Face Pull", "weight back", 3, 40, 0, "Seil zur Stirn, Ellbogen hoch", "Rope to your forehead, elbows high", 45],
  ["straight-arm-pulldown", "Überzug am Kabel", "Straight-Arm Pulldown", "weight back", 3, 40, 0, "Arme gestreckt, Bewegung aus der Schulter", "Straight arms, move from the shoulder", 60],
  ["lateral-raise", "Seitheben", "Lateral Raise", "weight", 3, 40, 0, "Arme bis Schulterhöhe, leicht gebeugt", "Arms up to shoulder height, slightly bent", 45],
  ["shrugs", "Schulterheben (Shrugs)", "Shrugs", "weight", 3, 40, 0, "Schultern gerade nach oben", "Shoulders straight up", 45],
  ["hammer-curl", "Hammercurl", "Hammer Curl", "weight arms", 3, 40, 0, "Daumen oben, Ellbogen am Körper", "Thumbs up, elbows at your sides", 45],
  ["barbell-curl", "Langhantel-/SZ-Curl", "Barbell Curl", "weight arms", 3, 40, 0, "Ellbogen fest, ohne Schwung", "Elbows fixed, no swinging", 45],
  ["overhead-cable-triceps", "Trizeps über Kopf am Kabel", "Overhead Cable Extension", "weight arms", 3, 40, 0, "Ellbogen zeigen nach vorn", "Elbows point forward", 45],
  ["triceps-machine", "Trizepsmaschine (Dip sitzend)", "Seated Dip Machine", "weight arms", 3, 40, 0, "Arme nach unten strecken, Schultern tief", "Press down, shoulders low", 60],
  /* 2026-09-30: Geräte aus Kevins Studio */
  ["glute-machine", "Gluteus-Maschine", "Glute Machine", "weight legs", 3, 40, 1, "Nur aus der Hüfte, Rücken ruhig", "From your hip only, back still", 45],
  ["calf-press", "Wadenpresse", "Calf Press", "weight legs", 3, 40, 0, "Knie fast gestreckt, nur aus dem Sprunggelenk", "Knees nearly straight, move only at the ankle", 45],
  ["lying-leg-curl", "Beinbeuger liegend", "Lying Leg Curl", "weight legs", 3, 40, 0, "Hüfte bleibt auf dem Polster", "Hips stay on the pad", 60],
  ["rotary-torso", "Rotary Torso (Rumpfdrehen)", "Rotary Torso", "weight core", 3, 40, 1, "Langsam drehen, Becken bleibt fest", "Rotate slowly, hips stay fixed", 45],
  ["back-extension-machine", "Rückenstrecker-Maschine", "Back Extension Machine", "weight back", 3, 40, 0, "Aus der Hüfte aufrichten, nicht überstrecken", "Extend from the hips, don't overarch", 60],
  ["triceps-extension-machine", "Trizeps-Extension (Maschine)", "Triceps Extension Machine", "weight arms", 3, 40, 0, "Oberarme bleiben auf dem Polster", "Upper arms stay on the pad", 60],
  ["lateral-raise-machine", "Seitheber-Maschine", "Lateral Raise Machine", "weight", 3, 40, 0, "Bis Schulterhöhe, Schultern tief", "Up to shoulder height, shoulders down", 45],
  ["cable-lateral-raise", "Seitheben am Kabel", "Cable Lateral Raise", "weight", 3, 40, 1, "Arm leicht gebeugt, bis Schulterhöhe", "Arm slightly bent, up to shoulder height", 45],
  /* 2026-09-30: weitere gängige Studio-Geräte */
  ["smith-bench-press", "Bankdrücken an der Multipresse", "Smith Machine Bench Press", "weight", 3, 40, 0, "Bank so stellen, dass die Stange zur unteren Brust geht", "Set the bench so the bar lands on your lower chest", 90],
  ["assisted-dip", "Dip-Maschine (assistiert)", "Assisted Dip Machine", "weight arms", 3, 40, 0, "Mehr Gegengewicht = leichter", "More counterweight = easier", 90],
  ["high-row-machine", "Rudern von oben (Maschine)", "High Row Machine", "weight back", 3, 40, 0, "Brust am Polster, Ellbogen nach unten hinten", "Chest on the pad, elbows down and back", 60],
  ["cable-crunch", "Kabel-Crunch kniend", "Kneeling Cable Crunch", "weight core", 3, 40, 0, "Hüfte bleibt stehen, nur der Bauch rollt ein", "Hips stay put, only your abs curl in", 45],
  ["cable-pull-through", "Pull-Through am Kabel", "Cable Pull-Through", "weight legs", 3, 40, 0, "Aus der Hüfte beugen, oben das Gesäß anspannen", "Hinge at the hips, squeeze your glutes at the top", 60],
  ["cable-woodchop", "Holzhacker am Kabel", "Cable Woodchop", "weight core", 3, 40, 1, "Drehung aus dem Rumpf, Arme lang", "Rotate from your core, long arms", 45],
  ["captains-chair", "Knieheben am Gerät", "Captain's Chair Knee Raise", "weight core calis", 3, 40, 0, "Rücken am Polster, Knie zur Brust", "Back on the pad, knees to your chest", 45],
  ["barbell-overhead-press", "Schulterdrücken (Langhantel)", "Barbell Overhead Press", "weight", 3, 40, 0, "Stange senkrecht über den Kopf", "Bar straight overhead", 90],
  ["barbell-rdl", "Rumänisches Kreuzheben (Langhantel)", "Barbell Romanian Deadlift", "weight legs back", 3, 40, 0, "Hüfte nach hinten, Stange am Bein", "Hips back, bar along your legs", 90],
  ["knee-push-ups","Knie-Liegestütz","Knee Push-ups","bw",6,20,0,"Körperlinie von Kopf bis Knie","Body line from head to knees"],
  ["single-leg-calf-raise","Einbeiniges Wadenheben","Single-Leg Calf Raise","bw legs",3,30,1,"Langsam hoch, langsam runter, mit einer Hand festhalten","Slow up, slow down, hold on lightly with one hand",30],
  ["negative-dips","Negative Dips","Negative Dips","calis arms",4,20,0,"Aus dem Stütz langsam absenken","Lower slowly from the support",30],
  ["pallof-press","Pallof-Press","Pallof Press","weight core",3,40,1,"Der Rumpf lässt sich nicht zum Kabel aufdrehen","Don't let the cable turn you",45],
  ["copenhagen-plank","Copenhagen Plank (kurzer Hebel)","Short-Lever Copenhagen Plank","core",3,20,1,"Knie auf die Bank, Körper in einer Linie","Knee on the bench, body in one line",30],
  ["backpack-row","Rucksack-Rudern","Backpack Row","back",6,30,0,"Rucksack nah am Körper, Schulterblätter zusammen","Backpack close to your body, squeeze your shoulder blades"],
  /* 2026-10-14: Ergänzungen aus der Fachprüfung - Hüftbeuge einbeinig und Oberschenkelrückseite ohne Gerät, flaches Kurzhantel-Drücken im Studio */
  ["db-bench-press","Kurzhantel-Bankdrücken","Dumbbell Bench Press","weight",3,40,0,"Schulterblätter zusammen, Hanteln über der Brust","Shoulder blades together, dumbbells over your chest",90],
  ["db-step-ups","Step-ups mit Kurzhanteln","Dumbbell Step-ups","weight legs",3,40,1,"Ganzer Fuß auf der Stufe, aus dem vorderen Bein hochdrücken","Whole foot on the step, drive up through the front leg",60],
  ["sumo-squat-db","Sumo-Kniebeuge mit Kurzhantel","Dumbbell Sumo Squat","weight legs",3,40,0,"Weiter Stand, Knie folgen den Füßen, Hantel zwischen den Beinen","Wide stance, knees follow your feet, dumbbell between your legs",60],
  ["single-leg-rdl","Einbeiniges Kreuzheben (ohne Gewicht)","Single-Leg Romanian Deadlift (bodyweight)","bw legs",3,30,1,"Hüfte nach hinten, Rücken lang, das freie Bein streckt sich nach hinten","Hips back, long back, the free leg reaches behind you",30],
  ["nordic-curl","Nordic Curl (Oberschenkelrückseite)","Nordic Hamstring Curl","bw legs",3,20,0,"Fersen fixieren, so langsam wie möglich nach vorn sinken","Anchor your heels, lower forwards as slowly as you can",30],
  /* Dehnen: Haltezeit statt Arbeit, 5 s zum Umsetzen */
  ["neck-stretch","Nacken seitlich","Neck Side Stretch","stretch",1,30,1,"Schultern locker nach unten","Shoulders relaxed and down",5],
  ["chin-tuck","Kinn einziehen (Nacken)","Chin Tuck (Neck)","stretch",1,30,0,"Kinn gerade nach hinten, nicht nicken","Draw your chin straight back, don't nod",5],
  ["shoulder-stretch","Schulter (Arm vor der Brust)","Cross-body Shoulder Stretch","stretch",1,30,1,"Arm auf Schulterhöhe heranziehen","Pull the arm in at shoulder height",5],
  ["triceps-stretch","Trizeps über Kopf","Overhead Triceps Stretch","stretch",1,30,1,"Ellbogen sanft Richtung Kopf","Ease the elbow towards your head",5],
  ["biceps-stretch","Bizeps an der Wand","Wall Biceps Stretch","stretch",1,30,1,"Handfläche an die Wand, Körper wegdrehen","Palm on the wall, turn your body away",5],
  ["chest-stretch","Brust an der Wand","Wall Chest Stretch","stretch",1,30,1,"Unterarm an Wand oder Türrahmen","Forearm on a wall or door frame",5],
  ["wrist-stretch","Handgelenke (innen und außen)","Wrist Stretch (inside and outside)","stretch",2,20,1,"Finger sanft zurückziehen","Gently pull your fingers back",5],
  ["side-bend","Seitbeuge im Stand","Standing Side Bend","stretch",1,20,1,"Lang machen, nicht nach vorn kippen","Stay long, don't tip forward",5],
  ["cat-cow","Katze-Kuh","Cat-Cow","stretch",1,60,0,"Langsam im Atemrhythmus","Slowly with your breath",5],
  ["thoracic-rotation","Brustwirbelsäule drehen (Vierfüßler)","Thoracic Rotation (All Fours)","stretch",1,30,1,"Hand hinter den Kopf, Ellbogen zur Decke aufdrehen","Hand behind your head, rotate the elbow up to the ceiling",5],
  ["childs-pose","Kindhaltung","Child's Pose","stretch",1,60,0,"Po Richtung Fersen, Arme lang","Hips towards heels, arms long",5],
  ["sphinx-stretch","Sphinx","Sphinx Stretch","stretch",1,45,0,"Unterarme stützen, Bauch entspannt","Forearms support, belly relaxed",5],
  ["cobra-lift","Kobra","Cobra Stretch","stretch",2,20,0,"Hüfte bleibt am Boden, Schultern tief","Hips stay down, shoulders low",5],
  ["downward-dog","Herabschauender Hund","Downward Dog","stretch",2,30,0,"Hüfte hoch, Fersen Richtung Boden","Hips high, heels towards the floor",5],
  ["spinal-twist","Drehdehnung liegend","Supine Spinal Twist","stretch",1,30,1,"Schultern bleiben am Boden","Shoulders stay on the floor",5],
  ["forward-fold","Vorbeuge im Stand","Standing Forward Fold","stretch",2,30,0,"Knie leicht gebeugt, Oberkörper hängen lassen","Knees soft, let your upper body hang",5],
  ["hip-flexor-stretch","Hüftbeuger kniend","Kneeling Hip Flexor Stretch","stretch",1,30,1,"Becken nach vorn schieben, Gesäß anspannen","Push your hips forward, squeeze your glutes",10],
  ["quad-stretch","Oberschenkel vorn im Stand","Standing Quad Stretch","stretch",1,30,1,"Knie zeigen nach unten, nah beieinander","Knees point down, close together",5],
  ["hamstring-stretch","Beinrückseite im Sitzen","Seated Hamstring Stretch","stretch",2,30,0,"Aus der Hüfte beugen, Rücken lang","Hinge from the hips, long back",5],
  ["calf-stretch","Waden an der Wand","Wall Calf Stretch","stretch",1,30,1,"Hintere Ferse bleibt am Boden","Back heel stays down",5],
  ["figure-four","Gesäß liegend (Figur 4)","Figure-Four Glute Stretch","stretch",1,30,1,"Knöchel aufs Knie, Bein heranziehen","Ankle on knee, draw the leg in",5],
  ["pigeon-stretch","Taube","Pigeon Stretch","stretch",1,45,1,"Hüfte gerade Richtung Boden","Hips square towards the floor",10],
  ["butterfly-stretch","Schmetterling","Butterfly Stretch","stretch",2,30,0,"Fußsohlen zusammen, Knie sinken lassen","Soles together, let the knees drop",5],
  ["worlds-greatest","World's Greatest Stretch","World's Greatest Stretch","stretch",2,20,1,"Aus der Brust aufdrehen","Rotate open through your chest",10],

  /* Calisthenics (Stange, Barren) - längere Pausen, weil die Übungen schwer sind */
  ["chin-ups","Chin-Up","Chin-Up","calis back arms",5,20,0,"Klimmzug im Untergriff","Pull-up with an underhand grip",20],
  ["commando-pull-ups","Commando Pull-Up","Commando Pull-Up","calis back",3,20,1,"Seitlich an der Stange hochziehen","Pull up beside the bar",20],
  ["rung-pull-ups","Sprossen-Klimmzug (Hangelleiter)","Rung Pull-up (Monkey Bars)","calis back arms",5,20,0,"Je eine Hand an zwei Sprossen, Kopf dazwischen hoch","One hand on each of two rungs, head up between them",20],
  ["parallel-bar-dips","Parallel Bar Dips","Parallel Bar Dips","calis arms",5,20,0,"Zwischen den Holmen absenken und hochdrücken","Lower between the bars and press up",20],
  ["support-hold","Support Hold","Support Hold","calis arms",5,20,0,"Mit gestreckten Armen im Stütz halten","Hold the support with straight arms",15],
  ["hanging-knee-raise","Hanging Knee Raise","Hanging Knee Raise","calis core",5,20,0,"Knie kontrolliert zur Brust ziehen","Draw your knees to your chest with control",15],
  ["hanging-leg-raise","Hanging Leg Raise","Hanging Leg Raise","calis core",5,20,0,"Gestreckte Beine anheben","Raise your straight legs",20],
  ["hanging-l-sit","Hanging L-Sit","Hanging L-Sit","calis core",5,10,0,"Beine waagerecht halten","Hold your legs horizontal",20],
  ["l-sit","L-Sit","L-Sit","calis core",5,10,0,"Beine gestreckt vor dem Körper halten","Hold your legs straight in front of you",20],
  ["windshield-wipers","Windshield Wipers","Windshield Wipers","calis core",4,20,0,"Beine im Hang von Seite zu Seite","Legs side to side while hanging",20],
  ["muscle-ups","Muscle-Up","Muscle-Up","calis back arms",4,15,0,"Kombination aus Klimmzug und Dip","A pull-up flowing into a dip",45],
  ["monkey-bar-traverse","Monkey Bar Traverse","Monkey Bar Traverse","calis back",4,30,0,"Von Sprosse zu Sprosse hangeln","Swing from rung to rung",30],
  ["skin-the-cat","Skin The Cat","Skin The Cat","calis back",4,20,0,"Aus dem Hang durch die Schultern rotieren","Rotate through your shoulders from the hang",30],

  /* Weitere schwere Übungen */
  ["archer-push-ups","Archer-Liegestütz","Archer Push-ups","bw arms",3,20,1,"Gewicht zu einem Arm verlagern","Shift your weight onto one arm",15],
  ["pistol-squats","Pistol Squat","Pistol Squat","bw legs",3,20,1,"Einbeinige Kniebeuge ohne Hilfe","Single-leg squat without support",15],
  ["dragon-flags","Dragon Flag","Dragon Flag","core",4,15,0,"Körper wie ein Brett absenken","Lower your body like a plank",25],
  ["clap-push-ups","Klatsch-Liegestütz","Clap Push-ups","bw arms",5,20,0,"Explosiv hochdrücken und klatschen","Push up explosively and clap",20],
  ["tuck-jumps","Tuck Jumps","Tuck Jumps","cardio legs",5,20,0,"Knie im Sprung zur Brust","Knees to chest in the air",20],
  ["burpee-pull-ups","Burpee-Klimmzug","Burpee Pull-up","calis core back",5,30,0,"Liegestütz, hochspringen, Klimmzug","Push-up, jump up, pull-up",30]
];

/* [id, Name DE, Name EN, Fokus, Übungen, Blockpause s] - Fokus "mix" erscheint nur unter „Alle“ */
var LIB_WORKOUT_ROWS = [
  ["cardio-express","Cardio Express","Cardio Express","cardio","jumping-jacks high-knees mountain-climbers skater-jumps",45],
  ["cardio-power","Cardio Power","Cardio Power","cardio","burpees jump-squats fast-feet plank-burpees",60],
  ["full-body-weights","Full Body mit Gewicht","Full Body with Weights","weight","goblet-squat bent-over-row floor-press romanian-deadlift farmer-carry",60],
  ["kb-conditioning","Kettlebell Conditioning","Kettlebell Conditioning","weight","kb-swing goblet-squat kb-clean weighted-reverse-lunge",60],
  ["bw-basic","Bodyweight Basic","Bodyweight Basic","bw","air-squats push-ups reverse-lunges glute-bridge plank-steps",45],
  ["bw-advanced","Bodyweight Advanced","Bodyweight Advanced","bw","cossack-squats pistol-assist pike-push-ups burpee-squat-jumps bear-crawl",60],
  ["back-basic","Rücken Basis","Back Basics","back","bird-dog reverse-snow-angels prone-y-raise good-mornings superman-hold",45],
  ["back-pull","Rücken Zugkraft","Back Pulling Strength","back","scapular-pull-ups pull-ups negative-pull-ups inverted-rows dead-hang",90],
  ["leg-day","Beine Basis","Leg Day","legs","air-squats reverse-lunges split-squats single-leg-rdl glute-bridge calf-raises",60],
  ["leg-power","Beine Power","Leg Power","legs","jump-squats bulgarian-split-squats side-lunges wall-sit lateral-lunge-pulses",60],
  ["core-basic","Bauch & Core Basis","Core Basic","core","dead-bug plank side-plank bicycle-crunches leg-raises",45],
  ["core-advanced","Bauch & Core Advanced","Core Advanced","core","hollow-hold dragon-flags jackknives side-jackknives plank-shoulder-taps",60],
  ["core-complete","Bauch komplett","Complete Core","core","russian-twists leg-raises dead-bug bicycle-crunches reverse-crunch jackknives hollow-hold plank side-plank mountain-climbers",45],
  ["full-body-mix","Full Body Mix","Full Body Mix","mix","kb-swing push-ups walking-lunges bent-over-row mountain-climbers plank",60],
  ["arms-bw","Arme ohne Geräte (Trizeps & Schulter)","Arms Without Equipment (Triceps & Shoulders)","arms","close-grip-push-ups diamond-push-ups triceps-dips sphinx-push-ups pike-push-ups plank-shoulder-taps",45],
  ["stretch-full","Ganzkörper-Dehnen","Full Body Stretch","stretch","neck-stretch shoulder-stretch chest-stretch quad-stretch calf-stretch cat-cow downward-dog hip-flexor-stretch hamstring-stretch figure-four spinal-twist childs-pose",10],
  ["stretch-post-legs","Nach dem Training: Beine","After Training: Legs","stretch","quad-stretch hamstring-stretch calf-stretch hip-flexor-stretch figure-four butterfly-stretch",10],
  ["stretch-post-upper","Nach dem Training: Oberkörper","After Training: Upper Body","stretch","chest-stretch shoulder-stretch triceps-stretch biceps-stretch wrist-stretch childs-pose",10],
  ["stretch-back-hips","Rücken & Hüfte","Back & Hips","stretch","cat-cow thoracic-rotation childs-pose sphinx-stretch hip-flexor-stretch pigeon-stretch spinal-twist",10],
  ["stretch-office","Schultern & Nacken (Büro)","Shoulders & Neck (Office)","stretch","neck-stretch chin-tuck shoulder-stretch triceps-stretch chest-stretch thoracic-rotation side-bend wrist-stretch",10],
  ["stretch-morning","Morgens locker werden","Loosen Up in the Morning","stretch","cat-cow worlds-greatest downward-dog side-bend forward-fold",10],
  ["calis-pull","Calisthenics Zug","Calisthenics Pull","calis","scapular-pull-ups inverted-rows commando-pull-ups chin-ups pull-ups burpee-pull-ups dead-hang",90],
  ["calis-push","Calisthenics Druck","Calisthenics Push","calis","support-hold parallel-bar-dips archer-push-ups pike-push-ups diamond-push-ups",90],
  ["calis-core","Calisthenics Core","Calisthenics Core","calis","hanging-knee-raise hanging-leg-raise windshield-wipers hanging-l-sit l-sit toes-to-bar",60],
  ["calis-skills","Calisthenics Skills","Calisthenics Skills","calis","muscle-ups skin-the-cat monkey-bar-traverse l-sit hanging-l-sit burpee-pull-ups",120],
  /* Calisthenics für Einsteiger: Progression statt gleich Klimmzug/Dip, längere Pausen */
  ["calis-hiit","Calisthenics HIIT","Calisthenics HIIT","calis","burpee-pull-ups parallel-bar-dips hanging-knee-raise chin-ups toes-to-bar",60,"4/30/20"],
  ["calis-start","Calisthenics Einsteiger","Calisthenics for Beginners","calis","dead-hang scapular-pull-ups inverted-rows support-hold hanging-knee-raise negative-pull-ups",60,"3/20/40"],
  ["pullup-progress","Klimmzug-Aufbau","Pull-up Progression","calis","dead-hang scapular-pull-ups inverted-rows negative-pull-ups chin-ups",75,"3/20/40"],
  ["dip-progress","Dip-Aufbau","Dip Progression","calis","support-hold negative-dips triceps-dips close-grip-push-ups parallel-bar-dips",60,"3/20/40"],
  ["calis-60","Calisthenics 60","Calisthenics 60","calis","scapular-pull-ups pull-ups support-hold parallel-bar-dips inverted-rows chin-ups toes-to-bar hanging-knee-raise negative-pull-ups l-sit windshield-wipers commando-pull-ups hanging-leg-raise dead-hang",100],
  ["full-body-60","Full Body 60","Full Body 60","mix","burpees goblet-squat push-ups kb-swing bent-over-row walking-lunges mountain-climbers romanian-deadlift shoulder-press jump-squats plank russian-twists",85],
  ["bodyweight-60","Bodyweight 60 (ohne Geräte)","Bodyweight 60 (no equipment)","bw","jumping-jacks air-squats push-ups reverse-lunges plank high-knees glute-bridge pike-push-ups side-lunges bicycle-crunches burpees wall-sit superman-hold mountain-climbers",45],
  /* 2026-09: neue Programme, aufgebaut nach gängigen Trainingsempfehlungen:
     Brust = Liegestütz-Varianten im Zirkel, vorher Schulterblätter aktivieren;
     Beine & Po = alle Bewegungsmuster (Kniebeuge, einbeinig, Hüftstreckung, seitlich);
     High Pulse = 40 s Arbeit / 20 s Pause; Dehnen kurz = große Muskelgruppen, je 30 s */
  ["stretch-quick","Dehnen kurz · Ganzkörper","Quick Full Body Stretch","stretch","quad-stretch calf-stretch chest-stretch shoulder-stretch hip-flexor-stretch hamstring-stretch childs-pose",10],
  ["chest-bw","Brust (ohne Geräte)","Chest (no equipment)","bw","scapular-push-ups push-ups clap-push-ups archer-push-ups close-grip-push-ups diamond-push-ups",45],
  ["chest-db","Brust & Schultern mit Kurzhantel","Chest & Shoulders with Dumbbells","weight","floor-press push-ups push-press shoulder-press triceps-curls",60],
  ["legs-glutes","Beine & Po","Legs & Glutes","legs","air-squats bulgarian-split-squats glute-bridge side-lunges single-leg-glute-bridge wall-sit calf-raises",45],
  ["hiit-full","Ganzkörper High Pulse","Full Body High Pulse","cardio","jumping-jacks high-knees skater-jumps jump-squats tuck-jumps burpees mountain-climbers plank-burpees frogs",30,"3/40/20"],
  ["back-office","Rücken & Haltung (Büro)","Back & Posture (Office)","back","bird-dog prone-y-raise backpack-row prone-t-raise reverse-snow-angels swimmers superman-hold",20,"3/30/10"],
  ["arms-db","Schultern & Arme mit Kurzhantel","Shoulders & Arms with Dumbbells","weight","push-press bent-over-row shoulder-press one-arm-row triceps-curls",45],
  /* weitere Programme mit klarem Zweck */
  ["warmup-5","Aufwärmen 5 Min","5-Minute Warm-up","cardio","jumping-jacks air-squats high-knees plank-steps fast-feet",10,"2/25/5"],
  ["tabata-full","Tabata Ganzkörper","Full Body Tabata","cardio","burpees mountain-climbers jump-squats high-knees",60,"8/20/10"],
  /* hochintensiv: kurze Pausen, explosive und zusammengesetzte Übungen */
  ["hiit-legs","Beine explosiv (HIIT)","Explosive Legs (HIIT)","legs","jump-squats skater-jumps tuck-jumps lateral-hops frogs cossack-squats",30,"4/40/20"],
  ["tabata-legs","Tabata Beine","Legs Tabata","legs","jump-squats skater-jumps lateral-hops tuck-jumps",60,"8/20/10"],
  ["burpee-challenge","Burpee-Intervalle","Burpee Intervals","cardio","burpees plank-burpees burpee-squat-jumps stand-up-jumps jump-forward-burpees",30,"3/40/20"],
  ["upper-power","Oberkörper Power (ohne Geräte)","Upper Body Power (no equipment)","bw","clap-push-ups archer-push-ups pike-push-ups diamond-push-ups bear-crawl plank-shoulder-taps",40,"4/30/15"],
  ["core-burner","Core Burner","Core Burner","core","jackknives dragon-flags mountain-climbers hollow-hold side-jackknives bicycle-crunches",20,"4/40/20"],
  ["kb-hiit","Kettlebell HIIT","Kettlebell HIIT","weight","kb-swing goblet-squat kb-clean front-rack-carry weighted-reverse-lunge",30,"4/40/20"],
  ["db-complex","Kurzhantel-Komplex (schwer)","Heavy Dumbbell Complex","weight","db-thruster renegade-row romanian-deadlift push-press weighted-reverse-lunge",45,"4/45/15"],
  ["metcon-db","Metcon mit Kurzhantel","Dumbbell Metcon","mix","db-thruster burpees renegade-row jump-squats mountain-climbers push-press",30,"4/40/20"],
  ["glutes-bw","Po-Fokus (ohne Geräte)","Glute Focus (no equipment)","legs","glute-bridge reverse-lunges single-leg-glute-bridge side-lunges squat-hold lateral-lunge-pulses",40],
  ["db-full-30","Kurzhantel Ganzkörper","Dumbbell Full Body","weight","goblet-squat bent-over-row floor-press romanian-deadlift db-thruster renegade-row shoulder-press",60],
  ["core-stable","Rumpfstabilität (rückenschonend)","Core Stability (back-friendly)","core","dead-bug bird-dog plank side-plank copenhagen-plank glute-bridge hollow-hold",30],
  ["runner-strength","Kraft für Läufer","Strength for Runners","legs","split-squats single-leg-calf-raise single-leg-rdl nordic-curl lateral-lunge-pulses side-plank copenhagen-plank",40],
  ["stretch-hips","Hüfte mobil","Hip Mobility","stretch","worlds-greatest hip-flexor-stretch pigeon-stretch butterfly-stretch figure-four",10],
  ["stretch-evening","Entspannt dehnen am Abend","Relaxing Evening Stretch","stretch","forward-fold childs-pose sphinx-stretch spinal-twist butterfly-stretch figure-four",10],
  ["advanced-60","Advanced 60","Advanced 60","mix","burpee-squat-jumps pistol-squats archer-push-ups tuck-jumps dragon-flags clap-push-ups bulgarian-split-squats pike-push-ups frogs hollow-hold cossack-squats jackknives",120],
  ["warmup-ganz","Aufwärmen Ganzkörper","Full-Body Warm-up","mix","jumping-jacks air-squats good-mornings bird-dog reverse-lunges high-knees",20,"1/40/10"],
  ["warmup-kraft","Aufwärmen vor Kraft","Warm-up before Strength","mix","jumping-jacks scapular-push-ups glute-bridge air-squats good-mornings reverse-lunges plank",20,"1/40/10"],
  ["warmup-hiit","Aufwärmen vor HIIT","Warm-up before HIIT","cardio","jumping-jacks high-knees fast-feet air-squats lateral-hops skater-jumps",20,"2/20/10"]
];

/* Schwierigkeit (1 Einsteiger, 2 Mittel, 3 Fortgeschritten) und Ausrüstung je Übung.
   Ausrüstung: "none" = ohne Geräte (Stuhl, Stufe oder Wand reichen), sonst db/kb/bar - mehrere = eins davon genügt. */
var EX_LEVEL = {
  "burpees":2,"jump-squats":2,"mountain-climbers":2,"high-knees":1,"jumping-jacks":1,"skater-jumps":2,"jump-lunges":3,"plank-burpees":1,
  "burpee-squat-jumps":3,"jump-forward-squats":2,"jump-forward-burpees":3,"frogs":3,"stand-up-jumps":3,"lateral-hops":2,"fast-feet":1,"box-step-ups":1,"sprint-in-place":2,
  "goblet-squat":1,"kb-swing":2,"db-thruster":2,"romanian-deadlift":2,"db-deadlift":1,"bent-over-row":1,"one-arm-row":1,"floor-press":1,
  "shoulder-press":1,"push-press":2,"weighted-reverse-lunge":2,"front-rack-carry":2,"farmer-carry":1,"kb-clean":3,"renegade-row":3,
  "push-ups":2,"pike-push-ups":3,"triceps-dips":2,"squat-hold":1,"walking-lunges":2,"reverse-lunges":1,"side-lunges":2,"cossack-squats":3,
  "deep-squats":1,"pistol-assist":3,"plank-steps":2,"bear-crawl":2,"wall-sit":1,"calf-raises":1,"glute-bridge":1,
  "pull-ups":3,"negative-pull-ups":2,"inverted-rows":2,"superman-hold":1,"reverse-snow-angels":1,"bird-dog":1,"prone-y-raise":1,
  "prone-t-raise":1,"good-mornings":1,"swimmers":1,"cobra-lift":1,"scapular-push-ups":1,"scapular-pull-ups":2,"dead-hang":1,"rung-pull-ups":2,
  "air-squats":1,"split-squats":2,"bulgarian-split-squats":3,"forward-lunges":2,"single-leg-glute-bridge":2,"lateral-lunge-pulses":2,
  "plank":1,"side-plank":2,"dead-bug":1,"bicycle-crunches":1,"leg-raises":2,"jackknives":3,"side-jackknives":3,
  "hollow-hold":3,"reverse-crunch":2,"russian-twists":2,"sit-ups":1,"toe-touches":1,"plank-shoulder-taps":2,"toes-to-bar":3,
  "neck-stretch":1,"chin-tuck":1,"thoracic-rotation":1,"shoulder-stretch":1,"triceps-stretch":1,"biceps-stretch":1,"chest-stretch":1,"wrist-stretch":1,"side-bend":1,
  "cat-cow":1,"childs-pose":1,"sphinx-stretch":1,"downward-dog":1,"spinal-twist":1,"forward-fold":1,"hip-flexor-stretch":1,
  "quad-stretch":1,"hamstring-stretch":1,"calf-stretch":1,"figure-four":1,"pigeon-stretch":2,"butterfly-stretch":1,"worlds-greatest":2,"db-bench-press":2,"pallof-press":1,"copenhagen-plank":2,"backpack-row":1,"db-step-ups":2,"knee-push-ups":1,"single-leg-calf-raise":2,"negative-dips":2,"tuck-jumps":3,"chin-ups":2,"commando-pull-ups":3,"parallel-bar-dips":3,"support-hold":2,"hanging-knee-raise":2,"hanging-leg-raise":3,"hanging-l-sit":3,"l-sit":3,"windshield-wipers":3,"muscle-ups":3,"monkey-bar-traverse":2,"skin-the-cat":3,"archer-push-ups":3,"pistol-squats":3,"dragon-flags":3,"clap-push-ups":3,"close-grip-push-ups":2,"diamond-push-ups":3,"sphinx-push-ups":3,"triceps-curls":1,"arm-circles":1,"sumo-squat-db":1,"single-leg-rdl":2,"nordic-curl":3,
  "burpee-pull-ups":3,
  "leg-press":1,"leg-press-45":1,"leg-extension":1,"leg-curl":1,"adductor-machine":1,"abductor-machine":1,"calf-machine":1,
  "chest-press-machine":1,"butterfly":1,"pullover":2,"lat-pulldown":1,"row-machine":1,"cable-row":1,"reverse-butterfly":1,
  "back-extension":1,"shoulder-press-machine":1,"biceps-machine":1,"cable-curl":1,"triceps-pushdown":1,"skull-crusher":2,
  "ab-crunch-machine":1,"bench-press":2,"barbell-squat":2,"barbell-deadlift":2,
  "hack-squat":1,"smith-squat":1,"leg-press-single":2,"hip-thrust":1,"glute-kickback-cable":1,"seated-calf":1,"incline-chest-press":1,"cable-crossover":2,"incline-db-press":2,"db-fly":2,"assisted-pullup":1,"close-grip-pulldown":1,"t-bar-row":2,"barbell-row":2,"face-pull":1,"straight-arm-pulldown":1,"lateral-raise":1,"shrugs":1,"hammer-curl":1,"barbell-curl":1,"overhead-cable-triceps":1,"triceps-machine":1,"glute-machine":1,"calf-press":1,"lying-leg-curl":1,"rotary-torso":1,"back-extension-machine":1,"triceps-extension-machine":1,"lateral-raise-machine":1,"cable-lateral-raise":1,"smith-bench-press":1,"assisted-dip":1,"high-row-machine":1,"cable-crunch":1,"cable-pull-through":2,"cable-woodchop":2,"captains-chair":1,"barbell-overhead-press":2,"barbell-rdl":2
};
/* Belastung je Übung: 1 locker, 2 mittel, 3 intensiv - angelehnt an das Compendium of Physical Activities
   (MET: leichte Rücken-/Rumpfübungen und Halteübungen etwa 2,5–3,5, moderate Kraft- und Körpergewichtsübungen
   etwa 3,5–5, Sprünge, Burpees, Sprints und schwungvolle Ganzkörperübungen um 8) und an der Herzfrequenz, die eine
   Übung im Intervall typischerweise erreicht. Das ist etwas anderes als die Schwierigkeit (EX_LEVEL): Klimmzüge
   sind schwer, aber nicht unbedingt intensiv für den Kreislauf. Nicht aufgeführt = 2. Dehnübungen spielen hier keine Rolle. */
var EX_INT = {
  /* intensiv: explosiv, springend, Ganzkörper mit hohem Puls */
  "burpees":3,"jump-squats":3,"jump-lunges":3,"mountain-climbers":3,"high-knees":3,"skater-jumps":3,"burpee-squat-jumps":3,"jump-forward-squats":3,"jump-forward-burpees":3,
  "frogs":3,"stand-up-jumps":3,"sprint-in-place":3,"tuck-jumps":3,"kb-swing":3,"db-thruster":3,"kb-clean":3,"push-press":3,
  "renegade-row":3,"burpee-pull-ups":3,"clap-push-ups":3,"muscle-ups":3,"pull-ups":3,"chin-ups":3,"commando-pull-ups":3,
  "toes-to-bar":3,"rung-pull-ups":3,"pistol-squats":3,"bulgarian-split-squats":3,"jackknives":3,"side-jackknives":3,"bear-crawl":3,
  /* locker: Aktivierung, Haltung, ruhige Halte- und Rumpfübungen */
  "superman-hold":1,"reverse-snow-angels":1,"bird-dog":1,"prone-y-raise":1,"prone-t-raise":1,"good-mornings":1,"swimmers":1,
  "scapular-push-ups":1,"scapular-pull-ups":1,"dead-hang":1,"calf-raises":1,"glute-bridge":1,"deep-squats":1,"squat-hold":1,
  "plank":1,"side-plank":1,"dead-bug":1,"reverse-crunch":1,"sit-ups":1,"toe-touches":1,"triceps-curls":1,"farmer-carry":1
};
/* Leichter / Schwerer: Ketten von leicht nach schwer (nur Übungen, die es in BLOC gibt). Jede Übung bekommt Nachbarn aus der ersten Kette, in der sie vorkommt.
   Bewusst nur ein Hinweis zum Ausprobieren, keine Trainingsplanung - Fachprüfung offen (siehe quellen.html). */
var LZ_KETTEN = [
  ["knee-push-ups", "push-ups", "close-grip-push-ups", "diamond-push-ups", "archer-push-ups", "clap-push-ups"],
  ["inverted-rows", "negative-pull-ups", "chin-ups", "pull-ups", "commando-pull-ups", "muscle-ups"],
  ["air-squats", "split-squats", "bulgarian-split-squats", "pistol-assist", "pistol-squats"],
  ["reverse-lunges", "forward-lunges", "walking-lunges", "jump-lunges"],
  ["plank-burpees", "burpees", "burpee-squat-jumps", "jump-forward-burpees", "burpee-pull-ups"],
  ["dead-bug", "plank", "plank-shoulder-taps", "hollow-hold", "dragon-flags"],
  ["leg-raises", "hanging-knee-raise", "hanging-leg-raise", "toes-to-bar"],
  ["glute-bridge", "single-leg-glute-bridge"],
  ["jump-squats", "jump-forward-squats", "tuck-jumps"],
  ["triceps-dips", "negative-dips", "parallel-bar-dips", "muscle-ups"],
  ["calf-raises", "single-leg-calf-raise"],
  ["good-mornings", "single-leg-rdl"],
  ["plank", "side-plank", "copenhagen-plank"],
  /* 2026-10-14: weitere Ketten (die erste Kette, in der eine Übung steht, gilt) */
  ["dead-hang", "scapular-pull-ups", "negative-pull-ups"],
  ["support-hold", "negative-dips"],
  ["support-hold", "l-sit"],
  ["hanging-knee-raise", "hanging-l-sit"],
  ["scapular-push-ups", "push-ups"],
  ["jumping-jacks", "high-knees", "sprint-in-place"],
  ["lateral-hops", "skater-jumps"],
  ["leg-raises", "jackknives", "side-jackknives"]
];
var EX_EQUIP = {
  "leg-press":"gym","leg-press-45":"gym","leg-extension":"gym","leg-curl":"gym","adductor-machine":"gym","abductor-machine":"gym",
  "calf-machine":"gym","chest-press-machine":"gym","butterfly":"gym","pullover":"gym db","lat-pulldown":"gym","row-machine":"gym",
  "cable-row":"gym","reverse-butterfly":"gym","back-extension":"gym","shoulder-press-machine":"gym","biceps-machine":"gym",
  "cable-curl":"gym","triceps-pushdown":"gym","skull-crusher":"gym db","ab-crunch-machine":"gym","bench-press":"gym",
  "barbell-squat":"gym","barbell-deadlift":"gym",
  "hack-squat":"gym","smith-squat":"gym","leg-press-single":"gym","hip-thrust":"gym","glute-kickback-cable":"gym","seated-calf":"gym","incline-chest-press":"gym","cable-crossover":"gym","incline-db-press":"gym db","db-fly":"gym db","assisted-pullup":"gym","close-grip-pulldown":"gym","t-bar-row":"gym","barbell-row":"gym","face-pull":"gym","straight-arm-pulldown":"gym","lateral-raise":"gym db","shrugs":"gym db","hammer-curl":"gym db","barbell-curl":"gym","overhead-cable-triceps":"gym","triceps-machine":"gym","glute-machine":"gym","calf-press":"gym","lying-leg-curl":"gym","rotary-torso":"gym","back-extension-machine":"gym","triceps-extension-machine":"gym","lateral-raise-machine":"gym","cable-lateral-raise":"gym","smith-bench-press":"gym","assisted-dip":"gym","high-row-machine":"gym","cable-crunch":"gym","cable-pull-through":"gym","cable-woodchop":"gym","captains-chair":"gym","barbell-overhead-press":"gym","barbell-rdl":"gym","db-bench-press":"gym db","pallof-press":"gym","negative-dips":"dip","db-step-ups":"db","sumo-squat-db":"db kb",
  "goblet-squat":"kb db","kb-swing":"kb","db-thruster":"db","romanian-deadlift":"db kb","db-deadlift":"db kb","bent-over-row":"db",
  "one-arm-row":"db","triceps-curls":"db","floor-press":"db","shoulder-press":"db","push-press":"db","weighted-reverse-lunge":"db kb","front-rack-carry":"kb db",
  "farmer-carry":"db kb","kb-clean":"kb","renegade-row":"db",
  "pull-ups":"bar","negative-pull-ups":"bar","inverted-rows":"bar","scapular-pull-ups":"bar","dead-hang":"bar","toes-to-bar":"bar",
  "chin-ups":"bar","commando-pull-ups":"bar","rung-pull-ups":"bar","parallel-bar-dips":"dip","support-hold":"dip",
  "hanging-knee-raise":"bar","hanging-leg-raise":"bar","hanging-l-sit":"bar","l-sit":"dip","windshield-wipers":"bar",
  "muscle-ups":"bar","monkey-bar-traverse":"bar","skin-the-cat":"bar","burpee-pull-ups":"bar"
};

/* Hauptkategorien: jede Übung gehört zu genau einer (Gliederung der Bibliothek, Kacheln oben).
   Fokus (LIB_CATS) und Ausrüstung bleiben daneben als kombinierbare Mehrfach-Filter.
   Zuordnung nach der Übungsliste „BLOC – Kategorien und Attribute“. */
var MAIN_CATS = [
  { id:"kraft",    de:"Kraft",       en:"Strength",     color:"#ff5a5f",
    ico:'<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/>' },
  { id:"ausdauer", de:"Ausdauer",    en:"Cardio",       color:"#f5b82e",
    ico:'<circle cx="14.5" cy="4.5" r="2"/><path d="M8 21l3-6 3 2.5V22M6 12.5l3-3.5 4 1 3 3.5 3 .5M13 10l-2 5"/>' },
  { id:"rumpf",    de:"Rumpf",       en:"Core",         color:"#a879ff",
    ico:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><circle cx="12" cy="12" r=".6"/>' },
  { id:"stange",   de:"Stangenpark", en:"Bar park",     color:"#4f9dff",
    ico:'<path d="M3 4.5h18M7 4.5V21M17 4.5V21"/>' },
  { id:"stretch",  de:"Stretch",     en:"Stretch",      color:"#3fcf8e",
    ico:'<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l8-8"/>' }
];
var EX_MAIN_ROWS = {
  ausdauer:"box-step-ups burpee-squat-jumps jump-forward-squats jump-forward-burpees burpees fast-feet frogs high-knees jump-lunges jump-squats jumping-jacks lateral-hops mountain-climbers plank-burpees skater-jumps sprint-in-place stand-up-jumps tuck-jumps",
  rumpf:"bicycle-crunches dead-bug dragon-flags hollow-hold leg-raises plank plank-shoulder-taps reverse-crunch russian-twists side-jackknives side-plank sit-ups toe-touches jackknives copenhagen-plank",
  stange:"chin-ups commando-pull-ups rung-pull-ups dead-hang hanging-knee-raise hanging-l-sit hanging-leg-raise inverted-rows l-sit monkey-bar-traverse muscle-ups burpee-pull-ups negative-pull-ups parallel-bar-dips pull-ups scapular-pull-ups skin-the-cat support-hold toes-to-bar windshield-wipers",
  stretch:"hamstring-stretch biceps-stretch chest-stretch spinal-twist figure-four wrist-stretch downward-dog hip-flexor-stretch cat-cow childs-pose neck-stretch quad-stretch butterfly-stretch shoulder-stretch side-bend sphinx-stretch cobra-lift pigeon-stretch triceps-stretch forward-fold calf-stretch worlds-greatest arm-circles chin-tuck thoracic-rotation"
};

var EQUIPS = [
  { id:"none", de:"Ohne Geräte", en:"No equipment" },
  { id:"db",   de:"Kurzhantel",  en:"Dumbbell" },
  { id:"kb",   de:"Kettlebell",  en:"Kettlebell" },
  { id:"bar",  de:"Stange",      en:"Bar" },
  { id:"dip",  de:"Dip-Barren / Parallettes", en:"Dip bars / parallettes" },
  { id:"gym",  de:"Fitnessstudio", en:"Gym" }
];

/* weitere Suchbegriffe, z. B. der frühere Name */
var EX_SUCH_ALIAS = { "russian-twists":"russian twist twists russische drehung russischer",
  "pull-ups":"klimmzug klimmzuge", "chin-ups":"klimmzug untergriff", "negative-pull-ups":"klimmzug negativ",
  "scapular-pull-ups":"schulterblatt klimmzug", "commando-pull-ups":"klimmzug", "push-ups":"liegestutz liegestutze",
  "jump-forward-squats":"weitsprung broad jump sprung nach vorn kniebeuge", "jump-forward-burpees":"weitsprung broad jump burpee sprung nach vorn",
  "rung-pull-ups":"hangelleiter sprossen klimmzug monkey bar zwischen den sprossen", "lat-pulldown":"lat zug latziehen", "leg-press":"beinpresse", "leg-press-45":"beinpresse schlitten",
  "skull-crusher":"french press trizeps liegend stirndrücken", "pullover":"überzüge ueberzug", "butterfly":"pec deck fliegende",
  "reverse-butterfly":"reverse fly hintere schulter", "biceps-machine":"scott curl bizeps defended curl preacher curl",
  "cable-row":"low row rudern kabel tief", "triceps-pushdown":"triceps pressdown trizeps kabel", "lat-pulldown":"lat pulldown turm latzug",
  "glute-machine":"gluteusmaschine gluteus po maschine kickback", "calf-press":"wadenpresse waden calf", "lying-leg-curl":"beinbeuger liegend leg curl hamstring",
  "rotary-torso":"rotary torso rumpfdrehen rotation drehen", "back-extension-machine":"rückenstrecker maschine unterer rücken",
  "triceps-extension-machine":"trizeps extension maschine", "lateral-raise-machine":"seitenhebermaschine seitheber seitheben maschine",
  "cable-lateral-raise":"seitheben kabel verstellbarer kabelzug adjustable pulley", "smith-bench-press":"multipresse smith bankdrücken bankdruecken",
  "assisted-dip":"dips dip maschine gegengewicht kniepolster trizeps", "high-row-machine":"high row rudern oben hammer",
  "cable-crunch":"kabel crunch kniend bauch seil", "cable-pull-through":"pull through kabel gesäß po hüfte seil", "back-extension":"hyperextension",
  "jump-lunges":"sprungausfallschritt ausfallschritt sprung split jumps lunge jumps", "cobra-lift":"cobra lift kobra",
  "pallof-press":"pallof press antirotation kabel rumpf stabilität anti rotation", "copenhagen-plank":"copenhagen plank kopenhagen adduktoren leiste seitstütz bank", "backpack-row":"rucksack rudern rucksack backpack row zug ohne stange",
  "knee-push-ups":"knie liegestütz liegestütz auf den knien einsteiger leichter", "single-leg-calf-raise":"einbeiniges wadenheben waden einbeinig calf raise", "negative-dips":"negative dips dip negativ langsam absenken barren",
  "db-bench-press":"kurzhantel bankdrücken flachbank hantelbank dumbbell bench press brust", "db-step-ups":"step ups stufe kurzhantel aufsteigen bank treppe", "sumo-squat-db":"sumo kniebeuge sumo squat kurzhantel breiter stand adduktoren", "single-leg-rdl":"einbeiniges kreuzheben rumänisches kreuzheben einbeinig single leg deadlift ohne gewicht hüftbeuge",
  "nordic-curl":"nordic hamstring curl nordic curl oberschenkelrückseite beinbeuger fersen fixieren hamstrings",
  "chin-tuck":"kinn einziehen doppelkinn nacken halswirbelsäule chin tuck", "thoracic-rotation":"brustwirbelsäule bws rotation drehen offenes buch open book thread the needle vierfüßler" };

/* ---------- Piktogramme ----------
   Jede Übung hat zwei Posen, die sich abwechseln (bei Halteübungen eine). Eine Pose beschreibt
   Gelenkpunkte im Feld 0..100 (Boden bei y=89, Blick nach rechts):
   Q(Kopf|null, Nacken, Hüfte, Beine [[Knie x,y, Knöchel x,y, (Zehe x,y)]], Arme [[Ellbogen x,y, Hand x,y]], Geräte, frontal)
   Kopf null = in Verlängerung der Wirbelsäule. Das zweite Bein/der zweite Arm liegt „hinten“ und wird
   blasser gezeichnet - außer bei frontalen Ansichten. */
/* b = Blickrichtung für die Nase: 1 = Gesicht auf der „Vorderseite“ (bei Blick nach rechts vorn, in Rückenlage oben),
   -1 = umgekehrt (Bauchlage mit Kopf links). Spiegeln kehrt sie um. */
function Q(h, n, p, l, a, x, f, b){ return { h:h, n:n, p:p, l:l||[], a:a||[], x:x||"", f:!!f, b:b||1 }; }
function qSwap(q){ return Q(q.h, q.n, q.p, q.l.slice().reverse(), q.a.slice().reverse(), q.x, q.f, q.b); }
function qMirror(q){
  function mx(arr){ return arr.map(function(v, i){ return i%2===0 ? 100-v : v; }); }
  return Q(q.h ? mx(q.h) : null, mx(q.n), mx(q.p), q.l.map(mx), q.a.map(mx), q.x, q.f, -q.b);
}
function qShift(q, dx, dy){
  function sh(arr){ return arr.map(function(v, i){ return i%2===0 ? v+dx : v+dy; }); }
  return Q(q.h ? sh(q.h) : null, sh(q.n), sh(q.p), q.l.map(sh), q.a.map(sh), q.x, q.f, q.b);
}
function qWith(q, o){ return Q("h" in o ? o.h : q.h, o.n||q.n, o.p||q.p, o.l||q.l, o.a||q.a, "x" in o ? o.x : q.x, "f" in o ? o.f : q.f, "b" in o ? o.b : q.b); }
/* Geräte */
/* Hantel und Kettlebell hält die Hand - markiert, damit sie in der Animation mit der Hand mitwandern */
function gHand(x, y, inner){ return '<g class="gh" data-at="'+x+','+y+'">'+inner+'</g>'; }
function gDB(x, y){ return gHand(x, y, '<path class="ip" d="M'+(x-6)+' '+y+'h12M'+(x-6)+' '+(y-4)+'v8M'+(x+6)+' '+(y-4)+'v8"/>'); }
function gKB(x, y){ return gHand(x, y, '<circle class="ipf" cx="'+x+'" cy="'+(y+4)+'" r="5"/><path class="ip" d="M'+(x-3)+' '+(y+1)+'q3-5 6 0"/>'); }
function gBar(y, x1, x2){ return '<path class="ip" d="M'+(x1||20)+' '+y+'H'+(x2||80)+'"/>'; }
function gBox(x1, y, x2){ return '<path class="ip" d="M'+x1+' 89V'+y+'H'+x2+'V89"/>'; }
function gWall(x){ return '<path class="ip" d="M'+x+' 6V89"/>'; }
function gPole(x){ return '<path class="ip" d="M'+x+' 24V89"/>'; }
function gBench(x1, x2, y){ return '<path class="ip" d="M'+x1+' '+y+'H'+x2+'M'+(x1+3)+' '+y+'V89M'+(x2-3)+' '+y+'V89"/>'; }

/* Grundposen */
var P_ST    = Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[52,34,53,47]]);
var P_STF   = qWith(P_ST, { a:[[63,25,76,25]] });                       // Arme nach vorn
var P_STH   = qWith(P_ST, { a:[[57,35,51,45]] });                       // Hände an der Hüfte
var P_STUP  = Q(null,[50,28],[50,56],[[50,72,50,89,58,89]],[[58,17,64,7]]);   // Arme über Kopf (etwas tiefer, damit alles ins Feld passt)
var P_SQ    = Q(null,[46,36],[36,62],[[57,62,52,89,60,89]],[[60,38,74,37]]);
var P_SQH   = Q(null,[48,40],[36,62],[[56,62,52,89,60,89]],[[56,56,60,88]]);  // Hocke, Hände am Boden
var P_DSQ   = Q(null,[48,46],[40,74],[[58,68,52,89,60,89]],[[56,56,62,62]]);
var P_JUMP  = Q(null,[50,16],[50,46],[[52,63,50,80,57,80]],[[45,30,41,42]]);
var P_JUP   = Q(null,[50,22],[50,50],[[51,66,50,82,57,82]],[[58,11,64,2]]);
var P_PH    = Q(null,[72,60],[44,72],[[28,78,12,86,9,89]],[[69,75,70,89]]);  // Stütz oben
var P_PL    = Q(null,[72,78],[44,82],[[28,85,12,87,9,89]],[[60,71,70,89]]);  // Stütz unten
var P_FP    = Q(null,[70,72],[44,76],[[28,81,12,86,9,89]],[[67,89,84,89]]);  // Unterarmstütz
var P_LB    = Q(null,[22,84],[50,84],[[68,85,86,85,88,78]],[[32,87,44,87]]);  // Rückenlage
var P_LBK   = Q([14,83],[24,84],[46,86],[[60,70,70,89,78,89]],[[33,88,43,88]]);  // Rückenlage, Knie gebeugt
var P_LF    = Q(null,[24,83],[52,84],[[70,86,88,87,92,89]],[[14,88,4,88]],"",false,-1);   // Bauchlage (Gesicht zum Boden)
var P_HG    = Q(null,[64,40],[40,50],[[44,70,44,89,52,89]],[[62,54,61,66]]);  // Hüftbeuge
var P_Q4    = Q(null,[66,66],[40,66],[[40,88,22,88,18,89]],[[67,78,68,89]]);  // Vierfüßler
var P_F     = Q(null,[50,20],[50,52],[[46,70,45,89,39,89],[54,70,55,89,61,89]],[[44,34,42,48],[56,34,58,48]],"",true);
var P_HANG  = Q(null,[50,30],[50,58],[[48,72,48,84],[52,72,52,84]],[[40,21,34,6],[60,21,66,6]], gBar(6,24,76), true);
var P_PULL  = Q([50,5],[50,14],[50,42],[[48,58,48,72],[52,58,52,72]],[[34,20,42,6],[66,20,58,6]], gBar(6,24,76), true);
var P_L0    = P_STH;
var P_L1    = Q(null,[48,32],[48,62],[[66,63,66,89,74,89],[36,85,20,87,18,89]],[[55,48,49,57]]);
var P_WALK1 = Q(null,[50,20],[50,50],[[57,69,62,89,70,89],[43,69,38,89,46,89]],[[52,34,53,47]]);

/* Skater Jumps in der Vorderansicht (man steht der Figur gegenüber, der Oberkörper bleibt zu uns gedreht - die Bewegung läuft seitlich über das Bild):
   Landung tief auf einem Bein, der Rücken stark nach unten gebeugt (von vorn: kurzer Rumpf, Kopf tief), die Hand der Standseite reicht Richtung Boden,
   das andere Bein gekreuzt hinter dem Standbein, der andere Arm schwingt nach außen - dann Flug (bleibt tief), dann Landung auf dem anderen Bein.
   Die Landung rechts ist das Spiegelbild der Landung links; der Flug zeigt in Sprungrichtung. Es wirkt nicht wie eine Drehung, weil der Rumpf in beiden
   Hälften zu uns steht. */
var SK_L   = Q(null,[35,52],[38,68],[[34,78,37,89,31,89],[47,78,29,83,24,84]],[[43,62,37,76],[26,57,19,65]],"",true);
var SK_AIR = Q(null,[49,46],[51,60],[[44,70,37,78,32,79],[56,70,59,79,64,80]],[[40,54,31,61],[60,54,69,60]],"",true);   // Flug nach links; nach rechts gespiegelt
var ILLU_POSES = {
  /* Cardio */
  "burpees":            [P_STUP, P_PH],
  "jump-squats":        [P_SQ, P_JUMP],
  "mountain-climbers":  [qWith(P_PH,{ l:[[28,78,12,86,9,89],[58,76,48,86,46,89]] }), qWith(P_PH,{ l:[[58,76,48,86,46,89],[28,78,12,86,9,89]] })],
  "high-knees":         [Q(null,[50,20],[50,50],[[68,52,68,70,75,70],[50,70,50,89,58,89]],[[44,32,40,42],[57,30,63,23]]),
                         Q(null,[50,20],[50,50],[[50,70,50,89,58,89],[68,52,68,70,75,70]],[[57,30,63,23],[44,32,40,42]])],
  "jumping-jacks":      [P_F, qWith(P_F,{ l:[[42,70,33,89,27,89],[58,70,67,89,73,89]], a:[[40,16,33,5],[60,16,67,5]] })],
  "skater-jumps":       [SK_L, qMirror(SK_L)],
  "plank-burpees":      [P_SQH, P_PH],
  "burpee-squat-jumps": [P_PH, P_JUP],
  "frogs":              [qWith(P_DSQ,{ a:[[54,62,58,88]] }), P_JUP],
  "stand-up-jumps":     [P_LBK, P_JUP],
  "lateral-hops":       [qShift(qWith(P_F,{ l:[[47,68,46,84,40,84],[53,68,54,84,60,84]] }),-12,-3), qShift(qWith(P_F,{ l:[[47,68,46,84,40,84],[53,68,54,84,60,84]] }),12,-3)],
  "fast-feet":          [Q(null,[54,30],[48,56],[[56,72,52,89,60,89],[46,73,42,85,48,84]],[[58,42,62,50],[48,42,50,52]]),
                         Q(null,[54,30],[48,56],[[46,73,42,85,48,84],[56,72,52,89,60,89]],[[48,42,50,52],[58,42,62,50]])],
  "box-step-ups":       [Q(null,[40,22],[40,52],[[56,58,60,74,68,74],[40,71,40,89,48,89]],[[42,36,43,49]], gBox(54,76,86)),
                         Q(null,[62,16],[62,44],[[62,60,62,76,70,76],[52,58,48,70,52,72]],[[64,29,65,41]], gBox(54,76,86))],
  "sprint-in-place":    [Q(null,[53,20],[50,50],[[62,62,58,80,64,82],[46,70,42,88,50,89]],[[58,32,64,25],[44,33,40,42]]),
                         Q(null,[53,20],[50,50],[[46,70,42,88,50,89],[62,62,58,80,64,82]],[[44,33,40,42],[58,32,64,25]])],

  /* Kraft mit Gewicht */
  "goblet-squat":       [qWith(P_ST,{ a:[[57,36,58,29]], x:gKB(60,26) }), qWith(P_SQ,{ a:[[54,50,56,42]], x:gKB(58,39) })],
  "kb-swing":           [qWith(P_HG,{ l:[[46,70,44,89,52,89]], a:[[60,56,52,70]], x:gKB(52,70) }), qWith(P_ST,{ a:[[63,25,76,25]], x:gKB(79,21) })],
  "db-thruster":        [qWith(P_SQ,{ a:[[56,46,53,36]], x:gDB(53,34) }), qWith(P_STUP,{ x:gDB(65,6) })],
  "romanian-deadlift":  [qWith(P_ST,{ x:gDB(53,49) }), qWith(P_HG,{ x:gDB(61,68) })],
  "db-deadlift":        [Q(null,[60,46],[38,62],[[54,66,50,89,58,89]],[[60,62,58,76]], gDB(58,78)), qWith(P_ST,{ x:gDB(53,49) })],
  "bent-over-row":      [qWith(P_HG,{ x:gDB(61,68) }), qWith(P_HG,{ a:[[50,36,56,48]], x:gDB(56,50) })],
  "one-arm-row":        [qWith(P_HG,{ a:[[62,54,61,66],[66,52,68,62]], x:gDB(61,68)+gBench(62,90,62) }), qWith(P_HG,{ a:[[50,36,56,48],[66,52,68,62]], x:gDB(56,50)+gBench(62,90,62) })],
  "floor-press":        [qWith(P_LBK,{ a:[[30,88,32,76]], x:gDB(32,74) }), qWith(P_LBK,{ a:[[28,72,29,60]], x:gDB(29,58) })],
  "shoulder-press":     [qWith(P_STUP,{ a:[[58,40,57,30]], x:gDB(57,28) }), qWith(P_STUP,{ x:gDB(65,6) })],
  "push-press":         [Q(null,[50,32],[48,60],[[57,72,52,89,60,89]],[[58,44,57,34]], gDB(57,32)), qWith(P_STUP,{ x:gDB(65,6) })],
  "weighted-reverse-lunge": [qWith(P_ST,{ x:gDB(53,49) }), qWith(P_L1,{ a:[[49,48,50,60]], x:gDB(50,62) })],
  "front-rack-carry":   [qWith(P_WALK1,{ a:[[58,34,57,27]], x:gKB(59,23) }), qWith(qSwap(P_WALK1),{ a:[[58,34,57,27]], x:gKB(59,23) })],
  "farmer-carry":       [qWith(P_WALK1,{ x:gKB(53,47) }), qWith(qSwap(P_WALK1),{ x:gKB(53,47) })],
  "kb-clean":           [qWith(P_HG,{ l:[[46,70,44,89,52,89]], a:[[60,56,54,70]], x:gKB(54,70) }), qWith(P_ST,{ a:[[58,36,57,28]], x:gKB(60,24) })],
  "renegade-row":       [qWith(P_PH,{ x:gDB(70,87) }), qWith(P_PH,{ a:[[60,58,68,66],[69,75,70,89]], x:gDB(68,68) })],

  /* Bodyweight */
  "push-ups":           [P_PH, P_PL],
  "pike-push-ups":      [Q(null,[64,66],[46,48],[[36,68,26,87,22,89]],[[68,78,72,89]]), Q(null,[66,74],[46,52],[[36,70,26,87,22,89]],[[58,76,72,89]])],
  "triceps-dips":       [Q(null,[56,42],[52,68],[[34,64,30,89,24,89]],[[62,56,64,70]], gBench(60,92,70)), Q(null,[56,56],[52,80],[[34,72,30,89,24,89]],[[68,58,64,70]], gBench(60,92,70))],
  "squat-hold":         [P_SQ, null],
  "walking-lunges":     [qWith(P_L1,{ a:[[55,48,49,57]] }), qWith(P_WALK1,{ a:[[57,35,51,45]] })],
  "reverse-lunges":     [qShift(P_L0, 14, 0), P_L1],   // vorderer Fuß bleibt stehen, der Körper geht nach hinten
  "side-lunges":        [qWith(P_F,{ a:[[45,38,50,44],[55,38,50,44]] }),
                         Q(null,[44,36],[40,64],[[28,70,26,89,20,89],[58,74,72,89,78,89]],[[46,50,52,54],[52,48,52,54]],"",true)],
  "cossack-squats":     [qWith(P_F,{ l:[[42,70,36,89,30,89],[58,70,64,89,70,89]], a:[[45,38,50,44],[55,38,50,44]] }),
                         Q(null,[42,46],[36,74],[[22,70,26,89,20,89],[60,80,82,84,84,78]],[[50,56,58,56],[46,58,58,56]],"",true)],
  "deep-squats":        [P_STF, P_DSQ],
  "pistol-assist":      [qWith(P_ST,{ l:[[50,70,50,89,58,89],[62,62,68,78,74,76]], a:[[64,32,80,34]], x:gPole(82) }),
                         Q(null,[48,46],[40,72],[[56,66,50,89,58,89],[58,74,76,74,80,70]],[[64,48,80,50]], gPole(82))],
  "plank-steps":        [P_PH, P_FP],
  "bear-crawl":         [Q(null,[64,62],[40,62],[[46,80,26,86,22,89],[40,80,20,86,16,89]],[[66,76,70,89],[62,76,64,89]]),
                         Q(null,[64,62],[40,62],[[40,80,20,86,16,89],[46,80,26,86,22,89]],[[70,76,76,89],[62,76,64,89]])],
  "wall-sit":           [Q(null,[31,34],[31,62],[[52,62,52,89,60,89]],[[35,48,41,58]], gWall(24)), null],
  "calf-raises":        [P_ST, qWith(qShift(P_ST,0,-5),{ l:[[50,65,50,84,58,89]] })],
  "glute-bridge":       [P_LBK, Q([14,83],[24,84],[46,68],[[62,64,70,89,78,89]],[[33,88,43,88]])],

  /* Rücken */
  "pull-ups":           [P_HANG, P_PULL],
  "negative-pull-ups":  [P_PULL, P_HANG],
  "inverted-rows":      [Q(null,[38,76],[62,82],[[76,85,88,87,90,81]],[[40,66,44,57]], gBar(57,30,58)+'<path class="ip" d="M32 57V89"/>'),
                         Q(null,[40,63],[62,74],[[76,80,88,87,90,81]],[[34,58,44,57]], gBar(57,30,58)+'<path class="ip" d="M32 57V89"/>')],
  "superman-hold":      [P_LF, Q(null,[26,78],[52,84],[[70,82,88,76,92,78]],[[16,72,8,66]])],
  "reverse-snow-angels":[qWith(P_LF,{ a:[[36,80,46,80]] }), qWith(P_LF,{ a:[[16,76,6,72]] })],
  "bird-dog":           [P_Q4, Q(null,[66,66],[40,66],[[24,64,8,62],[40,88,22,88,18,89]],[[80,60,92,56],[67,78,68,89]])],
  "prone-y-raise":      [P_LF, qWith(P_LF,{ a:[[15,76,5,70]] })],
  "prone-t-raise":      [qWith(P_LF,{ a:[[29,87,33,89]] }), qWith(P_LF,{ a:[[29,72,31,62]] })],
  "good-mornings":      [qWith(P_ST,{ a:[[58,18,49,12]] }), qWith(P_HG,{ a:[[62,30,71,31]] })],
  "swimmers":           [Q(null,[26,80],[52,84],[[70,82,88,77,92,78],[70,86,88,87,92,89]],[[16,74,6,70],[14,88,4,88]]),
                         Q(null,[26,80],[52,84],[[70,86,88,87,92,89],[70,82,88,77,92,78]],[[14,88,4,88],[16,74,6,70]])],
  "cobra-lift":         [qWith(P_LF,{ a:[[32,88,36,89]] }), Q(null,[24,66],[50,84],[[70,86,88,87,92,89]],[[26,77,28,89]])],
  "scapular-push-ups":  [P_PH, qWith(P_PH,{ n:[71,65] })],   // Brust sinkt zwischen den Schulterblättern ab, Arme bleiben gestreckt
  /* Scapular Pull-ups von vorn: Arme bleiben gestreckt, der ganze Körper hebt sich nur ein Stück (die Hände rutschen minimal nach außen) */
  "scapular-pull-ups":  [Q(null,[50,31],[50,59],[[48,73,48,85],[52,73,52,85]],[[43,19,36,7],[57,19,64,7]], gBar(7,24,76), true),
                         Q(null,[50,27],[50,55],[[48,69,48,81],[52,69,52,81]],[[41,17,32,7],[59,17,68,7]], gBar(7,24,76), true)],
  "dead-hang":          [P_HANG, null],

  /* Beine */
  "air-squats":         [P_STF, P_SQ],
  "split-squats":       [Q(null,[48,18],[48,48],[[58,68,64,89,72,89],[40,68,32,86,28,89]],[[55,33,49,43]]),
                         Q(null,[48,32],[48,62],[[64,64,64,89,72,89],[38,82,26,86,22,89]],[[55,47,49,57]])],
  "bulgarian-split-squats": [Q(null,[50,18],[50,48],[[58,68,62,89,70,89],[38,62,26,70,20,70]],[[57,33,51,43]], gBench(6,30,70)),
                         Q(null,[50,32],[50,62],[[66,64,66,89,74,89],[40,80,26,70,20,70]],[[57,47,51,57]], gBench(6,30,70))],
  "forward-lunges":     [qShift(P_L0, -14, 0), P_L1],  // Schritt nach vorn, der Körper wandert mit
  "single-leg-glute-bridge": [qWith(P_LBK,{ l:[[60,70,70,89,78,89],[62,70,76,62,80,58]] }), Q([14,83],[24,84],[46,68],[[62,64,70,89,78,89],[64,60,82,52,86,48]],[[33,88,43,88]])],
  "lateral-lunge-pulses": [Q(null,[44,36],[40,64],[[28,70,26,89,20,89],[58,74,72,89,78,89]],[[46,50,52,54],[52,48,52,54]],"",true),
                         Q(null,[44,40],[40,68],[[26,74,26,89,20,89],[58,77,72,89,78,89]],[[46,54,52,58],[52,52,52,58]],"",true)],

  /* Bauch / Core */
  "plank":              [P_FP, null],
  "side-plank":         [Q([20,58],[28,64],[56,76],[[72,82,88,88,92,89]],[[27,89,40,89],[28,50,28,38]],"",true),
                         Q([20,60],[28,66],[56,82],[[72,86,88,88,92,89]],[[27,89,40,89],[28,52,28,40]],"",true)],
  "dead-bug":           [qWith(P_LB,{ l:[[52,66,68,66],[50,68,66,68]], a:[[22,70,22,58],[26,70,26,58]] }),
                         qWith(P_LB,{ l:[[68,82,88,80],[52,66,68,66]], a:[[12,76,4,72],[26,70,26,58]] })],
  /* Bicycle Crunches: ein Knie hoch über die Hüfte, das andere Bein gestreckt knapp über dem Boden; der diagonale Arm (Ellbogen) führt zum angezogenen Knie, die andere Hand liegt am Kopf */
  "bicycle-crunches":   [Q(null,[26,76],[50,84],[[58,58,68,70],[68,82,88,80]],[[40,68,53,61],[22,70,18,73]]),
                         Q(null,[26,76],[50,84],[[68,82,88,80],[58,58,68,70]],[[22,70,18,73],[40,68,53,61]])],
  "leg-raises":         [P_LB, qWith(P_LB,{ l:[[54,66,58,48,64,46]] })],
  "jackknives":         [qWith(P_LB,{ a:[[12,84,2,84]] }), Q(null,[34,64],[44,86],[[56,66,66,48,70,46]],[[48,56,62,46]])],
  "side-jackknives":    [qWith(P_LB,{ a:[[17,81,9,79],[17,84,9,83]], f:true, x:'<path d="M26 83L48 84" style="stroke-width:15"/>' }), Q(null,[28,72],[50,84],[[66,74,84,68,88,66],[64,80,82,74,86,72]],[[21,68,12,64],[21,72,12,68]], '<path d="M30 74L48 83" style="stroke-width:15"/>', true)],   // seitlich liegend: dickerer Körper, beide Arme und Beine weiß und gestreckt (es gibt kein vorn und hinten)
  "hollow-hold":        [Q(null,[26,74],[50,84],[[68,80,86,74,90,72]],[[14,68,4,64]]), null],
  "russian-twists":     [Q(null,[34,60],[46,84],[[60,70,74,74,80,72]],[[42,72,34,80]]), Q(null,[34,60],[46,84],[[60,70,74,74,80,72]],[[48,70,58,76]])],
  "sit-ups":            [qWith(P_LBK,{ a:[[30,80,36,78]] }), Q(null,[42,58],[46,86],[[60,70,70,89,78,89]],[[48,68,56,70]])],
  "toe-touches":        [qWith(P_LB,{ l:[[52,66,54,48,58,46]], a:[[22,72,22,62]] }), Q(null,[30,74],[50,84],[[52,66,54,48,58,46]],[[42,64,52,52]])],
  "plank-shoulder-taps":[P_PH, qWith(P_PH,{ a:[[66,64,73,56],[69,75,70,89]] })],   // eine Hand hebt ab und tippt die Schulter an
  "toes-to-bar":        [Q([57,24],[50,30],[50,58],[[50,72,50,86]],[[47,19,46,6]], gBar(6,30,70)),
                         Q(null,[48,30],[56,55],[[58,41,55,27,52,23]],[[47,19,46,6]], gBar(6,30,70))]
};
var P_FLEGS = [[46,70,45,89,39,89],[54,70,55,89,61,89]];
Object.assign(ILLU_POSES, {
  /* Arme */
  "close-grip-push-ups":[P_PH, P_PL],
  "diamond-push-ups":   [P_PH, P_PL],
  "sphinx-push-ups":    [P_FP, P_PH],
  "triceps-curls":   [qWith(P_STUP,{ x:gDB(64,4) }), qWith(P_STUP,{ a:[[55,15,46,22]], x:gDB(45,23) })],
  "arm-circles":        [qWith(P_F,{ a:[[37,26,24,26],[63,26,76,26]] }), qWith(P_F,{ a:[[37,20,26,12],[63,20,74,12]] })],
  /* Dehnen */
  "neck-stretch":       [Q([43,14],[50,21],[50,52],P_FLEGS,[[40,14,42,6],[56,34,58,48]],"",true), null],
  /* Kinn einziehen: Kopf wandert waagerecht nach hinten (Seitenansicht); Brustwirbelsäule drehen: Vierfüßler, Ellbogen der Kopfhand öffnet sich nach oben */
  "chin-tuck":          [Q([57,9],[50,20],[50,50],[[50,70,50,89,58,89]],[[58,30,57,17]]), Q([48,9],[50,20],[50,50],[[50,70,50,89,58,89]],[[56,30,50,18]])],
  /* Thoracic Rotation: die drehende Hand ist der vordere (volle) Arm, der Stützarm der hintere (blasser). Start: Ellbogen unter der Brust Richtung Boden, Hand hinter dem Kopf, Blick zum Boden.
     Ende: Brustkorb geöffnet, Ellbogen zur Decke, Kopf nach oben (Blick folgt dem Ellbogen). */
  "thoracic-rotation":  [Q([75,69],[66,66],[40,66],[[40,88,22,88,18,89]],[[69.5,77,72.5,64.5],[62,77.5,61,89]]), Q([72.5,57],[66,64],[40,66],[[40,88,22,88,18,89]],[[60,52.5,70.5,58.5],[62,77.5,61,89]])],
  "shoulder-stretch":   [Q(null,[50,20],[50,52],P_FLEGS,[[40,27,30,27],[44,36,40,28]],"",true), null],
  "triceps-stretch":    [Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[53,6,45,16],[59,14,54,7]]), null],
  "biceps-stretch":     [Q(null,[52,20],[52,50],[[52,70,52,89,60,89]],[[40,25,26,26]], gWall(22)), null],
  "chest-stretch":      [Q(null,[52,20],[52,50],[[52,70,52,89,60,89]],[[38,25,36,12]], gWall(33)), null],
  "wrist-stretch":      [Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[63,25,76,25],[60,32,76,20]]), null],
  "side-bend":          [Q(null,[45,22],[50,52],P_FLEGS,[[48,10,40,3],[42,38,42,48]],"",true), null],
  "cat-cow":            [Q([73,76],[66,64],[40,64],[[40,88,22,88,18,89]],[[67,78,68,89]]), Q([76,54],[66,68],[40,66],[[40,88,22,88,18,89]],[[67,79,68,89]])],
  "childs-pose":        [Q([67,85],[58,80],[36,77],[[54,89,34,89,30,89]],[[72,88,86,88]]), null],
  "sphinx-stretch":     [Q(null,[26,72],[52,84],[[70,86,88,87,92,89]],[[26,88,12,88]]), null],
  "downward-dog":       [Q(null,[64,66],[46,46],[[36,68,26,88,20,89]],[[68,78,72,89]]), null],
  "spinal-twist":       [Q(null,[24,84],[50,84],[[60,76,70,88,76,89]],[[24,72,24,62]]), null],
  "forward-fold":       [Q(null,[62,70],[47,48],[[47,69,46,89,54,89]],[[64,80,64,88]]), null],
  "hip-flexor-stretch": [Q(null,[47,34],[48,64],[[64,64,64,89,72,89],[36,88,20,89,18,89]],[[55,48,49,57]]), null],
  "quad-stretch":       [Q(null,[50,20],[50,50],[[50,70,50,89,58,89],[48,72,38,56,40,54]],[[45,38,39,55],[56,32,62,40]]), null],
  "hamstring-stretch":  [Q(null,[48,68],[30,86],[[56,88,80,88,82,82]],[[62,78,76,84]]), null],
  "calf-stretch":       [Q(null,[62,28],[46,54],[[60,72,62,89,70,89],[36,72,26,89,34,89]],[[72,28,80,26]], gWall(81)), null],
  "figure-four":        [Q(null,[22,84],[48,84],[[56,66,70,68],[64,78,58,66]],[[34,74,52,68]]), null],
  "pigeon-stretch":     [Q(null,[50,54],[46,80],[[62,84,52,89],[28,86,8,88,4,89]],[[52,68,58,88]]), null],
  "butterfly-stretch":  [Q(null,[50,56],[50,82],[[34,80,48,88],[66,80,52,88]],[[44,70,48,86],[56,70,52,86]],"",true), null],
  "worlds-greatest":    [Q(null,[60,48],[44,64],[[62,66,64,89,72,89],[30,84,16,88,14,89]],[[60,68,62,88]]),
                         Q(null,[60,48],[44,64],[[62,66,64,89,72,89],[30,84,16,88,14,89]],[[58,34,56,20],[60,68,62,88]])]
});
/* Dehnen und Halteübungen: zwei Posen - Ausgangsstellung und Dehnstellung (2026-10-09) -, die Figur bewegt sich also hinein, statt nur zu stehen.
   Gehaltene Dehnungen zeigen seit 2026-10-10 nur noch die Endstellung (siehe am Ende dieses Blocks).
   Neu gezeichnet: Nackendehnung (Kopf zur Seite), Schulter (Arm quer vor der Brust), Trizeps (Ellbogen hoch, Hand im Nacken), Seitbeuge (Oberkörper kippt). */
(function(){
  var P = ILLU_POSES, S = P_FLEGS;
  var ruhe = Q(null,[50,20],[50,52],S,[[44,34,42,48],[56,34,58,48]],"",true);
  function mit(id, start){ P[id] = [start, P[id][0]]; }
  P["neck-stretch"]       = [ruhe, Q([39,14],[50,21],[50,52],S,[[34,10,42,3],[58,38,60,54]],"",true)];
  P["shoulder-stretch"]   = [ruhe, Q(null,[50,20],[50,52],S,[[62,24,40,28,22,28],[56,34,36,32]],"",true)];
  P["triceps-stretch"]    = [ruhe, Q(null,[50,20],[50,52],S,[[62,10,50,16,44,22],[44,22,58,10]],"",true)];
  P["side-bend"]          = [ruhe, Q(null,[39,22],[50,52],S,[[46,6,28,8],[40,40,44,50]],"",true)];
  mit("biceps-stretch",     qWith(P["biceps-stretch"][0], { a:[[52,34,53,47]] }));
  mit("chest-stretch",      qWith(P["chest-stretch"][0], { a:[[52,34,53,47]] }));
  mit("wrist-stretch",      P_ST);
  mit("calf-stretch",       qWith(P_ST, { x:gWall(81) }));
  mit("quad-stretch",       P_ST);
  mit("forward-fold",       P_ST);
  mit("hip-flexor-stretch", P_ST);
  mit("hamstring-stretch",  Q(null,[40,52],[34,84],[[60,84,80,88]],[[44,68,52,86]]));   // Langsitz, aufrecht
  mit("childs-pose",        P_Q4);
  mit("pigeon-stretch",     P_Q4);
  mit("downward-dog",       P_Q4);
  mit("sphinx-stretch",     P_LF);
  mit("spinal-twist",       P_LBK);
  mit("figure-four",        P_LBK);
  mit("butterfly-stretch",  Q(null,[50,38],[50,82],[[34,80,48,88],[66,80,52,88]],[[44,70,48,86],[56,70,52,86]],"",true));   // aufrecht, dann nach vorn
  /* Halteübungen (Wall Sit, Kniebeuge halten, Hängen, Plank, Hollow Hold) sind statisch und zeigen nur die Haltung - kein Hin und Her (2026-10-14) */
  /* Dehnungen, die man hält, zeigen nur die Endstellung (ein Standbild statt Hin-und-her); in Bewegung bleiben nur Katze-Kuh,
     Kobra und World's Greatest Stretch (2026-10-10) */
  ["neck-stretch","shoulder-stretch","triceps-stretch","biceps-stretch","chest-stretch","wrist-stretch","side-bend","childs-pose","sphinx-stretch",
   "downward-dog","spinal-twist","forward-fold","hip-flexor-stretch","quad-stretch","hamstring-stretch","calf-stretch","figure-four",
   "pigeon-stretch","butterfly-stretch"].forEach(function(id){ P[id] = [P[id][1], null]; });
})();
var P_HANGS = Q([57,24],[50,30],[50,58],[[50,72,50,86]],[[47,19,46,6]], gBar(6,30,70));
var G_ROW = gBar(57,26,62)+'<path class="ip" d="M32 57V89"/>';
var G_PB = gBar(50,40,70)+'<path class="ip" d="M44 50V89M66 50V89"/>';
var G_SB = gBar(50,44,70)+'<path class="ip" d="M46 50V89"/>';
var G_KB = gBar(50,30,50)+'<path class="ip" d="M34 50V89"/>';
var G_PT = gBar(80,40,62)+'<path class="ip" d="M44 80V89M58 80V89"/>';
var G_PL2 = '<path class="ip" d="M52 80H62M54 80V89M60 80V89"/>';   // zwei kleine Parallettes (Seitenansicht: eine) für den L-Sit
var G_MONKEY = gBar(6,8,92)+'<path class="ip" d="M20 3v6M40 3v6M60 3v6M80 3v6"/>';
Object.assign(ILLU_POSES, {
  "chin-ups":           [qWith(P_HANG,{ a:[[44,21,42,6],[56,21,58,6]] }), qWith(P_PULL,{ a:[[39,20,42,6],[61,20,58,6]] })],   // enger gegriffen
  "parallel-bar-dips":  [Q(null,[52,24],[52,52],[[50,68,42,80,44,84]],[[54,37,56,50]], G_PB), Q(null,[54,38],[52,64],[[50,76,40,84,42,86]],[[44,40,56,50]], G_PB)],
  "support-hold":       [Q(null,[52,24],[52,52],[[50,68,42,80,44,84]],[[54,37,56,50]], G_PB), null],
  "hanging-knee-raise": [P_HANGS, qWith(P_HANGS,{ l:[[66,56,66,72,72,72]] })],
  "hanging-leg-raise":  [P_HANGS, qWith(P_HANGS,{ l:[[68,60,86,60,88,56]] })],
  "hanging-l-sit":      [P_HANGS, qWith(P_HANGS,{ l:[[68,60,86,60,88,56]] })],
  "l-sit":              [Q(null,[46,34],[49,60],[[66,66,70,84,76,89]],[[52,55,57,79]], G_PL2), Q(null,[46,34],[49,60],[[67,60,85,60,87,56]],[[52,55,57,79]], G_PL2)],   // Stütz auf zwei kleinen Parallettes: erst Beine unten, dann waagerecht
  "windshield-wipers":  [qWith(P_HANG,{ l:[[38,50,26,40],[40,54,28,44]] }), qWith(P_HANG,{ l:[[62,50,74,40],[60,54,72,44]] })],
  "muscle-ups":         [Q([56,36],[50,44],[50,70],[[50,82,50,88]],[[40,48,46,40]], gBar(40,28,72)), Q(null,[50,18],[50,46],[[50,62,50,76]],[[53,31,54,40]], gBar(40,28,72))],
  "monkey-bar-traverse":[Q([56,24],[50,30],[50,58],[[50,72,48,86]],[[42,18,38,6],[56,18,62,6]], G_MONKEY), Q([62,24],[56,30],[56,58],[[56,72,54,86]],[[62,18,68,6],[48,18,44,6]], G_MONKEY)],
  "skin-the-cat":       [P_HANGS, Q([46,34],[50,24],[58,42],[[64,24,72,12]],[[48,15,46,6]], gBar(6,30,70))],
  "archer-push-ups":    [P_PH, qWith(P_PL,{ a:[[60,71,70,89],[74,82,86,88]] })],
  "pistol-squats":      [qWith(P_ST,{ l:[[50,70,50,89,58,89],[68,58,85,62,90,61]], a:[[63,25,76,25]] }), Q(null,[48,46],[40,72],[[56,66,50,89,58,89],[58,74,76,74,80,70]],[[62,48,76,48]])],
  "dragon-flags":       [Q([16,82],[24,84],[40,60],[[52,42,62,26,64,22]],[[14,86,8,82]]), Q([16,82],[24,84],[46,76],[[64,70,84,64,86,60]],[[14,86,8,82]])],
  "clap-push-ups":      [P_PL, qWith(qShift(P_PH,0,-8),{ a:[[72,62,76,70]] })],
  "tuck-jumps":         [P_SQ, Q(null,[50,14],[50,42],[[64,40,58,54,62,56]],[[58,28,64,34]])]
});
Object.assign(ILLU_POSES, {
  "reverse-crunch": [qWith(P_LB,{ l:[[52,66,68,66]] }), Q(null,[22,84],[44,80],[[42,62,56,56]],[[32,87,44,87]])],
  /* Ergänzungen 2026-10-14 */
  "db-bench-press":   [Q([14,78],[24,79],[46,81],[[64,72,66,89,74,89]],[[30,83,32,71]], gDB(32,69)+gBench(6,62,84)),
                       Q([14,78],[24,79],[46,81],[[64,72,66,89,74,89]],[[28,67,29,55]], gDB(29,53)+gBench(6,62,84))],
  "db-step-ups":      [Q(null,[40,22],[40,52],[[56,58,60,74,68,74],[40,71,40,89,48,89]],[[42,36,43,49]], gBox(54,76,86)+gDB(43,51)),
                       Q(null,[62,16],[62,44],[[62,60,62,76,70,76],[52,58,48,70,52,72]],[[64,29,65,41]], gBox(54,76,86)+gDB(65,43))],
  "sumo-squat-db":    [Q(null,[50,20],[50,50],[[42,70,34,89,28,89],[58,70,66,89,72,89]],[[46,36,50,48],[54,36,50,48]], gDB(50,50), true),
                       Q(null,[50,36],[50,62],[[36,72,32,89,26,89],[64,72,68,89,74,89]],[[46,52,50,63],[54,52,50,63]], gDB(50,64), true)],
  "knee-push-ups":    [Q(null,[72,60],[45,72],[[32,88,16,80,12,78]],[[69,75,70,89]]),
                       Q(null,[72,76],[44,80],[[32,88,18,84,14,82]],[[62,72,70,89]])],
  "single-leg-calf-raise": [Q(null,[50,20],[50,50],[[50,70,50,89,58,89],[48,72,40,84]],[[52,34,53,47]]),
                       Q(null,[50,15],[50,45],[[50,65,50,84,58,89],[48,67,40,79]],[[52,29,53,42]])],
  "negative-dips":    [Q(null,[52,24],[52,52],[[50,68,42,80,44,84]],[[54,37,56,50]], G_PB),
                       Q(null,[54,38],[52,64],[[50,76,40,84,42,86]],[[44,40,56,50]], G_PB)],
  "pallof-press":     [Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[44,33,55,31]], gHand(55,31,'<circle class="ipf" cx="55" cy="31" r="3"/>')),
                       Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[62,26,75,26]], gHand(75,26,'<circle class="ipf" cx="75" cy="26" r="3"/>'))],
  /* Gelenk des gestreckten Stützarms: ein etwas größerer Kreis am Boden deutet es an (kein Knick) */
  /* Copenhagen Plank (Seitstütz, Obenbein auf der Bank, Untenbein hängt und wird zum Obenbein hochgezogen), wie auf dem Foto: Unterarm am Boden, Körper waagerecht */
  "copenhagen-plank": [Q(null,[22,64],[46,63],[[60,63,74,62],[58,70,72,76]],[[22,76,22,87],[36,50,50,60]], gLinie("M70 62H92M74 62V89M88 62V89")+'<circle cx="22" cy="87" r="4.4"/><path d="M30 64L48 63" style="stroke-width:14"/>', true),
                       Q(null,[22,64],[46,63],[[60,63,74,62],[60,64,74,63]],[[22,76,22,87],[36,50,50,60]], gLinie("M70 62H92M74 62V89M88 62V89")+'<circle cx="22" cy="87" r="4.4"/><path d="M30 64L48 63" style="stroke-width:14"/>', true)],
  "backpack-row":     [qWith(P_HG,{ x:gHand(61,68,'<rect class="ipf" x="57" y="66" width="9" height="12" rx="2"/>') }),
                       qWith(P_HG,{ a:[[50,36,56,48]], x:gHand(56,50,'<rect class="ipf" x="52" y="48" width="9" height="12" rx="2"/>') })],
  "single-leg-rdl":   [Q(null,[50,20],[50,50],[[50,70,50,89,58,89],[46,72,40,84]],[[52,34,53,47]]),
                       Q(null,[68,48],[42,50],[[44,70,44,89,52,89],[22,50,4,50]],[[68,60,68,72]])],
  "nordic-curl":      [Q(null,[40,35],[40,65],[[40,86,22,88,16,89]],[[44,46,46,58]]),
                       Q(null,[84,62],[58,76],[[40,86,22,88,16,89]],[[86,74,88,84]])]
});
/* Blickrichtung umgekehrt (Nase): Bauchlage mit Kopf links, Dips mit Blick nach links */
[["superman-hold",1],["swimmers",0],["swimmers",1],["cobra-lift",1],["childs-pose",0],["sphinx-stretch",0],["triceps-dips",0],["triceps-dips",1]].forEach(function(x){
  var q = ILLU_POSES[x[0]][x[1]];
  if(q) ILLU_POSES[x[0]][x[1]] = qWith(q, { b:-1 });
});
/* ---------- Sprünge und Burpees ----------
   Einheitliche Proportionen (Rumpf 30, Oberschenkel 21, Unterschenkel 19, Fuß 7, Ober-/Unterarm je 12),
   damit beim Übergang nichts „wächst“. Für Sprünge wird die Figur verkleinert (qScale, Fixpunkt Boden-Mitte),
   damit Kopf und Arme in der Luft im Bild bleiben. Abläufe mit mehreren Phasen stehen in ILLU_SEQ:
   k = Posen der Reihe nach (danach wieder von vorn), t = je Phase [halten s, Übergang s, Easing]. */
function qScale(q, k){
  function sc(arr){ return arr.map(function(v, i){ return i%2===0 ? +(50+(v-50)*k).toFixed(1) : +(89-(89-v)*k).toFixed(1); }); }
  return Q(q.h ? sc(q.h) : null, sc(q.n), sc(q.p), q.l.map(sc), q.a.map(sc), q.x, q.f, q.b);
}
var J_ST   = Q(null,[50,19],[50,49],[[50,70,50,89,57,89]],[[52,35,54,47]]);          // Stand, Arme locker
var J_SQB  = Q(null,[57,45],[36,66],[[57,71,52,89,59,89]],[[44,54,35,61]]);          // Hocke, Arme hinten (Ausholen)
var J_SQF  = Q(null,[57,45],[36,66],[[57,71,52,89,59,89]],[[66,47,78,45]]);          // Hocke, Arme vorn (Landung)
var J_AIR  = Q(null,[49,4],[50,34],[[53,55,50,74,54,80]],[[58,1,66,-8]]);           // in der Luft, gestreckt, Arme schräg hoch
var J_TUCK = Q(null,[49,6],[50,36],[[69,27,58,44,65,46],[65,30,54,47,61,49]],[[60,19,73,25],[58,18,70,27]]);   // Knie zur Brust (beide Beine, das hintere blasser), Arme nach vorn unten zu den Knien
var B_SQH  = Q(null,[68,64],[40,74],[[60,72,52,89,59,89]],[[68,77,70,89]]);          // tiefe Hocke, Hände am Boden
var B_PL   = Q(null,[74,63.5],[46,74],[[26,81,9,87,13,89.5]],[[70.5,77,70,89]]);     // hoher Stütz
var B_PUL  = Q(null,[77,79],[47,82.5],[[27,85.5,9,88,13,89.5]],[[61,81,70,89]]);     // Liegestütz unten
var BP_HANG = Q(null,[50,4],[50,34],[[50,55,50,74,53,80]],[[50,-3.5,50,-15]]);       // an der Stange (Stange bei y = -15)
var BP_PULL = Q(null,[50,-8.5],[50,21.5],[[50,42.5,50,61.5,53,68]],[[61,-10,50,-15]]); // Kinn über der Stange
function jSeq(k, faktor){ return k.map(function(q){ return qScale(q, faktor || .76); }); }
var JJ_ZU   = qScale(P_F, .86);
var JJ_AUF  = qScale(qWith(P_F, { l:[[42,70,33,89,27,89],[58,70,67,89,73,89]], a:[[40,16,33,5],[60,16,67,5]] }), .86);
var JJ_LUFT = qShift(qScale(qWith(P_F, { l:[[44,70,40,87,37,92],[56,70,60,87,63,92]], a:[[37,28,29,20],[63,28,71,20]] }), .86), 0, -8);
/* Lateral Hops: seitlich hin und her, jedes Mal kurz abheben und landen */
var LH_BODEN = qScale(qWith(P_F, { l:[[47,71,46,89,40,89],[53,71,54,89,60,89]], a:[[42,36,38,48],[58,36,62,48]] }), .86);
var LH_LUFT  = qShift(qScale(qWith(P_F, { l:[[47,68,46,84,40,86],[53,68,54,84,60,86]], a:[[42,36,38,48],[58,36,62,48]] }), .86), 0, -8);
var BS_BODEN  = Q(null,[40,22],[40,52],[[41,71,40,89,48,89],[39,71,40,89,47,89]],[[42,36,43,49]], gBox(54,76,86));
var BS_AUF    = Q(null,[42,22],[40,52],[[56,58,60,74,68,74],[40,71,40,89,48,89]],[[48,34,52,44]], gBox(54,76,86));
var BS_HOCH   = Q(null,[62,19],[62,47],[[62,62,62,76,70,76],[52,61,48,73,52,75]],[[64,32,65,44]], gBox(54,76,86));
var BS_OBEN   = Q(null,[62,19],[62,47],[[62,62,62,76,70,76],[60,62,60,76,68,76]],[[63,33,64,45]], gBox(54,76,86));
var BS_RUNTER = Q(null,[51,21],[50,50],[[62,60,62,76,70,76],[45,69,42,89,49,89]],[[50,36,50,48]], gBox(54,76,86));
/* Jump Lunges: Ausfallschritt (vorderes Bein vorn, Gegenarm vorn) -> Flug mit Beinen in der Mitte -> Ausfallschritt andersherum */
var JL_A   = Q(null,[50,33],[48,63],[[68,70,68,89,75,89],[41,83,23,85,17,89]],[[43,43,36,52],[58,43,68,51]]);
var JL_AIR = qShift(Q(null,[50,16],[50,46],[[56,65,53,83,60,85],[44,66,41,84,47,87]],[[56,24,62,31],[44,24,38,31]]), 0, -11);
var JF_AIR = Q(null,[58,8],[48,34],[[44,52,34,64,36,72]],[[68,8,78,2]]);
var ILLU_SEQ = {
  "jumping-jacks": { k:[JJ_ZU, JJ_LUFT, JJ_AUF, JJ_LUFT], t:[[.1,.2,"o"],[.03,.2,"i"],[.1,.2,"o"],[.03,.2,"i"]] },
  "skater-jumps":  { k:[SK_L, qMirror(SK_AIR), qMirror(SK_L), SK_AIR], t:[[.16,.3],[0,.3],[.16,.3],[0,.3]] },   // Landung links → Flug nach rechts → Landung rechts → Flug nach links (Zyklus ca. 1,5 s)
  "lateral-hops":  { k:[qShift(LH_BODEN,-12,0), LH_LUFT, qShift(LH_BODEN,12,0), LH_LUFT], t:[[.03,.12,"o"],[.01,.12,"i"],[.03,.12,"o"],[.01,.12,"i"]] },
  /* Fast Feet: flottes Trippeln */
  "fast-feet":     { k:[ILLU_POSES["fast-feet"][0], ILLU_POSES["fast-feet"][1]], t:[[.02,.11],[.02,.11]] },
  /* Box Step-ups: ganzer Zyklus - Führungsbein auf die Box, hochdrücken, zweites Bein nach, zweites Bein zuerst wieder runter */
  "box-step-ups":  { k:[BS_BODEN, BS_AUF, BS_HOCH, BS_OBEN, BS_RUNTER], t:[[.05,.22],[.02,.18],[.02,.16],[.05,.2],[.02,.2]] },
  "jump-squats":  { k:jSeq([J_SQB, J_AIR, J_SQF]), t:[[.22,.32,"o"],[.06,.36,"i"],[.18,.3]] },
  /* Tuck Jumps: Hocke (Arme hinten) → kräftiges Strecken mit Armschwung nach oben → Knie zur Brust auf dem Höhepunkt → weiche Landung in der Hocke */
  "tuck-jumps":   { k:jSeq([J_SQB, J_AIR, J_TUCK, J_SQF]), t:[[.2,.22,"o"],[.0,.16],[.06,.3,"i"],[.16,.3]] },
  "jump-lunges":  { k:jSeq([JL_A, JL_AIR, qSwap(JL_A), JL_AIR], .84), t:[[.16,.26,"o"],[.04,.26,"i"],[.16,.26,"o"],[.04,.26,"i"]] },
  "burpees":      { k:jSeq([J_ST, B_SQH, B_PL, B_PUL, B_PL, B_SQH, J_AIR]), t:[[.2,.38],[.04,.28],[.06,.3],[.08,.3],[.04,.28],[.04,.3,"o"],[.06,.36,"i"]] },
  "plank-burpees":{ k:[J_ST, B_SQH, B_PL, B_SQH], t:[[.25,.45],[.06,.4],[.3,.4],[.06,.45]] },
  "burpee-squat-jumps": { k:jSeq([J_ST, B_SQH, B_PL, B_PUL, B_PL, B_SQH, J_SQB, J_AIR]), t:[[.2,.38],[.04,.28],[.06,.3],[.08,.3],[.04,.28],[.04,.26],[.06,.3,"o"],[.06,.38,"i"]] },
  "frogs":        { k:jSeq([B_SQH, J_AIR]), t:[[.26,.34,"o"],[.06,.42,"i"]] },
  "stand-up-jumps": { k:jSeq([P_LBK, J_SQF, J_AIR, J_SQF]), t:[[.25,.5],[.04,.3,"o"],[.06,.36,"i"],[.1,.5]] },
  /* Flug beim Weitsprung: Oberkörper nach vorn geneigt, Arme vorn oben, Beine ziehen gebeugt hinterher */
  /* Jump Forward Squats: Hocke hinten -> weiter Sprung nach vorn -> Landung in der Hocke -> aufrichten, zurückgehen */
  "jump-forward-squats": { k:jSeq([qShift(J_SQB,-15,0), JF_AIR, qShift(J_SQF,15,0), qShift(J_ST,15,0), qShift(J_ST,-15,0)]),
                           t:[[.2,.32,"o"],[.04,.36,"i"],[.16,.3],[.1,.6,"l"],[.08,.3]] },
  /* Jump Forward Burpees: Burpee mit Liegestütz, Füße zu den Händen, dann weit nach vorn springen */
  "jump-forward-burpees": { k:jSeq([qShift(J_ST,-15,0), qShift(B_SQH,-15,0), qShift(B_PL,-15,0), qShift(B_PUL,-15,0), qShift(B_PL,-15,0), qShift(B_SQH,-15,0),
                                    qShift(J_SQB,-15,0), JF_AIR, qShift(J_SQF,15,0), qShift(J_ST,15,0)]),
                            t:[[.18,.36],[.04,.28],[.06,.3],[.08,.3],[.04,.28],[.04,.24],[.04,.3,"o"],[.04,.36,"i"],[.14,.3],[.1,.6,"l"]] },
  "burpee-pull-ups": { k:jSeq([J_ST, B_SQH, B_PL, B_PUL, B_PL, B_SQH, BP_HANG, BP_PULL, BP_HANG], .78).map(function(q){ return qWith(q, { x:gBar(8,26,74) }); }),
                       t:[[.18,.34],[.03,.26],[.06,.3],[.08,.3],[.03,.26],[.03,.32,"o"],[.1,.45],[.16,.45],[.06,.4,"i"]] }
};
/* Tempo der schnellen Übungen: Die Standard-Schleife (ca. 2 s je Wiederholung) wirkte hier viel zu träge.
   Nur die Zeiten, die Posen bleiben unverändert. Klatsch-Liegestütz: kontrolliert runter, explosiv hoch, kurze Flugphase. */
ILLU_SEQ["mountain-climbers"] = { k:[ILLU_POSES["mountain-climbers"][0], ILLU_POSES["mountain-climbers"][1]], t:[[.05,.26],[.05,.26]] };
ILLU_SEQ["high-knees"]        = { k:[ILLU_POSES["high-knees"][0], ILLU_POSES["high-knees"][1]], t:[[.04,.18],[.04,.18]] };
ILLU_SEQ["sprint-in-place"]   = { k:[ILLU_POSES["sprint-in-place"][0], ILLU_POSES["sprint-in-place"][1]], t:[[.04,.17],[.04,.17]] };
ILLU_SEQ["clap-push-ups"]     = { k:[ILLU_POSES["clap-push-ups"][0], ILLU_POSES["clap-push-ups"][1]], t:[[.3,.16],[.04,.32]] };
/* Standbilder (Listen) zeigen eine typische Phase */
Object.assign(ILLU_POSES, {
  "jumping-jacks": [JJ_AUF, JJ_ZU],
  "jump-squats": [ILLU_SEQ["jump-squats"].k[0], ILLU_SEQ["jump-squats"].k[1]],
  "tuck-jumps":  [ILLU_SEQ["tuck-jumps"].k[2], ILLU_SEQ["tuck-jumps"].k[0]],
  "jump-lunges": [ILLU_SEQ["jump-lunges"].k[0], ILLU_SEQ["jump-lunges"].k[1]],
  "burpees":     [ILLU_SEQ["burpees"].k[2], ILLU_SEQ["burpees"].k[6]],
  "plank-burpees": [B_SQH, B_PL],
  "burpee-squat-jumps": [ILLU_SEQ["burpee-squat-jumps"].k[7], ILLU_SEQ["burpee-squat-jumps"].k[2]],
  "frogs":       [ILLU_SEQ["frogs"].k[0], ILLU_SEQ["frogs"].k[1]],
  "stand-up-jumps": [ILLU_SEQ["stand-up-jumps"].k[0], ILLU_SEQ["stand-up-jumps"].k[2]],
  "burpee-pull-ups": [ILLU_SEQ["burpee-pull-ups"].k[7], ILLU_SEQ["burpee-pull-ups"].k[2]],
  "jump-forward-squats": [ILLU_SEQ["jump-forward-squats"].k[1], ILLU_SEQ["jump-forward-squats"].k[0]],
  "jump-forward-burpees": [ILLU_SEQ["jump-forward-burpees"].k[7], ILLU_SEQ["jump-forward-burpees"].k[2]]
});

/* Zweite Ansicht fürs Info-Fenster - dort, wo die Seitenansicht die Bewegung nicht zeigt.
   typ "front" = von vorn, "top" = von oben (ohne Bodenlinie, Kopf oben). Pose B ist meist das Spiegelbild. */
function qSide(q){ return qSwap(qMirror(q)); }   // gespiegelt, linke/rechte Glieder behalten ihre Seite
/* Drehbewegung: Beine wie qSide (jedes Bein bleibt auf seiner Seite), Arme nur gespiegelt -
   so bleibt der vordere Arm vorn und schwingt über den Körper zur anderen Seite */
function qTwist(q){ return qWith(qMirror(q), { l:qSide(q).l }); }
function gBall(x, y){ return gHand(x, y, '<circle class="ipf" cx="'+x+'" cy="'+y+'" r="5.5"/>'); }   // kleiner Ball zwischen den Händen
/* Ukraine Twist. Seitlich (Hauptbild): zurückgelehnt, Füße in der Luft, Ball vor der Brust ↔ neben der Hüfte am Boden.
   Von vorn (zweite Ansicht): die Drehung als Bogen - Ball links neben der Hüfte → vor der Brust über den Knien → rechts. */
var RT_SC = Q(null,[26,62],[44,84],[[60,70,76,76,82,74]],[[38,70,47,68]], gBall(51,68));
var RT_ST = Q(null,[27,62],[44,84],[[60,70,76,76,82,74]],[[34,75,39,85]], gBall(41,86));
var RT_BEINE = [[34,63,40,79],[66,63,60,79]];
var RT_FL = Q(null,[46,50],[50,84],RT_BEINE,[[36,66,27,78],[38,61,25,74]], gBall(26,80), true);
var RT_FC = Q(null,[50,49],[50,84],RT_BEINE,[[39,64,46,62],[61,64,54,62]], gBall(50,62), true);
var RT_FR = qWith(qMirror(RT_FL), { l:RT_BEINE, x:gBall(74,80) });
var RT_FLC = Q(null,[48,49.5],[50,84],RT_BEINE,[[40,63,33,64],[41,58,31,62]], gBall(34,66), true);   // Zwischenpunkte auf dem Bogen
var RT_FRC = qWith(qMirror(RT_FLC), { l:RT_BEINE, x:gBall(66,66) });
ILLU_SEQ["russian-twists"] = { k:[RT_SC, RT_ST], t:[[.12,.45],[.12,.45]] };
ILLU_POSES["russian-twists"] = [RT_SC, RT_ST];
var V_ARCH = Q(null,[50,32],[50,64],[[48,79,47,94],[52,79,53,94]],[[64,36,78,38],[36,36,22,38]],"",true);
var V_SNOW = Q([50,11],[50,21],[50,56],[[47,72,47,90],[53,72,53,90]],[[38,40,40,54],[62,40,60,54]],"",true);
/* Commando Pull-Up. Hauptbild von vorn: die Stange zeigt auf den Betrachter (nur ihr Ende ist zu sehen), beide Hände
   greifen dicht hintereinander - der Kopf kommt abwechselnd links und rechts an der Stange vorbei.
   Zweite Ansicht von der Seite: die lange Stange, eine Hand vor der anderen. */
var CP_BAR = '<circle class="ip" cx="50" cy="5.5" r="4.6"/>';   // Stangenende als Ring, die Hände greifen direkt darunter
var CP_H = Q(null,[50,31],[50,59],[[48,73,48,86],[52,73,52,86]],[[46,20,48,9],[54,20,52,9]], CP_BAR, true);
var CP_L = Q([37,8],[42,17],[46,46],[[45,62,45,76],[49,62,49,76]],[[36,10,48,9],[54,19,52,9]], CP_BAR, true);
var CP_R = qMirror(CP_L);
var CS_H = Q(null,[50,30],[50,58],[[50,72,50,86]],[[46,19,45,6],[54,19,56,6]], gBar(6,18,82));
var CS_P = Q([51,5],[50,15],[50,44],[[50,60,50,74]],[[39,15,45,6],[62,16,56,6]], gBar(6,18,82));
ILLU_POSES["commando-pull-ups"] = [CP_L, CP_H];
ILLU_SEQ["commando-pull-ups"] = { k:[CP_H, CP_L, CP_H, CP_R], t:[[.35,.7],[.3,.7],[.35,.7],[.3,.7]] };
/* Seitenansicht für Klimmzug-Varianten: die Stange von der Seite als Punkt (Ring), eine Hand daran.
   Pull-up: Ellbogen beugen und nach unten ziehen, Kinn über die Stange.
   Scapular Pull-up: Arme gestreckt, nur Brust auf und Schultern weg von den Ohren - der Kopf kommt aus dem „Einsinken“ heraus. */
var PS_BAR = '<circle class="ip" cx="50" cy="8" r="4.4"/>';
var PS_HANG = Q([53,29],[50,37],[50,65],[[52,79,44,86]],[[50,25.5,50,14]], PS_BAR);
var PS_TOP  = Q([56,8],[52,18],[47,46],[[50,60,42,67]],[[44,26,50,14]], PS_BAR);
var SS_AKT  = Q([47,26],[46,35],[50,63],[[54,76,47,84]],[[48,24.5,50,14]], PS_BAR);
/* ---------- Fitnessstudio: Geräte ----------
   Schlichte Gerätelinien (Sitz, Lehne, Rahmen). Griffe, Stangen und Hantelscheiben hält die Hand (gHand),
   damit sie in der Animation mitwandern. Seitlich mit Blick nach rechts, außer Latzug und Adduktoren (von vorn). */
function gLinie(d){ return '<path class="ip" d="'+d+'"/>'; }
function gSitz(x1, x2, y){ return gLinie("M"+x1+" "+y+"H"+x2+"M"+((x1+x2)/2)+" "+y+"V89"); }
function gGriff(x, y){ return gHand(x, y, '<path class="ip" d="M'+x+' '+(y-4)+'v8"/>'); }
function gQuer(x, y, b){ return gHand(x, y, '<path class="ip" d="M'+(x-b)+' '+y+'h'+(2*b)+'"/>'); }
function gScheibe(x, y, r){ return gHand(x, y, '<circle class="ipf" cx="'+x+'" cy="'+y+'" r="'+(r||7)+'"/>'); }
function gRolle(x, y){ return '<circle class="ip" cx="'+x+'" cy="'+y+'" r="3"/>'; }
/* Polster/Platte am Fuß: wandert mit dem nächstgelegenen Beinpunkt mit (wie gHand bei der Hand) */
function gFuss(x, y, inner){ return '<g class="gf" data-at="'+x+','+y+'">'+inner+'</g>'; }
function gPolster(x, y){ return gFuss(x, y, '<circle class="ipf" cx="'+x+'" cy="'+y+'" r="4"/>'); }
function gPlatte(x, y, dx, dy){ return gFuss(x, y, '<path class="ip gp" d="M'+(x-dx)+' '+(y-dy)+'L'+(x+dx)+' '+(y+dy)+'"/>'); }
var ST_SITZ  = gSitz(32, 56, 65) + gLinie("M34 28V65");            // Sitz mit Lehne
var ST_BEINE = [[62,65,61,84,68,88]];                               // sitzend, Füße am Boden
var ST_BANK  = gBench(12, 60, 73);
function stLiegen(arm, x){ return Q([16,66],[26,67],[48,69],[[64,64,66,85,73,89]],[arm], ST_BANK+x); }
Object.assign(ILLU_POSES, {
  "chest-press-machine": [Q(null,[42,34],[42,63],ST_BEINE,[[40,45,52,41]], ST_SITZ+gGriff(52,41)),
                          Q(null,[42,34],[42,63],ST_BEINE,[[54,37,66,38]], ST_SITZ+gGriff(66,38))],
  "shoulder-press-machine": [Q(null,[42,34],[42,63],ST_BEINE,[[50,43,51,31]], ST_SITZ+gGriff(51,31)),
                             Q(null,[42,34],[42,63],ST_BEINE,[[46,22,48,10]], ST_SITZ+gGriff(48,10))],
  "butterfly":         [Q(null,[42,34],[42,63],ST_BEINE,[[31,37,31,25]], ST_SITZ+gHand(31,25,'<path class="ip" d="M31 23V37"/>')),
                        Q(null,[42,34],[42,63],ST_BEINE,[[53,37,53,25]], ST_SITZ+gHand(53,25,'<path class="ip" d="M53 23V37"/>'))],
  "reverse-butterfly": [Q(null,[42,34],[42,63],ST_BEINE,[[54,38,66,39]], gSitz(30,54,65)+gLinie("M52 30V56")+gGriff(66,39)),
                        Q(null,[42,34],[42,63],ST_BEINE,[[30,37,18,38]], gSitz(30,54,65)+gLinie("M52 30V56")+gGriff(18,38))],
  "row-machine":       [Q(null,[42,34],[42,63],ST_BEINE,[[54,38,66,41]], gSitz(30,54,65)+gLinie("M50 36V54")+gGriff(66,41)),
                        Q(null,[42,34],[42,63],ST_BEINE,[[31,40,43,44]], gSitz(30,54,65)+gLinie("M50 36V54")+gGriff(43,44))],
  "cable-row":         [Q(null,[42,45],[36,72],[[55,64,72,70,73,62]],[[53,50,64,53]], gSitz(22,48,74)+gLinie("M77 58V78")+gRolle(82,52)+gGriff(64,53)),
                        Q(null,[40,44],[36,72],[[55,64,72,70,73,62]],[[28,50,40,55]], gSitz(22,48,74)+gLinie("M77 58V78")+gRolle(82,52)+gGriff(40,55))],
  "lat-pulldown":      [Q(null,[50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[40,24,34,12],[60,24,66,12]], gLinie("M36 66H64M50 66V89")+gHand(34,12,'<path class="ip" d="M16 12H84"/>'), true),
                        Q(null,[50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[36,40,34,27],[64,40,66,27]], gLinie("M36 66H64M50 66V89")+gHand(34,27,'<path class="ip" d="M16 27H84"/>'), true)],
  "back-extension":    [Q(null,[60,80],[50,54],[[38,66,26,78,22,72]],[[62,70,56,66]], gLinie("M20 86L52 58M16 80L26 86")+gRolle(55,57)),
                        Q(null,[70,34],[50,54],[[38,66,26,78,22,72]],[[66,44,60,40]], gLinie("M20 86L52 58M16 80L26 86")+gRolle(55,57))],
  "leg-press":         [Q(null,[30,36],[44,62],[[56,44,70,58,72,50]],[[36,46,44,54]], gLinie("M6 72H66")+'<path class="ip gp" d="M75 40V72"/>'),
                        Q(null,[18,36],[32,62],[[51,59,70,58,72,50]],[[24,46,32,54]], gLinie("M6 72H66")+'<path class="ip gp" d="M75 40V72"/>')],
  "leg-press-45":      [Q([11,52],[14,57],[36,74],[[34,54,54,56,58,50]],[[22,67,32,72]], gLinie("M50 86L90 46M8 60L30 80")+gPlatte(59,54,6,-6)),
                        Q([11,52],[14,57],[36,74],[[50,60,64,46,69,41]],[[22,67,32,72]], gLinie("M50 86L90 46M8 60L30 80")+gPlatte(69,45,6,-6))],
  "leg-extension":     [Q(null,[42,34],[44,63],[[62,65,60,84,66,88]],[[42,46,50,58]], gSitz(34,60,65)+gLinie("M36 28V65")+gPolster(65,80)),
                        Q(null,[42,34],[44,63],[[62,65,80,60,82,53]],[[42,46,50,58]], gSitz(34,60,65)+gLinie("M36 28V65")+gPolster(79,55))],
  "leg-curl":          [Q(null,[42,34],[44,63],[[62,65,80,63,82,56]],[[42,46,50,58]], gSitz(34,60,65)+gLinie("M36 28V65M52 58H68")+gPolster(80,68)),
                        Q(null,[42,34],[44,63],[[62,65,56,82,62,86]],[[42,46,50,58]], gSitz(34,60,65)+gLinie("M36 28V65M52 58H68")+gPolster(51,80))],
  "adductor-machine":  [Q(null,[50,32],[50,60],[[38,65,36,83],[62,65,64,83]],[[40,42,38,54],[60,42,62,54]], gLinie("M34 64H66M50 64V89")+gFuss(42,68,'<path class="ip gp" d="M42 62V74"/>')+gFuss(58,68,'<path class="ip gp" d="M58 62V74"/>'), true),
                        Q(null,[50,32],[50,60],[[46,71,46,89],[54,71,54,89]],[[40,42,38,54],[60,42,62,54]], gLinie("M34 64H66M50 64V89")+gFuss(49,74,'<path class="ip gp" d="M49 68V80"/>')+gFuss(51,74,'<path class="ip gp" d="M51 68V80"/>'), true)],
  "calf-machine":      [Q(null,[50,22],[50,50],[[50,68,50,84,58,84]],[[58,29,58,21]], gLinie("M40 89V84H64V89")+gHand(58,21,'<path class="ip gp" d="M44 20H62"/>')),
                        Q(null,[50,16],[50,44],[[50,62,50,77,57,84]],[[58,25,58,17]], gLinie("M40 89V84H64V89")+gHand(58,17,'<path class="ip gp" d="M44 16H62"/>'))],
  "biceps-machine":    [Q(null,[46,37],[40,64],[[58,67,58,86,65,88]],[[56,46,66,55]], gSitz(30,52,66)+gLinie("M47 45L61 54")+gGriff(66,55)),
                        Q(null,[46,37],[40,64],[[58,67,58,86,65,88]],[[56,46,53,34]], gSitz(30,52,66)+gLinie("M47 45L61 54")+gGriff(53,34))],
  "triceps-pushdown":  [Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[52,32,62,26]], gLinie("M72 0V89")+gRolle(68,4)+gQuer(62,26,3)),
                        Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[52,32,54,44]], gLinie("M72 0V89")+gRolle(68,4)+gQuer(54,44,3))],
  "cable-curl":        [Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[52,32,54,44]], gLinie("M74 40V89")+gRolle(70,84)+gQuer(54,44,3)),
                        Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[52,32,60,23]], gLinie("M74 40V89")+gRolle(70,84)+gQuer(60,23,3))],
  "skull-crusher":     [stLiegen([27,55,28,43], gScheibe(28,41,3)), stLiegen([27,55,17,60], gScheibe(15,60,3))],
  "pullover":          [stLiegen([27,55,28,43], gDB(28,41)), stLiegen([16,62,5,60], gDB(5,58))],
  "bench-press":       [stLiegen([29,56,30,44], gScheibe(30,42,7)), stLiegen([22,77,30,65], gScheibe(30,62,7))],
  "ab-crunch-machine": [Q(null,[42,35],[40,64],[[60,66,60,85,67,88]],[[48,28,44,20]], gSitz(30,54,66)+gLinie("M32 30V66")+gGriff(44,20)),
                        Q(null,[54,40],[40,64],[[60,66,60,85,67,88]],[[60,33,56,25]], gSitz(30,54,66)+gLinie("M32 30V66")+gGriff(56,25))],
  "barbell-squat":     [Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[44,30,48,21]], gScheibe(47,20,7)),
                        Q(null,[46,36],[36,62],[[57,62,52,89,60,89]],[[40,46,44,37]], gScheibe(43,35,7))],
  "barbell-deadlift":  [Q(null,[67,52],[40,58],[[54,68,52,86,60,89]],[[66,65,64,77]], gScheibe(64,80,8)),
                        Q(null,[50,20],[50,50],[[50,70,50,89,58,89]],[[52,34,53,46]], gScheibe(54,48,8))]
});
ILLU_POSES["abductor-machine"] = [
  Q(null,[50,32],[50,60],[[46,71,46,89],[54,71,54,89]],[[40,42,38,54],[60,42,62,54]], gLinie("M34 64H66M50 64V89")+gFuss(42,74,'<path class="ip gp" d="M42 68V80"/>')+gFuss(58,74,'<path class="ip gp" d="M58 68V80"/>'), true),
  Q(null,[50,32],[50,60],[[38,65,36,83],[62,65,64,83]],[[40,42,38,54],[60,42,62,54]], gLinie("M34 64H66M50 64V89")+gFuss(34,68,'<path class="ip gp" d="M34 62V74"/>')+gFuss(66,68,'<path class="ip gp" d="M66 62V74"/>'), true)];
var ST_STAND = [[50,70,50,89,58,89]];
var ST_FRONT = [[46,70,45,89,39,89],[54,70,55,89,61,89]];
var ST_SCHRAEG = gLinie("M16 50L42 74M44 74V89");
Object.assign(ILLU_POSES, {
  "hack-squat":        [Q(null,[46,21],[52,50],[[54,70,52,89,60,89]],[[44,30,46,22]], gLinie("M36 12L42 74M36 89H66")),
                        Q(null,[40,38],[42,64],[[60,62,54,89,62,89]],[[38,47,40,39]], gLinie("M36 12L42 74M36 89H66"))],
  "smith-squat":       [qWith(ILLU_POSES["barbell-squat"][0], { x:gLinie("M24 0V89M72 0V89")+gScheibe(47,20,7) }),
                        qWith(ILLU_POSES["barbell-squat"][1], { x:gLinie("M24 0V89M72 0V89")+gScheibe(43,35,7) })],
  "leg-press-single":  [qWith(ILLU_POSES["leg-press"][0],{ l:[[56,44,70,58,72,50],[62,66,60,84,66,86]] }),   // zweites Bein ruht unten
                        qWith(ILLU_POSES["leg-press"][1],{ l:[[51,59,70,58,72,50],[50,66,48,84,54,86]] })],
  "hip-thrust":        [Q(null,[28,62],[46,80],[[60,66,66,86,73,88]],[[36,70,46,75]], gBench(6,32,66)+gScheibe(46,74,6)),
                        Q(null,[28,62],[50,60],[[64,62,66,86,73,88]],[[38,64,50,55]], gBench(6,32,66)+gScheibe(50,54,6))],
  "glute-kickback-cable": [Q(null,[58,24],[50,50],[[50,70,50,89,58,89],[48,69,46,87,52,89]],[[66,32,72,40]], gLinie("M76 18V89")+gRolle(74,84)+gPolster(46,86)),
                           Q(null,[58,24],[50,50],[[50,70,50,89,58,89],[34,62,22,74,20,68]],[[66,32,72,40]], gLinie("M76 18V89")+gRolle(74,84)+gPolster(22,73))],
  "seated-calf":       [Q(null,[40,33],[40,62],[[60,62,62,81,70,84]],[[46,44,54,56]], gSitz(28,50,64)+gLinie("M52 57H68M56 89V84H78V89")),
                        Q(null,[40,33],[40,62],[[60,62,62,77,70,84]],[[46,44,54,56]], gSitz(28,50,64)+gLinie("M52 57H68M56 89V84H78V89"))],
  "incline-chest-press": [Q(null,[36,34],[42,63],ST_BEINE,[[38,46,50,40]], gSitz(32,56,65)+gLinie("M28 26L36 65")+gGriff(50,40)),
                          Q(null,[36,34],[42,63],ST_BEINE,[[47,29,58,24]], gSitz(32,56,65)+gLinie("M28 26L36 65")+gGriff(58,24))],
  "cable-crossover":   [Q(null,[50,20],[50,52],ST_FRONT,[[38,16,28,8],[62,16,72,8]], gLinie("M12 0V89M88 0V89"), true),
                        Q(null,[50,20],[50,52],ST_FRONT,[[42,32,48,43],[58,32,52,43]], gLinie("M12 0V89M88 0V89"), true)],
  "incline-db-press":  [Q(null,[24,48],[46,70],[[60,66,64,86,71,88]],[[28,60,34,50]], ST_SCHRAEG+gDB(34,48)),
                        Q(null,[24,48],[46,70],[[60,66,64,86,71,88]],[[34,38,40,27]], ST_SCHRAEG+gDB(40,25))],
  "db-fly":            [stLiegen([27,55,28,43], gDB(28,41)), stLiegen([18,62,14,74], gDB(14,72))],
  "assisted-pullup":   [Q(null,[50,30],[50,58],[[46,70,40,78],[54,70,60,78]],[[40,21,34,6],[60,21,66,6]], gBar(6,24,76), true),
                        Q(null,[50,14],[50,42],[[46,54,40,62],[54,54,60,62]],[[34,20,42,6],[66,20,58,6]], gBar(6,24,76), true)],
  "close-grip-pulldown": [Q(null,[50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[46,22,46,10],[54,22,54,10]], gLinie("M36 66H64M50 66V89")+gHand(46,10,'<path class="ip" d="M42 10H58"/>'), true),
                          Q(null,[50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[42,44,46,33],[58,44,54,33]], gLinie("M36 66H64M50 66V89")+gHand(46,33,'<path class="ip" d="M42 33H58"/>'), true)],
  "t-bar-row":         [qWith(P_HG,{ x:gQuer(61,68,4)+gLinie("M18 88L40 76") }), qWith(P_HG,{ a:[[50,36,56,48]], x:gQuer(56,50,4)+gLinie("M18 88L40 76") })],
  "barbell-row":       [qWith(P_HG,{ x:gScheibe(61,70,7) }), qWith(P_HG,{ a:[[50,36,56,48]], x:gScheibe(56,52,7) })],
  "face-pull":         [Q(null,[50,20],[50,50],ST_STAND,[[62,20,74,17]], gLinie("M90 0V89")+gRolle(86,16)+gQuer(74,17,3)),
                        Q(null,[50,20],[50,50],ST_STAND,[[42,14,54,12]], gLinie("M90 0V89")+gRolle(86,16)+gQuer(54,12,3))],
  "straight-arm-pulldown": [Q(null,[54,22],[48,50],ST_STAND,[[62,14,70,6]], gLinie("M84 0V89")+gRolle(80,4)+gQuer(70,6,3)),
                            Q(null,[54,22],[48,50],ST_STAND,[[56,34,58,46]], gLinie("M84 0V89")+gRolle(80,4)+gQuer(58,46,3))],
  "lateral-raise":     [Q(null,[50,20],[50,52],ST_FRONT,[[44,32,42,44],[56,32,58,44]], gDB(42,46)+gDB(58,46), true),
                        Q(null,[50,20],[50,52],ST_FRONT,[[39,22,27,22],[61,22,73,22]], gDB(27,22)+gDB(73,22), true)],
  "shrugs":            [Q(null,[50,20],[50,50],ST_STAND,[[52,33,53,46]], gDB(53,48)), Q(null,[50,16],[50,50],ST_STAND,[[52,29,53,42]], gDB(53,44))],
  "hammer-curl":       [Q(null,[50,20],[50,50],ST_STAND,[[52,32,53,44]], gHand(53,44,'<path class="ip" d="M53 39v10"/>')),
                        Q(null,[50,20],[50,50],ST_STAND,[[52,32,60,23]], gHand(60,23,'<path class="ip" d="M60 18v10"/>'))],
  "barbell-curl":      [Q(null,[50,20],[50,50],ST_STAND,[[52,32,53,44]], gScheibe(54,45,5)), Q(null,[50,20],[50,50],ST_STAND,[[52,32,60,23]], gScheibe(61,22,5))],
  "overhead-cable-triceps": [qWith(ILLU_POSES["triceps-curls"][1], { x:gLinie("M22 0V89")+gRolle(26,14)+gQuer(46,23,3) }),
                             qWith(ILLU_POSES["triceps-curls"][0], { x:gLinie("M22 0V89")+gRolle(26,14)+gQuer(64,4,3) })],
  "triceps-machine":   [Q(null,[42,34],[42,63],ST_BEINE,[[34,44,42,52]], ST_SITZ+gGriff(42,52)), Q(null,[42,34],[42,63],ST_BEINE,[[43,46,44,58]], ST_SITZ+gGriff(44,58))],
  /* Gluteus-Maschine: vorgebeugt am Brustpolster, ein Fuß drückt die Platte nach hinten oben */
  "glute-machine":     [Q(null,[66,30],[48,50],[[50,70,50,89,58,89],[48,69,46,87,52,89]],[[68,40,74,44]], gLinie("M80 10V89M66 42L74 32")+gGriff(74,44)+gPlatte(47,84,4,-3)),
                        Q(null,[66,30],[48,50],[[50,70,50,89,58,89],[34,62,22,72,20,66]],[[68,40,74,44]], gLinie("M80 10V89M66 42L74 32")+gGriff(74,44)+gPlatte(21,69,4,-3))],
  /* Wadenpresse: in der Beinpresse, Beine fast gestreckt, nur die Fußspitzen drücken die Platte */
  "calf-press":        [Q(null,[18,36],[32,62],[[51,58,69,56,71,47]],[[24,46,32,54]], gLinie("M6 72H66")+gPlatte(71,47,1,-8)),
                        Q(null,[18,36],[32,62],[[51,58,69,56,76,52]],[[24,46,32,54]], gLinie("M6 72H66")+gPlatte(76,52,1,-8))],
  /* Beinbeuger liegend: bäuchlings auf der Bank, Fersen ziehen das Polster zum Po */
  "lying-leg-curl":    [Q(null,[30,63],[54,64],[[70,65,86,66,89,72]],[[22,70,18,76]], gBench(16,72,70)+gPolster(86,61)+gGriff(18,76)),
                        Q(null,[30,63],[54,64],[[70,65,62,48,56,46]],[[22,70,18,76]], gBench(16,72,70)+gPolster(64,44)+gGriff(18,76))],
  /* Rotary Torso (von vorn): sitzend, Arme am Polster, der Oberkörper dreht von einer Seite zur anderen */
  "rotary-torso":      [Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[42,40,34,45],[58,40,38,47]], gLinie("M36 62H64M50 62V89")+gQuer(36,46,5), true),
                        Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[42,40,62,47],[58,40,66,45]], gLinie("M36 62H64M50 62V89")+gQuer(64,46,5), true)],
  /* Rückenstrecker-Maschine: sitzend, Polster am oberen Rücken, aus der Beugung aufrichten */
  "back-extension-machine": [Q(null,[56,40],[42,63],ST_BEINE,[[56,50,58,46]], gSitz(30,56,65)+gHand(58,46,'<circle class="ipf" cx="48" cy="35" r="4"/>')),
                             Q(null,[37,35],[42,63],ST_BEINE,[[40,46,43,43]], gSitz(30,56,65)+gHand(43,43,'<circle class="ipf" cx="33" cy="32" r="4"/>'))],
  /* Trizeps-Extension (Maschine): Oberarme liegen auf dem Polster, die Unterarme strecken nach vorn unten */
  "triceps-extension-machine": [Q(null,[42,34],[42,63],ST_BEINE,[[56,46,56,33]], ST_SITZ+gLinie("M50 50L63 50")+gGriff(56,33)),
                                Q(null,[42,34],[42,63],ST_BEINE,[[56,46,69,53]], ST_SITZ+gLinie("M50 50L63 50")+gGriff(69,53))],
  /* Seitheber-Maschine (von vorn): sitzend, Polster an den Oberarmen, Arme seitlich bis Schulterhöhe */
  "lateral-raise-machine": [Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[42,41,40,52],[58,41,60,52]], gLinie("M36 62H64M50 62V89")+gScheibe(41,46,3)+gScheibe(59,46,3), true),
                            Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[38,35,28,33],[62,35,72,33]], gLinie("M36 62H64M50 62V89")+gScheibe(33,34,3)+gScheibe(67,34,3), true)],
  /* Seitheben am Kabel (von vorn): Zug unten auf der anderen Seite, ein Arm hebt seitlich */
  "cable-lateral-raise": [Q(null,[50,20],[50,52],ST_FRONT,[[58,32,56,46],[44,32,42,44]], gLinie("M16 8V89")+gRolle(20,84)+gGriff(56,46), true),
                          Q(null,[50,20],[50,52],ST_FRONT,[[63,24,75,22],[44,32,42,44]], gLinie("M16 8V89")+gRolle(20,84)+gGriff(75,22), true)],
  "cable-woodchop":    [Q(null,[50,20],[50,52],ST_FRONT,[[40,14,32,6],[44,16,34,7]], gLinie("M12 0V89")+gQuer(33,6,3), true),
                        Q(null,[50,20],[50,52],ST_FRONT,[[58,32,66,42],[56,34,65,44]], gLinie("M12 0V89")+gQuer(66,43,3), true)],
  "captains-chair":    [Q(null,[48,30],[48,58],[[49,74,49,87,55,88]],[[56,40,64,34]], gLinie("M42 18V62M44 40H66M40 62V89")),
                        Q(null,[48,30],[48,58],[[64,50,64,64,70,64]],[[56,40,64,34]], gLinie("M42 18V62M44 40H66M40 62V89"))],
  "barbell-overhead-press": [qWith(P_STUP,{ a:[[58,40,57,30]], x:gScheibe(57,28,6) }), qWith(P_STUP,{ a:[[54,16,53,5]], x:gScheibe(53,4,6) })],
  "barbell-rdl":       [qWith(P_ST,{ x:gScheibe(53,50,7) }), qWith(P_HG,{ x:gScheibe(61,70,7) })],
  /* Multipresse: wie Bankdrücken, die Stange läuft in einer Schiene */
  "smith-bench-press": [stLiegen([29,56,30,44], gLinie("M30 12V60")+gScheibe(30,42,7)), stLiegen([22,77,30,65], gLinie("M30 12V60")+gScheibe(30,62,7))],
  /* Dip-Maschine: kniend auf dem Polster, das Gegengewicht schiebt mit */
  "assisted-dip":      [Q(null,[52,24],[52,52],[[50,68,42,80,44,84]],[[54,37,56,50]], G_PB+gPolster(49,72)),
                        Q(null,[54,38],[52,64],[[50,76,40,84,42,86]],[[44,40,56,50]], G_PB+gPolster(49,80))],
  /* Rudern von oben: Brust am Polster, Griffe vorn oben, Ellbogen ziehen nach unten hinten */
  "high-row-machine":  [Q(null,[42,34],[42,63],ST_BEINE,[[53,29,63,21]], gSitz(30,54,65)+gLinie("M50 36V54M76 4V89")+gGriff(63,21)),
                        Q(null,[42,34],[42,63],ST_BEINE,[[35,51,46,43]], gSitz(30,54,65)+gLinie("M50 36V54M76 4V89")+gGriff(46,43))],
  /* Kabel-Crunch: kniend vor dem Turm, Seil an der Stirn, der Oberkörper rollt nach vorn unten ein */
  "cable-crunch":      [Q(null,[52,34],[49,62],[[50,87,30,88,24,89]],[[62,40,56,30]], gLinie("M90 0V89")+gRolle(86,6)+gGriff(56,30)),
                        Q(null,[75,72],[49,62],[[50,87,30,88,24,89]],[[70,81,80,73]], gLinie("M90 0V89")+gRolle(86,6)+gGriff(80,73))],
  /* Pull-Through: mit dem Rücken zum Kabel, Seil zwischen den Beinen, aus der Hüfte aufrichten */
  "cable-pull-through": [qWith(P_HG,{ a:[[58,54,49,63]], x:gLinie("M8 30V89")+gRolle(12,84)+gGriff(49,63) }),
                         qWith(P_ST,{ a:[[51.5,37.4,52,50]], x:gLinie("M8 30V89")+gRolle(12,84)+gGriff(52,50) })]
});
/* Butterfly und Butterfly reverse von vorn: seitlich musste der Arm in der Mitte durch die Tiefe - die Figur schwang ihn dabei über den Kopf */
ILLU_POSES["butterfly"] = [
  Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[38,36,37,24],[62,36,63,24]], gLinie("M36 62H64M50 62V89")+gHand(37,24,'<path class="ip" d="M37 22V36"/>')+gHand(63,24,'<path class="ip" d="M63 22V36"/>'), true),
  Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[45,40,47,28],[55,40,53,28]], gLinie("M36 62H64M50 62V89")+gHand(47,28,'<path class="ip" d="M47 26V40"/>')+gHand(53,28,'<path class="ip" d="M53 26V40"/>'), true)];
ILLU_POSES["reverse-butterfly"] = [
  Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[44,39,47,45],[56,39,53,45]], gLinie("M36 62H64M50 62V89")+gGriff(47,45)+gGriff(53,45), true),
  Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[38,35,26,35],[62,35,74,35]], gLinie("M36 62H64M50 62V89")+gGriff(26,35)+gGriff(74,35), true)];
/* Gruppen im Reiter „Studio“ */
var STUDIO_GRUPPEN = [
  { id:"beine",   de:"Beine & Po", en:"Legs & glutes", ids:"leg-press leg-press-45 leg-press-single hack-squat smith-squat leg-extension leg-curl adductor-machine abductor-machine hip-thrust glute-kickback-cable calf-machine seated-calf glute-machine calf-press lying-leg-curl cable-pull-through barbell-squat barbell-deadlift barbell-rdl" },
  { id:"brust",   de:"Brust",   en:"Chest",  ids:"chest-press-machine incline-chest-press smith-bench-press butterfly cable-crossover assisted-dip incline-db-press db-bench-press db-fly pullover bench-press" },
  { id:"ruecken", de:"Rücken",  en:"Back",   ids:"lat-pulldown close-grip-pulldown assisted-pullup row-machine high-row-machine cable-row t-bar-row face-pull straight-arm-pulldown reverse-butterfly back-extension back-extension-machine barbell-row" },
  { id:"schulter",de:"Schultern", en:"Shoulders", ids:"shoulder-press-machine lateral-raise-machine lateral-raise cable-lateral-raise shrugs barbell-overhead-press" },
  { id:"arme",    de:"Arme",    en:"Arms",   ids:"biceps-machine cable-curl hammer-curl barbell-curl triceps-pushdown overhead-cable-triceps triceps-machine triceps-extension-machine skull-crusher" },
  { id:"bauch",   de:"Bauch",   en:"Abs",    ids:"ab-crunch-machine cable-crunch rotary-torso captains-chair cable-woodchop pallof-press" }
];
STUDIO_GRUPPEN.forEach(function(g){ g.ids.split(" ").forEach(function(id){
  (ILLU_POSES[id] || []).forEach(function(q){ if(q && q.x) q.x = q.x.replace(/class="(ip|ipf)( gp)?"/g, 'class="$1$2 gm"'); });
}); });
/* Ziel und Steigerung je Übung (sonst 3 × 12, +2,5 kg) */
var STUDIO_ZIEL = { "bench-press":[3,8,2.5], "barbell-squat":[3,8,5], "barbell-deadlift":[3,6,5],
  "leg-press":[3,12,5], "leg-press-45":[3,12,5], "calf-machine":[3,15,5], "back-extension":[3,15,2.5], "ab-crunch-machine":[3,15,2.5], "cable-crunch":[3,15,2.5], "smith-bench-press":[3,8,2.5] };
/* Sprossen-Klimmzug: je eine Hand an zwei Sprossen der Hangelleiter, der Kopf kommt zwischen den Sprossen hoch */
var SP_LEITER = '<path class="ip" d="M18 2H82"/><circle class="ip" cx="40" cy="5" r="3.4"/><circle class="ip" cx="60" cy="5" r="3.4"/>';
ILLU_POSES["rung-pull-ups"] = [
  Q(null,[50,31],[50,59],[[48,73,48,85],[52,73,52,85]],[[43,20,40,9],[57,20,60,9]], SP_LEITER, true),
  Q(null,[50,16],[50,44],[[48,58,48,70],[52,58,52,70]],[[37,19,40,9],[63,19,60,9]], SP_LEITER, true)
];
var V_BANK = '<path class="ip" d="M42 22V72M58 22V72"/>';   // Bank von oben
var ILLU_VIEW2 = {
  "pull-ups":          { typ:"side", haupt:"front", p:[PS_HANG, PS_TOP] },
  "scapular-pull-ups": { typ:"side", haupt:"front", p:[PS_HANG, SS_AKT] },
  "commando-pull-ups": { typ:"side", haupt:"front", p:[CS_H, CS_P] },
  "russian-twists":   { typ:"front", p:[RT_FL, RT_FR], seq:{ k:[RT_FL, RT_FLC, RT_FC, RT_FRC, RT_FR, RT_FRC, RT_FC, RT_FLC],
                         t:[[.14,.2,"i"],[0,.18,"l"],[0,.18,"l"],[0,.2,"o"],[.14,.2,"i"],[0,.18,"l"],[0,.18,"l"],[0,.2,"o"]] } },
  "archer-push-ups":  { typ:"top",   p:[V_ARCH, Q(null,[60,33],[55,64],[[52,79,50,94],[57,79,56,94]],[[70,46,78,38],[41,37,22,38]],"",true)] },
  "shoulder-press":   { typ:"front", p:[Q(null,[50,28],[50,58],[[46,74,45,89,39,89],[54,74,55,89,61,89]],[[37,36,37,24],[63,36,63,24]], gDB(37,23)+gDB(63,23), true),
                                        Q(null,[50,28],[50,58],[[46,74,45,89,39,89],[54,74,55,89,61,89]],[[40,17,42,5],[60,17,58,5]], gDB(42,5)+gDB(58,5), true)] },
  "reverse-snow-angels": { typ:"top", p:[V_SNOW, qWith(V_SNOW,{ a:[[38,14,44,4],[62,14,56,4]] })] },
  /* Liegestütz-Varianten von oben: der Unterschied liegt in Handstellung und Ellbogen */
  "push-ups":         { typ:"top", p:[qWith(V_ARCH,{ a:[[57,38.5,64,40],[43,38.5,36,40]] }), qWith(V_ARCH,{ a:[[62,46,64,40],[38,46,36,40]] })] },
  "close-grip-push-ups": { typ:"top", p:[qWith(V_ARCH,{ a:[[53,38.5,56,40],[47,38.5,44,40]] }), qWith(V_ARCH,{ a:[[57,50,56,40],[43,50,44,40]] })] },
  "diamond-push-ups": { typ:"top", p:[qWith(V_ARCH,{ a:[[51,39.5,52,42],[49,39.5,48,42]] }), qWith(V_ARCH,{ a:[[62,44,52,42],[38,44,48,42]] })] },
  /* Fliegende und Überzug von oben: seitlich weit auf gegen gerade über den Kopf */
  "db-fly":           { typ:"top", p:[qWith(V_ARCH,{ a:[[54,38,52,42],[46,38,48,42]], x:V_BANK+gDB(52,42)+gDB(48,42) }),
                                      qWith(V_ARCH,{ a:[[62,38,74,40],[38,38,26,40]], x:V_BANK+gDB(74,40)+gDB(26,40) })] },
  "pullover":         { typ:"top", p:[qWith(V_ARCH,{ a:[[54,38,51,42],[46,38,49,42]], x:V_BANK+gDB(50,43) }),
                                      qWith(V_ARCH,{ a:[[54,24,52,12],[46,24,48,12]], x:V_BANK+gDB(50,10) })] },
  "spinal-twist":     { typ:"top",   p:[Q([44,15],[50,24],[50,56],[[66,58,62,74],[68,66,64,82]],[[36,27,20,27],[64,27,80,27]],"",true), null] }
};

/* Ausführliche Anleitung je Übung: [Deutsch, Englisch], Schritte mit | getrennt */
var EX_INFO = {
  "glute-machine":["Mit der Brust ans Polster lehnen, Griffe fassen, einen Fuß an die Platte setzen.|Das Bein aus der Hüfte nach hinten oben drücken, bis es gestreckt ist.|Kontrolliert zurück, dann die Seite wechseln.","Lean your chest on the pad, hold the handles, place one foot on the plate.|Press the leg back and up from your hip until it is straight.|Return under control, then switch sides."],
  "calf-press":["In die Beinpresse setzen, nur die Fußballen unten an die Platte.|Beine fast strecken und die Platte mit den Zehen wegdrücken.|Langsam zurück, bis die Waden gedehnt sind.","Sit in the leg press with only the balls of your feet on the lower edge of the plate.|Legs nearly straight, push the plate away with your toes.|Return slowly until your calves are stretched."],
  "lying-leg-curl":["Bäuchlings auf die Bank legen, das Polster liegt knapp über den Fersen, Griffe fassen.|Die Fersen zum Po ziehen.|Langsam wieder strecken, ohne das Gewicht abzusetzen.","Lie face down, the pad just above your heels, hold the handles.|Pull your heels towards your glutes.|Lower slowly without letting the weight rest at the bottom."],
  "rotary-torso":["Aufrecht setzen, Beine fixieren, Arme ans Polster legen.|Den Oberkörper langsam zur Seite drehen, das Becken bleibt ruhig.|Kontrolliert zurück, nach dem Satz die Seite wechseln.","Sit tall, lock your legs, place your arms on the pad.|Rotate your upper body slowly to the side, hips stay still.|Return under control, switch sides after the set."],
  "back-extension-machine":["Hinsetzen, das Polster liegt am oberen Rücken, Füße fest.|Aus der Hüfte aufrichten, bis der Oberkörper aufrecht ist.|Langsam wieder nach vorn beugen.","Sit down with the pad on your upper back, feet planted.|Extend from your hips until your upper body is upright.|Lean forward again slowly."],
  "triceps-extension-machine":["Hinsetzen, die Oberarme auf das Polster legen, Griffe fassen.|Die Arme nach vorn unten strecken.|Langsam beugen, die Oberarme bleiben liegen.","Sit down, rest your upper arms on the pad, hold the handles.|Extend your arms forward and down.|Bend slowly, upper arms stay on the pad."],
  "lateral-raise-machine":["Hinsetzen, die Polster liegen außen an den Oberarmen.|Die Arme seitlich bis Schulterhöhe heben.|Langsam senken.","Sit down with the pads on the outside of your upper arms.|Raise your arms to the side up to shoulder height.|Lower slowly."],
  "smith-bench-press":["Bank unter die Multipresse legen, Sicherungshaken knapp über der Brust einstellen, die Stange liegt über der unteren Brust.|Stange aus der Sicherung drehen und kontrolliert zur Brust senken.|Zügig hochdrücken und am Ende wieder einhaken. Im Notfall die Handgelenke drehen: die Stange hakt ein.","Lie on the bench under the Smith machine, set the safety stops just above your chest, bar above your lower chest.|Unhook the bar and lower it with control to your chest.|Press up at a steady pace and hook it back at the end. In an emergency rotate your wrists: the bar hooks in."],
  "assisted-dip":["Gegengewicht einstellen, auf das Kniepolster knien, Griffe fassen.|Absenken, bis die Oberarme etwa waagerecht sind.|Hochdrücken, bis die Arme gestreckt sind.","Set the counterweight, kneel on the pad, hold the handles.|Lower until your upper arms are about horizontal.|Press up until your arms are straight."],
  "high-row-machine":["Sitz so einstellen, dass die Griffe vorn über Kopfhöhe sind, Brust ans Polster.|Griffe nach unten hinten ziehen, bis die Hände neben der Brust sind.|Langsam zurück, die Arme strecken.","Set the seat so the handles are in front above head height, chest on the pad.|Pull the handles down and back until your hands are beside your chest.|Return slowly, straighten your arms."],
  "cable-crunch":["Vor dem Kabelturm knien, das Seil oben einhängen und an die Stirn halten.|Den Oberkörper aus dem Bauch nach vorn unten einrollen, Hüfte bleibt stehen.|Langsam wieder aufrichten.","Kneel in front of the cable tower, hook the rope up high and hold it at your forehead.|Curl your upper body forward and down from your abs, hips stay put.|Rise back up slowly."],
  "cable-pull-through":["Seil unten einhängen, mit dem Rücken zum Turm stellen, das Seil zwischen den Beinen fassen.|Aus der Hüfte nach vorn beugen, Knie leicht gebeugt, Rücken gerade.|Hüfte nach vorn schieben und oben das Gesäß anspannen.","Hook the rope low, stand with your back to the tower, hold the rope between your legs.|Hinge forward at the hips, knees slightly bent, back straight.|Drive your hips forward and squeeze your glutes at the top."],
  "cable-lateral-raise":["Seitlich zum Kabelzug stellen, den unteren Griff mit der entfernten Hand fassen.|Den Arm leicht gebeugt seitlich bis Schulterhöhe heben.|Langsam senken, nach dem Satz die Seite wechseln.","Stand side-on to the cable, hold the low handle with the far hand.|Raise the slightly bent arm to the side up to shoulder height.|Lower slowly, switch sides after the set."],
  "rung-pull-ups":["Unter die Hangelleiter stellen und mit je einer Hand zwei hintereinanderliegende Sprossen greifen, Handflächen zueinander.|Schulterblätter nach unten ziehen und den Kopf zwischen den Sprossen hochziehen, bis das Kinn über den Sprossen ist.|Kontrolliert in den gestreckten Hang absenken.","Stand under the monkey bars and grip two rungs one behind the other, one hand each, palms facing.|Pull your shoulder blades down and pull your head up between the rungs until your chin clears them.|Lower with control to a full hang."],
  "hack-squat":["Rücken ans Polster, Schultern unter die Polster, Füße schulterbreit auf der Platte.|Sicherung lösen und kontrolliert in die Hocke gehen, bis die Oberschenkel etwa waagerecht sind.|Über die ganze Fußsohle hochdrücken, am Ende die Sicherung wieder einrasten.","Back on the pad, shoulders under the pads, feet shoulder-width on the plate.|Release the safety and squat down with control until your thighs are about horizontal.|Drive up through your whole foot, lock the safety again at the end."],
  "smith-squat":["Sicherungshaken knapp unterhalb der tiefsten Position einstellen. Unter die Stange stellen, Stange auf den oberen Rücken, Füße etwas nach vorn.|Stange aus den Haken drehen und in die Hocke gehen.|Hochdrücken und am Ende wieder einhaken. Im Notfall die Handgelenke drehen: die Stange hakt ein.","Set the safety stops just below your lowest position. Step under the bar, rest it on your upper back, feet slightly forward.|Unhook the bar and squat down.|Drive up and hook it back at the end. In an emergency rotate your wrists: the bar hooks in."],
  "leg-press-single":["Wie an der Beinpresse hinsetzen, einen Fuß mittig auf die Platte, der andere Fuß ruht auf dem Boden oder der Trittfläche daneben.|Mit einem Bein kontrolliert beugen.|Wegdrücken, Seite nach dem Satz wechseln.","Sit as at the leg press, one foot in the middle of the plate, the other foot resting on the floor or footrest beside it.|Bend with one leg under control.|Press away, switch sides after the set."],
  "hip-thrust":["Den oberen Rücken an die Bank lehnen (Bank steht fest an der Wand), Stange mit Polster in den Hüftbeugen, Füße hüftbreit.|Hüfte nach oben drücken, bis Knie, Hüfte und Schultern eine Linie bilden.|Oben kurz halten, langsam senken. Einsteiger beginnen ohne Gewicht oder mit leichter Stange.","Rest your upper back on the bench (bench fixed against a wall), padded bar in your hip crease, feet hip-width.|Drive your hips up until knees, hips and shoulders form a line.|Pause at the top and lower slowly. Beginners start without weight or with a light bar."],
  "glute-kickback-cable":["Manschette am Fuß, vor den unteren Kabelzug stellen und am Rahmen festhalten.|Das Bein gestreckt nach hinten oben führen.|Langsam zurück, Seite wechseln.", "Strap on the ankle cuff, face the low pulley and hold the frame.|Move your straight leg back and up.|Return slowly, switch sides."],
  "seated-calf":["Hinsetzen, Polster auf die Oberschenkel knapp über den Knien, Fußballen auf die Stufe.|Fersen langsam absenken.|Auf die Zehenspitzen hochdrücken und kurz halten.", "Sit with the pad on your thighs just above the knees, balls of your feet on the step.|Lower your heels slowly.|Rise onto your toes and hold briefly."],
  "incline-chest-press":["Sitz so einstellen, dass die Griffe auf Höhe der oberen Brust sind.|Schräg nach oben drücken, bis die Arme fast gestreckt sind.|Langsam zurück.", "Set the seat so the handles are at upper-chest height.|Press up and forward until your arms are almost straight.|Return slowly."],
  "cable-crossover":["Zwischen die oberen Kabelzüge stellen, je einen Griff greifen, ein Schritt nach vorn.|Arme leicht gebeugt im Bogen vor dem Körper nach unten zusammenführen.|Langsam zurück, bis die Brust gedehnt ist.", "Stand between the high pulleys, one handle in each hand, step forward.|Bring your slightly bent arms together in an arc in front of your body.|Return slowly until your chest is stretched."],
  "incline-db-press":["Bank auf etwa 30° stellen. Die Hanteln zuerst auf die Oberschenkel legen und mit Schwung der Knie in die Ausgangsposition auf Brusthöhe bringen.|Nach oben drücken, bis die Arme fast gestreckt sind.|Langsam zur oberen Brust senken. Zum Absetzen die Hanteln seitlich zu den Oberschenkeln führen, nicht fallen lassen; bei schweren Hanteln einen Spotter bitten.","Set the bench to about 30°. Rest the dumbbells on your thighs first and kick them up to chest height with your knees.|Press up until your arms are almost straight.|Lower slowly to your upper chest. To finish, bring the dumbbells back to your thighs, don't drop them; ask a spotter for heavy dumbbells."],
  "db-fly":["Auf die Bank legen, Kurzhanteln über der Brust, Handflächen zueinander.|Arme leicht gebeugt im Bogen seitlich senken.|Im gleichen Bogen wieder zusammenführen.", "Lie on the bench, dumbbells over your chest, palms facing.|Lower your slightly bent arms out to the sides in an arc.|Bring them back together along the same arc."],
  "assisted-pullup":["Gegengewicht wählen, auf das Polster knien, Griffe etwas breiter als schulterbreit.|Brust zur Stange ziehen, Ellbogen nach unten.|Kontrolliert strecken.", "Pick the counterweight, kneel on the pad, grip a bit wider than shoulder-width.|Pull your chest towards the bar, elbows down.|Lower with control."],
  "close-grip-pulldown":["Mit engem Griff (V-Griff oder eng an der Stange) hinsetzen.|Griff zur Brust ziehen, Ellbogen am Körper vorbei nach unten.|Langsam hoch, bis die Arme gestreckt sind.", "Sit with a narrow grip (V-handle or close on the bar).|Pull to your chest, elbows down past your sides.|Let it up slowly until your arms are straight."],
  "t-bar-row":["Über die Stange stellen, aus der Hüfte vorbeugen, Rücken gerade.|Griff zur unteren Brust ziehen, Schulterblätter zusammen.|Langsam senken.", "Straddle the bar, hinge at the hips, flat back.|Pull the handle to your lower chest, squeeze your shoulder blades.|Lower slowly."],
  "barbell-row":["Langhantel schulterbreit greifen, aus der Hüfte etwa 45° vorbeugen.|Stange zum Bauchnabel ziehen, Ellbogen nah am Körper.|Kontrolliert senken.", "Grip the barbell shoulder-width, hinge to about 45°.|Pull the bar to your belly button, elbows close.|Lower with control."],
  "face-pull":["Seil am oberen Kabelzug auf Kopfhöhe, mit beiden Händen greifen.|Seil zur Stirn ziehen, Ellbogen hoch und nach außen, Hände auseinander.|Langsam strecken.", "Rope on the pulley at head height, grip with both hands.|Pull towards your forehead, elbows high and wide, hands apart.|Extend slowly."],
  "straight-arm-pulldown":["Vor den oberen Kabelzug stellen, Stange oder Seil mit fast gestreckten Armen.|Die Arme im Bogen nach unten zu den Oberschenkeln ziehen.|Langsam wieder nach oben.", "Face the high pulley, bar or rope with almost straight arms.|Pull your arms down in an arc to your thighs.|Let them rise slowly."],
  "lateral-raise":["Aufrecht stehen, Kurzhanteln seitlich.|Arme leicht gebeugt seitlich bis auf Schulterhöhe heben.|Langsam senken.","Stand tall, dumbbells at your sides.|Raise your slightly bent arms out to shoulder height.|Lower slowly."],
  "shrugs":["Aufrecht stehen, Kurzhanteln oder Langhantel mit gestreckten Armen.|Schultern gerade Richtung Ohren ziehen.|Oben kurz halten, langsam senken.", "Stand tall, dumbbells or barbell with straight arms.|Pull your shoulders straight up towards your ears.|Hold briefly, lower slowly."],
  "hammer-curl":["Aufrecht stehen, Kurzhanteln im Hammergriff (Daumen nach vorn).|Unterarme zu den Schultern beugen.|Langsam senken.", "Stand tall, dumbbells in a hammer grip (thumbs forward).|Curl your forearms towards your shoulders.|Lower slowly."],
  "barbell-curl":["Stange schulterbreit im Untergriff, Arme gestreckt.|Stange zu den Schultern beugen.|Langsam wieder strecken.", "Hold the bar shoulder-width with an underhand grip, arms straight.|Curl it towards your shoulders.|Lower slowly."],
  "overhead-cable-triceps":["Mit dem Rücken zum Kabelzug, Seil über dem Kopf, Schrittstellung.|Unterarme nach vorn oben strecken.|Langsam zurück hinter den Kopf.", "Back to the pulley, rope over your head, split stance.|Extend your forearms forward and up.|Return slowly behind your head."],
  "triceps-machine":["Hinsetzen, Griffe seitlich neben dem Körper greifen.|Griffe nach unten drücken, bis die Arme gestreckt sind.|Langsam zurück.", "Sit down and grip the handles at your sides.|Press down until your arms are straight.|Return slowly."],
  "cable-woodchop":["Seitlich zum oberen Kabelzug stellen, Griff mit beiden Händen.|Diagonal nach unten zur anderen Seite ziehen, der Oberkörper dreht mit.|Langsam zurück, Seite wechseln.", "Stand side-on to the high pulley, handle in both hands.|Pull diagonally down across your body, rotating your torso.|Return slowly, switch sides."],
  "captains-chair":["Unterarme auf die Polster, Rücken an die Lehne, Beine hängen.|Knie zur Brust ziehen, das Becken rollt leicht ein.|Langsam senken, ohne zu schwingen.", "Forearms on the pads, back against the pad, legs hanging.|Pull your knees to your chest, pelvis curls slightly.|Lower slowly without swinging."],
  "barbell-overhead-press":["Stange aus der Ablage (etwa auf Brusthöhe) auf die Schultern nehmen, Griff etwas breiter als schulterbreit, Gesäß und Rumpf fest.|Senkrecht über den Kopf drücken, der Kopf geht am Ende leicht nach vorn.|Kontrolliert zurück auf die Schultern; wenn es nicht mehr geht, die Stange dort absetzen und zurück in die Ablage legen.","Take the bar from the rack (about chest height) onto your shoulders, grip a bit wider than shoulder-width, glutes and core braced.|Press straight overhead, head moves slightly through at the top.|Lower with control to your shoulders; if you can't finish, set the bar down there and return it to the rack."],
  "barbell-rdl":["Aufrecht mit der Langhantel vor den Oberschenkeln, Knie leicht gebeugt.|Hüfte nach hinten schieben, Stange am Bein entlang senken, so tief, wie der Rücken gerade bleibt (meist knapp unter die Knie).|Über die Hüfte aufrichten, Gesäß anspannen.","Stand tall with the barbell in front of your thighs, knees soft.|Push your hips back and slide the bar down your legs as far as your back stays flat (usually just below your knees).|Rise by driving your hips forward, squeeze your glutes."],
  "leg-press":["Hinsetzen, Rücken ans Polster, Füße hüftbreit mittig auf die Platte.|Sicherung lösen und die Knie kontrolliert Richtung Brust beugen, bis etwa 90°.|Über die ganze Fußsohle wegdrücken, oben die Knie nicht ganz durchstrecken. Nach dem Satz die Sicherung wieder einrasten, bevor du aufstehst.","Sit with your back on the pad, feet hip-width in the middle of the plate.|Release the safety and bend your knees towards your chest to about 90°.|Press through your whole foot; don't fully lock your knees at the top. After the set lock the safety again before you get up."],
  "leg-press-45":["In den Schlitten legen, Rücken und Po fest am Polster, Füße schulterbreit auf der Platte.|Sicherung lösen und den Schlitten langsam absenken, bis die Knie etwa 90° gebeugt sind.|Kraftvoll hochdrücken, oben die Knie leicht gebeugt lassen und wieder sichern.", "Lie in the sled, back and hips on the pad, feet shoulder-width on the plate.|Release the safety and lower the sled slowly until your knees are about 90°.|Press up powerfully, keep your knees soft at the top and lock the safety again."],
  "leg-extension":["Sitz so einstellen, dass die Knie auf der Drehachse liegen, Polster vorn über den Knöcheln.|Beine gleichmäßig strecken, oben kurz halten.|Langsam zurück, das Gewicht nicht absetzen.", "Adjust the seat so your knees line up with the pivot, pad in front of your ankles.|Straighten your legs evenly and pause at the top.|Lower slowly without letting the weight rest."],
  "leg-curl":["Hinsetzen, Knie auf der Drehachse, Beinpolster hinten über den Fersen, Oberschenkelpolster fest.|Fersen unter den Sitz ziehen, so weit es geht.|Langsam zurück in die Streckung.", "Sit with your knees on the pivot, lower pad behind your heels, thigh pad tight.|Pull your heels under the seat as far as you can.|Return slowly to the start."],
  "adductor-machine":["Hinsetzen, Beine gespreizt gegen die Innenpolster, Rücken ans Polster.|Beine kontrolliert zusammendrücken.|Langsam wieder öffnen, nur so weit, wie es angenehm dehnt.", "Sit with your legs spread against the inner pads, back on the pad.|Squeeze your legs together with control.|Open slowly, only as far as feels like a comfortable stretch."],
  "abductor-machine":["Hinsetzen, Beine geschlossen, Außenpolster an den Knien.|Beine gegen den Widerstand nach außen drücken.|Langsam wieder schließen, ohne abzusetzen.", "Sit with your legs together, outer pads at your knees.|Push your legs outwards against the resistance.|Close slowly without letting the weight rest."],
  "calf-machine":["Schulterpolster auflegen, Fußballen auf die Kante, Fersen frei.|Fersen langsam unter die Kante senken.|Auf die Zehenspitzen hochdrücken und oben kurz halten.", "Get under the shoulder pads, balls of your feet on the edge, heels free.|Lower your heels slowly below the edge.|Rise onto your toes and pause at the top."],
  "chest-press-machine":["Sitz so einstellen, dass die Griffe auf Brusthöhe sind, Rücken ans Polster.|Griffe nach vorn drücken, bis die Arme fast gestreckt sind.|Langsam zurück, bis die Hände neben der Brust sind.", "Set the seat so the handles are at chest height, back on the pad.|Press the handles forward until your arms are almost straight.|Return slowly until your hands are next to your chest."],
  "butterfly":["Hinsetzen, Rücken ans Polster, Unterarme oder Hände an die Polster, Ellbogen etwa auf Schulterhöhe.|Arme vor der Brust zusammenführen.|Langsam öffnen, bis die Brust angenehm gedehnt ist.", "Sit with your back on the pad, forearms or hands on the pads, elbows about shoulder height.|Bring your arms together in front of your chest.|Open slowly until you feel a comfortable stretch in your chest."],
  "pullover":["Mit dem Rücken auf die Bank legen, eine Kurzhantel mit beiden Händen unter der oberen Scheibe halten (Daumen umschließen) und über der Brust, nicht über dem Gesicht halten.|Die fast gestreckten Arme langsam hinter den Kopf senken.|Über den Kopf zurück bis über die Brust ziehen.","Lie on the bench and hold one dumbbell with both hands under the top plate (thumbs wrapped), over your chest, not over your face.|Lower your almost straight arms slowly behind your head.|Pull back over your head until above your chest."],
  "lat-pulldown":["Hinsetzen, Knie unter das Polster, Stange etwas breiter als schulterbreit greifen.|Brust raus und die Stange zur oberen Brust ziehen, Ellbogen nach unten.|Kontrolliert nach oben lassen, bis die Arme gestreckt sind.", "Sit with your knees under the pad, grip the bar a bit wider than shoulder-width.|Chest up, pull the bar to your upper chest, elbows down.|Let it rise with control until your arms are straight."],
  "row-machine":["Hinsetzen, Brust ans Polster, Griffe mit gestreckten Armen fassen.|Griffe zum Körper ziehen, Schulterblätter zusammen, Ellbogen nach hinten.|Langsam nach vorn zurück.", "Sit with your chest on the pad and hold the handles with straight arms.|Pull the handles to your body, squeeze your shoulder blades, elbows back.|Return forward slowly."],
  "cable-row":["Hinsetzen, Füße an die Platte, Knie leicht gebeugt, Griff mit gestreckten Armen.|Oberkörper aufrecht, Griff zum Bauchnabel ziehen, Schulterblätter zusammen.|Arme langsam wieder strecken, ohne nach vorn zu kippen.", "Sit with your feet on the plate, knees soft, handle held with straight arms.|Sit tall and pull the handle to your belly button, squeeze your shoulder blades.|Straighten your arms slowly without tipping forward."],
  "reverse-butterfly":["Mit der Brust zum Polster setzen, Griffe auf Schulterhöhe vor dir greifen.|Arme leicht gebeugt nach hinten öffnen, Schulterblätter zusammen.|Langsam wieder nach vorn führen.", "Sit facing the pad, grip the handles in front of you at shoulder height.|Open your slightly bent arms backwards, squeeze your shoulder blades.|Bring them forward again slowly."],
  "back-extension":["Hüfte ans Polster, Fersen unter die Rolle, Arme vor der Brust verschränkt.|Oberkörper mit geradem Rücken nach unten sinken lassen.|Wieder aufrichten, bis Körper und Beine eine Linie bilden.", "Hips on the pad, heels under the roller, arms crossed over your chest.|Lower your torso with a straight back.|Rise until your body and legs form a straight line."],
  "shoulder-press-machine":["Sitz so einstellen, dass die Griffe auf Schulterhöhe sind, Rücken ans Polster.|Griffe nach oben drücken, bis die Arme fast gestreckt sind.|Langsam zurück auf Schulterhöhe.", "Set the seat so the handles are at shoulder height, back on the pad.|Press up until your arms are almost straight.|Lower slowly back to shoulder height."],
  "biceps-machine":["Sitz so einstellen, dass die Oberarme ganz auf dem Polster liegen, Achseln an der Kante.|Griffe zu den Schultern beugen.|Langsam wieder strecken, ohne die Arme ganz durchzudrücken.", "Adjust the seat so your upper arms lie fully on the pad, armpits at the edge.|Curl the handles towards your shoulders.|Lower slowly without fully locking your arms."],
  "cable-curl":["Vor den unteren Kabelzug stellen, Griff im Untergriff, Arme gestreckt.|Unterarme beugen und den Griff zu den Schultern ziehen, Ellbogen bleiben am Körper.|Langsam wieder strecken.", "Stand facing the low pulley, underhand grip, arms straight.|Curl the handle to your shoulders, elbows stay at your sides.|Lower slowly."],
  "triceps-pushdown":["Vor den oberen Kabelzug stellen, Griff oder Seil fassen, Oberarme am Körper.|Unterarme nach unten strecken, bis die Arme gestreckt sind.|Langsam zurück, bis die Unterarme etwa waagerecht sind.", "Stand at the high pulley, hold the bar or rope, upper arms at your sides.|Push your forearms down until your arms are straight.|Return slowly until your forearms are about horizontal."],
  "skull-crusher":["Mit dem Rücken auf die Bank, SZ-Stange oder Kurzhanteln mit gestreckten Armen über der Brust.|Nur die Ellbogen beugen und das Gewicht langsam hinter den Kopf senken, nicht zur Stirn.|Über den Trizeps wieder nach oben strecken.","Lie on the bench, EZ bar or dumbbells held with straight arms over your chest.|Bend only your elbows and lower the weight slowly behind your head, not towards your forehead.|Extend back up with your triceps."],
  "ab-crunch-machine":["Hinsetzen, Füße fixieren, Griffe oder Polster an Schultern bzw. Brust.|Oberkörper aus dem Bauch nach vorn unten einrollen.|Langsam aufrichten, ohne das Gewicht abzusetzen.", "Sit down, fix your feet, hold the handles or pads at your shoulders or chest.|Curl your torso forward and down with your abs.|Rise slowly without letting the weight rest."],
  "bench-press":["Auf die Bank legen, Augen unter der Stange, Füße fest am Boden, Griff etwas breiter als schulterbreit, Daumen um die Stange. Sicherungsarme einstellen und die Scheiben mit Kragen sichern.|Stange aus der Ablage heben und kontrolliert zur unteren Brust senken.|Nach oben drücken, bis die Arme gestreckt sind. Schwere Sätze nur mit Sicherungsarmen oder Spotter; Einsteiger beginnen mit der leeren Stange.","Lie on the bench, eyes under the bar, feet planted, grip a bit wider than shoulder-width, thumbs around the bar. Set the safety arms and secure the plates with collars.|Unrack the bar and lower it with control to your lower chest.|Press up until your arms are straight. Heavy sets only with safety arms or a spotter; beginners start with the empty bar."],
  "barbell-squat":["Sicherungsstangen auf passende Höhe stellen. Stange auf den oberen Rücken (nicht auf den Nacken) legen, aus der Ablage heben, schulterbreit stehen, Fußspitzen leicht nach außen.|Rumpf anspannen, Hüfte nach hinten und unten, Knie in Fußrichtung, Brust aufrecht, so tief, wie der Rücken gerade bleibt und die Fersen unten sind (etwa bis parallel).|Über die ganze Fußsohle hochdrücken. Wenn es nicht mehr geht: Stange kontrolliert auf den Sicherungsstangen absetzen.","Set the safety bars to a suitable height. Rest the bar on your upper back (not your neck), unrack it, stand shoulder-width with toes turned out slightly.|Brace your core, sit your hips back and down, knees over your toes, chest up, as deep as your back stays flat and your heels stay down (about parallel).|Drive up through your whole foot. If you can't finish a rep, lower the bar onto the safety bars with control."],
  "barbell-deadlift":["Füße hüftbreit unter der Stange, Stange über der Fußmitte, schulterbreit greifen. Rumpf anspannen und die Spannung aufbauen, bevor die Stange sich löst.|Rücken lang und gerade, Stange nah am Bein hochziehen, bis du aufrecht stehst – nicht ins Hohlkreuz überstrecken.|Kontrolliert über die Hüfte absetzen, nicht fallen lassen. Einsteiger beginnen mit leichtem Gewicht.","Feet hip-width under the bar, bar over mid-foot, grip shoulder-width. Brace your core and build tension before the bar leaves the floor.|Long, flat back, pull the bar up close to your legs until you stand tall – don't lean back into an arch.|Lower with control by hinging at the hips, don't drop it. Beginners start light."],
  "jump-lunges":["In den Ausfallschritt gehen, beide Knie etwa 90°, Oberkörper aufrecht.|Explosiv nach oben springen und in der Luft die Beine wechseln.|Weich im Ausfallschritt mit dem anderen Bein vorn landen und direkt weiterspringen.","Drop into a lunge, both knees about 90°, torso upright.|Jump explosively and switch legs in the air.|Land softly in a lunge with the other leg in front and go straight into the next jump."],
  "burpees":["Aus dem Stand in die Hocke gehen und die Hände vor den Füßen aufsetzen.|Beine nach hinten in den Liegestütz springen, Körper gerade halten, und einen Liegestütz machen.|Füße zurück zu den Händen springen und aus der Hocke hochspringen, Arme nach oben.","From standing, squat down and place your hands in front of your feet.|Jump your feet back into a plank, keep your body straight and do a push-up.|Jump your feet back to your hands and jump up, arms overhead."],
  "jump-squats":["Hüftbreit stehen, in die Kniebeuge gehen, Arme hinten.|Explosiv nach oben springen und die Arme mitschwingen.|Weich über die Fußballen landen und direkt in die nächste Kniebeuge abfedern.","Stand hip-width apart and squat down with your arms back.|Jump up explosively, swinging your arms.|Land softly on the balls of your feet and sink straight into the next squat."],
  "mountain-climbers":["Hoher Liegestütz, Hände unter den Schultern.|Abwechselnd ein Knie zügig Richtung Brust ziehen.|Hüfte tief und ruhig halten, nicht mit dem Po nach oben gehen.","High plank, hands under your shoulders.|Drive one knee towards your chest, alternating quickly.|Keep your hips low and steady, don't pike up."],
  "high-knees":["Aufrecht stehen, Rumpf fest.|Auf der Stelle laufen und die Knie bis auf Hüfthöhe ziehen.|Arme wie beim Sprinten gegengleich mitnehmen, auf den Fußballen bleiben.","Stand tall and brace your core.|Run in place, lifting your knees to hip height.|Pump your arms like a sprinter and stay on the balls of your feet."],
  "jumping-jacks":["Aufrecht stehen, Füße zusammen, Arme am Körper.|Mit einem Sprung die Beine grätschen und die Arme über den Kopf führen.|Zurück in die Ausgangsposition springen, locker und rhythmisch bleiben.","Stand tall, feet together, arms at your sides.|Jump your feet out wide and raise your arms overhead.|Jump back to the start, staying light and rhythmic."],
  "skater-jumps":["Auf einem Bein stehen, Knie leicht gebeugt, das andere Bein hinten gekreuzt.|Seitlich auf das andere Bein springen, wie ein Eisschnellläufer.|Weich landen, kurz stabilisieren und zurückspringen.","Stand on one leg, knee slightly bent, other leg crossed behind.|Leap sideways onto the other leg like a speed skater.|Land softly, stabilise briefly and leap back."],
  "plank-burpees":["In die Hocke gehen und die Hände vor den Füßen aufsetzen.|Beine nach hinten in den Liegestütz springen oder steigen.|Zurück in die Hocke und aufrichten, ohne Liegestütz und ohne Sprung.","Squat down and place your hands in front of your feet.|Jump or step your feet back into a plank.|Return to the squat and stand up, no push-up and no jump."],
  "jump-forward-squats":["Hüftbreit stehen, in die Kniebeuge gehen und die Arme nach hinten nehmen.|Mit kräftigem Armschwung schräg nach vorn oben abspringen, so weit es geht.|Weich in der Hocke landen, kurz stabilisieren, aufrichten und zurück an den Start gehen.","Stand hip-width apart, squat down and swing your arms back.|Drive your arms forward and jump up and out as far as you can.|Land softly in a squat, stabilise, stand up and walk back to the start."],
  "jump-forward-burpees":["Wie ein Burpee: Hocke, Hände aufsetzen, Beine in den Liegestütz, ein Liegestütz.|Füße zurück zu den Händen springen und die Arme nach hinten nehmen.|Weit nach vorn springen, weich in der Hocke landen - von dort geht es direkt mit dem nächsten Burpee weiter.","Like a burpee: squat, hands down, feet back into a plank, one push-up.|Jump your feet back to your hands and swing your arms back.|Jump far forward and land softly in a squat - go straight into the next burpee from there."],
  "burpee-squat-jumps":["Wie ein Burpee bis zum Aufrichten: Hocke, Hände aufsetzen, Beine in den Liegestütz, ein Liegestütz, Füße zurück zu den Händen.|Aufrichten, die Arme nach hinten nehmen und in eine tiefe Kniebeuge sinken.|Aus der Kniebeuge explosiv in einen Strecksprung, weich landen und direkt weitermachen.","Like a burpee up to standing: squat, hands down, feet back into a plank, one push-up, feet back to your hands.|Stand up, swing your arms back and sink into a deep squat.|Explode from the squat into a jump, land softly and go straight on."],
  "frogs":["Tiefe Hocke, Füße etwas breiter als hüftbreit, Hände am Boden.|Explosiv nach oben springen und den Körper ganz strecken.|Kontrolliert zurück in die tiefe Hocke landen, Hände wieder zum Boden.","Deep squat, feet a bit wider than hips, hands on the floor.|Jump up explosively and fully extend your body.|Land with control back into the deep squat, hands to the floor."],
  "stand-up-jumps":["Auf dem Rücken liegen, Knie angewinkelt.|Möglichst zügig aufstehen, am besten ohne die Hände.|Oben in einen Strecksprung übergehen und sich kontrolliert wieder hinlegen.","Lie on your back with your knees bent.|Get up as quickly as you can, ideally without using your hands.|Finish with a jump, then lie back down with control."],
  "lateral-hops":["Füße zusammen, Knie leicht gebeugt.|Mit kleinen, schnellen Sprüngen seitlich hin und her hüpfen.|Oberkörper ruhig halten, leise über die Fußballen landen.","Feet together, knees slightly bent.|Hop side to side with small, quick jumps.|Keep your upper body still and land quietly on the balls of your feet."],
  "fast-feet":["Leicht in die Knie gehen, Oberkörper etwas nach vorn.|Auf den Fußballen so schnell wie möglich trippeln.|Füße nur knapp vom Boden lösen, Arme locker mitnehmen.","Bend your knees slightly and lean forward a little.|Patter your feet as fast as you can on the balls of your feet.|Barely lift your feet and keep your arms relaxed."],
  "box-step-ups":["Vor eine stabile, rutschfeste Stufe oder Box stellen, höchstens kniehoch.|Mit einem Fuß aufsetzen und über dieses Bein ganz hochsteigen.|Kontrolliert zurücksteigen und das Führungsbein zügig abwechseln.","Stand in front of a stable, non-slip step or box, no higher than knee height.|Place one foot on it and drive up until you stand tall.|Step back down with control and alternate the lead leg quickly."],
  "sprint-in-place":["Leicht nach vorn lehnen, auf die Fußballen.|Auf der Stelle sprinten, Knie und Füße zügig, Rumpf ruhig.|Arme kräftig mitnehmen; das Tempo so wählen, dass Haltung und Landung sauber bleiben.","Lean forward slightly, up on the balls of your feet.|Sprint in place, quick knees and feet, steady torso.|Drive your arms hard; choose a pace at which posture and landing stay clean."],

  "goblet-squat":["Kettlebell oder Hantel senkrecht vor der Brust halten.|Hüfte nach hinten unten, Knie zeigen in Fußrichtung, Oberkörper aufrecht.|Nur so tief, wie der Rücken neutral und die Fersen am Boden bleiben, möglichst bis etwa parallel; über die Fersen hochdrücken.","Hold a kettlebell or dumbbell upright at your chest.|Sit your hips back and down, knees over your toes, chest up.|Only as deep as your back stays neutral and your heels stay down, ideally to about parallel; drive up through your heels."],
  "kb-swing":["Füße etwas breiter als hüftbreit, Kettlebell vor dir am Boden, freier Platz ringsum, Griff fest.|Glocke zwischen den Beinen nach hinten schwingen, Rücken gerade, Hüfte nach hinten.|Hüfte explosiv nach vorn strecken, die Glocke fliegt bis Brusthöhe, Arme bleiben locker.","Feet a bit wider than your hips, kettlebell on the floor in front, clear space around you, firm grip.|Hike the bell back between your legs, flat back, hips back.|Snap your hips forward so the bell floats to chest height, arms relaxed."],
  "db-thruster":["Hanteln auf Schulterhöhe halten, Füße hüftbreit.|Tiefe Kniebeuge, Oberkörper aufrecht.|Kraftvoll hochdrücken und die Hanteln in einer Bewegung über den Kopf strecken.","Hold the dumbbells at shoulder height, feet hip-width.|Squat down deep, chest up.|Drive up and press the dumbbells overhead in one movement."],
  "romanian-deadlift":["Aufrecht stehen, Hanteln vor den Oberschenkeln, Knie leicht gebeugt.|Hüfte nach hinten schieben, Hanteln am Bein entlang bis unter die Knie senken.|Rücken bleibt gerade, über die Hüfte wieder aufrichten und das Gesäß anspannen.","Stand tall, dumbbells in front of your thighs, knees soft.|Push your hips back and slide the weights down to below your knees.|Keep your back flat, drive your hips forward to stand up and squeeze your glutes."],
  "db-deadlift":["Hanteln neben oder vor den Füßen, hüftbreit stehen.|In die Knie gehen, Rücken gerade, Hanteln greifen.|Aus Beinen und Hüfte aufrichten, Hanteln dicht am Körper, kontrolliert wieder absetzen.","Dumbbells beside or in front of your feet, hip-width stance.|Bend your knees with a flat back and grip the weights.|Stand up with legs and hips, weights close to your body, then lower with control."],
  "bent-over-row":["Aus der Hüfte nach vorn beugen, Oberkörper etwa 45°, Rücken gerade.|Hanteln hängen unter den Schultern.|Ellbogen nah am Körper nach hinten ziehen, Schulterblätter zusammen, langsam senken.","Hinge at the hips, torso about 45°, back flat.|Let the dumbbells hang under your shoulders.|Pull your elbows back close to your body, squeeze your shoulder blades, lower slowly."],
  "one-arm-row":["Eine Hand und bei Bedarf ein Knie auf einer Bank abstützen, Rücken gerade.|Die Hantel hängt unter der Schulter.|Ellbogen nach hinten zur Hüfte ziehen, langsam senken, nach jedem Intervall die Seite wechseln.","Support one hand (and knee) on a bench, back flat.|Let the dumbbell hang under your shoulder.|Row your elbow back towards your hip, lower slowly, switch sides after each interval."],
  "floor-press":["Auf dem Rücken liegen, Knie angewinkelt, Hanteln über der Brust.|Hanteln senken, bis die Oberarme den Boden berühren.|Kurz ablegen, nicht abprallen lassen, und wieder nach oben drücken.","Lie on your back, knees bent, dumbbells over your chest.|Lower until your upper arms touch the floor.|Pause briefly, don't bounce, and press back up."],
  "shoulder-press":["Aufrecht stehen, Hanteln auf Schulterhöhe, Rumpf fest.|Hanteln senkrecht über den Kopf drücken, ohne ins Hohlkreuz zu gehen.|Kontrolliert zurück auf Schulterhöhe senken.","Stand tall, dumbbells at shoulder height, core braced.|Press straight overhead without arching your back.|Lower back to your shoulders with control."],
  "push-press":["Hanteln auf Schulterhöhe, Füße hüftbreit.|Kurz leicht in die Knie gehen.|Aus den Beinen Schwung holen, die Hanteln über den Kopf drücken und kontrolliert senken.","Dumbbells at shoulder height, feet hip-width.|Dip briefly by bending your knees slightly.|Drive with your legs, press the weights overhead and lower with control."],
  "weighted-reverse-lunge":["Hanteln seitlich halten, aufrecht stehen.|Mit einem Bein einen großen Schritt nach hinten, hinteres Knie fast bis zum Boden.|Über das vordere Bein zurück in den Stand, Beine abwechseln.","Hold the dumbbells at your sides and stand tall.|Step one leg far back and lower your back knee towards the floor.|Push through the front leg back to standing, alternate legs."],
  "front-rack-carry":["Kettlebells oder Hanteln vor den Schultern halten, Ellbogen vorn.|Aufrecht und mit festem Rumpf gehen.|Kleine, ruhige Schritte, nicht nach hinten lehnen.","Hold kettlebells or dumbbells at your shoulders, elbows forward.|Walk tall with a braced core.|Take small, steady steps and don't lean back."],
  "farmer-carry":["Mit geradem Rücken in die Hocke gehen, schwere Hanteln oder Kettlebells seitlich greifen und aus den Beinen aufstehen.|Schultern nach hinten unten, aufrecht stehen.|Ruhig und gleichmäßig gehen, ohne zur Seite zu kippen, am Ende kontrolliert absetzen.","Squat down with a flat back, take heavy dumbbells or kettlebells at your sides and stand up with your legs.|Shoulders back and down, stand tall.|Walk steadily without leaning to either side and set the weights down with control at the end."],
  "kb-clean":["Kettlebell zwischen den Füßen, Hüftbeuge wie beim Swing.|Die Glocke mit Hüftschwung nach oben ziehen, Ellbogen nah am Körper.|Weich vor der Schulter auffangen, zurückführen, Seite nach jedem Intervall wechseln.","Kettlebell between your feet, hinge like a swing.|Drive with your hips and pull the bell up, elbow close.|Catch it softly at your shoulder, lower it, switch sides after each interval."],
  "renegade-row":["Stütz auf zwei fest stehenden Hanteln (sechskantig oder flach, keine runden), Füße breit, Handgelenke gerade.|Eine Hantel zur Hüfte ziehen, ohne die Hüfte aufzudrehen; die andere Hand trägt das Gewicht.|Kontrolliert absetzen, Seite wechseln, Rumpf die ganze Zeit fest.","Plank on two stable dumbbells (hex or flat, not round), feet wide, wrists straight.|Row one dumbbell to your hip without rotating your hips; the other hand carries the load.|Put it down under control, switch sides, core tight throughout."],

  "push-ups":["Hände etwas breiter als schulterbreit, Körper eine gerade Linie.|Brust kontrolliert bis knapp über den Boden senken, Ellbogen schräg nach hinten.|Kraftvoll hochdrücken, Hüfte nicht durchhängen lassen.","Hands slightly wider than your shoulders, body in a straight line.|Lower your chest to just above the floor, elbows angled back.|Push back up and don't let your hips sag."],
  "pike-push-ups":["Aus dem Liegestütz die Hüfte hochschieben, der Körper bildet ein umgedrehtes V.|Den Kopf zwischen den Händen Richtung Boden senken.|Über die Schultern wieder hochdrücken.","From a plank, push your hips up into an upside-down V.|Lower your head towards the floor between your hands.|Press back up through your shoulders."],
  "triceps-dips":["Hände hinter dir auf eine stabile, rutschfeste Bank oder einen festen Stuhl ohne Rollen, Finger nach vorn.|Beine angewinkelt oder gestreckt, der Po schwebt knapp vor der Kante, der Rücken bleibt nah an der Bank.|Ellbogen nach hinten beugen bis etwa 90°, dann wieder hochdrücken.","Hands behind you on a stable, non-slip bench or a solid chair without wheels, fingers forward.|Legs bent or straight, hips hover just in front of the edge, back stays close to the bench.|Bend your elbows back to about 90°, then press back up."],
  "squat-hold":["Füße hüftbreit, in die Kniebeuge gehen.|Oberschenkel etwa parallel zum Boden, Oberkörper aufrecht.|Position halten und ruhig weiteratmen.","Feet hip-width, sit down into a squat.|Thighs about parallel to the floor, chest up.|Hold the position and keep breathing calmly."],
  "walking-lunges":["Aufrecht stehen, Hände an der Hüfte.|Großer Schritt nach vorn, beide Knie etwa 90°.|Über das vordere Bein hochdrücken und direkt mit dem anderen Bein weitergehen.","Stand tall, hands on your hips.|Take a big step forward, both knees at about 90°.|Push up through the front leg and step straight into the next lunge."],
  "reverse-lunges":["Aufrecht stehen, Hände an der Hüfte.|Mit einem Bein nach hinten treten, hinteres Knie Richtung Boden.|Über das vordere Bein zurück in den Stand, Beine abwechseln.","Stand tall, hands on your hips.|Step one leg back and lower your back knee towards the floor.|Push through the front leg back to standing, alternate legs."],
  "side-lunges":["Breiter Stand, Füße zeigen nach vorn.|Gewicht auf ein Bein verlagern, Hüfte nach hinten, das andere Bein bleibt gestreckt.|Zurück zur Mitte drücken und die Seite wechseln.","Wide stance, toes pointing forward.|Shift onto one leg, hips back, the other leg stays straight.|Push back to the middle and switch sides."],
  "cossack-squats":["Sehr breiter Stand, Zehen leicht nach außen.|Tief auf ein Bein absenken, das andere Bein gestreckt mit den Zehen nach oben, Brust aufrecht.|Über die Mitte zur anderen Seite wechseln, die Ferse des Arbeitsbeins bleibt am Boden.","Very wide stance, toes slightly out.|Sink deep onto one leg, the other leg straight with toes up, chest tall.|Move through the middle to the other side, keep your working heel down."],
  "deep-squats":["Füße schulterbreit, Zehen leicht nach außen.|So tief wie schmerzfrei möglich in die Hocke; heben die Fersen ab, hilft eine kleine Unterlage oder ein Festhalten.|Unten kurz halten und kontrolliert wieder hochkommen.","Feet shoulder-width, toes slightly out.|Squat as deep as you can without pain; if your heels lift, a small wedge or holding on helps.|Pause at the bottom and rise with control."],
  "pistol-assist":["Neben eine Stange, einen Türrahmen oder eine Wand stellen und festhalten.|Auf einem Bein stehen, das andere Bein nach vorn strecken.|Langsam auf dem Standbein nur so tief absenken, wie du es kontrollieren kannst, die Ferse bleibt unten; wieder hochdrücken, Seite nach jedem Intervall wechseln.","Stand next to a pole, door frame or wall and hold on.|Stand on one leg and extend the other leg forward.|Lower slowly on the standing leg only as deep as you can control, heel stays down; push back up, switch sides after each interval."],
  "plank-steps":["Im Unterarmstütz beginnen.|Nacheinander auf die Hände hochdrücken in den hohen Stütz.|Wieder auf die Unterarme absetzen, die führende Hand abwechseln, Hüfte ruhig.","Start in a forearm plank.|Press up onto your hands one at a time into a high plank.|Lower back onto your forearms, alternate the leading arm, keep your hips still."],
  "bear-crawl":["Vierfüßlerstand, Knie knapp über dem Boden.|Gegengleich Hand und Fuß ein kleines Stück vorsetzen.|Rücken flach, Knie tief, vorwärts und rückwärts krabbeln.","On all fours with your knees hovering just above the floor.|Move the opposite hand and foot forward a little.|Keep your back flat and knees low, crawl forwards and backwards."],
  "wall-sit":["Mit dem Rücken an die Wand lehnen.|Nach unten rutschen, bis die Knie etwa 90° gebeugt sind.|Knie über den Füßen, Position halten.","Lean your back against a wall.|Slide down until your knees are bent to about 90°.|Knees over your ankles, hold the position."],
  "calf-raises":["Hüftbreit stehen, bei Bedarf an einer Wand festhalten.|Langsam auf die Zehenspitzen hochdrücken.|Oben kurz halten und kontrolliert absenken.","Stand hip-width, hold on to a wall if needed.|Rise slowly onto your toes.|Pause at the top and lower with control."],
  "glute-bridge":["Auf dem Rücken liegen, Knie angewinkelt, Füße hüftbreit.|Hüfte anheben, bis Knie, Hüfte und Schultern eine Linie bilden.|Gesäß oben anspannen und langsam wieder ablegen.","Lie on your back, knees bent, feet hip-width.|Lift your hips until knees, hips and shoulders form a line.|Squeeze your glutes at the top and lower slowly."],

  "pull-ups":["An einer fest verankerten, belastbaren Stange hängen, Daumen um die Stange, Hände etwas breiter als schulterbreit.|Schulterblätter nach unten ziehen und das Kinn über die Stange ziehen.|Kontrolliert bis in den gestreckten Hang absenken.","Hang from a firmly anchored, load-rated bar, thumbs around the bar, hands slightly wider than your shoulders.|Pull your shoulder blades down and pull your chin over the bar.|Lower with control to a full hang."],
  "negative-pull-ups":["Mit Sprung oder Tritt in die obere Position, Kinn über der Stange.|Dort kurz halten.|So langsam wie möglich in den gestreckten Hang absenken.","Jump or step up to the top position, chin over the bar.|Hold there briefly.|Lower as slowly as you can to a full hang."],
  "inverted-rows":["Unter eine hüfthohe, sichere Stange legen und greifen.|Körper gerade, Fersen am Boden; leichter mit angewinkelten Knien oder einer höheren Stange.|Brust zur Stange ziehen, Schulterblätter zusammen, langsam absenken.","Lie under a secure hip-height bar and grip it.|Body straight, heels on the floor; easier with bent knees or a higher bar.|Pull your chest to the bar, squeeze your shoulder blades, lower slowly."],
  "superman-hold":["Auf dem Bauch liegen, Arme nach vorn gestreckt.|Arme, Brust und Beine leicht vom Boden abheben.|Blick zum Boden, Position halten.","Lie on your stomach, arms extended forward.|Lift your arms, chest and legs slightly off the floor.|Look down and hold the position."],
  "reverse-snow-angels":["Auf dem Bauch liegen, Stirn knapp über dem Boden, Arme neben dem Körper.|Arme leicht abheben.|In einem großen Bogen über die Seite bis über den Kopf führen und zurück.","Lie face down, forehead just off the floor, arms by your sides.|Lift your arms slightly.|Sweep them in a wide arc out to the side and overhead, then back."],
  "bird-dog":["Vierfüßlerstand, Hände unter den Schultern, Knie unter der Hüfte.|Einen Arm und das gegenüberliegende Bein langsam strecken.|Kurz halten, zurückführen und die Seite wechseln, Hüfte bleibt gerade.","On all fours, hands under your shoulders, knees under your hips.|Slowly extend one arm and the opposite leg.|Hold briefly, return and switch sides, keep your hips level."],
  "prone-y-raise":["Auf dem Bauch liegen, Arme schräg nach vorn in Y-Form.|Daumen zeigen nach oben.|Arme über die Schulterblätter anheben, kurz halten und senken.","Lie face down, arms forward in a Y shape.|Thumbs point up.|Lift your arms by squeezing your shoulder blades, hold briefly, lower."],
  "prone-t-raise":["Auf dem Bauch liegen, Arme seitlich in T-Form.|Daumen zeigen nach oben.|Arme über die Schulterblätter anheben, kurz halten und senken.","Lie face down, arms out to the sides in a T shape.|Thumbs point up.|Lift your arms by squeezing your shoulder blades, hold briefly, lower."],
  "good-mornings":["Hüftbreit stehen, Hände hinter dem Kopf.|Mit geradem Rücken aus der Hüfte nach vorn beugen, Knie leicht gebeugt.|Bis etwa waagerecht beugen und über die Hüfte aufrichten.","Stand hip-width, hands behind your head.|Hinge forward from your hips with a flat back, knees soft.|Bend to about horizontal and stand back up through your hips."],
  "swimmers":["Auf dem Bauch liegen, Arme nach vorn gestreckt.|Arme und Beine leicht abheben.|Gegengleich Arm und Bein im Wechsel auf und ab bewegen, wie beim Kraulen.","Lie on your stomach, arms extended forward.|Lift your arms and legs slightly.|Flutter the opposite arm and leg up and down, like swimming crawl."],
  "cobra-lift":["Auf dem Bauch liegen, Hände neben der Brust.|Brust langsam anheben, die Hüfte bleibt am Boden.|Nur so weit, wie der untere Rücken entspannt bleibt, kurz halten und ruhig atmen, dann langsam senken.","Lie on your stomach, hands beside your chest.|Slowly lift your chest while your hips stay down.|Only go as high as your lower back stays relaxed, then lower slowly."],
  "scapular-push-ups":["Hoher Liegestütz, Arme gestreckt.|Schulterblätter zusammenziehen, die Brust sinkt leicht ab.|Schulterblätter auseinanderdrücken, die Arme bleiben die ganze Zeit gestreckt.","High plank, arms straight.|Squeeze your shoulder blades together so your chest sinks slightly.|Push them apart again, arms stay straight throughout."],
  "scapular-pull-ups":["An der Stange hängen, Arme gestreckt.|Nur die Schulterblätter nach unten ziehen, der Körper hebt sich ein Stück.|Langsam zurück in den Hang, die Arme bleiben gestreckt.","Hang from the bar, arms straight.|Pull only your shoulder blades down so your body rises a little.|Lower slowly back to the hang, arms stay straight."],
  "dead-hang":["Eine fest verankerte, belastbare Stange mit dem Daumen umschlossen schulterbreit greifen.|Mit gestreckten Armen hängen, Füße vom Boden.|Schultern aktiv, ruhig atmen und die Position halten.","Take a firmly anchored, load-rated bar shoulder-width with your thumbs wrapped around it.|Hang with straight arms, feet off the floor.|Keep your shoulders active, breathe calmly and hold."],

  "air-squats":["Füße schulterbreit, Arme nach vorn.|Hüfte nach hinten unten, Knie in Fußrichtung, Oberkörper aufrecht.|Nur so tief, wie der Rücken neutral und die Fersen am Boden bleiben, möglichst bis etwa parallel; über die Fersen hochdrücken.","Feet shoulder-width, arms forward.|Sit your hips back and down, knees over your toes, chest up.|Only as deep as your back stays neutral and your heels stay down, ideally to about parallel; drive up through your heels."],
  "split-squats":["Schrittstellung, ein Fuß vorn, einer hinten.|Senkrecht nach unten gehen, bis das hintere Knie fast den Boden berührt.|Hochdrücken, die Füße bleiben stehen, Seite nach jedem Intervall wechseln.","Split stance, one foot forward, one back.|Lower straight down until your back knee nearly touches the floor.|Push up with your feet staying put, switch sides after each interval."],
  "bulgarian-split-squats":["Hinteren Fuß (Spann) auf eine stabile, rutschfeste Bank oder einen Stuhl etwa knie- bis wadenhoch legen, der vordere Fuß steht ein großes Stück davor.|Senkrecht nach unten gehen, vorderes Knie über dem Fuß.|Über das vordere Bein hochdrücken, Seite nach jedem Intervall wechseln.","Rest the top of your back foot on a stable, non-slip bench or chair about knee to calf height, front foot a big step ahead.|Lower straight down, front knee over your foot.|Drive up through the front leg, switch sides after each interval."],
  "forward-lunges":["Aufrecht stehen, Hände an der Hüfte.|Großer Schritt nach vorn, kontrolliert abbremsen, beide Knie etwa 90°.|Kräftig über das vordere Bein zurück in den Stand, Beine abwechseln.","Stand tall, hands on your hips.|Step far forward and brake with control, both knees at about 90°.|Push back through the front leg to standing, alternate legs."],
  "single-leg-glute-bridge":["Auf dem Rücken liegen, ein Knie angewinkelt, das andere Bein gestreckt.|Über die Ferse die Hüfte anheben, das Becken bleibt waagerecht.|Oben anspannen, langsam senken, Seite nach jedem Intervall wechseln.","Lie on your back, one knee bent, the other leg straight.|Drive through your heel to lift your hips, pelvis level.|Squeeze at the top, lower slowly, switch sides after each interval."],
  "lateral-lunge-pulses":["In den Seitausfallschritt gehen, ein Bein gebeugt, das andere gestreckt.|In der tiefen Position kleine, kontrollierte Auf-und-ab-Bewegungen machen.|Gewicht auf der Ferse, Seite nach jedem Intervall wechseln.","Step into a side lunge, one leg bent, the other straight.|Pulse up and down in small, controlled movements at the bottom.|Keep your weight on your heel, switch sides after each interval."],

  "plank":["Unterarme unter den Schultern, Beine gestreckt.|Der Körper bildet eine gerade Linie von Kopf bis Ferse.|Bauch und Gesäß anspannen, ruhig atmen, halten.","Forearms under your shoulders, legs straight.|Your body forms a straight line from head to heels.|Brace your abs and glutes, breathe calmly and hold."],
  "side-plank":["Seitlich auf einen Unterarm stützen, Ellbogen unter der Schulter.|Hüfte anheben, bis der Körper eine gerade Linie bildet.|Halten, Seite nach jedem Intervall wechseln.","Lie on your side and prop up on one forearm, elbow under your shoulder.|Lift your hips until your body forms a straight line.|Hold, switch sides after each interval."],
  "dead-bug":["Auf dem Rücken, Arme zur Decke, Knie über der Hüfte angewinkelt.|Gegengleich einen Arm nach hinten und ein Bein nach vorn strecken.|Unterer Rücken bleibt am Boden, zurückführen und Seite wechseln.","Lie on your back, arms to the ceiling, knees bent over your hips.|Extend one arm back and the opposite leg forward.|Keep your lower back down, return and switch sides."],
  "bicycle-crunches":["Rückenlage, Hände locker am Kopf, Schultern leicht angehoben.|Ein Knie zur Brust ziehen, das andere Bein strecken.|Den gegenüberliegenden Ellbogen zum Knie drehen und im Wechsel radeln.","Lie on your back, hands lightly at your head, shoulders lifted.|Pull one knee in while extending the other leg.|Rotate the opposite elbow towards the knee and pedal alternately."],
  "leg-raises":["Rückenlage, Beine gestreckt, Hände neben dem Körper.|Die gestreckten Beine bis senkrecht anheben.|Kontrolliert absenken, bei Bedarf mit gebeugten Knien.","Lie on your back, legs straight, hands by your sides.|Lift your straight legs to vertical.|Lower with control, bend your knees if needed."],
  "jackknives":["Rückenlage, Arme über dem Kopf, Beine gestreckt.|Gleichzeitig Oberkörper und Beine anheben und mit den Händen Richtung Füße greifen.|Kontrolliert zurück in die gestreckte Lage.","Lie on your back, arms overhead, legs straight.|Lift your torso and legs at the same time and reach for your feet.|Return with control to the stretched position."],
  "side-jackknives":["Auf der Seite liegen, die obere Hand am Kopf.|Oberkörper und gestreckte Beine gleichzeitig seitlich anheben.|Langsam absenken, Seite nach jedem Intervall wechseln.","Lie on your side, top hand at your head.|Lift your torso and straight legs sideways at the same time.|Lower slowly, switch sides after each interval."],
  "hollow-hold":["Rückenlage, den unteren Rücken fest in den Boden drücken.|Schultern und gestreckte Beine leicht anheben, Arme über den Kopf.|Den Körper wie eine Banane halten, leichter mit gebeugten Knien.","Lie on your back and press your lower back into the floor.|Lift your shoulders and straight legs slightly, arms overhead.|Hold a banana shape, easier with bent knees."],
  "russian-twists":["Sitzen, Oberkörper leicht zurückgelehnt, Füße am Boden oder angehoben.|Brustbein aufrecht, Hände vor dem Körper.|Den Oberkörper abwechselnd nach links und rechts drehen.","Sit and lean back slightly, feet on the floor or lifted.|Chest up, hands in front of you.|Rotate your torso from side to side."],
  "sit-ups":["Rückenlage, Knie angewinkelt, Füße am Boden.|Oberkörper kontrolliert bis zum Sitzen aufrollen.|Langsam Wirbel für Wirbel zurückrollen, ohne Schwung.","Lie on your back, knees bent, feet flat.|Roll your torso up to sitting with control.|Roll back down slowly, one vertebra at a time, no momentum."],
  "toe-touches":["Rückenlage, Beine senkrecht nach oben gestreckt.|Schultern anheben und mit den Händen Richtung Zehen greifen.|Langsam zurück, die Beine bleiben oben.","Lie on your back, legs straight up.|Lift your shoulders and reach for your toes.|Lower slowly, legs stay up."],
  "plank-shoulder-taps":["Hoher Liegestütz, Füße etwas breiter.|Mit einer Hand die gegenüberliegende Schulter antippen.|Hand zurück, Seite wechseln, das Becken nicht kippen lassen.","High plank, feet a little wider.|Tap the opposite shoulder with one hand.|Return the hand and switch, don't let your hips rock."],
  "toes-to-bar":["An einer sicheren Stange hängen, Arme gestreckt.|Die Füße bis zur Stange bringen (leichter: Knie zur Brust).|Kontrolliert senken, ohne zu schwingen.","Hang from a secure bar, arms straight.|Pull your knees to your chest or bring your feet to the bar.|Lower with control, without swinging."]
};

/* Haltung je Übung: [Haltung DE (a|b), Vermeiden DE, Haltung EN (a|b), Vermeiden EN]
   Grundlage: gängige Technikhinweise (u. a. ACE, NSCA, NASM): neutrale Wirbelsäule, Knie in Fußrichtung,
   Schultern weg von den Ohren, bei Bauchübungen den unteren Rücken am Boden halten. */
var EX_POSTURE = {
  "glute-machine":["Rücken gerade, Bauch fest.|Bewegung kommt aus der Hüfte.","Ins Hohlkreuz drücken, um weiter zu kommen.","Back straight, core tight.|Move from your hip.","Arching your lower back to go further."],
  "calf-press":["Knie leicht gebeugt, nicht durchdrücken.|Ganze Bewegung im Sprunggelenk.","Die Knie arbeiten mit oder die Füße rutschen.","Knees slightly bent, never locked.|All the movement at the ankle.","Bending the knees or letting the feet slip."],
  "lying-leg-curl":["Hüfte flach auf dem Polster.|Oben kurz halten.","Das Becken hebt sich, um Schwung zu holen.","Hips flat on the pad.|Pause briefly at the top.","Lifting your hips for momentum."],
  "rotary-torso":["Aufrecht, Becken fest.|Langsam und gleichmäßig drehen.","Mit Schwung herumreißen oder den vollen Drehwinkel erzwingen. Bei Rückenschmerz klein drehen oder weglassen.","Sit tall, hips fixed.|Rotate slowly and evenly.","Swinging round with momentum or forcing the full range. If your back hurts, rotate less or skip it."],
  "back-extension-machine":["Aus der Hüfte strecken, Blick nach vorn.|Oben aufrecht, nicht nach hinten überstrecken.","Ruckartig nach hinten schnellen. Bei Rückenschmerz das Gewicht senken oder weglassen.","Extend from the hips, look ahead.|Upright at the top, don't lean back.","Jerking backwards. Reduce the weight or skip it if your back hurts."],
  "triceps-extension-machine":["Oberarme bleiben auf dem Polster.|Unten kurz strecken.","Die Schultern ziehen mit.","Upper arms stay on the pad.|Fully extend briefly.","Shrugging your shoulders into it."],
  "lateral-raise-machine":["Schultern tief, Brust aufrecht.|Nur bis Schulterhöhe.","Mit den Schultern zum Ohr ziehen.","Shoulders down, chest up.|Only up to shoulder height.","Shrugging towards your ears."],
  "smith-bench-press":["Schulterblätter zusammen, Füße fest.|Stange kontrolliert zur Brust.","Die Stange auf der Brust abprallen lassen.","Shoulder blades together, feet planted.|Bar to your chest under control.","Bouncing the bar off your chest."],
  "assisted-dip":["Schultern tief, Oberkörper leicht nach vorn.|Ellbogen nach hinten.","Tiefer absenken, als es sich für die Schulter gut anfühlt. Bei Schmerz vorn in der Schulter die Tiefe verkleinern.","Shoulders down, torso slightly forward.|Elbows back.","Going deeper than your shoulder likes. If the front of your shoulder hurts, reduce the depth."],
  "high-row-machine":["Brust bleibt am Polster.|Unten die Schulterblätter zusammen.","Mit Schwung aus dem Oberkörper ziehen.","Chest stays on the pad.|Squeeze your shoulder blades at the bottom.","Pulling with momentum from your upper body."],
  "cable-crunch":["Hüfte bleibt über den Knien.|Ausatmen beim Einrollen.","Mit den Armen ziehen statt mit dem Bauch.","Hips stay over your knees.|Breathe out as you curl.","Pulling with your arms instead of your abs."],
  "cable-pull-through":["Rücken gerade, Bewegung aus der Hüfte.|Oben das Gesäß fest anspannen.","Aus den Armen ziehen oder ins Hohlkreuz gehen.","Flat back, move from your hips.|Squeeze your glutes hard at the top.","Pulling with your arms or arching your back."],
  "cable-lateral-raise":["Oberkörper ruhig, Arm leicht gebeugt.|Oben kurz halten.","Aus dem Oberkörper Schwung holen.","Upper body still, arm slightly bent.|Pause at the top.","Swinging with your upper body."],
  "rung-pull-ups":["Rumpf fest, Beine ruhig.|Ellbogen ziehen nach unten.","Mit Schwung aus den Beinen ziehen, den Kopf gegen die Sprosse stoßen oder an nassen, glatten Sprossen üben; Gerät und Boden vorher prüfen.","Core braced, legs still.|Drive your elbows down.","Kicking for momentum, bumping your head on a rung or training on wet, slick rungs; check the equipment and the ground first."],
  "hack-squat":["Rücken und Po am Polster.|Knie zeigen in Fußrichtung.", "Die Fersen abheben.", "Back and hips on the pad.|Knees track your toes.", "Lifting your heels."],
  "smith-squat":["Brust aufrecht, Rumpf fest.|Knie folgen den Zehen.", "Die Knie nach innen fallen lassen.", "Chest up, core braced.|Knees follow your toes.", "Letting your knees cave in."],
  "leg-press-single":["Becken bleibt gerade am Polster.|Knie zeigt in Fußrichtung.", "Mit dem Becken zur Seite kippen.", "Pelvis stays level on the pad.|Knee tracks your toes.", "Tilting your pelvis to one side."],
  "hip-thrust":["Kinn leicht zur Brust, Rippen unten.|Schienbeine oben etwa senkrecht.", "Oben ins Hohlkreuz überstrecken.", "Chin slightly tucked, ribs down.|Shins about vertical at the top.", "Overarching your lower back at the top."],
  "glute-kickback-cable":["Rumpf fest, Becken gerade.|Standbein leicht gebeugt.", "Mit dem Rücken ins Hohlkreuz schwingen.", "Core braced, pelvis level.|Standing knee soft.", "Swinging into an arched back."],
  "seated-calf":["Volle Bewegung.|Langsam, ohne Wippen.", "Nur kurz auf und ab wippen.", "Full range.|Slow, no bouncing.", "Just bouncing."],
  "incline-chest-press":["Schultern unten, Rücken am Polster.|Handgelenke gerade.", "Die Schultern hochziehen.", "Shoulders down, back on the pad.|Straight wrists.", "Shrugging your shoulders."],
  "cable-crossover":["Ellbogen bleiben leicht gebeugt, der Winkel ändert sich nicht.|Oberkörper leicht vorgeneigt, Rumpf fest.","Mit den Armen drücken statt zu umarmen.","Elbows stay slightly bent, the angle doesn't change.|Lean slightly forward, core braced.","Pressing instead of hugging."],
  "incline-db-press":["Schulterblätter zusammen, Füße fest.|Unterarme senkrecht.", "Die Hanteln zu tief und zu weit außen senken.", "Shoulder blades together, feet planted.|Vertical forearms.", "Lowering the dumbbells too deep and wide."],
  "db-fly":["Ellbogen bleiben gleich gebeugt.|Nur bis Schulterhöhe senken.", "Zu tief gehen und die Schulter überdehnen.", "Keep the elbow bend constant.|Lower only to shoulder height.", "Going too deep and overstretching your shoulders."],
  "assisted-pullup":["Schultern zuerst nach unten ziehen.|Rumpf fest.", "Mit halber Bewegung arbeiten.", "Pull your shoulders down first.|Core braced.", "Using only half the range."],
  "close-grip-pulldown":["Brust raus, leicht zurückgelehnt.|Schultern tief.", "Mit dem Oberkörper nach hinten reißen.", "Chest up, slight lean back.|Shoulders down.", "Yanking back with your torso."],
  "t-bar-row":["Rücken neutral, Knie leicht gebeugt.|Nacken lang.", "Mit Schwung aus dem Oberkörper ziehen.", "Neutral spine, knees soft.|Long neck.", "Heaving with your torso."],
  "barbell-row":["Rücken gerade und fest.|Oberkörper bleibt ruhig.", "Mit rundem Rücken ziehen.", "Flat, braced back.|Torso stays still.", "Pulling with a rounded back."],
  "face-pull":["Schultern tief, Brust raus.|Oben kurz halten.", "Mit dem Rücken nach hinten lehnen.", "Shoulders down, chest up.|Pause at the end.", "Leaning back with your whole body."],
  "straight-arm-pulldown":["Leicht vorgeneigt, Rumpf fest.|Ellbogen bleiben gestreckt.", "Die Arme beugen und drücken.", "Slight forward lean, core braced.|Elbows stay straight.", "Bending your arms and pushing."],
  "lateral-raise":["Schultern tief, Nacken locker.|Ellbogen führen.", "Mit Schwung hochreißen.", "Shoulders down, relaxed neck.|Lead with your elbows.", "Swinging the weights up."],
  "shrugs":["Arme bleiben gestreckt.|Kopf gerade.", "Mit den Schultern kreisen.", "Arms stay straight.|Head straight.", "Rolling your shoulders."],
  "hammer-curl":["Ellbogen bleiben am Körper.|Rumpf fest.", "Mit dem Rücken Schwung holen.", "Elbows stay at your sides.|Core braced.", "Using your back for momentum."],
  "barbell-curl":["Ellbogen am Körper.|Aufrecht, Rumpf fest.", "Ins Hohlkreuz lehnen.", "Elbows at your sides.|Stand tall, core braced.", "Leaning back into an arch."],
  "overhead-cable-triceps":["Oberarme bleiben neben dem Kopf.|Rumpf fest.", "Die Ellbogen weit öffnen.", "Upper arms stay by your head.|Core braced.", "Flaring your elbows wide."],
  "triceps-machine":["Schultern unten, Brust raus.|Ellbogen nah am Körper.", "Die Schultern nach vorn rollen.", "Shoulders down, chest up.|Elbows close.", "Rolling your shoulders forward."],
  "cable-woodchop":["Hüfte dreht leicht mit.|Arme bleiben lang.","Nur mit den Armen ziehen. Bei Rückenschmerz klein drehen oder weglassen.","Hips rotate a little too.|Arms stay long.","Pulling with your arms only. If your back hurts, rotate less or skip it."],
  "captains-chair":["Rücken bleibt an der Lehne.|Langsam senken.", "Mit Schwung arbeiten.", "Back stays on the pad.|Lower slowly.", "Swinging your legs."],
  "barbell-overhead-press":["Gesäß und Bauch fest.|Stange nah am Gesicht vorbei.","Ins Hohlkreuz lehnen. Bei Schmerz oder Einklemmgefühl oben in der Schulter aufhören.","Glutes and abs tight.|Bar travels close to your face.","Leaning back into an arch. Stop if you feel pain or pinching at the top of your shoulder."],
  "barbell-rdl":["Rücken gerade, Stange nah am Bein.|Bewegung aus der Hüfte.", "Mit rundem Rücken tiefer gehen.", "Flat back, bar close to your legs.|Move from your hips.", "Going lower with a rounded back."],
  "leg-press":["Rücken und Po bleiben am Polster.|Knie zeigen in Fußrichtung.", "Die Knie oben durchdrücken oder unten den Po abheben.", "Back and hips stay on the pad.|Knees track your toes.", "Locking your knees at the top or lifting your hips at the bottom."],
  "leg-press-45":["Po bleibt am Polster, Rücken flach.|Knie zeigen in Fußrichtung.", "Zu tief gehen, sodass der Po abrollt.", "Hips stay on the pad, back flat.|Knees track your toes.", "Going so deep that your hips roll up."],
  "leg-extension":["Rücken am Polster, Hände an den Griffen.|Langsam senken.", "Mit Schwung hochtreten.", "Back on the pad, hands on the handles.|Lower slowly.", "Kicking up with momentum."],
  "leg-curl":["Oberschenkel fixiert, Hüfte ruhig.|Volle Bewegung, langsam zurück.", "Mit der Hüfte hochkommen, um mehr Gewicht zu bewegen.", "Thighs locked, hips still.|Full range, slow return.", "Lifting your hips to move more weight."],
  "adductor-machine":["Rücken am Polster, Rumpf fest.|Gleichmäßig schließen.", "Die Beine zusammenschlagen lassen.", "Back on the pad, core braced.|Close evenly.", "Letting your legs slam together."],
  "abductor-machine":["Oberkörper ruhig; eine leichte Vorneigung ist in Ordnung.|Kontrolliert öffnen und schließen.","Mit dem Oberkörper schaukeln.","Torso still; a slight forward lean is fine.|Open and close with control.","Rocking your torso."],
  "calf-machine":["Knie gestreckt, aber nicht durchgedrückt.|Volle Bewegung: unten dehnen, oben halten.", "Nur kurz auf und ab wippen.", "Knees straight but not locked.|Full range: stretch at the bottom, hold at the top.", "Just bouncing up and down."],
  "chest-press-machine":["Schultern unten und hinten, Brust raus.|Handgelenke gerade.", "Die Schultern beim Drücken nach vorn schieben.", "Shoulders down and back, chest up.|Straight wrists.", "Pushing your shoulders forward as you press."],
  "butterfly":["Ellbogen leicht gebeugt und fest.|Schultern unten, Brust raus.", "Zu weit nach hinten öffnen und die Schulter überdehnen.", "Elbows slightly bent and fixed.|Shoulders down, chest up.", "Opening too far back and overstretching your shoulders."],
  "pullover":["Rippen unten, unterer Rücken ruhig.|Arme fast gestreckt.", "Ins Hohlkreuz fallen, wenn das Gewicht hinter den Kopf geht.", "Ribs down, lower back quiet.|Arms almost straight.", "Arching your back as the weight goes behind your head."],
  "lat-pulldown":["Brust raus, leicht zurückgelehnt.|Ellbogen zeigen nach unten.","Die Stange in den Nacken ziehen (belastet die Schulter unnötig) oder mit dem Oberkörper schwingen.","Chest up, slight lean back.|Elbows point down.","Pulling the bar behind your neck (needlessly stresses the shoulder) or swinging your torso."],
  "row-machine":["Brust bleibt am Polster.|Schultern weg von den Ohren.", "Mit den Armen reißen statt mit dem Rücken zu ziehen.", "Chest stays on the pad.|Shoulders away from your ears.", "Yanking with your arms instead of pulling with your back."],
  "cable-row":["Aufrecht sitzen, Rücken neutral.|Schulterblätter zuerst zusammen.", "Mit dem Oberkörper weit vor und zurück schaukeln.", "Sit tall, neutral spine.|Squeeze your shoulder blades first.", "Rocking your torso far forward and back."],
  "reverse-butterfly":["Arme auf Schulterhöhe, leicht gebeugt.|Brust am Polster.", "Die Schultern hochziehen.", "Arms at shoulder height, slightly bent.|Chest on the pad.", "Shrugging your shoulders."],
  "back-extension":["Rücken gerade, Kinn leicht zur Brust.|Bewegung aus der Hüfte.","Oben ins Hohlkreuz überstrecken oder mit Schwung arbeiten. Zuerst ohne Zusatzgewicht üben; bei Rückenschmerz weglassen.","Straight back, chin slightly tucked.|Move from your hips.","Overarching at the top or using momentum. Start without extra weight; skip it if your back hurts."],
  "shoulder-press-machine":["Rücken und Kopf am Polster.|Rippen unten.", "Ins Hohlkreuz drücken.", "Back and head on the pad.|Ribs down.", "Arching your back to press."],
  "biceps-machine":["Oberarme bleiben flach auf dem Polster.|Handgelenke gerade.", "Den Oberkörper nach hinten lehnen.", "Upper arms stay flat on the pad.|Straight wrists.", "Leaning back with your torso."],
  "cable-curl":["Ellbogen fest am Körper.|Aufrecht stehen, Rumpf fest.", "Mit dem Rücken Schwung holen.", "Elbows fixed at your sides.|Stand tall, core braced.", "Using your back for momentum."],
  "triceps-pushdown":["Oberarme bleiben am Körper.|Leicht nach vorn geneigt, Rumpf fest.", "Mit dem Oberkörper nach unten drücken.", "Upper arms stay at your sides.|Slight forward lean, core braced.", "Pushing down with your body weight."],
  "skull-crusher":["Oberarme bleiben senkrecht bzw. leicht nach hinten geneigt.|Langsam senken – das Gewicht ist nah am Kopf.", "Die Ellbogen weit nach außen öffnen.", "Upper arms stay vertical or tilted slightly back.|Lower slowly – the weight is close to your head.", "Letting your elbows flare wide."],
  "ab-crunch-machine":["Bauch führt, Nacken locker.|Langsam zurück.", "Mit den Armen oder Beinen ziehen.", "Your abs lead, neck relaxed.|Return slowly.", "Pulling with your arms or legs."],
  "bench-press":["Schulterblätter zusammen und unten, Füße fest.|Unterarme senkrecht unter der Stange.","Die Stange abprallen lassen, das Gesäß von der Bank heben oder den Daumen neben die Finger legen.","Shoulder blades together and down, feet planted.|Forearms vertical under the bar.","Bouncing the bar off your chest, lifting your hips off the bench or wrapping your thumb alongside your fingers."],
  "barbell-squat":["Rumpf fest, Brust aufrecht.|Knie folgen den Zehen, Fersen am Boden.","Die Knie nach innen fallen lassen, die Hüfte zuerst hochschießen lassen oder mit rundem Rücken aus der Tiefe kommen.","Core braced, chest up.|Knees follow your toes, heels down.","Letting your knees cave in, shooting your hips up first or rising out of the bottom with a rounded back."],
  "barbell-deadlift":["Rücken gerade, Stange am Bein.|Hüfte und Schultern steigen gleichzeitig.","Mit rundem Rücken ziehen, die Stange nach vorn pendeln lassen oder oben ins Hohlkreuz überstrecken.","Flat back, bar against your legs.|Hips and shoulders rise together.","Pulling with a rounded back, letting the bar drift forward or leaning back into an arch at the top."],
  "jump-lunges":["Oberkörper aufrecht, Rumpf fest.|Vorderes Knie über dem Fuß, hinteres Knie zeigt nach unten.","Hart auf der Ferse landen oder das vordere Knie nach innen knicken lassen.","Torso upright, core braced.|Front knee over your foot, back knee points down.","Landing hard on your heel or letting the front knee collapse inward."],
  "burpees":["Im Stütz eine Linie von Kopf bis Ferse, Hände unter den Schultern.|Bei der Landung Knie leicht gebeugt, Knie zeigen in Fußrichtung.","Mit durchhängendem Rücken in den Stütz springen.","In the plank, one line from head to heels, hands under your shoulders.|Land with soft knees tracking over your toes.","Jumping back into the plank with a sagging lower back."],
  "jump-squats":["Brust aufrecht, Blick nach vorn, Gewicht auf dem ganzen Fuß.|Knie folgen beim Absprung und bei der Landung der Fußrichtung.","Steifbeinig landen oder die Knie nach innen fallen lassen.","Chest up, eyes forward, weight across the whole foot.|Knees track over your toes on take-off and landing.","Landing stiff-legged or letting your knees cave in."],
  "mountain-climbers":["Schultern über den Händen, Rücken gerade wie im Stütz.|Bauch und Gesäß fest, damit die Hüfte nicht wippt.","Die Hüfte hochschieben oder durchhängen lassen.","Shoulders over your hands, back flat like a plank.|Brace your abs and glutes so your hips don't bounce.","Piking your hips up or letting them sag."],
  "high-knees":["Aufrecht bleiben, nicht nach hinten lehnen.|Leise auf den Fußballen landen, Rumpf fest.","Mit rundem Rücken nach vorn fallen.","Stay tall, don't lean back.|Land quietly on the balls of your feet, core braced.","Hunching forward with a rounded back."],
  "jumping-jacks":["Rumpf aufrecht, Bauch leicht angespannt.|Weich landen, Knie leicht gebeugt und in Fußrichtung.","Mit gestreckten Knien hart landen.","Torso upright, abs lightly braced.|Land softly, knees slightly bent and over your toes.","Landing hard with locked knees."],
  "skater-jumps":["Oberkörper leicht nach vorn, Rücken gerade.|Standknie über dem Fuß, Hüfte stabil.","Das Standknie bei der Landung nach innen knicken lassen.","Lean slightly forward with a flat back.|Standing knee over your foot, hips stable.","Letting the landing knee collapse inward."],
  "plank-burpees":["Im Stütz Kopf, Rücken und Beine in einer Linie.|In der Hocke Brust nach vorn, Rücken lang.","Im Stütz ins Hohlkreuz fallen.","In the plank, head, back and legs in one line.|In the squat, chest forward, back long.","Dropping into an arched lower back in the plank."],
  "jump-forward-squats":["Knie zeigen beim Absprung und bei der Landung in Fußrichtung.|Landung leise über den ganzen Fuß, Hüfte geht nach hinten.","Mit gestreckten Beinen landen oder nach vorn überkippen.","Knees track over your toes on take-off and landing.|Land quietly on the whole foot, hips back.","Landing stiff-legged or tipping forward."],
  "jump-forward-burpees":["Stütz mit festem Rumpf, Hüfte auf Schulterhöhe.|Landung weich in der Hocke, Knie in Fußrichtung.","Nach der Landung mit rundem Rücken direkt in die Hände fallen.","Plank with a braced core, hips level with shoulders.|Land softly in a squat, knees over your toes.","Collapsing onto your hands with a rounded back after landing."],
  "burpee-squat-jumps":["Stütz mit festem Rumpf, Hüfte auf Schulterhöhe.|Absprung und Landung mit Knien in Fußrichtung.","Unkontrolliert mit rundem Rücken aufrichten.","Plank with a braced core, hips level with shoulders.|Take off and land with knees over your toes.","Standing up uncontrolled with a rounded back."],
  "frogs":["In der Hocke Brust hoch, Rücken lang, Fersen möglichst am Boden.|Knie zeigen nach außen in Fußrichtung.","Den Rücken in der tiefen Hocke rund machen.","In the squat, chest up, back long, heels down if you can.|Knees point out over your toes.","Rounding your back at the bottom."],
  "stand-up-jumps":["Beim Aufstehen Füße flach, Oberkörper nach vorn über die Füße bringen.|Weich landen, Knie in Fußrichtung.","Sich ruckartig mit rundem Rücken hochreißen.","As you stand, feet flat and bring your chest over your feet.|Land softly, knees over your toes.","Jerking up with a rounded back."],
  "lateral-hops":["Oberkörper aufrecht und ruhig.|Knie leicht gebeugt, Fußgelenke federnd.","Mit gestreckten Beinen und lautem Aufprall landen.","Upper body upright and still.|Knees slightly bent, springy ankles.","Landing loudly with straight legs."],
  "fast-feet":["Leichte Hockposition, Rücken gerade, Brust vorn.|Gewicht auf den Fußballen.","Aufrichten und auf die Fersen fallen.","Slight athletic crouch, back flat, chest forward.|Weight on the balls of your feet.","Standing up and dropping onto your heels."],
  "box-step-ups":["Ganzen Fuß auf die Box setzen, Knie über dem Fuß.|Oberkörper aufrecht, mit dem oberen Bein hochdrücken.","Sich mit dem unteren Bein abstoßen oder das Knie nach innen knicken.","Put your whole foot on the box, knee over your foot.|Stay upright and drive up with the top leg.","Pushing off the bottom leg or letting the knee cave in."],
  "sprint-in-place":["Leichte Vorlage aus den Sprunggelenken, Rumpf gerade.|Arme im 90°-Winkel aus der Schulter.","Zurücklehnen und auf den Fersen laufen.","Slight forward lean from the ankles, torso straight.|Arms bent at 90°, swinging from the shoulders.","Leaning back and running on your heels."],

  "goblet-squat":["Gewicht nah an der Brust, Ellbogen zeigen nach unten.|Rücken neutral, Knie folgen den Zehen, Fersen bleiben am Boden.","Den unteren Rücken in der Tiefe rund werden lassen.","Keep the weight close to your chest, elbows down.|Neutral spine, knees follow your toes, heels stay down.","Letting your lower back round at the bottom."],
  "kb-swing":["Hüftbeuge: Po nach hinten, Rücken lang und gerade, Schienbeine fast senkrecht.|Oben aufrecht mit angespanntem Gesäß, nicht nach hinten lehnen.","Die Glocke mit den Armen heben, wie eine Kniebeuge schwingen oder bei Griffverlust festhalten wollen – seitlich weggehen und fallen lassen.","Hip hinge: hips back, spine long and flat, shins nearly vertical.|Stand tall at the top with glutes squeezed, don't lean back.","Lifting the bell with your arms, squatting the swing or trying to hold on when your grip fails – step aside and let it drop."],
  "db-thruster":["In der Kniebeuge Brust aufrecht, Ellbogen vorn.|Oben Rippen unten, Arme neben den Ohren.","Beim Drücken ins Hohlkreuz gehen.","In the squat, chest up, elbows forward.|At the top, ribs down, arms by your ears.","Arching your lower back as you press."],
  "romanian-deadlift":["Rücken neutral, Schulterblätter leicht zurück, Hanteln nah am Bein.|Knie leicht gebeugt, Bewegung kommt aus der Hüfte.","Mit rundem Rücken tiefer gehen, als es gerade bleibt.","Neutral spine, shoulder blades slightly back, weights close to your legs.|Knees soft, the movement comes from your hips.","Going lower than you can with a flat back and rounding."],
  "db-deadlift":["Brust raus, Rücken gerade, Blick leicht nach vorn unten.|Aus den Beinen drücken, Hüfte und Schultern steigen gleichzeitig.","Zuerst die Hüfte hochschießen lassen und mit dem Rücken ziehen.","Chest proud, flat back, eyes slightly down and forward.|Push with your legs, hips and shoulders rise together.","Shooting your hips up first and pulling with your back."],
  "bent-over-row":["Rücken gerade und fest, Nacken in Verlängerung der Wirbelsäule.|Schultern weg von den Ohren, Ellbogen nah am Körper.","Mit Schwung aus dem Oberkörper ziehen.","Flat, braced back, neck in line with your spine.|Shoulders away from your ears, elbows close.","Using body swing to heave the weight."],
  "one-arm-row":["Rücken waagerecht und gerade, Hüfte nicht aufdrehen.|Schulter der Zugseite nach hinten unten.","Den Oberkörper beim Ziehen nach oben drehen.","Back flat and level, don't open your hips.|Draw the working shoulder back and down.","Twisting your torso up as you row."],
  "floor-press":["Schulterblätter leicht zusammen, Füße fest am Boden.|Unterarme senkrecht, Ellbogen etwa 45° vom Körper.","Die Ellbogen weit seitlich ausstellen.","Shoulder blades gently squeezed, feet planted.|Forearms vertical, elbows about 45° from your body.","Flaring your elbows straight out to the sides."],
  "shoulder-press":["Rippen unten, Gesäß angespannt, Rücken neutral.|Hanteln über den Schultern, Kopf am Ende leicht nach vorn.","Ins Hohlkreuz lehnen, um das Gewicht hochzubringen.","Ribs down, glutes squeezed, neutral spine.|Weights over your shoulders, head slightly through at the top.","Leaning back into an arched spine to get the weight up."],
  "push-press":["Beim Eintauchen Oberkörper senkrecht, Knie in Fußrichtung.|Oben Rumpf fest, Arme gestreckt über den Ohren.","Beim Eintauchen nach vorn kippen.","Dip with an upright torso, knees over your toes.|At the top, core tight, arms locked by your ears.","Tipping forward during the dip."],
  "weighted-reverse-lunge":["Oberkörper aufrecht, Schultern tief.|Vorderes Knie über dem Fuß, Gewicht auf der vorderen Ferse.","Das vordere Knie nach innen fallen lassen.","Torso upright, shoulders down.|Front knee over your foot, weight on the front heel.","Letting the front knee drift inward."],
  "front-rack-carry":["Aufrecht, Rippen unten, Ellbogen vorn.|Blick nach vorn, ruhiger Rumpf.","Nach hinten ins Hohlkreuz lehnen.","Tall, ribs down, elbows forward.|Eyes forward, steady torso.","Leaning back into an arched spine."],
  "farmer-carry":["Schultern tief und leicht zurück, Kopf lang.|Rumpf fest, Hüfte gerade.","Die Schultern hochziehen oder zur Seite kippen.","Shoulders down and slightly back, tall neck.|Braced core, level hips.","Shrugging your shoulders or leaning to one side."],
  "kb-clean":["Wie beim Swing: Hüftbeuge mit geradem Rücken.|Oben Handgelenk gerade, Ellbogen am Körper.","Die Glocke auf den Unterarm knallen lassen.","Like a swing: hip hinge with a flat back.|At the top, straight wrist, elbow tucked.","Letting the bell crash onto your forearm."],
  "renegade-row":["Stütz mit breitem Stand, Hüfte parallel zum Boden.|Schulter über der Stützhand.","Die Hüfte beim Ziehen aufdrehen oder auf runden Hanteln arbeiten, die wegrollen können.","Plank with a wide stance, hips parallel to the floor.|Shoulder over the supporting hand.","Rotating your hips open as you row or working on round dumbbells that can roll away."],

  "push-ups":["Linie von Kopf bis Ferse, Gesäß und Oberschenkel angespannt.|Ellbogen etwa 45° vom Körper, Hände flach mit gespreizten Fingern, Handgelenke unter den Schultern.","Die Hüfte durchhängen lassen oder den Po hochstrecken. Bei Handgelenkschmerz auf den Fäusten oder an Griffen stützen.","One line from head to heels, glutes and thighs squeezed.|Elbows about 45° from your body, hands flat with fingers spread, wrists under your shoulders.","Sagging hips or piking your hips up. If your wrists hurt, support yourself on your fists or on handles."],
  "pike-push-ups":["Hüfte hoch, Rücken möglichst gerade.|Ellbogen nach hinten, Kopf zwischen den Armen, Nacken lang.","Mit rundem Rücken, hochgezogenen Schultern oder dem Scheitel im Boden arbeiten.","Hips high, back as straight as possible.|Elbows travel back, head between your arms, long neck.","Working with a rounded back, shrugged shoulders or by dropping your head to the floor."],
  "triceps-dips":["Schultern tief und zurück, Rücken nah an der Bank.|Nur bis etwa 90° im Ellbogen absenken.","Zu tief gehen, die Schultern nach vorn rollen oder weit von der Bank wegsinken. Bei Schulterschmerzen weglassen und Enge Liegestütze wählen.","Shoulders down and back, back close to the bench.|Lower only until your elbows reach about 90°.","Going too deep, rolling your shoulders forward or sinking far from the bench. Skip it if your shoulders hurt and use close-grip push-ups instead."],
  "squat-hold":["Brust aufrecht, Rücken neutral.|Knie über den Füßen, Gewicht auf den Fersen.","Die Knie nach innen fallen lassen.","Chest up, neutral spine.|Knees over your feet, weight in your heels.","Letting your knees cave in."],
  "walking-lunges":["Oberkörper aufrecht, Becken gerade.|Vorderes Knie über dem Fuß, hinteres Knie zeigt nach unten.","Mit dem Oberkörper weit nach vorn kippen.","Torso upright, pelvis level.|Front knee over your foot, back knee points down.","Tipping far forward with your torso."],
  "reverse-lunges":["Oberkörper aufrecht, Rumpf fest.|Vorderes Knie zeigt in Richtung der Zehen, Ferse bleibt am Boden.","Das vordere Knie nach innen knicken lassen.","Torso upright, core braced.|Front knee points in line with your toes, heel stays down.","Letting the front knee collapse inward."],
  "side-lunges":["Brust vorn, Rücken gerade, Hüfte nach hinten.|Gebeugtes Knie zeigt in Richtung der Zehen, beide Fersen bleiben am Boden.","Das Knie nach innen fallen lassen oder die Ferse abheben.","Chest forward, back flat, hips back.|Bent knee points in line with your toes, both heels stay down.","Letting the knee cave in or lifting the heel."],
  "cossack-squats":["Brust aufrecht, Rücken lang.|Gebeugtes Knie in Fußrichtung, Ferse am Boden.","Tiefer gehen, als die Ferse unten bleibt. Bei Ziehen in der Leiste kleiner gehen.","Chest up, long spine.|Bent knee tracks your toes, heel down.","Going deeper than your heel can stay down. With a pulling feeling in the groin, go less deep."],
  "deep-squats":["Rücken neutral, Brust aufrecht.|Knie nach außen in Fußrichtung.","Unten den Rücken rund werden lassen.","Neutral spine, chest up.|Knees push out over your toes.","Letting your back round at the bottom."],
  "pistol-assist":["Standknie in Fußrichtung, Ferse bleibt unten.|Oberkörper leicht nach vorn, Rücken gerade.","Mit dem Knie nach innen kippen.","Standing knee tracks your toes, heel stays down.|Lean slightly forward with a flat back.","Letting the knee drop inward."],
  "plank-steps":["Hüfte ruhig und parallel zum Boden.|Füße etwas breiter für mehr Stabilität.","Die Hüfte beim Hochdrücken hin und her schaukeln.","Hips still and level.|Feet a little wider for stability.","Rocking your hips from side to side."],
  "bear-crawl":["Rücken flach wie ein Tisch.|Hände unter den Schultern, Knie unter der Hüfte.","Den Po hochstrecken.","Back flat like a table.|Hands under shoulders, knees under hips.","Sticking your hips up high."],
  "wall-sit":["Rücken und Hinterkopf an der Wand.|Füße so weit vorn, dass die Schienbeine etwa senkrecht stehen und die Knie in Richtung der Zehen zeigen.","Die Füße zu nah an der Wand, sodass die Knie weit nach vorn schieben oder nach innen fallen.","Back and head against the wall.|Feet far enough forward that your shins are about vertical and your knees point in line with your toes.","Feet too close to the wall so your knees drift far forward or cave in."],
  "calf-raises":["Aufrecht, Gewicht über dem Großzehenballen.|Knie gestreckt, aber nicht durchgedrückt.","Mit den Füßen nach außen abrollen.","Stand tall, weight over the big-toe ball.|Knees straight but not locked.","Rolling out onto the outer edges of your feet."],
  "glute-bridge":["Rippen unten, Bewegung aus dem Gesäß.|Knie hüftbreit, zeigen nach vorn.","Oben ins Hohlkreuz überstrecken.","Ribs down, drive with your glutes.|Knees hip-width, pointing forward.","Overarching your lower back at the top."],

  "pull-ups":["Schultern zuerst nach unten ziehen, Brust zur Stange.|Rumpf fest, Beine ruhig.","Mit Schwung ziehen oder die Schultern zu den Ohren ziehen.","Pull your shoulders down first, chest to the bar.|Core braced, legs still.","Kipping or shrugging your shoulders to your ears."],
  "negative-pull-ups":["Schultern tief halten, auch beim Absenken.|Körper gerade, nicht schwingen.","Unten fallen lassen statt kontrolliert zu senken.","Keep your shoulders down on the way down.|Body straight, no swinging.","Dropping at the bottom instead of lowering with control."],
  "inverted-rows":["Körper steif wie ein Brett, Gesäß angespannt.|Schulterblätter zusammen, Hals lang.","Die Hüfte durchhängen lassen.","Body rigid like a plank, glutes squeezed.|Shoulder blades together, long neck.","Letting your hips sag."],
  "superman-hold":["Blick zum Boden, Nacken lang.|Gesäß angespannt, nur klein abheben.","Den Kopf in den Nacken legen.","Look down, long neck.|Squeeze your glutes and lift only a little.","Cranking your head back."],
  "reverse-snow-angels":["Stirn knapp über dem Boden, Nacken lang.|Schulterblätter aktiv nach hinten unten.","Die Schultern Richtung Ohren ziehen.","Forehead just off the floor, long neck.|Shoulder blades active, back and down.","Shrugging your shoulders towards your ears."],
  "bird-dog":["Rücken flach, Becken bleibt waagerecht.|Arm und Bein nur bis zur Körperlinie heben.","Das Bein zu hoch heben und ins Hohlkreuz gehen.","Flat back, pelvis stays level.|Lift arm and leg only to body height.","Lifting the leg too high and arching your back."],
  "prone-y-raise":["Stirn knapp über dem Boden, Nacken lang.|Schulterblätter nach hinten unten ziehen.","Mit dem unteren Rücken statt den Schultern heben.","Forehead just off the floor, long neck.|Draw your shoulder blades back and down.","Lifting with your lower back instead of your shoulders."],
  "prone-t-raise":["Nacken lang, Blick zum Boden.|Arme auf Schulterhöhe, Schulterblätter zusammen.","Die Schultern hochziehen.","Long neck, eyes down.|Arms at shoulder height, blades squeezed together.","Shrugging your shoulders up."],
  "good-mornings":["Rücken neutral, Ellbogen offen.|Knie leicht gebeugt, Gewicht auf den Fersen.|Hände nur locker am Kopf, nicht am Nacken ziehen.","Tiefer beugen, als der Rücken gerade bleibt.","Neutral spine, elbows open.|Knees soft, weight in your heels.|Hands only rest lightly at your head, don't pull on your neck.","Bending lower than your back can stay flat."],
  "swimmers":["Blick zum Boden, Nacken lang.|Bauch leicht angespannt, Becken bleibt am Boden.","Den Kopf hochreißen.","Look down, long neck.|Abs lightly braced, pelvis on the floor.","Jerking your head up."],
  "cobra-lift":["Schultern weg von den Ohren, Blick schräg nach vorn unten.|Becken bleibt am Boden, Gesäß locker.","Sich mit den Armen weit hochdrücken und den unteren Rücken stauchen.","Shoulders away from your ears, eyes down and forward.|Pelvis stays down, glutes relaxed.","Pushing up high with your arms and crunching your lower back."],
  "scapular-push-ups":["Arme gestreckt, Rumpf wie im Stütz.|Bewegung nur aus den Schulterblättern.","Die Ellbogen beugen oder ins Hohlkreuz fallen.","Arms straight, body like a plank.|Move only your shoulder blades.","Bending your elbows or sagging into your lower back."],
  "scapular-pull-ups":["Arme bleiben gestreckt.|Rumpf fest, Beine ruhig.","Mit den Armen ziehen.","Arms stay straight.|Core braced, legs still.","Pulling with your arms."],
  "dead-hang":["Schultern leicht aktiv, nicht ganz „aushängen“.|Rumpf locker fest, Beine ruhig.","Mit Schwung ab- oder aufspringen oder weiterhängen, wenn der Griff nachlässt – lieber kontrolliert absteigen. Bei Schmerz in Schulter oder Ellbogen absetzen.","Shoulders lightly active, not fully relaxed.|Core gently braced, legs still.","Jumping on or off with momentum, or hanging on once your grip fails – step down with control instead. Let go if your shoulder or elbow hurts."],

  "air-squats":["Brust aufrecht, Rücken neutral.|Knie folgen den Zehen, Fersen bleiben am Boden.","Die Knie nach innen fallen lassen.","Chest up, neutral spine.|Knees follow your toes, heels stay down.","Letting your knees cave in."],
  "split-squats":["Oberkörper aufrecht, Becken gerade.|Vorderes Knie über dem Fuß.","Das Gewicht auf den hinteren Fuß verlagern.","Torso upright, pelvis level.|Front knee over your foot.","Shifting your weight onto the back foot."],
  "bulgarian-split-squats":["Oberkörper leicht nach vorn, Rücken gerade.|Vorderes Knie in Fußrichtung, Ferse bleibt unten.","Das vordere Knie nach innen kippen.","Slight forward lean, flat back.|Front knee tracks your toes, heel down.","Letting the front knee collapse inward."],
  "forward-lunges":["Oberkörper aufrecht, Rumpf fest.|Vorderes Knie zeigt in Richtung der Zehen, Ferse bleibt am Boden.","Unkontrolliert in den Schritt fallen.","Torso upright, core braced.|Front knee points in line with your toes, heel stays down.","Crashing into the step without control."],
  "single-leg-glute-bridge":["Becken waagerecht, Rippen unten.|Standknie zeigt nach vorn.","Das Becken zur freien Seite absacken lassen.","Level pelvis, ribs down.|Supporting knee points forward.","Letting your hip drop on the free-leg side."],
  "lateral-lunge-pulses":["Brust vorn, Rücken gerade.|Gebeugtes Knie in Fußrichtung.","Mit rundem Rücken pulsieren.","Chest forward, flat back.|Bent knee over your toes.","Pulsing with a rounded back."],

  "plank":["Linie von Kopf bis Ferse, Blick zum Boden.|Gesäß und Oberschenkel anspannen, Ellbogen unter den Schultern.","Durchhängen oder den Po hochstrecken.","One line from head to heels, eyes down.|Squeeze glutes and thighs, elbows under shoulders.","Sagging or piking your hips."],
  "side-plank":["Ellbogen unter der Schulter, Körper in einer Linie.|Hüfte nach vorn schieben, nicht nach hinten knicken.","Die Hüfte absinken lassen.","Elbow under your shoulder, body in one line.|Push your hips forward, don't bend back.","Letting your hips drop."],
  "dead-bug":["Unterer Rücken bleibt flach am Boden (Becken leicht einrollen).|Langsam und kontrolliert ausatmen beim Strecken.","Ins Hohlkreuz gehen, sobald Arm und Bein sich strecken.","Lower back stays flat on the floor (tuck your pelvis slightly).|Exhale slowly as you extend.","Arching your back as your arm and leg extend."],
  "bicycle-crunches":["Unterer Rücken am Boden, Schultern angehoben.|Drehen aus dem Oberkörper, Ellbogen offen.","Mit den Händen am Nacken ziehen.","Lower back down, shoulders lifted.|Rotate through your upper back, elbows open.","Pulling on your neck with your hands."],
  "leg-raises":["Unterer Rücken am Boden, Becken leicht eingerollt.|Beine langsam senken, ohne Schwung.","Die Beine fallen lassen und ins Hohlkreuz gehen.","Lower back down, pelvis slightly tucked.|Lower your legs slowly, no swinging.","Dropping your legs and arching your back."],
  "jackknives":["Bauch fest, Rücken rollt kontrolliert ab.|Arme und Beine gleichzeitig bewegen.","Mit Schwung hochreißen.","Abs tight, roll your spine with control.|Move arms and legs together.","Yanking up with momentum."],
  "side-jackknives":["Körper in einer Linie auf der Seite, nicht nach hinten kippen.|Aus der seitlichen Bauchmuskulatur heben.","Mit Kopf und Nacken ziehen.","Body in one line on your side, don't roll back.|Lift with your side abs.","Pulling with your head and neck."],
  "hollow-hold":["Unterer Rücken fest am Boden, Becken eingerollt.|Kinn leicht zur Brust, Schultern abgehoben.","Die Beine so tief halten, dass der Rücken hohl wird.","Lower back pressed down, pelvis tucked.|Chin slightly tucked, shoulders off the floor.","Holding your legs so low that your back arches."],
  "russian-twists":["Brustbein aufrecht, Rücken lang, nicht rund.|Drehen aus dem Oberkörper, Becken ruhig.","Mit rundem Rücken nach hinten kippen. Bei Rückenbeschwerden die Füße am Boden lassen und kleiner drehen.","Chest up, long spine, not rounded.|Rotate through your upper body, pelvis still.","Slumping back with a rounded spine. With back problems keep your feet down and rotate less."],
  "sit-ups":["Kinn leicht zur Brust, Nacken locker.|Füße bleiben am Boden, Bauch führt die Bewegung.","Sich mit den Händen am Kopf hochziehen.","Chin slightly tucked, relaxed neck.|Feet stay down, your abs lead.","Yanking yourself up by your head."],
  "toe-touches":["Unterer Rücken am Boden.|Schulterblätter abheben, Nacken lang.","Mit dem Kopf nach vorn nicken.","Lower back down.|Lift your shoulder blades, long neck.","Jerking your head forward."],
  "plank-shoulder-taps":["Hüfte parallel zum Boden, Füße etwas breiter.|Gesäß und Bauch fest.","Mit der Hüfte hin und her schaukeln.","Hips parallel to the floor, feet a bit wider.|Glutes and abs tight.","Rocking your hips side to side."],
  "toes-to-bar":["Schultern aktiv, Rumpf fest.|Becken zum Heben einrollen.","Mit großem Schwung arbeiten.","Active shoulders, braced core.|Tuck your pelvis to lift.","Using big swings."]
};

Object.assign(EX_INFO, {
  "reverse-crunch":["Rückenlage, Arme neben dem Körper, Knie über der Hüfte angewinkelt.|Knie Richtung Brust ziehen und das Becken ein Stück vom Boden abrollen.|Langsam Wirbel für Wirbel zurück, ohne Schwung.","Lie on your back, arms by your sides, knees bent over your hips.|Pull your knees towards your chest and curl your pelvis off the floor.|Lower slowly one vertebra at a time, no momentum."],
  "chin-ups":["Im Untergriff an einer fest verankerten, belastbaren Stange hängen, Daumen um die Stange, Hände schulterbreit.|Schultern nach unten ziehen und das Kinn über die Stange ziehen.|Kontrolliert in den gestreckten Hang absenken.","Hang with an underhand grip from a firmly anchored, load-rated bar, thumbs around the bar, hands shoulder-width.|Pull your shoulders down and your chin over the bar.|Lower with control to a full hang."],
  "commando-pull-ups":["Die Stange längs vor dir greifen, Hände dicht hintereinander.|Den Kopf auf eine Seite der Stange hochziehen.|Absenken, im nächsten Intervall zur anderen Seite.","Grip the bar lengthwise, hands close one behind the other.|Pull your head up to one side of the bar.|Lower, pull to the other side next interval."],
  "parallel-bar-dips":["Mit leichtem Sprung oder von einer Stufe in den Stütz zwischen zwei Holmen kommen, Arme gestreckt, Schultern tief. Vorher den Stütz 20 Sekunden halten können.|Absenken, bis die Oberarme etwa waagerecht sind, nicht tiefer, wenn die Schulter vorn zieht.|Kraftvoll hochdrücken, bis die Arme gestreckt sind.","Get into the support between two bars with a small jump or from a step, arms straight, shoulders down. You should be able to hold the support for 20 seconds first.|Lower until your upper arms are about horizontal, not deeper if the front of your shoulder pulls.|Press up powerfully until your arms are straight."],
  "support-hold":["Auf Barren oder Parallettes in den Stütz drücken.|Arme gestreckt, Schultern nach unten gedrückt.|Ruhig halten und atmen.","Press up into a support on dip bars or parallettes.|Arms straight, shoulders pushed down.|Hold steadily and breathe."],
  "hanging-knee-raise":["An der Stange hängen, Arme gestreckt.|Knie kontrolliert zur Brust ziehen.|Langsam senken, ohne zu schwingen.","Hang from the bar, arms straight.|Draw your knees to your chest with control.|Lower slowly without swinging."],
  "hanging-leg-raise":["An der Stange hängen, Beine gestreckt.|Gestreckte Beine bis auf Hüfthöhe oder höher heben.|Kontrolliert senken.","Hang from the bar, legs straight.|Raise your straight legs to hip height or higher.|Lower with control."],
  "hanging-l-sit":["An der Stange hängen.|Gestreckte Beine waagerecht nach vorn heben.|Halten, ruhig atmen.","Hang from the bar.|Raise your straight legs forward to horizontal.|Hold and breathe calmly."],
  "l-sit":["Auf Barren oder Parallettes stützen.|Gestreckte Beine waagerecht nach vorn heben.|Halten, Schultern nach unten drücken.","Support yourself on dip bars or parallettes.|Raise your straight legs to horizontal.|Hold, pushing your shoulders down."],
  "windshield-wipers":["Im Hang die Beine anheben, Knie gebeugt oder gestreckt (leichter: gebeugt, hüfthoch).|Beine kontrolliert zur einen Seite kippen.|Über die Mitte zur anderen Seite führen, ohne zu schwingen.","In the hang, lift your legs, knees bent or straight (easier: bent and hip-high).|Tilt your legs to one side with control.|Move through the middle to the other side without swinging."],
  "muscle-ups":["Nur nach sicheren Klimmzügen und Dips versuchen. Im Hang greifen, die Handballen liegen oben auf der Stange (falscher Griff).|Kräftig zur Brust ziehen und die Ellbogen schnell nach hinten und über die Stange bringen.|Im Stütz die Arme strecken und danach langsam wieder in den Hang absenken.","Only try this after solid pull-ups and dips. In the hang, grip with the base of your palms on top of the bar (false grip).|Pull hard towards your chest and bring your elbows quickly back and over the bar.|Straighten your arms in the support, then lower slowly back into the hang."],
  "burpee-pull-ups":["Unter die Klimmzugstange stellen.|In die Hocke gehen, Hände aufsetzen, die Beine in den Liegestütz springen und einen Liegestütz machen.|Füße zurück zu den Händen springen und aus der Hocke zur Stange hochspringen.|Einen Klimmzug machen, kontrolliert in den Hang absenken und zurück auf den Boden.","Stand under the pull-up bar.|Squat down, place your hands, jump your feet back into a plank and do a push-up.|Jump your feet back to your hands and jump up to the bar from the squat.|Do a pull-up, lower with control into the hang and drop back to the floor."],
  "monkey-bar-traverse":["Stange und Sprossen prüfen (fest, nicht nass), an der ersten Sprosse mit beiden Händen hängen.|Mit einer Hand zur nächsten Sprosse greifen, den Körper ruhig mitnehmen.|Im Wechsel weiterhangeln, am Ende kontrolliert absteigen, nicht abspringen.","Check the bars and rungs (secure, not wet) and hang from the first rung with both hands.|Reach to the next rung with one hand, move your body along calmly.|Keep traversing alternately and step down at the end with control, don't jump off."],
  "skin-the-cat":["Im Hang die Schultern aktiv halten und die Knie zur Brust ziehen.|Die Beine langsam zwischen den Armen durchführen und den Körper nach hinten absenken, bis die Hüfte unter der Stange ist. Tiefer nur, wenn die Schultern es angenehm zulassen.|Auf demselben Weg zurück in den Hang, dann kontrolliert absteigen.","From the hang keep your shoulders active and pull your knees to your chest.|Pass your legs slowly between your arms and lower your body back until your hips are under the bar. Go further only if your shoulders allow it comfortably.|Return the same way to the hang, then step down with control."],
  "archer-push-ups":["Sehr breiter Liegestütz.|Zu einer Hand absenken, der andere Arm streckt sich seitlich.|Hochdrücken, Seite nach jedem Intervall wechseln.","Very wide push-up position.|Lower towards one hand while the other arm straightens.|Press up, switch sides after each interval."],
  "pistol-squats":["Erst versuchen, wenn die Assist-Variante ohne Festhalten tief und kontrolliert klappt. Auf einem Bein stehen, das andere Bein nach vorn gestreckt.|Langsam tief auf dem Standbein absenken, Arme nach vorn.|Hochdrücken, Seite nach jedem Intervall wechseln.","Try it only once the assisted version works deep and controlled without holding on. Stand on one leg, the other leg straight in front.|Lower slowly and deep on the standing leg, arms forward.|Push up, switch sides after each interval."],
  "dragon-flags":["Auf den Rücken legen und mit beiden Händen hinter dem Kopf eine feste, kippsichere Stütze greifen (verschraubte Stange, schwere Bank).|Den gestreckten Körper anheben, bis nur Schulterblätter und oberer Rücken aufliegen; der Nacken trägt nichts. Leichter: Knie angezogen.|Wie ein steifes Brett langsam absenken, ohne dass die Hüfte abknickt oder der Rücken hohl wird.","Lie on your back and grip a solid, tip-proof anchor behind your head (bolted bar, heavy bench).|Lift your straight body until only your shoulder blades and upper back are on the floor; your neck takes no load. Easier: knees tucked.|Lower slowly as one stiff plank, without folding at the hips or letting your back hollow."],
  "clap-push-ups":["Nur nach sauberen, kräftigen Liegestützen: Stützposition, Körper gerade.|Explosiv hochdrücken, sodass die Hände abheben, und klatschen.|Weich mit leicht gebeugten Armen landen.","Only after clean, strong push-ups: plank position, body straight.|Press up explosively so your hands leave the floor, and clap.|Land softly with slightly bent arms."],
  "tuck-jumps":["Hüftbreit stehen, leicht in die Knie.|Explosiv hochspringen und die Knie zur Brust ziehen.|Weich landen und direkt weiterspringen.","Stand hip-width, knees slightly bent.|Jump explosively and pull your knees to your chest.|Land softly and go straight into the next jump."],
  "close-grip-push-ups":["Hände schulterbreit, etwas enger als beim normalen Liegestütz.|Absenken, die Ellbogen streifen am Körper entlang.|Hochdrücken, bis die Arme gestreckt sind.","Hands shoulder-width, a bit narrower than a normal push-up.|Lower with your elbows brushing past your ribs.|Press up until your arms are straight."],
  "diamond-push-ups":["Hände unter der Brust, Daumen und Zeigefinger bilden ein Dreieck.|Körper gerade, Brust Richtung Hände senken.|Kraftvoll hochdrücken, Ellbogen bleiben nah am Körper.","Hands under your chest, thumbs and index fingers form a triangle.|Keep your body straight and lower your chest to your hands.|Press up, elbows stay close to your body."],
  "sphinx-push-ups":["Im Unterarmstütz beginnen, Unterarme parallel, Ellbogen unter den Schultern (leichter: Knie am Boden).|Nur aus dem Trizeps die Unterarme vom Boden drücken, bis die Arme gestreckt sind.|Langsam zurück auf die Unterarme.","Start in a forearm plank, forearms parallel, elbows under your shoulders (easier: knees on the floor).|Press your forearms off the floor with your triceps until your arms are straight.|Lower slowly back onto your forearms."],
  "triceps-curls":["Eine Kurzhantel mit beiden Händen senkrecht über den Kopf halten.|Ellbogen beugen und die Hantel langsam hinter den Kopf senken.|Wieder nach oben strecken.","Hold one dumbbell upright overhead with both hands.|Bend your elbows and slowly lower it behind your head.|Extend back up."],
  "arm-circles":["Aufrecht stehen, Arme seitlich auf Schulterhöhe strecken.|Kleine Kreise nach vorn machen.|Nach der Hälfte der Zeit die Richtung wechseln.","Stand tall, arms straight out at shoulder height.|Make small circles forwards.|Halfway through, switch direction."],
  "neck-stretch":["Aufrecht sitzen oder stehen.|Den Kopf zur Seite neigen, Ohr Richtung Schulter; die Hand liegt nur sanft auf.|Halten, ruhig atmen, dann die Seite wechseln.","Sit or stand tall.|Tilt your head to the side, ear towards shoulder; your hand rests on lightly.|Hold, breathe calmly, then switch sides."],
  "pallof-press":["Seitlich zum Kabelzug auf Brusthöhe stellen, den Griff mit beiden Händen vor die Brust nehmen, einen Schritt vom Turm weggehen.|Die Arme langsam nach vorn strecken, der Rumpf bleibt gerade und dreht sich nicht zum Kabel.|Kurz halten, die Hände zurück zur Brust führen; nach dem Satz die Seite wechseln.","Stand side-on to a cable at chest height, hold the handle with both hands at your chest, step away from the tower.|Press your arms slowly forward; your torso stays straight and doesn't turn towards the cable.|Hold briefly, bring your hands back to your chest; switch sides after the set."],
  "copenhagen-plank":["Seitlich hinlegen, auf den unteren Unterarm stützen (Ellbogen unter der Schulter), das obere Knie auf eine stabile Bank oder Stuhlkante legen, das untere Bein hängt frei darunter.|Die Hüfte anheben, bis der Körper vom Kopf bis zum oberen Knie eine Linie bildet, das untere Bein schwebt.|Halten, ruhig atmen, nach dem Intervall die Seite wechseln.","Lie on your side and prop on the lower forearm (elbow under your shoulder), rest the upper knee on a stable bench or chair edge, the lower leg hangs free beneath.|Lift your hips until your body is one line from head to upper knee; the lower leg floats.|Hold, breathe calmly, switch sides after the interval."],
  "backpack-row":["Einen gut gepackten, fest geschlossenen Rucksack mit beiden Händen an den Riemen oder dem Griff halten, hüftbreit stehen, aus der Hüfte etwa 45° vorbeugen, Rücken gerade.|Die Ellbogen nach hinten zur Hüfte ziehen, den Rucksack zum Bauch führen, Schulterblätter zusammen.|Langsam wieder strecken, ohne den Oberkörper aufzurichten.","Hold a well-packed, firmly closed backpack by the straps or handle with both hands, stand hip-width, hinge forward about 45° with a flat back.|Pull your elbows back to your hips and bring the pack to your belly, shoulder blades together.|Extend slowly without standing up."],
  "knee-push-ups":["Auf allen vieren, Hände etwas breiter als die Schultern, Knie am Boden, Körper eine Linie vom Kopf bis zu den Knien.|Brust kontrolliert bis knapp über den Boden senken, Ellbogen schräg nach hinten.|Hochdrücken, ohne dass die Hüfte nach hinten ausweicht oder durchhängt.","On all fours, hands a little wider than your shoulders, knees on the floor, body one line from head to knees.|Lower your chest to just above the floor, elbows angled back.|Press up without letting your hips push back or sag."],
  "single-leg-calf-raise":["Auf einem Bein stehen, Fußballen am Boden oder auf einer Stufenkante, mit einer Hand leicht an Wand oder Geländer festhalten.|Langsam auf die Zehenspitzen hochdrücken, das Sprunggelenk bleibt gerade.|In zwei bis drei Sekunden absenken (an der Stufe bis unter die Kante), Seite nach dem Intervall wechseln.","Stand on one leg, ball of the foot on the floor or a step edge, one hand resting lightly on a wall or rail.|Rise slowly onto your toes, ankle stays straight.|Lower over two to three seconds (below the edge on a step), switch sides after the interval."],
  "negative-dips":["Auf Barren oder Parallettes in den Stütz steigen, Arme gestreckt, Schultern tief.|So langsam wie möglich absenken, bis die Oberarme etwa waagerecht sind, nicht tiefer, wenn die Schulter vorn zieht.|Unten mit den Füßen absetzen und wieder in den Stütz steigen, Hochdrücken ist nicht nötig.","Climb into a support on dip bars or parallettes, arms straight, shoulders down.|Lower as slowly as you can until your upper arms are about horizontal, not deeper if the front of your shoulder pulls.|Put your feet down at the bottom and step back into the support, no need to press up."],
  "db-bench-press":["Rücklings auf die Bank legen, die Hanteln über der Brust halten, die Füße stehen fest am Boden.|Die Hanteln kontrolliert auf Brusthöhe absenken, die Ellbogen schräg zum Körper (etwa 45°).|Gleichmäßig wieder nach oben drücken, ohne die Ellbogen hart durchzudrücken.","Lie back on the bench with the dumbbells over your chest, feet planted firmly.|Lower the dumbbells under control to chest height, elbows at an angle to your body (about 45°).|Press back up evenly without snapping your elbows straight."],
  "db-step-ups":["Mit einer Hantel in jeder Hand vor eine stabile Stufe oder Bank stellen.|Einen Fuß ganz auf die Stufe setzen und aus dem vorderen Bein hochsteigen, bis du aufrecht stehst.|Kontrolliert wieder absteigen; nach der Hälfte der Zeit die Seite wechseln.","Stand in front of a sturdy step or bench with a dumbbell in each hand.|Place one whole foot on the step and rise through the front leg until you stand tall.|Step down under control; switch sides halfway."],
  "sumo-squat-db":["Weit stehen, die Zehen leicht nach außen, die Hantel mit beiden Händen senkrecht zwischen den Beinen halten.|Die Hüfte nach unten sinken lassen, die Knie folgen den Füßen, der Rücken bleibt aufrecht.|Aus den Fersen hochdrücken und oben das Gesäß anspannen.","Stand wide with your toes slightly out and hold the dumbbell upright between your legs with both hands.|Sink your hips down, knees follow your feet, back stays upright.|Drive up through your heels and squeeze your glutes at the top."],
  "single-leg-rdl":["Auf einem Bein stehen, das Standknie leicht gebeugt; bei Bedarf mit einer Hand an Wand oder Stuhl festhalten.|Die Hüfte nach hinten schieben und den Oberkörper nach vorn kippen, das freie Bein streckt sich dabei nach hinten.|Mit dem Gesäß wieder aufrichten, kurz stehen, dann die Seite wechseln.","Stand on one leg with a soft knee; hold a wall or chair with one hand if needed.|Push your hips back and tip your torso forward while the free leg reaches behind you.|Rise by squeezing your glutes, pause standing, then switch sides."],
  "nordic-curl":["Auf einer weichen Unterlage knien und die Fersen fixieren lassen (Partner, schweres Sofa oder Gerät). Oberkörper aufrecht, die Hände vor der Brust bereit.|Den Körper in einer Linie von den Knien bis zum Kopf so langsam wie möglich nach vorn sinken lassen; die Oberschenkelrückseite bremst.|Kurz vor dem Boden mit den Händen abfangen, hochdrücken und von vorn beginnen.","Kneel on a soft surface and have your heels held down (partner, heavy sofa or machine). Torso upright, hands ready in front of your chest.|Lower your body forward in one line from knees to head as slowly as you can; the back of your thighs does the braking.|Catch yourself with your hands near the floor, push back up and start again."],
  "chin-tuck":["Aufrecht sitzen oder stehen, Blick geradeaus.|Das Kinn waagerecht nach hinten schieben, als würdest du ein Doppelkinn machen; der Kopf bleibt gerade, nicht nicken.|Etwa 5 Sekunden halten, lösen und ruhig im Wechsel wiederholen.","Sit or stand tall, eyes forward.|Slide your chin straight back as if making a double chin; keep your head level, don't nod.|Hold for about 5 seconds, release and repeat calmly."],
  "thoracic-rotation":["Im Vierfüßlerstand eine Hand hinter den Kopf legen, die andere Hand bleibt unter der Schulter.|Den Ellbogen der Kopfhand Richtung Boden führen, dann den Brustkorb aufdrehen und den Ellbogen zur Decke öffnen; der Blick folgt.|Langsam im Atemrhythmus wiederholen, dann die Seite wechseln.","On all fours, put one hand behind your head; the other hand stays under your shoulder.|Bring the elbow of the head hand down towards the floor, then open your chest and rotate the elbow up to the ceiling; your eyes follow.|Repeat slowly with your breathing, then switch sides."],
  "shoulder-stretch":["Einen gestreckten Arm vor der Brust zur anderen Seite führen.|Mit der anderen Hand am Oberarm sanft heranziehen.|Halten, dann die Seite wechseln.","Bring one straight arm across your chest.|Gently pull it in at the upper arm with the other hand.|Hold, then switch sides."],
  "triceps-stretch":["Einen Arm nach oben strecken und beugen, die Hand liegt zwischen den Schulterblättern.|Mit der anderen Hand den Ellbogen sanft Richtung Kopf ziehen.|Halten, dann die Seite wechseln.","Raise one arm and bend it so your hand rests between your shoulder blades.|Gently pull the elbow towards your head with the other hand.|Hold, then switch sides."],
  "biceps-stretch":["Seitlich neben eine Wand stellen, den gestreckten Arm auf Schulterhöhe nach hinten an die Wand legen.|Den Körper langsam von der Wand wegdrehen.|Halten, dann die Seite wechseln.","Stand side-on to a wall, straight arm back on the wall at shoulder height.|Slowly turn your body away from the wall.|Hold, then switch sides."],
  "chest-stretch":["Den Unterarm senkrecht an eine Wand oder einen Türrahmen legen, Ellbogen auf Schulterhöhe.|Mit dem Körper langsam nach vorn und von der Wand wegdrehen.|Halten, dann die Seite wechseln.","Place your forearm upright on a wall or door frame, elbow at shoulder height.|Slowly step forward and turn away from the wall.|Hold, then switch sides."],
  "wrist-stretch":["Einen Arm nach vorn strecken, Handfläche zeigt nach vorn.|Mit der anderen Hand die Finger sanft zurückziehen (dehnt die Unterarm-Innenseite).|Dann den Handrücken nach vorn drehen und die Hand sanft nach unten ziehen (dehnt die Außenseite). Je etwa 20 Sekunden, danach die andere Hand.","Extend one arm, palm facing forward.|Gently pull the fingers back with your other hand (stretches the inside of the forearm).|Then turn the back of the hand forward and gently pull it down (stretches the outside). About 20 seconds each, then the other hand."],
  "side-bend":["Hüftbreit stehen, einen Arm über den Kopf strecken.|Zur Seite neigen, als würdest du über eine Mauer greifen.|Halten, dann die Seite wechseln.","Stand hip-width and reach one arm overhead.|Lean to the side as if reaching over a wall.|Hold, then switch sides."],
  "cat-cow":["Vierfüßlerstand, Hände unter den Schultern, Knie unter der Hüfte.|Ausatmen: Rücken rund machen, Kinn zur Brust.|Einatmen: Brust nach vorn, Blick leicht nach oben; im Wechsel.","On all fours, hands under shoulders, knees under hips.|Exhale: round your back, chin to chest.|Inhale: chest forward, look slightly up; alternate."],
  "childs-pose":["Aus dem Vierfüßlerstand den Po Richtung Fersen setzen.|Arme lang nach vorn, Stirn ablegen.|Entspannt halten und in den Rücken atmen.","From all fours, sit your hips back towards your heels.|Arms long in front, forehead down.|Hold relaxed and breathe into your back."],
  "sphinx-stretch":["Auf den Bauch legen, Ellbogen unter die Schultern.|Die Brust sanft anheben, die Unterarme bleiben am Boden.|Entspannt halten und ruhig atmen.","Lie on your stomach, elbows under your shoulders.|Gently lift your chest, forearms stay down.|Hold relaxed and breathe calmly."],
  "downward-dog":["Aus dem Vierfüßlerstand die Hüfte nach oben schieben.|Arme und Rücken bilden eine Linie, die Fersen sinken Richtung Boden.|Halten, dabei abwechselnd ein Knie leicht beugen.","From all fours, push your hips up.|Arms and back form one line, heels sink towards the floor.|Hold, gently bending one knee then the other."],
  "spinal-twist":["Auf den Rücken legen, Arme seitlich ausstrecken.|Beide Knie angewinkelt zu einer Seite sinken lassen.|Den Kopf zur anderen Seite drehen, halten, dann wechseln.","Lie on your back, arms out to the sides.|Let both bent knees drop to one side.|Turn your head the other way, hold, then switch."],
  "forward-fold":["Hüftbreit stehen, Knie leicht gebeugt.|Aus der Hüfte nach vorn beugen und den Oberkörper hängen lassen.|Halten; zum Aufrichten langsam Wirbel für Wirbel hochrollen.","Stand hip-width, knees soft.|Hinge forward from your hips and let your upper body hang.|Hold; roll up slowly one vertebra at a time."],
  "hip-flexor-stretch":["In den Kniestand gehen, ein Fuß vorn, das hintere Knie am Boden (gern gepolstert).|Becken leicht einrollen und die Hüfte nach vorn schieben.|Halten, dann die Seite wechseln.","Kneel with one foot in front and the back knee on the floor (padded if you like).|Tuck your pelvis slightly and push your hips forward.|Hold, then switch sides."],
  "quad-stretch":["Auf einem Bein stehen, bei Bedarf festhalten.|Den anderen Fuß greifen und die Ferse Richtung Gesäß ziehen.|Halten, dann die Seite wechseln.","Stand on one leg, hold on if needed.|Grab the other foot and draw the heel towards your glutes.|Hold, then switch sides."],
  "hamstring-stretch":["Aufrecht sitzen, die Beine nach vorn gestreckt.|Mit langem Rücken aus der Hüfte nach vorn beugen.|Halten; die Hände liegen dort, wo sie bequem hinkommen.","Sit tall with your legs straight out in front.|Hinge forward from your hips with a long back.|Hold, with your hands wherever they comfortably reach."],
  "calf-stretch":["Vor eine Wand stellen, Hände auf Schulterhöhe an die Wand.|Ein Bein weit nach hinten setzen, die Ferse bleibt am Boden.|Hüfte nach vorn, halten, dann die Seite wechseln. Mit leicht gebeugtem hinterem Knie spürst du eher den tieferen Wadenmuskel.","Stand facing a wall, hands on it at shoulder height.|Step one leg far back, heel stays down.|Shift your hips forward, hold, then switch sides. With the back knee slightly bent you feel the deeper calf muscle more."],
  "figure-four":["Auf den Rücken legen, Knie angewinkelt.|Einen Knöchel auf das andere Knie legen.|Das untere Bein zur Brust ziehen, halten, dann die Seite wechseln.","Lie on your back with your knees bent.|Cross one ankle over the opposite knee.|Draw the lower leg towards your chest, hold, then switch sides."],
  "pigeon-stretch":["Aus dem Vierfüßlerstand ein Knie nach vorn zwischen die Hände bringen, Schienbein schräg.|Das andere Bein lang nach hinten strecken.|Aufrecht bleiben oder nach vorn ablegen, halten, dann wechseln.","From all fours, bring one knee forward between your hands, shin angled.|Extend the other leg long behind you.|Stay upright or fold forward, hold, then switch."],
  "butterfly-stretch":["Aufrecht sitzen, Fußsohlen zusammen, die Knie fallen nach außen.|Die Füße mit den Händen halten.|Mit langem Rücken leicht nach vorn neigen und halten.","Sit tall, soles together, knees falling out.|Hold your feet with your hands.|Lean slightly forward with a long back and hold."],
  "worlds-greatest":["Großer Ausfallschritt nach vorn, beide Hände innen neben den vorderen Fuß.|Die innere Hand zur Decke drehen, der Blick folgt der Hand.|Zurückführen, ein paar Mal wiederholen, Seite nach jedem Intervall wechseln.","Big lunge forward, both hands inside your front foot.|Rotate the inside hand up to the ceiling, eyes follow the hand.|Bring it back, repeat a few times, switch sides after each interval."]
});
Object.assign(EX_POSTURE, {
  "reverse-crunch":["Kopf und Schultern bleiben entspannt am Boden.|Die Bewegung kommt aus dem Bauch, nicht aus dem Schwung der Beine.","Die Beine nach hinten schleudern.","Head and shoulders stay relaxed on the floor.|The movement comes from your abs, not from swinging your legs.","Flinging your legs back."],
  "chin-ups":["Rumpf fest, Beine ruhig.|Ellbogen zeigen nach unten.","Mit Schwung aus den Beinen ziehen.","Core braced, legs still.|Elbows point down.","Kicking with your legs for momentum."],
  "commando-pull-ups":["Rumpf fest, nicht ins Drehen geraten.|Schultern tief.","Mit dem Oberkörper schwingen oder den Kopf gegen die Stange stoßen.","Core tight, don't spin.|Shoulders down.","Swinging your torso or bumping your head on the bar."],
  "parallel-bar-dips":["Schultern tief, Oberkörper leicht nach vorn.|Ellbogen nach hinten, nicht nach außen.","Tiefer absenken, als es sich für die Schulter gut anfühlt. Bei Schmerz vorn in der Schulter die Tiefe verkleinern oder die Übung weglassen.","Shoulders down, torso slightly forward.|Elbows back, not out.","Going deeper than your shoulder likes. If the front of your shoulder hurts, reduce the depth or skip the exercise."],
  "support-hold":["Ellbogen gestreckt, Brust offen.|Rumpf fest, Beine ruhig.","Die Schultern zu den Ohren sinken lassen.","Elbows straight, chest open.|Core braced, legs still.","Letting your shoulders sink to your ears."],
  "hanging-knee-raise":["Schultern aktiv, Becken oben leicht einrollen.|Oberkörper ruhig.","Mit Schwung aus dem Rücken arbeiten.","Active shoulders, tuck your pelvis at the top.|Upper body still.","Swinging from your back."],
  "hanging-leg-raise":["Beine zusammen, Knie gestreckt.|Kein Schwung.","Die Beine fallen lassen.","Legs together, knees straight.|No swinging.","Dropping your legs."],
  "hanging-l-sit":["Schultern aktiv, Beine zusammen.|Zehen gestreckt; leichter mit gebeugten Knien.","Das Becken kippen lassen oder schwingen. Lieber kürzer halten als verkrampfen.","Active shoulders, legs together.|Toes pointed; easier with bent knees.","Letting your pelvis tip or swinging. Hold shorter rather than cramping."],
  "l-sit":["Arme gestreckt, Schultern tief.|Beine zusammen (leichter: Knie angewinkelt).","Mit rundem Rücken zusammensacken.","Arms straight, shoulders down.|Legs together (easier: knees bent).","Slumping with a rounded back."],
  "windshield-wipers":["Schultern aktiv, Oberkörper ruhig.|Bewegung aus der Körpermitte.","Die Beine von Seite zu Seite schleudern. Bei Rückenschmerz die Ausschläge klein halten oder weglassen.","Active shoulders, steady upper body.|Move from your core.","Flinging your legs side to side. If your back hurts, keep the swings small or skip it."],
  "muscle-ups":["Stange nah am Körper, Rumpf fest.|Nur ausgeruht und aufgewärmt, mit freiem, weichem Boden darunter.","Mit einem Arm zuerst hochkommen, wild schwingen oder müde weitermachen. Bei Schmerz in Schulter, Ellbogen oder Handgelenk sofort abbrechen.","Keep the bar close to your body, core braced.|Only when rested and warmed up, with clear, soft ground below.","Getting one arm over first, swinging wildly or carrying on tired. Stop at once if your shoulder, elbow or wrist hurts."],
  "burpee-pull-ups":["Im Stütz eine Linie von Kopf bis Ferse.|An der Stange Schultern aktiv, Kinn über die Stange.|Weich landen, Knie leicht gebeugt.","Aus dem Sprung unkontrolliert in die Stange schwingen.","In the plank, one line from head to heels.|On the bar, active shoulders, chin over the bar.|Land softly with slightly bent knees.","Swinging into the bar out of the jump."],
  "monkey-bar-traverse":["Schultern aktiv, Rumpf fest.|Ruhig und kontrolliert greifen.","Unkontrolliert schwingen oder an nassen, glatten bzw. für Kinder gebauten Sprossen hängen. Unter der Leiter weichen Boden und freien Platz sicherstellen.","Active shoulders, core braced.|Reach calmly and with control.","Swinging uncontrolled or hanging from wet, slick or child-sized rungs. Make sure there is soft ground and clear space below."],
  "skin-the-cat":["Langsam, ohne Schwung.|Schultern aktiv halten, unter dir weicher, freier Boden.","In die Endposition fallen lassen oder tiefer gehen, als die Schultern angenehm mitmachen. Bei Schulterbeschwerden oder wenig Beweglichkeit weglassen; erst Dead Hang und Scapular Pull-ups beherrschen.","Slowly, no momentum.|Keep your shoulders active, soft and clear ground underneath.","Dropping into the end position or going deeper than your shoulders comfortably allow. Skip it with shoulder problems or limited mobility; master Dead Hang and Scapular Pull-ups first."],
  "archer-push-ups":["Körper eine Linie.|Ellbogen des Arbeitsarms nah am Körper.","Die Hüfte verdrehen.","Body in one line.|Working elbow close to your body.","Twisting your hips."],
  "pistol-squats":["Standknie in Fußrichtung, Ferse unten.|Rücken lang.","Das Knie nach innen fallen lassen.","Standing knee over your toes, heel down.|Long back.","Letting the knee cave in."],
  "dragon-flags":["Körper von Schulter bis Fuß gerade.|Unterer Rücken fest, kein Hohlkreuz.|Kinn leicht zur Brust, Gewicht auf den Schulterblättern, nicht auf dem Nacken.","In der Hüfte abknicken, den Nacken belasten oder sich an etwas festhalten, das kippen kann. Erst üben, wenn Hollow Hold und Hanging Leg Raise sauber klappen.","Body straight from shoulders to feet.|Lower back braced, no arching.|Chin slightly tucked, weight on your shoulder blades, not on your neck.","Folding at the hips, loading your neck or holding on to something that can tip. Only practise once Hollow Hold and Hanging Leg Raise are clean."],
  "clap-push-ups":["Rumpf fest, Körper gerade.|Weich abfangen.","Mit gestreckten Armen hart landen. Auf weichem, rutschfestem Untergrund üben; bei Handgelenkschmerz abbrechen.","Core tight, body straight.|Catch yourself softly.","Landing hard on locked arms. Practise on a soft, non-slip surface; stop if your wrists hurt."],
  "tuck-jumps":["Oberkörper aufrecht.|Knie folgen bei der Landung der Fußrichtung.","Steifbeinig landen.","Upper body upright.|Knees track your toes on landing.","Landing stiff-legged."],
  "close-grip-push-ups":["Körper gerade, Blick knapp vor die Hände.|Schultern weg von den Ohren.","Die Hüfte durchhängen lassen.","Body straight, eyes just ahead of your hands.|Shoulders away from your ears.","Letting your hips sag."],
  "diamond-push-ups":["Linie von Kopf bis Ferse, Gesäß fest.|Ellbogen zeigen nach hinten.","Die Ellbogen seitlich ausstellen. Bei Hand- oder Ellbogenschmerz die Hände weiter auseinander stellen (enge Liegestütze).","One line from head to heels, glutes tight.|Elbows point back.","Flaring your elbows out. If your wrists or elbows hurt, place your hands wider apart (close-grip push-ups)."],
  "sphinx-push-ups":["Körper eine Linie, Hüfte ruhig.|Ellbogen zeigen nach hinten.","Mit der Hüfte hochschieben, um nachzuhelfen. Bei Ellbogen- oder Handgelenkschmerz weglassen.","Body in one line, hips still.|Elbows point back.","Piking your hips up to help. Skip it if your elbows or wrists hurt."],
  "triceps-curls":["Ellbogen zeigen nach vorn oben, eng am Kopf.|Rippen unten, kein Hohlkreuz.","Die Ellbogen weit nach außen öffnen.","Elbows point forward and up, close to your head.|Ribs down, no arched back.","Letting your elbows flare wide."],
  "arm-circles":["Schultern tief, Arme gestreckt.|Rumpf fest, kein Hohlkreuz.","Die Schultern zu den Ohren ziehen.","Shoulders down, arms straight.|Core braced, no arched back.","Shrugging your shoulders up."],
  "neck-stretch":["Die gegenüberliegende Schulter nach unten sinken lassen.|Blick nach vorn, nicht drehen.","Ruckartig am Kopf ziehen. Bei Kribbeln im Arm, Taubheit oder Schwindel sofort lösen.","Let the opposite shoulder sink down.|Look forward, don't rotate.","Yanking on your head. Release at once if your arm tingles or you feel numb or dizzy."],
  "pallof-press":["Becken und Schultern zeigen nach vorn.|Füße hüftbreit oder in Schrittstellung, Rumpf und Gesäß fest.","Sich zum Kabel hin aufdrehen oder mit dem Oberkörper wegkippen. Zu viel Gewicht, bei dem die Schultern mitziehen.","Pelvis and shoulders face forward.|Feet hip-width or in a split stance, core and glutes braced.","Turning towards the cable or leaning away. Too much weight, so your shoulders get pulled."],
  "copenhagen-plank":["Körper in einer Linie, Hüfte nicht nach hinten kippen.|Nacken lang, Möbel steht fest.","Die Hüfte absinken lassen oder mit Schwung hochkommen. Bei Schmerzen in Leiste oder Hüfte abbrechen.","Body in one line, don't tip your hips back.|Long neck, furniture is solid.","Letting your hips drop or swinging up. Stop if your groin or hip hurts."],
  "backpack-row":["Rücken gerade und fest, Nacken in Verlängerung der Wirbelsäule.|Rucksack nah am Körper, Ellbogen nach hinten.","Mit Schwung aus dem Oberkörper ziehen oder den Rücken rund machen. Rucksack so packen, dass nichts verrutscht oder aufgeht.","Flat, braced back, neck in line with your spine.|Backpack close to your body, elbows back.","Heaving with your torso or rounding your back. Pack the bag so nothing shifts or opens."],
  "knee-push-ups":["Linie von Kopf bis Knie, Bauch und Gesäß angespannt.|Ellbogen etwa 45° vom Körper.","Den Po nach hinten schieben oder die Hüfte durchhängen lassen.","One line from head to knees, abs and glutes tight.|Elbows about 45° from your body.","Pushing your hips back or letting them sag."],
  "single-leg-calf-raise":["Gewicht über dem Großzehenballen, Knie gestreckt, nicht durchgedrückt.|Becken gerade, nur leicht festhalten.","Zum Außenrand des Fußes abkippen, wippen oder sich an der Wand hochziehen.","Weight over the big-toe ball, knee straight but not locked.|Pelvis level, hold on lightly only.","Rolling onto the outer edge, bouncing or pulling yourself up on the wall."],
  "negative-dips":["Schultern tief, Oberkörper leicht nach vorn.|Ellbogen nach hinten, nicht nach außen.","Fallen lassen statt kontrolliert zu senken. Bei Schmerz vorn in der Schulter die Tiefe verkleinern.","Shoulders down, torso slightly forward.|Elbows back, not out.","Dropping instead of lowering with control. If the front of your shoulder hurts, reduce the depth."],
  "db-bench-press":["Schulterblätter zusammen und tief, der Rücken liegt fest auf der Bank.|Handgelenke gerade über den Ellbogen.","Die Hanteln mit Schwung hochstoßen oder die Schultern nach vorn rollen. Bei schweren Hanteln eine Spotterin oder einen Spotter bitten und die Hanteln seitlich absetzen, statt sie fallen zu lassen.","Shoulder blades together and down, your back stays on the bench.|Wrists straight over your elbows.","Heaving the dumbbells up or rolling your shoulders forward. With heavy dumbbells ask for a spotter and set them down to the side instead of dropping them."],
  "db-step-ups":["Ganzer Fuß auf der Stufe, das Knie bleibt über dem Fuß.|Oberkörper aufrecht, die Arbeit kommt aus dem vorderen Bein.","Mit dem hinteren Bein abdrücken oder das Knie nach innen fallen lassen. Eine Stufe bis etwa Kniehöhe und eine kippsichere Bank wählen.","Whole foot on the step, knee stays over your foot.|Torso upright, the front leg does the work.","Pushing off with the back leg or letting your knee cave in. Choose a step up to about knee height and a bench that cannot tip."],
  "sumo-squat-db":["Knie zeigen in Fußrichtung, Brust aufrecht.|Die Fersen bleiben am Boden.","Die Knie nach innen fallen lassen oder den Rücken rund machen.","Knees point in the direction of your feet, chest up.|Heels stay down.","Letting your knees cave in or rounding your back."],
  "single-leg-rdl":["Rücken lang und gerade, das Becken bleibt waagerecht.|Blick zum Boden, Nacken in Verlängerung der Wirbelsäule.","Den Rücken rund machen, das Becken aufdrehen oder das Standknie durchdrücken. Wenn du wackelst: kleiner bewegen oder festhalten.","Long flat back, your pelvis stays level.|Eyes on the floor, neck in line with your spine.","Rounding your back, opening your pelvis or locking the standing knee. If you wobble, move less or hold on."],
  "nordic-curl":["Die Hüfte bleibt gestreckt, der Körper bildet eine Linie.|So langsam sinken, dass die Oberschenkelrückseite bremst.","In der Hüfte einknicken oder sich fallen lassen. Sehr fordernd für die Oberschenkelrückseite (starker Muskelkater möglich): mit wenigen Wiederholungen beginnen, bei Schmerz hinten im Oberschenkel abbrechen.","Hips stay extended, your body forms one line.|Lower so slowly that the back of your thighs does the braking.","Folding at the hips or dropping. Very demanding for the back of your thighs (strong muscle soreness possible): start with a few reps and stop if you feel pain at the back of your thigh."],
  "chin-tuck":["Schultern locker, Brustbein leicht angehoben.|Nur so weit, dass es angenehm bleibt.","Den Kopf nach unten nicken oder die Schultern hochziehen. Bei Kribbeln im Arm, Taubheit oder Schwindel sofort lösen.","Shoulders relaxed, breastbone slightly lifted.|Only as far as feels comfortable.","Nodding your head down or shrugging your shoulders. Release at once if your arm tingles or you feel numb or dizzy."],
  "thoracic-rotation":["Hüfte bleibt über den Knien, die Drehung kommt aus dem Brustkorb.|Stützarm gestreckt, Schulter weg vom Ohr.","Mit dem unteren Rücken oder der Hüfte mitdrehen. Bei Schulter- oder Rückenschmerz die Drehung kleiner machen oder weglassen.","Hips stay over your knees, the rotation comes from your chest.|Support arm straight, shoulder away from your ear.","Twisting through your lower back or hips. If your shoulder or back hurts, make the rotation smaller or skip it."],
  "shoulder-stretch":["Schulter tief, nicht hochziehen.|Der Oberkörper bleibt gerade.","Den Oberkörper mitdrehen.","Keep the shoulder down, don't shrug.|Torso stays square.","Rotating your torso with it."],
  "triceps-stretch":["Kopf aufrecht, nicht nach vorn drücken lassen.|Rippen unten.","Ins Hohlkreuz ausweichen.","Head upright, don't let it get pushed forward.|Ribs down.","Arching your lower back."],
  "biceps-stretch":["Schulter tief und zurück.|Ellbogen gestreckt, aber nicht durchgedrückt.","Die Schulter nach vorn rollen lassen. Bei Schulterschmerz oder wackeliger Schulter weglassen.","Shoulder down and back.|Elbow straight but not locked.","Letting your shoulder roll forward. Skip it if your shoulder hurts or feels unstable."],
  "chest-stretch":["Ellbogen nicht höher als die Schulter.|Rumpf aufrecht, Schulter tief.","Ins Hohlkreuz fallen. Bei Schulterschmerz oder wackeliger Schulter weglassen.","Elbow no higher than your shoulder.|Upright torso, shoulder down.","Sagging into an arched back. Skip it if your shoulder hurts or feels unstable."],
  "wrist-stretch":["Ellbogen gestreckt, Schulter locker.|Nur sanft ziehen.","Mit Kraft in den Schmerz ziehen.","Elbow straight, shoulder relaxed.|Pull gently only.","Forcing it into pain."],
  "side-bend":["Beide Füße fest am Boden.|Seitlich neigen, nicht nach vorn kippen.","Die Hüfte weit zur Seite schieben.","Both feet firmly down.|Lean sideways, don't tip forward.","Pushing your hips far out to the side."],
  "cat-cow":["Bewegung Wirbel für Wirbel.|Die Arme bleiben gestreckt.","Den Kopf in den Nacken werfen.","Move one vertebra at a time.|Arms stay straight.","Throwing your head back."],
  "childs-pose":["Schultern locker, Nacken lang.|Die Knie gern etwas breiter.","Mit Gewalt tiefer drücken.","Relaxed shoulders, long neck.|Knees can be a bit wider.","Forcing yourself lower."],
  "sphinx-stretch":["Schultern weg von den Ohren.|Becken und Beine bleiben locker am Boden.","Den Nacken überstrecken.","Shoulders away from your ears.|Pelvis and legs stay relaxed on the floor.","Overextending your neck."],
  "downward-dog":["Rücken lang geht vor Beine gestreckt.|Kopf zwischen den Armen, Nacken locker.","Den Rücken rund machen, nur um die Fersen abzusetzen. Bei Glaukom (grüner Star), hohem Blutdruck oder Schwindel weglassen oder vorher ärztlich klären.","Long back before straight legs.|Head between your arms, neck relaxed.","Rounding your back just to get your heels down. Skip it or check with a doctor first if you have glaucoma, high blood pressure or dizziness."],
  "spinal-twist":["Beide Schultern bleiben am Boden.|Nur so weit drehen, wie es angenehm ist.","Die Knie mit Gewalt zum Boden drücken.","Both shoulders stay down.|Only twist as far as feels good.","Forcing your knees to the floor."],
  "forward-fold":["Nacken und Arme locker hängen lassen.|Gewicht über der Fußmitte.","Mit gestreckten Knien nach unten federn. Bei Glaukom (grüner Star), hohem Blutdruck oder Schwindel weglassen oder vorher ärztlich klären.","Let your neck and arms hang loose.|Weight over the middle of your feet.","Bouncing down with locked knees. Skip it or check with a doctor first if you have glaucoma, high blood pressure or dizziness."],
  "hip-flexor-stretch":["Oberkörper aufrecht, Gesäß der hinteren Seite anspannen.|Vorderes Knie über dem Fuß.","Ins Hohlkreuz ausweichen.","Upright torso, squeeze the glute of the back leg.|Front knee over your foot.","Arching your lower back instead."],
  "quad-stretch":["Knie zeigen nach unten und bleiben nah beieinander.|Becken leicht einrollen, aufrecht bleiben.","Das Knie nach vorn oder außen wandern lassen.","Knees point down and stay close together.|Tuck your pelvis slightly and stay tall.","Letting the knee drift forward or out."],
  "hamstring-stretch":["Brust nach vorn, nicht Kopf zu den Knien.|Die Knie dürfen leicht gebeugt sein.","Mit rundem Rücken nach vorn ziehen.","Chest forward, not head to knees.|Knees may be slightly bent.","Pulling forward with a rounded back."],
  "calf-stretch":["Hinteres Bein gestreckt, Fuß zeigt nach vorn.|Körper in einer Linie von Ferse bis Kopf.","Die hintere Ferse abheben.","Back leg straight, foot pointing forward.|Body in one line from heel to head.","Lifting the back heel."],
  "figure-four":["Kopf und Schultern bleiben am Boden.|Knie der gekreuzten Seite sanft nach außen.","Den Kopf anheben und den Nacken anspannen.","Head and shoulders stay down.|Ease the crossed knee outward.","Lifting your head and straining your neck."],
  "pigeon-stretch":["Hüfte gerade nach vorn ausrichten.|Bei Knieschmerz das Schienbein näher zum Körper nehmen oder Figur 4 wählen.","Auf die Seite der vorderen Hüfte kippen.","Keep your hips square to the front.|If your knee hurts, bring the shin closer or use Figure-Four.","Tipping onto the front hip."],
  "butterfly-stretch":["Rücken lang, Brust offen.|Die Knie nur sinken lassen, nicht drücken.","Mit den Ellbogen auf die Knie drücken.","Long back, open chest.|Let the knees sink, don't push them.","Pressing your knees down with your elbows."],
  "worlds-greatest":["Hinteres Bein lang, Hüfte tief.|Drehung aus dem Brustkorb, nicht aus dem unteren Rücken.","Das vordere Knie nach innen fallen lassen.","Back leg long, hips low.|Rotate through your chest, not your lower back.","Letting the front knee cave in."]
});

/* Muskeln je Übung: [Hauptmuskeln DE, unterstützend DE, Hauptmuskeln EN, unterstützend EN].
   Bei Dehnübungen: was gedehnt wird. Grundlage: gängige Übungsbeschreibungen (u. a. ACE-Übungsbibliothek);
   Beinheben z. B. vor allem Hüftbeuger, der Bauch stabilisiert. */
var EX_MUSCLES = {
  "glute-machine":["Großer Gesäßmuskel","Oberschenkel hinten, Rumpf","Glutes","Hamstrings, core"],
  "calf-press":["Waden","Fußmuskulatur","Calves","Foot muscles"],
  "lying-leg-curl":["Oberschenkel hinten","Waden","Hamstrings","Calves"],
  "rotary-torso":["Schräge Bauchmuskeln","Gerader Bauchmuskel, unterer Rücken","Obliques","Rectus abdominis, lower back"],
  "back-extension-machine":["Rückenstrecker","Gesäß, Oberschenkel hinten","Spinal erectors","Glutes, hamstrings"],
  "triceps-extension-machine":["Trizeps","Unterarme","Triceps","Forearms"],
  "lateral-raise-machine":["Seitliche Schulter","Trapez","Side delts","Traps"],
  "cable-lateral-raise":["Seitliche Schulter","Trapez, Rumpf","Side delts","Traps, core"],
  "smith-bench-press":["Brust","Trizeps, vordere Schulter","Chest","Triceps, front delts"],
  "assisted-dip":["Trizeps, Brust","Vordere Schulter","Triceps, chest","Front delts"],
  "high-row-machine":["Latissimus, oberer Rücken","Bizeps, hintere Schulter","Lats, upper back","Biceps, rear delts"],
  "cable-crunch":["Gerader Bauch","Schräge Bauchmuskeln","Abs","Obliques"],
  "cable-pull-through":["Großer Gesäßmuskel","Oberschenkel hinten, unterer Rücken","Glutes","Hamstrings, lower back"],
  "rung-pull-ups":["Breiter Rückenmuskel, Bizeps","Oberarmmuskel, Unterarme (Griff), Rumpf","Lats, biceps","Brachialis, forearms (grip), core"],
  "hack-squat":["Oberschenkel vorn, Gesäß", "Adduktoren, Waden", "Quads, glutes", "Adductors, calves"],
  "smith-squat":["Oberschenkel vorn, Gesäß", "Oberschenkel hinten, Rumpf", "Quads, glutes", "Hamstrings, core"],
  "leg-press-single":["Oberschenkel vorn, Gesäß", "Hüftstabilisatoren", "Quads, glutes", "Hip stabilisers"],
  "hip-thrust":["Gesäß", "Oberschenkel hinten, Adduktoren", "Glutes", "Hamstrings, adductors"],
  "glute-kickback-cable":["Gesäß", "Oberschenkel hinten", "Glutes", "Hamstrings"],
  "seated-calf":["Waden (Schollenmuskel)", "Fußmuskulatur", "Calves (soleus)", "Foot muscles"],
  "incline-chest-press":["Obere Brust, Trizeps", "Vordere Schulter", "Upper chest, triceps", "Front delts"],
  "cable-crossover":["Brust", "Vordere Schulter", "Chest", "Front delts"],
  "incline-db-press":["Obere Brust, Trizeps", "Vordere Schulter", "Upper chest, triceps", "Front delts"],
  "db-fly":["Brust", "Vordere Schulter", "Chest", "Front delts"],
  "assisted-pullup":["Breiter Rückenmuskel, Bizeps", "Oberer Rücken, Unterarme", "Lats, biceps", "Upper back, forearms"],
  "close-grip-pulldown":["Breiter Rückenmuskel, Bizeps", "Mittlerer Rücken", "Lats, biceps", "Mid back"],
  "t-bar-row":["Oberer Rücken, breiter Rückenmuskel", "Bizeps, Rückenstrecker", "Upper back, lats", "Biceps, lower back"],
  "barbell-row":["Oberer Rücken, breiter Rückenmuskel", "Bizeps, Rückenstrecker", "Upper back, lats", "Biceps, lower back"],
  "face-pull":["Hintere Schulter, oberer Rücken", "Rotatorenmanschette, Trapez", "Rear delts, upper back", "Rotator cuff, traps"],
  "straight-arm-pulldown":["Breiter Rückenmuskel", "Trizeps (langer Kopf), Rumpf", "Lats", "Triceps (long head), core"],
  "lateral-raise":["Seitliche Schulter", "Trapez", "Side delts", "Traps"],
  "shrugs":["Oberer Trapez", "Unterarme", "Upper traps", "Forearms"],
  "hammer-curl":["Bizeps, Oberarmmuskel", "Unterarme", "Biceps, brachialis", "Forearms"],
  "barbell-curl":["Bizeps", "Unterarme", "Biceps", "Forearms"],
  "overhead-cable-triceps":["Trizeps (langer Kopf)", "Rumpf", "Triceps (long head)", "Core"],
  "triceps-machine":["Trizeps", "Brust, vordere Schulter", "Triceps", "Chest, front delts"],
  "cable-woodchop":["Schräge Bauchmuskeln", "Gerader Bauch, Schultern", "Obliques", "Abs, shoulders"],
  "captains-chair":["Gerader Bauch, Hüftbeuger", "Schräge Bauchmuskeln", "Abs, hip flexors", "Obliques"],
  "barbell-overhead-press":["Schultern, Trizeps", "Oberer Trapez, Rumpf", "Shoulders, triceps", "Upper traps, core"],
  "barbell-rdl":["Oberschenkel hinten, Gesäß", "Rückenstrecker, Unterarme", "Hamstrings, glutes", "Lower back, forearms"],
  "leg-press":["Oberschenkel vorn, Gesäß", "Oberschenkel hinten, Waden", "Quads, glutes", "Hamstrings, calves"],
  "leg-press-45":["Oberschenkel vorn, Gesäß", "Oberschenkel hinten, Adduktoren", "Quads, glutes", "Hamstrings, adductors"],
  "leg-extension":["Oberschenkel vorn", "–", "Quads", "–"],
  "leg-curl":["Oberschenkel hinten", "Waden", "Hamstrings", "Calves"],
  "adductor-machine":["Adduktoren (Innenschenkel)", "Gesäß", "Adductors (inner thighs)", "Glutes"],
  "abductor-machine":["Seitliches Gesäß (Abduktoren)", "Hüftstabilisatoren", "Side glutes (abductors)", "Hip stabilisers"],
  "calf-machine":["Waden (Zwillingswadenmuskel)","Fußmuskulatur","Calves (gastrocnemius)","Foot muscles"],
  "chest-press-machine":["Brust, Trizeps", "Vordere Schulter", "Chest, triceps", "Front delts"],
  "butterfly":["Brust", "Vordere Schulter", "Chest", "Front delts"],
  "pullover":["Breiter Rückenmuskel, Brust", "Trizeps, Rumpf", "Lats, chest", "Triceps, core"],
  "lat-pulldown":["Breiter Rückenmuskel, Bizeps", "Oberer Rücken, hintere Schulter", "Lats, biceps", "Upper back, rear delts"],
  "row-machine":["Oberer Rücken, breiter Rückenmuskel", "Bizeps, hintere Schulter", "Upper back, lats", "Biceps, rear delts"],
  "cable-row":["Oberer Rücken, breiter Rückenmuskel", "Bizeps, Rückenstrecker", "Upper back, lats", "Biceps, lower back"],
  "reverse-butterfly":["Hintere Schulter, oberer Rücken", "Rautenmuskeln, Trapez", "Rear delts, upper back", "Rhomboids, traps"],
  "back-extension":["Rückenstrecker", "Gesäß, Oberschenkel hinten", "Lower back", "Glutes, hamstrings"],
  "shoulder-press-machine":["Schultern, Trizeps", "Oberer Trapez", "Shoulders, triceps", "Upper traps"],
  "biceps-machine":["Bizeps", "Unterarme", "Biceps", "Forearms"],
  "cable-curl":["Bizeps", "Unterarme", "Biceps", "Forearms"],
  "triceps-pushdown":["Trizeps", "Unterarme", "Triceps", "Forearms"],
  "skull-crusher":["Trizeps", "Unterarme", "Triceps", "Forearms"],
  "ab-crunch-machine":["Gerader Bauch", "Schräge Bauchmuskeln", "Abs", "Obliques"],
  "bench-press":["Brust, Trizeps", "Vordere Schulter", "Chest, triceps", "Front delts"],
  "barbell-squat":["Oberschenkel vorn, Gesäß", "Oberschenkel hinten, Rumpf, Rückenstrecker", "Quads, glutes", "Hamstrings, core, lower back"],
  "barbell-deadlift":["Gesäß, Oberschenkel hinten, Rückenstrecker", "Oberer Rücken, Unterarme, Rumpf", "Glutes, hamstrings, lower back", "Upper back, forearms, core"],
  "jump-lunges":["Oberschenkel vorn, Gesäß","Oberschenkel hinten, Waden, Rumpf, Ausdauer","Quads, glutes","Hamstrings, calves, core, endurance"],
  "reverse-crunch":["Gerader Bauch (unterer Anteil)","Hüftbeuger, schräge Bauchmuskeln","Abs (lower part)","Hip flexors, obliques"],
  "chin-ups":["Bizeps, breiter Rückenmuskel","Oberer Rücken, Unterarme","Biceps, lats","Upper back, forearms"],
  "commando-pull-ups":["Breiter Rückenmuskel, Bizeps","Rumpf, Unterarme (Griff)","Lats, biceps","Core, forearms (grip)"],
  "parallel-bar-dips":["Trizeps, Brust","Vordere Schulter","Triceps, chest","Front delts"],
  "support-hold":["Trizeps, Schulterblattsenker (unterer Trapez, breiter Rückenmuskel)","Brust, Rumpf","Triceps, scapular depressors (lower traps, lats)","Chest, core"],
  "hanging-knee-raise":["Hüftbeuger, gerader Bauch","Unterarme (Griff), Schultern","Hip flexors, abs","Forearms (grip), shoulders"],
  "hanging-leg-raise":["Hüftbeuger, gerader Bauch","Unterarme (Griff), Schultern","Hip flexors, abs","Forearms (grip), shoulders"],
  "hanging-l-sit":["Gerader Bauch, Hüftbeuger","Unterarme (Griff), Oberschenkel vorn","Abs, hip flexors","Forearms (grip), quads"],
  "l-sit":["Gerader Bauch, Hüftbeuger, Trizeps","Schulterblattsenker (unterer Trapez), Oberschenkel vorn","Abs, hip flexors, triceps","Scapular depressors (lower traps), quads"],
  "windshield-wipers":["Schräge Bauchmuskeln, Rumpf","Hüftbeuger, Unterarme (Griff)","Obliques, core","Hip flexors, forearms (grip)"],
  "muscle-ups":["Breiter Rückenmuskel, Brust, Trizeps","Schultern, Bizeps, Rumpf","Lats, chest, triceps","Shoulders, biceps, core"],
  "burpee-pull-ups":["Breiter Rückenmuskel, Brust, Oberschenkel vorn","Bizeps, Trizeps, Rumpf, Ausdauer","Lats, chest, quads","Biceps, triceps, core, endurance"],
  "monkey-bar-traverse":["Unterarme (Griff), breiter Rückenmuskel","Schultern, Rumpf","Forearms (grip), lats","Shoulders, core"],
  "skin-the-cat":["Schultern, breiter Rückenmuskel, Rumpf","Bizeps, Unterarme (Griff)","Shoulders, lats, core","Biceps, forearms (grip)"],
  "archer-push-ups":["Brust, Trizeps (Arbeitsarm)","Schultern, Rumpf","Chest, triceps (working arm)","Shoulders, core"],
  "pistol-squats":["Oberschenkel vorn, Gesäß","Seitliches Gesäß, Rumpf, Gleichgewicht","Quads, glutes","Side glutes, core, balance"],
  "dragon-flags":["Gerader Bauch, tiefe Bauchmuskeln","Hüftbeuger, breiter Rückenmuskel","Abs, deep core","Hip flexors, lats"],
  "clap-push-ups":["Brust, Trizeps, Schultern (Schnellkraft)","Rumpf","Chest, triceps, shoulders (power)","Core"],
  "tuck-jumps":["Oberschenkel vorn, Gesäß, Waden","Hüftbeuger, Rumpf, Ausdauer","Quads, glutes, calves","Hip flexors, core, endurance"],
  "burpees":["Oberschenkel vorn, Gesäß, Brust","Schultern, Trizeps, Rumpf, Ausdauer","Quads, glutes, chest","Shoulders, triceps, core, endurance"],
  "jump-squats":["Oberschenkel vorn, Gesäß, Waden","Oberschenkel hinten, Rumpf","Quads, glutes, calves","Hamstrings, core"],
  "mountain-climbers":["Rumpf, Hüftbeuger, Schultern","Oberschenkel vorn, Ausdauer","Core, hip flexors, shoulders","Quads, endurance"],
  "high-knees":["Hüftbeuger, Oberschenkel vorn, Waden","Gesäß, Rumpf, Ausdauer","Hip flexors, quads, calves","Glutes, core, endurance"],
  "jumping-jacks":["Waden, seitliches Gesäß, Schultern","Adduktoren, Ausdauer","Calves, side glutes, shoulders","Adductors, endurance"],
  "skater-jumps":["Seitliches Gesäß, Oberschenkel vorn","Adduktoren, Waden, Rumpf","Side glutes, quads","Adductors, calves, core"],
  "plank-burpees":["Oberschenkel vorn, Rumpf","Schultern, Gesäß, Ausdauer","Quads, core","Shoulders, glutes, endurance"],
  "jump-forward-squats":["Oberschenkel vorn, Gesäß, Waden","Oberschenkel hinten, Rumpf, Schultern (Armschwung)","Quads, glutes, calves","Hamstrings, core, shoulders (arm swing)"],
  "jump-forward-burpees":["Oberschenkel vorn, Gesäß, Brust","Waden, Schultern, Trizeps, Rumpf, Ausdauer","Quads, glutes, chest","Calves, shoulders, triceps, core, endurance"],
  "burpee-squat-jumps":["Oberschenkel vorn, Gesäß, Waden","Brust, Schultern, Rumpf, Ausdauer","Quads, glutes, calves","Chest, shoulders, core, endurance"],
  "frogs":["Oberschenkel vorn, Gesäß, Adduktoren","Waden, Rumpf, Ausdauer","Quads, glutes, adductors","Calves, core, endurance"],
  "stand-up-jumps":["Oberschenkel vorn, Gesäß, Rumpf","Hüftbeuger, Waden, Ausdauer","Quads, glutes, core","Hip flexors, calves, endurance"],
  "lateral-hops":["Waden, seitliches Gesäß","Oberschenkel vorn, Fußgelenke, Rumpf","Calves, side glutes","Quads, ankles, core"],
  "fast-feet":["Waden, Oberschenkel vorn","Hüftbeuger, Ausdauer","Calves, quads","Hip flexors, endurance"],
  "box-step-ups":["Oberschenkel vorn, Gesäß","Oberschenkel hinten, Waden, Ausdauer","Quads, glutes","Hamstrings, calves, endurance"],
  "sprint-in-place":["Hüftbeuger, Oberschenkel vorn, Waden","Gesäß, Ausdauer","Hip flexors, quads, calves","Glutes, endurance"],

  "goblet-squat":["Oberschenkel vorn, Gesäß","Adduktoren, Rumpf, oberer Rücken","Quads, glutes","Adductors, core, upper back"],
  "kb-swing":["Gesäß, Oberschenkel hinten","Rückenstrecker, Rumpf, Schultern, Ausdauer","Glutes, hamstrings","Lower back, core, shoulders, endurance"],
  "db-thruster":["Oberschenkel vorn, Gesäß, Schultern","Trizeps, Rumpf","Quads, glutes, shoulders","Triceps, core"],
  "romanian-deadlift":["Oberschenkel hinten, Gesäß","Rückenstrecker, Unterarme","Hamstrings, glutes","Lower back, forearms"],
  "db-deadlift":["Gesäß, Oberschenkel vorn und hinten","Rückenstrecker, oberer Rücken, Unterarme","Glutes, quads, hamstrings","Lower back, upper back, forearms"],
  "bent-over-row":["Breiter Rückenmuskel, oberer Rücken","Bizeps, hintere Schulter, Rückenstrecker","Lats, upper back","Biceps, rear delts, lower back"],
  "one-arm-row":["Breiter Rückenmuskel, oberer Rücken","Bizeps, hintere Schulter, Rumpf","Lats, upper back","Biceps, rear delts, core"],
  "floor-press":["Brust, Trizeps","Vordere Schulter","Chest, triceps","Front delts"],
  "shoulder-press":["Schultern, Trizeps","Oberer Trapez, Rumpf","Shoulders, triceps","Upper traps, core"],
  "push-press":["Schultern, Trizeps","Oberschenkel vorn, Gesäß, Rumpf","Shoulders, triceps","Quads, glutes, core"],
  "weighted-reverse-lunge":["Oberschenkel vorn, Gesäß","Oberschenkel hinten, Adduktoren, Rumpf","Quads, glutes","Hamstrings, adductors, core"],
  "front-rack-carry":["Rumpf, oberer Rücken","Schultern, Bizeps, Beine","Core, upper back","Shoulders, biceps, legs"],
  "farmer-carry":["Unterarme (Griff), Trapez, Rumpf","Schultern, seitliches Gesäß, Beine","Forearms (grip), traps, core","Shoulders, side glutes, legs"],
  "kb-clean":["Gesäß, Oberschenkel hinten, Schultern","Oberer Rücken, Rumpf, Unterarme","Glutes, hamstrings, shoulders","Upper back, core, forearms"],
  "renegade-row":["Breiter Rückenmuskel, Rumpf","Schultern, Brust, Trizeps, schräge Bauchmuskeln","Lats, core","Shoulders, chest, triceps, obliques"],

  "push-ups":["Brust, Trizeps, vordere Schulter","Rumpf, Sägemuskel","Chest, triceps, front delts","Core, serratus"],
  "pike-push-ups":["Schultern, Trizeps","Obere Brust, Rumpf","Shoulders, triceps","Upper chest, core"],
  "triceps-dips":["Trizeps","Vordere Schulter, Brust","Triceps","Front delts, chest"],
  "squat-hold":["Oberschenkel vorn, Gesäß","Rumpf, Waden","Quads, glutes","Core, calves"],
  "walking-lunges":["Oberschenkel vorn, Gesäß","Oberschenkel hinten, Waden, Rumpf","Quads, glutes","Hamstrings, calves, core"],
  "reverse-lunges":["Oberschenkel vorn, Gesäß","Oberschenkel hinten, Rumpf","Quads, glutes","Hamstrings, core"],
  "side-lunges":["Gesäß, Oberschenkel vorn, Adduktoren","Oberschenkel hinten","Glutes, quads, adductors","Hamstrings"],
  "cossack-squats":["Adduktoren, Gesäß, Oberschenkel vorn","Seitliches Gesäß, Oberschenkel hinten, Beweglichkeit","Adductors, glutes, quads","Side glutes, hamstrings, mobility"],
  "deep-squats":["Oberschenkel vorn, Gesäß","Adduktoren, Waden, Beweglichkeit","Quads, glutes","Adductors, calves, mobility"],
  "pistol-assist":["Oberschenkel vorn, Gesäß","Seitliches Gesäß, Rumpf, Gleichgewicht","Quads, glutes","Side glutes, core, balance"],
  "plank-steps":["Trizeps, Schultern, Rumpf","Brust","Triceps, shoulders, core","Chest"],
  "bear-crawl":["Schultern, Rumpf, Oberschenkel vorn","Hüftbeuger, Trizeps, Sägemuskel","Shoulders, core, quads","Hip flexors, triceps, serratus"],
  "wall-sit":["Oberschenkel vorn","Gesäß, Waden","Quads","Glutes, calves"],
  "calf-raises":["Waden","Fußmuskulatur, Fußgelenke","Calves","Foot muscles, ankles"],
  "glute-bridge":["Gesäß","Oberschenkel hinten, Rückenstrecker, Rumpf","Glutes","Hamstrings, lower back, core"],

  "pull-ups":["Breiter Rückenmuskel, Bizeps","Oberer Rücken, Unterarme, Rumpf","Lats, biceps","Upper back, forearms, core"],
  "negative-pull-ups":["Breiter Rückenmuskel, Bizeps","Oberer Rücken, Unterarme","Lats, biceps","Upper back, forearms"],
  "inverted-rows":["Oberer Rücken, breiter Rückenmuskel","Bizeps, hintere Schulter, Rumpf","Upper back, lats","Biceps, rear delts, core"],
  "superman-hold":["Rückenstrecker, Gesäß","Oberer Rücken, hintere Schulter, Oberschenkel hinten","Lower back, glutes","Upper back, rear delts, hamstrings"],
  "reverse-snow-angels":["Oberer Rücken, hintere Schulter","Unterer Trapez, Rückenstrecker","Upper back, rear delts","Lower traps, lower back"],
  "bird-dog":["Rückenstrecker, Gesäß, tiefe Bauchmuskeln","Schultern, Oberschenkel hinten","Lower back, glutes, deep core","Shoulders, hamstrings"],
  "prone-y-raise":["Unterer Trapez, hintere Schulter","Oberer Rücken, Rückenstrecker","Lower traps, rear delts","Upper back, lower back"],
  "prone-t-raise":["Mittlerer Trapez, Rautenmuskeln, hintere Schulter","Rückenstrecker","Mid traps, rhomboids, rear delts","Lower back"],
  "good-mornings":["Oberschenkel hinten, Gesäß, Rückenstrecker","Rumpf","Hamstrings, glutes, lower back","Core"],
  "swimmers":["Rückenstrecker, Gesäß, Schultern","Oberer Rücken, Oberschenkel hinten","Lower back, glutes, shoulders","Upper back, hamstrings"],
  "cobra-lift":["Bauch, Hüftbeuger, Brust","Rückenstrecker, Streckung der Wirbelsäule","Abs, hip flexors, chest","Lower back, spinal extension"],
  "scapular-push-ups":["Sägemuskel, Schulterblattmuskeln","Rumpf","Serratus, shoulder blade muscles","Core"],
  "scapular-pull-ups":["Breiter Rückenmuskel, unterer Trapez","Rautenmuskeln, Unterarme (Griff)","Lats, lower traps","Rhomboids, forearms (grip)"],
  "dead-hang":["Unterarme (Griff), breiter Rückenmuskel","Schultern, Rumpf","Forearms (grip), lats","Shoulders, core"],

  "air-squats":["Oberschenkel vorn, Gesäß","Adduktoren, Oberschenkel hinten, Rumpf","Quads, glutes","Adductors, hamstrings, core"],
  "split-squats":["Oberschenkel vorn, Gesäß","Adduktoren, Rumpf","Quads, glutes","Adductors, core"],
  "bulgarian-split-squats":["Oberschenkel vorn, Gesäß","Adduktoren, Rumpf, Hüftbeuger des hinteren Beins (Dehnung)","Quads, glutes","Adductors, core, back-leg hip flexor (stretch)"],
  "forward-lunges":["Oberschenkel vorn, Gesäß","Oberschenkel hinten, Waden","Quads, glutes","Hamstrings, calves"],
  "single-leg-glute-bridge":["Gesäß, Oberschenkel hinten","Seitliches Gesäß, Rumpf","Glutes, hamstrings","Side glutes, core"],
  "lateral-lunge-pulses":["Gesäß, Oberschenkel vorn, Adduktoren","Rumpf","Glutes, quads, adductors","Core"],

  "plank":["Tiefe Bauchmuskeln, gerader Bauch","Schultern, Gesäß, Rückenstrecker","Deep core, abs","Shoulders, glutes, lower back"],
  "side-plank":["Schräge Bauchmuskeln, seitliches Gesäß","Schultern, tiefe Bauchmuskeln","Obliques, side glutes","Shoulders, deep core"],
  "dead-bug":["Tiefe Bauchmuskeln, gerader Bauch","Hüftbeuger, Schultern","Deep core, abs","Hip flexors, shoulders"],
  "bicycle-crunches":["Schräge Bauchmuskeln, gerader Bauch","Hüftbeuger","Obliques, abs","Hip flexors"],
  "leg-raises":["Hüftbeuger, gerader Bauch (stabilisiert)","Tiefe Bauchmuskeln, schräge Bauchmuskeln","Hip flexors, abs (stabilising)","Deep core, obliques"],
  "jackknives":["Gerader Bauch, Hüftbeuger","Schultern, Oberschenkel vorn","Abs, hip flexors","Shoulders, quads"],
  "side-jackknives":["Schräge Bauchmuskeln","Seitliches Gesäß, Hüftbeuger","Obliques","Side glutes, hip flexors"],
  "hollow-hold":["Gerader Bauch, tiefe Bauchmuskeln","Hüftbeuger, Oberschenkel vorn","Abs, deep core","Hip flexors, quads"],
  "russian-twists":["Schräge Bauchmuskeln","Gerader Bauch, Hüftbeuger","Obliques","Abs, hip flexors"],
  "sit-ups":["Gerader Bauch, Hüftbeuger","Schräge Bauchmuskeln","Abs, hip flexors","Obliques"],
  "toe-touches":["Gerader Bauch","Schultern, Hüftbeuger (Haltearbeit)","Abs","Shoulders, hip flexors (holding)"],
  "plank-shoulder-taps":["Tiefe und schräge Bauchmuskeln, Schultern","Gesäß, Brust","Deep core, obliques, shoulders","Glutes, chest"],
  "toes-to-bar":["Hüftbeuger, gerader Bauch","Breiter Rückenmuskel, Unterarme (Griff)","Hip flexors, abs","Lats, forearms (grip)"],

  "close-grip-push-ups":["Trizeps, Brust","Vordere Schulter, Rumpf","Triceps, chest","Front delts, core"],
  "diamond-push-ups":["Trizeps, Brust","Vordere Schulter, Rumpf","Triceps, chest","Front delts, core"],
  "sphinx-push-ups":["Trizeps","Schultern, Rumpf","Triceps","Shoulders, core"],
  "triceps-curls":["Trizeps","Schultern, Rumpf","Triceps","Shoulders, core"],
  "arm-circles":["Seitliche und hintere Schulter","Oberer Rücken, Trapez","Side and rear delts","Upper back, traps"],

  "neck-stretch":["Seitliche Nackenmuskeln, oberer Trapez","","Side neck muscles, upper traps",""],
  "pallof-press":["Schräge Bauchmuskeln, tiefe Bauchmuskeln","Gerader Bauch, Schultern, Gesäß","Obliques, deep core","Abs, shoulders, glutes"],
  "copenhagen-plank":["Adduktoren (Innenschenkel), schräge Bauchmuskeln","Seitliches Gesäß, Schultern, tiefe Bauchmuskeln","Adductors (inner thighs), obliques","Side glutes, shoulders, deep core"],
  "backpack-row":["Breiter Rückenmuskel, oberer Rücken","Bizeps, hintere Schulter, Rückenstrecker","Lats, upper back","Biceps, rear delts, lower back"],
  "knee-push-ups":["Brust, Trizeps, vordere Schulter","Rumpf, Sägemuskel","Chest, triceps, front delts","Core, serratus"],
  "single-leg-calf-raise":["Waden (Zwillings- und Schollenmuskel)","Fußmuskulatur","Calves (gastrocnemius, soleus)","Foot muscles"],
  "negative-dips":["Trizeps, Brust","Vordere Schulter, Rumpf","Triceps, chest","Front delts, core"],
  "db-bench-press":["Brust, vordere Schulter","Trizeps","Chest, front delts","Triceps"],
  "db-step-ups":["Oberschenkel vorn, Gesäß","Oberschenkel hinten, Waden, Rumpf","Quads, glutes","Hamstrings, calves, core"],
  "sumo-squat-db":["Oberschenkel vorn, Gesäß","Adduktoren, Oberschenkel hinten","Quads, glutes","Adductors, hamstrings"],
  "single-leg-rdl":["Oberschenkel hinten, Gesäß","Rückenstrecker, Rumpf","Hamstrings, glutes","Lower back, core"],
  "nordic-curl":["Oberschenkel hinten","Gesäß, Waden, Rumpf","Hamstrings","Glutes, calves, core"],
  "chin-tuck":["Nacken (tiefe Halsbeuger, Nackenstrecker)","","Neck (deep neck flexors, neck extensors)",""],
  "thoracic-rotation":["Oberer Rücken, Brust","Schräge Bauchmuskeln, hintere Schulter","Upper back, chest","Obliques, rear delts"],
  "shoulder-stretch":["Hintere Schulter, oberer Rücken","","Rear delts, upper back",""],
  "triceps-stretch":["Trizeps","Breiter Rückenmuskel","Triceps","Lats"],
  "biceps-stretch":["Bizeps, vordere Schulter","Brust","Biceps, front delts","Chest"],
  "chest-stretch":["Brust, vordere Schulter","Bizeps","Chest, front delts","Biceps"],
  "wrist-stretch":["Unterarmbeuger und -strecker","","Wrist flexors and extensors",""],
  "side-bend":["Schräge Bauchmuskeln, breiter Rückenmuskel","Seitlicher unterer Rücken","Obliques, lats","Side of lower back"],
  "cat-cow":["Beweglichkeit der Wirbelsäule, Rückenstrecker","Bauch, Nacken","Spinal mobility, lower back","Abs, neck"],
  "childs-pose":["Unterer Rücken, breiter Rückenmuskel","Gesäß, Schultern","Lower back, lats","Glutes, shoulders"],
  "sphinx-stretch":["Bauch, Hüftbeuger","Streckung der Wirbelsäule","Abs, hip flexors","Spinal extension"],
  "downward-dog":["Waden, Oberschenkel hinten","Schultern, breiter Rückenmuskel","Calves, hamstrings","Shoulders, lats"],
  "spinal-twist":["Schräge Bauchmuskeln, unterer Rücken","Gesäß, Brust","Obliques, lower back","Glutes, chest"],
  "forward-fold":["Oberschenkel hinten, unterer Rücken","Waden","Hamstrings, lower back","Calves"],
  "hip-flexor-stretch":["Hüftbeuger, Oberschenkel vorn","","Hip flexors, quads",""],
  "quad-stretch":["Oberschenkel vorn, Hüftbeuger","","Quads, hip flexors",""],
  "hamstring-stretch":["Oberschenkel hinten","Waden, unterer Rücken","Hamstrings","Calves, lower back"],
  "calf-stretch":["Waden","Achillessehne","Calves","Achilles tendon"],
  "figure-four":["Gesäß, tiefe Hüftrotatoren (Piriformis)","","Glutes, deep hip rotators (piriformis)",""],
  "pigeon-stretch":["Gesäß, tiefe Hüftrotatoren (vorderes Bein)","Hüftbeuger (hinteres Bein)","Glutes, deep hip rotators (front leg)","Hip flexors (back leg)"],
  "butterfly-stretch":["Adduktoren (Oberschenkel-Innenseite)","Hüfte","Adductors (inner thighs)","Hips"],
  "worlds-greatest":["Hüftbeuger, Oberschenkel hinten, oberer Rücken","Adduktoren, Brust","Hip flexors, hamstrings, upper back","Adductors, chest"]
};
/* Kachel „Aufwärmen & Dehnen“: diese Programme stehen unter Aufwärmen, alle übrigen Dehnprogramme unter Dehnen */
/* Fokus-Filter der Bibliothek: diese Workouts stehen unter „Bauch / Core“ statt unter „Arme“
   (sonst zählen die Liegestütz-Varianten sie automatisch zu den Armen) */
var LIB_WORKOUT_INFO = {};   // Hinweis auf dem Deckblatt eines fertigen Workouts: id -> [Deutsch, Englisch] (Einträge folgen am Ende dieser Datei)
var LIB_FOKUS_TAUSCH = {
  "chest-bw":    { weg:"arms", dazu:"core" },
  "upper-power": { weg:"arms", dazu:"core" }
};
var AUFWAERM_IDS = ["warmup-5","warmup-ganz","warmup-kraft","warmup-hiit","stretch-morning"];
/* Übungen im Reiter „Aufwärmen · Übungen“ (Dehnen · Übungen = alle Übungen der Hauptkategorie Stretch) */
var AUFWAERM_UEBUNGEN = ["jumping-jacks","high-knees","fast-feet","air-squats","lateral-hops","skater-jumps","good-mornings","bird-dog",
  "reverse-lunges","glute-bridge","scapular-push-ups","plank-steps","arm-circles","cat-cow","worlds-greatest","downward-dog"];
/* ---------- Widerstandsband (Air) ----------
   Gerät „band“ (Loop- oder Griffband). Die Figuren zeichnen das Band als dünne Linie (Klasse „gb“); Befestigung
   (Pfosten, Stange) als kleiner Ring. Die Posen werden aus Winkeln gebaut (0° = nach rechts, 90° = nach unten),
   damit Arme und Beine überall gleich lang bleiben. Texte: eigene Formulierungen, Technikhinweise allgemein üblich
   (siehe FACHPRUEFUNG.md - Fachprüfung offen). */
EQUIPS.splice(3, 0, { id:"band", de:"Widerstandsband", en:"Resistance band" });
(function(){
  function r1(v){ return Math.round(v*10)/10; }
  function J(p, deg, len){ var r = deg*Math.PI/180; return [p[0]+Math.cos(r)*len, p[1]+Math.sin(r)*len]; }
  function pt(a){ return r1(a[0])+" "+r1(a[1]); }
  function schulter(p, n){ return [p[0]+(n[0]-p[0])*.85, p[1]+(n[1]-p[1])*.85]; }
  function arm(p, n, a1, a2){ var e = J(schulter(p, n), a1, 11), h = J(e, a2, 12.5); return [r1(e[0]), r1(e[1]), r1(h[0]), r1(h[1])]; }
  function leg(p, a1, a2, zeh){ var k = J(p, a1, 20), a = J(k, a2, 19), z = zeh || [8, 0]; return [r1(k[0]), r1(k[1]), r1(a[0]), r1(a[1]), r1(a[0]+z[0]), r1(a[1]+z[1])]; }
  /* Punkte tragen eine Marke (.t): Hand h, Fuß f, Knie k + Nummer - damit das Band in der Animation mitläuft und sich dehnt */
  function hand(q, i){ var a = q.a[i || 0], r = [a[a.length-2], a[a.length-1]]; r.t = "h"+(i || 0); return r; }
  function fuss(q, i){ var l = q.l[i || 0], r = [l[2], l[3]]; r.t = "f"+(i || 0); return r; }
  function knie(q, i){ var l = q.l[i || 0], r = [l[0], l[1]]; r.t = "k"+(i || 0); return r; }
  /* Band als Linienzug durch die Punkte; mehrere Linien: mehrere bl()-Aufrufe aneinanderhängen */
  /* data-bd: dieselbe Linie als Marken (Hand/Fuß/Knie oder fester Punkt) - die Animation zeichnet sie neu, wenn sich die Glieder bewegen */
  function bl(){
    var d = "", bd = [];
    for(var i=0;i<arguments.length;i++){ var p = arguments[i]; d += (i ? "L" : "M")+pt(p); bd.push(p.t || (r1(p[0])+","+r1(p[1]))); }
    return '<path class="ip gb" d="'+d+'" data-bd="'+bd.join("|")+'"/>';
  }
  /* wie bl(), aber vor dem Körper gezeichnet (z. B. Band zwischen den Händen vor der Brust) */
  function blv(){ return bl.apply(null, arguments).replace('class="ip gb"', 'class="ip gb gv"'); }
  function anker(x, y){ return '<circle class="ip" cx="'+x+'" cy="'+y+'" r="2.4"/>'; }
  /* Seitenansicht: Hüfte p, Rumpfwinkel deg, Beine/Arme als Winkelpaare, gear(q) liefert das Band */
  function S(p, deg, legs, arms, gear, o){
    o = o || {};
    var n = J(p, deg, o.len || 30);
    var q = Q(o.h || null, [r1(n[0]), r1(n[1])], [r1(p[0]), r1(p[1])],
              legs.map(function(l){ return leg(p, l[0], l[1], l[2]); }),
              arms.map(function(a){ return arm(p, n, a[0], a[1]); }), "", false, o.b || 1);
    if(gear) q.x = gear(q);
    return q;
  }
  /* Vorderansicht: beide Arme gespiegelt aus dem linken Winkelpaar (a1, a2); L = nur linker Arm eigens */
  var FL = [[46,70,45,89,39,89],[54,70,55,89,61,89]];
  var FP = [50,52], FN = [50,20];
  function M(a1, a2){ return [[a1, a2], [180-a1, 180-a2]]; }
  function F(arms, gear, beine){
    var q = Q(null, FN.slice(), FP.slice(), (beine || FL).map(function(l){ return l.slice(); }),
              arms.map(function(a){ return arm(FP, FN, a[0], a[1]); }), "", true);
    if(gear) q.x = gear(q);
    return q;
  }
  /* Vorderansicht, kleinere Figur: Hals y 28, Hüfte y 56 - die Arme über dem Kopf bleiben im Bild (Hände bei y ≈ 9) */
  function FU(arms, gear){
    var n = [50,28], p = [50,56];
    var q = Q(null, n, p, FL.map(function(l){ return [l[0], l[1]+2, l[2], l[3], l[4], l[5]]; }),
              arms.map(function(a){ return arm(p, n, a[0], a[1]); }), "", true);
    if(gear) q.x = gear(q);
    return q;
  }
  /* Vorderansicht, vorgebeugt (Reverse Fly): kurzer Rumpf (Hals y 38, Hüfte y 54), Knie leicht gebeugt, Kopf bleibt über den Schultern */
  function FH(arms, gear){
    var n = [50,38], p = [50,54];
    var q = Q(null, n, p, [[46,71,45,89,39,89],[54,71,55,89,61,89]], arms.map(function(a){ return arm(p, n, a[0], a[1]); }), "", true);
    if(gear) q.x = gear(q);
    return q;
  }
  var STAND = [[90, 90]];
  /* Arme über dem Kopf: kleinere Figur (wie „Trizeps-Curls“), damit die Hände noch im Bild bleiben */
  function SU(arms, gear){
    var q = qWith(P_STUP, { a:arms.map(function(a){ return arm(P_STUP.p, P_STUP.n, a[0], a[1]); }) });
    if(gear) q.x = gear(q);
    return q;
  }

  /* kleiner Ring um das Knie (Band über den Knien) */
  function ring(x, y){ return '<path class="ip gb" d="M'+(x-5)+' '+y+'Q'+(x-5)+' '+(y-6)+' '+x+' '+(y-6)+'Q'+(x+5)+' '+(y-6)+' '+(x+5)+' '+y+'Q'+(x+5)+' '+(y+6)+' '+x+' '+(y+6)+'Q'+(x-5)+' '+(y+6)+' '+(x-5)+' '+y+'Z"/>'; }
  var BAND = [];
  /* id, Name DE, Name EN, Fokus, Runden, Sekunden, je Seite, Hinweis DE, Hinweis EN, Stufe, Belastung, Hauptkategorie,
     [Pose A, Pose B], [Anleitung DE, EN], [Haltung DE, Vermeiden DE, Haltung EN, Vermeiden EN], [Muskeln DE, Hilfsmuskeln DE, EN, EN], Suchwörter */
  function E(id, de, en, cats, rounds, work, side, hDe, hEn, lvl, intens, main, poses, info, post, mus, such){
    BAND.push({ id:id, de:de, en:en, cats:cats, rounds:rounds, work:work, side:side, hDe:hDe, hEn:hEn, lvl:lvl, int:intens, main:main,
                poses:poses, info:info, post:post, mus:mus, such:such || "" });
  }

  /* ===== Rücken ===== */
  E("band-standing-row", "Rudern im Stand mit Band", "Standing Band Row", "back", 6, 30, 0,
    "Band auf Brusthöhe befestigen, Ellbogen eng zurück", "Anchor the band at chest height, elbows back close",
    1, 2, "kraft",
    [S([50,50], -90, STAND, [[2,0]], function(q){ return anker(92,30)+bl([92,30], hand(q)); }),
     S([50,50], -90, STAND, [[120,-5]], function(q){ return anker(92,30)+bl([92,30], hand(q)); })],
    ["Das Band auf Brusthöhe an einem stabilen Pfosten oder einer Stange befestigen, die Enden greifen und so weit zurücktreten, dass es leicht gespannt ist.|Die Arme nach vorn strecken, Schultern tief.|Die Ellbogen eng am Körper nach hinten ziehen, die Schulterblätter zusammenführen und langsam zurückgehen.",
     "Anchor the band at chest height on a sturdy post or bar, hold the ends and step back until it is lightly stretched.|Reach your arms forward, shoulders low.|Pull your elbows back close to your body, squeeze your shoulder blades together and return slowly."],
    ["Aufrecht, Brust offen, Blick geradeaus.|Schultern weg von den Ohren, Ellbogen nah am Körper.", "Mit dem Oberkörper nach hinten lehnen, um Schwung zu holen.",
     "Stand tall, chest open, eyes forward.|Shoulders away from your ears, elbows close to your body.", "Leaning back to gain momentum."],
    ["Breiter Rückenmuskel, oberer Rücken", "Bizeps, hintere Schulter, Rumpf", "Lats, upper back", "Biceps, rear delts, core"],
    "rudern ziehen");

  E("band-bent-over-row", "Vorgebeugtes Rudern mit Band", "Bent-over Band Row", "back", 6, 30, 0,
    "Auf dem Band stehen, Rücken gerade", "Stand on the band, back flat",
    1, 2, "kraft",
    [(function(){ var q = S([40,50], -25, [[80,95]], [[95,92]]); q.x = bl([48,89], hand(q)); return q; })(),
     (function(){ var q = S([40,50], -25, [[80,95]], [[160,100]]); q.x = bl([48,89], hand(q)); return q; })()],
    ["Mit beiden Füßen auf die Mitte des Bandes treten, die Enden greifen.|Aus der Hüfte nach vorn beugen, Rücken gerade, Arme hängen unter den Schultern.|Die Ellbogen nach hinten oben zur Hüfte ziehen, kurz halten, langsam wieder senken.",
     "Stand with both feet on the middle of the band and hold the ends.|Hinge forward at the hips, back flat, arms hanging under your shoulders.|Pull your elbows back and up towards your hips, pause briefly and lower slowly."],
    ["Rücken gerade, Nacken in Verlängerung der Wirbelsäule.|Knie leicht gebeugt, Gewicht auf der ganzen Fußsohle.", "Den Rücken rund machen oder mit Schwung ziehen.",
     "Back flat, neck in line with your spine.|Knees slightly bent, weight over the whole foot.", "Rounding your back or yanking with momentum."],
    ["Breiter Rückenmuskel, oberer Rücken", "Bizeps, hintere Schulter, Rückenstrecker", "Lats, upper back", "Biceps, rear delts, lower back"],
    "rudern vorgebeugt");

  E("band-lat-pull-apart", "Band auseinanderziehen über Kopf", "Overhead Band Pull-apart", "back", 6, 30, 0,
    "Arme über Kopf, Band bis zu den Schultern öffnen", "Arms overhead, open the band down to your shoulders",
    1, 1, "kraft",
    // Kleinere Figur von vorn (damit die Hände über dem Kopf im Bild bleiben): Arme fast gestreckt über dem Kopf, Hände knapp schulterbreit ->
    // die Arme öffnen sich in einem Bogen nach außen bis auf Schulterhöhe, das Band wird straff
    [FU(M(-120,-117), function(q){ return bl(hand(q,0), hand(q,1)); }),
     FU(M(-170,-176), function(q){ return bl(hand(q,0), hand(q,1)); })],
    ["Das Band mit beiden Händen etwas mehr als schulterbreit greifen und die Arme über den Kopf strecken.|Das Band auseinanderziehen und dabei die Arme seitlich bis auf Schulterhöhe absenken.|Kontrolliert wieder nach oben führen.",
     "Hold the band a little wider than shoulder width and reach your arms overhead.|Pull the band apart and lower your arms out to the sides down to shoulder height.|Return to the top under control."],
    ["Rippen unten, Bauch fest, Blick geradeaus.|Schulterblätter nach unten und hinten ziehen.", "Ins Hohlkreuz fallen oder die Schultern hochziehen.",
     "Ribs down, core braced, eyes forward.|Draw your shoulder blades down and back.", "Arching your lower back or shrugging your shoulders."],
    ["Breiter Rückenmuskel, oberer Rücken", "Hintere Schulter, Trapez, Rumpf", "Lats, upper back", "Rear delts, traps, core"],
    "pull apart lat");

  E("band-pull-down", "Zug nach unten mit Band", "Band Pull-down", "back", 6, 30, 0,
    "Band oben befestigen, Ellbogen zu den Rippen", "Anchor the band overhead, elbows to your ribs",
    1, 2, "kraft",
    [S([50,50], -90, STAND, [[-55,-65]], function(q){ return anker(78,2)+bl([78,2], hand(q)); }),
     S([50,50], -90, STAND, [[100,-95]], function(q){ return anker(78,2)+bl([78,2], hand(q)); })],
    ["Das Band oben an einer Stange oder einem Pfosten befestigen, die Enden greifen und mit gestreckten Armen darunter stehen.|Die Ellbogen nach unten zu den Rippen ziehen, Brust offen.|Langsam wieder nach oben lassen, ohne dass das Band erschlafft.",
     "Anchor the band overhead on a bar or post, hold the ends and stand under it with your arms extended.|Pull your elbows down towards your ribs, chest open.|Let your arms rise slowly without letting the band go slack."],
    ["Brust offen, Schultern tief, Rumpf fest.|Zug aus dem Rücken, nicht aus den Händen.", "Den Oberkörper weit nach hinten lehnen.",
     "Chest open, shoulders low, core braced.|Pull with your back, not just your hands.", "Leaning far back to heave the band down."],
    ["Breiter Rückenmuskel", "Bizeps, hintere Schulter, Rumpf", "Lats", "Biceps, rear delts, core"],
    "latzug lat pulldown");

  E("band-assisted-pull-up", "Klimmzug mit Bandhilfe", "Band-assisted Pull-up", "back calis", 5, 20, 0,
    "Band um die Stange, Fuß oder Knie hinein", "Loop the band over the bar, foot or knee in",
    2, 3, "stange",
    [qWith(P_HANG, { x:gBar(6,24,76)+bl([42,6], [42,80], [48,86]) }),
     qWith(P_PULL, { x:gBar(6,24,76)+bl([42,6], [42,66], [48,72]) })],
    ["Ein Loop-Band fest um eine stabile Stange legen, ein Ende durchziehen, festziehen und kräftig daran ziehen, ob es hält. Dann den Fuß oder das Knie hineinsetzen (Knie = weniger Hilfe).|Die Stange etwas mehr als schulterbreit greifen und ruhig hängen. Das Band hilft unten am meisten und lässt nach oben nach.|Das Kinn über die Stange ziehen und langsam wieder ablassen – nicht vom Band hochschleudern lassen. Zum Absteigen erst sicheren Stand suchen (Boden oder Stuhl), dann den Fuß oder das Knie aus dem Band nehmen.",
     "Loop a band firmly around a sturdy bar, pull one end through, cinch it and give it a hard tug to check it holds. Then put your foot or knee in it (knee = less help).|Grip the bar a little wider than shoulder width and hang still. The band helps most at the bottom and less as you rise.|Pull your chin over the bar and lower slowly – don't let the band catapult you up. To get down, first find secure footing (floor or chair), then take your foot or knee out of the band."],
    ["Schultern vom Ohr weg, Ellbogen nach unten.|Körper ruhig, Blick nach vorn.", "Mit Schwung aus den Beinen hochkommen oder im Band federn.",
     "Shoulders away from your ears, elbows down.|Keep your body still, eyes forward.", "Kicking or bouncing in the band to get up."],
    ["Breiter Rückenmuskel, oberer Rücken", "Bizeps, Unterarme, Rauten, Rumpf", "Lats, upper back", "Biceps, forearms, rhomboids, core"],
    "klimmzug pull up unterstützung");

  /* ===== Brust ===== */
  E("band-push-ups", "Liegestütze mit Band", "Band Push-ups", "arms", 6, 20, 0,
    "Band über den Rücken, Hände fassen die Enden", "Band across your back, hands hold the ends",
    3, 3, "kraft",
    [qWith(P_PH, { x:bl([70,88], [44,60]) }), qWith(P_PL, { x:bl([70,88], [44,76]) })],
    ["Das Band hinter dem Rücken über die Schulterblätter legen und die Enden mit den Händen am Boden fassen.|Körper gerade, dann die Brust kontrolliert zum Boden senken.|Gegen den Widerstand des Bandes wieder hochdrücken.",
     "Place the band across your upper back and hold the ends under your hands on the floor.|Body in one line, lower your chest under control.|Press back up against the band's resistance."],
    ["Linie von Kopf bis Ferse, Bauch und Gesäß fest.|Ellbogen schräg nach hinten.|Zu schwer? Auf den Knien oder mit erhöhten Händen beginnen.", "Die Hüfte durchhängen lassen.",
     "One line from head to heels, core and glutes tight.|Elbows at an angle behind you.|Too hard? Start on your knees or with your hands raised.", "Letting your hips sag."],
    ["Brust, Trizeps, vordere Schulter", "Rumpf, Sägemuskel", "Chest, triceps, front delts", "Core, serratus"],
    "liegestütz push up");

  E("band-chest-fly", "Brust-Fly mit Band", "Band Chest Fly", "arms", 6, 30, 0,
    "Band hinter dem Rücken, Arme vor der Brust zusammenführen", "Band behind your back, bring your arms together in front",
    1, 2, "kraft",
    [F(M(172,178), function(q){ return bl(hand(q,0), [41,37], [59,37], hand(q,1)); }),
     F(M(140,25), function(q){ var a = hand(q,0), b = hand(q,1); return bl(a, [60,27], [40,27], b); })],
    ["Das Band hinter dem Rücken auf Höhe der Schulterblätter legen und die Enden greifen.|Die Arme seitlich öffnen, Ellbogen leicht gebeugt.|Die Arme in einem weiten Bogen vor der Brust zusammenführen und langsam wieder öffnen.",
     "Place the band behind your back at shoulder-blade height and hold the ends.|Open your arms to the sides, elbows slightly bent.|Bring your arms together in a wide arc in front of your chest and open them slowly."],
    ["Schultern tief, Brust offen, Ellbogen leicht gebeugt.|Rumpf fest, kein Hohlkreuz.", "Die Arme durchstrecken oder mit Schwung zusammenschlagen.",
     "Shoulders low, chest open, elbows slightly bent.|Core braced, no arched back.", "Locking out your arms or swinging them together."],
    ["Brust", "Vordere Schulter, Trizeps", "Chest", "Front delts, triceps"],
    "butterfly fliegende");

  E("band-reverse-fly", "Reverse Fly mit Band", "Band Reverse Fly", "back arms", 6, 30, 0,
    "Vorgebeugt, Arme seitlich öffnen und das Band auseinanderziehen", "Hinged forward, open your arms to the sides and pull the band apart",
    1, 1, "kraft",
    // Vorgebeugt (kurzer Rumpf von vorn, Kopf bleibt über den Schultern): Arme hängen gestreckt vor den Knien, Hände zusammen ->
    // die Arme öffnen sich seitlich bis auf Schulterhöhe und ziehen das Band auseinander
    [FH(M(108,100), function(q){ return blv(hand(q,0), hand(q,1)); }),
     FH(M(178,180), function(q){ return blv(hand(q,0), hand(q,1)); })],
    ["Das Band mit beiden Händen schulterbreit greifen, aus der Hüfte nach vorn beugen und die Arme gestreckt vor den Knien hängen lassen.|Die Arme seitlich bis auf Schulterhöhe öffnen und das Band auseinanderziehen.|Kontrolliert zurückführen.",
     "Hold the band shoulder-width apart, hinge forward from your hips and let your straight arms hang in front of your knees.|Open your arms out to the sides to shoulder height and pull the band apart.|Return under control."],
    ["Rücken lang und gerade, Ellbogen leicht gebeugt, Schulterblätter zusammenziehen.|Nacken in Verlängerung der Wirbelsäule, Blick zum Boden.", "Die Schultern zu den Ohren ziehen oder den Rücken rund oder hohl machen.",
     "Long flat back, elbows slightly bent, squeeze your shoulder blades together.|Neck in line with your spine, eyes on the floor.", "Shrugging your shoulders or rounding or arching your back."],
    ["Hintere Schulter, oberer Rücken", "Rauten, Trapez, Rumpf", "Rear delts, upper back", "Rhomboids, traps, core"],
    "reverse fly hintere schulter");

  E("band-chest-fly-up", "Fly von unten nach oben mit Band", "Low-to-high Band Fly", "arms", 6, 30, 0,
    "Band unten befestigen, Arme diagonal nach oben zusammenführen", "Anchor the band low, bring your arms together diagonally upwards",
    2, 2, "kraft",
    [F(M(125,110), function(q){ return bl([20,89], hand(q,0))+bl([80,89], hand(q,1)); }),
     F(M(150,-30), function(q){ return bl([20,89], hand(q,0))+bl([80,89], hand(q,1)); })],
    ["Das Band tief hinter dir an einem Pfosten befestigen, die Enden greifen und leicht nach vorn lehnen.|Die Arme seitlich unten halten, Ellbogen leicht gebeugt.|In einem Bogen nach vorn oben bis vor die Brust ziehen, kurz halten und langsam senken.",
     "Anchor the band low behind you on a post, hold the ends and lean slightly forward.|Hold your arms low at your sides, elbows slightly bent.|Sweep them up and forward to chest height, pause and lower slowly."],
    ["Rumpf fest, ein Bein leicht vorn für sicheren Stand.|Brust offen, Schultern tief.", "Die Schultern nach oben ziehen oder mit dem Körper pendeln.",
     "Braced core, one foot slightly forward for a stable stance.|Chest open, shoulders low.", "Shrugging your shoulders or swaying your body."],
    ["Obere Brust, vordere Schulter", "Trizeps, Rumpf", "Upper chest, front delts", "Triceps, core"],
    "fly kabel brust aufwärts");

  E("band-chest-cross", "Brust-Überkreuzen mit Band", "Band Chest Cross", "arms", 6, 30, 0,
    "Band hinter dem Rücken, Arme vorn überkreuzen", "Band behind your back, cross your arms in front",
    1, 2, "kraft",
    [F(M(175,175), function(q){ return bl(hand(q,0), [41,37], [59,37], hand(q,1)); }),
     F(M(70,60), function(q){ var a = hand(q,0), b = hand(q,1); return bl(a, [43,27], [57,27], b); })],
    ["Das Band hinter dem Rücken auf Höhe der Schulterblätter legen und die Enden greifen.|Die Arme seitlich auf Brusthöhe ausstrecken.|Die Arme vor der Brust überkreuzen, kurz halten und kontrolliert wieder öffnen. Beim nächsten Mal oben überkreuzen.",
     "Place the band behind your back at shoulder-blade height and hold the ends.|Reach your arms out to the sides at chest height.|Cross your arms in front of your chest, pause and open them under control. Alternate which arm is on top."],
    ["Aufrecht, Rumpf fest, Schultern tief.|Ellbogen leicht gebeugt.", "Mit dem Oberkörper nach vorn kippen.",
     "Stand tall, core braced, shoulders low.|Elbows slightly bent.", "Tipping your torso forward."],
    ["Brust", "Vordere Schulter, Rumpf", "Chest", "Front delts, core"],
    "brust kreuzen cross over");

  /* ===== Schultern ===== */
  E("band-lateral-raise", "Seitheben mit Band", "Band Lateral Raise", "arms", 6, 30, 0,
    "Auf dem Band stehen, Arme seitlich bis Schulterhöhe", "Stand on the band, raise your arms to shoulder height",
    1, 2, "kraft",
    [F(M(115,100), function(q){ return bl([43,89], hand(q,0))+bl([57,89], hand(q,1)); }),
     F(M(190,190), function(q){ return bl([43,89], hand(q,0))+bl([57,89], hand(q,1)); })],
    ["Mit beiden Füßen auf die Mitte des Bandes treten und die Enden greifen.|Die Arme mit leicht gebeugten Ellbogen seitlich bis auf Schulterhöhe heben.|Langsam wieder senken.",
     "Stand with both feet on the middle of the band and hold the ends.|Raise your arms out to the sides to shoulder height, elbows slightly bent.|Lower slowly."],
    ["Rumpf fest, Schulterblätter tief.|Ellbogen führen, die Hände bleiben etwas tiefer; nicht höher als Schulterhöhe.", "Mit Schwung aus dem Rücken heben oder die Schultern hochziehen.",
     "Core braced, shoulder blades down.|Lead with your elbows, hands stay a little lower; no higher than shoulder height.", "Swinging from your back or shrugging."],
    ["Seitliche Schulter", "Trapez, Rumpf", "Side delts", "Traps, core"],
    "seitheben schulter");

  E("band-upright-row", "Aufrechtes Rudern mit Band", "Band Upright Row", "arms", 6, 30, 0,
    "Auf dem Band stehen, Ellbogen führen bis Brusthöhe", "Stand on the band, lead with your elbows up to chest height",
    2, 2, "kraft",
    [F([[100,85],[80,95]], function(q){ return bl([45,89], hand(q,0))+bl([55,89], hand(q,1)); }),
     F([[200,60],[-20,120]], function(q){ return bl([45,89], hand(q,0))+bl([55,89], hand(q,1)); })],
    ["Mit beiden Füßen auf das Band treten und die Enden vor dem Körper greifen.|Die Hände eng am Körper entlang bis zur Brust ziehen, die Ellbogen führen nach oben.|Langsam wieder senken.",
     "Stand on the band with both feet and hold the ends in front of your body.|Pull your hands up close to your body to chest height, elbows leading upwards.|Lower slowly."],
    ["Ellbogen höher als die Hände, Schultern tief.|Rumpf fest, Blick geradeaus.", "Höher als Brusthöhe ziehen oder die Schultern hochziehen. Bei Schulterschmerzen weglassen – Seitheben ist die schonendere Alternative.",
     "Elbows higher than your hands, shoulders low.|Core braced, eyes forward.", "Pulling above chest height or shrugging. Skip it if your shoulders hurt – lateral raises are the gentler alternative."],
    ["Seitliche Schulter, Trapez", "Bizeps, Unterarme", "Side delts, traps", "Biceps, forearms"],
    "aufrechtes rudern upright row");

  E("band-front-raise", "Frontheben mit Band", "Band Front Raise", "arms", 6, 30, 0,
    "Auf dem Band stehen, Arme gestreckt bis Schulterhöhe", "Stand on the band, raise straight arms to shoulder height",
    1, 2, "kraft",
    [S([50,50], -90, STAND, [[80,85]], function(q){ return bl([54,89], hand(q)); }),
     S([50,50], -90, STAND, [[0,0]], function(q){ return bl([54,89], hand(q)); })],
    ["Mit beiden Füßen auf das Band treten und die Enden vor den Oberschenkeln greifen.|Die Arme mit leicht gebeugten Ellbogen nach vorn bis auf Schulterhöhe heben.|Langsam wieder senken.",
     "Stand on the band with both feet and hold the ends in front of your thighs.|Raise your arms forward to shoulder height, elbows slightly bent.|Lower slowly."],
    ["Aufrecht, Bauch fest, Blick geradeaus.|Nicht höher als Schulterhöhe heben.", "Mit dem Oberkörper nach hinten lehnen.",
     "Stand tall, core braced, eyes forward.|Lift no higher than shoulder height.", "Leaning back to swing the arms up."],
    ["Vordere Schulter", "Obere Brust, Rumpf", "Front delts", "Upper chest, core"],
    "frontheben vordere schulter");

  E("band-shoulder-press", "Schulterdrücken mit Band", "Band Shoulder Press", "arms", 6, 30, 0,
    "Auf dem Band stehen, Hände von den Schultern nach oben drücken", "Stand on the band, press from your shoulders overhead",
    1, 2, "kraft",
    [F(M(150,-100), function(q){ return bl([44,89], hand(q,0))+bl([56,89], hand(q,1)); }),
     F(M(-125,-100), function(q){ return bl([44,89], hand(q,0))+bl([56,89], hand(q,1)); })],
    ["Mit beiden Füßen auf das Band treten, die Enden greifen und die Hände auf Schulterhöhe bringen.|Die Arme gerade nach oben über den Kopf drücken.|Kontrolliert wieder bis zu den Schultern senken.",
     "Stand on the band with both feet, hold the ends and bring your hands to shoulder height.|Press your arms straight up overhead.|Lower back to your shoulders under control."],
    ["Bauch und Gesäß fest, Rippen unten.|Handgelenke über den Ellbogen.", "Ins Hohlkreuz fallen oder den Kopf nach vorn schieben.",
     "Core and glutes tight, ribs down.|Wrists stacked over your elbows.", "Arching your back or pushing your head forward."],
    ["Schultern", "Trizeps, Trapez, Rumpf", "Shoulders", "Triceps, traps, core"],
    "schulterdrücken overhead press");

  E("band-one-arm-press", "Einarm-Schulterdrücken mit Band", "One-arm Band Press", "arms", 3, 30, 1,
    "Ein Arm drückt, der andere stabilisiert", "One arm presses, the other stays still",
    2, 2, "kraft",
    [F([[30,-80],[120,100]], function(q){ return bl([56,89], hand(q,0)); }),
     F([[-55,-80],[120,100]], function(q){ return bl([56,89], hand(q,0)); })],
    ["Mit einem Fuß auf das Band treten, das Ende in die Hand nehmen und auf Schulterhöhe bringen.|Den Arm gerade über den Kopf drücken, der Rumpf bleibt ruhig.|Kontrolliert senken, nach der Hälfte der Zeit die Seite wechseln.",
     "Stand with one foot on the band, take the end in your hand and bring it to shoulder height.|Press your arm straight overhead while your torso stays still.|Lower under control and switch sides halfway."],
    ["Rumpf fest, Becken gerade.|Handgelenk über dem Ellbogen.", "Zur Seite kippen, um das Band hochzubekommen.",
     "Core braced, hips level.|Wrist stacked over your elbow.", "Leaning sideways to get the band up."],
    ["Schultern", "Trizeps, Rumpf, schräge Bauchmuskeln", "Shoulders", "Triceps, core, obliques"],
    "einarm schulterdrücken");

  /* ===== Bauch ===== */
  E("band-russian-twist", "Rumpfdrehung im Sitzen mit Band", "Seated Band Twist", "core", 6, 30, 0,
    "Band um die Füße, Oberkörper aufrecht drehen", "Band around your feet, rotate with an upright chest",
    2, 2, "rumpf",
    [qWith(RT_SC, { x:bl([79,75], [47,68]) }), qWith(RT_ST, { x:bl([79,75], [39,85]) })],
    ["Auf den Boden setzen, das Band um beide Füße legen und die Enden mit den Händen vor der Brust greifen.|Mit geradem Rücken leicht zurücklehnen, die Füße am Boden oder angehoben.|Den Oberkörper abwechselnd nach links und rechts drehen, die Hände wandern mit.",
     "Sit on the floor, loop the band around both feet and hold the ends in front of your chest.|Lean back slightly with a straight back, feet on the floor or lifted.|Rotate your torso alternately to the left and right, your hands moving with it."],
    ["Brustbein aufrecht, Rücken lang.|Gedreht wird der Oberkörper, das Becken bleibt ruhig.", "Mit rundem Rücken zurückkippen oder nur die Arme bewegen. Bei Rückenbeschwerden kleiner drehen und die Füße am Boden lassen.",
     "Chest up, long spine.|Rotate your torso, keep your hips still.", "Slumping back with a rounded spine or moving only your arms. With back pain, rotate less and keep your feet on the floor."],
    ["Schräge Bauchmuskeln", "Gerader Bauch, Hüftbeuger, Schultern", "Obliques", "Abs, hip flexors, shoulders"],
    "russian twist drehung");

  E("band-kneeling-twist", "Kniende Rumpfdrehung mit Band", "Kneeling Band Rotation", "core", 3, 30, 1,
    "Band seitlich befestigen, aus dem Rumpf drehen", "Anchor the band at your side, rotate from your core",
    2, 2, "rumpf",
    [(function(){ var q = S([48,66], -90, [[90,170,[-6,0]]], [[40,-10]]); q.x = anker(90,44)+bl([90,44], hand(q)); return q; })(),
     (function(){ var q = S([48,66], -90, [[90,170,[-6,0]]], [[100,150]]); q.x = anker(90,44)+bl([90,44], hand(q)); return q; })()],
    ["Das Band auf Brusthöhe seitlich an einer Stange oder einem Pfosten befestigen und mit beiden Händen greifen. Mit der Seite zur Befestigung hinknien.|Die Arme vor der Brust ausstrecken, Rumpf aufrecht.|Den Oberkörper vom Band weg drehen, kurz halten und kontrolliert zurückkehren. Nach der Hälfte die Seite wechseln.",
     "Anchor the band at chest height beside you on a bar or post and hold it with both hands. Kneel sideways to the anchor.|Reach your arms out in front of your chest, torso upright.|Rotate your torso away from the band, pause and return under control. Switch sides halfway."],
    ["Aufrecht knien, Gesäß und Bauch fest.|Die Drehung kommt aus dem Rumpf, Hüfte bleibt ruhig.", "Mit den Armen ziehen oder das Becken mitdrehen.",
     "Kneel tall, glutes and core tight.|Rotate from your torso, keep your hips still.", "Pulling with your arms or turning your hips."],
    ["Schräge Bauchmuskeln", "Gerader Bauch, Rückenstrecker, Schultern", "Obliques", "Abs, lower back, shoulders"],
    "rotation anti rotation woodchop");

  E("band-side-bend", "Seitbeuge mit Band", "Band Side Bend", "core", 3, 30, 1,
    "Auf dem Band stehen, seitlich zur Seite beugen", "Stand on the band, bend sideways",
    1, 1, "rumpf",
    [(function(){ var q = Q(null, [50,20], [50,52], FL.map(function(l){ return l.slice(); }),
                     [arm([50,52],[50,20],-45,200), arm([50,52],[50,20],115,100)], "", true); q.x = bl([43,89], hand(q,1)); return q; })(),
     (function(){ var n = [37,23], p = [53,52], q = Q(null, n, p, FL.map(function(l){ return l.slice(); }),
                     [arm(p,n,-62,205), arm(p,n,92,92)], "", true); q.x = bl([43,89], hand(q,1)); return q; })()],
    ["Mit einem Fuß auf das Band treten, das Ende in die Hand auf dieser Seite nehmen. Die andere Hand an den Kopf legen.|Aufrecht stehen, Bauch fest.|Den Oberkörper seitlich zur Bandseite beugen, kurz halten und wieder aufrichten. Nach der Hälfte die Seite wechseln.",
     "Stand with one foot on the band and hold the end in the hand on that side. Place your other hand by your head.|Stand tall, core braced.|Bend your torso sideways towards the band side, pause and straighten up. Switch sides halfway."],
    ["Seitlich bleiben, nicht nach vorn oder hinten kippen.|Becken ruhig, Blick geradeaus.", "Mit Schwung zur Seite fallen lassen.",
     "Stay in a side plane, don't tip forward or back.|Keep your hips still, eyes forward.", "Dropping sideways with momentum."],
    ["Schräge Bauchmuskeln", "Rückenstrecker, Rumpf", "Obliques", "Lower back, core"],
    "seitbeuge side bend");

  E("band-kneeling-crunch", "Crunch kniend mit Band", "Kneeling Band Crunch", "core", 6, 30, 0,
    "Band oben befestigen, Rumpf einrollen", "Anchor the band overhead, curl your torso down",
    2, 2, "rumpf",
    [(function(){ var q = S([48,66], -90, [[90,170,[-6,0]]], [[-20,-150]]); q.x = anker(70,1)+bl([70,1], hand(q)); return q; })(),
     (function(){ var q = S([48,66], -40, [[90,170,[-6,0]]], [[30,-160]]); q.x = anker(70,1)+bl([70,1], hand(q)); return q; })()],
    ["Das Band oben an einer Stange oder einem Pfosten befestigen, kniend davor setzen und die Enden neben den Kopf halten.|Aufrecht knien, Bauch anspannen.|Den Oberkörper aus dem Bauch heraus nach unten einrollen, kurz halten und langsam wieder aufrichten.",
     "Anchor the band overhead on a bar or post, kneel in front of it and hold the ends beside your head.|Kneel tall, core braced.|Curl your torso downwards using your abs, pause and rise slowly."],
    ["Der Rücken rollt rund ein, die Hüfte bleibt oben.|Die Rippen rollen zum Becken, Ellbogen zeigen Richtung Boden.", "Aus der Hüfte nach vorn abknicken, auf die Fersen setzen oder an den Armen ziehen.",
     "Your spine curls round, hips stay up.|Roll your ribs towards your pelvis, elbows point towards the floor.", "Folding at the hips, sitting back on your heels or pulling with your arms."],
    ["Gerader Bauchmuskel", "Schräge Bauchmuskeln, Hüftbeuger", "Abs", "Obliques, hip flexors"],
    "crunch kabel bauch");

  E("band-crunch", "Crunch liegend mit Band", "Lying Band Crunch", "core", 6, 30, 0,
    "Band hinter dem Kopf befestigen, Oberkörper anheben", "Anchor the band behind your head, lift your upper body",
    1, 2, "rumpf",
    [(function(){ var q = qWith(P_LBK, { a:[arm(P_LBK.p, P_LBK.n, -80, -90)] }); q.x = anker(6,56)+bl([6,56], hand(q)); return q; })(),
     (function(){ var q = Q([22,60], [30,68], [46,86], [[60,70,70,89,78,89]], [], "", false, 1); q.a = [arm(q.p, q.n, -20, -10)]; q.x = anker(6,56)+bl([6,56], hand(q)); return q; })()],
    ["Auf den Rücken legen, Knie angewinkelt, das Band hinter dem Kopf befestigen und die Enden mit beiden Händen vor der Brust halten.|Den unteren Rücken am Boden lassen.|Kopf und Schultern vom Boden einrollen, kurz halten und langsam wieder ablegen.",
     "Lie on your back with your knees bent, anchor the band behind your head and hold the ends in both hands at your chest.|Keep your lower back on the floor.|Curl your head and shoulders off the floor, pause and lower slowly."],
    ["Unterer Rücken bleibt am Boden, Nacken lang.|Der Bauch zieht die Rippen zum Becken.", "Am Nacken ziehen oder mit Schwung hochkommen.",
     "Lower back stays on the floor, neck long.|Your abs draw your ribs towards your pelvis.", "Pulling on your neck or using momentum."],
    ["Gerader Bauchmuskel", "Schräge Bauchmuskeln, Hüftbeuger", "Abs", "Obliques, hip flexors"],
    "crunch bauchpresse");

  /* ===== Bizeps ===== */
  E("band-hammer-curl", "Hammer-Curls mit Band", "Band Hammer Curl", "arms", 6, 30, 0,
    "Auf dem Band stehen, Daumen zeigen nach oben", "Stand on the band, thumbs point up",
    1, 1, "kraft",
    [S([50,50], -90, STAND, [[70,80]], function(q){ return bl([54,89], hand(q)); }),
     S([50,50], -90, STAND, [[55,-110]], function(q){ return bl([54,89], hand(q)); })],
    ["Mit beiden Füßen auf das Band treten und die Enden mit nach innen zeigenden Handflächen greifen.|Die Ellbogen am Körper lassen und die Hände zu den Schultern beugen.|Langsam wieder strecken.",
     "Stand on the band with both feet and hold the ends with your palms facing in.|Keep your elbows by your sides and curl your hands up to your shoulders.|Lower slowly."],
    ["Ellbogen fest an den Rippen, Handgelenke gerade.|Oberkörper ruhig.", "Mit dem Rücken Schwung holen oder die Ellbogen nach vorn schieben.",
     "Elbows pinned to your ribs, wrists straight.|Torso still.", "Swinging with your back or pushing your elbows forward."],
    ["Oberarmmuskel, Bizeps", "Unterarme, vordere Schulter", "Brachialis, biceps", "Forearms, front delts"],
    "hammer curl bizeps");

  E("band-one-arm-curl", "Einarm-Curl mit Band", "One-arm Band Curl", "arms", 3, 30, 1,
    "Ein Fuß auf dem Band, andere Hand an der Hüfte", "One foot on the band, other hand on your hip",
    1, 1, "kraft",
    [S([50,50], -90, STAND, [[70,80],[120,60]], function(q){ return bl([54,89], hand(q,0)); }),
     S([50,50], -90, STAND, [[55,-110],[120,60]], function(q){ return bl([54,89], hand(q,0)); })],
    ["Mit einem Fuß auf das Band treten, das Ende in die Hand nehmen, die andere Hand an die Hüfte.|Den Ellbogen am Körper lassen und die Hand zur Schulter beugen.|Langsam strecken, nach der Hälfte der Zeit die Seite wechseln.",
     "Stand with one foot on the band, take the end in your hand and place your other hand on your hip.|Keep your elbow at your side and curl your hand to your shoulder.|Lower slowly and switch sides halfway."],
    ["Ellbogen am Körper, Schulter tief.|Aufrecht stehen, Bauch fest.", "Den Oberkörper nach hinten lehnen.",
     "Elbow at your side, shoulder low.|Stand tall, core braced.", "Leaning back to lift."],
    ["Bizeps", "Unterarme, vordere Schulter", "Biceps", "Forearms, front delts"],
    "einarm curl bizeps");

  E("band-biceps-curl", "Bizeps-Curls mit Band", "Band Biceps Curl", "arms", 6, 30, 0,
    "Auf dem Band stehen, Handflächen nach vorn", "Stand on the band, palms facing forward",
    1, 1, "kraft",
    [F(M(115,100), function(q){ return bl([43,89], hand(q,0))+bl([57,89], hand(q,1)); }),
     F(M(115,-95), function(q){ return bl([43,89], hand(q,0))+bl([57,89], hand(q,1)); })],
    ["Mit beiden Füßen auf das Band treten und die Enden mit den Handflächen nach vorn greifen.|Die Ellbogen am Körper lassen und die Hände zu den Schultern beugen.|Langsam wieder strecken.",
     "Stand on the band with both feet and hold the ends with your palms facing forward.|Keep your elbows at your sides and curl your hands up to your shoulders.|Lower slowly."],
    ["Ellbogen fest am Körper, Schultern tief.|Rücken gerade, Knie leicht weich.", "Mit Schwung aus dem Rücken curlen.",
     "Elbows fixed at your sides, shoulders low.|Back straight, knees soft.", "Swinging the weight up with your back."],
    ["Bizeps", "Unterarme, vordere Schulter", "Biceps", "Forearms, front delts"],
    "bizeps curl");

  E("band-concentration-curl", "Konzentrations-Curl mit Band", "Seated Band Concentration Curl", "arms", 3, 30, 1,
    "Ellbogen auf dem Oberschenkel, Band unter dem Fuß", "Elbow on your thigh, band under your foot",
    1, 1, "kraft",
    [S([42,66], -40, [[0,92]], [[88,85]], function(q){ return gBench(24,54,67)+bl([64,88], hand(q)); }),
     S([42,66], -40, [[0,92]], [[88,-75]], function(q){ return gBench(24,54,67)+bl([64,88], hand(q)); })],
    ["Aufrecht auf einen Stuhl oder eine Bank setzen, einen Fuß auf das Band stellen und das Ende in die Hand nehmen. Den Ellbogen innen auf den Oberschenkel legen.|Den Arm hängen lassen.|Die Hand zur Schulter beugen, kurz halten und langsam senken. Nach der Hälfte die Seite wechseln.",
     "Sit on a chair or bench, put one foot on the band and take the end in your hand. Rest the back of your upper arm on the inside of your thigh.|Let your arm hang.|Curl your hand towards your shoulder, pause and lower slowly. Switch sides halfway."],
    ["Oberarm bleibt auf dem Oberschenkel, Rücken gerade.|Langsam und voll bewegen.", "Mit dem Oberkörper mitschwingen.",
     "Upper arm stays on your thigh, back straight.|Move slowly through the full range.", "Rocking your torso to help."],
    ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
    "konzentrationscurl");

  /* ===== Trizeps ===== */
  E("band-overhead-triceps", "Trizeps-Strecken über Kopf mit Band", "Overhead Band Triceps Press", "arms", 3, 30, 1,
    "Eine Hand hinter dem Rücken, die andere drückt nach oben", "One hand behind your back, the other presses overhead",
    2, 1, "kraft",
    [SU([[-55,160],[100,95]], function(q){ return bl(hand(q,1), [42,46], hand(q,0)); }),
     SU([[-72,-78],[100,95]], function(q){ return bl(hand(q,1), [42,46], hand(q,0)); })],
    ["Ein Ende des Bandes mit einer Hand hinter dem Rücken auf Höhe des unteren Rückens halten, das andere Ende mit der oberen Hand greifen und den Ellbogen hinter den Kopf beugen.|Den oberen Ellbogen nah am Kopf lassen.|Den Arm nach oben strecken, langsam beugen. Nach der Hälfte die Seite wechseln.",
     "Hold one end of the band behind your back at lower-back height with one hand, take the other end with your top hand and bend your elbow behind your head.|Keep the top elbow close to your head.|Extend your arm upwards and bend it slowly. Switch sides halfway."],
    ["Oberarm bleibt senkrecht, Rippen unten.|Bauch fest, kein Hohlkreuz.", "Den Ellbogen nach vorn oder zur Seite ausweichen lassen.",
     "Upper arm stays vertical, ribs down.|Core braced, no arched back.", "Letting your elbow drift forward or out."],
    ["Trizeps", "Schulter, Rumpf", "Triceps", "Shoulder, core"],
    "trizeps überkopf");

  E("band-triceps-pressdown", "Trizeps-Drücken nach unten mit Band", "Band Triceps Pushdown", "arms", 6, 30, 0,
    "Band oben befestigen, Ellbogen am Körper", "Anchor the band overhead, elbows at your sides",
    1, 1, "kraft",
    [S([50,50], -90, STAND, [[90,-20]], function(q){ return anker(88,2)+bl([88,2], hand(q)); }),
     S([50,50], -90, STAND, [[90,90]], function(q){ return anker(88,2)+bl([88,2], hand(q)); })],
    ["Das Band oben an einer Stange oder einem Pfosten befestigen, die Enden greifen und davor stehen.|Die Ellbogen an die Rippen legen, die Unterarme zeigen nach vorn.|Die Hände nach unten drücken, bis die Arme gestreckt sind, und langsam zurückkehren.",
     "Anchor the band overhead on a bar or post, hold the ends and stand in front of it.|Place your elbows by your ribs, forearms pointing forward.|Press your hands down until your arms are straight and return slowly."],
    ["Ellbogen bleiben fest am Körper, oben nicht höher als die Brust.|Handgelenke gerade, Schultern tief.", "Die Ellbogen nach vorn schwingen lassen (dann zieht der Rücken mit) oder mit dem Oberkörper nachhelfen.",
     "Elbows stay fixed at your sides, no higher than chest level at the top.|Wrists straight, shoulders low.", "Letting your elbows swing forward (your back starts to pull) or helping with your torso."],
    ["Trizeps", "Schultern, Unterarme", "Triceps", "Shoulders, forearms"],
    "trizeps pushdown pressdown");

  E("band-side-triceps", "Einarm-Trizeps seitlich mit Band", "One-arm Side Triceps Extension", "arms", 3, 30, 1,
    "Band seitlich oben befestigen, Arm nach unten strecken", "Anchor the band high at your side, extend your arm down",
    1, 1, "kraft",
    [F([[30,-85],[120,100]], function(q){ return anker(86,2)+bl([86,2], hand(q,0)); }),
     F([[30,95],[120,100]], function(q){ return anker(86,2)+bl([86,2], hand(q,0)); })],
    ["Das Band seitlich oben an einem Pfosten befestigen, das Ende in die Hand nehmen und daneben stehen.|Den Ellbogen am Körper, die Hand auf Schulterhöhe.|Den Arm nach unten strecken, langsam beugen. Nach der Hälfte die Seite wechseln.",
     "Anchor the band high on a post beside you, take the end in your hand and stand next to it.|Keep your elbow at your side, hand at shoulder height.|Extend your arm downwards and bend it slowly. Switch sides halfway."],
    ["Ellbogen bleibt am Körper, Oberkörper ruhig.|Schultern tief.", "Den Oberkörper zur Seite kippen.",
     "Elbow stays at your side, torso still.|Shoulders low.", "Tilting your torso sideways."],
    ["Trizeps", "Schulter, Rumpf", "Triceps", "Shoulder, core"],
    "trizeps einarm seitlich");

  E("band-triceps-kickback", "Trizeps-Kickback mit Band", "Band Triceps Kickback", "arms", 6, 30, 0,
    "Auf dem Band stehen, vorgebeugt, Arm nach hinten strecken", "Stand on the band, hinged forward, extend your arm back",
    1, 1, "kraft",
    [(function(){ var q = S([40,50], -25, [[80,95]], [[170,95]]); q.x = bl([48,89], hand(q)); return q; })(),
     (function(){ var q = S([40,50], -25, [[80,95]], [[170,175]]); q.x = bl([48,89], hand(q)); return q; })()],
    ["Mit beiden Füßen auf das Band treten und die Enden greifen. Aus der Hüfte nach vorn beugen, Rücken gerade.|Den Oberarm eng am Körper nach hinten führen, der Unterarm hängt.|Den Unterarm nach hinten strecken, kurz halten und langsam beugen.",
     "Stand with both feet on the band and hold the ends. Hinge forward at the hips with a flat back.|Bring your upper arm back close to your body, forearm hanging.|Extend your forearm backwards, pause and bend slowly."],
    ["Oberarm bleibt parallel zum Rücken und still.|Rücken gerade, Nacken lang.", "Mit dem ganzen Arm schwingen.",
     "Upper arm stays parallel to your back and still.|Back flat, neck long.", "Swinging the whole arm."],
    ["Trizeps", "Hintere Schulter, Rückenstrecker", "Triceps", "Rear delts, lower back"],
    "trizeps kickback");

  E("band-overhead-extension", "Trizeps-Strecken über Kopf mit Band (beidhändig)", "Two-hand Overhead Band Extension", "arms", 6, 30, 0,
    "Auf dem Band stehen, beide Hände über dem Kopf strecken", "Stand on the band, extend both hands overhead",
    2, 1, "kraft",
    [SU([[-55,160]], function(q){ return bl([46,89], [38,52], hand(q)); }),
     SU([[-72,-78]], function(q){ return bl([46,89], [38,52], hand(q)); })],
    ["Mit einem Fuß auf das Bandende treten, das andere Ende mit beiden Händen hinter dem Kopf halten.|Die Ellbogen zeigen nach oben, dicht am Kopf.|Die Arme nach oben strecken und langsam wieder beugen.",
     "Step on one end of the band and hold the other end with both hands behind your head.|Elbows point up, close to your head.|Extend your arms upwards and bend them slowly."],
    ["Ellbogen eng am Kopf, Rippen unten.|Bauch und Gesäß fest.", "Die Ellbogen nach außen öffnen oder ins Hohlkreuz fallen.",
     "Elbows close to your head, ribs down.|Core and glutes tight.", "Flaring your elbows or arching your back."],
    ["Trizeps", "Schultern, Rumpf", "Triceps", "Shoulders, core"],
    "trizepsstrecken überkopf");

  /* ===== Gesäß ===== */
  E("band-clamshell", "Muschel mit Band", "Band Clamshell", "legs", 3, 30, 1,
    "Seitlich liegen, Knie öffnen, Füße bleiben zusammen", "Lie on your side, open your knees, keep your feet together",
    1, 1, "kraft",
    [(function(){ var q = S([48,80], 187, [[2,178],[18,180]], [[40,5]], null, { len:24 }); q.x = bl(knie(q,0), knie(q,1)); return q; })(),
     (function(){ var q = S([48,80], 187, [[-35,142],[18,180]], [[40,5]], null, { len:24 }); q.x = bl(knie(q,0), knie(q,1)); return q; })()],
    ["Auf die Seite legen, die Knie angewinkelt, das Band um beide Oberschenkel knapp über den Knien.|Die Füße bleiben aufeinander, das Becken stabil.|Das obere Knie gegen das Band öffnen, kurz halten und langsam schließen. Nach der Hälfte die Seite wechseln.",
     "Lie on your side with your knees bent and the band around both thighs just above the knees.|Keep your feet together and your pelvis steady.|Open your top knee against the band, pause and close slowly. Switch sides halfway."],
    ["Becken bleibt stabil, nicht nach hinten rollen.|Bauch leicht angespannt.", "Mit dem Becken mitkippen, statt aus der Hüfte zu öffnen.",
     "Keep your pelvis stable, don't roll back.|Core lightly braced.", "Rolling your pelvis instead of opening from the hip."],
    ["Seitlicher Gesäßmuskel", "Tiefe Hüftrotatoren, Großer Gesäßmuskel, Oberschenkel außen, Rumpf", "Glute medius", "Deep hip rotators, glute max, outer thigh, core"],
    "muschel clamshell");

  E("band-leg-abduction", "Beinheben zur Seite mit Band", "Standing Band Leg Abduction", "legs", 3, 30, 1,
    "Band um die Knöchel, Bein seitlich öffnen", "Band around your ankles, lift your leg out to the side",
    1, 1, "kraft",
    [(function(){ var q = Q(null, FN.slice(), FP.slice(), FL.map(function(l){ return l.slice(); }), [arm(FP,FN,150,60), arm(FP,FN,30,120)], "", true); q.x = bl([45,86], [55,86]); return q; })(),
     (function(){ var q = Q(null, FN.slice(), FP.slice(), [[46,70,45,89,39,89],[60,69,72,81,78,83]], [arm(FP,FN,150,60), arm(FP,FN,30,120)], "", true); q.x = bl([45,86], [72,81]); return q; })()],
    ["Das Band um beide Knöchel legen und aufrecht hinstellen, eine Hand an einer Wand oder Stuhllehne.|Das Standbein leicht gebeugt, den Oberkörper aufrecht.|Das andere Bein gestreckt seitlich anheben, kurz halten und kontrolliert zurückführen. Nach der Hälfte die Seite wechseln.",
     "Put the band around both ankles and stand tall, one hand on a wall or chair back.|Keep the standing knee soft and your torso upright.|Lift the other leg out to the side with a straight knee, pause and return under control. Switch sides halfway."],
    ["Oberkörper aufrecht, Becken gerade.|Fußspitze zeigt nach vorn, das Bein nur so hoch, wie das Becken ruhig bleibt (als Faustregel etwa 45°).", "Zur Seite lehnen oder das Bein höher heben – dann kippt das Becken mit und der Rumpf hilft nach.",
     "Torso upright, hips level.|Toes point forward; lift only as high as your pelvis stays still (about 45° as a rule of thumb).", "Leaning sideways or lifting higher – your pelvis tips and your trunk takes over."],
    ["Seitlicher Gesäßmuskel", "Großer Gesäßmuskel, Oberschenkel außen", "Glute medius", "Glute max, outer thigh"],
    "abduktion beinheben seitlich");

  E("band-single-leg-deadlift", "Einbeiniges Kreuzheben mit Band", "Single-leg Band Deadlift", "legs", 3, 30, 1,
    "Auf dem Band stehen, Hüfte nach hinten, Bein nach hinten", "Stand on the band, hips back, free leg back",
    2, 2, "kraft",
    [(function(){ var q = S([50,50], -90, STAND, [[90,90]]); q.x = bl([54,89], hand(q)); return q; })(),
     (function(){ var q = S([47,52], -12, [[88,92],[183,178,[-7,0]]], [[95,92]]); q.x = bl([55,89], hand(q)); return q; })()],
    ["Mit einem Fuß auf das Band treten, die Enden greifen, Standbein leicht gebeugt.|Aus der Hüfte nach vorn beugen und das freie Bein gestreckt nach hinten heben, Rücken gerade.|Mit dem Gesäß wieder aufrichten. Nach der Hälfte die Seite wechseln.",
     "Stand on the band with one foot, hold the ends, standing knee slightly bent.|Hinge forward at the hips and lift the free leg straight behind you, back flat.|Rise back up using your glutes. Switch sides halfway."],
    ["Rücken gerade, Hüfte zeigt zum Boden.|Standbein leicht gebeugt, Blick leicht vor den Fuß.", "Den Rücken rund machen oder die Hüfte seitlich aufdrehen.",
     "Back flat, hips square to the floor.|Standing knee soft, eyes slightly ahead of your foot.", "Rounding your back or opening your hips sideways."],
    ["Oberschenkel hinten, Großer Gesäßmuskel", "Rückenstrecker, Breiter Rückenmuskel, Rumpf", "Hamstrings, glutes", "Lower back, lats, core"],
    "kreuzheben einbeinig rdl");

  E("band-glute-bridge", "Glute Bridge mit Band", "Band Glute Bridge", "legs", 6, 30, 0,
    "Band über den Knien, Becken heben, Knie nach außen drücken", "Band above your knees, lift your hips, push your knees out",
    1, 1, "kraft",
    [qWith(P_LBK, { x:ring(60,70) }), Q([14,83],[24,84],[46,68],[[62,64,70,89,78,89]],[[33,88,43,88]], ring(62,64))],
    ["Auf den Rücken legen, Füße hüftbreit aufstellen, das Band um die Oberschenkel knapp über den Knien.|Die Knie leicht gegen das Band nach außen drücken.|Das Becken anheben, oben das Gesäß anspannen, kurz halten und langsam absenken.",
     "Lie on your back with your feet hip-width apart and the band around your thighs just above the knees.|Press your knees gently out against the band.|Lift your hips, squeeze your glutes at the top, pause and lower slowly."],
    ["Knie bleiben über den Füßen, Rippen unten.|Oben eine gerade Linie von Schulter bis Knie.", "Ins Hohlkreuz überstrecken oder die Knie nach innen fallen lassen.",
     "Knees stay over your feet, ribs down.|A straight line from shoulders to knees at the top.", "Over-arching your back or letting your knees fall in."],
    ["Großer Gesäßmuskel", "Oberschenkel hinten, seitlicher Gesäßmuskel, Rumpf", "Glutes", "Hamstrings, glute medius, core"],
    "glute bridge beckenheben");

  E("band-donkey-kick", "Fersenstoß im Vierfüßler mit Band", "Band Donkey Kick", "legs", 3, 30, 1,
    "Band unter dem Fuß, Bein nach hinten strecken", "Band under your foot, extend your leg back",
    2, 1, "kraft",
    [(function(){ var q = Q(null, [66,66], [40,66], [[44,84,26,87,20,88],[40,88,22,89,16,89]], [[67,78,68,89]]); q.x = bl([68,88], fuss(q,0)); return q; })(),
     (function(){ var q = Q(null, [66,66], [40,66], [[26,74,7,76,3,77],[40,88,22,89,16,89]], [[67,78,68,89]]); q.x = bl([68,88], fuss(q,0)); return q; })()],
    ["In den Vierfüßlerstand gehen, das Band mit den Händen am Boden halten und um einen Fuß legen.|Rücken gerade, Bauch angespannt.|Das Bein nach hinten oben strecken, oben das Gesäß anspannen und langsam zurückführen. Nach der Hälfte die Seite wechseln.",
     "Get on all fours, hold the band under your hands on the floor and loop it around one foot.|Back flat, core braced.|Extend the leg back and up, squeeze your glute at the top and return slowly. Switch sides halfway."],
    ["Rücken bleibt gerade, Becken zeigt zum Boden.|Bewegung aus der Hüfte.", "Ins Hohlkreuz kippen, um das Bein höher zu bekommen.",
     "Back stays flat, hips square to the floor.|Move from the hip.", "Arching your lower back to lift the leg higher."],
    ["Großer Gesäßmuskel", "Oberschenkel hinten, Rumpf", "Glutes", "Hamstrings, core"],
    "donkey kick fersenstoß");

  /* ===== Beine ===== */
  E("band-squat", "Kniebeuge mit Band", "Band Squat", "legs", 6, 30, 0,
    "Auf dem Band stehen, Enden an den Schultern", "Stand on the band, ends at your shoulders",
    1, 2, "kraft",
    [(function(){ var q = qWith(P_ST, { a:[arm(P_ST.p, P_ST.n, 70, -100)] }); q.x = bl([54,89], hand(q)); return q; })(),
     (function(){ var q = qWith(P_SQ, { a:[arm(P_SQ.p, P_SQ.n, 70, -100)] }); q.x = bl([54,89], hand(q)); return q; })()],
    ["Mit beiden Füßen auf das Band treten und die Enden an den Schultern halten.|Hüfte nach hinten unten, Knie zeigen in Fußrichtung, Oberkörper aufrecht.|Mit Druck durch die Füße wieder aufstehen.",
     "Stand on the band with both feet and hold the ends at your shoulders.|Sit your hips back and down, knees tracking over your toes, torso upright.|Drive through your feet to stand up."],
    ["Fersen bleiben am Boden, Brust offen.|Knie in Richtung der Zehen.", "Die Knie nach innen fallen lassen oder die Fersen heben.",
     "Heels stay down, chest open.|Knees track over your toes.", "Letting your knees cave in or lifting your heels."],
    ["Oberschenkel vorn, Gesäß", "Oberschenkel hinten, Rumpf, Schultern", "Quads, glutes", "Hamstrings, core, shoulders"],
    "kniebeuge squat");

  E("band-prone-leg-curl", "Beinbeugen im Liegen mit Band", "Prone Band Leg Curl", "legs", 3, 30, 1,
    "Bauchlage, Band am Fuß, Ferse zum Gesäß", "Lie face down, band on your foot, heel to glute",
    1, 1, "kraft",
    [(function(){ var q = qWith(P_LF, {}); q.x = bl([6,86], fuss(q,0)); return q; })(),
     (function(){ var q = qWith(P_LF, { l:[[70,86,62,67,56,63]] }); q.x = bl([6,86], fuss(q,0)); return q; })()],
    ["Auf den Bauch legen, das Band vorn befestigen oder mit den Händen halten und um einen Fuß legen.|Hüfte bleibt am Boden.|Die Ferse zum Gesäß ziehen, kurz halten und langsam strecken. Nach der Hälfte die Seite wechseln.",
     "Lie face down, anchor the band in front of you or hold it in your hands and loop it around one foot.|Keep your hips on the floor.|Pull your heel towards your glute, pause and extend slowly. Switch sides halfway."],
    ["Hüfte flach am Boden, Bauch leicht angespannt.|Langsam beugen und strecken.", "Das Becken hebt sich, um Schwung zu holen.",
     "Hips flat on the floor, core lightly braced.|Bend and extend slowly.", "Lifting your pelvis to get momentum."],
    ["Oberschenkel hinten", "Waden, Gesäß", "Hamstrings", "Calves, glutes"],
    "beinbeuger leg curl");

  E("band-lunge-squat", "Ausfallschritt mit Band", "Band Split Squat", "legs", 3, 30, 1,
    "Vorderen Fuß auf das Band, Enden an den Schultern", "Front foot on the band, ends at your shoulders",
    2, 2, "kraft",
    [(function(){ var q = S([48,50], -90, [[65,95],[115,105]], [[70,-100]]); q.x = bl([58,89], hand(q)); return q; })(),
     (function(){ var q = S([48,62], -90, [[15,100],[125,170]], [[70,-100]]); q.x = bl([64,89], hand(q)); return q; })()],
    ["Mit dem vorderen Fuß auf die Mitte des Bandes treten, ein großer Schritt zurück mit dem anderen Bein. Die Enden an den Schultern halten.|Aufrecht senken, bis beide Knie etwa 90° gebeugt sind.|Mit Druck durch den vorderen Fuß wieder hochkommen. Nach der Hälfte die Seite wechseln.",
     "Stand with your front foot on the middle of the band and take a big step back with the other leg. Hold the ends at your shoulders.|Lower straight down until both knees are bent to about 90°.|Drive through your front foot to rise. Switch sides halfway."],
    ["Oberkörper aufrecht, vorderes Knie über dem Fuß.|Gewicht auf der ganzen Fußsohle vorn.", "Das vordere Knie nach innen fallen lassen oder nach vorn kippen.",
     "Torso upright, front knee over your foot.|Weight over your whole front foot.", "Letting your front knee cave in or tipping forward."],
    ["Oberschenkel vorn, Gesäß", "Oberschenkel hinten, Waden, Rumpf", "Quads, glutes", "Hamstrings, calves, core"],
    "ausfallschritt lunge split squat");

  E("band-lying-leg-press", "Beinstrecken im Liegen mit Band", "Lying Band Leg Press", "legs", 3, 30, 1,
    "Band um den Fuß, Bein gegen den Widerstand strecken", "Band around your foot, press your leg out against the resistance",
    1, 1, "kraft",
    // Rückenlage, Kopf links: das Arbeitsbein kommt mit angewinkeltem Knie zur Brust (Oberschenkel fast senkrecht, Unterschenkel nach oben vorn), die Hände
    // halten das Band am Fuß nah an der Brust; dann wird das Bein nach oben gestreckt. Das andere Bein steht angewinkelt am Boden.
    [(function(){ var q = S([46,86], 180, [[-102,-48,[7,-2]],[-62,62]], [[-72,-22],[-78,-30]], null, { h:[14,83], len:22 }); q.x = bl(fuss(q,0), hand(q)); return q; })(),
     (function(){ var q = S([46,86], 180, [[-100,-94,[6,-4]],[-62,62]], [[-72,-22],[-78,-30]], null, { h:[14,83], len:22 }); q.x = bl(fuss(q,0), hand(q)); return q; })()],
    ["Auf den Rücken legen, ein Bein anwinkeln und das Band um den Fuß legen. Die Enden mit beiden Händen nah an der Brust halten.|Das andere Bein bleibt angewinkelt am Boden.|Das Bein nach oben strecken, kurz halten und langsam wieder beugen. Nach der Hälfte die Seite wechseln.",
     "Lie on your back, bend one leg and loop the band around the foot. Hold the ends in both hands close to your chest.|The other leg stays bent on the floor.|Extend your leg upwards, pause and bend slowly. Switch sides halfway."],
    ["Rücken und Kopf bleiben am Boden.|Bein langsam strecken, Knie nicht durchdrücken.", "Das Becken vom Boden heben, das Knie überstrecken oder das Band vom Fuß rutschen lassen – es schnellt zurück. Band um den Fußballen legen, bei Rutschgefahr abbrechen.",
     "Back and head stay on the floor.|Extend slowly, don't lock the knee.", "Lifting your hips, locking your knee or letting the band slip off your foot – it snaps back. Wrap it around the ball of your foot and stop if it slips."],
    ["Oberschenkel vorn", "Gesäß, Hüftbeuger", "Quads", "Glutes, hip flexors"],
    "beinpresse beinstrecker liegend");

  /* ===== zweite Ansicht (Info-Karte zeigt zwei Figuren) ===== */
  function posen(id){ return BAND.filter(function(e){ return e.id === id; })[0].poses; }
  /* Drehung im Sitzen von vorn: Hände links ↔ rechts, das Band läuft von den Füßen zu den Händen (zwei Posen mit je eigenem Band) */
  function rtBand(q){ return qWith(q, { x:bl(fuss(q,0), hand(q))+bl(fuss(q,1), hand(q)) }); }
  /* kniend von vorn: die Hände wandern von der Befestigung weg und zurück */
  var KP = [50,66], KN = [50,38], KB = [[46,86,44,88],[54,86,56,88]];
  function knieVorn(armen){ var q = Q(null, KN.slice(), KP.slice(), KB.map(function(l){ return l.slice(); }),
    armen.map(function(a){ return arm(KP, KN, a[0], a[1]); }), "", true); q.x = anker(92,44)+bl([92,44], hand(q,0)); return q; }
  /* Kniebeuge von vorn: Knie nach außen, Band unter den Füßen zu den Händen an den Schultern */
  function squatVorn(tief){
    var arme = [[150,-100],[30,-80]];
    var q = tief ? Q(null, [50,36], [50,64], [[36,76,41,89,35,89],[64,76,59,89,65,89]], [], "", true)
                 : Q(null, FN.slice(), FP.slice(), FL.map(function(l){ return l.slice(); }), [], "", true);
    q.a = arme.map(function(a){ return arm(q.p, q.n, a[0], a[1]); });
    q.x = bl([42,89], hand(q,0))+bl([58,89], hand(q,1));
    return q;
  }
  ILLU_VIEW2["band-russian-twist"] = { typ:"front", p:[rtBand(RT_FL), rtBand(RT_FR)] };
  ILLU_VIEW2["band-kneeling-twist"] = { typ:"front", p:[knieVorn([[5,-5],[-5,5]]), knieVorn([[185,175],[175,185]])] };
  ILLU_VIEW2["band-squat"] = { typ:"front", p:[squatVorn(false), squatVorn(true)] };
  ILLU_VIEW2["band-hammer-curl"] = { typ:"front", p:posen("band-biceps-curl") };
  ILLU_VIEW2["band-biceps-curl"] = { typ:"side", haupt:"front", p:posen("band-hammer-curl") };

  /* ===== eintragen ===== */
  BAND.forEach(function(e){
    EXERCISE_ROWS.push([e.id, e.de, e.en, e.cats, e.rounds, e.work, e.side ? 1 : 0, e.hDe, e.hEn]);
    EX_LEVEL[e.id] = e.lvl;
    if(e.int !== 2) EX_INT[e.id] = e.int;
    EX_EQUIP[e.id] = e.id === "band-assisted-pull-up" ? "band bar" : "band";
    if(e.main !== "kraft") EX_MAIN_ROWS[e.main] += " "+e.id;
    ILLU_POSES[e.id] = e.poses;
    EX_INFO[e.id] = e.info;
    EX_POSTURE[e.id] = e.post;
    EX_MUSCLES[e.id] = e.mus;
    EX_SUCH_ALIAS[e.id] = (e.such+" theraband gummiband fitnessband widerstandsband band").trim();
  });
  /* Ketten „leichter / schwerer“ */
  LZ_KETTEN.push(["push-ups", "band-push-ups"]);
  LZ_KETTEN.push(["band-assisted-pull-up", "pull-ups"]);
  LZ_KETTEN.push(["air-squats", "band-squat"]);
  /* fertige Workouts mit dem Band: Reihenfolge so, dass sich die Muskelgruppen abwechseln */
  LIB_WORKOUT_ROWS.push(
    ["band-full-body","Ganzkörper mit Band","Full Body with Band","mix","band-squat band-standing-row band-push-ups band-shoulder-press band-biceps-curl band-triceps-pressdown band-crunch",20,"3/40/20"],
    ["band-upper","Oberkörper mit Band","Upper Body with Band","arms","band-standing-row band-shoulder-press band-reverse-fly band-chest-fly band-lateral-raise band-hammer-curl",20,"3/40/20"],
    ["band-legs-glutes","Beine & Po mit Band","Legs & Glutes with Band","legs","band-squat band-single-leg-deadlift band-lunge-squat band-glute-bridge band-leg-abduction band-clamshell",20,"3/40/20"],
    ["band-core","Rumpf mit Band","Core with Band","core","band-russian-twist band-kneeling-twist band-side-bend band-crunch plank",20,"3/40/20"]
  );
  /* Mehr Abwechslung (2026-10-23): zusammengestellte Workouts für Muskelgruppen, die im Katalog nur ein oder zwei (oder gar kein) Workout hatten.
     Regel: je Gruppe und Ort höchstens 25 % gleiche Übungen wie in den bestehenden Workouts der Gruppe (hier 0 %, nur bei den Battle Ropes 20 % untereinander,
     weil es dort nur zehn Übungen gibt). */
  LIB_WORKOUT_ROWS.push(
    ["bw-chest-band","Brust mit Band","Chest with Band","mix","knee-push-ups band-push-ups band-chest-fly band-chest-fly-up band-chest-cross",20,"3/40/20"],
    ["gym-chest-db","Brust mit Kurzhanteln (Fitnessstudio)","Chest with Dumbbells (Gym)","weight","incline-db-press db-bench-press decline-db-bench db-fly around-world-pullover",60],
    ["gym-chest-cable","Brust Kabel & Smith (Fitnessstudio)","Chest Cable & Smith (Gym)","weight","smith-incline-press smith-bench-press assisted-dip cable-chest-fly standing-cable-fly low-to-high-cable-fly",60],
    ["gym-shoulders-db","Schultern mit Kurzhanteln (Fitnessstudio)","Shoulders with Dumbbells (Gym)","weight","seated-db-shoulder-press arnold-press lean-away-lateral-raise db-front-raise db-rear-delt-fly cuban-press",60],
    ["gym-shoulders-cable","Schultern Kabel & Langhantel (Fitnessstudio)","Shoulders Cable & Barbell (Gym)","weight","barbell-overhead-press cable-shoulder-press cable-lateral-raise seated-rear-delt-fly smith-shrug",60],
    ["bw-shoulders","Schultern ohne Geräte","Shoulders without Equipment","bw","pike-push-ups scapular-push-ups bear-crawl skin-the-cat",30],
    ["band-shoulders","Schultern mit Band","Shoulders with Band","mix","band-shoulder-press band-lateral-raise band-front-raise band-upright-row band-reverse-fly band-one-arm-press",20,"3/40/20"],
    ["gym-back-cable","Rücken am Kabel (Fitnessstudio)","Back with Cables (Gym)","back","rope-lat-pulldown wide-grip-cable-row underhand-cable-row one-arm-cable-row straight-arm-pulldown",60],
    ["gym-back-free-weights","Rücken mit Langhantel & Kurzhantel (Fitnessstudio)","Back with Barbell & Dumbbell (Gym)","back","barbell-row t-bar-row chest-supported-row meadows-row one-arm-row",60],
    ["gym-biceps","Bizeps (Fitnessstudio)","Biceps (Gym)","arms","db-curl incline-db-curl preacher-curl concentration-curl spider-curl zottman-curl",60],
    ["gym-triceps","Trizeps (Fitnessstudio)","Triceps (Gym)","arms","close-grip-db-press db-skull-crusher rope-triceps-pushdown one-arm-cable-triceps-extension lying-cable-triceps-extension tate-press",60],
    ["gym-core-cable","Rumpf am Kabel (Fitnessstudio)","Core with Cables (Gym)","core","pallof-press standing-cable-crunch cable-lift cable-twist cable-reverse-crunch",60],
    ["gym-core-crunch","Bauch: Crunch-Varianten (Fitnessstudio)","Core: Crunch Variations (Gym)","core","crunch crunch-arms-straight crunch-hands-overhead cross-body-crunch judo-flip",45]
  );
  /* Programme fürs Fitnessstudio (2026-10-10), nach Empfehlungen aus der Trainingswissenschaft (siehe quellen.html):
     - Einsteiger: Ganzkörper 2-3 Mal pro Woche, 3 Sätze mit 8-12 Wiederholungen (ACSM), zu Beginn gern 3 × 12; vier Tage: Ober-/Unterkörper
     - Reihenfolge: große vor kleinen Muskeln, mehrgelenkige vor eingelenkigen Übungen, Drücken und Ziehen im Wechsel
     - Pausen je Übung aus der Bibliothek (60 s an Geräten, 90 s bei schweren Grundübungen); 3 Sätze à 40 s Arbeit entsprechen etwa 12 Wiederholungen
     Ohne Zeitvorgabe (tm): jede Übung läuft mit ihren eigenen Werten. Tiefenmuskulatur mit vier Runden, damit Seitenübungen gleich oft laufen. */
  LIB_WORKOUT_ROWS.push(
    ["gym-fullbody","Ganzkörper A (Fitnessstudio)","Full Body A (Gym)","mix","leg-press chest-press-machine lat-pulldown leg-curl shoulder-press-machine ab-crunch-machine",60],
    ["gym-fullbody-b","Ganzkörper B (Fitnessstudio)","Full Body B (Gym)","mix","hip-thrust incline-chest-press cable-row leg-extension lateral-raise-machine triceps-pushdown cable-crunch",60],
    ["gym-upper","Oberkörper (Fitnessstudio)","Upper Body (Gym)","mix","chest-press-machine lat-pulldown shoulder-press-machine cable-row triceps-pushdown cable-curl",60],
    ["gym-lower","Unterkörper (Fitnessstudio)","Lower Body (Gym)","legs","leg-press leg-curl hip-thrust leg-extension abductor-machine calf-machine",60],
    ["gym-legday","Legday (Fitnessstudio)","Leg Day (Gym)","legs","barbell-squat leg-curl leg-press hip-thrust leg-extension calf-machine",60],
    ["gym-chest","Brust & Trizeps (Fitnessstudio)","Chest & Triceps (Gym)","weight","chest-press-machine incline-chest-press butterfly cable-crossover triceps-pushdown overhead-cable-triceps",60],
    ["gym-back","Rücken & Bizeps (Fitnessstudio)","Back & Biceps (Gym)","back","lat-pulldown row-machine face-pull back-extension cable-curl hammer-curl",60],
    ["gym-shoulders","Schultern (Fitnessstudio)","Shoulders (Gym)","weight","shoulder-press-machine lateral-raise-machine reverse-butterfly face-pull shrugs",60],
    ["gym-arms","Arme (Fitnessstudio)","Arms (Gym)","arms","barbell-curl skull-crusher hammer-curl triceps-pushdown cable-curl overhead-cable-triceps",60],
    ["gym-db-upper","Oberkörper mit Kurzhanteln (Fitnessstudio)","Upper Body with Dumbbells (Gym)","weight","db-bench-press one-arm-row shoulder-press lateral-raise hammer-curl triceps-curls",60],
    ["gym-db-fullbody","Ganzkörper mit Kurzhanteln (Fitnessstudio)","Full Body with Dumbbells (Gym)","mix","goblet-squat db-bench-press one-arm-row romanian-deadlift shoulder-press plank",60],
    ["gym-glutes","Po & Beine (Fitnessstudio)","Glutes & Legs (Gym)","legs","hip-thrust leg-press cable-pull-through abductor-machine glute-kickback-cable adductor-machine",60],
    ["gym-core","Bauch & Rumpf (Fitnessstudio)","Abs & Core (Gym)","core","captains-chair cable-crunch ab-crunch-machine rotary-torso cable-woodchop back-extension-machine",60],
    ["gym-posture","Haltung & Rücken (Fitnessstudio)","Posture & Back (Gym)","back","row-machine reverse-butterfly face-pull close-grip-pulldown back-extension-machine plank",60],
    ["gym-deepcore","Tiefenmuskulatur (Fitnessstudio)","Deep Core (Gym)","core","dead-bug bird-dog plank side-plank rotary-torso back-extension cable-woodchop",60,"4/40/30"]
  );
  /* Einsteiger ohne Geräte (2026-10-14): nur Übungen der Stufe 1-2, zwei Runden à 30 s, 30 s Pause; Reihenfolge wechselt Beine, Druck, Hüfte, Rumpf */
  LIB_WORKOUT_ROWS.push(
    ["beginner-fullbody","Ganzkörper für Einsteiger (ohne Geräte)","Full Body for Beginners (no equipment)","mix","jumping-jacks air-squats knee-push-ups glute-bridge bird-dog reverse-lunges plank",30,"2/30/30"],
    ["beginner-legs","Beine für Einsteiger (ohne Geräte)","Legs for Beginners (no equipment)","legs","air-squats reverse-lunges glute-bridge calf-raises wall-sit",30,"2/30/30"],
    ["beginner-upper","Oberkörper für Einsteiger (ohne Geräte)","Upper Body for Beginners (no equipment)","mix","scapular-push-ups knee-push-ups prone-y-raise prone-t-raise superman-hold plank",30,"2/30/30"]
  );
  /* Kurzer Hinweis auf dem Deckblatt: für wen, wie oft, wie. [Deutsch, Englisch] */
  Object.assign(LIB_WORKOUT_INFO, {
    "gym-fullbody": ["Für Einsteiger: 3 Sätze mit je 12 Wiederholungen, 2–3 Mal pro Woche im Wechsel mit Ganzkörper B, dazwischen ein Ruhetag. Das Gewicht so wählen, dass die letzten Wiederholungen anstrengend, aber sauber gehen. Schaffst du alle 3 × 12, nimm beim nächsten Mal etwas mehr.",
      "For beginners: 3 sets of 12 reps, 2–3 times a week, alternating with Full Body B and a rest day in between. Pick a weight that makes the last reps hard but clean. Once you manage 3 × 12, add a little next time."],
    "gym-fullbody-b": ["Gegenstück zu Ganzkörper A mit anderen Übungen für dieselben Muskelgruppen. A und B im Wechsel, 2–3 Mal pro Woche, 3 × 12.",
      "The counterpart to Full Body A with different exercises for the same muscle groups. Alternate A and B, 2–3 times a week, 3 × 12."],
    "gym-upper": ["Teil eines Plans für vier Tage pro Woche: zum Beispiel Mo Oberkörper, Di Unterkörper, Do Oberkörper, Fr Unterkörper. Drücken und Ziehen wechseln sich ab. 3 × 10–12.",
      "Part of a four-day plan: for example Mon upper, Tue lower, Thu upper, Fri lower. Pushing and pulling alternate. 3 × 10–12."],
    "gym-lower": ["Gegenstück zum Oberkörper-Tag (vier Tage pro Woche). Erst die großen Beinübungen, dann Hüfte und Waden. 3 × 10–12.",
      "The counterpart to the upper-body day (four days a week). Big leg exercises first, then hips and calves. 3 × 10–12."],
    "gym-legday": ["Die schwere Kniebeuge kommt zuerst, solange die Beine frisch sind. 3 × 8–12, nach der Kniebeuge 90 Sekunden Pause. Einmal pro Woche reicht am Anfang. Mit der Beinpresse statt Kniebeuge wird es einsteigerfreundlicher.",
      "The heavy squat comes first while your legs are fresh. 3 × 8–12, 90 seconds rest after squats. Once a week is enough at first. Swap the squat for the leg press to make it beginner-friendly."],
    "gym-chest": ["Erst das große Drücken, dann die Schräge für die obere Brust, danach die Fliegende und zuletzt der Trizeps (er hat beim Drücken schon mitgearbeitet). 3 × 10–12, ein bis zwei Mal pro Woche.",
      "Big press first, then the incline for the upper chest, then the fly, triceps last (they already worked during the presses). 3 × 10–12, once or twice a week."],
    "gym-back": ["Einmal senkrecht ziehen (Latzug), einmal waagerecht (Rudern), dazu hintere Schulter und unterer Rücken; der Bizeps kommt zuletzt. Mit den Ellbogen ziehen, nicht mit den Händen. 3 × 10–12.",
      "One vertical pull (pulldown), one horizontal (row), plus rear shoulders and lower back; biceps come last. Pull with your elbows, not your hands. 3 × 10–12."],
    "gym-shoulders": ["Erst drücken, dann seitlich und nach hinten: so bleibt die Schulter ausgewogen. Leichte Gewichte, saubere Bewegung, 3 × 12–15.",
      "Press first, then out to the side and back: that keeps the shoulder balanced. Light weights, clean movement, 3 × 12–15."],
    "gym-arms": ["Bizeps und Trizeps im Wechsel, so kann sich der jeweils andere erholen. 3 × 10–12, am besten nach einem Ganzkörper- oder Oberkörpertag, nicht an zwei Tagen hintereinander.",
      "Biceps and triceps alternate so the other one can recover. 3 × 10–12, best after a full-body or upper-body day, not on two days in a row."],
    "gym-glutes": ["Hip Thrust zuerst, dann Beinpresse und die Hüftübungen. 3 × 10–15, oben kurz anspannen und langsam zurück.",
      "Hip thrust first, then leg press and the hip exercises. 3 × 10–15, squeeze briefly at the top and come back slowly."],
    "gym-core": ["Bauch und Rumpf mit Geräten: Beinheben, Crunch, Drehungen und der Rückenstrecker als Gegenspieler. 3 × 12–15, zwei bis drei Mal pro Woche.",
      "Abs and core on machines: knee raises, crunches, rotations and the back extension as the counterpart. 3 × 12–15, two to three times a week."],
    "gym-posture": ["Für lange Schreibtischtage: mehr ziehen als drücken, hintere Schulter und Rückenstrecker. Leicht, kontrolliert, 3 × 12–15.",
      "For long desk days: more pulling than pushing, rear shoulders and back extensors. Light, controlled, 3 × 12–15."],
    "gym-deepcore": ["Die tiefen Bauch- und Rückenmuskeln stabilisieren die Wirbelsäule. Langsam und kontrolliert, bei der Anstrengung ausatmen. Vier Runden à 40 Sekunden. Ergänzt das Krafttraining, ersetzt es nicht.",
      "The deep abdominal and back muscles stabilise the spine. Slow and controlled, breathe out on the effort. Four rounds of 40 seconds. Complements strength training, does not replace it."],
    /* Ergänzungen 2026-10-23 (Mehr Abwechslung): Hinweise ohne Studienversprechen, nur Praxisregeln */
    "bw-chest-band": ["Brust mit dem Band für zu Hause oder unterwegs: Liegestütze auf den Knien, mit Band und die Fliegende in drei Winkeln. Rhythmus: 3 Sätze à 40 Sekunden, 20 Sekunden Pause. Steigern (Praxisregel, keine Studie): dickeres Band oder kürzer greifen.",
      "Chest with a band for home or on the go: knee push-ups, band push-ups and the fly from three angles. Rhythm: 3 sets of 40 seconds, 20 seconds rest. To progress (practical rule, not a study): a thicker band or a shorter grip."],
    "gym-chest-db": ["Mit Kurzhanteln ist die Bewegung freier als an der Maschine: die Drückübungen schräg, flach und geneigt zuerst, danach Fliegende und zum Schluss der Pullover. 3 × 10–12, ein bis zwei Mal pro Woche. Das Gewicht so wählen, dass der letzte Satz anstrengend, aber sauber geht.",
      "Dumbbells allow a freer movement than a machine: the presses first (incline, flat, decline), then the fly and the pullover to finish. 3 × 10–12, once or twice a week. Pick a weight that makes the last set hard but clean."],
    "gym-chest-cable": ["Brust an der Smith-Maschine und am Kabel: erst die geführten Drückübungen und der Dip mit Unterstützung, danach drei Fliegende aus verschiedenen Winkeln. Große Muskeln und mehrgelenkige Übungen zuerst. 3 × 10–12.",
      "Chest on the Smith machine and cables: guided presses and the assisted dip first, then three flies from different angles. Large muscles and multi-joint exercises first. 3 × 10–12."],
    "gym-shoulders-db": ["Schultern mit Kurzhanteln: Drücken im Sitzen und mit Drehung (Arnold), dann seitlich, vorn und hinten, zum Schluss der Cuban Press. Leichte Gewichte, saubere Bewegung, 3 × 12–15.",
      "Shoulders with dumbbells: seated press and the rotating Arnold press, then sideways, front and rear, Cuban press to finish. Light weights, clean movement, 3 × 12–15."],
    "gym-shoulders-cable": ["Schultern mit Langhantel und Kabel: erst das Drücken im Stehen, dann die kontrollierten Kabelübungen, hintere Schulter und zum Schluss die Shrugs (Nacken). 3 × 10–12, nach dem schweren Drücken eine längere Pause.",
      "Shoulders with barbell and cable: standing press first, then controlled cable work, rear shoulders and shrugs (neck) to finish. 3 × 10–12, a longer rest after the heavy press."],
    "bw-shoulders": ["Schultern ohne Geräte: Pike-Liegestütze, Schulterblatt-Liegestütze, Bärengang und der Hang an der Stange (Skin the Cat – nur, wenn die Schultern das gut mitmachen). Langsam und kontrolliert.",
      "Shoulders without equipment: pike push-ups, scapular push-ups, bear crawl and the hang on a bar (skin the cat – only if your shoulders handle it well). Slow and controlled."],
    "band-shoulders": ["Schultern mit Band: Drücken, seitlich, vorn, aufrechtes Rudern, hintere Schulter und einarmig drücken. Rhythmus: 3 Sätze à 40 Sekunden, 20 Sekunden Pause. Steigern (Praxisregel, keine Studie): dickeres Band oder kürzer greifen.",
      "Shoulders with a band: press, sideways, front, upright row, rear shoulders and one-arm press. Rhythm: 3 sets of 40 seconds, 20 seconds rest. To progress (practical rule, not a study): a thicker band or a shorter grip."],
    "gym-ropes-intervals": ["Battle Ropes im Intervall: Wellen, Slams, seitwärts, Jumping Jacks und Kreise. Kurze, harte Einheiten mit Pause dazwischen. Mit leichten Wellen beginnen; die Bewegung kommt aus Hüfte und Schultern, nicht nur aus den Armen.",
      "Battle ropes in intervals: waves, slams, side to side, jumping jacks and circles. Short, hard efforts with rest in between. Start with light waves; the movement comes from hips and shoulders, not just the arms."],
    "gym-ropes-power": ["Battle Ropes für mehr Wucht: Schlangen, Squat-Wellen, In-and-out-Wellen, Power Pull und Slams. Ergänzt das Intervall-Workout; zwischen den Runden genug Pause, damit die Technik sauber bleibt.",
      "Battle ropes for more power: snakes, squat waves, in-and-out waves, power pull and slams. Complements the interval workout; rest enough between rounds so the technique stays clean."],
    "gym-back-cable": ["Rücken am Kabel: erst der senkrechte Zug (Seil-Latzug), dann waagerecht rudern (breit, eng, einarmig) und zum Schluss der gerade Armzug. Mit den Ellbogen ziehen. 3 × 10–12.",
      "Back on cables: vertical pull first (rope pulldown), then horizontal rows (wide, close, one-arm) and the straight-arm pulldown to finish. Pull with your elbows. 3 × 10–12."],
    "gym-back-free-weights": ["Rücken mit freien Gewichten: Langhantelrudern, T-Bar, Rudern mit Brustauflage, Meadows-Row und einarmiges Kurzhantelrudern. Rücken gerade halten, nicht mit Schwung arbeiten. 3 × 8–12.",
      "Back with free weights: barbell row, T-bar, chest-supported row, Meadows row and one-arm dumbbell row. Keep your back straight and avoid swinging. 3 × 8–12."],
    "gym-biceps": ["Nur Bizeps: sechs Curl-Varianten mit Kurzhanteln, vom Schrägbank-Curl bis zum Zottman-Curl. 3 × 10–12, mit einem Oberkörpertag oder allein, nicht an zwei Tagen hintereinander.",
      "Biceps only: six curl variations with dumbbells, from the incline curl to the Zottman curl. 3 × 10–12, together with an upper-body day or on its own, not on two days in a row."],
    "gym-triceps": ["Nur Trizeps: Drücken mit engem Griff, Skull Crusher mit Kurzhanteln, Seil-Pushdown und drei Varianten am Kabel. 3 × 10–12, die Ellbogen nah am Körper halten.",
      "Triceps only: close-grip press, dumbbell skull crusher, rope pushdown and three cable variations. 3 × 10–12, keep your elbows close to your body."],
    "gym-core-cable": ["Rumpf am Kabel: Pallof Press gegen die Drehung, Crunch im Stehen, Heben, Drehen und Beinheben, zum Schluss das Bauchrad. 3 × 12–15, zwei bis drei Mal pro Woche. Das Bauchrad nur so weit ausrollen, wie der Rücken stabil bleibt.",
      "Core on cables: Pallof press against rotation, standing crunch, lift, twist and reverse crunch, ab wheel to finish. 3 × 12–15, two to three times a week. Roll the wheel out only as far as your back stays stable."],
    "gym-core-crunch": ["Bauch mit Crunch-Varianten: gerader Crunch, mit gestreckten Armen, Händen über dem Kopf und über Kreuz, zum Schluss der Judo-Flip. Langsam, mit dem Ausatmen hochkommen. 3 × 12–15.",
      "Abs with crunch variations: straight crunch, arms straight, hands overhead and cross-body, judo flip to finish. Slow, come up as you breathe out. 3 × 12–15."],
    /* Widerstandsband: Rhythmus ehrlich benannt; Studienlage zu Pausen betrifft überwiegend Trainierte mit Gewichten (quellen.html [5]) */
    "band-full-body": ["Ganzkörper für den Einstieg: Beine, Zug, Druck, Schulter, Arme und Rumpf im Wechsel. Liegestütze mit Band sind fordernd – auf den Knien zu beginnen ist völlig in Ordnung. Rhythmus: 3 Sätze à 40 Sekunden, 20 Sekunden Pause, 20 Sekunden bis zur nächsten Übung. Längere Pausen bringen nach Studien mehr Kraft, die Studien betreffen aber überwiegend Trainierte mit Gewichten; für Einsteiger mit Band gibt es dazu keine belastbare Studienlage. Steigern (Praxisregel, keine Studie): gehen alle Sätze sauber und bleibt Luft, dann dickeres Band, kürzer greifen oder langsamer zurückgehen.",
      "Full body to get started: legs, pulling, pushing, shoulders, arms and trunk in turn. Band push-ups are demanding – starting on your knees is perfectly fine. Rhythm: 3 sets of 40 seconds, 20 seconds rest, 20 seconds until the next exercise. Longer rests bring more strength according to studies, but those mostly involve trained people with weights; for beginners with a band there is no solid evidence. To progress (practical rule, not a study): if all sets are clean and you have something left, use a thicker band, grip shorter or return more slowly."],
    "band-upper": ["Ziehen und Drücken im Wechsel: Rudern, Schulterdrücken, hintere Schulter, Brust, Seitheben und Hammer-Curl. Rhythmus: 3 Sätze à 40 Sekunden, 20 Sekunden Pause, 20 Sekunden bis zur nächsten Übung. Längere Pausen bringen nach Studien mehr Kraft, die Studien betreffen aber überwiegend Trainierte mit Gewichten. Steigern (Praxisregel, keine Studie): dickeres Band, kürzer greifen oder langsamer zurückgehen.",
      "Pulling and pushing in turn: row, shoulder press, rear shoulder, chest, lateral raise and hammer curl. Rhythm: 3 sets of 40 seconds, 20 seconds rest, 20 seconds until the next exercise. Longer rests bring more strength according to studies, but those mostly involve trained people with weights. To progress (practical rule, not a study): thicker band, grip shorter or return more slowly."],
    "band-legs-glutes": ["Die Grundmuster der Beine: Kniebeuge, Hüftbeuge (einbeiniges Kreuzheben, am besten mit Hand an Wand oder Stuhl), Ausfallschritt, Hüftstreckung und seitliche Hüfte. Rhythmus: 3 Sätze à 40 Sekunden, 20 Sekunden Pause, 20 Sekunden bis zur nächsten Übung. Steigern (Praxisregel, keine Studie): dickeres Band, kürzer greifen oder langsamer zurückgehen.",
      "The basic leg patterns: squat, hip hinge (single-leg deadlift, ideally with a hand on a wall or chair), lunge, hip extension and side hip. Rhythm: 3 sets of 40 seconds, 20 seconds rest, 20 seconds until the next exercise. To progress (practical rule, not a study): thicker band, grip shorter or return more slowly."],
    "band-core": ["Drehen, Seitbeugen und Einrollen, dazu ein Unterarmstütz als Stabilisation. Rhythmus: 3 Sätze à 40 Sekunden, 20 Sekunden Pause, 20 Sekunden bis zur nächsten Übung. Bei Rückenbeschwerden die Drehungen klein halten. Steigern (Praxisregel, keine Studie): dickeres Band oder langsamer zurückgehen.",
      "Rotating, side-bending and curling, plus a forearm plank for stability. Rhythm: 3 sets of 40 seconds, 20 seconds rest, 20 seconds until the next exercise. Keep the twists small if your back hurts. To progress (practical rule, not a study): thicker band or return more slowly."]
  });
  /* Belastung und Sicherheit bei harten Workouts (Stand 2026-10-14). Ehrlich: Aufwärmen verbessert die Leistung meist leicht,
     ein sicherer Schutz vor Verletzungen ist nicht belegt (quellen.html [15]); die Hinweise sind Vorsicht, keine Heilversprechen. */
  (function(){
    var sprung = ["Viele Sprünge und hohe Belastung für Kreislauf und Gelenke. Vorher aufwärmen (z. B. „Aufwärmen vor HIIT“), weich landen und nur so schnell, wie du sauber bleibst. Bei Knie-, Rücken- oder Herzproblemen die Sprünge weglassen und vorher ärztlich abklären.",
                  "Lots of jumps and a high load on circulation and joints. Warm up first (e.g. “Warm-up before HIIT”), land softly and go only as fast as you stay clean. With knee, back or heart problems skip the jumps and check with a doctor first."];
    ["cardio-power", "hiit-full", "tabata-full", "tabata-legs", "hiit-legs", "burpee-challenge", "metcon-db"].forEach(function(id){ LIB_WORKOUT_INFO[id] = sprung; });
    var fordernd = ["Sehr fordernde Übungen: Technik geht vor Tempo. Vorher aufwärmen und die Schultern mobilisieren; Stangen und Barren vor dem Start prüfen. Bei Schmerz in Schulter, Ellbogen oder Rücken abbrechen und eine leichtere Übung wählen („Leichter / Schwerer“ in der Übungsinfo).",
                    "Very demanding exercises: technique before speed. Warm up and mobilise your shoulders first; check bars and rails before you start. Stop if your shoulder, elbow or back hurts and pick an easier exercise (“Easier / Harder” in the exercise info)."];
    ["calis-skills", "calis-60", "advanced-60", "bw-advanced", "upper-power", "calis-hiit"].forEach(function(id){ LIB_WORKOUT_INFO[id] = fordernd; });
    var rumpf = ["Anspruchsvoll für Rumpf und Wirbelsäule: bleib ohne Hohlkreuz und höre bei Rücken- oder Nackenschmerz auf. Wenn du unsicher bist, nimm statt Dragon Flags die Beinheber und beginne mit „Bauch & Core Basis“.",
                 "Demanding for your trunk and spine: stay out of an arched back and stop if your back or neck hurts. If you are unsure, use leg raises instead of dragon flags and start with “Core Basic”."];
    ["core-advanced", "core-burner"].forEach(function(id){ LIB_WORKOUT_INFO[id] = rumpf; });
    var gewicht = ["Das Gewicht so wählen, dass die Technik bis zum letzten Satz sauber bleibt. Kettlebell-Swing, Clean und Thruster vorher mit leichtem Gewicht üben, genug Platz und einen rutschfesten Boden haben. Vorher aufwärmen.",
                   "Choose a weight that keeps your technique clean until the last set. Practise kettlebell swing, clean and thruster with a light weight first and have enough space and a non-slip floor. Warm up first."];
    ["kb-conditioning", "kb-hiit", "db-complex"].forEach(function(id){ LIB_WORKOUT_INFO[id] = gewicht; });
    LIB_WORKOUT_INFO["arms-bw"] = ["Drückende Übungen für Trizeps und Schulter. Für den Bizeps braucht es Ziehen (Stange, Band oder Kurzhantel), das fehlt hier ohne Gerät. Wer das möchte, ergänzt „Rücken Zugkraft“ oder „Oberkörper mit Band“.",
                                   "Pushing exercises for triceps and shoulders. The biceps need pulling (bar, band or dumbbell), which is missing here without equipment. Add “Back Pulling Strength” or “Upper Body with Band” if you want that."];
    LIB_WORKOUT_INFO["runner-strength"] = ["Kraft für Läufer: Beine, Hüfte, Rumpf und Waden. Der Nordic Curl ist für die Oberschenkelrückseite sehr fordernd (Fersen fixieren lassen, mit wenigen langsamen Wiederholungen beginnen, starker Muskelkater möglich). In einer Übersichtsarbeit mit Sportlern senkte er innerhalb von Präventionsprogrammen die Zahl der Zerrungen hinten im Oberschenkel (quellen.html [22]); ob das für Freizeitläufer gilt, ist offen.",
                                           "Strength for runners: legs, hips, trunk and calves. The Nordic curl is very demanding for the back of the thigh (have your heels held down, start with a few slow reps, strong soreness possible). In a review of athletes it lowered the number of hamstring strains within prevention programmes (quellen.html [22]); whether that applies to recreational runners is open."];
    var einsteiger = ["Für den Einstieg: zwei Runden à 30 Sekunden, 30 Sekunden Pause, zwei bis drei Mal pro Woche mit einem Tag Pause dazwischen. Klappt das sauber und bleibt Luft, eine dritte Runde ergänzen. Statt der Knie-Liegestütze gehen später normale Liegestütze. Bei Schmerz abbrechen; bei Vorerkrankungen vorher ärztlich abklären.",
                      "To get started: two rounds of 30 seconds, 30 seconds rest, two to three times a week with a rest day in between. If that goes cleanly and you have something left, add a third round. Later you can swap the knee push-ups for regular push-ups. Stop if something hurts; with medical conditions check with a doctor first."];
    ["beginner-fullbody", "beginner-legs", "beginner-upper"].forEach(function(id){ LIB_WORKOUT_INFO[id] = einsteiger; });
    LIB_WORKOUT_INFO["gym-db-fullbody"] = ["Ganzkörper mit Kurzhanteln: Kniebeuge, Drücken, Ziehen, Hüftbeuge und Schulter, zum Schluss der Unterarmstütz. 3 × 10–12, zwei bis drei Mal pro Woche mit einem Ruhetag dazwischen. Beginne mit leichten Hanteln und achte auf saubere Technik; mit schweren Hanteln beim Bankdrücken eine Spotterin oder einen Spotter bitten.",
                                           "Full body with dumbbells: squat, push, pull, hip hinge and shoulders, finishing with the forearm plank. 3 × 10–12, two to three times a week with a rest day in between. Start with light dumbbells and keep your technique clean; ask for a spotter on the bench press with heavy dumbbells."];
    LIB_WORKOUT_INFO["gym-db-upper"] = ["Kurzhanteln statt Geräte: Bankdrücken, Rudern, Schulterdrücken, Seitheben und Arme. 3 × 10–12, mit schweren Hanteln eine Spotterin oder einen Spotter bitten und die Hanteln seitlich absetzen, statt sie fallen zu lassen.",
                                         "Dumbbells instead of machines: bench press, row, shoulder press, lateral raise and arms. 3 × 10–12; with heavy dumbbells ask for a spotter and set them down to the side instead of dropping them."];
  })();
})();
/* ---------- Befestigung des Widerstandsbands ----------
   Je Band-Übung: Art der Befestigung (und Höhe) - die Art bringt Titel, Schritte und eine kleine Skizze mit (bandAnkerHTML in js/02-bibliothek.js),
   dazu bei Bedarf ein besonderer Hinweis. Als aufklappbare Karte unter den Figuren im Info-Fenster und auf der Übungskarte. Texte: eigene Formulierungen. */
var BAND_ARTEN = {
  /* Schlüssel „tuer“ bleibt aus Altgründen; gemeint ist die feste Befestigung im Calisthenics-Park (Pfosten, Gestell, Stange) */
  tuer:    { titel:["Am Pfosten oder Gestell befestigen", "Anchor on a post or frame"],
             schritte:[["Das Band auf der gewünschten Höhe um einen festen Pfosten oder eine Stange des Gestells legen (Calisthenics-Park) und ein Ende durch die Schlaufe ziehen.",
                        "Fest zuziehen. Bei glatten Metallrohren das Band einmal doppelt wickeln, damit es nicht rutscht.",
                        "Einmal kräftig ziehen, ob es hält – erst dann trainieren. So weit zurücktreten, dass das Band leicht gespannt ist.",
                        "Das Band darf nicht am Rohr entlangrutschen können; sonst an einer Querstrebe oder Verdickung anlegen."],
                       ["Loop the band around a solid post or a bar of the frame at the height you need (calisthenics park) and pull one end through the loop.",
                        "Pull it tight. On smooth metal tubes wrap the band around twice so it does not slip.",
                        "Give it one hard tug to check it holds – only then train. Step back until the band is lightly stretched.",
                        "The band must not be able to slide along the tube; otherwise place it against a crossbar or a thicker part."]] },
  stange:  { titel:["Um eine Stange legen", "Loop around a bar"],
             schritte:[["Das Loop-Band um eine stabile Stange, ein Reck oder ein festes Geländer legen und ein Ende durch die Schlaufe ziehen.",
                        "Fest zuziehen und kräftig daran ziehen, ob es hält.",
                        "Nur an Stangen, die dein Gewicht und den Zug sicher tragen.",
                        "Unter der Stange freier, weicher Boden; beschädigte Bänder aussortieren."],
                       ["Loop the band around a sturdy bar, pull-up bar or fixed railing and pull one end through the loop.",
                        "Pull it tight and tug hard to check it holds.",
                        "Only use bars that safely carry your weight and the pull.",
                        "Clear, soft ground under the bar; discard damaged bands."]] },
  fuss:    { titel:["Unter beiden Füßen", "Under both feet"],
             schritte:[["Die Mitte des Bandes auf den Boden legen und mit beiden Füßen etwa hüftbreit daraufstellen.",
                        "Die Enden greifen. Breiter stehen oder die Enden kürzer greifen = mehr Widerstand.",
                        "Auf rutschfestem Boden stehen, nicht auf einem losen Teppich."],
                       ["Lay the middle of the band on the floor and stand on it with both feet about hip-width apart.",
                        "Hold the ends. A wider stance or shorter grip = more resistance.",
                        "Stand on a non-slip floor, not on a loose rug."]] },
  fuss1:   { titel:["Unter einem Fuß", "Under one foot"],
             schritte:[["Das Bandende bzw. die Mitte unter den Fuß legen und mit dem ganzen Fuß fest daraufstehen.",
                        "Das freie Ende greifen. Kürzer greifen = mehr Widerstand.",
                        "Der Fuß darf nicht rutschen – bei Bedarf einen Schuh mit Profil tragen."],
                       ["Lay the end or middle of the band under your foot and stand on it firmly with the whole foot.",
                        "Hold the free end. A shorter grip = more resistance.",
                        "Your foot must not slip – wear a shoe with grip if needed."]] },
  haende:  { titel:["In den Händen", "In your hands"],
             schritte:[["Es muss nichts befestigt werden: das Band mit beiden Händen greifen.",
                        "Enger greifen = mehr Widerstand, weiter = weniger.",
                        "Das Band bleibt während der ganzen Bewegung leicht gespannt."],
                       ["Nothing needs anchoring: just hold the band in both hands.",
                        "A narrower grip = more resistance, wider = less.",
                        "Keep the band lightly stretched throughout the movement."]] },
  knie:    { titel:["Um die Oberschenkel", "Around your thighs"],
             schritte:[["Das Loop-Band knapp über den Knien um beide Oberschenkel legen (nicht direkt auf das Gelenk).",
                        "Die Füße so stellen, dass das Band schon etwas Spannung hat.",
                        "Beim Drücken nach außen die Knie über den Füßen halten."],
                       ["Put the loop band around both thighs just above your knees (not directly on the joint).",
                        "Place your feet so the band already has some tension.",
                        "Keep your knees over your feet when pushing outwards."]] },
  knoechel:{ titel:["Um die Knöchel", "Around your ankles"],
             schritte:[["Das Loop-Band um beide Knöchel legen und die Füße hüftbreit hinstellen.",
                        "Eine Hand an Wand oder Stuhllehne, damit du sicher stehst.",
                        "Der Abstand der Knöchel bestimmt die Spannung: weiter = mehr Widerstand.",
                        "Keine Schritte mit gespanntem Band machen – du kannst darüber stolpern."],
                       ["Put the loop band around both ankles and stand with your feet hip-width apart.",
                        "Rest one hand on a wall or chair back so you stand safely.",
                        "The distance between your ankles sets the tension: wider = more resistance.",
                        "Don't walk with the band stretched – you could trip over it."]] },
  fussloop:{ titel:["Um den Fuß, Enden in den Händen", "Around the foot, ends in your hands"],
             schritte:[["Das Band um den Fußballen legen, die Enden mit beiden Händen greifen.",
                        "Die Hände bestimmen die Spannung: weiter weg = mehr Widerstand.",
                        "Das Band darf nicht vom Fuß rutschen – bei Bedarf einmal um den Fuß wickeln."],
                       ["Loop the band around the ball of your foot and hold the ends in both hands.",
                        "Your hands set the tension: further away = more resistance.",
                        "The band must not slip off your foot – wrap it once more if needed."]] },
  ruecken: { titel:["Hinter dem Rücken", "Behind your back"],
             schritte:[["Das Band hinter dem Rücken auf Höhe der Schulterblätter legen, unter den Achseln durch, die Enden vorn greifen.",
                        "Die Enden bleiben fest in den Händen (beim Liegestütz die Hände mit dem Band am Boden).",
                        "Je kürzer das Band zwischen Rücken und Händen, desto mehr Widerstand.",
                        "Das Band nie über Nacken oder Hals legen und nicht verdreht tragen."],
                       ["Put the band behind your back at shoulder-blade height, under your armpits, and hold the ends in front.",
                        "The ends stay firmly in your hands (for push-ups, hands with the band on the floor).",
                        "The shorter the band between your back and your hands, the more resistance.",
                        "Never put the band over your neck or throat and don't wear it twisted."]] },
  sitzfuss:{ titel:["Um die Füße im Sitzen", "Around the feet, seated"],
             schritte:[["Auf den Boden setzen, die Beine anwinkeln und das Band um beide Füße legen.",
                        "Die Enden mit den Händen vor der Brust greifen, der Rücken bleibt aufrecht.",
                        "Die Hände näher an den Füßen = weniger Widerstand, weiter weg = mehr."],
                       ["Sit on the floor, bend your legs and loop the band around both feet.",
                        "Hold the ends in your hands in front of your chest, keep your back upright.",
                        "Hands closer to your feet = less resistance, further away = more."]] }
};
var BAND_HOEHE = { hoch:["ganz oben (über Kopfhöhe)", "at the top (above head height)"], brust:["auf Brusthöhe", "at chest height"],
                   huefte:["auf Hüfthöhe", "at hip height"], tief:["ganz unten am Boden", "at floor level"] };
var BAND_ANKER = {
  "band-standing-row":["tuer","brust"], "band-bent-over-row":["fuss"], "band-lat-pull-apart":["haende"], "band-pull-down":["tuer","hoch"],
  "band-assisted-pull-up":["stange"], "band-push-ups":["ruecken"], "band-chest-fly":["ruecken"], "band-reverse-fly":["haende"],
  "band-chest-fly-up":["tuer","tief"], "band-chest-cross":["ruecken"], "band-lateral-raise":["fuss"], "band-upright-row":["fuss"],
  "band-front-raise":["fuss"], "band-shoulder-press":["fuss"], "band-one-arm-press":["fuss1"], "band-russian-twist":["sitzfuss"],
  "band-kneeling-twist":["tuer","brust"], "band-side-bend":["fuss1"], "band-kneeling-crunch":["tuer","hoch"], "band-crunch":["tuer","tief"],
  "band-hammer-curl":["fuss"], "band-one-arm-curl":["fuss1"], "band-biceps-curl":["fuss"], "band-concentration-curl":["fuss1"],
  "band-overhead-triceps":["haende"], "band-triceps-pressdown":["tuer","hoch"], "band-side-triceps":["tuer","hoch"], "band-triceps-kickback":["fuss"],
  "band-overhead-extension":["fuss1"], "band-clamshell":["knie"], "band-leg-abduction":["knoechel"], "band-single-leg-deadlift":["fuss1"],
  "band-glute-bridge":["knie"], "band-donkey-kick":["fussloop"], "band-squat":["fuss"], "band-prone-leg-curl":["fussloop"],
  "band-lunge-squat":["fuss1"], "band-lying-leg-press":["fussloop"]
};
/* besondere Hinweise (zusätzlich zur Art): [Deutsch, Englisch] */
var BAND_ANKER_EXTRA = {
  "band-assisted-pull-up":["Dann einen Fuß oder das Knie in die Schlaufe setzen: Knie = weniger Hilfe, Fuß = mehr Hilfe.", "Then put one foot or your knee in the loop: knee = less help, foot = more help."],
  "band-kneeling-twist":["Seitlich zum Pfosten knien, die Befestigung auf Brusthöhe neben dir.", "Kneel side-on to the post with the anchor at chest height next to you."],
  "band-side-triceps":["Seitlich zum Pfosten stehen, die Befestigung oben neben dir.", "Stand side-on to the post with the anchor high up next to you."],
  "band-crunch":["Das Band hinter dem Kopf am Boden befestigen (unten am Pfosten) und mit dem Kopf zum Pfosten liegen.", "Anchor the band behind your head at floor level (low on the post) and lie with your head towards the post."],
  "band-overhead-triceps":["Ein Ende mit der unteren Hand am unteren Rücken halten, das andere mit der oberen Hand greifen – die untere Hand ersetzt die Befestigung.", "Hold one end with your lower hand at your lower back and the other with your upper hand – the lower hand replaces the anchor."],
  "band-overhead-extension":["Mit einem Fuß auf das Bandende treten, das andere Ende hinter dem Kopf mit beiden Händen halten.", "Stand on one end of the band with one foot and hold the other end behind your head with both hands."],
  "band-prone-leg-curl":["Alternativ das Band vorn tief an einem Pfosten befestigen und mit dem Kopf zum Pfosten liegen.", "Alternatively anchor the band low on a post in front of you and lie with your head towards the post."],
  "band-lat-pull-apart":["Etwas mehr als schulterbreit greifen.", "Hold it a little wider than shoulder width."],
  "band-reverse-fly":["Schulterbreit greifen, Ellbogen leicht gebeugt.", "Hold it shoulder-width apart with your elbows slightly bent."],
  "band-donkey-kick":["Die Hände halten die Bandenden am Boden, das Band liegt um einen Fuß.", "Your hands press the band ends to the floor, the band sits around one foot."],
  "band-push-ups":["Die Enden werden mit den Händen am Boden gegriffen; das Band läuft über die Schulterblätter.", "The ends are held with your hands on the floor; the band runs across your shoulder blades."]
};
/* ===== Fitnessstudio-Erweiterung (2026-10-20): Übungen aus Kevins Liste, die es noch nicht gab =====
   Alle Texte in eigenen Worten. Ohne Figur (die Karte zeigt dann das Gerätesymbol); „Griff“ (EX_GRIFF) nennt den Aufsatz am Kabelzug bzw. die Stange. */
var EX_GRIFF = {};
var GYM_NEU = [];
/* id, Name DE, Name EN, Fokus, Sätze, Sekunden, je Seite, Hinweis DE, Hinweis EN, Pause, Stufe, Belastung, Ausrüstung, Muskeln [Haupt DE, Hilfs DE, Haupt EN, Hilfs EN],
   Anleitung DE (3 Schritte mit |), Anleitung EN, Haltung DE, Vermeiden DE, Haltung EN, Vermeiden EN, Gruppe, Griff [DE, EN] oder null, Suchwörter */
function G(id, de, en, cats, reps, work, side, hDe, hEn, rest, lvl, inten, eq, mus, iDe, iEn, pDe, aDe, pEn, aEn, gr, griff, such){
  GYM_NEU.push({ id:id, gr:gr, eq:eq, lvl:lvl, inten:inten });
  EXERCISE_ROWS.push([id, de, en, cats, reps, work, side, hDe, hEn, rest]);
  EX_LEVEL[id] = lvl; EX_INT[id] = inten; EX_EQUIP[id] = eq;
  EX_MUSCLES[id] = mus; EX_INFO[id] = [iDe, iEn]; EX_POSTURE[id] = [pDe, aDe, pEn, aEn];
  if(griff) EX_GRIFF[id] = griff;
  if(such) EX_SUCH_ALIAS[id] = (EX_SUCH_ALIAS[id] ? EX_SUCH_ALIAS[id] + " " : "") + such;
}

/* ---------- Brust ---------- */
G("decline-db-bench", "Kurzhantel-Bankdrücken (Negativbank)", "Decline Dumbbell Bench Press", "weight", 3, 40, 0,
  "Bank leicht abfallend, Hanteln kontrolliert zur unteren Brust", "Bench slightly declined, lower the dumbbells under control to your lower chest", 60, 2, 2, "gym db",
  ["Brust", "Trizeps, vordere Schulter", "Chest", "Triceps, front delts"],
  "Auf die leicht abfallende Bank legen, Füße fixieren, die Hanteln über der Brust halten.|Die Hanteln langsam zur unteren Brust absenken, Ellbogen etwa 45° vom Körper.|Kräftig nach oben drücken, ohne die Ellbogen hart zu überstrecken.",
  "Lie on the slightly declined bench, secure your feet and hold the dumbbells above your chest.|Lower the dumbbells slowly to your lower chest, elbows about 45° from your body.|Press up firmly without hard-locking your elbows.",
  "Schulterblätter zusammen, Handgelenke gerade.|Hanteln bewegen sich auf einer ruhigen Linie.", "Hanteln allein hochwuchten, die Bank zu steil stellen oder bei schwerer Last ohne Hilfsperson arbeiten.",
  "Shoulder blades together, wrists straight.|Dumbbells follow a steady path.", "Heaving the dumbbells up alone, setting the bench too steep or going heavy without a spotter.",
  "brust", null, "negativbank decline brustpresse");
G("around-world-pullover", "Pullover im Halbkreis (Around the World)", "Around-the-World Pullover", "weight", 3, 40, 0,
  "Hantel mit gestreckten Armen in einem weiten Bogen über den Kopf", "Swing the dumbbell in a wide arc over your head with straight arms", 60, 2, 1, "gym db",
  ["Breiter Rückenmuskel", "Brust, Trizeps (langer Kopf), Rumpf", "Lats", "Chest, triceps (long head), core"],
  "Quer auf der Bank liegen oder flach liegen, eine Hantel mit beiden Händen über der Brust halten.|Mit fast gestreckten Armen in einem weiten Halbkreis hinter den Kopf führen.|Im gleichen Bogen zurück über die Brust, ruhig und ohne Schwung.",
  "Lie across or along a bench and hold one dumbbell above your chest with both hands.|With nearly straight arms, swing it in a wide half circle behind your head.|Return along the same arc over your chest, smoothly and without momentum.",
  "Rippen unten lassen, Bauch leicht anspannen.|Arme nur leicht gebeugt.", "Ins Hohlkreuz fallen oder eine zu schwere Hantel nehmen.",
  "Keep your ribs down, brace your abs lightly.|Arms only slightly bent.", "Arching your back or using too heavy a dumbbell.",
  "brust", null, "pullover bogen halbkreis");
G("cable-chest-fly", "Brust-Fly am Kabel", "Cable Chest Fly", "weight", 3, 40, 0,
  "Arme leicht gebeugt, Hände vor der Brust zusammenführen", "Arms slightly bent, bring your hands together in front of your chest", 60, 2, 2, "gym",
  ["Brust", "Vordere Schulter", "Chest", "Front delts"],
  "Die Griffe auf Brusthöhe einstellen, mittig zwischen den Türmen stehen und einen Schritt vortreten.|Die Arme leicht gebeugt seitlich öffnen, bis du in der Brust Dehnung spürst.|Die Hände in einem Bogen vor der Brust zusammenführen und kurz halten.",
  "Set the handles at chest height, stand centred between the towers and take a step forward.|With slightly bent arms, open them out to the sides until you feel a stretch in your chest.|Bring your hands together in an arc in front of your chest and hold briefly.",
  "Fester Stand, Brust offen, Ellbogenwinkel bleibt gleich.|Schultern tief.", "Aus dem Oberkörper Schwung holen oder die Arme durchstrecken.",
  "Firm stance, chest open, elbow angle stays the same.|Shoulders low.", "Swinging with your torso or locking your arms straight.",
  "brust", ["Einzelgriffe (D-Griffe)", "Single handles (D-handles)"], "fliegende kabel butterfly kabelzug");
G("standing-cable-fly", "Stehende Fliegende am Kabel (hoch zu tief)", "Standing Cable Fly (High to Low)", "weight", 3, 40, 0,
  "Griffe oben, Hände führen in einem Bogen nach unten zusammen", "Handles high, hands sweep down and together in an arc", 60, 2, 2, "gym",
  ["Brust", "Vordere Schulter", "Chest", "Front delts"],
  "Die Griffe oben einstellen, in der Mitte mit einem Fuß vorn in Schrittstellung stehen.|Mit leicht gebeugten Armen in einem Bogen nach unten vor die Hüfte ziehen.|Kurz halten, langsam zurück bis zur Dehnung in der Brust.",
  "Set the handles high and stand centred in a split stance with one foot forward.|With slightly bent arms, sweep down in an arc to in front of your hips.|Hold briefly, then return slowly until you feel a stretch in your chest.",
  "Oberkörper leicht vorgeneigt und ruhig.|Bauch angespannt.", "Mit den Armen ziehen statt die Brust zusammenzudrücken.",
  "Torso slightly leaned and still.|Core braced.", "Pulling with the arms instead of squeezing the chest.",
  "brust", ["Einzelgriffe (D-Griffe), Seilzug oben", "Single handles (D-handles), cable at the top"], "cable fly hoch tief high low");
G("low-to-high-cable-fly", "Kabel-Fly von unten nach oben", "Low-to-High Cable Fly", "weight", 3, 40, 0,
  "Griffe unten, Hände heben sich in einem Bogen vor die Brust", "Handles low, hands lift in an arc up to chest height", 60, 2, 2, "gym",
  ["Obere Brust", "Vordere Schulter", "Upper chest", "Front delts"],
  "Die Griffe ganz unten einstellen, in der Mitte stehen, leicht vorgebeugt.|Mit leicht gebeugten Armen in einem Bogen schräg nach oben bis etwa Gesichts- bis Schulterhöhe führen.|Oben kurz halten und kontrolliert absenken.",
  "Set the handles at the bottom, stand centred with a slight forward lean.|With slightly bent arms, sweep up in an arc to about face-to-shoulder height.|Hold briefly at the top and lower under control.",
  "Rücken gerade, Schultern nicht hochziehen.|Arme bleiben leicht gebeugt.", "Mit Schwung aus den Beinen arbeiten.",
  "Back straight, don't shrug.|Arms stay slightly bent.", "Using leg drive to swing the weight.",
  "brust", ["Einzelgriffe (D-Griffe), Seilzug unten", "Single handles (D-handles), cable at the bottom"], "cable fly aufwärts");
G("incline-push-up", "Erhöhte Liegestütze (Hände auf Bank)", "Incline Push-up", "arms", 3, 30, 0,
  "Hände auf stabiler Erhöhung (Bank, Stange, Tisch), Körper bildet eine Linie", "Hands on a sturdy raised surface (bench, bar, table), body in one straight line", 45, 1, 1, "none",
  ["Brust", "Trizeps, vordere Schulter, Rumpf", "Chest", "Triceps, front delts, core"],
  "Die Hände schulterbreit auf eine stabile Erhöhung (Bank, Stange, Tisch) legen, Füße zurück, Körper gerade.|Die Brust kontrolliert zur Bank absenken.|Kräftig zurückdrücken, ohne das Becken durchhängen zu lassen.",
  "Place your hands shoulder-width on a sturdy bench or bar, feet back, body straight.|Lower your chest to the bench under control.|Push back up firmly without letting your hips sag.",
  "Bauch und Gesäß angespannt, Nacken lang.|Ellbogen etwa 45° zum Körper.", "Das Becken hängen lassen oder den Kopf vorstrecken.",
  "Abs and glutes tight, neck long.|Elbows about 45° to your body.", "Letting the hips sag or poking the head forward.",
  "brust", null, "liegestütz schräg erhöht");
G("deficit-push-up", "Liegestütze mit Tiefe (Deficit)", "Deficit Push-up", "arms", 3, 30, 0,
  "Hände erhöht, Brust sinkt unter Handhöhe", "Hands raised, chest drops below hand height", 60, 3, 3, "none",
  ["Brust", "Vordere Schulter, Trizeps, Rumpf", "Chest", "Front delts, triceps, core"],
  "Die Hände auf zwei stabile Erhöhungen (Hantelscheiben, Griffe, Blöcke) stellen, Körper gerade.|Die Brust tief zwischen die Hände absenken, bis du Dehnung spürst.|Kraftvoll hochdrücken und oben die Schultern stabil halten.",
  "Put your hands on two sturdy raised surfaces (plates, handles, blocks), body straight.|Lower your chest deep between your hands until you feel a stretch.|Push up powerfully and keep your shoulders stable at the top.",
  "Schulterblätter bleiben stabil, Bauch fest.|Nur so tief, wie die Schulter angenehm bleibt.", "Mit rundem Rücken oder wackeligen Unterlagen arbeiten.",
  "Shoulder blades stay stable, core firm.|Only as deep as your shoulders stay comfortable.", "Rounded back or wobbly supports.",
  "brust", null, "liegestütz tief erhöht deficit");
G("ring-push-up", "Ring-Liegestütze", "Ring Push-up", "arms", 3, 25, 0,
  "Ringe knapp über dem Boden, Körper bleibt straff", "Rings just above the floor, body stays tight", 60, 3, 3, "gym",
  ["Brust", "Vordere Schulter, Trizeps, Rumpf", "Chest", "Front delts, triceps, core"],
  "Die Ringe knapp über dem Boden einstellen (zum Einstieg höher), die Hände schulterbreit an die Ringe, Körper in einer Linie.|Absenken, dabei die Ringe nah am Körper führen.|Hochdrücken und die Ringe oben ruhig halten.",
  "Set the rings just above the floor (higher to start with), hands shoulder-width on the rings, body in one line.|Lower yourself while keeping the rings close to your body.|Push up and keep the rings steady at the top.",
  "Ganzer Körper angespannt, Schultern tief.|Ringe stabil nah am Körper, am Ende leicht nach außen drehen.", "Die Ringe nach außen wegkippen lassen.",
  "Whole body tight, shoulders low.|Rings steady close to your body, turn them slightly outwards at the end.", "Letting the rings flare outwards.",
  "brust", null, "ringe liegestütz instabil");

/* ---------- Rücken ---------- */
G("wide-grip-lat-pulldown", "Latzug weit", "Wide-Grip Lat Pulldown", "weight back", 3, 40, 0,
  "Weiter Griff, Stange zur oberen Brust ziehen", "Wide grip, pull the bar to your upper chest", 60, 1, 2, "gym",
  ["Breiter Rückenmuskel", "Oberer Rücken, Bizeps", "Lats", "Upper back, biceps"],
  "Die Oberschenkelpolster festziehen, die Stange weit über Schulterbreite greifen.|Die Brust leicht heben, die Stange zur oberen Brust ziehen und die Ellbogen nach unten führen.|Langsam wieder nach oben lassen, bis sich die Arme fast strecken.",
  "Adjust the thigh pads and take a grip well wider than your shoulders.|Lift your chest slightly, pull the bar to your upper chest and drive your elbows down.|Let it rise slowly until your arms are almost straight.",
  "Brust offen, Schultern weg von den Ohren.|Leichte Neigung nach hinten.", "Hinter den Kopf ziehen oder den Rücken zu stark zurücklehnen.",
  "Chest open, shoulders away from your ears.|Slight lean back.", "Pulling behind your neck or leaning back too far.",
  "ruecken", ["Breite Latstange", "Wide lat bar"], "latziehen breit");
G("reverse-grip-lat-pulldown", "Latzug im Untergriff", "Reverse-Grip Lat Pulldown", "weight back", 3, 40, 0,
  "Untergriff, Ellbogen nah am Körper nach unten", "Underhand grip, elbows down close to your body", 60, 1, 2, "gym",
  ["Breiter Rückenmuskel", "Bizeps, Oberer Rücken", "Lats", "Biceps, upper back"],
  "Die Stange im Untergriff etwa schulterbreit greifen, Oberschenkelpolster fixieren.|Die Stange zur oberen Brust ziehen, die Ellbogen nah am Körper nach unten.|Kontrolliert zurück bis die Arme fast gestreckt sind.",
  "Take the bar with an underhand grip about shoulder-width apart and secure the thigh pads.|Pull the bar to your upper chest, elbows down close to your body.|Return under control until your arms are almost straight.",
  "Brust raus, Rücken lang.|Handgelenke bleiben gerade.", "Mit dem Oberkörper wippen oder die Schultern hochziehen.",
  "Chest out, back long.|Wrists stay straight.", "Rocking your torso or shrugging.",
  "ruecken", ["Gerade Latstange, Untergriff", "Straight lat bar, underhand"], "untergriff latzug supiniert");
G("rope-lat-pulldown", "Latzug mit Seil", "Rope Lat Pulldown", "weight back", 3, 40, 0,
  "Seil zur Brust ziehen, Enden am Ende auseinander", "Pull the rope to your chest, spread the ends apart at the bottom", 60, 2, 2, "gym",
  ["Breiter Rückenmuskel", "Oberer Rücken, Bizeps", "Lats", "Upper back, biceps"],
  "Das Seil am oberen Kabelturm einhängen, hinsetzen und die Seilenden greifen.|Zur Brust ziehen und dabei die Seilenden leicht auseinanderführen.|Am Ende der Bewegung die Schulterblätter zusammenschieben, dann langsam zurück.",
  "Attach the rope to the high cable tower, sit down and grip the rope ends.|Pull to your chest while spreading the rope ends slightly apart.|Squeeze your shoulder blades together at the end of the pull, then return slowly.",
  "Aufrecht sitzen, Brust offen.|Ellbogen ziehen nach unten und hinten.", "Das Gewicht mit dem Oberkörper herunterreißen.",
  "Sit tall, chest open.|Elbows drive down and back.", "Yanking the weight down with your torso.",
  "ruecken", ["Seil", "Rope"], "kabel seil latzug");
G("wide-grip-cable-row", "Kabelrudern weit (sitzend)", "Wide-Grip Seated Cable Row", "weight back", 3, 40, 0,
  "Breiter Griff, Ellbogen weit nach außen zum Oberbauch", "Wide grip, elbows out to the upper belly", 60, 1, 2, "gym",
  ["Oberer Rücken", "Hintere Schulter, Bizeps", "Upper back", "Rear delts, biceps"],
  "Mit den Füßen auf den Platten sitzen, die weite Stange greifen, Rücken gerade.|Die Stange zum Oberbauch ziehen, Ellbogen zeigen nach außen.|Kurz halten, dann kontrolliert die Arme strecken.",
  "Sit with your feet on the plates, grip the wide bar, back straight.|Pull the bar to your upper belly, elbows pointing out.|Hold briefly, then extend your arms under control.",
  "Brust offen, Schulterblätter zusammen.|Knie leicht gebeugt.", "Mit rundem Rücken nach vorn fallen lassen.",
  "Chest open, shoulder blades together.|Knees slightly bent.", "Letting your back round forward.",
  "ruecken", ["Gerade Stange, weiter Griff", "Straight bar, wide grip"], "rudern kabel breit");
G("underhand-cable-row", "Kabelrudern im Untergriff (sitzend)", "Underhand Seated Cable Row", "weight back", 3, 40, 0,
  "Untergriff, Ellbogen eng am Körper zum Bauchnabel", "Underhand grip, elbows tight to your belly button", 60, 1, 2, "gym",
  ["Breiter Rückenmuskel", "Bizeps, Oberer Rücken", "Lats", "Biceps, upper back"],
  "Hinsetzen, die Stange im Untergriff schulterbreit greifen, Brust aufrichten.|Zum Bauchnabel ziehen, die Ellbogen eng am Körper nach hinten.|Oben die Schulterblätter zusammendrücken und langsam zurück.",
  "Sit down, take the bar underhand shoulder-width apart and lift your chest.|Pull to your belly button, elbows back close to your body.|Squeeze your shoulder blades at the end and return slowly.",
  "Rücken lang, Blick nach vorn.|Schultern tief.", "Den Oberkörper stark vor- und zurückschwingen.",
  "Back long, eyes forward.|Shoulders low.", "Swinging your torso back and forth.",
  "ruecken", ["Gerade Stange, Untergriff", "Straight bar, underhand"], "rudern untergriff kabel");
G("one-arm-cable-row", "Einarmiges Kabelrudern", "One-Arm Cable Row", "weight back", 3, 40, 1,
  "Ein Arm zieht, der Rumpf bleibt ruhig", "One arm pulls, your torso stays still", 45, 1, 2, "gym",
  ["Breiter Rückenmuskel", "Oberer Rücken, Bizeps", "Lats", "Upper back, biceps"],
  "Den Griff auf Bauchhöhe einhängen, in Schrittstellung gegenüber dem Turm stehen und einen Arm greifen lassen.|Den Griff zur Hüfte ziehen, der Ellbogen bleibt nah am Körper.|Langsam wieder strecken, nach dem Satz die Seite wechseln.",
  "Set the handle at belly height, stand facing the tower in a split stance and grip with one arm.|Pull the handle to your hip, elbow close to your body.|Extend slowly; switch sides after the set.",
  "Hüfte und Schultern bleiben parallel.|Rücken gerade.", "Den Rumpf mitdrehen, um mehr Gewicht zu bewegen.",
  "Hips and shoulders stay parallel.|Back straight.", "Twisting your torso to move more weight.",
  "ruecken", ["Einzelgriff (D-Griff)", "Single handle (D-handle)"], "einarmig rudern kabel");
G("alternating-cable-row", "Wechselndes Kabelrudern", "Alternating Cable Row", "weight back", 3, 40, 0,
  "Zwei Griffe, die Arme ziehen abwechselnd", "Two handles, the arms pull alternately", 60, 2, 2, "gym",
  ["Breiter Rückenmuskel", "Oberer Rücken, Bizeps, Rumpf", "Lats", "Upper back, biceps, core"],
  "Zwei Einzelgriffe am Turm einhängen, mit gebeugten Knien sitzen oder stehen und beide Griffe greifen.|Einen Arm zur Hüfte ziehen, während der andere gestreckt bleibt.|Im Wechsel weiterziehen, den Rumpf dabei ruhig halten.",
  "Attach two single handles to the tower, sit or stand with bent knees and grip both.|Pull one arm to your hip while the other stays extended.|Keep alternating while holding your torso still.",
  "Rumpf stabil, Schultern tief.|Gleichmäßiges Tempo.", "Den Oberkörper bei jedem Zug mitdrehen.",
  "Stable torso, shoulders low.|Even tempo.", "Rotating your torso with every pull.",
  "ruecken", ["Zwei Einzelgriffe (D-Griffe)", "Two single handles (D-handles)"], "abwechselnd kabel rudern");
G("one-arm-high-cable-row", "Einarmiges Kabelrudern von oben", "One-Arm High Cable Row", "weight back", 3, 40, 1,
  "Griff hoch eingehängt, schräg nach unten zur Hüfte ziehen", "Handle set high, pull down and back to your hip", 45, 2, 2, "gym",
  ["Breiter Rückenmuskel", "Mittlerer Rücken, Bizeps", "Lats", "Mid back, biceps"],
  "Den Griff etwa auf Kopfhöhe einhängen, Schrittstellung einnehmen, einen Arm greifen lassen.|Den Griff schräg nach unten zur Hüfte ziehen, Schulter tief.|Langsam wieder nach vorn oben strecken und die Seite wechseln.",
  "Set the handle at about head height, take a split stance and grip with one arm.|Pull the handle diagonally down to your hip, shoulder low.|Extend slowly forward and up, then switch sides.",
  "Brust offen, Rumpf ruhig.|Schulter nicht hochziehen.", "Mit dem Oberkörper mitschwingen.",
  "Chest open, torso still.|Don't shrug.", "Swinging with your torso.",
  "ruecken", ["Einzelgriff (D-Griff), Seilzug oben", "Single handle (D-handle), cable at the top"], "hoher zug einarmig latzug");
G("chest-supported-row", "Rudern mit Brustauflage", "Chest-Supported Row", "weight back", 3, 40, 0,
  "Brust liegt auf der Schrägbank, Hanteln zur Hüfte ziehen", "Chest on the incline bench, row the dumbbells to your hips", 60, 1, 2, "gym db",
  ["Oberer Rücken", "Breiter Rückenmuskel, Bizeps, Hintere Schulter", "Upper back", "Lats, biceps, rear delts"],
  "Eine Schrägbank auf etwa 30–45° stellen, mit der Brust darauflegen, in jeder Hand eine Hantel.|Die Hanteln mit nach hinten geführten Ellbogen zur Hüfte ziehen.|Oben die Schulterblätter zusammenschieben, dann langsam absenken.",
  "Set an incline bench to about 30–45°, lie chest down on it with a dumbbell in each hand.|Row the dumbbells to your hips with your elbows driving back.|Squeeze your shoulder blades together, then lower slowly.",
  "Brust bleibt auf der Bank, Nacken lang.|Schultern weg von den Ohren.", "Den Oberkörper von der Bank abheben und Schwung holen.",
  "Chest stays on the bench, neck long.|Shoulders away from your ears.", "Lifting off the bench and using momentum.",
  "ruecken", null, "schrägbank rudern brustgestützt");
G("cambered-bar-row", "Rudern mit der Cambered Bar", "Cambered Bar Row", "weight back", 3, 40, 0,
  "Gebogene Stange, vorgebeugt zum Bauch ziehen", "Cambered bar, bent over and pull to your belly", 90, 2, 3, "gym",
  ["Breiter Rückenmuskel", "Oberer Rücken, Bizeps, Unterer Rücken", "Lats", "Upper back, biceps, lower back"],
  "Die Stange greifen, Hüfte nach hinten schieben, Rücken gerade, Knie leicht gebeugt.|Die Stange zum Bauch ziehen, Ellbogen eng am Körper.|Kontrolliert absenken, ohne den Rücken zu runden.",
  "Grip the bar, push your hips back, back straight, knees slightly bent.|Pull the bar to your belly, elbows close to your body.|Lower under control without rounding your back.",
  "Neutraler Rücken, Bauch fest.|Blick leicht nach vorn unten.", "Mit rundem Rücken ziehen oder das Gewicht hochreißen.",
  "Neutral back, core firm.|Eyes slightly forward and down.", "Pulling with a rounded back or jerking the weight.",
  "ruecken", ["Cambered Bar (gebogene Langhantel)", "Cambered bar"], "gebogene stange langhantel rudern");
G("neutral-grip-pull-up", "Klimmzug mit neutralem Griff", "Neutral-Grip Pull-up", "back", 3, 20, 0,
  "Griffe parallel, Kinn über die Griffe ziehen", "Parallel handles, pull your chin over the handles", 90, 3, 3, "gym bar",
  ["Breiter Rückenmuskel", "Bizeps, Oberer Rücken, Rumpf", "Lats", "Biceps, upper back, core"],
  "Die parallelen Griffe fassen und frei hängen, Schultern leicht nach unten gezogen.|Mit den Ellbogen nach unten ziehen, bis das Kinn über den Griffen ist.|Langsam wieder bis zum gestreckten Hang absenken.",
  "Grab the parallel handles and hang freely with your shoulders lightly pulled down.|Drive your elbows down until your chin clears the handles.|Lower slowly back to a straight-arm hang.",
  "Körper gespannt, Beine leicht vor dem Körper.|Schultern nicht ans Ohr ziehen.", "Mit den Beinen Schwung holen.",
  "Body tight, legs slightly in front.|Don't shrug to your ears.", "Kicking your legs for momentum.",
  "ruecken", ["Parallele (neutrale) Griffe", "Parallel (neutral) handles"], "klimmzug hammergriff parallel");
G("meadows-row", "Meadows-Rudern", "Meadows Row", "weight back", 3, 40, 1,
  "Einarmig mit der Langhantel in der Ecke, schräg zur Hüfte ziehen", "One-arm with a landmine barbell, pull diagonally to your hip", 75, 2, 2, "gym",
  ["Breiter Rückenmuskel", "Oberer Rücken, Bizeps, Hintere Schulter", "Lats", "Upper back, biceps, rear delts"],
  "Das Stangenende in einer Ecke oder Halterung fixieren, seitlich zur Stange stehen, Hüfte nach hinten.|Das beladene Ende mit einer Hand greifen und zur Hüfte ziehen.|Kontrolliert absenken, nach dem Satz die Seite wechseln.",
  "Fix one end of the bar in a corner or landmine holder, stand side-on to it with your hips back.|Grip the loaded end with one hand and pull it to your hip.|Lower under control; switch sides after the set.",
  "Rücken gerade, freie Hand stützt am Knie.|Schulter bleibt tief.", "Den Oberkörper verdrehen, um zu ziehen.",
  "Back straight, free hand supports on your knee.|Shoulder stays low.", "Twisting your torso to pull.",
  "ruecken", ["Langhantelende (Landmine)", "Barbell end (landmine)"], "landmine einarmig stange ecke");

/* ---------- Schultern ---------- */
G("seated-db-shoulder-press", "Schulterdrücken sitzend (Kurzhantel)", "Seated Dumbbell Shoulder Press", "weight", 3, 40, 0,
  "Rückenlehne im Rücken, Hanteln über den Kopf drücken", "Back supported, press the dumbbells overhead", 60, 1, 2, "gym db",
  ["Vordere Schulter", "Seitliche Schulter, Trizeps", "Front delts", "Side delts, triceps"],
  "Mit gestützter Rückenlehne sitzen, die Hanteln auf Schulterhöhe, Handflächen nach vorn.|Die Hanteln gerade nach oben drücken, bis die Arme fast gestreckt sind.|Kontrolliert wieder bis etwa Ohrhöhe absenken.",
  "Sit with your back supported, dumbbells at shoulder height, palms forward.|Press the dumbbells straight up until your arms are almost straight.|Lower under control to about ear height.",
  "Rücken an der Lehne, Bauch leicht angespannt.|Handgelenke über den Ellbogen.", "Ins Hohlkreuz drücken oder die Hanteln aneinanderschlagen.",
  "Back against the pad, abs lightly braced.|Wrists above your elbows.", "Arching your back or clanging the dumbbells together.",
  "schulter", null, "schulterpresse kurzhantel sitzend");
G("arnold-press", "Arnold Press", "Arnold Press", "weight", 3, 40, 0,
  "Beim Drücken die Handflächen von innen nach vorn drehen", "Rotate your palms from facing you to facing forward as you press", 60, 2, 2, "gym db",
  ["Vordere Schulter", "Seitliche Schulter, Trizeps", "Front delts", "Side delts, triceps"],
  "Die Hanteln vor der Brust halten, Handflächen zeigen zu dir, Ellbogen vorn.|Beim Hochdrücken die Ellbogen öffnen und die Handflächen nach vorn drehen.|Oben fast strecken, dann in gleicher Drehung zurück vor die Brust.",
  "Hold the dumbbells in front of your chest, palms facing you, elbows forward.|As you press up, open your elbows and rotate your palms forward.|Almost straighten at the top, then return with the same rotation.",
  "Aufrecht, Rippen unten.|Drehung ruhig und kontrolliert.", "Mit zu schwerem Gewicht aus dem Rücken schieben.",
  "Stand or sit tall, ribs down.|Smooth, controlled rotation.", "Pushing with your back using too heavy a weight.",
  "schulter", null, "arnoldpresse arnold");
G("cable-shoulder-press", "Schulterdrücken am Kabel", "Cable Shoulder Press", "weight", 3, 40, 0,
  "Beide Griffe von Schulterhöhe nach oben drücken", "Press both handles up from shoulder height", 60, 2, 2, "gym",
  ["Vordere Schulter", "Seitliche Schulter, Trizeps, Rumpf", "Front delts", "Side delts, triceps, core"],
  "Die Griffe tief einstellen, mit dem Rücken zum Turm in Schrittstellung stehen und die Griffe auf Schulterhöhe nehmen.|Gerade nach oben drücken, bis die Arme fast gestreckt sind.|Langsam absenken und die Spannung im Kabel halten.",
  "Set the handles low, stand with your back to the tower in a split stance and bring the handles to shoulder height.|Press straight up until your arms are almost straight.|Lower slowly and keep tension on the cable.",
  "Bauch fest, Rippen unten.|Arme bewegen sich auf einer Linie.", "Den Oberkörper nach hinten lehnen.",
  "Abs firm, ribs down.|Arms move on a straight line.", "Leaning your torso back.",
  "schulter", ["Zwei Einzelgriffe (D-Griffe)", "Two single handles (D-handles)"], "kabel schulterdrücken");
G("lean-away-lateral-raise", "Seitheben am Kabel (weggelehnt)", "Lean-Away Cable Lateral Raise", "weight", 3, 40, 1,
  "Mit der freien Hand festhalten, weglehnen und seitlich heben", "Hold on with your free hand, lean away and raise sideways", 45, 2, 2, "gym",
  ["Seitliche Schulter", "Trapez, Rumpf", "Side delts", "Traps, core"],
  "Den Griff tief einhängen, mit der freien Hand an einem Pfosten festhalten und vom Turm wegneigen.|Den Arm leicht gebeugt seitlich bis Schulterhöhe heben.|Langsam senken, nach dem Satz die Seite wechseln.",
  "Set the handle low, hold a post with your free hand and lean away from the tower.|Raise your arm slightly bent out to the side up to shoulder height.|Lower slowly; switch sides after the set.",
  "Körper bleibt als Linie, Schulter tief.|Ellbogen leicht über der Hand.", "Mit dem Rumpf schwingen.",
  "Body stays in one line, shoulder low.|Elbow slightly above your hand.", "Swinging with your torso.",
  "schulter", ["Einzelgriff (D-Griff) oder Manschette", "Single handle (D-handle) or cuff"], "seitheben weglehnen lean away");
G("db-front-raise", "Frontheben (Kurzhantel)", "Dumbbell Front Raise", "weight", 3, 40, 0,
  "Arme fast gestreckt bis Schulterhöhe nach vorn heben", "Raise your nearly straight arms forward to shoulder height", 45, 1, 1, "gym db",
  ["Vordere Schulter", "Obere Brust, Rumpf", "Front delts", "Upper chest, core"],
  "Aufrecht stehen, je eine Hantel vor den Oberschenkeln halten.|Die Arme fast gestreckt bis auf Schulterhöhe nach vorn heben.|Langsam wieder absenken, ohne Schwung.",
  "Stand tall holding a dumbbell in front of each thigh.|Raise your nearly straight arms forward to shoulder height.|Lower slowly without swinging.",
  "Rippen unten, Knie locker.|Schultern tief.", "Den Rücken ins Hohlkreuz ziehen oder höher als Schulterhöhe heben.",
  "Ribs down, knees soft.|Shoulders low.", "Arching your back or lifting above shoulder height.",
  "schulter", null, "frontheben");
G("front-raise-overhead", "Frontheben über Kopf", "Front Raise Above Head", "weight", 3, 40, 0,
  "Hantel oder Scheibe in einem Bogen bis über den Kopf heben", "Lift a dumbbell or plate in an arc up past your head", 45, 2, 2, "gym db",
  ["Vordere Schulter", "Seitliche Schulter, Trapez, Rumpf", "Front delts", "Side delts, traps, core"],
  "Eine Hantel oder Scheibe mit beiden Händen vor dem Körper halten, Bauch fest.|Mit fast gestreckten Armen in einem Bogen bis über den Kopf heben.|Langsam und kontrolliert wieder absenken.",
  "Hold a dumbbell or plate with both hands in front of you, core braced.|With nearly straight arms, lift in an arc until above your head.|Lower slowly and under control.",
  "Rumpf stabil, Kopf bleibt neutral.|Gewicht eher leicht wählen.", "Mit Schwung aus den Beinen arbeiten, ins Hohlkreuz fallen oder die Rippen nach vorn schieben.",
  "Stable torso, neutral head.|Choose a lighter weight.", "Using leg drive to swing the weight, arching your back or pushing your ribs forward.",
  "schulter", null, "scheibe über kopf");
G("db-rear-delt-fly", "Reverse Fly (Kurzhantel, vorgebeugt)", "Dumbbell Rear Delt Fly", "weight", 3, 40, 0,
  "Vorgebeugt die Arme seitlich bis Schulterhöhe heben", "Bent over, raise your arms out to the sides to shoulder height", 45, 1, 1, "gym db",
  ["Hintere Schulter", "Rauten, Oberer Rücken", "Rear delts", "Rhomboids, upper back"],
  "Mit leicht gebeugten Knien vorbeugen, Rücken gerade, die Hanteln hängen unter der Brust.|Die Arme leicht gebeugt seitlich bis Schulterhöhe heben.|Oben kurz halten, kontrolliert absenken.",
  "Hinge forward with slightly bent knees, back straight, dumbbells hanging below your chest.|Raise your slightly bent arms out to the sides up to shoulder height.|Hold briefly at the top, lower under control.",
  "Nacken lang, Blick zum Boden.|Schulterblätter leicht zusammen.", "Mit dem Rücken hochschwingen.",
  "Neck long, eyes on the floor.|Shoulder blades slightly together.", "Swinging up with your back.",
  "schulter", null, "hintere schulter fliegende vorgebeugt rear delt");
G("one-arm-rear-delt-fly", "Einarmige Reverse Fly", "One-Arm Rear Delt Fly", "weight", 3, 40, 1,
  "Mit der freien Hand abstützen, ein Arm hebt seitlich", "Support yourself with your free hand, one arm raises out to the side", 45, 1, 1, "gym db",
  ["Hintere Schulter", "Rauten, Oberer Rücken", "Rear delts", "Rhomboids, upper back"],
  "Eine Hand an der Bank oder am Gerät abstützen, vorgebeugt mit geradem Rücken, die andere Hand hält die Hantel.|Den Arm leicht gebeugt seitlich bis Schulterhöhe heben.|Kontrolliert absenken, nach dem Satz die Seite wechseln.",
  "Support one hand on a bench or machine, hinge forward with a straight back, the other hand holds the dumbbell.|Raise your slightly bent arm out to the side to shoulder height.|Lower under control; switch sides after the set.",
  "Rücken gerade, Schulter hebt sich nicht zum Ohr.|Bewegung aus der Schulter.", "Den Oberkörper mitdrehen.",
  "Back straight, shoulder doesn't rise to the ear.|Movement from the shoulder.", "Rotating your torso.",
  "schulter", null, "einarmig hintere schulter");
G("seated-rear-delt-fly", "Reverse Fly sitzend", "Seated Rear Delt Fly", "weight", 3, 40, 0,
  "Auf der Bank vorgebeugt sitzen, Arme seitlich öffnen", "Sit bent forward on a bench, open your arms to the sides", 45, 1, 1, "gym db",
  ["Hintere Schulter", "Rauten, Oberer Rücken", "Rear delts", "Rhomboids, upper back"],
  "Vorn auf einer Bank sitzen, mit der Brust nahe den Oberschenkeln, die Hanteln hängen neben den Waden.|Die Arme leicht gebeugt seitlich bis Schulterhöhe heben.|Kurz halten und langsam absenken.",
  "Sit on the front of a bench with your chest close to your thighs, dumbbells hanging beside your calves.|Raise your slightly bent arms out to the sides up to shoulder height.|Hold briefly and lower slowly.",
  "Rücken lang, Hals neutral.|Ellbogen leicht gebeugt.", "Mit Schwung aus dem Oberkörper arbeiten.",
  "Back long, neck neutral.|Elbows slightly bent.", "Swinging with your torso.",
  "schulter", null, "sitzend reverse fly");
G("upright-row", "Aufrechtes Rudern", "Upright Row", "weight", 3, 40, 0,
  "Gewicht eng am Körper bis zur Brust ziehen, Ellbogen führen", "Pull the weight close to your body up to your chest, elbows lead", 60, 2, 3, "gym",
  ["Seitliche Schulter", "Trapez, Bizeps", "Side delts", "Traps, biceps"],
  "Die Stange oder SZ-Stange mit etwa schulterbreitem Griff halten und aufrecht stehen.|Eng am Körper bis etwa Brusthöhe ziehen, die Ellbogen führen nach oben.|Langsam absenken. Ellbogen nicht höher als die Schultern.",
  "Hold the bar or EZ bar about shoulder-width apart and stand tall.|Pull it close to your body up to about chest height, elbows leading upward.|Lower slowly. Keep your elbows no higher than your shoulders.",
  "Schultern tief, Handgelenke locker.|Nur so hoch, wie es angenehm bleibt.", "Zu schwer oder zu hoch ziehen, wenn die Schultern zwicken.",
  "Shoulders low, wrists relaxed.|Only as high as feels comfortable.", "Going too heavy or too high if your shoulders pinch.",
  "schulter", ["SZ-Stange oder gerade Stange (Kabel oder Langhantel)", "EZ bar or straight bar (cable or barbell)"], "aufrechtes rudern kinnheben");
G("cuban-press", "Cuban Press", "Cuban Press", "weight", 3, 40, 0,
  "Hanteln seitlich hochziehen, nach außen drehen, dann hochdrücken", "Pull the dumbbells up and out, rotate outward, then press up", 45, 3, 1, "gym db",
  ["Hintere Schulter, Rotatorenmanschette", "Seitliche Schulter, Trapez, Trizeps", "Rear delts, rotator cuff", "Side delts, traps, triceps"],
  "Mit leichten Hanteln aufrecht stehen und sie wie beim aufrechten Rudern bis auf Brusthöhe ziehen.|Die Unterarme nach oben außen drehen, bis die Hanteln auf Ohrhöhe sind.|Von dort nach oben drücken, dann denselben Weg zurück.",
  "Stand tall with light dumbbells and pull them up to chest height like an upright row.|Rotate your forearms up and outward until the dumbbells are at ear height.|Press up from there, then reverse the path.",
  "Leichtes Gewicht, saubere Drehung.|Rumpf ruhig.", "Zu schwer wählen und aus dem Rücken schieben.",
  "Light weight, clean rotation.|Torso still.", "Going too heavy and pushing with your back.",
  "schulter", null, "kubanische presse");

/* ---------- Bizeps ---------- */
G("db-curl", "Bizepscurl (Kurzhantel)", "Dumbbell Curl", "weight arms", 3, 40, 0,
  "Beide Arme, Ellbogen bleiben am Körper", "Both arms, elbows stay at your sides", 45, 1, 1, "gym db",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Aufrecht stehen, je eine Hantel seitlich, Handflächen nach vorn.|Beide Hanteln zu den Schultern beugen, Ellbogen bleiben seitlich am Körper.|Langsam wieder strecken.",
  "Stand tall with a dumbbell at each side, palms forward.|Curl both dumbbells towards your shoulders, elbows stay at your sides.|Lower slowly.",
  "Schultern tief, Rücken gerade.|Handgelenke neutral.", "Mit dem Oberkörper Schwung holen.",
  "Shoulders low, back straight.|Wrists neutral.", "Swinging with your torso.",
  "arme", null, "kurzhantelcurl bizeps");
G("alternating-db-curl", "Wechselndes Bizepscurlen", "Alternating Dumbbell Curl", "weight arms", 3, 40, 0,
  "Arme beugen abwechselnd, Handfläche dreht nach oben", "Arms curl alternately, palm turns upward", 45, 1, 1, "gym db",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Aufrecht stehen, die Hanteln seitlich, Handflächen zum Körper.|Einen Arm beugen und dabei die Handfläche nach oben drehen.|Absenken und mit dem anderen Arm im Wechsel weitermachen.",
  "Stand tall with the dumbbells at your sides, palms facing your body.|Curl one arm and turn your palm upward as you go.|Lower and continue with the other arm in turn.",
  "Ellbogen fest am Körper.|Gleichmäßiges Tempo.", "Die Schulter nach vorn rollen.",
  "Elbows fixed at your sides.|Even tempo.", "Rolling your shoulder forward.",
  "arme", null, "abwechselnd curl");
G("close-grip-ez-curl", "SZ-Curl enger Griff", "Close-Grip EZ-Bar Curl", "weight arms", 3, 40, 0,
  "Enger Griff an der inneren Kröpfung, Ellbogen seitlich am Körper", "Narrow grip on the inner bends, elbows at your sides", 60, 1, 2, "gym",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Die SZ-Stange an den inneren Kröpfungen greifen, aufrecht stehen.|Die Stange zur Brust beugen, die Ellbogen bleiben seitlich am Körper.|Langsam zurück in die Streckung.",
  "Grip the EZ bar on the inner bends and stand tall.|Curl the bar to your chest while your elbows stay at your sides.|Return slowly to full extension.",
  "Brust offen, Schultern tief.|Handgelenke bleiben gerade.", "Zu schwer und mit dem Rücken schwingen.",
  "Chest open, shoulders low.|Wrists stay straight.", "Too heavy, swinging with your back.",
  "arme", ["SZ-Stange, innerer Griff", "EZ bar, inner grip"], "sz curl eng");
G("high-cable-curl", "Bizepscurl am hohen Kabel", "High Cable Curl", "weight arms", 3, 40, 0,
  "Beide Griffe oben, Arme seitlich auf Schulterhöhe, Hände zum Kopf beugen", "Both handles high, arms out at shoulder height, curl your hands towards your head", 45, 2, 2, "gym",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Die Griffe oben einhängen, mittig stehen und die Arme seitlich auf Schulterhöhe halten.|Die Hände zu den Ohren beugen, Ellbogen bleiben in Schulterhöhe.|Langsam strecken und die Spannung halten.",
  "Set the handles high, stand centred with your arms out to the sides at shoulder height.|Curl your hands towards your ears while your elbows stay at shoulder height.|Extend slowly and keep tension.",
  "Ellbogen auf Schulterhöhe, Rücken gerade.|Handgelenke locker.", "Die Ellbogen absinken lassen.",
  "Elbows at shoulder height, back straight.|Wrists relaxed.", "Letting your elbows drop.",
  "arme", ["Zwei Einzelgriffe (D-Griffe), Seilzug oben", "Two single handles (D-handles), cables at the top"], "kabel curl hoch");
G("one-arm-cable-curl", "Einarmiger Bizepscurl am Kabel", "One-Arm Cable Curl", "weight arms", 3, 40, 1,
  "Ein Arm, Kabel von unten, Ellbogen bleibt am Körper", "One arm, cable from below, elbow stays at your side", 45, 1, 1, "gym",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Den Griff tief einhängen, seitlich zum Turm stehen und den Griff mit einer Hand fassen.|Den Griff zur Schulter beugen, der Ellbogen bleibt am Körper.|Langsam strecken, nach dem Satz die Seite wechseln.",
  "Set the handle low, stand side-on to the tower and grip the handle with one hand.|Curl the handle to your shoulder, elbow stays at your side.|Extend slowly; switch sides after the set.",
  "Oberkörper ruhig, Schulter tief.|Handgelenk gerade.", "Den Rumpf zur Seite lehnen.",
  "Torso still, shoulder low.|Wrist straight.", "Leaning your torso sideways.",
  "arme", ["Einzelgriff (D-Griff)", "Single handle (D-handle)"], "einarmig kabel");
G("cross-body-hammer-curl", "Cross-Body-Hammercurl", "Cross-Body Hammer Curl", "weight arms", 3, 40, 0,
  "Hantel im Hammergriff quer zur Gegenseite der Brust beugen", "Curl the dumbbell across your body in a hammer grip", 45, 1, 1, "gym db",
  ["Oberarmmuskel", "Bizeps, Unterarme", "Brachialis", "Biceps, forearms"],
  "Aufrecht stehen, die Hanteln im Hammergriff (Daumen nach oben) neben dem Körper.|Eine Hantel quer vor den Körper zur gegenüberliegenden Schulter beugen.|Langsam absenken und im Wechsel weitermachen.",
  "Stand tall with the dumbbells in a hammer grip (thumbs up) beside your body.|Curl one dumbbell across your body towards the opposite shoulder.|Lower slowly and alternate.",
  "Oberkörper ruhig, Ellbogen nah.|Handgelenk neutral.", "Den Oberkörper mitdrehen.",
  "Torso still, elbow close.|Wrist neutral.", "Turning your torso with it.",
  "arme", null, "hammer quer");
G("preacher-curl", "Scott-Curl (Preacher Curl)", "Preacher Curl", "weight arms", 3, 40, 0,
  "Oberarme auf dem Polster, Stange kontrolliert beugen", "Upper arms on the pad, curl the bar under control", 60, 1, 2, "gym",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Die Sitzhöhe so einstellen, dass die Achseln am oberen Polster liegen, Stange im Untergriff greifen.|Die Stange zu den Schultern beugen, die Oberarme bleiben auf dem Polster.|Langsam fast ganz strecken, unten nicht ruckartig in die volle Streckung fallen.",
  "Adjust the seat so your armpits rest on the top of the pad and take the bar underhand.|Curl the bar towards your shoulders while your upper arms stay on the pad.|Lower slowly to almost straight, don't drop jerkily into full extension at the bottom.",
  "Oberarme flach auf dem Polster.|Gleichmäßiges Tempo.", "Unten fallen lassen oder die Schultern nach vorn schieben.",
  "Upper arms flat on the pad.|Even tempo.", "Dropping at the bottom or pushing your shoulders forward.",
  "arme", ["SZ-Stange (oder Kurzhantel)", "EZ bar (or dumbbell)"], "scottcurl preacher");
G("hammer-preacher-curl", "Hammercurl am Scott-Pult", "Hammer Preacher Curl", "weight arms", 3, 40, 0,
  "Kurzhanteln im Hammergriff über dem Polster beugen", "Curl dumbbells in a hammer grip over the pad", 60, 1, 2, "gym db",
  ["Oberarmmuskel", "Bizeps, Unterarme", "Brachialis", "Biceps, forearms"],
  "Am Scott-Pult sitzen, die Oberarme auf dem Polster, die Hanteln im Hammergriff.|Die Hanteln zu den Schultern beugen, Daumen zeigen nach oben.|Langsam absenken, bis die Arme fast gestreckt sind, unten nicht in die Streckung fallen.",
  "Sit at the preacher bench with your upper arms on the pad, dumbbells in a hammer grip.|Curl the dumbbells towards your shoulders, thumbs up.|Lower slowly until your arms are almost straight.",
  "Brust am Polster, Schultern tief.|Handgelenke gerade.", "Mit dem Oberkörper nach hinten kippen.",
  "Chest on the pad, shoulders low.|Wrists straight.", "Tipping back with your torso.",
  "arme", null, "scott hammer");
G("incline-db-curl", "Schrägbank-Curl (Kurzhantel)", "Incline Dumbbell Curl", "weight arms", 3, 40, 0,
  "Auf der Schrägbank liegen, Arme hängen hinter dem Körper", "Lean back on the incline bench, arms hang behind your body", 60, 2, 2, "gym db",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Eine Schrägbank auf etwa 45–60° stellen, hinlegen und die Hanteln seitlich hängen lassen.|Die Hanteln zu den Schultern beugen, die Oberarme bleiben fast senkrecht.|Langsam absenken bis zur vollen Dehnung.",
  "Set an incline bench to about 45–60°, lie back and let the dumbbells hang at your sides.|Curl the dumbbells to your shoulders while your upper arms stay almost vertical.|Lower slowly to a full stretch.",
  "Schultern an der Lehne, Oberarme still.|Handgelenke neutral.", "Die Ellbogen nach vorn wandern lassen.",
  "Shoulders against the pad, upper arms still.|Wrists neutral.", "Letting your elbows drift forward.",
  "arme", null, "schrägbank curl incline");
G("spider-curl", "Spider Curl", "Spider Curl", "weight arms", 3, 40, 0,
  "Bäuchlings, Oberarme hängen senkrecht, nur die Unterarme arbeiten", "Face down, upper arms hang vertically, only your forearms move", 60, 2, 2, "gym db",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Bäuchlings auf eine steile Schrägbank legen, die Arme hängen senkrecht nach unten.|Die Hanteln beugen, bis der Bizeps voll angespannt ist.|Kontrolliert wieder strecken, ohne unten abzuprallen.",
  "Lie face down on a steep incline bench with your arms hanging straight down.|Curl the dumbbells until your biceps is fully tensed.|Extend under control without bouncing at the bottom.",
  "Oberarme still, Schultern tief.|Langsames Tempo.", "Mit den Schultern mitziehen.",
  "Upper arms still, shoulders low.|Slow tempo.", "Pulling with your shoulders.",
  "arme", null, "spidercurl");
G("concentration-curl", "Konzentrationscurl", "Concentration Curl", "weight arms", 3, 40, 1,
  "Ellbogen an der Innenseite des Oberschenkels, Hantel langsam beugen", "Elbow against your inner thigh, curl the dumbbell slowly", 45, 1, 1, "gym db",
  ["Bizeps", "Oberarmmuskel, Unterarme", "Biceps", "Brachialis, forearms"],
  "Auf einer Bank sitzen, den Ellbogen an die Innenseite des Oberschenkels stützen, die Hantel hängt nach unten.|Die Hantel zur Schulter beugen und oben fest anspannen.|Langsam wieder strecken, danach die Seite wechseln.",
  "Sit on a bench, brace your elbow against your inner thigh, the dumbbell hangs down.|Curl the dumbbell to your shoulder and squeeze at the top.|Extend slowly, then switch sides.",
  "Oberkörper ruhig, Schulter tief.|Ellbogen bleibt am Bein.", "Mit der Schulter mitziehen.",
  "Torso still, shoulder low.|Elbow stays on your leg.", "Helping with your shoulder.",
  "arme", null, "konzentration curl");
G("standing-concentration-curl", "Konzentrationscurl im Stand", "Standing Concentration Curl", "weight arms", 3, 40, 1,
  "Vorgebeugt, Ellbogen frei vor dem Körper, Hantel beugen", "Bent forward, elbow free in front of you, curl the dumbbell", 45, 2, 1, "gym db",
  ["Bizeps", "Unterarme, Rumpf", "Biceps", "Forearms, core"],
  "Vorgebeugt mit geradem Rücken stehen, eine Hand stützt am Oberschenkel oder Gerät, die Hantel hängt senkrecht.|Die Hantel zur Schulter beugen, der Oberarm bleibt still.|Langsam strecken, danach die Seite wechseln.",
  "Stand bent forward with a straight back, one hand supports on your thigh or a machine, the dumbbell hangs vertically.|Curl the dumbbell to your shoulder with your upper arm still.|Extend slowly, then switch sides.",
  "Rücken gerade, Oberarm still.|Ruhiges Tempo.", "Den Oberarm mitschwingen lassen.",
  "Back straight, upper arm still.|Steady tempo.", "Swinging your upper arm.",
  "arme", null, "stehend konzentration");
G("zottman-curl", "Zottman Curl", "Zottman Curl", "weight arms", 3, 40, 0,
  "Hoch im Untergriff, oben drehen, im Obergriff langsam senken", "Curl up underhand, rotate at the top, lower slowly overhand", 45, 2, 2, "gym db",
  ["Bizeps", "Unterarme, Oberarmmuskel", "Biceps", "Forearms, brachialis"],
  "Aufrecht stehen, die Hanteln im Untergriff seitlich halten.|Beugen, oben die Handflächen nach unten drehen.|Im Obergriff langsam absenken, unten wieder in den Untergriff drehen.",
  "Stand tall holding the dumbbells at your sides in an underhand grip.|Curl up, then rotate your palms downward at the top.|Lower slowly in an overhand grip and rotate back underhand at the bottom.",
  "Ellbogen am Körper, Oberkörper ruhig.|Gewicht eher leicht.", "Die Drehung überspringen oder Schwung holen.",
  "Elbows at your sides, torso still.|Choose a lighter weight.", "Skipping the rotation or using momentum.",
  "arme", null, "zottman");


/* ---------- Trizeps ---------- */
G("rope-triceps-pushdown", "Trizepsdrücken mit Seil", "Rope Triceps Pushdown", "weight arms", 3, 40, 0,
  "Seil nach unten drücken, am Ende die Enden auseinanderziehen", "Push the rope down and pull the ends apart at the bottom", 45, 1, 1, "gym",
  ["Trizeps", "Unterarme", "Triceps", "Forearms"],
  "Das Seil am oberen Kabelturm einhängen, nah davor stehen, Ellbogen seitlich am Körper.|Das Seil nach unten drücken, am Ende die Seilenden leicht auseinanderführen.|Langsam zurück, bis die Hände fast auf Brusthöhe sind.",
  "Attach the rope to the high cable tower, stand close with your elbows at your sides.|Push the rope down and spread the ends slightly at the bottom.|Return slowly until your hands are almost at chest height.",
  "Oberarme bleiben still, Rücken gerade.|Handgelenke neutral.", "Mit dem Oberkörper nach unten drücken oder die Ellbogen nach vorn wandern lassen.",
  "Upper arms stay still, back straight.|Wrists neutral.", "Pushing down with your torso or letting your elbows drift forward.",
  "arme", ["Seilaufsatz", "Rope attachment"], "seil pushdown trizepsdrücken kabel");
G("one-arm-cable-triceps-extension", "Einarmiges Trizepsdrücken am Kabel", "One-Arm Cable Triceps Extension", "weight arms", 3, 40, 1,
  "Ein Arm drückt den Griff nach unten, Ellbogen am Körper", "One arm presses the handle down, elbow at your side", 45, 1, 1, "gym",
  ["Trizeps", "Unterarme", "Triceps", "Forearms"],
  "Den Griff hoch einhängen, seitlich oder frontal zum Turm stehen und den Griff mit einer Hand fassen.|Den Griff nach unten drücken, bis der Arm fast gestreckt ist.|Langsam zurück, nach dem Satz die Seite wechseln.",
  "Set the handle high, stand side-on or facing the tower and grip it with one hand.|Press the handle down until your arm is almost straight.|Return slowly; switch sides after the set.",
  "Ellbogen bleibt am Körper, Schulter tief.|Oberkörper ruhig.", "Den Ellbogen vom Körper wegführen oder mit der Schulter helfen.",
  "Elbow stays at your side, shoulder low.|Torso still.", "Flaring your elbow or helping with your shoulder.",
  "arme", ["Einzelgriff (D-Griff)", "Single handle (D-handle)"], "einarmig trizeps kabel");
G("kneeling-cable-triceps-extension", "Trizepsstrecken am Kabel (kniend, über Kopf)", "Kneeling Cable Triceps Extension", "weight arms", 3, 40, 0,
  "Kniend, Seil hinter dem Kopf, Arme nach vorn strecken", "Kneeling, rope behind your head, extend your arms forward", 45, 2, 1, "gym",
  ["Trizeps (langer Kopf)", "Rumpf, Unterarme", "Triceps (long head)", "Core, forearms"],
  "Das Seil tief einhängen, mit dem Rücken zum Turm hinknien und das Seil hinter dem Kopf halten, Ellbogen zeigen nach oben.|Die Arme nach vorn oben strecken, bis sie fast gerade sind.|Langsam zurück hinter den Kopf, die Oberarme bleiben ruhig.",
  "Set the rope low, kneel with your back to the tower and hold the rope behind your head, elbows pointing up.|Extend your arms forward and up until almost straight.|Return slowly behind your head with your upper arms still.",
  "Bauch fest, Rippen unten.|Ellbogen eng am Kopf.", "Ins Hohlkreuz fallen oder die Ellbogen weit nach außen öffnen.",
  "Abs firm, ribs down.|Elbows close to your head.", "Arching your back or flaring your elbows wide.",
  "arme", ["Seilaufsatz", "Rope attachment"], "kniend overhead trizeps kabel");
G("incline-cable-triceps-extension", "Trizepsstrecken am Kabel (Schrägbank)", "Incline Cable Triceps Extension", "weight arms", 3, 40, 0,
  "Auf der Schrägbank liegend, Seil hinter dem Kopf strecken", "Lying on an incline bench, extend the rope from behind your head", 60, 2, 1, "gym",
  ["Trizeps (langer Kopf)", "Unterarme", "Triceps (long head)", "Forearms"],
  "Eine Schrägbank mit dem Kopfende zum tiefen Kabelturm stellen, hinlegen und das Seil hinter dem Kopf greifen.|Die Arme nach vorn oben strecken, die Oberarme bleiben ruhig.|Langsam wieder beugen, bis du eine Dehnung am Trizeps spürst.",
  "Place an incline bench with its head end towards the low cable tower, lie back and grip the rope behind your head.|Extend your arms forward and up while your upper arms stay still.|Bend slowly until you feel a stretch in your triceps.",
  "Schultern an der Lehne, Ellbogen schmal.|Handgelenke gerade.", "Die Ellbogen nach außen kippen lassen.",
  "Shoulders against the pad, elbows narrow.|Wrists straight.", "Letting your elbows tip outward.",
  "arme", ["Seilaufsatz", "Rope attachment"], "schrägbank trizeps kabel");
G("lying-cable-triceps-extension", "Trizepsstrecken am Kabel (liegend)", "Lying Cable Triceps Extension", "weight arms", 3, 40, 0,
  "Flach auf der Bank liegend, Stange zur Stirn beugen und strecken", "Lying flat, bend the bar towards your forehead and extend", 60, 2, 1, "gym",
  ["Trizeps", "Unterarme", "Triceps", "Forearms"],
  "Eine flache Bank mit dem Kopfende zum tiefen Kabelturm stellen, hinlegen und die Stange mit gestreckten Armen über der Brust halten.|Die Unterarme beugen, bis die Stange zur Stirn kommt, die Oberarme bleiben senkrecht.|Wieder strecken und oben kurz anspannen.",
  "Place a flat bench with its head end towards the low cable tower, lie down and hold the bar above your chest with straight arms.|Bend your forearms until the bar nears your forehead, upper arms stay vertical.|Extend again and squeeze briefly at the top.",
  "Oberarme still, Ellbogen schmal.|Bauch leicht angespannt.", "Die Oberarme nach hinten absinken lassen.",
  "Upper arms still, elbows narrow.|Abs lightly braced.", "Letting your upper arms drift back.",
  "arme", ["SZ-Stange oder gerade Stange (tief eingehängt)", "EZ bar or straight bar (low setting)"], "liegend kabel skull crusher");
G("close-grip-db-press", "Enges Kurzhantel-Drücken", "Close-Grip Dumbbell Press", "weight arms", 3, 40, 0,
  "Hanteln eng zusammen, Ellbogen nah am Körper nach oben drücken", "Dumbbells together, press up with your elbows close to your body", 60, 2, 2, "gym db",
  ["Trizeps", "Brust, Vordere Schulter", "Triceps", "Chest, front delts"],
  "Auf der flachen Bank liegen, die Hanteln eng nebeneinander über der Brust halten.|Die Hanteln zur unteren Brust absenken, die Ellbogen bleiben nah am Körper.|Kräftig nach oben drücken und oben die Arme fast strecken.",
  "Lie on a flat bench and hold the dumbbells together above your chest.|Lower them to your lower chest, elbows close to your body.|Press up firmly and almost straighten your arms at the top.",
  "Schulterblätter zusammen, Handgelenke gerade.|Hanteln bleiben in Kontakt.", "Die Ellbogen weit nach außen öffnen.",
  "Shoulder blades together, wrists straight.|Dumbbells stay in contact.", "Flaring your elbows wide.",
  "arme", null, "enges drücken kurzhantel trizeps");
G("db-skull-crusher", "Stirndrücken mit Kurzhanteln", "Dumbbell Skull Crusher", "weight arms", 3, 40, 0,
  "Liegend, Hanteln neben den Kopf beugen und wieder strecken", "Lying down, bend the dumbbells beside your head and extend again", 60, 2, 1, "gym db",
  ["Trizeps", "Unterarme", "Triceps", "Forearms"],
  "Flach auf der Bank liegen, die Hanteln mit gestreckten Armen über der Brust halten, Handflächen zueinander.|Die Unterarme beugen und die Hanteln links und rechts neben den Kopf absenken.|Wieder strecken, die Oberarme bleiben senkrecht.",
  "Lie flat on a bench and hold the dumbbells above your chest with straight arms, palms facing.|Bend your forearms and lower the dumbbells beside your head.|Extend again with your upper arms staying vertical.",
  "Ellbogen schmal, Oberarme still.|Gewicht eher moderat.", "Zu schwer wählen oder die Ellbogen auseinanderfallen lassen.",
  "Elbows narrow, upper arms still.|Moderate weight.", "Going too heavy or letting your elbows drift apart.",
  "arme", null, "kurzhantel stirndrücken skullcrusher");
G("single-arm-skull-crusher", "Einarmiges Stirndrücken", "Single-Arm Skull Crusher", "weight arms", 3, 40, 1,
  "Ein Arm streckt die Hantel, der andere stützt den Oberarm", "One arm extends the dumbbell, the other can support the upper arm", 60, 2, 1, "gym db",
  ["Trizeps", "Unterarme", "Triceps", "Forearms"],
  "Flach auf der Bank liegen, eine Hantel mit gestrecktem Arm über der Schulter halten.|Den Unterarm beugen und die Hantel zur Schulter oder neben den Kopf absenken.|Wieder strecken, nach dem Satz die Seite wechseln.",
  "Lie flat on a bench and hold one dumbbell above your shoulder with a straight arm.|Bend your forearm and lower the dumbbell towards your shoulder or beside your head.|Extend again; switch sides after the set.",
  "Oberarm bleibt senkrecht.|Handgelenk gerade.", "Mit der Schulter nachhelfen.",
  "Upper arm stays vertical.|Wrist straight.", "Helping with your shoulder.",
  "arme", null, "einarmig skull crusher kurzhantel");
G("supinated-triceps-extension", "Trizepsdrücken im Untergriff (Kabel)", "Supinated Triceps Extension", "weight arms", 3, 40, 0,
  "Stange von oben im Untergriff nach unten drücken", "Push the bar down from above with an underhand grip", 45, 2, 1, "gym",
  ["Trizeps", "Unterarme (Griff)", "Triceps", "Forearms (grip)"],
  "Eine kurze Stange am oberen Kabelturm einhängen, im Untergriff schulterbreit greifen, Ellbogen am Körper.|Die Stange nach unten drücken, bis die Arme fast gestreckt sind.|Langsam zurück, die Ellbogen bleiben dabei fest.",
  "Attach a short bar to the high cable tower, take an underhand shoulder-width grip, elbows at your sides.|Press the bar down until your arms are almost straight.|Return slowly with your elbows staying fixed.",
  "Ellbogen am Körper, Handgelenke neutral.|Eher moderates Gewicht.", "Zu schwer wählen, die Handgelenke knicken lassen.",
  "Elbows at your sides, wrists neutral.|Moderate weight.", "Going too heavy or letting your wrists bend.",
  "arme", ["Kurze gerade Stange, Untergriff", "Short straight bar, underhand"], "untergriff pushdown reverse");
G("ez-jm-press", "JM Press (SZ-Stange)", "EZ-Bar JM Press", "weight arms", 3, 40, 0,
  "Zwischen Bankdrücken und Stirndrücken, Stange zum Kinn absenken", "Between a close-grip bench press and a skull crusher, lower the bar towards your chin", 90, 3, 3, "gym",
  ["Trizeps", "Brust, Vordere Schulter", "Triceps", "Chest, front delts"],
  "Auf der Bank liegen, die SZ-Stange eng im Obergriff über der Brust halten.|Die Ellbogen nach vorn beugen und die Stange Richtung Kinn und oberer Brust absenken.|Mit Kraft aus dem Trizeps zurück nach oben drücken.",
  "Lie on a bench and hold the EZ bar close-grip, overhand, above your chest.|Bend your elbows forward and lower the bar towards your chin and upper chest.|Press back up using your triceps.",
  "Ellbogen zeigen nach vorn, nicht zur Seite.|Sicherung oder Hilfsperson bei schwerem Gewicht.", "Zu schwer starten oder die Ellbogen weit öffnen. Die Stange nie über Gesicht oder Hals ohne Sicherung führen, nicht bis zum Muskelversagen ohne Hilfsperson.",
  "Elbows point forward, not out.|Use a spotter or safety on heavy sets.", "Starting too heavy or flaring your elbows. Never move the bar over your face or neck without safety, and do not train to failure without a spotter.",
  "arme", ["SZ-Stange, enger Griff", "EZ bar, narrow grip"], "jm press sz stange");
G("tate-press", "Tate Press", "Tate Press", "weight arms", 3, 40, 0,
  "Liegend, Ellbogen nach außen, Hanteln zur Brust und wieder strecken", "Lying down, elbows out, lower the dumbbells to your chest and extend", 60, 2, 1, "gym db",
  ["Trizeps", "Unterarme", "Triceps", "Forearms"],
  "Auf der Bank liegen, die Hanteln im Obergriff mit gestreckten Armen über der Brust halten.|Die Ellbogen beugen und die Hanteln zur Brust senken, die Ellbogen zeigen zur Seite.|Wieder strecken, die Oberarme bleiben fast senkrecht.",
  "Lie on a bench and hold the dumbbells overhand above your chest with straight arms.|Bend your elbows and lower the dumbbells to your chest, elbows pointing out.|Extend again with your upper arms staying nearly vertical.",
  "Handgelenke gerade, Hanteln über der Brust.|Gewicht moderat wählen.", "Die Hanteln zu weit Richtung Gesicht absenken.",
  "Wrists straight, dumbbells above your chest.|Choose a moderate weight.", "Lowering the dumbbells too close to your face.",
  "arme", null, "close grip face press tate");

/* ---------- Beine & Po ---------- */
G("db-bench-squat", "Kniebeuge zur Bank mit Kurzhantel", "Dumbbell Bench Squat", "weight legs", 3, 40, 0,
  "Hantel vor der Brust, bis zur Bank absetzen und wieder aufstehen", "Dumbbell at your chest, sit back to the bench and stand up again", 60, 1, 2, "gym db",
  ["Oberschenkel vorn", "Gesäß, Rumpf", "Quads", "Glutes, core"],
  "Eine Bank hinter dir platzieren, die Hantel vor der Brust halten, schulterbreit stehen.|Das Gesäß nach hinten schieben und kontrolliert bis zur Bank absenken.|Aus den Fersen kräftig aufstehen, ohne ganz abzusitzen.",
  "Place a bench behind you, hold the dumbbell at your chest, stand shoulder-width apart.|Push your hips back and lower under control to the bench.|Drive up through your heels without fully sitting down.",
  "Knie folgen den Zehen, Rücken gerade.|Brust offen.", "Auf die Bank plumpsen lassen oder die Knie nach innen fallen lassen.",
  "Knees track your toes, back straight.|Chest open.", "Dropping onto the bench or letting your knees cave in.",
  "beine", null, "bank kniebeuge kurzhantel");
G("db-clean", "Kurzhantel-Umsetzen (Clean)", "Dumbbell Clean", "weight legs", 3, 20, 0,
  "Hanteln explosiv vom Boden zu den Schultern ziehen", "Pull the dumbbells explosively from the floor to your shoulders", 90, 3, 3, "gym db",
  ["Gesäß", "Oberschenkel hinten, Rückenstrecker, Schultern, Trapez", "Glutes", "Hamstrings, spinal erectors, shoulders, traps"],
  "Die Hanteln neben den Füßen greifen, Hüfte nach hinten, Rücken gerade, Brust offen.|Mit kräftiger Hüftstreckung hochziehen und die Hanteln flink auf die Schultern bringen.|Kontrolliert wieder absenken und sauber neu ansetzen.",
  "Pick up the dumbbells beside your feet, hips back, back straight, chest open.|Drive your hips through and pull the dumbbells quickly up to your shoulders.|Lower under control and reset cleanly.",
  "Kraft kommt aus der Hüfte, Rücken neutral.|Leichtes Gewicht zum Üben.", "Mit den Armen reißen oder mit rundem Rücken ansetzen. Die Hanteln nicht hart auf Schultern oder Schlüsselbeine fallen lassen, die Ellbogen schnell unter die Hanteln bringen.",
  "Power comes from the hips, back neutral.|Use light weight to practise.", "Yanking with your arms or starting with a rounded back. Do not let the dumbbells crash onto your shoulders or collarbones; get your elbows under them quickly.",
  "beine", null, "umsetzen clean kurzhantel explosiv");
G("stiff-leg-deadlift", "Gestrecktes Kreuzheben", "Stiff-Leg Deadlift", "weight legs", 3, 40, 0,
  "Knie fast gestreckt, Hüfte nach hinten, Rücken gerade", "Knees almost straight, hips back, back straight", 75, 2, 3, "gym",
  ["Oberschenkel hinten", "Gesäß, Rückenstrecker", "Hamstrings", "Glutes, spinal erectors"],
  "Die Stange vor den Oberschenkeln halten, Knie nur leicht gebeugt, aufrecht stehen.|Die Hüfte nach hinten schieben und die Stange nah an den Beinen nach unten führen.|Wenn die Dehnung hinten am Oberschenkel stark wird, mit der Hüfte wieder aufrichten.",
  "Hold the bar in front of your thighs, knees only slightly bent, stand tall.|Push your hips back and slide the bar down close to your legs.|When the stretch behind your thighs gets strong, drive your hips forward to stand up.",
  "Rücken neutral, Stange nah am Körper.|Blick nach vorn unten.", "Den Rücken runden oder tiefer gehen, als der Rücken gerade bleibt.",
  "Back neutral, bar close to your body.|Eyes forward and down.", "Rounding your back or going lower than you can keep it straight.",
  "beine", ["Gerade Stange, Obergriff", "Straight bar, overhand"], "gestrecktes kreuzheben stiff leg");

/* ---------- Core / Bauch ---------- */
G("standing-cable-crunch", "Kabel-Crunch im Stand", "Standing Cable Crunch", "core", 3, 40, 0,
  "Seil am Kopf halten, Oberkörper aus dem Rumpf nach unten rollen", "Hold the rope at your head, curl your torso down from the abs", 45, 2, 2, "gym",
  ["Gerader Bauch", "Schräge Bauchmuskeln", "Rectus abdominis", "Obliques"],
  "Das Seil hoch einhängen, mit dem Gesicht zum Turm einen Schritt zurücktreten und die Seilenden neben den Kopf halten.|Den Oberkörper aus dem Bauch nach unten rollen, die Hüfte bleibt ruhig.|Langsam wieder aufrichten.",
  "Set the rope high, stand facing the tower, take a step back and hold the rope ends beside your head.|Curl your torso down from your abs while your hips stay still.|Return slowly to upright.",
  "Rund einrollen, Hüfte bleibt ruhig.|Atme beim Einrollen aus.", "Aus der Hüfte beugen oder mit den Armen ziehen.",
  "Curl round, hips stay still.|Breathe out as you curl.", "Folding at the hips or pulling with your arms.",
  "bauch", ["Seilaufsatz", "Rope attachment"], "stehend crunch kabel bauch");
G("cable-lift", "Kabel-Lift (von unten nach oben)", "Cable Lift (Low to High)", "core", 3, 40, 1,
  "Griff von unten diagonal nach oben über den Körper führen", "Lift the handle diagonally from low to high across your body", 45, 2, 2, "gym",
  ["Schräge Bauchmuskeln", "Rumpf, Schultern", "Obliques", "Core, shoulders"],
  "Den Griff tief einhängen, seitlich zum Turm stehen und den Griff mit beiden Händen an der Hüfte fassen.|Mit gestreckten Armen diagonal nach oben über die gegenüberliegende Schulter führen, der Blick folgt.|Kontrolliert zurück, nach dem Satz die Seite wechseln.",
  "Set the handle low, stand side-on to the tower and grip the handle with both hands at your hip.|With straight arms, lift diagonally up across the opposite shoulder, eyes following.|Return under control; switch sides after the set.",
  "Rumpf dreht aus der Mitte, Füße bleiben fest.|Bauch angespannt.", "Mit dem Rücken ins Hohlkreuz ziehen.",
  "Torso rotates from the centre, feet stay planted.|Abs braced.", "Arching your back to pull.",
  "bauch", ["Einzelgriff (D-Griff), Seilzug unten", "Single handle (D-handle), cable low"], "kabel diagonal heben lift chop");
G("cable-twist", "Rumpfdrehung am Kabel", "Cable Twist", "core", 3, 40, 1,
  "Griff auf Brusthöhe seitlich wegdrehen, Arme bleiben gestreckt", "Rotate the handle away at chest height, arms stay straight", 45, 1, 2, "gym",
  ["Schräge Bauchmuskeln", "Rumpf", "Obliques", "Core"],
  "Den Griff auf Brusthöhe einhängen, seitlich zum Turm stehen und den Griff mit beiden Händen vor der Brust halten.|Mit gestreckten Armen den Oberkörper vom Turm wegdrehen.|Kontrolliert zurück, nach dem Satz die Seite wechseln.",
  "Set the handle at chest height, stand side-on to the tower and hold it with both hands in front of your chest.|With straight arms, rotate your torso away from the tower.|Return under control; switch sides after the set.",
  "Hüfte bleibt ruhig, Drehung aus dem Rumpf.|Füße fest.", "Die Arme allein bewegen oder die Hüfte mitdrehen.",
  "Hips stay still, rotate from the torso.|Feet planted.", "Moving only your arms or turning your hips with it.",
  "bauch", ["Einzelgriff (D-Griff)", "Single handle (D-handle)"], "twist kabel rumpfdrehen");
G("cable-reverse-crunch", "Reverse Crunch am Kabel", "Cable Reverse Crunch", "core", 3, 40, 0,
  "Liegend, mit Fußmanschetten die Knie zur Brust ziehen", "Lying down, pull your knees to your chest with ankle cuffs", 45, 2, 2, "gym",
  ["Gerader Bauch (unterer Anteil)", "Hüftbeuger", "Lower abs", "Hip flexors"],
  "Auf dem Rücken liegen, die Knöchelmanschetten am tiefen Kabel einhängen, die Hände halten das Gerät oder den Boden.|Die Knie zur Brust ziehen und das Becken leicht vom Boden lösen.|Langsam wieder strecken, ohne die Beine abzulegen.",
  "Lie on your back with ankle cuffs attached to the low cable, hands holding the base or the floor.|Draw your knees to your chest and lift your pelvis slightly.|Extend slowly without resting your legs.",
  "Lendenwirbel am Boden, Bewegung aus dem Bauch.|Ruhig atmen.", "Mit Schwung die Beine hochwerfen.",
  "Lower back on the floor, movement from the abs.|Breathe steadily.", "Throwing your legs up with momentum.",
  "bauch", ["Knöchelmanschette", "Ankle cuff"], "reverse crunch kabel beine ziehen");
G("judo-flip", "Judo Flip", "Judo Flip", "core", 3, 20, 0,
  "Liegend, Beine und Becken über den Kopf rollen und wieder zurück", "Lying down, roll your legs and hips overhead and back again", 60, 3, 3, "none",
  ["Gerader Bauch", "Hüftbeuger, Rumpf", "Rectus abdominis", "Hip flexors, core"],
  "Auf den Rücken legen, die Arme seitlich am Boden, Beine gestreckt senkrecht nach oben.|Das Becken anheben und die Beine kontrolliert über den Kopf rollen.|Langsam Wirbel für Wirbel zurück auf die Matte abrollen.",
  "Lie on your back, arms by your sides, legs straight up.|Lift your pelvis and roll your legs overhead under control.|Roll back down slowly one vertebra at a time.",
  "Das Gewicht bleibt auf Schultern und oberem Rücken, nie auf dem Hals.|Kopf geradeaus, nicht drehen; auf einer Matte üben.", "Mit Schwung über den Kopf rollen oder auf dem Hals landen. Nicht bei Nacken- oder Rückenbeschwerden.",
  "Weight stays on your shoulders and upper back, never on your neck.|Head straight, do not turn it; practise on a mat.", "Rolling over with momentum or landing on your neck. Skip it with neck or back problems.",
  "bauch", null, "judo flip rollen beine überkopf");
G("crunch", "Crunch", "Crunch", "core", 3, 40, 0,
  "Schultern leicht anheben, unterer Rücken bleibt am Boden", "Lift your shoulders slightly, lower back stays on the floor", 45, 1, 1, "none",
  ["Gerader Bauch", "Rumpf", "Rectus abdominis", "Core"],
  "Auf den Rücken legen, die Knie gebeugt und die Füße aufgestellt, Hände seitlich am Kopf.|Den Oberkörper aus dem Bauch einrollen, bis sich die Schulterblätter lösen.|Kontrolliert wieder absenken, ohne ganz abzulegen.",
  "Lie on your back with bent knees and feet flat, hands beside your head.|Curl your torso up from your abs until your shoulder blades lift.|Lower under control without fully resting.",
  "Blick zur Decke, Kinn nicht auf die Brust.|Ausatmen beim Anheben.", "Am Nacken ziehen oder den ganzen Rücken aufrichten.",
  "Eyes to the ceiling, chin off your chest.|Breathe out as you lift.", "Pulling on your neck or sitting all the way up.",
  "bauch", null, "bauchpresse crunch klassisch");
G("crunch-arms-straight", "Crunch mit gestreckten Armen", "Crunch (Arms Straight)", "core", 3, 40, 0,
  "Arme gestreckt nach oben, Oberkörper zur Hand hin einrollen", "Arms straight up, curl your torso towards your hands", 45, 1, 1, "none",
  ["Gerader Bauch", "Rumpf", "Rectus abdominis", "Core"],
  "Auf den Rücken legen, Knie gebeugt, die Arme gestreckt senkrecht nach oben.|Den Oberkörper einrollen und mit den Fingerspitzen Richtung Decke greifen.|Langsam wieder absenken.",
  "Lie on your back, knees bent, arms straight up.|Curl your torso up and reach your fingertips toward the ceiling.|Lower slowly.",
  "Schultern bleiben weg von den Ohren.|Bewegung aus dem Bauch.", "Mit Schwung der Arme hochkommen.",
  "Shoulders stay away from your ears.|Movement from the abs.", "Using arm swing to come up.",
  "bauch", null, "crunch arme gestreckt");
G("crunch-hands-overhead", "Crunch mit Armen über dem Kopf", "Crunch (Hands Overhead)", "core", 3, 40, 0,
  "Arme über dem Kopf gestreckt, Oberkörper einrollen", "Arms extended overhead, curl your torso up", 45, 2, 2, "none",
  ["Gerader Bauch", "Rumpf", "Rectus abdominis", "Core"],
  "Auf den Rücken legen, Knie gebeugt, die Arme hinter dem Kopf gestreckt am Boden.|Die Arme bleiben in Verlängerung der Ohren, der Oberkörper rollt ein.|Kontrolliert wieder ablegen.",
  "Lie on your back, knees bent, arms extended on the floor behind your head.|Keep your arms in line with your ears while your torso curls up.|Lower under control.",
  "Rippen zur Hüfte, unterer Rücken am Boden.|Langsames Tempo.", "Die Arme nach vorn schwingen oder den Rücken ins Hohlkreuz ziehen.",
  "Ribs towards your hips, lower back on the floor.|Slow tempo.", "Swinging your arms forward or arching your back.",
  "bauch", null, "crunch arme über kopf");
G("cross-body-crunch", "Cross-Body-Crunch", "Cross-Body Crunch", "core", 3, 40, 0,
  "Ellbogen zum gegenüberliegenden Knie führen, im Wechsel", "Bring your elbow towards the opposite knee, alternating", 45, 1, 2, "none",
  ["Schräge Bauchmuskeln", "Gerader Bauch", "Obliques", "Rectus abdominis"],
  "Auf den Rücken legen, die Hände seitlich am Kopf, ein Bein angewinkelt anheben.|Den Oberkörper eindrehen und den Ellbogen zum gegenüberliegenden Knie führen.|Zurück und die Seite wechseln.",
  "Lie on your back, hands beside your head, one leg bent and raised.|Rotate your torso and bring your elbow towards the opposite knee.|Return and switch sides.",
  "Drehung aus dem Rumpf, Nacken lang.|Ruhiges Tempo.", "Mit den Händen am Kopf ziehen.",
  "Rotate from the torso, neck long.|Steady tempo.", "Pulling on your head with your hands.",
  "bauch", null, "gegenüber ellbogen knie schräg crunch drehcrunch");

/* ---------- Körpergewicht-Ergänzung (2026-10-29): Texte in eigenen Worten ---------- */
G("bear-plank-rockback-push-up", "Bear Plank Rockback Push-up", "Bear Plank Rockback Push-up", "arms", 3, 30, 0,
  "Aus dem Bärenstütz mit der Hüfte weit nach hinten, vorschieben, Liegestütz", "From the bear plank rock your hips far back, shift forward, push-up", 60, 3, 3, "none",
  ["Brust", "Trizeps, vordere Schulter, Rumpf, Oberschenkel vorn", "Chest", "Triceps, front delts, core, quads"],
  "Im Bärenstütz auf Händen und Füßen, die Knie schweben knapp über dem Boden. Weit mit der Hüfte nach hinten schaukeln (Rockback), die Arme bleiben lang.|Das Körpergewicht nach vorn über die Hände verlagern.|Den Körper absenken und wieder hochdrücken (Push-up), danach zurück in den Rockback.",
  "From the bear plank on hands and toes with your knees hovering just above the floor, rock your hips far back (rockback) with long arms.|Shift your body weight forward over your hands.|Lower your body and press back up (push-up), then rock back again.",
  "Knie bleiben knapp über dem Boden, Rücken lang, Nacken in Verlängerung.|Hände schulterbreit, Handgelenke gerade.", "Mit rundem Rücken nach hinten fallen lassen, die Hüfte weiter zurückschieben, als die Arme lang bleiben, oder die Knie absetzen. Erst Bärenstütz halten und normale Liegestütze beherrschen; bei Handgelenk- oder Schulterschmerz weglassen (oder auf den Fäusten arbeiten).",
  "Knees stay just above the floor, back long, neck in line.|Hands shoulder-width, wrists straight.", "Dropping back with a rounded back, pushing the hips back further than your arms stay long, or resting the knees. Master the bear hold and regular push-ups first; skip it with wrist or shoulder pain (or work on your fists).",
  "brust", null, "bär bärenstütz rockback liegestütz bear plank");
G("plank-toe-touch", "Plank Toe Touch", "Plank Toe Touch", "core", 3, 30, 0,
  "Hoher Stütz, die Hüfte hoch, die Hand tippt den Fuß der Gegenseite an", "High plank, hips up, the hand taps the opposite foot", 45, 2, 2, "none",
  ["Tiefe Bauchmuskeln, Schultern", "Schräge Bauchmuskeln, Gesäß, Oberschenkel hinten", "Deep core, shoulders", "Obliques, glutes, hamstrings"],
  "Im hohen Stütz mit den Händen unter den Schultern, Körper in einer Linie.|Die Hüfte nach oben und hinten Richtung Pike schieben und die rechte Hand zum linken Fuß führen.|Zurück in den Stütz, dann linke Hand zum rechten Fuß; abwechselnd wiederholen.",
  "In a high plank with your hands under your shoulders, body in one line.|Push your hips up and back towards a pike and bring your right hand to your left foot.|Return to the plank, then left hand to right foot; alternate.",
  "Das Becken schwankt wenig, Bauch und Gesäß fest.|Handgelenke gerade, Schultern aktiv wegdrücken, Beine möglichst gestreckt.", "Die Hüfte absinken lassen oder hektisch tippen. Das Standbein nicht einknicken lassen.",
  "Pelvis stays steady, abs and glutes tight.|Wrists straight, push the floor away actively, legs as straight as possible.", "Letting the hips sag or tapping in a rush. Do not let the support leg buckle.",
  "bauch", null, "plank toe touch pike zehen antippen stütz");

/* ---------- Unterarme & Griffkraft ---------- */
G("wrist-curl", "Handgelenkcurl", "Wrist Curl", "weight arms", 3, 40, 0,
  "Unterarme aufgelegt, die Hantel nur mit dem Handgelenk nach oben rollen", "Forearms supported, curl the weight up using only your wrists", 45, 1, 1, "gym db",
  ["Unterarme", "Unterarme (Griff)", "Forearms", "Forearms (grip)"],
  "Auf einer Bank sitzen, die Unterarme auf den Oberschenkeln, Handflächen nach oben, die Hantel hängt über dem Knie.|Das Handgelenk nach oben beugen und die Hantel anheben.|Langsam wieder absenken.",
  "Sit on a bench with your forearms on your thighs, palms up, the dumbbell hanging over your knees.|Curl your wrists up to lift the dumbbell.|Lower slowly.",
  "Unterarme bleiben aufgelegt.|Leichtes Gewicht, große Bewegung.", "Zu schwer wählen oder die Arme mitbewegen.",
  "Forearms stay supported.|Light weight, full range.", "Going too heavy or moving your arms.",
  "arme", null, "handgelenk curl unterarm");
G("reverse-curl", "Reverse Curl", "Reverse Curl", "weight arms", 3, 40, 0,
  "Stange im Obergriff beugen, Ellbogen am Körper", "Curl the bar with an overhand grip, elbows at your sides", 45, 1, 1, "gym",
  ["Unterarme", "Oberarmmuskel, Bizeps", "Forearms", "Brachialis, biceps"],
  "Die SZ-Stange im Obergriff schulterbreit greifen, aufrecht stehen.|Die Stange zur Schulter beugen, die Ellbogen bleiben am Körper.|Langsam wieder absenken.",
  "Grip the EZ bar overhand shoulder-width apart and stand tall.|Curl the bar towards your shoulders with your elbows at your sides.|Lower slowly.",
  "Handgelenke gerade, Rücken gerade.|Leichtes bis moderates Gewicht.", "Mit dem Oberkörper schwingen oder die Handgelenke abknicken.",
  "Wrists straight, back straight.|Light to moderate weight.", "Swinging with your torso or bending your wrists.",
  "arme", ["SZ-Stange, Obergriff", "EZ bar, overhand"], "umgekehrter curl obergriff sz");
G("wrist-pronation", "Unterarm drehen nach innen (Pronation)", "Wrist Pronation", "weight arms", 3, 40, 1,
  "Unterarm aufgelegt, Hantel am Ende nach innen drehen", "Forearm supported, rotate the weight inward", 45, 1, 1, "gym db",
  ["Unterarme (Griff)", "Unterarme", "Forearms (grip)", "Forearms"],
  "Den Unterarm auf dem Oberschenkel oder der Bank ablegen, eine Hantel am einen Ende halten.|Den Unterarm langsam so drehen, dass die Handfläche nach unten zeigt.|Zurückdrehen und nach dem Satz die Seite wechseln.",
  "Rest your forearm on your thigh or a bench and hold one end of a dumbbell.|Slowly rotate your forearm until your palm faces down.|Rotate back; switch sides after the set.",
  "Nur der Unterarm dreht, der Ellbogen bleibt.|Sehr leichtes Gewicht.", "Zu schwer wählen oder aus dem Ellbogen schwingen.",
  "Only the forearm rotates, the elbow stays.|Very light weight.", "Going too heavy or swinging from the elbow.",
  "arme", null, "pronation unterarm drehen");
G("wrist-supination", "Unterarm drehen nach außen (Supination)", "Wrist Supination", "weight arms", 3, 40, 1,
  "Unterarm aufgelegt, Hantel am Ende nach außen drehen", "Forearm supported, rotate the weight outward", 45, 1, 1, "gym db",
  ["Unterarme (Griff)", "Unterarme", "Forearms (grip)", "Forearms"],
  "Den Unterarm auf dem Oberschenkel oder der Bank ablegen, eine Hantel am einen Ende halten.|Den Unterarm langsam so drehen, dass die Handfläche nach oben zeigt.|Zurückdrehen und nach dem Satz die Seite wechseln.",
  "Rest your forearm on your thigh or a bench and hold one end of a dumbbell.|Slowly rotate your forearm until your palm faces up.|Rotate back; switch sides after the set.",
  "Nur der Unterarm dreht, der Ellbogen bleibt.|Sehr leichtes Gewicht.", "Zu schwer wählen oder aus dem Ellbogen schwingen.",
  "Only the forearm rotates, the elbow stays.|Very light weight.", "Going too heavy or swinging from the elbow.",
  "arme", null, "supination unterarm drehen");
G("plate-pinch-hold", "Scheibenklemme (Plate Pinch)", "Plate Pinch Hold", "weight arms", 3, 30, 0,
  "Zwei Scheiben mit den Fingern halten, glatte Seiten nach außen", "Pinch two plates between your fingers and thumb, smooth sides out", 60, 2, 2, "gym",
  ["Unterarme (Griff)", "Unterarme", "Forearms (grip)", "Forearms"],
  "Zwei kleine Scheiben mit den glatten Seiten nach außen aufeinanderlegen und mit Fingern und Daumen greifen.|Die Scheiben anheben und die Arme locker neben dem Körper hängen lassen.|Die Zeit halten, dann kontrolliert absetzen.",
  "Place two small plates together with the smooth sides out and pinch them between your fingers and thumb.|Lift them and let your arms hang loosely at your sides.|Hold for the time, then set them down under control.",
  "Aufrecht stehen, Schultern locker.|Griff fest, ohne die Luft anzuhalten.", "Scheiben fallen lassen oder die Schultern hochziehen.",
  "Stand tall, shoulders relaxed.|Firm grip without holding your breath.", "Dropping the plates or shrugging.",
  "arme", null, "greifkraft pinch scheiben halten");

/* ---------- Mobilität & Cardio ohne Gerät (Air) ---------- */
G("chin-to-chest-stretch", "Nacken beugen (Kinn zur Brust)", "Chin-to-Chest Stretch", "stretch", 1, 30, 0,
  "Kinn sanft zur Brust sinken lassen, Nacken lang", "Let your chin sink gently to your chest, neck long", 5, 1, 1, "none",
  ["Nackenstrecker", "Oberer Trapez", "Neck extensors", "Upper traps"],
  "Aufrecht sitzen oder stehen, die Schultern locker.|Das Kinn sanft zur Brust sinken lassen, die Hände liegen nur auf dem Hinterkopf, ohne zu ziehen.|Ruhig atmen und die Dehnung ohne Druck halten.",
  "Sit or stand tall with relaxed shoulders.|Let your chin sink gently to your chest; your hands rest on the back of your head without pulling.|Breathe calmly and hold the stretch without pressure.",
  "Schultern tief, Rücken lang.|Nur sanfte Dehnung.", "Mit den Händen nach unten drücken oder ruckartig ziehen. Bei Kribbeln in Armen oder Händen stoppen.",
  "Shoulders low, back long.|Gentle stretch only.", "Pushing down with your hands or jerking. Stop if you feel tingling in your arms or hands.",
  "air-stretch", null, "nacken kinn brust dehnen");
G("ceiling-look-stretch", "Blick sanft nach oben (Nacken)", "Ceiling Look Stretch", "stretch", 1, 20, 0,
  "Kinn leicht zurückziehen, dann den Blick sanft schräg nach oben richten", "Draw your chin back slightly, then gently look diagonally upward", 5, 1, 1, "none",
  ["Nacken (tiefe Halsbeuger)", "Nacken, Schultern", "Deep neck flexors", "Neck, shoulders"],
  "Aufrecht sitzen oder stehen, Schultern locker nach unten.|Das Kinn erst leicht zurückziehen, dann den Kopf nur sanft nach hinten neigen, der Blick geht schräg nach oben, der Mund bleibt geschlossen.|Ruhig atmen, höchstens 20 Sekunden, dann langsam zurück. Bei Schwindel, Kribbeln oder Taubheit in Armen oder Händen sofort stoppen.",
  "Sit or stand tall with relaxed shoulders.|Draw your chin back slightly first, then tilt your head back only gently, eyes diagonally upward, mouth closed.|Breathe calmly for 20 seconds at most, then return slowly. Stop immediately with dizziness, tingling or numbness in your arms or hands.",
  "Schultern tief, Kiefer locker.|Kleine, sanfte Bewegung.", "Den Kopf ruckartig nach hinten werfen, drehen oder länger halten. Bei bekannten Nackenproblemen weglassen.",
  "Shoulders low, jaw relaxed.|Small, gentle movement.", "Throwing your head back, turning it or holding too long. Skip it with known neck problems.",
  "air-stretch", null, "decke blick nacken überstrecken");
G("cross-jacks", "Cross Jacks", "Cross Jacks", "cardio", 4, 30, 0,
  "Wie Hampelmänner, aber Arme und Beine kreuzen sich in der Mitte", "Like jumping jacks, but arms and legs cross in the middle", 30, 1, 1, "none",
  ["Ausdauer", "Gesäß, Schultern, Waden", "Cardio", "Glutes, shoulders, calves"],
  "Aufrecht stehen, Füße zusammen, Arme seitlich.|Mit einem Sprung die Füße auseinander und die Arme seitlich nach oben öffnen.|Beim nächsten Sprung die Beine und die Arme vor dem Körper kreuzen, dann wieder öffnen.",
  "Stand tall with your feet together and arms at your sides.|Jump your feet apart and open your arms out and up.|On the next jump cross your legs and arms in front of your body, then open again.",
  "Weiche Landung, Knie locker.|Gleichmäßiger Rhythmus.", "Mit durchgestreckten Knien landen oder die Arme hängen lassen.",
  "Soft landing, soft knees.|Steady rhythm.", "Landing with locked knees or letting your arms drop.",
  "air-ausdauer", null, "kreuz hampelmann jumping jack variante");

/* ---------- Battle Rope (Fitnessstudio, Cardio & Ausdauer) ---------- */

/* ---------- Multipresse und Langhantel: Ergänzungen (2026-10-20) ---------- */
var SMITH_NOTE = [" An der Multipresse die Sicherungshaken passend einstellen; im Notfall die Handgelenke drehen, die Stange hakt ein.", " On the Smith machine set the safety stops to suit you; in an emergency rotate your wrists and the bar hooks in."];
G("smith-overhead-press", "Schulterdrücken an der Multipresse", "Smith Machine Overhead Press", "weight", 3, 40, 0,
  "Stange auf Schulterhöhe, gerade nach oben drücken", "Bar at shoulder height, press straight up", 75, 2, 2, "gym",
  ["Vordere Schulter", "Seitliche Schulter, Trizeps", "Front delts", "Side delts, triceps"],
  "Eine Bank steil oder aufrecht unter die Stange stellen, die Stange etwas über Schulterbreite greifen und aus der Sicherung drehen.|Die Stange gerade nach oben drücken, bis die Arme fast gestreckt sind.|Kontrolliert zu den Schultern oder zum Kinn absenken.",
  "Set a bench steep or upright under the bar, grip the bar a little wider than your shoulders and unhook it.|Press the bar straight up until your arms are almost straight.|Lower under control to your shoulders or chin.",
  "Bauch und Gesäß fest, Handgelenke gerade." + SMITH_NOTE[0] + "|Rippen unten halten.", "Ins Hohlkreuz fallen oder den Kopf nach vorn schieben.",
  "Core and glutes firm, wrists straight." + SMITH_NOTE[1] + "|Keep your ribs down.", "Arching your lower back or pushing your head forward.",
  "schulter", ["Multipresse-Stange, Obergriff", "Smith bar, overhand"], "multipresse smith schulterdrücken überkopf");
G("smith-incline-press", "Schrägbankdrücken an der Multipresse", "Smith Machine Incline Press", "weight", 3, 40, 0,
  "Bank auf etwa 30°, Stange zur oberen Brust", "Bench at about 30°, bar to your upper chest", 75, 2, 2, "gym",
  ["Obere Brust", "Vordere Schulter, Trizeps", "Upper chest", "Front delts, triceps"],
  "Die Bank auf etwa 30° stellen, so legen, dass die Stange über der oberen Brust läuft, und die Stange aus der Sicherung drehen.|Die Stange zur oberen Brust senken.|Zügig nach oben drücken, bis die Arme fast gestreckt sind.",
  "Set the bench to about 30°, lie so the bar runs over your upper chest and unhook it.|Lower the bar to your upper chest.|Press up at a steady pace until your arms are almost straight.",
  "Schulterblätter zusammen, Füße fest." + SMITH_NOTE[0] + "|Unterarme senkrecht.", "Die Schultern nach vorn rollen oder das Gesäß abheben.",
  "Shoulder blades together, feet planted." + SMITH_NOTE[1] + "|Forearms vertical.", "Rolling your shoulders forward or lifting your glutes.",
  "brust", ["Multipresse-Stange, Obergriff", "Smith bar, overhand"], "multipresse smith schrägbank schrägbankdrücken");
G("smith-bent-over-row", "Vorgebeugtes Rudern an der Multipresse", "Smith Machine Bent-Over Row", "weight back", 3, 40, 0,
  "Vorgebeugt, Stange zum Bauch ziehen", "Bent over, pull the bar to your belly", 75, 2, 2, "gym",
  ["Breiter Rückenmuskel", "Oberer Rücken, Bizeps, Rückenstrecker", "Lats", "Upper back, biceps, spinal erectors"],
  "Die Stange auf Kniehöhe einstellen, aus der Hüfte vorbeugen und die Stange schulterbreit greifen.|Die Stange zum Bauch ziehen, die Ellbogen eng am Körper.|Kontrolliert wieder strecken.",
  "Set the bar at knee height, hinge forward and grip the bar shoulder-width.|Pull the bar to your belly, elbows close to your body.|Extend again under control.",
  "Rücken neutral, Blick nach unten." + SMITH_NOTE[0] + "|Knie leicht gebeugt.", "Mit rundem Rücken ziehen oder den Oberkörper hochreißen.",
  "Neutral back, eyes down." + SMITH_NOTE[1] + "|Knees slightly bent.", "Pulling with a rounded back or jerking your torso up.",
  "ruecken", ["Multipresse-Stange, Obergriff", "Smith bar, overhand"], "multipresse smith rudern vorgebeugt");
G("smith-split-squat", "Ausfallschritt an der Multipresse", "Smith Machine Split Squat", "weight legs", 3, 40, 1,
  "Ein Fuß vorn, den Körper senkrecht absenken", "One foot forward, lower your body straight down", 75, 2, 2, "gym",
  ["Oberschenkel vorn", "Gesäß, Oberschenkel hinten", "Quads", "Glutes, hamstrings"],
  "Unter die Stange treten, sie auf den oberen Rücken legen, einen großen Schritt nach vorn und die Stange aus der Sicherung drehen.|Das hintere Knie senkrecht Richtung Boden absenken.|Über den vorderen Fuß aufrichten, nach dem Satz die Seite wechseln.",
  "Step under the bar, rest it on your upper back, take a long step forward and unhook it.|Lower the back knee straight towards the floor.|Drive up through the front foot, switch sides after the set.",
  "Oberkörper aufrecht, vorderes Knie über dem Fuß." + SMITH_NOTE[0] + "|Gewicht auf dem vorderen Fuß.", "Das Knie nach innen fallen lassen oder zu weit nach hinten stehen.",
  "Torso upright, front knee over your foot." + SMITH_NOTE[1] + "|Weight on the front foot.", "Letting your knee cave in or standing too far back.",
  "beine", ["Multipresse-Stange auf dem oberen Rücken", "Smith bar on your upper back"], "multipresse smith split squat ausfallschritt");
G("smith-hip-thrust", "Hip Thrust an der Multipresse", "Smith Machine Hip Thrust", "weight legs", 3, 40, 0,
  "Oberer Rücken an der Bank, Hüfte nach oben drücken", "Upper back on the bench, drive your hips up", 75, 2, 2, "gym",
  ["Gesäß", "Oberschenkel hinten, Rumpf", "Glutes", "Hamstrings, core"],
  "Mit dem oberen Rücken an eine Bank lehnen, die Stange mit Polster in die Hüftbeugen legen und aus der Sicherung drehen.|Die Hüfte nach oben drücken, bis Knie, Hüfte und Schultern eine Linie bilden.|Oben das Gesäß anspannen, kontrolliert senken.",
  "Rest your upper back on a bench, place the padded bar in your hip crease and unhook it.|Drive your hips up until knees, hips and shoulders form a line.|Squeeze your glutes at the top and lower under control.",
  "Kinn leicht zur Brust, Rippen unten." + SMITH_NOTE[0] + "|Füße hüftbreit, Schienbeine oben senkrecht.", "Ins Hohlkreuz drücken oder die Stange mit den Zehen wegschieben.",
  "Chin slightly tucked, ribs down." + SMITH_NOTE[1] + "|Feet hip-width, shins vertical at the top.", "Arching your lower back or pushing off your toes.",
  "beine", ["Multipresse-Stange mit Polster", "Smith bar with pad"], "multipresse smith hip thrust hüftheben gesäß");
G("smith-calf-raise", "Wadenheben an der Multipresse", "Smith Machine Calf Raise", "weight legs", 3, 40, 0,
  "Fußballen auf einer Stufe, hoch auf die Zehen", "Balls of your feet on a step, rise onto your toes", 60, 1, 1, "gym",
  ["Waden", "Fußmuskeln", "Calves", "Foot muscles"],
  "Eine Stufe unter die Stange legen, die Stange auf die Schultern legen und die Fußballen auf die Stufe stellen.|Die Fersen langsam absenken, bis die Waden gedehnt sind.|Auf die Zehenspitzen hochdrücken und oben kurz halten.",
  "Put a step under the bar, rest the bar on your shoulders and place the balls of your feet on the step.|Lower your heels slowly until your calves are stretched.|Rise onto your toes and hold briefly.",
  "Knie fast gestreckt, aufrecht bleiben." + SMITH_NOTE[0] + "|Voller Bewegungsweg.", "Mit Schwung wippen oder die Knie beugen.",
  "Knees almost straight, stay tall." + SMITH_NOTE[1] + "|Full range of motion.", "Bouncing or bending your knees.",
  "beine", ["Multipresse-Stange auf den Schultern", "Smith bar on your shoulders"], "multipresse smith waden wadenheben");
G("smith-shrug", "Schulterheben an der Multipresse", "Smith Machine Shrug", "weight", 3, 40, 0,
  "Stange vor den Oberschenkeln, Schultern gerade nach oben", "Bar in front of your thighs, lift your shoulders straight up", 60, 1, 1, "gym",
  ["Oberer Rücken", "Schultern, Unterarme (Griff)", "Upper back", "Shoulders, forearms (grip)"],
  "Aufrecht vor der Stange stehen und sie mit gestreckten Armen schulterbreit greifen.|Die Schultern gerade Richtung Ohren ziehen.|Oben kurz halten und langsam senken.",
  "Stand tall at the bar and grip it shoulder-width with straight arms.|Pull your shoulders straight up towards your ears.|Hold briefly at the top and lower slowly.",
  "Arme gestreckt, Nacken lang." + SMITH_NOTE[0] + "|Nicht mit den Schultern kreisen.", "Mit den Armen ziehen oder den Kopf nach vorn schieben.",
  "Arms straight, neck long." + SMITH_NOTE[1] + "|No shoulder circles.", "Pulling with your arms or pushing your head forward.",
  "schulter", ["Multipresse-Stange, Obergriff", "Smith bar, overhand"], "multipresse smith shrugs schulterheben nacken");
G("front-squat", "Frontkniebeuge", "Front Squat", "weight legs", 3, 40, 0,
  "Stange vorn auf den Schultern, Oberkörper aufrecht", "Bar in front on your shoulders, torso upright", 90, 3, 3, "gym",
  ["Oberschenkel vorn", "Gesäß, Rumpf, Oberer Rücken", "Quads", "Glutes, core, upper back"],
  "Die Stange vorn auf die Schultern legen, die Ellbogen zeigen nach vorn oben, die Finger halten sie nur.|Aufrecht in die Hocke gehen, bis die Oberschenkel mindestens waagerecht sind.|Über die ganze Fußsohle aufstehen, die Ellbogen bleiben oben.",
  "Rest the bar in front on your shoulders, elbows pointing forward and up, fingers only steady it.|Squat down upright until your thighs are at least horizontal.|Stand up through your whole foot, elbows stay high.",
  "Ellbogen hoch, Brust offen.|Sicherheitsständer oder Spotter nutzen.", "Die Ellbogen sinken lassen oder den Oberkörper nach vorn kippen.",
  "Elbows high, chest open.|Use safety stands or a spotter.", "Letting your elbows drop or tipping your torso forward.",
  "beine", ["Langhantel vorn auf den Schultern", "Barbell in front on your shoulders"], "frontkniebeuge front squat langhantel");
G("pause-squat", "Kniebeuge mit Pause", "Pause Squat", "weight legs", 3, 40, 0,
  "Unten zwei bis drei Sekunden halten", "Hold two to three seconds at the bottom", 90, 3, 3, "gym",
  ["Oberschenkel vorn", "Gesäß, Rumpf, Rückenstrecker", "Quads", "Glutes, core, spinal erectors"],
  "Die Stange auf den oberen Rücken legen und in die Kniebeuge gehen.|Unten ruhig zwei bis drei Sekunden halten, die Spannung bleibt.|Ohne Schwung aus den Fersen aufstehen.",
  "Rest the bar on your upper back and squat down.|Hold quietly for two to three seconds at the bottom, keeping tension.|Stand up from your heels without bouncing.",
  "Rücken gerade, Knie folgen den Zehen.|Sicherheitsständer nutzen.", "Unten entspannen oder aus der Pause wippen.",
  "Back straight, knees track your toes.|Use safety stands.", "Relaxing at the bottom or bouncing out of the pause.",
  "beine", ["Langhantel auf dem oberen Rücken", "Barbell on your upper back"], "pause squat kniebeuge pause halten langhantel");
G("zercher-squat", "Zercher-Kniebeuge", "Zercher Squat", "weight legs", 3, 40, 0,
  "Stange in den Ellenbeugen vor dem Bauch", "Bar in the crooks of your elbows at your belly", 90, 3, 3, "gym",
  ["Oberschenkel vorn", "Gesäß, Rumpf, Oberer Rücken", "Quads", "Glutes, core, upper back"],
  "Die Stange etwa auf Bauchhöhe in die Ellenbeugen legen und eng am Körper halten.|Aufrecht in die Hocke gehen, die Ellbogen zeigen nach vorn.|Aus den Fersen aufstehen, der Oberkörper bleibt aufrecht.",
  "Rest the bar in the crooks of your elbows at belly height and hold it close.|Squat down upright, elbows pointing forward.|Stand up from your heels, keeping your torso upright.",
  "Bauch fest, Brust offen.|Eine Stangenpolsterung nutzen, die Ellenbeugen können drücken.", "Den Rücken runden oder die Stange wegrollen lassen.",
  "Core firm, chest open.|Use a bar pad, the crooks of your elbows can get sore.", "Rounding your back or letting the bar roll away.",
  "beine", ["Langhantel in den Ellenbeugen", "Barbell in the crooks of your elbows"], "zercher kniebeuge langhantel ellenbeuge");
G("barbell-good-morning", "Good Morning mit Langhantel", "Barbell Good Morning", "weight back", 3, 40, 0,
  "Stange auf dem Rücken, Hüfte nach hinten, Rücken gerade", "Bar on your back, hips back, back straight", 75, 3, 3, "gym",
  ["Rückenstrecker", "Gesäß, Oberschenkel hinten", "Spinal erectors", "Glutes, hamstrings"],
  "Die Stange wie bei der Kniebeuge auf den oberen Rücken legen, Knie leicht gebeugt.|Die Hüfte weit nach hinten schieben und den Oberkörper mit geradem Rücken nach vorn neigen.|Die Hüfte nach vorn schieben und aufrichten.",
  "Rest the bar on your upper back as for a squat, knees slightly bent.|Push your hips far back and tip your torso forward with a straight back.|Drive your hips forward and stand up.",
  "Rücken neutral, Blick nach unten.|Mit leichtem Gewicht beginnen.", "Den Rücken runden oder tiefer gehen, als der Rücken gerade bleibt.",
  "Back neutral, eyes down.|Start light.", "Rounding your back or going lower than you can keep it straight.",
  "ruecken", ["Langhantel auf dem oberen Rücken", "Barbell on your upper back"], "good morning langhantel rückenstrecker hüftbeuge");
G("barbell-push-press", "Push Press mit Langhantel", "Barbell Push Press", "weight", 3, 30, 0,
  "Aus der Beugung mit Beinimpuls nach oben drücken", "Dip and drive with your legs, press overhead", 90, 3, 3, "gym",
  ["Vordere Schulter", "Seitliche Schulter, Trizeps, Gesäß", "Front delts", "Side delts, triceps, glutes"],
  "Die Stange vorn auf den Schultern halten, Füße schulterbreit.|Kurz in die Knie gehen und kräftig strecken, die Stange mit dem Schwung nach oben drücken.|Oben fest stehen und die Stange kontrolliert zu den Schultern zurückführen.",
  "Hold the bar in front on your shoulders, feet shoulder-width.|Dip slightly and drive up, pressing the bar overhead with that momentum.|Stand firm at the top and return the bar to your shoulders under control.",
  "Bauch fest, Rippen unten.|Stange nah am Gesicht vorbei.", "Ins Hohlkreuz fallen oder die Beinarbeit weglassen.",
  "Core firm, ribs down.|Bar close past your face.", "Arching your lower back or skipping the leg drive.",
  "schulter", ["Langhantel vorn auf den Schultern", "Barbell in front on your shoulders"], "push press langhantel drücken beinimpuls");
[["front-squat",8,5],["pause-squat",6,5],["zercher-squat",6,5],["barbell-good-morning",10,5],["barbell-push-press",6,2.5],["smith-overhead-press",10,2.5],["smith-incline-press",10,2.5],
 ["smith-bent-over-row",10,2.5],["smith-split-squat",10,2.5],["smith-hip-thrust",10,5],["smith-calf-raise",15,5],["smith-shrug",12,2.5]].forEach(function(z){ STUDIO_ZIEL[z[0]] = [3, z[1], z[2]]; });

/* Gruppen im Studio-Reiter und Bereichszuordnung: Studio-Übungen kommen in ihre Gruppe, „Cardio & Ausdauer“ ist neu (Battle Rope);
   Übungen ohne Gerät (air-…) laufen über die Hauptgruppen von Air. Battle Ropes und Haltegriffe zählen nach Zeit: Ziel in Sekunden statt Wiederholungen. */
(function(){
  /* Griffe an vorhandenen Kabelzug- und Stangenübungen */
  var GRIFF_ALT = {
    "lat-pulldown":["Latstange, weiter Obergriff","Lat bar, wide overhand grip"],
    "close-grip-pulldown":["V-Griff oder enger Griff","V-handle or close grip"],
    "cable-row":["V-Griff oder gerade Stange","V-handle or straight bar"],
    "face-pull":["Seilaufsatz","Rope attachment"],
    "straight-arm-pulldown":["Gerade Stange oder Seil","Straight bar or rope"],
    "cable-curl":["Gerade oder SZ-Stange, Untergriff","Straight or EZ bar, underhand"],
    "triceps-pushdown":["Gerade oder V-Stange im Obergriff, oder Seil","Straight or V-bar, overhand, or rope"],
    "overhead-cable-triceps":["Seilaufsatz","Rope attachment"],
    "cable-crossover":["Einzelgriffe (D-Griffe)","Single handles (D-handles)"],
    "cable-lateral-raise":["Einzelgriff (D-Griff) oder Manschette","Single handle (D-handle) or cuff"],
    "cable-pull-through":["Seilaufsatz","Rope attachment"],
    "cable-woodchop":["Einzelgriff (D-Griff) oder Seil","Single handle (D-handle) or rope"],
    "cable-crunch":["Seilaufsatz","Rope attachment"],
    "glute-kickback-cable":["Knöchelmanschette","Ankle cuff"],
    "pallof-press":["Einzelgriff (D-Griff)","Single handle (D-handle)"]
  };
  Object.keys(GRIFF_ALT).forEach(function(id){ if(!EX_GRIFF[id]) EX_GRIFF[id] = GRIFF_ALT[id]; });
  STUDIO_GRUPPEN.push({ id:"cardio", de:"Cardio & Ausdauer", en:"Cardio & endurance", ids:"" });
  GYM_NEU.forEach(function(x){
    if(x.gr === "air-stretch"){ EX_MAIN_ROWS.stretch += " " + x.id; return; }
    if(x.gr === "air-ausdauer"){ EX_MAIN_ROWS.ausdauer += " " + x.id; return; }
    for(var i = 0; i < STUDIO_GRUPPEN.length; i++) if(STUDIO_GRUPPEN[i].id === x.gr){ STUDIO_GRUPPEN[i].ids += (STUDIO_GRUPPEN[i].ids ? " " : "") + x.id; return; }
  });
  STUDIO_GRUPPEN.forEach(function(g){ if(g.id === "cardio") g.ids = g.ids.trim(); });
  /* Zuordnung nach der Prüfung (2026-10-29): Klimmzug an parallelen Griffen, Ringe und Kraftstation ohne Zusatzgewicht gehören zum Calisthenic-Park */
  EX_EQUIP["neutral-grip-pull-up"] = "bar"; EX_EQUIP["ring-push-up"] = "bar"; EX_EQUIP["captains-chair"] = "dip";
  ["plate-pinch-hold"].forEach(function(id){ STUDIO_ZIEL[id] = [4, 30, 0]; });
})();

/* ---------- Figuren der Studio-Erweiterung (2026-10-20) ----------
   Zwei Posen je Übung (Anfang/Ende), wo die Seitenansicht die Bewegung nicht zeigt eine zweite Ansicht (ILLU_VIEW2).
   Kabelzüge: Turm (gLinie) mit Rolle, Griffe halten die Hände. Battle Ropes: das Seil ist eine Welle von der Hand zum Anker;
   die Welle liegt in der festen Gerätelinie und wechselt zwischen den Posen (Gegenphase), die Hände wandern mit den Armen. */
(function(){
  var P = ILLU_POSES, V2 = ILLU_VIEW2;
  var STAND = [[50,70,50,89,58,89]];
  var FRONT = [[46,70,45,89,39,89],[54,70,55,89,61,89]];
  var SEAT  = [[43,64,40,82,36,86],[57,64,60,82,64,86]];     // sitzend, von vorn
  var KNIE  = [[50,87,30,88,24,89]];                           // kniend
  function fr(n, p, l, a, x){ return Q(null, n, p, l, a, x || "", true); }
  function knoten(x, y){ return gHand(x, y, '<circle class="ipf" cx="'+x+'" cy="'+y+'" r="2.6"/>'); }
  function tick(x, y){ return gHand(x, y, '<path class="ip" d="M'+x+' '+(y-5)+'v10"/>'); }
  function liegeBank(arm, x){ return stLiegen(arm, x); }

  /* ---------- Brust ---------- */
  function dec(arm, x){ return Q([13,72],[22,69],[50,59],[[67,63,70,84,74,86]],[arm], gLinie("M10 78L60 61M14 78V89M58 62V89")+'<circle class="ip" cx="69" cy="76" r="3"/>'+x); }
  P["decline-db-bench"] = [dec([27,55,28,43], gDB(28,41)), dec([20,77,27,66], gDB(27,64))];
  P["around-world-pullover"] = [liegeBank([28.6,55,28,43], gDB(28,41)), liegeBank([17,63,5,59], gDB(5,57))];

  var CF = gLinie("M10 0V89M90 0V89")+gRolle(14,25)+gRolle(86,25);
  P["cable-chest-fly"] = [fr([50,20],[50,52],FRONT,[[39,25,27,27],[61,25,73,27]], CF+gGriff(27,27)+gGriff(73,27)),
                          fr([50,20],[50,52],FRONT,[[41,31,48,37],[59,31,52,37]], CF+gGriff(48,37)+gGriff(52,37))];

  var TU_VORN = gLinie("M86 0V89")+gRolle(82,5);
  var TU_HOCH = gLinie("M14 0V89")+gRolle(18,5), TU_TIEF = gLinie("M14 20V89")+gRolle(18,84);   // Zug kommt von hinten
  P["standing-cable-fly"] = [Q(null,[52,21],[50,50],STAND,[[42,22,32,16],[43,23,33,17]], TU_HOCH+gGriff(32,16)+gGriff(33,17)),
                             Q(null,[52,21],[50,50],STAND,[[56,36,62,47],[54,37,60,48]], TU_HOCH+gGriff(62,47)+gGriff(60,48))];
  V2["standing-cable-fly"] = { typ:"front", p:[P["cable-crossover"][0], P["cable-crossover"][1]] };
  P["low-to-high-cable-fly"] = [Q(null,[52,21],[50,50],STAND,[[46,37,38,48],[45,38,37,49]], TU_TIEF+gGriff(38,48)+gGriff(37,49)),
                                Q(null,[52,21],[50,50],STAND,[[62,29,74,32],[61,30,73,33]], TU_TIEF+gGriff(74,32)+gGriff(73,33))];
  var CT = gLinie("M10 20V89M90 20V89")+gRolle(14,84)+gRolle(86,84);
  V2["low-to-high-cable-fly"] = { typ:"front", p:[fr([50,20],[50,52],FRONT,[[41,34,36,46],[59,34,64,46]], CT+gGriff(36,46)+gGriff(64,46)),
                                                  fr([50,20],[50,52],FRONT,[[40,30,48,38],[60,30,52,38]], CT+gGriff(48,38)+gGriff(52,38))] };

  var BANK_HOCH = gBench(62,90,72);
  P["incline-push-up"] = [Q(null,[74,42],[51,61],[[35,75,21,87,15,89]],[[72,58,73,71]], BANK_HOCH),
                          Q(null,[73,50],[48,66],[[33,78,20,87,14,89]],[[63,63,73,71]], BANK_HOCH)];
  /* Bear Plank Rockback Push-up: Rockback (Hüfte weit nach hinten, Arme lang) und unten im Liegestütz mit schwebenden Knien */
  P["bear-plank-rockback-push-up"] = [Q(null,[66,70],[22,78],[[34,87,22,88,18,89]],[[70,80,74,89]]),
                                      Q(null,[70,80],[46,76],[[46,86,30,88,26,89]],[[60,76,68,89]])];
  /* Plank Toe Touch: hoher Stütz, dann Hüfte hoch (Pike) und eine Hand zum Fuß der Gegenseite */
  P["plank-toe-touch"] = [P_PH, Q(null,[60,60],[40,40],[[34,64,28,87,25,89]],[[63,76,66,89],[50,62,40,78]])];
  var DEF_X = gLinie("M62 89V81H78V89");
  P["deficit-push-up"] = [Q(null,[71,56],[44,70],[[28,78,12,86,9,89]],[[68,69,70,81]], DEF_X),
                          Q(null,[72,84],[44,83],[[28,86,12,88,9,89]],[[60,77,70,81]], DEF_X)];
  var RING_X = gLinie("M71 0V76")+'<circle class="ip" cx="70" cy="81" r="4.4"/>';
  P["ring-push-up"] = [qWith(P["deficit-push-up"][0], { x:RING_X }), qWith(P["deficit-push-up"][1], { x:RING_X })];

  /* ---------- Rücken ---------- */
  var LATSITZ = gLinie("M36 66H64M50 66V89");
  function latbar(x, y, br){ return LATSITZ+gHand(x, y, '<path class="ip" d="M'+(x-br)+' '+y+'H'+(100-x+br)+' "/>'); }
  P["wide-grip-lat-pulldown"] = [fr([50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[38,24,30,10],[62,24,70,10]], latbar(30,10,18)),
                                 fr([50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[39,46,31,38],[61,46,69,38]], latbar(31,38,18))];
  P["reverse-grip-lat-pulldown"] = [fr([50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[43,24,42,11],[57,24,58,11]], latbar(42,11,16)),
                                    fr([50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[42,47,43,38],[58,47,57,38]], latbar(43,38,16))];
  P["rope-lat-pulldown"] = [fr([50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[43,24,45,11],[57,24,55,11]], LATSITZ+gLinie("M50 0V9M50 9L45 11M50 9L55 11")),
                            fr([50,34],[50,62],[[44,68,44,86],[56,68,56,86]],[[39,47,34,38],[61,47,66,38]], LATSITZ+gLinie("M50 0V28M50 28L34 38M50 28L66 38"))];

  var CRX = gSitz(22,48,74)+gLinie("M77 58V78")+gRolle(82,52);
  function crow(n, arms, grips){ return Q(null, n, [36,72], [[55,64,72,70,73,62]], arms, CRX+grips); }
  P["wide-grip-cable-row"] = [crow([42,45],[[53,49,64,50]], gGriff(64,50)), crow([40,44],[[30,40,40,46]], gGriff(40,46))];
  P["underhand-cable-row"] = [crow([42,45],[[53,52,64,56]], gGriff(64,56)), crow([40,44],[[30,56,41,58]], gGriff(41,58))];
  P["one-arm-cable-row"] = [crow([42,45],[[53,50,64,53],[44,58,52,64]], gGriff(64,53)), crow([40,44],[[28,50,40,55],[44,58,52,64]], gGriff(40,55))];
  P["alternating-cable-row"] = [crow([42,45],[[53,50,64,53],[30,50,41,55]], gGriff(64,53)+gGriff(41,55)),
                                crow([40,44],[[28,50,40,55],[53,51,63,54]], gGriff(40,55)+gGriff(63,54))];
  P["one-arm-high-cable-row"] = [Q(null,[50,20],[50,50],STAND,[[62,17,73,10],[52,34,53,47]], TU_VORN+gGriff(73,10)),
                                 Q(null,[50,20],[50,50],STAND,[[46,37,54,47],[52,34,53,47]], TU_VORN+gGriff(54,47))];

  /* Auf der Schrägbank liegend (Bauch nach unten), Hanteln hängen vor der Bank */
  function prone(arm, x){ return Q(null,[64,48],[42,70],[[28,81,14,88,8,89]],[arm], gLinie("M38 80L66 52M44 74V89M62 56V89")+x); }
  P["chest-supported-row"] = [prone([69,60,69,74], gDB(69,76)), prone([50,58,58,62], gDB(58,64))];
  P["spider-curl"] = [prone([69,60,69,74], gDB(69,76)), prone([69,60,67,50], gDB(67,48))];
  P["cambered-bar-row"] = [qWith(P_HG,{ x:gScheibe(61,70,6) }), qWith(P_HG,{ a:[[50,36,56,48]], x:gScheibe(56,52,6) })];

  var NG_R = '<circle class="ip" cx="42" cy="6" r="3.8"/><circle class="ip" cx="58" cy="6" r="3.8"/>';
  P["neutral-grip-pull-up"] = [Q(null,[50,30],[50,58],[[48,72,48,84],[52,72,52,84]],[[44,21,42,6],[56,21,58,6]], gBar(6,24,76)+NG_R, true),
                               Q([50,5],[50,14],[50,42],[[48,58,48,72],[52,58,52,72]],[[39,20,42,6],[61,20,58,6]], gBar(6,24,76)+NG_R, true)];
  V2["neutral-grip-pull-up"] = { typ:"side", haupt:"front", p:[qWith(PS_HANG,{ x:PS_BAR+gLinie("M42 14H58") }), qWith(PS_TOP,{ x:PS_BAR+gLinie("M42 14H58") })] };

  /* Meadows Row: Stange steckt in der Landmine, die Hand fasst das freie Ende */
  P["meadows-row"] = [Q(null,[64,40],[40,50],[[44,70,44,89,52,89]],[[62,54,61,66],[54,52,48,62]], gLinie("M104 88L61 66")+gScheibe(61,67,5)),
                      Q(null,[64,40],[40,50],[[44,70,44,89,52,89]],[[53,48,62,58],[54,52,48,62]], gLinie("M104 88L62 58")+gScheibe(62,59,5))];

  /* ---------- Schultern ---------- */
  P["seated-db-shoulder-press"] = [Q(null,[42,34],[42,63],ST_BEINE,[[47,49,48,37]], ST_SITZ+gDB(48,35)),
                                   Q(null,[42,34],[42,63],ST_BEINE,[[47,26,48,14]], ST_SITZ+gDB(48,12))];
  var SEATF = gLinie("M36 62H64M50 62V89");
  V2["seated-db-shoulder-press"] = { typ:"front", p:[fr([50,30],[50,60],SEAT,[[37,36,37,24],[63,36,63,24]], SEATF+gDB(37,23)+gDB(63,23)),
                                                     fr([50,30],[50,60],SEAT,[[41,26,42,14],[59,26,58,14]], SEATF+gDB(42,12)+gDB(58,12))] };
  P["arnold-press"] = [Q(null,[50,28],[50,56],[[50,72,50,89,58,89]],[[57,43,56,32]], gDB(56,30)),
                       Q(null,[50,28],[50,56],[[50,72,50,89,58,89]],[[53,21,53,9]], gDB(53,7))];
  V2["arnold-press"] = { typ:"front", p:[fr([50,28],[50,58],FRONT,[[45,43,48,33],[55,43,52,33]], gDB(48,31)+gDB(52,31)),
                                         fr([50,28],[50,58],FRONT,[[41,24,42,12],[59,24,58,12]], gDB(42,10)+gDB(58,10))] };
  var CS_T = gLinie("M10 30V89M90 30V89")+gRolle(14,84)+gRolle(86,84);
  P["cable-shoulder-press"] = [fr([50,28],[50,58],FRONT,[[38,36,38,24],[62,36,62,24]], CS_T+gGriff(38,24)+gGriff(62,24)),
                               fr([50,28],[50,58],FRONT,[[41,25,42,13],[59,25,58,13]], CS_T+gGriff(42,13)+gGriff(58,13))];
  var LEGS_LEAN = [[45,70,44,89,38,89],[53,70,54,89,60,89]];
  P["lean-away-lateral-raise"] = [fr([56,22],[49,52],LEGS_LEAN,[[60,38,61,50],[45,32,34,31]], gLinie("M34 4V89")+gDB(61,52)),
                                  fr([56,22],[49,52],LEGS_LEAN,[[67,28,79,26],[45,32,34,31]], gLinie("M34 4V89")+gDB(79,26))];
  P["db-front-raise"] = [qWith(P_ST,{ x:gDB(53,49) }), qWith(P_STF,{ x:gDB(76,25) })];
  P["front-raise-overhead"] = [qWith(P_ST,{ x:gDB(53,49) }), Q(null,[50,26],[50,56],[[50,73,50,89,58,89]],[[53,19,55,7]], gDB(55,5))];
  ILLU_SEQ["front-raise-overhead"] = { k:[P["front-raise-overhead"][0], qWith(P_STF,{ x:gDB(76,25) }), P["front-raise-overhead"][1], qWith(P_STF,{ x:gDB(76,25) })],
                                       t:[[.2,.45],[0,.32,"l"],[.2,.45],[0,.32,"l"]] };
  var HINTEN = [[42,70,38,89,32,89],[58,70,62,89,68,89]];
  P["db-rear-delt-fly"] = [fr([50,38],[50,52],HINTEN,[[46,51,45,63],[54,51,55,63]], gDB(45,65)+gDB(55,65)),
                           fr([50,38],[50,52],HINTEN,[[38,40,26,40],[62,40,74,40]], gDB(26,40)+gDB(74,40))];
  P["one-arm-rear-delt-fly"] = [fr([50,38],[50,52],HINTEN,[[54,51,55,63],[40,50,31,59]], gBench(10,38,62)+gDB(55,65)),
                                fr([50,38],[50,52],HINTEN,[[62,40,74,40],[40,50,31,59]], gBench(10,38,62)+gDB(74,40))];
  var SITZB = gLinie("M32 63H68M50 63V89");
  var SITZLEGS = [[43,66,40,82,36,86],[57,66,60,82,64,86]];
  P["seated-rear-delt-fly"] = [fr([50,44],[50,60],SITZLEGS,[[46,57,45,68],[54,57,55,68]], SITZB+gDB(45,70)+gDB(55,70)),
                               fr([50,44],[50,60],SITZLEGS,[[38,46,26,46],[62,46,74,46]], SITZB+gDB(26,46)+gDB(74,46))];
  P["upright-row"] = [Q(null,[50,20],[50,50],STAND,[[52,35,54,47]], gScheibe(55,48,5)), Q(null,[50,20],[50,50],STAND,[[60,19,56,30]], gScheibe(57,31,5))];
  var CU_A = fr([50,28],[50,58],FRONT,[[38,32,40,44],[62,32,60,44]], gDB(40,45)+gDB(60,45));
  var CU_M = fr([50,28],[50,58],FRONT,[[38,32,37,20],[62,32,63,20]], gDB(37,21)+gDB(63,21));
  var CU_B = fr([50,28],[50,58],FRONT,[[41,24,43,12],[59,24,57,12]], gDB(43,10)+gDB(57,10));
  P["cuban-press"] = [CU_A, CU_B];
  ILLU_SEQ["cuban-press"] = { k:[CU_A, CU_M, CU_B, CU_M], t:[[.15,.4],[.05,.35],[.15,.4],[.05,.35]] };

  /* ---------- Bizeps ---------- */
  var DBC_A = Q(null,[50,20],[50,50],STAND,[[52,32,53,44],[47,34,47,46]], gDB(53,46)+gDB(47,48));
  P["db-curl"] = [DBC_A, Q(null,[50,20],[50,50],STAND,[[52,32,60,23],[47,34,55,26]], gDB(61,21)+gDB(56,24))];
  V2["db-curl"] = { typ:"front", p:[fr([50,20],[50,52],FRONT,[[43,34,42,46],[57,34,58,46]], gDB(42,48)+gDB(58,48)),
                                    fr([50,20],[50,52],FRONT,[[43,34,42,23],[57,34,58,23]], gDB(42,21)+gDB(58,21))] };
  P["alternating-db-curl"] = [Q(null,[50,20],[50,50],STAND,[[52,32,60,23],[47,34,47,46]], gDB(61,21)+gDB(47,48)),
                              Q(null,[50,20],[50,50],STAND,[[52,32,53,44],[47,34,55,26]], gDB(53,46)+gDB(56,24))];
  V2["alternating-db-curl"] = { typ:"front", p:[fr([50,20],[50,52],FRONT,[[43,34,42,23],[57,34,58,46]], gDB(42,21)+gDB(58,48)),
                                                fr([50,20],[50,52],FRONT,[[43,34,42,46],[57,34,58,23]], gDB(42,48)+gDB(58,21))] };
  P["close-grip-ez-curl"] = [Q(null,[50,20],[50,50],STAND,[[52,32,53,44]], gScheibe(54,45,4)), Q(null,[50,20],[50,50],STAND,[[52,32,60,23]], gScheibe(61,22,4))];
  var HC_T = gLinie("M10 0V89M90 0V89")+gRolle(14,24)+gRolle(86,24);
  P["high-cable-curl"] = [fr([50,20],[50,52],FRONT,[[38,25,26,25],[62,25,74,25]], HC_T+gGriff(26,25)+gGriff(74,25)),
                          fr([50,20],[50,52],FRONT,[[38,25,40,13],[62,25,60,13]], HC_T+gGriff(40,13)+gGriff(60,13))];
  var CC_T = gLinie("M74 40V89")+gRolle(70,84);
  P["one-arm-cable-curl"] = [Q(null,[50,20],[50,50],STAND,[[52,32,54,44],[47,34,47,46]], CC_T+gGriff(54,44)),
                             Q(null,[50,20],[50,50],STAND,[[52,32,60,23],[47,34,47,46]], CC_T+gGriff(60,23))];
  P["cross-body-hammer-curl"] = [fr([50,20],[50,52],FRONT,[[43,34,42,46],[57,34,58,46]], tick(42,46)),
                                 fr([50,20],[50,52],FRONT,[[43,34,54,29],[57,34,58,46]], tick(54,29))];
  var PC_SITZ = gSitz(30,52,66)+gLinie("M47 41L61 50");
  P["preacher-curl"] = [Q(null,[46,37],[40,64],[[58,67,58,86,65,88]],[[56,46,66,55]], PC_SITZ+gScheibe(66,56,3.6)),
                        Q(null,[46,37],[40,64],[[58,67,58,86,65,88]],[[56,46,53,34]], PC_SITZ+gScheibe(53,35,3.6))];
  P["hammer-preacher-curl"] = [Q(null,[46,37],[40,64],[[58,67,58,86,65,88]],[[56,46,66,55]], PC_SITZ+tick(66,55)),
                               Q(null,[46,37],[40,64],[[58,67,58,86,65,88]],[[56,46,53,34]], PC_SITZ+tick(53,34))];
  P["incline-db-curl"] = [Q(null,[24,48],[46,70],[[60,66,64,86,71,88]],[[27,63,27,75]], ST_SCHRAEG+gDB(27,77)),
                          Q(null,[24,48],[46,70],[[60,66,64,86,71,88]],[[28,63,35,54]], ST_SCHRAEG+gDB(36,52))];
  var CK_SITZ = gLinie("M26 67H60M43 67V89"), CK_LEG = [[62,62,60,84,67,88]];
  P["concentration-curl"] = [Q(null,[64,46],[42,64],CK_LEG,[[62,60,64,72],[52,56,58,62]], CK_SITZ+gDB(64,74)),
                             Q(null,[64,46],[42,64],CK_LEG,[[62,60,67,50],[52,56,58,62]], CK_SITZ+gDB(68,48))];
  P["standing-concentration-curl"] = [qWith(P_HG,{ a:[[62,54,61,66],[52,54,47,64]], x:gDB(61,68) }),
                                      qWith(P_HG,{ a:[[62,54,67,43],[52,54,47,64]], x:gDB(68,41) })];
  P["zottman-curl"] = [P["db-curl"][0], P["db-curl"][1]];
  V2["zottman-curl"] = V2["db-curl"];
  ILLU_SEQ["zottman-curl"] = { k:[P["db-curl"][0], P["db-curl"][1]], t:[[.2,.45],[.3,1.0]] };   // hoch zügig, langsam senken

  /* ---------- Trizeps ---------- */
  var PD_T = gLinie("M72 0V89")+gRolle(68,4);
  P["rope-triceps-pushdown"] = [Q(null,[50,20],[50,50],STAND,[[52,32,62,31]], PD_T+gLinie("M68 6L62 31")+knoten(62,31)),
                                Q(null,[50,20],[50,50],STAND,[[52,32,54,44]], PD_T+gLinie("M68 6L55 44")+knoten(54,44))];
  P["one-arm-cable-triceps-extension"] = [Q(null,[50,20],[50,50],STAND,[[52,32,62,31],[47,34,46,46]], PD_T+gGriff(62,31)),
                                          Q(null,[50,20],[50,50],STAND,[[52,32,54,44],[47,34,46,46]], PD_T+gGriff(54,44))];
  var KT = gLinie("M10 0V89")+gRolle(14,24);
  P["kneeling-cable-triceps-extension"] = [Q(null,[54,32],[48,62],KNIE,[[56,25,46,30]], KT+gLinie("M14 24L46 30")+knoten(46,30)),
                                           Q(null,[54,32],[48,62],KNIE,[[56,25,57,13]], KT+gLinie("M14 24L57 13")+knoten(57,13))];
  P["incline-cable-triceps-extension"] = [Q(null,[24,48],[46,70],[[60,66,64,86,71,88]],[[28,40,18,34]], ST_SCHRAEG+gLinie("M5 40V89")+gRolle(9,84)+knoten(18,34)),
                                          Q(null,[24,48],[46,70],[[60,66,64,86,71,88]],[[30,40,35,29]], ST_SCHRAEG+gLinie("M5 40V89")+gRolle(9,84)+knoten(35,29))];
  var LT = gLinie("M4 44V89")+gRolle(8,60);
  P["lying-cable-triceps-extension"] = [stLiegen([27,55,28,43], LT+gLinie("M10 60L28 43")+gQuer(28,43,3)),
                                        stLiegen([27,55,17,60], LT+gLinie("M10 60L17 60")+gQuer(17,60,3))];
  P["close-grip-db-press"] = [stLiegen([29,56,30,44], gDB(30,42)), stLiegen([27,76,30,65], gDB(30,63))];
  P["db-skull-crusher"] = [stLiegen([27,55,28,43], gDB(28,41)), stLiegen([27,55,19,61], gDB(19,59))];
  P["single-arm-skull-crusher"] = [qWith(stLiegen([27,55,28,43], gDB(28,41)), { a:[[27,55,28,43],[24,58,28,50]] }),
                                   qWith(stLiegen([27,55,19,61], gDB(19,59)), { a:[[27,55,19,61],[24,58,28,50]] })];
  P["supinated-triceps-extension"] = [Q(null,[50,20],[50,50],STAND,[[52,32,62,31]], PD_T+gQuer(62,31,4)), Q(null,[50,20],[50,50],STAND,[[52,32,54,44]], PD_T+gQuer(54,44,4))];
  P["ez-jm-press"] = [stLiegen([29,56,30,44], gScheibe(30,42,3)), stLiegen([38,60,28,57], gScheibe(28,56,3))];
  /* Tate Press: nur die Ansicht von vorn (siehe unten) */
  /* Tate Press von vorn (Blick vom Kopfende): Ellbogen zeigen nach oben und außen, die Hanteln gehen von der Brust nach oben über die Ellbogen */
  var TP_BANK = gLinie("M34 68H66M38 68V87M62 68V87");   // Bank von vorn (Blick von den Füßen): Polster und zwei Beine, die Füße stehen links und rechts daneben
  function tpVorn(a, d){ return Q([50,54],[50,60],[50,66],[[33,76,30,87,26,89],[67,76,70,87,74,89]], a, TP_BANK+gDB(d[0],d[1])+gDB(d[2],d[3]), true); }
  /* oben: beide Arme gestreckt nach oben; unten: die Ellbogen zeigen zur Seite, die Hanteln sinken neben den Kopf (der abgewinkelte Arm ist nur von vorn zu sehen) */
  P["tate-press"] = [tpVorn([[43,40,38,20],[57,40,62,20]], [38,18,62,18]), tpVorn([[27,58,35,46],[73,58,65,46]], [35,44,65,44])];   // nur diese Ansicht: von der Seite wäre der abgewinkelte Arm irreführend
  /* Zweite Ansichten nach der Prüfung (2026-10-29): Prone T-/Y-Raise von oben (die Form T bzw. Y ist von der Seite nicht zu sehen), Face Pull und Upright Row von vorn (Ellbogen hoch und nach außen) */
  function tyOben(a){ return Q(null,[50,32],[50,64],[[48,79,47,94],[52,79,53,94]], a, "", true); }
  V2["prone-t-raise"] = { typ:"top", p:[tyOben([[62,34,76,35],[38,34,24,35]]), tyOben([[61,34,73,34],[39,34,27,34]])] };
  V2["prone-y-raise"] = { typ:"top", p:[tyOben([[60,28,68,14],[40,28,32,14]]), tyOben([[59,28,65,17],[41,28,35,17]])] };
  V2["face-pull"] = { typ:"front", p:[fr([50,20],[50,52],FRONT,[[40,44,43,52],[60,44,57,52]], gLinie("M43 52H57")+gGriff(43,52)+gGriff(57,52)),
                                       fr([50,20],[50,52],FRONT,[[33,28,41,21],[67,28,59,21]], gLinie("M41 21H59")+gGriff(41,21)+gGriff(59,21))] };
  V2["upright-row"] = { typ:"front", p:[fr([50,20],[50,52],FRONT,[[41,44,41,58],[59,44,59,58]], gLinie("M34 58H66M34 54V62M66 54V62")+gGriff(41,58)+gGriff(59,58)),
                                         fr([50,20],[50,52],FRONT,[[33,34,42,42],[67,34,58,42]], gLinie("M34 42H66M34 38V46M66 38V46")+gGriff(42,42)+gGriff(58,42))] };
  /* Weitere Figuren nach der Prüfung (2026-10-29): Seil am Kabelzug mit Rolle, Zugseil und zwei Knoten; Ansichten von vorn bzw. oben, wo die Seite die Bewegung nicht zeigt */
  function kabelSeil(px, py, hx, hy){ return gRolle(px, py)+gLinie("M"+px+" "+py+"L"+hx+" "+hy)+knoten(hx-3, hy-2)+knoten(hx+3, hy+2); }   // Rolle (px,py) -> Hand (hx,hy), Knoten am Griff
  P["cable-woodchop"] = [fr([50,22],[50,52],FRONT,[[38,32,31,18],[40,34,33,20]], gLinie("M12 0V89")+kabelSeil(14,4,32,17)),
                         fr([50,22],[50,52],FRONT,[[52,46,61,58],[54,44,63,56]], gLinie("M12 0V89")+kabelSeil(14,4,62,57))];
  /* Rotary Torso: aufrecht sitzen, beide Hände am Polster vor der Brust (keine gekreuzten Arme), der Oberkörper dreht sich aus dem Rumpf */
  var RT_STUETZE = gLinie("M36 62H64M50 62V89");
  P["rotary-torso"] = [Q(null,[50,30],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[44,42,50,46],[56,42,50,46]], RT_STUETZE+gQuer(50,46,6), true),
                       Q(null,[43,31],[50,60],[[43,64,40,82,36,86],[57,64,60,82,64,86]],[[38,42,44,46],[50,42,44,46]], RT_STUETZE+gQuer(44,46,6), true)];
  /* Pallof Press von vorn: das Kabel zieht von der Seite, die Hände drücken vor der Brust gerade nach vorn und halten gegen die Drehung */
  var PL_K = gLinie("M10 0V89")+gRolle(14,40);
  V2["pallof-press"] = { typ:"front", p:[fr([50,20],[50,52],FRONT,[[41,40,47,38],[59,40,53,38]], PL_K+gLinie("M14 40L50 38")+gGriff(50,38)), fr([50,20],[50,52],FRONT,[[48,36,50,34],[52,36,50,34]], PL_K+gLinie("M14 40L50 34")+gGriff(50,34))] };
  /* Cable Crunch: Zugseil von der oberen Rolle zu den Händen am Kopf */
  P["cable-crunch"] = [Q(null,[52,34],[49,62],[[50,87,30,88,24,89]],[[62,40,56,30]], gLinie("M90 0V89")+kabelSeil(86,6,56,30)),
                       Q(null,[64,70],[48,62],[[50,87,30,88,24,89]],[[64,56,58,66]], gLinie("M90 0V89")+kabelSeil(86,6,58,66))];
  V2["around-world-pullover"] = V2["pullover"];
  V2["hammer-curl"] = V2["db-curl"];
  V2["cross-body-hammer-curl"] = V2["db-curl"];
  /* Side Jackknives von oben: auf der Seite liegend, Oberkörper und Beine biegen sich seitlich aufeinander zu (Banane); der Arm bleibt gestreckt */
  function sjOben(n, l, a, torso){ return Q(null,n,[50,62],l,a,'<path d="'+torso+'" style="stroke-width:14"/>',true); }
  V2["side-jackknives"] = { typ:"top", p:[sjOben([22,62],[[68,62,86,62]],[[14,62,6,62]],"M28 62L48 62"), sjOben([24,50],[[66,52,82,42]],[[15,47,6,44]],"M29 52L48 61")] };
  /* Fehlende zweite Ansichten (2026-10-30): Muschel mit Band von oben (Seitenlage, dicker Körper, Arme und Beine gestreckt und weiß); Rudern mit weitem Griff von vorn. Swimmers und Plank Shoulder Taps von oben sahen aus wie stehende Personen und blieben deshalb weg. */
  var DICK = function(d){ return '<path d="'+d+'" style="stroke-width:14"/>'; };
  V2["band-clamshell"] = { typ:"top", p:[Q(null,[22,56],[46,56],[[62,64,50,74],[62,64,50,74]],[[12,56,4,56],[12,58,4,58]], DICK("M28 56L44 56")+gLinie("M60 64H62"), true),
                                          Q(null,[22,56],[46,56],[[64,52,50,70],[62,64,50,74]],[[12,56,4,56],[12,58,4,58]], DICK("M28 56L44 56")+gLinie("M62 52L62 64"), true)] };
  V2["wide-grip-cable-row"] = { typ:"front", p:[fr([50,30],[50,60],SEAT,[[38,50,30,62],[62,50,70,62]], gLinie("M26 62H74")+gGriff(30,62)+gGriff(70,62)), fr([50,30],[50,60],SEAT,[[28,52,34,50],[72,52,66,50]], gLinie("M28 50H72")+gGriff(34,50)+gGriff(66,50))] };
  /* Kurzhantel-Bankdrücken: zweite Ansicht von vorn (Blick vom Kopfende) - Ellbogen etwa 45° zum Körper, Hanteln über der Brust bzw. an der Brust */
  V2["db-bench-press"] = { typ:"front", p:[tpVorn([[44,40,42,20],[56,40,58,20]], [42,18,58,18]), tpVorn([[33,57,44,56],[67,57,56,56]], [44,54,56,54])] };

  /* ---------- Beine, Core, Unterarme ---------- */
  var BS_B = gBench(24,46,67);
  P["db-bench-squat"] = [qWith(P_ST,{ a:[[56,36,57,29]], x:gDB(57,28)+BS_B }), qWith(P_SQ,{ a:[[54,50,56,42]], x:gDB(56,40)+BS_B })];
  var DC_MID = qWith(P_ST,{ x:gDB(53,49) });
  P["db-clean"] = [P["db-deadlift"][0], qWith(P_ST,{ a:[[57,34,56,24]], x:gDB(56,22) })];
  ILLU_SEQ["db-clean"] = { k:[P["db-clean"][0], DC_MID, P["db-clean"][1], DC_MID], t:[[.2,.4],[0,.2,"l"],[.2,.4],[0,.25,"l"]] };
  P["stiff-leg-deadlift"] = [qWith(P_ST,{ x:gScheibe(53,50,7) }), Q(null,[66,46],[38,50],[[42,70,46,89,54,89]],[[66,58,66,70]], gScheibe(66,72,7))];

  var SCT = gLinie("M90 0V89")+gRolle(86,6);
  P["standing-cable-crunch"] = [Q(null,[50,20],[50,50],STAND,[[61,28,58,17]], SCT+gGriff(58,17)),
                                Q(null,[67,38],[50,52],[[51,71,50,89,58,89]],[[70,50,74,40]], SCT+gGriff(74,40))];
  var LIFT = gLinie("M12 20V89")+gRolle(16,84);
  P["cable-lift"] = [fr([50,20],[50,52],FRONT,[[44,36,39,47],[46,38,41,48]], LIFT+gGriff(39,47)),
                     fr([50,20],[50,52],FRONT,[[60,16,68,8],[58,18,66,10]], LIFT+gGriff(68,8))];
  var TW = gLinie("M10 0V89")+gRolle(14,26);
  P["cable-twist"] = [fr([50,20],[50,52],FRONT,[[40,26,29,26],[41,28,30,28]], TW+gGriff(29,27)),
                      fr([50,20],[50,52],FRONT,[[60,26,71,26],[59,28,70,28]], TW+gGriff(71,27))];
  var RC_T = gLinie("M5 52V89")+gRolle(8,70);
  P["cable-reverse-crunch"] = [qWith(P["reverse-crunch"][0], { x:RC_T+gLinie("M10 70L68 66")+gPolster(68,66) }),
                               qWith(P["reverse-crunch"][1], { x:RC_T+gLinie("M10 70L56 56")+gPolster(56,56) })];
  P["judo-flip"] = [Q([14,83],[24,84],[50,84],[[50,63,50,44,46,44]],[[34,86,45,87]]),
                    Q([13,84],[22,84],[36,58],[[21,47,6,37,2,35]],[[34,86,45,87]])];

  var KL = [[60,70,70,89,78,89]];
  var CR_A = Q([14,83],[24,84],[46,86],KL,[[23,73,14,78]]);
  var CR_B = Q([27,63],[26,71],[46,86],KL,[[20,66,22,61]]);
  P["crunch"] = [CR_A, CR_B];
  P["crunch-arms-straight"] = [qWith(CR_A,{ a:[[27,72,28,60]] }), qWith(CR_B,{ a:[[30,61,31,49]] })];
  P["crunch-hands-overhead"] = [qWith(CR_A,{ a:[[16,79,4,76]] }), qWith(CR_B,{ a:[[21,65,13,58]] })];
  P["cross-body-crunch"] = [Q([14,83],[24,84],[46,86],[[60,70,70,89,78,89],[62,72,72,89,80,89]],[[23,73,14,78]]),
                            Q([27,63],[26,71],[46,86],[[52,68,66,74,72,72],[60,70,70,89,78,89]],[[40,68,32,63]])];
  var WHEEL_X = function(x, y){ return gHand(x, y, '<circle class="ip" cx="'+x+'" cy="'+(y+3)+'" r="5"/>'); };

  var WS = gLinie("M26 67H60M43 67V89");
  var WL = [[62,62,60,84,67,88]];
  P["wrist-curl"] = [Q(null,[58,44],[42,64],WL,[[54,58,66,62]], WS+gDB(66,64)), Q(null,[58,44],[42,64],WL,[[54,58,65,54]], WS+gDB(65,52))];
  P["reverse-curl"] = [Q(null,[50,20],[50,50],STAND,[[52,32,53,44]], gScheibe(54,45,5)), Q(null,[50,20],[50,50],STAND,[[52,32,60,23]], gScheibe(61,22,5))];
  function dbDreh(cx, cy, deg){
    var r = deg*Math.PI/180, ux = Math.sin(r), uy = -Math.cos(r), vx = -uy, vy = ux;
    function f(v){ return v.toFixed(1); }
    var d = "M"+f(cx-ux*6)+" "+f(cy-uy*6)+"L"+f(cx+ux*6)+" "+f(cy+uy*6);
    [-1, 1].forEach(function(s){
      var ex = cx+ux*6*s, ey = cy+uy*6*s;
      d += "M"+f(ex-vx*4)+" "+f(ey-vy*4)+"L"+f(ex+vx*4)+" "+f(ey+vy*4);
    });
    return '<path class="ip" d="'+d+'"/>';
  }
  var WR_ARM = [[54,58,66,60]];
  P["wrist-pronation"] = [Q(null,[58,44],[42,64],WL,WR_ARM, WS+dbDreh(66,58,-55)), Q(null,[58,44],[42,64],WL,WR_ARM, WS+dbDreh(66,58,55))];
  P["wrist-supination"] = [Q(null,[58,44],[42,64],WL,WR_ARM, WS+dbDreh(66,58,55)), Q(null,[58,44],[42,64],WL,WR_ARM, WS+dbDreh(66,58,-55))];
  var WRR = '<circle class="ip" cx="78" cy="25" r="2.8"/>';
  P["plate-pinch-hold"] = [Q(null,[50,20],[50,50],STAND,[[52,34,53,47]], gHand(53,47,'<circle class="ip" cx="53" cy="54" r="6.5"/><circle class="ipf" cx="53" cy="54" r="1.8"/>')), null];

  /* ---------- Dehnen / Cardio ---------- */
  P["chin-to-chest-stretch"] = [Q([58,26],[50,20],[50,50],STAND,[[52,34,53,47]]), null];
  P["ceiling-look-stretch"] = [Q([45,13],[50,20],[50,50],STAND,[[52,34,53,47]]), null];
  var CJ_AUF = qScale(qWith(P_F, { l:[[42,70,33,89,27,89],[58,70,67,89,73,89]], a:[[40,16,33,5],[60,16,67,5]] }), .86);
  var CJ_ZU  = qScale(fr([50,20],[50,52],[[48,70,52,89,58,89],[52,70,48,89,42,89]],[[43,33,54,41],[57,33,46,41]]), .86);
  P["cross-jacks"] = [CJ_AUF, CJ_ZU];

  /* ---------- Battle Ropes ---------- */
  function seil(x0, y0, x1, y1, amp, cyc){
    var dx = x1-x0, dy = y1-y0, L = Math.sqrt(dx*dx+dy*dy) || 1, nx = -dy/L, ny = dx/L, d = "M"+x0+" "+y0;
    for(var i = 1; i <= 18; i++){
      var t = i/18, o = amp*(1-.5*t)*Math.sin(2*Math.PI*cyc*t);
      d += "L"+(x0+dx*t+nx*o).toFixed(1)+" "+(y0+dy*t+ny*o).toFixed(1);
    }
    return '<path class="ip" d="'+d+'"/>';
  }
  function ende(q, i){ var a = q.a[i]; return [a[a.length-2], a[a.length-1]]; }
  function anker(ax, ay){ return (ay+8 < 89 ? gLinie("M"+ax+" "+(ay+8)+"V89") : "")+'<circle class="ip" cx="'+ax+'" cy="'+ay+'" r="2.6"/>'; }
  /* amps: Wellenhöhe je Arm (Vorzeichen = erst nach oben/unten) */
  function brSeile(q, ax, ay, amps, cyc){
    var s = anker(ax, ay);
    amps.forEach(function(amp, i){ var h = ende(q, i); s += seil(h[0], h[1], ax, ay, amp, cyc || 1.5); });
    return qWith(q, { x:s });
  }
  var BR_L  = [[54,70,50,89,58,89]];           // leichte Hocke
  var BR_TL = [[57,62,52,89,60,89]];           // tiefe Hocke
  var UP = [56,30,67,33], DN = [51,43,58,54];
  function br(n, p, l, a){ return Q(null, n, p, l, a); }
  var AW_A = br([46,28],[40,58],BR_L,[UP,DN]), AW_B = br([46,28],[40,58],BR_L,[DN,UP]);
  var UP2 = [55,37,66,38], DN2 = [51,48,58,59];
  var DW_A = br([46,28],[40,58],BR_L,[UP,[55,31,66,35]]), DW_B = br([46,28],[40,58],BR_L,[DN,[52,44,59,55]]);
  var SL_A = br([50,26],[50,56],[[50,73,50,89,58,89]],[[53,19,55,7],[52,20,54,8]]);
  var SL_B = br([46,38],[36,64],BR_TL,[[53,51,60,62],[52,52,59,63]]);
  var SQ_A = br([46,28],[40,58],BR_L,[UP,DN]), SQ_B = br([46,36],[36,64],BR_TL,[DN2,UP2]);
  var SN_ARM = [[52,45,59,56],[51,46,58,57]];
  var SN_Q = br([46,28],[40,58],BR_L,SN_ARM);

  var FR_B = [[37,70,31,89,25,89],[63,70,69,89,75,89]];
  function frb(a){ return fr([50,26],[50,56],FR_B,a); }
  function brFront(q, amps){ return brSeile(q, 50, 86, amps, 1); }

  function pull(F, R, tausch){
    var q = br([46,28],[40,58],BR_L,tausch ? [R, F] : [F, R]);
    var f = tausch ? ende(q, 1) : ende(q, 0), r = tausch ? ende(q, 0) : ende(q, 1);
    var s = anker(93,64) + seil(f[0], f[1], 93, 64, 2.5, 1.5) + gLinie("M"+f[0]+" "+f[1]+"L"+r[0]+" "+r[1]) + gLinie("M"+r[0]+" "+r[1]+"L"+(r[0]-1)+" "+(r[1]+16));
    return qWith(q, { x:s });
  }

  /* ---------- Multipresse und Langhantel (Ergänzungen) ---------- */
  var SM_R = gLinie("M24 0V89M72 0V89");
  P["smith-overhead-press"] = [Q(null,[50,28],[50,56],[[50,72,50,89,58,89]],[[58,40,57,30]], SM_R+gScheibe(57,28,6)),
                               Q(null,[50,28],[50,56],[[50,72,50,89,58,89]],[[58,17,64,7]], SM_R+gScheibe(64,6,6))];
  P["smith-incline-press"] = [qWith(P["incline-db-press"][0], { x:ST_SCHRAEG+gLinie("M37 4V66")+gScheibe(34,49,6) }),
                              qWith(P["incline-db-press"][1], { x:ST_SCHRAEG+gLinie("M37 4V66")+gScheibe(40,26,6) })];
  var SM_RR = gLinie("M72 30V89");
  P["smith-bent-over-row"] = [qWith(P_HG,{ x:SM_RR+gScheibe(61,70,7) }), qWith(P_HG,{ a:[[50,36,56,48]], x:SM_RR+gScheibe(56,52,7) })];
  P["smith-split-squat"] = [qWith(P_ST,{ a:[[44,30,48,21]], x:SM_R+gScheibe(47,20,7) }),
                            qWith(P_L1,{ a:[[43,40,47,32]], x:SM_R+gScheibe(47,31,7) })];
  P["smith-hip-thrust"] = [qWith(P["hip-thrust"][0], { x:gBench(6,32,66)+gLinie("M42 30V89")+gScheibe(46,74,6) }),
                           qWith(P["hip-thrust"][1], { x:gBench(6,32,66)+gLinie("M42 30V89")+gScheibe(50,54,6) })];
  var STUFE = gLinie("M44 89V84H66V89");
  P["smith-calf-raise"] = [Q(null,[50,22],[50,50],[[50,68,50,84,58,84]],[[44,32,48,23]], SM_R+STUFE+gScheibe(47,22,7)),
                           Q(null,[50,16],[50,44],[[50,62,50,77,57,84]],[[44,26,48,17]], SM_R+STUFE+gScheibe(47,16,7))];
  P["smith-shrug"] = [Q(null,[50,20],[50,50],STAND,[[52,33,53,46]], SM_R+gScheibe(54,48,6)),
                      Q(null,[50,16],[50,50],STAND,[[52,29,53,42]], SM_R+gScheibe(54,44,6))];
  P["front-squat"] = [Q(null,[50,20],[50,50],STAND,[[61,26,53,23]], gScheibe(53,24,7)),
                      Q(null,[46,36],[36,62],[[57,62,52,89,60,89]],[[56,40,50,36]], gScheibe(51,36,7))];
  P["pause-squat"] = [P["barbell-squat"][0], P["barbell-squat"][1]];
  ILLU_SEQ["pause-squat"] = { k:[P["barbell-squat"][0], P["barbell-squat"][1]], t:[[.2,.5],[1,.6]] };
  P["zercher-squat"] = [Q(null,[50,20],[50,50],STAND,[[55,36,51,33]], gScheibe(55,37,7)),
                        Q(null,[46,36],[36,62],[[57,62,52,89,60,89]],[[54,47,50,43]], gScheibe(54,48,7))];
  P["barbell-good-morning"] = [P["barbell-squat"][0], Q(null,[66,40],[40,50],[[44,70,44,89,52,89]],[[55,44,60,38]], gScheibe(62,38,7))];
  P["barbell-push-press"] = [Q(null,[50,32],[48,60],[[57,72,52,89,60,89]],[[58,44,57,34]], gScheibe(57,32,6)),
                             qWith(P_STUP,{ x:gScheibe(65,6,6) })];

  /* Gerätelinien der neuen Studio-Übungen wie bei den übrigen: Farbe „Gerät“ */
  function gm(q){ if(q && q.x) q.x = q.x.replace(/class="(ip|ipf)( gp)?"/g, 'class="$1$2 gm"'); }
  STUDIO_GRUPPEN.forEach(function(g){ g.ids.split(" ").forEach(function(id){
    (P[id] || []).forEach(gm);
    var v = V2[id]; if(v){ (v.p || []).forEach(gm); if(v.seq) v.seq.k.forEach(gm); }
    var s = ILLU_SEQ[id]; if(s) s.k.forEach(gm);
  }); });
})();

/* Gerät je Studio-Übung (Auswahl im Fitnessstudio): Smith, Kabelzug, Langhantel, Kurzhantel, Maschine. Was zu keinem passt (Seile, Rad, Körpergewicht) bleibt ohne Gerät. */
var STUDIO_GERAETE = ["smith", "kabel", "lh", "kh", "maschine"];
var STUDIO_GERAET = {};
(function(){
  var MASCHINE = " leg-press leg-press-45 leg-press-single hack-squat leg-extension leg-curl adductor-machine abductor-machine calf-machine seated-calf glute-machine calf-press lying-leg-curl chest-press-machine incline-chest-press butterfly reverse-butterfly assisted-dip assisted-pullup row-machine high-row-machine back-extension back-extension-machine shoulder-press-machine lateral-raise-machine biceps-machine triceps-machine triceps-extension-machine ab-crunch-machine rotary-torso ";
  STUDIO_GRUPPEN.forEach(function(g){ g.ids.split(" ").forEach(function(id){
    if(!id) return;
    var eq = " " + (EX_EQUIP[id] || "") + " ";
    if(/^smith-/.test(id)) STUDIO_GERAET[id] = "smith";
    else if(/cable|pulldown|pushdown|face-pull|pallof|woodchop|straight-arm|pull-through|^rope-|supinated-triceps|lean-away/.test(id)) STUDIO_GERAET[id] = "kabel";
    else if(/^barbell-|^front-squat|^pause-squat|^zercher|^bench-press$|t-bar-row|cambered|meadows|stiff-leg|^upright-row|close-grip-ez|^preacher-curl|ez-jm|^reverse-curl|^hip-thrust/.test(id)) STUDIO_GERAET[id] = "lh";
    else if(MASCHINE.indexOf(" " + id + " ") > -1) STUDIO_GERAET[id] = "maschine";
    else if(eq.indexOf(" db ") > -1) STUDIO_GERAET[id] = "kh";
  }); });
})();

window.BLOC_DATEN = {
  EX_ALIAS:EX_ALIAS,
  EX_GRIFF:EX_GRIFF,
  LIB_CATS:LIB_CATS,
  EXERCISE_ROWS:EXERCISE_ROWS,
  LIB_WORKOUT_ROWS:LIB_WORKOUT_ROWS,
  EX_LEVEL:EX_LEVEL,
  EX_EQUIP:EX_EQUIP,
  LZ_KETTEN:LZ_KETTEN,
  MAIN_CATS:MAIN_CATS,
  EX_MAIN_ROWS:EX_MAIN_ROWS,
  EQUIPS:EQUIPS,
  EX_SUCH_ALIAS:EX_SUCH_ALIAS,
  Q:Q,
  qSwap:qSwap,
  qMirror:qMirror,
  qShift:qShift,
  qWith:qWith,
  gHand:gHand,
  gDB:gDB,
  gKB:gKB,
  gBar:gBar,
  gBox:gBox,
  gWall:gWall,
  gPole:gPole,
  gBench:gBench,
  P_ST:P_ST,
  P_STF:P_STF,
  P_STH:P_STH,
  P_STUP:P_STUP,
  P_SQ:P_SQ,
  P_SQH:P_SQH,
  P_DSQ:P_DSQ,
  P_JUMP:P_JUMP,
  P_JUP:P_JUP,
  P_PH:P_PH,
  P_PL:P_PL,
  P_FP:P_FP,
  P_LB:P_LB,
  P_LBK:P_LBK,
  P_LF:P_LF,
  P_HG:P_HG,
  P_Q4:P_Q4,
  P_F:P_F,
  P_HANG:P_HANG,
  P_PULL:P_PULL,
  P_L0:P_L0,
  P_L1:P_L1,
  P_WALK1:P_WALK1,
  ILLU_POSES:ILLU_POSES,
  P_FLEGS:P_FLEGS,
  P_HANGS:P_HANGS,
  G_ROW:G_ROW,
  G_PB:G_PB,
  G_SB:G_SB,
  G_KB:G_KB,
  G_PT:G_PT,
  G_MONKEY:G_MONKEY,
  qScale:qScale,
  J_ST:J_ST,
  J_SQB:J_SQB,
  J_SQF:J_SQF,
  J_AIR:J_AIR,
  J_TUCK:J_TUCK,
  B_SQH:B_SQH,
  B_PL:B_PL,
  B_PUL:B_PUL,
  BP_HANG:BP_HANG,
  BP_PULL:BP_PULL,
  jSeq:jSeq,
  ILLU_SEQ:ILLU_SEQ,
  qSide:qSide,
  qTwist:qTwist,
  gBall:gBall,
  RT_SC:RT_SC,
  RT_ST:RT_ST,
  RT_BEINE:RT_BEINE,
  RT_FL:RT_FL,
  RT_FC:RT_FC,
  RT_FR:RT_FR,
  RT_FLC:RT_FLC,
  RT_FRC:RT_FRC,
  V_ARCH:V_ARCH,
  V_SNOW:V_SNOW,
  ILLU_VIEW2:ILLU_VIEW2,
  EX_INFO:EX_INFO,
  EX_POSTURE:EX_POSTURE,
  EX_MUSCLES:EX_MUSCLES,
  AUFWAERM_IDS:AUFWAERM_IDS,
  AUFWAERM_UEBUNGEN:AUFWAERM_UEBUNGEN,
  EX_INT:EX_INT,
  STUDIO_GRUPPEN:STUDIO_GRUPPEN,
  STUDIO_ZIEL:STUDIO_ZIEL,
  STUDIO_GERAET:STUDIO_GERAET,
  STUDIO_GERAETE:STUDIO_GERAETE,
  LIB_FOKUS_TAUSCH:LIB_FOKUS_TAUSCH,
  LIB_WORKOUT_INFO:LIB_WORKOUT_INFO,
  BAND_ARTEN:BAND_ARTEN,
  BAND_HOEHE:BAND_HOEHE,
  BAND_ANKER:BAND_ANKER,
  BAND_ANKER_EXTRA:BAND_ANKER_EXTRA
};
})();
