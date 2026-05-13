const pool = require("../../config/database");
const { redisClient } = require("../../config/redis");

const PRODUCTS_CACHE_KEY = "products:all";

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const cachedProducts = await redisClient.get(PRODUCTS_CACHE_KEY);

      if (cachedProducts) {
        console.log("Products served from Redis");
        return res.json(JSON.parse(cachedProducts));
      }

      console.log("Products served from MySQL");

      const [products] = await pool.query(
        "SELECT * FROM products ORDER BY id DESC"
      );

      await redisClient.setEx(
        PRODUCTS_CACHE_KEY,
        Number(process.env.REDIS_TTL || 60),
        JSON.stringify(products)
      );

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const cacheKey = `products:${req.params.id}`;

      const cachedProduct = await redisClient.get(cacheKey);

      if (cachedProduct) {
        console.log("Product served from Redis");
        return res.json(JSON.parse(cachedProduct));
      }

      console.log("Product served from MySQL");

      const [products] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [req.params.id]
      );

      const product = products[0];

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await redisClient.setEx(
        cacheKey,
        Number(process.env.REDIS_TTL || 60),
        JSON.stringify(product)
      );

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

      await redisClient.del(PRODUCTS_CACHE_KEY);

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

// const pool = require("../../config/database");

// class ProductController {
//   static async getAllProducts(req, res) {
//     try {
//       const [products] = await pool.query(
//         "SELECT * FROM products ORDER BY id DESC"
//       );

//       res.json(products);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }

//   static async getProductById(req, res) {
//     try {
//       const [products] = await pool.query(
//         "SELECT * FROM products WHERE id = ?",
//         [req.params.id]
//       );

//       const product = products[0];

//       if (!product) {
//         return res.status(404).json({ message: "Product not found" });
//       }

//       res.json(product);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }

//   static async createProduct(req, res) {
//     try {
//       const { name, price, stock } = req.body;

//       const [result] = await pool.query(
//         "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
//         [name, price, stock]
//       );

//       res.status(201).json({
//         message: "Product created successfully",
//         product: {
//           id: result.insertId,
//           name,
//           price,
//           stock,
//         },
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// }

// module.exports = ProductController;