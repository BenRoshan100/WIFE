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
