import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Zap
} from 'lucide-react';
import { FocusSessionRecord } from '../lib/firebase';

export interface DayFocusStat {
  dateStr: string;
  dayName: string; // Mon, Tue...
  dateShort: string; // Oct 8
  displayLabel: string;
  hours: number;
  minutes: number;
  target: number; // 4 hours
  isGoalMet: boolean;
  percent: number;
  isToday: boolean;
  sessionsCount: number;
}

interface WeeklyFocusHeatmapProps {
  streak: number;
  freezeTickets: number;
  sessionsByDate: Record<string, number>;
  sessionRecords: FocusSessionRecord[];
  todayMinutes?: number;
  onUseFreezeTicket: () => void;
  className?: string;
}

export const WeeklyFocusHeatmap: React.FC<WeeklyFocusHeatmapProps> = ({
  streak,
  freezeTickets,
  sessionsByDate,
  sessionRecords,
  todayMinutes = 0,
  onUseFreezeTicket,
  className = ''
}) => {
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Compute past 7 days of verified focus metrics
  const weeklyData: DayFocusStat[] = useMemo(() => {
    const days: DayFocusStat[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;

      let hours = sessionsByDate[dateStr] || 0;
      if (isToday && todayMinutes > 0) {
        const todayHours = Math.round((todayMinutes / 60) * 10) / 10;
        hours = Math.max(hours, todayHours);
      }
      hours = Math.round(hours * 10) / 10;

      const sessionsForDay = sessionRecords.filter((s) => s.date === dateStr);
      const isGoalMet = hours >= 4;

      days.push({
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateShort: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        displayLabel: isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        hours,
        minutes: Math.round(hours * 60),
        target: 4,
        isGoalMet,
        percent: Math.min(200, Math.round((hours / 4) * 100)),
        isToday,
        sessionsCount: sessionsForDay.length
      });
    }

    return days;
  }, [sessionsByDate, sessionRecords, todayMinutes]);

  const totalWeeklyHours = Math.round(weeklyData.reduce((acc, curr) => acc + curr.hours, 0) * 10) / 10;
  const avgDailyHours = Math.round((totalWeeklyHours / 7) * 10) / 10;
  const daysGoalMet = weeklyData.filter((d) => d.isGoalMet).length;
  const weeklyGoalTarget = 28; // 7 days * 4 hours
  const weeklyTargetProgress = Math.min(100, Math.round((totalWeeklyHours / weeklyGoalTarget) * 100));

  // Determine active inspected day (default to today or clicked)
  const activeDay = useMemo(() => {
    if (selectedDateStr) {
      return weeklyData.find((d) => d.dateStr === selectedDateStr) || weeklyData[weeklyData.length - 1];
    }
    return weeklyData[weeklyData.length - 1]; // Today
  }, [weeklyData, selectedDateStr]);

  const activeDaySessions = useMemo(() => {
    return sessionRecords.filter((s) => s.date === activeDay.dateStr);
  }, [sessionRecords, activeDay.dateStr]);

  const getHeatmapColor = (hours: number, isSelected: boolean) => {
    if (hours >= 6) {
      return isSelected
        ? 'bg-gradient-to-t from-[#0EA5E9] to-[#38BDF8] text-white ring-2 ring-white shadow-[0_0_18px_rgba(56,189,248,0.5)]'
        : 'bg-gradient-to-t from-[#0EA5E9] to-[#38BDF8] text-white shadow-[0_0_12px_rgba(14,165,233,0.35)]';
    }
    if (hours >= 4) {
      return isSelected
        ? 'bg-gradient-to-t from-[#0284C7] to-[#0EA5E9] text-white ring-2 ring-white shadow-[0_0_16px_rgba(14,165,233,0.4)]'
        : 'bg-gradient-to-t from-[#0284C7] to-[#0EA5E9] text-white shadow-[0_0_8px_rgba(14,165,233,0.25)]';
    }
    if (hours >= 2) {
      return isSelected
        ? 'bg-[#0369A1] text-white ring-2 ring-white/60 border border-[#0EA5E9]/50'
        : 'bg-[#0369A1]/80 text-white border border-[#0EA5E9]/30 hover:border-[#0EA5E9]/60';
    }
    if (hours > 0) {
      return isSelected
        ? 'bg-[#1E293B] text-slate-200 ring-2 ring-white/40 border border-white/20'
        : 'bg-[#1E293B]/70 text-slate-300 border border-white/10 hover:border-white/25';
    }
    return isSelected
      ? 'bg-white/[0.08] text-slate-400 ring-2 ring-white/30 border border-white/15'
      : 'bg-white/[0.03] text-slate-500 border border-white/10 hover:border-white/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`liquid-glass-card rounded-3xl p-5 sm:p-7 select-none relative overflow-hidden backdrop-blur-2xl ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/[0.08] border border-[#0EA5E9]/40 text-[#0EA5E9] shadow-[0_0_16px_rgba(14,165,233,0.2)]">
            <TrendingUp className="w-5 h-5 text-[#0EA5E9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                Weekly Focus Heatmap
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#0EA5E9] border border-white/10">
                Past 7 Days
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-qurova">
              Daily focus hours achieved over the past 7 days against your 4-hour daily target.
            </p>
          </div>
        </div>

        {/* Goal summary badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs font-qurova text-white shadow-sm">
            <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B] animate-pulse" />
            <span className="text-[#0EA5E9] font-bold">{daysGoalMet} / 7 Days Met</span>
            <span className="text-slate-400 font-mono text-[10px]">(≥4h Target)</span>
          </div>
        </div>
      </div>

      {/* 7-DAY INTERACTIVE HEATMAP MATRIX TILES */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-slate-300 font-qurova mb-2.5">
          <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px] text-[#0EA5E9]">
            <Calendar className="w-3.5 h-3.5" />
            7-Day Intensity Heatmap
          </span>
          <span className="text-[11px] text-slate-400">Click any day to inspect details</span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weeklyData.map((day) => {
            const isSelected = activeDay.dateStr === day.dateStr;
            const heatClass = getHeatmapColor(day.hours, isSelected);

            return (
              <motion.button
                key={day.dateStr}
                type="button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer relative overflow-hidden ${heatClass}`}
              >
                {day.isToday && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#0EA5E9] shadow-[0_0_6px_#0EA5E9]" />
                )}

                <span className="text-[11px] sm:text-xs font-semibold tracking-wide">
                  {day.displayLabel}
                </span>

                <div className="my-1.5 text-sm sm:text-lg font-bold leading-none">
                  {day.hours}h
                </div>

                <span className="text-[9px] font-mono opacity-80 truncate max-w-full">
                  {day.dateShort}
                </span>

                {day.isGoalMet && (
                  <div className="mt-1 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* MAIN RECHARTS VISUALIZATION */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex items-center justify-between text-xs mb-2 font-qurova">
          <span className="text-slate-300 font-mono text-[11px] uppercase tracking-wider">
            Daily Focus Hours (vs 4h Target Line)
          </span>
          <span className="text-[#0EA5E9] font-mono text-xs">
            {totalWeeklyHours} hrs total / {avgDailyHours} hrs daily avg
          </span>
        </div>

        <div className="w-full h-52 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 16, right: 12, left: -18, bottom: 4 }}
            >
              <defs>
                {/* Normal focus gradient */}
                <linearGradient id="barNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#0369A1" stopOpacity={0.7} />
                </linearGradient>

                {/* Goal met radiant gradient */}
                <linearGradient id="barGoalMet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={1} />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity={0.8} />
                </linearGradient>

                {/* Supernova focus (≥6h) */}
                <linearGradient id="barSupernova" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.8} />
                </linearGradient>

                {/* Low / Zero focus gradient */}
                <linearGradient id="barLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#334155" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#1E293B" stopOpacity={0.5} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="displayLabel"
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.12)' }}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.12)' }}
                tickFormatter={(v) => `${v}h`}
                domain={[0, (dataMax: number) => Math.max(6, Math.ceil(dataMax + 1))]}
              />

              {/* Daily 4-Hour Focus Target Line */}
              <ReferenceLine
                y={4}
                stroke="#0EA5E9"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '4h Target',
                  fill: '#0EA5E9',
                  fontSize: 10,
                  position: 'right',
                  fontFamily: 'var(--font-mono)'
                }}
              />

              {/* Custom Recharts Tooltip with Liquid Glass Styling */}
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)', radius: 12 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DayFocusStat;
                    return (
                      <div className="liquid-glass p-3.5 rounded-2xl border border-white/20 text-xs shadow-2xl backdrop-blur-2xl font-qurova min-w-[190px]">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                          <span className="font-semibold text-white">
                            {data.dayName}, {data.dateShort}
                          </span>
                          {data.isToday && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#0EA5E9] text-white font-mono font-bold">
                              TODAY
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between font-mono my-1">
                          <span className="text-slate-300">Achieved:</span>
                          <span className="text-white font-bold text-base">
                            {data.hours} hrs
                          </span>
                        </div>

                        <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                          <span>Target:</span>
                          <span>4.0 hrs ({data.percent}%)</span>
                        </div>

                        <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                          {data.isGoalMet ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Goal Verified 🔥
                            </span>
                          ) : (
                            <span className="text-[#0EA5E9] font-medium">
                              {Math.round((4 - data.hours) * 10) / 10}h remaining
                            </span>
                          )}
                          <span className="text-slate-400 text-[10px] font-mono">
                            {data.sessionsCount} sessions
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar
                dataKey="hours"
                radius={[8, 8, 3, 3]}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {weeklyData.map((entry, index) => {
                  let fill = 'url(#barNormal)';
                  if (entry.hours >= 6) {
                    fill = 'url(#barSupernova)';
                  } else if (entry.isGoalMet) {
                    fill = 'url(#barGoalMet)';
                  } else if (entry.hours === 0) {
                    fill = 'url(#barLow)';
                  }
                  const isCurrentSelected = activeDay.dateStr === entry.dateStr;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fill}
                      stroke={isCurrentSelected ? '#FFFFFF' : entry.isGoalMet ? '#0EA5E9' : 'rgba(255, 255, 255, 0.12)'}
                      strokeWidth={isCurrentSelected ? 2.5 : entry.isGoalMet ? 1.5 : 1}
                      className="transition-all hover:opacity-90 cursor-pointer"
                      onClick={() => setSelectedDateStr(entry.dateStr)}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* INSPECTED DAY BREAKDOWN DRAWER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay.dateStr}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 font-qurova"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">
                {activeDay.dayName}, {activeDay.dateShort} {activeDay.isToday ? '(Today)' : ''}
              </span>
              {activeDay.isGoalMet ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  4h Daily Goal Met 🔥
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-[#0EA5E9]">
                  {Math.round((4 - activeDay.hours) * 10) / 10}h left to goal
                </span>
              )}
            </div>

            <div className="font-mono text-xs text-white">
              <strong>{activeDay.hours} total hours</strong> ({activeDay.percent}% target)
            </div>
          </div>

          {activeDaySessions.length > 0 ? (
            <div className="space-y-1.5">
              {activeDaySessions.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="flex items-center justify-between text-xs font-mono text-white p-2 rounded-xl bg-white/[0.06] border border-white/10"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    <span className="font-qurova text-white">{s.phase}</span>
                  </span>
                  <span className="text-[#0EA5E9] font-bold">
                    {s.minutes} min ({s.hours}h)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic flex items-center justify-between py-1">
              <span>
                {activeDay.hours > 0
                  ? `${activeDay.hours} hours logged in today's active flow.`
                  : 'No deep focus sessions logged on this day.'}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {activeDay.sessionsCount} logged sessions
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* VISUAL KPI METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10 font-qurova">
        {/* Streak Dial */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 relative overflow-hidden"
        >
          <div className="p-2.5 rounded-xl bg-white/[0.08] text-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Flame className="w-4 h-4 fill-[#F59E0B] animate-pulse" />
          </div>
          <div>
            <div className="text-xl text-white leading-tight font-bold">{streak} Days</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Streak Flame</div>
          </div>
        </motion.div>

        {/* 7-Day Total Hours Gauge */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 relative overflow-hidden"
        >
          <div className="p-2.5 rounded-xl bg-white/[0.08] text-[#0EA5E9]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl text-white leading-tight font-bold">{totalWeeklyHours} hrs</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              7-Day Total ({weeklyTargetProgress}%)
            </div>
          </div>
        </motion.div>

        {/* Daily Average Progress */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 relative overflow-hidden"
        >
          <div className="p-2.5 rounded-xl bg-white/[0.08] text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl text-white leading-tight font-bold">{avgDailyHours} h/day</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Daily Pace</div>
          </div>
        </motion.div>

        {/* Freeze Tickets Shield with Action */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between relative overflow-hidden"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-white/[0.08] text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl text-white leading-tight font-bold">{freezeTickets} Left</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Streak Shield</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onUseFreezeTicket}
            disabled={freezeTickets <= 0}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-[10px] font-semibold text-[#0EA5E9] disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            title="Protect today's streak"
          >
            Use
          </button>
        </motion.div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-white/10 font-qurova gap-2">
        <span>Heatmap Intensity (Past 7 Days)</span>
        <div className="flex items-center gap-1.5">
          <span>0h</span>
          <span className="w-3.5 h-3.5 rounded-xs bg-white/[0.04] border border-white/10" title="0h Focus" />
          <span className="w-3.5 h-3.5 rounded-xs bg-[#1E293B]" title="<2h Focus" />
          <span className="w-3.5 h-3.5 rounded-xs bg-[#0369A1]" title="2 - 4h Focus" />
          <span className="w-3.5 h-3.5 rounded-xs bg-gradient-to-t from-[#0284C7] to-[#0EA5E9]" title="4 - 6h Focus (Target Met)" />
          <span className="w-3.5 h-3.5 rounded-xs bg-gradient-to-t from-[#0EA5E9] to-[#38BDF8]" title="≥ 6h Supernova Focus" />
          <span>≥ 6h</span>
        </div>
      </div>
    </motion.div>
  );
};
