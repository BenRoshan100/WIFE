# WIFE — Build Design Spec
**Date:** 2026-05-21
**Status:** Approved
**Approach:** Core-first, LLM-primary with scripted fallback

---

## 1. Scope

Full MVP build of WIFE — satirical single-session AI chat app. User sends one message; Claude Haiku delivers a 12–17 message passive-aggressive monologue across 6 emotional phases. Only resolution: "I'm sorry" button. Post-apology summary card.

Deviates from PRD MVP in one way: **Claude API integrated from day one** (not post-MVP). Scripted pool retained as automatic fallback when API credits exhausted.

---

## 2. Architecture

### Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS variables for design tokens |
| Animation | Framer Motion |
| State | `useState` / `useReducer` — no external lib |
| LLM | Claude Haiku (`claude-haiku-4-5-20251001`) via Anthropic SDK |
| Deployment | Vercel |

### File structure
```
app/
  page.tsx                    ← Chat UI, session orchestration
  api/
    chat/
      route.ts                ← Server-side Claude API proxy
components/
  ChatBubble.tsx
  TypingIndicator.tsx
  SummaryCard.tsx
  SorryButton.tsx
lib/
  classify.ts                 ← Client-side regex topic classifier
  messages.ts                 ← Scripted pool (fallback) + summary data
  sessionEngine.ts            ← Phase sequencer, LLM caller, fallback logic
  summaryGenerator.ts         ← Summary card field generation
.env.local                    ← ANTHROPIC_API_KEY (server-only)
```

---

## 3. Build Order (Core-First)

### Layer 1 — Scaffold
- `npx create-next-app@latest` with TypeScript + Tailwind
- Install: `framer-motion`, `@anthropic-ai/sdk`
- Set CSS variables for design tokens
- Delete Python template artifacts if present

### Layer 2 — `lib/` (pure logic, no React)
Build and verify in this order:

1. **`lib/classify.ts`** — Regex classifier → `MessageTopic`. 8 topics: `food | time | location | plans | money | phone | vague | generic`. Direct port from PRD §4.1.

2. **`lib/messages.ts`** — All scripted pools:
   - Topic pools (phases 1–3) for all 8 topics
   - Universal pool (phases 4–6)
   - Apology response pool
   - Summary card value pools (damageCaused, coreIssue per topic, relationshipStatus)

3. **`lib/summaryGenerator.ts`** — `generateSummary(topic, sessionMessages)`:
   - `bestLine`: random from phase 2–3 messages shown in session
   - `coreIssue`: topic-mapped string
   - `damageCaused`: random from pool
   - `relationshipStatus`: random from pool

4. **`lib/sessionEngine.ts`** — two exports:
   - `initSession(topic, userMessage)` → returns session plan: array of `{phase, delayMs}` (12–17 entries). No messages yet — just the phase schedule.
   - `getNextMessage(plan, index, topic, userMessage, useFallback)` → called by `page.tsx` one at a time as each message finishes rendering. Fetches from `/api/chat` or scripted pool. Returns `{ text, phase }`.
   - `{userMessage}` interpolation (40 char truncation) applied here before returning text.
   - On API error: caller sets `useFallback = true`, passes it in for all subsequent calls.

### Layer 3 — API Route
**`app/api/chat/route.ts`**
- Input: `{ phase: 1|2|3|4|5|6, topic: MessageTopic, userMessage: string }`
- Injects PRD §8 system prompt with `{userMessage}` and `{phase}`
- Calls `claude-haiku-4-5-20251001`, max 150 tokens
- Returns: `{ message: string }`
- Error codes that trigger fallback: `529`, `402`, any network error

### Layer 4 — UI Components
Build in this order (simplest → most complex):

1. **`components/TypingIndicator.tsx`** — Three pulsing dots, Framer Motion eased animation
2. **`components/ChatBubble.tsx`** — User bubble (right, cream `#F5F0E8`) + AI bubble (left, `#1E1E1E`). Slide-up + opacity entry animation.
3. **`components/SorryButton.tsx`** — Fade-in after final message. Scale + glow on hover.
4. **`components/SummaryCard.tsx`** — Frosted glass, slides up from bottom. 4 fields: Damage caused / Core issue / Best line / Relationship status. Footer: "Start over" + "Share".

### Layer 5 — `app/page.tsx`
Wire everything:
- Input → `classify()` → `initSession()` → loop: `getNextMessage()` → render → wait `delayMs` → next
- Input locks on send, placeholder → "Listening mode active..."
- `SorryButton` fades in after last message
- On click → apology response → `generateSummary()` → `SummaryCard` animates in

---

## 4. Design Tokens

```css
--bg: #0D0D0D;
--surface: #141414;
--bubble-ai: #1E1E1E;
--bubble-user: #F5F0E8;
--bubble-user-text: #0D0D0D;
--accent: #C9847A;          /* dusty rose — one accent only */
--border-subtle: rgba(255,255,255,0.06);
--font-display: 'Playfair Display', serif;
--font-body: 'DM Sans', sans-serif;
```

---

## 5. API Route — System Prompt

```
You are WIFE — a fictional AI character playing the role of a highly emotionally intelligent,
passive-aggressive, and occasionally warm partner in a comedic chat app.

The user has sent one message: "{userMessage}"
You are in phase {phase} of a 6-phase emotional arc.

Phase 1: cold, observational, dangerous calm
Phase 2: excavating unrelated grievances, fake callbacks
Phase 3: dramatic overanalysis, emotional peak
Phase 4: brief unexpected warmth
Phase 5: returning to the issue after the warmth
Phase 6: quiet, final verdict

Rules:
- Keep each message to 1–3 sentences.
- ~50% of messages must reference the topic of the user's original message.
- Never be abusive, hateful, or genuinely cruel.
- The tone is premium sitcom. Witty, not mean.
- Output one message only. No preamble.
```

---

## 6. Fallback Behavior

| Condition | Behavior |
|---|---|
| API returns 200 | Use LLM response |
| API returns 529 / credits exhausted | `useFallback = true` for session remainder |
| API returns any other error | `useFallback = true` for session remainder |
| `useFallback = true` | Pull from `messages.ts` scripted pool for current phase/topic |
| User never sees | Fallback is silent — identical UX |

---

## 7. Out of Scope

- Streaming (character-by-character is simulated client-side regardless)
- Analytics / logging
- User accounts, history, persistence
- PWA / native mobile
- URL-based session sharing
