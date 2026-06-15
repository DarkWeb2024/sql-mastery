import {
  tutorSystemPrompt,
  type AiConfig,
  type MentorContext,
  type MentorMessage,
  type MentorProvider,
} from './types';

// Hosted providers are called directly over fetch from the browser using a key
// the learner supplies (bring-your-own-key). No SDK, no backend. If a call
// fails, the router falls back to the offline mentor so the feature never breaks.

function buildContextPreamble(ctx: MentorContext): string {
  const parts: string[] = [];
  if (ctx.questionStatement) parts.push(`Current task: ${ctx.questionStatement}`);
  if (ctx.userQuery) parts.push(`Learner's SQL:\n${ctx.userQuery}`);
  if (ctx.lastError) parts.push(`Engine error: ${ctx.lastError}`);
  if (ctx.expectedSummary) parts.push(ctx.expectedSummary);
  return parts.join('\n\n');
}

// Google Gemini uses its own REST shape. We pass the tutor persona as a system
// instruction and map our message roles onto Gemini's user/model roles.
export function geminiProvider(config: AiConfig): MentorProvider {
  return {
    id: 'gemini',
    label: 'Gemini Flash',
    available: () => Boolean(config.geminiKey),
    respond: async (messages: MentorMessage[], ctx: MentorContext) => {
      const preamble = buildContextPreamble(ctx);
      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      if (preamble) contents.unshift({ role: 'user', parts: [{ text: preamble }] });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: tutorSystemPrompt(ctx.profile) }] },
            contents,
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini request failed (${res.status})`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned no text');
      return text as string;
    },
  };
}

// Groq exposes an OpenAI-compatible chat completions API and serves open models
// (Llama, Qwen) at very low latency on a free tier.
export function groqProvider(config: AiConfig): MentorProvider {
  return {
    id: 'groq',
    label: 'Groq (Llama/Qwen)',
    available: () => Boolean(config.groqKey),
    respond: async (messages: MentorMessage[], ctx: MentorContext) => {
      const preamble = buildContextPreamble(ctx);
      const chat = [
        { role: 'system', content: tutorSystemPrompt(ctx.profile) },
        ...(preamble ? [{ role: 'system', content: preamble }] : []),
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.groqKey}`,
        },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: chat, temperature: 0.3 }),
      });
      if (!res.ok) throw new Error(`Groq request failed (${res.status})`);
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error('Groq returned no text');
      return text as string;
    },
  };
}
