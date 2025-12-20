const express = require("express");
const AdminDashboardController = require("../controllers/adminDashboardController");

const router = express.Router();

// Admin Dashboard API
router.get("/", AdminDashboardController.getDashboardData);

module.exports = router;
