import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { DAILY_GOAL_MS, timeLabel } from "../lib/focus"
import { supabase } from "../lib/supabase"
import {
  dayKey,
  dayStart,
  streakFromDaySeconds,
} from "../lib/sessions"

const DAY_MS = 24 * 60 * 60 * 1000
const WEEKS = 18

type Stats = {
  username: string
  bio: string
  avatar_url: string
  total_seconds: number
  days: Record<string, number>
}

/** 0–4, matching the four matcha steps the heatmap legend shows. */
function level(seconds: number): number {
  const ratio = seconds / (DAILY_GOAL_MS / 1000)
  if (ratio <= 0) return 0
  if (ratio < 0.25) return 1
  if (ratio < 0.5) return 2
  if (ratio < 1) return 3
  return 4
}

const LEVEL_CLASS = [
  "bg-white/5",
  "bg-matcha/25",
  "bg-matcha/45",
  "bg-matcha/70",
  "bg-matcha",
]

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [stats, setStats] = useState<Stats | null>(null)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!username) return
    let cancelled = false
    setMissing(false)
    setError("")

    supabase()
      .rpc("public_profile_stats", { p_username: username })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return
        if (rpcError) {
          setError(rpcError.message)
          return
        }
        if (!data) {
          setMissing(true)
          return
        }
        setStats(data as Stats)
      })

    return () => {
      cancelled = true
    }
  }, [username])

  const now = Date.now()

  const cells = useMemo(() => {
    const buckets = new Map(Object.entries(stats?.days ?? {}).map(([k, v]) => [k, Number(v) * 1000]))
    const today = dayStart(now)
    // Grid ends on the current week's Saturday so columns read as full weeks.
    const end = today + ((6 - new Date(today).getDay()) * DAY_MS)
    const start = end - (WEEKS * 7 - 1) * DAY_MS

    const out: Array<{ key: string; ms: number; future: boolean }> = []
    for (let day = start; day <= end; day += DAY_MS) {
      const key = dayKey(day)
      out.push({ key, ms: buckets.get(key) ?? 0, future: day > today })
    }
    return { cells: out, streak: streakFromDaySeconds(buckets, [], now) }
  }, [stats, now])

  if (error) {
    return (
      <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16">
        <p className="eyebrow">Could not load</p>
        <h1 className="mt-4 mb-5">That record is out of reach.</h1>
        <p className="mb-8 text-sm leading-7 text-cream/75">{error}</p>
        <a className="primary-button self-start" href="/">Back to my desk</a>
      </main>
    )
  }

  // Split so TypeScript can narrow `stats` to non-null past this point.
  if (!stats) {
    if (!missing) {
      return (
        <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16">
          <p className="eyebrow">One moment</p>
          <p className="mt-4 text-sm leading-7 text-cream/70">Opening that desk…</p>
        </main>
      )
    }
    return (
      <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16">
        <p className="eyebrow">No such desk</p>
        <h1 className="mt-4 mb-5">Nobody studies under that name.</h1>
        <p className="mb-8 text-sm leading-7 text-cream/75">
          The username may have changed, or the account was never created.
        </p>
        <a className="primary-button self-start" href="/">Back to my desk</a>
      </main>
    )
  }

  const totalMs = stats.total_seconds * 1000

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <a className="skip-link" href="#record">Skip to study record</a>

      <header className="mb-10 flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-6">
        <a className="wordmark" href="/" aria-label="StudyHub home">
          <span className="brand-mark" aria-hidden="true">s.</span>
          studyhub
        </a>
        <a className="quiet-button inline-flex items-center" href="/">Back to my desk ↗</a>
      </header>

      <section id="record" tabIndex={-1}>
        <div className="flex flex-wrap items-center gap-5">
          {stats.avatar_url ? (
            <img
              src={stats.avatar_url}
              alt=""
              className="size-16 rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <span
              className="grid size-16 place-items-center rounded-2xl bg-matcha text-2xl text-[#252e23]"
              aria-hidden="true"
            >
              {stats.username.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="eyebrow">Study record</p>
            <h1 className="mt-2 mb-1">@{stats.username}</h1>
            {stats.bio && <p className="text-sm leading-6 text-cream/70">{stats.bio}</p>}
          </div>
        </div>

        <dl className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="focus-card p-6">
            <dt className="eyebrow">Total focus</dt>
            <dd className="goal-total mt-3 mb-0">{timeLabel(totalMs)}</dd>
          </div>
          <div className="focus-card p-6">
            <dt className="eyebrow">Current streak</dt>
            <dd className="goal-total mt-3 mb-0">
              {cells.streak} <span>{cells.streak === 1 ? "day" : "days"}</span>
            </dd>
          </div>
        </dl>

        <section className="focus-card mt-6 p-6" aria-labelledby="heatmap-heading">
          <div className="card-topline">
            <h2 id="heatmap-heading" className="eyebrow">Last {WEEKS} weeks</h2>
            <span aria-hidden="true" className="small-star">✳</span>
          </div>
          <p className="mt-4 mb-5 text-xs leading-6 text-cream/60">
            A square lights up when the day reaches four hours.
          </p>

          <div
            className="grid grid-flow-col gap-1 overflow-x-auto pb-2"
            style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
            role="img"
            aria-label={`Study heatmap for the last ${WEEKS} weeks`}
          >
            {cells.cells.map((cell) => (
              <span
                key={cell.key}
                title={cell.future ? cell.key : `${cell.key} · ${timeLabel(cell.ms)}`}
                className={`size-3 rounded-[3px] ${cell.future ? "bg-transparent" : LEVEL_CLASS[level(cell.ms)]}`}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-[10px] text-cream/60">
            <span>Less</span>
            {LEVEL_CLASS.map((cls, i) => (
              <span key={i} className={`size-3 rounded-[3px] ${cls}`} aria-hidden="true" />
            ))}
            <span>4h</span>
          </div>
        </section>

        {totalMs === 0 && (
          <div className="empty-log mt-6">
            <span aria-hidden="true">↳</span>
            <p>Nothing yet.<br /><span>Finished sessions appear here.</span></p>
          </div>
        )}
      </section>
    </main>
  )
}
