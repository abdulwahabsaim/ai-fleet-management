const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

class MaintenanceController {
    // Get all maintenance records
    static async getAllMaintenance(req, res) {
        try {
            const maintenance = await Maintenance.find()
                .populate('vehicle', 'make model licensePlate')
                .populate('assignedTechnician', 'firstName lastName')
                .sort({ scheduledDate: -1 });

            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching maintenance:', error);
            res.status(500).json({ error: 'Failed to fetch maintenance records' });
        }
    }

    // Get maintenance by ID
    static async getMaintenanceById(req, res) {
        try {
            const maintenance = await Maintenance.findById(req.params.id)
                .populate('vehicle', 'make model licensePlate')
                .populate('assignedTechnician', 'firstName lastName');

            if (!maintenance) {
                return res.status(404).json({ error: 'Maintenance record not found' });
            }

            res.json(maintenance);
        } catch (error) {
            console.error('Error fetching maintenance:', error);
            res.status(500).json({ error: 'Failed to fetch maintenance record' });
        }
    }

    // Create new maintenance record
    static async createMaintenance(req, res) {
        try {
            const { vehicle, category, description, scheduledDate, estimatedCost, priority, assignedTechnician } = req.body;
            
            // Basic validation
            if (!vehicle || !category || !description || !scheduledDate) {
                return res.status(400).json({ 
                    error: 'Missing required fields: vehicle, category, description, and scheduledDate are required' 
                });
            }

            // Check if vehicle exists
            const vehicleExists = await Vehicle.findById(vehicle);
            if (!vehicleExists) {
                return res.status(400).json({ 
                    error: 'Vehicle not found' 
                });
            }

            const maintenance = new Maintenance({
                vehicle,
                category,
                description,
                scheduledDate,
                estimatedCost,
                priority: priority || 'medium',
                assignedTechnician,
                status: 'scheduled',
                createdBy: req.session.userId
            });
            
            await maintenance.save();

            res.status(201).json(maintenance);
        } catch (error) {
            console.error('Error creating maintenance:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ 
                    error: 'Validation error', 
                    details: error.message 
                });
            }
            res.status(500).json({ error: 'Failed to create maintenance record' });
        }
    }

    // Update maintenance record
    static async updateMaintenance(req, res) {
        try {
            const maintenance = await Maintenance.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!maintenance) {
                return res.status(404).json({ error: 'Maintenance record not found' });
            }

            res.json(maintenance);
        } catch (error) {
            console.error('Error updating maintenance:', error);
            res.status(500).json({ error: 'Failed to update maintenance record' });
        }
    }

    // Delete maintenance record
    static async deleteMaintenance(req, res) {
        try {
            const maintenance = await Maintenance.findByIdAndDelete(req.params.id);

            if (!maintenance) {
                return res.status(404).json({ error: 'Maintenance record not found' });
            }

            res.json({ message: 'Maintenance record deleted successfully' });
        } catch (error) {
            console.error('Error deleting maintenance:', error);
            res.status(500).json({ error: 'Failed to delete maintenance record' });
        }
    }

    // Get maintenance statistics
    static async getMaintenanceStats(req, res) {
        try {
            const totalMaintenance = await Maintenance.countDocuments();
            const scheduledMaintenance = await Maintenance.countDocuments({ status: 'scheduled' });
            const inProgressMaintenance = await Maintenance.countDocuments({ status: 'in_progress' });
            const completedMaintenance = await Maintenance.countDocuments({ status: 'completed' });
            const overdueMaintenance = await Maintenance.countDocuments({
                status: 'scheduled',
                scheduledDate: { $lt: new Date() }
            });

            res.json({
                total: totalMaintenance,
                scheduled: scheduledMaintenance,
                inProgress: inProgressMaintenance,
                completed: completedMaintenance,
                overdue: overdueMaintenance
            });
        } catch (error) {
            console.error('Error fetching maintenance stats:', error);
            res.status(500).json({ error: 'Failed to fetch maintenance statistics' });
        }
    }
}

module.exports = MaintenanceController; 