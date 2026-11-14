const { pool } = require('../config/db');

const listByReport = async (reportId) => {
  const result = await pool.query(
    'SELECT * FROM report_values WHERE report_id = $1 ORDER BY id',
    [reportId]
  );
  return result.rows;
};

module.exports = { listByReport };