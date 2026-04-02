# Database Setup - MINARE HIGH SCHOOL

This directory contains all database-related files for the Student Academic Record Management System.

## Quick Setup (Recommended)

### Option 1: Complete Setup (Fresh Start)

1. Open phpMyAdmin
2. Click "SQL" tab
3. Copy and paste the entire content of `COMPLETE_DATABASE_SETUP.sql`
4. Click "Go" to execute
5. Run: `node backend/create-admin.js` to create admin user
6. Login with: username=`admin`, password=`admin123`

### Option 2: Check for Triggers (If you have errors)

If you're getting "PROCEDURE student_records.calculate_class_ranks does not exist" error:

1. Open phpMyAdmin
2. Click "SQL" tab
3. Copy and paste the content of `CHECK_AND_DROP_TRIGGERS.sql`
4. Click "Go" to execute
5. This will show and remove any problematic triggers

## Directory Structure

- `COMPLETE_DATABASE_SETUP.sql` - **USE THIS** for fresh database setup
- `CHECK_AND_DROP_TRIGGERS.sql` - Use this to fix trigger errors
- `schema/` - Database table definitions (reference only)
- `seed/` - Initial data for testing (reference only)
- `migrations/` - Database schema changes (reference only)
- `queries/` - Useful SQL queries (reference only)

## Database Schema

### Tables Created:
1. `users` - Admin and teacher login accounts
2. `departments` - Subject-based departments (Math, English, Science)
3. `teachers` - Teacher information
4. `subjects` - 5 core subjects (MATH, ENG, BIO, CHEM, PHY) - 100 marks each
5. `classes` - Class information
6. `homeroom_assignments` - One homeroom teacher per class
7. `students` - Student information (uses `student_name` single field)
8. `marks` - Student marks (uses `mark` column, 0-100 range)

### Key Features:
- CHECK constraints for marks (0-100) and semester (1-2)
- Indexes for performance optimization
- Foreign key relationships with CASCADE delete
- Initial departments and subjects pre-loaded

## Database Configuration

Update the `.env` file in the backend directory:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_records
```

## Troubleshooting

### "PROCEDURE calculate_class_ranks does not exist"
- Run `CHECK_AND_DROP_TRIGGERS.sql` to remove problematic triggers

### "Invalid credentials" on login
- Run `node backend/create-admin.js` to create/update admin user
- Restart backend server
- Login with: admin / admin123

### Foreign key constraint errors
- Make sure you run `COMPLETE_DATABASE_SETUP.sql` which drops all tables first
- Tables are created in the correct order to avoid FK errors
