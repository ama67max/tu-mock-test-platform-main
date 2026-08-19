# API Mismatch Fix Guide
## Frontend-Backend Alignment for TU Mock Test Platform

---

## Table of Issues

| # | Issue Type | File(s) Affected | Severity |
|---|-----------|------------------|----------|
| 1 | Missing Export | `resultController.js` | 🔴 Critical |
| 2 | Name Mismatch | `adminApi.js`, `analyticsApi.js`, `resultApi.js` | 🟠 High |
| 3 | Missing Endpoint | `analyticsController.js` | 🟡 Medium |
| 4 | Missing Endpoint | `resultController.js` | 🟡 Medium |
| 5 | Wrong API Client | `AdminDashboard.jsx`, `AdminUsers.jsx`, etc. | 🟠 High |

---

## Fix 1: Add Missing Export in `resultController.js`

**File:** `backend/src/controllers/resultController.js`

**Problem:** `getAttemptAnswers` is implemented but not exported. `ResultPage.jsx` calls `resultApi.getAttemptAnswers()` which will throw `TypeError: resultApi.getAttemptAnswers is not a function`.

**Current `module.exports`:**
```javascript
module.exports = {
  getResult,
  getMyResults,
};
```

**Fixed `module.exports`:**
```javascript
module.exports = {
  getResult,
  getAttemptAnswers,   // ← ADD THIS
  getMyResults,
};
```

**Verify:** Ensure `resultApi.js` (frontend) exports a `getAttemptAnswers` function that calls `GET /api/v1/results/${attemptId}/answers`.

---

## Fix 2: Create/Update Frontend API Client Files

The frontend pages call methods that don't match backend controller names. The cleanest fix is to **update the frontend API client layer** to map friendly names to actual backend endpoints, without touching the backend controllers.

### 2A. Create/Update `frontend/src/api/analyticsApi.js`

**File:** `frontend/src/api/analyticsApi.js`

**Problem:** Pages call `getDashboardStats()`, `getTrendData()`, `getSubjectBreakdown()`, `getTopPerformers()` — none of which exist in `analyticsController.js`.

**Solution:** Map frontend names to existing backend endpoints.

```javascript
import api from './axiosConfig'; // or your api instance

/**
 * Get admin dashboard KPIs (total users, exams, questions, active attempts).
 * Maps to: GET /api/v1/admin/overview
 */
export const getDashboardStats = async () => {
  const res = await api.get('/admin/overview');
  return res.data;
};

/**
 * Get system-wide stats.
 * Maps to: GET /api/v1/analytics/system
 */
export const getSystemStats = async () => {
  const res = await api.get('/analytics/system');
  return res.data;
};

/**
 * Get attempt trends over time.
 * Maps to: GET /api/v1/analytics/trends?days=30
 */
export const getTrendData = async ({ examId, range = '30d', userId }) => {
  const days = parseInt(range, 10) || 30;
  const params = { days };
  if (userId) {
    // Personal trends
    const res = await api.get('/analytics/my-trends', { params });
    return res.data;
  }
  const res = await api.get('/analytics/trends', { params });
  return res.data;
};

/**
 * Get category/subject breakdown.
 * Maps to: GET /api/v1/analytics/categories
 */
export const getSubjectBreakdown = async () => {
  const res = await api.get('/analytics/categories');
  return res.data;
};

/**
 * Get top performers for an exam leaderboard.
 * Maps to: GET /api/v1/exams/:id/leaderboard (if you add route)
 * OR call a new endpoint once implemented.
 * 
 * TEMPORARY: If no backend endpoint exists yet, use this stub:
 */
export const getTopPerformers = async (examId, limit = 10) => {
  // Option A: If you implement the endpoint in Fix 4 below:
  // const res = await api.get(`/exams/${examId}/leaderboard?limit=${limit}`);

  // Option B: Stub until backend is ready
  console.warn('getTopPerformers: backend endpoint not implemented yet');
  return { data: [] };
};

/**
 * Get comprehensive personal analytics.
 * Maps to: GET /api/v1/analytics/me
 */
export const getStudentAnalytics = async () => {
  const res = await api.get('/analytics/me');
  return res.data;
};
```

