# Frontend — MINARE HIGH SCHOOL Academic Record System

React single-page application.

---

## Stack

- React 18
- React Router DOM v6
- Axios
- CSS3 (custom, no UI framework)

---

## Setup

```bash
npm install
```

Create `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Running

```bash
npm start
```

Runs on `http://localhost:3000`

---

## Build

```bash
npm run build
```

---

## Folder Structure

```
frontend/src/
├── components/
│   ├── auth/
│   │   ├── Login.jsx           — login form
│   │   └── PrivateRoute.jsx    — route guard
│   ├── classes/
│   │   ├── ClassList.jsx       — class CRUD + form
│   │   └── ClassDetails.jsx
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx         — navigation menu
│   │   ├── Footer.jsx
│   │   └── LoadingSpinner.jsx
│   ├── dashboard/
│   │   └── Dashboard.jsx       — stats overview
│   ├── marks/
│   │   ├── MarkEntry.jsx       — teacher + admin mark entry
│   │   ├── MarkList.jsx
│   │   └── MarkEdit.jsx
│   ├── reports/
│   │   ├── ClassReport.jsx     — class report table + print cards
│   │   ├── ReportFilters.jsx   — class/year/semester filter bar
│   │   └── StudentReport.jsx
│   ├── students/
│   │   ├── StudentList.jsx
│   │   ├── StudentForm.jsx
│   │   └── StudentDetails.jsx
│   ├── subjects/
│   │   ├── SubjectList.jsx
│   │   └── SubjectForm.jsx
│   └── teachers/
│       ├── TeacherList.jsx     — teachers + assign teacher + homeroom tables
│       ├── TeacherForm.jsx     — add/edit teacher with dept→subject auto-fill
│       └── TeacherDetails.jsx
├── context/
│   └── AuthContext.js          — JWT auth state
├── hooks/
│   └── useAuth.js
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ClassesPage.jsx
│   ├── StudentsPage.jsx
│   ├── TeachersPage.jsx
│   ├── SubjectsPage.jsx
│   ├── MarksPage.jsx
│   └── ReportsPage.jsx
├── services/
│   ├── api.js                  — Axios instance with auth header
│   ├── authService.js
│   ├── classService.js
│   ├── departmentService.js
│   ├── homeroomService.js
│   ├── markService.js
│   ├── reportService.js
│   ├── studentService.js
│   ├── subjectService.js
│   └── teacherService.js
├── styles/
│   └── App.css
├── App.js                      — routes
└── index.js
```

---

## Pages & Navigation

| Page | Path | Access |
|---|---|---|
| Login | `/login` | Public |
| Dashboard | `/dashboard` | All |
| Classes | `/classes` | Admin |
| Students | `/students` | Admin |
| Teachers | `/teachers` | Admin |
| Subjects | `/subjects` | Admin |
| Mark Entry | `/marks` | Admin + Teacher |
| Reports | `/reports` | Admin |

---

## Key Components

### MarkEntry.jsx
Handles two different views based on role:

**Teacher view**
- "Enter Marks" tab — enter marks for assigned subject per class
- "Homeroom View" tab (if homeroom teacher) — see all subjects, edit any mark, submit to admin

**Admin view**
- Select class → year/semester auto-detected from latest homeroom submission
- Edit marks in table
- "Save Marks" — saves + finalizes + navigates to Reports
- After finalization, table is read-only with "Send to Report" button

### ClassReport.jsx
- Displays class report table with all students and subject marks
- Each row has a 🖨️ Print button
- Clicking Print opens a formatted result card in a new window with the browser print dialog
- Card contains: school name, student info, marks per subject, total, average, rank, PASS/FAIL

### TeacherForm.jsx
- Selecting a department auto-filters the subject dropdown to only subjects in that department
- Since each department has one subject, the subject is auto-selected

### TeacherList.jsx (Assign Teacher form)
- Selecting a teacher auto-fills the Subject field with that teacher's assigned subject (read-only)

### TeacherList.jsx (Assign Homeroom form)
- Academic year is removed — taken automatically from the selected class
- Teacher dropdown only shows teachers not already assigned as homeroom anywhere
- One teacher can only be homeroom for one class (enforced frontend + backend)

---

## Services

All services use the Axios instance in `api.js` which automatically attaches the JWT token from localStorage.

```js
// Example
import { getStudentsByClass } from './services/studentService';
const res = await getStudentsByClass(classId);
// res.data = array of students
```

---

## Auth Flow

1. User submits login form → `POST /api/auth/login`
2. JWT token stored in `localStorage`
3. `AuthContext` provides `user` object and `logout` function
4. `PrivateRoute` redirects to `/login` if no token
5. `api.js` Axios interceptor attaches `Authorization: Bearer <token>` to every request
