const pool = require("../../config/database");

class OrderController {
  static async getOrders(req, res) {
    try {
      const [orders] = await pool.query(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC",
        [req.user.id]
      );

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getOrderById(req, res) {
    try {
      const [orders] = await pool.query(
        "SELECT * FROM orders WHERE id = ? AND user_id = ?",
        [req.params.id, req.user.id]
      );

      const order = orders[0];

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const [items] = await pool.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order.id]
      );

      res.json({
        ...order,
        items,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = OrderController;