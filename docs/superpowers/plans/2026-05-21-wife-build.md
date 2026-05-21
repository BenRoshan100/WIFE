# WIFE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build WIFE — a satirical Next.js 14 chat app where Claude Haiku delivers a passive-aggressive monologue across 6 emotional phases, with scripted fallback when API credits are exhausted.

**Architecture:** Client-side Next.js 14 App Router. User message → `classify()` → `initSession()` (phase schedule) → loop `getNextMessage()` (Claude Haiku via `/api/chat`, fallback to scripted pool on error) → render messages one-by-one with delays → "I'm sorry" button → summary card. All API key handling server-side only.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, @anthropic-ai/sdk, Jest

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/types.ts` | Create | Shared TypeScript types |
| `lib/classify.ts` | Create | Regex topic classifier |
| `lib/messages.ts` | Create | All scripted message pools + summary data |
| `lib/summaryGenerator.ts` | Create | Summary card field generation |
| `lib/sessionEngine.ts` | Create | Phase planner + per-message fetcher |
| `app/api/chat/route.ts` | Create | Server-side Claude Haiku proxy |
| `app/globals.css` | Modify | Design tokens + base styles |
| `app/layout.tsx` | Modify | Font setup (DM Sans + Playfair Display) |
| `app/page.tsx` | Modify | Main chat orchestration |
| `components/TypingIndicator.tsx` | Create | Animated three-dot indicator |
| `components/ChatBubble.tsx` | Create | User + AI message bubbles |
| `components/SorryButton.tsx` | Create | Resolution button with fade-in |
| `components/SummaryCard.tsx` | Create | Post-apology frosted glass card |
| `__tests__/classify.test.ts` | Create | Unit tests for classifier |
| `__tests__/summaryGenerator.test.ts` | Create | Unit tests for summary generator |
| `__tests__/sessionEngine.test.ts` | Create | Unit tests for session engine |
| `__tests__/chat-route.test.ts` | Create | Unit tests for API route handler |
| `.env.local` | Create | ANTHROPIC_API_KEY |

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: entire project structure via `create-next-app`
- Create: `.env.local`

- [ ] **Step 1: Run create-next-app in project directory**

From `d:\ACADEMIC\GenAI Projects\WIFE`, run:
```powershell
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --jest
```
If prompted about the directory having content: confirm proceed. If asked about overwriting `.gitignore`: keep existing (No). All other prompts: accept defaults.

Expected output: Next.js 14 project scaffolded with `package.json`, `tsconfig.json`, `jest.config.ts`, `jest.setup.ts`, `app/`, `public/` directories created.

- [ ] **Step 2: Install additional dependencies**

```powershell
npm install framer-motion @anthropic-ai/sdk
npm install -D @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Create .env.local**

Create file `.env.local` at project root:
```
ANTHROPIC_API_KEY=your-key-here
```
Replace `your-key-here` with your actual Anthropic API key.

- [ ] **Step 4: Verify scaffold**

```powershell
npm run build
```
Expected: Build succeeds with no errors (default Next.js starter).

- [ ] **Step 5: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 14 project with TypeScript, Tailwind, Jest"
```

---

## Task 2: Shared Types + Design Tokens

**Files:**
- Create: `lib/types.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create lib/types.ts**

```typescript
export type MessageTopic =
  | 'food'
  | 'time'
  | 'location'
  | 'plans'
  | 'money'
  | 'phone'
  | 'vague'
  | 'generic';

export interface SessionPhaseEntry {
  phase: 1 | 2 | 3 | 4 | 5 | 6;
  delayMs: number;
}

export interface SessionPlan {
  phases: SessionPhaseEntry[];
  topic: MessageTopic;
  truncatedMessage: string;
}

export interface SessionMessage {
  id: string;
  text: string;
  phase: 1 | 2 | 3 | 4 | 5 | 6;
  delayMs: number;
}

export interface SummaryCard {
  damageCaused: string;
  coreIssue: string;
  bestLine: string;
  relationshipStatus: string;
}
```

- [ ] **Step 2: Replace app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0D0D0D;
  --surface: #141414;
  --bubble-ai: #1E1E1E;
  --bubble-user: #F5F0E8;
  --bubble-user-text: #0D0D0D;
  --accent: #C9847A;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --font-display: 'Playfair Display', serif;
  --font-body: 'DM Sans', sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  background-color: var(--bg);
  color: #E8E8E8;
  font-family: var(--font-body);
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
```

- [ ] **Step 3: Replace app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'WIFE',
  description: 'Say something.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts app/globals.css app/layout.tsx
git commit -m "feat: add shared types and design tokens"
```

---

## Task 3: lib/classify.ts (TDD)

