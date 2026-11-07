require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Database error:', err.message);
});

const testConnection = async () => {
  const result = await pool.query('SELECT NOW()');
  console.log('Database connected at', result.rows[0].now);
};

module.exports = { pool, testConnection };