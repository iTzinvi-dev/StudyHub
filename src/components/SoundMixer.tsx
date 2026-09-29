import { useEffect, useRef, useState } from "react"
import { Howl } from "howler"

/**
 * Tracks without a file in /public/sounds are hidden entirely rather than
 * shown disabled — a dead slider is worse than no slider.
 */
const TRACKS = [
  { id: "rain", label: "Rain", file: "/sounds/rain.mp3" },
  { id: "nature", label: "Nature", file: "/sounds/nature.mp3" },
  { id: "wind", label: "Wind", file: "/sounds/wind.mp3" },
  { id: "library", label: "Library", file: "/sounds/library.mp3" },
  { id: "keyboard", label: "Keyboard", file: "/sounds/keyboard.mp3" },
] as const

type TrackId = (typeof TRACKS)[number]["id"]

/** Probe which files actually exist, so missing ones never render. */
async function availableTracks(): Promise<TrackId[]> {
  const results = await Promise.all(
    TRACKS.map(async (track) => {
      try {
        const response = await fetch(track.file, { method: "HEAD" })
        return response.ok ? track.id : null
      } catch {
        return null
      }
    })
  )
  return results.filter((id): id is TrackId => id !== null)
}

/**
 * Ambient mixer for zen mode. Rain, nature, wind, library and keyboard only —
 * nothing with music or vocals. Every track keeps its own level, and levels
 * persist for the visit so leaving zen does not reset the room.
 */
export function SoundMixer() {
  const [available, setAvailable] = useState<TrackId[] | null>(null)
  const [levels, setLevels] = useState<Record<TrackId, number>>({
    rain: 0,
    nature: 0,
    wind: 0,
    library: 0,
    keyboard: 0,
  })
  const howls = useRef<Partial<Record<TrackId, Howl>>>({})

  useEffect(() => {
    let cancelled = false
    void availableTracks().then((ids) => {
      if (!cancelled) setAvailable(ids)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Stop and release every sound on unmount, otherwise audio keeps playing
  // after zen mode closes.
  useEffect(() => {
    return () => {
      for (const howl of Object.values(howls.current)) howl?.unload()
      howls.current = {}
    }
  }, [])

  function howlFor(track: (typeof TRACKS)[number]): Howl {
    const existing = howls.current[track.id]
    if (existing) return existing

    const created = new Howl({
      src: [track.file],
      loop: true,
      volume: 0,
      html5: true,
    })
    howls.current[track.id] = created
    return created
  }

  function setLevel(id: TrackId, value: number) {
    setLevels((previous) => ({ ...previous, [id]: value }))

    const track = TRACKS.find((candidate) => candidate.id === id)
    if (!track) return

    const howl = howlFor(track)
    if (value <= 0) {
      howl.volume(0)
      howl.pause()
      return
    }

    if (!howl.playing()) howl.play()
    howl.volume(value)
  }

  if (available === null) return null

  if (available.length === 0) {
    return (
      <div className="empty-log">
        <span aria-hidden="true">↳</span>
        <p>No sounds yet.<br /><span>Drop files into public/sounds to fill this.</span></p>
      </div>
    )
  }

  return (
    <div className="goal-card p-6">
      <div className="card-topline">
        <h2 className="eyebrow">Room sound</h2>
        <span aria-hidden="true" className="small-star">✳</span>
      </div>
      <p className="mt-4 mb-5 text-xs leading-6 text-cream/60">
        Weather and rooms only. Nothing with a melody.
      </p>

      <ul className="grid gap-5">
        {TRACKS.filter((track) => available.includes(track.id)).map((track) => (
          <li key={track.id}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <label htmlFor={`sound-${track.id}`} className="text-xs text-cream">
                {track.label}
              </label>
              <span className="text-[10px] text-cream/50 tabular-nums">
                {Math.round(levels[track.id] * 100)}
              </span>
            </div>
            <input
              id={`sound-${track.id}`}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={levels[track.id]}
              onChange={(event) => setLevel(track.id, Number(event.target.value))}
              className="w-full accent-[var(--color-matcha)]"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
