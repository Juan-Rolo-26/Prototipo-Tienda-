const express = require("express");
const { optionalCustomer } = require("../middleware/auth");
const { createPendingOrder } = require("../services/orderService");
const { formatCentsToNumber } = require("../utils/pricing");

const router = express.Router();

function serializeOrder(order) {
  return {
    ...order,
    totalAmount: formatCentsToNumber(order.totalAmount),
    items: (order.items || []).map((item) => ({
      ...item,
      productPrice: formatCentsToNumber(item.productPrice),
    })),
  };
}

router.post("/", optionalCustomer, async (req, res) => {
  try {
    const order = await createPendingOrder({
      customer: req.customer || null,
      customerData: req.body,
      items: req.body?.items,
      saveCustomerData: Boolean(req.body?.saveCustomerData),
    });

    res.status(201).json(serializeOrder(order));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/checkout", (req, res) => {
  res.status(410).json({
    error: "Checkout directo deshabilitado. Usa /api/payments/init con Mercado Pago Brick.",
  });
});

module.exports = router;
