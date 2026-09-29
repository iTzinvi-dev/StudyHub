import { useEffect, useRef, useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NAV_LINKS } from "@/lib/sections"

const linkClass = (active: boolean) =>
  cn(
    "text-sm transition-colors",
    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
  )

/**
 * Glassmorphic navigation.
 *
 * Desktop (md+): inline links, unchanged from the original spec.
 * Mobile: liquid-glass hamburger that drops a glass panel — previously the
 * links were simply hidden, which left small screens with no navigation.
 *
 * `activeId` comes from the scroll spy in App, so the highlighted link always
 * matches the section on screen.
 */
export function SiteHeader({
  activeId,
  onNavigate,
}: {
  activeId: string
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Move focus into the panel when it opens, so keyboard users land on a link.
  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus()
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <header className="relative z-10">
      <nav className="mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        {/* Wordmark */}
        <a
          href="#"
          aria-label="Velorah home"
          onClick={onNavigate}
          className="text-3xl tracking-tight text-foreground transition-opacity hover:opacity-80"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Velorah
          <sup className="text-xs">&reg;</sup>
        </a>

        {/* Links — desktop */}
        <ul className="hidden flex-row items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                aria-current={activeId === link.id ? "true" : undefined}
                className={linkClass(activeId === link.id)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-row items-center gap-3">
          {/* CTA — intentionally action-free (design piece) */}
          <Button
            variant="ghost"
            className="liquid-glass h-auto rounded-full px-6 py-2.5 text-sm font-normal text-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-transparent hover:text-foreground"
          >
            Begin Journey
          </Button>

          {/* Mobile trigger */}
          <Button
            variant="ghost"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className="liquid-glass size-10 rounded-full p-0 text-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-transparent hover:text-foreground md:hidden"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          className="animate-menu-drop absolute inset-x-4 top-full z-20 mt-2 md:hidden"
        >
          <ul className="liquid-glass flex flex-col gap-1 rounded-3xl p-3">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  aria-current={activeId === link.id ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm transition-colors",
                    activeId === link.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
