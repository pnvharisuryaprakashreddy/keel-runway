# Keel

Acdyon Technologies take-home.

- **Part 2** — homepage for a product pitch (runway board)
- **Part 1** — job ingest against public APIs, not LinkedIn
- **Decisions** — [DECISIONS.md](./DECISIONS.md)
- **Ingest design** — [INGESTION.md](./INGESTION.md)

## Links

- Netlify (canonical): set after deploy
- GitHub: https://github.com/pnvharisuryaprakashreddy/keel-runway

## Run locally

```bash
npm install
npm run dev
```

- Home: http://localhost:3000
- Ingest: http://localhost:3000/ingest

## What to look at

- Hero + sample board (toggle unpaid invoices, unsigned work, defer a bill)
- `/ingest` — live listings, source health, “simulate primary block”
- Konami code on either page
