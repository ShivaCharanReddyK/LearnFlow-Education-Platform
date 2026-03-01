const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicationRef: {
        type: String,
        unique: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    // Personal Details
    personalDetails: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        dateOfBirth: { type: Date },
        address: { type: String },
        city: { type: String },
        country: { type: String }
    },
    // Educational Background
    educationalBackground: {
        highestDegree: {
            type: String,
            enum: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'Other'],
            required: true
        },
        institution: { type: String, required: true },
        fieldOfStudy: { type: String, required: true },
        graduationYear: { type: Number, required: true },
        gpa: { type: String }
    },
    // Statement of Purpose
    statementOfPurpose: {
        type: String,
        maxlength: 5000
    },
    // Application Status
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'denied'],
        default: 'pending'
    },
    // Counselor Review
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewDate: Date,
    reviewNotes: String,
    denialReason: String,
    recommendedPrograms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    }],
    // Payment Status
    paymentStatus: {
        type: String,
        enum: ['not_required', 'pending', 'partial', 'completed'],
        default: 'not_required'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate application reference number
applicationSchema.pre('save', function (next) {
    if (!this.applicationRef) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.applicationRef = `LF-${timestamp}-${random}`;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Application', applicationSchema);
