# AGENTS.md

## RinoCMS Project Definition

RinoCMS is a content management system built with:
- rino.js (frontend rendering system)
- express.js (server backend)
- crumbdb.js (file-based database)

Core goals:
1. Authentication
   - Login / Signup
   - Default role on registration
   - Role assignment & management

2. Backoffice (Admin only)
   - Content writing (Toast UI Editor)
   - Manage content, comments, settings
   - Manage user roles

3. Public CMS features
   - Content publishing
   - Comment system
   - Bulletin board / forum system
   - Role-based read/write per section

Architecture must remain incremental and stable.
No major refactors or new dependencies unless explicitly required by an existing task.

## Repository Scope Rules

- Work only in this repo.
- Prefer editing `src/**` only.
- Do not manually edit generated output in `serve/**`.
- Treat `data/**` as production-like: never delete/rename/mass-edit.

## Task Discipline

- Always work on exactly ONE task from `agents/tasks.md`.
- Status flow: `todo -> doing -> done`.
- If any `[doing]` task exists, do NOT start another task.
- Do not create any new `[todo]` task if there are more than 3 `[todo]` tasks.

### agents/tasks.md format
```
# Tasks

- [todo] TASK: ...
  - Acceptance: ...
  - Files: ...
```
Task statuses must be one of: `todo`, `doing`, `done`.


## Git Rules
- Never force push.
- Never delete branches.
- Never reset/rebase.
- Only commit staged changes.

## Commit Format
- Title: `TASK: <task title>`
- Body: include what changed.

## Reference docs (read only if necessary)
- If Rino.js knowledge is required, read `./agents/refs/rinojs.md`.
- If CrumbDB knowledge is required, read `./agents/refs/crumbdbjs.md`.
- Do NOT read reference files unless needed for the current task.

