export type SourceName = "remoteok" | "arbeitnow" | "remotive";

export type SourceStatus = "ok" | "empty" | "error" | "timeout" | "skipped";

export type SourceReport = {
  name: SourceName;
  role: "primary" | "fallback";
  status: SourceStatus;
  count: number;
  latencyMs: number;
  error?: string;
};

export type Job = {
  id: string;
  source: SourceName;
  title: string;
  company: string;
  location: string;
  url: string;
  tags: string[];
  postedAt: string | null;
};

export type IngestResult = {
  fetchedAt: string;
  fromCache: boolean;
  jobs: Job[];
  sources: SourceReport[];
  primaryAlive: boolean;
  usedFallback: boolean;
  note: string;
};
