const db = require("../db"); // mysql2/promise connection or pool

const Rating = {
  // Get all ratings
  getAll: async () => {
    const [rows] = await db.query(`SELECT * FROM rating`);
    return rows;
  },

  // Get rating by sessionID
  getBySessionID: async (sessionID) => {
    const [rows] = await db.query(
      `SELECT * FROM rating WHERE sessionID = ?`,
      [sessionID]
    );
    return rows[0]; // single row
  },

  // Create rating
  create: async (data) => {
    const { sessionID, rating, comfortLevel, clarityLevel, comment } = data;

    await db.query(
      `INSERT INTO rating (sessionID, rating, comfortLevel, clarityLevel, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionID, rating, comfortLevel, clarityLevel, comment]
    );
  },

  // Update rating
  update: async (sessionID, data) => {
    const { rating, comfortLevel, clarityLevel, comment } = data;

    await db.query(
      `UPDATE rating
       SET rating = ?, comfortLevel = ?, clarityLevel = ?, comment = ?
       WHERE sessionID = ?`,
      [rating, comfortLevel, clarityLevel, comment, sessionID]
    );
  },

  // Delete rating
  delete: async (sessionID) => {
    await db.query(
      `DELETE FROM rating WHERE sessionID = ?`,
      [sessionID]
    );
  },
};

module.exports = Rating;
