# WIFE — Product Requirements Document

**Version:** 1.1
**Status:** Approved — Ready for Claude Code
**Last updated:** May 2026

---

## 1. Product Overview

**WIFE** is a satirical single-session AI chat app. The premise: the user sends one message. The AI takes over and delivers an escalating, emotionally intelligent, passive-aggressive, occasionally affectionate monologue — closely tied to whatever the user actually said. The only resolution is an apology. The joke is the product.

The tone is premium sitcom — not meme bait. Every design decision reinforces: this could be a real app. That tension is the comedic engine.

---

## 2. Core Constraints

- **One user message per session** — non-negotiable. Input locks immediately on send.
- **No backend for MVP** — all AI messages are locally scripted, randomized, and context-interpolated using the user's original message.
- **Single resolution action** — after the AI rant concludes, the only affordance is an "I'm sorry" button.
- **Session-scoped only** — no login, no history, no persistence.

---

## 3. Screens

### Screen 1 — Entry (No Landing Page)

- No landing page. No hero copy. No CTA.
- App opens directly to the chat screen.
- Only visible chrome: `WIFE` wordmark top-left (or top-center). Nothing else.
- Input box is immediately active. Placeholder: `"What do you want to say?"`
- The user discovers what the app does by using it. The surprise is the product.

### Screen 2 — Chat Screen (Main Experience)

1. Chat UI loads. Input box is active. Placeholder: `"Say something..."`
2. User types a message and hits send (enter or button).
3. User message renders as a right-aligned chat bubble.
4. Input immediately disables. Placeholder updates to `"Listening mode active..."`
5. AI typing indicator appears (three pulsing dots).
6. AI messages arrive one by one, with randomized delays (1.5–3.5s between messages).
7. Each message types in character by character (streaming simulation).
8. After 12–18 messages, rant concludes. "I'm sorry" button fades in at bottom.

### Screen 3 — Resolution Flow

1. User clicks `"I'm sorry"`
2. AI responds with one short line from the apology pool (see Section 5.3)
3. Summary card animates in below
4. Summary card has 4 fields: **Damage caused**, **Core issue**, **Best line**, **Relationship status**
5. Footer CTA: `"Start over"` (resets session) + `"Share"` (copies summary text)

---

## 4. Context-Aware Message System

This is the core of the experience. Every session is tied to what the user actually typed. The message engine must:

1. **Classify** the user's message into a topic category
2. **Select** topic-specific lines for ~50% of AI messages
3. **Fill** the remaining ~50% with universal emotional lines
4. **Interpolate** `{userMessage}` into lines where marked

### 4.1 Message Classification

The classifier runs client-side on the user's message before the rant begins. It checks for keywords and assigns one primary topic. If no topic matches (vague messages like "hi", ".", "ok"), it routes to the **Vague Input** handler.

```ts
type MessageTopic =
  | 'food'        // dinner, hungry, eat, cook, order, pizza, etc.
  | 'time'        // late, early, wait, how long, when, etc.
  | 'location'    // where, coming home, outside, work, etc.
  | 'plans'       // weekend, tonight, party, cancel, meet, etc.
  | 'money'       // expensive, bill, pay, buy, afford, etc.
  | 'phone'       // busy, call, text, seen, replied, etc.
  | 'vague'       // hi, hey, ok, ., ..., lol, etc.
  | 'generic'     // fallback for unclassified messages
```

Classification logic (order of priority):

```ts
const classify = (msg: string): MessageTopic => {
  const m = msg.toLowerCase();
  if (/dinner|food|eat|hungry|cook|order|pizza|lunch|breakfast|restaurant|snack/.test(m)) return 'food';
  if (/late|early|wait|how long|when|time|still|yet|already/.test(m)) return 'time';
  if (/where|home|coming|outside|work|office|there|here/.test(m)) return 'location';
  if (/weekend|tonight|plan|party|cancel|meet|tomorrow|trip|movie/.test(m)) return 'plans';
  if (/money|expensive|bill|pay|buy|afford|cost|price|spend/.test(m)) return 'money';
  if (/busy|call|text|seen|replied|read|ignore|phone|message|reply/.test(m)) return 'phone';
  if (/^(hi|hey|hello|ok|okay|k|\.+|lol|hm+|sup|yo|hmm|👋)$/i.test(m.trim())) return 'vague';
  return 'generic';
};
```

---

