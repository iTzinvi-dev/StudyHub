// Client-mount test: mounts the real App in jsdom and asserts the live DOM —
// structure, navigation wiring, mobile menu behaviour, scroll spy, video state.
import { JSDOM } from "jsdom"

const dom = new JSDOM(
  `<!doctype html><html class="dark"><body><div id="root"></div></body></html>`,
  { pretendToBeVisual: true, url: "http://localhost/" }
)

const g = globalThis as unknown as Record<string, unknown>
g.window = dom.window
g.document = dom.window.document
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true, writable: true })
g.HTMLElement = dom.window.HTMLElement
g.Element = dom.window.Element
g.Node = dom.window.Node
g.SVGElement = dom.window.SVGElement
g.getComputedStyle = dom.window.getComputedStyle
g.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
g.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
g.IS_REACT_ACT_ENVIRONMENT = true

let playCalls = 0
dom.window.HTMLMediaElement.prototype.play = (() => {
  playCalls++
  return Promise.resolve()
}) as unknown as typeof dom.window.HTMLMediaElement.prototype.play

// Minimal IntersectionObserver double so the scroll spy is actually exercised.
type Entry = { target: Element; isIntersecting: boolean; boundingClientRect: { top: number } }
const observers: FakeIO[] = []
class FakeIO {
  callback: (entries: Entry[]) => void
  elements: Element[] = []
  constructor(callback: (entries: Entry[]) => void) {
    this.callback = callback
    observers.push(this)
  }
  observe(el: Element) { this.elements.push(el) }
  unobserve() {}
  disconnect() { this.elements = [] }
  fire(activeIds: string[]) {
    this.callback(
      this.elements.map((el) => {
        const index = activeIds.indexOf(el.id)
        return {
          target: el,
          isIntersecting: index !== -1,
          boundingClientRect: { top: index === -1 ? 99999 : index * 100 },
        }
      })
    )
  }
}
g.IntersectionObserver = FakeIO

const { act } = await import("react")
const { createRoot } = await import("react-dom/client")
const { default: App } = await import("@/App")

const doc = dom.window.document
await act(async () => {
  createRoot(doc.getElementById("root")!).render(<App />)
})

let failures = 0
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = actual === expected
  if (!ok) failures++
  console.log(`${ok ? "OK  " : "MISS"}  ${label}  →  ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`)
}

// --- structure -----------------------------------------------------------
const SERIF = 'font-family: "Instrument Serif", serif;'
const video = doc.querySelector("video") as HTMLVideoElement | null
const h1 = doc.querySelector("h1")

console.log("=== HERO ===")
check("video present", !!video, true)
check("video.autoplay", video?.autoplay, true)
check("video.loop", video?.loop, true)
check("video.muted", video?.muted, true)
check("video playsinline attribute", video?.hasAttribute("playsinline") || video?.hasAttribute("playsInline"), true)
check("video src", video?.getAttribute("src")?.includes("hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"), true)
check("video keeps inset-0 z-0 object-cover", video?.className.includes("absolute inset-0 z-0 h-full w-full object-cover"), true)
check("play() called by effect", playCalls > 0, true)
check("logo text", doc.querySelector("nav a")?.textContent, "Velorah®")
check("logo font-family", doc.querySelector("nav a")?.getAttribute("style"), SERIF)
check("h1 font-family", h1?.getAttribute("style"), SERIF)
check("h1 plain text", h1?.textContent?.replace(/\s+/g, " ").trim(), "Where dreams rise through the silence.")
check("h1 em segments", doc.querySelectorAll("h1 em").length, 2)
check("h1 em text", [...doc.querySelectorAll("h1 em")].map((e) => e.textContent).join(" | "), "dreams | through the silence.")
check("h1 tracking + leading", h1?.className.includes("leading-[0.95]") && h1?.className.includes("tracking-[-2.46px]"), true)
check("liquid-glass surfaces (nav CTA + hero CTA + hamburger)", doc.querySelectorAll(".liquid-glass").length, 3)

