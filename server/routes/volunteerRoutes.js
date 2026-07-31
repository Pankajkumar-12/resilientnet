const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    getAllVolunteers,
    assignVolunteer,
    getAssignedVolunteers
} = require("../controllers/volunteerController");

router.get(
    "/",
    authenticate,
    getAllVolunteers
);

router.put(
    "/:id/assign",
    authenticate,
    assignVolunteer
);

router.get(
    "/assigned/:sosId",
    authenticate,
    getAssignedVolunteers
);

module.exports = router;