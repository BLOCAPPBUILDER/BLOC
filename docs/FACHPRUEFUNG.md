# Fachprüfung – was geprüft werden sollte

BLOC ist ein privates Projekt. Die Inhalte sind **eigene Zusammenstellungen**, orientiert an allgemein anerkannten Empfehlungen
(Quellen: [quellen.html](../quellen.html)), aber **nicht von einer Fachperson freigegeben**. Dieses Dokument ist die Checkliste für eine
Trainerin, einen Sportwissenschaftler oder eine Physiotherapeutin, die die Inhalte gegenlesen.

Stand: 2026-10-06 · Fassung 2026-10-02-46

## Was zu prüfen ist (nach Wichtigkeit)

| Bereich | Umfang | Wo im Code | Fragen an die Fachperson |
|---|---|---|---|
| Übungsbeschreibungen: „So geht's“, Haltung, Vermeiden | ca. 230 Übungen (darunter 38 mit Widerstandsband, neu 2026-10-09), Deutsch und Englisch | `daten.js` (`EX_INFO` = Schritte, `EX_POSTURE` = Haltung und Vermeiden, je Übungs-Id) | Sind die Anweisungen fachlich richtig und sicher? Fehlen wichtige Warnhinweise? |
| Studio: Steigerungsvorschlag (doppelte Progression), Wiederholungsbereiche, Pausen | Studio-Karte | `js/*.js` (Suche „doppelten Progression“: Ziel zweimal hintereinander geschafft → Gewicht hoch) | Ist die Regel für Einsteiger sinnvoll und sicher? Passen die Schrittgrößen (kg)? |
| Fertige Workouts (Air) und Aufwärm-/Dehnprogramme | 50 Workouts (darunter 4 mit Band), 13 Programme | `daten.js` (`LIB_WORKOUT_ROWS`) | Ist die Übungsauswahl und Reihenfolge sinnvoll (Belastung, Pausen, Dauer)? Sind Stufen (Leicht/Standard/Fortgeschritten) richtig eingeordnet (`EX_LEVEL`)? |
| „Überrasch mich“-Regeln | Generator | `js/*.js` (Suche „spDauerTreffen“, Überrasch-Regeln in der README) | Ist die Mischung (Muskelgruppen reihum, Drücken/Ziehen, Burpee-Variante) vertretbar? |
| „Leichter / Schwerer“-Ketten | 9 Ketten, ca. 35 Übungen | `daten.js` (`LZ_KETTEN`) | Ist die Reihenfolge von leicht nach schwer fachlich richtig? Fehlen sinnvolle Zwischenstufen (z. B. Knie-Liegestütze)? |
| Zuordnung Muskelgruppen und Körperregionen | `EX_MUSCLES`, Dehnen-Regionen, Körperkarte (`MUSKEL_GRP`, `KK_ZONEN` in `js/*.js`) | `daten.js` | Stimmen Haupt- und Hilfsmuskeln? Passen die 10 groben und 21 feinen Zonen der Körperkarte und die Zuordnung der Muskelnamen (`KK_REGELN`)? |
| Figuren | Strichfiguren je Übung | `daten.js` (`ILLU_POSES`, `ILLU_SEQ`) | Zeigen sie die Ausführung im Wesentlichen richtig? (Prüfansicht: `index.html?dev` und in der Konsole `BLOC_DEV`) |
| Bewegungsempfehlung in der Statistik | Statistik-Karte | `js/*.js` (`statWho…`) | Ist die Darstellung (150 min, 2 Krafttage) richtig und nicht irreführend? |

## Neu seit 2026-10-23 (noch nicht fachlich geprüft)