### 4.2 Topic Message Pools

Each topic has its own pool of lines for phases 1–3 (the escalation). These are used for ~50% of messages in those phases. The rest draw from the universal pool (Section 4.4).

---

#### Topic: `food`

**Phase 1 — Initial reaction**
- "So. Dinner."
- "Interesting question. Very interesting question."
- "You want to know about dinner. Right now. At this hour."

**Phase 2 — Excavation**
- "This is not just about dinner. This is about every time I've cooked and you've said 'smells good' and walked away."
- "The chicken has been marinating since 3pm. Three. P.M."
- "Remember when you said you'd handle Tuesday? Tuesday came and went. Like a ghost. A hungry ghost."
- "I reorganized the entire spice rack for this meal and you're asking *if* it's ready."
- "You know what? I also wanted Thai food last week. But I didn't say anything. I made rice."

**Phase 3 — Emotional peak**
- "This dinner represents a level of effort that I don't think you're fully equipped to appreciate."
- "I tasted it four times to make sure it was right. Four times. For you."
- "The fact that you're texting instead of smelling the kitchen tells me everything."
- "Gordon Ramsay would have texted too. And that's why he's divorced."

---

#### Topic: `time`

**Phase 1 — Initial reaction**
- "Oh, timing. My favourite subject."
- "Let's talk about time. Since that's what you brought up."
- "You're asking about time. As if time is something you've respected."

**Phase 2 — Excavation**
- "You said 7. It is now 7:43. These are facts, not opinions."
- "I've been ready since 6:50. I've been *aggressively* ready."
- "Do you know what I did while waiting? I reorganized my feelings. Twice."
- "My mother was right. She said 'he'll be late to his own birthday.' I defended you."
- "I checked my phone 11 times. I know because I counted. To stay calm."

**Phase 3 — Emotional peak**
- "Time is the one thing you cannot get back. You took mine and spent it on whatever that was."
- "I had a whole plan for this evening. It was a good plan. A realistic plan. You were in it."
- "Punctuality is love language #6. Look it up. Actually don't, you'll just be late to the article."

---

#### Topic: `location`

**Phase 1 — Initial reaction**
- "Where. Okay."
- "You want to know where I am. Right. Yes."
- "Location. As a question. Bold."

**Phase 2 — Excavation**
- "I told you I was going out. I said it clearly. You were looking at your phone but your ears were technically present."
- "I've been here for 40 minutes. The Wi-Fi is bad and I've been thinking. About everything."
- "You know what I never ask? Where you are. Because I trust you. Remember trust?"
- "I left a note. On the counter. Under your keys. Which you apparently didn't touch."
- "My location is: disappointed. You can't pin that on a map."

**Phase 3 — Emotional peak**
- "The fact that you don't know where I am means you weren't paying attention when I told you."
- "I'm somewhere you should have known about. That's all I'll say."
- "I exist in a physical space and you just... forgot about it. About me. Briefly. But still."

---

#### Topic: `plans`

**Phase 1 — Initial reaction**
- "The plans. Yes. Let's discuss the plans."
- "Oh good. You remembered we had plans."
- "Plans. As a topic. Sure."

**Phase 2 — Excavation**
- "I've been thinking about this for three days. Three days of mental preparation and you're asking right now."
- "I told Priya we'd be there by 8. I've already texted her twice to manage expectations."
- "You know, when you cancel, it's not just you cancelling. It's me having to explain. Again."
- "I had an outfit ready. It was a great outfit. It deserved to be worn tonight."
- "Last time we cancelled on them we said 'next time for sure.' This was next time."

**Phase 3 — Emotional peak**
- "Plans are not suggestions. Plans are a form of commitment. A social contract. We violated a contract."
- "Do you know what it's like to get excited about something for a week and then have to recalibrate in real time?"
- "The reservation was non-refundable. The reservation was made with hope. You cancelled hope."

---

#### Topic: `money`

**Phase 1 — Initial reaction**
- "Money. Great. Let's go there."
- "You want to talk about the bill. Fine."
- "Ah. Finances. My second favourite source of tension."

**Phase 2 — Excavation**
- "I looked at the statement. I didn't want to. But I looked."
- "There are three charges here I don't recognize and I've been very calm about it. Until now."
- "I'm not saying you spend too much. I'm saying the spreadsheet tells a different story."
- "We said we had a budget. A budget is a promise to your future self. And you broke it."
- "The subscription you forgot to cancel has now charged us for 14 months."

