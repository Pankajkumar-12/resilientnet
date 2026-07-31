const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    getDashboardAnalytics
} = require("../controllers/analyticsController");

router.get(
    "/dashboard",
    authenticate,
    getDashboardAnalytics
);

module.exports = router;