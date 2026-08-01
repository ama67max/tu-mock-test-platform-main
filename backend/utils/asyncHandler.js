/**
 * Async Handler Wrapper
 *
 * Wraps an Express async route handler so that any rejected Promise
 * or thrown exception is automatically forwarded to the next()
 * error-handling middleware.
 *
 * Usage:
 *   router.get('/exams', asyncHandler(async (req, res) => {
 *     const exams = await examService.getAll();
 *     res.status(200).json(new ApiResponse(200, exams));
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
