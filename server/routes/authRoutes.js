const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");

const {
    sendOTP,
    verifyOTP,
    register,
    login,
    getOrganizations,
    getMe
} = require("../controllers/authController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", register);
router.post("/login", login);
router.get("/organizations", getOrganizations);
router.get("/me", authenticate, getMe);

module.exports = router;