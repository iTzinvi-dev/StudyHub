export default function TermsPage() {
  return (
    <article>
      <p className="eyebrow">The small print, in plain words</p>
      <h1 className="mt-4 mb-5">Terms & conditions</h1>
      <p className="rounded-2xl border border-clay/25 bg-clay/5 p-5 text-cream">
        Draft for the frontend preview. These terms need operator and legal review
        before a public production launch. They are not a claim of legal compliance.
      </p>
      <section aria-labelledby="preview">
        <h2 id="preview">1. What you are using</h2>
        <p>
          StudyHub is an experimental study interface. This version includes a local
          timer, a daily progress indicator, a session log, and zen mode. Room members
          are fictional sample data. Accounts, multiplayer rooms, AI assistance,
          purchases, and verified study statistics are not available in this version.
        </p>
      </section>
      <section aria-labelledby="records">
        <h2 id="records">2. Your study records</h2>
        <p>
          Topics and sessions stay in the current page’s memory. Reloading, closing,
          or leaving the page clears them. There is no backup or recovery service.
          Keep any important study records elsewhere.
        </p>
        <p>
          Time is calculated using your device clock and local calendar day. It is
          not proof of attendance or independently verified study. The four-hour
          target is a product default, not health or educational advice. Take breaks
          and choose a workload that fits your circumstances.
        </p>
      </section>
      <section aria-labelledby="use">
        <h2 id="use">3. Responsible use</h2>
        <p>
          Use the preview lawfully. Do not interfere with its operation or other
          people’s access. Do not enter confidential information or information you
          do not have permission to use.
        </p>
      </section>
      <section aria-labelledby="availability">
        <h2 id="availability">4. Availability and changes</h2>
        <p>
          The interface may change or be withdrawn. Bugs, interruptions, and lost
          sessions are possible. No uptime, academic outcome, or data-retention
          guarantee is offered for this preview. Nothing here is intended to remove
          rights that applicable law does not allow to be waived.
        </p>
      </section>
      <section aria-labelledby="launch">
        <h2 id="launch">5. Before production</h2>
        <p>
          Production terms must identify the operator and a working contact channel,
          specify applicable jurisdiction and age requirements, and reflect any
          account, payment, moderation, or third-party features actually deployed.
          Those details are not established in this preview.
        </p>
      </section>
    </article>
  );
}
