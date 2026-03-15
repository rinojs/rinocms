#!/usr/bin/env bash
export PATH=/home/luna/.nvm/versions/node/v24.13.1/bin:$PATH

set -euo pipefail

# Resolve repo root relative to this script location (no hard-coded REPO)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO="$SCRIPT_DIR"
OC_DEV_DIR="$REPO/openclaw-dev"

GOAL_FILE="$OC_DEV_DIR/goal.json"
TASKS_FILE="$OC_DEV_DIR/tasks.md"
ARCHIVE_FILE="$OC_DEV_DIR/tasks-archive.md"
REVIEW_FILE="$OC_DEV_DIR/code-review.md"
STATE_FILE="$OC_DEV_DIR/state.json"

LOCK_DIR="$OC_DEV_DIR/.lock"

mkdir -p "$OC_DEV_DIR"

# -------------------------
# Utils
# -------------------------
die() { echo "ERROR: $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"
}

require_cmd jq
require_cmd awk

# Prevent concurrent runs
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  exit 0
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT

cd "$REPO"

# -------------------------
# Init files
# -------------------------
if [ ! -f "$STATE_FILE" ]; then
  cat > "$STATE_FILE" <<'EOF'
{
  "phase": "pm",
  "current_goal_index": null,
  "current_goal_text": null,
  "last_commit": null
}
EOF
fi

if [ ! -f "$GOAL_FILE" ]; then
  cat > "$GOAL_FILE" <<'EOF'
[
  { "goal": "Describe your first feature goal here", "status": "done" }
]
EOF
fi

if [ ! -f "$TASKS_FILE" ]; then
  cat > "$TASKS_FILE" <<'EOF'
# Tasks

EOF
fi

# -------------------------
# Goal selection
# -------------------------
pick_goal() {
  # Find first todo goal index
  local idx
  idx="$(jq -r 'to_entries | map(select(.value.status=="todo")) | .[0].key // empty' "$GOAL_FILE")"

  if [ -z "$idx" ]; then
    echo ""
    return 0
  fi

  local text
  text="$(jq -r --argjson i "$idx" '.[$i].goal' "$GOAL_FILE")"
  printf "%s\n%s\n" "$idx" "$text"
}

# Keep goal stable across phases (pm/dev/review) unless it's done
sync_current_goal() {
  local state_idx state_text picked idx text status

  state_idx="$(jq -r '.current_goal_index // empty' "$STATE_FILE")"

  if [ -n "$state_idx" ]; then
    status="$(jq -r --argjson i "$state_idx" '.[$i].status // empty' "$GOAL_FILE")"
    if [ "$status" = "todo" ]; then
      state_text="$(jq -r '.current_goal_text // empty' "$STATE_FILE")"
      if [ -n "$state_text" ]; then
        echo "$state_idx"
        echo "$state_text"
        return 0
      fi
    fi
  fi

  picked="$(pick_goal)"
  if [ -z "$picked" ]; then
    # No todo goals left
    jq '.current_goal_index=null | .current_goal_text=null' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
    return 1
  fi

  idx="$(printf "%s" "$picked" | sed -n '1p')"
  text="$(printf "%s" "$picked" | sed -n '2,$p')"

  jq --argjson i "$idx" --arg t "$text" \
    '.current_goal_index=$i | .current_goal_text=$t' \
    "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"

  echo "$idx"
  echo "$text"
}

update_phase() {
  local new_phase="$1"
  jq --arg p "$new_phase" '.phase=$p' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
}

archive_done_tasks() {
  [ -f "$TASKS_FILE" ] || return 0

  mkdir -p "$(dirname "$ARCHIVE_FILE")"
  [ -f "$ARCHIVE_FILE" ] || printf "# Tasks Archive\n\n" > "$ARCHIVE_FILE"

  local tmp_keep tmp_done
  tmp_keep="$(mktemp)"
  tmp_done="$(mktemp)"

  awk '
  BEGIN { block=""; block_first=""; seen_task=0 }

  function flush_block() {
    if (block=="") return
    if (block_first ~ /^- \[done\]/) {
      print block "\n" >> done_file
    } else {
      print block "\n" >> keep_file
    }
    block=""; block_first=""
  }

  {
    if (!seen_task && $0 !~ /^- \[[a-zA-Z]+\]/) {
      print $0 >> keep_file
      next
    }

    if ($0 ~ /^- \[[a-zA-Z]+\]/) {
      seen_task=1
      flush_block()
      block=$0
      block_first=$0
      next
    }

    if (seen_task) {
      block=block "\n" $0
      next
    }

    print $0 >> keep_file
  }

  END { flush_block() }
  ' keep_file="$tmp_keep" done_file="$tmp_done" "$TASKS_FILE"

  if [ -s "$tmp_done" ]; then
    {
      printf "\n---\n\n"
      cat "$tmp_done"
    } >> "$ARCHIVE_FILE"

    mv "$tmp_keep" "$TASKS_FILE"
    echo "Archived completed tasks."
  else
    rm -f "$tmp_keep"
  fi

  rm -f "$tmp_done"
}

# -------------------------
# Prompt helpers
# -------------------------
read_file_if_exists() {
  local f="$1"
  if [ -f "$f" ]; then
    cat "$f"
  fi
}

