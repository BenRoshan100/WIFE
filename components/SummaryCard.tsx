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
