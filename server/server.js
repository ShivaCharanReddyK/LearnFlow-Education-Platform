const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const programRoutes = require('./routes/programs');
const applicationRoutes = require('./routes/applications');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (css, js, images etc — NOT html routing)
app.use(express.static(path.join(__dirname, '../public'), {
    index: false // prevent express.static from serving index.html automatically
}));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);

// AI Recommendation proxy (forwards to Python AI service)
app.post('/api/ai/recommend', async (req, res) => {
    try {
        const { degree, fieldOfStudy, interests, preferredCategory } = req.body;
        const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';

        const aiResponse = await axios.post(`${aiUrl}/recommend`, {
            applicantBackground: {
                degree: degree || '',
                fieldOfStudy: fieldOfStudy || '',
                statementOfPurpose: interests || ''
            },
            deniedProgramId: 'none',
            deniedProgramCategory: preferredCategory || ''
        }, { timeout: 15000 });

        res.json(aiResponse.data);
    } catch (error) {
        console.log('AI proxy: service unavailable -', error.message);
        res.json({ success: true, recommendations: [], ai_powered: false });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Frontend SPA Routing ──────────────────────────────────────────────────────
const PAGE_MAP = {
    '/': 'index.html',
    '/programs': 'programs.html',
    '/login': 'login.html',
    '/register': 'register.html',
    '/dashboard': 'student-dashboard.html',
    '/counselor': 'counselor-dashboard.html',
    '/payment': 'payment.html',
    '/recommendations': 'recommendations.html'
};

app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) return;

    // Program detail pages: /program/:slug
    if (req.path.match(/^\/program\/[^/]+$/)) {
        return res.sendFile(path.join(__dirname, '../public/program-details.html'));
    }

    // Application pages: /apply/:slug
    if (req.path.match(/^\/apply\/[^/]+$/)) {
        return res.sendFile(path.join(__dirname, '../public/apply.html'));
    }

    // Named page routes
    const file = PAGE_MAP[req.path];
    if (file) {
        return res.sendFile(path.join(__dirname, '../public', file));
    }

    // Default: home page (handles direct .html file requests gracefully too)
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🎓 LearnFlow Server Running             ║
  ║   📡 Port: ${PORT}                          ║
  ║   🌐 http://localhost:${PORT}               ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
