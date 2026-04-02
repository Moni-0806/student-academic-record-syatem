const db = require('../config/database');

class MarkModel {
  // Get all marks
  static async findAll() {
    const [rows] = await db.query(`
            SELECT m.*, s.student_name, sub.subject_name, sub.subject_code, c.class_name
            FROM marks m
            JOIN students s ON m.student_id = s.student_id
            JOIN subjects sub ON m.subject_id = sub.subject_id
            JOIN classes c ON s.class_id = c.class_id
            ORDER BY s.student_name, sub.subject_name
        `);
    return rows;
  }

  // Get mark by ID
  static async findById(id) {
    const [rows] = await db.query(`
            SELECT m.*, s.student_name, sub.subject_name, sub.subject_code
            FROM marks m
            JOIN students s ON m.student_id = s.student_id
            JOIN subjects sub ON m.subject_id = sub.subject_id
            WHERE m.mark_id = ?
        `, [id]);
    return rows[0];
  }

  // Get marks by student
  static async findByStudent(studentId, academicYear, semester) {
    const [rows] = await db.query(`
            SELECT m.*, sub.subject_name, sub.subject_code
            FROM marks m
            JOIN subjects sub ON m.subject_id = sub.subject_id
            WHERE m.student_id = ? AND m.academic_year = ? AND m.semester = ?
            ORDER BY sub.subject_name
        `, [studentId, academicYear, semester]);
    return rows;
  }

  // Get marks by class
  static async findByClass(classId, academicYear, semester) {
    const [rows] = await db.query(`
            SELECT m.*, s.student_name, sub.subject_name, sub.subject_code
            FROM marks m
            JOIN students s ON m.student_id = s.student_id
            JOIN subjects sub ON m.subject_id = sub.subject_id
            WHERE s.class_id = ? AND m.academic_year = ? AND m.semester = ?
            ORDER BY s.student_name, sub.subject_name
        `, [classId, academicYear, semester]);
    return rows;
  }

  // Get student statistics
  static async getStudentStats(studentId, academicYear, semester) {
    const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_subjects,
                SUM(m.mark) as total_marks,
                ROUND(AVG(m.mark), 2) as average,
                CASE WHEN AVG(m.mark) >= 50 THEN 'PASS' ELSE 'FAIL' END as status
            FROM marks m
            WHERE m.student_id = ? AND m.academic_year = ? AND m.semester = ?
        `, [studentId, academicYear, semester]);
    return rows[0];
  }

  // Create new mark
  static async create(markData) {
    const { student_id, subject_id, mark_value, academic_year, semester } = markData;

    // Use 'mark' column name (not mark_value)
    const [result] = await db.query(`
            INSERT INTO marks (student_id, subject_id, mark, academic_year, semester)
            VALUES (?, ?, ?, ?, ?)
        `, [student_id, subject_id, mark_value, academic_year, semester]);

    return result.insertId;
  }

  // Upsert mark (insert or update if exists)
  static async upsert(markData) {
    const { student_id, subject_id, mark_value, academic_year, semester } = markData;

    // Check if mark already exists
    const [existing] = await db.query(`
      SELECT mark_id FROM marks 
      WHERE student_id = ? AND subject_id = ? AND academic_year = ? AND semester = ?
    `, [student_id, subject_id, academic_year, semester]);

    if (existing.length > 0) {
      // Update existing mark
      await db.query(`
        UPDATE marks 
        SET mark = ?
        WHERE mark_id = ?
      `, [mark_value, existing[0].mark_id]);
      return existing[0].mark_id;
    } else {
      // Insert new mark
      const [result] = await db.query(`
        INSERT INTO marks (student_id, subject_id, mark, academic_year, semester)
        VALUES (?, ?, ?, ?, ?)
      `, [student_id, subject_id, mark_value, academic_year, semester]);
      return result.insertId;
    }
  }

  // Update mark
  static async update(id, markData) {
    const { mark_value } = markData;

    // Use 'mark' column name (not mark_value)
    const [result] = await db.query(`
            UPDATE marks 
            SET mark = ?
            WHERE mark_id = ?
        `, [mark_value, id]);

    return result.affectedRows;
  }

  // Delete mark
  static async delete(id) {
    const [result] = await db.query('DELETE FROM marks WHERE mark_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = MarkModel;