### 2B. Create/Update `frontend/src/api/adminApi.js`

**File:** `frontend/src/api/adminApi.js`

**Problem:** Admin pages call `adminApi.getUsers()`, `adminApi.getExams()`, `adminApi.uploadQuestion()`, `adminApi.uploadQuestions()` — none exist in `adminController.js`.

**Solution:** Import and re-export from the correct API modules, or call the correct endpoints directly.

```javascript
import api from './axiosConfig';

// ── Categories (from adminController) ────────────────────────────────────────

export const getCategories = async () => {
  const res = await api.get('/admin/categories');
  return res.data;
};

export const createCategory = async (data) => {
  const res = await api.post('/admin/categories', data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await api.put(`/admin/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await api.delete(`/admin/categories/${id}`);
  return res.data;
};

// ── Users (from userController, NOT adminController) ────────────────────────

/**
 * Get paginated user list.
 * Maps to: GET /api/v1/users/search
 * Called by: AdminDashboard.jsx, AdminUsers.jsx
 */
export const getUsers = async (params = { page: 1, limit: 50 }) => {
  const res = await api.get('/users/search', { params });
  return res.data;
};

/**
 * Update a user (role, isActive).
 * Maps to: PUT /api/v1/users/:id
 * Called by: AdminUsers.jsx
 */
export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

/**
 * Toggle user active status.
 * Maps to: PATCH /api/v1/users/:id/toggle
 * Called by: AdminUsers.jsx
 */
export const toggleUserActive = async (id) => {
  const res = await api.patch(`/users/${id}/toggle`);
  return res.data;
};

/**
 * Delete a user.
 * Maps to: DELETE /api/v1/users/:id (if you add route)
 * OR use toggle deactivation instead.
 * Called by: AdminUsers.jsx
 */
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

// ── Exams (from examController, NOT adminController) ────────────────────────

/**
 * List all exams.
 * Maps to: GET /api/v1/exams
 * Called by: AdminExams.jsx
 */
export const getExams = async (params = {}) => {
  const res = await api.get('/exams', { params });
  return res.data;
};

/**
 * Create a new exam.
 * Maps to: POST /api/v1/exams
 * Called by: AdminExams.jsx
 */
export const createExam = async (data) => {
  const res = await api.post('/exams', data);
  return res.data;
};

// ── Questions (from questionController) ─────────────────────────────────────

/**
 * Create a single question.
 * Maps to: POST /api/v1/questions
 * Called by: AdminQuestions.jsx (replaces uploadQuestion)
 */
export const uploadQuestion = async (data) => {
  const res = await api.post('/questions', data);
  return res.data;
};

/**
 * Bulk upload questions via CSV.
 * Maps to: POST /api/v1/questions/bulk-upload
 * Called by: AdminQuestions.jsx (replaces uploadQuestions)
 */
