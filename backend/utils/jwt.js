const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const { ApiError } = require('./apiResponse');

// ── Access Token ───────────────────────────────────────────────────────────────
/**
 * Sign a short-lived access token.
 * @param {object} payload - e.g. { userId, role }
 * @returns {string} signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY,
  });
};

// ── Refresh Token ──────────────────────────────────────────────────────────────
/**
 * Sign a long-lived refresh token with a unique jti for rotation/revocation.
 * @param {object} payload - e.g. { userId, role }
 * @returns {{ token: string, jti: string }}
 */
const generateRefreshToken = (payload) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ ...payload, jti }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY,
  });
  return { token, jti };
};

// ── Token Hashing (for DB storage) ────────────────────────────────────────────
/**
 * SHA-256 hash a raw token string for safe DB storage/lookup.
 * Refresh tokens are high-entropy already — a fast deterministic hash
 * is correct here; bcrypt is reserved for low-entropy user passwords.
 * @param {string} token
 * @returns {string} hex-encoded SHA-256 hash
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ── Verification ───────────────────────────────────────────────────────────────
/**
 * Verify an access token.
 * @param {string} token
 * @throws {ApiError} 401 if expired or invalid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    }
    throw new ApiError(401, 'Invalid access token');
  }
};

/**
 * Verify a refresh token.
 * @param {string} token
 * @throws {ApiError} 401 if expired or invalid
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Refresh token expired');
    }
    throw new ApiError(401, 'Invalid refresh token');
  }
};

// ── Convenience: Full Pair ────────────────────────────────────────────────────
/**
 * Generate a complete access + refresh token pair, plus the refresh
 * token's hash for immediate DB storage (RefreshToken.tokenHash).
 * @param {object} payload - e.g. { userId, role }
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const { token: refreshToken, jti } = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    refreshTokenHash: hashToken(refreshToken),
    jti,
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateTokenPair,
};