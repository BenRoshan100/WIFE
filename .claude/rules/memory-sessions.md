# memory-sessions.md
# Rolling session log — append after each substantive session

## Format for new entries
### [YYYY-MM-DD] — [Project] — [What happened]
- **Shipped:** What was completed
- **Discovered:** Non-obvious learning, bug, or workaround
- **Blockers:** What's stuck and why
- **Next:** Immediate next action

---

## [SESSION LOG STARTS HERE — Claude appends as sessions complete]

### [2026-05-21] — WIFE — PRD ingestion + workstation setup
- **Shipped:** `docs/architecture.md`, `docs/decisions.md`, `docs/api-spec.md` fully populated from PRD v1.1. `memory-decisions.md` updated with 5 WIFE-specific decisions.
- **Discovered:** WIFE deployment goes to Vercel (not Railway) — exception to global Railway preference because it's a pure Next.js client-side app. Claude Haiku is the right model for post-MVP API integration (low latency, short outputs).
- **Blockers:** None — PRD is fully specced and approved. Ready to build.
- **Next:** Start implementation — scaffold Next.js 14 project, implement `lib/classify.ts` + `lib/messages.ts` first, then `lib/sessionEngine.ts`, then UI components.
