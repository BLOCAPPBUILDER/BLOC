/* BLOC (Sport Timer) - Offline-Unterstuetzung
 *
 * Strategie: zuerst das Netz (höchstens 2,5 s, wenn eine gespeicherte Fassung da ist), dann der Zwischenspeicher.
 * Online siehst du immer sofort die neueste Fassung,
 * ohne Verbindung startet die zuletzt geladene aus dem Speicher.
 * Die App nutzt nur Systemschriften und laedt nichts von fremden Servern.
 */

/* Einzige Stelle für die Versionsnummer - die App fragt sie per postMessage ab (Einstellungen, ganz unten) */
var FASSUNG = "2026-10-31-5";
var NETZ_WARTEN = 2500;   // ms - so lange wartet der Start höchstens aufs Netz, wenn es eine gespeicherte Fassung gibt
var SPEICHER = "sporttimer-" + FASSUNG;
var GRUNDGERUEST = ["./", "./index.html", "./texte.js", "./quellen.html", "./daten.js", "./fotos.js", "./faq.js", "./js/01-basis.js", "./js/02-bibliothek.js", "./js/03-router.js", "./js/04-start.js", "./js/05-suche.js", "./js/06-timer-listen.js", "./js/07-studio.js", "./js/08-koerperkarte.js", "./js/09-studio-karte.js", "./js/10-gemeinsam.js", "./js/11-bibliothek-seite.js", "./js/11b-katalog.js", "./js/12-uebung-statistik.js", "./js/13-teilen-editor.js", "./js/14-einfuehrung-sicherung.js", "./js/16-lauf.js", "./js/17-aufwaermen-einstellungen.js", "./js/18-audio.js", "./js/19-timer-motor.js", "./js/19a-kalender.js", "./js/20-walzen-start.js", "./js/21-koerper.js", "./js/22-satz-training.js", "./js/23-protein.js", "./img/neu-protein.jpg", "./app.css", "./layout-new.css", "./img/neu-workout.jpg", "./img/neu-mobility.jpg", "./img/neu-timer.jpg", "./img/neu-run.jpg", "./img/neu-builder.webp", "./img/neu-kopf.jpg", "./img/neu-kopf-hell.jpg", "./img/neu-kopf-hell-meer.jpg", "./img/neu-h-halle.jpg", "./img/neu-h-kettlebell.jpg", "./img/neu-h-dehnen.jpg", "./img/neu-d-kalender.jpg", "./img/neu-d-katalog.jpg", "./img/neu-run-bg.jpg", "./img/neu-p-freiluft-meer.jpg", "./img/neu-faq.jpg", "./img/neu-freiluft.jpg", "./img/neu-p-freiluft-meer.jpg", "./img/neu-p-liegestuetz-strand.jpg", "./img/neu-p-liegestuetz-stadt.jpg", "./img/neu-p-studio-hantelreihe.jpg", "./img/neu-p-studio-gewichtsblock.jpg", "./img/neu-p-studio-halle.jpg", "./img/neu-p-frau-latzug.jpg", "./img/neu-p-timer-box.jpg", "./img/neu-p-frau-klimmzug.jpg", "./img/neu-p-frau-kniebeuge.jpg", "./img/neu-p-liegestuetz-feld.jpg", "./img/neu-p-mobility-ausfall.jpg", "./img/neu-p-mobility-sitz.jpg", "./img/neu-p-run-licht.jpg", "./img/neu-p-run-strasse.jpg", "./img/neu-p-run-sw.jpg", "./img/neu-p-freiluft-leiter.jpg", "./manifest.json", "./icon.png", "./icon-180.png", "./privacy.html", "./img/ort-fitnessstudio.jpg", "./img/ort-freiluft.jpg", "./img/start-halle.jpg", "./img/bereich-run.jpg", "./img/bereich-suche.jpg"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(SPEICHER)
      .then(function (c) { return c.addAll(GRUNDGERUEST); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      // alte Fassungen und den frueheren Schriften-Speicher aufraeumen
      return Promise.all(namen.map(function (n) {
        if (n !== SPEICHER) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Anfrage der App nach der Fassung: Antwort über den mitgeschickten Kanal (sonst an den Absender) */
self.addEventListener("message", function (e) {
  if (!e.data || e.data.frage !== "fassung") return;
  var antwort = { fassung: FASSUNG };
  if (e.ports && e.ports[0]) e.ports[0].postMessage(antwort);
  else if (e.source) e.source.postMessage(antwort);
});

self.addEventListener("fetch", function (e) {
  var anfrage = e.request;
  if (anfrage.method !== "GET") return;

  var ziel;
  try { ziel = new URL(anfrage.url); } catch (err) { return; }
  if (ziel.origin !== self.location.origin) return;

  // "no-cache": immer beim Server nachfragen (GitHub Pages erlaubt Browsern sonst 10 Minuten
  // lang die alte Fassung aus dem HTTP-Zwischenspeicher). Unverändertes kommt trotzdem schnell (304).
  var frisch = anfrage.mode === "navigate"
    ? new Request(anfrage.url, { cache: "no-cache", credentials: "same-origin" })
    : new Request(anfrage, { cache: "no-cache" });

  function speichern(antwort) {
    return antwort && antwort.status === 200 && antwort.type === "basic";
  }
  // Netz zuerst - aber höchstens NETZ_WARTEN lang, wenn eine gespeicherte Fassung da ist (Keller-Gym, Funkloch):
  // dann startet die App aus dem Speicher, und die frische Fassung landet im Hintergrund trotzdem im Speicher.
  var ausDemNetz = fetch(frisch).then(function (antwort) {
    if (speichern(antwort)) {
      var kopie = antwort.clone();
      return caches.open(SPEICHER).then(function (c) { return c.put(anfrage, kopie); }).then(function () { return antwort; }, function () { return antwort; });
    }
    return antwort;
  });
  // locker = offline: dann notfalls auch eine andere Fassung (?v=…). Beim bloßen Zeitlimit nur genau diese,
  // damit nie eine alte app.js zu einer neuen index.html kommt
  function ausSpeicher(locker) {
    return caches.match(anfrage, { ignoreSearch: !!locker && anfrage.mode !== "navigate" }).then(function (treffer) {
      if (treffer || anfrage.mode !== "navigate") return treffer || null;
      return caches.match("./index.html").then(function (t) { return t || caches.match("./"); });
    });
  }
  e.respondWith(new Promise(function (fertig) {
    var erledigt = false;
    function nimm(a) { if (!erledigt && a) { erledigt = true; fertig(a); } }
    var uhr = setTimeout(function () { ausSpeicher().then(nimm, function () {}); }, NETZ_WARTEN);
    ausDemNetz.then(function (a) { clearTimeout(uhr); nimm(a); }, function () {
      clearTimeout(uhr);
      ausSpeicher(true).then(function (t) { nimm(t || new Response("", { status: 504, statusText: "offline" })); },
                         function () { nimm(new Response("", { status: 504, statusText: "offline" })); });
    });
  }));
  e.waitUntil(ausDemNetz.catch(function () {}));   // Hintergrund-Aktualisierung zu Ende bringen
});
