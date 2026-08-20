const userService = require('../services/userService');
const authService = require('../services/authService');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/users/me
 * Get the authenticated user's profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const user = await userService.getUserProfile(userId);

  res.status(200).json(
    new ApiResponse(200, user, 'Profile fetched successfully')
  );
});

/**
 * PUT /api/v1/users/me
 * Update the authenticated user's profile.
 */
const updateMe = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { fullName, avatarUrl, phone, institution, targetExam } = req.body;

  const updated = await userService.updateProfile(userId, {
    fullName,
    avatarUrl,
    phone,
    institution,
    targetExam,
  });

  res.status(200).json(
    new ApiResponse(200, updated, 'Profile updated successfully')
  );
});

const changePassword = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { oldPassword, newPassword } = req.body;

  await authService.changePassword(userId, oldPassword, newPassword);

  res.status(200).json(
    new ApiResponse(200, null, 'Password changed successfully')
  );
});

/**
 * GET /api/v1/users/:id
 * Get any user by ID (admin use).
 */
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await userService.getUserById(id);

  res.status(200).json(
    new ApiResponse(200, user, 'User fetched successfully')
  );
});

/**
 * PUT /api/v1/users/:id
 * Update a user's role or activation status (admin use).
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, isActive } = req.body;

  const updated = await userService.updateUser(id, { role, isActive });

  res.status(200).json(
    new ApiResponse(200, updated, 'User updated successfully')
  );
});

/**
 * GET /api/v1/users/search
 * Search and paginate users (admin use).
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { query, page, limit } = req.query;

  const result = await userService.searchUsers({
    query,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Users fetched successfully')
  );
});

/**
 * PATCH /api/v1/users/:id/toggle
 * Toggle a user's active status (admin use).
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await userService.deleteUser(id);

  res.status(200).json(
    new ApiResponse(200, deleted, 'User deleted successfully')
  );
});

const toggleActivation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await userService.toggleUserActivation(id);

  const message = updated.isActive
    ? 'User activated successfully'
    : 'User deactivated successfully';

  res.status(200).json(
    new ApiResponse(200, updated, message)
  );
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
  getUser,
  updateUser,
  searchUsers,
  deleteUser,
  toggleActivation,
};
