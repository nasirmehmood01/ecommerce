const { orders } = require("../../data/database");

class OrderController {
  static getOrders(req, res) {
    const userOrders = orders.filter((order) => order.userId === req.user.id);
    res.json(userOrders);
  }

  static getOrderById(req, res) {
    const order = orders.find(
      (order) => order.id === req.params.id && order.userId === req.user.id
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  }
}

module.exports = OrderController;