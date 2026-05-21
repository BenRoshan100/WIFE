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

### [2026-05-21] — WIFE — Task 1: Next.js scaffold + git init
- **Shipped:** Next.js 16.2.6 scaffolded in `d:\ACADEMIC\GenAI Projects\WIFE`. Dependencies installed: `framer-motion`, `@anthropic-ai/sdk`, `@testing-library/react`, `@testing-library/jest-dom`. `.env.local` created (gitignored). Git repo initialized, initial commit `1e9fbb1`. `npm run build` passes clean — 2 static routes (`/`, `/_not-found`).
- **Discovered:** `create-next-app` rejects uppercase directory names (npm naming restriction). Workaround: scaffold into temp `wife-app` dir then copy files across. Next.js version resolved to 16.2.6 (not 14 as specced — latest stable). Build tool is Turbopack.
- **Blockers:** None.
- **Next:** Implement `lib/classify.ts`, `lib/messages.ts`, `lib/sessionEngine.ts`, then UI components.

---

### [2026-05-21] — WIFE — Task 1 spec gap fixes
- **Shipped:** Jest configured — installed `jest@30`, `jest-environment-jsdom`, `@types/jest`. Created `jest.config.ts` (uses `next/jest.js` wrapper, `testEnvironment: jsdom`, `setupFilesAfterEnv`). Created `jest.setup.ts` (imports `@testing-library/jest-dom`). Added `"test": "jest"` to `package.json`. Docs updated: all references to "Next.js 14" changed to "Next.js 16" in `architecture.md` and `decisions.md`.
- **Discovered:** The correct Jest config key for post-framework setup files is `setupFilesAfterEnv` (not `setupFilesAfterFramework` or any other variant). Confirmed from `@jest/types` source. Next.js 16 vs 14 is a non-issue — fully equivalent for this client-side project.
- **Blockers:** None.
- **Next:** Implement `lib/classify.ts`, `lib/messages.ts`, `lib/sessionEngine.ts`, then UI components.

---

### [2026-05-21] — WIFE — PRD ingestion + workstation setup
- **Shipped:** `docs/architecture.md`, `docs/decisions.md`, `docs/api-spec.md` fully populated from PRD v1.1. `memory-decisions.md` updated with 5 WIFE-specific decisions.
- **Discovered:** WIFE deployment goes to Vercel (not Railway) — exception to global Railway preference because it's a pure Next.js client-side app. Claude Haiku is the right model for post-MVP API integration (low latency, short outputs).
- **Blockers:** None — PRD is fully specced and approved. Ready to build.
- **Next:** Start implementation — scaffold Next.js 14 project, implement `lib/classify.ts` + `lib/messages.ts` first, then `lib/sessionEngine.ts`, then UI components.

---

### [2026-05-21] — WIFE — Task 3: TDD classifier implementation
- **Shipped:** `__tests__/classify.test.ts` (9 test cases covering 8 topics + edge cases) and `lib/classify.ts` (keyword-based regex classifier). All tests passing: food, time, location, plans, money, phone, vague, generic + case-insensitive checks. Commit: `2bad3fd`.
- **Discovered:** Regex order matters — location and plans keywords needed to be checked before time keywords to avoid conflicts (e.g., "when are you coming home" should match location, not time). Removed "still", "there", "here" from the common keyword pools to reduce ambiguity; "still" added to time-specific to catch "are you still there" correctly.
- **Blockers:** None.
- **Next:** Implement `lib/messages.ts` (topic-specific + universal message pools across 6 phases).

---

### [2026-05-21] — WIFE — Task 4: Scripted message pools
- **Shipped:** `lib/messages.ts` with complete message pools: `topicMessages` (8 topics × 3 phases = 24 phase-specific arrays), `universalMessages` (phases 4–6), `apologyResponses` (7 responses), `summaryData` (damage caused, core issue per topic, relationship status). Total: 220 lines. TypeScript validation passed. Commit: `cb467e0`.
- **Discovered:** No new discoveries — this is pure data transcription from PRD spec. All string interpolations (`{userMessage}`) are present and correctly placed in vague/generic pools.
- **Blockers:** None.
- **Next:** Implement `lib/sessionEngine.ts` (phase sequencer, delay randomizer, state machine).

---

### [2026-05-21] — WIFE — Task 7: Claude Haiku API route
- **Shipped:** `app/api/chat/route.ts` — server-side Next.js route handler (`POST /api/chat`). Accepts `{phase, topic, userMessage}`, builds WIFE system prompt with interpolated phase + userMessage, calls `claude-haiku-4-5-20251001` via Anthropic SDK, returns `{message}`. Input validation (400 on missing fields), SDK error handling (500). `__tests__/chat-route.test.ts` — 7 tests, all passing. Full suite: 35/35. Commit: `174abf1`.
- **Discovered:** Jest 30 renamed `--testPathPattern` to `--testPathPatterns` (plural). The `@jest-environment node` docblock override works correctly per-file with `next/jest.js` wrapper — no global config change needed. `app/api/` directory must exist before writing `route.ts`; `mkdir -p` via bash works for nested creation on Windows.
- **Blockers:** None.
- **Next:** UI components — `ChatBubble.tsx`, `TypingIndicator.tsx`, `SorryButton.tsx`, `SummaryCard.tsx`.

---

### [2026-05-21] — WIFE — Task 10: Main chat page orchestration
- **Shipped:** `app/page.tsx` fully replaced with complete chat orchestration. Wires together classify → initSession → getNextMessage loop → SorryButton → apologyResponses → generateSummary → SummaryCard. State machine: idle → streaming → done → resolved. Typing indicator shown per message with randomized delays. Start over resets all state. `npx tsc --noEmit` clean, `npm run build` clean (3 routes), all 35 tests pass. Commit: `86a6c32`.
- **Discovered:** `useFallback` ref not needed as a ref — simple `let` variable inside `handleSend` async function is sufficient since it's local to the call scope. No cross-render sharing required.
- **Blockers:** None.
- **Next:** Vercel deployment — `vercel --prod` or push to GitHub for auto-deploy.
