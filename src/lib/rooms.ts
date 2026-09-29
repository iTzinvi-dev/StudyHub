import { supabase } from "./supabase"

export type Presence = "studying" | "away" | "on break"

export type Room = {
  id: string
  code: string
  name: string
  ownerId: string
}

export type Member = {
  userId: string
  username: string
  avatarUrl: string
  presence: Presence
  joinedAt: string
}

type MemberRow = {
  user_id: string
  presence: string
  joined_at: string
}

type ProfileRow = {
  id: string
  username: string
  avatar_url: string | null
}

const PRESENCES: Presence[] = ["studying", "away", "on break"]

function toPresence(value: string): Presence {
  return (PRESENCES as string[]).includes(value) ? (value as Presence) : "away"
}

/** A room code people can read out loud over a call. */
export function randomCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

/** The room this user is currently in, or null. */
export async function fetchMyRoom(): Promise<Room | null> {
  const { data: roomId, error } = await supabase().rpc("my_room_id")
  if (error) throw new Error(error.message)
  if (!roomId) return null

  const { data, error: roomError } = await supabase()
    .from("rooms")
    .select("id, code, name, owner_id")
    .eq("id", roomId)
    .maybeSingle()
  if (roomError) throw new Error(roomError.message)
  if (!data) return null

  return { id: data.id, code: data.code, name: data.name, ownerId: data.owner_id }
}

export async function createRoom(name: string): Promise<Room> {
  const { data: user } = await supabase().auth.getUser()
  if (!user.user) throw new Error("Sign in first.")

  const trimmed = name.trim().slice(0, 40) || "Study room"

  // Codes can collide; three tries is plenty for a six-character alphabet.
  let lastError = ""
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: room, error } = await supabase()
      .from("rooms")
      .insert({ code: randomCode(), name: trimmed, owner_id: user.user.id })
      .select("id, code, name, owner_id")
      .single()

    if (!error) {
      const created: Room = {
        id: room.id,
        code: room.code,
        name: room.name,
        ownerId: room.owner_id,
      }
      await joinRoom(created.code)
      return created
    }
    lastError = error.message
    if (!/duplicate|23505/i.test(error.message)) break
  }
  throw new Error(lastError || "Could not create the room.")
}

/** Joining replaces any room you were already in — room_members is unique per user. */
export async function joinRoom(code: string): Promise<void> {
  const { data: user } = await supabase().auth.getUser()
  if (!user.user) throw new Error("Sign in first.")

  const normalised = code.trim().toUpperCase()
  if (!normalised) throw new Error("Type a room code first.")

  const { data: room, error: roomError } = await supabase()
    .from("rooms")
    .select("id, closed_at")
    .eq("code", normalised)
    .maybeSingle()
  if (roomError) throw new Error(roomError.message)
  if (!room) throw new Error(`No room called ${normalised}.`)
  if (room.closed_at) throw new Error("That room is closed.")

  const { error: joinError } = await supabase()
    .from("room_members")
    .upsert({ room_id: room.id, user_id: user.user.id, presence: "studying", last_seen_at: new Date().toISOString() })
  if (joinError) throw new Error(joinError.message)
}

export async function leaveRoom(): Promise<void> {
  const { data: user } = await supabase().auth.getUser()
  if (!user.user) return

  const { error } = await supabase().from("room_members").delete().eq("user_id", user.user.id)
  if (error) throw new Error(error.message)
}

export async function setPresence(presence: Presence): Promise<void> {
  const { data: user } = await supabase().auth.getUser()
  if (!user.user) return

  const { error } = await supabase()
    .from("room_members")
    .update({ presence, last_seen_at: new Date().toISOString() })
    .eq("user_id", user.user.id)
  if (error) throw new Error(error.message)
}

/**
 * room_members.user_id points at auth.users, not profiles, so PostgREST cannot
 * embed the two. Read both and merge here rather than adding a second foreign
 * key just to make the join possible.
 */
export async function fetchRoster(roomId: string): Promise<Member[]> {
  const { data: rows, error } = await supabase()
    .from("room_members")
    .select("user_id, presence, joined_at")
    .eq("room_id", roomId)

  if (error) throw new Error(error.message)
  if (!rows || rows.length === 0) return []

  const ids = (rows as MemberRow[]).map((row) => row.user_id)
  const { data: profiles } = await supabase()
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", ids)

  const byId = new Map<string, ProfileRow>()
  for (const profile of (profiles ?? []) as ProfileRow[]) byId.set(profile.id, profile)

  return (rows as MemberRow[]).map((row) => {
    const profile = byId.get(row.user_id)
    return {
      userId: row.user_id,
      username: profile?.username ?? "Someone",
      avatarUrl: profile?.avatar_url ?? "",
      presence: toPresence(row.presence),
      joinedAt: row.joined_at,
    }
  })
}

/** Re-reads the roster whenever a member row in this room changes. */
export function subscribeRoster(
  roomId: string,
  onChange: (members: Member[]) => void
): () => void {
  let cancelled = false

  const channel = supabase()
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
      async () => {
        if (cancelled) return
        try {
          onChange(await fetchRoster(roomId))
        } catch {
          // A dropped read is not worth interrupting the room for.
        }
      }
    )
    .subscribe()

  return () => {
    cancelled = true
    void supabase().removeChannel(channel)
  }
}
