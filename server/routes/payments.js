const express = require('express');
const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Program = require('../models/Program');
const { auth, studentOnly } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// Process payment
router.post('/', auth, studentOnly, async (req, res) => {
    try {
        const { applicationId, paymentType, cardNumber, cardExpiry, cardCvc, cardName } = req.body;

        const application = await Application.findById(applicationId)
            .populate('program');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.applicant.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (application.status !== 'approved') {
            return res.status(400).json({ error: 'Payment can only be made for approved applications' });
        }

        if (application.paymentStatus === 'completed') {
            return res.status(400).json({ error: 'Payment already completed' });
        }

        const program = application.program;
        let amount = program.tuitionFee;
        let installmentPlan = null;

        if (paymentType === 'installment') {
            const totalInstallments = 4;
            const installmentAmount = Math.ceil(amount / totalInstallments);
            amount = installmentAmount; // First installment
            const nextDueDate = new Date();
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);

            installmentPlan = {
                totalInstallments,
                currentInstallment: 1,
                installmentAmount,
                nextDueDate
            };
        }

        // Simulate payment processing
        const last4 = cardNumber ? cardNumber.slice(-4) : '4242';
        const payment = new Payment({
            application: applicationId,
            user: req.user._id,
            program: program._id,
            amount,
            paymentType,
            installmentPlan,
            paymentMethod: {
                type: 'credit_card',
                last4,
                cardBrand: 'Visa'
            },
            status: 'completed',
            paidAt: new Date()
        });

        await payment.save();

        // Update application payment status
        application.paymentStatus = paymentType === 'full' ? 'completed' : 'partial';
        await application.save();

        // Update program enrollment
        await Program.findByIdAndUpdate(program._id, {
            $inc: { currentEnrollment: 1 }
        });

        // Send payment confirmation email
        await emailService.sendPaymentConfirmation(
            application.personalDetails.email,
            application.personalDetails.fullName,
            program.title,
            amount,
            payment.transactionId,
            paymentType
        );

        res.status(201).json({
            message: 'Payment processed successfully',
            payment: {
                transactionId: payment.transactionId,
                amount: payment.amount,
                status: payment.status,
                paymentType: payment.paymentType,
                installmentPlan: payment.installmentPlan
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('program', 'title')
            .sort({ createdAt: -1 });

        res.json({ payments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get payment by application
router.get('/application/:applicationId', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ application: req.params.applicationId })
            .populate('program', 'title tuitionFee')
            .sort({ createdAt: -1 });

        res.json({ payments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
