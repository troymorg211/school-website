const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400).end("Invalid URL");
      return;
    }
    const target = path.resolve(
      root,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    if (
      !target.startsWith(root + path.sep) ||
      ![".html", ".js", ".css", ".xml", ".txt"].includes(path.extname(target))
    ) {
      res.writeHead(404).end("Page not found");
      return;
    }
    fs.readFile(target, (error, body) => {
      if (error) {
        res.writeHead(404).end("Page not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(target)],
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "same-origin",
        "Cache-Control": "no-cache",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      });
      res.end(body);
    });
  })
  .listen(process.env.PORT || 8000, "127.0.0.1", () =>
    console.log("School demo: http://localhost:" + (process.env.PORT || 8000)),
  );