| Bereich | Umfang | Wo im Code | Fragen an die Fachperson |
|---|---|---|---|
| Zusätzliche Katalog-Workouts für dünn besetzte Gruppen | 15 Workouts (Brust, Schultern, Rücken, Arme, Bauch, Cardio mit Battle Ropes; Fitnessstudio und Freiluft) mit Hinweistexten | `daten.js` (Block „Mehr Abwechslung“, `LIB_WORKOUT_INFO`) | Sind Auswahl und Reihenfolge sinnvoll (große vor kleinen Muskeln, mehrgelenkig vor eingelenkig)? Stimmen die Wiederholungsbereiche in den Hinweisen? Sind die Battle-Rope-Workouts für Einsteiger vertretbar beschrieben, Skin the Cat in „Schultern ohne Geräte“ nur mit Vorbehalt? |
| Path › Deep Dive | Verteilung der Muskelgruppen pro Woche/Workout, Vergleich zur Vorwoche, Idee für die nächste Einheit | `js/21-koerper.js` (`renderDeepDive`), `js/08-koerperkarte.js` (`mgProzent`) | Ist die Darstellung ohne Sollwerte und ohne Bewertung vertretbar? Ist die Idee „Gruppe mit dem geringsten Anteil“ nicht irreführend (Ziele sind verschieden)? |

Die Grenze „höchstens 25 % gleiche Übungen je Gruppe und Ort“ ist eine Vorgabe der Entwicklung für mehr Abwechslung und im Schnelltest geprüft, keine Studienempfehlung.

## Wie Rückmeldungen festgehalten werden

1. Pro Befund: Übung bzw. Programm (Id), Problem, Vorschlag, ggf. Quelle.
2. Änderungen werden in `VERLAUF.md` mit Datum und Namen der prüfenden Person (wenn gewünscht) notiert.
3. Erst wenn eine Fachperson einen Bereich geprüft hat, wird in `quellen.html` und in der App stehen, **welcher** Bereich **wann** und
   **von wem** geprüft wurde – bis dahin steht dort ausdrücklich „nicht geprüft“.

## Was schon abgesichert ist

- Mengenempfehlungen (WHO 2020, Nationale Empfehlungen 2016), Progression (ACSM 2009), Pausen, Intervall- und Tabata-Zeitschema,
  Trennung von dynamischem Aufwärmen und Dehnen: mit Quellen belegt (siehe `quellen.html`).
- Technik-Hinweise sind allgemein üblich formuliert (z. B. „Knie in Fußrichtung“). Einzelne Hinweise wurden **nicht** Satz für Satz gegen
  eine Quelle geprüft.

## Stand 2026-10-09: Plausibilitätsprüfung der Band-Übungen (keine Fachprüfung)

Die 38 Band-Übungen (`daten.js`, Block „Widerstandsband“) wurden per Online-Recherche gegen die ACE-Übungsbibliothek, ACE-Fachartikel, THERABAND „Care & Safety“ und eine NHS-Wales-Patienteninformation abgeglichen (Quellen: `quellen.html`, [11]–[13]). Daraus ergaben sich diese Änderungen:

- **Aufrechtes Rudern**: ACE warnt wegen der Schulter (Innenrotation, Engpass); im „Vermeiden“-Text steht jetzt der Hinweis, bei Schulterschmerzen wegzulassen, Seitheben ist die schonendere Alternative.
- **Seitheben**: Ellbogen führen, Hände etwas tiefer, nicht über Schulterhöhe (ACE-Hinweise).
- **Beinheben zur Seite**: nur so hoch, wie das Becken ruhig bleibt (ca. 45°, ACE: seitlicher Gesäßmuskel arbeitet nur in diesem Bereich).
- **Muschel**: Hauptmuskel seitlicher Gesäßmuskel, unterstützt von tiefen Hüftrotatoren und großem Gesäßmuskel.
- **Einbeiniges Kreuzheben**: Hilfsmuskeln um Breiten Rückenmuskel ergänzt.
- **Hammer-Curl**: Oberarmmuskel (Brachialis) zuerst genannt (ACE: Brachialis als Hauptbeuger).
- **Trizeps-Drücken**: Ellbogen nicht nach vorn schwingen lassen (dann zieht der Rücken mit), oben nicht höher als die Brust.
- **Crunch kniend**: Rippen zum Becken, nicht auf die Fersen setzen.
- **Rumpfdrehung im Sitzen**: bei Rückenbeschwerden kleiner drehen, Füße am Boden.
- **Klimmzug mit Bandhilfe**: Band am Anfang kräftig auf festen Sitz prüfen, die Hilfe ist unten am größten und lässt nach oben nach, nicht vom Band hochschleudern lassen.
- **Alle Band-Übungen**: neuer Abschnitt „Mit dem Band“ in der Übungsinfo (Band prüfen, Befestigung, nie unter Spannung loslassen, Dehnungsgrenze).

