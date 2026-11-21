require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const run = async () => {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.log('Give at least one SQL file path');
    process.exit(1);
  }

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.resolve(file), 'utf8');
      await pool.query(sql);
      console.log(`Ran ${file}`);
    }

    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('Tables:', tables.rows.map((row) => row.table_name).join(', '));

    const roles = await pool.query(
      'SELECT role, count(*) AS total FROM users GROUP BY role'
    );
    console.log('Roles:', JSON.stringify(roles.rows));
  } catch (error) {
    console.log('Failed:', error.message);
  } finally {
    await pool.end();
  }
};

run();