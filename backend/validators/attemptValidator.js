const { z } = require('zod');

// ── Start Attempt Schema ──────────────────────────────────────────────────────
const startAttemptSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
});

// ── Submit Answer Schema ──────────────────────────────────────────────────────
const submitAnswerSchema = z.object({
  attemptId: z.string().min(1, 'Attempt ID is required'),
  questionId: z.string().min(1, 'Question ID is required'),
  selectedOption: z
    .union([
      z.string().max(10, 'Option identifier too long'),
      z.number(),
      z.boolean(),
    ])
    .optional()
    .nullable()
    .transform((val) => (val === undefined || val === null ? null : String(val))),
  timeTakenSec: z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return 0;
      return typeof val === 'string' ? parseInt(val, 10) : val;
    })
    .pipe(z.number().int().min(0, 'Time taken cannot be negative'))
    .optional()
    .default(0),
});

// ── Finish Attempt Schema ─────────────────────────────────────────────────────
const finishAttemptSchema = z.object({
  attemptId: z.string().min(1, 'Attempt ID is required'),
  timeTakenSec: z
    .union([z.string(), z.number(), z.null()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return 0;
      return typeof val === 'string' ? parseInt(val, 10) : val;
    })
    .pipe(z.number().int().min(0, 'Time taken cannot be negative'))
    .optional()
    .default(0),
});

// ── Get Attempt Params Schema ─────────────────────────────────────────────────
const getAttemptSchema = z.object({
  id: z.string().min(1, 'Attempt ID is required'),
});

module.exports = {
  startAttemptSchema,
  submitAnswerSchema,
  finishAttemptSchema,
  getAttemptSchema,
};
