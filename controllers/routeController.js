const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// Route optimization controller
class RouteController {
    // Get all routes
    static async getAllRoutes(req, res) {
        try {
            const routes = await Route.find()
                .populate('createdBy', 'username')
                .sort({ createdAt: -1 });

            res.json(routes);
        } catch (error) {
            console.error('Get routes error:', error);
            res.status(500).json({ error: 'Failed to fetch routes' });
        }
    }

    // Get single route
    static async getRoute(req, res) {
        try {
            const route = await Route.findById(req.params.id)
                .populate('createdBy', 'username');

            if (!route) {
                return res.status(404).json({ error: 'Route not found' });
            }

            res.json(route);
        } catch (error) {
            console.error('Get route error:', error);
            res.status(500).json({ error: 'Failed to fetch route' });
        }
    }

    // Create new route
    static async createRoute(req, res) {
        try {
            const {
                name,
                description,
                waypoints,
                totalDistance,
                estimatedTime,
                estimatedFuelConsumption,
                preferredVehicleTypes,
                restrictions
            } = req.body;

            // Validate waypoints
            if (!waypoints || waypoints.length < 2) {
                return res.status(400).json({ error: 'Route must have at least 2 waypoints' });
            }

            // Calculate optimization factors
            const optimizationFactors = await RouteController.calculateOptimizationFactors(
                waypoints,
                totalDistance,
                estimatedTime,
                estimatedFuelConsumption
            );

            const route = new Route({
                name,
                description,
                waypoints,
                totalDistance,
                estimatedTime,
                estimatedFuelConsumption,
                optimizationFactors,
                preferredVehicleTypes,
                restrictions,
                createdBy: req.session.userId
            });

            // Calculate optimization score
            route.calculateOptimizationScore();

            await route.save();

            res.status(201).json(route);
        } catch (error) {
            console.error('Create route error:', error);
            res.status(500).json({ error: 'Failed to create route' });
        }
    }

    // Update route
    static async updateRoute(req, res) {
        try {
            const route = await Route.findById(req.params.id);

            if (!route) {
                return res.status(404).json({ error: 'Route not found' });
            }

            const {
                name,
                description,
                waypoints,
                totalDistance,
                estimatedTime,
                estimatedFuelConsumption,
                status,
                preferredVehicleTypes,
                restrictions
            } = req.body;

            // Update fields
            if (name) route.name = name;
            if (description) route.description = description;
            if (waypoints) route.waypoints = waypoints;
            if (totalDistance) route.totalDistance = totalDistance;
            if (estimatedTime) route.estimatedTime = estimatedTime;
            if (estimatedFuelConsumption) route.estimatedFuelConsumption = estimatedFuelConsumption;
            if (status) route.status = status;
            if (preferredVehicleTypes) route.preferredVehicleTypes = preferredVehicleTypes;
            if (restrictions) route.restrictions = restrictions;

            // Recalculate optimization factors if route data changed
            if (waypoints || totalDistance || estimatedTime || estimatedFuelConsumption) {
                route.optimizationFactors = await RouteController.calculateOptimizationFactors(
                    route.waypoints,
                    route.totalDistance,
                    route.estimatedTime,
                    route.estimatedFuelConsumption
                );
                route.calculateOptimizationScore();
            }

            route.updatedAt = new Date();
            await route.save();

            res.json(route);
        } catch (error) {
            console.error('Update route error:', error);
            res.status(500).json({ error: 'Failed to update route' });
        }
    }

    // Delete route
    static async deleteRoute(req, res) {
        try {
            const route = await Route.findById(req.params.id);

            if (!route) {
                return res.status(404).json({ error: 'Route not found' });
            }

            // Check if route is being used in any trips
            const tripsUsingRoute = await Trip.countDocuments({ route: route._id });
            if (tripsUsingRoute > 0) {
                return res.status(400).json({ 
                    error: 'Cannot delete route that is being used in trips' 
                });
            }

            await Route.findByIdAndDelete(req.params.id);

            res.json({ message: 'Route deleted successfully' });
        } catch (error) {
            console.error('Delete route error:', error);
            res.status(500).json({ error: 'Failed to delete route' });
        }
    }

    // Optimize route using AI
    static async optimizeRoute(req, res) {
        try {
            const {
                startLocation,
                endLocation,
                waypoints,
                vehicleType,
                preferences
            } = req.body;

            // Validate input
            if (!startLocation || !endLocation) {
                return res.status(400).json({ error: 'Start and end locations are required' });
            }

            // Generate optimized route
            const optimizedRoute = await RouteController.generateOptimizedRoute(
                startLocation,
                endLocation,
                waypoints,
                vehicleType,
                preferences
            );

            res.json(optimizedRoute);
        } catch (error) {
            console.error('Route optimization error:', error);
            res.status(500).json({ error: 'Failed to optimize route' });
        }
    }

