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
