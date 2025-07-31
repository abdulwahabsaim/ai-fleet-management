const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    // Driver identification
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    licenseType: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'E'],
        required: true
    },
    licenseExpiryDate: {
        type: Date,
        required: true
    },
    // Personal information
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    },
    // Driver status and availability
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_trip', 'on_leave', 'suspended'],
        default: 'active'
    },
    availability: {
        type: String,
        enum: ['available', 'busy', 'off_duty', 'on_break'],
        default: 'available'
    },
    // Performance metrics
    totalTrips: {
        type: Number,
        default: 0
    },
    totalDistance: {
        type: Number,
        default: 0
    },
    totalHours: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    // Safety and compliance
    safetyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    violations: [{
        type: { type: String },
        description: { type: String },
        date: { type: Date },
        points: { type: Number },
        resolved: { type: Boolean, default: false }
    }],
    // Skills and certifications
    certifications: [{
        name: { type: String },
        issuedDate: { type: Date },
        expiryDate: { type: Date },
        issuingAuthority: { type: String }
    }],
    vehicleTypes: [{
        type: String,
        enum: ['car', 'truck', 'van', 'bus', 'motorcycle']
    }],
    // Work schedule
    workSchedule: {
        startTime: { type: String, default: '08:00' },
        endTime: { type: String, default: '17:00' },
        workDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }]
    },
    // Current assignment
    currentVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    currentTrip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
    },
    // AI Performance Analysis
    performanceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    efficiencyMetrics: {
        fuelEfficiency: { type: Number, default: 0 },
        timeEfficiency: { type: Number, default: 0 },
        safetyEfficiency: { type: Number, default: 0 }
    },
    // Metadata
    hireDate: {
        type: Date,
        default: Date.now
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

// Virtual for full name
DriverSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to calculate performance score
DriverSchema.methods.calculatePerformanceScore = function() {
    const fuelScore = this.efficiencyMetrics.fuelEfficiency * 0.4;
    const timeScore = this.efficiencyMetrics.timeEfficiency * 0.3;
    const safetyScore = this.efficiencyMetrics.safetyEfficiency * 0.3;
    
    this.performanceScore = Math.round(fuelScore + timeScore + safetyScore);
    return this.performanceScore;
};

// Method to update safety score
DriverSchema.methods.updateSafetyScore = function() {
    const baseScore = 100;
    const violationPenalty = this.violations.filter(v => !v.resolved).length * 10;
    const ageFactor = Math.max(0, (new Date() - this.dateOfBirth) / (1000 * 60 * 60 * 24 * 365) * 0.5);
    
    this.safetyScore = Math.max(0, Math.min(100, baseScore - violationPenalty + ageFactor));
    return this.safetyScore;
};

// Method to check license validity
DriverSchema.methods.isLicenseValid = function() {
    return new Date() < this.licenseExpiryDate;
};

// Method to check availability
DriverSchema.methods.isAvailable = function() {
    return this.status === 'active' && this.availability === 'available';
};

// Pre-save middleware to update timestamps
DriverSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Driver', DriverSchema); 