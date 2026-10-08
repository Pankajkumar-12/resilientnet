const express = require("express");
const router = express.Router();

const {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
} = require("../controllers/organizationController");

const authMiddleware = require("../middleware/authMiddleware");

// Create organization
router.post("/", authMiddleware, createOrganization);

// Get all organizations
router.get("/", authMiddleware, getOrganizations);

// Get organization by ID
router.get("/:id", authMiddleware, getOrganizationById);

// Update organization
router.put("/:id", authMiddleware, updateOrganization);

// Delete organization
router.delete("/:id", authMiddleware, deleteOrganization);

module.exports = router;