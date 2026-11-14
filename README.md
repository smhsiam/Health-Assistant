# Health Assistant

An AI medical report explainer for patients in Bangladesh. It reads laboratory reports, explains them safely in Bangla and English, and measures its own accuracy.

Course: CSE4104, 
AI-Based Software Project Development, 
Section 7B, Team CSE4104-7B-T06,
University: Northern University of Business and Technology, Khulna.

Submitted to: 
Md. Riaz Mahmud, 
Assistant Professor, 
Department of Computer Science and Engineering,
Northern University of Business and Technology, Khulna.

## Important notice

Health Assistant is a reading aid, not a medical opinion. It never diagnoses, never suggests medicine, and always advises the user to consult a doctor.

## Team

| Name | Student ID | Role |
|---|---|---|
| MD. Huzaifa Orfa Siam Uddin (Team Leader) | 11230321258 | AI integration, UI, Data, Database, QA and Documentation |
| MD Tanzir Rana Rubence | 11230321262 | Backend |
| Mahim Islam Medul | 11230321409 | Frontend |

## Objectives

1. Build a secure web application with registration, login and report upload
2. Extract report values accurately and flag uncertain ones for the user to verify
3. Decide high, low or normal by fixed rules in code, never by the AI model
4. Explain results in simple Bangla and English without diagnosis or medicine advice
5. Raise an urgency prompt for critical values
6. Show history and trends across reports
7. Keep the core result view usable on slow networks
8. Measure the system's own accuracy and safety with a hand-made answer sheet

## Features and status

| Feature | Priority | Status |
|---|---|---|
| Registration, login, private accounts, health profiles | Must | Done |
| Rule engine for normal, high and low values | Must | Done |
| Critical value check for the urgency banner | Must | Done |
| Responsive bilingual interface and landing page | Must | Done |
| Report upload and value extraction | Must | In progress |
| Result page with original report, flags and doctor notice | Must | Planned |
| Report history | Must | Planned |
| Confidence flag and user verification | Must | Planned |
| Trend charts and plain-language trend notes | Should | Planned |
| Value correction, clinician summary, diet guidance | Should | Planned |
| Voice read-aloud, follow-up questions, SMS summary | Could | Planned |

## Technology stack

| Area | Choice |
|---|---|
| Frontend | React, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT and bcrypt |
| File upload | Multer |
| Evaluation | Python scripts |
| Hosting plan | Vercel, Render, managed PostgreSQL |

## Repository structure

```
Health-Assistant/
  client/        React web application
  server/        Express API, database schema, rule engine
  evaluation/    Answer sheet and scoring scripts
```

## Run locally

Requirements: Node.js and PostgreSQL.

1. Create a PostgreSQL database named health_assistant and run server/database/schema.sql in it
2. Copy server/.env.example to server/.env and fill in the values
3. Copy client/.env.example to client/.env
4. Start the server

```
cd server
npm install
npm run dev
```

5. Start the client in a second terminal

```
cd client
npm install
npm run dev
```

6. Open http://localhost:5173

## Data and privacy

This repository currently contains no real patient data. Development uses clearly labeled synthetic reports. I plan to collect real data in a future phase and update the project with appropriate consent, privacy, and security safeguards. Secrets are stored only in .env files, which are never committed.