const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const { requireCustomer } = require("../middleware/auth");
const { JWT_SECRET } = require("../config/jwt");
const { ensureAdmins } = require("../utils/ensureAdmins");

const router = express.Router();
const prisma = new PrismaClient();
const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const forgotPasswordRate = new Map();

const DEFAULT_ADMIN_USER = {
  email: "eccomfyarg@gmail.com",
  username: "FranYRolo",
  password: "belgrano23",
};

let authTableReadyPromise = null;

function trimString(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return trimString(value).toLowerCase();
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function createSixDigitCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function parseAdminUsers() {
  const raw = trimString(process.env.ADMIN_USERS);
  const fromEnv = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [username, password] = entry.split(":");
      return {
        username: trimString(username),
        password: trimString(password),
      };
    })
    .filter((entry) => entry.username && entry.password);

  const dedup = new Map();
  dedup.set(DEFAULT_ADMIN_USER.username.toLowerCase(), {
    username: DEFAULT_ADMIN_USER.username,
    password: DEFAULT_ADMIN_USER.password,
  });

  for (const item of fromEnv) {
    dedup.set(item.username.toLowerCase(), item);
  }

  return Array.from(dedup.values());
}

function signCustomerToken(customer, username) {
  return jwt.sign(
    {
      sub: customer.id,
      id: customer.id,
      role: "customer",
      username,
      email: customer.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function signAdminToken(username) {
  return jwt.sign(
    {
      role: "admin",
      username,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function smtpConfigFromEnv() {
  const host = trimString(process.env.SMTP_HOST);
  const portRaw = trimString(process.env.SMTP_PORT);
  const user = trimString(process.env.SMTP_USER);
  const pass = trimString(process.env.SMTP_PASS);
  const from = trimString(process.env.SMTP_FROM) || user;

  const port = Number(portRaw);
  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    from,
  };
}

function isForgotRateLimited(ip, email) {
  const key = `${ip || "unknown"}:${email}`;
  const now = Date.now();
  const last = forgotPasswordRate.get(key);
  if (last && now - last < 60 * 1000) {
    return true;
  }
  forgotPasswordRate.set(key, now);
  return false;
}

async function ensureAuthTable() {
  if (!authTableReadyPromise) {
    authTableReadyPromise = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS auth_credentials (
          id TEXT PRIMARY KEY,
          customer_id TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'customer',
          reset_code_hash TEXT,
          reset_code_expires_at INTEGER,
          reset_code_used INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);
    })().catch((error) => {
      authTableReadyPromise = null;
      throw error;
    });
  }

  return authTableReadyPromise;
}

async function findCredentialByUsername(username) {
  await ensureAuthTable();
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT *
      FROM auth_credentials
      WHERE lower(username) = lower(?)
      LIMIT 1
    `,
    username
  );
  return rows[0] || null;
}

async function findCredentialByEmail(email) {
  await ensureAuthTable();
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT *
      FROM auth_credentials
      WHERE lower(email) = lower(?)
      LIMIT 1
    `,
    email
  );
  return rows[0] || null;
}

async function ensureDefaultAdminAuthUser() {
  await ensureAuthTable();

  let customer = await prisma.customer.findUnique({
    where: { email: DEFAULT_ADMIN_USER.email },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        email: DEFAULT_ADMIN_USER.email,
        firstName: DEFAULT_ADMIN_USER.username,
      },
    });
  }

  const existing = await findCredentialByUsername(DEFAULT_ADMIN_USER.username);
  if (!existing) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_USER.password, 10);
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO auth_credentials (
          id,
          customer_id,
          email,
          username,
          password_hash,
          role,
          reset_code_hash,
          reset_code_expires_at,
          reset_code_used
        )
        VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 0)
      `,
      crypto.randomUUID(),
      customer.id,
      DEFAULT_ADMIN_USER.email,
      DEFAULT_ADMIN_USER.username,
      passwordHash,
      "admin"
    );
  }
}

async function initAuth() {
  try {
    await ensureAuthTable();
    await ensureAdmins();
    await ensureDefaultAdminAuthUser();
  } catch (error) {
    console.error("[auth] init warning:", error.message);
  }
}

initAuth();

router.post("/register", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const username = trimString(req.body?.username);
    const password = String(req.body?.password || "");

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email invalido" });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "Nombre de usuario invalido" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "La contrasena debe tener minimo 8 caracteres" });
    }

    await ensureAuthTable();

    const existingByEmail = await findCredentialByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({ error: "El email ya existe" });
    }

    const existingByUsername = await findCredentialByUsername(username);
    if (existingByUsername) {
      return res.status(409).json({ error: "El nombre de usuario ya existe" });
    }

    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      return res.status(409).json({ error: "El email ya existe" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        email,
        firstName: username,
      },
    });

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO auth_credentials (
          id,
          customer_id,
          email,
          username,
          password_hash,
          role,
          reset_code_hash,
          reset_code_expires_at,
          reset_code_used
        )
        VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 0)
      `,
      crypto.randomUUID(),
      customer.id,
      email,
      username,
      passwordHash,
      "customer"
    );

    const token = signCustomerToken(customer, username);

    return res.status(201).json({
      token,
      user: {
        id: customer.id,
        email: customer.email,
        username,
        role: "customer",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "No se pudo registrar el usuario" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const username = trimString(req.body?.username);
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const credential = await findCredentialByUsername(username);
    if (!credential || credential.role !== "customer") {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const ok = await bcrypt.compare(password, credential.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const customer = await prisma.customer.findUnique({ where: { id: credential.customer_id } });
    if (!customer) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const token = signCustomerToken(customer, credential.username);
    return res.json({
      token,
      user: {
        id: customer.id,
        email: customer.email,
        username: credential.username,
        role: "customer",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "No se pudo iniciar sesion" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email invalido" });
    }

    const credential = await findCredentialByEmail(email);
    if (!credential || credential.role !== "customer") {
      return res.status(404).json({ error: "El email no existe" });
    }

    if (isForgotRateLimited(req.ip, email)) {
      return res.status(429).json({ error: "Espera un minuto antes de volver a intentar" });
    }

    const smtp = smtpConfigFromEnv();
    if (!smtp) {
      return res.status(503).json({ error: "Email service not configured" });
    }

    const code = createSixDigitCode();
    const codeHash = hashCode(code);
    const expiresAt = Date.now() + RESET_CODE_TTL_MS;

    await prisma.$executeRawUnsafe(
      `
        UPDATE auth_credentials
        SET reset_code_hash = ?,
            reset_code_expires_at = ?,
            reset_code_used = 0
        WHERE id = ?
      `,
      codeHash,
      expiresAt,
      credential.id
    );

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    });

    await transporter.sendMail({
      from: smtp.from,
      to: email,
      subject: "Codigo de recuperacion",
      text: `Tu codigo de recuperacion es: ${code}. Vence en 10 minutos.`,
    });

    return res.json({ ok: true, message: "Codigo enviado" });
  } catch (error) {
    return res.status(500).json({ error: "No se pudo enviar el codigo" });
  }
});

router.post("/reset-password/verify", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = trimString(req.body?.code);

    if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Datos invalidos" });
    }

    const credential = await findCredentialByEmail(email);
    if (!credential || credential.role !== "customer") {
      return res.status(400).json({ error: "Codigo invalido o vencido" });
    }

    const expired = !credential.reset_code_expires_at || Number(credential.reset_code_expires_at) < Date.now();
    const used = Number(credential.reset_code_used) === 1;
    const expectedHash = credential.reset_code_hash;

    if (!expectedHash || used || expired || hashCode(code) !== expectedHash) {
      return res.status(400).json({ error: "Codigo invalido o vencido" });
    }

    await prisma.$executeRawUnsafe(
      `
        UPDATE auth_credentials
        SET reset_code_used = 1,
            reset_code_hash = NULL,
            reset_code_expires_at = NULL
        WHERE id = ?
      `,
      credential.id
    );

    const customer = await prisma.customer.findUnique({ where: { id: credential.customer_id } });
    if (!customer) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const token = signCustomerToken(customer, credential.username);
    return res.json({
      ok: true,
      message: "Inicio de sesion exitoso",
      token,
      user: {
        id: customer.id,
        email: customer.email,
        username: credential.username,
        role: "customer",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "No se pudo verificar el codigo" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = trimString(req.body?.code);
    const newPassword = String(req.body?.newPassword || "");

    if (!isValidEmail(email) || !/^\d{6}$/.test(code) || newPassword.length < 8) {
      return res.status(400).json({ error: "Datos invalidos" });
    }

    const credential = await findCredentialByEmail(email);
    if (!credential || credential.role !== "customer") {
      return res.status(400).json({ error: "Codigo invalido o vencido" });
    }

    const expired = !credential.reset_code_expires_at || Number(credential.reset_code_expires_at) < Date.now();
    const used = Number(credential.reset_code_used) === 1;
    const expectedHash = credential.reset_code_hash;

    if (!expectedHash || used || expired || hashCode(code) !== expectedHash) {
      return res.status(400).json({ error: "Codigo invalido o vencido" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$executeRawUnsafe(
      `
        UPDATE auth_credentials
        SET password_hash = ?,
            reset_code_used = 1,
            reset_code_hash = NULL,
            reset_code_expires_at = NULL
        WHERE id = ?
      `,
      passwordHash,
      credential.id
    );

    const customer = await prisma.customer.findUnique({ where: { id: credential.customer_id } });
    if (!customer) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const token = signCustomerToken(customer, credential.username);
    return res.json({
      ok: true,
      message: "Inicio de sesion exitoso",
      token,
      user: {
        id: customer.id,
        email: customer.email,
        username: credential.username,
        role: "customer",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "No se pudo restablecer la contrasena" });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const username = trimString(req.body?.username);
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const adminFromEnv = parseAdminUsers().find(
      (entry) => entry.username.toLowerCase() === username.toLowerCase()
    );

    if (adminFromEnv && adminFromEnv.password === password) {
      const token = signAdminToken(adminFromEnv.username);
      return res.json({
        token,
        user: { username: adminFromEnv.username, role: "admin" },
      });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (admin) {
      const ok = await bcrypt.compare(password, admin.passwordHash);
      if (ok) {
        const token = signAdminToken(admin.username);
        return res.json({
          token,
          user: { username: admin.username, role: "admin" },
        });
      }
    }

    return res.status(401).json({ error: "Credenciales invalidas" });
  } catch (error) {
    return res.status(500).json({ error: "No se pudo iniciar sesion de admin" });
  }
});

router.get("/admin-status", requireCustomer, (req, res) => {
  const username = trimString(req.customer?.username).toLowerCase();
  const adminSet = new Set(parseAdminUsers().map((item) => item.username.toLowerCase()));
  return res.json({ isAdmin: adminSet.has(username) });
});

router.get("/me", requireCustomer, async (req, res) => {
  const customerId = req.customer?.sub || req.customer?.id;
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  await ensureAuthTable();
  const credential = await prisma.$queryRawUnsafe(
    `
      SELECT username
      FROM auth_credentials
      WHERE customer_id = ?
      LIMIT 1
    `,
    customerId
  );

  return res.json({
    customer: {
      ...customer,
      username: credential[0]?.username || req.customer?.username || null,
    },
  });
});

module.exports = router;
