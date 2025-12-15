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
    const { name, email, contactNumber, password, yearOfExperience, availability } = data;

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insert into user_t
        const [userResult] = await conn.query(
            `INSERT INTO user_t (name, email, contactNumber, role, password)
       VALUES (?, ?, ?, 'counsellor', ?)`,
            [name, email, contactNumber, password]
        );

        const userID = userResult.insertId;

        // 2. Insert into counsellor
        await conn.query(
            `INSERT INTO counsellor (counsellorID, email, yearOfExperience, availability)
       VALUES (?, ?, ?, ?)`,
            [userID, email, yearOfExperience, availability]
        );

        await conn.commit();
        return userID;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

/* ================= UPDATE COUNSELLOR ================= */
exports.updateCounsellor = async (id, data) => {
    const { name, email, contactNumber, password, yearOfExperience, availability } = data;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Update user_t
        const fields = [];
        const values = [];

        if (name) { fields.push("name=?"); values.push(name); }
        if (email) { fields.push("email=?"); values.push(email); }
        if (contactNumber) { fields.push("contactNumber=?"); values.push(contactNumber); }
        if (password) { fields.push("password=?"); values.push(password); }

        if (fields.length > 0) {
            values.push(id);
            await conn.query(`UPDATE user_t SET ${fields.join(", ")} WHERE userID=?`, values);
        }

        // Update counsellor table
        const cFields = [];
        const cValues = [];

        if (email) { cFields.push("email=?"); cValues.push(email); }
        if (yearOfExperience !== undefined) { cFields.push("yearOfExperience=?"); cValues.push(yearOfExperience); }
        if (availability) { cFields.push("availability=?"); cValues.push(availability); }

        if (cFields.length > 0) {
            cValues.push(id);
            await conn.query(`UPDATE counsellor SET ${cFields.join(", ")} WHERE counsellorID=?`, cValues);
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

        // Delete from counsellor table first
        await conn.query("DELETE FROM counsellor WHERE counsellorID=?", [id]);
        // Delete from user_t
        await conn.query("DELETE FROM user_t WHERE userID=?", [id]);

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
    SELECT c.counsellorID, u.name, u.email, u.contactNumber, c.yearOfExperience, c.availability
    FROM counsellor c
    JOIN user_t u ON c.counsellorID = u.userID
  `);
    return rows;
};

/* ================= GET COUNSELLOR DETAILS BY ID ================= */
exports.getCounsellorDetails = async (id) => {
    const [rows] = await db.query(`
    SELECT c.counsellorID, u.name, c.email, c.yearOfExperience, c.availability
    FROM counsellor c
    JOIN user_t u ON c.counsellorID = u.userID
    WHERE c.counsellorID=?
  `, [id]);

    return rows[0];
};
