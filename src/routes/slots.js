'use strict';

const express = require('express');

/**
 * Slot routes.
 *   GET /slots?date=YYYY-MM-DD&specialty=Cardiology
 *     - date filters to slots starting on that calendar day (UTC).
 *     - specialty filters by the slot's provider specialty.
 *     - both are optional and can be combined.
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {import('express').Router}
 */
module.exports = function slotRoutes(db) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const { date, specialty } = req.query;

    let sql =
      'SELECT s.id, s.provider_id, s.location_id, s.start_time, ' +
      's.duration_min, s.status, p.specialty ' +
      'FROM slots s JOIN providers p ON p.id = s.provider_id WHERE 1 = 1';
    const params = [];

    if (date) {
      // start_time is stored as an ISO string; a date prefix match keeps the
      // query simple and index-free reasoning easy for the workshop.
      sql += ' AND s.start_time LIKE ?';
      params.push(`${date}%`);
    }

    if (specialty) {
      sql += ' AND p.specialty = ?';
      params.push(specialty);
    }

    sql += ' ORDER BY s.start_time';

    const slots = db.prepare(sql).all(...params);
    res.json(slots);
  });

  return router;
};
