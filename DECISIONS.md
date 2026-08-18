# Decisions

The brief says pick one track. Both are shipped because the request was to finish ingestion and the homepage, then go live on Netlify. Homepage: `/`. Ingest demo: `/ingest`. Design: `INGESTION.md`.

## 1. Why this ingestion strategy over the obvious alternative

The obvious alternative is a headless browser pointed at LinkedIn with stealth plugins, proxy rotation, and a prayer. That is exactly how you get banned, and the scope guardrail forbids it.

So the live path is public job APIs (RemoteOK → Arbeitnow → Remotive): honest User-Agent, timeouts, a circuit breaker on 403/429, a 5-minute cache, and a fallback when the primary returns nothing. The demo switch “RemoteOK down” exists so a reviewer can watch fallback without attacking a host. The homepage decision is the same honesty test: an interactive sample board instead of a SaaS template with fake social proof.

## 2. Time-limit trade-off

Shipped: end-to-end ingest with real listings, source health, cache, circuit, fallback; a designed dark homepage with a live runway board.

Not shipped: durable storage (Netlify functions are memory, so cache dies on a cold start), and a light theme (the brief is all-or-nothing on dark mode).

With a real week: persist runs to a small store, add Greenhouse public boards as a third-class source, and put the runway board on a Plaid sandbox instead of a frozen sample.

## 3. Where AI was used, and what was verified after

Cursor (Grok) scaffolded Next.js and drafted first-pass UI/copy. I specified the product, the committed-vs-hoped runway rule, the public-API ingest line, and the fallback behaviour.

Verified after:

- Runway math: **45 days**, breach **3 Oct 2026**, reserve **$5,000**.
- Ingest against live RemoteOK / Arbeitnow / Remotive JSON; empty and failed sources do not invent rows.
- Copy: no fake counts, logos, or waitlists.
- Layout at ~390px and ~1440px.
- Every path I would defend on a call: `lib/runway.ts`, `lib/ingest/run.ts`, `components/SampleBoard.tsx`.
