# Backend — MINARE HIGH SCHOOL Academic Record System

Node.js + Express REST API server.

---

## Stack

- Node.js + Express 4
- MySQL2
- JWT authentication
- bcrypt password hashing
- express-validator

---

## Setup

```bash
npm install
```

Create `backend/.env`:

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

---

## Running

```bash
# Production
npm start

# Development (with nodemon)
npm run dev
```

Server runs on `http://localhost:5000`

---

## Create Admin User

```bash
node create-admin.js
```

Login: `admin` / `admin123`

---

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── auth.js          # JWT config
│   │   ├── constants.js     # App constants
│   │   └── database.js      # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── classController.js
│   │   ├── departmentController.js
│   │   ├── homeroomController.js
│   │   ├── markController.js
│   │   ├── reportController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   └── teacherController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # protect + authorize
│   │   ├── errorMiddleware.js    # global error handler
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── classModel.js
│   │   ├── departmentModel.js
│   │   ├── homeroomModel.js
│   │   ├── markModel.js
│   │   ├── studentModel.js
│   │   ├── subjectModel.js
│   │   ├── teacherModel.js
│   │   └── userModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── classRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── homeroomRoutes.js
│   │   ├── markRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── subjectRoutes.js
│   │   └── teacherRoutes.js
│   ├── services/
│   │   └── reportService.js     # SQL report generation
│   └── utils/
│       └── logger.js
├── server.js
├── create-admin.js
└── package.json
```

---

## API Routes

### Auth
```
POST /api/auth/login          — login, returns JWT
GET  /api/auth/me             — get current user (requires token)
```

### Students
```
GET    /api/students                    — all students (admin)
GET    /api/students/class/:classId     — students by class
GET    /api/students/:id                — single student
POST   /api/students                    — create student
PUT    /api/students/:id                — update student
DELETE /api/students/:id                — delete student (admin)
```

### Teachers
```
GET    /api/teachers                        — all teachers
GET    /api/teachers/:id                    — single teacher
POST   /api/teachers                        — create teacher (admin)
PUT    /api/teachers/:id                    — update teacher (admin)
DELETE /api/teachers/:id                    — delete teacher + user account (admin)

GET    /api/teachers/my-assignment          — teacher's class/subject assignments
GET    /api/teachers/my-homeroom-marks      — homeroom teacher's full class marks view
POST   /api/teachers/submit-to-admin        — homeroom submits marks to admin
GET    /api/teachers/submission-status      — check if homeroom submitted
GET    /api/teachers/latest-submission      — latest submission for a class (admin use)

GET    /api/teachers/assignments            — all class-subject assignments
POST   /api/teachers/assignments            — assign teacher to class/subject (admin)
DELETE /api/teachers/assignments/:id        — remove assignment (admin)

GET    /api/teachers/homeroom-list          — all homeroom assignments
POST   /api/teachers/homeroom-list          — assign homeroom teacher (admin)
DELETE /api/teachers/homeroom-list/:id      — remove homeroom assignment (admin)
```

### Classes
```
GET    /api/classes        — all classes
GET    /api/classes/:id    — single class
POST   /api/classes        — create class (admin)
PUT    /api/classes/:id    — update class (admin)
DELETE /api/classes/:id    — delete class (admin)
```

### Subjects
```
GET    /api/subjects        — all subjects
GET    /api/subjects/:id    — single subject
POST   /api/subjects        — create subject (admin)
PUT    /api/subjects/:id    — update subject (admin)
DELETE /api/subjects/:id    — delete subject (admin)
```

### Departments
```
GET    /api/departments        — all departments
POST   /api/departments        — create department (admin)
DELETE /api/departments/:id    — delete department (admin)
```

### Marks
```
GET  /api/marks/class                  — class marks (checks submission gate)
GET  /api/marks/class-subjects         — subjects assigned to a class/year/semester
GET  /api/marks/student/:studentId     — student marks
GET  /api/marks/finalization-status    — check if marks are finalized
POST /api/marks                        — upsert a mark
POST /api/marks/finalize               — finalize (lock) marks for a class (admin)
```

### Reports
```
GET /api/reports/class/:classId?academicYear=&semester=    — class report
GET /api/reports/student/:studentId?academicYear=&semester= — student report
```

---

## Authentication

All routes except `POST /api/auth/login` require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

Roles:
- `admin` — full access
- `teacher` — mark entry, homeroom view, submit to admin

---

## Key Business Rules

- Students are filtered by `class_id` + `academic_year` + `semester` — all three must match
- Marks column is named `mark` (not `mark_value`)
- Subjects column is `max_mark` (not `max_marks`)
- User identifier in `req.user` is `user_id` (not `id`)
- Deleting a teacher also deletes their linked user account
- A teacher can only be homeroom teacher for one class
- Marks are locked after admin finalizes — no further edits
- Report only shows students whose `academic_year` and `semester` match the filter

---

## Troubleshooting

**EADDRINUSE port 5000**
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

**Table 'mark_finalizations' doesn't exist**
Run the `CREATE TABLE IF NOT EXISTS` statements for tables 10 and 11 from `database/schema/01_create_tables.sql`.
