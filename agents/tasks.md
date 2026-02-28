# Tasks

- [done] TASK: Add rate‑limiting middleware for auth endpoints
  - Acceptance: Middleware limits /backoffice/login (or /backoffice/register) and /register to 5 requests per minute per IP; uses simple in‑memory store; returns 429 with error response.
  - Files: src/server/utility/rateLimit.js, src/server/app.js (or apply per‑route)


- [todo] TASK: Add success response utility
  - Acceptance: Create sendSuccess function in errorResponse.js (or separate) that returns { ok: true, data?: ... } with optional data; update health endpoint to use it; at least one other success response (e.g., doesAccountExist) updated.
  - Files: src/server/utility/errorResponse.js, src/server/routes/health.js, src/server/routes/doesAccountExist.js


- [todo] TASK: Add smoke test script
  - Acceptance: Create src/scripts/test-smoke.js that starts server (or assumes running), requests /health, validates response shape and status, logs result, exits with code 0 on success, 1 on failure; script can be run with node.
  - Files: src/scripts/test-smoke.js

