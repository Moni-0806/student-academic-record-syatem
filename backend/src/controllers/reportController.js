const ReportService = require('../services/reportService');

// Generate class report
exports.getClassReport = async (req, res) => {
  try {
    const { classId, academicYear, semester } = req.query;

    if (!classId || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Class ID, academic year, and semester are required'
      });
    }

    const report = await ReportService.generateClassReport(
      classId,
      academicYear,
      parseInt(semester)
    );

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate student report
exports.getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;

    if (!academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Academic year and semester are required'
      });
    }

    const report = await ReportService.generateStudentReport(
      studentId,
      academicYear,
      parseInt(semester)
    );

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get subject performance for a class
exports.getSubjectPerformance = async (req, res) => {
  try {
    const { classId, academicYear, semester } = req.query;

    if (!classId || !academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Class ID, academic year, and semester are required'
      });
    }

    const performance = await ReportService.getSubjectPerformance(
      classId,
      academicYear,
      parseInt(semester)
    );

    res.json({ success: true, data: performance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get overall statistics
exports.getOverallStatistics = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;

    if (!academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Academic year and semester are required'
      });
    }

    const stats = await ReportService.getOverallStatistics(
      academicYear,
      parseInt(semester)
    );

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
