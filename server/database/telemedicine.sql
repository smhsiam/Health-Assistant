ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'patient'
  CHECK (role IN ('patient', 'doctor', 'admin'));

CREATE TABLE IF NOT EXISTS doctors (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialty VARCHAR(100) NOT NULL,
  bmdc_number VARCHAR(30) NOT NULL UNIQUE,
  experience_years INTEGER,
  bio TEXT,
  fee INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(10) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_shares (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
  shared_at TIMESTAMP NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
  report_id INTEGER REFERENCES reports(id) ON DELETE SET NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_messages (
  id SERIAL PRIMARY KEY,
  consultation_id INTEGER NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shares_active
  ON report_shares(report_id, doctor_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shares_doctor_id ON report_shares(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_messages_consultation_id ON consultation_messages(consultation_id);