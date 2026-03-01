const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Program title is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        maxlength: 200
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Computer Science',
            'Data Science',
            'Business',
            'Design',
            'Engineering',
            'Health Sciences',
            'Arts & Humanities',
            'Education'
        ]
    },
    duration: {
        type: String,
        required: true,
        enum: ['4 weeks', '8 weeks', '12 weeks', '16 weeks', '24 weeks', '6 months', '1 year']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    tuitionFee: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    instructor: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '/images/default-program.jpg'
    },
    syllabus: [{
        week: Number,
        topic: String,
        description: String
    }],
    requirements: [String],
    learningOutcomes: [String],
    maxEnrollment: {
        type: Number,
        default: 50
    },
    currentEnrollment: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'upcoming', 'completed', 'archived'],
        default: 'active'
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate slug before saving
programSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

// Virtual for available spots
programSchema.virtual('availableSpots').get(function () {
    return this.maxEnrollment - this.currentEnrollment;
});

programSchema.set('toJSON', { virtuals: true });
programSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Program', programSchema);
