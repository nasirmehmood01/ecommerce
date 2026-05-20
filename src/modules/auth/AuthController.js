const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { users, carts } = require("../../data/database");

class AuthController {
  static async register(req, res) {
    const { name, email, password } = req.body;

    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      password: hashedPassword
    };

    users.push(user);
    carts[user.id] = [];

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;

    const user = users.find((user) => user.email === email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });
  }
}

module.exports = AuthController;