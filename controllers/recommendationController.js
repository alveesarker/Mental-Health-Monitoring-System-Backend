const Recommendation = require("../models/recommendationModel");

exports.getAllRecommendation = async (req, res) => {
  try {
    const recommendations = await Recommendation.getAll();
    res.json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createRecommendation = async (req, res) => {
  try {
    const id = await Recommendation.create(req.body);
    res.json({ message: "Recommendation created", recommendationID: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateRecommendation = async (req, res) => {
  try {
    await Recommendation.update(req.params.id, req.body);
    res.json({ message: "Recommendation updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteRecommendation = async (req, res) => {
  try {
    await Recommendation.delete(req.params.id);
    res.json({ message: "Recommendation deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
