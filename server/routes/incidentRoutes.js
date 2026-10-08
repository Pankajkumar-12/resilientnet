const express = require("express");
const router = express.Router();

const {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident
} = require("../controllers/incidentController");

const authMiddleware = require("../middleware/authMiddleware");

// Create incident
router.post("/", authMiddleware, createIncident);

// Get all incidents
router.get("/", authMiddleware, getIncidents);

// Get incident by ID
router.get("/:id", authMiddleware, getIncidentById);

// Update incident
router.put("/:id", authMiddleware, updateIncident);

// Delete incident
router.delete("/:id", authMiddleware, deleteIncident);

module.exports = router;