import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  // REMOVED discardResponseBodies so r.body can be parsed safely
  noConnectionReuse: false,
  batch: 20,
  batchPerHost: 20,
  timeout: '10s',

  stages: [
    { duration: '2m', target: 500 },
    { duration: '3m', target: 1000 },
    { duration: '1m', target: 1200 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
  },

  tags: {
    test_type: 'load_test',
    environment: __ENV.ENVIRONMENT || 'staging',
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

const BEHAVIOR_WEIGHTS = {
  browse_exams: 0.25,
  take_exam: 0.35,
  view_results: 0.20,
  browse_leaderboard: 0.10,
  mixed_activity: 0.10,
};

const TEST_USERS = [
  { email: 'testuser1@example.com', password: 'TestPass123!' },
  { email: 'testuser2@example.com', password: 'TestPass123!' },
  { email: 'testuser3@example.com', password: 'TestPass123!' },
  { email: 'testuser4@example.com', password: 'TestPass123!' },
  { email: 'testuser5@example.com', password: 'TestPass123!' },
];

const SAMPLE_EXAM_IDS = ['exam-001', 'exam-002', 'exam-003', 'exam-004', 'exam-005'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomThinkTime() {
  return randomInt(1, 5);
}

// Global setup: Authenticate once and pass valid tokens to VUs
export function setup() {
  console.log(`Starting load test against Base URL: ${BASE_URL}`);

  const tokens = [];
  for (const user of TEST_USERS) {
    const response = http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      try {
        const body = response.json(); // Built-in k6 helper
        if (body?.data?.accessToken) {
          tokens.push(body.data.accessToken);
        }
      } catch (e) {
        console.error(`Failed to parse token for ${user.email}`);
      }
    }
  }

  if (tokens.length === 0) {
    console.warn('Warning: No tokens generated during setup. Tests will run in unauthenticated mode.');
  }

  return { tokens };
}

export function browseExams(token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const listResponse = http.get(`${BASE_URL}/exams?page=1&limit=20`, { headers });
  check(listResponse, { 'list exams successful': (r) => r.status === 200 });

  sleep(randomThinkTime());

  const examId = randomElement(SAMPLE_EXAM_IDS);
  const detailResponse = http.get(`${BASE_URL}/exams/${examId}`, { headers });
  check(detailResponse, { 'exam detail successful': (r) => r.status === 200 || r.status === 404 });

  sleep(randomThinkTime());
}

export function takeExam(token) {
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const examId = randomElement(SAMPLE_EXAM_IDS);

  const startResponse = http.post(
    `${BASE_URL}/attempts/start`,
    JSON.stringify({ examId }),
    { headers }
  );

  const startSuccess = check(startResponse, {
    'attempt started': (r) => r.status === 201 || r.status === 400,
  });

  if (!startSuccess) return;

  let attemptId;
  try {
    const body = startResponse.json();
    attemptId = body?.data?.attempt?.id;
  } catch (e) {
    return;
  }

  if (!attemptId) return;

  sleep(randomThinkTime());

  const questionCount = randomInt(3, 10);
  for (let i = 0; i < questionCount; i++) {
    const submitResponse = http.post(
      `${BASE_URL}/attempts/submit-answer`,
      JSON.stringify({
        attemptId,
        questionId: `question-${randomInt(1, 100)}`,
        selectedAnswer: randomInt(1, 4),
      }),
      { headers }
    );

    check(submitResponse, {
      'answer submitted': (r) => r.status === 200 || r.status === 400,
    });

    sleep(randomInt(2, 6));
  }

  const finishResponse = http.post(
    `${BASE_URL}/attempts/finish`,
    JSON.stringify({ attemptId }),
    { headers }
  );

  check(finishResponse, {
    'attempt finished': (r) => r.status === 200 || r.status === 400,
  });

  sleep(randomThinkTime());
}

export function viewResults(token) {
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const resultsResponse = http.get(`${BASE_URL}/results`, { headers });
  check(resultsResponse, { 'results retrieved': (r) => r.status === 200 });

  sleep(randomThinkTime());
}

export function browseLeaderboard(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const examId = randomElement(SAMPLE_EXAM_IDS);
  const leaderboardResponse = http.get(`${BASE_URL}/exams/${examId}/leaderboard`, { headers });

  check(leaderboardResponse, {
    'leaderboard retrieved': (r) => r.status === 200 || r.status === 404,
  });

  sleep(randomThinkTime());
}

export default function (data) {
  // Use pre-fetched tokens passed from setup()
  const token = data.tokens && data.tokens.length > 0 ? randomElement(data.tokens) : null;

  const random = Math.random();
  let cumulativeWeight = 0;

  for (const [behavior, weight] of Object.entries(BEHAVIOR_WEIGHTS)) {
    cumulativeWeight += weight;

    if (random <= cumulativeWeight) {
      switch (behavior) {
        case 'browse_exams':
          browseExams(token);
          break;
        case 'take_exam':
          takeExam(token);
          break;
        case 'view_results':
          viewResults(token);
          break;
        case 'browse_leaderboard':
          browseLeaderboard(token);
          break;
        case 'mixed_activity':
          browseExams(token);
          takeExam(token);
          viewResults(token);
          break;
      }
      break;
    }
  }

  sleep(randomInt(1, 3));
}

export function teardown(data) {
  console.log('Load test execution finished.');
}