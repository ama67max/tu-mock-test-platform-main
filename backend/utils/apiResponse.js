/**
 * Standardized success response.
 * Every successful controller response should use this class.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (< 400)
   * @param {*} data - Payload to return
   * @param {string} [message='Success'] - Human-readable message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

/**
 * Operational error class.
 * Extends native Error so it can be thrown and caught by asyncHandler + errorMiddleware.
 * Distinguishes predictable operational errors (4xx) from unexpected programmer errors (5xx).
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (>= 400)
   * @param {string} message - Error message
   * @param {Array<string>} [errors=[]] - Detailed validation / field errors
   * @param {string} [stack=''] - Optional stack trace override
   */
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = {
  ApiResponse,
  ApiError,
};

