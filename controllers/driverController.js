const Driver = require('../models/Driver');
const User = require('../models/User');

class DriverController {
    // Get all drivers
    static async getAllDrivers(req, res) {
        try {
            const drivers = await Driver.find()
                .populate('user', 'username email')
                .sort({ firstName: 1 });

            res.json(drivers);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            res.status(500).json({ error: 'Failed to fetch drivers' });
        }
    }

    // Get driver by ID
    static async getDriverById(req, res) {
        try {
            const driver = await Driver.findById(req.params.id)
                .populate('user', 'username email');

            if (!driver) {
                return res.status(404).json({ error: 'Driver not found' });
            }

            res.json(driver);
        } catch (error) {
            console.error('Error fetching driver:', error);
            res.status(500).json({ error: 'Failed to fetch driver' });
        }
    }

    // Create new driver
    static async createDriver(req, res) {
        try {
            const { firstName, lastName, email, phone, licenseNumber, licenseExpiry, status } = req.body;
            
            // Basic validation
            if (!firstName || !lastName || !email || !licenseNumber) {
                return res.status(400).json({ 
                    error: 'Missing required fields: firstName, lastName, email, and licenseNumber are required' 
                });
            }

            // Check if driver with same license number already exists
            const existingDriver = await Driver.findOne({ licenseNumber });
            if (existingDriver) {
                return res.status(400).json({ 
                    error: 'Driver with this license number already exists' 
                });
            }

            const driver = new Driver({
                firstName,
                lastName,
                email,
                phone,
                licenseNumber,
                licenseExpiry,
                status: status || 'active',
                createdBy: req.session.userId
            });
            
            await driver.save();

            res.status(201).json(driver);
        } catch (error) {
            console.error('Error creating driver:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ 
                    error: 'Validation error', 
                    details: error.message 
                });
            }
            res.status(500).json({ error: 'Failed to create driver' });
        }
    }

    // Update driver
    static async updateDriver(req, res) {
        try {
            const driver = await Driver.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!driver) {
                return res.status(404).json({ error: 'Driver not found' });
            }

            res.json(driver);
        } catch (error) {
            console.error('Error updating driver:', error);
            res.status(500).json({ error: 'Failed to update driver' });
        }
    }

    // Delete driver
    static async deleteDriver(req, res) {
        try {
            const driver = await Driver.findByIdAndDelete(req.params.id);

            if (!driver) {
                return res.status(404).json({ error: 'Driver not found' });
            }

            res.json({ message: 'Driver deleted successfully' });
        } catch (error) {
            console.error('Error deleting driver:', error);
            res.status(500).json({ error: 'Failed to delete driver' });
        }
    }

    // Get driver statistics
    static async getDriverStats(req, res) {
        try {
            const totalDrivers = await Driver.countDocuments();
            const activeDrivers = await Driver.countDocuments({ status: 'active' });
            const onTripDrivers = await Driver.countDocuments({ status: 'on_trip' });
            const onLeaveDrivers = await Driver.countDocuments({ status: 'on_leave' });
            const suspendedDrivers = await Driver.countDocuments({ status: 'suspended' });

            res.json({
                total: totalDrivers,
                active: activeDrivers,
                onTrip: onTripDrivers,
                onLeave: onLeaveDrivers,
                suspended: suspendedDrivers
            });
        } catch (error) {
            console.error('Error fetching driver stats:', error);
            res.status(500).json({ error: 'Failed to fetch driver statistics' });
        }
    }

    // Get available drivers
    static async getAvailableDrivers(req, res) {
        try {
            const availableDrivers = await Driver.find({
                status: 'active',
                availability: 'available'
            }).populate('user', 'username email');

            res.json(availableDrivers);
        } catch (error) {
            console.error('Error fetching available drivers:', error);
            res.status(500).json({ error: 'Failed to fetch available drivers' });
        }
    }
}

module.exports = DriverController; 