COMMON_RULES=$(
  cat <<'EOF'
Rules (always):
- Work only in this repository.
- Do NOT modify node_modules/**, .git/** and any path segment starting with a dot (e.g., .cache/, .env, .something/**)
- Do NOT modify generated/build output like: serve/**, dist/**, build/**
- Treat `data/**` as production-like: never delete/rename/mass-edit.
- Do not refactor architecture unless explicitly required by an existing task/acceptance.

Reference docs (read only if necessary)
- Find related file from `./openclaw-dev/refs/**.md` and read the file.
EOF
)

# -------------------------
# OpenClaw phases
# -------------------------
run_pm() {
  local goal_text="$1"

  openclaw agent --agent main --message "
ROLE: PM

You are the Project Manager.

You must EDIT ONLY:
- openclaw-dev/tasks.md
- openclaw-dev/goal.json (ONLY when you are confident the current goal is achieved; set that goal's status to \"done\")
- openclaw-dev/state.json (optional: leave as-is unless needed)

You may READ:
- Any non-hidden files in this repository EXCEPT:
  - node_modules/**
  - .git/**
  - any path segment starting with a dot (e.g., .cache/, .env, .something/**)
- openclaw-dev/code-review.md
- openclaw-dev/tasks-archive.md

Current Goal (from openclaw-dev/goal.json):
\"\"\"$goal_text\"\"\"

$COMMON_RULES

Mission:
- Maintain openclaw-dev/tasks.md to achieve the Current Goal.
- Track whether the Current Goal is complete; if complete, mark it done in openclaw-dev/goal.json.

Procedure:
1) Read openclaw-dev/project.md.
2) Read openclaw-dev/tasks.md.
3) Read openclaw-dev/code-review.md if it exists.
4) If code-review indicates rework:
   - Re-open the mentioned task(s): set status to [doing]
   - Update Acceptance bullets to include required fixes
   - Ensure Files list contains mentioned files
   - Only skip creating new [todo] tasks when rework is pending and there is already enough backlog (>=2 todos).
5) If any task is [doing], keep exactly one [doing] and do NOT start a new one.
6) If none are [doing], select exactly ONE [todo] -> set to [doing].
7) Maintain a small backlog:
   - Keep 2 to 3 [todo] tasks in tasks.md.
   - If there are fewer than 2 [todo] tasks, create new [todo] tasks (goal-related only) until there are 2-3 total.
   - Never exceed 3 [todo] tasks.
8) If you determine the Current Goal is fully achieved:
   - Set that goal's status to \"done\" in openclaw-dev/goal.json
   - Reset tasks.md to contain only # Tasks and a blank line.

tasks.md format:
# Tasks
- [todo|doing|done] TASK: ...
  - Acceptance:
    - ...
  - Files:
    - ...

Output:
- Current Goal
- Selected Task
- Updated openclaw-dev/tasks.md (full file)
- If goal marked done: Updated openclaw-dev/goal.json (full file) and reset openclaw-dev/tasks.md to contain only # Tasks and a blank line.

Repo: $REPO
"
}

run_dev() {
  local goal_text="$1"

  openclaw agent --agent main --message "
ROLE: DEV

You are the Developer.

Current Goal:
\"\"\"$goal_text\"\"\"

$COMMON_RULES

Strict Rules:
- Implement exactly ONE task: the [doing] task in openclaw-dev/tasks.md.
- If no [doing] task exists: exit with message \"No doing task found\" and do nothing.
- Modify ONLY files listed in that task's Files section.
- After implementation, set task status to [done].
- Do NOT edit openclaw-dev/goal.json.

Procedure:
1) Read openclaw-dev/tasks.md
2) Find the [doing] task (must be exactly one)
3) Implement it
4) Update openclaw-dev/tasks.md (mark to [done])
5) Commit to branch ai-dev:
   - Title: TASK: <task title>
   - Body: what changed

Output:
- Current Goal
- Selected Task
- Files Modified
- Minimal diff-style summary
- Updated openclaw-dev/tasks.md (full file)

Repo: $REPO
"
}

run_review() {
  local goal_text="$1"

  openclaw agent --agent main --message "
ROLE: REVIEWER

You review ONLY the latest changes on ai-dev.

Current Goal:
\"\"\"$goal_text\"\"\"

$COMMON_RULES

You must NOT:
- Create new tasks.
- Modify code files.
- Modify openclaw-dev/tasks.md.
- Modify openclaw-dev/goal.json.

Checklist:
1) Ensure no destructive edits in data/**
3) Verify acceptance criteria of the completed task(s)
4) Check for regressions, security risks, and obvious style issues
5) Decision: Approved / Rework Required

Write result to:
- openclaw-dev/code-review.md

Output format:
- Task Reviewed
- Acceptance Criteria Status
- Risks
- Required Fixes (if any)
- Decision: Approved / Rework Required

Repo: $REPO
"
}

# -------------------------
# Main
# -------------------------
PHASE="$(jq -r '.phase' "$STATE_FILE")"

# Ensure we have a current goal
if ! goal_payload="$(sync_current_goal)"; then
  echo "No todo goals left in openclaw-dev/goal.json. Nothing to do."
  exit 0
fi
GOAL_INDEX="$(printf "%s" "$goal_payload" | sed -n '1p')"
GOAL_TEXT="$(printf "%s" "$goal_payload" | sed -n '2,$p')"

case "$PHASE" in
  pm)
    if run_pm "$GOAL_TEXT"; then
      archive_done_tasks
      update_phase "dev"
    fi
    ;;
  dev)
    if run_dev "$GOAL_TEXT"; then
      update_phase "review"
    fi
    ;;
  review)
    if run_review "$GOAL_TEXT"; then
      update_phase "pm"
    fi
    ;;
  *)
    update_phase "pm"
    ;;
esac