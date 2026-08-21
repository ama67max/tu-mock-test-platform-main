const config = require('../config/env');
const { createClerkIdentityProvider } = require('./clerkIdentityProvider');

const provider = config.AUTH_PROVIDER === 'clerk'
  ? createClerkIdentityProvider({
      secretKey: config.CLERK_SECRET_KEY,
      authorizedParties: config.clerkAuthorizedParties,
    })
  : null;

const getIdentityProvider = () => provider;

module.exports = {
  getIdentityProvider,
};