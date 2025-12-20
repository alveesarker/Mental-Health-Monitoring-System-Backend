const db = require("../db");

/* ================= GET ALL COUNSELLOR NAMES ================= */
exports.getAllCounsellorsName = async () => {
    const [rows] = await db.query(
        `SELECT c.counsellorID, u.name 
     FROM counsellor c 
     JOIN user_t u ON c.counsellorID = u.userID`
    );
    return rows;
};

/* ================= ADD COUNSELLOR ================= */
exports.insertCounsellor = async (data) => {
    const {
        counsellor,
        specializations = [],
        qualifications = [],
        schedule = []
    } = data;

    const {
        name,
        email,
        contactNumber,
        yearOfExperience,
        availability,
        street,
        city,
        postalCode,
        password
    } = counsellor;

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // user_t
        const [userRes] = await conn.query(
            `INSERT INTO user_t 
       (name, email, contactNumber, street, city, postalCode, password, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'counsellor')`,
            [name, email, contactNumber, street, city, postalCode, password]
        );

        const counsellorID = userRes.insertId;

        // counsellor
        await conn.query(
            `INSERT INTO counsellor (counsellorID, yearOfExperience, availability)
       VALUES (?, ?, ?)`,
            [counsellorID, yearOfExperience, availability]
        );

        // specializations
        for (const s of specializations) {
            await conn.query(
                `INSERT INTO counsellor_specialization (counsellorID, specialization)
         VALUES (?, ?)`,
                [counsellorID, s]
            );
        }

        // qualifications
        for (const q of qualifications) {
            await conn.query(
                `INSERT INTO counsellor_qualification
         (counsellorID, qualificationName, institutionName, startDate, completionDate)
         VALUES (?, ?, ?, ?, ?)`,
                [counsellorID, q.name, q.institution, q.start, q.end]
            );
        }

        // schedule
        for (const s of schedule) {
            await conn.query(
                `INSERT INTO counsellor_schedule
         (counsellorID, day, startTime, endTime, mode)
         VALUES (?, ?, ?, ?, ?)`,
                [counsellorID, s.day, s.startTime, s.endTime, s.mode]
            );
        }

        await conn.commit();
        return counsellorID;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};


/* ================= UPDATE COUNSELLOR ================= */
exports.updateCounsellor = async (id, data) => {
    const {
        counsellor,
        specializations = [],
        qualifications = [],
        schedule = []
    } = data;

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // update user_t
        await conn.query(
            `UPDATE user_t
       SET name=?, email=?, contactNumber=?, street=?, city=?, postalCode=?, password=?
       WHERE userID=?`,
            [
                counsellor.name,
                counsellor.email,
                counsellor.contactNumber,
                counsellor.street,
                counsellor.city,
                counsellor.postalCode,
                counsellor.password,
                id
            ]
        );

        // update counsellor
        await conn.query(
            `UPDATE counsellor
       SET yearOfExperience=?, availability=?
       WHERE counsellorID=?`,
            [counsellor.yearOfExperience, counsellor.availability, id]
        );

        // delete old children
        await conn.query(`DELETE FROM counsellor_specialization WHERE counsellorID=?`, [id]);
        await conn.query(`DELETE FROM counsellor_qualification WHERE counsellorID=?`, [id]);
        await conn.query(`DELETE FROM counsellor_schedule WHERE counsellorID=?`, [id]);

        // reinsert
        for (const s of specializations) {
            await conn.query(
                `INSERT INTO counsellor_specialization VALUES (?, ?)`,
                [id, s]
            );
        }

        for (const q of qualifications) {
            await conn.query(
                `INSERT INTO counsellor_qualification
         VALUES (?, ?, ?, ?, ?)`,
                [id, q.name, q.institution, q.start, q.end]
            );
        }

        for (const s of schedule) {
            await conn.query(
                `INSERT INTO counsellor_schedule
         VALUES (?, ?, ?, ?, ?)`,
                [id, s.day, s.startTime, s.endTime, s.mode]
            );
        }

        await conn.commit();
        return true;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};


/* ================= DELETE COUNSELLOR ================= */
exports.deleteCounsellor = async (id) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(`DELETE FROM counsellor_schedule WHERE counsellorID=?`, [id]);
        await conn.query(`DELETE FROM counsellor_qualification WHERE counsellorID=?`, [id]);
        await conn.query(`DELETE FROM counsellor_specialization WHERE counsellorID=?`, [id]);
        await conn.query(`DELETE FROM counsellor WHERE counsellorID=?`, [id]);
        await conn.query(`DELETE FROM user_t WHERE userID=?`, [id]);

        await conn.commit();
        return true;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};


/* ================= GET ALL COUNSELLORS ================= */
exports.getCounsellorMain = async () => {
    const [rows] = await db.query(`
    SELECT 
      c.counsellorID,
      u.name,
      u.email,
      u.contactNumber,
      u.street,
      u.city,
      u.postalCode,
      u.password,
      c.yearOfExperience,
      c.availability
    FROM counsellor c
    JOIN user_t u ON u.userID = c.counsellorID
  `);
    return rows;
};


/* ================= GET COUNSELLOR DETAILS BY ID ================= */
exports.getCounsellorDetails = async (id) => {
    const [[main]] = await db.query(`
    SELECT 
      c.counsellorID,
      u.name,
      u.email,
      u.contactNumber,
      u.street,
      u.city,
      u.postalCode,
      u.password,
      c.yearOfExperience,
      c.availability
    FROM counsellor c
    JOIN user_t u ON u.userID = c.counsellorID
    WHERE c.counsellorID=?
  `, [id]);

    const [specializations] = await db.query(
        `SELECT specialization FROM counsellor_specialization WHERE counsellorID=?`,
        [id]
    );

    const [qualifications] = await db.query(
        `SELECT qualificationName, institutionName, startDate, completionDate
     FROM counsellor_qualification WHERE counsellorID=?`,
        [id]
    );

    const [schedule] = await db.query(
        `SELECT day, startTime, endTime, mode
     FROM counsellor_schedule WHERE counsellorID=?`,
        [id]
    );

    return {
        main,
        specializations,
        qualifications,
        schedule
    };
};

