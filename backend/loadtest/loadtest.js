// k6 load test for JoinEazy — Section 14 of the hardening plan.
//
// Covers representative endpoints: login, assignment listing (admin + student),
// group listing, and the analytics dashboard — the ones most likely to be hit
// hard in real usage and most likely to benefit from indexing/pagination.
//
// Requires the seed data (`npm run seed`) to be present, since it logs in as
// the seeded admin and student accounts.
//
// Usage:
//   npm install -g k6          # or: brew install k6 / see https://k6.io/docs/get-started/installation/
//   npm run seed                # make sure the demo accounts exist
//   BASE_URL=http://localhost:5000/api k6 run loadtest/loadtest.js
//
// Record the summary k6 prints (avg/median/p90/p95/max/error rate/throughput)
// before and after a change — see backend/PERFORMANCE.md for the template.

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
    http_req_duration: ['p(95)<500'], // adjust once you have a real baseline
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

  // Admin: assignment listing (paginated)
  let res = http.get(`${BASE_URL}/assignments?page=1&limit=20`, {
    ...adminHeaders,
    tags: { name: 'GET /assignments (admin, paginated)' },
  });
  check(res, { 'assignments 200': (r) => r.status === 200 });

  // Admin: group listing (paginated)
  res = http.get(`${BASE_URL}/groups?page=1&limit=20`, {
    ...adminHeaders,
    tags: { name: 'GET /groups (admin, paginated)' },
  });
  check(res, { 'groups 200': (r) => r.status === 200 });

  // Admin: analytics dashboard (the heaviest aggregate query set)
  res = http.get(`${BASE_URL}/analytics/overview`, {
    ...adminHeaders,
    tags: { name: 'GET /analytics/overview' },
  });
  check(res, { 'analytics 200': (r) => r.status === 200 });

  // Student: their own assignment list
  res = http.get(`${BASE_URL}/assignments/mine`, {
    ...studentHeaders,
    tags: { name: 'GET /assignments/mine (student)' },
  });
  check(res, { 'assignments/mine 200': (r) => r.status === 200 });

  // Student: their own groups
  res = http.get(`${BASE_URL}/groups/mine`, {
    ...studentHeaders,
    tags: { name: 'GET /groups/mine (student)' },
  });
  check(res, { 'groups/mine 200': (r) => r.status === 200 });

  sleep(1);
}
