// Application constants

module.exports = {
    // Mark constants
    MAX_MARK_PER_SUBJECT: 100,
    TOTAL_SUBJECTS: 5,
    MAX_TOTAL_MARKS: 500,
    PASS_MARK_PERCENTAGE: 50,

    // User roles
    ROLES: {
        ADMIN: 'admin',
        TEACHER: 'teacher',
        HOMEROOM_TEACHER: 'homeroom_teacher'
    },

    // Subjects
    SUBJECTS: ['Maths', 'English', 'Biology', 'Chemistry', 'Physics'],

    // Semesters
    SEMESTERS: [1, 2],

    // Status
    STATUS: {
        PASS: 'PASS',
        FAIL: 'FAIL'
    }
};
