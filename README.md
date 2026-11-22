# Health Assistant

An AI medical report explainer for patients in Bangladesh. It reads laboratory reports, explains them safely in Bangla and English, and measures its own accuracy.

Course: CSE4104, AI-Based Software Project Development
Section: 7B
Team: CSE4104-7B-T06
University: Northern University of Business and Technology, Khulna

Submitted to: Md. Riaz Mahmud, Assistant Professor, Department of Computer Science and Engineering, Northern University of Business and Technology, Khulna.

## Important notice

Health Assistant is a reading aid, not a medical opinion. The AI never diagnoses, never suggests medicine, and always advises the user to consult a doctor. High, low and normal flags are decided by fixed rules in code, never by the AI model.

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
| Typed PDF upload with a text parser and optional AI reading | Must | Done |
| Photo upload (JPG, PNG) read by OCR | Could | Done |
| Rule engine for normal, high and low values | Must | Done |
| Critical value check and urgency banner | Must | Done |
| Result page with flags, explanation and doctor notice | Must | Done |
| Report history | Must | Done |
| Confidence flag and user verification of values | Must | Done |
| Trend charts and plain-language trend notes | Should | Done |
| Value correction and clinician summary page | Should | Done |
| Delete a report | Should | Done |
| Responsive bilingual interface and landing page | Must | Done |
| Original report shown beside extracted values | Must | Planned |
| Diet guidance, voice read-aloud, follow-up questions, SMS summary | Should and Could | Planned |
| Evaluation against a hand-made answer sheet | Must | In progress |
| Deployment (Supabase, Render, Vercel) | Must | Planned |
| New visual design and motion | Extra | Planned |

### Telemedicine extension

After the SRS was written we added a doctor side to the product. The SRS lists payments and appointment booking as out of scope, so this extension is a scope change and the SRS will be updated after the supervisor approves it.

| Feature | Status |
|---|---|
| Doctor accounts with specialty, BMDC number, experience, bio and fee | Done |
| Admin verification of doctors. Patients see only verified doctors | Done |
| Patient controlled report sharing, with a stop sharing button | Done |
| Doctors see only reports shared with them, read only, without the patient email | Done |
| Written consultations between a patient and a verified doctor | Done |
| Demo payment for the consultation fee, clearly labeled as a demo | Planned |

There are no real payments, no video calls and no prescriptions. Doctors write general notes only, and the chat page warns them not to write medicine names or doses. Patients see a notice that the messages come from a real doctor and that the chat is not for emergencies.

## User roles

| Role | What they can do |
|---|---|
| Patient | Upload reports, read results, correct values, see history and trends, share reports with verified doctors, start consultations |
| Doctor | Manage own profile, read reports shared with them, write in consultations |
| Admin | Verify or reject doctors. An admin cannot read other people's consultations |

## Technology stack

| Area | Choice |
|---|---|
| Frontend | React, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT and bcrypt, with roles |
| File upload | Multer |
| Reading reports | pdf-parse for typed PDFs, tesseract.js for photos, optional AI model |
| Evaluation | Python scripts |
| Hosting plan | Vercel, Render, Supabase |

## Repository structure

```
Health-Assistant/
  client/        React web application
  server/        Express API, database files, rule engine, helper scripts
  evaluation/    Scoring scripts for the answer sheet
```

## Run locally

Requirements: Node.js and PostgreSQL.

1. Create a PostgreSQL database named health_assistant
2. Copy server/.env.example to server/.env and fill in the values
3. Copy client/.env.example to client/.env
4. Create the tables

```
cd server
npm install
node src/scripts/runSql.js database/schema.sql database/telemedicine.sql
```

5. Start the server

```
npm run dev
```

6. Start the client in a second terminal

```
cd client
npm install
npm run dev
```

7. Open http://localhost:5173

### Notes

1. The AI reading is optional. If AI_BASE_URL, AI_API_KEY and AI_MODEL are empty, the text parser still works and the AI checkbox on the upload page is disabled.
2. The first time a photo is read, tesseract.js downloads English language data, so an internet connection is needed once. The file eng.traineddata is created in the server folder and is ignored by git.
3. To make an account an admin, register it normally and then run this in the server folder

```
node src/scripts/makeAdmin.js your@email.com
```

4. Doctors register on the doctor registration page and stay hidden from patients until an admin verifies them.

## Main API routes

| Group | Routes |
|---|---|
| Auth | POST /api/auth/register, POST /api/auth/register-doctor, POST /api/auth/login |
| Reports | POST /api/reports, GET /api/reports, GET /api/reports/:id, PUT /api/reports/:id/values/:valueId, DELETE /api/reports/:id |
| Doctors | GET /api/doctors, GET /api/doctors/:id, GET and PUT /api/doctors/me |
| Admin | GET /api/admin/doctors, PUT /api/admin/doctors/:id/status |
| Sharing | POST /api/shares, GET /api/shares/report/:reportId, DELETE /api/shares/:id, GET /api/shares/incoming, GET /api/shares/incoming/:reportId |
| Consultations | GET and POST /api/consultations, GET /api/consultations/:id, POST /api/consultations/:id/messages, PUT /api/consultations/:id/close |

Profiles and trends have their own routes under /api/profiles and /api/trends.

## Known limitations

1. Scanned PDFs are not read. The user is asked to upload a clear photo as JPG or PNG instead.
2. OCR reads English only. Blurry, tilted or dark photos can be misread, so values from weak photos are marked for the user to verify.
3. Uploaded files are deleted right after processing. The original report is therefore not yet shown beside the values. Keeping files in a private store is planned and depends on a pending decision.
4. The BMDC number is checked by an admin by hand. A number typed by a doctor is not proof of registration, so an admin must compare it with the official BMDC list.
5. The consultation chat refreshes every 8 seconds, which costs data on very slow networks.
6. Message sending has only the general API rate limit. A stricter limit is planned.
7. Bangla explanations still need review by a person, and the safety test set has not been reviewed by a clinician yet.
8. Doctors write free text, so nothing in code can fully stop a doctor from naming a medicine. The chat page shows a warning instead.

## Data and privacy

This repository contains no real patient data. Development uses clearly labeled synthetic reports and test accounts. Real data will be collected in a later phase, with consent, privacy and security safeguards in place. Secrets are stored only in .env files, which are never committed. Doctors can read only the reports that a patient has shared with them, and sharing ends the moment the patient stops it.
## Documentation

| Item | Location |
|---|---|
| Proposal and SRS | documentation/ |
| System design document (PDF) | documentation/CSE4104-7B-T06_SystemDesign.pdf |
| ER diagram (PDF) | documentation/CSE4104-7B-T06_ERDiagram.pdf |
| Activity diagrams (PDF) | documentation/CSE4104-7B-T06_ActivityDiagram.pdf |
| Exported diagram images | diagrams/ |

## Folder names

The course suggests the folders frontend, backend and database. This project uses the following names for the same parts.

| Suggested name | Folder in this repository |
|---|---|
| frontend | client |
| backend | server |
| database | server/database |
| documentation | documentation |
| diagrams | diagrams |
