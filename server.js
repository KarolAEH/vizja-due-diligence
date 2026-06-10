'use strict';
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { db } = require('./db');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vizja-admin';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------- tiny cookie parser ----------
app.use((req, _res, next) => {
  req.cookies = {};
  const raw = req.headers.cookie;
  if (raw) raw.split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > -1) req.cookies[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  next();
});

// ---------- signed session ----------
function sign(value) {
  const mac = crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
  return `${value}.${mac}`;
}
function verify(signed) {
  if (!signed) return false;
  const i = signed.lastIndexOf('.');
  if (i < 0) return false;
  const value = signed.slice(0, i), mac = signed.slice(i + 1);
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
  const a = Buffer.from(mac), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function requireAuth(req, res, next) {
  if (verify(req.cookies.vizja_admin)) return next();
  return res.status(401).json({ error: 'unauthorised' });
}

const newToken = () => crypto.randomBytes(9).toString('base64url');
const now = () => new Date().toISOString();

// ---------- static assets ----------
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));

// ================= PUBLIC: agency form (FILE 1) =================
// A shareable invitation link. If the token is unknown we still render the
// form (open mode) so a generic link works, but admins normally create tokens.
app.get('/', (_req, res) => res.redirect('/admin'));

app.get('/form', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'form.html')));

app.get('/form/:token', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'form.html')));

// Public can read which agency a token was issued to (to pre-fill / display)
app.get('/api/invitation/:token', (req, res) => {
  const inv = db.prepare('SELECT token, agency_name, active FROM invitations WHERE token = ?')
    .get(req.params.token);
  if (!inv || !inv.active) return res.json({ found: false });
  res.json({ found: true, agency_name: inv.agency_name });
});

// Public submission endpoint
app.post('/api/submit', submit);
app.post('/api/submit/:token', submit);
function submit(req, res) {
  const { answers, lang } = req.body || {};
  if (!answers || typeof answers !== 'object')
    return res.status(400).json({ error: 'missing answers' });
  const token = req.params.token || null;
  const agency = (answers['1.1'] || '').toString().slice(0, 300) || null;
  const country = (answers['1.3'] || '').toString().slice(0, 120) || null;
  const info = db.prepare(
    `INSERT INTO submissions (token, agency_name, country, answers, lang, status, submitted_at)
     VALUES (?, ?, ?, ?, ?, 'submitted', ?)`
  ).run(token, agency, country, JSON.stringify(answers), lang || 'en', now());
  if (token) db.prepare('UPDATE invitations SET active = 0 WHERE token = ?').run(token);
  res.json({ ok: true, id: info.lastInsertRowid });
}

// ================= ADMIN: panel + assessment (FILE 2) =================
app.get('/admin', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'bad password' });
  const cookie = sign('admin:' + now());
  res.setHeader('Set-Cookie',
    `vizja_admin=${encodeURIComponent(cookie)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200`);
  res.json({ ok: true });
});
app.post('/api/logout', (_req, res) => {
  res.setHeader('Set-Cookie', 'vizja_admin=; HttpOnly; Path=/; Max-Age=0');
  res.json({ ok: true });
});
app.get('/api/me', (req, res) => res.json({ authed: verify(req.cookies.vizja_admin) }));

// ----- invitations -----
app.get('/api/invitations', requireAuth, (_req, res) => {
  res.json(db.prepare('SELECT * FROM invitations ORDER BY created_at DESC').all());
});
app.post('/api/invitations', requireAuth, (req, res) => {
  const token = newToken();
  db.prepare('INSERT INTO invitations (token, agency_name, note, created_at, active) VALUES (?,?,?,?,1)')
    .run(token, (req.body.agency_name || '').slice(0, 300), (req.body.note || '').slice(0, 500), now());
  res.json({ ok: true, token });
});
app.delete('/api/invitations/:token', requireAuth, (req, res) => {
  db.prepare('UPDATE invitations SET active = 0 WHERE token = ?').run(req.params.token);
  res.json({ ok: true });
});

// ----- submissions -----
app.get('/api/submissions', requireAuth, (_req, res) => {
  const rows = db.prepare(`
    SELECT s.id, s.agency_name, s.country, s.lang, s.status, s.submitted_at,
           a.decision AS decision, a.updated_at AS reviewed_at
    FROM submissions s
    LEFT JOIN assessments a ON a.submission_id = s.id
    ORDER BY s.submitted_at DESC`).all();
  res.json(rows);
});
app.get('/api/submissions/:id', requireAuth, (req, res) => {
  const s = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!s) return res.status(404).json({ error: 'not found' });
  s.answers = JSON.parse(s.answers);
  const a = db.prepare('SELECT * FROM assessments WHERE submission_id = ?').get(req.params.id);
  s.assessment = a ? JSON.parse(a.data) : null;
  res.json(s);
});
app.put('/api/submissions/:id/status', requireAuth, (req, res) => {
  db.prepare('UPDATE submissions SET status = ? WHERE id = ?')
    .run((req.body.status || 'submitted').slice(0, 40), req.params.id);
  res.json({ ok: true });
});
app.delete('/api/submissions/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM assessments WHERE submission_id = ?').run(req.params.id);
  db.prepare('DELETE FROM submissions WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ----- assessment (internal review) -----
app.put('/api/submissions/:id/assessment', requireAuth, (req, res) => {
  const s = db.prepare('SELECT id FROM submissions WHERE id = ?').get(req.params.id);
  if (!s) return res.status(404).json({ error: 'not found' });
  const data = req.body.data || {};
  db.prepare(`
    INSERT INTO assessments (submission_id, data, reviewer, decision, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(submission_id) DO UPDATE SET
      data=excluded.data, reviewer=excluded.reviewer,
      decision=excluded.decision, updated_at=excluded.updated_at`
  ).run(
    Number(req.params.id),
    JSON.stringify(data),
    (data.reviewer || '').toString().slice(0, 200),
    (data.decision || '').toString().slice(0, 100),
    now()
  );
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`VIZJA Agent Due Diligence running on http://localhost:${PORT}`);
  console.log(`  Agency form (share this): http://localhost:${PORT}/form`);
  console.log(`  Admin panel:              http://localhost:${PORT}/admin`);
  if (ADMIN_PASSWORD === 'vizja-admin')
    console.log('  ⚠  Using default admin password. Set ADMIN_PASSWORD env var in production.');
});
