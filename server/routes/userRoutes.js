const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    getAllUsers,
    updateUser,
    updateUserStatus
} = require("../controllers/userController");

// Get all users
router.get("/", authenticate, getAllUsers);

// Update user details
router.put("/:id", authenticate, updateUser);

// Activate / deactivate user
router.patch("/:id/status", authenticate, updateUserStatus);

module.exports = router;