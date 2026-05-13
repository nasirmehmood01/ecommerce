const express = require("express");
const OrderController = require("./OrderController");
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, OrderController.getOrders);
router.get("/:id", authenticate, OrderController.getOrderById);

module.exports = router;