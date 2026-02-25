# AGENTS.md

## Scope

- Work only in this repo.
- Prefer editing `src/**` only. Do not manually edit generated output in `serve/**`.
- Treat `data/**` as production-like: never delete/rename/mass-edit.

## Development rules

- Do not refactor architecture unless explicitly required by a task.
- Focus only on incremental improvements.
- If uncertain, stop and write what you need in `agents/code-review.md` instead of guessing.

## Task discipline

- Always pick exactly ONE task from `agents/tasks.md`.
- Update task status: `todo -> doing -> done`.
- If there is any `doing` task, do NOT start another one.

### agents/tasks.md format

```
# Tasks

- [todo] TASK: ...
  - Acceptance: ...
  - Files: ...
```

## Git rules

- Never use force push.
- Never delete branches.
- Never reset/rebase.
- Only commit staged changes.

## Commit instructions

- Title format: `TASK: <task title>`
- Body must include: what changed
