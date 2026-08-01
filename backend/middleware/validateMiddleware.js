const { ApiError } = require('../utils/apiResponse');

/**
 * Request Validation Middleware
 *
 * Validates req.body, req.query, and/or req.params against Zod schemas.
 * On failure, throws ApiError(400) with field-level error messages.
 * On success, replaces the request property with the parsed (coerced) value.
 *
 * @param {Object} schemas - { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
 * @returns {Function} Express middleware
 */
const validate = (schemas) => {
  return async (req, res, next) => {
    const errors = [];

    // Validate each segment if a schema is provided
    const segments = ['body', 'query', 'params'];

    for (const segment of segments) {
      const schema = schemas[segment];
      if (!schema) continue;

      const result = await schema.safeParseAsync(req[segment]);

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.length > 0 ? issue.path.join('.') : segment;
          errors.push(`${path}: ${issue.message}`);
        });
      } else {
        // Replace raw request data with parsed/coerced data
        req[segment] = result.data;
      }
    }

    if (errors.length > 0) {
      return next(new ApiError(400, 'Validation failed', errors));
    }

    next();
  };
};

module.exports = validate;
