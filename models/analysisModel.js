const db = require("../db");

// GET ALL ANALYSIS
const getAll = async () => {
    const sql = `SELECT * FROM analysis`;
    const [rows] = await db.query(sql);
    return rows;
};

// GET BY ID
const getById = async (id) => {
    const sql = `SELECT * FROM analysis WHERE analysisID = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
};

// CREATE ANALYSIS
const create = async (analysis) => {
    const { riskScore, sentimentScore, issue, emotionalClassification } = analysis;

    const sql = `
        INSERT INTO analysis (riskScore, sentimentScore, issue, emotionalClassification)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(
        sql,
        [riskScore, sentimentScore, issue, emotionalClassification]
    );

    return { analysisID: result.insertId };
};

// UPDATE ANALYSIS
const update = async (id, analysis) => {
    const { riskScore, sentimentScore, issue, emotionalClassification } = analysis;

    const sql = `
        UPDATE analysis
        SET riskScore=?, sentimentScore=?, issue=?, emotionalClassification=?
        WHERE analysisID=?
    `;

    await db.query(sql, [riskScore, sentimentScore, issue, emotionalClassification, id]);
    return true;
};

// DELETE ANALYSIS
const remove = async (id) => {
    const sql = `DELETE FROM analysis WHERE analysisID=?`;
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
