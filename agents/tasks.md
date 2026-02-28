# Tasks

- [done] TASK: Add security headers middleware
  - Acceptance: Middleware sets X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 1; mode=block. Integrated into src/server/app.js after requestLogger.
  - Files: src/server/utility/securityHeaders.js, src/server/app.js

- [done] TASK: Add request ID middleware
  - Acceptance: Middleware adds a unique request ID (UUID v4 or timestamp+random) to each request, attaches it to req.id and includes it in response headers (X-Request-ID); requestLogger includes requestId in log context.
  - Files: src/server/utility/requestId.js, src/server/app.js, src/server/utility/requestLogger.js

- [done] TASK: Rename backoffice/login.js to backoffice/register.js
  - Acceptance: File renamed, route path changed from /backoffice/login to /backoffice/register; import statements updated where referenced; no change in functionality.
  - Files: src/server/routes/backoffice/login.js, src/server/routes/backoffice/register.js (new), src/server/app.js (if any direct reference), src/server/utility/loadRoutes.js (if path mapping needed)

- [todo] TASK: Add setup validation for existing data directories
  - Acceptance: In setup.js, check if data/ and log/ directories exist; create them if missing with appropriate permissions; log action to console.
  - Files: src/server/setup.js

- [todo] TASK: Add rate‑limiting middleware for auth endpoints
  - Acceptance: Middleware limits /backoffice/login (or /backoffice/register) and /register to 5 requests per minute per IP; uses simple in‑memory store; returns 429 with error response.
  - Files: src/server/utility/rateLimit.js, src/server/app.js (or apply per‑route)

- [todo] TASK: Add success response utility
  - Acceptance: Create sendSuccess function in errorResponse.js (or separate) that returns { ok: true, data?: ... } with optional data; update health endpoint to use it; at least one other success response (e.g., doesAccountExist) updated.
  - Files: src/server/utility/errorResponse.js, src/server/routes/health.js, src/server/routes/doesAccountExist.js

- [todo] TASK: Add smoke test script
  - Acceptance: Create src/scripts/test-smoke.js that starts server (or assumes running), requests /health, validates response shape and status, logs result, exits with code 0 on success, 1 on failure; script can be run with node.
  - Files: src/scripts/test-smoke.js