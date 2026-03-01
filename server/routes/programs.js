const express = require('express');
const Program = require('../models/Program');

const router = express.Router();

// Get all programs with filtering
router.get('/', async (req, res) => {
    try {
        const { category, duration, startDate, search, status, page = 1, limit = 12 } = req.query;
        const filter = {};

        if (category && category !== 'all') {
            filter.category = category;
        }
        if (duration && duration !== 'all') {
            filter.duration = duration;
        }
        if (startDate) {
            const date = new Date(startDate);
            filter.startDate = { $gte: date };
        }
        if (status) {
            filter.status = status;
        } else {
            filter.status = { $in: ['active', 'upcoming'] };
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Program.countDocuments(filter);
        const programs = await Program.find(filter)
            .sort({ startDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            programs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single program by slug or id
router.get('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        let program;

        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            program = await Program.findById(identifier);
        } else {
            program = await Program.findOne({ slug: identifier });
        }

        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }

        res.json({ program });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get categories (distinct)
router.get('/meta/categories', async (req, res) => {
    try {
        const categories = await Program.distinct('category');
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get durations (distinct)
router.get('/meta/durations', async (req, res) => {
    try {
        const durations = await Program.distinct('duration');
        res.json({ durations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
