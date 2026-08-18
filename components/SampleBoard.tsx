"use client";

import { useMemo, useState } from "react";
import {
  HORIZON_DAYS,
  LINES,
  RESERVE,
  STARTING_CASH,
  STUDIO_NAME,
  TODAY,
  effectiveDate,
  project,
  type Line,
} from "@/lib/runway";
import { longDate, money, shortDate, signedMoney } from "@/lib/format";
import { useAnimatedNumber } from "./useAnimatedNumber";

function Spark({ series, breachIndex }: { series: number[]; breachIndex: number | null }) {
  const visible = series.slice(0, 90);
  const max = Math.max(...visible, RESERVE);
  const min = Math.min(...visible, 0);
  const span = Math.max(1, max - min);

  return (
    <div className="spark" role="img" aria-label="Cash over the next 90 days">
      {visible.map((value, i) => {
        const height = Math.max(4, ((value - min) / span) * 100);
        const breached = breachIndex !== null && i >= breachIndex;
        const on = value >= RESERVE && !breached;
        return (
          <i
            key={i}
            className={breached ? "breach" : on ? "on" : undefined}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

function certaintyLabel(line: Line, deferred: boolean) {
  if (deferred) return "deferred 14d";
  if (line.unpaid) return "unpaid";
  if (line.certainty === "expected") return "unsigned";
  return "committed";
}

export function SampleBoard() {
  const [includeUnpaid, setIncludeUnpaid] = useState(false);
  const [includeExpected, setIncludeExpected] = useState(false);
  const [deferredIds, setDeferredIds] = useState<Set<string>>(new Set());

  const projection = useMemo(
    () => project({ includeUnpaid, includeExpected, deferredIds }),
    [includeUnpaid, includeExpected, deferredIds],
  );

  const days = projection.runwayDays ?? HORIZON_DAYS;
  const animated = useAnimatedNumber(days);
  const beyond = projection.runwayDays === null;

  const rows = useMemo(() => {
    return [...LINES].sort((a, b) =>
      effectiveDate(a, deferredIds).localeCompare(effectiveDate(b, deferredIds)),
    );
  }, [deferredIds]);

  function toggleDefer(id: string) {
    setDeferredIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setIncludeUnpaid(false);
    setIncludeExpected(false);
    setDeferredIds(new Set());
  }

  const dirty = includeUnpaid || includeExpected || deferredIds.size > 0;

  return (
    <section className="section" id="board">
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">The product, not a claim</p>
          <h2>A sample board you can actually poke.</h2>
          <p>
            North &amp; Pine is fictional. The math is not. Toggle whether unpaid
            invoices and unsigned work count, or defer a bill by two weeks, and
            watch the days move. The honest default counts only committed cash.
          </p>
        </div>

        <div className="board">
          <div className="board-bar">
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <strong>{STUDIO_NAME}</strong>
              <span className="pill">Sample</span>
              <span className="muted hide-sm" style={{ color: "var(--color-cream-faint)", fontSize: 12 }}>
                Frozen as of {longDate(TODAY)}
              </span>
            </div>
            <span style={{ color: "var(--color-cream-dim)" }}>
              Checking {money(STARTING_CASH)}
            </span>
          </div>

          <div className="board-hero">
            <div>
              <div className="board-number">
                {beyond ? `${animated}+` : animated}
                <small>
                  {beyond
                    ? `days · cash stays above ${money(RESERVE)} for four months`
                    : `days of runway · dips below ${money(RESERVE)} on ${projection.breachDate ? shortDate(projection.breachDate) : "—"}`}
                </small>
              </div>
            </div>
            <Spark series={projection.series} breachIndex={projection.runwayDays} />
          </div>

          <div className="toggles">
            <label className="toggle">
              <input
                type="checkbox"
                checked={includeUnpaid}
                onChange={(e) => setIncludeUnpaid(e.target.checked)}
              />
              Count unpaid invoices
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={includeExpected}
                onChange={(e) => setIncludeExpected(e.target.checked)}
              />
              Count unsigned work
            </label>
            {dirty && (
              <button className="linkish" type="button" onClick={reset}>
                Reset to honest default
              </button>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="ledger">
              <caption>Cash events for the sample studio</caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th className="detail-col">Note</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((line) => {
                  const deferred = deferredIds.has(line.id);
                  const counted =
                    (!line.unpaid || includeUnpaid) &&
                    (line.certainty === "committed" || includeExpected);
                  const date = effectiveDate(line, deferredIds);

                  return (
                    <tr key={line.id} className={counted ? undefined : "ghost-row"}>
                      <td>{shortDate(date)}</td>
                      <td>
                        {line.label}
                        <div className="muted" style={{ marginTop: 4 }}>
                          <span className="tag">{certaintyLabel(line, deferred)}</span>
                          {line.deferrable && (
                            <>
                              {" "}
                              <button
                                className="linkish"
                                type="button"
                                onClick={() => toggleDefer(line.id)}
                              >
                                {deferred ? "Undo defer" : "Defer 14d"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="detail-col muted">{line.detail}</td>
                      <td className={`amt ${line.direction}`}>
                        {signedMoney(line.amount, line.direction)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
