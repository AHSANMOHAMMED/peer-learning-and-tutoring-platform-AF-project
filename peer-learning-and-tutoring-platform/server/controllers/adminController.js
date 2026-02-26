const User = require('../models/User');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const Material = require('../models/Material');

// Get aggregated statistics for admin dashboard
const getDashboardStatistics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTutors,
      totalStudents,
      totalSessions,
      pendingReports,
      pendingMaterials
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'tutor' }),
      User.countDocuments({ role: 'student' }),
      Booking.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Material.countDocuments({ status: 'pending' })
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalTutors,
        totalStudents,
        totalSessions,
        pendingReports,
        pendingMaterials
      }
    });
  } catch (error) {
    console.error('Admin dashboard statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStatistics
};

