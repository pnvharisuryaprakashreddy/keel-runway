"use client";

import { useState } from "react";
import type { IngestResult, SourceName } from "@/lib/ingest/types";

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function IngestDemo({ initial }: { initial: IngestResult }) {
  const [data, setData] = useState<IngestResult>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulate, setSimulate] = useState<SourceName | "">("");

  async function load(opts?: { force?: boolean; simulate?: SourceName | "" }) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    const sim = opts?.simulate ?? simulate;
    if (sim) params.set("simulate", sim);
    if (opts?.force) params.set("force", "1");
    try {
      const response = await fetch(`/api/ingest?${params.toString()}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Ingest failed (${response.status})`);
      setData((await response.json()) as IngestResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingest failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" id="top" style={{ paddingTop: 28 }}>
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">Part 1 — ingestion</p>
          <h1 className="ingest-title">Pull listings without picking a fight.</h1>
          <p>
            Live demo against public job APIs (RemoteOK, then Arbeitnow, then
            Remotive). Not LinkedIn, Indeed, Naukri, or Wellfound — those
            properties forbid this, and the brief asked us not to burn an
            account on their behalf.
          </p>
        </div>

        <div className="board">
          <div className="board-bar">
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <strong>Ingest run</strong>
              <span className="pill">{data.fromCache ? "Cache" : "Origin"}</span>
            </div>
            <span style={{ color: "var(--color-cream-dim)" }}>
              {new Date(data.fetchedAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="source-grid">
            {data.sources.map((source) => (
              <article key={source.name} className={`source-card is-${source.status}`}>
                <p className="eyebrow" style={{ marginBottom: 8 }}>
                  {source.role}
                </p>
                <h2>{source.name}</h2>
                <p>
                  {source.status}
                  {source.count ? ` · ${source.count} jobs` : ""}
                  {source.latencyMs ? ` · ${source.latencyMs}ms` : ""}
                </p>
                {source.error ? <p>{source.error}</p> : null}
              </article>
            ))}
          </div>

          <div className="toggles" style={{ alignItems: "center" }}>
            <label className="toggle" style={{ gap: 10 }}>
              Simulate primary block
              <select
                value={simulate}
                onChange={(event) => setSimulate(event.target.value as SourceName | "")}
                style={{
                  background: "#12100e",
                  color: "var(--color-cream)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 4,
                  padding: "6px 8px",
                }}
              >
                <option value="">Off</option>
                <option value="remoteok">RemoteOK down</option>
              </select>
            </label>
            <button
              className="btn"
              type="button"
              onClick={() => void load({ force: true, simulate })}
              disabled={loading}
            >
              {loading ? "Running…" : "Run ingest"}
            </button>
          </div>

          <p className="ingest-note">{data.note}</p>
          {error ? <p className="ingest-note error">{error}</p> : null}

          <div style={{ overflowX: "auto" }}>
            <table className="ledger">
              <caption>Normalized jobs from the current run</caption>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Company</th>
                  <th className="detail-col">Location</th>
                  <th>Source</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <a href={job.url} target="_blank" rel="noreferrer">
                        {job.title}
                      </a>
                    </td>
                    <td>{job.company}</td>
                    <td className="detail-col muted">{job.location}</td>
                    <td>
                      <span className="tag">{job.source}</span>
                    </td>
                    <td className="muted">{formatWhen(job.postedAt)}</td>
                  </tr>
                ))}
                {data.jobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      No jobs. The pipeline refused to invent rows.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
