export default function TermsPage() {
  return (
    <article>
      <p className="eyebrow">The small print, in plain words</p>
      <h1 className="mt-4 mb-5">Terms & conditions</h1>
      <p className="rounded-2xl border border-clay/25 bg-clay/5 p-5 text-cream">
        Draft. These terms need operator and legal review before a public
        production launch. They are not a claim of legal compliance.
      </p>
      <section aria-labelledby="preview">
        <h2 id="preview">1. What you are using</h2>
        <p>
          StudyHub is a study workspace. It includes an account, a focus timer that
          records sessions, a daily four-hour progress indicator, a session log, and
          a distraction-free zen mode. Sessions are stored against your account so
          they survive a reload.
        </p>
        <p>
          Shared rooms, AI assistance, purchases, and verified study statistics are
          not available in this version. Nothing here should be read as a promise
          that they will be.
        </p>
      </section>
      <section aria-labelledby="records">
        <h2 id="records">2. Your study records</h2>
        <p>
          Your topics and sessions are stored on our database, tied to your account.
          They are not a backup service and there is no export yet — keep anything
          important elsewhere. If you delete your account, the rows attached to it go
          with it.
        </p>
        <p>
          Durations are stamped by the server when you start and finish a session, so
          they are consistent between devices. They are still self-reported focus
          time, not proof of attendance or independently verified study. The
          four-hour target is a product default, not health or educational advice.
          Take breaks and choose a workload that fits your circumstances.
        </p>
      </section>
      <section aria-labelledby="use">
        <h2 id="use">3. Responsible use</h2>
        <p>
          Use the service lawfully. Do not interfere with its operation or other
          people’s access, and do not try to inflate or forge study records. Do not
          enter confidential information, or information you do not have permission
          to use, as a study topic.
        </p>
        <p>
          You are responsible for keeping your sign-in method secure. One account per
          person; do not share credentials.
        </p>
      </section>
      <section aria-labelledby="availability">
        <h2 id="availability">4. Availability and changes</h2>
        <p>
          The service may change or be withdrawn. Bugs, interruptions, and lost
          sessions are possible. No uptime, academic outcome, or data-retention
          guarantee is offered. Nothing here is intended to remove rights that
          applicable law does not allow to be waived.
        </p>
      </section>
      <section aria-labelledby="launch">
        <h2 id="launch">5. Before production</h2>
        <p>
          Production terms must identify the operator and a working contact channel,
          specify applicable jurisdiction and age requirements, and reflect any
          account, payment, moderation, or third-party features actually deployed.
          Those details are not established here.
        </p>
      </section>
    </article>
  );
}
