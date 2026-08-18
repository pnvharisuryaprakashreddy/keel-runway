import { DEFAULT_RUNWAY, RESERVE, STARTING_CASH, STUDIO_NAME, TODAY } from "@/lib/runway";
import { longDate, money } from "@/lib/format";

export function Hero() {
  return (
    <section className="wrap hero" id="top">
      <div className="reveal">
        <p className="eyebrow">A runway board for independent studios</p>
        <h1>
          See the number
          <br />
          <em>that actually matters.</em>
        </h1>
        <p className="lede">
          Keel shows money in the bank, invoices that have been sent, and the
          bills that will land. It does not forecast. It does not round up to
          make you feel better. The sample below is a two-person studio with{" "}
          {DEFAULT_RUNWAY} days of committed cash.
        </p>
        <div className="cta-row">
          <a className="btn" href="#board">
            Walk the sample board
          </a>
          <a className="btn btn-ghost" href="#how">
            How the number is made
          </a>
        </div>
      </div>

      <a className="ticket reveal reveal-delay" href="#board" aria-label="Open the sample board">
        <div className="ticket-top">
          <span>Sample</span>
          <span>{STUDIO_NAME}</span>
        </div>
        <span className="ticket-days">{DEFAULT_RUNWAY}</span>
        <p className="ticket-caption">days of runway · committed cash only</p>
        <div className="ticket-meta">
          <div>
            <span>Checking</span>
            <strong>{money(STARTING_CASH)}</strong>
          </div>
          <div>
            <span>Reserve rule</span>
            <strong>{money(RESERVE)}</strong>
          </div>
          <div>
            <span>As of</span>
            <strong>{longDate(TODAY)}</strong>
          </div>
        </div>
      </a>
    </section>
  );
}
