# Tasks

- [done] TASK: Add smoke test script
  - Acceptance: Create src/scripts/test-smoke.js that starts server (or assumes running), requests /health, validates response shape and status, logs result, exits with code 0 on success, 1 on failure; script can be run with node.
  - Files: src/scripts/test-smoke.js




- [todo] TASK: Add periodic cleanup to rate limiting middleware
  - Acceptance: Add a setInterval (or similar) that runs every hour and removes entries older than windowMs from the rate‑limit store; ensure cleanup does not block the event loop; log cleanup activity in development mode.
  - Files: src/server/utility/rateLimit.js




- [todo] TASK: Add Content‑Security‑Policy header
  - Acceptance: Extend securityHeaders middleware to include a basic Content‑Security‑Policy header that restricts script sources to 'self' and disables inline scripts; header value: "default‑src 'self'; script‑src 'self'; style‑src 'self';".
  - Files: src/server/utility/securityHeaders.js