**Files:**
- Create: `__tests__/classify.test.ts`
- Create: `lib/classify.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/classify.test.ts`:
```typescript
import { classify } from '../lib/classify';

describe('classify', () => {
  it('classifies food messages', () => {
    expect(classify('I am hungry')).toBe('food');
    expect(classify('What is for dinner?')).toBe('food');
    expect(classify('Can we order pizza')).toBe('food');
    expect(classify('I want to cook tonight')).toBe('food');
  });

  it('classifies time messages', () => {
    expect(classify('you are late')).toBe('time');
    expect(classify('how long will this take')).toBe('time');
    expect(classify('are you still there')).toBe('time');
    expect(classify('when are you coming')).toBe('time');
  });

  it('classifies location messages', () => {
    expect(classify('where are you')).toBe('location');
    expect(classify('when are you coming home')).toBe('location');
    expect(classify('are you at work')).toBe('location');
  });

  it('classifies plans messages', () => {
    expect(classify('what are we doing this weekend')).toBe('plans');
    expect(classify('should we cancel tonight')).toBe('plans');
    expect(classify('are we still meeting tomorrow')).toBe('plans');
  });

  it('classifies money messages', () => {
    expect(classify('this is so expensive')).toBe('money');
    expect(classify('did you pay the bill')).toBe('money');
    expect(classify('can we afford this')).toBe('money');
  });

  it('classifies phone messages', () => {
    expect(classify('why are you so busy')).toBe('phone');
    expect(classify('you never reply to my texts')).toBe('phone');
    expect(classify('i can see you ignored my message')).toBe('phone');
  });

  it('classifies vague messages', () => {
    expect(classify('hi')).toBe('vague');
    expect(classify('hey')).toBe('vague');
    expect(classify('ok')).toBe('vague');
    expect(classify('okay')).toBe('vague');
    expect(classify('lol')).toBe('vague');
    expect(classify('.')).toBe('vague');
    expect(classify('...')).toBe('vague');
    expect(classify('hmm')).toBe('vague');
  });

  it('classifies unmatched messages as generic', () => {
    expect(classify('the sky is blue')).toBe('generic');
    expect(classify('interesting philosophical thought')).toBe('generic');
    expect(classify('I was thinking about mathematics')).toBe('generic');
  });

  it('is case-insensitive', () => {
    expect(classify('HUNGRY')).toBe('food');
    expect(classify('LATE')).toBe('time');
    expect(classify('WHERE ARE YOU')).toBe('location');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test -- --testPathPattern="classify" --no-coverage
```
Expected: FAIL — `Cannot find module '../lib/classify'`

- [ ] **Step 3: Implement lib/classify.ts**

```typescript
import type { MessageTopic } from './types';

export function classify(msg: string): MessageTopic {
  const m = msg.toLowerCase();
  if (/dinner|food|eat|hungry|cook|order|pizza|lunch|breakfast|restaurant|snack/.test(m)) return 'food';
  if (/late|early|wait|how long|when|time|still|yet|already/.test(m)) return 'time';
  if (/where|home|coming|outside|work|office|there|here/.test(m)) return 'location';
  if (/weekend|tonight|plan|party|cancel|meet|tomorrow|trip|movie/.test(m)) return 'plans';
  if (/money|expensive|bill|pay|buy|afford|cost|price|spend/.test(m)) return 'money';
  if (/busy|call|text|seen|replied|read|ignore|phone|message|reply/.test(m)) return 'phone';
  if (/^(hi|hey|hello|ok|okay|k|\.+|lol|hm+|sup|yo|hmm|👋)$/i.test(m.trim())) return 'vague';
  return 'generic';
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npm test -- --testPathPattern="classify" --no-coverage
```
Expected: PASS — all 9 test cases green.

- [ ] **Step 5: Commit**

```bash
git add __tests__/classify.test.ts lib/classify.ts
git commit -m "feat: add keyword-based topic classifier with tests"
```

---

## Task 4: lib/messages.ts

**Files:**
- Create: `lib/messages.ts`

No TDD — this is a pure data file. Write it completely.

- [ ] **Step 1: Create lib/messages.ts**

