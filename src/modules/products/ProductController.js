const pool = require("../../config/db");
const redisClient = require("../../config/redis");

class ProductController {
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
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ProductController;