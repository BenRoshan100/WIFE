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
