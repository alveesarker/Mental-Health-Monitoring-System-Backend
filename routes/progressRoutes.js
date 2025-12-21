const express = require("express");
const router = express.Router();
const ProgressController = require("../controllers/progressController");

// Get all progress (search by sessionID optional)
router.get("/", ProgressController.getAllProgress);

// Get all progress for a patient
router.get("/patient/:patientID", ProgressController.getProgressByPatientID);

// Get progress by sessionID
router.get("/:sessionID", ProgressController.getProgressBySessionID);

// Create progress
router.post("/", ProgressController.createProgress);

// Update progress
router.put("/:sessionID", ProgressController.updateProgress);

// Delete progress
router.delete("/:sessionID", ProgressController.deleteProgress);

module.exports = router;
