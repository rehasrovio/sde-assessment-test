# sde-assessment-test

Pyse — SDE1 Full-Stack Take-Home

Project: Helpdesk Lite (Node.js + React + SQL)
Timebox: 2–3 days from when you receive this repo invite (your exact deadline is in the email)

1) Overview

Build a tiny Helpdesk where users can list, search, filter, sort, and update tickets. The goal is to see your problem-solving, attention to detail, and everyday coding habits across Node.js, React, and SQL. You may use AI tools; please note any substantial snippets or prompts in a short Credits section of your README.

2) Deliverables

A working backend API (Node + Express) backed by SQLite (provided seed).

A minimal but polished React UI that consumes your API.

Tests:

Backend: ≥5 tests (routes, validation, status transitions, happy/error paths).

Frontend: ≥6 tests (filtering/search, URL sync, empty/error/loading states, a11y basics).

Linting/formatting (ESLint + Prettier).

A concise README with setup/run instructions, decisions/trade-offs, and Credits.

3) Data model (seed provided)

You’ll receive either a prebuilt SQLite DB (/data/helpdesk.sqlite) or a seed script.

users(id, name, email, role)

tickets(
  id, title, description,
  status: 'open' | 'in_progress' | 'closed',
  priority: 'low' | 'medium' | 'high',
  assignee_id (FK users.id),
  created_at, updated_at, closed_at nullable
)

comments(id, ticket_id (FK), author_id (FK), body, created_at)


The seed contains ~6 users, ~80 tickets, ~200 comments spanning multiple dates.

4) Backend specification (Express + parameterized SQL)

Implement the endpoints below. Use parameterized queries—no string-concat SQL.

4.1 GET /api/tickets

Query params:

search (substring over title + description, case-insensitive)

status (comma-separated; any of open,in_progress,closed)

assignee (user id)

sort one of created_at|priority|status (default created_at)

order asc|desc (default desc)

page (≥1), limit (≤50; default 10)

Response (example):

{
  "total": 123,
  "page": 1,
  "limit": 10,
  "items": [
    {
      "id": 42,
      "title": "Payment button disabled",
      "status": "open",
      "priority": "high",
      "assignee": { "id": 3, "name": "Asha" },
      "created_at": "2025-08-25T14:03:00.000Z"
    }
  ],
  "facets": { "status": { "open": 10, "in_progress": 5, "closed": 108 } }
}


Details to get right

facets.status reflects counts after search filtering only (ignore the status filter itself when computing facets).

Unknown status values are ignored (not errors).

If page exceeds available pages, return an empty items array with correct total.

4.2 GET /api/tickets/:id

Return one ticket with assignee info and comment_count.

4.3 POST /api/tickets

Body:

{ "title": "string", "description": "string", "priority": "low|medium|high", "assignee_id": 2 }


Rules:

title length ≥ 5

priority must be one of the enum values

assignee_id must exist

On success: 201 with created ticket.

4.4 PATCH /api/tickets/:id/status

Body:

{ "status": "open|in_progress|closed" }


Rules:

Allowed transitions: open → in_progress → closed (no skipping backward/forward).

On transition to closed, set closed_at = now.

Invalid transitions → 422 with a clear error.

4.5 Analytics (SQL-centric)

Read-only endpoints; implement the queries in SQL (or SQL-like in SQLite):

Top closers: GET /api/analytics/top-closers?days=30
Top 3 assignees by tickets closed in the past N days (default 30):
[{ user: {id,name}, closed_count }]

Average resolution time: GET /api/analytics/avg-resolution?days=90
Average hours from created_at to closed_at, grouped by priority over the last N days:
[{ priority, avg_hours }]

Stale tickets: GET /api/analytics/stale?days=7
Tickets not closed and without any comment in the last N days:
[{ id, title, assignee: {id,name}, last_comment_at }]

4.6 Error shape & times

Return helpful 400/422 errors:

{ "error": "ValidationError", "message": "priority must be one of low|medium|high" }


All timestamps are ISO 8601 in UTC.

5) Frontend specification (React)

A simple, clean UI is enough—focus on correctness, states, and usability.

5.1 Tickets list

Controls: search (debounced ~300ms), status checkboxes, assignee dropdown, sort dropdown, pagination.

Table columns: title, status (chip), priority (chip), assignee, created_at.

Facets bar: render facets.status from the API (counts reflect search only).

States to handle: loading skeletons, empty state (“No tickets match…”), error banner with Retry.

URL state: sync search/filter/sort/page to the URL query string.

5.2 Ticket detail

Render ticket fields + comment_count.

Provide status change control (optimistic UI; rollback on failure).

Show “Last updated X min ago”.

5.3 Accessibility & polish

Label inputs, correct roles, visible focus, keyboard navigation.

Disable Submit/Save while requests are in flight.

Handle long titles/overflow gracefully.

6) Quality bar & tests

Backend tests: happy & error paths for /api/tickets, /api/tickets/:id, POST /tickets, PATCH /status.

Frontend tests: search/filter interaction, debounced search behavior, URL sync, empty/error/loading, a11y basics (labels/roles).

ESLint/Prettier: no lint errors (warnings allowed).

Keep commits small and descriptive.

7) What we’re evaluating (rubric)

(Indicative weights, total 100)

Backend API correctness (30) — pagination/search/facets, validation, transitions, detail endpoint.

SQL analytics (20) — correctness of time windows/aggregations and parameter safety.

Frontend behaviors (25) — filters + debounced search, URL sync, UI states, basic a11y.

Code quality & habits (15) — structure, param SQL, lint/format, commit hygiene, README.

Bonus (up to +10) — thoughtful extras (seed script, Dockerfile, rate limiting, ETag/304, coverage badge).

Pass threshold to advance: ≥ 60 overall and no red on critical API tests.

8) Using AI & external code

AI tools are allowed. Note any significant prompts/snippets or external code in Credits.

You must understand and own your submission.

9) Running & testing

We provide scripts in the repo; typical flow:

# Install
npm ci --workspaces || npm ci

# Run backend tests
npm run -w backend test:api

# Run frontend tests
npm run -w frontend test

# (Optional) start local servers if you add them
# backend: node backend/src/app.js (or npm run start)
# frontend: your choice (Vite/CRA/etc.) – not required for grading

10) Submission

Work directly in the private repo you were invited to.

Either push to main or open a PR from submission/<your-github-username>.

Ensure tests & linting pass in CI.

Update the top-level README with:

How to run your app/tests

Design decisions/trade-offs

Anything you’d improve with more time

Credits (AI/tools/external code)

11) Constraints & tips

Keep it simple—small, readable modules > frameworks everywhere.

Prefer parameterized SQL (or a lightweight query builder). Avoid heavy ORMs.

Be consistent with error shapes and HTTP status codes.

Think about edge cases (empty search, large page numbers, invalid enums, race conditions on status changes).

If something is unclear, choose a sensible behavior and document it.

Have fun—build something you’re proud to maintain.
If you hit setup issues, mention them briefly in your README (it doesn’t affect scoring as long as the core works).
