const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Route = require('../models/Route');

class TripController {
    // Get all trips
    static async getAllTrips(req, res) {
        try {
            const trips = await Trip.find()
                .populate('vehicle', 'make model licensePlate')
                .populate('driver', 'firstName lastName')
                .populate('route', 'name startLocation endLocation')
                .populate('createdBy', 'username')
                .sort({ scheduledStartTime: -1 });

            res.json(trips);
        } catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).json({ error: 'Failed to fetch trips' });
        }
    }

    // Get trip by ID
    static async getTripById(req, res) {
        try {
            const trip = await Trip.findById(req.params.id)
                .populate('vehicle', 'make model licensePlate')
                .populate('driver', 'firstName lastName')
                .populate('route', 'name startLocation endLocation')
                .populate('createdBy', 'username');

            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }

            res.json(trip);
        } catch (error) {
            console.error('Error fetching trip:', error);
            res.status(500).json({ error: 'Failed to fetch trip' });
        }
    }

    // Create new trip
    static async createTrip(req, res) {
        try {
            const { vehicle, driver, route, scheduledStartTime, scheduledEndTime, description } = req.body;
            
            // Basic validation
            if (!vehicle || !driver || !scheduledStartTime) {
                return res.status(400).json({ 
                    error: 'Missing required fields: vehicle, driver, and scheduledStartTime are required' 
                });
            }

            const trip = new Trip({
                vehicle,
                driver,
                route,
                scheduledStartTime,
                scheduledEndTime,
                description,
                createdBy: req.session.userId,
                status: 'scheduled'
            });
            
            await trip.save();

            res.status(201).json(trip);
        } catch (error) {
            console.error('Error creating trip:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ 
                    error: 'Validation error', 
                    details: error.message 
                });
            }
            res.status(500).json({ error: 'Failed to create trip' });
        }
    }

    // Update trip
    static async updateTrip(req, res) {
        try {
            const trip = await Trip.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }

            res.json(trip);
        } catch (error) {
            console.error('Error updating trip:', error);
            res.status(500).json({ error: 'Failed to update trip' });
        }
    }

    // Delete trip
    static async deleteTrip(req, res) {
        try {
            const trip = await Trip.findByIdAndDelete(req.params.id);

            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }

            res.json({ message: 'Trip deleted successfully' });
        } catch (error) {
            console.error('Error deleting trip:', error);
            res.status(500).json({ error: 'Failed to delete trip' });
        }
    }

    // Get trip statistics
    static async getTripStats(req, res) {
        try {
            const totalTrips = await Trip.countDocuments();
            const completedTrips = await Trip.countDocuments({ status: 'completed' });
            const inProgressTrips = await Trip.countDocuments({ status: 'in_progress' });
            const scheduledTrips = await Trip.countDocuments({ status: 'scheduled' });
            const cancelledTrips = await Trip.countDocuments({ status: 'cancelled' });

            res.json({
                total: totalTrips,
                completed: completedTrips,
                inProgress: inProgressTrips,
                scheduled: scheduledTrips,
                cancelled: cancelledTrips
            });
        } catch (error) {
            console.error('Error fetching trip stats:', error);
            res.status(500).json({ error: 'Failed to fetch trip statistics' });
        }
    }

    // Start trip
    static async startTrip(req, res) {
        try {
            const trip = await Trip.findById(req.params.id);
            
            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }

            if (trip.status !== 'scheduled') {
                return res.status(400).json({ error: 'Trip is not scheduled' });
            }

            trip.status = 'in_progress';
            trip.actualStartTime = new Date();
            await trip.save();

            res.json(trip);
        } catch (error) {
            console.error('Error starting trip:', error);
            res.status(500).json({ error: 'Failed to start trip' });
        }
    }

    // Complete trip
    static async completeTrip(req, res) {
        try {
            const trip = await Trip.findById(req.params.id);
            
            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }

            if (trip.status !== 'in_progress') {
                return res.status(400).json({ error: 'Trip is not in progress' });
            }

            trip.status = 'completed';
            trip.actualEndTime = new Date();
            trip.actualDuration = trip.actualEndTime - trip.actualStartTime;
            trip.actualFuelConsumption = req.body.actualFuelConsumption || trip.plannedFuelConsumption;
            trip.actualDistance = req.body.actualDistance || trip.plannedDistance;
            trip.efficiencyScore = req.body.efficiencyScore || 85;
            
            await trip.save();

            res.json(trip);
        } catch (error) {
            console.error('Error completing trip:', error);
            res.status(500).json({ error: 'Failed to complete trip' });
        }
    }

    // Cancel trip
    static async cancelTrip(req, res) {
        try {
            const trip = await Trip.findById(req.params.id);
            
            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }

            if (trip.status === 'completed') {
                return res.status(400).json({ error: 'Cannot cancel completed trip' });
            }

            trip.status = 'cancelled';
            trip.cancellationReason = req.body.cancellationReason;
            await trip.save();

            res.json(trip);
        } catch (error) {
            console.error('Error cancelling trip:', error);
            res.status(500).json({ error: 'Failed to cancel trip' });
        }
    }
}

module.exports = TripController; 