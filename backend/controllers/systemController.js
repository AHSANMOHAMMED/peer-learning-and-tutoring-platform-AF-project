const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Booking = require('../models/Booking');
const Material = require('../models/Material');

// @desc    Get global analytics for Super Admin
// @route   GET /api/system/analytics
// @access  Private/SuperAdmin
exports.getGlobalAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTutors = await Tutor.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalMaterials = await Material.countDocuments();

    // Financial Overview (LKR)
    const financialStats = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' }, avgSessionPrice: { $avg: '$price' } } }
    ]);

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', value: { $sum: 1 } } }
    ]);

    // Time-series Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const timeSeriesData = await Booking.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sessions: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$price", 0] }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formattedTimeSeries = timeSeriesData.map(item => {
      const date = new Date(item._id);
      return {
        name: daysMap[date.getDay()],
        sessions: item.sessions,
        amount: item.revenue,
        revenue: item.revenue,
        fullDate: item._id
      };
    });

    // Recent activity
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('studentId', 'username').populate('tutorId', 'userId');

    res.json({
      summary: {
        totalUsers,
        totalTutors,
        totalBookings,
        totalMaterials,
        totalRevenue: financialStats[0]?.totalRevenue || 0,
        avgSessionPrice: financialStats[0]?.avgSessionPrice || 0
      },
      roleDistribution: roleDistribution.map(role => ({
        name: role._id, 
        value: role.value,
        color: role._id === 'student' ? '#6366f1' : role._id === 'tutor' ? '#2dd4bf' : '#a855f7'
      })),
      timeSeriesData: formattedTimeSeries,
      recentBookings,
      systemStatus: 'Healthy',
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
