'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { WindowScene } from '../components/window-scene';
import {
  clock,
  DAILY_GOAL_MS,
  duration,
  timeLabel,
  todayDuration,
  type Interval,
  type StudySession,
} from '../lib/focus';

const companions = [
  { initials: 'NA', name: 'Nadia', topic: 'Organic chemistry', time: '2h 12m', color: 'matcha' },
  { initials: 'AR', name: 'Arif', topic: 'A small break', time: '1h 48m', color: 'clay' },
  { initials: 'MI', name: 'Mina', topic: 'Reading Murakami', time: '1h 06m', color: 'lavender' },
];

export default function Home() {
  const [topic, setTopic] = useState('');
  const [topicError, setTopicError] = useState('');
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [zen, setZen] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const zenButton = useRef<HTMLButtonElement>(null);
  const topicInput = useRef<HTMLInputElement>(null);
  const running = startedAt !== null;
  const hasSession = running || intervals.length > 0;
  const activeIntervals = startedAt === null
    ? intervals
    : [...intervals, { start: startedAt, end: Math.max(now, startedAt) }];
  const elapsed = duration(activeIntervals);
  const today = todayDuration(
    [...sessions.flatMap((session) => session.intervals), ...activeIntervals],
    now,
  );
  const progress = Math.min(100, (today / DAILY_GOAL_MS) * 100);

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
    if (!hasSession && sessions.length === 0) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasSession, sessions.length]);

  function toggleTimer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const timestamp = Date.now();
    setNow(timestamp);

    if (startedAt !== null) {
      setIntervals((previous) => [...previous, { start: startedAt, end: timestamp }]);
      setStartedAt(null);
      setAnnouncement('Session paused.');
      return;
    }

    if (!topic.trim()) {
      setTopicError('Add a topic before you start.');
      topicInput.current?.focus();
      return;
    }

    setTopicError('');
    setTopic(topic.trim());
    setStartedAt(timestamp);
    setAnnouncement(intervals.length ? 'Session resumed.' : 'Session started.');
  }

  function finishSession() {
    const timestamp = Date.now();
    const completed = startedAt === null
      ? intervals
      : [...intervals, { start: startedAt, end: timestamp }];
    const recorded = duration(completed) > 0;

    if (recorded) {
      setSessions((previous) => [
        { id: crypto.randomUUID(), topic, intervals: completed },
        ...previous,
      ]);
    }

    setStartedAt(null);
    setIntervals([]);
    setNow(timestamp);
    setTopic('');
    setAnnouncement(recorded ? 'Session added to your desk log.' : 'No study time recorded.');
    window.requestAnimationFrame(() => topicInput.current?.focus());
  }

  function resetTimer() {
    if (!window.confirm('Discard this unfinished session? Your desk log stays.')) return;

    setStartedAt(null);
    setIntervals([]);
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
            <span className="avatar matcha" aria-hidden="true">Y</span>
            <div>
              <strong>Your own pace</strong>
              <span>Local preview · no account</span>
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
                    {running ? 'Focusing' : hasSession ? 'Paused' : 'Ready when you are'}
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
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" className="primary-button">
                      <span aria-hidden="true">{running ? 'Ⅱ' : '▷'}</span>
                      {running ? 'Pause' : hasSession ? 'Keep going' : 'Start focusing'}
                    </motion.button>
                    <button
                      className="quiet-button"
                      type="button"
                      onClick={finishSession}
                      disabled={!hasSession}
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
                  <span>Preview · not synced</span>
                  <span>Leaving this page clears your log.</span>
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

                <section className="room-card" aria-labelledby="room-heading">
                  <div className="card-topline">
                    <h2 id="room-heading">Good company.</h2>
                    <span className="sample-badge">Sample</span>
                  </div>
                  <p className="room-description">A preview of shared study rooms.</p>
                  <ul className="companions">
                    {companions.map((person) => (
                      <li key={person.name}>
                        <span className={`avatar ${person.color}`} aria-hidden="true">
                          {person.initials}
                        </span>
                        <div>
                          <strong>{person.name}</strong>
                          <span>{person.topic}</span>
                        </div>
                        <span className="companion-time">{person.time}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="room-footer">Fictional people. No live connection yet.</p>
                </section>
              </aside>
            </div>

            <section id="desk-log" className="desk-log" aria-labelledby="log-heading">
              <div className="log-heading">
                <h2 id="log-heading">Small steps, recorded.</h2>
                <span>{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} on this visit</span>
              </div>
              {sessions.length === 0 ? (
                <div className="empty-log">
                  <span aria-hidden="true">↳</span>
                  <p>Your first session goes here.<br /><span>Finish a session to add it.</span></p>
                </div>
              ) : (
                <ul className="session-list">
                  {sessions.map((session) => (
                    <li key={session.id}>
                      <span className="log-dot" aria-hidden="true" />
                      <strong>{session.topic}</strong>
                      <time dateTime={new Date(session.intervals[0].start).toISOString()}>
                        {new Date(session.intervals[0].start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                      <span>{timeLabel(duration(session.intervals))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <footer className="page-footer">
              <span>Local preview · your device’s calendar day</span>
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
