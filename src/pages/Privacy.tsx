export default function PrivacyPage() {
  return (
    <article>
      <p className="eyebrow">Your desk, your information</p>
      <h1 className="mt-4 mb-5">Privacy notice</h1>
      <p className="rounded-2xl border border-clay/25 bg-clay/5 p-5 text-cream">
        Pending operator review. The operator’s legal name, contact channel, and
        retention periods still need to be filled in before a public launch.
      </p>
      <section aria-labelledby="account-data">
        <h2 id="account-data">What we store when you sign in</h2>
        <p>
          Signing in with Google or an email link creates an account. We keep the
          identity your provider returns — an email address, and for Google a
          display name and avatar — along with a username and an optional bio that
          you write yourself.
        </p>
        <p>
          Every session you record is stored against your account: the topic you
          typed, and the start and end time taken from the server clock. Study
          totals, streaks, and the heatmap are calculated from those rows each time
          you look at them; they are not stored separately.
        </p>
      </section>
      <section aria-labelledby="timing">
        <h2 id="timing">How time is measured</h2>
        <p>
          Session durations come from database timestamps, not your device clock, so
          an incorrect system time cannot change your record. Grouping into calendar
          days uses the time zone of the browser you are viewing from.
        </p>
        <p>
          The browser’s online indicator supplies the connection label. That label
          reflects your network, not the health of the server.
        </p>
      </section>
      <section aria-labelledby="requests">
        <h2 id="requests">Requests made to load the site</h2>
        <p>
          Loading the site sends ordinary requests to its hosting provider, which can
          expose an IP address, browser information, and requested URLs. Supabase
          receives your authentication token and your queries. Google Fonts serves the
          two typefaces, Geist and Space Grotesk, and sees the same kind of request.
        </p>
        <p>
          There is no analytics, no advertising script, and no third-party tracker.
          AI features, when they arrive, will send only the question you submit to a
          single model provider through our own server, never your study records.
        </p>
      </section>
      <section aria-labelledby="choices">
        <h2 id="choices">Your choices</h2>
        <p>
          You can edit or clear your bio and username at any time. Deleting your
          account removes your profile and every session row attached to it. Avoid
          entering sensitive information as a study topic — topics are stored as
          plain text.
        </p>
      </section>
      <section aria-labelledby="future">
        <h2 id="future">Still to be settled</h2>
        <p>
          Before a public launch this notice needs the operator’s identity, a working
          contact channel, the retention period for session rows, the subprocessor
          list, and the rights available to you under applicable law. Shared study
          rooms will make your username and current status visible to other members
          of that room; that will be described here before rooms open.
        </p>
      </section>
    </article>
  );
}
