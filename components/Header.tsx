import Link from "next/link";
import { KeelMark } from "./KeelMark";

export function Header({ active = "home" }: { active?: "home" | "ingest" }) {
  return (
    <header>
      <a className="skip-link" href={active === "home" ? "#board" : "#top"}>
        Skip to content
      </a>
      <div className="hairline" />
      <div
        className="wrap"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 64,
        }}
      >
        <Link className="wordmark" href="/" title="the spine of a vessel">
          <KeelMark />
          keel
        </Link>
        <nav style={{ display: "flex", gap: 22, fontSize: 13 }}>
          {active === "home" ? (
            <a href="#board">Sample board</a>
          ) : (
            <Link href="/">Home</Link>
          )}
          <Link href="/ingest" aria-current={active === "ingest" ? "page" : undefined}>
            Ingestion
          </Link>
        </nav>
      </div>
    </header>
  );
}
