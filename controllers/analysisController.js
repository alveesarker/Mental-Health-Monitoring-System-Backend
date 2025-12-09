const Analysis = require("../models/analysisModel");

// GET ALL
const getAnalysis = async (req, res) => {
  try {
    const data = await Analysis.getAll();
    res.json(data);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET BY ID
const getAnalysisById = async (req, res) => {
  try {
    const row = await Analysis.getById(req.params.id);
    if (!row) return res.status(404).json({ message: "Not found" });

    res.json(row);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// CREATE
const createAnalysis = async (req, res) => {
  try {
    await Analysis.create(req.body);
    const updated = await Analysis.getAll();

    res.json({
      success: true,
      data: updated
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};


// UPDATE
const updateAnalysis = async (req, res) => {
  try {
    await Analysis.update(req.params.id, req.body);
    const updated = await Analysis.getAll();

    res.json({
      success: true,
      data: updated
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};


// DELETE
const deleteAnalysis = async (req, res) => {
  try {
    await Analysis.remove(req.params.id);
    const updated = await Analysis.getAll();

    res.json({
      success: true,
      data: updated
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};


module.exports = {
  getAnalysis,
  getAnalysisById,
  createAnalysis,
  updateAnalysis,
  deleteAnalysis,
};
