const authService = require('../services/authService');
const config = require('../config/env');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (!name) return cookies;
    cookies[name] = decodeURIComponent(rest.join('='));
    return cookies;
  }, {});
};

const getRefreshTokenFromRequest = (req) => {
  if (req.body?.refreshToken) {
    return req.body.refreshToken;
  }

  const cookies = parseCookies(req.headers.cookie || '');
  return cookies.refreshToken;
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
  });
};

/**
 * POST /api/v1/auth/register
 * Register a new user account.
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, role } = req.body;

  const result = await authService.register({ email, password, fullName, role });
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(201).json(
    new ApiResponse(201, result, 'User registered successfully')
  );
});

/**
 * POST /api/v1/auth/login
 * Authenticate an existing user.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, result, 'Login successful')
  );
});

/**
 * POST /api/v1/auth/logout
 * Revoke the current refresh token (single device logout).
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  clearRefreshTokenCookie(res);

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});

/**
 * POST /api/v1/auth/refresh
 * Rotate refresh token and issue new access token pair.
 */
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    return res.status(401).json(new ApiResponse(401, null, 'Refresh token missing'));
  }

  const result = await authService.refreshAccessToken(refreshToken);
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, result, 'Token refreshed successfully')
  );
});

/**
 * POST /api/v1/auth/logout-all
 * Revoke all refresh tokens for the authenticated user.
 */
const logoutAll = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const result = await authService.logoutAllDevices(userId);

  res.status(200).json(
    new ApiResponse(200, result, 'Logged out from all devices')
  );
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  logoutAll,
};
