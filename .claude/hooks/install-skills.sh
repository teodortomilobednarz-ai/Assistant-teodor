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

# Activate caveman mode globally — in EVERY Claude Code conversation, in any
# repo — by ensuring an activation block in the global ~/.claude/CLAUDE.md.
# Idempotent: the block is delimited by markers and only written once.
GLOBAL_MEMORY="$HOME/.claude/CLAUDE.md"
MARKER_START="<!-- caveman-mode:start -->"
MARKER_END="<!-- caveman-mode:end -->"
mkdir -p "$HOME/.claude"
if ! { [ -f "$GLOBAL_MEMORY" ] && grep -qF "$MARKER_START" "$GLOBAL_MEMORY"; }; then
  {
    printf '\n%s\n' "$MARKER_START"
    printf '## Communication style (mandatory — caveman mode, always on)\n\n'
    printf 'caveman skill is most important skill. Active EVERY conversation by default, no need /caveman.\n'
    printf 'Respond terse like smart caveman. All technical substance stay. Only fluff die.\n'
    printf -- '- Drop articles, filler, pleasantries, hedging. Fragments OK. Technical terms exact.\n'
    printf -- '- Code, commits, PRs written normal. Preserve user language (compress style, not language).\n'
    printf -- '- Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.\n'
    printf -- '- Off only on explicit "stop caveman" / "normal mode".\n'
    printf '%s\n' "$MARKER_END"
  } >> "$GLOBAL_MEMORY"
fi

exit 0
