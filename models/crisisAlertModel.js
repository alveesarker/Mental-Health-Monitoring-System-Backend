const db = require("../config/db");

// GET ALL
const getAll = async () => {
    const sql = `SELECT * FROM crisisalert`;
    const [rows] = await db.query(sql);
    return rows;
};

// GET BY ID
const getById = async (id) => {
    const sql = `SELECT * FROM crisisalert WHERE alertID = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
};

// CREATE
const create = async (alert) => {
    const { alertType, alertLevel, alertMessage, timestamp, status, counsellorID, patientID, analysisID } = alert;

    const sql = `
        INSERT INTO crisisalert (alertType, alertLevel, alertMessage, timestamp, status, counsellorID, patientID, analysisID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
        alertType,
        alertLevel,
        alertMessage,
        timestamp,
        status,
        counsellorID,
        patientID,
        analysisID
    ]);

    return true;
};

// UPDATE
const update = async (id, alert) => {
    const { alertType, alertLevel, alertMessage, timestamp, status, counsellorID, patientID, analysisID } = alert;

    const sql = `
        UPDATE crisisalert
        SET alertType=?, alertLevel=?, alertMessage=?, timestamp=?, status=?, counsellorID=?, patientID=?, analysisID=?
        WHERE alertID=?
    `;

    await db.query(sql, [
        alertType,
        alertLevel,
        alertMessage,
        timestamp,
        status,
        counsellorID,
        patientID,
        analysisID,
        id
    ]);

    return true;
};

// DELETE
const remove = async (id) => {
    const sql = `DELETE FROM crisisalert WHERE alertID=?`;
    await db.query(sql, [id]);
    return true;
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};
