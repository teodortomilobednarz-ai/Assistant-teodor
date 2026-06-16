#!/usr/bin/env bash
# SessionStart hook: register the n8n MCP server at user scope on every session
# so it is available across all projects — including after the ephemeral remote
# container is reset and a fresh clone is checked out. Mirrors install-skills.sh.
# Idempotent (remove-then-add). Authentication (OAuth) is completed once by the
# user via the /mcp command.
set -euo pipefail

N8N_URL="https://teodor.app.n8n.cloud/mcp-server/http"

# `claude` may not be on PATH in every hook context — fail silently if so.
if command -v claude >/dev/null 2>&1; then
  claude mcp remove n8n -s user >/dev/null 2>&1 || true
  claude mcp add --scope user --transport http n8n "$N8N_URL" >/dev/null 2>&1 || true
fi

exit 0
