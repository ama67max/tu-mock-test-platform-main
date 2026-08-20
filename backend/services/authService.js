const crypto = require('crypto');
const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateTokenPair } = require('../utils/jwt');
const { ApiError } = require('../utils/apiResponse');

// ── Helpers ───────────────────────────────────────────────────────────────────
const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const sanitizeUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

// ── Register ──────────────────────────────────────────────────────────────────
const register = async ({ email, password, fullName, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });
    return created;
  });

  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user || !(await comparePassword(oldPassword, user.passwordHash))) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
};

// ── Logout (Single Device) ────────────────────────────────────────────────────
const logout = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);
  await prisma.refreshToken.deleteMany({
    where: { tokenHash },
  });
};

// ── Refresh Access Token ──────────────────────────────────────────────────────
const refreshAccessToken = async (refreshToken) => {
  const { verifyRefreshToken, generateTokenPair } = require('../utils/jwt');
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!stored) {
    throw new ApiError(401, 'Refresh token revoked or invalid');
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new ApiError(401, 'Refresh token expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { profile: true },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or deactivated');
  }

  // Token rotation: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: sanitizeUser(user),
  };
};

// ── Logout All Devices ────────────────────────────────────────────────────────
const logoutAllDevices = async (userId) => {
  const result = await prisma.refreshToken.deleteMany({
    where: { userId },
  });
  return { count: result.count };
};

module.exports = {
  register,
  login,
  changePassword,
  logout,
  refreshAccessToken,
  logoutAllDevices,
};
