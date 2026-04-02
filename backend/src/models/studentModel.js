const db = require('../config/database');

class StudentModel {
  // Get all students
  static async findAll() {
    const [rows] = await db.query(`
            SELECT s.*, c.class_name, c.grade_level 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            ORDER BY s.student_name
        `);
    return rows;
  }

  // Get student by ID
  static async findById(id) {
    const [rows] = await db.query(`
            SELECT s.*, c.class_name, c.grade_level 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = ?
        `, [id]);
    return rows[0];
  }

  // Get students by class
  static async findByClass(classId) {
    const [rows] = await db.query(`
      SELECT s.*, c.class_name, c.grade_level 
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.class_id
      WHERE s.class_id = ?
      ORDER BY s.student_name
    `, [classId]);
    return rows;
  }

  // Create new student
  static async create(studentData) {
    const { student_name, gender, date_of_birth, student_code, class_id, academic_year, semester } = studentData;

    const [result] = await db.query(`
            INSERT INTO students (student_name, gender, date_of_birth, student_code, class_id, academic_year, semester)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [student_name, gender, date_of_birth, student_code, class_id, academic_year, semester]);

    return result.insertId;
  }

  // Update student
  static async update(id, studentData) {
    const { student_name, gender, date_of_birth, class_id } = studentData;

    const [result] = await db.query(`
            UPDATE students 
            SET student_name = ?, gender = ?, date_of_birth = ?, class_id = ?
            WHERE student_id = ?
        `, [student_name, gender, date_of_birth, class_id, id]);

    return result.affectedRows;
  }

  // Delete student
  static async delete(id) {
    const [result] = await db.query('DELETE FROM students WHERE student_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = StudentModel;
