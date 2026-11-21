const { pool } = require('../config/db');

const baseSelect = `
  SELECT u.id, u.name, u.email, d.specialty, d.bmdc_number,
         d.experience_years, d.bio, d.fee, d.status, d.created_at
  FROM doctors d
  JOIN users u ON u.id = d.user_id
`;

const listVerified = async (specialty) => {
  const result = await pool.query(
    `${baseSelect}
     WHERE d.status = 'verified' AND ($1::text IS NULL OR d.specialty ILIKE $1)
     ORDER BY u.name`,
    [specialty ? `%${specialty}%` : null]
  );
  return result.rows;
};

const findByUserId = async (userId) => {
  const result = await pool.query(`${baseSelect} WHERE d.user_id = $1`, [userId]);
  return result.rows[0];
};

const findVerified = async (userId) => {
  const result = await pool.query(
    `${baseSelect} WHERE d.user_id = $1 AND d.status = 'verified'`,
    [userId]
  );
  return result.rows[0];
};

const updateProfile = async (userId, { specialty, experienceYears, bio, fee }) => {
  await pool.query(
    `UPDATE doctors
     SET specialty = $2, experience_years = $3, bio = $4, fee = $5
     WHERE user_id = $1`,
    [userId, specialty, experienceYears, bio, fee]
  );
  return findByUserId(userId);
};

const listByStatus = async (status) => {
  const result = await pool.query(
    `${baseSelect}
     WHERE ($1::text IS NULL OR d.status = $1)
     ORDER BY d.created_at DESC`,
    [status]
  );
  return result.rows;
};

const setStatus = async (userId, status) => {
  const result = await pool.query(
    'UPDATE doctors SET status = $2 WHERE user_id = $1 RETURNING user_id',
    [userId, status]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return findByUserId(userId);
};

module.exports = {
  listVerified,
  findByUserId,
  findVerified,
  updateProfile,
  listByStatus,
  setStatus,
};