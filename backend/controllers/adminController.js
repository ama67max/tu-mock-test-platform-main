const prisma = require('../config/db');
const analyticsService = require('../services/analyticsService');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const csvValue = (value) => {
  const stringValue = value == null ? '' : String(value);
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};

// ── Dashboard Overview ────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/overview
 * Consolidated admin dashboard data: KPIs + recent activity.
 */
const getOverview = asyncHandler(async (req, res) => {
  const [stats, recentAttempts, recentUsers] = await Promise.all([
    analyticsService.getSystemStats(),
    prisma.userAttempt.findMany({
      where: { status: { in: ['COMPLETED', 'TIME_UP'] } },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        exam: { select: { id: true, title: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  res.status(200).json(
    new ApiResponse(200, { stats, recentAttempts, recentUsers }, 'Overview fetched')
  );
});

const exportResults = asyncHandler(async (req, res) => {
  const { examId } = req.query;
  const attempts = await prisma.userAttempt.findMany({
    where: {
      ...(examId ? { examId } : {}),
      status: { in: ['COMPLETED', 'TIME_UP'] },
    },
    include: {
      user: { select: { fullName: true, email: true } },
      exam: { select: { title: true } },
    },
    orderBy: { submittedAt: 'desc' },
  });

  const header = 'Attempt ID,Student,Exam,Score,Status,Submitted At';
  const rows = attempts.map((attempt) => [
    attempt.id,
    `${attempt.user.fullName} <${attempt.user.email}>`,
    attempt.exam.title,
    attempt.score,
    attempt.status,
    attempt.submittedAt?.toISOString(),
  ].map(csvValue).join(','));

  res
    .status(200)
    .type('text/csv')
    .set('Content-Disposition', 'attachment; filename="results.csv"')
    .send([header, ...rows].join('\n'));
});

// ── Category CRUD ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/categories
 * List all categories with usage counts.
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { exams: true, questions: true } },
    },
    orderBy: { name: 'asc' },
  });

  res.status(200).json(
    new ApiResponse(200, categories, 'Categories fetched successfully')
  );
});

/**
 * POST /api/v1/admin/categories
 * Create a new exam category.
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ApiError(400, 'Category name is required');
  }
  if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
    throw new ApiError(400, 'Category slug is required');
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ApiError(400, 'Slug must be lowercase alphanumeric with hyphens only');
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description?.trim() || null,
    },
  });

  res.status(201).json(
    new ApiResponse(201, category, 'Category created successfully')
  );
});

/**
 * PUT /api/v1/admin/categories/:id
 * Update an existing category.
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Category not found');

  const data = {};
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ApiError(400, 'Category name cannot be empty');
    }
    data.name = name.trim();
  }
  if (slug !== undefined) {
    if (typeof slug !== 'string' || slug.trim().length === 0) {
      throw new ApiError(400, 'Category slug cannot be empty');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new ApiError(400, 'Slug must be lowercase alphanumeric with hyphens only');
    }
    data.slug = slug.trim().toLowerCase();
  }
  if (description !== undefined) data.description = description?.trim() || null;

  const updated = await prisma.category.update({
    where: { id },
    data,
  });

  res.status(200).json(
    new ApiResponse(200, updated, 'Category updated successfully')
  );
});

/**
 * DELETE /api/v1/admin/categories/:id
 * Delete a category. Fails if referenced by exams or questions (Prisma Restrict).
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Category not found');

  await prisma.category.delete({ where: { id } });

  res.status(200).json(
    new ApiResponse(200, { id }, 'Category deleted successfully')
  );
});

module.exports = {
  getOverview,
  exportResults,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};