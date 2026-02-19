const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireCustomer } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/me", requireCustomer, async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.customer.id },
    include: { savedPaymentMethods: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } },
  });
  res.json({ customer });
});

router.put("/me", requireCustomer, async (req, res) => {
  const { firstName, lastName, province, city, address1, address2, postalCode, phone } = req.body || {};
  const customer = await prisma.customer.update({
    where: { id: req.customer.id },
    data: {
      firstName: firstName || null,
      lastName: lastName || null,
      province: province || null,
      city: city || null,
      address1: address1 || null,
      address2: address2 || null,
      postalCode: postalCode || null,
      phone: phone || null,
    },
  });
  res.json({ customer });
});

router.delete("/payment-methods/:id", requireCustomer, async (req, res) => {
  const { id } = req.params;
  const method = await prisma.savedPaymentMethod.findUnique({ where: { id } });
  if (!method || method.customerId !== req.customer.id) {
    return res.status(404).json({ error: "Payment method not found" });
  }
  await prisma.savedPaymentMethod.delete({ where: { id } });
  return res.json({ ok: true });
});

module.exports = router;
