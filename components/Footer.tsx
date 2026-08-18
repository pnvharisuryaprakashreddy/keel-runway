import Link from "next/link";
import { KeelMark } from "./KeelMark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <Link className="wordmark" href="/">
          <KeelMark />
          keel
        </Link>
        <p style={{ margin: 0, maxWidth: 520, lineHeight: 1.5 }}>
          Acdyon take-home: a homepage and a public-API ingest pipeline. No
          fabricated social proof, no LinkedIn scrape.
        </p>
      </div>
      <div className="boat-dock" aria-hidden="true">
        <svg className="boat" viewBox="0 0 32 16" fill="none">
          <path
            d="M2 8h28L24 14H8L2 8Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M16 8V2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M16 2l6 6H10L16 2Z" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
    </footer>
  );
}
