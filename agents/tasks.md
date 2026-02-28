# Tasks

- [done] TASK: Reuse validateRequest middleware in login endpoint
  - Acceptance: Replace manual email/username validation in src/server/routes/login.js with validateRequest(['username', 'password']) or validateRequest(['email', 'password']).
  - Files: src/server/routes/login.js










- [todo] TASK: Implement secure session token generation and storage
  - Acceptance: Replace simple token generation with crypto.randomBytes(32).toString('hex'); store session in 'session' database (crumbdb) with token, userId, createdAt, expiresAt (24h); update login endpoint to store session; create helper function to verify token and retrieve userId.
  - Files: src/server/routes/login.js, src/server/db/session.js (new), src/server/utility/session.js (new)










- [todo] TASK: Add logout endpoint
  - Acceptance: Create POST /logout route that clears session cookie, removes session from storage (if stored), and redirects to /.
  - Files: src/server/routes/logout.js










- [todo] TASK: Add session validation middleware
  - Acceptance: Create middleware that reads session cookie, validates token against session storage, attaches userId to req, and calls next(); returns 401 if invalid.
  - Files: src/server/utility/sessionMiddleware.js



