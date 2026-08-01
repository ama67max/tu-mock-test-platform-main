const { validateCsvFile } = require('../utils/csvValidator');
const prisma = require('../config/db');
const { ApiError } = require('../utils/apiResponse');
const logger = require('../config/logger');

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildOptions = (row) => {
  const opts = [row.option_a, row.option_b];
  if (row.option_c) opts.push(row.option_c);
  if (row.option_d) opts.push(row.option_d);
  return opts.filter(Boolean);
};

const transformRow = (row) => ({
  categoryId: row.category_id,
  questionText: row.question_text,
  options: buildOptions(row),
  correctAnswer: row.correct_answer,
  explanation: row.explanation || null,
  difficulty: row.difficulty,
  marks: row.marks,
});

// ── Bulk Upload ───────────────────────────────────────────────────────────────

/**
 * Bulk upload questions from a CSV file.
 *
 * @param {string} filePath - Absolute path to uploaded CSV
 * @returns {Promise<{ created: number, failed: number, total: number, errors: Array }>}
 */
const bulkUploadQuestions = async (filePath) => {
  // Step 1: Parse and validate CSV structure + row-level data
  const { validRows, invalidRows, totalRows } = await validateCsvFile(filePath);

  // Collect all errors (CSV validation errors + FK errors)
  const allErrors = [...invalidRows];

  if (validRows.length === 0) {
    return { created: 0, failed: totalRows, total: totalRows, errors: allErrors };
  }

  // Step 2: Pre-validate foreign key references (categories)
  const categoryIds = [...new Set(validRows.map((r) => r.category_id))];
  const existingCategories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });
  const validCategoryIds = new Set(existingCategories.map((c) => c.id));

  // Step 3: Filter rows with invalid categories and transform the rest
  const rowsToInsert = [];

  validRows.forEach((row) => {
    if (!validCategoryIds.has(row.category_id)) {
      allErrors.push({
        category_id: row.category_id,
        errors: [`Category '${row.category_id}' does not exist`],
      });
      return;
    }
    rowsToInsert.push(transformRow(row));
  });

  if (rowsToInsert.length === 0) {
    return {
      created: 0,
      failed: allErrors.length,
      total: totalRows,
      errors: allErrors,
    };
  }

  // Step 4: Single atomic transaction insert
  try {
    const result = await prisma.$transaction(async (tx) => {
      return tx.question.createMany({
        data: rowsToInsert,
      });
    });

    logger.info('Bulk question upload completed', {
      created: result.count,
      totalRows,
      failed: allErrors.length,
      filePath,
    });

    return {
      created: result.count,
      failed: allErrors.length,
      total: totalRows,
      errors: allErrors,
    };
  } catch (err) {
    logger.error('Bulk upload database transaction failed', {
      error: err.message,
      filePath,
      attemptedCount: rowsToInsert.length,
    });
    throw new ApiError(500, 'Failed to insert questions. Please try again.');
  }
};

module.exports = {
  bulkUploadQuestions,
};
