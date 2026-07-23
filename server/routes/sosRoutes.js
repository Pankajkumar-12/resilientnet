const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    createSOS,
    getAllSOS,
    getDashboardStats
} = require("../controllers/sosController");

router.get("/", authenticate, getAllSOS);

router.get("/stats", authenticate, getDashboardStats);

router.post("/", authenticate, createSOS);

module.exports = router;