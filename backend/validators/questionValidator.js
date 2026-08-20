const { z } = require('zod');

// ── Difficulty Enum Helper ────────────────────────────────────────────────────
const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);

// ── Create Question Schema ────────────────────────────────────────────────────
const createQuestionSchema = z
  .object({
    categoryId: z.string().min(1, 'Category ID is required'),
    questionText: z
      .string()
      .min(1, 'Question text is required')
      .max(2000, 'Question text must not exceed 2000 characters'),
    options: z
      .array(z.string().min(1, 'Option cannot be empty'))
      .min(2, 'At least 2 options are required')
      .max(6, 'At most 6 options are allowed'),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    explanation: z
      .string()
      .max(5000, 'Explanation must not exceed 5000 characters')
      .optional(),
    difficulty: difficultyEnum,
    marks: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
      .pipe(
        z
          .number()
          .int('Marks must be a whole number')
          .min(1, 'Marks must be at least 1')
          .max(100, 'Marks must not exceed 100')
      ),
    isActive: z
      .union([z.boolean(), z.string()])
      .transform((val) => {
        if (typeof val === 'boolean') return val;
        return val === 'true' || val === '1';
      })
      .pipe(z.boolean())
      .optional()
      .default(true),
  })
  .refine(
    (data) => data.options.includes(data.correctAnswer),
    {
      message: 'Correct answer must be one of the provided options',
      path: ['correctAnswer'],
    }
  );

// ── Update Question Schema ────────────────────────────────────────────────────
const updateQuestionSchema = z
  .object({
    categoryId: z.string().min(1, 'Category ID is required').optional(),
    questionText: z
      .string()
      .min(1, 'Question text is required')
      .max(2000, 'Question text must not exceed 2000 characters')
      .optional(),
    options: z
      .array(z.string().min(1, 'Option cannot be empty'))
      .min(2, 'At least 2 options are required')
      .max(6, 'At most 6 options are allowed')
      .optional(),
    correctAnswer: z.string().min(1, 'Correct answer is required').optional(),
    explanation: z
      .string()
      .max(5000, 'Explanation must not exceed 5000 characters')
      .optional(),
    difficulty: difficultyEnum.optional(),
    marks: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
      .pipe(
        z
          .number()
          .int('Marks must be a whole number')
          .min(1, 'Marks must be at least 1')
          .max(100, 'Marks must not exceed 100')
      )
      .optional(),
    isActive: z
      .union([z.boolean(), z.string()])
      .transform((val) => {
        if (typeof val === 'boolean') return val;
        return val === 'true' || val === '1';
      })
      .pipe(z.boolean())
      .optional(),
  })
  .refine(
    (data) => {
      if (data.options && data.correctAnswer) {
        return data.options.includes(data.correctAnswer);
      }
      return true;
    },
    {
      message: 'Correct answer must be one of the provided options',
      path: ['correctAnswer'],
    }
  );

// ── Question Query Schema ─────────────────────────────────────────────────────
const questionQuerySchema = z.object({
  categoryId: z.string().optional(),
  difficulty: difficultyEnum.optional(),
  isActive: z
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
    .transform((val) => Math.min(typeof val === 'string' ? parseInt(val, 10) : val, 100))
    .pipe(z.number().int().min(1).max(100))
    .default('10'),
});

// ── CSV Row Schema (Bulk Upload) ──────────────────────────────────────────────
const csvRowSchema = z
  .object({
    category_id: z.string().min(1, 'Category ID is required'),
    question_text: z.string().min(1, 'Question text is required'),
    option_a: z.string().min(1, 'Option A is required'),
    option_b: z.string().min(1, 'Option B is required'),
    option_c: z.string().optional(),
    option_d: z.string().optional(),
    correct_answer: z.string().min(1, 'Correct answer is required'),
    explanation: z.string().optional(),
    difficulty: z
      .string()
      .transform((val) => val.toUpperCase().trim())
      .pipe(difficultyEnum),
    marks: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
      .pipe(
        z
          .number()
          .int('Marks must be a whole number')
          .min(1, 'Marks must be at least 1')
          .max(100, 'Marks must not exceed 100')
      ),
  })
  .refine(
    (data) => {
      const options = [data.option_a, data.option_b];
      if (data.option_c) options.push(data.option_c);
      if (data.option_d) options.push(data.option_d);
      return options.includes(data.correct_answer);
    },
    {
      message: 'Correct answer must match one of the provided options (A, B, C, or D)',
      path: ['correct_answer'],
    }
  );

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  questionQuerySchema,
  csvRowSchema,
};
