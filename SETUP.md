# StudyHub — what to set up, and what is already done

Everything the code needs. Steps 1 is finished; steps 2 to 5 are the ones left.

---

## Status right now

| Piece | State |
| --- | --- |
| Supabase tables and functions | **Done** — all five tables and all four functions answer over REST with HTTP 200 |
| Timer, goal bar, desk log | Code complete, wired to real session rows |
| Profile page at `/p/:username` | Code complete |
| Sound mixer inside zen mode | Code complete, waiting on audio files |
| AI doubt solver and quiz | Code complete, waiting on one provider key |
| Study rooms with live presence | Code complete |

---

## 1. Run the SQL — DONE

This has already been run. It does not need running again unless `supabase/schema.sql`
changes. Re-running it is safe: every statement uses `if not exists`,
`create or replace` or `drop policy if exists`.

What it created, verified against the live project:

| Object | Type | Purpose |
| --- | --- | --- |
| `profiles` | table | username, bio, avatar — created automatically on signup |
| `study_sessions` | table | one row per focus interval |
| `rooms` | table | a study room and its six-character code |
| `room_members` | table | who is in which room, and their presence |
| `streak_freezes` | table | the two-a-month streak saves |
| `start_study_session(topic)` | function | opens a session, stamps the time server-side |
| `finish_study_session(id)` | function | closes it, stamps the time server-side |
| `public_profile_stats(username)` | function | totals for a public profile page |
| `my_room_id()` | function | which room you are in |
| `my_streak_freezes()` | function | your freezes this account |

Row level security is on for all five tables. A signed-out visitor reads nothing;
a signed-in user reads only their own sessions and freezes, plus the roster of
whatever room they are actually in.

To check it yourself, open the SQL editor and run:

```sql
select tablename from pg_tables where schemaname = 'public' order by 1;
```

You should see five rows.

---

## 2. Vercel environment variables — REQUIRED

Go to `https://vercel.com`, open the StudyHub project, then
**Settings → Environment Variables**.

Add these two. Tick **Production**, **Preview** and **Development** for both.

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://jnljxgfcyiladwtbepmz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | the **anon public** key from Supabase → Settings → API |

Then click **Save**.

### Why the `VITE_` prefix matters

Vite copies every variable that starts with `VITE_` straight into the JavaScript
bundle at build time. That is why the Supabase anon key is safe — it is public by
design, and row level security is what actually protects the data.

It is also why an AI key must **never** carry the `VITE_` prefix. If you add
`VITE_GROQ_API_KEY`, the key is baked into the public bundle and anyone can take
it and spend your quota. Add it as plain `GROQ_API_KEY`.

### Optional, only if you want the AI panel to answer

Add **one** of these, without any prefix:

| Name | Where to get it |
| --- | --- |
| `GROQ_API_KEY` | `https://console.groq.com/keys` — free, 1,000 requests a day on the model this uses |
| `GEMINI_API_KEY` | `https://aistudio.google.com/apikey` — free tier |

The server function prefers Groq if both are present. Until one is set, the panel
answers "No AI provider is configured on the server." and nothing else breaks.

---

## 3. Redeploy — REQUIRED

The environment variables have to exist **before** the build runs, because Vite
inlines them. Adding them afterwards does nothing until you build again.

**Deployments** → the top row → **⋯** on the right → **Redeploy**.

Leave **"Use existing Build Cache" unticked.** A cached build reuses the old
variables and you will see the same broken page.

If the project is connected to the GitHub repository, pushing to `main` also
triggers a deploy — but it still only picks up variables that were already saved.

---

## 4. Audio files — optional

The mixer looks for five files in `public/sounds/`:

```
rain.mp3    nature.mp3    wind.mp3    library.mp3    keyboard.mp3
```

What makes a good one:

- A **seamless loop**, 30 seconds to 2 minutes. Any audible join repeats all night.
- **No music, no voices, no melody.** The mixer is a background texture, not a playlist.
- Any ordinary MP3. The mixer probes each file before showing its slider, so a
  track with no file simply does not appear, and an empty folder shows
  "No sounds yet." rather than a row of broken buttons.

Add them to the repository under `public/sounds/` and push, or drop them into the
`public/sounds/` folder of the project Vercel builds from.

---

## 5. Google sign-in — optional

Email magic links work with no configuration. Google needs a few steps.

1. `https://console.cloud.google.com` → create or pick a project.
2. **APIs & Services → OAuth consent screen** — fill in the app name and your email,
   and add yourself under **Test users** while it is unpublished.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   type **Web application**.
4. Under **Authorized redirect URIs** add the one Supabase shows you at
   Supabase → **Authentication → Providers → Google**. It looks like
   `https://jnljxgfcyiladwtbepmz.supabase.co/auth/v1/callback`.
5. Copy the client ID and secret into that same Supabase page and enable the provider.
6. Under **Authentication → URL Configuration**, set **Site URL** to your Vercel
   domain, and add `http://localhost:5173` to **Redirect URLs** for local work.

The redirect URI has to match character for character, or Google returns
`redirect_uri_mismatch`.

---

## Checking that it worked

| You see | It means |
| --- | --- |
| Sign in, press Start, and the counter runs | sessions are saving |
| Finish, and a row appears in the desk log | `ended_at` was stamped |
| `/p/yourusername` shows a heatmap | the profile function works |
| Start a room, open a second browser, join with the code | realtime presence works |
| The AI panel says "No AI provider is configured on the server." | no key set yet — expected |
| The mixer says "No sounds yet." | no audio files yet — expected |
| "Supabase isn't configured yet." | the two `VITE_` variables were missing at build time |

## If something breaks

| Symptom | Cause and fix |
| --- | --- |
| "Supabase isn't configured yet." | The `VITE_` variables were added after the build. Redeploy without the build cache. |
| Sign-in works but nothing saves | The SQL was not run in this project. Check with the query in step 1. |
| Google returns `redirect_uri_mismatch` | The URI in Google Console differs from the one on the Supabase provider page. |
| The AI panel returns a 502 | The provider rejected the key. Check it has no `VITE_` prefix and is not expired. |
| A room shows nobody | Realtime needs `room_members` in the `supabase_realtime` publication. The schema adds it; confirm with `select * from pg_publication_tables where pubname = 'supabase_realtime';` |

---

## Testing the schema locally

`supabase/test-harness.sql` mocks the parts of Supabase the schema expects —
`auth.uid()`, the `anon` / `authenticated` / `service_role` roles, and the
`supabase_realtime` publication — so `schema.sql` runs on a plain PostgreSQL
server. `supabase/test-schema.sql` then drives it as the non-superuser
`authenticated` role, which is the only way row level security is actually
exercised.

```sh
initdb -D /tmp/pgdata -U postgres --auth=trust
pg_ctl -D /tmp/pgdata -o "-p 5433 -k /tmp" -l /tmp/pg.log start
psql -h /tmp -p 5433 -U postgres -d postgres -f supabase/test-harness.sql
psql -h /tmp -p 5433 -U postgres -d postgres -f supabase/schema.sql
psql -h /tmp -p 5433 -U postgres -d postgres \
  -c "grant all on all tables in schema public to anon, authenticated; \
      grant execute on all functions in schema public to anon, authenticated;"
psql -h /tmp -p 5433 -U postgres -d postgres -f supabase/test-schema.sql
```

Nineteen assertions: the signup trigger, both session RPCs, roster visibility
across three users, one room per user, the two-freeze monthly cap, the
signed-out case, and row level security being enabled on all five tables.

The `grant` line stands in for the default privileges Supabase sets up itself;
on a real project you do not need it.
