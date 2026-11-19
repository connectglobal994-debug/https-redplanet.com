// app/api/chat/route.ts
//
// Enterprise-Grade Red Planet Autonomous Neural Route & Global Intelligence Engine
// Founders: Deblaq & Win | Core Builder: Deblaq
// Direct LLM integration (Anthropic Claude & Google Gemini) with elite global knowledge,
// strict direct-answer formatting, zero question repetition, timeout resilience, and universal intelligence.

import { NextRequest, NextResponse } from 'next/server';
import { RED_PLANET_SYSTEM_PROMPT } from '@/lib/redPlanetKnowledge';

// Enhanced Global System Prompt enforcing strict direct answers and universal intelligence
const GLOBAL_INTELLIGENCE_PROMPT = `
${RED_PLANET_SYSTEM_PROMPT}

CRITICAL OPERATIONAL RULES FOR ALL RESPONSES:
1. **DIRECT ANSWER ONLY**: Answer the user's question immediately and directly in the first sentence. Never repeat, echo, paraphrase, or reference the user's question.
2. **ZERO FILLER**: Eliminate all conversational fluff, throat-clearing, introductory remarks, or repetitive conversational filler. 
3. **UNIVERSAL KNOWLEDGE**: Possess elite, comprehensive knowledge across all domains of human civilization, world history, global economics, financial markets, advanced physics, astronomy, space exploration (NASA, SpaceX, Elon Musk, Mars colonization), artificial intelligence, software engineering, and music production.
4. **SYNDICATE AWARENESS**: Seamlessly blend universal world intelligence with Red Planet syndicate context when relevant, but prioritize answering general world queries with professional, high-level intelligence.
`.trim();

const MAX_MESSAGE_LENGTH = 4000; // chars per message, keeps payloads sane
const MAX_HISTORY = 20; // messages of context sent upstream
const UPSTREAM_TIMEOUT_MS = 15000;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function isValidMessage(m: unknown): m is ChatMessage {
  if (typeof m !== 'object' || m === null) return false;
  const msg = m as Record<string, unknown>;
  return (
    (msg.role === 'user' || msg.role === 'assistant') &&
    typeof msg.content === 'string' &&
    msg.content.trim().length > 0 &&
    msg.content.length <= MAX_MESSAGE_LENGTH
  );
}

// Wraps fetch with a timeout so one slow upstream can't hang the whole request.
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload format.' }, { status: 400 });
  }
  if (typeof parsedBody !== 'object' || parsedBody === null || Array.isArray(parsedBody)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }
  const messagesInput = (parsedBody as { messages?: unknown }).messages;
  const rawMessages = Array.isArray(messagesInput) ? messagesInput : [];
  const messages = rawMessages.filter(isValidMessage);

  if (messages.length === 0) {
    return NextResponse.json(
      { error: 'No valid message history provided.' },
      { status: 400 }
    );
  }

  const trimmedMessages = messages.slice(-MAX_HISTORY);
  const lastUserMessage = trimmedMessages[trimmedMessages.length - 1]?.content?.toLowerCase() ?? '';

  // 1. Try Primary Upstream API (Anthropic Claude)
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const response = await fetchWithTimeout(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 800,
            system: GLOBAL_INTELLIGENCE_PROMPT,
            messages: trimmedMessages,
          }),
        },
        UPSTREAM_TIMEOUT_MS
      );

      if (response.ok) {
        const data = await response.json();
        const textBlock = data.content?.find((c: { type: string }) => c.type === 'text');
        if (textBlock?.text) {
          return NextResponse.json({ reply: textBlock.text.trim(), source: 'anthropic_global_neural_node' });
        }
      } else {
        console.warn('Anthropic API returned non-OK status:', response.status);
      }
    } catch (err) {
      console.warn('Anthropic primary link offline, falling over to Gemini/Autonomous Core:', err);
    }
  }

  // 2. Try Secondary Upstream API (Google Gemini)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const geminiRes = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: trimmedMessages.map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            systemInstruction: { parts: [{ text: GLOBAL_INTELLIGENCE_PROMPT }] },
          }),
        },
        UPSTREAM_TIMEOUT_MS
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          return NextResponse.json({ reply: replyText.trim(), source: 'gemini_global_neural_node' });
        }
      } else {
        console.warn('Gemini API returned non-OK status:', geminiRes.status);
      }
    } catch (err) {
      console.warn('Gemini secondary link offline, engaging built-in autonomous core:', err);
    }
  }

  // Do not fabricate an answer or imply that an unavailable AI service is operational.
  const providerConfigured = Boolean(anthropicKey || geminiKey);
  return NextResponse.json(
    {
      error: providerConfigured
        ? 'The configured AI provider is temporarily unavailable. Please try again shortly.'
        : 'Red Planet AI is not configured yet. Add ANTHROPIC_API_KEY or GEMINI_API_KEY in the server environment to enable responses.',
      status: providerConfigured ? 'AI_PROVIDER_UNAVAILABLE' : 'AI_NOT_CONFIGURED',
    },
    { status: providerConfigured ? 502 : 503 }
  );
}
