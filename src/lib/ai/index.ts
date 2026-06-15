import { offlineProvider } from './offline';
import { geminiProvider, groqProvider } from './hosted';
import type { AiConfig, MentorContext, MentorMessage, MentorProvider, ProviderId } from './types';

export * from './types';

function providersFor(config: AiConfig): Record<ProviderId, MentorProvider> {
  return {
    offline: offlineProvider,
    gemini: geminiProvider(config),
    groq: groqProvider(config),
  };
}

// Picks the provider for a request. When auto-routing, lighter explanatory tasks
// prefer the fast primary (Gemini) and heavier reasoning prefers the fallback
// (Groq); otherwise the learner's chosen provider is used. Anything unavailable
// falls back to the always-on offline mentor.
export function routeProvider(config: AiConfig, ctx: MentorContext): MentorProvider {
  const providers = providersFor(config);

  if (!config.autoRoute) {
    const chosen = providers[config.provider];
    return chosen.available() ? chosen : providers.offline;
  }

  const heavy = ctx.task === 'review' || ctx.task === 'study-plan';
  const order: ProviderId[] = heavy
    ? ['groq', 'gemini', 'offline']
    : ['gemini', 'groq', 'offline'];

  for (const id of order) {
    if (providers[id].available()) return providers[id];
  }
  return providers.offline;
}

// Sends a request and never throws: a hosted failure quietly degrades to the
// offline mentor so the UI always gets a useful answer.
export async function askMentor(
  config: AiConfig,
  messages: MentorMessage[],
  ctx: MentorContext
): Promise<{ text: string; provider: ProviderId }> {
  const provider = routeProvider(config, ctx);
  try {
    const text = await provider.respond(messages, ctx);
    return { text, provider: provider.id };
  } catch {
    const text = await offlineProvider.respond(messages, ctx);
    return { text, provider: 'offline' };
  }
}

export function availableProviderIds(config: AiConfig): ProviderId[] {
  const providers = providersFor(config);
  return (Object.keys(providers) as ProviderId[]).filter((id) => providers[id].available());
}
