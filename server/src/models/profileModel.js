const { pool } = require('../config/db');

const columns = 'id, name, relation, birth_year, sex, is_self';

const findOwned = async (profileId, userId) => {
  const result = await pool.query(
    `SELECT ${columns} FROM profiles WHERE id = $1 AND user_id = $2`,
    [profileId, userId]
  );
  return result.rows[0];
};

const listByUser = async (userId) => {
  const result = await pool.query(
    `SELECT ${columns} FROM profiles WHERE user_id = $1 ORDER BY is_self DESC, id`,
    [userId]
  );
  return result.rows;
};

const countByUser = async (userId) => {
  const result = await pool.query(
    'SELECT count(*)::int AS total FROM profiles WHERE user_id = $1',
    [userId]
  );
  return result.rows[0].total;
};

const create = async ({ userId, name, relation, birthYear, sex }) => {
  const result = await pool.query(
    `INSERT INTO profiles (user_id, name, relation, birth_year, sex, is_self)
     VALUES ($1, $2, $3, $4, $5, FALSE)
     RETURNING ${columns}`,
    [userId, name, relation, birthYear, sex]
  );
  return result.rows[0];
};

const update = async ({ id, userId, name, relation, birthYear, sex }) => {
  const result = await pool.query(
    `UPDATE profiles
     SET name = $1, relation = $2, birth_year = $3, sex = $4
     WHERE id = $5 AND user_id = $6
     RETURNING ${columns}`,
    [name, relation, birthYear, sex, id, userId]
  );
  return result.rows[0];
};

const removeOther = async (id, userId) => {
  const result = await pool.query(
    'DELETE FROM profiles WHERE id = $1 AND user_id = $2 AND is_self = FALSE RETURNING id',
    [id, userId]
  );
  return result.rowCount > 0;
};

module.exports = {
  findOwned,
  listByUser,
  countByUser,
  create,
  update,
  removeOther,
};