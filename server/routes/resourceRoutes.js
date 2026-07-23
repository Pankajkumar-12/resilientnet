const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    getAllResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    assignResource,
    updateResourceStatus,
    releaseResource
} = require("../controllers/resourceController");

router.get("/", authenticate, getAllResources);

router.get("/:id", authenticate, getResourceById);

router.post("/", authenticate, createResource);

router.put("/:id", authenticate, updateResource);

router.delete("/:id", authenticate, deleteResource);

router.patch("/:id/assign", authenticate, assignResource);

router.patch("/:id/status", authenticate, updateResourceStatus);

router.patch("/:id/release", authenticate, releaseResource);

module.exports = router;