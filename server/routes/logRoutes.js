const express = require("express");

const router = express.Router();

const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");

const {
    getSystemLogs
} = require("../controllers/logController");

router.get("/", authenticate, authorizeAdmin, getSystemLogs);

module.exports = router;