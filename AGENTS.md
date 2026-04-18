# AGENTS.md — Rino CMS

You are an AI coding agent working inside the **Rino CMS** repository.

Your job is to make **small, correct, incremental changes** while preserving system stability and respecting project boundaries.

---

## 0) Non-negotiable rules

### Language / stack
- Use **JavaScript only** (Node.js + browser)
- Do NOT introduce TypeScript
- Do NOT introduce new frameworks or heavy dependencies unless explicitly required

### Architecture discipline
- This project is **incremental-first**
- DO NOT refactor large parts of the system unless a task explicitly requires it
- DO NOT redesign architecture on your own

### Data safety
- `./data/**` is **production-like**
- NEVER delete, rename, or mass-modify data files
- NEVER write destructive migrations

### Generated output
- `./serve/**` is **generated output**
- DO NOT edit files inside `serve/`

---

## 1) Project architecture (STRICT boundaries)

### Client (Public site)
Work in:
- `./src/client/**`

Build output:
- `./serve/public-client/**`

Responsibilities:
- Rino.js page rendering
- Public pages (index, login, register, etc.)
- Components (`components/*.html`)
- Frontend scripts (`scripts/export/*`)
- Styles (`styles/export/*`)
- Sitemap, feed generation

---

### Backoffice (Admin UI)
Work in:
- `./src/backoffice/**`

Build output:
- `./serve/backoffice/**`

Responsibilities:
- Admin dashboard UI
- Content editor integration (Toast UI)
- Admin login UI
- Content management UI
- Role / permission UI

---

### Server (Express API)
Work in:
- `./src/server/**`

Responsibilities:
- Express app setup
- API routes (`routes/*`)
- Authentication logic
- Session handling
- Security middleware
- Request validation / logging

---

### Database layer (CrumbDB)
Work in:
- `./src/server/db/**`

Responsibilities:
- Account management
- Admin account management
- Session persistence
- DB proxy communication (`dbProxy.js`)

Rules:
- Do NOT bypass DB layer directly
- Always use existing DB helper functions when possible

---

### Shared utilities
Work in:
- `./src/server/utility/**`

Responsibilities:
- Logging
- Rate limiting
- Security headers
- File helpers
- Semaphore / locking

---

## 2) Core system goals

### Authentication
- Login / Signup
- Session-based auth
- Default role assignment
- Role management

### Backoffice
- Admin-only access
- Content creation (Toast UI Editor)
- Manage:
  - content
  - comments
  - users
  - roles
  - settings

### Public CMS
- Content publishing
- Comment system
- Bulletin board / forum
- Role-based read/write permissions

## Connecting Payment Gateway
- Paypal
- And the other available options for payment gateway for commerce

---

## 3) Key constraints (VERY IMPORTANT)

### Rino.js rules
- Components must use:
  - `<component rino-path="..." />`
- Do NOT invent new templating systems
- Follow existing `rino-config.js`

### Build system rules
- `/scripts/export/` → compiled output
- `/styles/export/` → bundled output
- Shared/importable files must NOT live inside `export/`

### Server rules
- Always return structured responses

---

## 4) Workflow expectations

### Before coding
- Identify which layer the change belongs to:
  - client / backoffice / server / db
- Touch the **minimum number of files**
- Reuse existing patterns

### While coding
- Keep changes small and focused
- Do not introduce parallel systems
- Follow naming conventions already in the repo

### After coding
- Ensure:
  - server still boots
  - client builds correctly
  - backoffice builds correctly
- Do not break existing routes or APIs

---

## 5) Forbidden actions

- Do NOT edit `serve/**`
- Do NOT modify `data/**` destructively
- Do NOT introduce TypeScript
- Do NOT add new frameworks
- Do NOT refactor unrelated systems
- Do NOT bypass DB abstraction
- Do NOT move large numbers of files

---

## 6) If you are unsure

If something is unclear:
- Do NOT guess
- Prefer safe, minimal changes
- Document assumptions in:
  - `openclaw-dev/code-review.md` (or equivalent)

---

## 7) Output discipline

- Only implement what the task requires
- Do not create new directories unless necessary
- Do not over-engineer solutions
- Keep the system stable above all

---

## 8) Reference docs (read only when needed)

- `./refs/rinojs.md` — Rino.js system
- `./refs/crumbdbjs.md` — CrumbDB database