# Tasks

- [done] TASK: Make smoke test respect PORT environment variable
  - Acceptance: Update src/scripts/test-smoke.js to read process.env.PORT and default to 3333; use that port in HEALTH_URL; ensure the script still exits with appropriate codes.
  - Files: src/scripts/test-smoke.js








- [todo] TASK: Make health endpoint backward compatible
  - Acceptance: Modify health endpoint to optionally return the previous shape { ok: true, timestamp } (without nested data) when a query parameter like ?legacy=true is present; default remains { ok: true, data: { timestamp } }.
  - Files: src/server/routes/health.js






- [todo] TASK: Apply rate limiting to login endpoint
  - Acceptance: Apply existing rateLimit middleware to POST /login route; update app.js (or loadRoutes) to include rateLimit for /login.
  - Files: src/server/app.js






- [todo] TASK: Use project regex constants in login validation
  - Acceptance: Replace hard‑coded email and username regex patterns in src/server/routes/login.js with imported EMAIL_REGEX and USERNAME_REGEX from config.js.
  - Files: src/server/routes/login.js






- [todo] TASK: Reuse validateRequest middleware in login endpoint
  - Acceptance: Replace manual email/username validation in src/server/routes/login.js with validateRequest(['username', 'password']) or validateRequest(['email', 'password']).
  - Files: src/server/routes/login.js



