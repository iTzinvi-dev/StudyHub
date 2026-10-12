import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  CheckCircle2,
  Sparkles,
  Award,
  Target,
  Edit3,
  Sliders,
  Flame
} from 'lucide-react';
import { auth, subscribeUserHabits, saveHabitToFirestore, deleteHabitFromFirestore, syncLocalHabitsToFirestore, HabitRecord } from '../lib/firebase';
import { UserProfile } from '../types';
import { safeGetItem, safeSetItem } from '../utils/storage';

interface RoutineMatrixProps {
  user: UserProfile;
  className?: string;
}

export interface RoutineDayColumn {
  dateStr: string;
  dayName: string; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  dayNumber: number;
  isToday: boolean;
  fullFormatted: string;
}

// Exactly 3 initial readymade templates: "Study", "Reading", "Workout" with default daily goals
export const CANONICAL_TEMPLATES: {
  id: string;
  name: string;
  order: number;
  targetValue: number;
  targetUnit: string;
}[] = [
  { id: 'template_study', name: 'Study', order: 0, targetValue: 60, targetUnit: 'mins' },
  { id: 'template_reading', name: 'Reading', order: 1, targetValue: 30, targetUnit: 'mins' },
  { id: 'template_workout', name: 'Workout', order: 2, targetValue: 45, targetUnit: 'mins' }
];

const WEEK_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Subtle elegant Framer-Motion particles for 7-day streak celebration - Plain Liquid Glass White
interface StreakParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  rotate: number;
}

function createStreakParticles(): StreakParticle[] {
  const colors = ['#FFFFFF', '#F8FAFC', '#E2E8F0', '#FFFFFF', '#CBD5E1'];
  const particles: StreakParticle[] = [];
  const count = 24;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.35;
    const distance = 45 + Math.random() * 70;
    particles.push({
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: Math.random() * 5 + 3,
      color: colors[i % colors.length],
      delay: Math.random() * 0.12,
      rotate: Math.random() * 360
    });
  }
  return particles;
}

// Simple, classy, aesthetic icon animation wrapper - strictly classic & simple (no flashy colors)
const ClassyIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
  type?: 'pulse' | 'float' | 'spin-subtle' | 'twinkle';
}> = ({ children, className = '', type = 'pulse' }) => {
  const getAnimation = () => {
    switch (type) {
      case 'float':
        return {
          y: [0, -1.8, 0],
          scale: [1, 1.05, 1],
          filter: [
            'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
            'drop-shadow(0 0 4px rgba(255,255,255,0.7))',
            'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
          ]
        };
      case 'twinkle':
        return {
          rotate: [0, -5, 5, 0],
          scale: [1, 1.08, 1],
          filter: [
            'drop-shadow(0 0 1px rgba(255,255,255,0.25))',
            'drop-shadow(0 0 4px rgba(255,255,255,0.65))',
            'drop-shadow(0 0 1px rgba(255,255,255,0.25))'
          ]
        };
      case 'spin-subtle':
        return {
          rotate: [0, 4, -4, 0],
          scale: [1, 1.05, 1]
        };
      case 'pulse':
      default:
        return {
          scale: [1, 1.08, 1],
          filter: [
            'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
            'drop-shadow(0 0 5px rgba(255,255,255,0.75))',
            'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
          ]
        };
    }
  };

  return (
    <motion.span
      animate={getAnimation()}
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
    >
      {children}
    </motion.span>
  );
};

