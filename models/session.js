const db = require("../config/db");

const getAll = async () => {
  const q = `
    SELECT 
      s.*,
      p.name AS pname,
      c.name AS cname,
      o.link AS onlineLink,
      f.counsellingCenter,
      f.roomNumber
    FROM session s
    LEFT JOIN patient p ON s.patientID = p.patientID
    LEFT JOIN counsellor c ON s.counsellorID = c.counsellorID
    LEFT JOIN online o ON s.sessionID = o.sessionID
    LEFT JOIN offline f ON s.sessionID = f.sessionID
  `;

  const [rows] = await db.query(q);

  return rows.map(r => {
    if (r.onlineLink) {
      return {
        ...r,
        sessionType: "online",
        link: r.onlineLink
      };
    } else {
      return {
        ...r,
        sessionType: "offline",
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

// UPDATE SESSION
const update = (sessionID, sessionData, typeData, type) => {
    const { sessionDate, status, duration, sessionTime } = sessionData;

    const q = `
      UPDATE session 
      SET sessionDate=?, status=?, duration=?, sessionTime=? 
      WHERE sessionID=?
    `;

    // Update main table
    db.query(q, [sessionDate, status, duration, sessionTime, sessionID], (err) => {
      if (err) return reject(err);

      // Delete existing type rows safely
      db.query(`DELETE FROM online WHERE sessionID=?`, [sessionID], (err) => {
        if (err) return reject(err);

        db.query(`DELETE FROM offline WHERE sessionID=?`, [sessionID], (err) => {
          if (err) return reject(err);

          // Insert new type record
          if (type === "online") {
            if (!typeData.link) return reject(new Error("Missing link"));

            return db.query(
              `INSERT INTO online(sessionID, link) VALUES (?, ?)`,
              [sessionID, typeData.link],
              (err) => (err ? reject(err) : resolve())
            );
          }

          if (!typeData.counsellingCenter || !typeData.roomNumber) {
            return reject(new Error("Missing offline data"));
          }

          return db.query(
            `INSERT INTO offline(sessionID, counsellingCenter, roomNumber) VALUES (?, ?, ?)`,
            [sessionID, typeData.counsellingCenter, typeData.roomNumber],
            (err) => (err ? reject(err) : resolve())
          );
        });
      });
    });
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
