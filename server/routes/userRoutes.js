const express = require("express");

const router = express.Router();

const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");

const {
    getAllUsers,
    updateUser,
    updateUserStatus
} = require("../controllers/userController");

// Get all users (Admin only)
router.get("/", authenticate, authorizeAdmin, getAllUsers);

// Update user details (Admin only)
router.put("/:id", authenticate, authorizeAdmin, updateUser);

// Activate / deactivate user (Admin only)
router.patch("/:id/status", authenticate, authorizeAdmin, updateUserStatus);

module.exports = router;