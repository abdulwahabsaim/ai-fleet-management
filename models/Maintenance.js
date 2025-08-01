const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
    // Maintenance identification
    maintenanceNumber: {
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
    // Associated vehicle
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    // Maintenance details
    type: {
        type: String,
        enum: ['routine', 'preventive', 'corrective', 'emergency', 'inspection'],
        required: true
    },
    category: {
        type: String,
        enum: ['engine', 'transmission', 'brakes', 'tires', 'electrical', 'body', 'other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    // Scheduling
    scheduledDate: {
        type: Date,
        required: true
    },
    estimatedDuration: {
        type: Number, // in hours
        required: true
    },
    actualStartDate: {
        type: Date
    },
    actualEndDate: {
        Date
    },
    // Status tracking
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'],
        default: 'scheduled'
    },
    // Cost tracking
    estimatedCost: {
        type: Number,
        default: 0
    },
    actualCost: {
        type: Number,
        default: 0
    },
    // Parts and labor
    parts: [{
        name: { type: String },
        partNumber: { type: String },
        quantity: { type: Number },
        unitCost: { type: Number },
        totalCost: { type: Number }
    }],
    laborHours: {
        type: Number,
        default: 0
    },
    laborRate: {
        type: Number,
        default: 0
    },
    // AI Prediction data
    predictionConfidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    predictedFailureDate: {
        type: Date
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    // Maintenance triggers
    triggerType: {
        type: String,
        enum: ['mileage', 'time', 'condition', 'ai_prediction', 'manual'],
        default: 'manual'
    },
    triggerValue: {
        type: Number // mileage or days depending on triggerType
    },
    // Service provider
    serviceProvider: {
        name: { type: String },
        contact: { type: String },
        address: { type: String }
    },
    // Notes and documentation
    notes: {
        type: String
    },
    attachments: [{
        filename: { type: String },
        path: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],
    // Completion details
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completionNotes: {
        type: String
    },
    // Quality assurance
    qualityCheck: {
        performed: { type: Boolean, default: false },
        passed: { type: Boolean },
        notes: { type: String },
        checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
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

// Method to calculate total cost
MaintenanceSchema.methods.calculateTotalCost = function() {
    const partsCost = this.parts.reduce((total, part) => total + (part.totalCost || 0), 0);
    const laborCost = this.laborHours * this.laborRate;
    this.actualCost = partsCost + laborCost;
    return this.actualCost;
};

// Method to check if maintenance is overdue
MaintenanceSchema.methods.isOverdue = function() {
    return this.status === 'scheduled' && new Date() > this.scheduledDate;
};

// Method to calculate risk level based on prediction confidence and priority
MaintenanceSchema.methods.calculateRiskLevel = function() {
    let riskScore = 0;
    
    // Priority scoring
    switch (this.priority) {
        case 'low': riskScore += 1; break;
        case 'medium': riskScore += 2; break;
        case 'high': riskScore += 3; break;
        case 'critical': riskScore += 4; break;
    }
    
    // Prediction confidence scoring
    if (this.predictionConfidence > 80) riskScore += 2;
    else if (this.predictionConfidence > 60) riskScore += 1;
    
    // Overdue scoring
    if (this.isOverdue()) riskScore += 2;
    
    // Determine risk level
    if (riskScore >= 6) this.riskLevel = 'critical';
    else if (riskScore >= 4) this.riskLevel = 'high';
    else if (riskScore >= 2) this.riskLevel = 'medium';
    else this.riskLevel = 'low';
    
    return this.riskLevel;
};

// Method to start maintenance
MaintenanceSchema.methods.startMaintenance = function() {
    this.status = 'in_progress';
    this.actualStartDate = new Date();
    this.updatedAt = new Date();
};

// Method to complete maintenance
MaintenanceSchema.methods.completeMaintenance = function(completionNotes, completedBy) {
    this.status = 'completed';
    this.actualEndDate = new Date();
    this.completionNotes = completionNotes;
    this.completedBy = completedBy;
    this.updatedAt = new Date();
    
    // Calculate actual cost
    this.calculateTotalCost();
};

// Pre-save middleware to generate maintenance number
MaintenanceSchema.pre('save', function(next) {
    if (this.isNew && !this.maintenanceNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.maintenanceNumber = `MAINT-${year}${month}${day}-${random}`;
    }
    
    // Update risk level
    this.calculateRiskLevel();
    
    next();
});

// Add indexes for better performance
MaintenanceSchema.index({ status: 1 });
MaintenanceSchema.index({ vehicle: 1 });
MaintenanceSchema.index({ priority: 1 });
MaintenanceSchema.index({ category: 1 });
MaintenanceSchema.index({ scheduledDate: 1 });
MaintenanceSchema.index({ createdBy: 1 });
MaintenanceSchema.index({ maintenanceNumber: 1 });
MaintenanceSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Maintenance', MaintenanceSchema); 