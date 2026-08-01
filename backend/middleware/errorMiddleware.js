const { ApiError } = require('../utils/apiResponse');
const config = require('../config/env');
const logger = require('../config/logger');

/**
 * Global Error Handling Middleware
 *
 * Must be mounted LAST in app.js after all routes.
 * Catches synchronous throws, async rejections (via asyncHandler),
 * and explicit next(error) calls.
 */
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];
  let isOperational = err instanceof ApiError;

  // ── Prisma Error Normalization ─────────────────────────────────────────────
  if (err.name === 'PrismaClientKnownRequestError') {
    isOperational = true;

    switch (err.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        const field = err.meta?.target?.[0] || 'field';
        message = `A record with this ${field} already exists.`;
        errors = [`${field} must be unique`];
        break;

      case 'P2025': // Record not found
        statusCode = 404;
        message = err.meta?.cause || 'Record not found';
        break;

      case 'P2003': // Foreign key constraint failed
        statusCode = 400;
        message = 'Referenced record does not exist.';
        break;

      case 'P2014': // Relation violation
        statusCode = 400;
        message = 'The requested change violates an existing relation.';
        break;

      default:
        statusCode = 500;
        message = 'Database operation failed';
        break;
    }
  }

  // ── Prisma Validation Error ────────────────────────────────────────────────
  if (err.name === 'PrismaClientValidationError') {
    isOperational = true;
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // ── JWT Error Normalization ────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    isOperational = true;
    statusCode = 401;
    message = 'Access token expired';
  } else if (err.name === 'JsonWebTokenError') {
    isOperational = true;
    statusCode = 401;
    message = 'Invalid token';
  }

  // ── Zod Error Fallback ─────────────────────────────────────────────────────
  if (err.issues && Array.isArray(err.issues)) {
    isOperational = true;
    statusCode = 400;
    message = message || 'Validation failed';
    errors = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  }

  // ── Logging ────────────────────────────────────────────────────────────────
  // Log everything server-side; distinguish severity by status code
  const logMeta = {
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId || null,
    isOperational,
    stack: err.stack,
  };

  if (statusCode >= 500) {
    logger.error(message, logMeta);
  } else {
    logger.warn(message, logMeta);
  }

  // ── Response Sanitization ──────────────────────────────────────────────────
  const response = {
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
  };

  // Include stack trace only in development
  if (config.isDevelopment && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
