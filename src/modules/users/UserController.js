const pool = require("../../config/database");

class UserController {
  static async getMe(req, res) {
    try {
      const [users] = await pool.query(
        "SELECT id, name, email FROM users WHERE id = ?",
        [req.user.id]
      );

      const user = users[0];

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = UserController;