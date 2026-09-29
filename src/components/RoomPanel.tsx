import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { useAuth } from "../lib/auth"
import {
  createRoom,
  fetchMyRoom,
  fetchRoster,
  joinRoom,
  leaveRoom,
  setPresence,
  subscribeRoster,
  type Member,
  type Room,
} from "../lib/rooms"

/** Three minutes without a keypress, click or scroll counts as stepping away. */
const IDLE_MS = 3 * 60 * 1000

const PRESENCE_TONE: Record<Member["presence"], string> = {
  studying: "var(--color-matcha)",
  away: "var(--muted)",
  "on break": "var(--color-clay)",
}

function PresenceDot({ presence }: { presence: Member["presence"] }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ background: PRESENCE_TONE[presence] }}
    />
  )
}

/**
 * Live study rooms. The card shell, heading and description are the ones the
 * page already had; only the empty state below them became real.
 */
export function RoomPanel() {
  const { user } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(Boolean(user))
  const lastActivity = useRef(Date.now())

  // Pick up the room this user is already in, so a refresh keeps them in it.
  useEffect(() => {
    if (!user) {
      setRoom(null)
      setMembers([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetchMyRoom()
      .then((found) => {
        if (!cancelled) setRoom(found)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  // Follow the roster while in a room.
  useEffect(() => {
    if (!room) {
      setMembers([])
      return
    }
    let cancelled = false
    fetchRoster(room.id)
      .then((rows) => {
        if (!cancelled) setMembers(rows)
      })
      .catch(() => {})
    return subscribeRoster(room.id, (rows) => {
      if (!cancelled) setMembers(rows)
    })
  }, [room])

  const reportPresence = useCallback(
    (presence: Member["presence"]) => {
      if (!room) return
      void setPresence(presence).catch(() => {})
    },
    [room]
  )

  // Studying while the tab is visible and the person is actually there; away
  // when the tab is hidden or the mouse and keyboard have been still a while.
  useEffect(() => {
    if (!room) return

    const mark = () => {
      lastActivity.current = Date.now()
    }
    const sync = () => {
      if (document.hidden) {
        reportPresence("on break")
        return
      }
      reportPresence(Date.now() - lastActivity.current > IDLE_MS ? "away" : "studying")
    }

    for (const event of ["keydown", "pointerdown", "scroll"] as const) {
      window.addEventListener(event, mark, { passive: true })
    }
    document.addEventListener("visibilitychange", sync)
    const timer = window.setInterval(sync, 20_000)
    sync()

    return () => {
      for (const event of ["keydown", "pointerdown", "scroll"] as const) {
        window.removeEventListener(event, mark)
      }
      document.removeEventListener("visibilitychange", sync)
      window.clearInterval(timer)
      reportPresence("away")
    }
  }, [room, reportPresence])

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await joinRoom(code)
      setRoom(await fetchMyRoom())
      setCode("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not join.")
    } finally {
      setBusy(false)
    }
  }

  async function start() {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      setRoom(await createRoom(""))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the room.")
    } finally {
      setBusy(false)
    }
  }

  async function leave() {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      await leaveRoom()
      setRoom(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not leave.")
    } finally {
      setBusy(false)
    }
  }

  const studying = members.filter((member) => member.presence === "studying").length

  return (
    <section className="room-card" aria-labelledby="room-heading">
      <div className="card-topline">
        <h2 id="room-heading">Good company.</h2>
        {room ? <span aria-hidden="true" className="small-star">✳</span> : null}
      </div>
      <p className="room-description">Shared study rooms.</p>

      {error && (
        <p className="mt-3 text-xs leading-6 text-clay" role="alert">
          {error}
        </p>
      )}

      {!user ? (
        <div className="empty-log">
          <span aria-hidden="true">↳</span>
          <p>
            Nothing yet.
            <br />
            <span>Sign in to join a room.</span>
          </p>
        </div>
      ) : loading ? (
        <div className="empty-log">
          <span aria-hidden="true">↳</span>
          <p>
            Looking.
            <br />
            <span>Checking whether you are already in a room.</span>
          </p>
        </div>
      ) : !room ? (
        <div className="mt-5 grid gap-3">
          <form onSubmit={join} className="grid gap-3" noValidate>
            <label htmlFor="room-code" className="text-xs text-cream/60">
              Room code
            </label>
            <div className="flex gap-2">
              <input
                id="room-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="MATH42"
                maxLength={10}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-[10px] border border-white/10 bg-transparent px-3 py-2.5 text-xs tracking-[.18em] text-cream uppercase outline-none placeholder:tracking-[.18em] placeholder:text-cream/30 focus:border-matcha/40"
              />
              <button type="submit" className="quiet-button shrink-0" disabled={busy || !code.trim()}>
                Join
              </button>
            </div>
          </form>
          <button
            type="button"
            className="primary-button justify-self-start"
            onClick={start}
            disabled={busy}
          >
            <span aria-hidden="true">✳</span>
            Start a room
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          <div>
            <p className="text-sm text-cream">{room.name}</p>
            <p className="mt-1 text-xs text-cream/55">
              Code <span className="tracking-[.18em] text-cream/80">{room.code}</span>
              {" · "}
              {members.length} {members.length === 1 ? "person" : "people"}
              {" · "}
              {studying} studying
            </p>
          </div>

          {members.length === 0 ? (
            <div className="empty-log">
              <span aria-hidden="true">↳</span>
              <p>
                Nobody here yet.
                <br />
                <span>Share the code and they will show up.</span>
              </p>
            </div>
          ) : (
            <ul className="grid gap-2">
              {members.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[.07] px-3 py-2"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[.07] text-[10px] text-cream/70"
                  >
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      member.username.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-cream/85">
                    {member.username}
                  </span>
                  <PresenceDot presence={member.presence} />
                  <span className="w-16 shrink-0 text-right text-[10px] text-cream/45">
                    {member.presence}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="room-footer">
            <span>Presence updates on its own.</span>
            <button type="button" className="quiet-button" onClick={leave} disabled={busy}>
              Leave
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