export const uploadQuestions = async (formData) => {
  const res = await api.post('/questions/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
```

### 2C. Create/Update `frontend/src/api/resultApi.js`

**File:** `frontend/src/api/resultApi.js`

**Problem:** `DashboardPage.jsx` calls `resultApi.getResults()` but backend has `getMyResults`. `LeaderboardPage.jsx` calls `resultApi.exportResultsCSV()` which doesn't exist.

```javascript
import api from './axiosConfig';

/**
 * Get paginated attempt history for current user.
 * Maps to: GET /api/v1/results?page=1&limit=6
 * Called by: DashboardPage.jsx
 */
export const getResults = async (params = { page: 1, limit: 10 }) => {
  const res = await api.get('/results', { params });
  return res.data;
};

/**
 * Get detailed result for a specific attempt.
 * Maps to: GET /api/v1/results/:attemptId
 * Called by: ResultPage.jsx
 */
export const getResult = async (attemptId) => {
  const res = await api.get(`/results/${attemptId}`);
  return res.data;
};

/**
 * Get per-question answers for review.
 * Maps to: GET /api/v1/results/:attemptId/answers
 * Called by: ResultPage.jsx
 */
export const getAttemptAnswers = async (attemptId) => {
  const res = await api.get(`/results/${attemptId}/answers`);
  return res.data;
};

/**
 * Export leaderboard CSV.
 * Maps to: GET /api/v1/results/export?examId=...
 * Called by: LeaderboardPage.jsx
 * 
 * NOTE: Backend endpoint must be implemented (see Fix 4).
 * Until then, this will 404.
 */
export const exportResultsCSV = async ({ examId }) => {
  const res = await api.get(`/results/export?examId=${examId}`, {
    responseType: 'blob',
  });
  return res.data;
};
```

### 2D. Create/Update `frontend/src/api/examApi.js`

**File:** `frontend/src/api/examApi.js`

Ensure `ExamListPage.jsx` imports from the right place:

```javascript
import api from './axiosConfig';

export const getExams = async (params = {}) => {
  const res = await api.get('/exams', { params });
  return res.data;
};

export const getExamById = async (id) => {
  const res = await api.get(`/exams/${id}`);
  return res.data;
};

export const getExamQuestions = async (id) => {
  const res = await api.get(`/exams/${id}/questions`);
  return res.data;
};
```

---

## Fix 3: Add Missing Backend Endpoint — `getDashboardStats`

**File:** `backend/src/controllers/analyticsController.js`

**Problem:** 4 pages call `getDashboardStats()` but no such endpoint exists. The data is available from `adminController.getOverview()` which returns `{ stats, recentAttempts, recentUsers }`.

**Solution A (Recommended):** Use `getOverview` from `adminController` instead. Update `analyticsApi.getDashboardStats()` to call `/admin/overview`.

**Solution B (Alternative):** Add a dedicated endpoint in `analyticsController`:

```javascript
/**
 * GET /api/v1/analytics/dashboard
 * Consolidated KPIs for dashboard cards.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getSystemStats();
  res.status(200).json(
    new ApiResponse(200, stats, 'Dashboard stats fetched successfully')
  );
});

// Add to module.exports:
module.exports = {
  getSystemStats,
  getCategoryBreakdown,
  getAttemptTrends,
  getMyAttemptTrends,
  getStudentAnalytics,
  getDashboardStats,  // ← ADD
};
```

**Then add route** in `backend/src/routes/analyticsRoutes.js`:
```javascript
router.get('/dashboard', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getDashboardStats);
```

---

## Fix 4: Add Missing Backend Endpoint — `getTopPerformers`

**File:** `backend/src/controllers/leaderboardController.js` (create if missing) OR add to `examController.js` / `resultController.js`.

**Problem:** `LeaderboardPage.jsx` calls `analyticsApi.getTopPerformers(examId, limit)` but no endpoint exists.

**Solution:** Add a leaderboard route using your existing `leaderboardService`:

```javascript
// backend/src/controllers/leaderboardController.js
const leaderboardService = require('../services/leaderboardService');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getTopPerformers = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);

  const entries = await leaderboardService.getTopN(examId, limit);
  const enriched = await leaderboardService.enrichEntries(examId, entries);

  res.status(200).json(
    new ApiResponse(200, enriched, 'Leaderboard fetched successfully')
  );
});

module.exports = { getTopPerformers };
```

**Route** in `backend/src/routes/examRoutes.js` or new `leaderboardRoutes.js`:
```javascript
router.get('/:id/leaderboard', authenticate, getTopPerformers);
```

---

## Fix 5: Add Missing Backend Endpoint — `exportResultsCSV`

**File:** `backend/src/controllers/resultController.js`

**Problem:** `LeaderboardPage.jsx` calls `resultApi.exportResultsCSV({ examId })` but no endpoint exists.

**Solution:** Add CSV export endpoint:

```javascript
const { Parser } = require('json2csv'); // npm install json2csv

const exportResultsCSV = asyncHandler(async (req, res) => {
  const { examId } = req.query;
  if (!examId) throw new ApiError(400, 'examId is required');

  // Fetch leaderboard data
  const entries = await leaderboardService.getTopN(examId, 1000);
  const enriched = await leaderboardService.enrichEntries(examId, entries);

  const fields = [
    { label: 'Rank', value: 'rank' },
    { label: 'Name', value: 'user.name' },
    { label: 'Email', value: 'user.email' },
    { label: 'Score', value: 'score' },
    { label: 'Completed At', value: 'completedAt' },
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(enriched);

  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename=leaderboard_exam_${examId}.csv`);
  res.send(csv);
});

// Add to module.exports
module.exports = {
  getResult,
  getAttemptAnswers,
  getMyResults,
  exportResultsCSV,  // ← ADD
};
```

**Route** in `backend/src/routes/resultRoutes.js`:
```javascript
router.get('/export', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), exportResultsCSV);
```

---

## Fix 6: Add Missing Backend Endpoint — `getAttemptAnswers` Route

**File:** `backend/src/routes/resultRoutes.js`

**Problem:** The `getAttemptAnswers` controller function exists (and is now exported after Fix 1), but the route may not be wired.

**Ensure this route exists:**
```javascript
const { getResult, getMyResults, getAttemptAnswers } = require('../controllers/resultController');

router.get('/:attemptId', authenticate, getResult);
router.get('/:attemptId/answers', authenticate, getAttemptAnswers);  // ← ENSURE THIS EXISTS
router.get('/', authenticate, getMyResults);
```

---

## Fix 7: Update `AdminUsers.jsx` Toggle Logic

**File:** `frontend/src/pages/AdminUsers.jsx`

**Problem:** The page calls `adminApi.updateUser(id, { toggleActive: true })` but `userController.updateUser` expects `{ role, isActive }`.

**Current broken code:**
```javascript
await adminApi.updateUser(id, { toggleActive: true });
```

**Fixed code:**
```javascript
// Option A: Use the dedicated toggle endpoint
await adminApi.toggleUserActive(id);

// Option B: Pass isActive explicitly
await adminApi.updateUser(id, { isActive: !user.isActive });
```

**Recommended:** Update `handleToggle` to use the toggle endpoint:

```javascript
async function handleToggle(id) {
  try {
    await adminApi.toggleUserActive(id);  // Calls PATCH /users/:id/toggle
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  } catch (e) {
    console.error(e);
  }
}
```

---

## Fix 8: Add Missing Route for `deleteUser` in Backend

**File:** `backend/src/routes/userRoutes.js`

**Problem:** `userController.js` exports `deleteUser`, but the route file may not have a DELETE endpoint.

**Ensure this route exists:**
```javascript
const { getMe, updateMe, getUser, updateUser, searchUsers, toggleActivation, deleteUser } = require('../controllers/userController');

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.get('/search', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), searchUsers);
router.get('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getUser);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateUser);
router.patch('/:id/toggle', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), toggleActivation);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteUser);  // ← ADD THIS
```

---

## Fix 9: Ensure `AdminQuestions.jsx` Uses Correct Bulk Upload API

**File:** `frontend/src/pages/AdminQuestions.jsx`

**Problem:** The page calls `adminApi.uploadQuestions?.(form)` but the function should be `uploadQuestions` (plural) in `adminApi.js`.

**Current code:**
```javascript
await adminApi.uploadQuestions?.(form) || adminApi.uploadQuestion?.(form);
```

**Fixed code:**
```javascript
await adminApi.uploadQuestions(form);  // Calls POST /questions/bulk-upload
```

---

## Fix 10: ExamPage — Ensure `useExam` Hook Methods Exist

**File:** `frontend/src/hooks/useExam.js` (not provided, but referenced)

**Problem:** `ExamPage.jsx` calls `examState.startExamAttempt()`, `examState.saveAnswer()`, `examState.submitExam()` — these must be implemented in your Zustand store / hook.

**Required methods in `useExam` hook:**
```javascript
const useExam = create((set, get) => ({
  // State
  exam: null,
  questions: [],
  attemptId: null,
  answers: {},
  markedForReview: {},
  currentIndex: 0,
  timeRemainingSeconds: 0,
  durationSeconds: 0,
  status: 'idle', // idle | loading | in_progress | completed
  isLoading: false,

  // Actions
  startExamAttempt: async ({ examId }) => {
    set({ isLoading: true, status: 'loading' });
    try {
      const res = await api.post('/attempts/start', { examId });
      const data = res.data.data;
      set({
        exam: data.exam,
        questions: data.exam.questions,
        attemptId: data.id,
        timeRemainingSeconds: data.exam.durationMinutes * 60,
        durationSeconds: data.exam.durationMinutes * 60,
        status: 'in_progress',
        isLoading: false,
      });
      return data;
    } catch (err) {
      set({ isLoading: false, status: 'idle' });
      throw err;
    }
  },

  startExam: ({ exam, questions, attemptId, durationSeconds }) => {
    set({
      exam,
      questions,
      attemptId,
      durationSeconds,
      timeRemainingSeconds: durationSeconds,
      status: 'in_progress',
      isLoading: false,
    });
  },

  setAnswer: (questionId, value) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    }));
  },

  toggleReviewFlag: (questionId) => {
    set((state) => ({
      markedForReview: {
        ...state.markedForReview,
        [questionId]: !state.markedForReview[questionId],
      },
    }));
  },

  saveAnswer: async ({ attemptId, questionId, selectedOption, timeTakenSec }) => {
    await api.post('/attempts/answer', {
      attemptId,
      questionId,
      selectedOption,
      timeTakenSec,
    });
  },

  submitExam: async ({ attemptId, timeTakenSec }) => {
    await api.post('/attempts/finish', { attemptId, timeTakenSec });
    set({ status: 'completed' });
  },

  tickTimer: () => {
    set((state) => ({
      timeRemainingSeconds: Math.max(0, state.timeRemainingSeconds - 1),
    }));
  },

  nextQuestion: () => {
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    }));
  },

  prevQuestion: () => {
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    }));
  },

  goToQuestion: (index) => {
    set({ currentIndex: index });
  },

  resetExam: () => {
    set({
      exam: null,
      questions: [],
      attemptId: null,
      answers: {},
      markedForReview: {},
      currentIndex: 0,
      timeRemainingSeconds: 0,
      durationSeconds: 0,
      status: 'idle',
      isLoading: false,
    });
  },
}));
```

**Backend route for these:**
```javascript
// backend/src/routes/attemptRoutes.js (create if missing)
const { startAttempt, submitAnswer, finishAttempt, getAttempt } = require('../controllers/attemptController');
const { authenticate } = require('../middleware/auth');

router.post('/start', authenticate, asyncHandler(async (req, res) => {
  const result = await startAttempt(req.user.userId, req.body.examId);
  res.status(201).json(new ApiResponse(201, result, 'Attempt started'));
}));

router.post('/answer', authenticate, asyncHandler(async (req, res) => {
  const { attemptId, questionId, selectedOption, timeTakenSec } = req.body;
  const result = await submitAnswer(req.user.userId, attemptId, questionId, selectedOption, timeTakenSec);
  res.status(200).json(new ApiResponse(200, result, 'Answer saved'));
}));

router.post('/finish', authenticate, asyncHandler(async (req, res) => {
  const { attemptId, timeTakenSec } = req.body;
  const result = await finishAttempt(req.user.userId, attemptId, timeTakenSec);
  res.status(200).json(new ApiResponse(200, result, 'Attempt finished'));
}));
```

---

## Fix 11: Add `getAttemptAnswers` to `resultService.js`

**File:** `backend/src/services/resultService.js`

**Problem:** `resultController.getAttemptAnswers` calls `resultService.getAttemptAnswers()` which may not exist.

**Add to `resultService.js`:**
```javascript
const getAttemptAnswers = async (attemptId) => {
  const answers = await prisma.attemptAnswer.findMany({
    where: { attemptId },
    include: {
      question: {
        select: {
          id: true,
          questionText: true,
          options: true,
          correctAnswer: true,
          marks: true,
          explanation: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return answers.map((a) => ({
    questionId: a.questionId,
    questionText: a.question.questionText,
    selectedOption: a.selectedOption,
    correctAnswer: a.question.correctAnswer,
    is_correct: a.isCorrect,
    marksObtained: a.marksObtained,
    explanation: a.question.explanation,
  }));
};

module.exports = {
  calculatePercentile,
  getLeaderboardPosition,
  getResult,
  getUserResults,
  getAttemptAnswers,  // ← ADD
};
```

---

## Quick Reference: Corrected API Mapping

| Frontend Page | Frontend Call | Correct Backend Endpoint | Method |
|--------------|---------------|------------------------|--------|
| AdminDashboard | `analyticsApi.getDashboardStats()` | `GET /admin/overview` | `adminController.getOverview` |
| AdminDashboard | `adminApi.getUsers()` | `GET /users/search` | `userController.searchUsers` |
| AdminAnalytics | `analyticsApi.getTrendData()` | `GET /analytics/trends` | `analyticsController.getAttemptTrends` |
| AdminAnalytics | `analyticsApi.getSubjectBreakdown()` | `GET /analytics/categories` | `analyticsController.getCategoryBreakdown` |
| AdminExams | `adminApi.getExams()` | `GET /exams` | `examController.listExams` |
| AdminExams | `adminApi.createExam()` | `POST /exams` | `examController.createExam` |
| AdminQuestions | `adminApi.uploadQuestion()` | `POST /questions` | `questionController.createQuestion` |
| AdminQuestions | `adminApi.uploadQuestions()` | `POST /questions/bulk-upload` | `questionController.bulkUpload` |
| AdminUsers | `adminApi.getUsers()` | `GET /users/search` | `userController.searchUsers` |
| AdminUsers | `adminApi.updateUser()` | `PUT /users/:id` | `userController.updateUser` |
| AdminUsers | `adminApi.deleteUser()` | `DELETE /users/:id` | `userController.deleteUser` |
| DashboardPage | `resultApi.getResults()` | `GET /results` | `resultController.getMyResults` |
| LeaderboardPage | `analyticsApi.getTopPerformers()` | `GET /exams/:id/leaderboard` | `leaderboardController.getTopPerformers` |
| LeaderboardPage | `resultApi.exportResultsCSV()` | `GET /results/export` | `resultController.exportResultsCSV` |
| ResultPage | `resultApi.getResult()` | `GET /results/:attemptId` | `resultController.getResult` |
| ResultPage | `resultApi.getAttemptAnswers()` | `GET /results/:attemptId/answers` | `resultController.getAttemptAnswers` |

---

## Verification Checklist

After applying all fixes, verify each page loads data correctly:

- [ ] `AdminDashboard.jsx` — shows stats cards and recent users table
- [ ] `AdminAnalytics.jsx` — loads trend chart and subject breakdown
- [ ] `AdminExams.jsx` — lists exams and creates new exam
- [ ] `AdminQuestions.jsx` — creates single question and bulk uploads CSV
- [ ] `AdminUsers.jsx` — lists users, toggles active status, deletes user
- [ ] `DashboardPage.jsx` — shows KPIs, trend chart, subject breakdown, recent attempts
- [ ] `ExamListPage.jsx` — lists published exams with offline cache status
- [ ] `ExamPage.jsx` — starts attempt, saves answers, submits exam
- [ ] `LeaderboardPage.jsx` — shows top performers and exports CSV
- [ ] `ResultPage.jsx` — displays result summary and per-question review

---

*Generated: 2026-08-01*
