const express = require("express");
const cors = require("cors");
const testRoutes = require("./routes/test");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EXPRESS MODE OK");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/test", testRoutes);

module.exports = app;
