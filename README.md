# Velorah® — Cinematic Landing Page

Fullscreen looping background video, glassmorphic navigation, cinematic serif
type. The hero screen carries no blobs or overlays — the footage provides all
the visual depth. Below it sit four content sections the nav actually links to.

**Stack:** React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · shadcn/ui

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Script            | What it does                                                                  |
| ----------------- | ------------------------------------------------------------------------------ |
| `npm run dev`     | Vite dev server (bound to `0.0.0.0:5173`)                                       |
| `npm run build`   | `tsc -b` typecheck + production build to `dist/`                                 |
| `npm run lint`    | oxlint                                                                          |
| `npm run check`   | Mounts the real `App` in jsdom and asserts the live DOM — 60+ checks             |
| `npm run preview` | Serve the production build                                                      |

`npm run check` is the one worth running after edits. It mounts `<App />`, drives
it, and asserts: video attributes and the `play()` retry, hero markup and `em`
segments, that **every nav href resolves to a real element**, the scroll spy
(via an `IntersectionObserver` double), the mobile menu open/focus/close-on-select/
close-on-Escape cycle, the video loading surface, and that both CTAs are inert.

## Structure

```
index.html                     Google Fonts (Instrument Serif + Inter 400/500), .dark on <html>
src/index.css                  Tailwind v4 theme, .liquid-glass, keyframes
src/App.tsx                    Composition + scroll spy
src/components/
  video-background.tsx         <video autoPlay loop muted playsInline>, play() retry, loading surface
  site-header.tsx              Glass nav: wordmark, desktop links, CTA, mobile hamburger
  hero.tsx                     H1, subtext, CTA
  sections.tsx                 Studio / About / Journal / Reach Us / footer
  ui/button.tsx                shadcn/ui (added via `npx shadcn add button`)
src/lib/sections.ts            Section ids + nav links (one source of truth)
src/lib/utils.ts               cn()
scripts/dom-check.tsx          jsdom mount test used by `npm run check`
```

## Interaction model

| Element | Behaviour |
| --- | --- |
| Wordmark | `href="#"` — back to top |
| Home / Studio / About / Journal / Reach Us | Smooth-scroll to `#home`, `#studio`, `#about`, `#journal`, `#reach-us`; active link tracks scroll position |
| Nav on mobile | `hidden md:flex` per spec, plus a liquid-glass hamburger below `md` that drops a glass panel (focus moves in, Escape or selection closes it) |
| Both "Begin Journey" buttons | **Deliberately action-free.** Hover scale, `cursor-pointer`, focus ring — no click handler. Add `onClick` in `site-header.tsx` / `hero.tsx` when there is a destination. |
| `hello@velorah.studio` | `mailto:` link in the Reach Us section |

## Theme

Dark-only. HSL triplets consumed through `@theme inline`:

| Token                  | Value                    |
| ---------------------- | ------------------------ |
| `--background`         | `201 100% 13%` (deep navy) |
| `--foreground`         | `0 0% 100%`              |
| `--muted-foreground`   | `240 4% 66%`             |
| `--primary`            | `0 0% 100%`              |
| `--primary-foreground` | `0 0% 4%`                |
| `--secondary` / `--muted` / `--accent` | `0 0% 10%` |
| `--border` / `--input` | `0 0% 18%`               |

Type: `--font-display: 'Instrument Serif', serif` (headings, applied inline),
`--font-body: 'Inter', sans-serif` (body, applied on `body`).

## Three things worth knowing

**1. `backdrop-filter` survives the build.** Tailwind v4 compiles CSS through
Lightning CSS, which treats `backdrop-filter` and `-webkit-backdrop-filter` as
one property and keeps only the last declaration it sees — that silently removes
the blur in Firefox. The standard property is re-declared inside an `@supports`
block, so the compiled CSS ships both:

```bash
npm run build && grep -o '[-a-z]*backdrop-filter:blur(4px)' dist/assets/*.css
```

**2. `pt-32 pb-40` beats `py-[90px]`.** The hero carries all three classes;
Tailwind emits the longhand padding utilities after the shorthand, so effective
spacing is 8rem top / 10rem bottom and `py-[90px]` is inert.

**3. The video has no poster frame.** The clip is ~14 MB, so `.video-loading`
paints a slow drifting gradient in the base navy until `canplay` fires, then
pauses itself and fades out. The video also gets `transition-opacity` +
`opacity-0/100` on top of the spec'd class list to make that crossfade work.
