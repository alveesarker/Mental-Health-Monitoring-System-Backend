const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

router.get("/", recommendationController.getAllRecommendation);
router.post("/", recommendationController.createRecommendation);
router.put("/:id", recommendationController.updateRecommendation);
router.delete("/:id", recommendationController.deleteRecommendation);

module.exports = router;
