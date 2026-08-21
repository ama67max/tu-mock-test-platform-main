const {
  createRequireVerifiedPhone,
} = require('../../middleware/requireVerifiedPhone');

describe('student exam and result phone policy', () => {
  test.each(['finish-attempt', 'read-result', 'read-answers'])(
    'blocks an unverified student from %s',
    async (operation) => {
      const next = jest.fn();
      const middleware = createRequireVerifiedPhone({
        isPhoneVerified: jest.fn().mockResolvedValue(false),
      });
      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await middleware({
        user: { userId: 'local-1', providerUserId: 'clerk-1', role: 'STUDENT' },
        operation,
      }, response, next);

      expect(response.status).toHaveBeenCalledWith(403);
      expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'PHONE_VERIFICATION_REQUIRED',
      }));
      expect(next).not.toHaveBeenCalled();
    }
  );
});