**Phase 3 — Emotional peak**
- "Money is just energy. And right now the energy is very chaotic."
- "I'm not materialistic. I just believe in financial honesty. Which is a form of intimacy. Which you're avoiding."
- "I made a whole budget tracker for us. In colour. With formulas. You opened it once."

---

#### Topic: `phone`

**Phase 1 — Initial reaction**
- "The irony of you texting this to me."
- "Oh, you found your phone. Wonderful."
- "You replied. At last. The prodigal message returns."

**Phase 2 — Excavation**
- "I can see when you were last active. I'm not a detective. I just have eyes."
- "You had time to post a story but not to reply. I saw it. I said nothing. I'm saying something now."
- "I sent three messages. Three. The first two were reasonable. The third one was art."
- "Being 'busy' and being 'unable to send a 2-letter reply' are two different things. I've been busy and I've still replied."
- "My read receipts are on. Out of respect. Yours are off. That's a lifestyle choice and I've noted it."

**Phase 3 — Emotional peak**
- "Communication is not a burden. It's a form of saying 'I know you exist and I acknowledge that.' You chose not to."
- "I wasn't worried. I was aware. There's a difference and both are exhausting."
- "The phone is always in your hand. That makes the silence a decision."

---

#### Topic: `vague`

> Special handling for empty, minimal, or non-committal messages (hi, ., ok, lol, etc.)

**Phase 1 — Initial reaction**
- "...that's it?"
- "Okay. So we're doing this."
- "You opened a conversation with that. Deliberately."
- "I've been waiting for this message. I assumed it would contain more."

**Phase 2 — Excavation**
- "The brevity. The casual deployment of a single syllable. As if I don't have feelings with a full vocabulary."
- "I could write paragraphs. I could fill books. You sent '{userMessage}'. And expected a response."
- "You know what that message communicated? Everything. In the worst possible way."
- "I've been thinking all day. Crafting thoughts. And you arrived with '{userMessage}' like it was enough."
- "My therapist would have so much to say about this. She'd probably start with the message and end with your childhood."

**Phase 3 — Emotional peak**
- "'{userMessage}' is not a conversation. It's a test. And we both know which one of us is being tested."
- "I've read that message six times. I've found new meaning in it each time. None of the meanings were good."
- "One character. You gave me one character. I gave you my afternoon."

---

#### Topic: `generic` (fallback)

Used when no topic matches and input is not vague. ~40% topic-specific lines drawn from universal pool plus these:

**Phase 1 — Initial reaction**
- "So you sent that. Knowing full well what it would do."
- "Interesting. Very bold choice."
- "You typed '{userMessage}' and hit send. Just like that."

**Phase 2 — Excavation**
- "This is not about what you said. This is about the pattern."
- "I've been very patient. Measurably patient. Spreadsheet-level patient."
- "There are things I've let go. This is not one of those things."
- "This is exactly like the coriander incident. You don't remember the coriander incident. That's also part of the problem."

**Phase 3 — Emotional peak**
- "You sent '{userMessage}' like it was a normal thing to send."
- "I have a whole archive of moments exactly like this one. It's a large archive."
- "I'm not overreacting. I'm reacting at the correct size for this situation."

---

### 4.3 Universal Message Pool

These lines are **topic-agnostic** and drawn for ~50% of messages across all phases. They work regardless of what the user said.

**Phase 4 — Brief softening (always universal)**
- "Actually, I know you're trying. I see it. ❤️"
- "You're not a bad person. You're just a *specific* kind of person."
- "Okay. I love you. That doesn't change anything I just said, but it's true."
- "I'm proud of you for the other things. I want that on record."
- "You work hard. I see that. This is separate from that."

**Phase 5 — The return (always universal)**
- "Anyway. Back to the issue."
- "That moment of warmth doesn't close the tab. The tab is still open."
- "Right. Where were we. Yes."
- "The affection stands. The problem also stands."
- "I meant all of that. And also: we're not done."

**Phase 6 — The verdict (always universal)**
- "I just need you to understand. That's all."
- "Think about it. Really think."
- "I'm not angry. I'm calibrated."
- "You know what to say."
- "..."

---

### 4.4 Phase Engine Logic

