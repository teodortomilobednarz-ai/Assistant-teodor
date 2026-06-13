# CLAUDE.md

This file gives guidance to AI assistants (Claude Code and others) working in this repository.

> **Status: Milestone 1 (foundation) built.** The repository contains a working Next.js
> application: Google sign-in (Auth.js), a PostgreSQL database (Prisma), a protected dashboard,
> and an AI text-analysis feature (Google Gemini) whose tasks and analyses are persisted per
> user. Gmail / Calendar / Drive integrations are planned for the next milestones.

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
- **Permission rule (mandatory):** before any action that **opens, sends, or pays** for
  something (sending an email/message, sharing a file, placing an order, making a payment,
  issuing an invoice, publishing, etc.), **ask the user for explicit approval first and wait
  for a clear answer.** Read-only actions (list, search, read) do not require approval.
- **Project direction:** build a **SaaS — an "AI copilot for SMEs"** (AI assistant for small-
  business owners / independents). It connects to the customer's **email, calendar, and
  documents**, and the AI **summarizes**, **drafts replies**, **creates tasks**, and **retrieves
  information**. AI engine: **Google Gemini** (free tier; chosen 2026-06-13 to keep costs at
  zero while building). The assistant writes the code; the owner pilots product/marketing/
  customers. (Direction locked 2026-06-13 — no more pivots.)
- **Coding rule (mandatory):** **always enter plan mode (`/plan`) before writing code** — present
  a plan, get explicit approval, then implement.

See [`ROLE.md`](ROLE.md) for the full role definition.

## Repository structure

```
.
├── app/
│   ├── page.tsx                   # Public landing page (sign-in)
│   ├── dashboard/                 # Protected area (auth guard in layout.tsx)
│   │   ├── page.tsx               # Copilot (text analysis)
│   │   └── tasks/page.tsx         # Persisted tasks
│   ├── api/analyze/route.ts       # Analyze endpoint (+ persistence)
│   ├── api/auth/[...nextauth]/    # Auth.js routes
│   └── layout.tsx · globals.css   # Root layout + design tokens
├── auth.ts                        # Auth.js (NextAuth v5) configuration
├── components/                    # UI: copilot/, auth/
├── lib/
│   ├── gemini.ts · copilot.ts     # AI engine (Gemini) + core logic
│   ├── prisma.ts                  # Prisma client singleton
│   ├── env.ts · schema.ts         # Validated env + Zod schemas
│   └── actions/                   # Server actions (auth, tasks)
├── prisma/schema.prisma           # Database models
├── types/next-auth.d.ts           # Session type augmentation
├── CLAUDE.md · ROLE.md · README.md
```

Keep this map accurate as the structure evolves — it is the first thing an assistant reads to
orient itself.

## Development workflow

- **Setup:** `npm install` (runs `prisma generate`). Copy `.env.example` to `.env.local` and fill
  in `GEMINI_API_KEY`, `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
- **Database:** `npm run db:push` to sync the schema; `npm run db:studio` to browse data.
- **Run:** `npm run dev` → <http://localhost:3000>.
- **Build:** `npm run build` (runs `prisma generate` then `next build`).
- **Checks before committing:** `npm run typecheck`, `npm run lint`, and `npm run build` should all
  pass. There is no automated test suite yet.

The AI provider is intentionally isolated in `lib/copilot.ts` + `lib/gemini.ts`, so the engine can
be swapped in one place.

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
