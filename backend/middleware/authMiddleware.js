const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiResponse');

/**
 * Authentication Middleware
 *
 * Verifies the JWT access token from the Authorization header.
 * On success, attaches the decoded payload to req.user.
 * On failure, throws ApiError(401).
 *
 * Usage:
 *   router.get('/me', authMiddleware, userController.getMe);
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access token missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Access token missing');
  }

  const decoded = verifyAccessToken(token);
  req.user = {
    ...decoded,
    id: decoded.userId ?? decoded.id,
    userId: decoded.userId ?? decoded.id,
  };

  next();
};

module.exports = authMiddleware;
