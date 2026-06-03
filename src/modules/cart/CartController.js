const { carts, products } = require("../../data/database");

class CartController {
  static getCart(req, res) {
    res.json(carts[req.user.id] || []);
  }

  static addItem(req, res) {
    const { productId, quantity } = req.body;

    const product = products.find((product) => product.id === productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    const cartItem = {
      id: `cart_${Date.now()}`,
      productId,
      name: product.name,
      price: product.price,
      quantity
    };

    if (!carts[req.user.id]) {
      carts[req.user.id] = [];
    }

    carts[req.user.id].push(cartItem);

    res.status(201).json({
      message: "Item added to cart",
      item: cartItem
    });
  }

  static updateItem(req, res) {
    const { quantity } = req.body;
    const cart = carts[req.user.id] || [];

    const item = cart.find((item) => item.id === req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = quantity;

    res.json({
      message: "Cart item updated",
      item
    });
  }

  static removeItem(req, res) {
    carts[req.user.id] = (carts[req.user.id] || []).filter(
      (item) => item.id !== req.params.id
    );

    res.json({ message: "Cart item removed" });
  }
}

module.exports = CartController;