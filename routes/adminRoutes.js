const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

// @route   GET /admin/dashboard
// @desc    Admin dashboard (requires admin role)
router.get('/dashboard', ensureAuthenticated, ensureAdmin, adminController.showDashboard);

// @route   GET /admin/users
// @desc    List and manage users (requires admin role)
router.get('/users', ensureAuthenticated, ensureAdmin, adminController.listUsers);

module.exports = router;