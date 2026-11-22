# Datenschutz: Prüfliste für die Fachperson

Stand: 2026-11-22, Fassung 2026-11-22-6. Diese Liste ist eine Arbeitshilfe und keine Rechtsberatung. Sie entscheidet keine Rechtsfrage. Weder diese Liste noch `privacy.html` wurden rechtlich geprüft.

## 1. Verantwortliche Person und Impressum

**Im Code belegt**
- `privacy.html` nennt derzeit keine verantwortliche Person und keine Kontaktadresse.
- Die Web-App ist über GitHub Pages öffentlich erreichbar. Es gibt keine Werbung, keine Konten und keine Bezahlfunktion.
- Ein Textbaustein liegt in `docs/ANBIETERANGABEN-ENTWURF.md`.

**Offene Frage**
- Wer ist verantwortlich im Sinne der DSGVO, wenn der Anbieter die Eingaben nicht erhält?
- Besteht eine Impressumspflicht, und welche Angaben sind nötig?

**Benötigte Entscheidung**
- Name, ladungsfähige Anschrift und Kontakt-E-Mail festlegen und in DE und EN eintragen.

## 2. Einschränkungen und Körperdaten als mögliche Gesundheitsdaten (Art. 9 DSGVO)

**Im Code belegt**
- Der Plan-Assistent speichert Einschränkungen (Knie, Schulter, Rücken, Handgelenk, Sprunggelenk), Altersgruppe, Ziele, Aktivität und anderen Sport im ersten Training des Plans (`p.assi`).
- Körperdaten liegen in `settings.koerper`. Sätze, Anstrengung und Läufe liegen ebenfalls lokal.
- Die Daten liegen in `localStorage` und im IndexedDB-Schnappschuss. Sicherungsdateien enthalten sie unverschlüsselt.
- Es gibt keine Übertragung an den Anbieter.

**Offene Frage**
- Sind diese Angaben trotz rein lokaler Speicherung Gesundheitsdaten im Sinne von Art. 9 DSGVO?
- Greift die Ausnahme für persönliche oder familiäre Tätigkeiten für die Nutzenden, und was folgt daraus für den Anbieter?
- Ist vor der Abfrage der Einschränkungen eine Einwilligung oder ein zusätzlicher Hinweis nötig?

**Benötigte Entscheidung**
- Bleibt die Abfrage wie sie ist, kommt ein Hinweis davor, oder wird sie geändert?

## 3. Auslieferung über GitHub Pages und mögliche Drittlandübermittlung

**Im Code belegt**
- Die Web-App wird von GitHub Pages geladen. Dabei fallen Verbindungsdaten wie die IP-Adresse an.
- Die App lädt keine fremden Schriften oder Skripte. Die Content-Security-Policy beschränkt die Quellen.
- Die Android-App enthält alle Dateien im Paket.

**Offene Frage**
- Welche Rechtsgrundlage gilt für die Verarbeitung durch GitHub?
- Liegt eine Drittlandübermittlung vor, und worauf stützt sie sich?
- Ist ein Vertrag zur Auftragsverarbeitung mit GitHub nötig oder möglich?

**Benötigte Entscheidung**
- GitHub Pages beibehalten oder zu einem Hoster in der EU wechseln.

## 4. Standortdienste unter Android

**Im Code belegt**
- Berechtigungen aus dem Standort-Plugin: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `FOREGROUND_SERVICE_LOCATION`. `ACCESS_BACKGROUND_LOCATION` ist nicht eingetragen.
- Die Ortung läuft nur während eines gestarteten Laufs als Vordergrunddienst mit Benachrichtigung.
- Routen werden lokal als Koordinaten gespeichert und stehen in Sicherungs- und GPX-Dateien.
- Die Positionsbestimmung übernehmen laut `privacy.html` die Standortdienste des Geräts (Google Play-Dienste). Das hängt vom Plugin und vom Gerät ab und wurde nicht am Gerät gemessen.

**Offene Frage**
- Reicht der Hinweis auf die Google Play-Dienste aus?
- Sind Routen wegen möglicher Rückschlüsse (Wohnort, Gewohnheiten) besonders zu behandeln?

**Benötigte Entscheidung**
- Formulierung zu den Standortdiensten bestätigen oder ändern.

## 5. Wirksamkeit des Haftungsausschlusses

**Im Code belegt**
- `privacy.html` enthält einen Haftungsausschluss in DE und EN mit Vorbehalt für Vorsatz und grobe Fahrlässigkeit.
- Die App gibt Trainings- und Steigerungsvorschläge und schätzt Kalorien. Sie weist darauf hin, keine medizinische Beratung zu sein.

**Offene Frage**
- Ist der Ausschluss in dieser Form wirksam, auch bei Schäden an Leben, Körper und Gesundheit?
- Sind die Vorschläge des Plan-Assistenten rechtlich anders zu bewerten als reine Informationen, etwa als Medizinprodukt?

**Benötigte Entscheidung**
- Text beibehalten, anpassen oder ersetzen.

## 6. Angaben für den Play Store (falls eine Veröffentlichung geplant ist)

**Im Code belegt**
- Manifest und Plugins: Internet, Vibration, Benachrichtigungen, Vordergrunddienste (`mediaPlayback`, Standort), Wake Lock, genauer und ungefährer Standort.
- Alarm- und Neustart-Berechtigungen sind entfernt. `android:allowBackup` ist `false`.
- Die App überträgt keine Eingaben an den Anbieter. Teilen geschieht nur durch die nutzende Person.

**Offene Frage**
- Wie sind das Formular „Datensicherheit“ und die Begründungen für Vordergrunddienste und Standort auszufüllen?
- Gilt die App bei Google Play als Gesundheits-App, und welche Pflichten folgen daraus?
- Muss die `INTERNET`-Berechtigung bleiben? Sie wurde bisher nicht ohne Gerätetest entfernt.

**Benötigte Entscheidung**
- Ob und wann eine Veröffentlichung geplant ist, und unter welcher öffentlichen Adresse die Datenschutzerklärung steht.
