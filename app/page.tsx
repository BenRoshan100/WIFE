'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatBubble from '@/components/ChatBubble';
import TypingIndicator from '@/components/TypingIndicator';
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
  const sessionIdRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, showTyping, summary]);

  const handleSend = async () => {
    if (!input.trim() || appState !== 'idle') return;

    const mySession = ++sessionIdRef.current;

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
      if (sessionIdRef.current !== mySession) return;

      const { message, error } = await getNextMessage(plan, i, useFallback);
      if (sessionIdRef.current !== mySession) return;
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
    if (appState !== 'done') return;
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
    sessionIdRef.current++;
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

  const isIdle = appState === 'idle';

  return (
    <motion.main
      className="min-h-screen flex flex-col max-w-lg mx-auto"
      animate={{ backgroundColor: isIdle ? '#FFFFFF' : '#0D0D0D' }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      <header className="px-6 py-5 flex-shrink-0">
        <motion.h1
          className="text-lg uppercase"
          animate={{ color: isIdle ? '#0D0D0D' : '#E8E8E8' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.35em' }}
        >
          WIFE
        </motion.h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        <AnimatePresence initial={false}>
          {displayMessages.map((msg) => (
            <ChatBubble key={msg.id} text={msg.text} isUser={msg.isUser} />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {showTyping && (
            <motion.div
              key="typing-indicator"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 px-4 pb-8 pt-2 space-y-4">
        {appState === 'resolved' && summary && (
          <SummaryCard
            summary={summary}
            onStartOver={handleStartOver}
            onShare={handleShare}
          />
        )}

        {appState === 'idle' && !input.trim() && (
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "I'll be late to home from work",
              "What's for dinner?",
              "Can we go out for a movie tonight?",
              "I forgot to call you back",
              "I'm too tired to talk right now",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="px-3 py-1.5 rounded-full text-xs transition-opacity hover:opacity-70"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0,0,0,0.15)',
                  color: 'rgba(0,0,0,0.5)',
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {appState !== 'resolved' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (appState === 'idle') handleSend();
              else if (appState === 'done') handleSorry();
            }}
            className="flex gap-2"
          >
            <input
              autoFocus
              type="text"
              value={appState === 'idle' ? input : ''}
              onChange={(e) => appState === 'idle' && setInput(e.target.value)}
              placeholder={
                appState === 'idle'
                  ? 'Say something...'
                  : appState === 'streaming'
                  ? 'WIFE is talking...'
                  : 'Say sorry to unlock...'
              }
              readOnly={appState !== 'idle'}
              className="flex-1 px-4 py-3 rounded-full text-sm outline-none"
              style={{
                background:
                  appState === 'idle'
                    ? 'rgba(0,0,0,0.05)'
                    : 'rgba(255,255,255,0.05)',
                border:
                  appState === 'idle'
                    ? '1px solid rgba(0,0,0,0.15)'
                    : '1px solid rgba(255,255,255,0.08)',
                color: appState === 'idle' ? '#0D0D0D' : 'rgba(255,255,255,0.25)',
                cursor: appState !== 'idle' ? 'not-allowed' : 'text',
              }}
            />
            <button
              type="submit"
              disabled={appState === 'streaming' || (appState === 'idle' && !input.trim())}
              className="px-5 py-3 rounded-full text-sm font-medium disabled:opacity-30 transition-opacity"
              style={{ background: 'var(--accent)', color: '#0D0D0D', whiteSpace: 'nowrap' }}
            >
              {appState === 'done' ? "I'm sorry" : 'Send'}
            </button>
          </form>
        )}
      </div>
    </motion.main>
  );
}
