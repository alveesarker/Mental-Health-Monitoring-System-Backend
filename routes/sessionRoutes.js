const express = require("express");
const router = express.Router();
const controller = require("../controllers/sessionController");

router.get("/", controller.getSessions);
router.post("/", controller.createSession);
router.put("/:id", controller.updateSession);
router.delete("/:id", controller.deleteSession);
router.get("/session-details/:id", controller.fetchSessionDetails);
router.get("/sessionids", controller.getAllIDs);

module.exports = router;
