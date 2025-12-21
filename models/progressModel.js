const db = require("../db");

const ProgressModel = {
  // Get all progress (optional search by sessionID)
  getAll: async (sessionID) => {
    let sql = "SELECT * FROM progress";
    let params = [];

    if (sessionID) {
      sql += " WHERE sessionID = ?";
      params.push(sessionID);
    }

    const [rows] = await db.execute(sql, params);
    return rows;
  },

  // Get single progress by sessionID
  getBySessionID: async (sessionID) => {
    const [rows] = await db.execute(
      "SELECT * FROM progress WHERE sessionID = ?",
      [sessionID]
    );
    return rows[0];
  },

  // Create progress
  create: async (data) => {
    const {
      sessionID,
      stability,
      stressLevel,
      depressionLevel,
      workPerformance,
      energyLevel,
      fatigueLevel,
      note,
    } = data;


    const sql = `
      INSERT INTO progress 
      (sessionID, stability, stressLevel, depressionLevel, workPerformance, energyLevel, fatigueLevel, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      sessionID,
      stability,
      stressLevel,
      depressionLevel,
      workPerformance,
      energyLevel,
      fatigueLevel,
      note,
    ]);


    return result;
  },

  // Update progress by sessionID
  update: async (sessionID, data) => {
    const {
      stability,
      stressLevel,
      depressionLevel,
      workPerformance,
      energyLevel,
      fatigueLevel,
      note,
    } = data;

    const sql = `
      UPDATE progress SET
        stability = ?,
        stressLevel = ?,
        depressionLevel = ?,
        workPerformance = ?,
        energyLevel = ?,
        fatigueLevel = ?,
        note = ?
      WHERE sessionID = ?
    `;

    const [result] = await db.execute(sql, [
      stability,
      stressLevel,
      depressionLevel,
      workPerformance,
      energyLevel,
      fatigueLevel,
      note,
      sessionID,
    ]);

    return result;
  },

   getByPatientID: async (patientID) => {
    const sql = `
      SELECT 
        p.sessionID,
        s.sessionDate,
        p.stability,
        p.depressionLevel,
        p.stressLevel,
        p.workPerformance,
        p.energyLevel,
        p.fatigueLevel,
        p.note
      FROM progress p
      JOIN session s ON p.sessionID = s.sessionID
      WHERE s.patientID = ?
      ORDER BY s.sessionDate DESC
    `;

    const [rows] = await db.execute(sql, [patientID]);
    return rows;
  },

  // Delete progress by sessionID
  delete: async (sessionID) => {
    const [result] = await db.execute(
      "DELETE FROM progress WHERE sessionID = ?",
      [sessionID]
    );
    return result;
  },
};

module.exports = ProgressModel;
