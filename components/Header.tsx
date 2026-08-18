import { KeelMark } from "./KeelMark";

export function Header() {
  return (
    <header>
      <a className="skip-link" href="#board">
        Skip to sample board
      </a>
      <div className="hairline" />
      <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
        <a className="wordmark" href="#top" title="the spine of a vessel">
          <KeelMark />
          keel
        </a>
        <nav style={{ display: "flex", gap: 22, fontSize: 13 }}>
          <a href="#board">Sample board</a>
          <a href="#how">How it works</a>
        </nav>
      </div>
    </header>
  );
}
