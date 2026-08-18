import type { IngestResult, Job, SourceName, SourceReport, SourceStatus } from "./types";

const USER_AGENT =
  "KeelIngest/1.0 (Acdyon take-home; +https://github.com/pnvharisuryaprakashreddy/keel-runway)";

const TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 5 * 60 * 1_000;
const MIN_ORIGIN_GAP_MS = 15_000;
const CIRCUIT_MS = 15 * 60 * 1_000;
const MAX_JOBS = 40;

type SourceConfig = {
  name: SourceName;
  role: "primary" | "fallback";
  url: string;
  parse: (payload: unknown) => Job[];
};

const SOURCES: SourceConfig[] = [
  {
    name: "remoteok",
    role: "primary",
    url: "https://remoteok.com/api",
    parse: parseRemoteOK,
  },
  {
    name: "arbeitnow",
    role: "fallback",
    url: "https://www.arbeitnow.com/api/job-board-api",
    parse: parseArbeitnow,
  },
  {
    name: "remotive",
    role: "fallback",
    url: "https://remotive.com/api/remote-jobs",
    parse: parseRemotive,
  },
];

type Circuit = { openUntil: number; reason: string };
const circuits = new Map<SourceName, Circuit>();
let cache: { storedAt: number; result: IngestResult } | null = null;
let lastOriginAt = 0;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => asString(tag).toLowerCase())
    .filter(Boolean)
    .slice(0, 6);
}

function jobOrNull(partial: {
  source: SourceName;
  rawId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  tags: string[];
  postedAt: string | null;
}): Job | null {
  if (!partial.title || !partial.company || !partial.url) return null;
  if (!partial.url.startsWith("http")) return null;
  return {
    id: `${partial.source}:${partial.rawId || partial.url}`,
    source: partial.source,
    title: partial.title,
    company: partial.company,
    location: partial.location || "Remote",
    url: partial.url,
    tags: partial.tags,
    postedAt: partial.postedAt,
  };
}

function parseRemoteOK(payload: unknown): Job[] {
  if (!Array.isArray(payload)) throw new Error("RemoteOK: expected an array");
  const jobs: Job[] = [];
  for (const row of payload) {
    const rec = asRecord(row);
    if (!rec || "legal" in rec) continue;
    const parsed = jobOrNull({
      source: "remoteok",
      rawId: String(rec.id ?? rec.slug ?? ""),
      title: asString(rec.position),
      company: asString(rec.company),
      location: asString(rec.location),
      url: asString(rec.url) || asString(rec.apply_url),
      tags: asTags(rec.tags),
      postedAt: asString(rec.date) || null,
    });
    if (parsed) jobs.push(parsed);
  }
  return jobs;
}

function parseArbeitnow(payload: unknown): Job[] {
  const rec = asRecord(payload);
  const rows = rec && Array.isArray(rec.data) ? rec.data : null;
  if (!rows) throw new Error("Arbeitnow: expected { data: [] }");
  const jobs: Job[] = [];
  for (const row of rows) {
    const item = asRecord(row);
    if (!item) continue;
    const parsed = jobOrNull({
      source: "arbeitnow",
      rawId: asString(item.slug),
      title: asString(item.title),
      company: asString(item.company_name),
      location: asString(item.location),
      url: asString(item.url),
      tags: asTags(item.tags),
      postedAt: asString(item.created_at) || null,
    });
    if (parsed) jobs.push(parsed);
  }
  return jobs;
}

function parseRemotive(payload: unknown): Job[] {
  const rec = asRecord(payload);
  const rows = rec && Array.isArray(rec.jobs) ? rec.jobs : null;
  if (!rows) throw new Error("Remotive: expected { jobs: [] }");
  const jobs: Job[] = [];
  for (const row of rows) {
    const item = asRecord(row);
    if (!item) continue;
    const parsed = jobOrNull({
      source: "remotive",
      rawId: String(item.id ?? ""),
      title: asString(item.title),
      company: asString(item.company_name),
      location: asString(item.candidate_required_location),
      url: asString(item.url),
      tags: asTags(item.tags),
      postedAt: asString(item.publication_date) || null,
    });
    if (parsed) jobs.push(parsed);
  }
  return jobs;
}

