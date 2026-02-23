const express = require("express");
const path = require("path");

const app = express();

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/debug-files", (req, res) => {
  const fs = require("fs");
  const path = require("path");

  const base = path.join(__dirname, "frontend");
  const dist = path.join(__dirname, "frontend", "dist");

  const existsBase = fs.existsSync(base);
  const existsDist = fs.existsSync(dist);
  const existsIndex = fs.existsSync(path.join(dist, "index.html"));

  res.json({
    frontend_exists: existsBase,
    dist_exists: existsDist,
    dist_index_exists: existsIndex
  });
});

const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");

app.use(express.static(FRONTEND_DIST));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Express + Frontend running");
});
