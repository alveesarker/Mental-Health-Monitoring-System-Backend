// models/dailyLog.model.js
const db = require("../config/db");


function toMysqlFormatLocal(ts) {
    const d = new Date(ts);

    // Build YYYY-MM-DD HH:MM:SS without timezone conversion
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const sec = String(d.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}



module.exports = {
    // Get all logs (optionally filtered by patient)
    getAll: async (patientID = null) => {
        if (patientID) {
            const [rows] = await db.query(
                "SELECT * FROM DailyLog WHERE patientID = ? ORDER BY timestamp DESC",
                [patientID]
            );
            return rows;
        }

        const [rows] = await db.query(
            "SELECT * FROM DailyLog ORDER BY timestamp DESC"
        );
        return rows;
    },

    // Get single log
    getOne: async (patientID, timestamp) => {
        const [rows] = await db.query(
            "SELECT * FROM DailyLog WHERE patientID = ? AND timestamp = ?",
            [patientID, timestamp]
        );
        return rows[0];
    },

    // Add new daily log
    create: async (data) => {
        const { patientID, timestamp, mood, notes, stressLevel, sleepDuration } = data;

        await db.query(
            `INSERT INTO DailyLog 
        (patientID, timestamp, mood, notes, stressLevel, sleepDuration)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [patientID, timestamp, mood, notes, stressLevel, sleepDuration]
        );

        return data;
    },

    // Update a log
    update: async (patientID, timestamp, data) => {
        const { mood, notes, stressLevel, sleepDuration } = data;

        const normalized = toMysqlFormatLocal(timestamp);

        const [result] = await db.query(
            `UPDATE DailyLog
   SET mood = ?, notes = ?, stressLevel = ?, sleepDuration = ?
   WHERE patientID = ? AND timestamp = ?`,
            [
                mood,
                notes,
                Number(stressLevel),
                Number(sleepDuration),
                patientID,
                normalized,
            ]
        );

        console.log("affected:", result.affectedRows);

    }
    ,

    // Delete a log
    delete: async (patientID, timestamp) => {

        const normalized = toMysqlFormatLocal(timestamp);

        await db.query(
            "DELETE FROM DailyLog WHERE patientID = ? AND timestamp = ?",
            [patientID, normalized]
        );
    },
};
