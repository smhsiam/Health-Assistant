const { pool } = require('../config/db');

const baseSelect = `
  SELECT c.id, c.patient_id, c.doctor_id, c.report_id, c.status, c.created_at,
         pu.name AS patient_name, du.name AS doctor_name,
         d.specialty, d.status AS doctor_status
  FROM consultations c
  JOIN users pu ON pu.id = c.patient_id
  JOIN users du ON du.id = c.doctor_id
  JOIN doctors d ON d.user_id = c.doctor_id
`;

const findOpenBetween = async (patientId, doctorId) => {
  const result = await pool.query(
    `SELECT id FROM consultations
     WHERE patient_id = $1 AND doctor_id = $2 AND status = 'open'`,
    [patientId, doctorId]
  );
  return result.rows[0];
};

const create = async (patientId, doctorId, reportId) => {
  const result = await pool.query(
    `INSERT INTO consultations (patient_id, doctor_id, report_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [patientId, doctorId, reportId]
  );
  return result.rows[0].id;
};

const findForUser = async (id, userId) => {
  const result = await pool.query(
    `${baseSelect}
     WHERE c.id = $1
       AND (c.patient_id = $2 OR (c.doctor_id = $2 AND d.status = 'verified'))`,
    [id, userId]
  );
  return result.rows[0];
};

const listForUser = async (userId) => {
  const result = await pool.query(
    `SELECT c.id, c.patient_id, c.doctor_id, c.report_id, c.status, c.created_at,
            pu.name AS patient_name, du.name AS doctor_name, d.specialty,
            (SELECT count(*) FROM consultation_messages m
             WHERE m.consultation_id = c.id) AS message_count,
            (SELECT max(m.created_at) FROM consultation_messages m
             WHERE m.consultation_id = c.id) AS last_message_at
     FROM consultations c
     JOIN users pu ON pu.id = c.patient_id
     JOIN users du ON du.id = c.doctor_id
     JOIN doctors d ON d.user_id = c.doctor_id
     WHERE c.patient_id = $1 OR (c.doctor_id = $1 AND d.status = 'verified')
     ORDER BY COALESCE(
       (SELECT max(m.created_at) FROM consultation_messages m
        WHERE m.consultation_id = c.id),
       c.created_at
     ) DESC, c.id DESC`,
    [userId]
  );
  return result.rows;
};

const listMessages = async (consultationId) => {
  const result = await pool.query(
    `SELECT id, sender_id, body, created_at
     FROM consultation_messages
     WHERE consultation_id = $1
     ORDER BY id`,
    [consultationId]
  );
  return result.rows;
};

const addMessage = async (consultationId, senderId, body) => {
  const result = await pool.query(
    `INSERT INTO consultation_messages (consultation_id, sender_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, sender_id, body, created_at`,
    [consultationId, senderId, body]
  );
  return result.rows[0];
};

const close = async (consultationId) => {
  const result = await pool.query(
    `UPDATE consultations SET status = 'closed'
     WHERE id = $1 AND status = 'open'
     RETURNING id`,
    [consultationId]
  );
  return result.rowCount > 0;
};

module.exports = {
  findOpenBetween,
  create,
  findForUser,
  listForUser,
  listMessages,
  addMessage,
  close,
};