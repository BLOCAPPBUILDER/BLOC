# BLOC – offene Punkte der Rechtsprüfung

Stand: 27.11.2026. Arbeitsliste, keine Rechtsberatung. Erinnerung ist für den **11.12.2026** eingestellt (geplante Aufgabe „BLOC: Impressum-Angaben und Rechtsprüfung“).

Aktueller Fall: **privat, kein Kleingewerbe** (Fall A). Wird ein Gewerbe angemeldet, ändern sich Impressum (§ 5 DDG vollständig) und der Händlerstatus in den Stores.

## Vom Betreiber auszufüllen

Die Platzhalter stehen gelb markiert (`class="luecke"`) in:

- `impressum.html` (DE und EN): Vorname Nachname, Straße Hausnummer, PLZ Ort, E-Mail, zweiter Kontaktweg (Telefon oder Kontaktformular), Name in der Urheberzeile.
- `privacy.html` (DE und EN), Kasten „Verantwortlich“ / „Controller“: Name, Anschrift, E-Mail.

Regeln: keine Packstation, kein Postfach; die Anschrift ist danach öffentlich. Finden: `grep -n "luecke" impressum.html privacy.html`.

## Erledigt am 27.11.2026

- [x] `impressum.html` DE/EN mit Platzhaltern, Zeile „Impressum & Lizenzen“ in den Einstellungen.
- [x] `privacy.html`: Kasten „Verantwortlich“, Abschnitt „Deine Eingaben: nur auf deinem Gerät“, GitHub Pages mit Rechtsgrundlage, Empfänger, USA-Übermittlung und Speicherdauer, Google Play, „Deine Rechte“ mit Beschwerderecht, Art. 22.
- [x] Haftung: Leben, Körper, Gesundheit, Produkthaftungsgesetz und arglistig verschwiegene Mängel ausgenommen (DE/EN).
- [x] `lizenzen.html`: alle Bibliotheken der Android-App mit MIT- und Apache-2.0-Text und Cordova-NOTICE.
- [x] Offline-Speicher (`sw.js`) und App-Build (`scripts/www-bauen.mjs`) kennen die neuen Seiten.

## Offen

- [ ] Fall A oder B entscheiden (Kleingewerbe ja/nein); bei B Impressum ergänzen (ggf. Geschäftsbezeichnung, USt-IdNr. oder Hinweis § 19 UStG).
- [ ] Platzhalter in `impressum.html` und `privacy.html` füllen.
- [ ] Marke „BLOC“ in DPMAregister, EUIPO eSearch und TMview prüfen (Klassen 9, 41, 42); notfalls Namenszusatz.
- [ ] Google Play: Händlerstatus bis **01.02.2027** erklären, Formulare „Health Apps“, Datensicherheit, Vordergrunddienste (Standort, Timer), Altersfreigabe.
- [ ] Apple (später): Support-URL (Impressum geht), Datenschutz-URL, App-Datenschutzangaben, Händlerstatus nach DSA; iOS-Projekt fehlt noch.
- [ ] Anwalt fragen: Händlerstatus, Haftungstext, Marke, Plan-Assistent und Medizinprodukt, GitHub/USA.
