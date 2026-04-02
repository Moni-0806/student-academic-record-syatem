const db = require('../config/database');

class SubjectModel {
    // Get all subjects
    static async findAll() {
        const [rows] = await db.query(`
      SELECT s.*, d.department_name 
      FROM subjects s
      JOIN departments d ON s.department_id = d.department_id
      ORDER BY s.subject_name
    `);
        return rows;
    }

    // Get subject by ID
    static async findById(id) {
        const [rows] = await db.query(`
      SELECT s.*, d.department_name 
      FROM subjects s
      JOIN departments d ON s.department_id = d.department_id
      WHERE s.subject_id = ?
    `, [id]);
        return rows[0];
    }

    // Create new subject
    static async create(subjectData) {
        const { subject_name, subject_code, max_mark, department_id } = subjectData;
        const [result] = await db.query(`
      INSERT INTO subjects (subject_name, subject_code, max_mark, department_id)
      VALUES (?, ?, ?, ?)
    `, [subject_name, subject_code, max_mark || 100, department_id]);
        return result.insertId;
    }

    // Update subject
    static async update(id, subjectData) {
        const { subject_name, subject_code, max_mark, department_id } = subjectData;
        const [result] = await db.query(`
      UPDATE subjects 
      SET subject_name = ?, subject_code = ?, max_mark = ?, department_id = ?
      WHERE subject_id = ?
    `, [subject_name, subject_code, max_mark, department_id, id]);
        return result.affectedRows;
    }

    // Delete subject
    static async delete(id) {
        const [result] = await db.query('DELETE FROM subjects WHERE subject_id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = SubjectModel;
