const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentType: {
        type: String,
        enum: ['full', 'installment'],
        required: true
    },
    // For installment plans
    installmentPlan: {
        totalInstallments: { type: Number },
        currentInstallment: { type: Number },
        installmentAmount: { type: Number },
        nextDueDate: { type: Date }
    },
    // Payment method (simulated)
    paymentMethod: {
        type: { type: String, enum: ['credit_card', 'debit_card', 'bank_transfer'] },
        last4: String,
        cardBrand: String
    },
    transactionId: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paidAt: Date,
    receiptUrl: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate transaction ID
paymentSchema.pre('save', function (next) {
    if (!this.transactionId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.transactionId = `TXN-${timestamp}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