```typescript
import type { MessageTopic } from './types';

export const topicMessages: Record<
  MessageTopic,
  { phase1: string[]; phase2: string[]; phase3: string[] }
> = {
  food: {
    phase1: [
      'So. Dinner.',
      'Interesting question. Very interesting question.',
      'You want to know about dinner. Right now. At this hour.',
    ],
    phase2: [
      "This is not just about dinner. This is about every time I've cooked and you've said 'smells good' and walked away.",
      'The chicken has been marinating since 3pm. Three. P.M.',
      "Remember when you said you'd handle Tuesday? Tuesday came and went. Like a ghost. A hungry ghost.",
      "I reorganized the entire spice rack for this meal and you're asking *if* it's ready.",
      "You know what? I also wanted Thai food last week. But I didn't say anything. I made rice.",
    ],
    phase3: [
      "This dinner represents a level of effort that I don't think you're fully equipped to appreciate.",
      'I tasted it four times to make sure it was right. Four times. For you.',
      "The fact that you're texting instead of smelling the kitchen tells me everything.",
      "Gordon Ramsay would have texted too. And that's why he's divorced.",
    ],
  },
  time: {
    phase1: [
      'Oh, timing. My favourite subject.',
      "Let's talk about time. Since that's what you brought up.",
      "You're asking about time. As if time is something you've respected.",
    ],
    phase2: [
      "You said 7. It is now 7:43. These are facts, not opinions.",
      "I've been ready since 6:50. I've been *aggressively* ready.",
      'Do you know what I did while waiting? I reorganized my feelings. Twice.',
      "My mother was right. She said 'he'll be late to his own birthday.' I defended you.",
      'I checked my phone 11 times. I know because I counted. To stay calm.',
    ],
    phase3: [
      'Time is the one thing you cannot get back. You took mine and spent it on whatever that was.',
      'I had a whole plan for this evening. It was a good plan. A realistic plan. You were in it.',
      "Punctuality is love language #6. Look it up. Actually don't, you'll just be late to the article.",
    ],
  },
  location: {
    phase1: [
      'Where. Okay.',
      'You want to know where I am. Right. Yes.',
      'Location. As a question. Bold.',
    ],
    phase2: [
      'I told you I was going out. I said it clearly. You were looking at your phone but your ears were technically present.',
      "I've been here for 40 minutes. The Wi-Fi is bad and I've been thinking. About everything.",
      "You know what I never ask? Where you are. Because I trust you. Remember trust?",
      "I left a note. On the counter. Under your keys. Which you apparently didn't touch.",
      "My location is: disappointed. You can't pin that on a map.",
    ],
    phase3: [
      "The fact that you don't know where I am means you weren't paying attention when I told you.",
      "I'm somewhere you should have known about. That's all I'll say.",
      "I exist in a physical space and you just... forgot about it. About me. Briefly. But still.",
    ],
  },
  plans: {
    phase1: [
      'The plans. Yes. Let\'s discuss the plans.',
      'Oh good. You remembered we had plans.',
      'Plans. As a topic. Sure.',
    ],
    phase2: [
      "I've been thinking about this for three days. Three days of mental preparation and you're asking right now.",
      "I told Priya we'd be there by 8. I've already texted her twice to manage expectations.",
      "You know, when you cancel, it's not just you cancelling. It's me having to explain. Again.",
      'I had an outfit ready. It was a great outfit. It deserved to be worn tonight.',
      "Last time we cancelled on them we said 'next time for sure.' This was next time.",
    ],
    phase3: [
      'Plans are not suggestions. Plans are a form of commitment. A social contract. We violated a contract.',
      'Do you know what it\'s like to get excited about something for a week and then have to recalibrate in real time?',
      'The reservation was non-refundable. The reservation was made with hope. You cancelled hope.',
    ],
  },
  money: {
    phase1: [
      "Money. Great. Let's go there.",
      'You want to talk about the bill. Fine.',
      'Ah. Finances. My second favourite source of tension.',
    ],
    phase2: [
      "I looked at the statement. I didn't want to. But I looked.",
      "There are three charges here I don't recognize and I've been very calm about it. Until now.",
      "I'm not saying you spend too much. I'm saying the spreadsheet tells a different story.",
      'We said we had a budget. A budget is a promise to your future self. And you broke it.',
      'The subscription you forgot to cancel has now charged us for 14 months.',
    ],
    phase3: [
      'Money is just energy. And right now the energy is very chaotic.',
      "I'm not materialistic. I just believe in financial honesty. Which is a form of intimacy. Which you're avoiding.",
      'I made a whole budget tracker for us. In colour. With formulas. You opened it once.',
    ],
  },
  phone: {
    phase1: [
      'The irony of you texting this to me.',
      'Oh, you found your phone. Wonderful.',
      'You replied. At last. The prodigal message returns.',
    ],
    phase2: [
      "I can see when you were last active. I'm not a detective. I just have eyes.",
      "You had time to post a story but not to reply. I saw it. I said nothing. I'm saying something now.",
      'I sent three messages. Three. The first two were reasonable. The third one was art.',
      "Being 'busy' and being 'unable to send a 2-letter reply' are two different things. I've been busy and I've still replied.",
      "My read receipts are on. Out of respect. Yours are off. That's a lifestyle choice and I've noted it.",
    ],
    phase3: [
      "Communication is not a burden. It's a form of saying 'I know you exist and I acknowledge that.' You chose not to.",
      "I wasn't worried. I was aware. There's a difference and both are exhausting.",
      'The phone is always in your hand. That makes the silence a decision.',
    ],
  },
  vague: {
    phase1: [
      "...that's it?",
      "Okay. So we're doing this.",
      'You opened a conversation with that. Deliberately.',
      'I\'ve been waiting for this message. I assumed it would contain more.',
    ],
    phase2: [
      "The brevity. The casual deployment of a single syllable. As if I don't have feelings with a full vocabulary.",
      "I could write paragraphs. I could fill books. You sent '{userMessage}'. And expected a response.",
      'You know what that message communicated? Everything. In the worst possible way.',
      "I've been thinking all day. Crafting thoughts. And you arrived with '{userMessage}' like it was enough.",
      "My therapist would have so much to say about this. She'd probably start with the message and end with your childhood.",
    ],
    phase3: [
      "'{userMessage}' is not a conversation. It's a test. And we both know which one of us is being tested.",
      "I've read that message six times. I've found new meaning in it each time. None of the meanings were good.",
      'One character. You gave me one character. I gave you my afternoon.',
    ],
  },
  generic: {
    phase1: [
      'So you sent that. Knowing full well what it would do.',
      'Interesting. Very bold choice.',
      "You typed '{userMessage}' and hit send. Just like that.",
    ],
    phase2: [
      "This is not about what you said. This is about the pattern.",
      "I've been very patient. Measurably patient. Spreadsheet-level patient.",
      "There are things I've let go. This is not one of those things.",
      "This is exactly like the coriander incident. You don't remember the coriander incident. That's also part of the problem.",
    ],
    phase3: [
      "You sent '{userMessage}' like it was a normal thing to send.",
      'I have a whole archive of moments exactly like this one. It is a large archive.',
      "I'm not overreacting. I'm reacting at the correct size for this situation.",
    ],
  },
};

export const universalMessages = {
  phase4: [
    "Actually, I know you're trying. I see it. ❤️",
    "You're not a bad person. You're just a *specific* kind of person.",
    "Okay. I love you. That doesn't change anything I just said, but it's true.",
    "I'm proud of you for the other things. I want that on record.",
    'You work hard. I see that. This is separate from that.',
  ],
  phase5: [
    'Anyway. Back to the issue.',
    "That moment of warmth doesn't close the tab. The tab is still open.",
    'Right. Where were we. Yes.',
    'The affection stands. The problem also stands.',
    "I meant all of that. And also: we're not done.",
  ],
  phase6: [
    'I just need you to understand. That\'s all.',
    'Think about it. Really think.',
    "I'm not angry. I'm calibrated.",
    'You know what to say.',
    '...',
  ],
};

export const apologyResponses = [
  'Correct.',
  'Accepted. Conditionally.',
  'Progress.',
  'That took a while.',
  'Noted. Filed.',
  'Good. We can move on. Slowly.',
  'I know.',
];

export const summaryData = {
  damageCaused: [
    'Medium-high. Recoverable.',
    'Significant. Noted in the record.',
    'Minor but cumulative.',
    "You'll be fine. Probably.",
  ],
  coreIssue: {
    food: 'Failure to provide kitchen status updates.',
    time: 'Disregard for agreed schedules.',
    location: "Failure to track partner's stated location.",
    plans: 'Undermining pre-committed social arrangements.',
    money: 'Unilateral financial decisions.',
    phone: 'Deliberate communication avoidance.',
    vague: 'Communication avoidance via minimalism.',
    generic: 'Pattern of casual disregard.',
  } as Record<MessageTopic, string>,
  relationshipStatus: [
    'Stable (monitored)',
    'Conditional peace',
    'On probation',
    'Active recovery',
    'Tense but functional',
  ],
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```powershell
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/messages.ts
git commit -m "feat: add complete scripted message pools and summary data"
```

---

## Task 5: lib/summaryGenerator.ts (TDD)

**Files:**
- Create: `__tests__/summaryGenerator.test.ts`
- Create: `lib/summaryGenerator.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/summaryGenerator.test.ts`:
```typescript
import { generateSummary } from '../lib/summaryGenerator';
import type { SessionMessage } from '../lib/types';