// --- navigation wiring ---------------------------------------------------
console.log("\n=== NAV LINK RESOLUTION ===")
const desktopLinks = [...doc.querySelectorAll<HTMLAnchorElement>("nav > ul a")]
check("desktop link count", desktopLinks.length, 5)
check("link labels", desktopLinks.map((a) => a.textContent).join("|"), "Home|Studio|About|Journal|Reach Us")
for (const a of desktopLinks) {
  const href = a.getAttribute("href") ?? ""
  const target = doc.getElementById(href.replace(/^#/, ""))
  check(`"${a.textContent}" ${href} resolves to a real element`, !!target, true)
}

// --- scroll spy ----------------------------------------------------------
console.log("\n=== SCROLL SPY ===")
check("observer registered", observers.length, 1)
check("observed targets", observers[0]?.elements.map((el) => el.id).join("|"), "home|studio|about|journal|reach-us")
const currentLabel = () => doc.querySelector('nav > ul a[aria-current="true"]')?.textContent
check("home active on load", currentLabel(), "Home")
await act(async () => { observers[0]?.fire(["studio"]) })
check("studio active when its section crosses the band", currentLabel(), "Studio")
await act(async () => { observers[0]?.fire(["journal", "reach-us"]) })
check("topmost of two visible wins", currentLabel(), "Journal")
await act(async () => { observers[0]?.fire(["home"]) })
check("back to home", currentLabel(), "Home")

// --- mobile menu ---------------------------------------------------------
console.log("\n=== MOBILE MENU ===")
const trigger = doc.querySelector<HTMLButtonElement>("nav button[aria-controls='mobile-menu']")
check("hamburger present", !!trigger, true)
check("hamburger hidden at md+", trigger?.className.includes("md:hidden"), true)
check("hamburger aria-expanded starts false", trigger?.getAttribute("aria-expanded"), "false")
check("hamburger aria-label", trigger?.getAttribute("aria-label"), "Open menu")
check("panel absent when closed", !!doc.getElementById("mobile-menu"), false)

await act(async () => { trigger?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })) })
const panel = doc.getElementById("mobile-menu")
check("panel opens on click", !!panel, true)
check("aria-expanded true", trigger?.getAttribute("aria-expanded"), "true")
check("aria-label switches to Close", trigger?.getAttribute("aria-label"), "Close menu")
check("panel is glass", panel?.firstElementChild?.className.includes("liquid-glass"), true)
const panelLinks = [...(panel?.querySelectorAll("a") ?? [])]
check("panel link count", panelLinks.length, 5)
check("panel links resolve", panelLinks.every((a) => !!doc.getElementById((a.getAttribute("href") ?? "").replace(/^#/, ""))), true)
check("focus moved into panel", doc.activeElement?.textContent, "Home")

const firstPanelLink = panelLinks[0]
await act(async () => { firstPanelLink?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })) })
check("panel closes after choosing a link", !!doc.getElementById("mobile-menu"), false)

await act(async () => { trigger?.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })) })
check("panel reopened for Escape test", !!doc.getElementById("mobile-menu"), true)
await act(async () => { doc.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })) })
check("Escape closes panel", !!doc.getElementById("mobile-menu"), false)

// --- video loading surface ----------------------------------------------
console.log("\n=== VIDEO LOADING SURFACE ===")
const surface = doc.querySelector(".video-loading")
check("loading surface present", !!surface, true)
check("surface starts visible (no is-ready)", surface?.className.includes("is-ready"), false)
check("video starts transparent", video?.className.includes("opacity-0"), true)
await act(async () => { video?.dispatchEvent(new dom.window.Event("canplay", { bubbles: false })) })
const surfaceAfter = doc.querySelector(".video-loading")
check("surface gets is-ready on canplay", surfaceAfter?.className.includes("is-ready"), true)
check("video fades in on canplay", (doc.querySelector("video") as HTMLVideoElement)?.className.includes("opacity-100"), true)

// --- CTAs intentionally inert -------------------------------------------
console.log("\n=== CTA BUTTONS (intentionally action-free) ===")
const ctas = [...doc.querySelectorAll<HTMLButtonElement>("button")].filter((b) => b.textContent?.trim() === "Begin Journey")
check("two Begin Journey CTAs", ctas.length, 2)
for (const cta of ctas) {
  let mutations = 0
  const mo = new dom.window.MutationObserver((records) => { mutations += records.length })
  mo.observe(doc.body, { childList: true, subtree: true, attributes: true })
  await act(async () => { cta.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })) })
  mo.disconnect()
  check(`"${cta.textContent?.trim()}" click is inert by design`, mutations, 0)
  check(`"${cta.textContent?.trim()}" stays focusable`, cta.hasAttribute("disabled"), false)
}

// --- sections ------------------------------------------------------------
console.log("\n=== PAGE SECTIONS ===")
for (const id of ["studio", "about", "journal", "reach-us"]) {
  const el = doc.getElementById(id)
  check(`#${id} exists`, !!el, true)
  check(`#${id} has a heading`, !!el?.querySelector("h2"), true)
  check(`#${id} has copy`, (el?.textContent?.trim().length ?? 0) > 80, true)
}
check("journal entries", doc.querySelectorAll("#journal li").length, 3)
check("footer present", !!doc.querySelector("footer"), true)
check("contact mailto", doc.querySelector('a[href^="mailto:"]')?.getAttribute("href"), "mailto:hello@velorah.studio")

console.log(`\n${failures === 0 ? "ALL DOM CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`)
process.exit(failures === 0 ? 0 : 1)
