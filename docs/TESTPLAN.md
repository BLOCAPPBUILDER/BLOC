# Testplan für das, was der Browser-Test nicht kann

`schnelltest.html?auto` prüft die Logik der App (Klickwege, Rechnen, Speichern, Statistik, Run mit **simuliertem** GPS).
Nicht prüfbar sind **echte Töne**, **echtes GPS**, Vibration, Wake Lock und das Verhalten bei gesperrtem Handy.
Diese Liste vor einer neuen Fassung kurz auf einem echten Handy durchgehen (Android und iPhone, wenn möglich beides).

## Töne und Sprache
- [ ] Timer starten: Arbeits-, Pausen- und Block-Pausen-Ton kommen pünktlich (kein Verspäten nach einigen Minuten).
- [ ] Tick in den letzten 3 Sekunden hörbar, auch bei leiser Musik einer anderen App (Musik läuft weiter).
- [ ] Sprachansagen an: Übungsname wird angesagt; aus: bleibt still.
- [ ] Run: „Los!“ nach dem Countdown, Ansage nach jedem Kilometer (Sprache = App-Sprache), Hörprobe klingt wie erwartet.
- [ ] Intervall-Lauf: Signal und „Laufen!“/„Gehen!“ beim Wechsel, Tick vor dem Wechsel.
- [ ] iPhone: Stummschalter an = keine Töne (erwartet, steht in den Einstellungen).

## GPS und Run (draußen, ca. 10 Minuten gehen oder laufen)
- [ ] Standort-Erlaubnis wird beim Start gefragt; nach „Nicht erlauben“ erscheint der Hinweis.
- [ ] GPS-Status: „Suche“ (pulsiert) → „gut“ (grün) innerhalb einer halben Minute im Freien.
- [ ] Strecke stimmt grob (Vergleich mit bekannter Strecke, ±3 %).
- [ ] Auto-Pause (z. B. 8 s): Stehen bleiben → „Auto-Pause“ nach etwa der eingestellten Zeit, Zeit steht; Weitergehen → läuft von selbst weiter.
- [ ] Alle Knöpfe im Lauf lösen erst nach 3 s Halten aus; kurzes Tippen tut nichts; Abdunkeln weckt nach 2 s Halten.
- [ ] Bildschirm bleibt beim Lauf an (Wake Lock); beim Abdunkeln läuft die Aufzeichnung weiter.
- [ ] Lauf beenden: Detail zeigt Kilometer, Pace-Balken, Route; Name und Notiz bleiben gespeichert.
- [ ] Lauf nach Beenden in der Statistik (Run) sichtbar.

## Installation und Offline
- [ ] „Zum Home-Bildschirm“: App startet im Vollbild, Daten bleiben nach Neustart erhalten.
- [ ] Flugmodus: App startet und funktioniert (Statistik, Timer, Run-Start bis auf GPS-Qualität).
- [ ] Nach einer neuen Fassung: Einstellungen › ganz unten zeigt die neue Nummer (ggf. App einmal schließen und neu öffnen).

## Daten
- [ ] Sicherung speichern und wieder einlesen: Statistik, Läufe, Fokus und Reihenfolge der Bereiche sind danach unverändert.
