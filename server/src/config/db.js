require('dotenv').config();
const { Pool } = require('pg');

const useSsl = String(process.env.DATABASE_SSL || '').toLowerCase() === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX) || 5,
});

pool.on('error', (err) => {
  console.error('Database error:', err.message);
});

const testConnection = async () => {
  const result = await pool.query('SELECT NOW()');
  console.log('Database connected at', result.rows[0].now);
};

module.exports = { pool, testConnection };