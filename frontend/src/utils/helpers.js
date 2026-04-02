// Helper utility functions

export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const calculateAverage = (marks) => {
    if (!marks || marks.length === 0) return 0;
    const sum = marks.reduce((acc, mark) => acc + mark, 0);
    return (sum / marks.length).toFixed(2);
};

export const calculateTotal = (marks) => {
    if (!marks || marks.length === 0) return 0;
    return marks.reduce((acc, mark) => acc + mark, 0);
};

export const determineStatus = (average, passMarkPercentage = 50) => {
    return average >= passMarkPercentage ? 'PASS' : 'FAIL';
};

export const formatStudentId = (id, year) => {
    return `MIN${String(id).padStart(3, '0')}/${year}`;
};

export const validateMark = (mark, maxMark = 100) => {
    const numMark = Number(mark);
    return numMark >= 0 && numMark <= maxMark;
};
