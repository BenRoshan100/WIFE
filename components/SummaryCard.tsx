'use client';

import { motion } from 'framer-motion';
import type { SummaryCard as SummaryCardType } from '@/lib/types';

interface Props {
  summary: SummaryCardType;
  onStartOver: () => void;
  onShare: (text: string) => void;
}

export default function SummaryCard({ summary, onStartOver, onShare }: Props) {
  const shareText = 'You cannot reply to WIFE. Just say sorry and move on.\n\nA parody app by Ben. No offence to the wives of the world.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="rounded-2xl p-6 space-y-5 text-center"
      style={{
        background: 'rgba(20, 20, 20, 0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p
        className="text-xs uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}
      >
        The End
      </p>

      <p className="text-sm leading-relaxed" style={{ color: '#E8E8E8' }}>
        You cannot reply to WIFE. Just say sorry and move on.
      </p>

      <p
        className="text-xs"
        style={{ color: 'rgba(255,255,255,0.22)', fontStyle: 'italic' }}
      >
        A parody app by Ben. No offence to the wives of the world.
      </p>

      <div className="flex gap-3 pt-1">
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
