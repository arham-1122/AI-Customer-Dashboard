const Customer = require('../models/Customer');
const ImportHistory = require('../models/ImportHistory');

// @desc    Get dashboard statistics and chart data
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, inactive, newThisMonth, recentCustomers, importStats] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'Active' }),
      Customer.countDocuments({ status: 'Inactive' }),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Customer.find().sort({ createdAt: -1 }).limit(5).select('fullName email company status createdAt'),
      getImportSummary(startOfMonth),
    ]);

    // Monthly customer additions for the last 6 months (Customer Growth Chart / Monthly Additions Chart)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRaw = await Customer.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build a complete 6-month series, filling in zero-count months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyGrowth = [];
    let cumulativeBase = total - monthlyRaw.reduce((sum, m) => sum + m.count, 0);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const match = monthlyRaw.find(
        (m) => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1
      );
      const count = match ? match.count : 0;
      cumulativeBase += count;
      monthlyGrowth.push({
        month: monthNames[d.getMonth()],
        newCustomers: count,
        totalCustomers: cumulativeBase,
      });
    }

    res.json({
      success: true,
      data: {
        totalCustomers: total,
        activeCustomers: active,
        inactiveCustomers: inactive,
        newThisMonth,
        statusDistribution: [
          { name: 'Active', value: active },
          { name: 'Inactive', value: inactive },
        ],
        monthlyGrowth,
        recentCustomers,
        // Import & Export widgets
        importedThisMonth: importStats.importedThisMonth,
        lastImportDate: importStats.lastImportDate,
        totalImportedRecords: importStats.totalImportedRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Aggregates import history into the three dashboard widgets:
// Imported This Month, Last Import Date, Total Imported Records
const getImportSummary = async (startOfMonth) => {
  const [monthAgg, totalAgg, lastImport] = await Promise.all([
    ImportHistory.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, sum: { $sum: '$successfulRecords' } } },
    ]),
    ImportHistory.aggregate([{ $group: { _id: null, sum: { $sum: '$successfulRecords' } } }]),
    ImportHistory.findOne().sort({ createdAt: -1 }).select('createdAt'),
  ]);

  return {
    importedThisMonth: monthAgg[0]?.sum || 0,
    totalImportedRecords: totalAgg[0]?.sum || 0,
    lastImportDate: lastImport?.createdAt || null,
  };
};

module.exports = { getStats };

