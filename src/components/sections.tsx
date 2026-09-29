import type { ReactNode } from "react"
import { SECTIONS } from "@/lib/sections"

const DISPLAY_FONT = { fontFamily: "'Instrument Serif', serif" } as const

/** Read once at module load, not during render (keeps the render pure). */
const CURRENT_YEAR = new Date().getFullYear()

/** Shared page section: hairline divider, generous whitespace, no ornament. */
function Section({
  id,
  eyebrow,
  heading,
  children,
}: {
  id: string
  eyebrow: string
  heading: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="border-t border-border px-6 py-24 sm:py-32"
    >
      <div className="mx-auto flex max-w-7xl flex-col">
        <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h2
          className="mt-6 max-w-4xl text-4xl leading-[1.05] font-normal text-foreground sm:text-6xl"
          style={DISPLAY_FONT}
        >
          {heading}
        </h2>
        {children}
      </div>
    </section>
  )
}

const DISCIPLINES = [
  {
    title: "Product design",
    body: "Interfaces that hold attention without asking for it. Flows, systems, and the small decisions between them.",
  },
  {
    title: "Engineering",
    body: "Fast, accessible front-ends built to be maintained by someone other than us next year.",
  },
  {
    title: "Direction",
    body: "Positioning and narrative for teams that have something worth saying, and the patience to say it well.",
  },
]

const STATS = [
  { value: "2019", label: "Founded" },
  { value: "Nine", label: "People, four time zones" },
  { value: "40+", label: "Products shipped" },
]

const POSTS = [
  {
    date: "March 2026",
    title: "The case for slower interfaces",
    body: "Speed is a feature, but so is legibility. On designing for the second read, and what it costs to earn it.",
  },
  {
    date: "January 2026",
    title: "Notes on silence",
    body: "What a product feels like when it stops asking for attention — and why the quiet parts are the hard parts.",
  },
  {
    date: "November 2025",
    title: "Type as structure",
    body: "Display faces, tight tracking, and the way a single serif can set the pace for an entire surface.",
  },
]

export function StudioSection() {
  return (
    <Section
      id={SECTIONS[0].id}
      eyebrow="Studio"
      heading="A studio for considered software."
    >
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        We work in long arcs — research, prototype, ship, refine — with a bias
        for restraint. No pitch decks full of features nobody asked for.
      </p>
      <dl className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-3">
        {DISCIPLINES.map((item) => (
          <div key={item.title}>
            <dt
              className="text-2xl font-normal text-foreground"
              style={DISPLAY_FONT}
            >
              {item.title}
            </dt>
            <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.body}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

export function AboutSection() {
  return (
    <Section
      id={SECTIONS[1].id}
      eyebrow="About"
      heading="Nine people. One long conversation."
    >
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        We started as two designers arguing about typography and never quite
        stopped. Today we are a distributed team of designers, engineers, and
        writers who believe the best tools disappear into the work.
      </p>
      <dl className="mt-16 grid gap-10 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <dt
              className="text-5xl font-normal text-foreground"
              style={DISPLAY_FONT}
            >
              {stat.value}
            </dt>
            <dd className="mt-2 text-sm text-muted-foreground">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

export function JournalSection() {
  return (
    <Section
      id={SECTIONS[2].id}
      eyebrow="Journal"
      heading="Writing, occasionally."
    >
      <ul className="mt-16 divide-y divide-border border-t border-border">
        {POSTS.map((post) => (
          <li key={post.title}>
            <div className="grid gap-2 py-8 sm:grid-cols-[10rem_1fr] sm:gap-8">
              <p className="text-sm text-muted-foreground">{post.date}</p>
              <div>
                <h3
                  className="text-2xl font-normal text-foreground sm:text-3xl"
                  style={DISPLAY_FONT}
                >
                  {post.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {post.body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function ReachUsSection() {
  return (
    <Section
      id={SECTIONS[3].id}
      eyebrow="Reach Us"
      heading="Tell us what you're building."
    >
      <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        New projects, collaborations, or a question about how we work. We reply
        within two working days.
      </p>
      <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <a
          href="mailto:hello@velorah.studio"
          className="text-2xl text-foreground transition-colors hover:text-muted-foreground sm:text-4xl"
          style={DISPLAY_FONT}
        >
          hello@velorah.studio
        </a>
        <p className="text-sm text-muted-foreground">
          Remote — Dhaka · Lisbon · Toronto
        </p>
      </div>
    </Section>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <span
          className="text-xl text-foreground"
          style={DISPLAY_FONT}
        >
          Velorah
          <sup className="text-xs">&reg;</sup>
        </span>
        <p className="text-sm text-muted-foreground">
          &copy; {CURRENT_YEAR} Velorah. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
