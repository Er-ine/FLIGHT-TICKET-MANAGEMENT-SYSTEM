const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "TRAVEL_AGENCY",
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;