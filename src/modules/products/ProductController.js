const { products } = require("../../data/database");

class ProductController {
  static getAllProducts(req, res) {
    res.json(products);
  }

  static getProductById(req, res) {
    const product = products.find((product) => product.id === req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  }

  static createProduct(req, res) {
    const { name, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "Name, price and stock are required"
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than 0"
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative"
      });
    }

    const product = {
      id: `prod_${Date.now()}`,
      name,
      price,
      stock
    };

    products.push(product);

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  }
}

module.exports = ProductController;