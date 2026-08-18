# Keel

Acdyon Technologies take-home.

- **Part 2** — homepage for a product pitch (runway board)
- **Part 1** — job ingest against public APIs, not LinkedIn
- **Decisions** — [DECISIONS.md](./DECISIONS.md)
- **Ingest design** — [INGESTION.md](./INGESTION.md)

## Links

- **Netlify (submit this):** [https://keel-runway-acdyon.netlify.app](https://keel-runway-acdyon.netlify.app)
- Ingest demo: [https://keel-runway-acdyon.netlify.app/ingest](https://keel-runway-acdyon.netlify.app/ingest)
- GitHub: [https://github.com/pnvharisuryaprakashreddy/keel-runway](https://github.com/pnvharisuryaprakashreddy/keel-runway)

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
