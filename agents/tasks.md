# Tasks

- [done] TASK: Add request logging middleware
  - Acceptance: Each HTTP request is logged with method, path, status code, and response time. Logs are written to server.log using the existing logError utility (call logError with null error and context containing method, path, status, durationMs). Middleware must acquire global.ioSemaphore before calling logError and release after to respect IO concurrency limits. Middleware is integrated into src/server/app.js before route handlers.
  - Files: src/server/utility/requestLogger.js, src/server/app.js

- [todo] TASK: Create standard error response utility
  - Acceptance: A new utility function provides consistent error JSON format across all routes; at least three existing route files updated to use it; error responses include ok:false, error message, and optional code.
  - Files: src/server/utility/errorResponse.js, src/server/routes/doesAccountExist.js, src/server/routes/.register.js, src/server/routes/backoffice/login.js

- [todo] TASK: Add health check endpoint
  - Acceptance: GET /health returns { ok: true, timestamp: ISO string } with 200 status; endpoint does not require authentication; added to src/server/routes/health.js and loaded via loadRoutes.
  - Files: src/server/routes/health.js, src/server/app.js (or ensure route auto-loads)