# Documentation — MINARE HIGH SCHOOL
## Student Academic Record Management System

---

## Folder Structure

```
docs/
├── README.md                          ← this file
├── design/
│   ├── ER_DIAGRAM.md                  ← full ER diagram, all 11 tables, relationships
│   └── ER_Diagram.png                 ← visual diagram image
├── reports/
│   └── sample_report_structure.md     ← report layout and column descriptions
└── requirements/
    ├── functional_requirements.md     ← what the system does
    └── non_functional_requirements.md ← performance, security, reliability
```

---

## System Summary

**School**: MINARE HIGH SCHOOL
**Database**: `student_records`
**Stack**: React + Node.js + Express + MySQL

### Core Rules
- 5 subjects: MATH, ENG, BIO, CHEM, PHY — 100 marks each
- Total possible marks: 500
- Pass mark: average ≥ 50%
- Student code format: `MIN###/YY` (e.g., MIN001/25)
- Each department has exactly one subject
- One homeroom teacher per class — a teacher can only be homeroom for one class
- Marks are locked after admin finalizes — no further editing

### Database Tables (11)
1. `users` — login accounts
2. `departments` — one per subject
3. `subjects` — 5 core subjects
4. `teachers` — teacher profiles
5. `classes` — class groups
6. `homeroom_assignments` — homeroom teacher per class
7. `class_subject_assignments` — teacher-subject-class links
8. `students` — student records
9. `marks` — student marks (column: `mark`, not `mark_value`)
10. `homeroom_submissions` — tracks homeroom submission to admin
11. `mark_finalizations` — admin locks marks

### Mark Entry Workflow
```
Subject Teacher  →  enters marks for their subject
Homeroom Teacher →  reviews all subjects, submits to admin
Admin            →  reviews, saves, finalizes → redirected to Reports
```

### Default Login
```
Username: admin
Password: admin123
```
