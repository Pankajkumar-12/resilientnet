const express = require("express");

const router = express.Router();

const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");

const {
    getActivityLogs
} = require("../controllers/activityLogController");

router.get("/", authenticate, authorizeAdmin, getActivityLogs);

module.exports = router;