function makeMsg(text: string, phase: 1 | 2 | 3 | 4 | 5 | 6): SessionMessage {
  return { id: String(Math.random()), text, phase, delayMs: 2000 };
}

const sessionMessages: SessionMessage[] = [
  makeMsg('Phase 1 message', 1),
  makeMsg('Phase 2 message A', 2),
  makeMsg('Phase 2 message B', 2),
  makeMsg('Phase 3 message', 3),
  makeMsg('Phase 4 message', 4),
];

describe('generateSummary', () => {
  it('returns all 4 required fields', () => {
    const result = generateSummary('food', sessionMessages);
    expect(result).toHaveProperty('damageCaused');
    expect(result).toHaveProperty('coreIssue');
    expect(result).toHaveProperty('bestLine');
    expect(result).toHaveProperty('relationshipStatus');
  });

  it('maps coreIssue by topic', () => {
    expect(generateSummary('food', sessionMessages).coreIssue).toBe(
      'Failure to provide kitchen status updates.'
    );
    expect(generateSummary('time', sessionMessages).coreIssue).toBe(
      'Disregard for agreed schedules.'
    );
    expect(generateSummary('vague', sessionMessages).coreIssue).toBe(
      'Communication avoidance via minimalism.'
    );
    expect(generateSummary('generic', sessionMessages).coreIssue).toBe(
      'Pattern of casual disregard.'
    );
  });

  it('selects bestLine from phase 2 or 3 messages only', () => {
    const result = generateSummary('food', sessionMessages);
    const phase23Texts = sessionMessages
      .filter((m) => m.phase === 2 || m.phase === 3)
      .map((m) => m.text);
    expect(phase23Texts).toContain(result.bestLine);
  });

  it('falls back to default bestLine when no phase 2-3 messages', () => {
    const onlyPhase1 = [makeMsg('Only phase 1', 1)];
    const result = generateSummary('food', onlyPhase1);
    expect(typeof result.bestLine).toBe('string');
    expect(result.bestLine.length).toBeGreaterThan(0);
  });

  it('selects damageCaused from the pool', () => {
    const pool = [
      'Medium-high. Recoverable.',
      'Significant. Noted in the record.',
      'Minor but cumulative.',
      "You'll be fine. Probably.",
    ];
    const result = generateSummary('food', sessionMessages);
    expect(pool).toContain(result.damageCaused);
  });

  it('selects relationshipStatus from the pool', () => {
    const pool = [
      'Stable (monitored)',
      'Conditional peace',
      'On probation',
      'Active recovery',
      'Tense but functional',
    ];
    const result = generateSummary('food', sessionMessages);
    expect(pool).toContain(result.relationshipStatus);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test -- --testPathPattern="summaryGenerator" --no-coverage
```
Expected: FAIL — `Cannot find module '../lib/summaryGenerator'`

- [ ] **Step 3: Implement lib/summaryGenerator.ts**

```typescript
import { summaryData } from './messages';
import type { MessageTopic, SessionMessage, SummaryCard } from './types';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSummary(
  topic: MessageTopic,
  sessionMessages: SessionMessage[]
): SummaryCard {
  const phase23 = sessionMessages.filter((m) => m.phase === 2 || m.phase === 3);
  return {
    damageCaused: pick(summaryData.damageCaused),
    coreIssue: summaryData.coreIssue[topic],
    bestLine: phase23.length > 0 ? pick(phase23).text : "I'm calibrated.",
    relationshipStatus: pick(summaryData.relationshipStatus),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npm test -- --testPathPattern="summaryGenerator" --no-coverage
```
Expected: PASS — all 6 test cases green.

- [ ] **Step 5: Commit**

```bash
git add __tests__/summaryGenerator.test.ts lib/summaryGenerator.ts
git commit -m "feat: add summary card generator with tests"
```

---

## Task 6: lib/sessionEngine.ts (TDD)

**Files:**
- Create: `__tests__/sessionEngine.test.ts`
- Create: `lib/sessionEngine.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/sessionEngine.test.ts`:
```typescript
import { initSession, getNextMessage } from '../lib/sessionEngine';

describe('initSession', () => {
  it('returns between 12 and 17 phase entries', () => {
    const plan = initSession('food', 'test message');
    expect(plan.phases.length).toBeGreaterThanOrEqual(12);
    expect(plan.phases.length).toBeLessThanOrEqual(17);
  });

  it('truncates userMessage longer than 40 chars', () => {
    const longMsg = 'a'.repeat(50);
    const plan = initSession('food', longMsg);
    expect(plan.truncatedMessage).toBe('a'.repeat(40) + '...');
  });

  it('preserves userMessage shorter than or equal to 40 chars', () => {
    const plan = initSession('food', 'hello');
    expect(plan.truncatedMessage).toBe('hello');
  });

  it('always ends with phase 6', () => {
    for (let i = 0; i < 5; i++) {
      const plan = initSession('food', 'test');
      expect(plan.phases[plan.phases.length - 1].phase).toBe(6);
    }
  });

  it('phases appear in ascending order (1 then 2 then 3 etc)', () => {
    const plan = initSession('food', 'test');
    const phaseNums = plan.phases.map((p) => p.phase);
    const firstOf = (n: number) => phaseNums.indexOf(n);
    expect(firstOf(1)).toBeLessThan(firstOf(2));
    expect(firstOf(2)).toBeLessThan(firstOf(3));
    expect(firstOf(3)).toBeLessThan(firstOf(4));
    expect(firstOf(4)).toBeLessThan(firstOf(5));
    expect(firstOf(5)).toBeLessThan(firstOf(6));
  });

  it('all delayMs are between 1500 and 3500', () => {
    const plan = initSession('food', 'test');
    plan.phases.forEach((p) => {
      expect(p.delayMs).toBeGreaterThanOrEqual(1500);
      expect(p.delayMs).toBeLessThanOrEqual(3500);
    });
  });

  it('stores topic and truncatedMessage on the plan', () => {
    const plan = initSession('time', 'you are late');
    expect(plan.topic).toBe('time');
    expect(plan.truncatedMessage).toBe('you are late');
  });
});

describe('getNextMessage — scripted fallback (useFallback=true)', () => {
  it('returns message with correct phase', async () => {
    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 0, true);
    expect(result.message.phase).toBe(plan.phases[0].phase);
    expect(result.message.text.length).toBeGreaterThan(0);
    expect(result.error).toBe(false);
  });

  it('does not contain literal {userMessage} in output', async () => {
    const plan = initSession('vague', 'hi');
    for (let i = 0; i < plan.phases.length; i++) {
      const result = await getNextMessage(plan, i, true);
      expect(result.message.text).not.toContain('{userMessage}');
    }
  });

  it('message id includes index', async () => {
    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 3, true);
    expect(result.message.id).toContain('3');
  });
});

describe('getNextMessage — LLM path (useFallback=false)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls /api/chat and returns LLM message on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'LLM generated response' }),
    });

    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 0, false);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.message.text).toBe('LLM generated response');
    expect(result.error).toBe(false);
  });

  it('falls back to scripted and sets error=true on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 529 });

    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 0, false);

    expect(result.message.text.length).toBeGreaterThan(0);
    expect(result.error).toBe(true);
  });

  it('falls back to scripted and sets error=true on network failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 0, false);

    expect(result.message.text.length).toBeGreaterThan(0);
    expect(result.error).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test -- --testPathPattern="sessionEngine" --no-coverage
```
Expected: FAIL — `Cannot find module '../lib/sessionEngine'`

- [ ] **Step 3: Implement lib/sessionEngine.ts**

```typescript
import { topicMessages, universalMessages } from './messages';
import type { MessageTopic, SessionMessage, SessionPlan } from './types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDelay(): number {
  return randInt(1500, 3500);
}

