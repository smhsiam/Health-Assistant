require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const run = async () => {
  const email = String(process.argv[2] || '').trim().toLowerCase();
  const password = String(process.env.NEW_PASSWORD || '');

  if (!email || !password) {
    console.log('Give the email and set NEW_PASSWORD');
    await pool.end();
    return;
  }

  const strong =
    password.length >= 8 &&
    password.length <= 72 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);

  if (!strong) {
    console.log('Use 8 to 72 characters with at least one letter and one number');
    await pool.end();
    return;
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, name, email, role',
      [hash, email]
    );

    console.log(
      result.rowCount
        ? JSON.stringify(result.rows[0])
        : 'No account found with this email'
    );
  } catch (error) {
    console.log('Failed:', error.message);
  } finally {
    await pool.end();
  }
};

run();