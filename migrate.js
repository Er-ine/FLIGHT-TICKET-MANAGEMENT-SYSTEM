require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        multipleStatements: true
    });

    console.log('Connected.');

    const [rows] = await connection.query('SELECT COUNT(*) AS count FROM PASSENGER');
    console.log('Current passenger count:', rows[0].count);

    if (rows[0].count === 0) {
        console.log('No data found. Loading sample data...');
        const data = fs.readFileSync('./sample_data.sql', 'utf8');
        await connection.query(data);
        console.log('Sample data loaded successfully!');
    } else {
        console.log('Data already exists, skipping insert.');
    }

    await connection.end();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
});