export function initSession(topic: MessageTopic, userMessage: string): SessionPlan {
  const truncatedMessage =
    userMessage.length > 40 ? userMessage.slice(0, 40) + '...' : userMessage;

  const phases: SessionPlan['phases'] = [];

  const addPhase = (phase: 1 | 2 | 3 | 4 | 5 | 6, count: number) => {
    for (let i = 0; i < count; i++) {
      phases.push({ phase, delayMs: randDelay() });
    }
  };

  addPhase(1, randInt(2, 3));
  addPhase(2, randInt(3, 4));
  addPhase(3, randInt(3, 4));
  addPhase(4, randInt(1, 2));
  addPhase(5, randInt(2, 3));
  addPhase(6, 1);

  return { phases, topic, truncatedMessage };
}

function pickScripted(
  topic: MessageTopic,
  phase: 1 | 2 | 3 | 4 | 5 | 6,
  truncatedMessage: string
): string {
  let pool: string[];
  switch (phase) {
    case 1: pool = topicMessages[topic].phase1; break;
    case 2: pool = topicMessages[topic].phase2; break;
    case 3: pool = topicMessages[topic].phase3; break;
    case 4: pool = universalMessages.phase4; break;
    case 5: pool = universalMessages.phase5; break;
    case 6: pool = universalMessages.phase6; break;
  }
  const raw = pool[Math.floor(Math.random() * pool.length)];
  return raw.replace(/\{userMessage\}/g, truncatedMessage);
}

