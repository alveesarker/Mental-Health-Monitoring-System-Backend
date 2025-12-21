const express = require("express");
const router = express.Router();
const controller = require("../controllers/sessionController");

/* ---------- FIXED ORDER ---------- */

// Static / specific routes first
router.get("/session-details/:id", controller.fetchSessionDetails);
router.get("/sessionids", controller.getAllIDs);
router.post("/request", controller.requestSession);

router.get("/:counsellorID/cpending", controller.getPendingSessionsByCounsellor);
router.get("/c/:counsellorID", controller.getAllSessionsByCounsellor);

// Patient-based routes
router.get("/:patientID/pending", controller.getPendingSessionsByPatient);
router.get("/:patientID", controller.getAllSessionsByPatient);

// General session routes
router.get("/", controller.getSessions);
router.post("/", controller.createSession);
router.put("/:id", controller.updateSession);
router.delete("/:id", controller.deleteSession);

module.exports = router;
