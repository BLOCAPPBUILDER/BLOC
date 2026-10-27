/* Baut den Ordner www/ für die Android-App: nur die Dateien, die die App zum Laufen braucht (keine Tests, Dokumentation, Service Worker).
   Die Web-Version bekommt den Capacitor-Kern nicht; hier wird er als capacitor.js danebengelegt und vor js/00-native.js eingebunden,
   denn ohne ihn gibt es Capacitor.registerPlugin() nicht (das Plugin-Anbinden braucht es).
   Aufruf: npm run www (npm run sync macht danach den Abgleich mit dem Android-Projekt). */
import { cpSync, rmSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const ziel = "www";
const dateien = ["index.html", "app.css", "layout-new.css", "texte.js", "daten.js", "faq.js", "manifest.json", "icon.png", "icon-180.png", "icon.svg", "privacy.html", "quellen.html"];
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
writeFileSync(`${ziel}/index.html`, html.replace(marke, '<script src="./capacitor.js"></script>\n' + marke));
console.log("www/ gebaut");
