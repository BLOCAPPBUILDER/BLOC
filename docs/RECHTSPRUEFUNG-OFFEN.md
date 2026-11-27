# BLOC – offene Punkte der Rechtsprüfung

Stand: 27.11.2026. Arbeitsliste aus zwei technischen Vorprüfungen, **keine Rechtsberatung**. Erinnerung ist für den **11.12.2026, 9 Uhr** eingestellt (geplante Aufgabe „BLOC: Impressum-Angaben und Rechtsprüfung“).

Aktueller Fall: **privat, kein Kleingewerbe**. Pflicht ist schon jetzt ein Impressum nach § 18 Abs. 1 MStV (Name und Anschrift), weil die App öffentlich ist. § 5 DDG (vollständiges Impressum) kommt mit einem Gewerbe dazu, ebenso der Händlerstatus in den Stores.

## 1. Vom Betreiber auszufüllen

Die Platzhalter stehen gelb markiert (`class="luecke"`) in:

- `impressum.html` (DE und EN): Vorname Nachname, Straße Hausnummer, PLZ Ort, E-Mail, zweiter Kontaktweg (Telefon oder Kontaktformular), „Verantwortlich für den Inhalt“, Name in der Urheberzeile.
- `privacy.html` (DE und EN), Kasten „Verantwortlich“ / „Controller“: Name, Anschrift, E-Mail.

Regeln: kein Postfach, keine Packstation; die Anschrift ist danach öffentlich. Am besten eine eigene E-Mail-Adresse für BLOC anlegen, die auch in den Stores steht. Finden: `grep -n "luecke" impressum.html privacy.html`.

## 2. Erledigt am 27.11.2026

- [x] `impressum.html` DE/EN nach § 18 Abs. 1 und 2 MStV mit Platzhaltern; Zeile „Impressum & Lizenzen“ in den Einstellungen.
- [x] `privacy.html`: Verantwortlich, „Deine Eingaben: nur auf deinem Gerät“, Speicherdauer, GitHub Pages mit Rechtsgrundlage, Empfänger und USA-Übermittlung (Standardvertragsklauseln und DPF laut GitHub-Datenschutzerklärung vom 27.04.2026), Google Play, „Deine Rechte“ mit Beschwerderecht, Art. 22.
- [x] Haftung: kein pauschaler Ausschluss mehr; gesetzliche Haftung bleibt (Leben, Körper, Gesundheit, Produkthaftung, Vorsatz, grobe Fahrlässigkeit).
- [x] `lizenzen.html`: alle Bibliotheken der Android-App mit MIT- und Apache-2.0-Text und Cordova-NOTICE.
- [x] Kein ODR-Hinweis nötig (EU-Plattform seit 20.07.2025 abgeschaltet), es gab auch keinen.

## 3. Wichtig vor jedem Store-Start

