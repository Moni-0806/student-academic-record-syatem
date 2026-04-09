const db = require('../config/database');

class ClassModel {
    // Get all classes
    static async findAll() {
        const [rows] = await db.query(`
            SELECT c.*, t.teacher_name as homeroom_teacher
            FROM classes c
            LEFT JOIN homeroom_assignments ha 
                ON c.class_id = ha.class_id 
                AND c.academic_year = ha.academic_year
            LEFT JOIN teachers t ON ha.teacher_id = t.teacher_id
            ORDER BY c.grade_level, c.class_name
        `);
        return rows;
    }

    // Get class by ID
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM classes WHERE class_id = ?', [id]);
        return rows[0];
    }

    // Create new class
    static async create(classData) {
        const { class_name, grade_level, academic_year } = classData;
        const [result] = await db.query(`
      INSERT INTO classes (class_name, grade_level, academic_year)
      VALUES (?, ?, ?)
    `, [class_name, grade_level, academic_year]);
        return result.insertId;
    }

    // Update class
    static async update(id, classData) {
        const { class_name, grade_level, academic_year } = classData;
        const [result] = await db.query(`
      UPDATE classes 
      SET class_name = ?, grade_level = ?, academic_year = ?
      WHERE class_id = ?
    `, [class_name, grade_level, academic_year, id]);
        return result.affectedRows;
    }

    // Delete class
    static async delete(id) {
        const [result] = await db.query('DELETE FROM classes WHERE class_id = ?', [id]);
        return result.affectedRows;
    }

    // Get class with homeroom teacher
    static async findWithHomeroom(classId, academicYear, semester) {
        const [rows] = await db.query(`
      SELECT c.*, t.teacher_name as homeroom_teacher
      FROM classes c
      LEFT JOIN homeroom_assignments ha ON c.class_id = ha.class_id 
        AND ha.academic_year = ? AND ha.semester = ?
      LEFT JOIN teachers t ON ha.teacher_id = t.teacher_id
      WHERE c.class_id = ?
    `, [academicYear, semester, classId]);
        return rows[0];
    }
}

module.exports = ClassModel;
