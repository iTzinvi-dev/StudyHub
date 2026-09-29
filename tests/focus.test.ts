import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clock, DAILY_GOAL_MS, duration, timeLabel, todayDuration } from '../src/lib/focus.ts';

test('counts active intervals without counting pauses', () => {
  const intervals = [
    { start: 1000, end: 61000 },
    { start: 121000, end: 181000 },
  ];

  assert.equal(duration(intervals), 120000);
});

test('returns zero for empty and reversed intervals', () => {
  assert.equal(duration([]), 0);
  assert.equal(duration([{ start: 5000, end: 1000 }]), 0);
});

test('counts only the portion after local midnight', () => {
  const now = new Date(2026, 8, 28, 1).getTime();
  const start = new Date(2026, 8, 27, 23, 30).getTime();

  assert.equal(todayDuration([{ start, end: now }], now), 3600000);
});

test('excludes older sessions and future intervals', () => {
  const now = new Date(2026, 8, 28, 12).getTime();
  const intervals = [
    {
      start: new Date(2026, 8, 27, 10).getTime(),
      end: new Date(2026, 8, 27, 11).getTime(),
    },
    { start: now + 1000, end: now + 60000 },
  ];

  assert.equal(todayDuration(intervals, now), 0);
});

test('caps a current interval at now', () => {
  const now = new Date(2026, 8, 28, 12).getTime();

  assert.equal(todayDuration([{ start: now - 60000, end: now + 60000 }], now), 60000);
});

test('resets daily progress at local midnight', () => {
  const now = new Date(2026, 8, 28).getTime();

  assert.equal(todayDuration([{ start: now - 3600000, end: now }], now), 0);
});

test('formats elapsed time without wrapping at 24 hours', () => {
  assert.equal(clock(0), '00:00:00');
  assert.equal(clock(3661999), '01:01:01');
  assert.equal(clock(90000000), '25:00:00');
  assert.equal(clock(-1000), '00:00:00');
});

test('uses a four-hour goal and readable labels', () => {
  assert.equal(DAILY_GOAL_MS, 14400000);
  assert.equal(timeLabel(DAILY_GOAL_MS), '4h 0m');
  assert.equal(timeLabel(8100000), '2h 15m');
});
