-- ============================================
-- MINARE HIGH SCHOOL - DATABASE TABLES
-- Student Academic Record Management System
-- ============================================

-- Drop tables if exist (in reverse order of dependencies)
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS class_subject_assignments;
DROP TABLE IF EXISTS homeroom_assignments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

-- ============================================
-- CREATE TABLES (in dependency order)
-- ============================================

-- 1. Users table (no dependencies)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'teacher', 'staff') DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments table (no dependencies)
CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subjects table (depends on departments)
CREATE TABLE subjects (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    department_id INT,
    max_mark INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- 4. Teachers table (depends on users, departments, subjects)
CREATE TABLE teachers (
    teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    department_id INT,
    subject_id INT,
    user_id INT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 5. Classes table (no dependencies)
CREATE TABLE classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50) NOT NULL,
    grade_level VARCHAR(20),
    academic_year VARCHAR(10) NOT NULL,
    semester INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Homeroom assignments (depends on classes, teachers)
CREATE TABLE homeroom_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_semester (class_id, academic_year, semester)
);

-- 7. Class subject assignments (depends on classes, subjects, teachers)
CREATE TABLE class_subject_assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_subject_semester (class_id, subject_id, academic_year, semester)
);

-- 8. Students table (depends on classes)
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    student_name VARCHAR(100) NOT NULL,
    gender ENUM('M', 'F') NOT NULL,
    date_of_birth DATE,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    class_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE
);

-- 9. Marks table (depends on students, subjects)
CREATE TABLE marks (
    mark_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    mark DECIMAL(5,2) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_subject (student_id, subject_id, academic_year, semester),
    CHECK (mark >= 0 AND mark <= 100),
    CHECK (semester IN (1, 2))
);

-- 10. Homeroom submissions (tracks when homeroom teacher submits marks to admin)
CREATE TABLE IF NOT EXISTS homeroom_submissions (
    submission_id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    UNIQUE KEY unique_submission (class_id, academic_year, semester)
);

-- 11. Mark finalizations (admin locks marks - no edits after this)
CREATE TABLE IF NOT EXISTS mark_finalizations (
    finalization_id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester INT NOT NULL,
    finalized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    UNIQUE KEY unique_finalization (class_id, academic_year, semester)
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_subject ON marks(subject_id);
CREATE INDEX idx_marks_academic ON marks(academic_year, semester);
CREATE INDEX idx_teachers_dept ON teachers(department_id);
CREATE INDEX idx_subjects_dept ON subjects(department_id);
CREATE INDEX idx_homeroom_class ON homeroom_assignments(class_id);
CREATE INDEX idx_class_subject_class ON class_subject_assignments(class_id);
CREATE INDEX idx_class_subject_teacher ON class_subject_assignments(teacher_id);

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Departments (one per subject)
INSERT INTO departments (department_name, description) VALUES
('Mathematics', 'Mathematics Department'),
('English', 'English Language Department'),
('Biology', 'Biology Department'),
('Chemistry', 'Chemistry Department'),
('Physics', 'Physics Department');

-- Subjects (5 core subjects, 100 marks each)
INSERT INTO subjects (subject_name, subject_code, department_id, max_mark) VALUES
('Mathematics', 'MATH', 1, 100),
('English', 'ENG', 2, 100),
('Biology', 'BIO', 3, 100),
('Chemistry', 'CHEM', 4, 100),
('Physics', 'PHY', 5, 100);

-- Admin user (username: admin, password: admin123)
INSERT INTO users (username, password_hash, email, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@minarehighschool.com', 'admin');
