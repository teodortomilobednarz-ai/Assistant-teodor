#!/usr/bin/env bash
# SessionStart hook: install the bundled skills committed in this repo's
# .claude/skills/ into the global ~/.claude/skills/ directory so they are
# available in every conversation — including after the ephemeral remote
# container is reset and a fresh clone is checked out.
set -euo pipefail

# Resolve .claude/skills relative to this script (independent of cwd).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_SKILLS="$(cd "$SCRIPT_DIR/.." && pwd)/skills"
DEST="$HOME/.claude/skills"

mkdir -p "$DEST"

if [ -d "$REPO_SKILLS" ]; then
  for d in "$REPO_SKILLS"/*/; do
    [ -d "$d" ] || continue
    name="$(basename "$d")"
    rm -rf "$DEST/$name"
    cp -R "$d" "$DEST/$name"
  done
fi

exit 0
