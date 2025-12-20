const db = require("../db");

const AdminDashboardModel = {

    getStats: async () => {
        const [[users]] = await db.query("SELECT COUNT(*) total FROM user_t");
        const [[patients]] = await db.query("SELECT COUNT(*) total FROM patient");
        const [[counsellors]] = await db.query("SELECT COUNT(*) total FROM counsellor");
        const [[sessions]] = await db.query(
            "SELECT COUNT(*) total FROM session WHERE status='Pending'"
        );
        const [[alerts]] = await db.query(
            "SELECT COUNT(*) total FROM crisisalert WHERE status IN ('Pending','In Progress')"
        );

        return {
            totalUsers: users.total,
            totalPatients: patients.total,
            totalCounsellors: counsellors.total,
            pendingSessions: sessions.total,
            activeAlerts: alerts.total
        };
    },

    getRecentActivity: async () => {
        const [sessions] = await db.query(`
      SELECT 
        'session' AS type,
        CONCAT('Session with ', u.name) AS title,
        s.sessionDate AS time
      FROM session s
      JOIN user_t u ON s.patientID = u.userID
      ORDER BY s.sessionDate DESC
      LIMIT 3
    `);

        const [alerts] = await db.query(`
      SELECT 
        'alert' AS type,
        CONCAT('Crisis Alert for Patient ', p.patientID) AS title,
        c.timestamp AS time
      FROM crisisalert c
      JOIN patient p ON c.patientID = p.patientID
      ORDER BY c.timestamp DESC
      LIMIT 3
    `);

        return [...alerts, ...sessions].slice(0, 5);
    }

};

module.exports = AdminDashboardModel;
