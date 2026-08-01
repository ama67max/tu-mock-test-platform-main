const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('./env');

const { combine, timestamp, json, errors, splat, printf, colorize } = winston.format;

// ── Custom Console Format (Development-friendly) ──────────────────────────────
const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  let log = `${ts} [${level}]: ${stack || message}`;
  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }
  return log;
});

// ── Base Format (JSON for production, structured for parsing) ─────────────────
const baseFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  json()
);

// ── Transports ────────────────────────────────────────────────────────────────
const transports = [];

// Console transport (always active, colorized in dev)
transports.push(
  new winston.transports.Console({
    level: config.LOG_LEVEL,
    format: config.isDevelopment
      ? combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), consoleFormat)
      : baseFormat,
  })
);

// File transports (production only)
if (config.isProduction) {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: baseFormat,
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: baseFormat,
    })
  );
}

// ── Logger Instance ───────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  defaultMeta: { service: 'tu-mock-test-api' },
  transports,
  // Capture uncaught exceptions
  exceptionHandlers: config.isProduction
    ? [
        new DailyRotateFile({
          filename: 'logs/exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: baseFormat,
        }),
      ]
    : [new winston.transports.Console()],
  // Capture unhandled promise rejections
  rejectionHandlers: config.isProduction
    ? [
        new DailyRotateFile({
          filename: 'logs/rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: baseFormat,
        }),
      ]
    : [new winston.transports.Console()],
  exitOnError: false,
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
process.on('SIGINT', () => {
  logger.end(() => {
    process.exit(0);
  });
});

module.exports = logger;
