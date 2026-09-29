import {
  currentStreak,
  dayKey,
  dayStart,
  goalReachedOnDay,
  heatmap,
  sessionMsOnDay,
  totalMsOnDay,
  type CompletedSession,
} from "../src/lib/sessions"
import { DAILY_GOAL_MS } from "../src/lib/focus"

const H = 3600_000
const NOW = new Date(2026, 8, 29, 15, 0, 0).getTime() // 29 Sep 2026, 15:00 local
const D0 = dayStart(NOW) // 29 Sep 00:00
const DAY = 24 * H

/** A session `dayOffset` days ago, starting at `hour` and lasting `hours`. */
function session(
  dayOffset: number,
  hour: number,
  hours: number,
  topic = "Physics"
): CompletedSession {
  const start = D0 - dayOffset * DAY + hour * H
  return { id: `${dayOffset}-${hour}`, topic, start, end: start + hours * H }
}

let failures = 0
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(
    `${ok ? "OK  " : "MISS"}  ${label}  →  ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`
  )
}

console.log("=== day helpers ===")
check("dayStart zeroes the clock", new Date(dayStart(NOW)).getHours(), 0)
check("dayKey format", dayKey(D0), "2026-09-29")
check("dayKey yesterday", dayKey(D0 - DAY), "2026-09-28")

console.log("\n=== per-day attribution ===")
const spanning = { id: "x", topic: "Night shift", start: D0 - 2 * H, end: D0 + 3 * H }
check("session crossing midnight: yesterday gets 2h", sessionMsOnDay(spanning, D0 - DAY), 2 * H)
check("session crossing midnight: today gets 3h", sessionMsOnDay(spanning, D0), 3 * H)
check("session outside the day counts zero", sessionMsOnDay(session(5, 9, 2), D0), 0)
check("two sessions on one day sum", totalMsOnDay([session(0, 8, 2), session(0, 14, 3)], D0), 5 * H)

console.log("\n=== heatmap ===")
const heat = heatmap([session(0, 8, 4), session(1, 8, 5), spanning])
check("today bucketed", heat.get("2026-09-29"), 4 * H + 3 * H)
check("yesterday bucketed", heat.get("2026-09-28"), 5 * H + 2 * H)
check("heatmap bucket count", heat.size, 2)

console.log("\n=== goal ===")
check("4h exactly reaches the goal", goalReachedOnDay([session(0, 8, 4)], D0), true)
check(
  "one millisecond short does not",
  goalReachedOnDay(
    [{ id: "y", topic: "p", start: D0 + 8 * H, end: D0 + 8 * H + DAILY_GOAL_MS - 1 }],
    D0
  ),
  false
)

console.log("\n=== streak ===")
const threeDays = [session(0, 8, 5), session(1, 8, 5), session(2, 8, 5)]
check("three goal days in a row", currentStreak(threeDays, [], NOW), 3)
check("a gap breaks it", currentStreak([session(0, 8, 5), session(2, 8, 5)], [], NOW), 1)
check("no study at all", currentStreak([], [], NOW), 0)
check("today unfinished keeps yesterday's run", currentStreak([session(1, 8, 5), session(2, 8, 5)], [], NOW), 2)
check("a frozen day bridges the gap without counting", currentStreak([session(0, 8, 5), session(2, 8, 5)], [dayKey(D0 - DAY)], NOW), 2)
check("freeze on a studied day does not double count", currentStreak([session(0, 8, 5), session(1, 8, 5)], [dayKey(D0 - DAY)], NOW), 2)
check("short days do not build a streak", currentStreak([session(0, 8, 1), session(1, 8, 1)], [], NOW), 0)

console.log(`\n${failures === 0 ? "ALL SESSION LOGIC CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`)
process.exit(failures === 0 ? 0 : 1)
