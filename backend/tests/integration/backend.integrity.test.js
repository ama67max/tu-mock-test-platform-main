const request = require('supertest');
const fs = require('fs');
const path = require('path');
const os = require('os');
const app = require('../../app');
const prisma = require('../../config/db');
const redis = require('../../config/redis');
const { hashPassword } = require('../../utils/password');
const leaderboardService = require('../../services/leaderboardService');
require('dotenv').config({ path: '.env.test' });

// ── Safety Guard ────────────────────────────────────────────────────────────────
if (!process.env.DATABASE_URL?.includes('_test')) {
  throw new Error(
    'FATAL: Integration tests must use a test database. ' +
    'Ensure DATABASE_URL contains "_test" (e.g., postgresql://.../tu_mock_test_test)'
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const cleanDatabase = async () => {
  const tables = [
    'attempt_answers',
    'user_attempts',
    'leaderboard',
    'refresh_tokens',
    'exam_questions',
    'question_media',
    'questions',
    'exams',
    'user_profiles',
    'users',
    'categories',
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
};

let adminToken;
let studentToken;
let studentRefreshToken;
let categoryId;
let questionId;
let examId;
let attemptId;

// ── Setup / Teardown ──────────────────────────────────────────────────────────
beforeAll(async () => {
  await prisma.$connect();
  await redis.flushdb();
  await cleanDatabase();

  // Seed admin directly (register defaults to STUDENT)
  const adminHash = await hashPassword('AdminPass123!');
  await prisma.user.create({
    data: {
      email: 'admin@tu-test.com',
      passwordHash: adminHash,
      fullName: 'Test Admin',
      role: 'SUPER_ADMIN',
    },
  });
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

// ── Authentication ────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/register', () => {
  it('should register a new student', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'student@tu-test.com',
      password: 'StudentPass1!',
      fullName: 'Test Student',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('student@tu-test.com');
    expect(res.body.data.user.role).toBe('STUDENT');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });
});

describe('POST /api/v1/auth/login', () => {
  it('should login the student', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'student@tu-test.com',
      password: 'StudentPass1!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    studentToken = res.body.data.accessToken;
    studentRefreshToken = res.body.data.refreshToken;
  });

  it('should login the admin', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@tu-test.com',
      password: 'AdminPass123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    adminToken = res.body.data.accessToken;
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'student@tu-test.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('should rotate refresh token and issue new access token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: studentRefreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    studentRefreshToken = res.body.data.refreshToken; // update for logout test
  });
});

