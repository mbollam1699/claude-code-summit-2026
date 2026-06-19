'use strict';

const request = require('supertest');
const { openDb } = require('../src/db');
const { createApp } = require('../src/app');

/**
 * Light checks that the API docs surface is wired up. These intentionally do
 * NOT assert spec-vs-implementation conformance, so they stay green on every
 * branch (including the seeded-bug branch).
 */
function freshApp() {
  return createApp(openDb(':memory:'));
}

describe('API docs', () => {
  test('GET / returns a JSON index pointing at the docs', async () => {
    const res = await request(freshApp()).get('/');
    expect(res.status).toBe(200);
    expect(res.body.docs).toBe('/docs');
    expect(res.body.openapi).toBe('/openapi.json');
  });

  test('GET /openapi.json serves a valid OpenAPI 3 document', async () => {
    const res = await request(freshApp()).get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.paths['/bookings']).toBeDefined();
  });

  test('GET /favicon.ico is a quiet 204 (no noisy 404)', async () => {
    const res = await request(freshApp()).get('/favicon.ico');
    expect(res.status).toBe(204);
  });
});
