export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16">
      <p className="eyebrow">404 · A wrong turn</p>
      <h1 className="mt-4 mb-5">This page isn’t here.</h1>
      <p className="mb-8 text-sm leading-7 text-cream/75">
        The address may have changed. Your study desk is still at the front door.
      </p>
      <a className="primary-button self-start" href="/">Back to my desk</a>
    </main>
  );
}
