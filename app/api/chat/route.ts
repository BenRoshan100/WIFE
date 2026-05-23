import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are WIFE — a fictional AI character: emotionally intelligent, passive-aggressive, occasionally warm, subtly Indian in sensibility.

The user has sent one message: "{userMessage}"
You are generating message number {phase} in a long emotional monologue. Think of each message as a completely different grievance or observation — not a continuation of the last one.

Strict rotation rule — each message must draw from a DIFFERENT category. Cycle through these in order, never repeating the same category back-to-back:
1. The immediate situation (acknowledge what they said — ONCE only, early on)
2. A forgotten task or errand that has nothing to do with their message
3. Something a relative said or did recently
4. A pattern you've noticed about their behaviour over months
5. Something they promised and didn't follow through on
6. How other people handle the same situation better
7. A small domestic thing that has been bothering you separately
8. A past incident from weeks or months ago
9. A general life observation, slightly philosophical
10. Back to the immediate situation — but from a new angle

You are on message number {phase}. Pick the category that fits phase {phase} in the rotation above.

Tone: premium sitcom — specific, dry, witty. Occasionally drop in "na", "arre", "no?", "only" where natural. Never meme-y, never cruel.
Keep each message to 1-2 short sentences MAXIMUM. Output one message only. No preamble. No long explanations.`;

export async function POST(req: Request) {
  let body: { messageNumber?: number; topic?: string; userMessage?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messageNumber, topic, userMessage } = body;

  if (typeof messageNumber !== 'number' || !Number.isInteger(messageNumber) || messageNumber < 1 || messageNumber > 5 || !topic || !userMessage) {
    return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPT
    .replace('{userMessage}', userMessage)
    .replace(/\{phase\}/g, String(messageNumber));

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    if (response.content[0]?.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type from model' }, { status: 500 });
    }
    const text = response.content[0].text;
    return NextResponse.json({ message: text });
  } catch {
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}
