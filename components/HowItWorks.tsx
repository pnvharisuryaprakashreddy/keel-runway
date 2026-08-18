export function HowItWorks() {
  return (
    <section className="section" id="how" style={{ paddingTop: 24 }}>
      <div className="wrap">
        <div className="section-head">
          <p className="eyebrow">How the number is made</p>
          <h2>Three rules. No model, no vibe.</h2>
        </div>
        <div className="steps">
          <article className="step">
            <span className="num">01</span>
            <h3>Start with the real balance</h3>
            <p>
              Whatever is in the business account today. Not last month’s
              average, not “if that invoice lands.” The sample starts at $11,840
              because that is the number on the statement.
            </p>
          </article>
          <article className="step">
            <span className="num">02</span>
            <h3>Put cash on a date</h3>
            <p>
              Rent, contractors, retainers, tax. Each line has a day it hits the
              account. Keel walks the calendar forward and subtracts a reserve —
              here, $5,000, about two months of rent.
            </p>
          </article>
          <article className="step">
            <span className="num">03</span>
            <h3>Separate committed from hoped</h3>
            <p>
              Signed retainers count. A mural that was discussed at dinner does
              not, until you say it should. Runway is the first day cash falls
              below the reserve. That is the whole instrument.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
