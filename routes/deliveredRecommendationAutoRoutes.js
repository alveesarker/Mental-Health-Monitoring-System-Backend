const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliveredRecommendationController");

// GET valid recommendations for a patient
router.get(
    "/patient/:patientID",
    controller.getPatientRecommendations
);

module.exports = router;
