const { pool } = require('../config/db');

const findByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const createWithProfile = async (name, email, passwordHash) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name, email, passwordHash]
    );
    const user = userResult.rows[0];

    await client.query(
      'INSERT INTO profiles (user_id, name, relation, is_self) VALUES ($1, $2, $3, TRUE)',
      [user.id, name, 'self']
    );

    await client.query('COMMIT');
    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const createDoctor = async ({
  name,
  email,
  passwordHash,
  specialty,
  bmdcNumber,
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'doctor') RETURNING id, name, email, role",
      [name, email, passwordHash]
    );
    const user = userResult.rows[0];

    await client.query(
      'INSERT INTO doctors (user_id, specialty, bmdc_number) VALUES ($1, $2, $3)',
      [user.id, specialty, bmdcNumber]
    );

    await client.query('COMMIT');
    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { findByEmail, findById, createWithProfile, createDoctor };