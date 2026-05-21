# memory-decisions.md
# Technical and architectural decisions — add with date when made

## Format for new entries
### [YYYY-MM-DD] — [Project] — [Decision title]
- **Decision:** What was decided
- **Rationale:** Why
- **Trade-off:** What was given up
- **Status:** Active / Superseded

---

## Existing decisions

### [2026-05] — Global — Deployment platform
- **Decision:** Use Railway for portfolio project deployments (not Render)
- **Rationale:** Railway has better cold-start behaviour and simpler env var management
- **Trade-off:** Slightly less free tier headroom than Render
- **Status:** Active

### [2026-05] — Global — Claude Code memory architecture
- **Decision:** Split memory into 4 files under .claude/rules/ (profile, preferences, decisions, sessions)
- **Rationale:** Keeps CLAUDE.md under 200 lines; each file is auto-loaded and independently updatable
- **Trade-off:** More files to manage vs single CLAUDE.md knowledge dump
- **Status:** Active

### [2026-05] — Global — Portfolio stack
- **Decision:** VerdictAI (existing) → PropensityAPI → FinRAG → DataMCP → UnderwriteAI → MemoryOS
- **Rationale:** Covers all GenAI topics systematically; each project covers distinct skill gap
- **Trade-off:** Long roadmap; first 2 projects must ship before applications go live
- **Status:** Active

### [2026-05-21] — WIFE — No backend for MVP
- **Decision:** All message logic runs client-side. No API calls, no server.
- **Rationale:** Eliminates infra cost, cold starts, API key exposure. Comedy timing must be instant — latency would kill the joke.
- **Trade-off:** Scripted responses, finite pool, repeats after multiple sessions
- **Status:** Active

### [2026-05-21] — WIFE — Regex classifier (not LLM) for topic detection
- **Decision:** 8-topic keyword classifier (`food`, `time`, `location`, `plans`, `money`, `phone`, `vague`, `generic`) via regex
- **Rationale:** Instant, deterministic, no cost. Accuracy sufficient — misclassification falls to `generic` which still works
- **Trade-off:** Nuanced messages may misclassify; no semantic understanding
- **Status:** Active

### [2026-05-21] — WIFE — Vercel deployment (not Railway)
- **Decision:** Deploy WIFE to Vercel, not Railway
- **Rationale:** Pure Next.js static/client app — Vercel is native. Railway reserved for FastAPI/backend projects.
- **Trade-off:** Overrides global Railway preference for this specific project type
- **Status:** Active

### [2026-05-21] — WIFE — Single route, no landing page
- **Decision:** App opens directly to chat at `/`. No landing page, no CTA, no explanation.
- **Rationale:** Discovery via use IS the joke. Explaining the punchline kills it.
- **Trade-off:** Zero onboarding — users may be confused on first visit (intentional)
- **Status:** Active

### [2026-05-21] — WIFE — Post-MVP Claude API integration path pre-specced
- **Decision:** `sessionEngine.ts` interface designed so MVP scripted pool can be swapped for Claude API call with no structural change
- **Rationale:** Ships MVP fast; upgrade path is clean. System prompt + phase context already written in PRD §8.
- **Trade-off:** Some interface over-engineering relative to pure MVP needs
- **Status:** Active

## [ADD NEW DECISIONS HERE WITH DATE AND PROJECT]
