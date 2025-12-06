const db = require("../config/db");

exports.getAllPatients = async () => {
  const [rows] = await db.query("SELECT * FROM Patient");
  return rows;
};

exports.getAllPatientsName = async () => {
  const [rows] = await db.query(
    "SELECT patientID, name FROM patient"
  );
  return rows;
};


exports.addPatient = async (patient) => {
  const { name, email, dob, gender, contactNumber, city, street, postalCode } = patient;

  // Insert the new patient
  const [result] = await db.query(
    `INSERT INTO Patient (name, email, dob, gender, contactNumber, city, street, postalCode)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, dob, gender, contactNumber, city, street, postalCode]
  );

  // Return the newly added patient, including the generated ID
  const [rows] = await db.query("SELECT * FROM Patient WHERE patientID = ?", [result.insertId]);
  return rows[0];
};

exports.deletePatient = async (id) => {
  const [result] = await db.query("DELETE FROM Patient WHERE patientID = ?", [id]);
  return result.affectedRows > 0; // true if a row was deleted, false if not found
};

exports.getPatientById = async (id) => {
  const [rows] = await db.query("SELECT * FROM Patient WHERE patientID = ?", [id]);
  return rows[0]; // returns undefined if not found
};


exports.updatePatient = async (id, data) => {
  const { name, email, dob, gender, contactNumber, city, street, postalCode } = data;
  await db.query(
    `UPDATE Patient SET name = ?, email = ?, dob = ?, gender = ?, contactNumber = ?, city = ?, street = ?, postalCode = ? WHERE patientID = ?`,
    [name, email, dob, gender, contactNumber, city, street, postalCode, id]
  );
  return { patientID: id, ...data };
};
