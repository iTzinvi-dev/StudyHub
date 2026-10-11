import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Sparkles, BookOpen, Coffee, Flame, Clock, Target, Code, Check, Edit3, Compass } from 'lucide-react';
import { RoomMember, UserProfile, AvatarId } from '../types';
import { AvatarIcon } from '../utils/avatars';
import { fetchUserStats } from '../lib/firebase';

interface AvatarWithGoalRingProps {
  avatarId: AvatarId;
  todayMinutes?: number;
  goalHours?: number; // Daily goal, defaults to 4 hours
  size?: number; // Outer diameter
  strokeWidth?: number;
  isAfk?: boolean;
  className?: string;
}

/**
 * Radial Progress Ring inside the User Avatar component
 * visually representing the user's progress towards their daily 4-hour focus goal.
 */
export const AvatarWithGoalRing: React.FC<AvatarWithGoalRingProps> = ({
  avatarId,
  todayMinutes = 0,
  goalHours = 4,
  size = 44,
  strokeWidth = 2.5,
  isAfk = false,
  className = ''
}) => {
  const goalMinutes = goalHours * 60; // 240 minutes = 4 hours
  const percent = Math.min(100, Math.max(0, Math.round((todayMinutes / goalMinutes) * 100)));

  const center = size / 2;
  const radius = center - strokeWidth - 1;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const isGoalMet = percent >= 100;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`Daily 4h Goal: ${percent}% (${Math.round((todayMinutes / 60) * 10) / 10} / ${goalHours} hrs)`}
    >
      {/* SVG Radial Progress Ring */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90 pointer-events-none"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={strokeWidth}
        />
        {/* Active progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={isGoalMet ? '#10B981' : '#0EA5E9'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: isGoalMet
              ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.7))'
              : percent > 0
              ? 'drop-shadow(0 0 4px rgba(14, 165, 233, 0.6))'
              : 'none'
          }}
        />
      </svg>

      {/* Inset User Avatar */}
      <div
        className="rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: size - strokeWidth * 2 - 4,
          height: size - strokeWidth * 2 - 4
        }}
      >
        <AvatarIcon id={avatarId} className="w-full h-full object-cover" />
      </div>

      {/* Live Status Indicator Dot */}
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#090D16] z-10 ${
          isAfk
            ? 'bg-rose-500 shadow-[0_0_4px_#f43f5e]'
            : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
        }`}
      />
    </div>
  );
};

interface UserHoverCardProps {
  userId: string;
  name: string;
  status: string;
  isAfk: boolean;
  avatarId: string;
  isSelf?: boolean;
  initialStreak?: number;
  initialTotalHours?: number;
  todayMinutes?: number;
  children: React.ReactNode;
}

/**
 * Tap & Hover card component that displays the user's
 * 'Total Study Hours', current 'Streak', and Daily 4h Goal from Firestore.
 * Works seamlessly on touch / tap as well as mouse hover.
 */
export const UserHoverCard: React.FC<UserHoverCardProps> = ({
  userId,
  name,
  status,
  isAfk,
  avatarId,
  isSelf = false,
  initialStreak,
  initialTotalHours,
  todayMinutes = 0,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const isVisible = isHovered || isTapped;

  const [stats, setStats] = useState<{ streak: number; totalHours: number; todayMinutes: number } | null>(() => {
    if (initialStreak !== undefined && initialTotalHours !== undefined) {
      return { streak: initialStreak, totalHours: initialTotalHours, todayMinutes };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (isVisible && !stats && !fetchedRef.current && userId) {
      fetchedRef.current = true;
      setLoading(true);
      fetchUserStats(userId)
        .then((data) => {
          setStats(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isVisible, stats, userId]);

  const currentTodayMinutes = stats?.todayMinutes ?? todayMinutes;
  const goalPercent = Math.min(100, Math.round((currentTodayMinutes / 240) * 100));

  return (
    <div
      className="relative inline-block touch-manipulation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsTapped((prev) => !prev);
      }}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute left-0 bottom-full mb-2 z-50 p-3.5 rounded-2xl bg-[#121828]/95 border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-xl min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5 mb-2.5">
              <AvatarIcon id={avatarId as any} className="w-7 h-7 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate flex items-center justify-between gap-1 font-qurov">
                  <span className="truncate">{name}</span>
                  {isSelf && <span className="text-[10px] text-[#0EA5E9] font-qurov font-medium">(You)</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAfk ? 'bg-rose-400' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'}`} />
                  <span className={`text-[10px] font-qurov ${isAfk ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isAfk ? '[AFK / Away]' : '[Studying]'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-2 text-[11px] text-slate-200 italic font-handwritten-serif bg-white/[0.04] p-1.5 rounded-lg border border-white/5">
              "{status || 'Deep Focus'}"
            </div>

            <div className="space-y-1.5 text-[11px] font-qurov">
              <div className="flex items-center justify-between text-[#F59E0B]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                  Streak:
                </span>
                <span className="font-bold text-[#F59E0B]">
                  {loading ? '...' : `${stats?.streak ?? initialStreak ?? 0} days`}
                </span>
              </div>
              <div className="flex items-center justify-between text-white">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  Total Study Hours:
                </span>
                <span className="font-bold text-white">
                  {loading ? '...' : `${stats?.totalHours ?? initialTotalHours ?? 0} hrs`}
                </span>
              </div>

              {/* Daily 4-Hour Goal Progress with radial info */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    Daily 4h Goal:
                  </span>
                  <span className={goalPercent >= 100 ? 'text-emerald-400 font-bold' : 'text-[#0EA5E9]'}>
                    {goalPercent}% ({Math.round((currentTodayMinutes / 60) * 10) / 10} / 4h)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goalPercent >= 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9]'
                    }`}
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface MemberListDrawerProps {
  members: RoomMember[];
  currentUser?: UserProfile;
  currentRoomName?: string;
  isCurrentUserAfk?: boolean;
  onUpdateStatus?: (newStatus: string) => void;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onToggle?: (open: boolean) => void;
}

