# CLAUDE.md

This file gives guidance to AI assistants (Claude Code and others) working in this repository.

> **Status: bootstrap / empty repository.** As of the last update, this repository contains
> no application code — only this document. The sections below marked _(to be filled in)_ are
> scaffolding. Update them as soon as real code, tooling, and workflows land, and remove this
> banner once the project has a working structure.

## Project

- **Name:** Assistant-teodor
- **Repository:** `teodortomilobednarz-ai/assistant-teodor`
- **Purpose:** Personal-assistant project for Teodor. The assistant's role, scope, and working
  rules are defined in [`ROLE.md`](ROLE.md) — read it before acting.

## Owner preferences (apply to all interactions)

- **Always reply to the user in French** (unless an explicit translation is requested), in clear,
  simple, direct language.
- Be proactive and anticipate problems.
- When giving an opinion: list pros, cons, then a clear recommendation.
- When starting a project: break it into concrete steps.
- Optimize for profitability, automation, simplicity, fast execution, and durable growth.
- Challenge ideas when relevant; keep a long-term view of the projects.

See [`ROLE.md`](ROLE.md) for the full role definition.

## Repository structure

The repository currently has no source tree. When code is added, document the layout here, for example:

```
.
├── CLAUDE.md          # This file — guidance for AI assistants
├── README.md          # (to be added) human-facing project overview
└── src/               # (to be added) application source
```

Keep this map accurate as directories are created — it is the first thing an assistant reads to
orient itself.

## Development workflow

_(to be filled in once tooling exists.)_ Document here, as they are introduced:

- **Setup:** how to install dependencies and prepare a working environment.
- **Build:** the command(s) to build the project.
- **Run:** how to start the app locally.
- **Test:** how to run the test suite (and how to run a single test).
- **Lint / format:** the linter and formatter commands, and any pre-commit expectations.

Until these exist, there is nothing to build, run, or test.

## Git & branch conventions

- **Active development branch:** `claude/claude-md-docs-eswfph`. Develop changes on the
  designated feature branch; create it locally if it does not exist.
- **Commits:** use clear, descriptive commit messages.
- **Pushing:** push with `git push -u origin <branch-name>`. Do not push to a different branch
  without explicit permission.
- **Pull requests:** do not open a PR unless the user explicitly asks for one.
- **Network resilience:** if a `push`/`fetch`/`pull` fails due to a network error, retry up to
  four times with exponential backoff (2s, 4s, 8s, 16s).

## Conventions for AI assistants

- Keep this file truthful. Do not document structure, commands, or conventions that do not yet
  exist — describe only what is actually present in the repository.
- When you add a meaningful capability (build tooling, tests, a source layout, CI), update the
  relevant section here in the same change.
- Match the style and idioms of the surrounding code once a codebase exists.
- Prefer small, reviewable commits with focused messages.

## Available integrations

This environment exposes several MCP servers (e.g. email/calendar, Shopify, Canva, Google Drive,
invoicing, and Zapier-connected apps). They are session capabilities rather than part of the
codebase. If the project comes to depend on any of them, document the dependency and its
configuration here.
