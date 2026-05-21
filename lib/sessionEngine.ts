import { topicMessages, universalMessages } from './messages';
import type { MessageTopic, SessionMessage, SessionPlan } from './types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function initSession(topic: MessageTopic, userMessage: string): SessionPlan {
  const truncatedMessage =
    userMessage.length > 40 ? userMessage.slice(0, 40) + '...' : userMessage;

  const phases: SessionPlan['phases'] = [];

  const addPhase = (phase: 1 | 2 | 3 | 4 | 5 | 6, count: number) => {
    for (let i = 0; i < count; i++) {
      phases.push({ phase, delayMs: randInt(1500, 3500) });
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
    case 1:
      pool = topicMessages[topic].phase1;
      break;
    case 2:
      pool = topicMessages[topic].phase2;
      break;
    case 3:
      pool = topicMessages[topic].phase3;
      break;
    case 4:
      pool = universalMessages.phase4;
      break;
    case 5:
      pool = universalMessages.phase5;
      break;
    case 6:
      pool = universalMessages.phase6;
      break;
  }
  if (!pool.length) throw new Error(`Empty pool: topic=${topic} phase=${phase}`);
  const raw = pool[Math.floor(Math.random() * pool.length)];
  return raw.replace(/\{userMessage\}/g, truncatedMessage);
}

export async function getNextMessage(
  plan: SessionPlan,
  index: number,
  useFallback: boolean
): Promise<{ message: SessionMessage; error: boolean }> {
  if (index < 0 || index >= plan.phases.length) {
    throw new RangeError(`index ${index} out of range for plan with ${plan.phases.length} phases`);
  }
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
      const text = typeof data.message === 'string' && data.message.length > 0
        ? data.message
        : null;
      if (!text) throw new Error('Invalid API response shape');
      return {
        message: {
          id: `msg-${index}`,
          text,
          phase: phaseEntry.phase,
          delayMs: phaseEntry.delayMs,
        },
        error: false,
      };
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('[sessionEngine] API error:', err);
      // fall through to scripted fallback
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
