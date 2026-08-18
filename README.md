# Keel

A homepage for a product that does not exist yet: a runway board for independent studios. Built as the Part 2 take-home for Acdyon Technologies.

There is no waitlist and no fake social proof. The sample board is the product.

- Live: [https://pnvharisuryaprakashreddy.github.io/keel-runway/](https://pnvharisuryaprakashreddy.github.io/keel-runway/)
- Repo: [https://github.com/pnvharisuryaprakashreddy/keel-runway](https://github.com/pnvharisuryaprakashreddy/keel-runway)
- Decisions: [DECISIONS.md](./DECISIONS.md)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What to look at

- Hero at 390px and 1440px
- Sample board: toggle unpaid invoices / unsigned work, defer a bill
- The honesty section (intentionally no testimonials)
- One easter egg, the old-game kind

## Stack

Next.js 16, React 19, Tailwind v4, no component library. Cash projection lives in `lib/runway.ts` so the hero number and the board share the same model.
