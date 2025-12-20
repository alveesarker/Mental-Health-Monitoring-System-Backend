const db = require("../db");

/* ================= GET ALL SESSIONS ================= */
const getAll = async () => {
  const q = `
    SELECT 
      s.*,
      p.name AS patientName,
      c.name AS counsellorName,
      o.link,
      f.counsellingCenter,
      f.roomNumber
    FROM session s
    LEFT JOIN user_t p ON s.patientID = p.userID
    LEFT JOIN user_t c ON s.counsellorID = c.userID
    LEFT JOIN online o ON s.sessionID = o.sessionID
    LEFT JOIN offline f ON s.sessionID = f.sessionID
  `;

  const [rows] = await db.query(q);
  return rows;
};

/* ================= CREATE SESSION ================= */
const create = async (sessionData, typeData, type) => {
  const {
    sessionDate,
    status,
    duration,
    patientID,
    counsellorID,
    sessionTime
  } = sessionData;

  const sessionType = type?.toLowerCase().trim();

  console.log("Type:", sessionType);
  console.log("Type Data:", typeData);

  try {
    /* ---------- INSERT SESSION ---------- */
    const insertSessionSQL = `
      INSERT INTO session
      (sessionDate, status, duration, patientID, counsellorID, sessionTime, sessionType)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(insertSessionSQL, [
      sessionDate,
      status,
      duration,
      patientID,
      counsellorID,
      sessionTime,
      sessionType
    ]);

    const sessionID = result.insertId;

    /* ---------- INSERT SESSION TYPE ---------- */
    if (sessionType === "online") {
      if (!typeData?.link) {
        throw new Error("Missing meeting link");
      }

      await db.query(
        `INSERT INTO online (sessionID, link) VALUES (?, ?)`,
        [sessionID, typeData.link]
      );

    } else if (sessionType === "offline") {
      if (!typeData?.counsellingCenter || !typeData?.roomNumber) {
        throw new Error("Missing offline session details");
      }

      await db.query(
        `INSERT INTO offline (sessionID, counsellingCenter, roomNumber)
         VALUES (?, ?, ?)`,
        [
          sessionID,
          typeData.counsellingCenter,
          typeData.roomNumber
        ]
      );

    } else {
      throw new Error("Invalid session type");
    }

    return { sessionID };

  } catch (err) {
    console.error("CREATE SESSION ERROR:", err);
    throw err;
  }
};


/* ================= UPDATE SESSION ================= */
const update = async (sessionID, sessionData, typeData, type) => {
  const { sessionDate, status, duration, sessionTime } = sessionData;

  await db.query(
    `UPDATE session 
     SET sessionDate=?, status=?, duration=?, sessionTime=?, sessionType=?
     WHERE sessionID=?`,
    [sessionDate, status, duration, sessionTime, type, sessionID]
  );

  await db.query(`DELETE FROM online WHERE sessionID=?`, [sessionID]);
  await db.query(`DELETE FROM offline WHERE sessionID=?`, [sessionID]);

  if (type === "online") {
    await db.query(
      `INSERT INTO online(sessionID, link) VALUES (?, ?)`,
      [sessionID, typeData.link]
    );
  } else {
    await db.query(
      `INSERT INTO offline(sessionID, counsellingCenter, roomNumber)
       VALUES (?, ?, ?)`,
      [sessionID, typeData.counsellingCenter, typeData.roomNumber]
    );
  }

  return true;
};

/* ================= GET SESSION DETAILS ================= */
const getSessionDetailsByID = async (sessionID) => {
  const sql = `
    SELECT 
      s.*,
      u1.name AS patientName,
      u2.name AS counsellorName,
      r.rating, r.comfortLevel, r.clarityLevel, r.comment
    FROM session s
    LEFT JOIN user_t u1 ON s.patientID = u1.userID
    LEFT JOIN user_t u2 ON s.counsellorID = u2.userID
    LEFT JOIN rating r ON s.sessionID = r.sessionID
    WHERE s.sessionID = ?
  `;

  const [rows] = await db.query(sql, [sessionID]);
  return rows[0];
};

/* ================= DELETE SESSION ================= */
const remove = (sessionID) => {
  return new Promise((resolve, reject) => {
    db.query(`DELETE FROM online WHERE sessionID=?`, [sessionID]);
    db.query(`DELETE FROM offline WHERE sessionID=?`, [sessionID]);

    console.log("hello");
    db.query(
      `DELETE FROM session WHERE sessionID=?`,
      [sessionID],
      err => err ? reject(err) : resolve()
    );
  });
};

/* ================= GET ALL SESSION IDS ================= */
const getAllSessionID = async () => {
  const [rows] = await db.query(`SELECT sessionID FROM session`);
  return rows;
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  getSessionDetailsByID,
  getAllSessionID
};
