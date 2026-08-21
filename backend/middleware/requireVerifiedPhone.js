const { ApiResponse } = require('../utils/apiResponse');
const { getIdentityProvider } = require('../services/identityProvider');

const createRequireVerifiedPhone = (identityProvider = getIdentityProvider()) => {
  return async (req, res, next) => {
    if (['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role)) {
      return next();
    }

    const providerUserId = req.user?.providerUserId;
    const isVerified = providerUserId && await identityProvider.isPhoneVerified(providerUserId);

    if (!isVerified) {
      return res.status(403).json({
        ...new ApiResponse(403, null, 'Verified phone number required'),
        code: 'PHONE_VERIFICATION_REQUIRED',
      });
    }

    return next();
  };
};

module.exports = {
  createRequireVerifiedPhone,
  requireVerifiedPhone: createRequireVerifiedPhone(),
};