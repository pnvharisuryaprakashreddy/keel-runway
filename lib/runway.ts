export type Direction = "in" | "out";
export type Certainty = "committed" | "expected";

export type Line = {
  id: string;
  label: string;
  detail: string;
  amount: number;
  direction: Direction;
  date: string;
  certainty: Certainty;
  /** Unpaid invoice — excluded unless the reader chooses to count it. */
  unpaid?: boolean;
  deferrable?: boolean;
};

export const TODAY = "2026-08-19";
export const STARTING_CASH = 11840;
export const RESERVE = 5000;
export const HORIZON_DAYS = 120;
export const STUDIO_NAME = "North & Pine";

export const LINES: Line[] = [
  {
    id: "rent-sep",
    label: "Studio rent",
    detail: "Pearl Street",
    amount: 2900,
    direction: "out",
    date: "2026-09-01",
    certainty: "committed",
    deferrable: true,
  },
  {
    id: "soft-sep",
    label: "Figma & Adobe",
    detail: "Monthly stack",
    amount: 112,
    direction: "out",
    date: "2026-09-01",
    certainty: "committed",
  },
  {
    id: "northwell-sep",
    label: "Northwell retainer",
    detail: "Monthly, signed",
    amount: 3600,
    direction: "in",
    date: "2026-09-01",
    certainty: "committed",
  },
  {
    id: "priya-sep",
    label: "Priya — studio days",
    detail: "Contract, 8 days",
    amount: 2400,
    direction: "out",
    date: "2026-09-03",
    certainty: "committed",
    deferrable: true,
  },
  {
    id: "lot12",
    label: "Lot 12 invoice",
    detail: "Sent 9 Aug · net 30",
    amount: 4800,
    direction: "in",
    date: "2026-09-08",
    certainty: "committed",
    unpaid: true,
  },
  {
    id: "ins",
    label: "Liability insurance",
    detail: "Quarterly",
    amount: 640,
    direction: "out",
    date: "2026-09-12",
    certainty: "committed",
  },
  {
    id: "tax",
    label: "Estimated tax",
    detail: "Q3 set-aside",
    amount: 3100,
    direction: "out",
    date: "2026-09-15",
    certainty: "committed",
  },
  {
    id: "stripe",
    label: "Shop — Stripe",
    detail: "Not yet settled",
    amount: 1140,
    direction: "in",
    date: "2026-09-22",
    certainty: "expected",
  },
  {
    id: "rent-oct",
    label: "Studio rent",
    detail: "Pearl Street",
    amount: 2900,
    direction: "out",
    date: "2026-10-01",
    certainty: "committed",
    deferrable: true,
  },
  {
    id: "soft-oct",
    label: "Figma & Adobe",
    detail: "Monthly stack",
    amount: 112,
    direction: "out",
    date: "2026-10-01",
    certainty: "committed",
  },
  {
    id: "northwell-oct",
    label: "Northwell retainer",
    detail: "Monthly, signed",
    amount: 3600,
    direction: "in",
    date: "2026-10-01",
    certainty: "committed",
  },
  {
    id: "priya-oct",
    label: "Priya — studio days",
    detail: "Contract, 8 days",
    amount: 2400,
    direction: "out",
    date: "2026-10-03",
    certainty: "committed",
    deferrable: true,
  },
  {
    id: "mural",
    label: "Westside mural",
    detail: "Verbal only · not signed",
    amount: 9000,
    direction: "in",
    date: "2026-10-18",
    certainty: "expected",
  },
  {
    id: "rent-nov",
    label: "Studio rent",
    detail: "Pearl Street",
    amount: 2900,
    direction: "out",
    date: "2026-11-01",
    certainty: "committed",
    deferrable: true,
  },
  {
    id: "soft-nov",
    label: "Figma & Adobe",
    detail: "Monthly stack",
    amount: 112,
    direction: "out",
    date: "2026-11-01",
    certainty: "committed",
  },
  {
    id: "northwell-nov",
    label: "Northwell retainer",
    detail: "Monthly, signed",
    amount: 3600,
    direction: "in",
    date: "2026-11-01",
    certainty: "committed",
  },
  {
    id: "priya-nov",
    label: "Priya — studio days",
    detail: "Contract, 8 days",
    amount: 2400,
    direction: "out",
    date: "2026-11-03",
    certainty: "committed",
    deferrable: true,
  },
];

export type BoardOptions = {
  includeUnpaid: boolean;
  includeExpected: boolean;
  deferredIds: ReadonlySet<string>;
};

const DAY_MS = 86_400_000;

export function addDays(iso: string, days: number): string {
  const t = Date.parse(`${iso}T00:00:00Z`) + days * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS,
  );
}

function isCounted(line: Line, opts: BoardOptions): boolean {
  if (line.unpaid && !opts.includeUnpaid) return false;
  if (line.certainty === "expected" && !opts.includeExpected) return false;
  return true;
}

export function effectiveDate(line: Line, deferredIds: ReadonlySet<string>): string {
  return deferredIds.has(line.id) ? addDays(line.date, 14) : line.date;
}

export type Projection = {
  /** Days until cash falls below reserve. Null if it never does inside the horizon. */
  runwayDays: number | null;
  breachDate: string | null;
  series: number[];
  /** Cash after applying each day's events, keyed by ISO date. */
  cashByDate: Map<string, number>;
};

export function project(opts: BoardOptions): Projection {
  const events = LINES.filter((line) => isCounted(line, opts)).map((line) => ({
    date: effectiveDate(line, opts.deferredIds),
    delta: line.direction === "in" ? line.amount : -line.amount,
  }));

  const byDate = new Map<string, number>();
  for (const event of events) {
    byDate.set(event.date, (byDate.get(event.date) ?? 0) + event.delta);
  }

  const series: number[] = [];
  const cashByDate = new Map<string, number>();
  let cash = STARTING_CASH;
  let runwayDays: number | null = null;
  let breachDate: string | null = null;

  for (let i = 0; i <= HORIZON_DAYS; i++) {
    const date = addDays(TODAY, i);
    cash += byDate.get(date) ?? 0;
    series.push(cash);
    cashByDate.set(date, cash);
    if (runwayDays === null && cash < RESERVE) {
      runwayDays = i;
      breachDate = date;
    }
  }

  return { runwayDays, breachDate, series, cashByDate };
}

export const DEFAULT_RUNWAY = project({
  includeUnpaid: false,
  includeExpected: false,
  deferredIds: new Set(),
}).runwayDays;
