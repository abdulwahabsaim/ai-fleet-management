const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = {
    // Show login form
    showLoginPage: (req, res) => {
        res.render('auth/login', {
            error_msg: req.flash('error_msg'),
            success_msg: req.flash('success_msg')
        });
    },

    // Handle login form submission
    loginUser: async (req, res, next) => {
        const { username, password } = req.body;
        try {
            const user = await User.findOne({ username });
            if (!user || !(await user.comparePassword(password))) {
                req.flash('error_msg', 'Invalid credentials');
                return res.redirect('/auth/login');
            }
            req.session.userId = user._id;
            req.session.username = user.username;
            req.session.userRole = user.role;
            req.session.isAuthenticated = true;

            req.session.save((err) => {
                if (err) return next(err);
                req.flash('success_msg', 'You are now logged in.');
                res.redirect('/admin/dashboard');
            });
        } catch (err) {
            next(err);
        }
    },

    // Show registration form
    showRegisterPage: (req, res) => {
        res.render('auth/register', {
            error_msg: req.flash('error_msg'),
            success_msg: req.flash('success_msg')
        });
    },

    // Handle user registration
    registerUser: async (req, res, next) => {
        const { username, password, password2, role } = req.body;
        if (password !== password2) {
            req.flash('error_msg', 'Passwords do not match.');
            return res.redirect('/auth/register');
        }
        try {
            if (await User.findOne({ username })) {
                req.flash('error_msg', 'Username already exists.');
                return res.redirect('/auth/register');
            }
            const newUser = new User({ username, password, role });
            await newUser.save();
            
            // --- FIX 1: Change the success message for the admin ---
            req.flash('success_msg', `User '${username}' has been created successfully.`);
            
            // --- FIX 2: Redirect the admin to the user list, NOT the login page ---
            res.redirect('/admin/users');

        } catch (err) {
            next(err);
        }
    },

    // Handle user logout
    logoutUser: (req, res, next) => {
        req.session.destroy(err => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid');
            res.redirect('/auth/login');
        });
    }
};