import { Suspense, lazy, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { RoomPanel } from '../components/RoomPanel';
import { SoundMixer } from '../components/SoundMixer';
import { WindowScene } from '../components/window-scene';
import { clock, DAILY_GOAL_MS, timeLabel } from '../lib/focus';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  dayStart,
  fetchSessions,
  finishSession,
  startSession,
  totalMsOnDay,
  type CompletedSession,
  type OpenSession,
} from '../lib/sessions';

// react-markdown + KaTeX are ~400 kB. They load only if the panel is opened.
const AiPanel = lazy(() =>
  import('../components/AiPanel').then((module) => ({ default: module.AiPanel }))
);

export default function Home() {
  const { profile, user } = useAuth();
  const [topic, setTopic] = useState('');
  const [topicError, setTopicError] = useState('');
  const [openSession, setOpenSession] = useState<OpenSession | null>(null);
  const [now, setNow] = useState(0);
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [visitIds, setVisitIds] = useState<string[]>([]);
  const [zen, setZen] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const zenButton = useRef<HTMLButtonElement>(null);
  const topicInput = useRef<HTMLInputElement>(null);

  const running = openSession !== null;
  const hasSession = running || visitIds.length > 0;

  // Milliseconds already banked during this visit, from rows the server closed.
  const bankedThisVisit = sessions
    .filter((session) => visitIds.includes(session.id))
    .reduce((total, session) => total + (session.end - session.start), 0);

  // The running row is not in `sessions` yet, so its time is counted live.
  const liveElapsed = running ? Math.max(0, now - openSession.startedAt) : 0;

  const elapsed = bankedThisVisit + liveElapsed;
  const today = totalMsOnDay(sessions, dayStart(now)) + liveElapsed;
  const progress = Math.min(100, (today / DAILY_GOAL_MS) * 100);
  const blocked = !isSupabaseConfigured || online === false;

  const refresh = useCallback(async () => {
    try {
      setSessions(await fetchSessions());
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load your sessions.');
    }
  }, []);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const connection = () => setOnline(navigator.onLine);
    tick();
    connection();
    const timer = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
    };
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && user) void refresh();
  }, [refresh, user]);

  useEffect(() => {
    if (!zen) return;

    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setZen(false);
        zenButton.current?.focus();
      }
    };

    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [zen]);

  useEffect(() => {
    if (!hasSession) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasSession]);

  async function toggleTimer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (openSession !== null) {
      setSaving(true);
      try {
        await finishSession(openSession.id);
        setOpenSession(null);
        await refresh();
        setAnnouncement('Session paused.');
      } catch (error) {
        setAnnouncement(error instanceof Error ? error.message : 'Could not save that pause.');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!topic.trim()) {
      setTopicError('Add a topic before you start.');
      topicInput.current?.focus();
      return;
    }

    if (blocked) {
      setAnnouncement(
        isSupabaseConfigured ? 'You need a connection to start a session.' : 'StudyHub is not connected yet.'
      );
      return;
    }

    setTopicError('');
    setSaving(true);
    try {
      const started = await startSession(topic.trim());
      setTopic(started.topic);
      setOpenSession(started);
      setVisitIds((previous) => [...previous, started.id]);
      setAnnouncement(visitIds.length ? 'Session resumed.' : 'Session started.');
    } catch (error) {
      setAnnouncement(error instanceof Error ? error.message : 'Could not start that session.');
    } finally {
      setSaving(false);
    }
  }

  async function finishCurrentSession() {
    if (!openSession) {
      window.requestAnimationFrame(() => topicInput.current?.focus());
      return;
    }

    setSaving(true);
    try {
      await finishSession(openSession.id);
      await refresh();
      setAnnouncement('Session added to your desk log.');
    } catch (error) {
      setAnnouncement(error instanceof Error ? error.message : 'Could not close that session.');
    } finally {
      setSaving(false);
      setOpenSession(null);
      setTopic('');
      setVisitIds([]);
      window.requestAnimationFrame(() => topicInput.current?.focus());
    }
  }

  function resetTimer() {
    if (!window.confirm('Discard this unfinished session? Your desk log stays.')) return;

    setOpenSession(null);
    setVisitIds([]);
    setAnnouncement('Timer reset. Your topic is kept.');
    window.requestAnimationFrame(() => topicInput.current?.focus());
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={`workspace${zen ? ' is-zen' : ''}`}>
        <a className="skip-link" href="#focus">Skip to focus timer</a>
        <aside className="sidebar" aria-label="Workspace">
          <a className="wordmark" href="/" aria-label="StudyHub home">
            <span className="brand-mark" aria-hidden="true">s.</span>
            studyhub
          </a>
          <p className="eyebrow sidebar-label">A little room for focus</p>
          <nav aria-label="Main navigation">
            <a className="nav-link active" href="#focus">
              <span aria-hidden="true">◷</span>
              My desk
              <span className="nav-number" aria-hidden="true">01</span>
            </a>
            <a className="nav-link" href="#desk-log">
              <span aria-hidden="true">≡</span>
              Desk log
              <span className="nav-number" aria-hidden="true">02</span>
            </a>
          </nav>
          <div className="sidebar-note">
            <span className="small-star" aria-hidden="true">✳</span>
            <p>One topic.<br />A little uninterrupted time.</p>
          </div>
          <div className="local-profile">
            <span className="avatar matcha" aria-hidden="true">
              {(profile?.username ?? user?.email ?? 's').charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{profile?.username ?? 'Your own pace'}</strong>
              <span>
                {profile ? (
                  <a href={`/p/${profile.username}`}>View profile ↗</a>
                ) : (
                  'No profile yet'
                )}
              </span>
            </div>
          </div>
        </aside>

        <div className="main-column">
          <header className="topbar">
            <span className="breadcrumb">
              Your workspace <span aria-hidden="true">/</span> <strong>My desk</strong>
            </span>
            <div className="topbar-actions">
              <span className="connection">
                <span className={online ? 'status-dot' : 'status-dot offline'} aria-hidden="true" />
                {online === null ? 'Checking' : online ? 'Browser online' : 'Browser offline'}
              </span>
              <button
                ref={zenButton}
                className="quiet-button zen-toggle"
                type="button"
                aria-pressed={zen}
                onClick={() => setZen((previous) => !previous)}
              >
                {zen ? 'Leave zen ↙' : 'Go zen ↗'}
              </button>
            </div>
          </header>

          <main id="focus" className="main-content" tabIndex={-1}>
            <div className="page-heading">
              <div>
                <p className="eyebrow">Less noise. More room.</p>
                <h1>Make a little headway.</h1>
                <p>Settle in. One thing at a time.</p>
              </div>
              <span className="edition">
                THE QUIET HOURS<br />
                <span>VOL. 001 / YOUR DESK</span>
              </span>
            </div>

            <div className="desk-grid">
              <section className="focus-card" aria-labelledby="timer-heading">
                <div className="card-topline">
                  <h2 id="timer-heading" className="eyebrow">The focus corner</h2>
                  <span className="session-state">
                    <span className={`status-dot${running ? ' breathing' : ' idle'}`} aria-hidden="true" />
                    {saving ? 'Saving' : running ? 'Focusing' : hasSession ? 'Paused' : 'Ready when you are'}
                  </span>
                </div>
                <WindowScene />
                <form onSubmit={toggleTimer} className="timer-form" noValidate>
                  <label htmlFor="topic">What are you studying?</label>
                  <input
                    ref={topicInput}
                    id="topic"
                    name="topic"
                    value={topic}
                    onChange={(event) => {
                      setTopic(event.target.value);
                      setTopicError('');
                    }}
                    placeholder="e.g. Physics · chapter four"
                    maxLength={100}
                    required
                    aria-invalid={Boolean(topicError)}
                    aria-describedby={topicError ? 'topic-error' : undefined}
                    disabled={hasSession}
                    autoComplete="off"
                  />
                  {topicError && (
                    <p id="topic-error" className="mt-3 text-xs text-clay" role="alert">
                      {topicError}
                    </p>
                  )}
                  <div
                    className="timer"
                    role="timer"
                    aria-label={`Session time: ${clock(elapsed)}`}
                    aria-live="off"
                  >
                    {clock(elapsed)}
                  </div>
                  <p className="timer-caption">
                    {running ? 'Just you and the work.' : hasSession ? 'Take the break you need.' : 'Count up. No deadline.'}
                  </p>
                  <div className="timer-actions">
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" className="primary-button" disabled={saving}>
                      <span aria-hidden="true">{running ? 'Ⅱ' : '▷'}</span>
                      {running ? 'Pause' : hasSession ? 'Keep going' : 'Start focusing'}
                    </motion.button>
                    <button
                      className="quiet-button"
                      type="button"
                      onClick={finishCurrentSession}
                      disabled={!hasSession || saving}
                    >
                      Finish session
                    </button>
                  </div>
                  {hasSession && (
                    <button className="reset-button" type="button" onClick={resetTimer}>
                      Reset timer
                    </button>
                  )}
                </form>
                <footer className="focus-footer">
                  <span>{blocked ? 'Not saving yet' : 'Saved to your account'}</span>
                  <span>Durations come from the server clock.</span>
                </footer>
              </section>

              <aside className="right-column" aria-label="Daily progress and room preview">
                <section className="goal-card" aria-labelledby="goal-heading">
                  <div className="card-topline">
                    <h2 id="goal-heading" className="eyebrow">Today’s study goal</h2>
                    <span aria-hidden="true" className="small-star">✳</span>
                  </div>
                  <p className="goal-total">{timeLabel(today)} <span>/ 4h</span></p>
                  <label htmlFor="daily-progress" className="sr-only">Today’s four-hour study goal</label>
                  <progress
                    id="daily-progress"
                    value={Math.min(today, DAILY_GOAL_MS)}
                    max={DAILY_GOAL_MS}
                  />
                  <div className="goal-scale">
                    <span>Today’s focus</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                  <p className="goal-note">
                    {today >= DAILY_GOAL_MS ? 'Goal reached. Make room for a break.' : 'A guide, not a reason to skip a break.'}
                  </p>
                </section>

                <RoomPanel />

                <Suspense fallback={null}>
                  <AiPanel />
                </Suspense>
              </aside>
            </div>

            {zen && (
              <div className="mt-6 max-w-md">
                <SoundMixer />
              </div>
            )}

            <section id="desk-log" className="desk-log" aria-labelledby="log-heading">
              <div className="log-heading">
                <h2 id="log-heading">Small steps, recorded.</h2>
                <span>{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} recorded</span>
              </div>
              {loadError && (
                <p className="mt-3 text-xs text-clay" role="alert">{loadError}</p>
              )}
              {sessions.length === 0 && !loadError ? (
                <div className="empty-log">
                  <span aria-hidden="true">↳</span>
                  <p>Nothing yet.<br /><span>Finish a session to add it.</span></p>
                </div>
              ) : (
                <ul className="session-list">
                  {sessions.slice(0, 12).map((session) => (
                    <li key={session.id}>
                      <span className="log-dot" aria-hidden="true" />
                      <strong>{session.topic}</strong>
                      <time dateTime={new Date(session.start).toISOString()}>
                        {new Date(session.start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                      <span>{timeLabel(session.end - session.start)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <footer className="page-footer">
              <span>Sessions are stamped by the server, in your calendar day</span>
              <nav aria-label="Information" className="flex flex-wrap items-center gap-5">
                <a className="inline-flex min-h-11 items-center hover:text-matcha" href="/about">About</a>
                <a className="inline-flex min-h-11 items-center hover:text-matcha" href="/terms">Terms</a>
                <a className="inline-flex min-h-11 items-center hover:text-matcha" href="/privacy">Privacy</a>
              </nav>
            </footer>
          </main>
          <p className="sr-only" role="status">{announcement}</p>
        </div>
      </div>
    </MotionConfig>
  );
}
