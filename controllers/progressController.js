const ProgressModel = require("../models/progressModel");

const ProgressController = {
    // GET all progress
    getAllProgress: async (req, res) => {
        try {
            const { sessionID } = req.query;
            const data = await ProgressModel.getAll(sessionID);

            // Return array directly
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

     getProgressByPatientID: async (req, res) => {
        try {
            const { patientID } = req.params;
            const data = await ProgressModel.getByPatientID(patientID);

            if (!data || data.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No progress records found for this patient",
                });
            }

            res.status(200).json({
                success: true,
                data: data,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // GET progress by sessionID
    getProgressBySessionID: async (req, res) => {
        try {
            const { sessionID } = req.params;
            const data = await ProgressModel.getBySessionID(sessionID);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Progress record not found",
                });
            }

            res.status(200).json({
                success: true,
                data,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // CREATE progress
    createProgress: async (req, res) => {
        try {
            const result = await ProgressModel.create(req.body);
            res.status(201).json({
                success: true,
                message: "Progress added successfully",
                insertId: result.insertId,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // UPDATE progress
    updateProgress: async (req, res) => {
        try {
            const { sessionID } = req.params;
            const result = await ProgressModel.update(sessionID, req.body);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Progress record not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Progress updated successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // DELETE progress
    deleteProgress: async (req, res) => {
        try {
            const { sessionID } = req.params;
            const result = await ProgressModel.delete(sessionID);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Progress record not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Progress deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
};

module.exports = ProgressController;
