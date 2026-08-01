const prisma = require('../config/db');
const { ApiError } = require('../utils/apiResponse');

// ── Safe User Select ──────────────────────────────────────────────────────────
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// ── Get User by ID ────────────────────────────────────────────────────────────
const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

// ── Get User Profile ──────────────────────────────────────────────────────────
const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...SAFE_USER_SELECT,
      profile: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

// ── Update Profile ────────────────────────────────────────────────────────────
const updateProfile = async (userId, data) => {
  const { fullName, avatarUrl, phone, institution, targetExam } = data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Update User table fields if provided
    const userUpdate = {};
    if (fullName !== undefined) userUpdate.fullName = fullName;

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: userUpdate,
      select: SAFE_USER_SELECT,
    });

    // Update or create UserProfile
    const profileUpdate = {};
    if (avatarUrl !== undefined) profileUpdate.avatarUrl = avatarUrl;
    if (phone !== undefined) profileUpdate.phone = phone;
    if (institution !== undefined) profileUpdate.institution = institution;
    if (targetExam !== undefined) profileUpdate.targetExam = targetExam;

    const updatedProfile = await tx.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileUpdate,
      },
      update: profileUpdate,
    });

    return { ...updatedUser, profile: updatedProfile };
  });

  return updated;
};

// ── Update User (Admin) ───────────────────────────────────────────────────────
const updateUser = async (userId, data) => {
  const { role, isActive } = data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updateData = {};
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: SAFE_USER_SELECT,
  });

  return updated;
};

// ── Search Users (Admin) ──────────────────────────────────────────────────────
const searchUsers = async ({ query = '', page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const searchFilter = query
    ? {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
        ],
      }
    : {};

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: searchFilter,
      select: SAFE_USER_SELECT,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: searchFilter }),
  ]);

  return {
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// ── Toggle User Activation ────────────────────────────────────────────────────
const toggleUserActivation = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: SAFE_USER_SELECT,
  });

  return updated;
};

const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const deleted = await prisma.user.delete({
    where: { id: userId },
    select: SAFE_USER_SELECT,
  });

  return deleted;
};

module.exports = {
  getUserById,
  getUserProfile,
  updateProfile,
  updateUser,
  searchUsers,
  toggleUserActivation,
  deleteUser,
};