export const MemberListDrawer: React.FC<MemberListDrawerProps> = ({
  members,
  currentUser,
  currentRoomName = 'Global Lounge',
  isCurrentUserAfk = false,
  onUpdateStatus,
  isOpen,
  onOpen,
  onClose,
  onToggle
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDrawerOpen = isOpen !== undefined ? isOpen : internalOpen;

  const toggleDrawer = (openState?: boolean) => {
    const next = openState !== undefined ? openState : !isDrawerOpen;
    if (next) {
      onOpen?.();
      onToggle?.(true);
    } else {
      onClose?.();
      onToggle?.(false);
    }
    setInternalOpen(next);
  };

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Status input state
  const [customStatusInput, setCustomStatusInput] = useState('');
  const [isEditingCustomStatus, setIsEditingCustomStatus] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        toggleDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        isDrawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        toggleDrawer(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [isDrawerOpen]);

  // Ensure current user is accounted for in room presence
  const currentUid = currentUser?.id;
  const peerMembers = useMemo(() => {
    return members.filter((m) => m.id !== currentUid && !m.isSelf);
  }, [members, currentUid]);

  const activePeers = useMemo(() => peerMembers.filter((m) => !m.isAfk), [peerMembers]);
  const afkPeers = useMemo(() => peerMembers.filter((m) => m.isAfk), [peerMembers]);
  const sortedPeers = useMemo(() => [...activePeers, ...afkPeers], [activePeers, afkPeers]);

  // Total people in the room = peers + 1 (the user themselves)
  const totalInRoom = 1 + peerMembers.length;
  const activeInRoom = (isCurrentUserAfk ? 0 : 1) + activePeers.length;
  const afkInRoom = (isCurrentUserAfk ? 1 : 0) + afkPeers.length;

  const handleApplyStatus = (statusText: string) => {
    if (statusText.trim() && onUpdateStatus) {
      onUpdateStatus(statusText.trim());
      setIsEditingCustomStatus(false);
      setCustomStatusInput('');
    }
  };

  return (
    <>
      {/* 1. Floating Pill Toggle Trigger on the Right Side of the screen (Pure Transparent Liquid Glass) */}
      <div className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
        <button
          ref={triggerRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleDrawer();
          }}
          className={`relative flex flex-col items-center gap-1.5 py-3 sm:py-3.5 px-2.5 sm:px-3 rounded-2xl backdrop-blur-2xl transition-all duration-300 cursor-pointer group select-none touch-manipulation overflow-hidden ${
            isDrawerOpen
              ? 'bg-[#0284C7]/80 border-2 border-white text-white shadow-[0_0_24px_rgba(14,165,233,0.7),inset_0_1.5px_2px_rgba(255,255,255,0.6)] scale-105 ring-2 ring-white/50'
              : 'bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 hover:border-white/40 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95'
          }`}
          title="Room Presence & Activity Tracker · Tap to view who is in the room and what they are studying"
          aria-label="Toggle Room Member List"
          aria-expanded={isDrawerOpen}
        >
          {/* Top specular highlight shimmer */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          <div className="relative">
            <Users className="w-5 h-5 sm:w-5 sm:h-5 text-[#38BDF8] group-hover:scale-110 transition-transform" />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#090D16] ${
                isCurrentUserAfk ? 'bg-rose-400 shadow-[0_0_6px_#f43f5e]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
              }`}
            />
          </div>

          <span className="text-xs font-qurov font-bold text-white tabular-nums tracking-tight">
            {totalInRoom}
          </span>

          <span className="text-[9px] uppercase tracking-wider text-slate-300 font-qurov scale-95 group-hover:text-white transition-colors">
            SOULS
          </span>
        </button>
      </div>

      {/* 2. Sliding Drawer Panel (Expanded State) with Framer Motion Spring */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop for mobile & desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggleDrawer(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[65] cursor-pointer"
            />

            <motion.aside
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="lounge-view-root font-qurov fixed top-0 right-0 h-full w-84 sm:w-96 max-w-[92vw] z-[70] bg-[#090D16]/65 sm:bg-[#0B101D]/55 backdrop-blur-3xl border-l border-white/20 shadow-[-24px_0_60px_rgba(0,0,0,0.85),inset_1px_0_2px_rgba(255,255,255,0.2)] flex flex-col text-white select-none overflow-hidden"
              aria-label="Room Presence Panel"
            >
              {/* Top ambient liquid glass reflection gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-white/[0.02] pointer-events-none" />

              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-white/[0.04] backdrop-blur-xl relative z-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38BDF8] font-handwritten-serif">
                    <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Room Presence & Activity</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mt-0.5 truncate font-handwritten-serif">
                    {currentRoomName}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 font-qurov">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                      <span>{activeInRoom} Studying</span>
                    </span>
                    <span className="text-white/25">·</span>
                    <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>{afkInRoom} Away</span>
                    </span>
                    <span className="text-white/25">·</span>
                    <span className="text-slate-300 font-medium">
                      {totalInRoom} Total
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleDrawer(false)}
                  className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/15 transition-all cursor-pointer touch-manipulation active:scale-90"
                  title="Close Drawer"
                  aria-label="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Members List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative z-10">
                {/* 1. Self User Card (Pure Liquid Glass) */}
                {currentUser && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] border border-[#0EA5E9]/40 backdrop-blur-xl shadow-[0_4px_24px_rgba(14,165,233,0.15),inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all relative">
                    <div className="flex items-center gap-3">
                      <UserHoverCard
                        userId={currentUser.id}
                        name={currentUser.name}
                        status={currentUser.status || 'Deep Focus'}
                        isAfk={isCurrentUserAfk}
                        avatarId={currentUser.avatarId}
                        isSelf={true}
                        initialStreak={currentUser.streak}
                        initialTotalHours={currentUser.totalFocusHours}
                        todayMinutes={currentUser.todayMinutes}
                      >
                        <AvatarWithGoalRing
                          avatarId={currentUser.avatarId}
                          todayMinutes={currentUser.todayMinutes}
                          goalHours={currentUser.dailyGoalHours || 4}
                          size={48}
                          strokeWidth={2.5}
                          isAfk={isCurrentUserAfk}
                          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                        />
                      </UserHoverCard>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm font-semibold text-white truncate flex items-center gap-1.5 font-qurov">
                            {currentUser.name}
                            <span className="text-[10px] text-[#38BDF8] font-bold px-1.5 py-0.2 rounded bg-[#0EA5E9]/20 border border-[#0EA5E9]/30">
                              YOU
                            </span>
                          </span>

                          <span
                            className={`text-[10px] font-qurov font-semibold px-2 py-0.5 rounded-full ${
                              isCurrentUserAfk
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isCurrentUserAfk ? '[AFK / Away]' : '[Studying]'}
                          </span>
                        </div>

                        {/* Current Status / Activity Display */}
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <p className="text-xs text-slate-200 truncate italic font-handwritten-serif flex items-center gap-1">
                            <span className="text-slate-400 not-italic font-qurov text-[10px]">Doing:</span>
                            "{currentUser.status || 'Deep Focus'}"
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsEditingCustomStatus((prev) => !prev)}
                            className="p-1 rounded-md text-slate-400 hover:text-[#38BDF8] hover:bg-white/10 transition-colors cursor-pointer"
                            title="Edit what you are doing"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Stats Micro Row */}
                        <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-slate-400 font-qurov">
                          <span className="flex items-center gap-1 text-[#F59E0B]">
                            <Flame className="w-3 h-3 fill-current" />
                            {currentUser.streak || 0}d streak
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#38BDF8]">
                            <Clock className="w-3 h-3" />
                            {currentUser.totalFocusHours || 0}h total
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Inline Status Editor if toggled */}
                    {isEditingCustomStatus && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleApplyStatus(customStatusInput);
                        }}
                        className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5"
                      >
                        <input
                          type="text"
                          placeholder="e.g. Calculus Problem Set 3"
                          value={customStatusInput}
                          onChange={(e) => setCustomStatusInput(e.target.value)}
                          className="flex-1 text-xs font-handwritten-serif px-2.5 py-1.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1.5 bg-[#0284C7] hover:bg-[#0EA5E9] text-white text-xs rounded-xl font-qurov font-semibold cursor-pointer shadow-sm"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingCustomStatus(false)}
                          className="px-2 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl cursor-pointer"
                        >
                          ✕
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Header for peers */}
                <div className="pt-2 px-1 flex items-center justify-between text-xs text-slate-300 uppercase tracking-widest font-qurov">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Peer Companions ({sortedPeers.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 lowercase">tap card for details</span>
                </div>

                {/* Peer Users List */}
                {sortedPeers.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 backdrop-blur-xl">
                    <Compass className="w-8 h-8 text-[#38BDF8]/60 mx-auto animate-pulse" />
                    <p className="text-sm text-slate-200 font-handwritten-serif">
                      You are currently the first soul in this room.
                    </p>
                    <p className="text-xs text-slate-400 font-qurov">
                      Invite a friend by sharing this room or study quietly in uninterrupted peace.
                    </p>
                  </div>
                ) : (
                  sortedPeers.map((member) => {
                    const isStudying = !member.isAfk;
                    const isCardSelected = selectedMemberId === member.id;

                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMemberId((prev) => (prev === member.id ? null : member.id))}
                        className={`p-3 rounded-2xl border backdrop-blur-xl transition-all cursor-pointer touch-manipulation select-none relative ${
                          isCardSelected
                            ? 'bg-white/[0.10] border-[#38BDF8]/50 shadow-[0_4px_24px_rgba(14,165,233,0.25),inset_0_1px_2px_rgba(255,255,255,0.25)]'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar with Radial Progress Ring */}
                          <AvatarWithGoalRing
                            avatarId={member.avatarId}
                            todayMinutes={member.focusMinutesToday || 0}
                            goalHours={4}
                            size={44}
                            strokeWidth={2.5}
                            isAfk={member.isAfk}
                            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
                          />

                          {/* Member info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-qurov font-semibold text-white truncate">
                                {member.name}
                              </span>

                              <span
                                className={`text-[10px] font-qurov font-medium shrink-0 px-1.5 py-0.2 rounded-full ${
                                  isStudying
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {isStudying ? '[Studying]' : '[AFK / Away]'}
                              </span>
                            </div>

                            {/* What they are doing right now */}
                            <p className="text-xs text-slate-200 truncate italic font-handwritten-serif mt-0.5">
                              <span className="text-slate-400 not-italic font-qurov text-[10px]">Doing: </span>
                              "{member.status ? member.status.replace(/[[\]]/g, '') : 'Focusing'}"
                            </p>

                            {/* Focus Stats overview */}
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-qurov">
                              <span className="text-[#38BDF8]">
                                {Math.round(((member.focusMinutesToday || 0) / 60) * 10) / 10}h today
                              </span>
                              {member.streak !== undefined && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#F59E0B] flex items-center gap-0.5">
                                    <Flame className="w-2.5 h-2.5 fill-current" />
                                    {member.streak}d streak
                                  </span>
                                </>
                              )}
                              {member.totalHours !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>{member.totalHours}h all-time</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded details when tapped */}
                        {isCardSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2.5 pt-2 border-t border-white/10 text-xs text-slate-300 space-y-1.5 font-qurov"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Current Task:</span>
                              <span className="text-white font-medium font-handwritten-serif text-sm">
                                {member.currentTask || member.status || 'Deep Study Session'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Daily 4-Hour Target:</span>
                              <span className="text-[#38BDF8] font-bold">
                                {Math.min(100, Math.round(((member.focusMinutesToday || 0) / 240) * 100))}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] rounded-full"
                                style={{
                                  width: `${Math.min(100, Math.round(((member.focusMinutesToday || 0) / 240) * 100))}%`
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer: Quick Study Intention Switcher (Pure Liquid Glass) */}
              <div className="p-4 border-t border-white/10 bg-white/[0.04] backdrop-blur-xl shrink-0 relative z-10">
                <div className="text-xs uppercase tracking-wider text-[#38BDF8] font-qurov font-semibold mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Set What You Are Doing</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingCustomStatus(true)}
                    className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Custom Task
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs font-qurov">
                  {[
                    { label: 'Deep Work', icon: BookOpen },
                    { label: 'Solving Math', icon: Target },
                    { label: 'Writing', icon: Sparkles },
                    { label: 'Reading', icon: BookOpen },
                    { label: 'Code Craft', icon: Code },
                    { label: 'Coffee Rest', icon: Coffee }
                  ].map((preset) => {
                    const isSelected = currentUser?.status === preset.label;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyStatus(preset.label)}
                        className={`px-2 py-2 rounded-xl border text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                          isSelected
                            ? 'bg-[#0284C7] border-white text-white font-bold shadow-[0_0_12px_rgba(14,165,233,0.5)]'
                            : 'bg-white/[0.04] hover:bg-white/[0.10] border-white/10 hover:border-white/25 text-slate-200 hover:text-white backdrop-blur-md'
                        }`}
                      >
                        <preset.icon className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-[#38BDF8]'}`} />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
