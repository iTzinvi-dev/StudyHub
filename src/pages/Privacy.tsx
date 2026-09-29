export default function PrivacyPage() {
  return (
    <article>
      <p className="eyebrow">Your desk, your information</p>
      <h1 className="mt-4 mb-5">Privacy notice</h1>
      <p className="rounded-2xl border border-clay/25 bg-clay/5 p-5 text-cream">
        Preview notice, pending operator review. Hosting arrangements, contact details,
        and production data practices must be confirmed before launch.
      </p>
      <section aria-labelledby="local-data">
        <h2 id="local-data">What stays in your browser</h2>
        <p>
          The study topic you enter, session intervals, and session log are held in
          page memory. This implementation does not send them to an application
          backend or save them in cookies, local storage, or a database. They disappear
          when you leave or reload the page.
        </p>
        <p>
          Your device clock supplies the timer and local-day boundary. The browser’s
          online indicator supplies the connection label; that label does not verify
          connectivity to a server. The room preview uses fictional people, not live users.
        </p>
      </section>
      <section aria-labelledby="requests">
        <h2 id="requests">Requests needed to load the site</h2>
        <p>
          Loading the site sends ordinary requests to its hosting provider. Such
          requests can expose an IP address, browser information, and requested URLs
          to that provider. Its log retention and processing arrangements depend on
          the eventual deployment and are not yet confirmed here.
        </p>
        <p>
          The application uses Next.js font loading to serve Geist and Space Grotesk
          with the site. It does not embed analytics, advertising scripts, an AI API,
          or Supabase in this preview.
        </p>
      </section>
      <section aria-labelledby="choices">
        <h2 id="choices">Your choices</h2>
        <p>
          You can clear the preview’s study data by reloading or closing the page.
          Avoid entering sensitive information. Clearing the page does not delete
          any records a hosting provider may retain independently.
        </p>
      </section>
      <section aria-labelledby="future">
        <h2 id="future">Before adding accounts or AI</h2>
        <p>
          This notice must be updated before enabling persistent profiles, shared
          rooms, analytics, or AI requests. A production notice must identify the
          operator, relevant providers, processing purposes, retention periods,
          applicable rights, and a working contact channel.
        </p>
      </section>
    </article>
  );
}
