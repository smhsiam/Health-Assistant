const { pool } = require('../config/db');

const createWithValues = async ({
  userId,
  profileId,
  fileName,
  reportDate,
  hasCritical,
  values,
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reportResult = await client.query(
      `INSERT INTO reports (user_id, profile_id, file_name, report_date, has_critical, status)
       VALUES ($1, $2, $3, $4, $5, 'completed')
       RETURNING id, profile_id, file_name,
                 to_char(report_date, 'YYYY-MM-DD') AS report_date,
                 has_critical, status, created_at`,
      [userId, profileId, fileName, reportDate, hasCritical]
    );
    const report = reportResult.rows[0];

    const saved = [];

    for (const item of values) {
      const valueResult = await client.query(
        `INSERT INTO report_values
           (report_id, test_name, value, unit, ref_low, ref_high, flag, is_critical, confidence, needs_review)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          report.id,
          item.testName,
          item.value,
          item.unit,
          item.refLow,
          item.refHigh,
          item.flag,
          item.isCritical,
          item.confidence,
          item.needsReview,
        ]
      );
      saved.push(valueResult.rows[0]);
    }

    await client.query('COMMIT');
    return { report, values: saved };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const findOwned = async (reportId, userId) => {
  const result = await pool.query(
    `SELECT id, profile_id, file_name,
            to_char(report_date, 'YYYY-MM-DD') AS report_date,
            has_critical, status, created_at
     FROM reports
     WHERE id = $1 AND user_id = $2`,
    [reportId, userId]
  );
  return result.rows[0];
};

const listByUser = async (userId, profileId) => {
  const result = await pool.query(
    `SELECT r.id, r.profile_id, r.file_name,
            to_char(r.report_date, 'YYYY-MM-DD') AS report_date,
            r.has_critical, r.status, r.created_at,
            count(v.id) AS value_count,
            count(v.id) FILTER (WHERE v.flag IN ('high', 'low')) AS abnormal_count
     FROM reports r
     LEFT JOIN report_values v ON v.report_id = r.id
     WHERE r.user_id = $1 AND ($2::integer IS NULL OR r.profile_id = $2)
     GROUP BY r.id
     ORDER BY COALESCE(r.report_date, r.created_at::date) DESC, r.id DESC`,
    [userId, profileId]
  );
  return result.rows;
};

module.exports = { createWithValues, findOwned, listByUser };