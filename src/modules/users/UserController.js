const { users } = require("../../data/database");

class UserController {
  static getMe(req, res) {
    const user = users.find((user) => user.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  }
}

module.exports = UserController;