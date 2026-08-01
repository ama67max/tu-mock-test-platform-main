const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('./config/env');
const logger = require('./config/logger');

// ── Route Imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const questionRoutes = require('./routes/questionRoutes');
const resultRoutes = require('./routes/resultRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ── Middleware Imports ────────────────────────────────────────────────────────
const errorMiddleware = require('./middleware/errorMiddleware');

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();

// Trust proxy (required when behind Nginx / load balancer)
app.set('trust proxy', 1);

// ── Security & Performance Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(compression());

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Request Logging ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'tu-mock-test-api',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// ── API Routes (v1) ───────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/attempts', attemptRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorMiddleware);

// ── Export ────────────────────────────────────────────────────────────────────
module.exports = app;