    // Get route recommendations
    static async getRouteRecommendations(req, res) {
        try {
            const { vehicleId, startLocation, endLocation } = req.query;

            // Get vehicle information
            const vehicle = await Vehicle.findById(vehicleId);
            if (!vehicle) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }

            // Get existing routes that match criteria
            const existingRoutes = await Route.find({
                status: 'active',
                $or: [
                    { preferredVehicleTypes: { $in: [vehicleType] } },
                    { preferredVehicleTypes: { $size: 0 } }
                ]
            }).sort({ optimizationScore: -1 }).limit(5);

            // Generate new route recommendations
            const newRouteRecommendations = await RouteController.generateRouteRecommendations(
                startLocation,
                endLocation,
                vehicle
            );

            res.json({
                existingRoutes,
                newRecommendations: newRouteRecommendations
            });
        } catch (error) {
            console.error('Route recommendations error:', error);
            res.status(500).json({ error: 'Failed to get route recommendations' });
        }
    }

    // Calculate optimization factors for a route
    static async calculateOptimizationFactors(waypoints, distance, time, fuelConsumption) {
        // This is a simplified calculation - in a real system, you would use
        // external APIs for traffic data, road conditions, etc.
        
        const factors = {
            trafficAvoidance: 0,
            fuelEfficiency: 0,
            timeEfficiency: 0,
            roadConditions: 0
        };

        // Calculate fuel efficiency (higher is better)
        const fuelEfficiency = distance / fuelConsumption; // km/l
        factors.fuelEfficiency = Math.min(100, Math.max(0, fuelEfficiency * 10));

        // Calculate time efficiency (higher is better)
        const timeEfficiency = distance / (time / 60); // km/h
        factors.timeEfficiency = Math.min(100, Math.max(0, timeEfficiency / 2));

        // Simulate traffic avoidance (random for demo)
        factors.trafficAvoidance = Math.random() * 100;

        // Simulate road conditions (random for demo)
        factors.roadConditions = Math.random() * 100;

        return factors;
    }

    // Generate optimized route
    static async generateOptimizedRoute(startLocation, endLocation, waypoints, vehicleType, preferences) {
        // This is a simplified route optimization algorithm
        // In a real system, you would integrate with mapping APIs like Google Maps, Mapbox, etc.

        const allWaypoints = [startLocation, ...(waypoints || []), endLocation];
        
        // Calculate distances between waypoints (simplified)
        let totalDistance = 0;
        for (let i = 0; i < allWaypoints.length - 1; i++) {
            const distance = RouteController.calculateDistance(
                allWaypoints[i],
                allWaypoints[i + 1]
            );
            totalDistance += distance;
        }

        // Estimate time based on distance and vehicle type
        const averageSpeed = vehicleType === 'truck' ? 60 : 80; // km/h
        const estimatedTime = (totalDistance / averageSpeed) * 60; // minutes

        // Estimate fuel consumption
        const fuelEfficiency = vehicleType === 'truck' ? 8 : 12; // km/l
        const estimatedFuelConsumption = totalDistance / fuelEfficiency;

        // Calculate optimization factors
        const optimizationFactors = await RouteController.calculateOptimizationFactors(
            allWaypoints,
            totalDistance,
            estimatedTime,
            estimatedFuelConsumption
        );

        return {
            waypoints: allWaypoints.map((wp, index) => ({
                ...wp,
                order: index
            })),
            totalDistance,
            estimatedTime,
            estimatedFuelConsumption,
            optimizationFactors,
            optimizationScore: RouteController.calculateOptimizationScore(optimizationFactors)
        };
    }

    // Generate route recommendations
    static async generateRouteRecommendations(startLocation, endLocation, vehicle) {
        // Generate multiple route options with different characteristics
        const recommendations = [];

        // Fastest route
        const fastestRoute = await RouteController.generateOptimizedRoute(
            startLocation,
            endLocation,
            [],
            vehicle.fuelType,
            { priority: 'time' }
        );
        fastestRoute.name = 'Fastest Route';
        fastestRoute.description = 'Optimized for minimum travel time';
        recommendations.push(fastestRoute);

        // Most fuel efficient route
        const efficientRoute = await RouteController.generateOptimizedRoute(
            startLocation,
            endLocation,
            [],
            vehicle.fuelType,
            { priority: 'fuel' }
        );
        efficientRoute.name = 'Fuel Efficient Route';
        efficientRoute.description = 'Optimized for minimum fuel consumption';
        recommendations.push(efficientRoute);

        // Scenic route (with additional waypoints)
        const scenicWaypoints = RouteController.generateScenicWaypoints(startLocation, endLocation);
        const scenicRoute = await RouteController.generateOptimizedRoute(
            startLocation,
            endLocation,
            scenicWaypoints,
            vehicle.fuelType,
            { priority: 'scenic' }
        );
        scenicRoute.name = 'Scenic Route';
        scenicRoute.description = 'Includes scenic waypoints';
        recommendations.push(scenicRoute);

        return recommendations;
    }

    // Calculate distance between two points (Haversine formula)
    static calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
        const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Calculate optimization score
    static calculateOptimizationScore(factors) {
        const trafficScore = factors.trafficAvoidance * 0.3;
        const fuelScore = factors.fuelEfficiency * 0.3;
        const timeScore = factors.timeEfficiency * 0.2;
        const roadScore = factors.roadConditions * 0.2;
        
        return Math.round(trafficScore + fuelScore + timeScore + roadScore);
    }

    // Generate scenic waypoints (simplified)
    static generateScenicWaypoints(startLocation, endLocation) {
        // In a real system, you would use APIs to find scenic routes
        // This is a simplified version that adds random waypoints
        const waypoints = [];
        const numWaypoints = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numWaypoints; i++) {
            waypoints.push({
                latitude: startLocation.latitude + (endLocation.latitude - startLocation.latitude) * (i + 1) / (numWaypoints + 1) + (Math.random() - 0.5) * 0.1,
                longitude: startLocation.longitude + (endLocation.longitude - startLocation.longitude) * (i + 1) / (numWaypoints + 1) + (Math.random() - 0.5) * 0.1,
                name: `Scenic Point ${i + 1}`
            });
        }

        return waypoints;
    }
}

module.exports = RouteController; 