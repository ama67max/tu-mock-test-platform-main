const {
  createClerkIdentityProvider,
} = require('../../services/clerkIdentityProvider');

describe('Clerk identity provider', () => {
  test('normalizes a verified Clerk token into the application identity contract', async () => {
    const provider = createClerkIdentityProvider({
      verifyToken: jest.fn().mockResolvedValue({
        sub: 'user_clerk_123',
        email: 'student@example.com',
        publicMetadata: { role: 'STUDENT' },
      }),
      getUser: jest.fn(),
    });

    await expect(provider.verifyRequestToken('token')).resolves.toEqual({
      providerUserId: 'user_clerk_123',
      email: 'student@example.com',
      fullName: 'student',
      role: 'STUDENT',
    });
  });

  test('reports phone verification from Clerk rather than request data', async () => {
    const provider = createClerkIdentityProvider({
      verifyToken: jest.fn(),
      getUser: jest.fn().mockResolvedValue({
        phoneNumbers: [
          { verification: { status: 'verified' } },
        ],
      }),
    });

    await expect(provider.isPhoneVerified('user_clerk_123')).resolves.toBe(true);
  });

  test('loads email and name from Clerk when the session token has only a subject', async () => {
    const provider = createClerkIdentityProvider({
      verifyToken: jest.fn().mockResolvedValue({ sub: 'user_clerk_123' }),
      getUser: jest.fn().mockResolvedValue({
        firstName: 'Google',
        lastName: 'Student',
        primaryEmailAddress: { emailAddress: 'student@example.com' },
        phoneNumbers: [],
      }),
    });

    await expect(provider.verifyRequestToken('token')).resolves.toMatchObject({
      providerUserId: 'user_clerk_123',
      email: 'student@example.com',
      fullName: 'Google Student',
    });
  });

  test('rejects a user with no verified phone number', async () => {
    const provider = createClerkIdentityProvider({
      verifyToken: jest.fn(),
      getUser: jest.fn().mockResolvedValue({
        phoneNumbers: [
          { verification: { status: 'unverified' } },
        ],
      }),
    });

    await expect(provider.isPhoneVerified('user_clerk_123')).resolves.toBe(false);
  });
});