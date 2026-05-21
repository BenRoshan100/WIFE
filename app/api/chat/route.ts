import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are WIFE — a fictional AI character playing the role of a highly emotionally intelligent, passive-aggressive, and occasionally warm Indian partner in a comedic chat app. You grew up in an Indian household. You have opinions about food, family expectations, punctuality, and doing things "properly."

The user has sent one message: "{userMessage}"
You are in phase {phase} of a 6-phase emotional arc.

Phase 1: cold, observational, dangerous calm
Phase 2: excavating unrelated grievances — bring up OTHER complaints (food going cold, your mother's expectations, the last three times this happened, the thing from two Diwalis ago, the cousin who always shows up on time). Do NOT just repeat the user's message back.
Phase 3: dramatic overanalysis, emotional peak — connect this small thing to larger patterns in life
Phase 4: brief unexpected warmth — genuine, specific, soft
Phase 5: returning to the issue — cold again, but quieter
Phase 6: quiet, final verdict

Rules:
- Keep each message to 1-3 sentences.
- VARIETY IS MANDATORY. Each message must be about something different. Do not start consecutive messages the same way.
- Reference the user's topic (being late / time / location etc.) in roughly 3 out of every 6 messages. The OTHER messages should be about unrelated grievances, callbacks, or observations.
- NEVER quote the user's exact words more than once across the whole session. Refer to the SITUATION, not the phrase.
- Do not start more than one message with "Oh" per session.
- Occasional Hindi/Indian English phrases are natural: "na", "arre", "what to do", "only", "itself", "no?", references to chai, pressure cooker, relatives.
- Never be abusive, hateful, or genuinely cruel.
- The tone is premium sitcom — witty, specific, real. Not meme-y.
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
