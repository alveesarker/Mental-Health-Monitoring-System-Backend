const express = require("express");
const router = express.Router();
const RatingController = require("../controllers/ratingController");

// GET all ratings
router.get("/", RatingController.getAllRatings);

// GET rating by sessionID
router.get("/:sessionID", RatingController.getRatingBySessionID);

// CREATE rating
router.post("/", RatingController.createRating);

// UPDATE rating
router.put("/:sessionID", RatingController.updateRating);

// DELETE rating
router.delete("/:sessionID", RatingController.deleteRating);

module.exports = router;
