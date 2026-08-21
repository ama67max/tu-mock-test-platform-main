const { createClerkClient, verifyToken } = require('@clerk/backend');

const normalizeRole = (role) => {
  return ['STUDENT', 'ADMIN', 'SUPER_ADMIN'].includes(role) ? role : 'STUDENT';
};

const createClerkIdentityProvider = ({
  verifyToken: verify = verifyToken,
  getUser,
  secretKey = process.env.CLERK_SECRET_KEY,
  authorizedParties = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : undefined,
} = {}) => {
  const client = getUser ? null : createClerkClient({ secretKey });
  const loadUser = getUser || ((userId) => client.users.getUser(userId));

  return {
    async verifyRequestToken(token) {
      try {
        const claims = await verify(token, {
          secretKey,
          authorizedParties,
        });

        if (!claims.sub) {
          throw new Error('Clerk token is missing the user subject claim');
        }

        const user = claims.email || claims.email_address ? null : await loadUser(claims.sub);
        const email = claims.email
          || claims.email_address
          || user?.primaryEmailAddress?.emailAddress
          || user?.emailAddresses?.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress;
        if (!email) throw new Error('Clerk user has no email address');

        const fullName = [
          claims.first_name || user?.firstName,
          claims.last_name || user?.lastName,
        ].filter(Boolean).join(' ') || email.split('@')[0];

        return {
          providerUserId: claims.sub,
          email: email.toLowerCase(),
          fullName,
          role: normalizeRole(claims.publicMetadata?.role),
        };
      } catch (error) {
        const authError = new Error('Invalid or expired Clerk session token');
        authError.cause = error;
        authError.code = 'INVALID_PROVIDER_TOKEN';
        throw authError;
      }
    },

    async isPhoneVerified(providerUserId) {
      const user = await loadUser(providerUserId);
      return (user.phoneNumbers || []).some(
        (phoneNumber) => phoneNumber.verification?.status === 'verified'
      );
    },
  };
};

module.exports = {
  createClerkIdentityProvider,
};