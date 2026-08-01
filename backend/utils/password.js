const bcrypt = require('bcryptjs');
const config = require('../config/env');

/**
 * Hash a plain-text password using bcrypt.
 * @param {string} plainText
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (plainText) => {
  return bcrypt.hash(plainText, config.BCRYPT_SALT_ROUNDS);
};

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} plainText
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plainText, hash) => {
  return bcrypt.compare(plainText, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
