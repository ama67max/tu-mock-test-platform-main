const fs = require('fs');
const csv = require('csv-parser');
const { csvRowSchema } = require('../validators/questionValidator');
const { ApiError } = require('./apiResponse');

// ── Required CSV Column Headers ───────────────────────────────────────────────
const REQUIRED_HEADERS = [
  'category_id',
  'question_text',
  'option_a',
  'option_b',
  'correct_answer',
  'difficulty',
  'marks',
];

/**
 * Validate a CSV file for bulk question upload.
 *
 * @param {string} filePath - Absolute path to the uploaded CSV file
 * @returns {Promise<{ validRows: Array, invalidRows: Array, totalRows: number }>}
 */
const validateCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const validRows = [];
    const invalidRows = [];
    let totalRows = 0;
    let headersValidated = false;

    const stream = fs
      .createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }));

    stream.on('headers', (headers) => {
      headersValidated = true;
      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

      if (missing.length > 0) {
        stream.destroy();
        reject(
          new ApiError(
            400,
            `CSV is missing required columns: ${missing.join(', ')}`
          )
        );
      }
    });

    stream.on('data', (row) => {
      totalRows++;
      const result = csvRowSchema.safeParse(row);

      if (result.success) {
        validRows.push(result.data);
      } else {
        invalidRows.push({
          rowNumber: totalRows,
          errors: result.error.issues.map(
            (issue) => `${issue.path.join('.')}: ${issue.message}`
          ),
        });
      }
    });

    stream.on('end', () => {
      if (!headersValidated) {
        // Empty file or no headers
        reject(new ApiError(400, 'CSV file is empty or has no headers'));
        return;
      }
      resolve({ validRows, invalidRows, totalRows });
    });

    stream.on('error', (err) => {
      reject(new ApiError(400, `Failed to parse CSV: ${err.message}`));
    });
  });
};

module.exports = {
  REQUIRED_HEADERS,
  validateCsvFile,
};
