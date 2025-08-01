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

            // Get fleet overview with error handling
            let totalVehicles = 0, activeVehicles = 0, vehiclesInMaintenance = 0, vehiclesOnTrip = 0;
            try {
                totalVehicles = await Vehicle.countDocuments();
                activeVehicles = await Vehicle.countDocuments({ status: 'active' });
                vehiclesInMaintenance = await Vehicle.countDocuments({ status: 'in_maintenance' });
                vehiclesOnTrip = await Vehicle.countDocuments({ status: 'on_trip' });
            } catch (error) {
                console.error('Error getting vehicle counts:', error);
            }

            // Get trip statistics with error handling
            let totalTrips = 0, completedTrips = 0, activeTrips = 0;
            try {
                totalTrips = await Trip.countDocuments();
                completedTrips = await Trip.countDocuments({ status: 'completed' });
                activeTrips = await Trip.countDocuments({ status: 'in_progress' });
            } catch (error) {
                console.error('Error getting trip counts:', error);
            }

            // Get maintenance alerts with error handling
            let overdueMaintenance = 0, criticalMaintenance = 0;
            try {
                overdueMaintenance = await Maintenance.countDocuments({ 
                    status: 'scheduled', 
                    scheduledDate: { $lt: new Date() } 
                });
                criticalMaintenance = await Maintenance.countDocuments({ 
                    riskLevel: 'critical' 
                });
            } catch (error) {
                console.error('Error getting maintenance counts:', error);
            }

            // Get fuel consumption data with error handling
            let fuelData = [{ totalFuelConsumed: 0, averageConsumption: 0 }];
            try {
                fuelData = await Vehicle.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalFuelConsumed: { $sum: '$totalFuelConsumed' },
                            averageConsumption: { $avg: '$averageFuelConsumption' }
                        }
                    }
                ]);
            } catch (error) {
                console.error('Error getting fuel data:', error);
            }

            // Get performance metrics with error handling
            let performanceData = [{ averageHealthScore: 0, averageEfficiencyScore: 0 }];
            try {
                performanceData = await Vehicle.aggregate([
                    {
                        $group: {
                            _id: null,
                            averageHealthScore: { $avg: '$healthScore' },
                            averageEfficiencyScore: { $avg: '$efficiencyScore' }
                        }
                    }
                ]);
            } catch (error) {
                console.error('Error getting performance data:', error);
            }

            // Get recent trips with error handling
            let recentTrips = [];
            try {
                recentTrips = await Trip.find()
                    .populate('vehicle', 'make model licensePlate')
                    .populate('driver', 'firstName lastName')
                    .sort({ createdAt: -1 })
                    .limit(5);
            } catch (error) {
                console.error('Error getting recent trips:', error);
            }

            // Get upcoming maintenance with error handling
            let upcomingMaintenance = [];
            try {
                upcomingMaintenance = await Maintenance.find({
                    status: 'scheduled',
                    scheduledDate: { $gte: new Date() }
                })
                .populate('vehicle', 'make model licensePlate')
                .sort({ scheduledDate: 1 })
                .limit(5);
            } catch (error) {
                console.error('Error getting upcoming maintenance:', error);
            }

            // Calculate AI predictions with error handling
            let aiPredictions = [];
            try {
                aiPredictions = await DashboardController.generateAIPredictions();
            } catch (error) {
                console.error('Error generating AI predictions:', error);
            }

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
            res.status(500).json({ 
                error: 'Failed to load dashboard data',
                message: error.message 
            });
        }
    }

    // Generate AI predictions for fleet optimization
    static async generateAIPredictions() {
        try {
            // Get vehicles that need maintenance prediction
            const vehicles = await Vehicle.find();
            const predictions = [];

            for (const vehicle of vehicles) {
                try {
                    // Calculate health score
                    vehicle.calculateHealthScore();
                    
                    // Predict next maintenance
                    const maintenancePrediction = vehicle.predictNextMaintenance();
                    
                    // Calculate efficiency score based on fuel consumption
                    const efficiencyScore = Math.min(100, Math.max(0, 100 - ((vehicle.averageFuelConsumption || 0) - 15) * 2));
                    vehicle.efficiencyScore = efficiencyScore;

                    // Generate prediction insights
                    const prediction = {
                        vehicleId: vehicle._id,
                        licensePlate: vehicle.licensePlate || 'N/A',
                        make: vehicle.make || 'Unknown',
                        model: vehicle.model || 'Unknown',
                        healthScore: vehicle.healthScore || 50,
                        efficiencyScore: vehicle.efficiencyScore || 50,
                        nextMaintenance: maintenancePrediction || { nextMileage: 0, nextDate: new Date() },
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

                    if (vehicle.currentFuelLevel && vehicle.fuelCapacity && vehicle.currentFuelLevel < vehicle.fuelCapacity * 0.2) {
                        prediction.recommendations.push({
                            type: 'fuel',
                            priority: 'medium',
                            message: 'Low fuel level detected'
                        });
                    }

                    predictions.push(prediction);
                    
                    // Save vehicle updates
                    try {
                        await vehicle.save();
                    } catch (saveError) {
                        console.error('Error saving vehicle updates:', saveError);
                    }
                } catch (vehicleError) {
                    console.error('Error processing vehicle for AI predictions:', vehicleError);
                    // Add a basic prediction for this vehicle
                    predictions.push({
                        vehicleId: vehicle._id,
                        licensePlate: vehicle.licensePlate || 'N/A',
                        make: vehicle.make || 'Unknown',
                        model: vehicle.model || 'Unknown',
                        healthScore: 50,
                        efficiencyScore: 50,
                        nextMaintenance: { nextMileage: 0, nextDate: new Date() },
                        recommendations: [{
                            type: 'system',
                            priority: 'medium',
                            message: 'Unable to generate predictions for this vehicle'
                        }]
                    });
                }
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
            
            // Get fuel consumption over time with error handling
            let fuelConsumption = [];
            try {
                fuelConsumption = await DashboardController.getFuelConsumptionData(period);
            } catch (error) {
                console.error('Error getting fuel consumption data:', error);
            }
            
            // Get trip efficiency data with error handling
            let tripEfficiency = [];
            try {
                tripEfficiency = await DashboardController.getTripEfficiencyData(period);
            } catch (error) {
                console.error('Error getting trip efficiency data:', error);
            }
            
            // Get maintenance costs with error handling
            let maintenanceCosts = [];
            try {
                maintenanceCosts = await DashboardController.getMaintenanceCostData(period);
            } catch (error) {
                console.error('Error getting maintenance cost data:', error);
            }
            
            // Get vehicle performance trends with error handling
            let performanceTrends = [];
            try {
                performanceTrends = await DashboardController.getPerformanceTrendData(period);
            } catch (error) {
                console.error('Error getting performance trend data:', error);
            }

            res.json({
                fuelConsumption,
                tripEfficiency,
                maintenanceCosts,
                performanceTrends
            });
        } catch (error) {
            console.error('Analytics error:', error);
            res.status(500).json({ 
                error: 'Failed to load analytics data',
                message: error.message 
            });
        }
    }

    // Get fuel consumption data for charts
    static async getFuelConsumptionData(period) {
        try {
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
                groupedData[date] += trip.actualFuelConsumption || 0;
            });

            return Object.entries(groupedData).map(([date, consumption]) => ({
                date,
                consumption
            }));
        } catch (error) {
            console.error('Error in getFuelConsumptionData:', error);
            return [];
        }
    }

    // Get trip efficiency data
    static async getTripEfficiencyData(period) {
        try {
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
                groupedData[date] += trip.efficiencyScore || 0;
                countData[date]++;
            });

            return Object.entries(groupedData).map(([date, totalScore]) => ({
                date,
                averageEfficiency: countData[date] > 0 ? totalScore / countData[date] : 0
            }));
        } catch (error) {
            console.error('Error in getTripEfficiencyData:', error);
            return [];
        }
    }

    // Get maintenance cost data
    static async getMaintenanceCostData(period) {
        try {
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
                groupedData[maint.category] += maint.actualCost || 0;
            });

            return Object.entries(groupedData).map(([category, cost]) => ({
                category,
                cost
            }));
        } catch (error) {
            console.error('Error in getMaintenanceCostData:', error);
            return [];
        }
    }

    // Get performance trend data
    static async getPerformanceTrendData(period) {
        try {
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
                groupedData[date].health += vehicle.healthScore || 0;
                groupedData[date].efficiency += vehicle.efficiencyScore || 0;
                countData[date]++;
            });

            return Object.entries(groupedData).map(([date, scores]) => ({
                date,
                averageHealth: countData[date] > 0 ? scores.health / countData[date] : 0,
                averageEfficiency: countData[date] > 0 ? scores.efficiency / countData[date] : 0
            }));
        } catch (error) {
            console.error('Error in getPerformanceTrendData:', error);
            return [];
        }
    }
}

module.exports = DashboardController; 