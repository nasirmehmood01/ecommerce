const pool = require("../../data/database");

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const [products] = await pool.query(
        "SELECT * FROM products ORDER BY id DESC"
      );

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const [products] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [req.params.id]
      );

      const product = products[0];

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const { name, price, stock } = req.body;

      const [result] = await pool.query(
        "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
        [name, price, stock]
      );

      res.status(201).json({
        message: "Product created successfully",
        product: {
          id: result.insertId,
          name,
          price,
          stock,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ProductController;