export async function getNextMessage(
  plan: SessionPlan,
  index: number,
  useFallback: boolean
): Promise<{ message: SessionMessage; error: boolean }> {
  const phaseEntry = plan.phases[index];

  if (!useFallback) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: phaseEntry.phase,
          topic: plan.topic,
          userMessage: plan.truncatedMessage,
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();
      return {
        message: {
          id: `msg-${index}`,
          text: data.message as string,
          phase: phaseEntry.phase,
          delayMs: phaseEntry.delayMs,
        },
        error: false,
      };
    } catch {
      // fall through to scripted
    }
  }

  const text = pickScripted(plan.topic, phaseEntry.phase, plan.truncatedMessage);
  return {
    message: {
      id: `msg-${index}`,
      text,
      phase: phaseEntry.phase,
      delayMs: phaseEntry.delayMs,
    },
    error: !useFallback,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npm test -- --testPathPattern="sessionEngine" --no-coverage
```
Expected: PASS — all test cases green.

- [ ] **Step 5: Commit**

```bash
git add __tests__/sessionEngine.test.ts lib/sessionEngine.ts
git commit -m "feat: add session engine with LLM fetch and scripted fallback, with tests"
```

---

## Task 7: app/api/chat/route.ts (TDD)

**Files:**
- Create: `__tests__/chat-route.test.ts`
- Create: `app/api/chat/route.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/chat-route.test.ts`:
```typescript
/**
 * @jest-environment node
 */
import { POST } from '../app/api/chat/route';

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  };
});