async function fetchSource(
  source: SourceConfig,
  simulate?: SourceName,
): Promise<{ jobs: Job[]; report: SourceReport }> {
  const started = Date.now();
  const trip = circuits.get(source.name);
  if (simulate === source.name || (trip && trip.openUntil > Date.now())) {
    return {
      jobs: [],
      report: {
        name: source.name,
        role: source.role,
        status: "skipped",
        count: 0,
        latencyMs: 0,
        error:
          simulate === source.name
            ? "Simulated block (demo switch)"
            : `Circuit open: ${trip?.reason}`,
      },
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "User-Agent": USER_AGENT,
      },
      cache: "no-store",
    });

    if (response.status === 429 || response.status === 403) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const openFor = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : CIRCUIT_MS;
      circuits.set(source.name, {
        openUntil: Date.now() + openFor,
        reason: `HTTP ${response.status}`,
      });
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload: unknown = await response.json();
    const jobs = source.parse(payload);
    const status: SourceStatus = jobs.length === 0 ? "empty" : "ok";
    if (status === "empty") {
      circuits.set(source.name, {
        openUntil: Date.now() + 60_000,
        reason: "empty payload",
      });
    } else {
      circuits.delete(source.name);
    }

    return {
      jobs,
      report: {
        name: source.name,
        role: source.role,
        status,
        count: jobs.length,
        latencyMs: Date.now() - started,
      },
    };
  } catch (error) {
    const aborted =
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("abort"));
    const message = error instanceof Error ? error.message : "unknown error";
    return {
      jobs: [],
      report: {
        name: source.name,
        role: source.role,
        status: aborted ? "timeout" : "error",
        count: 0,
        latencyMs: Date.now() - started,
        error: aborted ? `Timed out after ${TIMEOUT_MS}ms` : message,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

function dedupe(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  const out: Job[] = [];
  for (const job of jobs) {
    const key = `${job.company.toLowerCase()}|${job.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(job);
    if (out.length >= MAX_JOBS) break;
  }
  return out;
}

export type IngestOptions = {
  /** Force a named source into the skipped state so fallback is visible. */
  simulate?: SourceName;
  force?: boolean;
};

export async function runIngest(options: IngestOptions = {}): Promise<IngestResult> {
  const now = Date.now();
  const canUseCache =
    !options.force &&
    !options.simulate &&
    cache !== null &&
    now - cache.storedAt < CACHE_TTL_MS;

  if (canUseCache && cache) {
    return { ...cache.result, fromCache: true };
  }

  const sinceOrigin = now - lastOriginAt;
  if (!options.force && !options.simulate && lastOriginAt && sinceOrigin < MIN_ORIGIN_GAP_MS && cache) {
    return { ...cache.result, fromCache: true };
  }

  lastOriginAt = now;

  const reports: SourceReport[] = [];
  const collected: Job[] = [];

  const primary = SOURCES[0];
  const primaryResult = await fetchSource(primary, options.simulate);
  reports.push(primaryResult.report);
  collected.push(...primaryResult.jobs);

  const primaryAlive = primaryResult.report.status === "ok";

  if (!primaryAlive) {
    for (const fallback of SOURCES.slice(1)) {
      const result = await fetchSource(fallback, options.simulate);
      reports.push(result.report);
      collected.push(...result.jobs);
      if (result.report.status === "ok") break;
    }
  } else {
    reports.push(
      ...SOURCES.slice(1).map((source) => ({
        name: source.name,
        role: source.role as "fallback",
        status: "skipped" as const,
        count: 0,
        latencyMs: 0,
        error: "Standby — primary returned jobs",
      })),
    );
  }

  const jobs = dedupe(collected);
  const usedFallback = !primaryAlive && jobs.length > 0;
  const allFailed = jobs.length === 0;

  const result: IngestResult = {
    fetchedAt: new Date().toISOString(),
    fromCache: false,
    jobs,
    sources: reports,
    primaryAlive,
    usedFallback,
    note: allFailed
      ? "Every source failed or came back empty. Nothing was invented to fill the table."
      : usedFallback
        ? "Primary source did not return jobs. Serving a fallback board."
        : "Primary source returned jobs. Fallbacks stayed on standby to avoid extra load.",
  };

  if (!options.simulate) {
    cache = { storedAt: Date.now(), result };
  }

  return result;
}

export function parseSimulate(value: string | null): SourceName | undefined {
  if (value === "remoteok" || value === "arbeitnow" || value === "remotive") {
    return value;
  }
  return undefined;
}
