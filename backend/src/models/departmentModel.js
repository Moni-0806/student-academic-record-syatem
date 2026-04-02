const db = require('../config/database');

class Department {
    static async findAll() {
        const [rows] = await db.query('SELECT * FROM departments ORDER BY department_name');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM departments WHERE department_id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { department_name, description } = data;
        const [result] = await db.query(
            'INSERT INTO departments (department_name, description) VALUES (?, ?)',
            [department_name, description]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { department_name, description } = data;
        const [result] = await db.query(
            'UPDATE departments SET department_name = ?, description = ? WHERE department_id = ?',
            [department_name, description, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM departments WHERE department_id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Department;
