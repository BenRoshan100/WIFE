# Technical Decisions — WIFE

## Decision log

| Date | Decision | Rationale | Status |
|------|----------|-----------|--------|
| 2026-05 | No backend for MVP | Eliminates infra cost, cold starts, API key exposure. All logic client-side. | Active |
| 2026-05 | Next.js 14 App Router | Single route `/`, SSR not needed but ecosystem familiarity + Vercel deploy | Active |
| 2026-05 | Regex classifier (not LLM) | Instant, deterministic, no latency, no API cost. Accuracy sufficient for 8 topic buckets | Active |
| 2026-05 | Framer Motion for all animation | Typing indicator, message entry stagger, button fade, summary card — all specced | Active |
| 2026-05 | Tailwind + CSS variables | Design tokens (colors, fonts) via CSS vars; Tailwind for layout/spacing | Active |
| 2026-05 | No external state library | `useState`/`useReducer` sufficient for single-session, no persistence needed | Active |
| 2026-05 | Vercel deployment | Native Next.js deployment, instant, free tier sufficient for portfolio project | Active |
| 2026-05 | 12–17 message range | Enough for full 6-phase arc without overstaying the joke | Active |
| 2026-05 | {userMessage} truncation at 40 chars | Prevents interpolated lines from breaking bubble layout on mobile | Active |

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Real LLM for MVP | Adds latency, cost, API key management, and hallucination risk for a comedy app that works fine scripted |
| Landing page | Discovery via use is the joke — a landing page explains the punchline before delivery |
| External state (Zustand/Redux) | Single session, no persistence, no cross-component complexity — overkill |
| Railway deployment | Vercel is better for pure Next.js; Railway reserved for FastAPI/backend projects |
| Multiple accent colors | PRD explicitly prohibits — premium feel requires restraint |
| Meme/loud aesthetic | Humor must come from writing, not design — premium sitcom tone |
| localStorage persistence | Session-scoped only is the product constraint — history would kill the bit |
