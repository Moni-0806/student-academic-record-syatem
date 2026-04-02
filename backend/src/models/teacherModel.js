const db = require('../config/database');

class TeacherModel {
  // Get all teachers
  static async findAll() {
    const [rows] = await db.query(`
      SELECT t.*, d.department_name, s.subject_name
      FROM teachers t
      LEFT JOIN departments d ON t.department_id = d.department_id
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      ORDER BY t.teacher_name
    `);
    return rows;
  }

  // Get teacher by ID
  static async findById(id) {
    const [rows] = await db.query(`
      SELECT t.*, d.department_name, s.subject_name
      FROM teachers t
      LEFT JOIN departments d ON t.department_id = d.department_id
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      WHERE t.teacher_id = ?
    `, [id]);
    return rows[0];
  }

  // Get teachers by department
  static async findByDepartment(departmentId) {
    const [rows] = await db.query(`
      SELECT t.*, d.department_name, s.subject_name
      FROM teachers t
      LEFT JOIN departments d ON t.department_id = d.department_id
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      WHERE t.department_id = ?
      ORDER BY t.teacher_name
    `, [departmentId]);
    return rows;
  }

  // Get homeroom teachers
  static async findHomeroom() {
    return TeacherModel.getHomeroomTeachers();
  }

  static async getHomeroomTeachers() {
    const [rows] = await db.query(`
      SELECT DISTINCT t.*, d.department_name, s.subject_name
      FROM teachers t
      LEFT JOIN departments d ON t.department_id = d.department_id
      LEFT JOIN subjects s ON t.subject_id = s.subject_id
      LEFT JOIN homeroom_assignments ha ON t.teacher_id = ha.teacher_id
      WHERE ha.teacher_id IS NOT NULL
      ORDER BY t.teacher_name
    `);
    return rows;
  }

  // Create new teacher
  static async create(teacherData) {
    const { teacher_name, email, phone, department_id, subject_id, user_id } = teacherData;

    const [result] = await db.query(`
      INSERT INTO teachers (teacher_name, email, phone, department_id, subject_id, user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [teacher_name, email, phone, department_id || null, subject_id || null, user_id || null]);

    return result.insertId;
  }

  // Update teacher
  static async update(id, teacherData) {
    const { teacher_name, email, phone, department_id, subject_id } = teacherData;

    const [result] = await db.query(`
      UPDATE teachers 
      SET teacher_name = ?, email = ?, phone = ?, department_id = ?, subject_id = ?
      WHERE teacher_id = ?
    `, [teacher_name, email, phone, department_id || null, subject_id || null, id]);

    return result.affectedRows;
  }

  // Delete teacher
  static async delete(id) {
    const [result] = await db.query('DELETE FROM teachers WHERE teacher_id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = TeacherModel;
