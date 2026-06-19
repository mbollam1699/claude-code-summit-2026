'use strict';

const express = require('express');

const providerRoutes = require('./routes/providers');
const slotRoutes = require('./routes/slots');
const bookingRoutes = require('./routes/bookings');

/**
 * Build the Express app around a given database connection.
 *
 * Exporting a factory (rather than a singleton app) lets tests inject an
 * isolated in-memory database, so the test run never touches the seeded file
 * and the suite stays deterministic.
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {import('express').Express}
 */
function createApp(db) {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/providers', providerRoutes(db));
  app.use('/slots', slotRoutes(db));
  app.use('/bookings', bookingRoutes(db));

  // Fallback 404 for unknown routes.
  app.use((req, res) => {
    res.status(404).json({ error: 'not found' });
  });

  return app;
}

module.exports = { createApp };
