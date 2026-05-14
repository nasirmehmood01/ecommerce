require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/modules/auth/authRoutes");
const userRoutes = require("./src/modules/users/userRoutes");
const productRoutes = require("./src/modules/products/productRoutes");
const cartRoutes = require("./src/modules/cart/cartRoutes");
const checkoutRoutes = require("./src/modules/checkout/checkoutRoutes");
const orderRoutes = require("./src/modules/orders/orderRoutes");
const { connectRedis } = require("./src/config/redis");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ecommerce-backend",
    timestamp: new Date().toISOString(),
    version: "v9.0.0",
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 3000;
  
connectRedis()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`E-commerce API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });

// app.listen(PORT, () => {
//   console.log(`E-commerce API running on port ${PORT}`);
// });
