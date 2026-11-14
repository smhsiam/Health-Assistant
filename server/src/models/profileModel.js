const { pool } = require('../config/db');

const findOwned = async (profileId, userId) => {
  const result = await pool.query(
    'SELECT id, name, relation, birth_year, sex, is_self FROM profiles WHERE id = $1 AND user_id = $2',
    [profileId, userId]
  );
  return result.rows[0];
};

module.exports = { findOwned };