const express = require("express");
const ProductController = require("./ProductController");

const router = express.Router();

router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.post("/", ProductController.createProduct);

module.exports = router;