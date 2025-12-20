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
      u.password,
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
    password,
    dob,
    gender,
  } = patient;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [userResult] = await conn.query(
      `INSERT INTO user_t
       (name, email, contactNumber, city, street, postalCode, role, password)
       VALUES (?, ?, ?, ?, ?, ?, 'patient', ?)`,
      [name, email, contactNumber, city, street, postalCode, password]
    );

    const userID = userResult.insertId;

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
      gender,
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
      u.password,
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
    password,
    dob,
    gender,
  } = data;

  console.log(data);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [exists] = await conn.query(
      "SELECT patientID FROM patient WHERE patientID = ?",
      [patientID]
    );

    if (exists.length === 0) return null;

    let userQuery = `
      UPDATE user_t
      SET name=?, email=?, contactNumber=?, city=?, street=?, postalCode=?
    `;
    const params = [
      name,
      email,
      contactNumber,
      city,
      street,
      postalCode,
    ];

    if (password) {
      userQuery += `, password=?`;
      params.push(password);
    }

    userQuery += ` WHERE userID=?`;
    params.push(patientID);

    await conn.query(userQuery, params);

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
  await db.query("DELETE FROM patient WHERE patientID = ?", [patientID]);
  await db.query("DELETE FROM user_t WHERE userID = ?", [patientID]);
  return true;
  // const conn = await db.getConnection();
  // try {
  //   const [rows] = await conn.query(
  //     "SELECT patientID FROM patient WHERE patientID = ?",
  //     [patientID]
  //   );

  //   if (rows.length === 0) return false;

  //   await conn.query("DELETE FROM patient WHERE patientID = ?", [patientID]);
  //   await conn.query("DELETE FROM user_t WHERE userID = ?", [patientID]);

  //   await conn.commit();
  //   return true;
  // } catch (err) {
  //   await conn.rollback();
  //   throw err;
  // } finally {
  //   conn.release();
  // }
};
