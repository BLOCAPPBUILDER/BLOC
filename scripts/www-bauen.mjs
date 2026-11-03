/* Baut den Ordner www/ für die Android-App: nur die Dateien, die die App zum Laufen braucht (keine Tests, Dokumentation, Service Worker).
   Die Web-Version bekommt den Capacitor-Kern nicht; hier wird er als capacitor.js danebengelegt und vor js/00-native.js eingebunden,
   denn ohne ihn gibt es Capacitor.registerPlugin() nicht (das Plugin-Anbinden braucht es).
   Aufruf: npm run www (npm run sync macht danach den Abgleich mit dem Android-Projekt). */
import { cpSync, rmSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const ziel = "www";
const dateien = ["index.html", "app.css", "layout-new.css", "texte.js", "daten.js", "fotos.js", "faq.js", "manifest.json", "icon.png", "icon-180.png", "icon.svg", "privacy.html", "quellen.html"];
const ordner = ["js", "img"];

rmSync(ziel, { recursive: true, force: true });
mkdirSync(ziel);
for (const d of dateien) { if (!existsSync(d)) throw new Error("Fehlt: " + d); cpSync(d, `${ziel}/${d}`); }
for (const o of ordner) { if (!existsSync(o)) throw new Error("Fehlt: " + o); cpSync(o, `${ziel}/${o}`, { recursive: true }); }

const kern = "node_modules/@capacitor/core/dist/capacitor.js";
if (!existsSync(kern)) throw new Error("Capacitor-Kern fehlt (npm install?): " + kern);
cpSync(kern, `${ziel}/capacitor.js`);
const marke = '<script src="./js/00-native.js';
const html = readFileSync(`${ziel}/index.html`, "utf8");
if (!html.includes(marke)) throw new Error("index.html: Platz für capacitor.js nicht gefunden");
/* Content-Security-Policy nur im App-Build: nichts darf nach außen laden oder senden (connect/img/form/frame nur lokal), auch wenn je Code eingeschleust würde.
   script-src braucht 'unsafe-inline', weil Capacitor seine Brücke als Inline-Skript in die Seite legt. */
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'";
/* viewport-fit=cover nur in der Web-Version: In der App liegt der WebView sonst unter der Statusleiste und der Abstand oben käme doppelt
   (Statusleiste + env(safe-area-inset-top)). Mit „auto“ sieht die App oben so aus wie die Web-App. */
const mitKern = html.replace(marke, '<script src="./capacitor.js"></script>\n' + marke).replace("viewport-fit=cover", "viewport-fit=auto")
  .replace(/(<meta name="viewport"[^>]*>)/, (m) => m + '\n<meta http-equiv="Content-Security-Policy" content="' + csp + '">');
if (!mitKern.includes("Content-Security-Policy")) throw new Error("index.html: Platz für die CSP nicht gefunden");
if (mitKern.includes("viewport-fit=cover")) throw new Error("index.html: viewport-fit nicht ersetzt");
writeFileSync(`${ziel}/index.html`, mitKern);
console.log("www/ gebaut");
