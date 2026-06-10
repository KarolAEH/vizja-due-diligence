# VIZJA University — Agent Due Diligence

A bilingual (EN/PL) web app for vetting international student-recruitment agencies.
It has **two separate interfaces**:

1. **Agency form** (`/form`) — the interactive 16-section due-diligence questionnaire an
   agency fills in. Shared via a unique invitation link.
2. **Review panel** (`/admin`) — password-protected. VIZJA staff see every submission,
   read the agency's answers side-by-side with the **internal assessment tool**
   (completeness check, 1–5 risk scoring out of 55, red flags, recommended decision,
   conditions, monitoring level and sign-off).

Both interfaces have an **EN / PL toggle** in the top-right corner.

---

## Requirements

- **Node.js 22.5 or newer** (the app uses Node's built-in SQLite — no database to install,
  no native build step). Check with `node --version`.

## Run it locally

```bash
cd vizja-due-diligence
npm install          # installs Express (the only dependency)
npm start            # starts on http://localhost:3000
```

Then open:

- Review panel: **http://localhost:3000/admin**
- Agency form:  **http://localhost:3000/form**

> If a `node_modules` folder is already present and the app won't start, delete it and
> run `npm install` again.

## First-time configuration

Set these environment variables before starting (otherwise sensible defaults are used):

| Variable | Purpose | Default |
|---|---|---|
| `ADMIN_PASSWORD` | Password for the review panel | `vizja-admin` ⚠ change this |
| `SESSION_SECRET` | Signs the admin login cookie | random per restart |
| `PORT` | Port to listen on | `3000` |
| `DB_PATH` | Where the database file lives | `./data/vizja.db` |

Example (macOS / Linux):

```bash
ADMIN_PASSWORD="a-strong-password" SESSION_SECRET="any-long-random-string" npm start
```

Example (Windows PowerShell):

```powershell
$env:ADMIN_PASSWORD="a-strong-password"; $env:SESSION_SECRET="any-long-random-string"; npm start
```

---

## How the workflow runs

1. **Log in** to `/admin` and open the **Invitation links** tab.
2. **Generate a link** (optionally tag it with the agency's name). Copy it and email it to
   the agency — it looks like `https://your-host/form/AbC123xyz`.
3. The **agency fills in the form** in English or Polish, can save a local draft, print/save
   a PDF, and **submits**. The link is single-use and deactivates on submission.
4. The submission appears under **Submissions** in the panel. Open it to review the answers
   and complete the **internal assessment**. Decisions and risk scores are saved per agency
   and shown in the list.

Agencies only ever see `/form`. The assessment lives only in `/admin`.

---

## Deploying so the link works for agencies

The form must be reachable from the internet for agencies to open it. Easiest options:

- **A small VPS / cloud VM** (DigitalOcean, Hetzner, AWS Lightsail…): copy the folder, run
  `npm install`, then `npm start` behind a reverse proxy (nginx) with HTTPS. Use a process
  manager like `pm2` to keep it running.
- **A Node-friendly host** (Render, Railway, Fly.io): point it at this folder, set the build
  command to `npm install`, the start command to `npm start`, and add the environment
  variables above. Attach a persistent disk and set `DB_PATH` to a path on it so submissions
  survive restarts.

Always set a strong `ADMIN_PASSWORD` and a fixed `SESSION_SECRET` in production, and serve
over HTTPS.

---

## Data & privacy

- All submissions and assessments are stored in the single SQLite file at `DB_PATH`.
  Back that file up; that's your entire dataset.
- Nothing is sent to any third party. Agency drafts are kept only in the agency's own browser
  (localStorage) until they submit.

## Project layout

```
vizja-due-diligence/
├── server.js            # Express server + API + admin auth
├── db.js                # Built-in SQLite setup (tables: invitations, submissions, assessments)
├── package.json
├── public/
│   ├── form.html        # File 1 — agency questionnaire
│   ├── admin.html       # File 2 — review panel + internal assessment
│   ├── css/styles.css
│   └── js/
│       ├── schema.js    # Shared bilingual definition of all 16 sections + the assessment
│       ├── form.js      # Renders & submits the agency form
│       └── admin.js     # Renders the panel, answers and the assessment
└── data/                # SQLite database (created on first run)
```

To change wording, add a field, or adjust a translation, edit **`public/js/schema.js`** —
both the form and the review panel read from it, so they stay in sync automatically.
