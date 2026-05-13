const { carts, products, orders } = require("../../data/database");

class CheckoutController {
  static checkout(req, res) {
    const cart = carts[req.user.id];

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;

    for (const item of cart) {
      const product = products.find((product) => product.id === item.productId);

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${item.productId} is out of stock`
        });
      }

      total += item.price * item.quantity;
    }

    for (const item of cart) {
      const product = products.find((product) => product.id === item.productId);
      product.stock -= item.quantity;
    }

    const order = {
      id: `order_${Date.now()}`,
      userId: req.user.id,
      items: cart,
      total,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    carts[req.user.id] = [];

    res.status(201).json({
      message: "Order created successfully",
      order
    });
  }
}

module.exports = CheckoutController;