export const RoutineMatrix: React.FC<RoutineMatrixProps> = ({ user, className = '' }) => {
  const currentUid = auth.currentUser?.uid || user.id || 'guest';
  const localStorageKey = `zenbonfire_habits_v4_${currentUid}`;

  // Today's exact date string (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  }, []);

  // 1. Fixed standard 7-day grid of Sun-Mon-Tue-Wed-Thu-Fri-Sat of the current week
  const last7Days: RoutineDayColumn[] = useMemo(() => {
    const days: RoutineDayColumn[] = [];
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday

    const sunday = new Date(now);
    sunday.setDate(now.getDate() - currentDayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${date}`;

      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();

      days.push({
        dateStr,
        dayName: WEEK_DAY_NAMES[i],
        dayNumber: d.getDate(),
        isToday,
        fullFormatted: `${WEEK_DAY_NAMES[i]}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      });
    }

    return days;
  }, []);

  // 2. Initial state: Exactly the 3 canonical templates (Study, Reading, Workout)
  const [habits, setHabits] = useState<HabitRecord[]>(() => {
    try {
      const saved = safeGetItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return CANONICAL_TEMPLATES.map((t) => ({
      id: t.id,
      habitName: t.name,
      completedDates: [],
      targetValue: t.targetValue,
      targetUnit: t.targetUnit,
      dailyProgress: {},
      order: t.order
    }));
  });

  const habitsRef = useRef<HabitRecord[]>(habits);
  habitsRef.current = habits;

  // Particle celebration state
  const [celebration, setCelebration] = useState<{
    habitId: string;
    habitName: string;
    particles: StreakParticle[];
  } | null>(null);

  // Add Habit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState<number>(30);
  const [newHabitUnit, setNewHabitUnit] = useState<string>('mins');

  // Rename Habit State
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitName, setEditingHabitName] = useState('');
  const inlineEditRef = useRef<HTMLDivElement>(null);

  // Daily Goal Settings Modal State
  const [goalModalHabit, setGoalModalHabit] = useState<HabitRecord | null>(null);
  const [goalTargetInput, setGoalTargetInput] = useState<number>(30);
  const [goalUnitInput, setGoalUnitInput] = useState<string>('mins');

  // Custom Log Modal State
  const [logModalHabit, setLogModalHabit] = useState<HabitRecord | null>(null);
  const [logValueInput, setLogValueInput] = useState<number>(0);

  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setStatusToast(msg);
    setTimeout(() => {
      setStatusToast(null);
    }, 2400);
  }, []);

  // 3. Background sync to fast backend endpoint /api/tracker/sync
  const syncToBackend = useCallback((habitsToSync: HabitRecord[]) => {
    try {
      fetch('/api/tracker/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: habitsToSync, userId: currentUid })
      }).catch(() => {
        // quiet offline ignore
      });
    } catch {
      // ignore
    }
  }, [currentUid]);

  // 4. Strict, rock-solid Firestore & Local Storage sync (Fast, bug-free, respectful of user edits)
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeUserHabits(currentUid, async (fetchedHabits) => {
      if (!isMounted) return;

      if (!fetchedHabits || fetchedHabits.length === 0) {
        // If we already have user habits in memory/local storage, don't erase them!
        if (habitsRef.current.length > 0) {
          syncToBackend(habitsRef.current);
          if (auth.currentUser && !currentUid.startsWith('usr_guest')) {
            syncLocalHabitsToFirestore(currentUid, habitsRef.current).catch(() => {});
          }
          return;
        }

        // Fresh first-time boot: seed canonical 3 templates
        const initial = CANONICAL_TEMPLATES.map((t) => ({
          id: t.id,
          habitName: t.name,
          completedDates: [],
          targetValue: t.targetValue,
          targetUnit: t.targetUnit,
          dailyProgress: {},
          order: t.order,
          createdAt: new Date().toISOString()
        }));

        setHabits(initial);
        try {
          safeSetItem(localStorageKey, JSON.stringify(initial));
        } catch {
          // ignore
        }
        syncToBackend(initial);
        if (auth.currentUser && !currentUid.startsWith('usr_guest')) {
          syncLocalHabitsToFirestore(currentUid, initial).catch(() => {});
        }
        return;
      }

      // We have real records from Firestore. Respect user habit names, orders, targets, and custom habits!
      const sanitized: HabitRecord[] = fetchedHabits.map((h, idx) => ({
        id: h.id,
        habitName: (h.habitName || '').trim() || 'Routine',
        completedDates: Array.isArray(h.completedDates) ? h.completedDates : [],
        targetValue: typeof h.targetValue === 'number' && h.targetValue > 0 ? h.targetValue : 30,
        targetUnit: typeof h.targetUnit === 'string' && h.targetUnit.trim() ? h.targetUnit.trim() : 'mins',
        dailyProgress: h.dailyProgress && typeof h.dailyProgress === 'object' ? h.dailyProgress : {},
        order: typeof h.order === 'number' ? h.order : idx,
        createdAt: h.createdAt || ''
      }));

      sanitized.sort((a, b) => ((a.order ?? 0) - (b.order ?? 0)) || a.id.localeCompare(b.id));

      // Avoid unnecessary re-renders if unchanged
      const currentJson = JSON.stringify(habitsRef.current);
      const incomingJson = JSON.stringify(sanitized);
      if (currentJson !== incomingJson) {
        setHabits(sanitized);
        try {
          safeSetItem(localStorageKey, incomingJson);
        } catch {
          // ignore
        }
        syncToBackend(sanitized);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUid, localStorageKey, syncToBackend]);

  // Global keydown listener for Escape key to close any modal or inline edit instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (goalModalHabit) setGoalModalHabit(null);
        if (logModalHabit) setLogModalHabit(null);
        if (editingHabitId) setEditingHabitId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, goalModalHabit, logModalHabit, editingHabitId]);

  // Save renamed routine callback
  const handleSaveEditHabit = useCallback(async (habitId: string) => {
    const trimmed = editingHabitName.trim();
    if (!trimmed) {
      setEditingHabitId(null);
      return;
    }

    const updated = habitsRef.current.map((h) =>
      h.id === habitId ? { ...h, habitName: trimmed } : h
    );
    setHabits(updated);
    try {
      safeSetItem(localStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    syncToBackend(updated);
    setEditingHabitId(null);
    showToast(`Renamed to "${trimmed}"`);

    const target = updated.find((h) => h.id === habitId);
    if (target) {
      try {
        await saveHabitToFirestore(currentUid, target);
      } catch (err) {
        console.warn('Update habit notice:', err);
      }
    }
  }, [editingHabitName, currentUid, localStorageKey, showToast, syncToBackend]);

  // FEATURE: Tap anywhere on screen while in editing task name -> automatically commits & goes back!
  useEffect(() => {
    if (!editingHabitId) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (inlineEditRef.current && !inlineEditRef.current.contains(e.target as Node)) {
        // User tapped anywhere on the screen outside of the editing input!
        handleSaveEditHabit(editingHabitId);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [editingHabitId, handleSaveEditHabit]);

  // 5. Toggle single day cell (Instant local state + Bidirectional numeric progress sync)
  const handleToggleCell = useCallback(async (habitId: string, dateStr: string) => {
    const currentList = habitsRef.current;
    const index = currentList.findIndex((h) => h.id === habitId);
    if (index === -1) return;

    const target = currentList[index];
    const isCompleted = target.completedDates.includes(dateStr);
    const updatedDates = isCompleted
      ? target.completedDates.filter((d) => d !== dateStr)
      : [...target.completedDates, dateStr];

    const targetGoal = target.targetValue || 30;
    const progressMap = target.dailyProgress || {};
    const updatedDailyProgress = { ...progressMap };

    if (!isCompleted) {
      if (dateStr === todayStr) {
        const currentLogged = progressMap[todayStr] || 0;
        if (currentLogged < targetGoal) {
          updatedDailyProgress[todayStr] = targetGoal;
        }
      }
    } else {
      if (dateStr === todayStr) {
        delete updatedDailyProgress[todayStr];
      }
    }

    const updatedList = [...currentList];
    updatedList[index] = {
      ...target,
      completedDates: updatedDates,
      dailyProgress: updatedDailyProgress
    };

    setHabits(updatedList);
    try {
      safeSetItem(localStorageKey, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    syncToBackend(updatedList);

    // Subtle Particle Celebration trigger on perfect 7-day streak
    const all7DaysPresent = last7Days.every((day) => updatedDates.includes(day.dateStr));
    if (!isCompleted && all7DaysPresent) {
      setCelebration({
        habitId: target.id,
        habitName: target.habitName,
        particles: createStreakParticles()
      });
      setTimeout(() => {
        setCelebration((curr) => (curr?.habitId === target.id ? null : curr));
      }, 3800);
    }

    // Persist to Firestore
    saveHabitToFirestore(currentUid, {
      id: target.id,
      habitName: target.habitName,
      completedDates: updatedDates,
      targetValue: target.targetValue,
      targetUnit: target.targetUnit,
      dailyProgress: updatedDailyProgress,
      order: target.order
    }).catch((err) => {
      console.warn('Firestore toggle notice:', err);
    });
  }, [todayStr, currentUid, localStorageKey, last7Days, syncToBackend]);

  // 6. Quick Numeric Progress Increment (+5m, +15m, or -5m)
  const handleQuickIncrement = useCallback(async (habitId: string, delta: number) => {
    const currentList = habitsRef.current;
    const index = currentList.findIndex((h) => h.id === habitId);
    if (index === -1) return;

    const target = currentList[index];
    const targetGoal = target.targetValue || 30;
    const progressMap = target.dailyProgress || {};
    const currentTodayVal = progressMap[todayStr] || 0;
    const newTodayVal = Math.max(0, currentTodayVal + delta);

    const updatedDailyProgress = {
      ...progressMap,
      [todayStr]: newTodayVal
    };

    const wasAlreadyCompleted = target.completedDates.includes(todayStr);
    const isNowMet = newTodayVal >= targetGoal;
    let updatedDates = [...target.completedDates];

    if (isNowMet && !wasAlreadyCompleted) {
      updatedDates.push(todayStr);
      showToast(`Goal reached for "${target.habitName}" (${newTodayVal}/${targetGoal} ${target.targetUnit || 'mins'})!`);

      // Check if all 7 days are complete
      const all7DaysPresent = last7Days.every((day) => updatedDates.includes(day.dateStr));
      if (all7DaysPresent) {
        setCelebration({
          habitId: target.id,
          habitName: target.habitName,
          particles: createStreakParticles()
        });
        setTimeout(() => {
          setCelebration((curr) => (curr?.habitId === target.id ? null : curr));
        }, 3800);
      }
    } else if (!isNowMet && wasAlreadyCompleted) {
      updatedDates = updatedDates.filter((d) => d !== todayStr);
    }

    const updatedList = [...currentList];
    updatedList[index] = {
      ...target,
      completedDates: updatedDates,
      dailyProgress: updatedDailyProgress
    };

    setHabits(updatedList);
    try {
      safeSetItem(localStorageKey, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    syncToBackend(updatedList);

    // Persist to Firestore
    saveHabitToFirestore(currentUid, {
      id: target.id,
      habitName: target.habitName,
      completedDates: updatedDates,
      targetValue: target.targetValue,
      targetUnit: target.targetUnit,
      dailyProgress: updatedDailyProgress,
      order: target.order
    }).catch((err) => {
      console.warn('Progress update notice:', err);
    });
  }, [todayStr, currentUid, localStorageKey, last7Days, showToast, syncToBackend]);

  // 7. Save Daily Numeric Goal Settings (e.g., '30 minutes of reading')
  const handleSaveGoalSettings = useCallback(async () => {
    if (!goalModalHabit) return;

    const habitId = goalModalHabit.id;
    const targetVal = Math.max(1, goalTargetInput || 30);
    const targetUnit = (goalUnitInput || 'mins').trim();

    const currentList = habitsRef.current;
    const index = currentList.findIndex((h) => h.id === habitId);
    if (index === -1) return;

    const target = currentList[index];
    const progressMap = target.dailyProgress || {};
    const todayVal = progressMap[todayStr] || 0;

    // Check if new goal changes today's completion status
    let updatedDates = [...target.completedDates];
    if (todayVal >= targetVal && !updatedDates.includes(todayStr)) {
      updatedDates.push(todayStr);
    }

    const updatedList = [...currentList];
    updatedList[index] = {
      ...target,
      targetValue: targetVal,
      targetUnit,
      completedDates: updatedDates
    };

    setHabits(updatedList);
    try {
      safeSetItem(localStorageKey, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    syncToBackend(updatedList);

    setGoalModalHabit(null);
    showToast(`Updated goal: ${targetVal} ${targetUnit}/day for "${target.habitName}"`);

    try {
      await saveHabitToFirestore(currentUid, {
        id: target.id,
        habitName: target.habitName,
        completedDates: updatedDates,
        targetValue: targetVal,
        targetUnit,
        dailyProgress: target.dailyProgress,
        order: target.order
      });
    } catch (err) {
      console.warn('Save habit goal notice:', err);
    }
  }, [goalModalHabit, goalTargetInput, goalUnitInput, todayStr, currentUid, localStorageKey, showToast, syncToBackend]);

  // 8. Custom Log Value Save
  const handleSaveCustomLog = useCallback(() => {
    if (!logModalHabit) return;
    const habitId = logModalHabit.id;
    const logAmount = Math.max(0, logValueInput);

    const currentList = habitsRef.current;
    const index = currentList.findIndex((h) => h.id === habitId);
    if (index === -1) return;

    const target = currentList[index];
    const targetGoal = target.targetValue || 30;
    const progressMap = target.dailyProgress || {};

    const updatedDailyProgress = {
      ...progressMap,
      [todayStr]: logAmount
    };

    let updatedDates = [...target.completedDates];
    if (logAmount >= targetGoal && !updatedDates.includes(todayStr)) {
      updatedDates.push(todayStr);
    } else if (logAmount < targetGoal && updatedDates.includes(todayStr)) {
      updatedDates = updatedDates.filter((d) => d !== todayStr);
    }

    const updatedList = [...currentList];
    updatedList[index] = {
      ...target,
      completedDates: updatedDates,
      dailyProgress: updatedDailyProgress
    };

    setHabits(updatedList);
    try {
      safeSetItem(localStorageKey, JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    syncToBackend(updatedList);

    setLogModalHabit(null);
    showToast(`Logged ${logAmount} ${target.targetUnit || 'mins'} for "${target.habitName}"`);

    saveHabitToFirestore(currentUid, {
      id: target.id,
      habitName: target.habitName,
      completedDates: updatedDates,
      targetValue: target.targetValue,
      targetUnit: target.targetUnit,
      dailyProgress: updatedDailyProgress,
      order: target.order
    }).catch((err) => {
      console.warn('Custom log notice:', err);
    });
  }, [logModalHabit, logValueInput, todayStr, currentUid, localStorageKey, showToast, syncToBackend]);

  // 9. Add routine with optional custom goal
  const handleAddHabit = useCallback(async (nameToAdd?: string, goalVal?: number, goalUnit?: string) => {
    const title = (nameToAdd || newHabitName).trim();
    if (!title) return;

    if (habitsRef.current.some((h) => h.habitName.toLowerCase() === title.toLowerCase())) {
      showToast(`"${title}" is already in your routine.`);
      return;
    }

    const finalGoal = goalVal !== undefined ? goalVal : (newHabitGoal > 0 ? newHabitGoal : 30);
    const finalUnit = (goalUnit || newHabitUnit || 'mins').trim();

    const newHabit: HabitRecord = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      habitName: title,
      completedDates: [],
      targetValue: finalGoal,
      targetUnit: finalUnit,
      dailyProgress: {},
      order: habitsRef.current.length,
      createdAt: new Date().toISOString()
    };

    const updated = [...habitsRef.current, newHabit];
    setHabits(updated);
    try {
      safeSetItem(localStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    syncToBackend(updated);

    setNewHabitName('');
    setNewHabitGoal(30);
    setNewHabitUnit('mins');
    setIsAddModalOpen(false);
    showToast(`Added: "${title}" (Goal: ${finalGoal} ${finalUnit}/day)`);

    try {
      await saveHabitToFirestore(currentUid, newHabit);
    } catch (err) {
      console.warn('Save habit notice:', err);
    }
  }, [newHabitName, newHabitGoal, newHabitUnit, currentUid, localStorageKey, showToast, syncToBackend]);

  // 10. Delete routine
  const handleDeleteHabit = useCallback(async (habitId: string, habitName: string) => {
    const updated = habitsRef.current.filter((h) => h.id !== habitId);
    setHabits(updated);
    try {
      safeSetItem(localStorageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    syncToBackend(updated);
    showToast(`Removed: "${habitName}"`);

    try {
      await deleteHabitFromFirestore(currentUid, habitId);
    } catch (err) {
      console.warn('Delete habit notice:', err);
    }
  }, [currentUid, localStorageKey, showToast, syncToBackend]);

  return (
    <div className={`liquid-glass-card rounded-3xl p-6 sm:p-8 backdrop-blur-2xl relative select-none border border-white/10 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            <ClassyIcon type="float">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </ClassyIcon>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Routine Tracker</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Daily numeric targets & progress bars alongside 7-day completion toggles
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="liquid-glass-btn-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all bg-white text-black"
          >
            <ClassyIcon type="twinkle">
              <Plus className="w-4 h-4 stroke-[2.5] text-black" />
            </ClassyIcon>
            <span>Add Routine</span>
          </button>
        </div>
      </div>

      {/* Subtle, Elegant Framer-Motion 7-Day Streak Celebration Effect - Plain Liquid Glass White */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative my-4 p-4 rounded-2xl bg-white/[0.08] border border-white/25 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-between overflow-hidden"
          >
            {/* Framer-Motion Particles */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {celebration.particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                  animate={{
                    opacity: [1, 0.9, 0],
                    x: p.x,
                    y: p.y,
                    scale: [0, 1.2, 0.4],
                    rotate: p.rotate
                  }}
                  transition={{
                    duration: 1.6,
                    delay: p.delay,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    boxShadow: `0 0 10px rgba(255, 255, 255, 0.8)`
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_16px_rgba(255,255,255,0.4)] shrink-0">
                <ClassyIcon type="pulse">
                  <Flame className="w-5 h-5 text-black fill-black" />
                </ClassyIcon>
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Perfect 7-Day Streak Achieved!</span>
                  <ClassyIcon type="twinkle">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </ClassyIcon>
                </div>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  Completed every single day of the 7-day cycle for "{celebration.habitName}". Outstanding dedication!
                </p>
              </div>
            </div>

            <button
              onClick={() => setCelebration(null)}
              className="text-white/50 hover:text-white p-1.5 rounded-lg cursor-pointer transition-colors relative z-10"
              title="Dismiss"
            >
              <ClassyIcon type="spin-subtle">
                <X className="w-4 h-4" />
              </ClassyIcon>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* One Plain Sheet of Habit Tracking Table - Completely Flat, Plain, and Stable */}
      <div className="mt-5 overflow-x-auto custom-scrollbar">
        <div className="min-w-[760px]">
          {/* Table Header: Habits Column + Daily Goal & Progress Column + Sun to Sat 7-Day Columns */}
          <div className="grid grid-cols-[minmax(150px,1.2fr)_minmax(230px,1.6fr)_repeat(7,minmax(44px,1fr))] gap-2.5 pb-3 items-center text-center font-mono border-b border-white/10">
            <div className="text-left text-xs uppercase tracking-wider text-slate-400 pl-3 font-semibold">
              Habits
            </div>

            <div className="text-left text-xs uppercase tracking-wider text-slate-400 pl-2 font-semibold flex items-center gap-1.5">
              <ClassyIcon type="float">
                <Target className="w-3.5 h-3.5 text-white" />
              </ClassyIcon>
              <span>Daily Goal & Progress</span>
            </div>

            {last7Days.map((day) => (
              <div
                key={day.dateStr}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  day.isToday
                    ? 'liquid-glass-today-col text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.22),inset_0_1.5px_2px_rgba(255,255,255,0.5)]'
                    : 'bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${day.isToday ? 'text-emerald-200 font-bold' : 'text-slate-300'}`}>
                    {day.dayName}
                  </span>
                  {day.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  )}
                </div>
                <span className={`text-xs mt-0.5 ${day.isToday ? 'font-extrabold text-white' : 'text-slate-400 font-medium'}`}>
                  {day.dayNumber}
                </span>
              </div>
            ))}
          </div>

          {/* Plain Habit Sheet Rows - Easy to see every routine at once, NO flickering */}
          <div className="space-y-2.5 mt-3">
            {habits.map((habit) => {
              const isEditing = editingHabitId === habit.id;
              const hasPerfect7 = last7Days.every((d) => habit.completedDates.includes(d.dateStr));

              // Calculate habit streak across the current 7-day window
              let habitStreak = 0;
              for (let i = last7Days.length - 1; i >= 0; i--) {
                const dStr = last7Days[i].dateStr;
                if (habit.completedDates.includes(dStr)) {
                  habitStreak++;
                } else if (dStr !== todayStr) {
                  break;
                }
              }

              // Daily numeric goal calculations
              const targetGoal = habit.targetValue || (habit.habitName.toLowerCase().includes('reading') ? 30 : habit.habitName.toLowerCase().includes('study') ? 60 : 30);
              const targetUnit = habit.targetUnit || 'mins';
              const progressMap = habit.dailyProgress || {};
              const isTodayCompleted = habit.completedDates.includes(todayStr);

              const todayLogged = typeof progressMap[todayStr] === 'number'
                ? progressMap[todayStr]
                : (isTodayCompleted ? targetGoal : 0);

              const progressPercent = Math.min(100, Math.round((todayLogged / targetGoal) * 100));
              const isGoalReached = todayLogged >= targetGoal || isTodayCompleted;

              return (
                <div
                  key={habit.id}
                  className={`grid grid-cols-[minmax(150px,1.2fr)_minmax(230px,1.6fr)_repeat(7,minmax(44px,1fr))] gap-2.5 items-center p-3 rounded-2xl transition-colors group border ${
                    hasPerfect7
                      ? 'bg-white/[0.05] border-white/20'
                      : 'bg-white/[0.02] hover:bg-white/[0.04] border-transparent hover:border-white/10'
                  }`}
                >
                  {/* Habit Name Column */}
                  <div className="flex items-center justify-between pr-2 pl-2 min-w-0">
                    {isEditing ? (
                      <div ref={inlineEditRef} className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          value={editingHabitName}
                          onChange={(e) => setEditingHabitName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditHabit(habit.id);
                            if (e.key === 'Escape') setEditingHabitId(null);
                          }}
                          onBlur={() => handleSaveEditHabit(habit.id)}
                          autoFocus
                          className="w-full px-2.5 py-1 rounded-xl bg-white/[0.08] border border-white/20 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                        />
                        <button
                          onClick={() => handleSaveEditHabit(habit.id)}
                          className="liquid-glass-icon-btn p-1.5 rounded-xl text-white cursor-pointer hover:bg-white/20"
                          title="Save"
                        >
                          <ClassyIcon type="pulse">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </ClassyIcon>
                        </button>
                        <button
                          onClick={() => setEditingHabitId(null)}
                          className="liquid-glass-icon-btn p-1.5 rounded-xl text-white/50 hover:text-white cursor-pointer"
                          title="Cancel"
                        >
                          <ClassyIcon type="spin-subtle">
                            <X className="w-3.5 h-3.5" />
                          </ClassyIcon>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="text-xs sm:text-sm font-semibold text-white truncate max-w-[110px] cursor-pointer hover:text-white/80 transition-colors"
                            onClick={() => {
                              setEditingHabitId(habit.id);
                              setEditingHabitName(habit.habitName);
                            }}
                            title="Click to rename"
                          >
                            {habit.habitName}
                          </span>
                          {(habitStreak > 0 || hasPerfect7) && (
                            <span
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-white border border-white/20 flex items-center gap-1 shrink-0"
                              title={`${hasPerfect7 ? '7/7 Perfect Streak' : `${habitStreak}-day streak`}`}
                            >
                              <ClassyIcon type="pulse">
                                <Flame className="w-2.5 h-2.5 text-white fill-white" />
                              </ClassyIcon>
                              <span>{hasPerfect7 ? '7/7' : `${habitStreak}d`}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => {
                              setEditingHabitId(habit.id);
                              setEditingHabitName(habit.habitName);
                            }}
                            className="liquid-glass-icon-btn p-1.5 rounded-xl text-white/50 hover:text-white cursor-pointer"
                            title="Edit habit name"
                          >
                            <ClassyIcon type="spin-subtle">
                              <Edit2 className="w-3 h-3" />
                            </ClassyIcon>
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(habit.id, habit.habitName)}
                            className="liquid-glass-icon-btn p-1.5 rounded-xl text-white/50 hover:text-white cursor-pointer"
                            title="Delete habit"
                          >
                            <ClassyIcon type="spin-subtle">
                              <Trash2 className="w-3 h-3" />
                            </ClassyIcon>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Daily Goal & Progress Bar Column */}
                  <div className="px-2 flex flex-col justify-center">
                    {/* Top Row: Goal Badge + Progress Numbers */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <button
                        onClick={() => {
                          setGoalModalHabit(habit);
                          setGoalTargetInput(targetGoal);
                          setGoalUnitInput(targetUnit);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-white/[0.06] hover:bg-white/15 border border-white/15 hover:border-white/30 text-[11px] font-medium text-white/90 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                        title="Click to edit daily numeric goal"
                      >
                        <ClassyIcon type="float">
                          <Target className="w-3 h-3 text-white" />
                        </ClassyIcon>
                        <span>{targetGoal} {targetUnit}/d</span>
                        <ClassyIcon type="twinkle">
                          <Edit3 className="w-2.5 h-2.5 text-white/50" />
                        </ClassyIcon>
                      </button>

                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="font-bold text-white">
                          {todayLogged}
                        </span>
                        <span className="text-white/60 text-[11px]">/ {targetGoal} {targetUnit}</span>
                        {isGoalReached ? (
                          <motion.span
                            initial={{ scale: 0.85 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            className="text-[10px] text-white bg-emerald-500 font-bold px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.45)] flex items-center gap-0.5"
                          >
                            <ClassyIcon type="pulse">
                              <Check className="w-2.5 h-2.5 stroke-[3] text-white" />
                            </ClassyIcon>
                            100%
                          </motion.span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {progressPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Progress Bar (Green Glow When 100% Goal Met, Plain Liquid Glass White Otherwise) */}
                    <div
                      onClick={() => {
                        setLogModalHabit(habit);
                        setLogValueInput(todayLogged);
                      }}
                      className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden backdrop-blur-sm border border-white/15 relative cursor-pointer group/bar"
                      title="Click to log exact numeric progress"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ease-out ${
                          isGoalReached
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                            : 'bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.45)]'
                        }`}
                        style={{ width: `${Math.max(todayLogged > 0 ? 4 : 0, progressPercent)}%` }}
                      />
                    </div>

                    {/* Bottom Row: Quick Increment Controls (+5, +15, Log) */}
                    <div className="flex items-center justify-between gap-1.5 mt-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickIncrement(habit.id, targetUnit === 'mins' ? -5 : -1)}
                          disabled={todayLogged <= 0}
                          className="px-1.5 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.1] text-[10px] font-mono text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Decrease"
                        >
                          {targetUnit === 'mins' ? '-5m' : '-1'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickIncrement(habit.id, targetUnit === 'mins' ? 5 : 1)}
                          className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/20 border border-white/10 hover:border-white/30 text-[10px] font-mono text-white/90 hover:text-white transition-colors cursor-pointer font-semibold"
                          title="Add 5"
                        >
                          {targetUnit === 'mins' ? '+5m' : '+1'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickIncrement(habit.id, targetUnit === 'mins' ? 15 : 5)}
                          className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/20 border border-white/10 hover:border-white/30 text-[10px] font-mono text-white/90 hover:text-white transition-colors cursor-pointer font-semibold"
                          title="Add 15"
                        >
                          {targetUnit === 'mins' ? '+15m' : '+5'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setLogModalHabit(habit);
                          setLogValueInput(todayLogged);
                        }}
                        className="text-[10px] font-mono text-white/50 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        Log custom
                      </button>
                    </div>
                  </div>

                  {/* 7 Day Matrix Cells (Sun - Sat) - Green Animation Only On Task Completion */}
                  {last7Days.map((day) => {
                    const isCompleted = habit.completedDates.includes(day.dateStr);

                    return (
                      <div key={day.dateStr} className="flex items-center justify-center">
                        <motion.button
                          type="button"
                          onClick={() => handleToggleCell(habit.id, day.dateStr)}
                          whileTap={{ scale: 0.92 }}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 relative overflow-visible ${
                            isCompleted
                              ? 'liquid-glass-cell-completed-green'
                              : day.isToday
                                ? 'liquid-glass-today-cell-uncompleted text-emerald-300 hover:text-white'
                                : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/25 text-white/40 hover:text-white'
                          }`}
                          title={`${habit.habitName} on ${day.fullFormatted}: ${isCompleted ? 'Completed (Tap to undo)' : 'Click to complete'}`}
                        >
                          <AnimatePresence mode="wait">
                            {isCompleted ? (
                              <motion.div
                                key="completed"
                                initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                                className="flex items-center justify-center relative"
                              >
                                {/* Gentle expanding green ripple aura on task completion */}
                                <motion.span
                                  initial={{ scale: 0.7, opacity: 0.75 }}
                                  animate={{ scale: 1.5, opacity: 0 }}
                                  transition={{ duration: 0.55, ease: 'easeOut' }}
                                  className="absolute inset-0 -m-1 rounded-2xl bg-emerald-400/50 pointer-events-none"
                                />
                                <Check className="w-4 h-4 stroke-[3] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] relative z-10" />
                              </motion.div>
                            ) : day.isToday ? (
                              <motion.span
                                key="today-indicator"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-2.5 h-2.5 rounded-full border border-emerald-400/70 bg-emerald-400/25 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                              />
                            ) : (
                              <motion.span
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-2 h-2 rounded-full bg-white/25 transition-colors"
                              />
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Status Toast */}
      <AnimatePresence>
        {statusToast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-black/90 border border-white/30 text-white text-xs font-mono shadow-[0_12px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl z-30 flex items-center gap-2 pointer-events-none"
          >
            <ClassyIcon type="pulse">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </ClassyIcon>
            <span>{statusToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Daily Goal Modal - Tap anywhere outside or on screen backdrop to go back */}
      <AnimatePresence>
        {goalModalHabit && (
          <div
            onClick={() => setGoalModalHabit(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm liquid-glass-card rounded-3xl p-6 backdrop-blur-2xl border border-white/15 shadow-[0_32px_64px_rgba(0,0,0,0.8)] relative cursor-default"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
                    <ClassyIcon type="float">
                      <Target className="w-4 h-4" />
                    </ClassyIcon>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Daily Numeric Goal</h3>
                    <p className="text-xs text-slate-400">{goalModalHabit.habitName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setGoalModalHabit(null)}
                  className="liquid-glass-icon-btn p-1.5 rounded-xl text-white/50 hover:text-white cursor-pointer"
                >
                  <ClassyIcon type="spin-subtle">
                    <X className="w-4 h-4" />
                  </ClassyIcon>
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                    Daily Target Value
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={goalTargetInput}
                      onChange={(e) => setGoalTargetInput(parseInt(e.target.value) || 0)}
                      className="w-2/3 px-3.5 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white"
                    />
                    <input
                      type="text"
                      maxLength={15}
                      value={goalUnitInput}
                      onChange={(e) => setGoalUnitInput(e.target.value)}
                      placeholder="mins"
                      className="w-1/3 px-3.5 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 15, unit: 'mins' },
                      { val: 30, unit: 'mins' },
                      { val: 45, unit: 'mins' },
                      { val: 60, unit: 'mins' },
                      { val: 90, unit: 'mins' },
                      { val: 10, unit: 'pages' }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setGoalTargetInput(p.val);
                          setGoalUnitInput(p.unit);
                        }}
                        className={`text-xs py-1.5 px-2 rounded-xl border transition-all cursor-pointer ${
                          goalTargetInput === p.val && goalUnitInput === p.unit
                            ? 'bg-white text-black font-semibold border-white shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                            : 'bg-white/[0.04] border-white/15 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {p.val} {p.unit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setGoalModalHabit(null)}
                    className="liquid-glass-btn px-4 py-2 rounded-xl text-xs font-medium text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGoalSettings}
                    className="liquid-glass-btn-white bg-white text-black font-semibold px-5 py-2 rounded-xl text-xs hover:bg-white/90 shadow-[0_4px_16px_rgba(255,255,255,0.25)] border border-white cursor-pointer"
                  >
                    Save Goal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Log Progress Modal - Tap anywhere outside or on screen backdrop to go back */}
      <AnimatePresence>
        {logModalHabit && (
          <div
            onClick={() => setLogModalHabit(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm liquid-glass-card rounded-3xl p-6 backdrop-blur-2xl border border-white/15 shadow-[0_32px_64px_rgba(0,0,0,0.8)] relative cursor-default"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
                    <ClassyIcon type="float">
                      <Sliders className="w-4 h-4" />
                    </ClassyIcon>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Log Progress</h3>
                    <p className="text-xs text-slate-400">{logModalHabit.habitName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setLogModalHabit(null)}
                  className="liquid-glass-icon-btn p-1.5 rounded-xl text-white/50 hover:text-white cursor-pointer"
                >
                  <ClassyIcon type="spin-subtle">
                    <X className="w-4 h-4" />
                  </ClassyIcon>
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                    <span>Logged:</span>
                    <span className="font-mono text-white/80">Target: {logModalHabit.targetValue || 30} {logModalHabit.targetUnit || 'mins'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={9999}
                      value={logValueInput}
                      onChange={(e) => setLogValueInput(parseInt(e.target.value) || 0)}
                      autoFocus
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.08] border border-white/15 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white"
                    />
                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {logModalHabit.targetUnit || 'mins'}
                    </span>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogValueInput((prev) => Math.max(0, prev + 10))}
                    className="text-xs py-1.5 rounded-xl bg-white/[0.04] border border-white/15 text-white/90 hover:bg-white/10 cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogValueInput((prev) => Math.max(0, prev + 25))}
                    className="text-xs py-1.5 rounded-xl bg-white/[0.04] border border-white/15 text-white/90 hover:bg-white/10 cursor-pointer"
                  >
                    +25
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogValueInput(logModalHabit.targetValue || 30)}
                    className="text-xs py-1.5 rounded-xl bg-white text-black font-semibold border border-white shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:bg-white/90 cursor-pointer"
                  >
                    Full Target
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setLogModalHabit(null)}
                    className="liquid-glass-btn px-4 py-2 rounded-xl text-xs font-medium text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomLog}
                    className="liquid-glass-btn-white bg-white text-black font-semibold px-5 py-2 rounded-xl text-xs hover:bg-white/90 shadow-[0_4px_16px_rgba(255,255,255,0.25)] border border-white cursor-pointer"
                  >
                    Save Log
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Routine Modal - Tap anywhere outside or on screen backdrop to go back */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md liquid-glass-card rounded-3xl p-6 backdrop-blur-2xl border border-white/15 shadow-[0_32px_64px_rgba(0,0,0,0.8)] relative cursor-default"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/10 text-white border border-white/20">
                    <ClassyIcon type="twinkle">
                      <Sparkles className="w-4 h-4" />
                    </ClassyIcon>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Add Routine</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="liquid-glass-icon-btn p-1.5 rounded-xl text-white/50 hover:text-white cursor-pointer"
                >
                  <ClassyIcon type="spin-subtle">
                    <X className="w-4 h-4" />
                  </ClassyIcon>
                </button>
              </div>

              {/* 3 Readymade Templates: Study, Reading, Workout */}
              <div className="mt-4">
                <p className="text-[11px] font-mono uppercase text-slate-400 mb-2">Readymade Templates (3)</p>
                <div className="flex flex-wrap gap-2">
                  {CANONICAL_TEMPLATES.map((template) => {
                    const isAlreadyAdded = habits.some(
                      (h) => h.habitName.toLowerCase() === template.name.toLowerCase()
                    );
                    return (
                      <button
                        key={template.id}
                        type="button"
                        disabled={isAlreadyAdded}
                        onClick={() => handleAddHabit(template.name, template.targetValue, template.targetUnit)}
                        className={`text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                          isAlreadyAdded
                            ? 'opacity-35 line-through bg-white/[0.03] text-slate-500 cursor-not-allowed'
                            : 'liquid-glass-btn hover:bg-white/15 hover:text-white text-slate-200 border-white/15'
                        }`}
                      >
                        + {template.name} ({template.targetValue} {template.targetUnit})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddHabit();
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                    Custom Habit Name
                  </label>
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g., Meditation, Journaling..."
                    maxLength={40}
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white transition-all font-qurova"
                  />
                </div>

                {/* Daily Numeric Goal Settings */}
                <div>
                  <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                    Daily Numeric Goal (e.g. '30 minutes of reading')
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={newHabitGoal}
                      onChange={(e) => setNewHabitGoal(parseInt(e.target.value) || 0)}
                      className="w-2/3 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white"
                    />
                    <input
                      type="text"
                      maxLength={15}
                      value={newHabitUnit}
                      onChange={(e) => setNewHabitUnit(e.target.value)}
                      placeholder="mins"
                      className="w-1/3 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="liquid-glass-btn px-4 py-2 rounded-xl text-xs font-medium text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newHabitName.trim()}
                    className="liquid-glass-btn-white bg-white text-black font-semibold px-5 py-2 rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-white/90 shadow-[0_4px_16px_rgba(255,255,255,0.25)] border border-white"
                  >
                    Add Routine
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
