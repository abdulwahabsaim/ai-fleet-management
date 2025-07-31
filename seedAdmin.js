// File: seedAdmin.js
// Description: A one-time script to create a default admin user.

const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path if your models are elsewhere
require('dotenv').config(); // To load the MONGODB_URI from your .env file

// --- Admin User Details ---
const ADMIN_USERNAME = 'fitter';
const ADMIN_PASSWORD = '123';
const ADMIN_ROLE = 'admin';
// --------------------------

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    try {
        await dbConnect();

        // Check if the admin user already exists
        const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });
        if (existingAdmin) {
            console.log(`Admin user '${ADMIN_USERNAME}' already exists.`);
            return; // Exit if admin already exists
        }

        // If admin does not exist, create a new one
        const adminUser = new User({
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD, // The password will be hashed by the pre-save hook in your User model
            role: ADMIN_ROLE,
        });

        await adminUser.save();
        console.log(`Admin user '${ADMIN_USERNAME}' created successfully!`);

    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        // Ensure the database connection is closed
        await mongoose.disconnect();
        console.log('MongoDB connection closed.');
    }
};

// Run the seeding function
seedAdmin();