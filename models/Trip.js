const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    // Trip identification
    tripNumber: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    // Trip participants
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
    },
    // Route information
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    // Trip coordinates and tracking
    startLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String }
    },
    endLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String }
    },
    waypoints: [{
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date },
        speed: { type: Number }
    }],
    // Trip timing
    scheduledStartTime: {
        type: Date,
        required: true
    },
    scheduledEndTime: {
        type: Date,
        required: true
    },
    actualStartTime: {
        type: Date
    },
    actualEndTime: {
        type: Date
    },
    // Trip metrics
    plannedDistance: {
        type: Number, // in kilometers
        required: true
    },
    actualDistance: {
        type: Number, // in kilometers
        default: 0
    },
    plannedDuration: {
        type: Number, // in minutes
        required: true
    },
    actualDuration: {
        type: Number, // in minutes
        default: 0
    },
    // Fuel consumption
    plannedFuelConsumption: {
        type: Number, // in liters
        required: true
    },
    actualFuelConsumption: {
        type: Number, // in liters
        default: 0
    },
    fuelCost: {
        type: Number, // in currency
        default: 0
    },
    // Performance metrics
    averageSpeed: {
        type: Number, // km/h
        default: 0
    },
    maxSpeed: {
        type: Number, // km/h
        default: 0
    },
    idleTime: {
        type: Number, // in minutes
        default: 0
    },
    // Trip status
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'],
        default: 'scheduled'
    },
    // AI Analysis
    efficiencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    deviationFromPlan: {
        distance: { type: Number, default: 0 },
        time: { type: Number, default: 0 },
        fuel: { type: Number, default: 0 }
    },
    // Issues and notes
    issues: [{
        type: { type: String, enum: ['traffic', 'weather', 'mechanical', 'driver', 'other'] },
        description: { type: String },
        timestamp: { type: Date },
        resolved: { type: Boolean, default: false }
    }],
    notes: {
        type: String
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

// Method to calculate efficiency score
TripSchema.methods.calculateEfficiencyScore = function() {
    try {
        if (!this.actualEndTime || !this.actualStartTime) return 0;
        
        const timeEfficiency = Math.max(0, 100 - ((this.actualDuration || 0) / (this.plannedDuration || 1) - 1) * 50);
        const fuelEfficiency = Math.max(0, 100 - ((this.actualFuelConsumption || 0) / (this.plannedFuelConsumption || 1) - 1) * 50);
        const distanceEfficiency = Math.max(0, 100 - ((this.actualDistance || 0) / (this.plannedDistance || 1) - 1) * 50);
        
        this.efficiencyScore = Math.round((timeEfficiency + fuelEfficiency + distanceEfficiency) / 3);
        return this.efficiencyScore;
    } catch (error) {
        console.error('Error calculating efficiency score:', error);
        this.efficiencyScore = 0;
        return 0;
    }
};

// Method to calculate deviations from plan
TripSchema.methods.calculateDeviations = function() {
    try {
        this.deviationFromPlan.distance = (this.actualDistance || 0) - (this.plannedDistance || 0);
        this.deviationFromPlan.time = (this.actualDuration || 0) - (this.plannedDuration || 0);
        this.deviationFromPlan.fuel = (this.actualFuelConsumption || 0) - (this.plannedFuelConsumption || 0);
        
        return this.deviationFromPlan;
    } catch (error) {
        console.error('Error calculating deviations:', error);
        return {
            distance: 0,
            time: 0,
            fuel: 0
        };
    }
};

// Method to complete trip
TripSchema.methods.completeTrip = function(endTime, actualDistance, actualFuelConsumption) {
    try {
        this.actualEndTime = endTime;
        this.actualDistance = actualDistance || 0;
        this.actualFuelConsumption = actualFuelConsumption || 0;
        this.actualDuration = this.actualStartTime ? (endTime - this.actualStartTime) / (1000 * 60) : 0; // in minutes
        this.status = 'completed';
        this.updatedAt = new Date();
        
        // Calculate efficiency and deviations
        this.calculateEfficiencyScore();
        this.calculateDeviations();
    } catch (error) {
        console.error('Error completing trip:', error);
    }
};

// Pre-save middleware to generate trip number
TripSchema.pre('save', function(next) {
    if (this.isNew && !this.tripNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.tripNumber = `TRIP-${year}${month}${day}-${random}`;
    }
    next();
});

// Add indexes for better performance
TripSchema.index({ status: 1 });
TripSchema.index({ vehicle: 1 });
TripSchema.index({ driver: 1 });
TripSchema.index({ createdBy: 1 });
TripSchema.index({ scheduledStartTime: 1 });
TripSchema.index({ actualStartTime: 1 });
TripSchema.index({ tripNumber: 1 });

module.exports = mongoose.model('Trip', TripSchema); 