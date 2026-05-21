# API Specification — WIFE

## MVP Status: No API

WIFE MVP has no backend. All logic runs client-side. This document covers the internal module interfaces and the post-MVP Claude API integration spec.

---

## Internal Module Interfaces

### `classify(msg: string): MessageTopic`
**File:** `lib/classify.ts`
**Purpose:** Keyword-based topic classification of user's message

```ts
type MessageTopic = 'food' | 'time' | 'location' | 'plans' | 'money' | 'phone' | 'vague' | 'generic';

classify("I'm hungry")    // → 'food'
classify("you're late")   // → 'time'
classify("hi")            // → 'vague'
classify("random stuff")  // → 'generic'
```

---

### `buildSession(topic: MessageTopic, userMessage: string): Message[]`
**File:** `lib/sessionEngine.ts`
**Purpose:** Sequences 12–17 messages across 6 phases, interpolates `{userMessage}`

```ts
interface Message {
  id: string;
  text: string;
  phase: 1 | 2 | 3 | 4 | 5 | 6;
  delayMs: number;  // randomized 1500–3500
}
```

Phase mix:
| Phase | Count | Topic-specific | Universal |
|---|---|---|---|
| 1 — Initial reaction | 2–3 | 70% | 30% |
| 2 — Excavation | 3–4 | 60% | 40% |
| 3 — Emotional peak | 3–4 | 50% | 50% |
| 4 — Brief softening | 1–2 | 0% | 100% |
| 5 — The return | 2–3 | 0% | 100% |
| 6 — The verdict | 1 | 0% | 100% |

---

### `generateSummary(topic: MessageTopic, sessionMessages: Message[]): SummaryCard`
**File:** `lib/summaryGenerator.ts`

```ts
interface SummaryCard {
  damageCaused: string;    // random from pool
  coreIssue: string;       // topic-mapped
  bestLine: string;        // random from phase 2–3 messages shown in session
  relationshipStatus: string; // random from pool
}
```

---

## Post-MVP: Claude API Integration

**Base URL:** `https://api.anthropic.com/v1/messages`

System prompt (swap into `sessionEngine.ts`):

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

**Model:** `claude-haiku-4-5-20251001` (low latency, sufficient for short comedic lines)
**Max tokens:** 150 per message
**No streaming needed** — full message received then typed character-by-character in UI
