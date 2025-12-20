const db = require("../db");

/* ================= GET ALL ASSIGNMENTS ================= */
const getAll = async () => {
  const [rows] = await db.query(`
    SELECT a.assignmentID, a.startDate, a.endDate,
           p.patientID, u1.name AS patientName,
           c.counsellorID, u2.name AS counsellorName
    FROM assignment a
    LEFT JOIN patient p ON a.patientID = p.patientID
    LEFT JOIN user_t u1 ON p.patientID = u1.userID
    LEFT JOIN counsellor c ON a.counsellorID = c.counsellorID
    LEFT JOIN user_t u2 ON c.counsellorID = u2.userID
  `);
  return rows;
};

/* ================= CREATE ASSIGNMENT ================= */
const create = async ({ patientID, counsellorID, startDate, endDate }) => {
  const [res] = await db.query(
    `INSERT INTO assignment (patientID, counsellorID, startDate, endDate) VALUES (?, ?, ?, ?)`,
    [patientID, counsellorID, startDate, endDate || null]
  );
  return { assignmentID: res.insertId };
};

/* ================= UPDATE ASSIGNMENT ================= */
const update = async (assignmentID, { patientID, counsellorID, startDate, endDate }) => {
  await db.query(
    `UPDATE assignment SET patientID=?, counsellorID=?, startDate=?, endDate=? WHERE assignmentID=?`,
    [patientID, counsellorID, startDate, endDate || null, assignmentID]
  );
  return true;
};

/* ================= DELETE ASSIGNMENT ================= */
const remove = async (assignmentID) => {
  await db.query(`DELETE FROM assignment WHERE assignmentID=?`, [assignmentID]);
  return true;
};

/* ================= GET ALL PATIENT NAMES ================= */
const getAllPatientsName = async () => {
  const [rows] = await db.query(`
    SELECT p.patientID, u.name
    FROM patient p
    JOIN user_t u ON p.patientID = u.userID
  `);
  return rows;
};

/* ================= GET ALL COUNSELLOR NAMES ================= */
const getAllCounsellorsName = async () => {
  const [rows] = await db.query(`
    SELECT c.counsellorID, u.name
    FROM counsellor c
    JOIN user_t u ON c.counsellorID = u.userID
  `);
  return rows;
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  getAllPatientsName,
  getAllCounsellorsName
};
