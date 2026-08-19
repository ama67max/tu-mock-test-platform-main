import { check, sleep } from 'k6';
import http from 'k6/http';

// Smoke test - quickly verify system is working
// Uses minimal load to check if the system is responsive
export const options = {
  discardResponseBodies: true,
  noConnectionReuse: false,
  batch: 10,
  batchPerHost: 10,
  timeout: '10s',

  // Minimal load for smoke testing
  vus: 10,
  duration: '1m',

  thresholds: {
    http_req_duration: ['p(95)<200'], // Very fast responses expected
    http_req_failed: ['rate<0.01'],   // Almost no failures
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

const TEST_USER = {
  email: 'testuser1@example.com',
  password: 'TestPass123!',
};

export default function () {
  // 1. Health check
  const healthResponse = http.get(`${BASE_URL.replace('/api/v1', '')}/health`);
  
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
  });

  // 2. Login
  const loginResponse = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify(TEST_USER),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.accessToken;
      } catch (e) {
        return false;
      }
    },
  });

  if (!loginSuccess) {
    sleep(1);
    return;
  }

  // Extract token
  let token;
  try {
    const body = JSON.parse(loginResponse.body);
    token = body.data.accessToken;
  } catch (e) {
    sleep(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 3. List exams
  const examsResponse = http.get(`${BASE_URL}/exams?page=1&limit=10`, { headers });
  
  check(examsResponse, {
    'list exams status is 200': (r) => r.status === 200,
  });

  // 4. Get results
  const resultsResponse = http.get(`${BASE_URL}/results`, { headers });
  
  check(resultsResponse, {
    'get results status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

export function setup() {
  console.log('Running smoke test...');
  console.log(`Base URL: ${BASE_URL}`);
}

export function teardown() {
  console.log('Smoke test completed successfully');
}