Offen bleibt weiterhin die Prüfung durch eine Fachperson (Trainerin, Sportwissenschaftler, Physiotherapeutin) – insbesondere Rehabilitation und Vorerkrankungen sind nicht abgedeckt.

## Stand 2026-10-14: Dehnen und Aufwärmen (Literaturprüfung, keine Fachprüfung)

Geprüft wurden die 13 Aufwärm-/Dehnprogramme, alle Dehnübungen samt Anleitung, Haltung, Muskelzuordnung und die Texte im Reiter Mobility & Stretch. Die Studien stehen in `quellen.html` [15]–[20] (DOI per Crossref bestätigt; für die meisten lag die Zusammenfassung vor, nicht der Volltext).

**Umgesetzt (Texte und Übungsdaten):**

- Allgemeiner Dehn-Hinweis (Intensität, nicht wippen, Warnsignale) und ehrliche Aussagen zu Beweglichkeit, Muskelkater und Verletzungen; Aufwärmen: Leistung meist leicht besser, Verletzungsschutz nicht belegt.
- Sicherheitshinweise bei Kopf-tief-Haltungen (Hund, Vorbeuge), Nackendehnung, Schulterdehnungen an der Wand.
- Handgelenke je Seite zwei Haltephasen; Hinweis für den tieferen Wadenmuskel; Beschriftung „Dehnt“/„Dehnt auch“; Regionen und Muskelzuordnungen (Hüftbeuger, Oberschenkel vorn, Drehdehnung, Kind, Hund, Worlds Greatest).

**Keine belastbare Studienlage gefunden** (Praxis und Erfahrung, in `quellen.html` so benannt): Reihenfolge und Zusammenstellung der Programme, Aufwärmdauer im Heimtraining, Umsetzzeiten, Nacken- und Schulterhinweise, Kobra/Sphinx bei Rückenschmerz.

**Danach angepasst (Fassung -14-32):** Ganzkörper-Dehnen und Dehnen kurz um Oberschenkel vorn bzw. Waden ergänzt, Aufwärmen vor Kraft beginnt mit Hampelmann, Morgen-Mobility heißt „Morgens locker werden“, Handgelenke „(innen und außen)“.

**Offen, Entscheidung des Nutzers (Struktur der App):** Armkreisen in den Dehn-Auswahlen (Dehn-Überrasch-mich, Dehnteil im allgemeinen Überrasch mich); Überrasch-mich-Aufwärmen (Reihenfolge, Dauer je Übung, Dauerstufen); Umsetzzeit 5 s.

## Stand 2026-10-14: Band nachgeschärft (Literaturprüfung, keine Fachprüfung)

Probelauf des Agenten über die 38 Band-Übungen und 4 Workouts; umgesetzt in Fassung -14-33:

- Reverse Fly: Text und Figur stimmen überein; Hinweise bei Klimmzug mit Bandhilfe, Liegestützen mit Band, Beinstrecken im Liegen; Muschel und Beinheben vorsichtiger formuliert.
- „Mit dem Band“: Progressionsregel (Praxisregel) sowie Latexallergie und ärztliche Abklärung.
- Workouts mit Band: Oberkörper (Drücken ergänzt), Beine & Po (Hüftbeuge ergänzt), Rumpf (Stabilisation ergänzt); Deckblätter nennen Rhythmus und ehrlich die Studienlage zu Pausen.
- Neu in Mobility & Stretch: Kinn einziehen, Brustwirbelsäule drehen (Praxisübungen, keine Studie geprüft).

**Keine belastbare Studienlage gefunden:** Muskelwachstum mit Bändern, eine Progressionsregel für Bänder, Pausenlänge für Einsteiger mit Band, Befestigungshöhe und Griffbreite, Dehnungsgrenze „zwei- bis dreifache Ruhelänge“ (Herstellerangabe nicht verifiziert).

**Nicht geprüft:** Muskelzuordnung der übrigen Band-Übungen, Sicherheit der Rumpfdrehungen bei Rückenbeschwerden, Aufwärmhinweise vor Band-Workouts.
