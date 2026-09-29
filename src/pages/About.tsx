export default function AboutPage() {
  return (
    <article>
      <p className="eyebrow">A little room for focus</p>
      <h1 className="mt-4 mb-5">Less app. More studying.</h1>
      <p className="text-lg leading-8 text-cream">
        StudyHub starts with a simple desk: write down what you are studying,
        start the timer, and get on with it.
      </p>
      <section aria-labelledby="design">
        <h2 id="design">Quiet by design</h2>
        <p>
          Warm charcoal, muted matcha, and an illustrated evening window keep the
          screen low-key. Geist carries the interface; Space Grotesk gives the clock
          its character. Motion stays subtle and respects your reduced-motion setting.
        </p>
      </section>
      <section aria-labelledby="available">
        <h2 id="available">Here now</h2>
        <ul>
          <li>A count-up timer with pause, resume, finish, and reset.</li>
          <li>A four-hour daily target based on your device’s local day.</li>
          <li>A session log that stays with your account.</li>
          <li>Zen mode, keyboard controls, and responsive layouts.</li>
        </ul>
      </section>
      <section aria-labelledby="planned">
        <h2 id="planned">Not here yet</h2>
        <p>
          Shared rooms, ambient audio, AI study tools, public profiles, and
          installable offline support are planned, not working features yet. The
          room panel shows an honest empty state rather than invented people.
        </p>
      </section>
    </article>
  );
}
