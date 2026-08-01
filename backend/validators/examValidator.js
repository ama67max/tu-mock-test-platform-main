const { z } = require('zod');

// ── Base Exam Schema ──────────────────────────────────────────────────────────
const examBaseSchema = {
  categoryId: z
    .string()
    .min(1, 'Category ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  durationMinutes: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(
      z
        .number()
        .int('Duration must be a whole number')
        .min(1, 'Duration must be at least 1 minute')
        .max(300, 'Duration must not exceed 300 minutes')
    ),
  totalMarks: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(
      z
        .number()
        .int('Total marks must be a whole number')
        .min(1, 'Total marks must be at least 1')
    ),
  passingMarks: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(
      z
        .number()
        .int('Passing marks must be a whole number')
        .min(1, 'Passing marks must be at least 1')
    )
    .optional(),
  isPublished: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      return val === 'true' || val === '1';
    })
    .pipe(z.boolean())
    .optional(),
  startTime: z
    .string()
    .datetime({ message: 'Start time must be a valid ISO datetime' })
    .optional(),
  endTime: z
    .string()
    .datetime({ message: 'End time must be a valid ISO datetime' })
    .optional(),
};

// ── Create Exam Schema ────────────────────────────────────────────────────────
const createExamSchema = z
  .object(examBaseSchema)
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (data.passingMarks !== undefined) {
        return data.passingMarks <= data.totalMarks;
      }
      return true;
    },
    {
      message: 'Passing marks cannot exceed total marks',
      path: ['passingMarks'],
    }
  );

// ── Update Exam Schema ────────────────────────────────────────────────────────
const updateExamSchema = z
  .object(examBaseSchema)
  .partial()
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (data.passingMarks !== undefined && data.totalMarks !== undefined) {
        return data.passingMarks <= data.totalMarks;
      }
      return true;
    },
    {
      message: 'Passing marks cannot exceed total marks',
      path: ['passingMarks'],
    }
  );

// ── Exam Query Schema ─────────────────────────────────────────────────────────
const examQuerySchema = z.object({
  categoryId: z.string().optional(),
  isPublished: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      return val === 'true' || val === '1';
    })
    .pipe(z.boolean())
    .optional(),
  page: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().min(1))
    .default('1'),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().min(1).max(100))
    .default('10'),
});

module.exports = {
  createExamSchema,
  updateExamSchema,
  examQuerySchema,
};
