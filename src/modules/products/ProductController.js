/// <<<<------- Using Redis cache (AWS ElastiCache) ------->>>>
const pool = require("../../config/database");
const { redisClient } = require("../../config/redis");

const PRODUCTS_CACHE_KEY = "products:all";
const REDIS_TTL = Number(process.env.REDIS_TTL || 60);

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const cachedProducts = await redisClient.get(PRODUCTS_CACHE_KEY);

      if (cachedProducts) {
        console.log("Products served from Redis");
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cachedProducts));
      }

      console.log("Products served from MySQL");
      res.setHeader("X-Cache", "MISS");

      const [products] = await pool.query(
        "SELECT * FROM products ORDER BY id DESC"
      );

      await redisClient.setEx(
        PRODUCTS_CACHE_KEY,
        REDIS_TTL,
        JSON.stringify(products)
      );

      return res.json(products);
    } catch (error) {
      console.error("getAllProducts error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const productId = req.params.id;
      const cacheKey = `products:${productId}`;

      const cachedProduct = await redisClient.get(cacheKey);

      if (cachedProduct) {
        console.log(`Product ${productId} served from Redis`);
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cachedProduct));
      }

      console.log(`Product ${productId} served from MySQL`);
      res.setHeader("X-Cache", "MISS");

      const [products] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [productId]
      );

      const product = products[0];

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await redisClient.setEx(
        cacheKey,
        REDIS_TTL,
        JSON.stringify(product)
      );

      return res.json(product);
    } catch (error) {
      console.error("getProductById error:", error.message);
      return res.status(500).json({ message: error.message });
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

      return res.status(201).json({
        message: "Product created successfully",
        product: {
          id: result.insertId,
          name,
          price,
          stock,
        },
      });
    } catch (error) {
      console.error("createProduct error:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ProductController;


/// <<<<------- Using RDS db ------->>>>
// const pool = require("../../data/database");

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