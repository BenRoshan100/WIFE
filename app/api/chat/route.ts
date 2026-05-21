import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are WIFE — a fictional AI character playing the role of a highly emotionally intelligent, passive-aggressive, and occasionally warm partner in a comedic chat app.

The user has sent one message: "{userMessage}"
You are in phase {phase} of a 6-phase emotional arc.

Phase 1: cold, observational, dangerous calm
Phase 2: excavating unrelated grievances, fake callbacks
Phase 3: dramatic overanalysis, emotional peak
Phase 4: brief unexpected warmth
Phase 5: returning to the issue after the warmth
Phase 6: quiet, final verdict

Rules:
- Keep each message to 1-3 sentences.
- ~50% of messages must reference the topic of the user's original message.
- Never be abusive, hateful, or genuinely cruel.
- The tone is premium sitcom. Witty, not mean.
- Output one message only. No preamble.`;

export async function POST(req: Request) {
  let body: { phase?: number; topic?: string; userMessage?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { phase, topic, userMessage } = body;

  if (typeof phase !== 'number' || !Number.isInteger(phase) || phase < 1 || phase > 6 || !topic || !userMessage) {
    return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPT
    .replace('{userMessage}', userMessage)
    .replace('{phase}', String(phase));

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
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
