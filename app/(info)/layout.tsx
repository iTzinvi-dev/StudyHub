import type { ReactNode } from 'react';

export default function InformationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col px-6 py-8 sm:px-10 sm:py-12">
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="mb-14 flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-6">
        <a className="wordmark" href="/" aria-label="StudyHub home">
          <span className="brand-mark" aria-hidden="true">s.</span>
          studyhub
        </a>
        <a className="quiet-button inline-flex items-center" href="/">Back to my desk ↗</a>
      </header>
      <main
        id="content"
        tabIndex={-1}
        className="flex-1 text-sm leading-7 text-cream/80 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-cream [&_p+p]:mt-4 [&_section]:mt-9 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
      >
        {children}
      </main>
      <footer className="mt-14 flex flex-wrap justify-between gap-6 border-t border-white/10 pt-6 text-xs text-cream/70">
        <span>StudyHub · frontend preview</span>
        <nav aria-label="Information" className="flex flex-wrap gap-6">
          <a className="hover:text-matcha" href="/about">About</a>
          <a className="hover:text-matcha" href="/terms">Terms</a>
          <a className="hover:text-matcha" href="/privacy">Privacy</a>
        </nav>
      </footer>
    </div>
  );
}
