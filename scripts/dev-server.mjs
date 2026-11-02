import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const root = path.resolve(process.argv[2] || "."), port = Number(process.argv[3] || 8123);
const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".webp":"image/webp" };
http.createServer((q, r) => {
  let p = path.join(root, decodeURIComponent(q.url.split("?")[0])); if(p.endsWith(path.sep)) p += "index.html";
  fs.readFile(p, (e, d) => { if(e){ r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": mime[path.extname(p)] || "application/octet-stream" }); r.end(d); });
}).listen(port);
