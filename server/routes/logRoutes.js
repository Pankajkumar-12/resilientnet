const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    getSystemLogs
} = require("../controllers/logController");

router.get("/", authenticate, getSystemLogs);

module.exports = router;