const express = require("express");
const path = require("path");

const authRoutes = require("./src/routes/auth");
const productRoutes = require("./src/routes/products");
const orderRoutes = require("./src/routes/orders");
const customerRoutes = require("./src/routes/customers");
const paymentRoutes = require("./src/routes/payments");
const webhookRoutes = require("./src/routes/webhooks");
const testRoutes = require("./src/routes/test");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/test", testRoutes);

const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");

app.use(express.static(FRONTEND_DIST));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Express + Frontend running");
});
