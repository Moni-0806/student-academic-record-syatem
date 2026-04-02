const db = require('../config/database');

class ReportService {
    /**
     * Generate complete class report with all calculations
     */
    static async generateClassReport(classId, academicYear, semester) {
        try {
            const query = `
                SELECT 
                    s.student_id,
                    s.student_name,
                    s.gender,
                    s.student_code,
                    c.class_name,
                    c.grade_level,
                    t.teacher_name as homeroom_teacher,
                    
                    -- Individual subject marks (using 'mark' column)
                    MAX(CASE WHEN sub.subject_code = 'MATH' THEN m.mark END) as maths,
                    MAX(CASE WHEN sub.subject_code = 'ENG' THEN m.mark END) as english,
                    MAX(CASE WHEN sub.subject_code = 'BIO' THEN m.mark END) as biology,
                    MAX(CASE WHEN sub.subject_code = 'CHEM' THEN m.mark END) as chemistry,
                    MAX(CASE WHEN sub.subject_code = 'PHY' THEN m.mark END) as physics,
                    
                    -- Calculations
                    SUM(m.mark) as total,
                    ROUND(AVG(m.mark), 2) as average,
                    
                    -- Status: PASS if average >= 50, else FAIL
                    CASE 
                        WHEN AVG(m.mark) >= 50 THEN 'PASS'
                        ELSE 'FAIL'
                    END as status
                    
                FROM students s
                JOIN classes c ON s.class_id = c.class_id
                JOIN marks m ON s.student_id = m.student_id 
                    AND m.academic_year = ? 
                    AND m.semester = ?
                LEFT JOIN subjects sub ON m.subject_id = sub.subject_id
                LEFT JOIN homeroom_assignments ha ON c.class_id = ha.class_id 
                    AND ha.academic_year = ? 
                    AND ha.semester = ?
                LEFT JOIN teachers t ON ha.teacher_id = t.teacher_id
                WHERE s.class_id = ?
                  AND s.academic_year = ?
                  AND s.semester = ?
                GROUP BY s.student_id, s.student_name, s.gender, s.student_code,
                         c.class_name, c.grade_level, t.teacher_name
                ORDER BY total DESC
            `;

            const [students] = await db.query(query, [
                academicYear, semester, academicYear, semester, classId, academicYear, semester
            ]);

            // Add rank to each student
            students.forEach((student, index) => {
                student.rank = index + 1;
            });

            return {
                class_info: {
                    class_name: students[0]?.class_name || '',
                    grade_level: students[0]?.grade_level || '',
                    homeroom_teacher: students[0]?.homeroom_teacher || 'Not Assigned',
                    academic_year: academicYear,
                    semester: semester
                },
                students: students,
                summary: {
                    total_students: students.length,
                    passed: students.filter(s => s.status === 'PASS').length,
                    failed: students.filter(s => s.status === 'FAIL').length,
                    class_average: students.length > 0
                        ? (students.reduce((sum, s) => sum + parseFloat(s.average || 0), 0) / students.length).toFixed(2)
                        : 0
                }
            };
        } catch (error) {
            throw new Error(`Error generating class report: ${error.message}`);
        }
    }

