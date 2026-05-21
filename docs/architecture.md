# Architecture — WIFE

## Problem
Users want a satirical, premium-feel chat app where they send one message and receive an escalating passive-aggressive AI monologue until they apologize. The joke is the product — no utility, pure comedic tension.

## Architecture overview
Fully client-side Next.js 16 app. No backend for MVP. The phase engine runs in the browser: classifies the user's message, sequences topic-specific + universal message pools across 6 phases, simulates streaming with delays, and renders a summary card post-apology. Zero API calls in MVP.

## Component breakdown

| Component | Technology | Purpose |
|-----------|------------|---------|
| `app/page.tsx` | Next.js 16 App Router | Entry point — chat UI, no landing page |
| `components/ChatBubble.tsx` | React + Framer Motion | User and AI message bubbles |
| `components/TypingIndicator.tsx` | React + CSS animation | Three-dot pulsing indicator |
| `components/SummaryCard.tsx` | React + Framer Motion | Post-apology frosted glass card |
| `components/SorryButton.tsx` | React + Framer Motion | Single resolution affordance |
| `lib/classify.ts` | TypeScript | Keyword-based topic classifier (client-side) |
| `lib/messages.ts` | TypeScript | Full message pool per topic and phase |
| `lib/sessionEngine.ts` | TypeScript | Phase sequencer, delay scheduler, state machine |
| `lib/summaryGenerator.ts` | TypeScript | Summary card field generation |

## Data flow
1. User types message → hits send → input locks immediately
2. `classify(msg)` runs client-side → assigns one of 8 topics (`food`, `time`, `location`, `plans`, `money`, `phone`, `vague`, `generic`)
3. `sessionEngine` sequences 12–17 messages across 6 phases, mixing topic-specific (~50%) and universal (~50%) lines
4. Each message renders with randomized delay (1.5–3.5s) + character-by-character typing simulation
5. After final message → "I'm sorry" button fades in
6. User clicks → apology response from pool → summary card animates up
7. Summary card: Damage caused / Core issue / Best line / Relationship status

## Key design decisions
- No backend for MVP — all logic client-side; eliminates infra, cold starts, and API key exposure
- Topic classification via regex (not LLM) — instant, deterministic, no latency
- Phase engine separates topic-specific vs universal pools — ensures every session feels personalized without needing real AI
- Single route (`/`) — app opens directly to chat; no landing page, discovery is the UX
- Framer Motion for all animations — typing indicator, message entry, button fade, summary card slide-up
- `{userMessage}` interpolation — truncated to 40 chars — makes scripted lines feel dynamic

## Known limitations
- Message pool is finite — power users will see repeats after a few sessions
- Classification is keyword-only — nuanced messages may misclassify or fall to `generic`
- No persistence — session state lost on refresh
- No real LLM in MVP — responses are scripted, not generative

## Future improvements
- Claude API integration via `sessionEngine.ts` swap (system prompt + phase context already specced in PRD §8)
- PWA support for mobile
- URL-based session sharing for virality
- Analytics on which topics/lines resonate most
