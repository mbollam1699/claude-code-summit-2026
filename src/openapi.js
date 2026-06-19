'use strict';

const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

/**
 * Load and parse the OpenAPI spec from openapi.yaml at the repo root.
 *
 * Kept in its own module so app.js stays small and the spec file is the single
 * source of truth for both the Swagger UI (/docs) and /openapi.json.
 *
 * @returns {object} the parsed OpenAPI document
 */
function loadOpenApiSpec() {
  const specPath = path.join(__dirname, '..', 'openapi.yaml');
  const raw = fs.readFileSync(specPath, 'utf8');
  return YAML.parse(raw);
}

module.exports = { loadOpenApiSpec };
