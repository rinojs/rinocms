# Tasks

- [done] TASK: Add request logging middleware
  - Acceptance: Each HTTP request is logged with method, path, status code, and response time. Logs are written to server.log using the existing logError utility (call logError with null error and context containing method, path, status, durationMs). Middleware must acquire global.ioSemaphore before calling logError and release after to respect IO concurrency limits. Middleware is integrated into src/server/app.js before route handlers.
  - Files: src/server/utility/requestLogger.js, src/server/app.js

- [done] TASK: Create standard error response utility
  - Acceptance: A new utility function provides consistent error JSON format across all routes; at least three existing route files updated to use it; error responses include ok:false, error message, and optional code.
  - Files: src/server/utility/errorResponse.js, src/server/routes/doesAccountExist.js, src/server/routes/.register.js, src/server/routes/backoffice/login.js

- [done] TASK: Add health check endpoint
  - Acceptance: GET /health returns { ok: true, timestamp: ISO string } with 200 status; endpoint does not require authentication; added to src/server/routes/health.js and loaded via loadRoutes.
  - Files: src/server/routes/health.js, src/server/app.js (or ensure route auto-loads)

- [done] TASK: Fix backoffice/login.js account‑existence check
  - Acceptance: Replace doesAccountExist call with doesAccountExistByUsername; remove email parameter; ensure route still validates username/password correctly; keep error responses consistent.
  - Files: src/server/routes/backoffice/login.js

- [done] TASK: Add info logging utility
  - Acceptance: Create logInfo function in logError.js (or separate file) that logs context without error object; update requestLogger to use logInfo; ensure semaphore usage maintained; logs retain same format except err object omitted or null.
  - Files: src/server/utility/logError.js, src/server/utility/requestLogger.js

- [done] TASK: Add request validation middleware
  - Acceptance: Create validateRequest middleware that validates email, username, password using regex from config; apply to at least two existing routes (register, login) to reduce duplication; middleware returns appropriate error response via errorResponse utility.
  - Files: src/server/utility/validateRequest.js, src/server/routes/.register.js, src/server/routes/backoffice/login.js

  
---

- [done] TASK: Fix dbProxy timeout memory leak
  - Acceptance: dbCommandWithTimeout cleans up pendingMap entry on timeout; subsequent child response for same id is ignored; no memory leak.
  - Files: src/server/db/dbProxy.js


- [done] TASK: Add security headers middleware
  - Acceptance: Middleware sets X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection: 1; mode=block. Integrated into src/server/app.js after requestLogger.
  - Files: src/server/utility/securityHeaders.js, src/server/app.js


- [done] TASK: Add request ID middleware
  - Acceptance: Middleware adds a unique request ID (UUID v4 or timestamp+random) to each request, attaches it to req.id and includes it in response headers (X-Request-ID); requestLogger includes requestId in log context.
  - Files: src/server/utility/requestId.js, src/server/app.js, src/server/utility/requestLogger.js


- [done] TASK: Rename backoffice/login.js to backoffice/register.js
  - Acceptance: File renamed, route path changed from /backoffice/login to /backoffice/register; import statements updated where referenced; no change in functionality.
  - Files: src/server/routes/backoffice/login.js, src/server/routes/backoffice/register.js (new), src/server/app.js (if any direct reference), src/server/utility/loadRoutes.js (if path mapping needed)


- [done] TASK: Add setup validation for existing data directories
  - Acceptance: In setup.js, check if data/ and log/ directories exist; create them if missing with appropriate permissions; log action to console.
  - Files: src/server/setup.js



---

- [done] TASK: Add rate‑limiting middleware for auth endpoints
  - Acceptance: Middleware limits /backoffice/login (or /backoffice/register) and /register to 5 requests per minute per IP; uses simple in‑memory store; returns 429 with error response.
  - Files: src/server/utility/rateLimit.js, src/server/app.js (or apply per‑route)




---

- [done] TASK: Add success response utility
  - Acceptance: Create sendSuccess function in errorResponse.js (or separate) that returns { ok: true, data?: ... } with optional data; update health endpoint to use it; at least one other success response (e.g., doesAccountExist) updated.
  - Files: src/server/utility/errorResponse.js, src/server/routes/health.js, src/server/routes/doesAccountExist.js





---

- [done] TASK: Add smoke test script
  - Acceptance: Create src/scripts/test-smoke.js that starts server (or assumes running), requests /health, validates response shape and status, logs result, exits with code 0 on success, 1 on failure; script can be run with node.
  - Files: src/scripts/test-smoke.js






---

- [done] TASK: Add periodic cleanup to rate limiting middleware
  - Acceptance: Add a setInterval (or similar) that runs every hour and removes entries older than windowMs from the rate‑limit store; ensure cleanup does not block the event loop; log cleanup activity in development mode.
  - Files: src/server/utility/rateLimit.js







---

- [done] TASK: Add Content‑Security‑Policy header
  - Acceptance: Extend securityHeaders middleware to include a basic Content‑Security‑Policy header that restricts script sources to 'self' and disables inline scripts; header value: "default‑src 'self'; script‑src 'self'; style‑src 'self';".
  - Files: src/server/utility/securityHeaders.js








---

- [done] TASK: Add login endpoint
  - Acceptance: Create a POST /login route that accepts username/email and password, verifies against stored hash, returns a session token or sets a cookie, and redirects to / on success; returns 401 on invalid credentials.
  - Files: src/server/routes/login.js, src/server/app.js (or loadRoutes), src/server/utility/validateRequest.js (if validation needed)









---

- [done] TASK: Make smoke test respect PORT environment variable
  - Acceptance: Update src/scripts/test-smoke.js to read process.env.PORT and default to 3333; use that port in HEALTH_URL; ensure the script still exits with appropriate codes.
  - Files: src/scripts/test-smoke.js










---

- [done] TASK: Make health endpoint backward compatible
  - Acceptance: Modify health endpoint to optionally return the previous shape { ok: true, timestamp } (without nested data) when a query parameter like ?legacy=true is present; default remains { ok: true, data: { timestamp } }.
  - Files: src/server/routes/health.js









---

- [done] TASK: Apply rate limiting to login endpoint
  - Acceptance: Apply existing rateLimit middleware to POST /login route; update app.js (or loadRoutes) to include rateLimit for /login.
  - Files: src/server/app.js










---

- [done] TASK: Use project regex constants in login validation
  - Acceptance: Replace hard‑coded email and username regex patterns in src/server/routes/login.js with imported EMAIL_REGEX and USERNAME_REGEX from config.js.
  - Files: src/server/routes/login.js











---

- [done] TASK: Reuse validateRequest middleware in login endpoint
  - Acceptance: Replace manual email/username validation in src/server/routes/login.js with validateRequest(['username', 'password']) or validateRequest(['email', 'password']).
  - Files: src/server/routes/login.js











