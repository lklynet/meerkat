import { createServer } from "node:http";
import { mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const PORT = parseInt(process.env.PORT || "3000", 10);
const DB_PATH = join(__dirname, "data", "notes.db");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

const STATIC_FILES = new Set([
  "/",
  "/index.html",
  "/scripts.js",
  "/css/meerkat.css",
]);

mkdirSync(join(__dirname, "data"), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    content TEXT,
    created_at INTEGER,
    save_state TEXT
  )
`);

function generateNoteId() {
  return [...Array(8)].map(() => Math.random().toString(36)[2]).join("");
}

const DEFAULT_NOTE = `# Hello World
  
This is a sample note:

- Item 1
- Item 2
- Item 3

**Bold**, *Italic*, [Link](https://example.com)

\`\`\`js
console.log("Code block example");
\`\`\`
`;

function setCspHeaders(res) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "font-src 'self' data: https://cdnjs.cloudflare.com",
    "img-src 'self' data:",
    "connect-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);
}

function sendJson(res, status, body) {
  const data = typeof body === "string" ? body : JSON.stringify(body);
  setCspHeaders(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.writeHead(status);
  res.end(data);
}

async function serveStaticFile(res, pathname) {
  const filePath = pathname === "/" || pathname === "/index.html"
    ? join(__dirname, "index.html")
    : join(__dirname, pathname);

  let content;
  try {
    content = await readFile(filePath);
  } catch {
    return false;
  }

  const ext = extname(filePath);
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";
  setCspHeaders(res);

  if (pathname === "/" || pathname === "/index.html") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.writeHead(200);
    res.end(content);
    return true;
  }

  res.setHeader("Content-Type", mimeType);
  res.writeHead(200);
  res.end(content);
  return true;
}

async function handleApiRequest(req, res, pathname) {
  if (pathname === "/" || pathname === "") {
    if (req.method !== "GET") {
      sendJson(res, 405, "Method not allowed");
      return;
    }

    const noteId = generateNoteId();
    const timestamp = Math.floor(Date.now() / 1000);

    db.prepare("INSERT INTO notes (id, content, created_at, save_state) VALUES (?, ?, ?, ?)")
      .run(noteId, DEFAULT_NOTE, timestamp, "split");

    sendJson(res, 200, { noteId });
    return;
  }

  const noteId = pathname.substring(1);

  if (req.method === "GET") {
    const row = db.prepare("SELECT content, save_state FROM notes WHERE id = ?").get(noteId);
    if (row) {
      sendJson(res, 200, { content: row.content, save_state: row.save_state || "split" });
    } else {
      sendJson(res, 404, "Note not found");
    }
  } else if (req.method === "POST") {
    const body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks).toString()));
      req.on("error", reject);
    });
    const params = new URLSearchParams(body);
    const content = params.get("content");
    const saveState = params.get("save_state");

    const exists = db.prepare("SELECT id FROM notes WHERE id = ?").get(noteId);

    if (exists) {
      if (content !== null && saveState !== null)
        db.prepare("UPDATE notes SET content = ?, save_state = ? WHERE id = ?").run(content, saveState, noteId);
      else if (content !== null)
        db.prepare("UPDATE notes SET content = ? WHERE id = ?").run(content, noteId);
      else if (saveState !== null)
        db.prepare("UPDATE notes SET save_state = ? WHERE id = ?").run(saveState, noteId);
    } else {
      const timestamp = Math.floor(Date.now() / 1000);
      db.prepare("INSERT INTO notes (id, content, created_at, save_state) VALUES (?, ?, ?, ?)")
        .run(noteId, content || DEFAULT_NOTE, timestamp, saveState || "split");
    }

    sendJson(res, 200, "Note updated");
  } else if (req.method === "DELETE") {
    db.prepare("DELETE FROM notes WHERE id = ?").run(noteId);
    sendJson(res, 200, "Note deleted");
  } else {
    sendJson(res, 405, "Method not allowed");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (pathname.startsWith("/api/")) {
    const apiPath = pathname.replace("/api", "") || "/";
    await handleApiRequest(req, res, apiPath);
    return;
  }

  if (STATIC_FILES.has(pathname)) {
    const served = await serveStaticFile(res, pathname);
    if (served) return;
  }

  if (pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  await serveStaticFile(res, "/");
});

server.listen(PORT, () => {
  console.log(`meerkat running at http://localhost:${PORT}`);
});

function gracefulShutdown() {
  db.close();
  server.close();
  process.exit(0);
}
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
