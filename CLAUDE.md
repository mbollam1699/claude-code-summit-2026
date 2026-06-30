# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fictional clinic appointment scheduler REST API built for Claude Code Summit 2026 workshops. All data is 100% synthetic — there is no PHI and no field for real patient data must ever be added.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run setup` | First-time setup (install + seed) |
| `npm test` | Run full Jest suite (in-memory DBs, deterministic) |
| `npx jest tests/api.test.js -t "test name"` | Run a single test by name |
| `npm start` | Start server at http://localhost:3000 |
| `npm run seed` | Reset `clinic.db` with synthetic data (idempotent) |

Environment: `PORT` (default 3000), `DB_PATH` (default `clinic.db`).

## Architecture

**CommonJS throughout** — `require`/`module.exports`, not ESM imports.

**Entry point:** `src/server.js` opens the DB and starts HTTP.

**App factory pattern:** `src/app.js` exports `createApp(db)` — accepts a database connection so tests can inject in-memory SQLite instances without touching the seeded `clinic.db`.

**Route factories:** Each file in `src/routes/` exports a function that takes `db` and returns an Express router:
- `providers.js` — `GET /providers`, `GET /providers/:id/slots`
- `slots.js` — `GET /slots` with `?date=` and `?specialty=` filters
- `bookings.js` — `POST /bookings`, `DELETE /bookings/:id` (both use `db.transaction()` for atomicity)

**Database:** `src/db.js` defines the schema and exports `openDb(path)`. Uses better-sqlite3 (synchronous API — no async/await for DB calls). Schema is created via `IF NOT EXISTS` on every `openDb()` call. WAL mode and foreign keys are enforced.

**Data model:** `providers`, `locations`, `slots` (status: `available`|`booked`), `bookings` (references a slot via `slot_id`, uses opaque `holder_ref` like "PT-0001").

**API docs:** OpenAPI 3.0.3 spec lives in `openapi.yaml`, served as Swagger UI at `/docs` and raw JSON at `/openapi.json`.

## Testing Pattern

Tests use `freshApp()` which creates an in-memory SQLite DB with minimal fixture data, returning `{ app, db, providerId, availableSlotId }`. Each test is fully isolated — no shared state between tests. Tests run serially (`jest --runInBand`).

## Workshop Branches

`main` is all-green baseline. Workshop branches intentionally contain bugs or missing features. See `WORKSHOPS.md` for the branch map. Use `git diff main` to see what a workshop branch changes.
