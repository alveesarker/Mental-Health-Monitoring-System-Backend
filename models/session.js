const db = require("../db");

const getAll = async () => {
  console.log("Hello");
  const q = `
    SELECT 
      s.*,
      p.name AS pname,
      c.name AS cname,
      o.link AS onlineLink,
      f.counsellingCenter,
      f.roomNumber
    FROM session s
    LEFT JOIN user_t p ON s.patientID = p.userID
    LEFT JOIN user_t c ON s.counsellorID = c.userID
    LEFT JOIN online o ON s.sessionID = o.sessionID
    LEFT JOIN offline f ON s.sessionID = f.sessionID
  `;

  const [rows] = await db.query(q);
console.log("h2");
  return rows.map(r => {
    if (r.onlineLink) {
      return {
        ...r,
        link: r.onlineLink
      };
    } else {
      return {
        ...r,
        counsellingCenter: r.counsellingCenter,
        roomNumber: r.roomNumber
      };
    }
  });
};


// CREATE SESSION
const create = (sessionData, typeData, type) => {
  const { sessionDate, status, duration, patientID, counsellorID, sessionTime } = sessionData;

  const insertSession = `
      INSERT INTO session(sessionDate, status, duration, patientID, counsellorID, sessionTime)
      VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    insertSession,
    [sessionDate, status, duration, patientID, counsellorID, sessionTime],
    (err, res1) => {
      if (err) return reject(err);

      const sessionID = res1.insertId;

      if (type === "online") {
        db.query(
          `INSERT INTO online(sessionID, link) VALUES (?, ?)`,
          [sessionID, typeData.link],
          err => err ? reject(err) : resolve({ sessionID })
        );
      } else {
        db.query(
          `INSERT INTO offline(sessionID, counsellingCenter, roomNumber) VALUES (?, ?, ?)`,
          [sessionID, typeData.counsellingCenter, typeData.roomNumber],
          err => err ? reject(err) : resolve({ sessionID })
        );
      }
    }
  );
};

// UPDATE SESSION (Corrected)
const update = async (sessionID, sessionData, typeData, type) => {
  const { sessionDate, status, duration, sessionTime } = sessionData;

  try {

    console.log(status);
    await db.query(
      `UPDATE session 
       SET sessionDate=?, status=?, duration=?, sessionTime=?, sessionType=?
       WHERE sessionID=?`,
      [sessionDate, status, duration, sessionTime, type, sessionID]
    );

    // Delete old types
    await db.query(`DELETE FROM online WHERE sessionID=?`, [sessionID]);
    await db.query(`DELETE FROM offline WHERE sessionID=?`, [sessionID]);

    // Insert new type
    if (type === "online") {
      if (!typeData.link) throw new Error("Missing link");

      await db.query(
        `INSERT INTO online(sessionID, link) VALUES (?, ?)`,
        [sessionID, typeData.link]
      );
    } else {
      if (!typeData.counsellingCenter || !typeData.roomNumber)
        throw new Error("Missing offline data");

      await db.query(
        `INSERT INTO offline(sessionID, counsellingCenter, roomNumber) VALUES (?, ?, ?)`,
        [
          sessionID,
          typeData.counsellingCenter,
          typeData.roomNumber,
        ]
      );
    }

    return true;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};


const getSessionDetailsByID = async (sessionID) => {
  const sql = `
    SELECT 
      s.sessionID, s.sessionDate, s.sessionTime, s.status, s.duration, s.sessionType,
      p.*, 
      r.rating, r.comfortLevel, r.clarityLevel, r.comment AS ratingComment,
      u.name AS patientName,
      c.name AS counsellorName
    FROM session s
    LEFT JOIN progress p ON s.sessionID = p.sessionID
    LEFT JOIN rating r ON s.sessionID = r.sessionID
    LEFT JOIN patient u ON s.patientID = u.patientID
    LEFT JOIN counsellor c ON s.counsellorID = c.counsellorID
    WHERE s.sessionID = ?;
  `;

  const [rows] = await db.query(sql, [sessionID]);
  return rows;
};

// DELETE
const remove = (sessionID) => {
  db.query(`DELETE FROM online WHERE sessionID=?`, [sessionID]);
  db.query(`DELETE FROM offline WHERE sessionID=?`, [sessionID]);

  db.query(
    `DELETE FROM session WHERE sessionID=?`,
    [sessionID],
    err => err ? reject(err) : resolve()
  );
};

module.exports = { getAll, create, update, remove, getSessionDetailsByID };
