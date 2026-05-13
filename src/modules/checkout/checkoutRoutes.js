const express = require("express");
const CheckoutController = require("./CheckoutController");
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, CheckoutController.checkout);

module.exports = router;