# Plan-Assistent: Regeln und Quellen (Stand 2026-11-09)

Der Assistent (`js/25-plan-assistent.js`, Workout-Builder › „Trainingsplan erstellen lassen“) baut aus den Antworten eigene BLOCs und einen Trainingsplan und legt ihn in den Kalender. Die Zahlen stehen in `PA_REGELN`, `PA_CARDIO`, `PA_RIR`; die Ausschlüsse in `PA_AUS`/`PA_NIE`; die Wochenstruktur in `PA_TAGE` und `PA_SLOTS`. Die Literaturliste steht auch in `quellen.html` (Abschnitt „Quellen zum Plan-Assistenten“). **Praxis** = Festlegung von BLOC im Einklang mit den Quellen, keine Studienzahl.

| Regel im Code | Quelle | Status |
|---|---|---|
| Jede Muskelgruppe mindestens 2× pro Woche (Ganzkörper bis 3 Tage, Ober-/Unterkörper ab 4) | ACSM 2026 (PA1), Currier 2023 (PA3) | belegt; Ganzkörper/Split-Schwelle Praxis |
| Mindestens 2 Krafttage, 150–300 min moderat oder 75–150 min intensiv | WHO 2020 (PA2) | belegt |
| Kraft: 3–6 Wdh., 3–4 Sätze, Pause 90–150 s; Muskelaufbau: 6–20 Wdh. (10–12 / 8–10 / 6–8 je Stufe), 2–4 Sätze, Pause 60–90 s | PA1, PA3, PA6, PA5 | Bereiche belegt, Einzelwerte Praxis |
| 1–4 Wiederholungen in Reserve, kein Muskelversagen nötig; bei „leicht“ mehr Reserve | PA4, PA1 (Halperin 2022: Reserve wird zu knapp geschätzt) | belegt / Praxis |
| Pausen über 60 s kleiner Vorteil, über 90 s kein weiterer; Grundübungen länger | PA5 | belegt |
| Leichtwoche: etwa die Hälfte der Sätze, Gewicht bleibt, am Planende | PA7 (Expertenkonsens, kein RCT) | Praxis |
| Wochenstruktur 4/6/8 Wochen, einfache Steigerung (eine Wdh. mehr bzw. schwerere Variante) | Moesgaard 2022, PA1 | Praxis |
| Aufwärmen 5–10 min, Dehnen ans Ende | Behm 2016, PA9 | Praxis |
| Kraft + Ausdauer im selben Plan möglich, Cardio-/Lauftage getrennt | PA8 | belegt |
| Laufeinstieg: Gehen und Laufen im Wechsel, bis 3×/Woche mit Ruhetag; Umfang etwa +10 % pro Woche, nie über 30 % | NHS Couch to 5K (Struktur), PA13 | Praxis (10-%-Regel nicht belegt) |
| Ab 65: eine Gleichgewichtsübung je Einheit (Einbeinstand), keine Stufe-3-Übungen, Pausen +15 s, Wdh. +2 | PA2, PA10, PA11 | belegt / Praxis |
| Anderer Sport: am Sporttag und am Folgetag kein Unterkörper/Ganzkörper, zwei Tage danach kein reiner Unterkörper | PA12 (Beine nach 48–72 h noch nicht erholt) | Praxis |
| Einschränkungen (Knie, Schulter, Rücken, Handgelenk, Sprunggelenk) und „gelenkschonend“: Übungen mit passenden Namensbestandteilen entfallen, Ersatz aus dem Katalog | – | **Praxis, ohne Quelle**; keine Therapie |
| Hochleistungsfertigkeiten (Planche, Muscle-up …) nie in automatischen Plänen | – | Praxis |

Nicht verwendet: Viana 2019 (BJSM) trägt eine „Expression of Concern“. Offen: HIIT-Dosis für Fettverlust, belegte Aufwärmdauer, Übungsanpassungen für Schulter/Handgelenk/Sprunggelenk. Kein Versprechen zu Fettverlust an einzelnen Körperstellen. Keine Ernährungs- oder Medizinberatung.
