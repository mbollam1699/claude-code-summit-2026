'use strict';

/**
 * Database setup for the clinic scheduler.
 *
 * Uses better-sqlite3 (ships prebuilt binaries — no compiler needed on
 * macOS / Windows / WSL). The schema holds ONLY synthetic data: fake provider
 * names, location names, appointment slots, and opaque booking codes.
 * There is no place to store, and nothing here should ever hold, real PHI.
 */

const Database = require('better-sqlite3');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS providers (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,        -- fake, e.g. "Dr. A. Rivera"
  specialty TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL              -- e.g. "North Clinic"
);

CREATE TABLE IF NOT EXISTS slots (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id  INTEGER NOT NULL REFERENCES providers(id),
  location_id  INTEGER NOT NULL REFERENCES locations(id),
  start_time   TEXT NOT NULL,     -- ISO 8601 string, e.g. "2026-06-22T09:00:00.000Z"
  duration_min INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'available'
                 CHECK (status IN ('available', 'booked'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_id    INTEGER NOT NULL REFERENCES slots(id),
  holder_ref TEXT NOT NULL        -- opaque synthetic code, e.g. "PT-0001". NO names/contact/clinical data.
);

CREATE INDEX IF NOT EXISTS idx_slots_provider ON slots(provider_id);
CREATE INDEX IF NOT EXISTS idx_slots_status   ON slots(status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot  ON bookings(slot_id);
`;

/**
 * Open a database connection and ensure the schema exists.
 *
 * @param {string} [filename] Path to the SQLite file. Use ':memory:' for an
 *   ephemeral in-memory DB (handy for tests). Defaults to the DB_PATH env var,
 *   then to './clinic.db'.
 * @returns {import('better-sqlite3').Database}
 */
function openDb(filename) {
  const path = filename || process.env.DB_PATH || 'clinic.db';
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}

module.exports = { openDb, SCHEMA };
