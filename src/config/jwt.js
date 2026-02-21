const crypto = require("crypto");

function resolveJwtSecret() {
  if (process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim()) {
    return String(process.env.JWT_SECRET).trim();
  }

  const base =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.ADMIN_GOOGLE_EMAILS ||
    "traviesa-fallback-secret";

  const derived = crypto.createHash("sha256").update(String(base)).digest("hex");
  const fallback = `fallback-${derived}`;

  console.warn("[auth] JWT_SECRET missing. Using deterministic fallback secret.");
  return fallback;
}

const JWT_SECRET = resolveJwtSecret();

module.exports = { JWT_SECRET };

