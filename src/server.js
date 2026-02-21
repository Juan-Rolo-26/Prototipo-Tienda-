console.log("🔥🔥🔥 SERVER BOOT VERSION 2026-02-19 🔥🔥🔥");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
console.log("BOOT ENV GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("NODE_ENV:", process.env.NODE_ENV);

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const customerRoutes = require("./routes/customers");
const paymentRoutes = require("./routes/payments");
const webhookRoutes = require("./routes/webhooks");
const { ensureAdmins } = require("./utils/ensureAdmins");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIST = path.join(__dirname, "..", "frontend", "dist");
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const BOOT_LOG_FILE = path.join(__dirname, "..", "boot.log");

function bootLog(message, error) {
  const line = `[${new Date().toISOString()}] ${message}${
    error ? ` | ${error.stack || error.message || String(error)}` : ""
  }\n`;
  try {
    fs.appendFileSync(BOOT_LOG_FILE, line);
  } catch (_err) {
    // Avoid crashing while logging.
  }
}

bootLog("Server file loaded");
bootLog(`NODE_ENV=${process.env.NODE_ENV || "undefined"} PORT=${process.env.PORT || "undefined"}`);
process.on("uncaughtException", (error) => bootLog("uncaughtException", error));
process.on("unhandledRejection", (reason) => bootLog("unhandledRejection", reason));

try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  bootLog(`Uploads directory ready: ${UPLOADS_DIR}`);
} catch (error) {
  console.error("Could not initialize uploads directory:", error);
  bootLog("Could not initialize uploads directory", error);
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

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

async function ensureDatabaseSchema() {
  await prisma.$connect();
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Admin" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "username" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin"("username");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Customer" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "firstName" TEXT,
      "lastName" TEXT,
      "province" TEXT,
      "city" TEXT,
      "address1" TEXT,
      "address2" TEXT,
      "postalCode" TEXT,
      "phone" TEXT,
      "mercadoPagoCustomerId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer"("email");
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Customer_mercadoPagoCustomerId_key" ON "Customer"("mercadoPagoCustomerId");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "price" INTEGER NOT NULL,
      "width" REAL NOT NULL,
      "height" REAL NOT NULL,
      "weight" REAL NOT NULL,
      "stock" INTEGER NOT NULL DEFAULT 1,
      "image" TEXT NOT NULL,
      "description" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProductMedia" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "url" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "position" INTEGER NOT NULL,
      "productId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "customerId" TEXT,
      "customerName" TEXT NOT NULL,
      "province" TEXT NOT NULL,
      "city" TEXT NOT NULL,
      "address1" TEXT NOT NULL,
      "address2" TEXT,
      "postalCode" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "deliveryMethod" TEXT NOT NULL,
      "totalAmount" INTEGER NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "paymentId" TEXT,
      "paymentStatus" TEXT,
      "statusDetail" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "OrderItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "productId" TEXT,
      "productName" TEXT NOT NULL,
      "productPrice" INTEGER NOT NULL,
      "productImage" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SavedPaymentMethod" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "customerId" TEXT NOT NULL,
      "mercadoPagoToken" TEXT,
      "brand" TEXT NOT NULL,
      "last4" TEXT NOT NULL,
      "expirationMonth" INTEGER,
      "expirationYear" INTEGER,
      "cardholderName" TEXT,
      "issuerId" TEXT,
      "paymentMethodId" TEXT,
      "isDefault" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
}

async function bootstrap() {
  bootLog("bootstrap called");
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    bootLog(`Server running on port ${PORT}`);
    try {
      await ensureDatabaseSchema();
      bootLog("ensureDatabaseSchema completed");
      await ensureAdmins();
      bootLog("ensureAdmins completed");
    } catch (error) {
      console.error("Post-start initialization failed", error);
      bootLog("Post-start initialization failed", error);
    }
  });
}

bootstrap();
