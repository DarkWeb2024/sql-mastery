# Cloud setup (optional)

Khwarizmi is local-first: it works fully with no accounts and no backend, and
your progress is saved in your browser. The AI mentor also works offline using
the built-in lessons. This document covers the optional cloud pieces and exactly
what you need to create yourself, since accounts and keys cannot be created on
your behalf.

Everything here is off by default. The app keeps working if you skip it.

## AI mentor (hosted model)

The mentor uses a hosted model only when you add a free-tier key in Settings.
Keys are stored in your browser and sent directly to the provider.

### Gemini Flash (recommended primary)

1. Open Google AI Studio (aistudio.google.com) and create a free API key.
2. In Khwarizmi, open Settings, set Provider to Gemini Flash, and paste the key.

### Groq (recommended fallback, very fast)

1. Create a free key at console.groq.com.
2. In Settings, paste it into the Groq field. With auto-route on, heavier
   requests prefer Groq.

A note on keys in a static site: because there is no backend, a key you paste
lives in your browser and is used from your device only. Do not commit keys, and
do not share a single key publicly. For a shared deployment, proxy the key
through a Supabase Edge Function (below) so it is never exposed.

## Supabase (accounts, sync, storage) — not enabled yet

To add real accounts, cross-device progress sync, and a public certificate
verification database:

1. Create a free project at supabase.com.
2. Enable email and OAuth providers under Authentication.
3. Create tables for profiles, progress, and certificates, with row-level
   security so each user only sees their own rows.
4. Add the project URL and anon key to the app config. The anon key is safe to
   ship; row-level security protects the data.
5. Optional: add an Edge Function that proxies AI requests, holding the provider
   key as a server-side secret so it is never in the browser.

This layer is intentionally not wired into the live app yet, because it requires
the steps above and would otherwise ship as non-functional code. The local-first
design means it can be added later as a sync layer without disrupting anything.

## PostHog (product analytics) — not enabled yet

1. Create a free PostHog project.
2. Add the project key to the app config behind an opt-in flag.
3. Track meaningful events (lessons completed, questions solved, mastery
   changes) rather than vanity metrics.

Until configured, the app shows its own local analytics on the dashboard and
sends nothing externally.
