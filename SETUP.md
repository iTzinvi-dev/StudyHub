# Setup — the steps only you can do

Three things need your account: the database schema, the Vercel environment
variables, and the audio files. Everything else is already written and pushed.

---

## 1. Run the database schema

### Why

The code calls database functions that do not exist yet. Without them the timer
cannot save anything — pressing Start returns `PGRST202`, which means "no such
function".

### Steps

**Step 1 — copy the schema.**

Open this URL in your browser:

```
https://raw.githubusercontent.com/iTzinvi-dev/StudyHub/main/supabase/schema.sql
```

You will see plain text. Click anywhere in it, press `Ctrl+A` (select all), then
`Ctrl+C` (copy). It is 435 lines; you do not need to read it.

**Step 2 — open the SQL editor.**

```
https://supabase.com/dashboard/project/jnljxgfcyiladwtbepmz/sql/new
```

Sign in if it asks. This is the SQL Editor with an empty query box.

**Step 3 — paste and run.**

Click inside the editor box, press `Ctrl+V`, then press the **Run** button at
the bottom right (or `Ctrl+Enter`).

**Step 4 — check the result.**

At the bottom you should see a result table listing five names:

```
profiles
room_members
rooms
streak_freezes
study_sessions
```

If you see that, it worked. The script is idempotent — running it twice is
harmless, so if you are unsure, run it again.

### If it fails

The most likely error is:

```
column "username" contains null values
```

That means an existing row in `profiles` has no username, and the script is
trying to make the column required. Tell me and I will add a backfill that
fills in a username first.

Any other error: copy the red text and send it to me.

### What it created

| Object | Purpose |
| --- | --- |
| `rooms` | A room has a 6-character code, a name, an owner |
| `room_members` | Who is in a room, and their presence. `unique(user_id)` means joining locks you to one room |
| `streak_freezes` | Days you spent a freeze on. A trigger caps it at two per calendar month |
| `handle_new_user()` | Creates a profile row automatically when someone signs up |
| `start_study_session(topic)` | Inserts a row stamped with the database clock |
| `finish_study_session(id)` | Sets `ended_at` from the database clock |
| `public_profile_stats(username)` | Public aggregates only — per-day seconds and a total. No topics, so a profile page never leaks what someone studied |
| `my_streak_freezes()` | Your own spent freezes |
| 15 RLS policies | Every table is private to its owner, except public rooms and public profiles |

---

## 2. Vercel environment variables

Vercel → your project → **Settings** → **Environment Variables**.

| Name | Value | Where |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://jnljxgfcyiladwtbepmz.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | the `eyJ...` key you already have | Production, Preview, Development |
| `GROQ_API_KEY` **or** `GEMINI_API_KEY` | your AI provider key | Production, Preview |

Two things that trip people up:

- **`VITE_` variables are baked in at build time.** If you add or change them,
  you must redeploy — refreshing the site is not enough.
- **Never prefix the AI key with `VITE_`.** Anything starting with `VITE_` ends
  up inside the JavaScript bundle where any visitor can read it. The AI key must
  stay server-side, which is why it has no prefix and is read with
  `process.env` inside `api/`.

After adding them, redeploy.

---

## 3. Audio files

Put MP3s in `public/sounds/`:

```
public/sounds/rain.mp3
public/sounds/nature.mp3
public/sounds/wind.mp3
public/sounds/library.mp3
public/sounds/keyboard.mp3
```

Rules the mixer follows:

- Each file is checked with a `HEAD` request when zen mode opens. **A track with
  no file never appears** — you will not see five dead sliders.
- If the folder is empty, the mixer shows "No sounds yet." instead.
- Loops should be seamless, 30 seconds to 2 minutes, and contain no music or
  vocals — weather and room tone only.
- Keep them small. They load on demand, not on page load.

Free sources that are safe to use: Freesound (filter by CC0), Pixabay, or
Zapsplat.

---

## 4. Google sign-in

Supabase → **Authentication** → **Providers** → **Google** → enable it.

You will need a Client ID and Client Secret from the Google Cloud Console:

1. `https://console.cloud.google.com/apis/credentials`
2. Create OAuth client ID → type **Web application**
3. Authorized redirect URI — this must match exactly:
   ```
   https://jnljxgfcyiladwtbepmz.supabase.co/auth/v1/callback
   ```
4. Copy the Client ID and Secret into Supabase and save

Email sign-in needs nothing extra, but check **Authentication** → **URL
Configuration** and add your deployed domain to the redirect allow-list, or the
magic link will land on localhost.

---

## What is already done

Everything in `src/` — the Vite port, auth, the timer wired to real session
rows, the goal bar and desk log reading the server, the `/p/:username` profile
page with heatmap and streak, and the zen-mode sound mixer — is written,
typechecked, and on `main`. You do not need to touch any of it.
