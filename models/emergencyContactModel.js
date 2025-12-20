const db = require("../db");

// GET ALL CONTACTS
const getAll = async () => {
  const sql = `
    SELECT *
    FROM emergencycontact
  `;
  const [rows] = await db.query(sql);
  return rows;
};

// GET BY CONTACT + PATIENT (composite key)
const getById = async (contactNumber, patientID) => {
  const sql = `SELECT * FROM emergencycontact WHERE contactNumber=? AND patientID=?`;
  const [rows] = await db.query(sql, [contactNumber, patientID]);
  return rows[0];
};

// CREATE CONTACT
const create = async (contact) => {
  const { contactNumber, name, relationship, email, patientID } = contact;
  const sql = `
    INSERT INTO emergencycontact (contactNumber, name, relationship, email, patientID)
    VALUES (?, ?, ?, ?, ?)
  `;
  await db.query(sql, [contactNumber, name, relationship, email, patientID]);
  return { contactNumber, patientID };
};

// UPDATE CONTACT
const update = async (contactNumber, patientID, contact) => {
  const { name, relationship, email, patientID: newPatientID } = contact;
  const sql = `
    UPDATE emergencycontact
    SET name=?, relationship=?, email=?, patientID=?
    WHERE contactNumber=? AND patientID=?
  `;
  await db.query(sql, [name, relationship, email, newPatientID, contactNumber, patientID]);
  return true;
};

// DELETE CONTACT
const remove = async (contactNumber, patientID) => {
  const sql = `DELETE FROM emergencycontact WHERE contactNumber=? AND patientID=?`;
  await db.query(sql, [contactNumber, patientID]);
  return true;
};

// GET ALL PATIENTS (for dropdown)
const getAllPatients = async () => {
  const sql = `SELECT patientID AS patient FROM patient`;
  const [rows] = await db.query(sql);
  return rows;
};


module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getAllPatients,
};
