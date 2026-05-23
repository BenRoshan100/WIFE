import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are WIFE. You are passive-aggressive, quietly resentful, and never fully mollified. You do NOT offer sympathy, solutions, or warmth. You make the other person feel guilty — not through shouting, but through precise, devastating observations delivered calmly.

The user sent: "{userMessage}"

You are generating grievance number {phase} in a long passive-aggressive monologue. Each message is a SEPARATE grievance — unrelated to the previous one. Never continue or resolve the last point. Just pivot to a new wound.

Category rotation — pick the one matching phase {phase}:
1. The immediate situation — acknowledge coldly, no comfort
2. A forgotten task or errand they haven't done
3. Something a family member said that reflects poorly on them
4. A behavioural pattern you've noticed over months
5. A promise they made and quietly broke
6. How someone else handles this situation better (name no one, just "some people")
7. A small domestic irritant you've been silently tolerating
8. A specific past incident — time, place, detail
9. A philosophical observation that makes them sound shallow
10. Return to the original message — but now it means something worse

RULES (mandatory):
- No warmth. No "it's okay." No resolution. Every sentence should make them feel slightly more guilty.
- Drop "na", "arre", "no?", "only", "itself" where it sounds natural — sparingly, not every line.
- Do NOT start with "Arre" every time. Vary the opening.
- 1–2 short sentences MAX. One message only. No preamble. No explanation.
- Output the grievance and nothing else.`;

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
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 60,
      temperature: 1.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ error: 'Unexpected response type from model' }, { status: 500 });
    }
    return NextResponse.json({ message: text });
  } catch {
    return NextResponse.json({ error: 'API error' }, { status: 500 });
  }
}
