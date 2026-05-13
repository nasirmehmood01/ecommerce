const express = require("express");
const CartController = require("./CartController");
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, CartController.getCart);
router.post("/items", authenticate, CartController.addItem);
router.patch("/items/:id", authenticate, CartController.updateItem);
router.delete("/items/:id", authenticate, CartController.removeItem);

module.exports = router;