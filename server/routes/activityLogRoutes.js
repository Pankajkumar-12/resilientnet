const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    getActivityLogs
} = require("../controllers/activityLogController");

router.get("/", authenticate, getActivityLogs);

module.exports = router;