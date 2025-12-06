// controllers/dailyLog.controller.js
const DailyLog = require("../models/dailyLogModel");

module.exports = {
  getAllLogs: async (req, res) => {
    try {
      const { patientID } = req.query; // optional filter
      const logs = await DailyLog.getAll(patientID);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: "Failed to load daily logs" });
    }
  },

  getLog: async (req, res) => {
    try {
      const { patientID, timestamp } = req.params;
      const log = await DailyLog.getOne(patientID, timestamp);

      if (!log) return res.status(404).json({ error: "Log not found" });

      res.json(log);
    } catch (err) {
      res.status(500).json({ error: "Failed to load log" });
    }
  },

  createLog: async (req, res) => {
    try {
      const data = req.body;
      await DailyLog.create(data);
      res.json({ message: "Log added successfully", data });
    } catch (err) {
      res.status(500).json({ error: "Failed to add daily log" });
    }
  },

  updateLog: async (req, res) => {
    try {
      const { patientID, timestamp } = req.params;
      const data = req.body;

      await DailyLog.update(patientID, timestamp, data);

      res.json({ message: "Log updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update log" });
    }
  },

  deleteLog: async (req, res) => {
    try {
      const { patientID, timestamp } = req.params;

      await DailyLog.delete(patientID, timestamp);

      res.json({ message: "Log deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete log" });
    }
  },
};
