export const DAILY_GOAL_MS = 4 * 60 * 60 * 1000;

export type Interval = { start: number; end: number };
export type StudySession = { id: string; topic: string; intervals: Interval[] };

export function duration(intervals: Interval[]): number {
  return intervals.reduce((total, interval) => total + Math.max(0, interval.end - interval.start), 0);
}

export function todayDuration(intervals: Interval[], now: number): number {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return intervals.reduce((total, interval) => {
    const start = Math.max(midnight.getTime(), interval.start);
    const end = Math.min(now, interval.end);
    return total + Math.max(0, end - start);
  }, 0);
}

export function clock(milliseconds: number): string {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
}

export function timeLabel(milliseconds: number): string {
  const minutes = Math.floor(Math.max(0, milliseconds) / 60000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
