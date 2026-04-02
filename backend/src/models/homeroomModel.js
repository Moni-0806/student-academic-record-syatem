const db = require('../config/database');

class HomeroomModel {
    // Get homeroom assignment for a class
    static async findByClass(classId, academicYear, semester) {
        const [rows] = await db.query(`
      SELECT ha.*, t.teacher_name, c.class_name
      FROM homeroom_assignments ha
      JOIN teachers t ON ha.teacher_id = t.teacher_id
      JOIN classes c ON ha.class_id = c.class_id
      WHERE ha.class_id = ? AND ha.academic_year = ? AND ha.semester = ?
    `, [classId, academicYear, semester]);
        return rows[0];
    }

    // Get all homeroom assignments
    static async findAll() {
        const [rows] = await db.query(`
      SELECT ha.*, t.teacher_name, c.class_name
      FROM homeroom_assignments ha
      JOIN teachers t ON ha.teacher_id = t.teacher_id
      JOIN classes c ON ha.class_id = c.class_id
      ORDER BY ha.academic_year DESC, ha.semester DESC
    `);
        return rows;
    }

    // Create or update homeroom assignment
    static async upsert(assignmentData) {
        const { class_id, teacher_id, academic_year, semester } = assignmentData;

        // Check if assignment exists
        const [existing] = await db.query(`
      SELECT assignment_id FROM homeroom_assignments
      WHERE class_id = ? AND academic_year = ? AND semester = ?
    `, [class_id, academic_year, semester]);

        if (existing.length > 0) {
            // Update existing assignment
            await db.query(`
        UPDATE homeroom_assignments
        SET teacher_id = ?
        WHERE assignment_id = ?
      `, [teacher_id, existing[0].assignment_id]);
            return existing[0].assignment_id;
        } else {
            // Insert new assignment
            const [result] = await db.query(`
        INSERT INTO homeroom_assignments (class_id, teacher_id, academic_year, semester)
        VALUES (?, ?, ?, ?)
      `, [class_id, teacher_id, academic_year, semester]);
            return result.insertId;
        }
    }

    // Delete homeroom assignment
    static async delete(assignmentId) {
        const [result] = await db.query(
            'DELETE FROM homeroom_assignments WHERE assignment_id = ?',
            [assignmentId]
        );
        return result.affectedRows;
    }
}

module.exports = HomeroomModel;
