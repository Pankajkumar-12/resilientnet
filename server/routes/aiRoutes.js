const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
    analyzeSOS,
    getAllAnalysis
} = require("../controllers/aiController");

router.get(
    "/",
    authenticate,
    getAllAnalysis
);

router.post(
    "/analyze/:sosId",
    authenticate,
    analyzeSOS
);

module.exports = router;