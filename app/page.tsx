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
      <header className="px-6 py-5 flex-shrink-0">
        <h1
          className="text-lg uppercase"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#E8E8E8',
            letterSpacing: '0.35em',
          }}
        >
          WIFE
        </h1>
      </header>

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