    /**
     * Generate individual student report
     */
    static async generateStudentReport(studentId, academicYear, semester) {
        try {
            const query = `
                SELECT 
                    s.student_id,
                    s.student_name,
                    s.gender,
                    s.student_code,
                    c.class_name,
                    c.grade_level,
                    
                    -- Subject marks (using 'mark' column)
                    sub.subject_name,
                    sub.subject_code,
                    m.mark as mark_value,
                    
                    -- Pass/Fail per subject
                    CASE 
                        WHEN m.mark >= 50 THEN 'PASS'
                        ELSE 'FAIL'
                    END as subject_status
                    
                FROM students s
                JOIN classes c ON s.class_id = c.class_id
                LEFT JOIN marks m ON s.student_id = m.student_id 
                    AND m.academic_year = ? 
                    AND m.semester = ?
                LEFT JOIN subjects sub ON m.subject_id = sub.subject_id
                WHERE s.student_id = ?
                ORDER BY sub.subject_code
            `;

            const [marks] = await db.query(query, [academicYear, semester, studentId]);

            if (marks.length === 0) {
                throw new Error('Student not found or no marks recorded');
            }

            // Calculate totals
            const total = marks.reduce((sum, m) => sum + parseFloat(m.mark_value || 0), 0);
            const average = marks.length > 0 ? (total / marks.length).toFixed(2) : 0;
            const status = average >= 50 ? 'PASS' : 'FAIL';

            // Get rank within class
            const rankQuery = `
                SELECT COUNT(*) + 1 as rank
                FROM (
                    SELECT student_id, SUM(mark) as total
                    FROM marks
                    WHERE academic_year = ? AND semester = ?
                    GROUP BY student_id
                    HAVING total > ?
                ) as higher_totals
            `;
            const [rankResult] = await db.query(rankQuery, [academicYear, semester, total]);

            return {
                student_info: {
                    student_id: marks[0].student_id,
                    student_name: marks[0].student_name,
                    student_code: marks[0].student_code,
                    gender: marks[0].gender,
                    class_name: marks[0].class_name,
                    grade_level: marks[0].grade_level
                },
                marks: marks.map(m => ({
                    subject_name: m.subject_name,
                    subject_code: m.subject_code,
                    mark_value: m.mark_value,
                    status: m.subject_status
                })),
                summary: {
                    total: total,
                    average: average,
                    rank: rankResult[0]?.rank || 1,
                    status: status,
                    academic_year: academicYear,
                    semester: semester
                }
            };
        } catch (error) {
            throw new Error(`Error generating student report: ${error.message}`);
        }
    }

    /**
     * Get subject-wise performance for a class
     */
    static async getSubjectPerformance(classId, academicYear, semester) {
        try {
            const query = `
                SELECT 
                    sub.subject_name,
                    sub.subject_code,
                    COUNT(DISTINCT m.student_id) as total_students,
                    ROUND(AVG(m.mark), 2) as average_mark,
                    MAX(m.mark) as highest_mark,
                    MIN(m.mark) as lowest_mark,
                    SUM(CASE WHEN m.mark >= 50 THEN 1 ELSE 0 END) as passed,
                    SUM(CASE WHEN m.mark < 50 THEN 1 ELSE 0 END) as failed
                FROM subjects sub
                LEFT JOIN marks m ON sub.subject_id = m.subject_id
                    AND m.academic_year = ?
                    AND m.semester = ?
                LEFT JOIN students s ON m.student_id = s.student_id
                WHERE s.class_id = ?
                GROUP BY sub.subject_id, sub.subject_name, sub.subject_code
                ORDER BY sub.subject_code
            `;

            const [performance] = await db.query(query, [academicYear, semester, classId]);
            return performance;
        } catch (error) {
            throw new Error(`Error getting subject performance: ${error.message}`);
        }
    }

    /**
     * Get overall statistics
     */
    static async getOverallStatistics(academicYear, semester) {
        try {
            const query = `
                SELECT 
                    COUNT(DISTINCT s.student_id) as total_students,
                    COUNT(DISTINCT c.class_id) as total_classes,
                    COUNT(DISTINCT sub.subject_id) as total_subjects,
                    ROUND(AVG(m.mark), 2) as overall_average,
                    SUM(CASE WHEN m.mark >= 50 THEN 1 ELSE 0 END) as total_passes,
                    SUM(CASE WHEN m.mark < 50 THEN 1 ELSE 0 END) as total_failures
                FROM students s
                LEFT JOIN marks m ON s.student_id = m.student_id
                    AND m.academic_year = ?
                    AND m.semester = ?
                LEFT JOIN classes c ON s.class_id = c.class_id
                LEFT JOIN subjects sub ON m.subject_id = sub.subject_id
            `;

            const [stats] = await db.query(query, [academicYear, semester]);
            return stats[0];
        } catch (error) {
            throw new Error(`Error getting overall statistics: ${error.message}`);
        }
    }
}

module.exports = ReportService;
