const express = require('express');
const Application = require('../models/Application');
const Program = require('../models/Program');
const { auth, counselorOnly, studentOnly } = require('../middleware/auth');
const emailService = require('../services/emailService');
const axios = require('axios');

const router = express.Router();

// Submit application (Student)
router.post('/', auth, studentOnly, async (req, res) => {
    try {
        const { programId, personalDetails, educationalBackground, statementOfPurpose } = req.body;

        // Check if program exists
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        // Check if already applied
        const existing = await Application.findOne({
            applicant: req.user._id,
            program: programId,
            status: { $in: ['pending', 'under_review', 'approved'] }
        });
        if (existing) {
            return res.status(400).json({ error: 'You have already applied to this program' });
        }

        const application = new Application({
            applicant: req.user._id,
            program: programId,
            personalDetails,
            educationalBackground,
            statementOfPurpose
        });

        await application.save();

        // Send confirmation email
        await emailService.sendApplicationConfirmation(
            personalDetails.email,
            personalDetails.fullName,
            program.title,
            application.applicationRef
        );

        res.status(201).json({
            message: 'Application submitted successfully',
            application: {
                _id: application._id,
                applicationRef: application.applicationRef,
                status: application.status,
                submittedAt: application.submittedAt
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get my applications (Student)
router.get('/my', auth, studentOnly, async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate('program', 'title slug category duration startDate tuitionFee image')
            .sort({ submittedAt: -1 });

        res.json({ applications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single application
router.get('/:id', auth, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('program')
            .populate('applicant', 'name email')
            .populate('reviewedBy', 'name')
            .populate('recommendedPrograms', 'title slug shortDescription');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Students can only view their own
        if (req.user.role === 'student' && application.applicant._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all applications (Counselor)
router.get('/', auth, counselorOnly, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Application.countDocuments(filter);
        const applications = await Application.find(filter)
            .populate('program', 'title category duration startDate tuitionFee')
            .populate('applicant', 'name email')
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            applications,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve application (Counselor)
router.patch('/:id/approve', auth, counselorOnly, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('program')
            .populate('applicant', 'name email');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.status !== 'pending' && application.status !== 'under_review') {
            return res.status(400).json({ error: 'Application cannot be approved in its current state' });
        }

        application.status = 'approved';
        application.reviewedBy = req.user._id;
        application.reviewDate = new Date();
        application.reviewNotes = req.body.notes || '';
        application.paymentStatus = 'pending';
        await application.save();

        // Send approval email
        await emailService.sendApprovalEmail(
            application.personalDetails.email,
            application.personalDetails.fullName,
            application.program.title,
            application.applicationRef
        );

        res.json({ message: 'Application approved', application });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deny application (Counselor)
router.patch('/:id/deny', auth, counselorOnly, async (req, res) => {
    try {
        const { reason, notes } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Denial reason is required' });
        }

        const application = await Application.findById(req.params.id)
            .populate('program')
            .populate('applicant', 'name email');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        if (application.status !== 'pending' && application.status !== 'under_review') {
            return res.status(400).json({ error: 'Application cannot be denied in its current state' });
        }

        // Get AI recommendations for alternative programs
        let recommendations = [];
        try {
            const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/recommend`, {
                applicantBackground: {
                    degree: application.educationalBackground.highestDegree,
                    fieldOfStudy: application.educationalBackground.fieldOfStudy,
                    statementOfPurpose: application.statementOfPurpose
                },
                deniedProgramId: application.program._id.toString(),
                deniedProgramCategory: application.program.category
            });
            if (aiResponse.data.recommendations) {
                const recIds = aiResponse.data.recommendations.map(r => r.programId);
                recommendations = await Program.find({ _id: { $in: recIds } })
                    .select('title slug shortDescription');
                application.recommendedPrograms = recIds;
            }
        } catch (aiErr) {
            console.log('AI recommendation service unavailable, skipping:', aiErr.message);
            // Fall back to simple category-based recommendations
            recommendations = await Program.find({
                category: application.program.category,
                _id: { $ne: application.program._id },
                status: { $in: ['active', 'upcoming'] }
            }).limit(3).select('title slug shortDescription');
            application.recommendedPrograms = recommendations.map(r => r._id);
        }

        application.status = 'denied';
        application.reviewedBy = req.user._id;
        application.reviewDate = new Date();
        application.reviewNotes = notes || '';
        application.denialReason = reason;
        await application.save();

        // Send denial email with recommendations
        await emailService.sendDenialEmail(
            application.personalDetails.email,
            application.personalDetails.fullName,
            application.program.title,
            application.applicationRef,
            reason,
            recommendations
        );

        res.json({ message: 'Application denied', application, recommendations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get application stats (Counselor)
router.get('/stats/overview', auth, counselorOnly, async (req, res) => {
    try {
        const stats = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            pending: 0,
            under_review: 0,
            approved: 0,
            denied: 0,
            total: 0
        };

        stats.forEach(s => {
            result[s._id] = s.count;
            result.total += s.count;
        });

        res.json({ stats: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
