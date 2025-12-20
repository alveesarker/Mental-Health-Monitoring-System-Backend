const express = require("express");
const router = express.Router();
const RatingController = require("../controllers/ratingController");

router.get("/", RatingController.getAllRatings);
router.get("/:sessionID", RatingController.getRatingBySessionID);
router.post("/", RatingController.createRating);
router.put("/:sessionID", RatingController.updateRating);
router.delete("/:sessionID", RatingController.deleteRating);

module.exports = router;
