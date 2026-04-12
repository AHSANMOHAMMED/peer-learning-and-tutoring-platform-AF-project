const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { targetId, targetType, reason, description } = req.body;
    const report = await Report.create({
      reporterId: req.user.id,
      targetId,
      targetType,
      reason,
      description,
      status: 'pending',
      suspicionScore: Math.floor(Math.random() * 100) // Mock AI score
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'username email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status, moderatorAction } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        moderatorId: req.user.id,
        moderatorAction 
      },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
