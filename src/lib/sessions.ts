import { DAILY_GOAL_MS } from "./focus"
import { supabase } from "./supabase"

export type SessionRow = {
  id: string
  topic: string
  started_at: string
  ended_at: string | null
}

/** A session that is still running has no ended_at yet. */
export type OpenSession = { id: string; topic: string; startedAt: number }

export type CompletedSession = {
  id: string
  topic: string
  start: number
  end: number
}

const LOCAL_DAY_MS = 24 * 60 * 60 * 1000

/** Start of the user's own calendar day — matches the copy on the desk. */
export function dayStart(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function dayKey(timestamp: number): string {
  const date = new Date(dayStart(timestamp))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`
}

export function toCompleted(row: SessionRow): CompletedSession | null {
  if (!row.ended_at) return null
  const start = Date.parse(row.started_at)
  const end = Date.parse(row.ended_at)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null
  return { id: row.id, topic: row.topic, start, end }
}

// ---------------------------------------------------------------------------
// Server calls. Every timestamp comes back from Postgres.
// ---------------------------------------------------------------------------

export async function startSession(topic: string): Promise<OpenSession> {
  const { data, error } = await supabase().rpc("start_study_session", {
    p_topic: topic,
  })
  if (error) throw new Error(error.message)

  // Read the row back so started_at is the server's, not ours.
  const { data: row, error: readError } = await supabase()
    .from("study_sessions")
    .select("id, topic, started_at, ended_at")
    .eq("id", data as string)
    .single()

  if (readError) throw new Error(readError.message)
  const record = row as SessionRow
  return {
    id: record.id,
    topic: record.topic,
    startedAt: Date.parse(record.started_at),
  }
}

export async function finishSession(id: string): Promise<number> {
  const { data, error } = await supabase().rpc("finish_study_session", {
    p_id: id,
  })
  if (error) throw new Error(error.message)
  return Date.parse(data as string)
}

export async function fetchSessions(): Promise<CompletedSession[]> {
  const { data, error } = await supabase()
    .from("study_sessions")
    .select("id, topic, started_at, ended_at")
    .order("started_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data as SessionRow[]).map(toCompleted).filter((s): s is CompletedSession => s !== null)
}

// ---------------------------------------------------------------------------
// Derived values — computed from rows, never stored.
// ---------------------------------------------------------------------------

/** Milliseconds of a session that fall inside the given calendar day. */
export function sessionMsOnDay(session: CompletedSession, day: number): number {
  const start = Math.max(day, session.start)
  const end = Math.min(day + LOCAL_DAY_MS, session.end)
  return Math.max(0, end - start)
}

export function totalMsOnDay(sessions: CompletedSession[], day: number): number {
  return sessions.reduce((total, session) => total + sessionMsOnDay(session, day), 0)
}

export function totalMs(sessions: CompletedSession[]): number {
  return sessions.reduce((total, session) => total + (session.end - session.start), 0)
}

/** day key -> milliseconds, for the GitHub-style heatmap. */
export function heatmap(sessions: CompletedSession[]): Map<string, number> {
  const buckets = new Map<string, number>()
  for (const session of sessions) {
    for (let day = dayStart(session.start); day <= session.end; day += LOCAL_DAY_MS) {
      const ms = sessionMsOnDay(session, day)
      if (ms <= 0) continue
      const key = dayKey(day)
      buckets.set(key, (buckets.get(key) ?? 0) + ms)
    }
  }
  return buckets
}

/**
 * Consecutive days at or over the 4h goal, ending today or yesterday.
 * `frozenDays` are days the user spent a streak freeze on — they neither add to
 * the streak nor break it.
 */
export function currentStreak(
  sessions: CompletedSession[],
  frozenDays: string[],
  now: number
): number {
  const buckets = heatmap(sessions)
  const frozen = new Set(frozenDays)

  let streak = 0
  let day = dayStart(now)

  // Today doesn't have to be finished yet to keep yesterday's streak alive.
  if ((buckets.get(dayKey(day)) ?? 0) < DAILY_GOAL_MS && !frozen.has(dayKey(day))) {
    day -= LOCAL_DAY_MS
  }

  while (true) {
    const key = dayKey(day)
    const ms = buckets.get(key) ?? 0
    if (ms >= DAILY_GOAL_MS) {
      streak += 1
    } else if (frozen.has(key)) {
      // Freeze holds the chain together but is not itself a studied day.
    } else {
      break
    }
    day -= LOCAL_DAY_MS
  }

  return streak
}

/** True once this calendar day has reached the 4h goal. */
export function goalReachedOnDay(sessions: CompletedSession[], day: number): boolean {
  return totalMsOnDay(sessions, day) >= DAILY_GOAL_MS
}
