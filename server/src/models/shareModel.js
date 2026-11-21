const { pool } = require('../config/db');

const createShare = async (reportId, doctorId) => {
  const result = await pool.query(
    `INSERT INTO report_shares (report_id, doctor_id)
     VALUES ($1, $2)
     RETURNING id, report_id, doctor_id, shared_at`,
    [reportId, doctorId]
  );
  return result.rows[0];
};

const listForReport = async (reportId) => {
  const result = await pool.query(
    `SELECT s.id, s.doctor_id, u.name, d.specialty, s.shared_at
     FROM report_shares s
     JOIN users u ON u.id = s.doctor_id
     JOIN doctors d ON d.user_id = s.doctor_id
     WHERE s.report_id = $1 AND s.revoked_at IS NULL
     ORDER BY s.shared_at DESC`,
    [reportId]
  );
  return result.rows;
};

const revokeOwned = async (shareId, userId) => {
  const result = await pool.query(
    `UPDATE report_shares AS s
     SET revoked_at = NOW()
     FROM reports r
     WHERE s.id = $1
       AND r.id = s.report_id
       AND r.user_id = $2
       AND s.revoked_at IS NULL
     RETURNING s.id`,
    [shareId, userId]
  );
  return result.rowCount > 0;
};

const listIncoming = async (doctorId) => {
  const result = await pool.query(
    `SELECT s.id AS share_id, s.shared_at, r.id AS report_id,
            to_char(r.report_date, 'YYYY-MM-DD') AS report_date,
            r.has_critical, p.name AS profile_name,
            count(v.id) AS value_count,
            count(v.id) FILTER (WHERE v.flag IN ('high', 'low')) AS abnormal_count
     FROM report_shares s
     JOIN reports r ON r.id = s.report_id
     JOIN profiles p ON p.id = r.profile_id
     JOIN doctors d ON d.user_id = s.doctor_id
     LEFT JOIN report_values v ON v.report_id = r.id
     WHERE s.doctor_id = $1 AND s.revoked_at IS NULL AND d.status = 'verified'
     GROUP BY s.id, r.id, p.id
     ORDER BY s.shared_at DESC`,
    [doctorId]
  );
  return result.rows;
};

const findActiveForDoctor = async (reportId, doctorId) => {
  const result = await pool.query(
    `SELECT r.id, r.profile_id, r.file_name,
            to_char(r.report_date, 'YYYY-MM-DD') AS report_date,
            r.has_critical, r.status, r.created_at,
            p.name AS profile_name, p.sex, p.birth_year
     FROM report_shares s
     JOIN reports r ON r.id = s.report_id
     JOIN profiles p ON p.id = r.profile_id
     JOIN doctors d ON d.user_id = s.doctor_id
     WHERE s.report_id = $1
       AND s.doctor_id = $2
       AND s.revoked_at IS NULL
       AND d.status = 'verified'`,
    [reportId, doctorId]
  );
  return result.rows[0];
};

module.exports = {
  createShare,
  listForReport,
  revokeOwned,
  listIncoming,
  findActiveForDoctor,
};