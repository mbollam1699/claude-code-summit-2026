'use strict';

const express = require('express');

/**
 * Provider routes.
 *   GET /providers           -> list all providers
 *   GET /providers/:id/slots -> list a provider's slots (optionally ?status=)
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {import('express').Router}
 */
module.exports = function providerRoutes(db) {
  const router = express.Router();

  router.get('/', (req, res) => {
    const providers = db
      .prepare('SELECT id, name, specialty FROM providers ORDER BY id')
      .all();
    res.json(providers);
  });

  router.get('/:id/slots', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'provider id must be an integer' });
    }

    const provider = db
      .prepare('SELECT id FROM providers WHERE id = ?')
      .get(id);
    if (!provider) {
      return res.status(404).json({ error: `no provider with id ${id}` });
    }

    const { status } = req.query;
    let sql =
      'SELECT id, provider_id, location_id, start_time, duration_min, status ' +
      'FROM slots WHERE provider_id = ?';
    const params = [id];
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY start_time';

    const slots = db.prepare(sql).all(...params);
    res.json(slots);
  });

  return router;
};
