const express = require("express");
const cors = require("cors");
const testRoutes = require("./routes/test");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/test", testRoutes);

const path = require("path");

const FRONTEND_DIST = path.join(__dirname, "..", "frontend", "dist");

app.use(express.static(FRONTEND_DIST));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

module.exports = app;
