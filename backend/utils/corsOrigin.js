const normalizeOrigin = (origin) => {
  if (!origin) return '';

  try {
    const url = new URL(origin);
    return url.origin;
  } catch (error) {
    return origin.trim().replace(/\/$/, '');
  }
};

const createOriginChecker = (
  allowedOrigins,
  { allowGithubCodespaces = false, allowAllOrigins = false } = {}
) => {
  const normalizedAllowedOrigins = new Set(
    allowedOrigins.map(normalizeOrigin).filter(Boolean)
  );

  return (origin, callback) => {
    const normalizedOrigin = normalizeOrigin(origin);
    const isGithubCodespacesOrigin = allowGithubCodespaces
      && normalizedOrigin.endsWith('.app.github.dev');

    if (!origin || allowAllOrigins || normalizedAllowedOrigins.has(normalizedOrigin) || isGithubCodespacesOrigin) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin is not allowed by CORS'));
  };
};

module.exports = {
  normalizeOrigin,
  createOriginChecker,
};
