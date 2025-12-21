const express = require("express");
const router = express.Router();
const controller = require("../controllers/dailyLogController");

// GET all daily logs (optional: ?patientID=3)
router.get("/", controller.getAllLogs);

// 🔹 Get all daily logs of assigned patients by counsellor
router.get("/dcounsellor/:counsellorID", controller.getLogsByCounsellor);

// Get last 7 daily logs for a particular patient
router.get("/:patientID/last7", controller.getLast7DailyLogs);

// GET all logs for a specific patient
router.get("/:patientID", controller.getLogsByPatient);

// GET single log
router.get("/:patientID/:timestamp", controller.getLog);

// CREATE new log
router.post("/", controller.createLog);

// UPDATE log
router.put("/:patientID/:timestamp", controller.updateLog);

// DELETE log
router.delete("/:patientID/:timestamp", controller.deleteLog);

module.exports = router;
