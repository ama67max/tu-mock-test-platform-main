# Clerk Authentication and Phone Verification Design

## Goal

Use Clerk as the active authentication provider for Google, email, and phone sign-in while preserving the existing Prisma schema so the platform can later move to Supabase. Require verified phone ownership before students can finish an exam or access results.

## Decisions

- Clerk is the authentication authority for interactive sessions.
- The existing `User` and `UserProfile` schema remains unchanged.
- Provider-specific code is isolated behind an authentication adapter.
- The backend remains authoritative for authorization and phone-verification enforcement.
- Students may start attempts and save answers without phone verification.
- Students may not manually finish attempts or access results/answers until Clerk reports a verified phone number.
- Automatic expiry submission remains available for exam integrity; result access still requires verification.
- Administrators retain access to administrative/reporting flows.

## Backend flow

1. Verify the Clerk bearer token and normalize it into the existing `req.user` shape.
2. Resolve the local user by the existing application identity field without adding provider columns.
3. For student-only protected actions, query the provider adapter for current phone verification state.
4. Return a stable `PHONE_VERIFICATION_REQUIRED` error with a `403` status when the requirement is unmet.

## Frontend flow

Clerk owns sign-in and verification UI. API failures with `PHONE_VERIFICATION_REQUIRED` route the student to the Clerk phone verification flow and preserve the current exam/result context.

## Security

- Never trust a phone number or verification flag supplied by the browser.
- Verify Clerk issuer, audience, signature, expiry, and authorized-party claims using Clerk's official backend SDK.
- Keep Clerk secrets server-side and the publishable key frontend-only.
- Keep the provider adapter replaceable so Supabase can implement the same normalized contract later.

## Testing

- Unit-test provider identity normalization and phone verification policy.
- Test attempt finish rejection and result endpoint rejection for unverified students.
- Test verified students and administrative users remain allowed.
- Test automatic expiry is not blocked by the interactive submission policy.