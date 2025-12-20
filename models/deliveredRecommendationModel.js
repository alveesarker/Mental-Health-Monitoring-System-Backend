const db = require("../db");

/**
 * Get active recommendations for a patient
 * Validation rule:
 *  - expiresAt IS NULL OR expiresAt > NOW()
 */
const getValidRecommendationsByPatient = async (patientID) => {
  const [rows] = await db.query(
    `
    SELECT 
      r.recommendationID,
      r.type,
      r.title,
      r.description,
      r.priority,
      dr.timestamp,
      dr.expiresAt,
      dr.status
    FROM deliveredrecommendation dr
    JOIN recommendation r 
      ON dr.recommendationID = r.recommendationID
    WHERE dr.patientID = ?
      AND (dr.expiresAt IS NULL OR dr.expiresAt > NOW())
    ORDER BY r.priority DESC, dr.timestamp DESC
    `,
    [patientID]
  );

  return rows;
};

module.exports = {
  getValidRecommendationsByPatient
};
