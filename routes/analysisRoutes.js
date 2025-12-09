const express = require("express");
const router = express.Router();
const controller = require("../controllers/analysisController");

// CRUD routes
router.get("/", controller.getAnalysis);
router.get("/:id", controller.getAnalysisById);
router.post("/", controller.createAnalysis);
router.put("/:id", controller.updateAnalysis);
router.delete("/:id", controller.deleteAnalysis);

module.exports = router;
