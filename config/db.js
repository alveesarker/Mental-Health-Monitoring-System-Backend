// db.js
const mysql = require('mysql2/promise');  // <-- note the /promise

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mental_health_monitoring_system',
    port: 3306
});

module.exports = db;
