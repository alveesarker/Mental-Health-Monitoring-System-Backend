const model = require("../models/deliveredRecommendationModel");

const getPatientRecommendations = async (req, res) => {
    try {
        const { patientID } = req.params;

        if (!patientID) {
            return res.status(400).json({ error: "patientID is required" });
        }

        const recommendations =
            await model.getValidRecommendationsByPatient(patientID);

        res.status(200).json(recommendations);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
};

module.exports = {
    getPatientRecommendations
};
