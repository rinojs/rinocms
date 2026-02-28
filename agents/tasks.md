# Tasks

- [done] TASK: Add periodic cleanup to rate limiting middleware
  - Acceptance: Add a setInterval (or similar) that runs every hour and removes entries older than windowMs from the rate‑limit store; ensure cleanup does not block the event loop; log cleanup activity in development mode.
  - Files: src/server/utility/rateLimit.js





- [todo] TASK: Add Content‑Security‑Policy header
  - Acceptance: Extend securityHeaders middleware to include a basic Content‑Security‑Policy header that restricts script sources to 'self' and disables inline scripts; header value: "default‑src 'self'; script‑src 'self'; style‑src 'self';".
  - Files: src/server/utility/securityHeaders.js





- [todo] TASK: Add login endpoint
  - Acceptance: Create a POST /login route that accepts username/email and password, verifies against stored hash, returns a session token or sets a cookie, and redirects to / on success; returns 401 on invalid credentials.
  - Files: src/server/routes/login.js, src/server/app.js (or loadRoutes), src/server/utility/validateRequest.js (if validation needed)





- [todo] TASK: Make smoke test respect PORT environment variable
  - Acceptance: Update src/scripts/test-smoke.js to read process.env.PORT and default to 3333; use that port in HEALTH_URL; ensure the script still exits with appropriate codes.
  - Files: src/scripts/test-smoke.js





- [todo] TASK: Make health endpoint backward compatible
  - Acceptance: Modify health endpoint to optionally return the previous shape { ok: true, timestamp } (without nested data) when a query parameter like ?legacy=true is present; default remains { ok: true, data: { timestamp } }.
  - Files: src/server/routes/health.js

