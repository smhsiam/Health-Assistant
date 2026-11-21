require('dotenv').config();
const { pool } = require('../config/db');

const run = async () => {
  const email = String(process.argv[2] || '').trim().toLowerCase();

  if (!email) {
    console.log('Give the email of the account');
    process.exit(1);
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, name, email, role",
      [email]
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