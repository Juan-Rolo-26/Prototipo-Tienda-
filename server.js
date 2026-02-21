// Hostinger-safe bootstrap wrapper.
// If src/server.js crashes during require, we still bind PORT and expose the error.

const express = require("express");

function startFallback(error) {
  const app = express();
  const port = process.env.PORT || 3000;

  app.get("/api/health", (_req, res) => {
    res.status(500).json({
      ok: false,
      bootstrap: "fallback",
      error: error?.message || String(error),
      stack: error?.stack || null,
    });
  });

  app.get("*", (_req, res) => {
    res.status(500).send("App bootstrap failed. Check /api/health for details.");
  });

  app.listen(port, () => {
    console.error("Fallback server running on port", port);
    console.error(error);
  });
}

try {
  require("./src/server");
} catch (error) {
  startFallback(error);
}

