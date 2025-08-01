const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    // Route coordinates
    waypoints: [{
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        name: { type: String },
        order: { type: Number, required: true }
    }],
    // Route metrics
    totalDistance: {
        type: Number, // in kilometers
        required: true
    },
    estimatedTime: {
        type: Number, // in minutes
        required: true
    },
    estimatedFuelConsumption: {
        type: Number, // in liters
        required: true
    },
    // AI Optimization data
    optimizationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    optimizationFactors: {
        trafficAvoidance: { type: Number, default: 0 },
        fuelEfficiency: { type: Number, default: 0 },
        timeEfficiency: { type: Number, default: 0 },
        roadConditions: { type: Number, default: 0 }
    },
    // Route status and usage
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    },
    usageCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    // Route preferences
    preferredVehicleTypes: [{
        type: String,
        enum: ['small', 'medium', 'large', 'truck', 'van']
    }],
    restrictions: {
        tollRoads: { type: Boolean, default: false },
        highways: { type: Boolean, default: true },
        weightLimit: { type: Number },
        heightLimit: { type: Number }
    },
    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate optimization score
RouteSchema.methods.calculateOptimizationScore = function() {
    const trafficScore = this.optimizationFactors.trafficAvoidance * 0.3;
    const fuelScore = this.optimizationFactors.fuelEfficiency * 0.3;
    const timeScore = this.optimizationFactors.timeEfficiency * 0.2;
    const roadScore = this.optimizationFactors.roadConditions * 0.2;
    
    this.optimizationScore = Math.round(trafficScore + fuelScore + timeScore + roadScore);
    return this.optimizationScore;
};

// Method to update route metrics
RouteSchema.methods.updateMetrics = function(distance, time, fuelConsumption) {
    this.totalDistance = distance;
    this.estimatedTime = time;
    this.estimatedFuelConsumption = fuelConsumption;
    this.updatedAt = new Date();
    
    // Recalculate optimization score
    this.calculateOptimizationScore();
};

// Add indexes for better performance
RouteSchema.index({ status: 1 });
RouteSchema.index({ createdBy: 1 });
RouteSchema.index({ name: 1 });
RouteSchema.index({ 'waypoints.latitude': 1, 'waypoints.longitude': 1 });
RouteSchema.index({ totalDistance: 1 });
RouteSchema.index({ estimatedTime: 1 });

module.exports = mongoose.model('Route', RouteSchema); 