// models/counsellorModels.js
const db = require("../config/db");


exports.getAllCounsellorsName = async () => {
  const [rows] = await db.query(
    "SELECT counsellorID, name FROM counsellor"
  );
  return rows;
};

// INSERT COUNSELLOR (main + sub tables)
exports.insertCounsellor = async (data) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const {
            counsellor,
            specializations,
            qualifications,
            schedule
        } = data;

        // Insert into Counsellor
        const [mainResult] = await conn.query(
            `INSERT INTO Counsellor 
            (name, email, yearOfExperience, contactNumber, availability, street, city, postalCode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                counsellor.name,
                counsellor.email,
                counsellor.yearOfExperience,
                counsellor.contactNumber,
                counsellor.availability,
                counsellor.street,
                counsellor.city,
                counsellor.postalCode
            ]
        );

        const counsellorID = mainResult.insertId;

        // Insert Specializations
        for (let sp of specializations) {
            await conn.query(
                `INSERT INTO Counsellor_Specialization (counsellorID, specialization)
                 VALUES (?, ?)`,
                [counsellorID, sp]
            );
        }

        // Insert Qualifications
        for (let q of qualifications) {
            await conn.query(
                `INSERT INTO Counsellor_Qualification 
                (counsellorID, qualificationName, institutionName, startDate, completionDate)
                VALUES (?, ?, ?, ?, ?)`,
                [counsellorID, q.name, q.institution, q.start, q.end]
            );
        }

        // Insert Schedule
        for (let s of schedule) {
            await conn.query(
                `INSERT INTO Counsellor_Schedule
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



// PARTIAL UPDATE
exports.updateCounsellor = async (id, data) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { counsellor, specializations, qualifications, schedule } = data;

        // -------------------------------
        // 1️⃣ UPDATE MAIN COUNSELLOR DATA (Partial)
        // -------------------------------
        if (counsellor && Object.keys(counsellor).length > 0) {
            const fields = [];
            const values = [];

            for (let key in counsellor) {
                fields.push(`${key}=?`);
                values.push(counsellor[key]);
            }
            values.push(id);

            await conn.query(
                `UPDATE Counsellor SET ${fields.join(", ")} WHERE counsellorID=?`,
                values
            );
        }

        // -------------------------------
        // 2️⃣ UPDATE SPECIALIZATIONS (Optional)
        // -------------------------------
        if (specializations) {
            await conn.query(
                "DELETE FROM Counsellor_Specialization WHERE counsellorID=?",
                [id]
            );

            for (let sp of specializations) {
                await conn.query(
                    `INSERT INTO Counsellor_Specialization (counsellorID, specialization)
                     VALUES (?, ?)`,
                    [id, sp]
                );
            }
        }

        // -------------------------------
        // 3️⃣ UPDATE QUALIFICATIONS (Optional)
        // -------------------------------
        if (qualifications) {
            await conn.query(
                "DELETE FROM Counsellor_Qualification WHERE counsellorID=?",
                [id]
            );

            for (let q of qualifications) {
                await conn.query(
                    `INSERT INTO Counsellor_Qualification
                    (counsellorID, qualificationName, institutionName, startDate, completionDate)
                    VALUES (?, ?, ?, ?, ?)`,
                    [id, q.name, q.institution, q.start, q.end]
                );
            }
        }

        // -------------------------------
        // 4️⃣ UPDATE SCHEDULE (Optional)
        // -------------------------------
        if (schedule) {
            await conn.query(
                "DELETE FROM Counsellor_Schedule WHERE counsellorID=?",
                [id]
            );

            for (let s of schedule) {
                await conn.query(
                    `INSERT INTO Counsellor_Schedule
                    (counsellorID, day, startTime, endTime, mode)
                    VALUES (?, ?, ?, ?, ?)`,
                    [id, s.day, s.startTime, s.endTime, s.mode]
                );
            }
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


// DELETE COUNSELLOR (cascade manually)
exports.deleteCounsellor = async (id) => {
    await db.query("DELETE FROM Counsellor_Specialization WHERE counsellorID=?", [id]);
    await db.query("DELETE FROM Counsellor_Qualification WHERE counsellorID=?", [id]);
    await db.query("DELETE FROM Counsellor_Schedule WHERE counsellorID=?", [id]);
    await db.query("DELETE FROM Counsellor WHERE counsellorID=?", [id]);
};


// READ MAIN INFO (only basic data)
exports.getCounsellorMain = async () => {
    const [rows] = await db.query(
        `SELECT * FROM Counsellor`
    );
    return rows;
};

// READ FULL INFO (specialization, qualification, schedule)
exports.getCounsellorDetails = async (id) => {
    const [specializations] = await db.query(
        `SELECT specialization FROM Counsellor_Specialization WHERE counsellorID=?`,
        [id]
    );

    const [qualifications] = await db.query(
        `SELECT qualificationName, institutionName, startDate, completionDate
         FROM Counsellor_Qualification WHERE counsellorID=?`,
        [id]
    );

    const [schedule] = await db.query(
        `SELECT day, startTime, endTime, mode
         FROM Counsellor_Schedule WHERE counsellorID=?`,
        [id]
    );

    return { specializations, qualifications, schedule };
};
