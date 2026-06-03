const pool = require("../../config/database");

class CartController {
  static async getCart(req, res) {
    try {
      const [items] = await pool.query(
        `
        SELECT 
          ci.id,
          ci.product_id AS productId,
          p.name,
          p.price,
          ci.quantity
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = ?
        `,
        [req.user.id]
      );

      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async addItem(req, res) {
    try {
      const { productId, quantity } = req.body;

      const [products] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [productId]
      );

      const product = products[0];

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (quantity > product.stock) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      const [result] = await pool.query(
        `
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        `,
        [req.user.id, productId, quantity]
      );

      res.status(201).json({
        message: "Item added to cart",
        item: {
          id: result.insertId,
          productId,
          name: product.name,
          price: product.price,
          quantity,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateItem(req, res) {
    try {
      const { quantity } = req.body;

      const [items] = await pool.query(
        `
        SELECT ci.*, p.stock
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.id = ? AND ci.user_id = ?
        `,
        [req.params.id, req.user.id]
      );

      const item = items[0];

      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      if (quantity > item.stock) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      await pool.query(
        "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
        [quantity, req.params.id, req.user.id]
      );

      res.json({
        message: "Cart item updated",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async removeItem(req, res) {
    try {
      await pool.query(
        "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id]
      );

      res.json({ message: "Cart item removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = CartController;