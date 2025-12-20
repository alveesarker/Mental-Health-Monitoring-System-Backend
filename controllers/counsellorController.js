// controllers/counsellorControllers.js
const model = require("../models/counsellorModel");

exports.createCounsellor = async (req, res) => {
    try {
        const id = await model.insertCounsellor(req.body);
        res.json({ message: "Counsellor added", counsellorID: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCounsellor = async (req, res) => {
    try {
        await model.updateCounsellor(req.params.id, req.body);
        res.json({ message: "Counsellor updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.fetchAllCounsellorsName = async (req, res) => {
  try {
    const counsellors = await model.getAllCounsellorsName();
    return res.status(200).json({
      success: true,
      counsellors
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


exports.deleteCounsellor = async (req, res) => {
    try {
        await model.deleteCounsellor(req.params.id);
        res.status(204).end(); // Set status 204 and end the response without a body
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMain = async (req, res) => {
    try {
        const data = await model.getCounsellorMain();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDetails = async (req, res) => {
    try {
        const data = await model.getCounsellorDetails(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
