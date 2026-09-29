import { useEffect } from "react"

export type PageMeta = { title: string; description: string }

/**
 * The Next.js `export const metadata` blocks moved here verbatim, so each
 * route keeps the exact title and description it had.
 */
export const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "StudyHub — a little room for focus",
    description:
      "A quiet place to study. Set one intention, track your focus, and clear the distractions with zen mode.",
  },
  "/about": {
    title: "About · StudyHub",
    description:
      "The idea behind StudyHub: a calm study desk, readable design, and less noise.",
  },
  "/terms": {
    title: "Terms & conditions · StudyHub",
    description: "Terms and limitations for the StudyHub frontend preview.",
  },
  "/privacy": {
    title: "Privacy · StudyHub",
    description:
      "How topics, timer records, and browser information are handled in the StudyHub preview.",
  },
  "/404": {
    title: "Not found · StudyHub",
    description: "This page isn't here.",
  },
}

/** Applies title + meta description for the current path. */
export function useDocumentMeta(pathname: string) {
  useEffect(() => {
    const meta = PAGE_META[pathname] ?? PAGE_META["/404"]
    document.title = meta.title

    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!tag) {
      tag = document.createElement("meta")
      tag.name = "description"
      document.head.appendChild(tag)
    }
    tag.content = meta.description
  }, [pathname])
}
