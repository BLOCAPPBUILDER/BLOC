# BLOC – Entwicklungsverlauf

Kurze Notizen zu den **letzten Änderungen** (ab 2026-10-05), jeweils mit der Fassung. Ältere Einträge stehen im
[Archiv](docs/VERLAUF-Archiv.md). Den **aktuellen** Stand beschreibt die [README](README.md).

## 2026-10-29 · Baukasten: Trainingsart statt Ort, Core, neue Übungen; Lauf bei dunklem Display (Fassung 2026-10-30-2)

- **Baukasten ohne Ort**: Fitnessstudio · Freiluft entfällt in Baukasten, Plan-Bau, Übungskatalog und Überrasch-mich-Fenster (auch der Workoutkatalog: dort zählt ein Workout, wenn mindestens zwei Drittel seiner Übungen zur gewählten Trainingsart passen). Im Filter stehen jetzt **1 Trainingsart** (Fitnessstudio, Calisthenic-Park, Körpergewicht; drei Fotokarten, Mehrfachwahl, Körpergewicht in Gelb), **2 Ausrüstung** (Smith, Kabelzug, Langhantel, Kurzhantel, Maschine, dazu Kettlebell und Widerstandsband) und **3 Muskel**. Alte Filter-Einstellungen werden übernommen (`stArten`/`stGeraete` → `stTrain`/`stAusr`, altes „Überrasch mich“ mit Ort → Trainingsart).
- **Baukasten-Seite ohne „Wie willst du trainieren?“**: Satz für Satz oder mit Timer wird erst auf der Plan-Seite (nach „Weiter: Sätze, Gewicht & Zeiten“) gewählt; ohne Wahl laufen Pläne mit Gewichtsübungen Satz für Satz, reine Körpergewichts-Pläne mit Timer. Je Übung im Plan **Wiederholungen oder Zeit** (mit Sätzen); Übungen mit Gerät zusätzlich mit Gewicht. Satz für Satz mit Zeit trägt Sekunden ein. Die Übungskarte selbst loggt weiter Wiederholungen.
- **Path**: Timer-Workouts (Tools › Timer) lassen sich unter „Hinzufügen › Workout › BLOCs“ in einen TrainingsBLOC einfügen (laufen mit „Los geht’s“ und im Kalender).
- Suche steht unter dem Filter. Muskel-Chip „Bauch“ = Bauchmitte, schräge Bauchmuskeln gehören zu Core.
- **Zweite Ansichten**: Tate Press nur von vorn; Kurzhantel-Bankdrücken, Face Pull und Upright Row zusätzlich von vorn, Prone T-/Y-Raise zusätzlich von oben (Form T bzw. Y).
- **Kabelzug mit Seil**: Holzhacker und Cable Crunch zeigen Rolle, Zugseil und Seilknoten. Weitere Ansichten: Pallof Press von vorn, Pullover im Halbkreis von oben, Hammer Curl von vorn; Rotary Torso neu gezeichnet (Hände am Polster, keine gekreuzten Arme).
- **Suche**: gleiche Filter wie im Workout-Bereich (Trainingsart, Ausrüstung) statt Ort und alter Art; die Wahl gilt nur für die Suche und verstellt den Workout-Filter nicht.
- **Bicycle Crunches** testweise nach Vorschlag neu gezeichnet: Knie höher, der diagonale Arm führt zum angezogenen Knie.
- **Geräte in den Figuren** (Bank, Stange, Hantel, Kabel, Rolle) sind jetzt in BLOC-Orange (im Timer weiter in Schriftfarbe). Copenhagen Plank nach Foto neu gezeichnet.
- **Zuordnung**: eine Trainingsart je Übung aus der Ausrüstung (Gerät, Hantel, Kettlebell, Band = Fitnessstudio; Stange/Barren = Calisthenic-Park; nichts = Körpergewicht). Sieben Übungen ohne Gewichte (Crunch-Varianten, Judo Flip, erhöhte Liegestütze) standen fälschlich im Fitnessstudio. Dadurch kommt bei „Überrasch mich“ mit Körpergewicht + Bauch keine Bauchmaschine mehr. Übungen mit Widerstandsband zählen im Filter zusätzlich zum Calisthenic-Park. Rahmenfarben der Kacheln: Fitnessstudio rot, Calisthenic-Park blau, Körpergewicht gelb. Liste aller Übungen: `docs/UEBUNGEN-ZUORDNUNG.md`.
- **Muskelgruppen getrennt** (Filter, Bereiche im Katalog, Auswertung, Regler): Bauch · Core (die frühere Gruppe „Bauch & Rumpf“, jetzt für Mischübungen wie Plank mit Schultern; als Zone zusätzlich unterer Rücken und Hüfte) · Beine · Po getrennt, dazu wie bisher Brust, Rücken, Schultern, Arme.
- **Entfernt** (auf Wunsch): Battle Ropes (10 Übungen, zwei Workouts), Bauchroller, Unterarm-Roller.
- **Übungen**: neu Bear Plank Rockback Push-up und Plank Toe Touch (Körpergewicht); Tate Press mit zweiter Ansicht von vorn; Single-Leg-RDL gab es schon. Die Zielzeile „Ziel 3 Sätze × 12“ steht nicht mehr auf der Übungsseite. Lange Kachelnamen brechen um statt überzustehen.
- **Lauf**: (1) Auto-Pause pausiert nur noch bei frischen Standorten; bei dunklem Display kamen seltener Punkte, der Lauf blieb dann auf „Auto-Pause“ stehen und Zeit, Strecke und Karte standen still. (2) Capacitor `android.useLegacyBridge` an (laut Plugin-Doku bleiben Standort-Meldungen im Hintergrund sonst aus). (3) Beim Entsperren wird die Anzeige sofort nachgezogen. (4) Karte: Bäume bleiben immer aufrecht (drehen nicht mehr mit), Leuchten der Strecke schwächer. **Nicht am Gerät geprüft.**

## 2026-10-28 · Wissensaustausch: Mind-Muscle-Connection, Hinweis gekürzt (Fassung 2026-10-28-1)

- **Trainingsmythen**: neuer Beitrag „Mind-Muscle-Connection“ (Differenziert). Gezielte Konzentration erhöht die Muskelaktivität bei leichten bis mittleren Lasten; für langfristig mehr Muskelwachstum fehlt ein belastbarer Beleg. Quellen F37 bis F39 neu, auch in quellen.html.
- Hinweis über der Gruppe „Trainingsmythen“ auf zwei Sätze gekürzt.
- Nicht geprüft: F37 bis F39 nur über Suchergebnisse und Zusammenfassungen abgeglichen, nicht gegen die Originale. Angaben zu Calatayud 2016 (Abstract), Schoenfeld 2018 und Grgic 2021 jeweils aus einer Suche. Am Gerät nicht gesehen.

## 2026-10-27 · Run: GPS-Glättung, App an Web-Aussehen angepasst (Fassung 2026-10-27-3)

- **Kalman-Filter** (Ort und Geschwindigkeit, ungenaue Fixes zählen weniger) glättet die aufgezeichnete Strecke; Karte und Streckenbild zeichnen sie als gerundete Kurve statt als Eckenlinie. Routenpunkte alle 3 m, auf 0,1 m genau gespeichert. In einer Simulation (5 m Rauschen) sinkt der mittlere Fehler um etwa 30 bis 40 %, auch in engen Kurven. **Nicht geprüft:** echter Lauf auf dem Handy.
- App: Abstand oben und Schriftgröße wie in der Web-Version (viewport-fit nur in der Web-Fassung, WebView-Textzoom 100). Capacitor-Kern wird als capacitor.js mitgegeben (Behebung für „Standort nicht ermittelbar“).

## 2026-10-26 (Android) · Capacitor-Hülle für Android (Fassung 2026-10-26-4)

- Neues Projekt-Gerüst: `package.json`, `capacitor.config.json`, `android/`, `scripts/www-bauen.mjs`, `assets/` (Icon-Quellen). `npm run sync` baut `www/` und gleicht ab.
- Neu: `js/00-native.js` (Brücke zu Gerätefunktionen, im Browser wirkungslos): GPS als Vordergrund-Dienst, Display-an-Plugin, Sicherung/GPX über das Teilen-Menü, kein Service Worker und kein Installationshinweis in der App. Texte `runBgTitel`, `runBgText`, `dateiFehler`.
- Geprüft: Einheitstest 61/61, Schnelltest 45/45 (Web-Weg unverändert), native Wege mit simulierten Plugins im Browser. **Nicht geprüft:** Bauen und Lauf auf einem echten Android-Gerät (Hintergrund-GPS, Töne bei gesperrtem Bildschirm, Vibration, Dateiausgabe).
- Entscheidungen: App-ID `io.github.blocappbuilder.bloc`, Android-Auto-Backup aus (Daten bleiben auf dem Gerät), Berechtigung INTERNET bleibt aus der Capacitor-Vorlage.

## 2026-10-26 · Protein-Katalog nach Rubriken, A–Z, Trainingsmythen, neue Einführung (Fassung 2026-10-26-3)

- **Protein-Tracker**: Reihenfolge jetzt Tageskarte, Menge (g), Favoriten, Katalog, Heute erfasst, dann Eigenes/Woche/Bedarf/Info. Der Katalog ist standardmäßig zugeklappt und nach zehn Rubriken geordnet (Milch & Quark, Käse, Wurst & Aufschnitt, Fleisch & Geflügel, Fisch, Eier, Hülsenfrüchte & vegan, Getreide & Brot, Nüsse & Samen, Shakes & Riegel, Weitere). Suche über Name und Rubrik, Umlaute und ß werden gleich behandelt, passende Rubriken öffnen sich. Ein Eintrag kann in mehreren Rubriken stehen (Hüttenkäse in Milch & Quark und Käse). Jedes der 230 Lebensmittel ist geprüft einer Rubrik zugeordnet.
- **Protein-Seite neu gestaltet**: Reiter Heute | Woche | Bedarf statt Klappkarten, „＋ Eigenes“ als Sheet (Gramm · Eigener Button · Kombi), Rückgängig in der Kopfzeile der Tageskarte; nur Katalog und Info klappen noch auf. Buttons mit besserem Kontrast. Entwurf vom UX-Designer-Agenten, am Gerät noch nicht geprüft.
- **Protein-Katalog Nachtrag**: zugeklappter Bereich „A–Z durchblättern“ ganz oben im Katalog (je Buchstabe eine Gruppe, ohne Suche), 13 neue Lebensmittel (u. a. Milch 3,5 %). Nudeln und andere Gekochte stehen im zubereiteten Zustand („Nudeln, gekocht“, Werte grob aus den Trockenwerten umgerechnet); Trockenware heißt ausdrücklich „trocken“. Dadurch umbenannte Einträge verlieren ggf. ihren Favoriten-Stern.
- **Einführung**: fünf statt vier Schritte. Die Kette heißt jetzt Übung → BLOC → TrainingsBLOC (Trainingstag) → Trainingsplan; das Schaubild zeigt „Tag A/B“ statt „Workout A/B“. Der Begriff Workout bleibt im Katalog.
- **Wissensaustausch**: neue Gruppe „Trainingsmythen“ mit zehn Beiträgen, jeweils mit Kennzeichnung (Stimmt nicht / Differenziert / Studienlage unklar) und Hinweis auf gesunde Erwachsene. Quellen F24 bis F36 neu, auch in quellen.html.
- Nicht geprüft: F24 bis F35 nur gegen die vorgegebenen Angaben, nicht gegen die Originale. Bei F36 wurden Titel, DOI, Erstautor und Band (6) über eine Suche bestätigt; die übrigen Autoren sind mit „et al.“ abgekürzt.

## 2026-10-25 · Umzug auf BLOCAPPBUILDER (Fassung 2026-10-25-9)

- Feste App-Adresse (`APP_PUBLIC_URL`, gilt nur außerhalb von http/https) und README zeigen jetzt auf <https://blocappbuilder.github.io/BLOC/>. Im Browser nimmt „Link kopieren“ (Einstellungen › Mehr › App) wie bisher die Adresse, unter der die App läuft.
- Nicht getestet: Schnelltest und Einheitstest (nur Adresse und Fassung geändert).

## 2026-10-24 (nachts) · Wissensaustausch im Magazinstil (Fassung 2026-10-24-7)

