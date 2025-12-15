const db = require("../db");

/* ================= GET ALL PATIENTS ================= */
exports.getAllPatients = async () => {
  const [rows] = await db.query(`
    SELECT 
      p.patientID,
      u.name,
      u.email,
      u.contactNumber,
      u.city,
      u.street,
      u.postalCode,
      p.dob,
      p.gender
    FROM patient p
    JOIN user_t u ON p.patientID = u.userID
    WHERE u.role = 'patient'
  `);
  return rows;
};

/* ================= GET ALL PATIENT NAMES ================= */
exports.getAllPatientsName = async () => {
  const [rows] = await db.query(`
    SELECT p.patientID, u.name
    FROM patient p
    JOIN user_t u ON p.patientID = u.userID
  `);
  return rows;
};

/* ================= ADD PATIENT ================= */
exports.addPatient = async (patient) => {
  const {
    name,
    email,
    contactNumber,
    city,
    street,
    postalCode,
    password, // include password
    dob,
    gender
  } = patient;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. insert into user_t
    const [userResult] = await conn.query(
      `INSERT INTO user_t 
      (name, email, contactNumber, city, street, postalCode, role, password)
      VALUES (?, ?, ?, ?, ?, ?, 'patient', ?)`,
      [name, email, contactNumber, city, street, postalCode, password]
    );

    const userID = userResult.insertId;

    // 2. insert into patient
    await conn.query(
      `INSERT INTO patient (patientID, dob, gender)
       VALUES (?, ?, ?)`,
      [userID, dob, gender]
    );

    await conn.commit();

    return {
      patientID: userID,
      name,
      email,
      contactNumber,
      city,
      street,
      postalCode,
      dob,
      gender
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ================= GET PATIENT BY ID ================= */
exports.getPatientById = async (patientID) => {
  const [rows] = await db.query(`
    SELECT 
      p.patientID,
      u.name,
      u.email,
      u.contactNumber,
      u.city,
      u.street,
      u.postalCode,
      p.dob,
      p.gender
    FROM patient p
    JOIN user_t u ON p.patientID = u.userID
    WHERE p.patientID = ?
  `, [patientID]);

  return rows[0];
};

/* ================= UPDATE PATIENT ================= */
exports.updatePatient = async (patientID, data) => {
  const {
    name,
    email,
    contactNumber,
    city,
    street,
    postalCode,
    password, // optionally update password
    dob,
    gender
  } = data;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT patientID FROM patient WHERE patientID = ?",
      [patientID]
    );

    if (rows.length === 0) return null;

    await conn.query(
      `UPDATE user_t
       SET name=?, email=?, contactNumber=?, city=?, street=?, postalCode=? ${password ? ', password=?' : ''}
       WHERE userID=?`,
      password
        ? [name, email, contactNumber, city, street, postalCode, password, patientID]
        : [name, email, contactNumber, city, street, postalCode, patientID]
    );

    await conn.query(
      `UPDATE patient SET dob=?, gender=? WHERE patientID=?`,
      [dob, gender, patientID]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ================= DELETE PATIENT ================= */
exports.deletePatient = async (patientID) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT patientID FROM patient WHERE patientID = ?",
      [patientID]
    );

    if (rows.length === 0) return false;

    await conn.query("DELETE FROM patient WHERE patientID = ?", [patientID]);
    await conn.query("DELETE FROM user_t WHERE userID = ?", [patientID]);

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
