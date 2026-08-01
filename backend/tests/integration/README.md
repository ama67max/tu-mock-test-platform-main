# Backend Integrity Test Suite

This document outlines the comprehensive integrity testing for the TU Mock Test Platform backend.

## Overview

The `backend.integrity.test.js` test suite validates the entire backend system's data integrity, security, API consistency, and business logic. It simulates real-world scenarios from user registration to exam completion.

## Test Coverage

### 1. **Authentication & Authorization**
- ✅ User Registration with validation
- ✅ Login with email/password
- ✅ JWT Token Refresh (token rotation)
- ✅ Logout with token invalidation
- ✅ Invalid credentials rejection
- ✅ Password strength validation
- ✅ Duplicate email prevention

### 2. **Input Validation & Error Handling**
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Question field validation (options, correct answer mismatch)
- ✅ Exam duration/marks validation
- ✅ Passing marks ≤ total marks constraint
- ✅ CSV format validation
- ✅ Null field rejection

### 3. **User Profile Management**
- ✅ Get user profile
- ✅ Update profile information
- ✅ Change password
- ✅ Password verification for change
- ✅ Login with new password

### 4. **Question Bank Management**
- ✅ Single question creation
- ✅ Bulk CSV upload
- ✅ Question pagination
- ✅ Question listing with limits
- ✅ Partial CSV failure handling

### 5. **Exam Management**
- ✅ Exam creation with validation
- ✅ Question assignment to exams
- ✅ Exam publication control
- ✅ Question list retrieval (without sensitive data)

### 6. **Student Attempt Lifecycle**
- ✅ Start new attempt
- ✅ Prevent duplicate active attempts
- ✅ Submit answers with time tracking
- ✅ Finish attempt
- ✅ Concurrent answer submission safety
- ✅ Question options masking during attempt

### 7. **Results & Analytics**
- ✅ Result retrieval with correct answers (post-completion)
- ✅ Student analytics dashboard
- ✅ Trend analysis
- ✅ Admin system statistics
- ✅ Category-wise breakdown

### 8. **Leaderboard System**
- ✅ Leaderboard entry updates
- ✅ Top N retrieval
- ✅ User rank calculation

### 9. **Role-Based Access Control (RBAC)**
- ✅ Student cannot access admin analytics
- ✅ Student cannot create/edit exams
- ✅ Student cannot create/edit questions
- ✅ Students cannot access other users' attempts
- ✅ Unauthenticated access rejection
- ✅ Invalid token rejection

### 10. **Database Constraints**
- ✅ Unique category slug enforcement
- ✅ Required field validation
- ✅ Referential integrity on data deletion

### 11. **API Response Consistency**
- ✅ Consistent success response format
- ✅ Consistent error response format
- ✅ Timestamp inclusion

### 12. **Pagination & Limits**
- ✅ Custom page/limit parameters
- ✅ Out-of-range page handling
- ✅ Maximum limit enforcement

### 13. **Time & Duration Validation**
- ✅ Answer time tracking
- ✅ Duration validation on exam creation

## Setup & Execution

### Prerequisites

1. **Test Database**: Create a separate PostgreSQL database for testing
   ```bash
   createdb tu_mock_test_test
   ```

2. **Test Redis**: Ensure Redis is running on port 6379
   ```bash
   redis-server
   ```

3. **Environment Configuration**: Copy `.env.test` template
   ```bash
   cd backend
   cp .env.test.example .env.test
   # Edit .env.test with your test database credentials
   ```

### Running Tests

#### All Integrity Tests
```bash
cd backend
npm test -- tests/integration/backend.integrity.test.js
```

#### Specific Test Suite
```bash
npm test -- tests/integration/backend.integrity.test.js -t "Authentication"
```

#### With Coverage Report
```bash
npm test -- tests/integration/backend.integrity.test.js --coverage
```

#### Watch Mode
```bash
npm test -- tests/integration/backend.integrity.test.js --watch
```

### Test Database Setup

The tests automatically:
1. Connect to the test database (validates `_test` in DATABASE_URL)
2. Truncate all tables before running
3. Seed initial admin user
4. Clean up after completion

**SAFETY GUARD**: Tests will fail if DATABASE_URL doesn't contain `_test` to prevent accidental data loss.

## Key Test Scenarios

### Scenario 1: Complete User Journey
```
1. Register new student account
2. Login and receive JWT tokens
3. Refresh token (rotation)
4. Browse published exams
5. Start exam attempt
6. Submit answers over 120 seconds
7. Complete exam and get score
8. View results with explanations
9. Check analytics dashboard
10. Logout
```

### Scenario 2: Admin Exam Setup
```
1. Admin logs in
2. Creates exam category
3. Creates questions (single + bulk CSV)
4. Creates exam
5. Assigns questions to exam
6. Publishes exam
7. Views admin analytics
```

### Scenario 3: Security & RBAC
```
1. Student attempts to access admin routes → 403
2. Unauthenticated user accesses protected route → 401
3. Invalid token rejected → 401
4. Student cannot access another student's data
```

## Important Test Constants

| Item | Value | Notes |
|------|-------|-------|
| Admin Email | `admin@tu-test.com` | Created in beforeAll |
| Admin Password | `AdminPass123!` | Test only, hardcoded |
| Student Email | `student@tu-test.com` | Registered in test |
| Test Category | `ioe-entrance` | IOE Entrance slug |
| Test Exam | `IOE Mock Test 1` | Full-length exam |
| Test Duration | 120 minutes | Mock exam length |
| Total Questions | 3 | Tested in suite |

## Troubleshooting

### Database Connection Fails
```
Error: FATAL: Integration tests must use a test database
```
**Solution**: Ensure DATABASE_URL in .env.test includes `_test`

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in .env.test or kill existing process

### Redis Connection Failed
```
Error: Could not connect to Redis
```
**Solution**: Start Redis server: `redis-server`

### Test Timeout
Increase Jest timeout in test file:
```javascript
jest.setTimeout(30000); // 30 seconds
```

## Adding New Tests

When adding new tests, ensure:

1. **Consistent naming**: Use descriptive test names
   ```javascript
   it('should [action] when [condition]', async () => {
     // test code
   });
   ```

2. **Proper setup/teardown**: Use beforeAll/afterAll for setup
3. **No shared state**: Each test should be independent
4. **Security focus**: Always test RBAC boundaries
5. **Error cases**: Test both success and failure paths
6. **Database cleanup**: Use cleanDatabase() if needed

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Integration Tests
  run: |
    npm install
    export DATABASE_URL="postgresql://.../_test"
    export REDIS_URL="redis://..."
    npm test -- tests/integration/backend.integrity.test.js
```

## Performance Metrics

Typical test execution times:
- Full suite: ~30-45 seconds
- Individual test: ~1-5 seconds
- Setup/Teardown: ~5 seconds

## Security Considerations

1. **Never use production database for testing**
2. **Test database is truncated before each run**
3. **JWT secrets in .env.test should differ from production**
4. **All credentials are test-only**

## Future Enhancements

- [ ] Rate limiting tests
- [ ] Concurrent operation stress tests
- [ ] File upload security tests
- [ ] Email verification tests
- [ ] WebSocket connection tests (if Socket.io added)
- [ ] Cache invalidation tests
- [ ] Data encryption tests
