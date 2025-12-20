const AdminDashboardModel = require("../models/adminDashboardModel");

const AdminDashboardController = {

  getDashboardData: async (req, res) => {
    try {
      const stats = await AdminDashboardModel.getStats();
      const activities = await AdminDashboardModel.getRecentActivity();

      res.status(200).json({
        stats,
        activities
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Dashboard data fetch failed" });
    }
  }

};

module.exports = AdminDashboardController;
