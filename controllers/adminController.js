const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const keys = require('../config/keys'); // For Google Maps API key

module.exports = {
    // Show Admin Dashboard
    showDashboard: async (req, res) => {
        try {
            const totalVehicles = await Vehicle.countDocuments();
            const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
            const inMaintenanceVehicles = await Vehicle.countDocuments({ status: 'in_maintenance' });
            const totalUsers = await User.countDocuments();

            // Get some vehicles for map display (e.g., first 10 or all if not too many)
            const vehiclesForMap = await Vehicle.find().limit(10); // Limit for initial display

            res.render('admin/dashboard', { // Removed layout: 'main'
                totalVehicles,
                activeVehicles,
                inMaintenanceVehicles,
                totalUsers,
                vehiclesForMap: JSON.stringify(vehiclesForMap), // Pass as string to EJS and parse in JS
                googleMapsApiKey: keys.googleMapsApiKey,
                success_msg: req.flash('success_msg'),
                error_msg: req.flash('error_msg')
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error loading dashboard data.');
            res.redirect('/auth/login'); // Redirect to login or a generic error page
        }
    },

    // Show User Management Page (Admin only)
    listUsers: async (req, res) => {
        try {
            const users = await User.find({});
            res.render('admin/users', { // Removed layout: 'main'
                users: users,
                success_msg: req.flash('success_msg'),
                error_msg: req.flash('error_msg')
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error retrieving users.');
            res.redirect('/admin/dashboard');
        }
    },

    // Placeholder for editing/deleting users if needed in Phase 1 (not explicitly asked)
    // deleteUser: async (req, res) => { /* ... */ }
};