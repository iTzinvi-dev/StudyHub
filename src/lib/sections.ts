/**
 * Single source of truth for page sections.
 * SiteHeader renders the links from this; the page renders the matching
 * <section id> targets — so a link can never point at a missing anchor.
 */
export const SECTIONS = [
  { id: "studio", label: "Studio" },
  { id: "about", label: "About" },
  { id: "journal", label: "Journal" },
  { id: "reach-us", label: "Reach Us" },
] as const

export type SectionId = (typeof SECTIONS)[number]["id"]

export const NAV_LINKS: ReadonlyArray<{ id: string; label: string; href: string }> = [
  { id: "home", label: "Home", href: "#home" },
  ...SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    href: `#${section.id}`,
  })),
]
