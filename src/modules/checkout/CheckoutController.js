const pool = require("../../config/db");

class CheckoutController {
  static async checkout(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [cart] = await connection.query(
        `
        SELECT 
          ci.id,
          ci.product_id,
          ci.quantity,
          p.name,
          p.price,
          p.stock
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = ?
        FOR UPDATE
        `,
        [req.user.id]
      );

      if (cart.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: "Cart is empty" });
      }

      let total = 0;

      for (const item of cart) {
        if (item.stock < item.quantity) {
          await connection.rollback();
          return res.status(400).json({
            message: `Product ${item.product_id} is out of stock`,
          });
        }

        total += Number(item.price) * item.quantity;
      }

      const [orderResult] = await connection.query(
        "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)",
        [req.user.id, total, "PENDING"]
      );

      const orderId = orderResult.insertId;

      for (const item of cart) {
        await connection.query(
          `
          INSERT INTO order_items 
          (order_id, product_id, name, price, quantity)
          VALUES (?, ?, ?, ?, ?)
          `,
          [orderId, item.product_id, item.name, item.price, item.quantity]
        );

        await connection.query(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }

      await connection.query(
        "DELETE FROM cart_items WHERE user_id = ?",
        [req.user.id]
      );

      await connection.commit();

      res.status(201).json({
        message: "Order created successfully",
        order: {
          id: orderId,
          userId: req.user.id,
          items: cart,
          total,
          status: "PENDING",
        },
      });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ message: error.message });
    } finally {
      connection.release();
    }
  }
}

module.exports = CheckoutController;