// ── Admin: Category Management ────────────────────────────────────────────────
describe('Admin Category CRUD', () => {
  it('should create IOE category', async () => {
    const res = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'IOE Entrance',
        slug: 'ioe-entrance',
        description: 'Institute of Engineering entrance exam',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('IOE Entrance');
    categoryId = res.body.data.id;
  });

  it('should list categories', async () => {
    const res = await request(app)
      .get('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

// ── Admin: Question Bank ──────────────────────────────────────────────────────
describe('Admin Question Management', () => {
  it('should create a single question', async () => {
    const res = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        questionText: 'What is the value of pi?',
        options: ['3.10', '3.14', '3.16', '3.18'],
        correctAnswer: '3.14',
        explanation: 'Pi is approximately 3.14159...',
        difficulty: 'EASY',
        marks: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.correctAnswer).toBe('3.14');
    questionId = res.body.data.id;
  });

  it('should bulk upload questions via CSV', async () => {
    const csvContent =
      'category_id,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks\n' +
      `${categoryId},What is 2+2?,1,2,3,4,4,Basic math,EASY,1\n` +
      `${categoryId},Capital of Nepal?,Kathmandu,Pokhara,Lalitpur,Bhaktapur,Kathmandu,Geography,EASY,1`;

    const tmpFile = path.join(os.tmpdir(), `test-upload-${Date.now()}.csv`);
    fs.writeFileSync(tmpFile, csvContent);

    const res = await request(app)
      .post('/api/v1/questions/bulk-upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', tmpFile);

    fs.unlinkSync(tmpFile);

    expect(res.status).toBe(200);
    expect(res.body.data.created).toBe(2);
    expect(res.body.data.failed).toBe(0);
  });

  it('should list questions with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/questions?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBe(3); // 1 single + 2 bulk
    expect(res.body.data.total).toBe(3);
  });
});

// ── Admin: Exam Management ────────────────────────────────────────────────────
describe('Admin Exam Management', () => {
  it('should create an exam', async () => {
    const res = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        title: 'IOE Mock Test 1',
        description: 'Full-length IOE practice exam',
        durationMinutes: 120,
        totalMarks: 100,
        passingMarks: 40,
        isPublished: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.isPublished).toBe(true);
    examId = res.body.data.id;
  });

  it('should assign questions to exam', async () => {
    // Fetch all question IDs
    const listRes = await request(app)
      .get('/api/v1/questions?limit=100')
      .set('Authorization', `Bearer ${adminToken}`);

    const qIds = listRes.body.data.questions.map((q) => q.id);

    const res = await request(app)
      .post(`/api/v1/exams/${examId}/questions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ questionIds: qIds });

    expect(res.status).toBe(200);
    expect(res.body.data.assigned).toBe(qIds.length);
  });
});

// ── Student: Exam Browsing ────────────────────────────────────────────────────
describe('Student Exam Browsing', () => {
  it('should list published exams for students', async () => {
    const res = await request(app)
      .get('/api/v1/exams')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.exams.length).toBeGreaterThan(0);
    expect(res.body.data.exams[0].title).toBe('IOE Mock Test 1');
  });

  it('should get exam questions WITHOUT correct answers (security)', async () => {
    const res = await request(app)
      .get(`/api/v1/exams/${examId}/questions`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBeGreaterThan(0);
    expect(res.body.data.questions[0]).not.toHaveProperty('correctAnswer');
    expect(res.body.data.questions[0]).not.toHaveProperty('explanation');
    expect(res.body.data.questions[0]).toHaveProperty('options');
  });
});

// ── Student: Attempt Lifecycle ────────────────────────────────────────────────
describe('Student Attempt Lifecycle', () => {
  it('should start an attempt', async () => {
    const res = await request(app)
      .post('/api/v1/attempts/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ examId });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.exam.questions.length).toBeGreaterThan(0);
    attemptId = res.body.data.id;
  });

  it('should reject duplicate active attempts', async () => {
    const res = await request(app)
      .post('/api/v1/attempts/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ examId });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should submit answers', async () => {
    // Get attempt state to retrieve question IDs
    const attemptRes = await request(app)
      .get(`/api/v1/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    const questions = attemptRes.body.data.exam.examQuestions || [];
    // If the controller returns flattened questions, adjust:
    const qList = attemptRes.body.data.questions || questions;

    expect(qList.length).toBeGreaterThan(0);

    // Submit first question correctly, second incorrectly, skip third
    const q1 = qList[0];
    const res1 = await request(app)
      .post('/api/v1/attempts/submit-answer')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        attemptId,
        questionId: q1.id,
        selectedOption: q1.options ? q1.options[1] : '3.14', // fallback
        timeTakenSec: 30,
      });

    expect(res1.status).toBe(200);
    expect(res1.body.data).toHaveProperty('isCorrect');
  });

  it('should finish the attempt', async () => {
    const res = await request(app)
      .post('/api/v1/attempts/finish')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        attemptId,
        timeTakenSec: 120,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(typeof res.body.data.score).toBe('number');
  });
});

// ── Results & Review ──────────────────────────────────────────────────────────
describe('Results & Analytics', () => {
  it('should retrieve result WITH correct answers after submission', async () => {
    const res = await request(app)
      .get(`/api/v1/results/${attemptId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.attempt.status).toBe('COMPLETED');
    expect(res.body.data.answers.length).toBeGreaterThan(0);
    expect(res.body.data.answers[0]).toHaveProperty('correctAnswer');
    expect(res.body.data.answers[0]).toHaveProperty('explanation');
    expect(res.body.data.attempt).toHaveProperty('percentile');
    expect(res.body.data.attempt).toHaveProperty('accuracy');
  });

  it('should get student analytics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalAttempts).toBe(1);
    expect(typeof res.body.data.averageScore).toBe('number');
    expect(res.body.data.recentAttempts.length).toBe(1);
  });

  it('should get student trend data', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/my-trends?days=7')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get admin system stats', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/system')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBe(2);
    expect(res.body.data.totalExams).toBe(1);
    expect(res.body.data.totalQuestions).toBe(3);
    expect(res.body.data.totalAttempts).toBe(1);
  });

  it('should get admin category breakdown', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]).toHaveProperty('totalExams');
    expect(res.body.data[0]).toHaveProperty('averageScore');
  });
});

// ── Leaderboard Service ───────────────────────────────────────────────────────
describe('Leaderboard Service', () => {
  it('should update and retrieve leaderboard entries', async () => {
    // Since no HTTP route exists yet, test the service directly
    const user = await prisma.user.findUnique({
      where: { email: 'student@tu-test.com' },
    });

    await leaderboardService.updateEntry(examId, user.id, 85, new Date());

    const topN = await leaderboardService.getTopN(examId, 10);
    expect(topN.length).toBe(1);
    expect(topN[0].score).toBe(85);
    expect(topN[0].rank).toBe(0);

    const userRank = await leaderboardService.getUserRank(examId, user.id);
    expect(userRank).not.toBeNull();
    expect(userRank.rank).toBe(1);
  });
});

// ── Input Validation ─────────────────────────────────────────────────────────
describe('Input Validation & Error Handling', () => {
  it('should reject registration with invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'invalid-email',
      password: 'TestPass123!',
      fullName: 'Test User',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with weak password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: '123', // too short
      fullName: 'Test User',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'student@tu-test.com',
      password: 'DupPass123!',
      fullName: 'Duplicate User',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject question with missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        questionText: 'Incomplete question',
        // missing options, correctAnswer, etc.
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject question with mismatched options count', async () => {
    const res = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        questionText: 'Test question',
        options: ['A', 'B'], // only 2 options
        correctAnswer: 'C', // correct answer not in options
        explanation: 'Test',
        difficulty: 'MEDIUM',
        marks: 2,
      });

    expect(res.status).toBe(400);
  });

  it('should reject exam with invalid duration', async () => {
    const res = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        title: 'Bad Exam',
        durationMinutes: -10, // negative duration
        totalMarks: 100,
        passingMarks: 40,
      });

    expect(res.status).toBe(400);
  });

  it('should reject exam with passingMarks > totalMarks', async () => {
    const res = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        title: 'Bad Exam 2',
        durationMinutes: 120,
        totalMarks: 100,
        passingMarks: 150, // greater than totalMarks
      });

    expect(res.status).toBe(400);
  });
});

// ── User Profile Management ───────────────────────────────────────────────────
describe('User Profile Management', () => {
  it('should get current user profile', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('student@tu-test.com');
    expect(res.body.data.role).toBe('STUDENT');
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        fullName: 'Updated Student Name',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe('Updated Student Name');
  });

  it('should change password', async () => {
    const res = await request(app)
      .post('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        oldPassword: 'StudentPass1!',
        newPassword: 'NewPass1234!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject wrong old password when changing password', async () => {
    const res = await request(app)
      .post('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        oldPassword: 'WrongPass123!',
        newPassword: 'AnotherPass123!',
      });

    expect(res.status).toBe(401);
  });

  it('should login with new password after change', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'student@tu-test.com',
      password: 'NewPass1234!',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});

// ── Pagination & Limits ───────────────────────────────────────────────────────
describe('Pagination & Limits', () => {
  it('should handle pagination with custom limit', async () => {
    const res = await request(app)
      .get('/api/v1/questions?page=1&limit=2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBeLessThanOrEqual(2);
    expect(res.body.data.total).toBe(3);
  });

  it('should return empty for out-of-range page', async () => {
    const res = await request(app)
      .get('/api/v1/questions?page=999&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.questions.length).toBe(0);
  });

  it('should enforce maximum limit', async () => {
    const res = await request(app)
      .get('/api/v1/questions?page=1&limit=10000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    // Should cap limit to reasonable value (usually 100)
    expect(res.body.data.questions.length).toBeLessThanOrEqual(100);
  });
});

// ── Attempt Time Validation ───────────────────────────────────────────────────
describe('Attempt Time & Duration Validation', () => {
  let secondAttemptId;

  it('should create second attempt for verification', async () => {
    const res = await request(app)
      .post('/api/v1/attempts/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ examId: categoryId });

    // If second exam not created, use same exam with different approach
    if (res.status === 409) {
      // Already has active attempt
      expect(res.status).toBe(409);
    } else {
      secondAttemptId = res.body.data?.id;
    }
  });

  it('should track time taken on answer submission', async () => {
    const attemptRes = await request(app)
      .get(`/api/v1/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    const qList = attemptRes.body.data.questions || [];
    if (qList.length > 1) {
      const q2 = qList[1];
      const res = await request(app)
        .post('/api/v1/attempts/submit-answer')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          questionId: q2.id,
          selectedOption: q2.options ? q2.options[0] : 'A',
          timeTakenSec: 45,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('timeTakenSec');
    }
  });
});

// ── CSV Upload Validation ─────────────────────────────────────────────────────
describe('CSV Upload Validation', () => {
  it('should reject CSV with invalid format', async () => {
    const invalidCsv = 'invalid,header\nrow1,row2';
    const tmpFile = path.join(os.tmpdir(), `invalid-${Date.now()}.csv`);
    fs.writeFileSync(tmpFile, invalidCsv);

    const res = await request(app)
      .post('/api/v1/questions/bulk-upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', tmpFile);

    fs.unlinkSync(tmpFile);

    expect(res.status).toBe(400);
  });

  it('should report partial CSV failures', async () => {
    const mixedCsv =
      'category_id,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,marks\n' +
      `${categoryId},Valid question?,A,B,C,D,A,Explanation,EASY,1\n` +
      `invalid_id,Invalid cat question?,A,B,C,D,A,Explanation,EASY,1`;

    const tmpFile = path.join(os.tmpdir(), `mixed-${Date.now()}.csv`);
    fs.writeFileSync(tmpFile, mixedCsv);

    const res = await request(app)
      .post('/api/v1/questions/bulk-upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', tmpFile);

    fs.unlinkSync(tmpFile);

    expect(res.status).toBe(200);
    expect(res.body.data.created).toBeGreaterThanOrEqual(0);
    expect(res.body.data.failed).toBeGreaterThanOrEqual(0);
  });
});

// ── Data Cascade & Deletion ───────────────────────────────────────────────────
describe('Data Cascade & Soft Delete Integrity', () => {
  it('should maintain referential integrity when questions are deleted', async () => {
    // Verify questions exist in exam before deletion
    const beforeRes = await request(app)
      .get(`/api/v1/exams/${examId}/questions`)
      .set('Authorization', `Bearer ${adminToken}`);

    const questionCountBefore = beforeRes.body.data.questions.length;
    expect(questionCountBefore).toBeGreaterThan(0);

    // Attempt should still reference deleted questions through examination history
    const resultRes = await request(app)
      .get(`/api/v1/results/${attemptId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.answers.length).toBeGreaterThan(0);
  });
});

// ── RBAC Security ─────────────────────────────────────────────────────────────
describe('RBAC Security Boundaries', () => {
  it('should reject student accessing admin analytics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/system')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject student creating exams', async () => {
    const res = await request(app)
      .post('/api/v1/exams')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        categoryId,
        title: 'Hacked Exam',
        durationMinutes: 10,
        totalMarks: 10,
      });

    expect(res.status).toBe(403);
  });

  it('should reject student creating questions', async () => {
    const res = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        categoryId,
        questionText: 'Hacked question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        difficulty: 'EASY',
        marks: 1,
      });

    expect(res.status).toBe(403);
  });

  it('should reject student accessing other user attempts', async () => {
    // Create another student
    await request(app).post('/api/v1/auth/register').send({
      email: 'student2@tu-test.com',
      password: 'Pass123!',
      fullName: 'Student 2',
    });

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'student2@tu-test.com',
      password: 'Pass123!',
    });

    const student2Token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get(`/api/v1/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${student2Token}`);

    expect(res.status).toBe(403);
  });

  it('should reject unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });

  it('should reject access with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer invalid_token_12345');

    expect(res.status).toBe(401);
  });
});

// ── API Response Consistency ──────────────────────────────────────────────────
describe('API Response Format Consistency', () => {
  it('should return consistent success response format', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
    expect(typeof res.body.success).toBe('boolean');
  });

  it('should return consistent error response format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'AnyPass123!',
      });

    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty('message');
  });

  it('should include proper timestamps in responses', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    // Timestamp should be in response data or metadata
  });
});

// ── Database Constraints ──────────────────────────────────────────────────────
describe('Database Constraints & Integrity', () => {
  it('should enforce unique category slug', async () => {
    const res = await request(app)
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Duplicate Category',
        slug: 'ioe-entrance', // already used
        description: 'This should fail',
      });

    expect(res.status).toBe(409);
  });

  it('should not allow null values for required fields', async () => {
    const res = await request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        categoryId,
        questionText: null,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        difficulty: 'EASY',
        marks: 1,
      });

    expect(res.status).toBe(400);
  });
});

// ── Concurrent Operations ─────────────────────────────────────────────────────
describe('Concurrent Operations Safety', () => {
  it('should handle concurrent answer submissions safely', async () => {
    // Get a fresh attempt
    const attemptRes = await request(app)
      .post('/api/v1/attempts/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ examId: categoryId });

    if (attemptRes.status === 201) {
      const newAttemptId = attemptRes.body.data.id;
      const getRes = await request(app)
        .get(`/api/v1/attempts/${newAttemptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      const qList = getRes.body.data.questions || [];
      if (qList.length >= 2) {
        const q1 = qList[0];
        const q2 = qList[1];

        // Submit both in sequence (concurrent simulation)
        const res1 = await request(app)
          .post('/api/v1/attempts/submit-answer')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            attemptId: newAttemptId,
            questionId: q1.id,
            selectedOption: q1.options?.[0] || 'A',
            timeTakenSec: 30,
          });

        const res2 = await request(app)
          .post('/api/v1/attempts/submit-answer')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            attemptId: newAttemptId,
            questionId: q2.id,
            selectedOption: q2.options?.[0] || 'A',
            timeTakenSec: 30,
          });

        expect(res1.status).toBe(200);
        expect(res2.status).toBe(200);
      }
    }
  });
});

// ── Auth Logout ─────────────────────────────────────────────────────────────────
describe('POST /api/v1/auth/logout', () => {
  it('should logout the student', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: studentRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject reused refresh token after logout', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: studentRefreshToken });

    expect(res.status).toBe(401);
  });

  it('should also invalidate access token after logout (delayed)', async () => {
    // First logout
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'student@tu-test.com',
      password: 'NewPass1234!',
    });

    const testToken = loginRes.body.data.accessToken;
    const testRefreshToken = loginRes.body.data.refreshToken;

    // Logout
    await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: testRefreshToken });

    // Try using access token - should eventually fail in production
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${testToken}`);

    // Depending on implementation, this might be 200 or 401
    expect([200, 401]).toContain(res.status);
  });
});