- [ ] **Übungsbilder (rund 600 in `img/ex/`):** Herkunft klären und festhalten: welches KI-Werkzeug, welches Konto und welcher Tarif, Nutzungsbedingungen (Nutzung in einer App, kommerziell), Zeitraum. Und vor allem: **Wurden Fotos, Zeichnungen oder Bögen von anderen als Vorlage hochgeladen** (die „Sammelbögen“ aus PDF und WhatsApp)? Wenn ja, wessen? Bilder mit unklarer Herkunft ersetzen.
- [ ] **Name „BLOC“:** Im Apple App Store gibt es schon „Bloc – Adaptive hypertrophy training“ (Health & Fitness, Krafttraining, mit Abo). Selbst suchen in [DPMAregister](https://register.dpma.de), [EUIPO eSearch](https://euipo.europa.eu/eSearch/) und [TMview](https://www.tmdn.org/tmview/) nach BLOC, BLOCK, BLOK, BLOCS in den Klassen 9, 41, 42, 44. Bei Treffer: Namenszusatz oder neuer Name, Anwalt.
- [ ] **Pexels-Nachweise** einzeln öffnen und mit Datei, Motiv und Fotograf abgleichen.
- [ ] **Öffentliches Repository:** `BLOCAPPBUILDER/BLOC` ist öffentlich, also auch `VERLAUF.md`, `docs/` und die Git-Historie. Prüfen, ob das gewollt ist (Vorname, interne Entwürfe).

## 4. Google Play (Stand Ende 2026)

- [ ] Entwicklerkonto anlegen und Identität verifizieren.
- [ ] **Händlerstatus (DSA) bis 01.02.2027** erklären. Privat und kostenlos: „Nicht-Händler“ möglich. Mit Gewerbe: Händler, dann werden Anschrift und Telefon im Store angezeigt (ab 01.03.2027).
- [ ] **Geschlossener Test:** Neue private Konten brauchen 12 Tester über 14 Tage am Stück, bevor die App öffentlich gehen darf. Etwa 3 Wochen einplanen.
- [ ] Formular **Datensicherheit:** „keine Daten erfasst oder geteilt“, sofern weiter nichts gesendet wird. Standort läuft über die Google Play-Dienste; wahrheitsgemäß beantworten.
- [ ] Erklärung **Health Apps** (Pflicht für alle Apps): Fitness.
- [ ] **Vordergrunddienste** je Typ mit Beschreibung und Video: `location` (Lauf aufzeichnen) und `mediaPlayback` (Timer-Töne). `mediaPlayback` für Signaltöne ist ein Prüfrisiko; bei Ablehnung Alternative prüfen.
- [ ] Altersfreigabe (IARC) ehrlich ausfüllen; Zielgruppe 16+ oder 18+, damit die Familien-Richtlinie nicht greift.
- [ ] Datenschutz-URL: `https://blocappbuilder.github.io/BLOC/privacy.html`, Kontakt-E-Mail wie im Impressum.
- [x] Ziel-API-Level 36 erfüllt (Pflicht seit 31.08.2026).
- [ ] Prüfen, ob die Android-App ohne die Berechtigung `INTERNET` läuft (würde „sendet nichts“ technisch absichern).

## 5. Apple App Store (später, iOS-Projekt fehlt)

- [ ] Support-URL (Impressum geht), Datenschutz-URL, Copyright-Feld.
- [ ] App-Datenschutzangaben, Privacy-Manifest für die Plugins.
- [ ] Händlerstatus nach DSA (auch für Nicht-Händler Pflichtangabe), Altersfreigabe (Stufen 4+ bis 18+).
- [ ] Hintergrundmodi `audio` und `location` begründen.

## 6. Bei Kleingewerbe zusätzlich

- [ ] Impressum nach § 5 DDG (Überschrift ändern, ggf. USt-IdNr. oder Hinweis § 19 UStG).
- [ ] Händlerstatus in beiden Stores auf „Händler“.
- [ ] Haftung: neue Produkthaftungsrichtlinie (Software ist Produkt) gilt dann voll.
- [ ] Erst bei Verkauf oder Abo: Preisangaben, Widerruf, Kündigungsbutton, Verbraucherschlichtung (§ 36 VSBG), Barrierefreiheit (BFSG) neu prüfen.

## 7. Anwalt fragen

1. Impressum: reicht § 18 MStV, solange privat?
2. Haftungstext.
3. Marke „BLOC“ und die iOS-App „Bloc“.
4. KI-Übungsbilder: Nutzungsbedingungen, mögliche Rechte Dritter an Vorlagen.
5. Händlerstatus bei Hobby mit späterem Gewerbe.
6. Plan-Assistent mit Einschränkungen: noch Fitness oder schon Medizinprodukt? (In App und Store die Wörter Therapie, Reha, Diagnose, Schmerzlinderung meiden.)

## 8. Entwurf Store-Beschreibung (Schutztexte)

**DE:** BLOC ist ein kostenloser Trainings-Timer mit Übungsbibliothek, Plan-Assistent, Lauf-Aufzeichnung (GPS) und Protein-Übersicht. Alles bleibt auf deinem Gerät: keine Konten, keine Werbung, kein Tracking. Kalorien, Protein und Belastung sind grobe Orientierung, keine medizinische oder Ernährungsberatung. BLOC ersetzt keinen Arzt, keine Physiotherapie und keinen Trainer. Bei Vorerkrankungen, Verletzungen, Schwangerschaft oder Beschwerden vorher ärztlich abklären. Training auf eigene Verantwortung. Impressum und Datenschutz: [URL]. Kontakt: [E-Mail].

**EN:** BLOC is a free workout timer with exercise library, plan assistant, GPS run tracking and protein overview. Everything stays on your device: no accounts, no ads, no tracking. Calories, protein and load are rough guidance, not medical or nutrition advice. BLOC does not replace a doctor, physiotherapist or coach. If you have a medical condition, an injury, are pregnant or have symptoms, check with a doctor first. Train at your own risk. Legal notice and privacy: [URL]. Contact: [email].
