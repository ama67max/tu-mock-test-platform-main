const {
  createRequireVerifiedPhone,
} = require('../../middleware/requireVerifiedPhone');

describe('requireVerifiedPhone middleware', () => {
  test('allows a verified student through', async () => {
    const next = jest.fn();
    const middleware = createRequireVerifiedPhone({
      isPhoneVerified: jest.fn().mockResolvedValue(true),
    });

    await middleware({
      user: { userId: 'local-1', providerUserId: 'clerk-1', role: 'STUDENT' },
    }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  test('blocks an unverified student with a stable policy error', async () => {
    const next = jest.fn();
    const middleware = createRequireVerifiedPhone({
      isPhoneVerified: jest.fn().mockResolvedValue(false),
    });
    const request = { user: { userId: 'local-1', role: 'STUDENT' } };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await middleware(request, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'PHONE_VERIFICATION_REQUIRED',
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test('does not apply the student gate to administrators', async () => {
    const next = jest.fn();
    const isPhoneVerified = jest.fn();
    const middleware = createRequireVerifiedPhone({ isPhoneVerified });

    await middleware({ user: { userId: 'admin-1', role: 'ADMIN' } }, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(isPhoneVerified).not.toHaveBeenCalled();
  });
});