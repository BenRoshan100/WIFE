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
