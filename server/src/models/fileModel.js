const { pool } = require('../config/db');

const save = async (reportId, mimeType, buffer) => {
  await pool.query(
    `INSERT INTO report_files (report_id, mime_type, size_bytes, data)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (report_id) DO UPDATE
     SET mime_type = EXCLUDED.mime_type,
         size_bytes = EXCLUDED.size_bytes,
         data = EXCLUDED.data`,
    [reportId, mimeType, buffer.length, buffer]
  );
};

const findByReport = async (reportId) => {
  const result = await pool.query(
    'SELECT mime_type, size_bytes, data FROM report_files WHERE report_id = $1',
    [reportId]
  );
  return result.rows[0];
};

const exists = async (reportId) => {
  const result = await pool.query(
    'SELECT 1 FROM report_files WHERE report_id = $1',
    [reportId]
  );
  return result.rowCount > 0;
};

module.exports = { save, findByReport, exists };