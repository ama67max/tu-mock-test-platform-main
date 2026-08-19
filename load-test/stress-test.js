import { check, sleep } from 'k6';
import http from 'k6/http';

// Stress test - find the breaking point
// Gradually increases load until system fails
export const options = {
  discardResponseBodies: true,
  noConnectionReuse: false,
  batch: 20,
  batchPerHost: 20,
  timeout: '10s',

  // Aggressive stress test stages
  stages: [
    { duration: '2m', target: 500 },   // Initial ramp-up
    { duration: '2m', target: 1000 },  // Moderate load
    { duration: '2m', target: 1500 },  // High load
    { duration: '2m', target: 2000 },  // Very high load
    { duration: '2m', target: 2500 },  // Extreme load (finding breaking point)
    { duration: '1m', target: 2500 },  // Hold at extreme load
    { duration: '3m', target: 0 },     // Ramp-down
  ],

  thresholds: {
    // More relaxed thresholds for stress testing
    http_req_duration: ['p(95)<2000'], // Allow up to 2s at 95th percentile
    http_req_failed: ['rate<0.10'],    // Allow up to 10% failures
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

const TEST_USERS = [
  { email: 'testuser1@example.com', password: 'TestPass123!' },
  { email: 'testuser2@example.com', password: 'TestPass123!' },
  { email: 'testuser3@example.com', password: 'TestPass123!' },
  { email: 'testuser4@example.com', password: 'TestPass123!' },
  { email: 'testuser5@example.com', password: 'TestPass123!' },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function authenticate(user) {
  const response = http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (response.status === 200) {
    try {
      const body = JSON.parse(response.body);
      return body.data?.accessToken;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export default function () {
  const user = randomElement(TEST_USERS);
  const token = authenticate(user);

  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Random endpoint access
  const endpoints = [
    { method: 'GET', url: '/exams?page=1&limit=20' },
    { method: 'GET', url: '/exams/exam-001' },
    { method: 'GET', url: '/results' },
  ];

  if (token) {
    endpoints.push(
      { method: 'GET', url: '/exams/exam-001/leaderboard' },
      { method: 'GET', url: '/results' }
    );
  }

  const endpoint = randomElement(endpoints);
  const response = http.request(endpoint.method, `${BASE_URL}${endpoint.url}`, null, { headers });

  check(response, {
    'request successful': (r) => r.status >= 200 && r.status < 500,
  });

  sleep(randomInt(1, 3));
}

export function setup() {
  console.log('Starting STRESS test - finding breaking point...');
  console.log('WARNING: This test will push the system to its limits!');
  console.log(`Base URL: ${BASE_URL}`);
}

export function teardown() {
  console.log('Stress test completed. Analyze results to find breaking point.');
}
