const express = require("express");
const UserController = require("./UserController");
const authenticate = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authenticate, UserController.getMe);

module.exports = router;