// Application constants

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const PASS_MARK_PERCENTAGE = 50;
export const MAX_MARK_PER_SUBJECT = 100;
export const TOTAL_SUBJECTS = 5;
export const MAX_TOTAL_MARKS = 500;

export const SUBJECTS = [
    'Maths',
    'English',
    'Biology',
    'Chemistry',
    'Physics'
];

export const USER_ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    HOMEROOM_TEACHER: 'homeroom_teacher'
};

export const GRADE_LEVELS = [
    '7A', '7B', '7C',
    '8A', '8B', '8C',
    '9A', '9B', '9C',
    '10A', '10B', '10C',
    '11A', '11B', '11C',
    '12A', '12B', '12C'
];

export const SEMESTERS = [
    { value: 1, label: 'Semester I' },
    { value: 2, label: 'Semester II' }
];

export const GENDERS = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' }
];
