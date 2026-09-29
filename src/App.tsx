import { useEffect, useState } from "react"
import { Hero } from "@/components/hero"
import {
  AboutSection,
  JournalSection,
  ReachUsSection,
  SiteFooter,
  StudioSection,
} from "@/components/sections"
import { SiteHeader } from "@/components/site-header"
import { VideoBackground } from "@/components/video-background"
import { SECTIONS } from "@/lib/sections"

const OBSERVED_IDS = ["home", ...SECTIONS.map((section) => section.id)]

export default function App() {
  const [activeId, setActiveId] = useState<string>("home")

  /**
   * Scroll spy: whichever section crosses the thin band through the middle of
   * the viewport owns the nav highlight. Guarded so environments without
   * IntersectionObserver (jsdom) simply keep the default "home".
   */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return

    const elements = OBSERVED_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null
    )
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length === 0) return
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b
        )
        setActiveId(topmost.target.id)
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="bg-background">
      {/* First screen: video at z-0, glass UI at z-10 */}
      <div id="home" className="relative flex min-h-screen flex-col overflow-hidden">
        <VideoBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader activeId={activeId} />
          <Hero />
        </div>
      </div>

      <StudioSection />
      <AboutSection />
      <JournalSection />
      <ReachUsSection />
      <SiteFooter />
    </main>
  )
}
