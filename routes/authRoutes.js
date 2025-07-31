const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

// @route   GET /auth/login
// @desc    Show login form
router.get('/login', authController.showLoginPage);

// @route   POST /auth/login
// @desc    Handle login submission
router.post('/login', authController.loginUser);

// @route   GET /auth/register
// @desc    Show registration form (SECURED: Admin Only)
router.get('/register', ensureAuthenticated, ensureAdmin, authController.showRegisterPage);

// @route   POST /auth/register
// @desc    Handle registration submission (SECURED: Admin Only)
router.post('/register', ensureAuthenticated, ensureAdmin, authController.registerUser);

// @route   GET /auth/logout
// @desc    Log out user
router.get('/logout', authController.logoutUser);

module.exports = router;