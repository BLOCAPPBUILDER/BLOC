/* Baut den Ordner www/ für die Android-App: nur die Dateien, die die App zum Laufen braucht (keine Tests, Dokumentation, Service Worker).
   Aufruf: npm run www (npm run sync macht danach den Abgleich mit dem Android-Projekt). */
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";

const ziel = "www";
const dateien = ["index.html", "app.css", "layout-new.css", "texte.js", "daten.js", "faq.js", "manifest.json", "icon.png", "icon-180.png", "icon.svg", "privacy.html", "quellen.html"];
const ordner = ["js", "img"];

rmSync(ziel, { recursive: true, force: true });
mkdirSync(ziel);
for (const d of dateien) { if (!existsSync(d)) throw new Error("Fehlt: " + d); cpSync(d, `${ziel}/${d}`); }
for (const o of ordner) { if (!existsSync(o)) throw new Error("Fehlt: " + o); cpSync(o, `${ziel}/${o}`, { recursive: true }); }
console.log("www/ gebaut");
