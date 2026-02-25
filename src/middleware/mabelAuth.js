const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

function requireMabel(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing mabel token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.mode !== "mabel") {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.mabel = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid mabel token" });
  }
}

module.exports = { requireMabel };
