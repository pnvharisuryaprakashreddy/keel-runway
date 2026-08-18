# Decisions

Track: **Part 2 — premium home page.** The brief is a frontend challenge and asks for depth on one track. A scraper demo against a public RSS would have been a thin stand-in for the real problem (LinkedIn-class detection). A page a stranger would want to stare at is the more honest one-hour bet.

## Why this approach, not the obvious alternative

The obvious homepage is a SaaS template: Inter, violet gradient, three feature columns, a fake “Join 12,000 teams” line. That would ship faster and look more “product-y” in a screenshot. It would also fail the honesty axis on contact.

Keel is a made-up product, so the page treats that as a constraint instead of a costume. The hero leads with a number produced by real arithmetic (`lib/runway.ts`), not a marketing claim. The primary CTA scrolls to an interactive sample board — the product, not a claim about the product. Toggles change the model (count unpaid invoices, count unsigned work, defer a bill fourteen days) and the runway figure interpolates. That is the one motion that earns its keep: it is the instrument working, not decoration.

I rejected a screenshot mock and I rejected wiring a real bank feed. A screenshot cannot be poked. A bank feed in an hour would have been a brittle demo of Plaid, not of the idea.

## Time-limit trade-off

Shipped: one committed dark visual system, one interactive board, honest copy, a Konami easter egg.

Not shipped: light theme (the brief is all-or-nothing on dark mode; a designed dark page is safer than a half toggle), persistence, and any account flow — because there is no product to log into.

With a real week: pair the board with a Plaid sandbox (or CSV drop) so the sample can be replaced by the visitor’s own figures; add a print/export of the 90-day walk; test the type and spacing on a physical iPhone and a 1440px monitor instead of DevTools only.

## Where AI was used, and what was verified after

Cursor (Grok) scaffolded Next.js, wrote first-pass markup/CSS, and drafted copy I then cut. I specified the product, the “committed vs hoped” rule, the no-fake-proof constraint, and the boarding-pass hero.

Personally verified after generation:

- Runway math against a hand walk of the sample ledger (default is **45 days**, first breach 3 Oct 2026, reserve $5,000).
- Copy for invented metrics, logos, or waitlists — none remain.
- Layout at ~390px and ~1440px: no horizontal scroll, board becomes a compact table, hero stacks.
- Reduced-motion: number interpolation and the boat animation disable.
- Every file here is something I can walk line-by-line on a call — especially `lib/runway.ts` and `components/SampleBoard.tsx`.
