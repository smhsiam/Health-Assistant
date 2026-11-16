const { pool } = require('../config/db');

const listByReport = async (reportId) => {
  const result = await pool.query(
    'SELECT * FROM report_values WHERE report_id = $1 ORDER BY id',
    [reportId]
  );
  return result.rows;
};

const listForTrends = async (userId, profileId) => {
  const result = await pool.query(
    `SELECT v.id, v.report_id, v.test_name, v.value, v.unit, v.ref_low, v.ref_high,
            v.flag, v.is_critical,
            to_char(COALESCE(r.report_date, r.created_at::date), 'YYYY-MM-DD') AS point_date
     FROM report_values v
     JOIN reports r ON r.id = v.report_id
     WHERE r.user_id = $1 AND r.profile_id = $2
     ORDER BY COALESCE(r.report_date, r.created_at::date), r.id, v.id`,
    [userId, profileId]
  );
  return result.rows;
};

const findInReport = async (reportId, valueId) => {
  const result = await pool.query(
    'SELECT * FROM report_values WHERE id = $1 AND report_id = $2',
    [valueId, reportId]
  );
  return result.rows[0];
};

const applyCorrection = async ({
  reportId,
  valueId,
  value,
  unit,
  refLow,
  refHigh,
  flag,
  isCritical,
  isCorrected,
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updated = await client.query(
      `UPDATE report_values
       SET value = $1, unit = $2, ref_low = $3, ref_high = $4, flag = $5,
           is_critical = $6, needs_review = FALSE, is_corrected = $7
       WHERE id = $8 AND report_id = $9
       RETURNING id`,
      [value, unit, refLow, refHigh, flag, isCritical, isCorrected, valueId, reportId]
    );

    if (updated.rowCount === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    await client.query(
      `UPDATE reports
       SET has_critical = EXISTS (
         SELECT 1 FROM report_values WHERE report_id = $1 AND is_critical
       )
       WHERE id = $1`,
      [reportId]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { listByReport, listForTrends, findInReport, applyCorrection };