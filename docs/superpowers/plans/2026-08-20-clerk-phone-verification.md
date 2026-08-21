# Clerk Phone Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Clerk behind a provider-neutral auth boundary and enforce verified phone ownership for student exam submission and result access without changing the Prisma schema.

**Architecture:** The backend will normalize Clerk-authenticated requests into the existing `req.user` contract and use a replaceable provider adapter for phone verification. A reusable middleware will guard manual finish and result routes, while automatic expiry continues through its existing service path. The frontend will use Clerk for interactive auth and translate the stable backend policy error into the verification flow.

**Tech Stack:** Node.js, Express, Prisma, Clerk backend SDK, React, Clerk React SDK, Jest, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-20-clerk-phone-verification-design.md`

## Global Constraints

- Do not modify `backend/prisma/schema.prisma` or add a migration.
- Do not trust phone verification data from request bodies, local storage, or JWT custom claims unless verified by the provider adapter.
- Preserve the existing `req.user.userId`, `req.user.id`, and `req.user.role` consumers.
- Manual student finish and all student result reads require verified phone status.
- Automatic expiry submission remains operational.

---

### Task 1: Provider-Neutral Auth Contract

**Files:**
- Create: `backend/services/identityProvider.js`
- Create: `backend/services/clerkIdentityProvider.js`
- Modify: `backend/config/env.js`
- Modify: `backend/middleware/authMiddleware.js`
- Test: `backend/tests/unit/identityProvider.test.js`

**Interfaces:**
- Produces `identityProvider.verifyRequestToken(token)` returning `{ userId, email, role }`.
- Produces `identityProvider.isPhoneVerified(userId)` returning a boolean.

- [ ] Write tests for Clerk token normalization and verified/unverified phone outcomes.
- [ ] Run `npx jest backend/tests/unit/identityProvider.test.js --runInBand` and confirm the missing provider contract fails.
- [ ] Add environment variables for Clerk issuer, audience, secret, and optional frontend publishable key without changing database variables.
- [ ] Implement the adapter using the official Clerk backend SDK and map provider failures to authentication errors.
- [ ] Update auth middleware to use the adapter while preserving the existing request user shape.
- [ ] Rerun the focused identity tests and then the backend auth tests.

### Task 2: Phone Verification Enforcement

**Files:**
- Create: `backend/middleware/requireVerifiedPhone.js`
- Modify: `backend/routes/attemptRoutes.js`
- Modify: `backend/routes/resultRoutes.js`
- Test: `backend/tests/unit/requireVerifiedPhone.test.js`

**Interfaces:**
- Middleware `requireVerifiedPhone(req, res, next)` allows verified users and admins, otherwise sends status `403` with error code `PHONE_VERIFICATION_REQUIRED`.

- [ ] Write tests for verified students, unverified students, admins, and provider lookup errors.
- [ ] Run the focused middleware tests and confirm they fail before implementation.
- [ ] Implement the middleware using only `req.user` and the provider adapter; never accept a client-provided verification flag.
- [ ] Mount it on `POST /attempts/finish` and every student result read route.
- [ ] Rerun the focused middleware tests.

### Task 3: Exam and Result Regression Coverage

**Files:**
- Modify: `backend/controllers/attemptController.js` if request context requires normalization.
- Modify: `backend/controllers/resultController.js` if route-level guards need defense in depth.
- Test: `backend/tests/integration/phoneVerificationGate.test.js`

- [ ] Write integration tests proving unverified students cannot finish attempts or read result/history/answers.
- [ ] Add tests proving verified students and admins retain access.
- [ ] Add a regression test proving automatic expiry submission remains callable.
- [ ] Run the integration test file against the existing test configuration.
- [ ] Make only the smallest controller changes required by failing tests.

### Task 4: Clerk Frontend Auth and Recovery UX

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/api/axiosConfig.js`
- Modify: the existing login/register/protected-route components identified during implementation.
- Create: `frontend/src/components/auth/PhoneVerificationRequired.jsx` only if no existing Clerk-compatible surface exists.
- Test: focused frontend auth tests under `frontend/src/__tests__/`.

- [ ] Add Clerk React SDK and configure the provider with the publishable key.
- [ ] Replace custom interactive auth entry points with Clerk sign-in/sign-up while preserving application profile loading.
- [ ] Attach Clerk session tokens to API calls through the existing Axios boundary.
- [ ] Convert `PHONE_VERIFICATION_REQUIRED` responses into a clear verification action that preserves the attempted operation.
- [ ] Add tests for the error mapping and protected verification state.
- [ ] Run the focused Vitest tests, lint, and production build.

### Task 5: Configuration and Operational Documentation

**Files:**
- Create: `.env.example`
- Modify: `backend/.env.test`
- Modify: `README.md`
- Modify: `docker-compose.yml` only if Clerk environment forwarding is required.

- [ ] Document Clerk dashboard settings for Google, email, and phone verification redirect URLs.
- [ ] Document the required server and frontend environment variables without committing secrets.
- [ ] Document the exact enforcement behavior and automatic-expiry exception.
- [ ] Run backend lint/tests and frontend lint/test/build as the final verification set.