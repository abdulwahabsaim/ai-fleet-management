const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    vin: { // Vehicle Identification Number
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        minlength: 17,
        maxlength: 17
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    capacity: { // e.g., cargo capacity in kg or volume
        type: Number
    },
    currentMileage: {
        type: Number,
        default: 0
    },
    status: { // e.g., 'active', 'inactive', 'in_maintenance'
        type: String,
        enum: ['active', 'inactive', 'in_maintenance', 'on_trip'],
        default: 'active'
    },
    currentLocation: { // For basic display in Phase 1
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 }
    },
    lastMaintenanceDate: {
        type: Date
    },
    // Enhanced AI Features
    fuelType: {
        type: String,
        enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
        default: 'gasoline'
    },
    fuelCapacity: {
        type: Number, // in liters
        default: 0
    },
    currentFuelLevel: {
        type: Number, // in liters
        default: 0
    },
    averageFuelConsumption: {
        type: Number, // km/l
        default: 0
    },
    totalFuelConsumed: {
        type: Number, // total liters consumed
        default: 0
    },
    // Maintenance Prediction
    nextMaintenanceMileage: {
        type: Number,
        default: 0
    },
    nextMaintenanceDate: {
        type: Date
    },
    maintenanceInterval: {
        type: Number, // km between maintenance
        default: 10000
    },
    // Performance Metrics
    totalTrips: {
        type: Number,
        default: 0
    },
    totalDistance: {
        type: Number,
        default: 0
    },
    averageSpeed: {
        type: Number,
        default: 0
    },
    // AI Prediction Scores
    healthScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    efficiencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    // Placeholder for future maintenance history references
    maintenanceHistory: [
        {
            date: { type: Date },
            description: { type: String },
            cost: { type: Number },
            mileage: { type: Number },
            type: { type: String, enum: ['routine', 'repair', 'emergency'] }
        }
    ],
    registeredBy: { // Who registered this vehicle (User ID)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate health score based on maintenance and usage
VehicleSchema.methods.calculateHealthScore = function() {
    try {
        const ageInYears = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24 * 365);
        const mileageFactor = Math.max(0, 100 - (this.currentMileage / 100000) * 20);
        const maintenanceFactor = this.maintenanceHistory && this.maintenanceHistory.length > 0 ? 100 : 80;
        const lastMaintenanceDays = this.lastMaintenanceDate ? 
            (new Date() - this.lastMaintenanceDate) / (1000 * 60 * 60 * 24) : 365;
        const maintenanceRecencyFactor = Math.max(0, 100 - (lastMaintenanceDays / 365) * 30);
        
        this.healthScore = Math.round((mileageFactor + maintenanceFactor + maintenanceRecencyFactor) / 3);
        return this.healthScore;
    } catch (error) {
        console.error('Error calculating health score:', error);
        this.healthScore = 50; // Default fallback
        return this.healthScore;
    }
};

// Method to predict next maintenance
VehicleSchema.methods.predictNextMaintenance = function() {
    try {
        const lastMaintenanceMileage = this.maintenanceHistory && this.maintenanceHistory.length > 0 ? 
            Math.max(...this.maintenanceHistory.map(m => m.mileage || 0)) : 0;
        
        this.nextMaintenanceMileage = lastMaintenanceMileage + this.maintenanceInterval;
        
        // Predict date based on average daily mileage
        const daysSinceLastMaintenance = this.maintenanceHistory && this.maintenanceHistory.length > 0 ? 
            (new Date() - this.maintenanceHistory[this.maintenanceHistory.length - 1].date) / (1000 * 60 * 60 * 24) : 365;
        const averageDailyMileage = daysSinceLastMaintenance > 0 ? 
            (this.currentMileage - lastMaintenanceMileage) / daysSinceLastMaintenance : 50;
        
        const daysUntilNextMaintenance = Math.max(0, (this.nextMaintenanceMileage - this.currentMileage) / averageDailyMileage);
        this.nextMaintenanceDate = new Date(Date.now() + daysUntilNextMaintenance * 24 * 60 * 60 * 1000);
        
        return {
            nextMileage: this.nextMaintenanceMileage,
            nextDate: this.nextMaintenanceDate
        };
    } catch (error) {
        console.error('Error predicting next maintenance:', error);
        // Return default values
        this.nextMaintenanceMileage = this.currentMileage + this.maintenanceInterval;
        this.nextMaintenanceDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        return {
            nextMileage: this.nextMaintenanceMileage,
            nextDate: this.nextMaintenanceDate
        };
    }
};

// Add indexes for better performance
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ licensePlate: 1 });
VehicleSchema.index({ vin: 1 });
VehicleSchema.index({ make: 1, model: 1 });
VehicleSchema.index({ 'lastMaintenanceDate': 1 });
VehicleSchema.index({ 'nextMaintenanceDate': 1 });
VehicleSchema.index({ registeredBy: 1 });

module.exports = mongoose.model('Vehicle', VehicleSchema);