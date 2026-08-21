const { createOriginChecker, normalizeOrigin } = require('../../utils/corsOrigin');

describe('CORS origin validation', () => {
  test('normalizes equivalent configured and request origins', () => {
    expect(normalizeOrigin('https://example.github.dev/')).toBe('https://example.github.dev');

    const checker = createOriginChecker(['https://example.github.dev/']);
    const callback = jest.fn();

    checker('https://example.github.dev', callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  test('rejects origins that are not explicitly allowed', () => {
    const checker = createOriginChecker(['https://example.github.dev']);
    const callback = jest.fn();

    checker('https://another.github.dev', callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });

  test('allows GitHub Codespaces origins in development mode', () => {
    const checker = createOriginChecker(
      ['http://localhost:5173'],
      { allowGithubCodespaces: true }
    );
    const callback = jest.fn();

    checker('https://a-different-forwarded-port-5173.app.github.dev', callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  test('does not allow GitHub Codespaces origins when disabled', () => {
    const checker = createOriginChecker(['http://localhost:5173']);
    const callback = jest.fn();

    checker('https://a-different-forwarded-port-5173.app.github.dev', callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });

  test('allows any browser origin when development mode is explicitly enabled', () => {
    const checker = createOriginChecker(
      ['http://localhost:5173'],
      { allowAllOrigins: true }
    );
    const callback = jest.fn();

    checker('https://preview.example.dev', callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  test('keeps the allowlist strict when development mode is disabled', () => {
    const checker = createOriginChecker(['http://localhost:5173']);
    const callback = jest.fn();

    checker('https://preview.example.dev', callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });
});
