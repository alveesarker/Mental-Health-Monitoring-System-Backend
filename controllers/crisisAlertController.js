const CrisisAlert = require("../models/crisisAlertModel");

// GET ALL
const getAlerts = async (req, res) => {
  try {
    const rows = await CrisisAlert.getAll();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET BY ID
const getAlertById = async (req, res) => {
  try {
    const alert = await CrisisAlert.getById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    res.json(alert);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// CREATE
const createAlert = async (req, res) => {
  try {
    await CrisisAlert.create(req.body);
    const updated = await CrisisAlert.getAll();

    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// UPDATE
const updateAlert = async (req, res) => {
  try {
    await CrisisAlert.update(req.params.id, req.body);
    const updated = await CrisisAlert.getAll();

    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE
const deleteAlert = async (req, res) => {
  try {
    await CrisisAlert.remove(req.params.id);
    const updated = await CrisisAlert.getAll();

    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
};
