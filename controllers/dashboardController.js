const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Maintenance = require('../models/Maintenance');
const Driver = require('../models/Driver');
const User = require('../models/User');

// Dashboard analytics controller
class DashboardController {
    // Get main dashboard data
    static async getDashboardData(req, res) {
        try {
            const userId = req.session.userId;
            const userRole = req.session.userRole;

            // Get fleet overview
            const totalVehicles = await Vehicle.countDocuments();
            const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
            const vehiclesInMaintenance = await Vehicle.countDocuments({ status: 'in_maintenance' });
            const vehiclesOnTrip = await Vehicle.countDocuments({ status: 'on_trip' });

            // Get trip statistics
            const totalTrips = await Trip.countDocuments();
            const completedTrips = await Trip.countDocuments({ status: 'completed' });
            const activeTrips = await Trip.countDocuments({ status: 'in_progress' });

            // Get maintenance alerts
            const overdueMaintenance = await Maintenance.countDocuments({ 
                status: 'scheduled', 
                scheduledDate: { $lt: new Date() } 
            });
            const criticalMaintenance = await Maintenance.countDocuments({ 
                riskLevel: 'critical' 
            });

            // Get fuel consumption data
            const fuelData = await Vehicle.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFuelConsumed: { $sum: '$totalFuelConsumed' },
                        averageConsumption: { $avg: '$averageFuelConsumption' }
                    }
                }
            ]);

            // Get performance metrics
            const performanceData = await Vehicle.aggregate([
                {
                    $group: {
                        _id: null,
                        averageHealthScore: { $avg: '$healthScore' },
                        averageEfficiencyScore: { $avg: '$efficiencyScore' }
                    }
                }
            ]);

            // Get recent trips
            const recentTrips = await Trip.find()
                .populate('vehicle', 'make model licensePlate')
                .populate('driver', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5);

            // Get upcoming maintenance
            const upcomingMaintenance = await Maintenance.find({
                status: 'scheduled',
                scheduledDate: { $gte: new Date() }
            })
            .populate('vehicle', 'make model licensePlate')
            .sort({ scheduledDate: 1 })
            .limit(5);

            // Calculate AI predictions
            const aiPredictions = await DashboardController.generateAIPredictions();

            const dashboardData = {
                fleet: {
                    total: totalVehicles,
                    active: activeVehicles,
                    inMaintenance: vehiclesInMaintenance,
                    onTrip: vehiclesOnTrip
                },
                trips: {
                    total: totalTrips,
                    completed: completedTrips,
                    active: activeTrips
                },
                maintenance: {
                    overdue: overdueMaintenance,
                    critical: criticalMaintenance
                },
                fuel: fuelData[0] || { totalFuelConsumed: 0, averageConsumption: 0 },
                performance: performanceData[0] || { averageHealthScore: 0, averageEfficiencyScore: 0 },
                recentTrips,
                upcomingMaintenance,
                aiPredictions
            };

            res.json(dashboardData);
        } catch (error) {
            console.error('Dashboard data error:', error);
            res.status(500).json({ error: 'Failed to load dashboard data' });
        }
    }

    // Generate AI predictions for fleet optimization
    static async generateAIPredictions() {
        try {
            // Get vehicles that need maintenance prediction
            const vehicles = await Vehicle.find();
            const predictions = [];

            for (const vehicle of vehicles) {
                // Calculate health score
                vehicle.calculateHealthScore();
                
                // Predict next maintenance
                const maintenancePrediction = vehicle.predictNextMaintenance();
                
                // Calculate efficiency score based on fuel consumption
                const efficiencyScore = Math.max(0, 100 - (vehicle.averageFuelConsumption - 15) * 2);
                vehicle.efficiencyScore = efficiencyScore;

                // Generate prediction insights
                const prediction = {
                    vehicleId: vehicle._id,
                    licensePlate: vehicle.licensePlate,
                    make: vehicle.make,
                    model: vehicle.model,
                    healthScore: vehicle.healthScore,
                    efficiencyScore: vehicle.efficiencyScore,
                    nextMaintenance: maintenancePrediction,
                    recommendations: []
                };

                // Generate recommendations based on scores
                if (vehicle.healthScore < 70) {
                    prediction.recommendations.push({
                        type: 'maintenance',
                        priority: 'high',
                        message: 'Vehicle requires immediate maintenance attention'
                    });
                }

                if (vehicle.efficiencyScore < 60) {
                    prediction.recommendations.push({
                        type: 'efficiency',
                        priority: 'medium',
                        message: 'Consider driver training or route optimization'
                    });
                }

                if (vehicle.currentFuelLevel < vehicle.fuelCapacity * 0.2) {
                    prediction.recommendations.push({
                        type: 'fuel',
                        priority: 'medium',
                        message: 'Low fuel level detected'
                    });
                }

                predictions.push(prediction);
                await vehicle.save();
            }

            return predictions;
        } catch (error) {
            console.error('AI prediction error:', error);
            return [];
        }
    }

    // Get analytics data for charts
    static async getAnalyticsData(req, res) {
        try {
            const { period = 'month' } = req.query;
            
            // Get fuel consumption over time
            const fuelConsumption = await DashboardController.getFuelConsumptionData(period);
            
            // Get trip efficiency data
            const tripEfficiency = await DashboardController.getTripEfficiencyData(period);
            
            // Get maintenance costs
            const maintenanceCosts = await DashboardController.getMaintenanceCostData(period);
            
            // Get vehicle performance trends
            const performanceTrends = await DashboardController.getPerformanceTrendData(period);

            res.json({
                fuelConsumption,
                tripEfficiency,
                maintenanceCosts,
                performanceTrends
            });
        } catch (error) {
            console.error('Analytics error:', error);
            res.status(500).json({ error: 'Failed to load analytics data' });
        }
    }

    // Get fuel consumption data for charts
    static async getFuelConsumptionData(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const trips = await Trip.find({
            createdAt: { $gte: startDate },
            status: 'completed'
        }).select('actualFuelConsumption createdAt');

        // Group by date
        const groupedData = {};
        trips.forEach(trip => {
            const date = trip.createdAt.toISOString().split('T')[0];
            if (!groupedData[date]) {
                groupedData[date] = 0;
            }
            groupedData[date] += trip.actualFuelConsumption;
        });

        return Object.entries(groupedData).map(([date, consumption]) => ({
            date,
            consumption
        }));
    }

    // Get trip efficiency data
    static async getTripEfficiencyData(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const trips = await Trip.find({
            createdAt: { $gte: startDate },
            status: 'completed'
        }).select('efficiencyScore createdAt');

        // Group by date
        const groupedData = {};
        const countData = {};
        
        trips.forEach(trip => {
            const date = trip.createdAt.toISOString().split('T')[0];
            if (!groupedData[date]) {
                groupedData[date] = 0;
                countData[date] = 0;
            }
            groupedData[date] += trip.efficiencyScore;
            countData[date]++;
        });

        return Object.entries(groupedData).map(([date, totalScore]) => ({
            date,
            averageEfficiency: totalScore / countData[date]
        }));
    }

    // Get maintenance cost data
    static async getMaintenanceCostData(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const maintenance = await Maintenance.find({
            createdAt: { $gte: startDate },
            status: 'completed'
        }).select('actualCost category createdAt');

        // Group by category
        const groupedData = {};
        maintenance.forEach(maint => {
            if (!groupedData[maint.category]) {
                groupedData[maint.category] = 0;
            }
            groupedData[maint.category] += maint.actualCost;
        });

        return Object.entries(groupedData).map(([category, cost]) => ({
            category,
            cost
        }));
    }

    // Get performance trend data
    static async getPerformanceTrendData(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const vehicles = await Vehicle.find({
            createdAt: { $gte: startDate }
        }).select('healthScore efficiencyScore createdAt');

        // Group by date
        const groupedData = {};
        const countData = {};
        
        vehicles.forEach(vehicle => {
            const date = vehicle.createdAt.toISOString().split('T')[0];
            if (!groupedData[date]) {
                groupedData[date] = { health: 0, efficiency: 0 };
                countData[date] = 0;
            }
            groupedData[date].health += vehicle.healthScore;
            groupedData[date].efficiency += vehicle.efficiencyScore;
            countData[date]++;
        });

        return Object.entries(groupedData).map(([date, scores]) => ({
            date,
            averageHealth: scores.health / countData[date],
            averageEfficiency: scores.efficiency / countData[date]
        }));
    }
}

module.exports = DashboardController; 