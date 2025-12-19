const Rating = require("../models/ratingModel");

const RatingController = {
  // GET all ratings
  getAllRatings: async (req, res) => {
    try {
      const ratings = await Rating.getAll();
      res.status(200).json(ratings);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET rating by sessionID
  getRatingBySessionID: async (req, res) => {
    try {
      const { sessionID } = req.params;
      const rating = await Rating.getBySessionID(sessionID);

      if (!rating) {
        return res.status(404).json({ success: false, message: "Rating not found" });
      }

      res.status(200).json(rating);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // CREATE rating
  createRating: async (req, res) => {
    try {
      await Rating.create(req.body);
      res.status(201).json({ success: true, message: "Rating created successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // UPDATE rating
  updateRating: async (req, res) => {
    try {
      const { sessionID } = req.params;
      await Rating.update(sessionID, req.body);
      res.status(200).json({ success: true, message: "Rating updated successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE rating
  deleteRating: async (req, res) => {
    try {
      const { sessionID } = req.params;
      await Rating.delete(sessionID);
      res.status(200).json({ success: true, message: "Rating deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = RatingController;
