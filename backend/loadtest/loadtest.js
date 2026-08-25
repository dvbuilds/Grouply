import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api';

const ADMIN_CREDENTIALS = { email: 'prof@joineazy.dev', password: 'password123' };
const STUDENT_CREDENTIALS = { email: 'divya@joineazy.dev', password: 'password123' };

export const options = {
  scenarios: {
    representative_mix: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

function login(credentials) {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(credentials), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /auth/login' },
  });
  check(res, { 'login succeeded': (r) => r.status === 200 });
  return res.json('token');
}

export function setup() {
  const adminToken = login(ADMIN_CREDENTIALS);
  const studentToken = login(STUDENT_CREDENTIALS);
  return { adminToken, studentToken };
}

export default function (data) {
  const adminHeaders = { headers: { Authorization: `Bearer ${data.adminToken}` } };
  const studentHeaders = { headers: { Authorization: `Bearer ${data.studentToken}` } };

  let res = http.get(`${BASE_URL}/assignments?page=1&limit=20`, {
    ...adminHeaders,
    tags: { name: 'GET /assignments (admin, paginated)' },
  });
  check(res, { 'assignments 200': (r) => r.status === 200 });

  res = http.get(`${BASE_URL}/groups?page=1&limit=20`, {
    ...adminHeaders,
    tags: { name: 'GET /groups (admin, paginated)' },
  });
  check(res, { 'groups 200': (r) => r.status === 200 });

  res = http.get(`${BASE_URL}/analytics/overview`, {
    ...adminHeaders,
    tags: { name: 'GET /analytics/overview' },
  });
  check(res, { 'analytics 200': (r) => r.status === 200 });

  res = http.get(`${BASE_URL}/assignments/mine`, {
    ...studentHeaders,
    tags: { name: 'GET /assignments/mine (student)' },
  });
  check(res, { 'assignments/mine 200': (r) => r.status === 200 });

  res = http.get(`${BASE_URL}/groups/mine`, {
    ...studentHeaders,
    tags: { name: 'GET /groups/mine (student)' },
  });
  check(res, { 'groups/mine 200': (r) => r.status === 200 });

  sleep(1);
}
