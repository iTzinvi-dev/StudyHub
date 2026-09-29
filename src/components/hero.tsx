import { Button } from "@/components/ui/button"

const DISPLAY_FONT = { fontFamily: "'Instrument Serif', serif" } as const

/**
 * Cinematic, vertically centred hero.
 * No overlays or gradients — the background video carries the composition.
 */
export function Hero() {
  return (
    <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-32 pb-40 py-[90px] text-center">
      <h1
        className="animate-fade-rise max-w-7xl text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
        style={DISPLAY_FONT}
      >
        Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
        <em className="not-italic text-muted-foreground">
          through the silence.
        </em>
      </h1>

      <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        We&rsquo;re designing tools for deep thinkers, bold creators, and quiet
        rebels. Amid the chaos, we build digital spaces for sharp focus and
        inspired work.
      </p>

      <Button
        variant="ghost"
        className="liquid-glass animate-fade-rise-delay-2 mt-12 h-auto cursor-pointer rounded-full px-14 py-5 text-base font-normal text-foreground transition-transform duration-300 hover:scale-[1.03] hover:bg-transparent hover:text-foreground"
      >
        Begin Journey
      </Button>
    </section>
  )
}
