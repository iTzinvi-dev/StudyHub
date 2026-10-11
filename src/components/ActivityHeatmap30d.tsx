import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Flame,
  Zap,
  CheckCircle2,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { FocusSessionRecord } from '../lib/firebase';

export interface HeatmapDayCell {
  dateStr: string; // '2026-10-09'
  dateObj: Date;
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  weekIndex: number;
  hours: number;
  level: 0 | 1 | 2 | 3 | 4;
  isGoalMet: boolean;
  isInRange: boolean;
  isToday: boolean;
  sessionsCount: number;
  formattedDate: string; // 'Friday, Oct 9, 2026'
  shortDate: string; // 'Oct 9'
  dayNumber: number; // 1-30 in cycle
}

interface ActivityHeatmap30dProps {
  sessionsByDate: Record<string, number>;
  sessionRecords: FocusSessionRecord[];
  todayMinutes?: number;
  streak?: number;
  loading?: boolean;
  onSelectDay?: (day: HeatmapDayCell) => void;
  selectedDateStr?: string | null;
  className?: string;
}

export const ActivityHeatmap30d: React.FC<ActivityHeatmap30dProps> = ({
  sessionsByDate,
  sessionRecords,
  todayMinutes = 0,
  streak = 0,
  loading = false,
  onSelectDay,
  selectedDateStr,
  className = ''
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDayCell | null>(null);
  const [internalSelectedDate, setInternalSelectedDate] = useState<string | null>(null);

  const activeSelectedDateStr = selectedDateStr !== undefined ? selectedDateStr : internalSelectedDate;

  // Build the 30-day Activity Matrix
  const {
    weeks,
    monthHeaders,
    totalHours,
    goalMetCount,
    activeDaysCount,
    dayMap
  } = useMemo(() => {
    const now = new Date();
    // 30 days window: from (today - 29 days) to today
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    // Calculate the start Sunday for the matrix
    const matrixStart = new Date(startDate);
    matrixStart.setDate(startDate.getDate() - startDate.getDay()); // Sunday

    // Total days to span to cover through today's week end
    const matrixEnd = new Date(endDate);
    matrixEnd.setDate(endDate.getDate() + (6 - endDate.getDay())); // Saturday

    const diffTime = matrixEnd.getTime() - matrixStart.getTime();
    const totalMatrixDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const totalWeeks = Math.ceil(totalMatrixDays / 7);

    let sumHours = 0;
    let goalMet = 0;
    let activeDays = 0;

    const weeksArray: HeatmapDayCell[][] = [];
    const map = new Map<string, HeatmapDayCell>();
    const monthHeaderList: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const weekCells: HeatmapDayCell[] = [];

      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(matrixStart);
        currentDate.setDate(matrixStart.getDate() + (w * 7 + d));
        currentDate.setHours(12, 0, 0, 0);

        const dateStr = currentDate.toISOString().split('T')[0];
        const isToday =
          currentDate.getDate() === now.getDate() &&
          currentDate.getMonth() === now.getMonth() &&
          currentDate.getFullYear() === now.getFullYear();

        const isInRange = currentDate >= startDate && currentDate <= endDate;

        let hours = 0;
        let sessionsCount = 0;

        if (isInRange) {
          hours = sessionsByDate[dateStr] || 0;
          if (isToday && todayMinutes > 0) {
            const todayHours = Math.round((todayMinutes / 60) * 10) / 10;
            hours = Math.max(hours, todayHours);
          }
          hours = Math.round(hours * 10) / 10;

          const daySessions = sessionRecords.filter((s) => s.date === dateStr);
          sessionsCount = daySessions.length;

          if (hours > 0) activeDays++;
          if (hours >= 4) goalMet++;
          sumHours += hours;
        }

        // Calculate Level (0-4)
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (hours >= 6) {
          level = 4;
        } else if (hours >= 4) {
          level = 3;
        } else if (hours >= 2) {
          level = 2;
        } else if (hours > 0) {
          level = 1;
        }

        // Day number relative to 30d window
        const dayDiff = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const dayNumber = isInRange ? Math.min(30, Math.max(1, dayDiff)) : 0;

        const cell: HeatmapDayCell = {
          dateStr,
          dateObj: currentDate,
          dayOfWeek: d,
          weekIndex: w,
          hours,
          level,
          isGoalMet: hours >= 4,
          isInRange,
          isToday,
          sessionsCount,
          formattedDate: currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          shortDate: currentDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          dayNumber
        };

        weekCells.push(cell);
        if (isInRange) {
          map.set(dateStr, cell);
        }

        // Month Header tracking on the first row of each week
        if (d === 0 && isInRange) {
          const m = currentDate.getMonth();
          if (m !== lastMonth) {
            monthHeaderList.push({
              label: currentDate.toLocaleDateString('en-US', { month: 'short' }),
              weekIndex: w
            });
            lastMonth = m;
          }
        }
      }

      weeksArray.push(weekCells);
    }

    return {
      weeks: weeksArray,
      monthHeaders: monthHeaderList,
      totalHours: Math.round(sumHours * 10) / 10,
      goalMetCount: goalMet,
      activeDaysCount: activeDays,
      dayMap: map
    };
  }, [sessionsByDate, sessionRecords, todayMinutes]);

  // Selected Day resolution
  const selectedDay = useMemo(() => {
    if (activeSelectedDateStr && dayMap.has(activeSelectedDateStr)) {
      return dayMap.get(activeSelectedDateStr)!;
    }
    // Default to today
    const todayStr = new Date().toISOString().split('T')[0];
    if (dayMap.has(todayStr)) {
      return dayMap.get(todayStr)!;
    }
    // Or latest day in range
    const all = Array.from(dayMap.values());
    return all.length > 0 ? all[all.length - 1] : null;
  }, [activeSelectedDateStr, dayMap]);

  const selectedDaySessions = useMemo(() => {
    if (!selectedDay) return [];
    return sessionRecords.filter((s) => s.date === selectedDay.dateStr);
  }, [selectedDay, sessionRecords]);

  // Emerald Green Cell Classes
  const getCellClasses = (cell: HeatmapDayCell, isSelected: boolean) => {
    if (!cell.isInRange) {
      return 'opacity-0 pointer-events-none';
    }

    switch (cell.level) {
      case 4:
        return isSelected
          ? 'bg-[#39D353] border-white ring-2 ring-white shadow-[0_0_12px_rgba(57,211,83,0.7)]'
          : 'bg-[#39D353] border-[#39D353]/80 hover:border-white shadow-[0_0_8px_rgba(57,211,83,0.4)]';
      case 3:
        return isSelected
          ? 'bg-[#26A641] border-white ring-2 ring-white shadow-[0_0_10px_rgba(38,166,65,0.6)]'
          : 'bg-[#26A641] border-[#26A641]/80 hover:border-white';
      case 2:
        return isSelected
          ? 'bg-[#006D32] border-white ring-2 ring-white shadow-[0_0_8px_rgba(0,109,50,0.5)]'
          : 'bg-[#006D32] border-[#006D32]/80 hover:border-white';
      case 1:
        return isSelected
          ? 'bg-[#0E4429] border-white ring-2 ring-white shadow-[0_0_6px_rgba(14,68,41,0.5)]'
          : 'bg-[#0E4429] border-[#0E4429]/90 hover:border-[#26A641]';
      case 0:
      default:
        return isSelected
          ? 'bg-[#161B22] border-white ring-2 ring-white'
          : 'bg-[#161B22] border-[#30363D]/80 hover:border-[#8B949E]';
    }
  };

  const handleCellClick = (cell: HeatmapDayCell) => {
    if (!cell.isInRange) return;
    setInternalSelectedDate(cell.dateStr);
    if (onSelectDay) {
      onSelectDay(cell);
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-7 bg-[#0D1117]/85 border border-[#30363D] shadow-2xl relative overflow-hidden backdrop-blur-2xl ${className}`}
    >
      {/* Top Header - Purely named '30d activity heatmap' */}
      <div className="flex items-center justify-between pb-4 border-b border-[#30363D]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#161B22] border border-[#30363D] text-[#39D353] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#39D353]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            30d activity heatmap
          </h3>
        </div>
      </div>

      {/* Main Heatmap Grid Canvas */}
      <div className="mt-6 overflow-x-auto pb-2 select-none">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400 font-mono animate-pulse">
            Synchronizing verified sessions from Firestore...
          </div>
        ) : (
          <div className="inline-block min-w-[340px] max-w-full">
            {/* Month labels aligned with week columns */}
            <div className="flex pl-8 mb-1.5 text-[10px] font-mono text-slate-400">
              {weeks.map((week, wIdx) => {
                const header = monthHeaders.find((h) => h.weekIndex === wIdx);
                return (
                  <div key={wIdx} className="w-5 sm:w-6 mr-1.5 text-left truncate">
                    {header ? header.label : ''}
                  </div>
                );
              })}
            </div>

            {/* Matrix Rows (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat) */}
            <div className="flex">
              {/* Day of Week Labels (Y-axis): Mon, Wed, Fri */}
              <div className="flex flex-col justify-between pr-2.5 text-[9px] font-mono text-slate-400 select-none py-0.5 h-[162px] sm:h-[188px]">
                <span className="h-4 sm:h-5 flex items-center opacity-0">Sun</span>
                <span className="h-4 sm:h-5 flex items-center">Mon</span>
                <span className="h-4 sm:h-5 flex items-center opacity-0">Tue</span>
                <span className="h-4 sm:h-5 flex items-center">Wed</span>
                <span className="h-4 sm:h-5 flex items-center opacity-0">Thu</span>
                <span className="h-4 sm:h-5 flex items-center">Fri</span>
                <span className="h-4 sm:h-5 flex items-center opacity-0">Sat</span>
              </div>

              {/* Columns of Weeks */}
              <div className="flex gap-1.5 sm:gap-2">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5 sm:gap-2">
                    {week.map((cell) => {
                      const isSelected = selectedDay?.dateStr === cell.dateStr;
                      const cellClass = getCellClasses(cell, isSelected);

                      return (
                        <div key={cell.dateStr} className="relative group">
                          <button
                            type="button"
                            onClick={() => handleCellClick(cell)}
                            onMouseEnter={() => cell.isInRange && setHoveredDay(cell)}
                            onMouseLeave={() => setHoveredDay(null)}
                            disabled={!cell.isInRange}
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-[3px] border transition-transform duration-100 cursor-pointer flex items-center justify-center ${cellClass} ${
                              isSelected ? 'scale-115 z-10' : 'hover:scale-110'
                            }`}
                            aria-label={`${cell.hours} hours on ${cell.formattedDate}`}
                          >
                            {/* Inner dot indicator if today */}
                            {cell.isToday && (
                              <span className="w-1 h-1 rounded-full bg-white opacity-90 pointer-events-none" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Hover Tooltip / Status Display */}
            <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-[#30363D]">
              <div className="text-slate-300 font-mono text-[11px] flex items-center gap-2">
                {hoveredDay ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#39D353] inline-block" />
                    <span>
                      <strong className="text-white">{hoveredDay.hours} hours</strong> on {hoveredDay.formattedDate}
                      {hoveredDay.isGoalMet ? ' • 🔥 4h Target Met' : ''}
                      {hoveredDay.sessionsCount > 0 ? ` (${hoveredDay.sessionsCount} sessions)` : ''}
                    </span>
                  </>
                ) : selectedDay ? (
                  <>
                    <span className="text-slate-400">Inspecting:</span>
                    <strong className="text-white">{selectedDay.shortDate}</strong>
                    <span>({selectedDay.hours}h logged)</span>
                    {selectedDay.isToday && <span className="text-[#39D353] font-semibold">• Today</span>}
                  </>
                ) : (
                  <span>Hover or click any square to inspect verified focus history.</span>
                )}
              </div>

              {/* 5-Level Green Legend */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 self-end sm:self-auto">
                <span>Less</span>
                <span className="w-3 h-3 rounded-[2px] bg-[#161B22] border border-[#30363D]" title="0 hours" />
                <span className="w-3 h-3 rounded-[2px] bg-[#0E4429] border border-[#0E4429]" title="< 2 hours" />
                <span className="w-3 h-3 rounded-[2px] bg-[#006D32] border border-[#006D32]" title="2 - 4 hours" />
                <span className="w-3 h-3 rounded-[2px] bg-[#26A641] border border-[#26A641]" title="4 - 6 hours (Goal Met)" />
                <span className="w-3 h-3 rounded-[2px] bg-[#39D353] border border-[#39D353]" title="≥ 6 hours" />
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Day Verified Focus Activity Panel */}
      {selectedDay && (
        <div className="mt-5 p-4 rounded-2xl bg-[#161B22]/90 border border-[#30363D] shadow-inner text-xs">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#30363D]">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#39D353]" />
              <span className="font-semibold text-white font-mono">
                {selectedDay.formattedDate}
              </span>
              {selectedDay.isToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#238636] text-white">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-300">
                Total:{' '}
                <strong className={selectedDay.hours >= 4 ? 'text-[#39D353]' : 'text-white'}>
                  {selectedDay.hours} hours
                </strong>
              </span>
              {selectedDay.hours >= 4 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#238636]/20 text-[#39D353] border border-[#238636]/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Goal Met
                </span>
              )}
            </div>
          </div>

          {selectedDaySessions.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                Logged Work Sessions ({selectedDaySessions.length})
              </span>
              <div className="space-y-1.5 mt-1">
                {selectedDaySessions.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#0D1117] border border-[#30363D] text-[11px] font-mono"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Zap className="w-3.5 h-3.5 text-[#39D353]" />
                      <span className="font-semibold">{s.phase || 'DEEP FOCUS SESSION'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span>{s.minutes} mins</span>
                      <span className="text-[#39D353] font-bold">({s.hours}h)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic font-qurova py-1">
              {selectedDay.hours > 0
                ? `${selectedDay.hours} hours logged in this day's focus records.`
                : 'No verified focus sessions logged for this day. Complete a focus block to fill in this square!'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

