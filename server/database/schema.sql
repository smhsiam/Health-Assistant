CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  report_date DATE,
  explanation_en TEXT,
  explanation_bn TEXT,
  has_critical BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_values (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  test_name VARCHAR(150) NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR(50),
  ref_low NUMERIC,
  ref_high NUMERIC,
  flag VARCHAR(10) NOT NULL DEFAULT 'unknown',
  is_critical BOOLEAN NOT NULL DEFAULT FALSE,
  confidence NUMERIC(3,2),
  needs_review BOOLEAN NOT NULL DEFAULT FALSE,
  is_corrected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_values_report_id ON report_values(report_id);
CREATE INDEX IF NOT EXISTS idx_values_test_name ON report_values(test_name);