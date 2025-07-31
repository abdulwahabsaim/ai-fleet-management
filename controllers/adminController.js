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
            const onTripVehicles = await Vehicle.countDocuments({ status: 'on_trip' }); // ADDED THIS LINE
            const totalUsers = await User.countDocuments();

            // Get some vehicles for map display (e.g., first 10 or all if not too many)
            const vehiclesForMap = await Vehicle.find().limit(10); // Limit for initial display

            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                totalVehicles,
                activeVehicles,
                inMaintenanceVehicles,
                onTripVehicles,
                totalUsers,
                vehiclesForMap: JSON.stringify(vehiclesForMap), // Pass as string to EJS and parse in JS
                googleMapsApiKey: keys.googleMapsApiKey
                // user, path, pageTitle, success_msg, and error_msg are available via res.locals
            });
        } catch (err) {
            console.error(err);
            // Render the 500 page with the error details for better debugging
            res.status(500).render('500', {
                title: 'Server Error',
                error: err.message
            });
        }
    },

    // Show User Management Page (Admin only)
    listUsers: async (req, res) => {
        try {
            const users = await User.find({});
            res.render('admin/users', {
                title: 'User Management',
                users: users
                // user, path, pageTitle, success_msg, and error_msg are available via res.locals
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