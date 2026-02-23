process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION (root server.js):", err?.stack || err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 UNHANDLED REJECTION (root server.js):", reason?.stack || reason);
  process.exit(1);
});

console.log("✅ Root entry server.js starting...");

try {
  require("./src/server.js");
} catch (err) {
  console.error("🔥 FAILED TO REQUIRE ./src/server.js:", err?.stack || err);
  process.exit(1);
}
