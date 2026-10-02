const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const demo = require("./backend/demo.cjs");
if (process.argv.includes("--backend")) process.env.DEMO_BACKEND = "server";
const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};
const server = http
  .createServer(async (req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      res.writeHead(400).end("Invalid URL");
      return;
    }
    if (pathname.startsWith("/api/")) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      try {
        let body = {};
        if (req.method === "POST") {
          if (
            !/^application\/json(?:;|$)/i.test(
              req.headers["content-type"] || "",
            )
          ) {
            res
              .writeHead(415)
              .end(
                JSON.stringify({ error: "Use an application/json request." }),
              );
            return;
          }
          const chunks = [];
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 16384) {
              res
                .writeHead(413)
                .end(
                  JSON.stringify({ error: "The sample request is too large." }),
                );
              return;
            }
            chunks.push(chunk);
          }
          try {
            body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          } catch {
            res
              .writeHead(400)
              .end(JSON.stringify({ error: "Invalid JSON request." }));
            return;
          }
          if (!body || typeof body !== "object" || Array.isArray(body)) {
            res
              .writeHead(400)
              .end(JSON.stringify({ error: "JSON object required." }));
            return;
          }
        }
        res.end(JSON.stringify(demo.handle(req, res, pathname, body)));
      } catch (error) {
        res.writeHead(error.status || 500).end(
          JSON.stringify({
            error: error.status
              ? error.message
              : "The demo server could not complete the request. Try again.",
          }),
        );
      }
      return;
    }
    if (pathname === "/js/runtime-config.js") {
      res.writeHead(200, {
        "Content-Type": types[".js"],
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(
        `window.SCHOOL_BACKEND=${process.env.DEMO_BACKEND === "server"};`,
      );
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405).end("Method not allowed");
      return;
    }
    const target = path.resolve(
      root,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    if (
      !target.startsWith(root + path.sep) ||
      !Object.hasOwn(types, path.extname(target)) ||
      !(
        /^[a-z-]+\.html$/.test(pathname.slice(1)) ||
        pathname === "/" ||
        /^\/(js|css)\/[a-z-]+\.(js|css)$/.test(pathname) ||
        /^\/assets\/[a-z0-9-]+\.(webp|jpg|jpeg|png|svg|woff2|ttf)$/.test(
          pathname,
        ) ||
        ["/robots.txt", "/sitemap.xml"].includes(pathname)
      )
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
  .listen(process.env.PORT || 8000, process.env.HOST || "0.0.0.0", () =>
    console.log("School demo: http://localhost:" + server.address().port),
  );
