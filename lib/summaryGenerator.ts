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
