import { useState, type FormEvent } from "react"
import { configError, isSupabaseConfigured } from "../lib/supabase"
import { useAuth } from "../lib/auth"

/**
 * Sign-in, built from classes that already exist in globals.css so it reads as
 * part of the same desk: `eyebrow`, `focus-card`, `primary-button`,
 * `quiet-button`, and the centred column the 404 page uses.
 */
export function AuthScreen() {
  const { signInWithGoogle, signInWithEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return

    setBusy(true)
    setNotice("")
    const error = await signInWithEmail(email.trim())
    setBusy(false)
    setNotice(error ?? "Check your inbox for the sign-in link.")
  }

  async function google() {
    setBusy(true)
    setNotice("")
    const error = await signInWithGoogle()
    setBusy(false)
    if (error) setNotice(error)
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-16">
      <a className="wordmark mb-10" href="/" aria-label="StudyHub home">
        <span className="brand-mark" aria-hidden="true">s.</span>
        studyhub
      </a>

      <section className="focus-card p-7 sm:p-9">
        <p className="eyebrow">A little room for focus</p>
        <h1 className="mt-4 mb-3">Keep your hours.</h1>
        <p className="mb-7 text-sm leading-7 text-cream/75">
          Sign in and your desk log, streak, and study rooms stay where you left
          them. Nothing else is asked for.
        </p>

        {!isSupabaseConfigured ? (
          <p className="text-sm leading-7 text-clay" role="alert">
            {configError}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <button
              className="primary-button w-full"
              type="button"
              onClick={google}
              disabled={busy}
            >
              <span aria-hidden="true">◈</span>
              Continue with Google
            </button>

            <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
              <label htmlFor="email" className="eyebrow">
                Or use email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="timer-form-input w-full border-b border-white/10 bg-transparent px-1 py-2 text-sm text-cream outline-none placeholder:text-[var(--muted)]"
              />
              <button className="quiet-button w-full" type="submit" disabled={busy}>
                {busy ? "Sending…" : "Email me a sign-in link"}
              </button>
            </form>
          </div>
        )}

        {notice && (
          <p className="mt-5 text-xs leading-6 text-cream/70" role="status">
            {notice}
          </p>
        )}
      </section>

      <p className="mt-8 text-xs leading-6 text-cream/50">
        One account. No tracking, no newsletter, nothing sold.
      </p>
    </main>
  )
}
