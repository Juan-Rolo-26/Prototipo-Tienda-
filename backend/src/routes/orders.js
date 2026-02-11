const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { optionalCustomer } = require("../middleware/auth");
const { formatCentsToNumber } = require("../utils/pricing");

const prisma = new PrismaClient();
const router = express.Router();

const allowedDeliveryMethods = new Set(["PICKUP", "HOME_DELIVERY", "BRANCH_DELIVERY"]);

function normalizeDelivery(method) {
  const normalized = String(method || "").toUpperCase();
  if (!allowedDeliveryMethods.has(normalized)) {
    throw new Error("Invalid delivery method");
  }
  return normalized;
}

router.post("/checkout", optionalCustomer, async (req, res) => {
  const {
    customerName,
    province,
    city,
    address1,
    address2,
    postalCode,
    phone,
    deliveryMethod,
    items,
  } = req.body || {};

  if (!customerName || !province || !city || !address1 || !postalCode || !phone || !deliveryMethod) {
    return res.status(400).json({ error: "Missing customer data" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  try {
    const normalizedDelivery = normalizeDelivery(deliveryMethod);

    const productIds = items.map((item) => item.productId);
    const quantityById = new Map();
    items.forEach((item) => {
      const qty = item.quantity ? Number(item.quantity) : 1;
      quantityById.set(item.productId, qty);
    });

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more products are missing");
      }

      for (const product of products) {
        const requestedQty = quantityById.get(product.id) || 1;
        if (product.stock < requestedQty) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      const orderRecord = await tx.order.create({
        data: {
          customerId: req.customer?.id || null,
          customerName,
          province,
          city,
          address1,
          address2: address2 || null,
          postalCode,
          phone,
          deliveryMethod: normalizedDelivery,
          items: {
            create: products.map((product) => ({
              productId: product.id,
              productName: product.name,
              productPrice: product.price,
              productImage: product.image,
              quantity: quantityById.get(product.id) || 1,
            })),
          },
        },
        include: { items: true },
      });

      if (req.customer?.id) {
        await tx.customer.update({
          where: { id: req.customer.id },
          data: {
            firstName: customerName.split(" ")[0] || null,
            lastName: customerName.split(" ").slice(1).join(" ") || null,
            province,
            city,
            address1,
            address2: address2 || null,
            postalCode,
            phone,
          },
        });
      }

      for (const product of products) {
        const requestedQty = quantityById.get(product.id) || 1;
        const remaining = product.stock - requestedQty;
        if (remaining <= 0) {
          await tx.product.delete({ where: { id: product.id } });
        } else {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: remaining },
          });
        }
      }

      return orderRecord;
    });

    const response = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productPrice: formatCentsToNumber(item.productPrice),
      })),
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
