const { ApiError } = require('../utils/apiResponse');

/**
 * Role-Based Access Control Middleware
 *
 * Restricts a route to users with specific roles.
 * Must be mounted AFTER authMiddleware so that req.user exists.
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.post('/exams', authMiddleware, authorizeRoles('ADMIN'), examController.create);
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        'Forbidden: you do not have permission to access this resource'
      );
    }

    next();
  };
};

module.exports = authorizeRoles;