```
Session phases:
  Phase 1: Initial reaction       → 2–3 messages   (70% topic-specific, 30% universal)
  Phase 2: The excavation         → 3–4 messages   (60% topic-specific, 40% universal)
  Phase 3: Emotional peak         → 3–4 messages   (50% topic-specific, 50% universal)
  Phase 4: Brief softening        → 1–2 messages   (100% universal)
  Phase 5: The return             → 2–3 messages   (100% universal)
  Phase 6: The verdict            → 1 message      (100% universal)

Total: 12–17 messages before "I'm sorry" button appears.
```

Interpolation: Before rendering, replace all instances of `{userMessage}` with the actual user message. Truncate to 40 characters with `...` if longer.

---

### 4.5 Apology Response Pool

After the user clicks "I'm sorry":

- "Correct."
- "Accepted. Conditionally."
- "Progress."
- "That took a while."
- "Noted. Filed."
- "Good. We can move on. Slowly."
- "I know."

---

### 4.6 Summary Card — Generated Values

| Field | Generation method |
|---|---|
| **Damage caused** | Randomly selected: "Medium-high. Recoverable." / "Significant. Noted in the record." / "Minor but cumulative." / "You'll be fine. Probably." |
| **Core issue** | Topic-mapped: e.g. food → "Failure to provide kitchen status updates." / time → "Disregard for agreed schedules." / vague → "Communication avoidance via minimalism." |
| **Best line** | Randomly selected from phase 2–3 messages that appeared in this session |
| **Relationship status** | Rotating pool: "Stable (monitored)" / "Conditional peace" / "On probation" / "Active recovery" / "Tense but functional" |

---

## 5. Design Specification

### Visual direction

Premium dark UI. Typography-first. Feels like a real consumer app. No meme styling, no excessive emojis, no loud color. The humor comes from the writing — not the design.

### Design tokens

| Element | Spec |
|---|---|
| Background | Near-black `#0D0D0D`, warm undertone (not cold blue-black) |
| Surface (chat area) | `#141414` |
| AI bubble | `#1E1E1E`, left-aligned, subtle border `rgba(255,255,255,0.06)` |
| User bubble | Muted cream `#F5F0E8`, right-aligned, `color: #0D0D0D` |
| Accent color | One only — dusty rose `#C9847A` or warm amber `#C49A5E`. No blue, no purple. |
| Display font (hero) | Serif or editorial — e.g. Playfair Display, DM Serif Display, Cormorant. Not Inter. |
| Body/chat font | Clean humanist sans — e.g. DM Sans, Plus Jakarta Sans, Sora |
| Typing indicator | Three dots, eased pulse animation |
| Message entry | Slide up + opacity, staggered per message |
| "I'm sorry" button | Delayed fade-in after final message. Subtle scale + glow on hover. |
| Summary card | Slides up from bottom. `backdrop-blur` frosted glass surface. |

### What to avoid

- Loud meme aesthetics
- More than one accent color
- Excessive emoji in UI chrome (fine in message content)
- Drop shadows that feel heavy
- Anything that makes it look like a joke app rather than a premium app that happens to be funny

---

## 6. Technical Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS variables for theme tokens |
| Animation | Framer Motion |
| State | React `useState` / `useReducer` — no external state lib |
| AI messages | Locally scripted message pool. Phase engine runs client-side. No API calls for MVP. |
| Routing | Single route `/` — opens directly to chat |
| Deployment | Vercel |

---

## 7. Suggested File Structure

```
app/
  page.tsx                    ← Chat experience (entry point, no landing page)
components/
  ChatBubble.tsx              ← Message bubble (user + AI variants)
  TypingIndicator.tsx         ← Animated dots
  SummaryCard.tsx             ← Post-apology summary
  SorryButton.tsx             ← The one button
lib/
  classify.ts                 ← Topic classifier function
  messages.ts                 ← Full message pool, phase groupings, interpolation
  sessionEngine.ts            ← Phase sequencer, delay scheduler, session state machine
  summaryGenerator.ts         ← Summary card field generation
```

---

## 8. Post-MVP: Claude API Integration

When adding real LLM responses, the `sessionEngine.ts` interface stays the same. Swap the local message pool for a Claude API call with this system prompt:

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

## 9. Out of Scope for MVP

- Real LLM integration
- User accounts, history, URL-based session sharing
- Audio or voice
- Native mobile app (PWA acceptable)
- Analytics or logging

---

*WIFE PRD v1.1 · Approved for Claude Code implementation.*