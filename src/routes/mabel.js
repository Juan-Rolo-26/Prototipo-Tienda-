const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

const router = express.Router();

function trimString(value) {
  return String(value || "").trim();
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""), "utf8");
  const right = Buffer.from(String(b || ""), "utf8");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function resolveMabelPassword() {
  return trimString(process.env.MABEL_PASSWORD);
}

router.post("/unlock", (req, res) => {
  const expected = resolveMabelPassword();
  const provided = trimString(req.body?.password);

  if (!expected) {
    return res.status(503).json({ error: "Mabel password not configured" });
  }

  if (!provided || !safeEqual(provided, expected)) {
    return res.status(401).json({ error: "Contrasena incorrecta" });
  }

  const token = jwt.sign({ mode: "mabel" }, JWT_SECRET, { expiresIn: "30d" });
  return res.json({ token });
});

module.exports = router;
