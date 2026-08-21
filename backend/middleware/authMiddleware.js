const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiResponse');
const config = require('../config/env');
const prisma = require('../config/db');
const { getIdentityProvider } = require('../services/identityProvider');
const { hashPassword } = require('../utils/password');
const crypto = require('crypto');

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
const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access token missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Access token missing');
  }

  return token;
};

const legacyAuthMiddleware = (req, res, next) => {
  const token = getBearerToken(req);

  const decoded = verifyAccessToken(token);
  req.user = {
    ...decoded,
    id: decoded.userId ?? decoded.id,
    userId: decoded.userId ?? decoded.id,
  };

  next();
};

const clerkAuthMiddleware = async (req, res, next) => {
  try {
    const providerIdentity = await getIdentityProvider().verifyRequestToken(
      getBearerToken(req)
    );
    let user = await prisma.user.findUnique({
      where: { email: providerIdentity.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: providerIdentity.email,
          fullName: providerIdentity.fullName,
          passwordHash: await hashPassword(crypto.randomBytes(32).toString('hex')),
          profile: { create: {} },
        },
      });
    }

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account not found or deactivated');
    }

    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      providerUserId: providerIdentity.providerUserId,
    };

    return next();
  } catch (error) {
    return next(error instanceof ApiError
      ? error
      : new ApiError(401, 'Invalid or expired authentication token'));
  }
};

const authMiddleware = config.AUTH_PROVIDER === 'clerk'
  ? clerkAuthMiddleware
  : legacyAuthMiddleware;

module.exports = authMiddleware;
