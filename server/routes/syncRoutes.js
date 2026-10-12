const express = require("express");
const router = express.Router();
const { syncEmergencyData } = require("../controllers/syncController");

// Endpoint: POST /api/emergency/sync
router.post("/", syncEmergencyData);

module.exports = router;
