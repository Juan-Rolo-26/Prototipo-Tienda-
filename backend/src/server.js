require("dotenv").config();

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const customerRoutes = require("./routes/customers");
const paymentRoutes = require("./routes/payments");
const webhookRoutes = require("./routes/webhooks");
const { ensureAdmins } = require("./utils/ensureAdmins");

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_DIST = path.join(__dirname, "..", "..", "frontend", "dist");

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get(/^\/(?!api|uploads).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

async function bootstrap() {
  try {
    if (process.env.PRISMA_DB_PUSH_ON_START !== "false") {
      execSync("npx prisma db push", {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
      });
    }

    await ensureAdmins();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed", error);
    process.exit(1);
  }
}

bootstrap();
