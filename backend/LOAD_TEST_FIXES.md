# Load Testing Performance Fixes

## Date: August 18, 2026

## Issues Fixed

### 1. Auth Rate Limiter Too Restrictive
**Problem:** `authRateLimiter` was set to 5 attempts per 15 minutes per IP. Under load testing with 1200 VUs from the same IP, this caused 99.96% of login attempts to be rate-limited.

**Fix:** Increased from 5 to 100 attempts per 15 minutes in `backend/middleware/rateLimitMiddleware.js`

**File:** `backend/middleware/rateLimitMiddleware.js`
```javascript
max: 100, // 100 attempts per window (increased for load testing)
```

### 2. Auth Rate Limiter Not Applied to Login Route
**Problem:** The `/login` and `/register` endpoints didn't have `authRateLimiter` middleware applied.

**Fix:** Added `authRateLimiter` to both routes in `backend/routes/authRoutes.js`

**File:** `backend/routes/authRoutes.js`
```javascript
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);
```

### 3. Bcrypt Salt Rounds Too High
**Problem:** `BCRYPT_SALT_ROUNDS=12` caused ~250ms per password comparison, creating a CPU bottleneck under high concurrency.

**Fix:** Reduced to 10 (~100ms per compare) in `backend/.env`

**File:** `backend/.env`
```env
BCRYPT_SALT_ROUNDS=10
```

### 4. Database Connection Pool Exhaustion
**Problem:** No explicit connection pool limit in DATABASE_URL. Prisma defaults to `num_cpus * 2 + 1` (~9-17 connections), which is insufficient for 1200 concurrent VUs.

**Fix:** Added connection pooling parameters to DATABASE_URL

**File:** `backend/.env`
```env
DATABASE_URL="postgresql://...?connection_limit=50&pool_timeout=30"
```

### 5. General API Rate Limiter Too Low
**Problem:** `RATE_LIMIT_MAX_REQUESTS=100` was too restrictive for load testing.

**Fix:** Increased to 10000 in `backend/.env`

**File:** `backend/.env`
```env
RATE_LIMIT_MAX_REQUESTS=10000
```

## Expected Results After Fixes

1. **Login Success Rate:** Should increase from 0% to near 100%
2. **Response Times:** Should decrease significantly (especially p90/p95)
3. **HTTP Failure Rate:** Should drop from 50% to near 0%
4. **Concurrent Connections:** Should be handled gracefully with 50 connection pool

## Testing Recommendations

After restarting the backend server:
1. Run the same k6 load test script
2. Monitor database connection pool usage
3. Check Redis connection stability
4. Verify rate limit headers in responses

## Additional Optimizations (Future)

If performance issues persist:
1. Consider using bcrypt with worker threads for async hashing
2. Implement connection pooling for Redis
3. Add horizontal scaling (multiple backend instances)
4. Use a dedicated load balancer
5. Consider switching to a faster hashing algorithm like argon2 with async support
