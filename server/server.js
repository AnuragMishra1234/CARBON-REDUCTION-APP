require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// ── Connect Database ──────────────────────────────────────
connectDB();

// ── Security Middleware ────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS allowed origins ──────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server calls (no origin) and listed origins
    if (!origin) return callback(null, true);
    const isAllowed =
      ALLOWED_ORIGINS.includes(origin) ||
      /\.vercel\.app$/.test(origin) ||   // allow all Vercel preview URLs
      /\.onrender\.com$/.test(origin);   // allow Render internal calls
    if (isAllowed) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate Limiting ──────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'AI rate limit reached. Please wait a moment.' }
});

app.use('/api/', limiter);
app.use('/api/ai', aiLimiter);

// ── Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🌿 Carbon AI API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/activity',   require('./routes/activity'));
app.use('/api/footprint',  require('./routes/footprint'));
app.use('/api/ai',         require('./routes/ai'));
app.use('/api/goals',      require('./routes/goals'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/community',  require('./routes/community'));

// ── 404 Handler ────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n🌿 ================================');
  console.log(`🌿  Carbon AI Server Online`);
  console.log(`🌿  Port    : ${PORT}`);
  console.log(`🌿  Mode    : ${process.env.NODE_ENV}`);
  console.log(`🌿  Routes  : /api/auth, /api/activity, /api/footprint`);
  console.log(`🌿           /api/ai, /api/goals, /api/challenges`);
  console.log(`🌿           /api/community`);
  console.log('🌿 ================================\n');
});

module.exports = app;
