import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"
import { configError, isSupabaseConfigured, supabase } from "./supabase"

export type Profile = {
  id: string
  username: string
  bio: string
  avatar_url: string
}

type AuthState = {
  ready: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  signInWithGoogle: () => Promise<string | null>
  signInWithEmail: (email: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true)
      return
    }

    const db = supabase()
    let cancelled = false

    db.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session)
        setReady(true)
      }
    })

    const { data: sub } = db.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  // The profile row is created by the signup trigger in supabase/schema.sql.
  useEffect(() => {
    const userId = session?.user.id
    if (!userId) {
      setProfile(null)
      return
    }

    let cancelled = false
    supabase()
      .from("profiles")
      .select("id, username, bio, avatar_url")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile((data as Profile | null) ?? null)
      })

    return () => {
      cancelled = true
    }
  }, [session])

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) return configError
    const { error } = await supabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    })
    return error?.message ?? null
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return configError
    const { error } = await supabase().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return
    await supabase().auth.signOut()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      profile,
      signInWithGoogle,
      signInWithEmail,
      signOut,
    }),
    [ready, session, profile, signInWithGoogle, signInWithEmail, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>")
  return context
}
