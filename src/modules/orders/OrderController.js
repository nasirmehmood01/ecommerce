const pool = require("../../config/database");
const redisClient = require("../../config/redis");

class ProductController {
  // Get all products
  static async getAllProducts(req, res) {
    try {
      const cacheKey = "products:all";

      const cachedProducts = await redisClient.get(cacheKey);

      if (cachedProducts) {
        return res.json(JSON.parse(cachedProducts));
      }

      const [products] = await pool.query(
        "SELECT * FROM products ORDER BY id DESC"
      );

      await redisClient.setEx(cacheKey, 60, JSON.stringify(products));

      res.json(products);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }

  // Get single product by ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;

      const [products] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );

      if (products.length === 0) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.json(products[0]);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }

  // Create product
  static async createProduct(req, res) {
    try {
      const { name, price, stock } = req.body;

      if (!name || !price || !stock) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      const [result] = await pool.query(
        "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
        [name, price, stock]
      );

      // Clear cache
      await redisClient.del("products:all");

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
      res.status(500).json({
        message: error.message,
      });
    }
  }
}

module.exports = ProductController;