'use strict';
// Uses Node's built-in SQLite (node:sqlite, Node >= 22.5) — no native build step,
// no third-party DB dependency. Falls back with a clear message on older Node.
const path = require('path');
const fs = require('fs');

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch (e) {
  console.error('\nThis app requires Node.js 22.5+ (for the built-in node:sqlite module).');
  console.error('Your Node version:', process.version, '\n');
  process.exit(1);
}

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'vizja.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS invitations (
      token       TEXT PRIMARY KEY,
      agency_name TEXT,
      note        TEXT,
      created_at  TEXT NOT NULL,
      active      INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      token         TEXT,
      agency_name   TEXT,
      country       TEXT,
      answers       TEXT NOT NULL,
      lang          TEXT DEFAULT 'en',
      status        TEXT NOT NULL DEFAULT 'submitted',
      submitted_at  TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assessments (
      submission_id INTEGER PRIMARY KEY,
      data          TEXT NOT NULL,
      reviewer      TEXT,
      decision      TEXT,
      updated_at    TEXT NOT NULL
    );
  `);
  return db;
}

init();

module.exports = { db, init, DB_PATH };
