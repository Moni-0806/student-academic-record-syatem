# Student Academic Record Management System
## MINARE HIGH SCHOOL

A full-stack web application for managing student academic records — built with React, Node.js, Express, and MySQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT + bcrypt |

---

## Prerequisites

- Node.js v14+
- npm v6+
- MySQL 5.7+ (or XAMPP)

---

## Quick Start

### 1. Database setup

Create the database in MySQL / phpMyAdmin:

```sql
CREATE DATABASE student_records;
USE student_records;
```

Then run the full schema:

```
database/schema/01_create_tables.sql
```

This creates all 11 tables and inserts the 5 core subjects and departments.

### 2. Backend

```bash
cd backend
npm install
npm start
```

Runs on `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`

### 4. Create admin user

```bash
cd backend
node create-admin.js
```

### 5. Login

```
URL:      http://localhost:3000
Username: admin
Password: admin123
```

---

## Environment Variables

**backend/.env**
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_records
DB_PORT=3306
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Project Structure

```
student-academic-record-system/
├── backend/
│   ├── src/
│   │   ├── config/         # DB and auth config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Database query models
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic (reports)
│   │   └── utils/          # Logger
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components by feature
│   │   ├── context/        # Auth context
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # Axios API calls
│   │   └── styles/         # App.css
│   └── package.json
├── database/
│   └── schema/
│       └── 01_create_tables.sql
└── docs/
    └── design/
        └── ER_DIAGRAM.md
```

---

## Features

### Authentication
- JWT-based login
- Role-based access: `admin` and `teacher`
- bcrypt password hashing

### Student Management
- Add, edit, delete students
- Student code format: `MIN###/YY` (e.g., MIN001/25)
- Filtered by class, academic year, semester

### Teacher Management
- Add teachers with department and subject
- Assign teachers to classes and subjects
- Assign one homeroom teacher per class (a teacher can only be homeroom for one class)
- Deleting a teacher also removes their login account

### Class Management
- Create classes with grade level, academic year, semester

### Subject Management
- 5 core subjects: MATH, ENG, BIO, CHEM, PHY
- 100 marks each — total 500
- Each subject belongs to its own department

### Mark Entry
- Teachers enter marks for their assigned subject
- Homeroom teacher sees all subjects, edits, and submits to admin
- Admin reviews, edits, saves and finalizes marks
- Finalized marks are locked (read-only)
- After saving, admin is taken directly to the Reports page

### Academic Reports
- Class report filtered by class, academic year, semester
- Shows: name, gender, ID, marks per subject, total, average, rank, PASS/FAIL
- Print individual student result cards (opens print dialog)
- Pass mark: 50% average

---

## API Endpoints (Summary)

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/students
GET    /api/students/class/:classId
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id

GET    /api/teachers
POST   /api/teachers
PUT    /api/teachers/:id
DELETE /api/teachers/:id
GET    /api/teachers/my-assignment
GET    /api/teachers/my-homeroom-marks
POST   /api/teachers/submit-to-admin
GET    /api/teachers/submission-status
GET    /api/teachers/latest-submission
GET    /api/teachers/assignments
POST   /api/teachers/assignments
DELETE /api/teachers/assignments/:id
GET    /api/teachers/homeroom-list
POST   /api/teachers/homeroom-list
DELETE /api/teachers/homeroom-list/:id

GET    /api/classes
POST   /api/classes
PUT    /api/classes/:id
DELETE /api/classes/:id

GET    /api/subjects
POST   /api/subjects
PUT    /api/subjects/:id
DELETE /api/subjects/:id

GET    /api/departments
POST   /api/departments
DELETE /api/departments/:id

GET    /api/marks/class
GET    /api/marks/class-subjects
GET    /api/marks/student/:studentId
GET    /api/marks/finalization-status
POST   /api/marks
POST   /api/marks/finalize

GET    /api/reports/class/:classId
GET    /api/reports/student/:studentId
```

---

## Database Tables

| # | Table | Purpose |
|---|---|---|
| 1 | users | Login accounts |
| 2 | departments | One per subject (Math, English, Biology, Chemistry, Physics) |
| 3 | subjects | 5 core subjects |
| 4 | teachers | Teacher profiles |
| 5 | classes | Class groups |
| 6 | homeroom_assignments | One homeroom teacher per class |
| 7 | class_subject_assignments | Teacher-subject-class links |
| 8 | students | Student records |
| 9 | marks | Student marks (column: `mark`) |
| 10 | homeroom_submissions | Tracks homeroom teacher submission to admin |
| 11 | mark_finalizations | Admin locks marks after review |

---

## Troubleshooting

**Port 5000 already in use**
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

**Table 'student_records.mark_finalizations' doesn't exist**
Run tables 10 and 11 from `database/schema/01_create_tables.sql` manually in MySQL.

**Invalid credentials**
```bash
cd backend && node create-admin.js
```

**No students found in report**
Students are filtered by `class_id`, `academic_year`, AND `semester`. All three must match what was entered when the student was registered.

---

**School**: MINARE HIGH SCHOOL
**Database**: student_records
**Default login**: admin / admin123