- **Umbenannt**: „Fragen & Antworten“ heißt jetzt **Wissensaustausch** (Tools-Kachel „25 Beiträge mit Quellen“, Seitentitel, Verweise in der App, quellen.html).
- **Alle 25 Beiträge neu geschrieben** (Deutsch und Englisch): Titel mit Biss, Kernaussage `k` vorweg, kurze Stichpunkte `p` mit Praxis-Satz, „Wie sicher ist das?“ `s`, gekürzte Begriffe `b`. Deutlich weniger Text (rund 45–135 Wörter je Beitrag); keine neuen Tatsachenbehauptungen, alle [F#]-Marker bleiben bei Quellen des Beitrags.
- **Fachprüfung** (Vergleich mit der Vorlage) eingearbeitet: Aussagen auf Quellenstärke abgeschwächt (z. B. Alkohol, glykämischer Index, Dehnen, Frauen/Männer, Push/Pull), Marker an reinen App-Beschreibungen entfernt, Hinweise ergänzt (Niere beim Eiweiß, Vorerkrankungen bei Intervallen, Notruf 112, Sicherung bis zum Muskelversagen, Schmerz abbrechen).
- **Kalorien-Beitrag** an den Stand der App angepasst: nur Lauf und Rad, nur mit Körperdaten, Kraft und Zirkel bewusst ohne Kalorien.
- faq.js wird jetzt direkt gepflegt (docs/FAQ-ENTWURF.md ist nicht mehr die Quelle).
- Nicht verifiziert: Quellen gegen die Originale (nur gegen Titel), Zahlen der Nationalen Verzehrsstudie II (81 g und 60 g).
- Tests: Schnelltest 45/45, Einheitstest 59/59.

## 2026-10-24 (abends) · Protein-Tracker: Ziel, Sonderfälle, geprüfte Quellen (Fassung 2026-10-24-6)

- **Umbenannt** in „Protein-Tracker“; das Eier-Foto sitzt auf der Kachel unter Tools (Ausschnitt Hände und Eierschalen), nicht mehr auf der Seite. „Dein Bedarf“ ist einklappbar.
- **Ziel** abnehmen / halten / aufbauen: Abnehmen −15 % (nie unter Grundumsatz, nie unter 1.500 / 1.200 / 1.350 kcal) und mindestens 2,0 g/kg Protein, Aufbauen +8 %; kcal auf 100 gerundet, „10–20 % Abweichung möglich“.
- **Sonderfälle** (fachlich geprüft): unter 18 keine Kalorienschätzung, ab 65 mindestens 1,0 g/kg, ab BMI 30 Bezug Gewicht bei BMI 25, Hinweis zu Schwangerschaft, Stillzeit, Niere, Essstörung (Ärztin oder Arzt).
- **Aktivitätsfaktoren** 1,4 / 1,55 / 1,75 / 2,0 (an FAO/WHO/UNU 2004 angelehnt; 1,2 lag unter der Spanne).
- **Quellen** gegen die Originale geprüft und ergänzt (Morton 2018, Schoenfeld & Aragon 2018, Frankenfield 2005, Helms 2014, PROT-AGE 2013, FAO 2004); Aussagen angepasst: 0,25–0,4 g/kg je Mahlzeit, „enges Zeitfenster nicht nötig“, 2,2 g/kg als obere Grenze statt Schwelle. Nicht im Volltext gelesen: WHO TRS 935, EFSA 2012, ACSM-Position (über Zweitquellen bestätigt).
- **Lebensmittelwerte**: Stichprobe gegen USDA FoodData Central (11 Einträge, alle innerhalb der Toleranz); Whey 75, Fertig-Shake 10; Schnellbuttons „Hähnchenbrust (roh)“ und „Thunfisch (abgetropft)“.
- Tests: Schnelltest 45/45, Einheitstest 59/59.

## 2026-10-24 (später) · Protein: Bedarf, Foto, aufgeräumt (Fassung 2026-10-24-3)

- **Onboarding** beim ersten Öffnen: Gewicht, Größe, Alter, Geschlecht (auch „keine Angabe“), Aktivität in einem Bildschirm, „Später“ möglich. Es sind dieselben Körperdaten wie unter Fortschritt (`settings.koerper`, neu: `pal`); dort wie hier änderbar.
- **kcal oben** neben der Tagessumme: Grundumsatz nach Mifflin-St-Jeor mal Aktivitätsfaktor, auf 50 gerundet, „± 10 %“ dabei; ohne Geschlecht der Mittelwert beider Formeln.
- **Foto** (Pexels, Klaus Nielsen) als Kopf der Protein-Seite, Nachweis in quellen.html; Datenschutzseite nennt Protein-Einträge und Körperdaten.
- **Aufgeräumt**: wenig sichtbarer Text; Eigenes (Gramm, eigener Button, Kombi), Woche und Verteilung, Bedarf und Erklärung mit Quellen stehen in Klappkarten. Suche steht vor der Liste, Touch-Ziele mindestens 44 px.
- **Produktliste** von 20 auf rund 120 Einträge (eigene Auswahl, grob gerundete Richtwerte, Packung geht vor); Treffer lassen sich mit ＋ als Schnellbutton speichern.
- **Kein Barcode-Scanner**: Er bräuchte eine Produktdatenbank im Netz und bräche das Versprechen „nichts verlässt das Gerät“. Alternative: eigener Button mit Protein je 100 g.
- `settings.protein` trägt jetzt eine Versionsnummer (`v:1`).
- Tests: Schnelltest 45/45, Einheitstest 59/59 (kcal-Rechnung neu).

## 2026-10-24 · Protein-Tracker, Tools, ruhigerer Dunkel-Hintergrund (Fassung 2026-10-24-1)

- **Protein** (neu, js/23-protein.js, Kachel unter Tools): Tagessumme als Hauptanzeige, Ziel nach Körpergewicht und Stufe (Basis 0,83 · Training 1,6 · Intensiv 2,0 g/kg), Schnellbuttons mit einem Tipp (Langdruck: Portion ½ / 1 / 1,5 / 2 ×), eigene Buttons (Protein je 100 g), Kombi-Buttons, mitgelieferte Lebensmittelliste mit Suche, Gramm-Eingabe, Rückgängig, Verteilung morgens/mittags/abends, Wochenblick mit Schnitt in g/kg und dezentem Hinweis ab 2,2 g/kg. Alles lokal in `settings.protein`; keine Erinnerung ums Training, keine rote Warnung; Texte in eigenen Worten.
- **Training heißt jetzt Tools**; die Kacheln heißen Workout-Builder und Mobility & Stretch-Builder (`tileWorkout`, `tileWarm`).
- **Dunkel**: Hintergrund ruhiger (`brightness` .66 → .52, Abdunklung 10 → 20 %); die Timer-Seite (Blöcke bauen) bekommt denselben Hintergrund (`.run-bg.timer-bg`). Laufender Timer, Satz-Training und Run bleiben unverändert.
- **Kopf auf Heute**: Logo und Einstellungs-Icons ca. 2 mm tiefer.
- **Mobility & Stretch**: keine Geräte-Symbole mehr auf den Übungskacheln.
- **Satz-Training**: Wischen wechselt die Übung zusätzlich per Touch-Auswertung (`touchstart`/`touchend`), falls der Browser das Scrollen nicht übernimmt.
- Tests: Schnelltest 45/45, Einheitstest 59/59 (Protein-Rechnung neu, Tools-Beschriftung und Kachelzahl angepasst).

## 2026-10-23 (abends) · Favoriten entfernen per Langdruck, breiterer Kopfstreifen (Fassung 2026-10-23-10)

- **Favoriten auf Heute**: langes Drücken (0,5 s) auf eine Kachel fragt „Aus Favoriten entfernen?“ und entfernt sie nach Bestätigung (`langDruck` + `confirmSheet` in `bindFavItems`, js/09-studio-karte.js; Texte `favEntfernen*`). Das Workout selbst bleibt erhalten.
- **Abstand links**: die Favoriten-Reihe rastet nicht mehr am Rand ein (`scroll-padding-left`), das Symbol der Glas-Kachel sitzt etwas weiter innen.
- **Kopfstreifen** (Verlauf hinter der Kopfzeile) läuft jetzt über die ganze Bildschirmbreite statt nur über die Spalte, auch auf breiten Geräten wie Klapphandys und Tablets; der Inhalt bleibt in der Spalte (`.topbar` in layout-new.css).
- **Hintergrund** (Glas-Design) genau wie auf der Run-Seite: Blur 11 px statt 26 px und nur noch 10 % Abdunklung statt 42–68 %, dadurch heller und schärfer (`.glas-bg` in layout-new.css). Dasselbe gilt für die Timer-Seite und alle Seiten mit `.run-bg` (Blur 11 px statt 24 px), damit Heute, Training, Timer und Run gleich aussehen.
- **Timer-Seite**: die Workout-Zeilen sind jetzt runde Glas-Karten wie auf Training (statt eckiger Zeilen mit Trennlinie), der Play-Knopf sitzt 16 px vom Rand.
- **Timer bearbeiten**: statt des Plus (Workouts hinzufügen) hat jede Timer-Zeile einen Stift; er öffnet dasselbe Fenster wie „Neuer Timer“ mit den Werten (Sätze, Zeit, Pause, Runden, Name) zum Ändern (`timerBearbeiten`, `timerPlusAus`, `timerPlusAendern` in js/07-studio.js). Timer aus mehreren Blöcken öffnen den Editor.
- **Eigene Übung anlegen**: letzte Kachel im Baukasten (Workout) und in Mobility & Stretch (gestrichelt, stärker verwischt). Eigene Übungen stehen im Katalog in einer neuen obersten Rubrik „Eigene Übungen“ (vor Ganzkörper) und zusätzlich in ihrem Bereich (Rücken, Arme, Bauch, Beine, Cardio aus den gewählten Kategorien; `katBereichEigene` in js/11b-katalog.js). Bei Mobility & Stretch landet die Übung unter Dehnen; unter Aufwärmen erscheinen eigene Übungen nicht.
- **Eigene Übungen ohne Figur**: überall, wo sonst die Figur steht (Kacheln, Übungsseite, Info, Satz-Training, Mini-Ablauf im Baukasten), erscheint das Symbol der ersten Kategorie (`exSymbol` in js/02-bibliothek.js). Der laufende Timer bleibt unverändert. Die gestrichelte Linie der Kachel „Eigene Übung anlegen“ gilt jetzt auch im Hellen.
- **Kopfzeilen-Streifen** (Verlauf hinter Zurück-Knopf und Titel) überall entfernt (Dunkel und Hell).
- **Glas-Karten dunkler** (dunkle statt weißer Tönung, Run-Seite unverändert), **Symbole weiß** (Baukasten-Karten, Favoriten ohne Foto), **Logo** auf Heute etwas weiter oben.

## 2026-10-23 · Glas-Design, Path mit Deep Dive, Katalog-Ergänzungen, Nacht entfällt (Fassung 2026-10-23-1)

- **Glas-Design** im Dunkel (Modern): Run-Hintergrund hinter allen Seiten, Glas-Karten, weiße Figuren und Symbole; Kopfzeilen ohne dunklen Schleier, Foto-Kopf von Heute läuft unten weich aus, Training ohne Kopfzeile. Hell unverändert. Umsetzung in `layout-new.css` (Abschnitt „Glas-Design“), `data-glas` in `applyTheme`.
- **Timer:** Figur 30 % kleiner; die Statusleiste des Handys (`theme-color`) ist dunkel, solange Timer oder Satz-Training offen sind (vorher stand über dem dunklen Timer eine helle Leiste).
- **Arena heißt Path** und hat einen neuen mittleren Reiter **Deep Dive** (Muskelgruppen auf der Körperfigur pro Woche und pro Workout, Kennzahlen, Verteilung mit Unterschied zur Vorwoche, Vorschlag aus dem Katalog).
- **Katalog:** kleine Körperfigur auf den Workout-Karten; Farben nach Ort auch bei den Ortskarten im Katalog (Fitnessstudio war dort nicht rot) und bei den Übungskacheln und Auswahlstreifen; Auswahl der Trainingspläne mit Umrandung in Rot, Blau oder Grün (Mobility). 15 neue Workouts für Gruppen mit nur ein oder zwei Workouts (höchstens 25 % gleiche Übungen).
- **Deep Dive ausgebaut**: Häufigkeit pro Muskelgruppe (Figur: hell = 1 Tag, kräftig = 2 oder mehr), Muskel-Kalender (6 Gruppen × 7 Tage, voller Punkt = trainiert, hohler = im Kalender geplant), Umschalter Trainiert · Mit Plan, Balance (Drücken : Ziehen, Oberkörper : Unterkörper), Anteil mit Vorwoche; Übungsinfo zeigt „Letzte 30 Tage“. Fortschritt bekommt „BLOCs im Verlauf“; die doppelte Muskelauswertung in der Workout-Karte von Fortschritt entfällt (Verweis auf Deep Dive, und zurück).
- **Rad-Kalorien**: Fahrten werden mit Rad-Werten nach Tempo gerechnet (vorher waren die Stufen um eine Stufe verschoben), auch im Rückblick (vorher mit dem Lauf-Wert für alle Zeiten).
- **Seiten**: Workout, Mobility & Stretch und Kalender ohne Kopfbild; Training mit Zurück-Knopf; Run (vor dem Start) und Timer-Seite im Hellen mit weißem Grund und Feldern wie Workout; Timer-Kachel in Hell und Dunkel mit neu-h-brust-2, Workout-Kachel im Hellen mit neu-p-frau-kniebeuge; Workout-Symbol auf Training im Dunkel orange, Mobility grün; Path-Symbol als Strecke statt Doppelkreis; orange Hauptknöpfe im Dunkel als Glas (außer „Überrasch mich“ auf Heute).
- **Glas-Design, Nachbesserung**: Fenster, Menüs und Auswahlblätter (Hinzufügen, Aktionsmenüs, Übungsinfo, Einführung, Lautstärke u. a.) sind im Dunkel undurchsichtig wie auf Run und Timer, damit nichts durchscheint (14 Fenstertypen per Skript geprüft); angeheftete Kopfzeile und untere Leiste sind deckender; alle „LOS GEHTS“ bleiben orange (Path, BLOC-Seite, Deckblatt, Einführung).
- **Farben nach Ort in Plan und Kalender**: Einträge von Trainingsplänen und im Kalender sind nach den Übungen gefärbt (Fitnessstudio rot, Freiluft blau, Mobility grün); vorher waren Katalog-Workouts immer blau und BLOCs immer rot (`kalOrtFarbe` in `js/19a-kalender.js`).
- **Fortschritt › Gespeicherte Trainings**: eingeklappt, innen nach Muskelgruppe und Übung geordnet (je Übung: wie oft trainiert, zuletzt, schwerster Arbeitssatz, ★ bei Rekord; Antippen öffnet den Verlauf der Übung) statt nach Workout oder BLOC; die einzelnen Trainings nach Datum (ansehen, ergänzen, löschen) stehen unten in einer eigenen eingeklappten Gruppe. Dazu „1 Übung“ statt „1 Übungen“ in den neuen Ansichten.
- **Deep Dive**: Farberklärung und WHO/ACSM-Hinweis in der Karte „Wie oft pro Muskelgruppe“ entfernt (die Grundlage steht in `quellen.html`).
- **Katalog › Workout-Karten**: die Übungen als kleine Figuren in einer eigenen Zeile unter der Karte (wie in der Auswahl bei Path, bis zu sechs, dann „+n“); gezeichnet werden sie erst, wenn die Gruppe aufgeklappt ist (`pgFigurenFuellen`), damit der Katalog schnell bleibt. Gilt auch für die Workouts bei Mobility & Stretch.
- **Runder Hauptknopf** neben der unteren Leiste bleibt auch im Glas-Design orange, das Symbol (Dreieck) ist im Dunkel weiß wie im Hellen.
- **Deep Dive › Idee für die nächste Einheit**: Name öffnet das Workout, dazu „In Kalender einfügen“ (Tagesauswahl heute und die nächsten sechs Tage), Stern zum Merken und Ansehen.
- **Gelöschte Bilder** (11, auf Wunsch nicht wiederhergestellt): `neu-h-klimmzug`, `neu-h-klimmzug-rueck`, `neu-h-ringe`, `neu-h-kreuzheben`, `neu-h-trail`, `neu-p-freiluft-park`, `neu-p-freiluft-sw`, `neu-p-run-wald`, `neu-p-run-weg`, `neu-p-kraft-sw`, `bereich-timer`. Die Verweise sind aus den Bildlisten (`js/03-router.js`), dem Offline-Zwischenspeicher (`sw.js`, sonst würde das Vorladen scheitern) und der Bereichs-Bildtabelle (`js/04-start.js`, Timer jetzt `neu-h-brust-2`) entfernt; die helle Freiluft-Liste nutzt jetzt die Bilder des Dunkels. Fassung 2026-10-23-2.
- **Reste alter Designs entfernt**: der einmalige C60-Hinweis auf Heute (`c60HinweisHTML`, `bindC60Hinweis`, `c60Umgestellt`), seine Texte und das alte Attribut `data-vintage`. `migrateTheme` bleibt, damit gespeicherte Stände und Sicherungen mit den Werten kodak, retro, tapedeck, nacht und klar weiter geladen werden. Ungenutztes Bild `img/neu-herbst-bg.jpg` gelöscht.
- **Classic aus dem Code entfernt**: alle `layoutNeu()`-Zweige, `LAYOUT_NUR_MODERN`, die fünf-Tab-Leiste, `heroHTML`, `reiterZeileHTML`, `runSvg`, die klassischen Favoriten-Kacheln und das zugehörige CSS. Der Schnelltest läuft jetzt im modernen Aussehen (Navigation über die vier Tabs bzw. die Adresse). Ungenutztes Bild `img/bereich-mobility.jpg` gelöscht (auch aus der Vorab-Liste in `sw.js`).
- **Nachtmodus entfernt** (Stile, Texte, Einstellungen, README); gespeicherte Stände mit „Nacht“ oder „Tapedeck“ wechseln zu Dunkel (`migrateTheme`).

## 2026-10-22 · Satz-Training → Timer im Trainingsplan, kein „Weiter trainieren“ (Fassung 2026-10-22-21)

- Fehler behoben: „Speichern & weiter mit …“ startete einen Timer-BLOC hinter der Satz-Seite (sichtbar blieb die Ende-Karte). Der Timer räumt die Satz-Seite jetzt ab und liegt oben.
- Die Ende-Karte hat nur noch die eine Hauptaktion (kein „Weiter trainieren“); hakt das Speichern, geht es trotzdem weiter.

## 2026-10-22 · Trainingspläne unter Favoriten (Fassung 2026-10-22-20)

- Der Stern am Trainingsplan steht jetzt in den normalen Favoriten (Schlüssel `prog:ID`) und erscheint auf Heute; Antippen öffnet den Plan in der Arena. Ein früher gesetzter Stern wird übernommen.

## 2026-10-22 · Overview → Mit Timer starten bleibt im Trainingsplan (Fassung 2026-10-22-19)

- Auch ein Workout, das über das Deckblatt (Overview) mit „Mit Timer starten“ läuft, gehört zum Trainingsplan: Zeile oben, „Weiter mit …“, Beenden führt in die Arena.

## 2026-10-22 · Ende-Karte aufgeräumt, Auswertung am Schluss (Fassung 2026-10-22-18)

- Satz-Training, Ende eines BLOCs: eine Hauptaktion. Im Trainingsplan „Speichern & weiter mit …“ (ohne Auswertung), beim letzten Eintrag „Speichern & Auswertung“ (alle BLOCs des Durchgangs zum Wischen); im Workout „Speichern & fertig“, danach die Auswertung. „Letzten Satz löschen“, Notizfenster und Standard-Block vor dem Speichern entfallen.

## 2026-10-22 · Kalender: Trainingsplan hinzufügen (Fassung 2026-10-22-17)

- „+ Hinzufügen“ im Kalender hat neben Workouts und Run jetzt **Trainingsplan**: der ganze Plan steht als ein Eintrag im Tag (Art `programm`); Antippen öffnet den nächsten Eintrag des Plans, danach „Weiter mit …“ durch alle Workouts.

## 2026-10-22 · Arena: LOS GEHTS öffnet erst die Einstellungen (Fassung 2026-10-22-16)

- LOS GEHTS! auf der Trainingsplan-Karte und das ▶ am Eintrag öffnen zuerst den BLOC (Zeit oder Sätze, Wiederholungen, Gewicht, Pause) bzw. das Deckblatt; gestartet wird dort. Zurück führt immer in die Arena (auch über „Bearbeiten“ und „Nach Sätzen trainieren“); der Trainingsplan-Kontext endet beim Wechsel auf eine andere Hauptseite.

## 2026-10-22 · Train by sets im Trainingsplan (Fassung 2026-10-22-15)

- Zurück vom BLOC (Train by sets) führt zum Deckblatt. Ein BLOC, der aus einem Workout des Trainingsplans entstanden ist, gehört weiter zu dessen Eintrag: Zeile „Name · 2/3“, „Weiter mit …“ am Ende, Beenden führt in die Arena.

## 2026-10-22 · Trainingsplan: Einträge öffnen sich in der Arena, Logo quer höher (Fassung 2026-10-22-13)

- Antippen eines Eintrags im Trainingsplan öffnet den BLOC (Zeit oder Sätze, Wiederholungen, Gewicht, LOS GEHTS) bzw. das Deckblatt des Workouts; Änderungen gelten für den BLOC/das Workout selbst, Zurück führt in die Arena. Das kleine ▶ startet gleich.
- Timer quer: BLOC-Zeichen weiter oben.

## 2026-10-22 · Kurzhantel im Gym, Trainingsplan-Start direkt (Fassung 2026-10-22-12)

- Übungen mit Kurzhantel zählen zum Fitnessstudio (Ort, Farbe, Katalog-Aufteilung). „Gespeicherte Trainings“ stehen nicht mehr bei BLOCs, nur noch in der Statistik.
- Ein Eintrag aus einem Trainingsplan (Arena, Kalender-Termin, Hauptknopf) startet gleich als Timer bzw. Satz-Training, ohne Deckblatt; Beenden führt zurück in die Arena statt zu Workout/Heute.

## 2026-10-22 · Trainingsplan: Los geht's, Weiter mit …, Zeile im Training (Fassung 2026-10-22-10)

- Trainingsplan-Karte: Knopf „LOS GEHTS!“ (startet den nächsten Eintrag), ein Zurück-Knopf oben links in der Arena. „Hinzufügen“: Favoriten · BLOCs · Katalog zunächst zugeklappt, Einträge links in Fitnessstudio-Rot bzw. Freiluft-Blau.
- Läuft ein Eintrag aus einem Trainingsplan (Karte, Kalender-Termin, Hauptknopf, „Weiter mit …“), steht oben die Zeile „Name · 2/3“; Antippen zeigt die Einträge zum Wechseln. Am Ende kommt „Weiter mit …“ (Timer und Satz-Training).
- Timer: kein „Satz eintragen“, keine Angabe „3 Sätze × 12“, kein Speichern-Knopf mehr; Eintragen nur noch im Satz-Training.

## 2026-10-22 · Figuren im „Hinzufügen“-Fenster (Fassung 2026-10-22-9)

- Arena › Hinzufügen: unter jedem BLOC, Favoriten- und Katalog-Eintrag stehen bis zu sechs kleine bewegte Figuren der Übungen (+n für den Rest); sie werden erst beim Aufklappen eines Bereichs gebaut.

## 2026-10-22 · Einheitliche Leiste, Umbenennen per Langdruck (Fassung 2026-10-22-6)

- Untere Leiste auf allen vier Seiten gleich: runder Knopf immer da, ▶ überall (startet Kalender-/Trainingsplan-Eintrag von heute, sonst „Keine Pläne im Kalender“), nur im Kalender ＋.
- Umbenennen von Trainingsplänen, BLOCs und eigenen Workouts per langem Drücken (Menü „Umbenennen“); das Namensfeld entfällt.

## 2026-10-22 · Deckblatt und Katalog-Kacheln: nur der Stern (Fassung 2026-10-22-3)

- Deckblatt eines Workouts: Speichern/Kopieren, Teilen und Ausblenden sowie die Zeilen „Änderungen gelten nur …“ und „Tippe auf eine Übung …“ entfallen; langes Drücken auf die Karte öffnet das Menü. Katalog-Kacheln zeigen nur Stern (⋯ weg, Langdruck wie bisher).

## 2026-10-22 · Arena aufgeräumt, Trainingspläne, weniger Text (Fassung 2026-10-22-2)

- Arena: nur noch **Trainingspläne** (früher „Programm“) und **Fortschritt**; „Meine Übungen“ entfällt. Karten stehen zugeklappt (Name, Anzahl, Wochentage, Stern); aufgeklappt zeigen sie ihre Workouts, „Hinzufügen“ und den Wochenplan (selbst zugeklappt). Eintrag antippen = starten, langes Drücken = nach oben/unten/entfernen; langes Drücken auf die Karte = Teilen · Kopieren · Löschen.
- „Hinzufügen“ wählt nur aus Vorhandenem (Favoriten, BLOCs, Katalog mit denselben Bereichs-Karten); oben die Rubrik in der Reihenfolge Mobility · Workout · Run · Stretch.
- Katalog-Karte auf Heute entfernt (bleibt im Baukasten). Lange Erklärtexte stehen nirgends mehr auf den Seiten: nur noch das „?“; Tipp-Zeilen und die Zeilen unter Ort/Art im Baukasten entfallen.

## 2026-10-22 · Arena, Programme, BLOCs, Baukasten-Leiste (Fassung 2026-10-22-1)

- Plan-Seite: unten links „Plan speichern“ (nur kurzes Rütteln und „BLOC wurde gespeichert“, man bleibt auf der Seite), unten rechts „LOS GEHTS!“ (ungespeichert: Rückfrage); „Weitere BLOCs“, Hinweistext und die Knopfreihe Favorit/Kopie/Teilen sind weg – sichtbar bleibt der Stern, Kopieren · Teilen · Löschen per langem Drücken (auch auf BLOCs und Programmen).
- Workout und Mobility & Stretch: Reiter **Baukasten | BLOCs** (BLOCs = früher Meine); der Katalog ist eine Karte im Baukasten und auf Heute; der Übungskatalog ist nur noch über die Suche bzw. `#uebungskatalog` erreichbar.
- Neuer Reiter **Arena** (statt Fortschritt) mit **Programm** (früher Plan; Einträge der Reihe nach, Wochentage + 4/6/8/12 Wochen in den Kalender, „Weiter mit …“ nach einem erledigten Eintrag), **Fortschritt** und **Meine Übungen**. Der runde Hauptknopf startet nur Kalender- bzw. Programm-Einträge von heute, sonst „Keine Pläne im Kalender“. Daten: `settings.programme`; der alte `planBau` wird einmal zum ersten Programm übernommen.
- Timer: „Sätze à 30 s“ entfällt, BLOC-Zeichen doppelt so groß (quer mittig zwischen Kreis und Kästchen); Timer-Plus mit eigenem Namen.

## 2026-10-21 · Summit-Daten werden vollständig gelöscht (Fassung 2026-10-21-14)

- Heute: die Favoriten-Kacheln sind 20 % kleiner (Größe, Schrift, Stern).
- Auf Wunsch gibt es keinen Zwischenspeicher und keinen Hinweis zum Sichern mehr: alle Summit-Daten (auch der frühere Zwischenspeicher `sporttimer-summit-archiv`) werden beim Laden gelöscht.

## 2026-10-21 · Summit entfernt, der Baukasten-Umbau ist zurückgenommen (Fassung 2026-10-21-13)

- **Summit entfernt** (Oberfläche, Daten, Routen, Texte, Bilder, Styles, Tests). Eigene Challenges, Einheiten und Bestzeiten bleiben im Zwischenspeicher `sporttimer-summit-archiv`, bis man sie auf Training als Datei sichert oder verwirft.
- Der Baukasten-Umbau (BLOC | Workout | PLAN auf Training, Fassung -12) ist zurückgenommen; Training, Plan-Reiter unter Fortschritt und die Kalender-Wege sind wieder wie vor dem Umbau.
- Speicherformat versioniert (`db.v` = 3, `dbAusRoh` und `dbMigrieren`). Wer die Fassung -12 schon geöffnet hatte, behält seine Daten; neue Felder des Umbaus (`bkWorkouts`, `plaene`) werden nicht mehr gelesen.
- `repUhr` heißt jetzt `fmtUhr`, die Klassen `rep-intro`, `rep-pick`, `rep-meta` heißen `seiten-intro`, `wahl-pick`, `meta-zeile`.
- Tests: Einheitstest und Schnelltest angepasst; zwei veraltete Schnelltests (Timer-Dialog, Abschnitte unter Meine) an die App angepasst, Schnelltest kennt `?nur=Titelteil`.

## 2026-10-21 · Handeinstellung gilt wieder (Fassung 2026-10-21-10)

- Wer Sätze, Wiederholungen oder Gewicht eines Ziels von Hand ändert, behält diese Einstellung: frühere Einheiten heben sie nicht wieder automatisch an, erst eine neuere Einheit mit mehr als dem neuen Ziel.

## 2026-10-21 · Neuer Standard nur „generell“, nicht für einen einzelnen Satz (Fassung 2026-10-21-9)

- Mehr Gewicht oder Wiederholungen zählen nur, wenn alle Ziel-Sätze (so viele, wie das Ziel verlangt) die 10-%-Marke schaffen; ein einzelner schwerer Satz ändert nichts. Eine zusätzliche Satzzahl (z. B. 4 statt 3) zählt weiter.

## 2026-10-21 · Neuer Standard: mehr geschafft = neues Ziel (Fassung 2026-10-21-8)

- Wer mehr Sätze als das Ziel gemacht hat (z. B. 4 statt 3), alle Sätze mit mindestens 10 % mehr Wiederholungen oder mit mindestens 10 % mehr Gewicht geschafft hat, dem gilt das ab der nächsten Einheit als Ziel; es wird nur angehoben, nie gesenkt.
- Satz-Training: Die Zusammenfassung nennt den neuen Standard; bei früheren Einheiten wird er beim Öffnen der Übung bzw. des Satz-Trainings übernommen. Einheitstest um eine Prüfung ergänzt (57).

## 2026-10-21 · Studio-Karte clean: Sätze von heute in der Statistik (Fassung 2026-10-21-7)

- Die Liste „Heute: 1. … 8. …“ steht nicht mehr auf der Studio-Karte, sondern in der Statistik unter „Letzte Einheiten“ als Zeile „Heute“.

## 2026-10-21 · Foto-Köpfe mit gerader Unterkante (Fassung 2026-10-21-6)

- Workout, Mobility & Stretch und die anderen Bereichsköpfe: die untere Kante ist gerade, nicht mehr abgerundet.

## 2026-10-21 · Satz-Training springt nicht mehr von selbst weiter, Geräte-Symbole orange (Fassung 2026-10-21-5)

- Satz-Training: nach einem eingetragenen Satz bleibt die Karte stehen; weiter geht es per Wischen oder mit dem „Nächste“-Knopf.
- Trainingsgeräte-Symbole (Kurzhantel, Stange, Band, Gerät …) sind orange: auf den Übungskacheln, im Info-Fenster und in den Geräte-Filtern.

## 2026-10-21 · Satz-Training: früher gespeichertes Training startet auch neu (Fassung 2026-10-21-4)

- Ein heute schon gespeichertes Training (auch vor dem Neustart-Verhalten gespeichert) beginnt beim erneuten Öffnen des Satz-Trainings mit leeren Karten; Übungen ohne Rundenstart bekommen ihn beim Öffnen. Neue Sätze zählen danach normal weiter.

## 2026-10-21 · Foto-Kopf wieder wie vorher (Fassung 2026-10-21-3)

- Workout und Mobility & Stretch haben wieder den früheren Foto-Kopf (abgerundet, ohne Verlauf, ohne BLOC-Zeichen); der Verlauf-Versuch ist samt Stil entfernt.

## 2026-10-21 · Kopf mit kürzerem Verlauf, ohne BLOC-Zeichen (Fassung 2026-10-21-2, wieder zurückgenommen)

- Workout und Mobility & Stretch: der Verlauf unten im Foto ist kürzer (mehr Foto, Titel besser lesbar), das BLOC-Zeichen im Kopf ist wieder entfernt (neben Zurück, Hilfe und Suche war es zu voll). Die Schrift bleibt theme-abhängig: Weiß im Dunkelmodus, dunkel im Hellmodus, weil das helle Foto sonst Weiß schluckt.

## 2026-10-21 · Neustart nach Speichern, Kopf mit Verlauf, Ausrüstung, Abschlusskarte, Satztypen (Fassung 2026-10-21-1)

- **Satz-Training beginnt nach dem Speichern von vorn:** Wer ein Training speichert und es gleich noch einmal startet, sieht leere Karten statt des fertigen Standes. Heute zählen nur die Sätze seit dem letzten Speichern (`settings.satzBasis`); das Protokoll, die Statistik und das gespeicherte Training bleiben vollständig (der Tageseintrag zählt beide Runden zusammen).
- **Workout und Mobility & Stretch:** Foto-Kopf wie bei Heute – das Bild läuft unten weich in den Hintergrund, das BLOC-Zeichen steht klein oben links neben dem Zurück-Knopf (Hell und Dunkel).
- **Ausrüstung:** Die gewohnten Chips (Kurzhantel & Kettlebell, Stange & Barren, Widerstandsband, Körpergewicht) gibt es wieder an allen Orten. Ist das Fitnessstudio mit dabei (auch „beide Orte“), stehen darunter abgesetzt die fünf Studio-Geräte (Multipresse, Kabelzug, Langhantel, Kurzhantel, Maschine). Wer beides wählt, bekommt Übungen, die zu einer der Wahlen passen; Studio-Übungen mit Hanteln zählen jetzt auch als Kurzhantel.
- **„Training geschafft“:** ruhiger (Glas und Weiß statt Orange und Grün), BLOC-Zeichen oben, vier Zahlen dieser Runde und ein Balkenverlauf der letzten Trainings dieses Plans – schon beim ersten Eintrag mit einem Balken.
- **Meine:** die Abschnitte Nach Zeit, Nach Sätzen und Gespeicherte Trainings sind zunächst eingeklappt.
- **Satztypen** (Normal, Aufwärmen, Drop, Versagen) auf der Übungskarte ausklappbar (eine Zeile mit der aktuellen Wahl); neue FAQ-Frage „Was bedeuten Normal, Aufwärmen, Drop und Versagen?“ (25 Fragen), vom Satztyp-Bereich aus verlinkt.
- Einheitstest 56/56 (neu: Neustart-Logik, Geräte-Zuordnung und Filter-Regel).

## 2026-10-20 · Fitnessstudio: Geräte-Auswahl, 12 neue Übungen (Fassung 2026-10-20-67)

- Im Fitnessstudio-Filter gibt es eine Zeile „Gerät“ mit den fünf gängigsten Universalgeräten: Multipresse (Smith), Kabelzug, Langhantel, Kurzhantel, Maschine. Sie gilt für Übungskatalog, Workoutkatalog und Plan-Bau (nur bei Ort Fitnessstudio) und wird wie die anderen Filter beim Verlassen zurückgesetzt. Zuordnung `STUDIO_GERAET` am Ende von `daten.js`; Übungen ohne Gerät (Seile, Rad, Körpergewicht) erscheinen bei aktivem Gerätefilter nicht.
- Zwölf neue Übungen mit Figur: sieben an der Multipresse (Schulterdrücken, Schrägbankdrücken, vorgebeugtes Rudern, Ausfallschritt, Hip Thrust, Wadenheben, Schulterheben) und fünf mit der Langhantel (Frontkniebeuge, Kniebeuge mit Pause, Zercher-Kniebeuge, Good Morning, Push Press).
- Muskelname bei „Blick sanft nach oben“ korrigiert („Halsmuskulatur vorn“ kannte die Körperkarte nicht).

## 2026-10-20 · Strichfiguren für alle 87 neuen Studio-Übungen (Fassung 2026-10-20-61)

- Alle am 2026-10-20 neu eingebauten Übungen haben jetzt eine eigene Figur (zwei Posen, Anfang/Ende): Brust, Rücken, Schultern, Bizeps, Trizeps, Beine, Core, Unterarme, zwei Dehnungen, Cross Jacks und die zehn Battle Ropes. Neuer Abschnitt „Figuren der Studio-Erweiterung“ am Ende von `daten.js` (vor `window.BLOC_DATEN`).
- Kabelübungen mit Turm, Rolle und Griff wie bei den vorhandenen; Zweitansicht (von vorn/oben/seitlich) bei Standing Cable Fly, Low-to-High Fly, Neutral-Grip-Klimmzug, Schulterdrücken sitzend, Arnold Press, Kurzhantel-Curls und Tate Press. Cuban Press, Frontheben über Kopf und Hantel-Clean laufen als Ablauf mit Zwischenphase.
- Battle Ropes zeigen das Seil als Welle von der Hand zum Anker; die Welle wechselt zwischen den Posen (Gegenphase). Frontal bei seitlichen Wellen, Kreisen, In-and-Out und Jumping Jacks, sonst von der Seite.
- Fachprüfung (Sportwissenschaftler-Agent) eingearbeitet: Stangenhöhe bei den Latzug-Varianten, Kabel-Fly mit Zug von hinten, Landmine-Anker fest, Ab-Wheel ohne Knick, gestreckter Judo Flip, Battle-Rope-Hocken (Squat Waves wechselt zwischen Stand und tiefer Hocke), Decline-Fußrolle u. a. Frontale Battle Ropes mit breiterem Stand, Seile laufen zwischen den Beinen.
- Einheitstest: neue Prüfung, dass jede Übung der Studio-Gruppen und der Hauptgruppen (Ausdauer, Rumpf, Stange, Dehnen) eine Figur hat (54/54).

## 2026-10-20 · FAQ: Word-Update eingearbeitet, 24 Fragen (Fassung 2026-10-20-37)

- Kevins zweite Word-Fassung ist drin: 24 Fragen (neu: Muskelfasern, glykämischer Index, Periodisierung, Push/Pull, Frauen und Männer), 23 Quellen (quellen.html: F1–F23). Text und Begriffe inhaltlich belassen; kleine Anpassungen: Verzehrsstudie 2005–2007 erhoben, Alkohol als eine kleine Studie, Kalorien-Frage mit Rechenbeispiel und 4,5 MET für Katalog-Workouts, Aufwärmsätze vorsichtiger formuliert. Quellen gegen Crossref, PubMed und Webseiten geprüft. Englische Fassung ergänzt.

## 2026-10-20 · FAQ: Kevins redaktionelle Fassung eingearbeitet (Fassung 2026-10-20-32)

- Die geglättete Word-Fassung („Sportjournal“) ist die neue FAQ: 19 Fragen, Begriffserklärung je Frage („Begriffe kurz erklärt“), 14 Quellen mit Direktlinks (quellen.html: F1–F14). Quellen und zitierte Aussagen gegen Crossref/PubMed geprüft. Nur Formulierungen geändert, die für Nutzer nicht passen (Verweise auf „das Dokument“, „die App sollte …“). Einheitstest 52/52.

## 2026-10-20 · FAQ-Anzeige für das neue Datenformat (Fassung 2026-10-20-31)

- `faqHTML()` (js/05-suche.js) kommt mit dem neuen FAQ-Format der Word-Fassung zurecht und bleibt mit dem alten kompatibel: **`s`** („Wie sicher ist das?“) ist optional, **`k`** (Kurzantwort) ist optional – mit `k` stehen die Absätze `p` als Stichpunkte wie bisher, ohne `k` als Fließtext –, neues optionales Feld **`b`** = Liste `[Begriff, Erklärung]`, angezeigt unter der Antwort als „Begriffe kurz erklärt“ (`faqBegriffe` in texte.js, Stile am Ende von app.css, `<dl>`). Nichts mehr „undefined“, wenn Felder fehlen.
- Einheitstest: FAQ-Prüfungen offen für 1–3 Absätze, optionale Felder, beliebig viele Quellen (keine feste Zahl, Nummer 13 darf belegt sein); neuer Test mit einem künstlichen Datensatz im neuen Format (ohne `k`/`s`, mit `b`); Anzeige-Test prüft Begriffe, Antwort je Frage und „kein undefined im Text“.

## 2026-10-20 · Fassungsnummer nach den Figuren-Nachbesserungen erhöht (Fassung 2026-10-20-66)

- Die nachgebesserten Figuren der Studio-Übungen (Fachprüfung) sind mit dieser Fassung auf allen Geräten wirksam.

## 2026-10-20 · BLOC-Zeichen beim Laufen immer, Hinweisfenster lesbar (Fassung 2026-10-20-65)

- Run (Countdown und Lauf): BLOC-Zeichen oben in der Mitte, auch im Hochformat.
- Hinweisfenster („Zu kurz – nicht gespeichert“, Favoriten u. a.) auf Run, Timer und Summit: dunkel mit weißer Schrift statt weiß auf weiß.

## 2026-10-20 · Heute wieder größer, wächst mit der Bildschirmhöhe (Fassung 2026-10-20-64)

- Kopf, Woche, Favoriten-Karten und Workout-Builder skalieren mit der Höhe des Bildschirms (auf 398 × 790 füllt die Seite den Bildschirm bis kurz über die Leiste); kleine Handys bleiben kompakt.

## 2026-10-20 · Fenster undurchsichtig, Timer mit Sätzen und Runden, Startseite ohne Scrollen, Karte ohne Raster (Fassung 2026-10-20-63)

- Fenster und Menüs über den Glas-Seiten (Timer-Plus, Bestätigungen, Plus-Menü) sind wieder undurchsichtig.
- Timer-Plus: „Sätze“ (Anzahl, Zeit, Pause) stehen oben, dann „Runden“; der Zirkel entfällt. Im Timer zeigen oben Kreise die Runden, unten Kästchen die Sätze.
- Heute passt ohne Scrollen auf den Bildschirm (Hell und Dunkel): kleinerer Kopf, kleinere Favoriten-Karten, kürzerer Workout-Builder.
- Run: Karte ohne Straßenraster und ohne dunklen Block, nur die Bäume bleiben; Verlauf einklappbar. Der Intervall-Lauf gilt bei „Lauf starten“ und „Eigener Lauf“ gleichermaßen (beide laufen über denselben Start).

## 2026-10-20 · Fachprüfung zweiter Teil eingearbeitet (Fassung 2026-10-20-59)

- 87 neue Übungen (Drehcrunch mit Cross-Body-Crunch und Obergriff-Trizepsdrücken mit dem vorhandenen Pushdown zusammengelegt). Kabel-Positionen, Sicherheit (Judo Flip, Blick-nach-oben-Dehnung, Ab Wheel, Clean, JM Press, Battle Ropes), Pausen und Zeiten angepasst.
- „Griff / Aufsatz“ jetzt auch bei 15 vorhandenen Kabelzug-Übungen (Latzug, Rudern, Face Pull, Curl, Pushdown u. a.).

## 2026-10-20 · 89 neue Studio-Übungen, Griff-Anzeige, Battle Rope (Fassung 2026-10-20-58)

- Übungen aus Kevins Liste (Brust, Rücken, Schultern, Bizeps, Trizeps, Beine, Core, Unterarme, Nacken-Dehnungen, Cross Jacks), soweit es sie noch nicht gab; Doppelte (z. B. Bench Dip, Step-Up, Plyo Squat, Cable Woodchopper, Farmer's Carry) nicht neu angelegt. Texte in eigenen Worten, vom Sportwissenschaftler geprüft (erste Runde eingearbeitet).
- Neue Gruppe „Cardio & Ausdauer“ im Fitnessstudio mit 9 Battle-Rope-Übungen (4 × 30 s) plus Seil heranziehen.
- „Griff / Aufsatz“ bei Kabelzug- und Stangenübungen: oben auf der Studio-Karte, im Info-Fenster und im Satz-Training.
- Einheitstest um eine Prüfung ergänzt (53).

## 2026-10-20 · Neue Fotos für Timer und Summit (Fassung 2026-10-20-54)

- Timer-Kachel: Box Jump im Nebel-Gym (Timer) und Calisthenics-Park am Meer (Summit), in Hell und Dunkel gleich (ersetzt Läufer-Silhouette und Laufbahn aus Fassung -54/-55). Quellen noch nachzutragen (BilderBloc\Quellen-Frauenbilder.txt).

## 2026-10-20 · Start-Knöpfe als Glas, Play-Symbol im Timer sichtbar (Fassung 2026-10-20-53)

- Run: „Lauf/Fahrt starten“ halbtransparent mit Blur und weißer Schrift statt voll weiß; ebenso die Play-Knöpfe in der Timer-Liste (im Hellen war das Symbol weiß auf weiß) und der Start-Knopf in Summit.

## 2026-10-20 · Run ohne Kringel, Timer und Summit in Glas-Optik (Fassung 2026-10-20-51)

- Run: die Höhenlinien (Kringel) im Hintergrund sind weg.
- Timer- und Summit-Liste: gleicher Hintergrund wie Run (Foto geblurrt), Kopf ohne Foto, Karten und Knöpfe als halbtransparentes Glas mit heller Schrift in jedem Modus.

## 2026-10-20 · Schimmer auf den Training-Kacheln, FAQ in sechs Gruppen (Fassung 2026-10-20-46)

- Training: feine helle Kante und ein Lichtstreifen, der beim Öffnen einmal über die Kacheln gleitet (bei „Bewegung reduzieren“ ruhig).
- FAQ: die 24 Fragen in sechs Gruppen geordnet (Grundlagen, Einstieg und Plan, Dosis und Ausführung, Beweglichkeit und Ausdauer, Ernährung, Sicherheit); Texte unverändert.
- Run-Startseite: Hintergrundfoto weniger weichgezeichnet (11 statt 24 px).
- Fotos mit Frauen nur noch bei den Favoriten (Beine, Rücken, Schultern, Core); Workout-Karte und Katalog zeigen Geräte (Fassung -48).
- Neues Foto (Klimmzug von hinten) bei Favoriten Rücken und Arme (Fassung -49).

## 2026-10-20 · Glas-Optik auf Run, Dauer-Regler, Schleier oben, Quer-Logo, Ukraine-Flagge in Kacheln (Fassung 2026-10-20-45)

- Überrasch mich: Dauer als Schieberegler (10-60 Min, 5er-Schritte).
- Training und Favoriten: leichter Schleier nur in der oberen Hälfte der Karten, die Schrift unten bleibt frei; Fotos bleiben scharf.
- Hell: Kopf auf Heute testweise mit dem Sportplatz am Meer (pexels-14207194, neu-kopf-hell-meer.jpg).
- Run: Karten, Kacheln und Knöpfe wieder als Glas (halbtransparent, Blur); in jedem Modus hell auf dunklem Glas.
- Querformat: BLOC-Zeichen im Timer und auf den Run-Seiten (Countdown und Lauf) sichtbar.
- Ukraine Twist: Flagge auch hinter der Figur in den Kacheln (Suche, Katalog); „Russian Twist“ findet ihn weiter.

## 2026-10-20 · Zwei Fotos mit Frauen (Fassung 2026-10-20-38)

- Zwei Pexels-Fotos (Rückansicht am Kabelzug, Kniebeuge von hinten) in den Bildauswahlen für Workout, Beine und Rücken; Quellen in BilderBlocuellen\-Frauenbilder\.txt\.\
\
## 2026-10-20 · Hell ohne hellen Schleier (Fassung 2026-10-20-37)

- Training und Favoriten: im Hell-Modus kein heller Schleier mehr; die Karten sehen aus wie im Dunkel (Verlauf von unten, weisse Schrift).

## 2026-10-20 · Schleier zurück auf die Ursprungsversion (Fassung 2026-10-20-36)

- Training und Favoriten: Hell wieder mit dem ersten, kräftigen hellen Verlauf von unten; Dunkel und Nacht wieder wie am Anfang (Schwarz-Verlauf, keine Zusätze).

## 2026-10-20 · Fotos scharf, Schleier nur von unten (Fassung 2026-10-20-35)

- Training und Favoriten: oberes Drittel ohne jede Abdeckung, kein Weichzeichner mehr in irgendeinem Modus.

## 2026-10-20 · Schleier in Hell, Dunkel und Nacht gleich (leichte Abstufung) (Fassung 2026-10-20-34)

- Training und Favoriten: Hell wieder wie die zweite Abstufung (leichter: oben fast klar, unten bis 82 %), ohne Weichzeichner und Dunst; Dunkel und Nacht bekommen denselben Verlauf in Schwarz-Blau.

## 2026-10-20 · Hell-Schleier wie am Anfang, Ansagen einklappbar, Rad-Kachel mit eigenen km und kcal (Fassung 2026-10-20-33)

- Hell: Fotos auf Training und bei Favoriten (auch auf Heute) wieder unter hellem Dunst (30 %, unten bis 95 %) und leicht weichgezeichnet; Dunkel unverändert.
- Run: Karte „Ansagen“ einklappbar wie Eigener Lauf und Intervall.
- Run: Kachel oben zeigt je nach Auswahl nur Läufe oder nur Fahrten (km, kcal, Anzahl).
- Workout-Karte auf Training: zuerst Gerätebilder (Hell: Fitnessraum, Dunkel: Hantelreihe) statt Foto mit Person (Fassung -33).

## 2026-10-20 · FAQ-Feinschliff nach Laien-Gegenlesen (Fassung 2026-10-20-17)

- Verletzungs-Frage ohne Wirksamkeitsaussage („in dieser Zusammenfassung die größte Wirkung“, Risiko „lag bei“ statt „sank“). ACSM einmal als „amerikanische Sportmedizin-Gesellschaft“ erklärt. Frage „Wie viel Pause“ mit einer Kernaussage. Doppelungen gekürzt (Umfang in der Plan-Frage nur noch per Verweis, Nieren und Beschwerden in vorhandene Punkte). Einheitstest 51/51.

## 2026-10-20 · FAQ nach Kevins Entscheidung umgebaut: 23 Fragen, neue Ehrgeiz-Fragen (Fassung 2026-10-20-15)

- 23 Fragen: „Was bringt Training überhaupt?“ fasst die Gesundheitsthemen als Zusammenhang zusammen (Leistung / Gesundheit nur als Zusammenhang / bei Beschwerden zum Arzt). Fasertypen (praktisch gefasst) und glykämischer Index (als Nutzenfrage) bleiben. „Wenn du schon länger trainierst“-Hinweise bei sieben Fragen, neue Fragen „Mein Training stockt“ und „Ich habe wenig Zeit“. Der Satzteil „Dünn: Empfehlungen für Diätphasen …“ bei Eiweiß ist entfernt.
- Neue Quellen F71 (Iversen 2021) und F72 (Kerksick 2017) in faq.js und quellen.html. Feste Schlüssel je wichtiger Frage (`id`). Einheitstest 51/51.

## 2026-10-20 · FAQ: Beschriftung „Wie sicher ist das?“ (Fassung 2026-10-20-14)

- Das Label über dem Absatz zur Beleglage heißt jetzt „Wie sicher ist das?“ (Englisch „How sure is this?“) statt „Studienlage“ (`faqStudie` in `texte.js`) – verständlicher für Laien, Inhalt unverändert.

## 2026-10-20 · FAQ gekürzt und geordnet: 26 Fragen, neutrale Titel, Fachwörter erklärt (Fassung 2026-10-20-13)

- Nach dem Laien-Gegenlesen: Doppelungen zusammengelegt (Pause/täglich/Übertraining, Eiweiß, Herz, Knochen/Rücken/Stürze, Fortgeschrittene), 35 auf 26 Fragen. Gesundheitsthemen mit neutralen Titeln („Was zeigen Studien zu …“), der Satz zu Beobachtungsstudien steht einmal im Hinweis oben. Fachwörter an Ort und Stelle erklärt, keine Fragennummern mehr in den Texten.
- Feste Schlüssel je wichtiger Frage in `faq.js` (`id`: nutzen, pause, muskelwachstum, eiweiss, sicherheit, plan, fortgeschritten) für spätere Verlinkung, z. B. vom Reiter „Körper“ zur Plan-Frage. Einheitstest 51/51.

## 2026-10-20 · FAQ komplett überarbeitet: roter Faden, klare Zahlen (Fassung 2026-10-20-12)

- Alle 35 Fragen neu geschrieben: Kurzantwort mit klarer Aussage, Begründung in kurzen Stichpunkten, „Studienlage“ ohne Widerspruch zur Kurzantwort. Jede Zahl hat einen Bezug (z. B. Eiweiß: 0,3 kg mehr magere Körpermasse, 2,5 kg mehr im schwersten Einzelversuch, z. B. 102,5 statt 100 kg).
- Neue Reihenfolge: Einstieg (1–5), Was Training dir bringt (6–14), Muskeln und Technik (15–20), Ernährung (21–26), Sicherheit (27–30), Plan und Fortgeschrittene (31–35). Einheitstest 51/51.

## 2026-10-20 · FAQ: neue Frage zum Drücken und Ablassen (Fassung 2026-10-20-11)

- Neue Frage 20 in „Muskeln & Technik“: Gewicht wegdrücken und wieder ablassen (Tempo, Senkphase, voller Weg, Atmen/Pressatmen, Sicherheit); Quellen F68–F70. Jetzt 35 Fragen. Einheitstest 51/51.

## 2026-10-20 · FAQ: neue Frage „Darf ich jeden Tag trainieren?“ (Fassung 2026-10-20-10)

- Neue Frage 27 in der Gruppe Sicherheit: täglich bewegen ist gut, täglich hart bringt keinen Zusatz; Empfehlung höchstens 2–3 harte Krafttage pro Muskelgruppe und Woche, sonst Gehen, lockere Ausdauer oder Mobility; Zeichen von Überlastung. Fragen ab 27 rücken um 1, jetzt 34 Fragen. Einheitstest 51/51.

## 2026-10-20 · FAQ: Stabilität, Rücken, Gelenke als neue Frage, Reihenfolge der Muskeln klarer (Fassung 2026-10-20-9)

- **Neue Frage 14** „Stabilität, Rücken, Gelenke“: Krafttraining stabilisiert Rumpf und Gelenke, gibt den Knochen einen Reiz und linderte in Studien chronische Rücken- und Knieschmerzen (Quellen F65–F67). Die Gruppe heißt jetzt „Was Training dir bringt“; Fragen ab 14 rücken um 1, jetzt 33 Fragen. Frage 1 und 6 verweisen darauf.
- **Frage 3** nennt die Reihenfolge jetzt als klare Liste (Beine, Rücken, Brust, Schultern, Arme, Bauch) mit Beispiel und Begründung; die Studienlage trennt Belegtes (Übung am Anfang gewinnt mehr Kraft) von Praxis. Einheitstest 51/51.

## 2026-10-20 · FAQ: Frage 1 beantwortet jetzt „Was bringt Ausdauertraining, was bringt Krafttraining?“ (Fassung 2026-10-20-16)

- Die erste Frage vergleicht klar, was Ausdauer und was Kraft bringen (mit Zahlen aus den Studien), was nur eines von beiden bringt, wie beides zusammenwirkt und wie die BLOC-Bereiche dazu passen. Quellen [F1], [F3], [F19], [F46], [F47], [F48], [F63]. Einheitstest 51/51.

## 2026-10-20 · Fragen & Antworten journalistisch neu, 32 Fragen (Fassung 2026-10-20-6)

- **Texte neu geschrieben:** Jede Antwort beginnt mit einer klaren Empfehlung mit Zahlen, dann kurze Stichpunkte und eine Zeile „Studienlage“ (Belegt / Offen). Praxisregeln ohne feste Studienzahl sind als „(Praxis)“ markiert.
- **Neu:** Gruppe „Was Training mit dir macht“ (Kraft, Ausdauer/Laufen, Intervalle, Dehnen/Mobility, Herz und Herzrhythmus, Typ-2-Diabetes, Knochen und Stürze, Stimmung und Schlaf), Gruppe „Sicherheit“ (Warnzeichen, Aufwärmen, Steigerung) und Fragen für Fortgeschrittene (Umfang und Häufigkeit, Periodisierung und Deload, Erholung/Übertraining, Verletzungsvorbeugung, Eiweiß und Energie bei hohem Umfang). Zusammen 32 Fragen in 6 Gruppen.
- **Quellen F47–F64** neu (faq.js und quellen.html DE/EN); alle per Crossref geprüft, Zahlen aus den Zusammenfassungen. `faq.js` wird weiter aus `docs/FAQ-ENTWURF.md` erzeugt (Quellen F1–F46 unverändert übernommen).
- Einheitstest 51/51. Der Schnelltest-Eintrag „Kalender: … abhaken“ schlägt auch auf dem unveränderten Stand 78d8350 fehl (nicht durch diese Änderung).
## 2026-10-20 · Zurück führt immer zu Heute (Fassung 2026-10-20-30)

- Heute ist die oberste Stufe: Wer zu Training, Kalender oder Fortschritt wechselt, hat danach nur Heute dahinter (`HAUPTSEITEN` in `go()`). Der Zurück-Pfeil und die Android-Taste/-Geste führen von dort zu Heute statt durch die zuletzt besuchten Hauptseiten; erst von Heute aus verlässt man die App. Tiefere Seiten gehen wie bisher Schritt für Schritt zurück (Training › Katalog › Training › Heute).

## 2026-10-20 · Hell: sichtbarer Schleier über den ganzen Fotos (Fassung 2026-10-20-29)

- Training und Favoriten bekommen im hellen Design zusätzlich zum Verlauf unten einen gleichmäßigen leichten Schleier (20 %) über das ganze Foto – vorher war nur der untere Rand hell und die Fotos wirkten ohne Schleier.

## 2026-10-20 · Run: einklappbar, Kalorien oben; Hell: Schleier mittlerer (Fassung 2026-10-20-28)

- **Eigener Lauf** und **Intervall-Lauf** auf der Run-Seite sind einklappbar (zu beim Öffnen; die Zeile zeigt die Wahl, z. B. „Halbmarathon · 21,1 km“ bzw. „1:00 / 1:00“; offen/zu bleibt bis zum Schließen der App).
- Die Kachel oben rechts zeigt die **gesamten kcal** aller Läufe und Fahrten (geschätzt, nur mit Körperdaten; sonst ein Link zum Eintragen).
- **Hell**: der Schleier über den Fotos (Training, Favoriten) liegt zwischen der ersten und der zweiten Fassung (unten etwa 0,91, Mitte 0,72).

## 2026-10-20 · Run: Hintergrund exakt wie beim Timer (Fassung 2026-10-20-26)

- Gleicher Ausschnitt (zentriert), gleiche Unschärfe (24 px), Helligkeit .66 und Sättigung 1,25 wie hinter dem Timer; die Abdeckung ist nur noch ein Hauch (10 %), die Lesbarkeit tragen die dunklen Glaskacheln.

## 2026-10-20 · Hell: Fotos auf Training und bei den Favoriten klarer (Fassung 2026-10-20-25)

- Im hellen Design lag über den Fotos der Bereichskarten (Training) und der Favoriten ein sehr dichter heller Schleier, der sie verwaschen wirken ließ. Der Verlauf beginnt jetzt tiefer und ist schwächer (unten etwa 0,86 statt 0,94 Deckkraft); die dunkle Schrift bekommt einen hellen Hof, damit sie lesbar bleibt.

## 2026-10-20 · Run-Karte: Norden oben oder Fahrtrichtung oben (Fassung 2026-10-20-24)

- Auf der Live-Karte schaltet der Knopf oben rechts zwischen **Norden oben** (ganze Strecke im Bild) und **Fahrtrichtung oben** (Ausschnitt um den Standort, etwa 120 m Radius, gedreht; Pfeil im unteren Drittel, kleiner Nordpfeil oben links). Die Richtung kommt aus den letzten gelaufenen Metern (`runKurs`, mindestens 12 m, geglättet); die Wahl bleibt gespeichert (`settings.runKarte`).

## 2026-10-20 · Kalender: Kalenderwoche im Kopf (Fassung 2026-10-20-23)

- Die Woche zeigt oben **KW 43** mit dem Datumsbereich darunter; Wischen nach links bringt KW 44, 45 …

## 2026-10-20 · Kalender: Wischen toleranter (Fassung 2026-10-20-22)

- Wischen im Kalender löst schon ab 50 px aus und verträgt Bewegungen bis etwa 45° (vorher 70 px und fast waagerecht); die Seite lässt waagerechte Wischer dem Kalender (`touch-action: pan-y`). Monatsansicht: Oktober → November → Dezember → Januar …

## 2026-10-20 · Kalender: Wischen (Fassung 2026-10-20-21)

- Im Kalender wechselt **Wischen nach links/rechts** die Woche bzw. den Monat (`kalBlaettern`, dieselbe Logik wie die Pfeil-Knöpfe); die neue Seite gleitet kurz herein, leichte Vibration. Nur deutliche waagerechte Bewegungen lösen aus (mindestens 70 px, kaum senkrecht), nicht beim Scrollen, auf Reglern oder in offenen Fenstern.

## 2026-10-20 · Run: Timer-Hintergrund, Rad bis 200 km (Fassung 2026-10-20-20)

- **Hintergrund**: Run nutzt denselben geblurrten, bläulichen Hintergrund wie der Timer, in jedem Design (auch Hell) mit heller Schrift auf dunkler Abdeckung.
- **Rad**: der Strecken-Regler geht bis **200 km** (5-km-Schritte, keine Marathon-Namen, keine Pace-Vorgabe); beim Wechsel zu Laufen wird die Strecke auf höchstens Marathon gekürzt. Leere Intervall-Karte beim Rad entfällt.

## 2026-10-20 · Run-Aufnahme im hellen Design (Fassung 2026-10-20-19)

- Titel und Zurück-Knopf der Run-Aufnahme stehen im hellen Design in heller Schrift auf dem dunklen Foto (vorher dunkle Schrift auf dunklem Grund).

## 2026-10-20 · Satz-Training: Zusammenfassung mit Steigerung, Vorschläge zum Steigern, besserer Kontrast im Run (Fassung 2026-10-20-18)

- **Fertig** (und der Haken oben) zeigt eine **Zusammenfassung**: je Übung der beste Satz heute und der Vergleich zur Einheit davor (▲ +5 kg · ▲ Wdh. mehr · = gleich · Erstes Mal), darunter Training speichern · Weiter trainieren · Beenden. Der Knopf wird hell, sobald der letzte Satz der letzten Übung eingetragen ist (oder alles geschafft ist).
- **Vorschläge zum Steigern** (`studioSteigerTipp`): gleiche Last seit mindestens 2 Wochen (mindestens 2 Einheiten) → etwa 5 % mehr, auf den Schritt der Übung gerundet; ohne Gewicht 2 Wiederholungen mehr. Zu sehen auf der BLOC-Seite unter der Übung (mit „Übernehmen“) und oben auf der Karte im Wisch-Bereich.
- **Run** (Aufnahme): dunkle Abdeckung über dem Foto, dunkles Glas für Werte, Karte und Knöpfe, helle Schrift, Intervall-Anzeige gut lesbar – auch auf hellem Foto und in jedem Design.

## 2026-10-20 · Fertig-Knopf im Satz-Training, Kalorien nur noch beim Laufen (Fassung 2026-10-20-16)

- **Satz-Training**: unten ein **Fertig**-Knopf, ausgegraut bis der letzte Satz der letzten Übung eingetragen ist, dann hell (Orange) mit kurzem Aufleuchten und Vibration; Antippen zeigt „Training geschafft“ (speichern · weiter · beenden). Die Zusammenfassung erscheint nicht mehr von selbst.
- **Kalorien**: Krafttraining und die anderen Bereiche werden nicht mehr geschätzt (zu ungenau). **Run** zeigt die geschätzten kcal während des Laufens (statt der bpm-Kachel), im Lauf-Ergebnis und im Lauf-Detail: Laufen = Ruheumsatz in der Zeit + 1,036 kcal je kg und km, Rad = MET nach Tempo; nur mit Körperdaten (sonst Link zum Eintragen). Der Rückblick „Dein Monat“ rechnet nur noch das Laufen.
- **Run-Aufnahme** bei Systemdesign (ohne gewählte Helligkeit) ist jetzt immer das dunkle Glas, nicht mehr die weiße Karte.

## 2026-10-20 · Satz-Training mit mehr Rückmeldung, BLOC-Zeichen orange (Fassung 2026-10-20-7)

- **BLOC-Zeichen** im Timer und im Satz-Training orange und größer.
- **Satz-Training**: Satzpunkte je Übung (gefüllt = erledigt, Ring = nächster Satz, springen beim Eintragen auf), Knopf wird kurz orange „Satz N gespeichert“, Ton und Vibration, Vibration beim Einrasten der Karte und in den letzten 3 s der Pause, Punkte oben füllen sich je fertiger Übung. Sind alle Übungen geschafft, erscheint **Training geschafft** mit Zahlen und den Knöpfen Training speichern · Weiter trainieren · Beenden.

## 2026-10-20 · Fortschritt, Training nach Sätzen zum Wischen, Zeiten je Übung im Timer-BLOC, Summit im Glas (Fassung 2026-10-20-5)

- **Reiter „Fortschritt“** (vorher „Körper“): Liniendiagramm-Symbol, Umschalter **Verlauf | Plan** (Verlauf zuerst).
- **Nach Sätzen** (LOS GEHTS auf der BLOC-Seite, auch Tipp auf eine Übung im BLOC): eigener Glas-Bereich (`js/22-satz-training.js`, Route `#satz/<BLOC>/<Nr>`). Eine Karte je Übung, **nach links/rechts wischen**, oben Punkte und „BLOC · 2 / 3“; Gewicht und Wiederholungen per großen Zählern, **Satz eintragen** speichert wie die Übungskarte, danach läuft die Satzpause, bei erreichtem Ziel springt es zur nächsten Übung; Anleitung nur eingeklappt. Die alte Übungskarte bleibt über Katalog und Adresse (`#studio/<id>`).
- **BLOC mit Timer**: je Übung **Sätze, Arbeitszeit und Pause** einstellbar (statt „3 × 8, 40 s“ fest); die Zeilen folgen der Wahl Nach Sätzen | Mit Timer.
- **Summit-Player** im selben Glas-Look wie Timer, Satz-Training und Run.

## 2026-10-20 · Fragen & Antworten als eigene Kachel, Zurück-Pfeile, Run auf einem Bildschirm, hellere Timer-Kulisse (Fassung 2026-10-20-4)

- **Fragen & Antworten**: eigene Kachel unter Run auf Training (Kaffee-Foto, `img/neu-faq.jpg`, Foto vom Nutzer aus Pexels), öffnet die Seite `#faq` mit allen Fragen aufgeklappt; unten auf Training steht der Bereich nicht mehr.
- **Zurück-Pfeil** jetzt auch bei Training, Kalender und Körper (oben links, führt zu Heute).
- **Run während des Laufens**: Zeit kleiner, vier Werte in einer Reihe, flachere Karte, drei Knöpfe nebeneinander – alles auf einem Bildschirm.
- **Run-Start**: Pace-Vorgabe (3:00 bis 10:00, 5-s-Schritte) und Ansagen (aus bis alle 10 km) per Schieberegler; die Zähler beim Intervall-Lauf sind auch im Hellen lesbar.
- **Timer läuft**: helles, bläuliches, geblurrtes Meer-Foto statt des dunklen Herbstwalds. **Hell-Modus**: Mobility & Stretch und Summit zeigen dieselben Bilder wie im Dunkel.

## 2026-10-20 · BLOC-Seite: erst wählen, wie trainiert wird (Fassung 2026-10-20-2)

- Über **LOS GEHTS!** steht jetzt die Wahl **Nach Sätzen | Mit Timer** (`p.startArt`, sonst die Art, mit der der BLOC angelegt wurde; `planStartArt`). Nach Sätzen öffnet die erste Übung (Gewicht × Wiederholungen eintragen), Mit Timer startet das Training mit Timer. Behebt: „Nach Sätzen“ + Selber bauen + Los geht’s landete im Timer.

## 2026-10-20 · Muskel-Auswahl, Workout-Planer mit BLOCs, Run mit Live-Karte, Plan mit mehreren Workouts, ein Plus beim Timer (Fassung 2026-10-20-1)

Aufgabenliste von Kevin (Promt2 plus Nachrichten).

- **Muskel** (Katalog-Filter, Selber bauen, Überrasch mich): „Gruppe“ und „Körper“ sind eine Auswahl. Chips (Brust, Rücken, Schultern, Arme, Bauch & Rumpf, Beine & Po) und Körperfigur sind gekoppelt (Chip wählt alle Zonen der Gruppe, die Figur leuchtet, und umgekehrt); „Cardio & Ausdauer“ lässt die Figur orange leuchten. `kkMuskelHTML`, `kkGrpToggle` in js/08-koerperkarte.js; gespeichert werden nur Zonen (alte Gruppen-Filter werden beim Start in Zonen umgerechnet). **Überrasch mich** hat dieselbe Auswahl (Muskel, Ausrüstung, Dauer) statt der Kategorie-Kacheln; `buildSurprise` filtert nach Zonen bzw. Cardio.
- **Workout-Planer** (BLOC-Seite): ein großes **LOS GEHTS!** startet direkt den Training-Bereich (Glas-Look, Satz eintragen = Gewicht × Wiederholungen werden gespeichert); Satz-/Timer-Umschalter und Timer-Start je Übung entfallen; oben Favorit · Kopie · Teilen; unten **Weitere BLOCs** (neu bauen, aus Meine, aus dem Katalog). Zwischen zwei BLOCs fragt das Training „Bereit für BLOC 2?“ (Pause mit Überspringen; `it.bloc` → `nextBloc` → `step.titel`). `p.folge`, `planMw`, `planKetteIds`.
- **Run**: Strecke per Regler von Frei bis Marathon (Halbmarathon bei 21), als **Lauf-Workout speicherbar** (`settings.runWorkouts`); Auto-Pause fest 5 s (keine Einstellung); Verlauf steht unten; neues Hintergrundfoto (Pexels 16949283, Läufer im Gegenlicht); Chips der Ansagen wieder lesbar; **Live-Karte** (`runLiveKarte`): selbstgezeichnete Straßen und Bäume als Kulisse, leuchtende Strecke, pulsierender Standort; keine Kartendaten, kein Netz.
- **Plan** (Körper): je Tag mehrere Workouts, Überblick als Raster (Wochen × Tage), große Tipps einklappbar mit Verweis auf Fragen & Antworten. Dasselbe Einklappen bei der Workout-Beschreibung im Deckblatt.
- **Timer**: ein einziges Plus „Neuer Timer“ (Zirkel › Runden › Übungen mit Anzahl, Zeit, Pause); Timer-Workout aus Blöcken und Einzelblöcke entfallen auf der Seite (vorhandene Daten bleiben).
- **Sonstiges**: Überrasch mich auf Heute wieder orange; Favoriten ohne Foto tragen ein Symbol; Workout-Listen kompakter; Mobility-Foto getauscht (ohne Gesicht im Profil). Schnelltest an die neuen Wege angepasst (Kalender-Prüfung schlägt auch in der Vorgängerfassung im Testfenster fehl).

## 2026-10-20 · Fragen & Antworten: Frage 18 präzisiert (Fassung 2026-10-19-10)

- Frage 18: „BLOC schlägt deshalb keine Programme nach Geschlecht vor“ (statt „trennt nicht nach Geschlecht“); nur die Kalorien-Schätzung nutzt das Geschlecht optional für den Ruheumsatz. Entwurf und `faq.js` angepasst (Deutsch und Englisch).

## 2026-10-20 · Fragen & Antworten: fünf neue Fragen, neue Gruppe „Trainingsplan & Unterschiede“ (Fassung 2026-10-19-9)

- **Neu** (aus `docs/FAQ-ENTWURF.md`, Fassung 3 der Sportwissenschaft-Sitzung): Frage 14 Eiweiß, 15 wann mehr Eiweiß, 16 Pulver/Riegel (Gruppe Ernährung); neue Gruppe **Trainingsplan & Unterschiede** mit 17 Trainingsplan aufbauen (Blocklänge, Entlastungswoche, „Was folgt danach?“; Praxisaussagen sind als nicht belegt gekennzeichnet) und 18 geschlechtsspezifische Unterschiede. Quellen F29–F46 neu (F1–F28 unverändert), Liste in der App und in `quellen.html` (DE/EN).
- Frage 17 nennt, dass die **Plan-Seite im Reiter „Körper“** auf diese Antwort verweist (die Verlinkung baut die Design-Sitzung).
- Prüfung: die Texte sind in eigenen Worten, Zahlen nur mit Quelle, Hinweise zu Nieren, Älteren und Erkrankungen verweisen an Ärztinnen/Ärzte. Drei Formulierungen mit „ich habe gelesen“ im Entwurf habe ich neutral gefasst („in den ausgewerteten Quellen“), weil die App keine Ich-Stimme hat. Prüfvermerke („geprüft“, „Zusammenfassung gelesen“) stehen nicht in der App-Liste.
- `faq.js` erzeugt mit dem Umwandlungs-Skript (nicht von Hand ändern); die Einheitstest-Prüfungen sind für beliebig viele Fragen und Gruppen offen.

## 2026-10-20 · Hintergrundfotos für Run und Training (Fassung 2026-10-19-8)

- **Run** (Modern): hinter der Seite liegt jetzt das Waldlaufpfad-Foto (Pexels 31932520, 400×600, geblurrt) in Hell und Dunkel statt der bisherigen zwei Fotos.
- **Training** (Timer-Player, Modern): geblurrtes, abgedunkeltes Herbstwald-Foto (Pexels 35506330) hinter dem Glas; beide Bilder im Vorabcache. Keine Person, kein Gesicht erkennbar. Summit-Player folgt.

## 2026-10-19 · Run: eigener Lauf mit Pace-Vorgabe, Aufnahme im Glas-Stil, FAQ als Ganzes einklappbar (Fassung 2026-10-19-7)

- **Eigener Lauf** (Run-Seite, Modern): Ziel-Distanz (frei, 3, 5, 10, 15, 21 km) und optional eine **Pace-Vorgabe**; nach jedem Kilometer sagt die App (auch ohne regelmäßige Ansage), wie viele Sekunden man zu langsam oder schneller als geplant war (`runPaceHinweis`, Einheitstest). Weniger Text auf der Seite (Beschreibungen ausgeblendet).
- **Aufnahme** (Modern): schwebende Texte auf dem geblurrten Foto statt weißer Karte, Glas-Kacheln für Strecke, Pace, Tempo jetzt und einen bpm-Platzhalter, Glas-Knöpfe (Abdunkeln, Pause, Beenden); „Ansagen aus“ ist als Lautsprecher-Symbol oben rechts.
- **FAQ** unten auf Training: der Bereich lässt sich als Ganzes ein- und ausklappen; der Hinweis „keine Beratung“ bleibt sichtbar.
- Zusammen mit den Paketen der anderen Sitzungen (Einführung, Einstellungen, Klänge, BLOC-Namen: -19-5/-6 und 3ba0680; Figur Thoracic Rotation).

## 2026-10-19 · Figur Thoracic Rotation klarer (Fassung 2026-10-19-6)

- **Brustwirbelsäule drehen (Vierfüßler)**: Die drehende Hand ist jetzt der vordere, volle Arm (vorher war es der blasse hintere, deshalb wirkte die Figur unklar). Start: Ellbogen unter der Brust Richtung Boden, Hand hinter dem Kopf, Blick zum Boden. Ende: Brustkorb geöffnet, Ellbogen zur Decke, Kopf nach oben (Blick folgt dem Ellbogen). Nur die Posen in daten.js geändert, kein Animations- oder Skelettcode.
## 2026-10-19 · Training im dunklen Glas-Design, FAQ einklappbar (Fassung 2026-10-19-5)

- **Timer-Training (Player)** in Modern: in allen Phasen dasselbe ruhige dunkle Glas-Design mit sanften Farbverläufen, die Farbe wechselt nicht mehr zwischen Übung und Pause (nur die Beschriftung); Texte schweben ohne Kachel, der Trennstreifen (Fortschrittsleiste) entfällt, oben steht klein BLOC, Knöpfe als Glas, Hauptknopf weiß; die Figur ist während der Übung größer (`phaseVars` in js/19-timer-motor.js, CSS in layout-new.css). Classic-Pfad unverändert (nur Schnelltest).
- **Fragen & Antworten** unten auf Training ist als Ganzes einklappbar (zu beim Öffnen).
- Offen (Hintergrundfoto Herbstweg für Timer/Summit wartet auf die Recherche; Summit-Player und Run-Live folgen).

## 2026-10-19 · Einführung mit Sprache, Name, Gewicht, Größe und Aufbau; schlankere Einstellungen; zwei Klänge (Fassung 2026-10-19-7)

Aufgabenliste von Kevin, Teil „IT“.

- **Einführung** (`js/14-einfuehrung-sicherung.js`): neue Seiten vorn – **Sprache** (wirkt sofort), **Über dich** (Name, Gewicht, Größe; freiwillig, nur lokal; `settings.name`, `settings.koerper.kg/cm` – dieselben Felder wie die Kalorien-Schätzung; Eingaben werden geprüft, unplausible Werte überschreiben nichts; Name auch in den Körperdaten änderbar, erscheint in der Begrüßung auf Heute) und **So ist BLOC aufgebaut** (selbstgezeichnetes SVG-Schaubild Übung → BLOC → Workout → Trainingsplan nach Kevins Vorlage, Beschriftung für Screenreader). Danach wie bisher Katalog, Aufwärmen, Summit.
- **Einstellungen** (`js/17-aufwaermen-einstellungen.js`): Fokus „Bereiche unter Training“ samt Reihenfolge-Knopf und die Aussehen-Auswahl entfernt; weniger Text (Beschreibungen unter den Schaltern weg). Ein früher gespeichertes `settings.fokusAus` bleibt liegen, wird aber nicht mehr beachtet (alle Bereiche sichtbar). **Countdown-Pieps und Bildschirm anlassen sind immer an** und nicht mehr einstellbar (die Abfragen entfallen); **Vibration** nicht mehr einstellbar, bleibt beim bisherigen Wert (Standard: an) – Kevins Satz dazu war mehrdeutig („Vibration aus“?), bitte bei Gelegenheit bestätigen.
- **Klänge**: nur noch **Klangschale** und **Triangel** (Standard Klangschale); `migrateSound` setzt jeden anderen gespeicherten Klang auf Klangschale (Xylophon, Glocke u. ä. auf Triangel). „Raumklang“ bleibt.
- **Namen**: neue Pläne heißen „BLOC 1, BLOC 2 …“ (`planDefault`, Deutsch und Englisch); gespeicherte Namen bleiben.
- **„Lange nicht gesichert“**: BLOC macht ohnehin alle 7 Tage einen Schnappschuss auf dem Gerät (IndexedDB, `snapPruefen`). Die Datei-Erinnerung erscheint deshalb nur noch bei eigenen Inhalten, **nach 60 Tagen** ohne Datei (vorher 14), erst nach einem ersten Schnappschuss; das × blendet sie **30 Tage** aus (vorher nur für die Sitzung). Text kürzer („Datei-Sicherung“).
- Tests: Einheitstest +5 Prüfungen (Klänge, Namen, Einführung/Profil, Schaubild, Erinnerung); Schnelltest an die entfallenen Einstellungen angepasst.

## 2026-10-19 · Nur noch Modern, Reiter „Körper“ mit Plan und Fortschritt, ruhigere Karten (Fassung 2026-10-19-4)

Aufgabenliste von Kevin (Wochenend-Dokument), erster Teil. Vorab gesichert: Git-Tag `sicherung-vor-modern-only-2026-10-19` auf GitHub und Zip `BLOC-Sicherung-2026-10-19-vor-Modern-only.zip` auf dem Desktop (Stand Fassung 2026-10-19-3).
- **Classic abgeschafft**: es gilt immer Modern (`LAYOUT_NUR_MODERN` in js/03-router.js; alte Stände ohne `settings.layout` werden zu Modern). Nur der Schnelltest (`?schnelltest`) prüft noch die alten Wege und bleibt in Classic; sie sind jetzt unerreichbarer Code und werden später entfernt, sobald der Schnelltest auf Modern umgeschrieben ist.
- **Untere Leiste** wieder schwebend und leicht transparent wie vorher (die feste, deckende Variante aus -25 ist zurückgenommen). Vierter Reiter heißt **Körper** (Figur-Symbol) statt Fortschritt.
- **Körper** (neu, js/21-koerper.js): zwei Seiten unter einem Reiter, umschaltbar: **Plan** (Tipps, Wochen 4/6/8/12, Trainingstage, je Tag ein Workout aus Meine Workouts/Katalog/Run/Zufall, „In den Kalender eintragen“ legt normale Kalender-Einträge ab dem nächsten Montag an) und **Fortschritt** (die bisherige Statistik). Einheitstest für die Planlogik.
- **Heute**: „Aus deinen Favoriten wählen“ erscheint nicht mehr; die Karte steht nur noch, wenn heute etwas geplant ist. Favoriten haben nur noch bei Workouts aus dem Katalog ein Foto, sonst eine ruhige Glas-Kachel mit Namen.
- **Überrasch mich** dezenter (Baukasten: Karte wie „Selber bauen“ mit kleinem orangen Rahmen; Heute: beide Knöpfe als Glas, „Überrasch mich“ mit orangem Rahmen). Gewählte Übungen im Baukasten bekommen einen leichten grünen statt grauen Rahmen.
- Bild `neu-p-liegestuetz-halle` (Personen mit Masken) entfernt und durch `neu-p-liegestuetz-feld` ersetzt.
- Offen aus der Liste: Glas-Optik für Training/Run/Timer/Summit, Muskel-Filter mit Körperfigur, Timer vereinfachen, Workout-Planer, Listen kleiner, Run-Konfiguration; Einführung, Einstellungen, Sicherungshinweis, Namen „BLOC n“ (IT-Sitzung), FAQ-Erweiterung und Thoracic-Rotation-Figur (Sportwissenschaft), Hintergrundfotos (Recherche).

## 2026-10-19 · Favoriten: Bauch/Core und Brust mit passenden Fotos (Fassung 2026-10-19-3)

- Fünf neue Pool-Fotos (Pexels, 600–900 px, 50–73 KB, Gesicht nicht erkennbar geprüft): **Bauch/Core** hell `neu-h-core-1` (hängendes Beinheben), `neu-h-core-2` (Ab-Roller), dunkel `neu-d-core` (Ab-Wheel); **Brust** hell `neu-h-brust-1` und `-2` (Liegestütze im Park). Bildausschnitt je Foto gesetzt. Nicht übernommen: drei Fotos, auf denen ein Gesicht im Profil erkennbar wäre (`4803930`, `4804031`, `416747`).
- Die Pool-Bilder werden bewusst erst beim ersten Ansehen zwischengespeichert (nur die Titelbilder stehen im Vorabcache).

## 2026-10-19 · Fragen & Antworten unten auf der Seite Training (Fassung 2026-10-19-1)

- **Neu**: 13 Fragen in drei Gruppen (Grundlagen & Einstieg · Trainingseffekte & Mechanik · Ernährung & Stoffwechsel), Deutsch und Englisch, je Frage Kurzantwort, Stichpunkte, „Studienlage“ und Quellen. Aufklappbar mit `<details>`/`<summary>` (Tastatur und Screenreader ohne eigenes Skript), alles zugeklappt; der Hinweis „allgemeine Informationen für gesunde Erwachsene, keine individuelle Beratung, Stand Oktober 2026“ steht immer sichtbar darüber. Dazu ein aufklappbares **Quellenverzeichnis** (27 Quellen, Links nur als Textlinks, öffnen erst beim Antippen, `rel="noopener noreferrer"`, ohne Referrer).
- **Inhalt**: `faq.js` (`window.BLOC_FAQ`), erzeugt aus `docs/FAQ-ENTWURF.md` (Fassung 2; Texte der Sportwissenschaft-Sitzung, in eigenen Worten, Quellen nur genannt). Änderungen im Entwurf machen und neu erzeugen. Anzeige: `faqHTML()` in `js/05-suche.js`, Beschriftungen in `texte.js` (`faq…`), Stile am Ende von `app.css`. Quellen heißen in der App **F1–F28** (Nummer 13 frei), weil `quellen.html` eigene Nummern hat; dort steht die Liste zusätzlich in beiden Sprachen.
- Seite Training gibt es nur im Aussehen „Modern“; im Aussehen „Classic“ ist der Bereich nicht sichtbar. Nichts wird nachgeladen oder gespeichert.
- Einheitstest: zwei neue Prüfungen (Daten vollständig/zweisprachig, Anzeige zugeklappt, Links nur https mit noopener); der Lauf wartet nach Prüfungen mit Versprechen 250 ms (Wettlauf zwischen zwei Test-Rahmen).
- Offen: Quellen am Original lesen (Kevin), ACSM-Stand 2026 und WHO sind am Original bestätigt, die übrigen Quellen nur per Crossref auf Existenz geprüft.

## 2026-10-19 · Run (Modern): Stil nach Vorlage – Höhenlinien, Glas-Kacheln, weißer Start, Strecke mit Zwischenwerten (Fassung 2026-10-19-2)

- **Start-Seite**: hinter dem geblurrten Foto liegen selbst berechnete **Höhenlinien** (`runHoehenlinien`, reine Zierde, keine Kartendaten); Strecke gesamt und Anzahl der Läufe als **Glas-Kacheln**, Laufen/Rad als Glas-Pille, **großer weißer Start-Knopf**. Glas = halbtransparent mit Blur, ohne `backdrop-filter` eine deckendere Fläche.
- **Lauf-Details**: die Strecke als weiße Linie mit Punkten bei jedem Kilometer und kleinen Glas-Chips „3 km · 5:35 /km“ (`runStreckeNeu`, aus den vorhandenen Punkten und Kilometerzeiten; Chips nahe am rechten Rand klappen nach links). Statt der Puls-Werte der Vorlage stehen Pace-Werte, weil die App keinen Puls misst. Keine Kartenkacheln, kein Netz.
- Hell und Dunkel (inkl. „System“) geprüft; Fassung 2026-10-19-2. Außerdem: der Kalender-Test im Schnelltest nimmt einen Tag ohne „heute“, weil an einem Tag mit erledigten Trainings (montags nach den Vortests) das Abhaken ein Zurücknehmen war.

## 2026-10-16 · Favoriten: Bilder passend zum Inhalt (Fassung 2026-10-16-26)

- **Foto-Wahl nach Inhalt** (Modern, Heute › Favoriten): `workoutThema()` (js/08-koerperkarte.js) bestimmt je Workout das Thema, zuerst über den Namen (Bauch/Core, Rücken/Zug, Brust, Schulter, Arme, Beine; „Cardio/Full Body/HIIT“ = gemischt), sonst über die größte Muskelgruppe. Mobility bekommt Dehnen-Bilder, Timer Hallenbilder, Fitnessstudio-Workouts Studio-Bilder; je Thema ein eigener Pool in Dunkel und Hell (`FOTO_POOL`/`FOTO_POOL_HELL`, `favFotoPool` in js/10-gemeinsam.js). Kein Bild doppelt, solange es freie gibt. Neuer Einheitstest (38).
- Helle Favoritenkarten: der warme Verlauf beginnt früher und deckt die Schrift besser.
- Noch offen: weitere Motive (Bauch/Core dunkel, Brust hell) – dafür fehlen passende Fotos im Vorrat; die Recherche läuft.

## 2026-10-16 · Modern: feste Leiste, Run-Seite mit Blur-Foto, lockere Begrüßung, Classic/Modern (Fassung 2026-10-16-25)

- **Untere Leiste** (Modern) jetzt fest am unteren Rand über die volle Breite mit eigenem, deckendem Hintergrund (Rückmeldung eines Testers): nichts scheint mehr durch, Pille und runder Hauptknopf bleiben, die Seiten haben unten Polster.
- **Run-Seite** (Modern): das Läuferfoto liegt geblurrt hinter der ganzen Seite (dunkel: Gegenlicht-Läufer `bereich-run.jpg`, hell: Waldweg `neu-h-trail.jpg`, Pexels 32798750), Kopf ohne eigenes Foto, Statistik und Verlauf als Karten; **während des Laufens** steht alles in einer weißen Karte (im dunklen Modus bleibt sie weiß, „Nacht“ bleibt dunkel).
- **Begrüßung** auf Heute: statt „Guten Morgen/Tag/Abend“ lockere Varianten (Moin, Servus, Grüß dich …; Englisch: Hey, Hi there …) aus `gru…Liste` in texte.js, pro Tag und Tageszeit stabil.
- **Umbenannt**: „Klassik“ heißt jetzt **Classic**, „New“ heißt **Modern** (Einstellungen, Texte, README); die Speicherwerte `classic`/`new` bleiben, alte Stände laufen weiter.
- Offen: Karten-Ansicht der Lauf-App nach Referenzbild (liegt mir nicht vor, eine echte Karte bräuchte Netz), FAQ-Bereich (wartet auf den Entwurf der Sportwissenschaft), Bilder inhaltlich den Workouts zuordnen (folgt).

## 2026-10-16 · Hell: helle Karten und Fotos, Gerätechips, Kalender-/Katalog-Kopf, Lesbarkeit (Fassung 2026-10-16-24, Nummer -23 hatte zuvor schon die Tempo-Korrektur der Figuren)

- **Geräte-Chips** unter der Figur im Info-Fenster einer Übung (Symbol aus `EQUIP_ICON` plus Name der Ausrüstung, DE/EN über die vorhandenen Gerätenamen); im Timer-Fenster (live) keine. Neuer Einheitstest (37).
- **Hell**: Karten auf Training und Favoriten als helle Karte (Foto oben, unten warm-heller Verlauf, dunkle Schrift); `FOTO_POOL_HELL` (10 neue Fotos `img/neu-h-*.jpg`, 900 px, 30–78 KB) wird im hellen Modus statt des dunklen Pools zugeteilt, jeweils mit Bildausschnitt (`FOTO_FOKUS`). Run bleibt in beiden Modi beim klassischen Läuferbild; Baukasten und Titelbilder unberührt. Vorrat: BilderBloc (Pexels), Belege liegen in den Quellenlisten, `quellen.html` noch offen.
- **Kalender und Katalog** (New) bekommen einen Fotokopf (`neu-d-kalender`/`neu-d-katalog` dunkel, im Hellen `neu-h-kettlebell`/`neu-h-halle`), `bereichKopfNeuHTML` mit Option `opt`. Die Wochenansicht holt den heutigen Tag beim Öffnen ins Bild, wenn er unter der Leiste läge.
- **Lesbarkeit**: „Meine Woche“-Untertitel bricht um statt abzuschneiden; Heute-Kopf im Hellen: Datum mit hellem Schein, Logo dunkleres Orange (3,7:1), Kopfsymbole als helle Kreise; Hinweiskarte „Damit deine Daten nicht verloren gehen“: Text, × und Link ≥ 4,5:1 (`--link-ink`).
- Die sechs neuen Titelbilder stehen im Vorabcache (`GRUNDGERUEST`), die übrigen helle Fotos werden beim ersten Anzeigen geladen.

## 2026-10-16 · Figuren feiner („Klein“) (Fassung 2026-10-16-22)

- **Strichfiguren** etwas feiner und ruhiger, nur CSS in `app.css` (Block „Strichstärken der Figur“, Variablen `--illu-strich` 5,2 · `--illu-rumpf` 8,4 · `--illu-brust` 11 · `--illu-hals` 4,4 · `--illu-boden` 1,8; vorher 6 / 9,5 / 12,5 / 5 / 2). Zum Zurücknehmen die Werte ersetzen.
- **Boden**: bei kleinen Figuren durchgezogen und dünn, bei großen (Übungsinfo, Timer-Vorschau, Summit-Karte) gepunktet. **Hinterglieder** lesbarer (Deckkraft .55 statt .45).
- Die **Lücke um den vorderen Arm** (Maske) folgt jetzt der Armstärke (Strich + 3, also gleich breit wie vorher); kein JS geändert, Posen (`daten.js`) und Timer-Farben unberührt.
- Der **Schnelltest** startet mit `?schnelltest` weiter im klassischen Aussehen (seit -18 beginnt ein frischer Start sonst in New + Dunkel und die klassischen Prüfungen schlugen fehl); 39/39 und Einheitstest 36/36.
- Bewusst nicht dabei: oranger Kopf, Muskelzonen-Farbe, Gerätesymbole, Körperkarte (Mockup liegt außerhalb von BLOC, wartet auf Entscheidung).

## 2026-10-16 · New: Bildausschnitt je Foto, New + Dunkel als Start (Fassung 2026-10-16-18)

- **Bildausschnitt**: `FOTO_FOKUS` / `fotoFokus` in `js/03-router.js` legt je Foto fest, welcher Streifen auf den flachen Karten und Kopfbildern sichtbar bleibt; Summit zeigt jetzt Reck, Meer und Radfahrer statt nur Himmel. Das doppelte Reck-Foto (`neu-p-freiluft-leiter`) ist aus dem Summit-Pool entfernt.
- **Frischer Start** (nichts gespeichert oder „Alles zurücksetzen“): Aussehen **New** und Helligkeit **Dunkel** (`frischDB` in `js/01-basis.js`). Bestehende Stände und Sicherungen ohne diese Felder bleiben Klassik/unverändert.

## 2026-10-16 · New: mehr Luft, Kopffoto wie Training, ruhige Run-Seite (Fassung 2026-10-16-17)

- **Abstand** zwischen den Bereichskarten auf Training 20 px.
- **Kopffoto der Bereichsseiten** ist dasselbe Bild wie die Karte auf Training (`bereichFotosNeu`, gemeinsame Zuteilung, wechselt täglich, kein Bild doppelt). Run bekommt im Kopf ein Foto aus dem Run-Pool, die Karte auf Training bleibt ohne Foto.
- **Run-Seite** ruhiger: keine Karte um die Kilometerzahl, flache Verlaufszeilen, Papierkorb dezent.

## 2026-10-16 · New: Timer, Summit, Mobility und Run wie im Entwurf, Run ohne Foto (Fassung 2026-10-16-15)

- **Kopf der Bereichsseiten** in New (`bereichKopfNeuHTML`, `js/05-suche.js`): Foto mit Zurück (führt zu Training) und Suche, darunter Zeile in Großbuchstaben und großer Titel; das „?“ der Seite sitzt rechts daneben. Gilt für Timer, Summit, Mobility & Stretch und Run.
- **Timer-Seite**: große Abschnittstitel, flache Zeilen mit großem Play-Kreis (Blöcke kleiner und grau), Seitentext ans Ende gestellt.
- **Reiter als Pille** (`.rz`) auf Summit, Mobility & Stretch und Workout.
- **Run auf Training ohne Foto**: ruhige dunkle Karte mit eigenen Höhenlinien (SVG, keine Karte, keine Daten).
- Favoriten-Fotokarten auf Heute kleiner (132 × 156 px statt 156 × 196) und der Foto-Kopf niedriger (228 px Mindesthöhe statt 300); Meine Woche liegt weniger tief im Foto und ist etwas größer (Fassung 2026-10-16-16).
- Hinweis: Der Schnelltest „drei Timer in 40 Minuten sind ein Training“ schlägt zwischen 00:00 und 00:40 fehl, weil die Einträge dann vor Mitternacht liegen; das ist unabhängig von der Änderung.

## 2026-10-16 · New: minimalistischer (Fassung 2026-10-16-10)

- Nach der Durchsicht des UX-Designers (nur CSS, Block „Minimal“ am Ende von `layout-new.css`): ein gemeinsamer Foto-Verlauf (`--foto-fuss`) statt mehrerer Lagen und Bereichsschimmer, keine Ränder und Schatten auf Fotokarten (Schatten nur für Pille und Hauptknopf), kein Textschatten, Symbolfelder neutral außer Workout (orange) und Mobility (grün), Pfeil ohne Kreis, Kopfsymbole und Woche ohne Glas, Kopf-Verlauf auf zwei Lagen (Gruß bleibt auch in Hell lesbar), Builder-Foto ohne Weichzeichner, `.gn-play` nur als orangenes Dreieck (der Hauptknopf ist der einzige gefüllte Kreis).

## 2026-10-16 · New: ein Hauch Farbe auf Training und bei den Favoriten (Fassung 2026-10-16-8)

- Bereichskarten auf Training im bisherigen dunklen Foto-Stil, dazu je Bereich ein zarter Farbschimmer (Orange Workout, Grün Mobility, Blau Timer, Gold Summit, Violett Run); farbige Symbolfelder nur bei Workout und Mobility, die übrigen einfarbig (Fassung 2026-10-16-9). Favoriten tragen dieselben Farben nur als schwacher Schimmer von unten (`data-art`). Zwischenstände mit stärkerer Farbe waren zu bunt.

## 2026-10-16 · Feinauswahl sichtbar, Fotos nach Ort (Fassung 2026-10-16-5)

- **Überrasch mich › Feinauswahl**: Beim Aufklappen springt das Fenster jetzt so, dass die Feinauswahl oben steht und ihr Inhalt zu sehen ist. Vorher klappte sie zwar auf, der neue Inhalt lag aber unter dem Fuß der Leiste und wirkte, als passiere nichts (`spFeinZeigen`, `js/13-teilen-editor.js`).
- **New, Fotos nach Ort**: Workouts aus dem Fitnessstudio (mindestens eine Übung mit Geräten, `katWoOrt`) bekommen Studio-Bilder (Hanteln, Gewichtsblock, Halle), Freiluft-Workouts Anlagen und Meer; das Freiluft-Pool enthält kein Studio-Bild mehr. Reichen die Bilder einer Art nicht, kommen zuerst verwandte Arten dran, dann alle (Fassung 2026-10-16-4, mit `fotosZuteilen`).

## 2026-10-16 · New: kein Foto doppelt (Fassung 2026-10-16-3)

- **`fotosZuteilen`** (`js/03-router.js`, Pool `FOTO_POOL`): Favoriten und die Bereichskarten auf Training bekommen ihre Fotos so zugeteilt, dass kein Bild doppelt vorkommt, solange es freie gibt. Erst das nächste freie Bild der eigenen Art (ab einem festen Startpunkt), danach das nächste freie aus allen anderen. Die Vergabe läuft nach Schlüssel sortiert, damit sie stabil bleibt. Geprüft mit 20 Favoriten gleichzeitig: 20 verschiedene Bilder.

## 2026-10-16 · New: Heute wie im Entwurf (Fassung 2026-10-16-1)

- **Kopf von Heute** in New: Foto-Kopf (`img/neu-kopf.jpg`) mit dem BLOC-Schriftzug oben links, Symbolen oben rechts (Hell/Dunkel/Nacht, Suche, Einstellungen), Datum und Gruß (Guten Morgen/Tag/Abend, ohne Namen: die App kennt keinen); oben links abgedunkelt, warmer Verlauf von rechts unten, unten weich in die Seite übergehend. Die Woche liegt darüber (`.woche-neu`).
- **Karte „Heute geplant“** (`heroNeuHTML`): kompakt mit rundem Start-Knopf; ohne Plan „Bereit für dein Training?“ (gleiche Logik wie der Kopfblock, gleiches `data-herostart`).
- **Favoriten** als Fotokarten in einer Reihe zum Wischen (156 × 196 px, `favItemsHTML`): Foto nach Art (Timer, Mobility, Workout Freiluft/Studio, Summit), Bereich, Name, Dauer. Danach der Workout-Builder.
- Neue Fotos `img/neu-kopf.jpg`, `img/neu-freiluft.jpg` und ein Pool `img/neu-p-*.jpg` (in `sw.js` vorab gespeichert). Favoriten nehmen je Art ein stabil gewähltes Foto aus dem Pool (gleicher Favorit = gleiches Bild); die Bereichskarten auf Training wechseln ihr Foto von Tag zu Tag (Fassung 2026-10-16-2).

## 2026-10-15 · Durchsicht mit vier Prüfern: Fehler und Kontraste behoben (Fassung 2026-10-15-9)

- **Layoutwechsel** in den Einstellungen zeichnet jetzt auch die untere Leiste neu (vorher blieb die alte Leiste stehen, bis man weiternavigierte).
- **Rekord**: mehr Wiederholungen bei gleichem Bestgewicht zählt als Rekord (`wBest` in `studioBestwerte`), auch über 10 Wiederholungen; Einheitstest dazu und zu `migrateTheme`.
- **New**: Hauptknopf im Kalender nimmt in der Wochenansicht „heute“ (nicht den zuletzt im Monat gewählten Tag); ohne Workout (Fokus) kein Start-Knopf und kein Bauen-Eintrag zu ausgeblendeten Bereichen; Hell/Dunkel-Knopf läuft Hell → Dunkel → Nacht; `#training` in Klassik führt zu Heute; `builderAuto` wird außerhalb des Baukastens gelöscht; Reihenfolge der Bereiche auch in Einstellungen › Fokus, zeichnet Training neu, Texte nennen „Training“ statt „Startseite“.
- **Kontrast/Formen** (`layout-new.css`): aktiver Reiter in Hell mit `--accent-ink`, Hauptknopf mit `--accent-ink`, Pille 91 % deckend mit Rückfall ohne `color-mix`, Fotokarten mit stärkerem Verlauf und Textschatten, `.btn`-Padding mit Spezifität 0 (Kompaktleisten gewinnen wieder), Wochenpunkte „frei“ mit sichtbarem Ring, Kalenderpunkte wieder 16 px, Kopfsymbole 48 px, Builder-Foto mit 1,5 px Weichzeichner, Beschriftung der Reiter kürzt statt zu überlaufen.
- **Texte**: WHO-Hinweis vollständig und ohne „keine Diagnose“, Pace-Tendenz beschreibend („Im Schnitt … schneller … Strecke, Wetter und Tagesform spielen mit“), Nacht-Hinweis ohne Wirkversprechen, Sicherungs-Hinweis allgemeiner, Steigerungsvorschlag mit „nur, wenn die Technik sauber blieb“.
- **Aufgeräumt**: ungenutztes `img/neu-kopf.jpg`, toter Selektor `#pl-counter`, Kommentare; C60-Hinweis wird beim Schließen gespeichert.
- **Offen** (Entscheidung beim Nutzer): Pace nach Distanz gewichten; Aufwärmen/Dehnen-Chip und gemeinsame Vorschau; Sätze je Muskelgruppe; Name „New“; Foto-Einzelbelege in `quellen.html`; `20-walzen-start.js` umbenennen.

## 2026-10-15 · New: Bedienung wie im Entwurf (Fassung 2026-10-15-8)

- **Leiste** in New: Pille mit vier Reitern (Heute · Training · Kalender · Fortschritt, aktiver Reiter orange) und rechts daneben ein runder **Hauptknopf**: Heute = Training starten (heute eingeplant: dieses Training, sonst gleich „Überrasch mich“), Training = Bauen (Überrasch mich, Selber bauen, Timer, Summit), Kalender = Hinzufügen, Fortschritt = keiner (`hauptAktionNeu`, `js/03-router.js`).
- Die Leiste steht in New nur auf den vier Hauptseiten (nicht mehr auf Suche, Einstellungen und den Bereichslisten); die Hauptseiten haben keinen Zurück-Pfeil.
- **Kopfzeile:** Heute = Hell/Dunkel-Knopf, Suche, Einstellungen; Training = Suche, Einstellungen; Fortschritt = Einstellungen. Titel „Kalender“ und „Fortschritt“ wie die Reiter.

## 2026-10-15 · Statistik ruhiger und vorsichtiger (Fassung 2026-10-15-7)

- **Serie** heißt jetzt „n Wochen in Folge mit Training“ (gezählt wird jede Woche mit mindestens einem Training; die laufende Woche bricht die Serie nicht ab).
- **Pace-Tendenz** („Du wirst schneller …“) erscheint erst ab vier Läufen von mindestens 1 km und ab 5 s Unterschied (vorher 2 Läufe, 3 s): Strecke, Wetter und Tagesform schwanken stark.
- **Geschätztes 1RM** (Epley) rechnet höchstens mit 10 Wiederholungen: darüber wird die Schätzung unzuverlässig. Gespeichert wird dadurch nichts; Bestwerte können bei sehr hohen Wiederholungen niedriger angezeigt werden als vorher.
- Nicht übernommen: Sätze je Muskelgruppe statt Prozent. Der Verlauf (`history`) kennt nur die Übungen, nicht die Sätze; das ginge nur aus den gespeicherten Trainings und ist ein eigener Schritt.

## 2026-10-15 · New: vier Ziele unten, Seite „Training“, Workout-Builder, Fotos (Fassung 2026-10-15-6)

- **Navigation im Aussehen „New“** (nur dort, Klassik bleibt): unten Heute · Training · Kalender · Fortschritt; Suche und Einstellungen als Symbole in der Kopfzeile von Heute und Training (`kopfSymboleNeu`); in den Bereichslisten leuchtet „Training“. Neue Route `#training` (`renderTraining`, `js/05-suche.js`) mit den Bereichen als Fotokarten und einer Suchzeile.
- **Heute in New:** die Bereichsliste entfällt, an ihrer Stelle steht der **Workout-Builder** (Foto, „Überrasch mich“ löst im Baukasten gleich das Fenster aus, „Selber bauen“ die Übungsauswahl; `builderAuto` in `js/11b-katalog.js`). Kopfblock mit warmem Verlauf von rechts unten.
- **Fotos** (laut Nutzer Pexels, unverändert): `img/neu-workout.jpg`, `neu-mobility.jpg`, `neu-timer.jpg`, `neu-summit.jpg`, `neu-run.jpg`, `neu-builder.webp` (in `sw.js` vorab gespeichert). Einzelbelege liefert der Nutzer nach.

## 2026-10-15 · C60 entfällt, Aussehen „New“ neben „Klassik“ (Fassung 2026-10-15-5)

- **C60 ersatzlos entfernt** (Kassetten-Look): CSS von rund 2.690 auf rund 2.220 Zeilen (alle `:root[data-vintage]`-/`kodak`-Regeln, Walzenzähler `.tc`/`.odo-*`, Kassetten-Etikett, `kodak-word`), im Code `isVintageTheme`, `KODAK_BADGE`, der Walzenzähler-Teil von `js/20-walzen-start.js` (die Datei bleibt, dort liegen weiter Timer-Takt, Pause, Beenden und der Service-Worker-Start), die Texte `thKodak` und der C60-Satz in `themeInfo`. Gespeichertes `kodak` (auch die alten Retro-Namen) wird in `migrateTheme` zu `light`; ein einmaliger, schließbarer Hinweis steht auf der Startseite (`c60HinweisHTML`, `c60WegTitel`/`c60WegText`).
- **Aussehen „New“** als zweites Layout: `settings.layout` (`classic` | `new`, fehlt = Klassik), gesetzt als `data-layout` in `applyTheme`. Auswahl in Einstellungen › Darstellung: Zeile „Aussehen“ (Klassik · New) und eigene Zeile „Helligkeit“ (System · Hell · Dunkel · Nacht in vier Spalten). Neue Datei `layout-new.css` (in `index.html` und `GRUNDGERUEST` eingetragen), nur Regeln unter `:root[data-layout="new"]`: größere Rundungen mit kleiner Ecke oben links, ruhige Konturen, Pillen-Auswahl, runde Symboltasten, Wochenpunkte (weiß = frei, orange = trainiert, Ring = geplant), untere Leiste als schwebende Pille mit Milchglas (deckender Rückfall ohne `backdrop-filter`) und orangenem aktivem Reiter, Fenster mit größeren Rundungen.
- Navigation, Inhalte und Abläufe sind unverändert; Standard bleibt Klassik. Fotos aus dem Entwurf sind noch nicht eingebaut (Lizenzbelege liefert der Nutzer nach).

## 2026-10-15 · Timer: Übung orange, Pause weiß, kleines BLOC-Zeichen; Ton nach Hintergrund (Fassung 2026-10-15-4)

- **Timer-Farben** (`phaseVars`, `js/19-timer-motor.js`): Übung (Belastung) auf BLOC-Orange mit weißer Schrift, Pause, Blockpause und Vorbereitung auf Weiß mit dunkler Schrift. Oben unter der Leiste steht ein kleines „BLOC“ (`.pl-logo`): weiß auf Orange, orange auf Weiß; im Querformat und in den Vintage-Designs aus. Die Vintage-Designs (C60 usw.) behalten ihre eigenen Farben.
- **Ton nach dem Hintergrund** (Ursache laut IT-Durchsicht: der Audio-Takt steht still, solange die App nicht im Vordergrund ist, die Anzeige läuft über die Wanduhr weiter, vorab eingeplante Töne kamen um die Standzeit zu spät): beim Zurückkommen (`visibilitychange`, `pageshow`, `focus`) wird erst der laufende Audio-Takt abgewartet (`audioBereit`), dann der Tonplan immer neu gebaut; auch wenn genau ein Schritt im Hintergrund ablief (`advanceIfDue`); ein Sicherheitsnetz (`audioDriftPruefen`, `audioAbweichung`) plant neu, wenn der Audio-Takt um mehr als 0,15 s abweicht. Dasselbe für die Satzpause im Fitnessstudio (`studioPauseTonPlan`). `interrupted` (iOS) wird wie `suspended` fortgesetzt. Auf dem Handy noch zu bestätigen.
## 2026-10-15 · Kopfblock mit Auswahl, Timer in BLOC-Farben (Fassung 2026-10-15-3)

- **Kopfblock**: Titel bleibt „Bereit für dein Training?“; darunter stehen Dauer und Ort, unten in der Taste der Name des heutigen Trainings. Bei mehreren heutigen Trainings öffnet der Tipp eine Auswahl („Was startest du jetzt?“).
- **Timer in BLOC-Farben** (`phaseVars` in `js/19-timer-motor.js`): Belastung und Vorbereitung auf dem Hintergrund und in der Schriftfarbe des gewählten Designs, jede Pause und Blockpause in BLOC-Orange (statt Grün/Blau).

## 2026-10-15 · Kopfblock mit heutigem Training, Meine Woche, Woche kopieren, Rad im Run (Fassung 2026-10-15-1)

- **Kopfblock der Startseite** mit Rangfolge: (A) heute im Kalender eingeplant → Name(n) mit „&“, Dauer und Ort (z. B. „29 Min · Fitnessstudio“), ein Tipp startet das erste offene Training; (B) nichts eingeplant, aber Favoriten da → „Bereit für dein Training?“ springt zu den Favoriten; (C) auch keine Favoriten → Baukasten. Code: `heroHTML`/`heroHeutige` in `js/04-start.js`, `kalHeroInfo` in `js/19a-kalender.js`.
- **Workout** hat wieder eine eigene Kachel (orange, erste unter „Weitere Bereiche“), neues Symbol (schräge Kurzhantel). Mobility & Stretch: Figur mit gefülltem Kopf und kräftigerem Körper.
- **„Meine Woche“** (statt „Diese Woche“) klappt nicht mehr auf, sondern führt in den Kalender; die Vorschau (`kalVorschauHTML`, `kalNaechste`) ist entfernt.
- **Kalender › Woche kopieren**: alle Einträge der Woche auf die nächsten 1–12 Wochen; Gleiches wird nicht doppelt angelegt, Erledigt-Haken nicht mitgenommen (`kalWocheKopieren`).
- **Run**: Auswahl Laufen · Rad (`settings.runArt`, gespeichert als `art:"rad"`), Tempo in km/h, GPS-Sprunggrenze 90 km/h, Ansage mit Tempo, Intervall nur zu Fuß; Pace-Kurve und Rekorde nur aus Läufen. Kalender-Run-Einträge können Rad sein (`rad:true`).
- **Run-Bedienung**: Knöpfe lösen nach 2 s aus, „Beenden“ nach 1 s (`runHalten(el, fn, ms)`, `--halt` im CSS); abgedunkelt stehen Zeit, Kilometer und Tempo (größer, heller).

## 2026-10-14 · Band befestigen: Übersicht aller Arten mit Bildern

- In der Band-Info gibt es unter „Mit dem Band“ den Knopf **Alle Befestigungsarten mit Bildern**: ein Fenster mit allen zehn Arten (Pfosten, Stange, unter den Füßen, in den Händen, Oberschenkel, Knöchel, Fußschlaufe, Rücken, Sitzen) samt Skizze, Schritten und den Sicherheitshinweisen; Zurück führt in die Übungsinfo. Texte stehen im Code (js/02-bibliothek.js), weil texte.js gerade in Arbeit war.

## 2026-10-14 · Absicherung beim Laden und Speichern (Fassung 2026-10-14-42)

Ergebnis einer Code-Durchsicht (IT-Agent); drei kleine Korrekturen in `js/01-basis.js`:

- **Alter Stand (Bereiche-Version 2)**: `loadDB` rief beim Laden `selArr` auf, das erst in `02-bibliothek.js` steht – der Fehler wurde geschluckt und die App startete leer. Jetzt ohne `selArr`.
- **Unlesbarer Stand**: Der Rohtext wird vor dem Überschreiben unter `sporttimer-data-v1-defekt` beiseitegelegt (nur die erste Rettung bleibt), beim Start erscheint ein Hinweis.
- **Speichern**: `save()` fängt Fehler (Speicher voll) ab, gibt `true`/`false` zurück und zeigt höchstens alle 30 s einen Hinweis, statt still „gespeichert“ vorzutäuschen.
- Einheitstest: drei neue Prüfungen (Start mit altem Stand im frischen Rahmen, unlesbarer Stand, volles Gerät); der Lauf wartet jetzt auch auf Prüfungen, die ein Versprechen zurückgeben.
- Meta-Beschreibung in `index.html` zeigt den heutigen Umfang statt „Intervall-Timer“.

## 2026-10-14 · Mehr Ketten „Leichter / Schwerer“ (Fassung 2026-10-14-41)

- **Klimmzug**: Dead Hang → Scapular Pull-up → Negative Pull-up; die Klimmzug-Kette endet jetzt beim Muscle-Up (… Klimmzug → Commando → Muscle-Up).
- **Dips**: Support Hold → Negative Dips → Barrendips → Muscle-Up; Support Hold → L-Sit.
- **Rumpf**: Hollow Hold → Dragon Flag; Hanging Knee Raise → Hanging L-Sit; Leg Raises → Jackknives → Side Jackknives; Scapular Push-ups → Liegestütz.
- **Cardio**: Hampelmann → High Knees → Sprint auf der Stelle; Lateral Hops → Skater Jumps. Die Burpee-Kette (Plank-Burpee → Burpee → Burpee Squat Jump → Jump Forward → Burpee-Klimmzug) gab es schon.

## 2026-10-14 · Summit: Burpees in 40 von 52 Programmen (Fassung 2026-10-14-40)

- Burpees sind der Kern von Summit: 13 weitere Programme tragen jetzt eine Burpee-Variante (vorher 27, jetzt 40 von 52). Einsteiger-Programme (Stufe 1) nutzen den leichteren Plank-Burpee ohne Liegestütz und Sprung, Stufe 2 den Burpee, Stufe 3 Burpee oder Burpee Squat Jump; die ersetzte Übung war jeweils eine leichtere.
- Betroffen: Feldberg, Zugspitze, Zugspitze Kraft, Fichtelberg, Kampenwand, Kampenwand Basis, Rigi, Jungfrau, Mönch, Titlis, Piz Palü Kraft, Mont Blanc, Hochkönig.

## 2026-10-14 · Statistik: Mehr Einblicke, Körperdaten über das Person-Symbol (Fassungen 2026-10-14-38 und -39)

- **Mehr Einblicke** (zugeklappt, unter „Fortschritt je Übung“): Volumen je Woche in kg, letzte Rekorde, Drücken : Ziehen der letzten 4 Wochen (Praxishinweis) und, wenn RPE/RIR an ist, die durchschnittliche Anstrengung; erscheint nur, wenn Daten da sind.
- **Körperdaten** (Gewicht, Größe, Alter, Geschlecht) stehen jetzt hinter dem **Person-Symbol oben rechts in der Statistik** statt in den Einstellungen; der Hinweis „Kalorien schätzen“ öffnet dasselbe Fenster.
- **Summit**: der Einführungstext nennt jetzt, dass es harte Challenges sind (aufwärmen, Stufe ehrlich wählen, Technik vor Tempo, bei Schmerz abbrechen).

## 2026-10-14 · Statistik: Karte „Dein Monat“, Meilensteine, Kalorienschätzung (Fassung 2026-10-14-37)

- **Dein Monat** (Statistik): die letzten 4 Wochen gegen die 4 davor aus den Wochensummen, mit Trainings, Zeit, Lieblingstag, Rekorden, häufigster Übung und einem freundlichen Satz; Meilenstein-Chip („Training Nr. 25 geschafft!“) bei 5, 10, 25, 50, 75, 100 … Trainings.
- **Kalorienschätzung (optional)**: Körperdaten (Gewicht, Größe, Alter, Geschlecht) in den Einstellungen unter „Mehr“, nur lokal; Zusatzverbrauch über dem Ruheumsatz aus MET je Bereich (Compendium [25]) und Ruheumsatz nach Mifflin-St Jeor [24]; ohne Daten erscheint nur ein kleiner Hinweis. Datenschutz- und Haftungstext ergänzt, Einheitstest dazu.
- **Offen/Entscheidung des Nutzers**: Anbieterangaben (Entwurf in docs/ANBIETERANGABEN-ENTWURF.md), Foto-Einzelnachweise (die Bilddateien enthalten keine Metadaten).

## 2026-10-14 · Offene Punkte: Studio-Hinweis, neue Rumpf- und Zugübungen, Strukturentscheidungen (Fassung 2026-10-14-36)

- **Studio-Hinweis** im Info-Fenster und auf der Übungskarte aller Geräteübungen (Gewicht, Aufwärmsätze ehrlich formuliert, Schmerz, Sicherungsarme, ärztliche Abklärung).
- **Neu**: Pallof-Press (Studio, Bauch), Copenhagen Plank (kurzer Hebel, Quelle [23]), Rucksack-Rudern (Zug ohne Stange); Eintrag in Büro-Programm, Rumpfstabilität und Kraft für Läufer.
- **Brust-Gruppe im Studio**: Kurzhantel-Bankdrücken gehört jetzt dazu, Pallof-Press zur Gruppe Bauch.
- **Strukturentscheidungen**: Armkreisen steht nur noch unter Aufwärmen, nicht mehr in den Dehn-Auswahlen und im Dehnteil von Überrasch mich; Überrasch-mich-Aufwärmen sortiert locker zuerst und hält je Übung höchstens 2 Runden à 40 s, damit die gewählte Dauer stimmt; Umsetzzeit bei Taube, Hüftbeuger und Worlds Greatest sowie zwischen den Blöcken der vier Mobility-Programme jetzt 10 s.
- **Anbieterangaben**: Entwurf zum Ausfüllen in docs/ANBIETERANGABEN-ENTWURF.md (nicht veröffentlicht).

## 2026-10-14 · Workouts, Summit, Übungstexte, Band-Befestigung, Kalender-Stil (Fassungen 2026-10-14-34 und -35)

- **Workouts**: neue Studio-Workouts (Oberkörper und Ganzkörper mit Kurzhanteln) und Einsteiger-Programme ohne Geräte (Ganzkörper, Beine, Oberkörper; 2 Runden à 30 s); schwere und explosive Übungen früh, Aktivierung vor Zugkraft; Kettlebell HIIT ohne doppelten Swing; Arme ohne Geräte als Trizeps und Schulter benannt; Deckblatt-Hinweise zu Belastung und Sicherheit.
- **Neue Übungen** (mit Figuren): Kurzhantel-Bankdrücken, Step-ups mit Kurzhanteln, Sumo-Kniebeuge mit Kurzhantel, Einbeiniges Kreuzheben, Nordic Curl (Quelle [22]), Knie-Liegestütz, Einbeiniges Wadenheben, Negative Dips.
- **Übungstexte** (Prüf-Läufe Freiluft, Studio, Stange): Sicherheits- und Technikhinweise bei Dragon Flag, Skin the Cat, Muscle-Up, Dips, Langhantel, Multipresse, Stange und Griff, Hangelleiter, Liegestütz-Familie, Rotationsübungen, Rückenstrecker; Knie in Richtung der Zehen einheitlich.
- **Daten**: Stufen (EX_LEVEL) für 22 Übungen ergänzt, Seiten-Flag bei drei Geräteübungen, Pausen bei Zugübungen; Ketten leichter/schwerer ergänzt.
- **Summit**: 25 Programme als eigene Abwandlung umgebaut (andere Zahlen, Runden, einzelne Übungen); quellen.html nennt die Herkunft ehrlich.
- **Band befestigen**: vierter Sicherheitsschritt bei Pfosten, Stange, Knöchel und Rücken.
- **Kalender auf der Startseite**: weiße Zeile mit farbigem Rahmen, farbiger Ring und farbiges Dreieck wie bei den Play-Knöpfen der Favoriten.

## 2026-10-14 · Band nachgeschärft, zwei neue Dehn-/Mobilisationsübungen (Fassung 2026-10-14-33)

Literaturprüfung des Band-Bereichs (Probelauf des Agenten), **keine** Fachprüfung; Quelle [21] in `quellen.html`.

- **Reverse Fly**: Text, Haltung und „Band befestigen“ passen jetzt zur Figur (vorgebeugt, Arme hängen, öffnen seitlich) – vorher beschrieb der Text ein Auseinanderziehen im Stand.
- **Hinweise**: Klimmzug mit Bandhilfe (sicher absteigen), Liegestütze mit Band (Knie oder erhöhte Hände), Beinstrecken im Liegen (Band kann abrutschen und zurückschnellen), Muschel (Oberschenkel außen als Hilfsmuskel), Beinheben (Becken kippt statt „arbeitet nicht mehr“).
- **Im Info-Fenster „Mit dem Band“**: Progressionsregel als Praxisregel (keine Studie), Latexallergie und ärztliche Abklärung (`bandS5`, `bandS6`).
- **Workouts mit Band** ausgewogener: Oberkörper mit Schulterdrücken statt Kickback (Ziehen und Drücken im Wechsel), Beine & Po mit einbeinigem Kreuzheben statt Fersenstoß (Hüftbeuge), Rumpf mit Unterarmstütz statt zweitem Crunch (Stabilisation). Jedes Deckblatt nennt den Rhythmus (3 × 40 s, 20 s Pause, 20 s bis zur nächsten Übung), die Studienlage zu Pausen und die Progressionsregel.
- **Neu**: **Kinn einziehen (Nacken)** und **Brustwirbelsäule drehen (Vierfüßler)** (Mobility & Stretch, mit Figuren); im Büro-Programm und in „Rücken & Hüfte“. Für beide wurde keine Studie geprüft (Praxisübungen), das steht in `quellen.html`.

## 2026-10-14 · Dehn- und Aufwärmprogramme passen zu ihren Titeln (Fassung 2026-10-14-32)

- **Ganzkörper-Dehnen**: Oberschenkel vorn und Waden ergänzt (12 Übungen), im Stehen zuerst, dann am Boden. **Dehnen kurz · Ganzkörper**: Waden ergänzt.
- **Aufwärmen vor Kraft**: beginnt mit Hampelmann (Puls), danach die bisherigen Übungen.
- **Morgen-Mobility** heißt jetzt **Morgens locker werden** (enthält Halteübungen, ist kein Aufwärmen vor Kraft); Reiter und Übungen bleiben.
- **Handgelenke** heißt jetzt **Handgelenke (innen und außen)**.

## 2026-10-14 · Fachprüfung Dehnen und Aufwärmen: Texte ehrlicher, Sicherheitshinweise (Fassung 2026-10-14-31)

Online-Recherche mit Studien, **keine** Prüfung durch eine Fachperson (Details in `docs/FACHPRUEFUNG.md`, Quellen [15]–[20] in `quellen.html`).

- **Hinweis im Reiter Stretch** (`wsIntroDehn`): nur bis ein deutliches Ziehen, nie bis zum Schmerz, nicht wippen, bei Kribbeln/Taubheit/Schwindel lösen; ehrlich dazu: bessere Beweglichkeit bei regelmäßigem Dehnen, gegen Muskelkater kaum, Verletzungsschutz nicht belegt. **Mobility** (`wsIntroWarm`): Aufwärmen verbessert die Leistung meist leicht, Verletzungsschutz nicht belegt.
- **Sicherheit in den Übungen**: Herabschauender Hund und Vorbeuge (Glaukom, hoher Blutdruck, Schwindel), Nackendehnung (Hand liegt nur auf; Kribbeln, Taubheit, Schwindel), Bizeps- und Brustdehnung an der Wand (Schulterschmerz).
- **Handgelenke**: je Seite zwei Haltephasen (Innenseite, Außenseite) à 20 s (`perSide`), Anleitung dazu klarer. **Waden**: Hinweis auf das leicht gebeugte hintere Knie für den tieferen Wadenmuskel.
- **Beschriftung**: bei Dehnübungen „Dehnt“ und „Dehnt auch“ statt „Trainiert“/„Unterstützend“ (`musAlsoStretched`, Übungsinfo und Körperkarte).
- **Zuordnung**: Hüftbeuger-/Oberschenkeldehnung, Drehdehnung (Regionen in `WS_REGION_VON`); Kind und Hund dehnen die hintere Schulter (`KK_AUSNAHME`); Worlds Greatest nennt „oberer Rücken“.
- **Offen, Entscheidung des Nutzers (Struktur)**: Armkreisen in Dehn-Auswahlen, Morgen-Mobility unter Aufwärmen, Überrasch-mich-Aufwärmen (Reihenfolge, Dauer), Programmzusammenstellung, Umsetzzeiten.

## 2026-10-14 · Meine: Abschnitte, Fotos, Trainings; Rückfrage nach dem Speichern (Fassung 2026-10-14-13)

- **Training speichern** löst einen noch nicht gespeicherten Plan aus dem Entwurf: er steht danach unter Meine. Die gespeicherten Trainings stehen dort als dritter Abschnitt **„Gespeicherte Trainings“** (Tipp = Sätze, Notiz, Löschen; weiter auch in der Statistik).
- **Rückfrage nach „Speichern“ im Plan-Bau** (`planLoslegenFrage`): „Plan gespeichert – willst du direkt loslegen?“ **Ja** zeigt die Plan-Seite, **Nein** führt zurück zum Baukasten; der Plan liegt in beiden Fällen unter Meine.
- **Meine** gliedert sich in drei aufklappbare Abschnitte mit Symbol, Untertitel und Zahl (**Nach Zeit** · **Nach Sätzen** · **Gespeicherte Trainings**; `katSektionHTML`), und jeder Eintrag trägt das **Foto seines Ortes** (Fitnessstudio, Freiluft oder beide geteilt; `ortThumbHTML`).

## 2026-10-14 · Figuren nachgeschärft, Band befestigen (Fassung 2026-10-14-12)

- **Halteübungen sind statisch**: Wall Sit, Kniebeuge halten, Hängen, Plank und Hollow Hold zeigen nur die Haltung (kein Hin und Her mehr aus dem Stand; `daten.js`, Block „Halteübungen“).
- **Neu gezeichnet**: *Band auseinanderziehen über Kopf* (kleinere Figur von vorn, Arme gestreckt über dem Kopf, öffnen sich bis auf Schulterhöhe), *Reverse Fly mit Band* (vorgebeugt von vorn: kurzer Rumpf, Arme hängen, öffnen sich seitlich), *Beinstrecken im Liegen mit Band* (Knie zur Brust, Unterschenkel nach oben, dann Bein senkrecht strecken, anderes Bein angewinkelt) und *Tuck Jumps* (vier Phasen: Hocke mit Armen hinten → Strecken mit Armschwung → Knie zur Brust auf dem Höhepunkt → weiche Landung).
- **Band befestigen**: Unter den Figuren (Info-Fenster) und auf der Übungskarte steht bei jeder der 38 Band-Übungen eine aufklappbare Karte „Band befestigen“ mit Skizze, drei Schritten und – wo nötig – einem besonderen Hinweis. Arten: an der Tür (oben · Brust · Hüfte · unten), um eine Stange, unter beiden Füßen, unter einem Fuß, in den Händen, um die Oberschenkel, um die Knöchel, um den Fuß mit Enden in den Händen, hinter dem Rücken, um die Füße im Sitzen (`BAND_ARTEN`, `BAND_ANKER` in `daten.js`, `bandAnkerHTML`/`bandSkizze` in `js/02-bibliothek.js`).

## 2026-10-14 · Logik-Durchgang (Fassung 2026-10-14-9)

- Durchgang durch die neuen Wege (Plan, Blöcke, Modus je Zeile, RPE/RIR, Rekorde, Training speichern) mit Einzelprüfungen der Rechenwege; vier Randfälle behoben:
  - Ein zuletzt geöffneter Plan gilt nicht mehr weiter, sobald man die Startseite besucht (`render()` für `home` setzt `stPlanAktiv` zurück) – sonst hätte die Satz-/Timer-Wahl und „Training speichern“ einem alten Plan folgen können.
  - „Für alle gleich“ (Zeiten) stellt die Runden auch für Übungen eines Supersatzes/Zirkels ein, die gerade nicht mit dem Timer laufen, damit alle Übungen eines Blocks gleich viele Runden haben.
  - Die Runden im Timer-Teil der Übungskarte gelten ebenfalls für den ganzen Block.
  - Ein Workout, das im alten Workout-Baukasten auf „Nach Sätzen“ umgestellt wird, legt einen Plan mit der Voreinstellung Satz für Satz an.

## 2026-10-14 · Ein Weg für Zeit und Sätze, Wochenübersicht oben (Fassung 2026-10-14-8)

- **„Selber bauen“ führt immer in den Plan-Bau**, ohne Frage „Nach Zeit oder Nach Sätzen“: Übungen aus Fitnessstudio und Freiluft wählen, speichern, dann die Plan-Seite. Die im Baukasten (Schritt 2) gewählte Art ist nur die **Voreinstellung** der Zeilen (`p.standard`: Nach Zeit → Timer, Nach Sätzen → Satz für Satz); je Zeile lässt sich umstellen (`p.modus[id]`, `studioModus`/`studioModusSetzen` kennen den geöffneten Plan, die Übungskarte folgt ihm). Der Schalter Nach Zeit · Nach Sätzen im Plan-Bau entfällt; der Workout-Baukasten (`#mybuild`) bleibt zum Bearbeiten vorhandener Workouts.
- **Plan-Seite oben**: erst die Übersicht über die Übungen im Ganzen (Auswertung), dann eine Karte „Alle Übungen: Satz für Satz · Mit Timer“ (für alle gleich) und die Zeiten des Timers wie im Workout-Baukasten – *Für alle gleich* (Runden, Arbeit, Pause gelten sofort für alle Timer-Übungen) oder *Je Übung*, dazu die Pause zwischen den Übungen (`p.blockRest`, `p.zeiten`; `planKopfKarteHTML`) – und dann die Zeilen.
- **Startseite**: die Wochenübersicht („Diese Woche“) steht jetzt oben, über dem Kopfblock „Bereit für dein Training?“.

## 2026-10-14 · Bereichs-Symbole mit Rahmen, neues Symbol für Mobility & Stretch (Fassung 2026-10-14-7)

- **Mobility & Stretch** hat ein neues Symbol: eine Figur, die auf dem Boden liegt und den Oberkörper nach oben drückt (Kobra; `HOME_ICON.warm` in `js/04-start.js`; erscheint auf der Startseite, im Sortieren, in „Was ist was?“, in der Einführung und im Link im Übungskatalog).
- **Rahmen statt grauem Grund**: Die Bereichs-Symbole (Startseite „Weitere Bereiche“, Sortieren, „Was ist was?“) tragen einen 2-px-Rahmen in der Farbe des Bereichs – Mobility & Stretch grün, Workout orange, Timer/Summit/Run schwarz bzw. weiß – und sind innen frei (kein Grauton mehr).

## 2026-10-14 · Körperregionen und Fotokarten auch beim Zusammenstellen, Supersätze, Zirkel, RPE/RIR (Fassung 2026-10-14-6)

- **Workout-Baukasten (Nach Zeit)**: Die Übungsauswahl ist jetzt wie im Katalog und im Plan-Bau nach **Körperregionen** geordnet (Brust, Rücken, Schultern, Arme, Bauch & Rumpf, Beine & Po, Cardio, Eigene; zugeklappt, „n gewählt“, Suche klappt Treffer auf) – bei Freiluft stand sie bisher als flache Liste da.
- **Ort als Fotokarten überall**: `bauOrtHTML` zeigt auch in den tieferen Seiten (Plan-Bau, Workout-Baukasten, Überrasch-mich-Fenster) die kompakten Fotokarten statt der alten Symbol-Karten.
- **Supersätze und Zirkel** (Plan, Nach Sätzen): „Verbinden“ zwischen zwei Übungen macht aus ihnen einen Block (zwei = Supersatz, drei und mehr = Zirkel; `p.blk`, `planBloecke`, `planVerbinden`). Die Runden sind für alle Übungen des Blocks gleich, die Plan-Zeilen stehen gemeinsam gerahmt; im Timer laufen die Übungen abwechselnd mit der Pause erst nach der Runde (`planTimerItems`, auch bei „Nach Zeit“ umwandeln); auf der Übungskarte steht „danach: …“ mit Knopf zur nächsten Übung, die Pause startet erst nach der letzten Übung der Runde.
- **RPE/RIR je Satz**: Einstellungen › Training schaltet es ein (RPE oder RIR). Beim Eintragen wählt man optional 6–10 (bzw. 4–0 Wiederholungen im Tank); der Satz speichert `[kg, wdh, typ, rpe]`, Listen zeigen „@ RPE 8“ bzw. „@ RIR 2“.

## 2026-10-14 · Beim Zusammenstellen springt die Liste nicht mehr weg (Fassung 2026-10-14-5)

- Beim Bauen eines Plans oder eines Workouts schob die **erste Auswahl** die Übungsliste nach unten (oben kamen Körperkarte und Plan bzw. Ablauf dazu, die Scrollposition blieb gleich) – es wirkte, als würde man nach oben geworfen. Jetzt bleibt die angetippte Kachel an ihrem Platz (`ankerNeuZeichnen` in `js/02-bibliothek.js`, genutzt von Plan-Bau und Workout-Baukasten), man tippt einfach die nächsten Übungen an.

## 2026-10-14 · Übungen ohne Gewicht mit Sätzen × Wiederholungen (Fassung 2026-10-14-4)

- **Übungen ohne Gewicht** (Körpergewicht, Band, Stange – `studioNurBlock`) lassen sich jetzt auch **Satz für Satz** machen, nicht nur mit dem Timer: Übungskarte und Plan-Zeile haben denselben Umschalter *Satz für Satz · Mit Timer* (`studioModus`; ohne Eintrag starten diese Übungen weiter mit dem Timer, Übungen mit Gewicht mit Sätzen). Im Satz-Modus gibt es nur ein Feld für die **Wiederholungen** (Satz = `[0, wdh]`), dazu Satztypen, Pause-Auswahl und „Letztes Mal“ zum Übernehmen.
- Sätze, Wiederholungen und Pause gelten je Übung für Plan, Karte und Timer (Runden des Timers = Sätze des Ziels, Pause des Timers = Pause der Übung, solange der Timer keine eigene hat); die Voreinstellung der Sätze kommt aus Air.
- **Auswertung ohne Gewicht**: Statistik zählt Wiederholungen (beste Wdh. je Satz und je Einheit, gesamt, Kurve *Beste Wdh. · Wdh. gesamt*), die Karte meldet mehr Wiederholungen als Rekord, „Training speichern“ zeigt Wiederholungen gesamt. Die frühere reine Timer-Karte für Übungen ohne Gewicht (`renderStudioBlockKarte`) ist entfallen, die normale Karte übernimmt.

## 2026-10-14 · Training speichern – den Tag tracken, auch mitten im Workout (Fassung 2026-10-14-3)

- **„Training speichern“** (`openTrainingSpeichern`, `js/12-uebung-statistik.js`): legt den Tag als Ganzes ab – Übungen mit ihren Sätzen, Volumen, Dauer, Rekorde (★) und eine Notiz. Jeder Satz steht weiter sofort im Protokoll der Übung; das Speichern ist der Tageseintrag dazu. Je Plan und Tag gibt es **einen** Eintrag (erneutes Speichern aktualisiert ihn); ohne Plan zählt alles, was heute eingetragen wurde („Freies Training“). Ein schon gespeicherter Tag führt sich nach jedem weiteren Satz selbst nach (`trainingNachSatz`).
- **Überall erreichbar, auch während des Workouts**: Leiste unten auf der Plan-Seite und auf der Übungskarte (sobald heute etwas eingetragen ist) und ein Haken-Knopf oben im Timer bei Plan-Workouts und Übungen mit Gewicht.
- **Statistik**: Karte „Gespeicherte Trainings“ (zuerst die letzten zehn, „Mehr anzeigen“ holt je 20 weitere, ein Tipp zeigt Sätze und Notiz, dort auch Löschen). Daten: `settings.einheiten` (höchstens 1000, nur auf dem Gerät).

## 2026-10-14 · Timer je Übung im Plan (Fassung 2026-10-14-2)

- **Timer für jede Übung einzeln**: In jeder Plan-Zeile (`planZeileHTML`, `js/07-studio.js`) steht der Umschalter **Satz für Satz · Mit Timer** (`studio[id].modus`, derselbe Wert wie auf der Übungskarte). Im Timer-Modus zeigt die Zeile Sätze, **Arbeit (s)**, Gewicht und Pause und einen Knopf **Timer starten**, der nur diese Übung laufen lässt (`#playst/<id>`, mit Satz-Eintrag nach jedem Satz). Der Knopf oben heißt jetzt „Ganzen Plan mit Timer starten“.
- Die Pause einer Übung im Timer folgt der Pause der Übung, solange der Timer keine eigene hat (`planZeilenBinden`).

## 2026-10-14 · Plan als Programm, „Selber bauen“ ohne Nachfragen, Timer-Umschalter, Kraftlog-Auswertung (Fassung 2026-10-14-1)

- **„Selber bauen“ fragt nichts mehr nach**: Der Knopf im Baukasten (`renderKatalogBaukasten`, `js/11b-katalog.js`) führt gleich in die Übungsauswahl – Ort (Schritt 1) und Art (Schritt 2) stehen dort schon. Das Zusammenstell-Fenster (`openSurprise`, `js/13-teilen-editor.js`) gehört nur noch zu „Überrasch mich“ und hat zwei Wege: Zufall · Nach Gewichtung.
- **Plan als Programm** (`planZeileHTML`, `planZeilenBinden` in `js/07-studio.js`): Die Plan-Seite zeigt je Übung eine Zeile mit Sätzen, Wiederholungen, Gewicht und Pause (Übungen ohne Gewicht: Sätze, Arbeit, Pause) zum schnellen Einstellen per +/−; darunter „Zuletzt: 60×12 · 60×11“ und die Notiz der Übung. Oben steht die Summe der Sätze. Die Werte gelten je Übung und damit überall gleich: Plan, Übungskarte, Timer, Steigerung (`settings.studio[id].ziel = { saetze, wdh }`, `kg`, `pause`, `schritt`).
- **Übungskarte**: Umschalter **Satz für Satz ↔ Mit Timer** (`studio[id].modus`); im Timer-Modus sind die Runden die Sätze des Ziels. Dazu die Zeile **Letztes Mal** (ein Tipp auf einen Satz übernimmt Gewicht und Wiederholungen), Schritt der +/−-Knöpfe einstellbar (1 · 2,5 · 5 · 10 kg), Satztypen **Normal · Aufwärmen · Drop-Satz · Bis Versagen** (Satz = `[kg, wdh, typ]`; Aufwärmsätze zählen nicht in Bestgewicht, Volumen, 1RM und Steigerung) und bei Langhantel-Übungen der **Scheibenrechner** (`openScheibenSheet`, Stange einstellbar, `settings.stangeKg`).
- **Timer aus dem Plan**: Das Timer-Workout aus einem Plan (`fromPlan`) trägt nach jedem Satz Gewicht und Wiederholungen ein – jetzt auch bei Freiluft-Übungen mit Kurzhantel oder Kettlebell (`myRun` setzt `mitGewicht`, `gymSatzText(id, auchFrei)`). Das Eintragen-Fenster zeigt das letzte Mal; alles landet im selben Protokoll und in der Wochenzeile.
- **Statistik je Übung** (`openStudioStats`): geschätztes 1RM (Epley), bestes Volumen und Volumen gesamt; Umschalter für die Kurve **Gewicht · 1RM · Volumen**; Einheiten mit neuem Bestgewicht oder 1RM tragen einen ★; die Karte meldet auch einen neuen 1RM-Rekord. Das Protokoll je Übung hält jetzt 200 statt 60 Einheiten.
- **Noch offen** (aus der Liste „Kraftlog auf Hevy-Niveau“): Supersätze und Zirkel als Block, RPE/RIR je Satz (in den Einstellungen einschaltbar).

## 2026-10-13 · Beide Orte zugleich, Trainingsplan mit Muskelgruppen (Fassung 2026-10-13-13)

- **Ort mehrfach wählbar**: Fitnessstudio und Freiluft lassen sich zugleich antippen (`settings.katOrt` = `"studio"` · `"frei"` · `"beide"`; `katOrte`, `katOrtPasst`, `katOrtUmschalten`, `katOrtText` in `js/11b-katalog.js`; der letzte gewählte Ort lässt sich nicht abschalten). Workoutkatalog, Übungskatalog, Plan-Bau, Übungsauswahl, Überrasch mich (`p.orte`) und Nach Gewichtung (`stGenPool(orte)`) ziehen dann aus beiden; die Zeile im Fenster heißt „Fitnessstudio + Freiluft“.
- **Meine › „Nach Sätzen · Trainingsplan“** (vorher „Pläne“): Jede Plan-Karte zeigt Anzahl und Ort (auch „Fitnessstudio + Freiluft“) sowie die größten Muskelgruppen (`planGruppen`, `planOrt`). Die Leertexte sagen, wo Gespeichertes landet („Was du im Baukasten … baust und speicherst … landet hier“). Auch die Karten der Workouts mit Timer zeigen Ort und Muskelgruppen (`myWoCard`).

## 2026-10-13 · Fenster ohne doppelte Fragen (Fassung 2026-10-13-11, live)

- Das Zusammenstell-Fenster fragt **Ort und Art nicht noch einmal**, wenn der Baukasten (Schritt 1 und 2) direkt dahinter steht: oben im Fenster steht nur die Wahl als Zeile („Freiluft · Nach Zeit“). Von anderen Stellen aus (Suche, Timer-Workout füllen) bleibt der Ort-Schalter im Fenster, bei „Selber bauen“ auch die Art (`seiteDahinter` in `openSurprise`).

## 2026-10-13 · Bildtöne und Ausschnitte (Fassung 2026-10-13-10, live)

- **Summit**: Foto an die Tönung von Mobility & Stretch angeglichen (entsättigt, etwas heller; `img/bereich-summit.jpg`).
- **Timer**: neues Foto (Ausfallschritt, gleiche Bildwelt wie Mobility & Stretch) statt der Plank-Personen (`img/bereich-timer.jpg`).
- **Suche**: Bildausschnitt weiter auf die Sportgeräte (`img/bereich-suche.jpg`).

## 2026-10-13 · Ein Fenster für alle Wege, Filter ohne Doppelung, Timer-Wiederholungen, Play-Knöpfe (live)

- **Ein Fenster, drei Wege** (`openSurprise(twId, modus)` in `js/13-teilen-editor.js`): „Überrasch mich“ und „Selber bauen“ im Baukasten öffnen dasselbe Fenster „Workout zusammenstellen“ mit **Zufall · Nach Gewichtung · Selber bauen**. Gleicher Aufbau (Kopf, Ort-Schalter, Inhalt, Abbrechen/Knopf), anderer Inhalt: Zufall wie bisher; Nach Gewichtung mit Körpermodell und Reglern im Fenster (`genReglerHTML`/`genReglerBinden`/`genPlanErstellen` in `js/09-studio-karte.js`, die eigene Seite `renderStudioPlanGen` und `stGen` entfallen); Selber bauen mit Art (Nach Zeit/Nach Sätzen) und „Übungen wählen“ → Bauseite.
- **Filter**: Gewählte Filter (Gruppe, Ausrüstung, Körperkarte; Mobility & Stretch; Übungsauswahl; Summit-Stufe) werden bei jedem Besuch der Startseite zurückgesetzt (`render()` in `js/03-router.js`). Der Chip „Fitnessstudio“ (geraet) entfällt in der Filterkarte, weil der Ort-Schalter ihn ersetzt; im Fitnessstudio gibt es keine Ausrüstungs-Chips (`studioArtenWahl` in `js/07-studio.js`).
- **Übungskatalog** hat dieselben Ort-Fotokarten wie der Workoutkatalog („63 Übungen“ / „141 Übungen“) und zeigt ohne Suche nur die Übungen des gewählten Ortes; die **Suche** dort durchsucht beide Orte (die Übungen des anderen Ortes stehen mit `data-ortfremd` unsichtbar im Seitentext).
- **Suche** (Fußleiste) hat oben ein Foto (Meer mit Sportgeräten, `img/bereich-suche.jpg`).
- **Workout-Bild-Kopf** entfällt (`img/bereich-workout.jpg` gelöscht, kein Eintrag mehr in `BEREICH_BILD`).
- **Timer-Workouts**: jeder Block hat „Wie oft hintereinander“ (`times`, 1–99; `workoutItems` in `js/01-basis.js`, Pause danach auch zwischen den Wiederholungen); Dauer und Ablauf rechnen es mit. Play-Knöpfe der Timer-Seite im hellen Design nicht mehr tiefschwarz.
- **Play-Knöpfe überall**: weißer Kreis mit Rand und Dreieck in der Farbe des Bereichs (`--pb`, Favoriten, Listen, Übungskacheln).
- **Überrasch mich**: im Deckblatt gibt es den Stern (speichert bei Bedarf eine Kopie unter Meine und markiert sie als Favorit) und „Speichern“ (einmal je Entwurf; danach „Gespeichert“). Gilt auch für geteilte Workouts.
- Fassung 2026-10-13-9.

## 2026-10-13 · Fotokarten im Katalog, Bild-Köpfe der Bereiche, neues Stretch-Symbol (Branch `katalog-fotos-bilder`, live)

- **Katalog**: der Ort-Schalter im Workoutkatalog ist jetzt auch Fotokarten (flacher, „13 Workouts“ / „50 Workouts“; `ortFotosHTML(attr, zahlen, textKey, "kompakt")` in `js/11b-katalog.js`, gleiche Knöpfe `data-katort`). Der kleine Schalter (`katOrtHTML`) bleibt im Überrasch-Fenster, in den Bauseiten und im Plan nach Gewichtung.
- **Bild-Köpfe**: Workout (alle Reiter), Mobility & Stretch (beide Reiter), Timer, Summit und Run zeigen unter der Kopfzeile ein schmales Foto (`bereichBildHTML`/`BEREICH_BILD` in `js/04-start.js`, `img/bereich-workout|mobility|timer|summit|run.jpg`); beim laufenden Lauf und im Countdown nicht.
- **Startseite**: Die Kachel „Workout“ entfällt, der große Kopfblock „Bereit für dein Training?“ ist der Einstieg (Tipp = Workout › Baukasten, Zeile „Workout · Katalog & Baukasten“; ausgeblendet, wenn Workout im Fokus aus ist). Mobility & Stretch ist eine Listenkachel wie Timer, Summit und Run (bleibt grün, jetzt sortierbar) unter der Überschrift **„Weitere Bereiche“**. `HOME_GROSS = ["katalog"]`; Migration `bereicheV` 4 setzt „warm“ einmalig direkt unter Workout.
- **Symbol Mobility & Stretch** (`HOME_ICON.warm`): sitzende Figur unter aufgehender Sonne statt Strichmännchen mit ausgebreiteten Armen (gilt überall, wo das Symbol steht: Kachel, Einführung, „Was ist was?“, Sortierfenster).
- **Reiter**: Baukasten links, Katalog rechts (Workout sowie Mobility & Stretch). **Zurück** aus „Selber bauen nach Sätzen“ und „Plan nach Gewichtung“ führt wieder in den Baukasten (kein Wechsel nach Katalog › Meine, wenn man aus dem Baukasten kam).
- Fassung 2026-10-13-5.

## 2026-10-13 · Start und Baukasten nach dem Mockup (Branch `layout-start-baukasten`, live)

- **Startseite**: Reihenfolge Kopf (BLOC · Modular Training Builder) → Kopfblock „Bereit für dein Training?“ → Diese Woche → Favoriten → Bereiche. Der Kopfblock (`heroHTML` in `js/04-start.js`, Hallenfoto `img/start-halle.jpg` unter orangem Verlauf) führt mit einem Tipp **direkt in den Baukasten** (`katTabSetzen("baukasten")`, „Workout zusammenstellen“).
- **Baukasten**: Ort als zwei Fotokarten (`bauOrtKartenHTML`, gleiche Knöpfe `data-bauort`; Auswahl mit Ring und Haken in der Farbe des Ortes), orange Schrittnummern, „Nach Zeit · Nach Sätzen“ mit orange gefüllter Auswahl, Zusammenfassung „Freiluft · Nach Zeit“, „Überrasch mich“ als große orange Karte. Bauseiten und das Überrasch-Fenster behalten den kleinen Ort-Schalter (`bauOrtHTML`).
- **Untere Leiste**: der aktive Eintrag ist orange (Symbole unverändert); in den Bereichen (Workout …) leuchtet „Start“.
- **Fotos** (freie Bildbibliothek Pexels) in `img/` (`ort-fitnessstudio.jpg`, `ort-freiluft.jpg`, `start-halle.jpg`, zugeschnitten und verkleinert, in `sw.js` im Zwischenspeicher); allgemeiner Nachweis in `quellen.html`. Fassung 2026-10-13-2.

## 2026-10-12 · Neue Workouts und Pläne erst mit „Speichern“

- **Explizit speichern**: Ein neues Workout mit Timer (Baukasten) und ein neuer Plan (nach Sätzen) stehen erst mit **„Speichern“** in Meine. Bis dahin sind sie Entwürfe (Plan: `p.entwurf`, von den Listen ausgeblendet; Workout: `bauEntwurf` nur im Speicher). Unten steht „Speichern“, bei bereits gespeicherten „Gespeichert“ (Änderungen daran sichern sich weiter selbst).
- **Verlassen fragt nach**: Pfeil oben und Zurück-Geste zeigen „Speichern · Verwerfen“ (leere Entwürfe gehen ohne Frage). `bauVerlassenFrage` (Workout), `planVerlassen` (Plan).
- **Start** aus einem ungespeicherten Workout zeigt ein Deckblatt mit „Speichern“ (`src:"neu"`), ohne etwas anzulegen; „Nach Zeit ↔ Nach Sätzen“ nimmt die Übungen als Entwurf mit. Fassung 2026-10-12-21.

## 2026-10-12 · Sätze sichtbar, Statistik-Reihenfolge

- **Nach Sätzen** zeigt die Funktion: Plan-Kacheln und Plan-Karte „3 Sätze × 12“ (ohne Eintrag das Ziel, mit Eintrag „40 kg · 3 Sätze × 12“; ohne Gewicht „3 Sätze × 40 s“), im klebenden Plan-Streifen kurz „3×12“; Fitnessstudio-Übungen zeigen es auch auf den Kacheln im Baukasten, auf dem Deckblatt und im Timer. Texte `satzEins`/`satzMehr`, Funktionen `satzName`/`satzZiel`/`satzKurz`/`satzLetzter` in `js/07-studio.js`.
- Wörter: „Nach Sätzen trainieren“ (statt „Mit Gewichten trainieren“), „Sätze & Gewicht eintragen“, „Nach Sätzen · Pläne“. Gewicht und Sätze werden weiter zusammen eingetragen (Karte der Übung, Satz im Timer).
- **Statistik**: Mobility & Stretch steht direkt unter Workout, vor Timer, Summit und Run (wie auf der Startseite). Fassung 2026-10-12-20.

## 2026-10-12 · Baukasten: Nach Zeit · Nach Sätzen, Info per Langdruck, Ablauf bleibt sichtbar, Politur

- **Art wieder als zwei Knöpfe** „Nach Zeit · Nach Sätzen“ (ersetzt den Kippschalter) – im Baukasten und unter dem Ort auf beiden Bauseiten (Workout mit Timer, Plan). Auf den Bauseiten wandern die gewählten Übungen mit: ein erst beim Bauen angelegtes Workout bzw. ein neuer Plan wird dabei umgewandelt, nicht doppelt aufgehoben (`bauNachSaetzen`, `planNachZeit` in `js/11b-katalog.js`).
- **Info nur per Langdruck**: das „i“ auf den Kacheln ist nur noch ein Hinweis, ein Tipp gehört immer der Auswahl (Workout mit Timer und Plan-Bau; Hinweistexte ergänzt).
- **Ablauf bleibt sichtbar**: die gewählten Übungen kleben beim Scrollen unter der Kopfzeile (wie im Plan-Bau); neu Gewähltes scrollt im Streifen nach.
- **Zurück**: die System-Zurück-Geste im Plan-Bau, im geöffneten Plan und in der Gewichtung führt erst zur Liste (wie der Pfeil oben), nicht gleich zur Startseite (`katPlanVerlassen`).
- **UX-Politur** ohne Änderung von Funktion und Aufbau: drei Schritte im Baukasten (1 Wo · 2 Wie · 3 Weg), einheitliche Wörter (Zeit/Sätze in Meine, Hinweise, Startseite, „Was ist was?“), Mobility & Stretch mit demselben Reiter wie das Workout, Titel mit Lupe passt in eine Zeile. Fassung 2026-10-12-19.

## 2026-10-12 · Baukasten: Kippschalter „Mit Gewicht“

- Statt des Zwei-Knöpfe-Schalters ein **Kippschalter „Mit Gewicht“**: Freiluft steht auf Timer, Fitnessstudio auf Gewicht, beides lässt sich umstellen (Freiluft mit Gewicht, Fitnessstudio mit Zeit). Die Wahl gilt für den Ort; beim Ortswechsel gilt wieder der Standard. Fassung 2026-10-12-18.

## 2026-10-12 · Baukasten ohne Schalter „Mit Timer · Mit Gewicht“

- Der Zwei-Knöpfe-Schalter entfällt (ersetzt durch den Kippschalter, siehe oben). Fassung 2026-10-12-17.

## 2026-10-12 · Namen und Verweise zwischen Workout und Mobility & Stretch

- Im Workout-Bereich steht oben **Workout**, darunter die Reiter **Katalog** und **Baukasten**; in Mobility & Stretch genauso.
- In Mobility & Stretch heißt die Abteilung **Abläufe** (statt „Workoutkatalog“).
- **Verweise**: unter der Liste in Mobility „Mehr Übungen im Workout-Katalog“ (öffnet den Übungskatalog), im Übungskatalog des Workouts „Aufwärmen und Dehnen: Mobility & Stretch“. Fassung 2026-10-12-16.

## 2026-10-12 · Baukasten: Art folgt dem Ort

- Im Baukasten läuft **Freiluft mit „Mit Timer“, Fitnessstudio mit „Mit Gewicht“** (zuerst als Standard, siehe oben: der Schalter ist inzwischen entfallen). Fassung 2026-10-12-15.

## 2026-10-12 · Mobility & Stretch mit der Katalog-Logik des Workouts

- **Reiter Katalog | Baukasten**; im Katalog die gleichrangigen Abteilungen **Meine · Workoutkatalog · Übungskatalog**, darunter wie beim Ort die Art **Aufwärmen | Dehnen** (Körperregionen und Körperkarte als Filter bleiben). Das Plus ist weg, „Eigene Übung anlegen“ steht im Übungskatalog.
- **Baukasten**: **Überrasch mich** (Dauer 5–30 Min, bei Dehnen mit Körperregionen; ergibt einen Ablauf mit „Neu würfeln“) und **Selber bauen**.
- Alte Einstellung (Reiter Übungen/Meine) wird als Abteilung übernommen. Schnelltest 33 Prüfungen. Fassung 2026-10-12-14 (aktive Abteilung grün).

## 2026-10-12 · Beim Bauen immer nach Ort getrennt, Körpermodell bei „Plan nach Gewichtung“

- **Selber bauen und Überrasch mich unterscheiden immer zwischen Fitnessstudio und Freiluft**: ein Ort-Schalter (derselbe wie im Katalog, `settings.katOrt`) steht auf der Baukasten-Seite, im Timer-Baukasten, im Plan-Bau (Gewicht) und im Fenster „Überrasch mich“. Die Auswahl zeigt nur Übungen des gewählten Ortes, schon Gewähltes bleibt im Ablauf. Beim Öffnen eines Entwurfs bzw. Plans richtet sich der Ort einmal nach seinen Übungen. Der Ausrüstungs-Chip „Fitnessstudio“ entfällt (der Ort ersetzt ihn); Überrasch mich im Fitnessstudio braucht keine Ausrüstung.
- **Plan nach Gewichtung**: oben (und beim Scrollen mitlaufend) das Körpermodell, die Gruppen werden je nach Gewichtung kräftiger oder weniger rot; es folgt den Reglern und der gewählten Ansicht (grob/fein).
- Schnelltest 33 Prüfungen. Fassung 2026-10-12-12.

## 2026-10-12 · Workout umgebaut: Katalog (Meine · Workoutkatalog · Übungskatalog) und Baukasten

- **Zwei Reiter**: **Katalog** und **Baukasten**. Der Reiter „Meine“ ist weg: im Katalog stehen drei gleichrangige Abteilungen **Meine** (eigene Workouts mit Timer und Pläne), **Workoutkatalog** (Ort-Schalter, Filter) und **Übungskatalog** (alle Übungen nach Bereichen, oben „Eigene Übung anlegen“; `#uebungskatalog` führt dorthin).
- **Baukasten** (früher „Übungen“): groß und vorn **Überrasch mich** und **Selber bauen**, darüber der Schalter „Mit Timer · Mit Gewicht“ (Selber bauen öffnet den Baukasten bzw. den Plan-Bau).
- **Das Plus ist weg**. **Plan nach Gewichtung** steht im Fenster „Überrasch mich“ (Umschalter „Zufall · Nach Gewichtung“); eigene Übungen legt man im Übungskatalog an.
- Alte Einstellungen werden übernommen (`katTab` „meine“ → Katalog/Meine, „uebungen“ → Baukasten). Schnelltest 33 Prüfungen. Fassung 2026-10-12-10.

## 2026-10-12 · Liste abgearbeitet: Kontraste, Plan verschieben, Timer-Eintrag, Suche nach Ort, Aufräumen

- **Klein**: Schalter „Mobility · Stretch“ grün; Deckblatt-Text für eigene Workouts („Dauerhaft ändern: unter Meine öffnen“); Fitnessstudio-Rot **tiefer** (`#c9201a`, im Dunkeln `#ff4f45`) und damit von der Koralle abgesetzt; Plan-Name bis 60 Zeichen; Einführung in der Reihenfolge der Startseite (Workout, Mobility & Stretch, Summit).
- **Mittel**: Übungen lassen sich per langem Drücken **ausblenden** (Übungen und Suche); im Plan-Bau **verschieben** ◀ ▶ und entfernen direkt im klebenden Plan; im Timer **„Satz eintragen“** (Gewicht und Wiederholungen, schreibt ins Protokoll der Übungs-Karte); **Suche** mit Ort-Filter (Beide · Freiluft · Fitnessstudio) für Workouts und Übungen; Statistik-Karte „Workout“ im BLOC-Orange; Kodak-Design folgt der ruhigen Farbwelt (Gelb für Fitnessstudio und Grün für Mobility bleiben).
- **Kontrast**: neue `--accent-ink` (Koralle auf Weiß hatte 3,1:1, jetzt kleine Schrift 4,6:1); Fitnessstudio-Rot im Dunkeln 5,8:1. Die großen Hauptknöpfe bleiben in der Marken-Koralle (weiß auf Koralle 3,1:1, nur für große Schrift ausreichend).
- **Aufräumen**: `.gitattributes` (LF), 101 ungenutzte Texte entfernt (DE und EN), `repos\spiegeln.ps1` kopiert die Git-Dateien in `BLOC-main` bzw. `Vokabelkasten-main`.
- Schnelltest 33 Prüfungen. Fassung 2026-10-12-8.

## 2026-10-12 · Ruhige Farbwelt, Startseite ohne „vorausgewählt“-Look, Plan klebt oben

- **Weniger Farbe**: Symbole der Startseite, der Körperregionen (Brust, Rücken …) und der übrigen Bereiche (Timer, Summit, Run, Mobility & Stretch) sind schwarz/weiß (Textfarbe); die Bereichsfarben `--ti-color`, `--rep-color`, `--ws-color`, `--bl-color`, `--run-color` sind am Ende von `app.css` auf die Textfarbe gesetzt (Kodak behält seine Palette). Farbe tragen nur die Hauptaktion (Koralle) und die beiden Orte: **Freiluft blau, Fitnessstudio orange** (`--gym-color`, vorher hellgrün) - bei Ort-Schalter, Kacheln, Workout-Karten und in der Suche.
- **Startseite**: das erste Feld („Workout“) hat keine blaue Kontur und keinen blauen Symbolgrund mehr (sah vorausgewählt aus) - es ist nur größer; untere Leiste: aktiver Eintrag neutral.
- **Überrasch mich** in der Standardfarbe (wie „Workout planen“), nicht mehr im Akzent.
- **Suche**: Workouts tragen ein Ort-Zeichen (Freiluft blau, Fitnessstudio orange); Aufwärm-/Dehn-Workouts nicht.
- **Plan-Bau**: der Plan mit den gewählten Übungen (kleine Kacheln, nummeriert, antippen = herausnehmen) steht unter der Körperkarte und **bleibt beim Scrollen unter der Kopfzeile stehen**.
- Schnelltest 33 Prüfungen. Fassung 2026-10-12-3.
- **Nachtrag (Fassung 2026-10-12-5)**: Fitnessstudio-Orange ist jetzt **dasselbe Orange wie das BLOC-Logo** (`--gym-color` = `--accent`); das Symbol des gewählten Orts im Schalter ist orange (stand blau). **Bereiche stehen immer zugeklappt da**, auch mit Filter (nur eine Suche klappt Treffer auf). **Startseite**: Workout und direkt darunter **Mobility & Stretch** sind die zwei großen Felder, **Timer, Summit und Run** die Liste darunter (sortierbar); Mobility & Stretch ist wieder grün (Symbol, Übungen, Programme). Schnelltest 33 Prüfungen.
- **Nachtrag 2 (Fassung 2026-10-12-6)**: **Fitnessstudio im C60-Rot** (`#e1251b`, in allen Designs), dafür ist **Workout selbst im BLOC-Orange** (Symbol auf der Startseite, beim Sortieren und in „Was ist was?“, `--accent`). Freiluft bleibt blau, Mobility & Stretch grün.
- **Nachtrag 3 (Fassung 2026-10-12-7)**: „Überrasch mich“ steht wieder im **BLOC-Orange** (zarte Akzent-Tönung mit Akzent-Symbol), das Symbol ist ein **schlichter Würfel** statt des Zauberstabs mit Funken.

## 2026-10-10 · Fitnessstudio-Übungen überall, hellgrüne Symbole, einheitliche Namen

- **Fitnessstudio-Übungen gehen überall hinein**: Baukasten („Workout mit Timer bauen“, mit Chip „Fitnessstudio“ im Filter), Langdruck (bei Geräten steht „Zu Plan hinzufügen“ vorn), Tauschen (Fitnessstudio gegen Fitnessstudio), Timer-Workout aus Blöcken, **Überrasch mich** (Chip „Fitnessstudio“, Geräte nur wenn gewählt) und **Plan nach Gewichtung** (neuer Schalter Fitnessstudio · Freiluft, zieht aus dem jeweiligen Ort).
- **Gewicht × Wiederholungen bleibt vorn**: im Ablauf eines Workouts steht bei Geräten „40 kg · 3 × 12“ (letzter Satz, sonst das Ziel) statt der Sekunden; Tipp auf die Übung bietet „Gewicht & Wiederholungen eintragen“; das Deckblatt eines überwiegend aus Geräten bestehenden Workouts hat **„Mit Gewichten trainieren“** als großen Knopf (legt einen Plan an und öffnet ihn) und **„Mit Timer starten“** als zweiten; im Timer steht die Zeile „40 kg · 3 × 12“ unter dem Namen.
- **Farben, nur die Symbole**: Fitnessstudio hellgrün (`--gym-color`), Freiluft einheitlich blau; die bunten Bereichs-Symbole (Brust rot, Rücken blau …) sind weg, die Symbole stehen auf neutralem Grund. Studio-Übungen waren violett, jetzt hellgrün.
- **Namen**: „Workout mit Timer bauen“ überall (Suche, Plus, Langdruck-Auswahl), „Workouts mit Timer“ und „Pläne (Gewicht × Wiederholungen)“ unter Meine, in der Suche zusätzlich „Workout planen“ und „Plan nach Gewichtung“, „Timer-Workout aus Blöcken“ statt „Neues Workout“; Mobility & Stretch heißt jetzt auch „Katalog · Übungen · Meine“; Summit „Mit Stange“ statt „Alle Geräte“.
- Schnelltest 32 Prüfungen. Fassung 2026-10-10-39.

## 2026-10-10 · Durchsicht: Statistik und Wortlaut passend zum Workout-Bereich

- **Statistik**: Air und Studio stehen jetzt auf **einer** Karte „Workout“ (ein Besuch aus beiden zählt einmal, ein Block „Muskelgruppen – letzte 7 Tage“). Gespeichert wird weiter getrennt (`b` = lib/timer), nur die Anzeige fasst zusammen; Statistik-Karten: Workout · Timer · Summit · Run · Mobility & Stretch.
- **Wortlaut**: „In der Bibliothek ausblenden“ → „Im Katalog ausblenden“, „Aus der Bibliothek“ → „Aus dem Katalog“, Einführung „im Fitnessstudio“, `quellen.html` und README ohne „Studio/Air“ als Bereichsnamen; ungenutzte Texte (Air/Studio-Namen, `in2`, `in3`, `zpHint` …) entfernt.
- Schnelltest: Statistik prüft fünf (mit Fokus ohne Run: vier) Karten und dass ein Studio-Eintrag zur Karte „Workout“ zählt. Fassung 2026-10-10-37.

## 2026-10-10 · Workout: 13 Programme fürs Fitnessstudio, „Fitnessstudio“ zusammengefasst, untere Leiste

- **Ausrüstung zusammengefasst**: „Fitnessstudio“ umfasst jetzt Geräte, Kabel, Langhantel und die Bank mit Kurzhanteln (vorher drei Chips: Gerät, Kabel, Langhantel). Fünf Chips: Fitnessstudio · Kurzhantel & Kettlebell · Stange & Barren · Widerstandsband · Körpergewicht. Gespeicherte Auswahl wird mitgenommen (`studioFilterAlt`). Der Ort-Schalter bleibt nur im Katalog.
- **13 Programme fürs Fitnessstudio** nach Online-Recherche (ACSM, Fachartikel; siehe `quellen.html`): Ganzkörper A und B (Einsteiger, 3 × 12, 2–3 Tage), Oberkörper und Unterkörper (4 Tage), Legday, **Brust & Trizeps**, **Rücken & Bizeps**, Schultern, Arme, Po & Beine, Bauch & Rumpf, Haltung & Rücken, Tiefenmuskulatur. Reihenfolge: große vor kleinen Muskeln, Drücken und Ziehen im Wechsel; Pausen je Übung aus der Bibliothek (60 s an Geräten, 90 s bei schweren Grundübungen). Auf dem Deckblatt steht ein kurzer Hinweis (`LIB_WORKOUT_INFO`): für wen, wie oft, wie.
- **Katalog ohne „Überrasch mich“ und „Workout planen“** (beides bleibt bei Übungen und Meine); „Überrasch mich“ ist flächig und ruhig statt mit Verlauf und Schatten.
- **Untere Leiste (Start · Suche · Statistik · Einstellungen)** steht jetzt auch im Katalog, bei Übungen und bei Meine; im Plan-Bau nicht (dort steht die Fertig-Leiste). Der Plus-Knopf sitzt darüber.
- Fassung 2026-10-10-36.

## 2026-10-10 · Workout: Politur (selbst speichern, Fitnessstudio · Freiluft, neue Programme, modernere Gestaltung)

- **Speichert selbst**: Der Baukasten („Workout mit Timer bauen“) sichert jede Änderung sofort, sobald eine Übung drin ist; kein Speichern-Knopf, keine Nachfrage beim Zurück (die Anzeige zeigt „Gespeichert“). Ein neues Workout ohne Übung bleibt unangelegt. Ein neuer Plan ist sofort da; bleibt er leer, wird er beim Verlassen wieder entfernt.
- **Katalog mit demselben Filter wie die Übungen** (Gruppe, Ausrüstung, Körperkarte, Detailansicht; die Auswahl gilt für beide Reiter). Gruppe und Körperkarte: mindestens ein Drittel der Übungen passt; Ausrüstung: jede Übung geht mit dem Gewählten (Körpergewicht braucht nichts). Die Workouts stehen unter denselben Bereichen wie die Übungen, dazu **Ganzkörper**.
- **Ganz vorn im Katalog der Schalter Fitnessstudio · Freiluft** (mit Anzahl; gemerkt in `settings.katOrt`, Standard Freiluft). Fitnessstudio = Workouts mit Geräten oder Langhantel, Freiluft = alles andere.
- **Vier neue Programme fürs Fitnessstudio**: Ganzkörper, Legday, Arme, Tiefenmuskulatur (3 × 40 s, 60 s Pause; Tiefenmuskulatur mit 4 Runden, damit Seitenübungen gleich oft laufen).
- **„Gerät“ heißt „Fitnessstudio“** in der Ausrüstung des Filters.
- **Moderner**: Kapsel-Reiter, größere Ort-Karten, farbige Bereiche (je Körperregion eine Farbe), ruhigere Karten, „Überrasch mich“ als gefüllter Knopf. Schnelltest 31 Prüfungen. Fassung 2026-10-10-35.

## 2026-10-10 · Workout: Air und Studio unter einem Dach (Katalog, Übungen, Meine)

- **Ein Bereich „Workout“** (intern `katalog`) ersetzt die Karten Air und Studio auf der Startseite (`js/11b-katalog.js`; gespeicherte Reihenfolge und Fokus werden gelesen, nichts wird umgeschrieben). Die Routen `#library` und `#timers` führen weiter hierher, die Statistik kennt Air und Studio weiter getrennt.
- **Drei Reiter**: **Katalog** (die fertigen Workouts nach Fokus: Cardio, Gewicht, Bodyweight, Calisthenics, Beine, Rücken, Bauch / Core, Arme, Gemischt) · **Übungen** (alle 204 Übungen nach Bereichen: Brust, Rücken, Schultern, Arme, Bauch & Rumpf, Beine & Po, Cardio & Ausdauer, Eigene) · **Meine** (eigene Workouts mit Timer und Pläne).
- **Zu Beginn nur die Überschriften**: Bereiche sind zugeklappt (mit Anzahl); mit Filter oder Suche stehen die Treffer offen, Antippen klappt auf und zu, beim nächsten Besuch ist wieder alles zu.
- **Zuordnung**: Studio-Übungen behalten ihre Gruppe, Air-Übungen kommen dorthin, wo ihr erster Hauptmuskel liegt, Ausdauerübungen in Cardio (`katGruppeVon`). Die Gruppen-Chips des Filters gelten damit für Air und Studio gemeinsam; der Filter ist der bekannte (Gruppe, Ausrüstung, Körperkarte, Detailansicht).
- **Zwei Einstiege** unter den Reitern: **Überrasch mich** (fragt wie bisher Zeit und Ausrüstung) und **Workout planen**.
- **Plan-Bau** auf den Bereichen: oben die Körperkarte des Plans (viel, am Rande, Lücken), zugeklappte Bereiche zeigen „n gewählt“. **Mit Timer starten** macht aus einem Plan ein Workout mit Timer (Air- und Studio-Übungen hintereinander; eine Kopie unter Meine, die beim erneuten Starten aktualisiert wird).
- Einführung auf vier Seiten (Air und Studio sind eine), „Was ist was?“, Suche und Einstellungen › Fokus kennen den Bereich. Schnelltest angepasst und um den Planer ergänzt (30/30). Fassung 2026-10-10-34 (auf Wunsch: Bereich „Workout“, erster Reiter „Katalog“).
- **Offen für den Feinschliff**: Plan nach Gewichtung zieht weiter nur Studio-Übungen; Übungen neu ausblenden geht noch nicht (schon ausgeblendete stehen unten bei „Ausgeblendet“ mit „Einblenden“); Texte mit „Air“/„Studio“ in Hinweisen und Statistik; Zuordnung einzelner Übungen zu Bereichen.

## 2026-10-10 · Rückmeldungen: Dehnen als Standbild, Detailansicht, verständlicher Installationshinweis

- **Dehnen**: Die 19 gehaltenen Dehnübungen zeigen nur noch die **Endstellung** als Standbild (kein Hin-und-her mehr). In Bewegung bleiben Katze-Kuh, Kobra, World's Greatest Stretch und Armkreisen. Die Halteübungen (Plank, Wandsitz, Dead Hang …) sind unverändert.
- **Körperkarte**: „Grob · Fein“ heißt jetzt **Detailansicht** und ist ein einzelner Schalter (aus = 10 Zonen, an = 21 Zonen; Einstellung `settings.kkFein` bleibt). Die Skala „selten – oft“ unter der Karte in Auswertung und Workout-Kopf entfällt.
- **Installationshinweis** (Startseite, Einstellungen, Anleitung): statt „Für dauerhaften Speicher installieren“ jetzt „Damit deine Daten nicht verloren gehen“ mit einem Satz, warum, und einem, wie.
- Schnelltest an den neuen Schalter angepasst (29/29). Fassung 2026-10-10-32.

## 2026-10-09 · Gesamtdurchgang (Inhalte, Texte, Bedienung, Figuren)

- **Inhalte geprüft (automatisch über alle 227 Übungen)**: Name, Hinweis, Anleitung (3 Schritte), Haltung, Muskeln in Deutsch und Englisch vollständig und gleich lang, keine Doppelleerzeichen, Wortdopplungen oder Zeichenfehler, keine deutschen Umlaute im Englischen; Workouts, Studio-Gruppen, Ketten, Aliase und Aufwärm-Listen verweisen nur auf vorhandene Übungen; Zeiten, Runden und Pausen plausibel.
- **Texte**: 897 Texte, Deutsch und Englisch haben dieselben Schlüssel und Platzhalter. „Air“ auf der Startseite heißt jetzt „Draußen und zu Hause“ (bisher „im Calisthenicspark“, passte seit Band und Kurzhanteln nicht mehr).
- **Bedienung**: Die Statistik hat jetzt wie Suche und Einstellungen einen Zurück-Pfeil.
- **Figuren (alle 227 durchgesehen)**: Kein Kopf mehr abgeschnitten (Wadenmaschine, Beinpresse 45°, einbeiniges Kreuzheben mit Band). L-Sit neu: Stütz auf zwei kleinen Parallettes, erst Beine unten, dann waagerecht (vorher sah es aus wie ein Sitz auf einem Hocker). Fassung 2026-10-09-31.
- Offen/optional: rund 100 ungenutzte Textschlüssel aus früheren Funktionen in `texte.js` (z. B. `fig…`) könnten gelöscht werden; sie schaden nicht.

## 2026-10-09 · Figuren: Dehnen und Halteübungen bewegen sich

- Alle **Dehnübungen** (19) und die **Halteübungen** Kniebeuge halten, Wandsitz, Dead Hang, Plank, Hollow Hold, Hängender L-Sit haben jetzt **zwei Posen: Ausgangsstellung → Dehnung bzw. Haltung**. Die Figur geht also in die Position hinein, statt nur zu stehen (vorher eine einzige Pose, bei manchen kaum zu erkennen).
- **Neu gezeichnet**: Nackendehnung (Kopf kippt zur Seite, Hand am Kopf), Schulter (Arm quer vor der Brust, andere Hand zieht), Trizeps (Ellbogen hoch, Hand im Nacken, andere Hand am Ellbogen), Seitbeuge (Oberkörper kippt über).
- **Nachgeschärft**: Plank Shoulder Taps (eine Hand hebt ab und tippt die Schulter), Scapular Push-ups (die Brust sinkt ab).
- Nur L-Sit und Stütz halten bleiben einzelne Posen (Reck und Barren lassen sich als Ausgangsstellung nicht klar zeichnen). Fassung 2026-10-09-29.
- **Suche**: Dehnübungen erscheinen jetzt ebenfalls als quadratische Kacheln (in der Farbe von Mobility & Stretch), nicht mehr als Zeilen. Fassung 2026-10-09-30.

## 2026-10-09 · Programmlogik in 20 Teile aufgeteilt

- `app.js` (fast 8.000 Zeilen) ist jetzt **`js/01-basis.js` … `js/20-walzen-start.js`**: ein Teil je Themenbereich (Basis/Speicher, Bibliothek, Router, Start, Suche, Studio, Körperkarte, Statistik, Editor, Lauf, Audio, Timer-Motor …), 100 bis 850 Zeilen. Kein Build nötig: gewöhnliche Skripte, die nacheinander im selben Gültigkeitsbereich laufen. Verhalten unverändert (Schnelltest 29/29).
- **Wichtig beim Aufteilen entdeckt:** `loadDB` ruft schon beim Laden `pruneHistory` auf. Stand das in einem späteren Teil, startete die App (wegen `try/catch` unbemerkt) mit leeren Daten. Die Verlauf-Hilfen (`pruneHistory`, `besuche`, `wocheKey` …) stehen deshalb am Ende von `01-basis.js`; die Regel steht in der README (Tabelle „Dateien“).
- `sw.js` listet alle Teile im Offline-Speicher; `?v=` in `index.html` gilt für jede Zeile. Fassung 2026-10-09-28.

## 2026-10-09 · Körperkarte grob/fein, im Workout-Kopf und in Mobility & Stretch; Studio-Ausrüstung

- **Grob · Fein**: überall, wo die Körperkarte steht (Übungsinfo, Workout-Kopf, Auswertung, Filter in Air, Studio, Baukasten, Suche, Mobility & Stretch), gibt es unter der Karte einen Schalter mit Unterstrich. **Grob** (Standard) = 10 Zonen, **Fein** = 21 Zonen und die Silhouetten größer, damit sich kleine Zonen am Handy antippen lassen. Die Wahl gilt für die ganze App (`settings.kkFein`); eine gewählte Zone wandert mit (z. B. „Hintere Schulter“ wird grob zu „Schultern“). Gerechnet wird immer fein, grob fasst zusammen (`KK_F2G`).
- **Workout-Kopf**: Deckblatt und Baukasten zeigen oben die Körperkarte mit **Viel**, **Nur am Rande** und **Lücken** (`kkKopfHTML`).
- **Mobility & Stretch**: dieselbe Körperkarte als Filter (Dehnen und Aufwärmen, `settings.wsZonen`) und im Kopf von Aufwärm- und Dehn-Workouts (dort zählen Dehnübungen mit).
- **Studio**: Langhantel, Kurzhantel & Kettlebell, Stange & Barren, Widerstandsband und Körpergewicht stehen jetzt bei **Ausrüstung**, nicht mehr bei den Gruppen. Die Gruppen sind nur noch die sechs Muskelgruppen; die Langhantel-Übungen stehen in ihrer Muskelgruppe (`STUDIO_GRUPPEN` in `daten.js`). Mit einem Ausrüstungs-Chip stehen die Air-Gruppen offen, sonst zugeklappt unter „Aus Air“ (jetzt vier, neu: Widerstandsband). Alte gespeicherte Gruppen-Chips ziehen automatisch in die Ausrüstung um (`studioFilterAlt`).
- Fassung 2026-10-09-24.
- **Filterkarte aufgeräumt** (alle Filter): Chips ohne Symbole und rund, klarer Abstand zwischen den Abschnitten, Fuß mit Trennlinie. Körper: Überschrift und Grob · Fein in einer Zeile, Silhouetten etwas kleiner, darunter die Auswahl bzw. „Zonen antippen“; die Zonen-Chips stehen unter „Als Liste wählen“ (zugeklappt, Zustand wird gemerkt, `settings.kkListeAuf`). Fassung 2026-10-09-25.
- **Einstellungen einheitlich**: jede Gruppe (Bereiche, Darstellung, Training, Daten) hat Symbol-Kachel + Titel wie die Zeilen unter „Mehr“; Quellen und Datenschutz sehen aus wie die anderen Zeilen (Symbol, gleicher Pfeil); die drei Sicherungs-Knöpfe haben alle ein Symbol; „Alle Daten löschen“ steht abgesetzt und rot am Ende.
- **Suche**: Wer eine Körperzone wählt, sieht auch die **Studio-Übungen als Kacheln** (antippen = Studio-Seite, lange drücken = in Plan legen). Fassung 2026-10-09-27.

## 2026-10-09 · Körperkarte auch im Studio, Unterer Rücken als eigene Zone

- **Studio**: die Filterkarte (Studio › Übungen und beim Zusammenstellen eines Plans) hat jetzt dieselbe Zeile „Körper“ wie Air: Zonen antippen, mehrere möglich; „Zurücksetzen“ löscht sie mit. Gespeichert in `settings.stZonen`.
- **Körperkarte jetzt 10 Zonen**: neu **Unterer Rücken** (hinten, eigene Zone neben Rücken).
- Schnelltest prüft den Studio-Zonenfilter. Fassung 2026-10-09-22.

## 2026-10-09 · Körperkarte zurück auf 17 Zonen, Band-Inhalte gegengeprüft, Figuren nachgeschärft

- **Körperkarte jetzt 9 Zonen** (17 und 21 waren am Handy zu fein). Neu bleibt: Tippen auf die Silhouetten in der Übungsinfo vergrößert sie und nennt die Zonen mit Namen.
- **Band-Inhalte gegen Quellen abgeglichen** (ACE-Übungsbibliothek und -Artikel, THERABAND, NHS Wales; Plausibilitätsprüfung, keine Fachprüfung): u. a. Hinweis zur Schulter beim Aufrechten Rudern, 45°-Grenze beim Beinheben, Hammer-Curl mit Brachialis zuerst, Hinweise beim Klimmzug mit Bandhilfe. Neuer Abschnitt **„Mit dem Band“** in jeder Band-Übungsinfo (Band prüfen, Befestigung, nie unter Spannung loslassen, Dehnungsgrenze). Quellen [12] und [13] in `quellen.html`, Liste der Änderungen in `docs/FACHPRUEFUNG.md`.
- **Figuren**: Band zwischen den Händen liegt bei Reverse Fly jetzt vor dem Körper (Klasse `gv`), Pull-Apart oben als V, Seitbeuge mit Hüftversatz, Muschel (Knie hebt sich deutlich), Beinstrecken im Liegen mit Fußspitze.
- Fassung 2026-10-09-19.

## 2026-10-09 · Körperkarte und Band-Animation

- **Körperkarte** (zwei Silhouetten vorn/hinten, 9 große Zonen (Schultern, Brust, Arme, Rücken, Bauch & Rumpf, Gesäß, Oberschenkel vorn/hinten, Waden), damit sie sich am Handy ohne Zoomen antippen lassen; die Balken der Auswertung bleiben bei den sechs Gruppen): in der **Übungsinfo** (Air und Studio) zeigt sie, was trainiert (kräftig) und unterstützt wird (hell); in der **Auswertung** eines Workouts, Plans und der Woche addieren sich die Gruppen – je öfter, desto kräftiger, darunter steht, was noch fehlt. Beim Workout-Bauen ist die Auswertung gleich aufgeklappt.
- **Filter nach Körperbereich**: in Air › Übungen und im Baukasten (Filterkarte, Zeile „Körper“) sowie in der **Suche** (aufklappbare Zeile): Gruppen antippen, mehrere möglich; es erscheinen Übungen, die diese Gruppen als Hauptmuskeln haben.
- **Band wird gedehnt**: in der Animation läuft das Band mit Händen, Füßen und Knien mit; je länger, desto dünner, kürzer als in Ruhe hängt es durch. Technik: Band-Linien tragen `data-bd` (Marken), `bandSplit` in `app.js` löst sie aus den festen Geräteteilen und zeichnet sie je Bild neu.
- **Suche**: Air-Übungen erscheinen als quadratische Kacheln wie unter Air › Übungen (antippen = Info, ▶, ☆, lange drücken); Studio-Übungen und alle anderen Treffer bleiben Zeilen.
- Schnelltest 29 Prüfungen (neu: Körperkarte in Info, Filter, Auswertung und Suche, Muskelnamen ohne Zone). Fassung 2026-10-09-17.

## 2026-10-09 · Air: Widerstandsband als Gerät

- Neues Gerät **Widerstandsband** (`band`) in der Ausrüstung (Filter in Air › Übungen, Gerät-Symbol auf der Kachel). Die Übung „Klimmzug mit Bandhilfe“ braucht zusätzlich die Stange.
- **38 neue Übungen** in Air (Rücken 5, Brust 5, Schultern 5, Bauch 5, Bizeps 4, Trizeps 5, Gesäß 5, Beine 4), jeweils mit Figur (Band als dünne Linie, Befestigung als Ring), „So geht's“, Haltung und Vermeiden, Hauptmuskeln und Hilfsmuskeln – Deutsch und Englisch. Liste der Übungen nach einem Übungsplakat für Widerstandsband-Training; Texte und Figuren sind eigene Zusammenstellungen.
- **4 Workouts**: Ganzkörper, Oberkörper, Beine & Po und Rumpf mit Band (je 3×40 s / 20 s).
- „Leichter / Schwerer“: Push-ups → Liegestütze mit Band, Klimmzug mit Bandhilfe → Pull-ups, Air Squats → Kniebeuge mit Band.
- **Zweite Ansichten** (Info-Karte): Rumpfdrehung im Sitzen und Kniende Rumpfdrehung von vorn, Kniebeuge von vorn, Hammer-Curl von vorn, Bizeps-Curl von der Seite. Band in der Akzentfarbe, Figuren nachgeschärft (Fassung 2026-10-09-6).
- Technik: Block „Widerstandsband“ am Ende von `daten.js` (Posen aus Winkeln gebaut, trägt sich in die bestehenden Tabellen ein); `EQUIP_ICON.band` in `app.js`, Linienstil `.gb` in `app.css`. Fachprüfung offen (siehe `docs/FACHPRUEFUNG.md`).

## 2026-10-05 · Run moderner, GPS-Vergleich entfernt

- **GPS-Vergleich (Beta-Test) entfernt**: kein zweiter „ungefährer“ Modus mehr, kein Schalter, keine Vergleichskarte, Texte und Test angepasst (bereits gespeicherte Läufe behalten ihre Daten, der Vergleich wird nur nicht mehr angezeigt)
- **Run neu gestaltet**: Startseite mit großer Kilometer-Summe und rundem Start-Knopf, Verlauf und Ansagen darunter; Live-Ansicht mit sehr großer Zeit, Kennzahlen als Kacheln und GPS-Status als Punkt (grün gut, gelb schwach, rot kein Signal, pulsierend bei Suche); größerer Countdown
- **Routenkarte minimalistisch**: eine ruhige Linie in der Textfarbe, Start als Ring, Ziel als Punkt (live mit sanftem Puls), keine Farben, kein Raster; Bestzeit-Kilometer nur fett. Fassung 2026-10-02-26

## 2026-10-05 · Bodyweight = alles ohne Gerät

- Der Filter **Bodyweight** zeigt jetzt jede Übung ohne Ausrüstung (`bwDazu`): auch Burpees, Jumping Jacks, Mountain Climbers, Planks, Sit-ups usw. – vorher nur die wenigen mit der Kategorie „Bodyweight“. Dehnübungen und Übungen mit Stange/Dip/Geräten zählen nicht dazu; eigene Übungen behalten ihre gewählten Kategorien. Fassung 2026-10-02-27

## 2026-10-05 · Summit: Plus auch bei Einheiten

- Im Reiter **Einheiten** gibt es jetzt unten rechts ein Plus: öffnet direkt „Neue Einheit“ (Programme antippen und hintereinander legen); die eigene Einheit steht danach oben in der Liste. Fassung 2026-10-02-28

## 2026-10-05 · Run: Name/Notiz, Intervall, Auto-Pause, Pace je Kilometer

- **Lauf bearbeiten**: im Detail Name (z. B. „Intervalle“) und Notiz (z. B. „Regen“), werden beim Tippen gespeichert; der Name steht in der Verlaufsliste hinter den Kilometern
- **Intervall-Lauf** (Run-Startseite): Laufen und Gehen in Sekunden einstellbar; im Lauf eine Anzeige „Laufen · 0:42 · Runde 3“, beim Wechsel Signalton, Vibration und Ansage („Laufen!“/„Gehen!“), Tick in den letzten 3 s; gespeichert als `iv`, im Detail „Intervall 1:00 / 1:00“
- **Auto-Pause** (Regler Aus bis 20 s, mindestens 5 s): ohne Bewegung (kein neuer GPS-Schritt, Gerät meldet Tempo <0,5 m/s) pausiert der Lauf, die Stehzeit wird herausgerechnet (Pause beginnt beim letzten Schritt); weiter von selbst bei ≥ 10 m Weg vom Pausenort oder ≥ 1,5 m/s. Herausgerechnete Pausen stehen im Detail (`pause`)
- **Pace je Kilometer** im Detail als Balken (schnellster kräftig), angefangener Rest-Kilometer ab 100 m zuletzt
- Schnelltest 21 Prüfungen (neu: Auto-Pause/Intervall, Name/Notiz). Fassung 2026-10-02-30

## 2026-10-06 · Run: Abdunkeln früher, Knöpfe 3 s halten

- **Abdunkeln** steht als eigener, breiter Knopf ganz oben (Mond-Symbol) und ist schon im Countdown möglich (die Zahl läuft im dunklen Bild weiter und geht nahtlos in Zeit und Kilometer über). Nach dem Lauf, auf der Startseite und im Detail ist der dunkle Bildschirm sicher weg (`runDunkelWeg`)
- **Im normalen Lauf-Bildschirm lösen alle Knöpfe (Abdunkeln, Pause/Weiter, Ansagen, Beenden) erst nach 3 s Gedrückthalten aus** (`runHalten`, `RUN_HALTEN`): der Knopf füllt sich dabei, ein kurzer Tipp tut nichts, Tastatur-Klick löst sofort aus. Hinweis unter den Knöpfen. Aufwecken aus dem Dunkel weiter 2 s halten. Schnelltest 22 Prüfungen. Fassung 2026-10-02-32

## 2026-10-06 · Leiste unten, Statistik, Fokus

- **Leiste unten** (`tabLeiste`, `#tabbar`): Start · Suche · Statistik · Einstellungen, nur auf diesen vier Hauptseiten (in Listen, Editoren und im Training ausgeblendet). Lupe und Zahnrad oben auf der Startseite entfallen
- **Statistik** (`#stats`, `renderStats`): Training (Trainings und Zeit der letzten 7 Tage, Trainings der letzten 30 Tage), Muskelgruppen der letzten 7 Tage (von der Startseite hierher verlegt) und Run (Läufe, Kilometer, km der letzten 7 Tage, längster Lauf, schnellste und Ø-Pace); alles lokal aus den gespeicherten Daten. Die Wochenzeile „Diese Woche“ bleibt auf der Startseite
- **Fokus** ganz oben in den Einstellungen: Schalter je Bereich (Air, Studio, Summit, Mobility & Stretch, Run) – ausgeblendete Bereiche verschwinden von der Startseite (`settings.fokusAus`), Daten und Suche bleiben; sind alle aus, zeigt die Startseite einen Hinweis mit Knopf zu den Einstellungen
- Schnelltest 23 Prüfungen (neu: Leiste, Statistik, Fokus). Fassung 2026-10-02-33

## 2026-10-06 · Statistik nach Fokus und Nutzung, Fokus kompakt

- **Statistik richtet sich nach dem Fokus**: nur eingeschaltete Bereiche erscheinen, der in den letzten 4 Wochen am meisten genutzte steht oben (bei Gleichstand die Reihenfolge der Startseite). Oben ein Überblick (Trainings und Zeit 7 Tage, Trainings 4 Wochen); je Bereich Trainings, Zeit und „Zuletzt“, bei Air und Studio die Muskelgruppen der letzten 7 Tage; Run mit Läufen, Kilometern, längstem Lauf, Paces und **Kilometern pro Woche** (4 Wochen als Balken). Alles ohne Server
- **Verlauf merkt sich den Bereich** (`b` = lib/timer/reps/warm/run in `state.db.history`, `bereichVonQuelle`); ältere Einträge ohne `b` werden geschätzt (Studio, sonst mit Übungen = Air, ohne Übungen = Run). Der Kurz-Verlauf hält jetzt 31 statt 14 Tage (`histKeepDays`), damit die 4-Wochen-Zahlen stimmen
- **Fokus in den Einstellungen kompakt**: fünf Chips in einer Zeile mit Bereichsfarbe statt fünf Schalterzeilen. Schnelltest 23 Prüfungen. Fassung 2026-10-02-34

## 2026-10-06 · Fokus wie Darstellung, Filter starten zugeklappt

- **Fokus** in den Einstellungen im Stil von „Darstellung“: Karte mit Beschriftung „Bereiche auf der Startseite“ und denselben Auswahl-Knöpfen (`.theme-pick`, ausgewählt = an), statt Chips
- **Filter beginnen zugeklappt**: Air-Filter (`libFilterOpen`), Studio-Filter (`stFilterZu`) und Studio-Timer (`stTimerAuf`) wurden bisher dauerhaft offen gemerkt; sie werden jetzt beim Besuch der Startseite zurückgesetzt, innerhalb eines Besuchs bleibt der Zustand. Fassung 2026-10-02-36

## 2026-10-06 · Statistik mit Diagrammen, neue Bereichs-Reihenfolge

- **Statistik einladender**: Kopf mit großer Zahl (Trainings in 7 Tagen), Vergleich zum Zeitraum davor und Wochen-Serie; **Verlauf** über 8 Wochen als Balken (umschaltbar Zeit/Trainings); **Kalender** der letzten 4 Wochen (Tage dunkler je Trainingszeit); je Bereich eine Karte mit Wochenbalken in der Bereichsfarbe; Run mit Kilometern pro Woche, **Pace-Verlauf** der letzten Läufe als Linie mit Trend-Satz und Rekorden (längster Lauf, schnellster Kilometer, schnellste Pace); Summit mit „Bestzeiten verbessert“; Muskelgruppen bei Air und Studio. Ohne Daten ein freundlicher Start mit Platzhalter-Balken
- **Wochensummen** (`settings.statW[Montag] = { n, s, a:{ bereich:{ n, s } } }`): was nach 31 Tagen aus dem Kurz-Verlauf fällt, wird als Wochensumme behalten (höchstens 60 Wochen), damit der Fortschritt über Monate sichtbar bleibt; nur lokal, in Sicherung und Schnappschuss enthalten; Datenschutzseite ergänzt
- **Reihenfolge der Bereiche**: Air, Studio, Summit, Run, Mobility & Stretch (Standard und einmalige Übernahme `bereicheV`); die Statistik stellt weiterhin den zuletzt am meisten genutzten Bereich nach oben. Schnelltest 23 Prüfungen. Fassung 2026-10-02-37

## 2026-10-06 · Run ohne Beta, Run unten in der Statistik

- **„[BETA]“ bei Run entfernt** (Titel, Kachel, Hinweise, Datenschutzseite, Schnelltest)
- **Statistik**: Run steht als zweitletzter Bereich, Mobility & Stretch als letzter; davor die übrigen nach Nutzung. Die Startseite bleibt unverändert (Air, Studio, Summit, Run, Mobility & Stretch). Fassung 2026-10-02-38

## 2026-10-06 · Statistik: Diagramme verschiebbar

- **Verlauf, Wochenbalken je Bereich, Kilometer pro Woche und Pace-Linie lassen sich nach links wischen**, solange Daten da sind (mindestens 8, höchstens 104 Wochen; startet bei „jetzt“ rechts; Balkenbreite fest, `.bscroll`). Pace-Linie zeigt bis zu 60 Läufe, der Trend-Satz nutzt die letzten 12. Fassung 2026-10-02-39

## 2026-10-06 · Statistik: Kalender einklappbar

- „Letzte 4 Wochen“ ist einklappbar (startet zugeklappt, Zeile zeigt die aktiven Tage), die Tage sind je nach Trainingszeit dunkler (Legende „weniger → mehr Trainingszeit“). Fassung 2026-10-02-40

## 2026-10-06 · Besuch-Regel, Statistik über die ganze Zeit, README, Texte ausgelagert

- **Ein Training = ein Besuch**: Timer-Einträge mit höchstens 60 Minuten Abstand zählen zusammen (`besuche()`, `besuchLuecke()`); die Trainingszeit läuft vom ersten Start bis zum Ende des letzten Timers. Gilt für Statistik und Wochenzeile; Läufe zählen einzeln
- **Statistik über die ganze Zeit**: Wochensummen (`settings.statW`) ohne 60-Wochen-Grenze (bis ca. 20 Jahre), jetzt als Besuche archiviert (`bn`/`bs`); Verlauf und Bereichs-Diagramme umschaltbar **Woche · Monat · Jahr** (nach links wischen, so weit Daten da sind; Woche zeigt bis zu 104 Wochen)
- **README neu** (aktueller Stand inkl. Run, Statistik, Leiste, Fokus, Grundsatz „lokal, ohne Server“), **VERLAUF.md gekürzt** (ältere Einträge in `docs/VERLAUF-Archiv.md`), neuer **`docs/TESTPLAN.md`** für Ton und GPS auf dem echten Handy
- **Texte in `texte.js`** (`window.BLOC_TEXTE`, ein Schlüssel pro Zeile statt zwei Zeilen mit je 7.000+ Zeichen); `app.js` nutzt `var I18N = window.BLOC_TEXTE`. `texte.js` steht im Service-Worker-Grundgerüst und in `index.html`. Schnelltest 24 Prüfungen (neu: Besuche, Monat/Jahr, Archiv). Fassung 2026-10-02-43

## 2026-10-06 · Statistik lebendiger

- **Wochenziel-Ring** statt großer Zahl: Trainings dieser Woche (ab Montag) von einem einstellbaren Ziel (1–7, `settings.wochenZiel`, Standard 3), Ring füllt sich animiert, bei erreichtem Ziel „Wochenziel geschafft!“; Vergleich mit der Vorwoche und Serie als Chips
- **Balken in Akzentfarbe** (laufende Woche kräftig, frühere zart) mit Aufbau-Animation, Kalender in Akzentfarbe, **Bereichskarten** mit Farbverlauf und drei Kennzahlen (Trainings, Zeit, Zuletzt; Run: Läufe, km, Zuletzt); Werte unter einer halben Minute zeigen „<1“ statt „0“. Fassung 2026-10-02-44

## 2026-10-06 · Favoriten tragen wieder die Farbe ihres Bereichs

- Favoriten auf der Startseite waren durch eine Designregel (`.list-item .playbtn.bl` → Air-Blau) wieder alle blau. Jetzt: **Air blau** (`tp`), **Studio-Pläne violett** (`st`), **Timer-Workouts und Blöcke hellblau** (`ti`), Summit gold, Mobility grün. Fassung 2026-10-02-45
- Neu im Ordner `promo/`: 30-Sekunden-Werbevideo als HTML (`promo-bloc.html`, gebaut mit `build.sh` aus `promo-template.html` und den Bildschirmfotos in `bilder/`; Musik wird im Browser erzeugt, Aufnahme als MP4/WebM direkt im Browser). Nicht Teil der App-Auslieferung

## 2026-10-06 · Quellen & Substanz, Skater-Figur

- **`quellen.html`** (aus Einstellungen › „Quellen & Hintergrund“, aus den Info-Hinweisen und aus der Statistik verlinkt): ehrliche Vorbemerkung (eigene Zusammenstellungen, nicht fachlich geprüft), Tabelle „woran sich BLOC orientiert“ und 11 geprüfte Quellen (WHO 2020, Nationale Empfehlungen 2016, ACSM 2009 und 2011, Schoenfeld 2016, Buchheit & Laursen 2013, Tabata 1996, Behm 2016, NHS, ACE). Deutsch und Englisch; im Service-Worker-Grundgerüst
- **Statistik › Bewegungsempfehlung**: Bewegung dieser Woche (Ziel 150 min) und Krafttage (Ziel 2) als Balken, mit Link zu den Quellen; Mobility & Stretch zählt nicht mit
- **`docs/FACHPRUEFUNG.md`**: Checkliste für eine Prüfung der Inhalte durch eine Fachperson
- **Figur Skater Jumps** neu nach dem seitlichen Ausfallschritt (Standbein gebeugt, anderes Bein seitlich gestreckt, Hand Richtung Fuß; Vorderansicht); **Pistol Squat**: Spielbein in der Ausgangshaltung nach vorn gestreckt. Entwicklungshilfe `?dev` (`window.BLOC_DEV`) zum Prüfen der Figuren. Fassung 2026-10-02-46

## 2026-10-06 · Wochenziel zählt Trainingstage

- Das Wochenziel (1–7) und der Ring zählen jetzt **verschiedene Tage mit Training**, nicht mehr Einheiten: mehrere Trainings am selben Tag sind ein Tag; der Vergleich mit der Vorwoche zählt ebenfalls Tage („In der Vorwoche: 4“). Beschriftungen angepasst („Trainingstage diese Woche“, „von 3 Tagen“, „Wochenziel (Tage)“). Fassung 2026-10-02-47

## 2026-10-06 · Drei kleine Hilfen (schlank)

- **„Was ist was?“**: Link neben „Bereiche“ auf der Startseite (`.sec-link`), öffnet fünf Zeilen Klartext zu Air, Studio, Summit, Run, Mobility; die Startseite selbst bleibt unverändert
- **Bestleistung bemerken** (Studio): trägt man einen Satz mit mehr als dem bisherigen Bestgewicht ein, zeigt die Karte eine ruhige Zeile „Neue Bestleistung · 120 kg × 10 · vorher 117,5 kg“ (`studioPR`); verschwindet bei „Letzten Satz löschen“ oder beim Verlassen der Karte. Der Verlauf selbst (Kurve, Bestwert, letzte Einheiten) gab es schon
- **Leichter / Schwerer** in der Übungsinfo („Passt es nicht?“): zwei Knöpfe zur nächst leichteren und nächst schwereren Übung (`LZ_KETTEN` in `daten.js`, 9 Ketten, ca. 35 Übungen; nicht fachlich geprüft, siehe `quellen.html`)
- Schnelltest 25 Prüfungen. Fassung 2026-10-02-49

## 2026-10-06 · Skater: ruhigere Bewegung

- Skater Jumps: die Bewegung lief über ein aufrechtes Stehen in der Mitte und wirkte wie hektisches Hüpfen. Jetzt: Landung (seitlicher Ausfallschritt) → **tiefer, breiter Stand in der Mitte** → Gegenseite, weich überblendet, Zyklus ca. 1,6 s. Fassung 2026-10-02-50

## 2026-10-06 · Timer-Ring repariert

- Beim laufenden Timer erschien außen ein zweiter, dicker Ring: meine Statistik-CSS (Wochenziel-Ring) nutzte dieselben Klassennamen (`.ring-bg`, `.ring-bar`) wie der Timer und überschrieb dessen dünnen Ring. Der Statistik-Ring heißt jetzt `.stat-ring` / `.sr-bg` / `.sr-bar` / `.sr-mitte`; der Timer sieht wieder aus wie vorher. Lehre: neue Klassen für Statistik/Hilfen mit eigenem Präfix. Fassung 2026-10-02-51

## 2026-10-06 · Suche mit Kategorien, „Figuren prüfen“ entfernt

- **Suche**: unter dem Suchfeld Kategorien als Chips (Alle · Übungen · Workouts · Challenges · Timer · Bereiche · Erstellen, nach links wischbar). Mit gewählter Kategorie und ohne Suchwort erscheinen alle Einträge dieser Kategorie, mit Suchwort wird darin gesucht; „Alle“ ohne Suchwort zeigt wie bisher den Hinweis (`suchKat`, `suchKategorie`)
- **„Figuren prüfen“ aus den Einstellungen entfernt** (Zeile, Seite `#figuren`, `renderFiguren`, Schnelltest dazu). Zum Prüfen der Figuren bleibt `index.html?dev` (`window.BLOC_DEV`). Schnelltest 25 Prüfungen. Fassung 2026-10-02-52

## 2026-10-06 · Skater komplett neu

- Skater Jumps neu gezeichnet nach Beschreibung und Zeichnung von WorkoutLabs (<https://workoutlabs.com/exercise-guide/skaters/>; nur als Vorlage für Haltung und Ablauf, Figur selbst gezeichnet): Landung auf einem Bein (Knie gebeugt), Oberkörper nach vorn, anderes Bein gebeugt hinter dem Körper, Gegenarm vor dem Körper; kurzer Flug mit beiden Füßen in der Luft. Der Blick bleibt nach rechts, Beine und Arme tauschen die Rollen (`qSwap`) – kein Umdrehen und kein Aufrichten dazwischen; Zyklus ca. 1,5 s. Fassung 2026-10-02-53

## 2026-10-07 · Eine Filterkarte für Air, Studio, Mobility & Stretch und Summit

- **Gemeinsame Filterkarte** (`filterKarteHTML`): zugeklappt eine Zeile „Filter“ mit Zusammenfassung (z. B. „Beine, Kurzhantel“) und Zahl der aktiven Filter; aufgeklappt Chips in Gruppen, unten „Zurücksetzen“ und „N … anzeigen“ (klappt die Karte zu, die Zahl entspricht der Liste). Aufgebaut wie die ältere Filteransicht, im aktuellen Layout.
- **Air**: die vier Kacheln (Kraft · Ausdauer · Rumpf · Stangenpark) entfallen; Filter über Training (Cardio … Calisthenics) und Ausrüstung (Ohne Geräte … Dip-Barren), dazu Sortierung. Auch im Workout-Baukasten dieselbe Karte.
- **Studio-Übungen nicht mehr in Air**: Übungen mit Ausrüstung „Fitnessstudio“ (Geräte, Langhantel, eigene Studio-Übungen) erscheinen in Air weder in der Übungsliste noch im Baukasten; der Chip „Fitnessstudio“ entfällt dort. Kein fertiger Air-Workout enthält solche Übungen. Die Suche über alles findet sie weiterhin.
- **Studio**: Gruppen, Ausrüstung und der Schalter „Air-Übungen“ liegen in derselben Karte. **Fehler behoben:** der Filter klappte nach jeder Auswahl zu, weil das Auf/Zu beim ersten Öffnen nicht gespeichert wurde - Mehrfachauswahl war dadurch mühsam. Jetzt bleibt die Karte offen, bis man sie schließt (beim Start der App wieder zu).
- **Mobility & Stretch** (Dehnen): Körperregionen als Chips in der Karte, auch im Baukasten. **Summit**: Stufe (Einheiten) bzw. Level (Programme) und Ausrüstung in der Karte; Zurücksetzen stellt „Mittel“/„Alle“/„Alle Geräte“ wieder her.
- Schnelltest: neuer Test zur Filterkarte (Air ohne Kacheln und ohne Studio-Übungen, Mehrfachwahl in Air, Studio, Dehnen, Summit), bestehende Tests öffnen die Karte vorher. 26 Prüfungen, alle grün. FASSUNG 2026-10-02-54.

## 2026-10-07 · Filterkarte: Summit-Stufe und Studio-Schalter wieder außerhalb

- **Summit**: Stufe (Einheiten) bzw. Level (Programme) stehen wieder sichtbar über der Filterkarte - das ist die Hauptwahl der Seite und gehört nicht hinter eine zugeklappte Karte. In der Karte bleibt nur die Ausrüstung („Alle Geräte“ / „Ohne Stange“); „Zurücksetzen“ betrifft nur diese.
- **Studio**: „Air-Übungen einbeziehen“ ist eine Einstellung, kein Filter - eigene Zeile über der Karte (auch im Plan-Bau). Die Karte enthält nur noch Gruppen und Ausrüstung.
- Schnelltest angepasst (Summit-Stufe ohne Aufklappen, Zurücksetzen nur für die Ausrüstung); 26 Prüfungen, alle grün. FASSUNG 2026-10-02-55.

## 2026-10-07 · Weniger Erklärtext: „?“ statt grauer Zeilen, leere Favoriten nur eine Zeile

- **Erklärtexte über den Listen** (Air › Übungen, Studio, Timer, Plan, Plan-Bau, Workout-Baukasten, Mobility & Stretch, Summit) stehen nur bei den ersten drei Besuchen einer Seite. Danach sitzt ein kleines „?“ neben der Lupe, das den Text in einem Fenster öffnet. Ein Besuch = die Seite von der Startseite aus betreten; Reiter, Filter und Zurück zählen nicht. Gezählt wird lokal in `settings.hinweise` (nichts verlässt das Gerät). Neu: `hinweise()`, `openHinweise()`.
- **Startseite**: leere Favoriten sind keine Box mehr, sondern eine Zeile neben der Überschrift („Favoriten – mit ☆ markieren, dann stehen sie hier“); mit dem ersten Favoriten verschwindet der Hinweis.
- Das „?“ ist kleiner als Zurück und Lupe, und der Titel wird mit „?“ etwas kleiner, damit „Mobility & Stretch“ nicht umbricht.
- Schnelltest: neuer Test zu den Erklärtexten (Zählung, „?“, Fenster, Startseite); 27 Prüfungen, alle grün. FASSUNG 2026-10-02-56.

## 2026-10-07 · Skater Jumps von vorn

- Skater Jumps jetzt in der **Vorderansicht**: man steht der Figur gegenüber, der Oberkörper bleibt zu uns gedreht, die Bewegung läuft seitlich über das Bild (Landung links → Flug → Landung rechts → Flug zurück). Die Profil-Fassung davor wirkte beim Wechsel der Seite wie eine Drehung um 180°.
- **Rücken tief**: in der Landung tief auf einem Bein, der Rücken stark nach unten gebeugt (von vorn: kurzer Rumpf, Kopf tief, bleibt auch im Flug tief), die Hand der Standseite reicht Richtung Boden, das andere Bein ist hinter dem Standbein gekreuzt, der andere Arm schwingt nach außen.
- Daten: `SK_L`/`SK_AIR` (frontal) vor `ILLU_POSES`, Landung rechts per `qMirror`. FASSUNG 2026-10-02-57; Schnelltest 27/27 grün.

## 2026-10-07 · Kleine graue Zusatztexte entfernt

- Startseite: „gedrückt halten zum Sortieren“ neben **Bereiche** entfällt; der Tipp steht jetzt am Ende von „Was ist was?“.
- „Mehrere möglich“ an den Filtergruppen (Air, Studio, Mobility & Stretch) und im Formular „Eigene Übung“ entfällt - die Chips lassen sich ohnehin einzeln an- und abschalten.
- Bleiben: die Zahlen hinter Gruppennamen (z. B. „Arme 8“, sie sind Information), die Erklärtexte der ersten drei Besuche mit „?“ und der Hinweis bei leeren Favoriten. FASSUNG 2026-10-02-58; Schnelltest 27/27 grün.

## 2026-10-07 · Übungen als quadratische Kacheln mit Muskeln

- **Air › Übungen** und **Mobility & Stretch › Übungen** zeigen die Übungen jetzt wie im Studio als quadratische Kacheln (drei pro Zeile auf dem Handy): Figur, Name und darunter in Kurzform die ersten zwei **Hauptmuskeln** (z. B. „Seitliches Gesäß, Oberschenkel vorn“). Tippen = Übungsinfo (eigene Übung: bearbeiten), ▶ unten links = starten, ☆ = merken, lange drücken = in Workout oder Plan legen. Ausgeblendete Übungen bleiben unten als Zeilen mit „Einblenden“.
- **Studio** (und Plan-Bau, Workout-Baukasten): dieselbe Muskelzeile unter dem Namen; der Strich „–“ ohne Gewicht entfällt, der letzte Satz steht erst, wenn er eingetragen ist.
- Die Übungsinfo hat neu den Knopf „Zu Programm hinzufügen“ (früher nur im ⋯-Menü der Zeile). Die Workout-Listen bleiben Zeilen.
- Schnelltest angepasst (Suche zählt Kacheln, Plan-Bau zählt Muskelzeilen); 27/27 grün. FASSUNG 2026-10-02-59.

## 2026-10-07 · Übungskacheln nachgebessert

- Die **Muskelzeile steht direkt unter dem Namen** (keine Lücke mehr für eine zweite Namenszeile), Schrift 12 px statt 11, bis zu drei Zeilen (auf dem 375-px-Raster passen 102 von 103 Texten vollständig).
- **▶ Start**: 30 px sichtbar, aber 44 px Tippbereich, damit man das ☆ daneben nicht trifft.
- **Gerät auf der Figur**: unten rechts ein kleines Symbol (Kettlebell, Kurzhantel, Stange, Dip-Barren), wenn die Übung ein Gerät braucht; ohne Geräte nichts. Das ersetzt die frühere Zeile „Ohne Geräte · Cardio …“ der Listenansicht.
- FASSUNG 2026-10-02-60; Schnelltest 27/27 grün.

## 2026-10-07 · Schlankere Kopfzone, „Überrasch mich“ in der Leiste, Timer als eigene Seite

- **Reiterzeile statt Karte**: Air, Studio, Mobility & Stretch und Summit haben schlanke Reiter mit Unterstrich in der Farbe des Bereichs (`reiterZeileHTML`, `.rz`) statt einer Karte mit Knöpfen. Das spart Höhe, der aktive Reiter ist eindeutig. Bei Mobility & Stretch bleibt der Umschalter Mobility | Stretch darüber.
- **„Überrasch mich“ in der ersten Leiste von Air**: ein Knopf mit Symbol und Text rechts neben dem Titel, in jedem Reiter erreichbar; die große Karte unter den Reitern entfällt. Steht rechts zusätzlich das „?“ (Erklärtext eingeklappt) oder ist das Handy sehr schmal, zeigt der Knopf nur das Symbol. Neues, klareres Symbol: Zauberstab mit Funken (statt der zwei Sterne).
- **Timer als eigene Seite** (`#intervall`, `renderIntervall`): der Reiter „Timer“ gab es in Air und Studio mit derselben Liste - jetzt je ein Reiter weniger (Air: Workouts · Übungen · Meine; Studio: Übungen · Mein Plan). Der Timer hat auf der Startseite eine schlanke **Schnellwahl** unter den Bereichen („Eigene Intervall-Timer · 3 Workouts · 5 Blöcke“); sie gehört nicht zu den sortierbaren Bereichen und nicht zum Fokus. Alte Adressen (`#blocks`, `#timers/workouts`) und gespeicherte Reiter führen dorthin; die Editoren für Blöcke und Timer-Workouts kehren zur Timer-Seite zurück.
- Filterkarte und Hinweiszeile bleiben unverändert. Schnelltest angepasst (Reiterzeile, Überrasch mich in jedem Reiter, Timer-Seite, Schnellwahl); 27/27 grün. FASSUNG 2026-10-02-61.

## 2026-10-07 · Timer wieder ein Bereich, schmale Überrasch-mich-Leiste, A–Z als Schalter

- **Timer ist wieder ein eigener Bereich** (Schlüssel `intervall`, Seite `#intervall`): auf der Startseite in der Reihenfolge Air · Studio · **Timer** · Summit · Run · Mobility & Stretch, wie die anderen Bereiche per langem Drücken sortierbar und in den Einstellungen unter „Fokus“ abschaltbar, mit eigener Zeile in „Was ist was?“, in der Suche und in der Statistik (eigene Karte „Timer“). Die Schnellwahl unter den Bereichen entfällt. Bestehende Reihenfolgen bekommen den Timer einmalig direkt nach Studio. Neu gestartete eigene Timer-Workouts und Blöcke zählen als Timer, frühere Einträge stehen weiter bei Air.
- **„Überrasch mich“ als schmale Leiste** (eine Zeile, 42 px, Zauberstab-Symbol) direkt unter den Reitern von Air in allen drei Reitern; der Knopf in der ersten Leiste entfällt.
- **Sortierung A–Z als kleiner Schalter** in der Kopfzeile der Filterkarte (rechts neben „Filter“); der Sortier-Block in der Karte entfällt, die Karte wird kürzer. Aus = Standardreihenfolge (Standard bzw. Dauer), an = alphabetisch; gilt auch im Workout-Baukasten.
- Schnelltest angepasst (sechs Bereiche, Reihenfolge, Leiste, A–Z, Fokus, Statistik); 27/27 grün. FASSUNG 2026-10-02-62.

## 2026-10-08 · Studio: Air-Übungen ohne Schalter

- **Der Schalter „Air-Übungen einbeziehen“ ist weg.** Die Air-Übungen (Kurzhantel & Kettlebell, Stange & Barren, Körpergewicht) sind im Studio immer da: Ohne Gruppenwahl stehen sie am Ende der Liste unter **„Aus Air“** als drei schmale, zugeklappte Zeilen mit Zahl (z. B. „Kurzhantel & Kettlebell · 16“). So bleibt die Studio-Liste kurz, und nichts ist versteckt. Antippen klappt eine Zeile auf (`studioAirBlockHTML`, `studioAirBinden`); der Zustand gilt nur für den Besuch und wird nicht gespeichert.
- **Suche** klappt alle Air-Gruppen mit Treffern auf und blendet die ohne Treffer aus; ohne Suchwort stehen sie wieder zugeklappt da. **Gruppen-Chips** (Kurzhantel & Kettlebell, Stange & Barren, Körpergewicht) zeigen die Gruppe offen als eigenen Abschnitt. Dasselbe gilt im Plan-Bau.
- „Plan nach Gewichtung“ zieht weiterhin nur echte Studio-Übungen (`gr.air` wird übersprungen). ★-markierte Air-Übungen folgen jetzt wie alle anderen der Gruppenwahl. Die alte Einstellung `settings.stAir` wird nicht mehr gelesen (bleibt in alten Ständen unbenutzt liegen). Gruppe „Air · Körpergewicht“ heißt jetzt „Körpergewicht“ (steht ja unter „Aus Air“).
- Schnelltest angepasst: kein Schalter, drei zugeklappte Zeilen, Auf-/Zuklappen, Suche, Chip „Stange & Barren“, Zurücksetzen. FASSUNG 2026-10-02-63.