import Anthropic from '@anthropic-ai/sdk';

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate = jest.fn();
    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
      () => ({ messages: { create: mockCreate } } as any)
    );
  });

  it('returns 200 with message on success', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'LLM generated message' }],
    });

    const req = makeRequest({ phase: 1, topic: 'food', userMessage: 'dinner' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe('LLM generated message');
  });

  it('returns 400 when phase is missing', async () => {
    const req = makeRequest({ topic: 'food', userMessage: 'dinner' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when topic is missing', async () => {
    const req = makeRequest({ phase: 1, userMessage: 'dinner' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when userMessage is missing', async () => {
    const req = makeRequest({ phase: 1, topic: 'food' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when Anthropic SDK throws', async () => {
    mockCreate.mockRejectedValue(new Error('API failure'));

    const req = makeRequest({ phase: 1, topic: 'food', userMessage: 'dinner' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('injects userMessage and phase into system prompt', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'response' }],
    });

    const req = makeRequest({ phase: 3, topic: 'food', userMessage: 'dinner tonight' });
    await POST(req);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system).toContain('dinner tonight');
    expect(callArgs.system).toContain('3');
  });

  it('uses claude-haiku-4-5-20251001 model', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'response' }],
    });

    const req = makeRequest({ phase: 1, topic: 'food', userMessage: 'dinner' });
    await POST(req);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-haiku-4-5-20251001');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```powershell
npm test -- --testPathPattern="chat-route" --no-coverage
```
Expected: FAIL — `Cannot find module '../app/api/chat/route'`

- [ ] **Step 3: Create app/api/chat/ directory and route.ts**

Create `app/api/chat/route.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are WIFE — a fictional AI character playing the role of a highly emotionally intelligent, passive-aggressive, and occasionally warm partner in a comedic chat app.

The user has sent one message: "{userMessage}"
You are in phase {phase} of a 6-phase emotional arc.

Phase 1: cold, observational, dangerous calm
Phase 2: excavating unrelated grievances, fake callbacks
Phase 3: dramatic overanalysis, emotional peak
Phase 4: brief unexpected warmth
Phase 5: returning to the issue after the warmth
Phase 6: quiet, final verdict

Rules:
- Keep each message to 1-3 sentences.
- ~50% of messages must reference the topic of the user's original message.
- Never be abusive, hateful, or genuinely cruel.
- The tone is premium sitcom. Witty, not mean.
- Output one message only. No preamble.`;

export async function POST(req: Request) {
  let body: { phase?: number; topic?: string; userMessage?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { phase, topic, userMessage } = body;

  if (phase === undefined || !topic || !userMessage) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPT.replace('{userMessage}', userMessage).replace(
    '{phase}',
    String(phase)
  );

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ message: text });
  } catch {
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```powershell
npm test -- --testPathPattern="chat-route" --no-coverage
```
Expected: PASS — all 6 test cases green.

- [ ] **Step 5: Run all tests together**

```powershell
npm test -- --no-coverage
```
Expected: All test suites pass.

- [ ] **Step 6: Commit**

```bash
git add __tests__/chat-route.test.ts app/api/chat/route.ts
git commit -m "feat: add Claude Haiku API route with validation and tests"
```

---

## Task 8: TypingIndicator + ChatBubble Components

**Files:**
- Create: `components/TypingIndicator.tsx`
- Create: `components/ChatBubble.tsx`

No automated tests for UI components — verified visually in Task 12.

- [ ] **Step 1: Create components/TypingIndicator.tsx**

```tsx
'use client';

import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-4 py-3 rounded-2xl w-fit"
      style={{
        background: 'var(--bubble-ai)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full"
          style={{ background: 'var(--accent)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create components/ChatBubble.tsx**

```tsx
'use client';

import { motion } from 'framer-motion';

interface Props {
  text: string;
  isUser: boolean;
}

export default function ChatBubble({ text, isUser }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
        isUser ? 'ml-auto' : 'mr-auto'
      }`}
      style={
        isUser
          ? {
              background: 'var(--bubble-user)',
              color: 'var(--bubble-user-text)',
            }
          : {
              background: 'var(--bubble-ai)',
              border: '1px solid var(--border-subtle)',
              color: '#E8E8E8',
            }
      }
    >
      {text}
    </motion.div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/TypingIndicator.tsx components/ChatBubble.tsx
git commit -m "feat: add TypingIndicator and ChatBubble components"
```

---

## Task 9: SorryButton + SummaryCard Components

**Files:**
- Create: `components/SorryButton.tsx`
- Create: `components/SummaryCard.tsx`

- [ ] **Step 1: Create components/SorryButton.tsx**

```tsx
'use client';

import { motion } from 'framer-motion';

interface Props {
  onClick: () => void;
}

export default function SorryButton({ onClick }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="px-8 py-3 rounded-full text-sm font-medium tracking-wide cursor-pointer"
      style={{
        background: 'transparent',
        border: '1px solid var(--accent)',
        color: 'var(--accent)',
      }}
    >
      I&apos;m sorry
    </motion.button>
  );
}
```

- [ ] **Step 2: Create components/SummaryCard.tsx**

```tsx
'use client';

import { motion } from 'framer-motion';
import type { SummaryCard as SummaryCardType } from '@/lib/types';

interface Props {
  summary: SummaryCardType;
  onStartOver: () => void;
  onShare: (text: string) => void;
}

export default function SummaryCard({ summary, onStartOver, onShare }: Props) {
  const shareText = [
    'WIFE Session Summary',
    '',
    `Damage caused: ${summary.damageCaused}`,
    `Core issue: ${summary.coreIssue}`,
    `Best line: "${summary.bestLine}"`,
    `Relationship status: ${summary.relationshipStatus}`,
  ].join('\n');

  const fields: [string, string][] = [
    ['Damage caused', summary.damageCaused],
    ['Core issue', summary.coreIssue],
    ['Best line', `"${summary.bestLine}"`],
    ['Relationship status', summary.relationshipStatus],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: 'rgba(20, 20, 20, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="space-y-4">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}
            >
              {label}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#E8E8E8' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onStartOver}
          className="flex-1 py-2 rounded-full text-xs tracking-wide cursor-pointer"
          style={{
            border: '1px solid var(--border-subtle)',
            color: 'rgba(255,255,255,0.45)',
            background: 'transparent',
          }}
        >
          Start over
        </button>
        <button
          onClick={() => onShare(shareText)}
          className="flex-1 py-2 rounded-full text-xs tracking-wide font-medium cursor-pointer"
          style={{ background: 'var(--accent)', color: '#0D0D0D' }}
        >
          Share
        </button>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/SorryButton.tsx components/SummaryCard.tsx
git commit -m "feat: add SorryButton and SummaryCard components"
```

---

## Task 10: app/page.tsx — Main Orchestration

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatBubble from '@/components/ChatBubble';
import TypingIndicator from '@/components/TypingIndicator';
import SorryButton from '@/components/SorryButton';
import SummaryCard from '@/components/SummaryCard';
import { classify } from '@/lib/classify';
import { initSession, getNextMessage } from '@/lib/sessionEngine';
import { generateSummary } from '@/lib/summaryGenerator';
import { apologyResponses } from '@/lib/messages';
import type { MessageTopic, SessionMessage, SummaryCard as SummaryCardType } from '@/lib/types';

interface DisplayMessage {
  id: string;
  text: string;
  isUser: boolean;
}

type AppState = 'idle' | 'streaming' | 'done' | 'resolved';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Home() {
  const [input, setInput] = useState('');
  const [appState, setAppState] = useState<AppState>('idle');
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [summary, setSummary] = useState<SummaryCardType | null>(null);

  const topicRef = useRef<MessageTopic>('generic');
  const sessionMessagesRef = useRef<SessionMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, showTyping, summary]);

  const handleSend = async () => {
    if (!input.trim() || appState !== 'idle') return;

    const userMessage = input.trim();
    setInput('');
    setAppState('streaming');

    const topic = classify(userMessage);
    topicRef.current = topic;

    setDisplayMessages([{ id: 'user-msg', text: userMessage, isUser: true }]);

    const plan = initSession(topic, userMessage);
    let useFallback = false;
    const collected: SessionMessage[] = [];

    for (let i = 0; i < plan.phases.length; i++) {
      setShowTyping(true);
      await sleep(plan.phases[i].delayMs);

      const { message, error } = await getNextMessage(plan, i, useFallback);
      if (error && !useFallback) useFallback = true;

      collected.push(message);
      sessionMessagesRef.current = [...collected];

      setShowTyping(false);
      setDisplayMessages((prev) => [
        ...prev,
        { id: message.id, text: message.text, isUser: false },
      ]);

      await sleep(200);
    }

    setAppState('done');
  };

  const handleSorry = () => {
    const response = pickRandom(apologyResponses);
    setDisplayMessages((prev) => [
      ...prev,
      { id: 'sorry-response', text: response, isUser: false },
    ]);
    const s = generateSummary(topicRef.current, sessionMessagesRef.current);
    setSummary(s);
    setAppState('resolved');
  };

  const handleStartOver = () => {
    setInput('');
    setAppState('idle');
    setDisplayMessages([]);
    setShowTyping(false);
    setSummary(null);
    sessionMessagesRef.current = [];
    topicRef.current = 'generic';
  };

  const handleShare = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <main
      className="min-h-screen flex flex-col max-w-lg mx-auto"
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <header className="px-6 py-5 flex-shrink-0">
        <h1
          className="text-lg tracking-widest uppercase"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#E8E8E8',
            letterSpacing: '0.35em',
          }}
        >
          WIFE
        </h1>
      </header>

      {/* Chat scroll area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        <AnimatePresence initial={false}>
          {displayMessages.map((msg) => (
            <ChatBubble key={msg.id} text={msg.text} isUser={msg.isUser} />
          ))}
        </AnimatePresence>

        {showTyping && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <TypingIndicator />
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 px-4 pb-8 pt-2 space-y-4">
        {appState === 'done' && (
          <div className="flex justify-center">
            <SorryButton onClick={handleSorry} />
          </div>
        )}

        {appState === 'resolved' && summary && (
          <SummaryCard
            summary={summary}
            onStartOver={handleStartOver}
            onShare={handleShare}
          />
        )}

        {appState === 'idle' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say something..."
              className="flex-1 px-4 py-3 rounded-full text-sm outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                color: '#E8E8E8',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-5 py-3 rounded-full text-sm font-medium disabled:opacity-30 transition-opacity"
              style={{ background: 'var(--accent)', color: '#0D0D0D' }}
            >
              Send
            </button>
          </form>
        )}

        {appState === 'streaming' && (
          <p
            className="text-center text-xs"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            Listening mode active...
          </p>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Run the dev server and manually verify**

```powershell
npm run dev
```

Open `http://localhost:3000` in browser. Verify:
- [ ] WIFE wordmark renders top-left in serif font
- [ ] Input box is focused and shows placeholder "Say something..."
- [ ] Type a food-related message (e.g. "what's for dinner") and hit Send
- [ ] User bubble appears right-aligned in cream color
- [ ] Input locks, placeholder disappears, typing indicator (3 dots) appears
- [ ] AI messages arrive one-by-one with delays
- [ ] After all messages, "I'm sorry" button fades in
- [ ] Click "I'm sorry" → apology response appears as chat bubble
- [ ] Summary card slides up with 4 fields
- [ ] "Start over" resets to idle state
- [ ] "Share" copies text to clipboard (check clipboard)

- [ ] **Step 3: Test with different topics**

In the running dev server, try each topic to verify classify + message variety:
- `"hi"` → vague topic
- `"you're late"` → time topic
- `"where are you"` → location topic
- `"did you pay the bill"` → money topic
- `"you never text back"` → phone topic
- `"what about the weekend plans"` → plans topic

- [ ] **Step 4: Run full test suite to confirm nothing broken**

```powershell
npm test -- --no-coverage
```
Expected: All suites pass.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire up main chat orchestration in page.tsx"
```

---

## Task 11: Deploy to Vercel

**Files:** None — deployment config only.

- [ ] **Step 1: Push to GitHub**

Create a new GitHub repository named `wife` (private or public), then:
```bash
git remote add origin https://github.com/<your-username>/wife.git
git push -u origin main
```

- [ ] **Step 2: Deploy on Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub → select `wife`
2. Framework preset: Next.js (auto-detected)
3. Environment Variables: add `ANTHROPIC_API_KEY` = your actual key
4. Click Deploy

- [ ] **Step 3: Verify live deployment**

Open the Vercel URL. Run through the full flow:
- [ ] Send a message → AI monologue plays out
- [ ] Click "I'm sorry" → summary card appears
- [ ] API calls work (check Vercel function logs for `/api/chat` 200 responses)
- [ ] Test credits-exhausted fallback: temporarily use an invalid API key in Vercel env vars, redeploy, verify scripted fallback works silently

- [ ] **Step 4: Final commit with deploy URL**

Update `README.md` with the live Vercel URL:
```bash
git add README.md
git commit -m "docs: add live demo URL to README"
git push
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Core-first build order ✓ | LLM via API route ✓ | Scripted fallback on error ✓ | All 8 topics ✓ | 6-phase engine ✓ | All 4 components ✓ | Summary card with 4 fields ✓ | Design tokens ✓ | Start over + Share ✓
- [x] **No placeholders:** All steps have complete code
- [x] **Type consistency:** `MessageTopic`, `SessionPlan`, `SessionMessage`, `SummaryCard` defined in Task 2 and used consistently through Tasks 3–10
- [x] **Method consistency:** `initSession` + `getNextMessage` defined in Task 6, imported in Task 10. `generateSummary` defined in Task 5, imported in Task 10. `classify` defined in Task 3, imported in Task 10. `apologyResponses` defined in Task 4, imported in Task 10.
