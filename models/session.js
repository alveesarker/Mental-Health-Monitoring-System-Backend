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

const request = async ({
  patientID,
  counsellorID,
  sessionType,
  status,
}) => {
  try {
    const sql = `
      INSERT INTO session
      (patientID, counsellorID, sessionType, status)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      patientID,
      counsellorID,
      sessionType.toLowerCase(),
      status,
    ]);

    return { sessionID: result.insertId };
  } catch (err) {
    console.error("REQUEST SESSION MODEL ERROR:", err);
    throw err;
  }
};


/* ================= GET ALL SESSIONS BY PATIENT ================= */
const getAllSessionsByPatientID = async (patientID) => {
  const q = `
    SELECT
      s.sessionID,
      s.sessionDate,
      s.sessionTime,
      s.status,
      u.name AS counsellorName
    FROM session s
    LEFT JOIN user_t u 
      ON s.counsellorID = u.userID
    WHERE s.patientID = ?
    ORDER BY s.sessionDate DESC, s.sessionTime DESC
  `;

  const [rows] = await db.query(q, [patientID]);
  return rows;
};

/* ================= GET ALL SESSIONS BY PATIENT ================= */
const getAllSessionsByCounsellorID = async (counsellorID) => {
console.log(counsellorID);
  const q = `
    SELECT
      s.sessionID,
      s.sessionDate,
      s.sessionTime,
      s.status,
      p.name AS counsellorName
    FROM session s
    LEFT JOIN user_t p
      ON s.patientID = p.userID
    WHERE s.counsellorID = ?
    ORDER BY s.sessionDate DESC, s.sessionTime DESC
  `;

  const [rows] = await db.query(q, [counsellorID]);
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
/* ================= GET SESSION DETAILS WITH RATING ================= */
const getSessionDetailsByID = async (sessionID) => {
  const sql = `
  SELECT 
    s.sessionID,
    s.sessionDate,
    s.sessionTime,
    s.duration,
    s.status,
    s.sessionType,

    p.name AS patientName,
    c.name AS counsellorName,

    -- Rating
    r.rating,
    r.comfortLevel,
    r.clarityLevel,
    r.comment AS ratingComment,

    -- Progress
    sp.stressLevel,
    sp.depressionLevel,
    sp.workPerformance,
    sp.energyLevel,
    sp.fatigueLevel,
    sp.note

  FROM session s
  LEFT JOIN user_t p ON s.patientID = p.userID
  LEFT JOIN user_t c ON s.counsellorID = c.userID
  LEFT JOIN rating r ON s.sessionID = r.sessionID
  LEFT JOIN progress sp ON s.sessionID = sp.sessionID
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

    db.query(
      `DELETE FROM session WHERE sessionID=?`,
      [sessionID],
      err => err ? reject(err) : resolve()
    );
  });
};

/* ================= GET PENDING SESSIONS BY PATIENT ================= */
const getPendingSessionsByPatientID = async (patientID) => {
  const q = `
    SELECT 
      s.*,
      c.name AS counsellorName,
      o.link,
      f.counsellingCenter,
      f.roomNumber
    FROM session s
    LEFT JOIN user_t c ON s.counsellorID = c.userID
    LEFT JOIN online o ON s.sessionID = o.sessionID
    LEFT JOIN offline f ON s.sessionID = f.sessionID
    WHERE s.patientID = ?
      AND s.status = 'pending'
    ORDER BY s.sessionDate ASC, s.sessionTime ASC
  `;

  const [rows] = await db.query(q, [patientID]);
  return rows;
};


const getPendingSessionsByCounsellorID = async (counsellorID) => {
  const q = `
    SELECT 
      s.*,
      p.name AS counsellorName,
      o.link,
      f.counsellingCenter,
      f.roomNumber
    FROM session s
    LEFT JOIN user_t p ON s.patientID = p.userID
    LEFT JOIN online o ON s.sessionID = o.sessionID
    LEFT JOIN offline f ON s.sessionID = f.sessionID
    WHERE s.counsellorID = ?
      AND s.status = 'pending'
    ORDER BY s.sessionDate ASC, s.sessionTime ASC
  `;

  const [rows] = await db.query(q, [counsellorID]);
  return rows;
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
  getAllSessionID,
  getPendingSessionsByPatientID,
  getAllSessionsByPatientID,
  request,
  getPendingSessionsByCounsellorID,
  getAllSessionsByCounsellorID
};
