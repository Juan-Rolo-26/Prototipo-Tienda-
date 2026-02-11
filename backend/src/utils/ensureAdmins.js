const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function parseAdminList() {
  const raw = process.env.ADMIN_USERS || "mabel:1234,elima:1234";
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [username, password] = entry.split(":");
      return { username, password };
    })
    .filter((entry) => entry.username && entry.password);
}

async function ensureAdmins() {
  const admins = parseAdminList();
  for (const admin of admins) {
    const existing = await prisma.admin.findUnique({ where: { username: admin.username } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(admin.password, 10);
      await prisma.admin.create({
        data: { username: admin.username, passwordHash },
      });
    }
  }
}

module.exports = { ensureAdmins };
