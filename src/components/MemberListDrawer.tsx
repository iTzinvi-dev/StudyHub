import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Sparkles, BookOpen, Coffee, Flame, Clock, Target } from 'lucide-react';
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
          stroke="rgba(255, 215, 0, 0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Active progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={isGoalMet ? '#4ade80' : '#FFD700'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            filter: isGoalMet
              ? 'drop-shadow(0 0 3px rgba(74, 222, 128, 0.7))'
              : percent > 0
              ? 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.45))'
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
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#080d08] z-10 ${
          isAfk
            ? 'bg-[#f87171] shadow-[0_0_4px_#f87171]'
            : 'bg-[#4ade80] shadow-[0_0_6px_#4ade80]'
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
 * Hover-card component that fetches and displays the user's
 * 'Total Study Hours', current 'Streak', and Daily 4h Goal from Firestore when hovered,
 * using a framer-motion fade-in animation.
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
  const [stats, setStats] = useState<{ streak: number; totalHours: number; todayMinutes: number } | null>(() => {
    if (initialStreak !== undefined && initialTotalHours !== undefined) {
      return { streak: initialStreak, totalHours: initialTotalHours, todayMinutes };
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const handleMouseEnter = async () => {
    setIsHovered(true);
    if (!stats) {
      setLoading(true);
      try {
        const fetched = await fetchUserStats(userId);
        setStats(fetched);
      } catch {
        setStats({ streak: 0, totalHours: 0, todayMinutes: 0 });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const currentTodayMinutes = stats?.todayMinutes !== undefined ? stats.todayMinutes : todayMinutes;
  const goalPercent = Math.min(100, Math.round((currentTodayMinutes / 240) * 100));

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute left-0 bottom-full mb-2 z-50 p-3 rounded-2xl bg-[#080e08]/96 border border-[#FFD700]/40 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl pointer-events-none min-w-[170px]"
          >
            <div className="flex items-center gap-2 border-b border-[#FFFFCC]/10 pb-2 mb-2">
              <AvatarIcon id={avatarId as any} className="w-6 h-6 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#FFFFCC] truncate flex items-center justify-between gap-1">
                  <span className="truncate">{name}</span>
                  {isSelf && <span className="text-[9px] text-[#FFD700] font-mono">(You)</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAfk ? 'bg-[#f87171]' : 'bg-[#4ade80] shadow-[0_0_6px_#4ade80]'}`} />
                  <span className={`text-[9px] font-mono ${isAfk ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                    {isAfk ? '[AFK / Away]' : '[Studying]'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="flex items-center justify-between text-amber-400">
                <span className="flex items-center gap-1.5 text-[#E6E6B8]/75">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Streak:
                </span>
                <span className="font-bold text-amber-400">
                  {loading ? '...' : `${stats?.streak ?? 0} days`}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#FFD700]">
                <span className="flex items-center gap-1.5 text-[#E6E6B8]/75">
                  <Clock className="w-3.5 h-3.5 text-[#FFD700]" />
                  Total Study Hours:
                </span>
                <span className="font-bold text-[#FFD700]">
                  {loading ? '...' : `${stats?.totalHours ?? 0} hrs`}
                </span>
              </div>

              {/* Daily 4-Hour Goal Progress with radial info */}
              <div className="pt-1.5 border-t border-[#FFFFCC]/10">
                <div className="flex items-center justify-between text-[9px] text-[#E6E6B8]/70 mb-1">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-[#FFD700]" />
                    Daily 4h Goal:
                  </span>
                  <span className={goalPercent >= 100 ? 'text-[#4ade80] font-bold' : 'text-[#FFD700]'}>
                    {goalPercent}% ({Math.round((currentTodayMinutes / 60) * 10) / 10} / 4h)
                  </span>
                </div>
                <div className="w-full h-1 bg-[#1A1A00] rounded-full overflow-hidden border border-[#FFFFCC]/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goalPercent >= 100 ? 'bg-[#4ade80]' : 'bg-[#FFD700]'
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

interface MemberListDrawerProps {
  users: RoomMember[];
  currentRoomName?: string;
  currentUser?: UserProfile;
  isCurrentUserAfk?: boolean;
  onUpdateStatus?: (newStatus: string) => void;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export const MemberListDrawer: React.FC<MemberListDrawerProps> = ({
  users,
  currentRoomName = 'Global Lounge',
  currentUser,
  isCurrentUserAfk = false,
  onUpdateStatus,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isDrawerOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggleDrawer = (openState?: boolean) => {
    const nextState = openState !== undefined ? openState : !isDrawerOpen;
    if (controlledOnToggle) {
      controlledOnToggle(nextState);
    } else {
      setInternalIsOpen(nextState);
    }
  };

  // "Click Outside to Close" Logic
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (!isDrawerOpen) return;

      const target = e.target as Node;
      if (drawerRef.current && drawerRef.current.contains(target)) {
        return;
      }
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      toggleDrawer(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        toggleDrawer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  const activeCount = users.filter((u) => !u.isAfk).length + (isCurrentUserAfk ? 0 : 1);
  const afkCount = users.filter((u) => u.isAfk).length + (isCurrentUserAfk ? 1 : 0);
  const totalCount = users.length + (currentUser ? 1 : 0);

  // Sort users list so that those currently in 'Studying' status always appear at the top, followed by 'AFK' members
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // 1. Studying (!isAfk) always appears before AFK (isAfk)
      if (!a.isAfk && b.isAfk) return -1;
      if (a.isAfk && !b.isAfk) return 1;

      // 2. Secondary sort: higher today's focus minutes first for active participants
      const aMinutes = a.focusMinutesToday || 0;
      const bMinutes = b.focusMinutesToday || 0;
      if (bMinutes !== aMinutes) {
        return bMinutes - aMinutes;
      }

      // 3. Fallback: alphabetical by name
      return a.name.localeCompare(b.name);
    });
  }, [users]);

  return (
    <>
      {/* 1. Floating Minimalist Trigger Button (Collapsed State) */}
      <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40">
        <button
          ref={triggerRef}
          onClick={() => toggleDrawer()}
          className={`flex flex-col items-center gap-1.5 py-3 px-2 sm:px-2.5 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.65)] cursor-pointer group ${
            isDrawerOpen
              ? 'bg-[#1a2e1a]/90 border border-[#FFD700] text-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-105'
              : 'bg-[#0a0f0a]/85 border border-[#FFD700]/30 hover:border-[#FFD700]/60 text-[#FFFFCC] hover:bg-[#121c12]/90 hover:scale-105'
          }`}
          title="Room Presence · Member List"
          aria-label="Toggle Room Member List"
          aria-expanded={isDrawerOpen}
        >
          <div className="relative">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] group-hover:scale-110 transition-transform" />
            <span
              className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-[#0a0f0a] ${
                isCurrentUserAfk ? 'bg-[#f87171] shadow-[0_0_4px_#f87171]' : 'bg-[#4ade80] shadow-[0_0_6px_#4ade80]'
              }`}
            />
          </div>

          <span className="text-[11px] font-mono font-semibold text-[#FFFFCC] tabular-nums">
            {totalCount}
          </span>

          <span className="text-[9px] uppercase tracking-tighter text-[#E6E6B8]/70 font-mono scale-90">
            SOULS
          </span>
        </button>
      </div>

      {/* 2. Sliding Drawer Panel (Expanded State) with Framer Motion Spring */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggleDrawer(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
            />

            <motion.aside
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-80 sm:w-96 max-w-[90vw] z-50 bg-[#080d08]/95 backdrop-blur-xl border-l border-[#FFD700]/25 shadow-[-16px_0_40px_rgba(0,0,0,0.7)] flex flex-col text-[#FFFFCC] select-none"
              aria-label="Room Presence Panel"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#FFFFCC]/10 flex items-center justify-between gap-3 bg-[#0c140c]/80">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFD700]">
                    <Users className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Room Presence</span>
                  </div>
                  <h2 className="text-lg font-serif text-[#FFFFCC] mt-0.5 truncate max-w-[210px]">
                    {currentRoomName}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-[#E6E6B8]/70 mt-1 font-mono">
                    <span className="flex items-center gap-1.5 text-[#4ade80]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
                      <span>{activeCount} Studying</span>
                    </span>
                    <span className="text-[#FFFFCC]/20">·</span>
                    <span className="flex items-center gap-1.5 text-[#f87171]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                      <span>{afkCount} Away</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleDrawer(false)}
                  className="p-1.5 rounded-xl text-[#FFFFCC]/60 hover:text-[#FFFFCC] hover:bg-[#141d14] border border-transparent hover:border-[#FFD700]/30 transition-all cursor-pointer"
                  title="Close Drawer"
                  aria-label="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Members List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                {/* Self User Card if logged in */}
                {currentUser && (
                  <div className="p-3 rounded-2xl bg-[#141f14]/80 border border-[#FFD700]/40 shadow-sm relative">
                    <div className="flex items-center gap-3">
                      {/* Avatar with Radial Progress Ring & UserHoverCard */}
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
                          size={46}
                          strokeWidth={2.5}
                          isAfk={isCurrentUserAfk}
                          className="cursor-pointer hover:scale-105 transition-transform"
                        />
                      </UserHoverCard>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-[#FFFFCC] truncate flex items-center gap-1.5">
                            {currentUser.name}
                            <span className="text-[10px] text-[#FFD700] font-mono font-normal">
                              (You)
                            </span>
                          </span>

                          <span
                            className={`text-[10px] font-mono font-medium tracking-tight ${
                              isCurrentUserAfk ? 'text-[#f87171]' : 'text-[#4ade80]'
                            }`}
                          >
                            {isCurrentUserAfk ? '[AFK / Away]' : '[Studying]'}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#E6E6B8]/75 truncate mt-0.5 font-serif italic">
                          "{currentUser.status || 'Deep Focus'}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header for peers */}
                <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-[#E6E6B8]/60 uppercase tracking-widest font-mono">
                  <span>Peer Companions</span>
                  <span>{users.length} Total</span>
                </div>

                {/* Peer Users List */}
                {sortedUsers.length === 0 ? (
                  <div className="p-6 text-center text-[#E6E6B8]/60 font-serif italic text-xs">
                    No other souls in this room yet. Enjoy the undisturbed silence.
                  </div>
                ) : (
                  sortedUsers.map((member) => {
                    const isStudying = !member.isAfk;

                    return (
                      <div
                        key={member.id}
                        className="p-2.5 rounded-2xl bg-[#0e160e]/50 hover:bg-[#121c12]/80 border border-[#FFFFCC]/10 hover:border-[#FFD700]/30 transition-all flex items-center gap-3 group relative"
                      >
                        {/* Avatar with Radial Progress Ring & UserHoverCard */}
                        <UserHoverCard
                          userId={member.id}
                          name={member.name}
                          status={member.status || '[Studying]'}
                          isAfk={member.isAfk}
                          avatarId={member.avatarId}
                          isSelf={member.isSelf}
                          todayMinutes={member.focusMinutesToday}
                        >
                          <AvatarWithGoalRing
                            avatarId={member.avatarId}
                            todayMinutes={member.focusMinutesToday || 0}
                            goalHours={4}
                            size={42}
                            strokeWidth={2.5}
                            isAfk={member.isAfk}
                            className="cursor-pointer hover:scale-105 transition-transform"
                          />
                        </UserHoverCard>

                        {/* Name and Live Status */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-medium text-[#FFFFCC] truncate group-hover:text-[#FFD700] transition-colors">
                              {member.name}
                            </span>

                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                isStudying ? 'text-[#4ade80]' : 'text-[#f87171]'
                              }`}
                            >
                              {isStudying ? '[Studying]' : '[AFK / Away]'}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#E6E6B8]/70 truncate italic mt-0.5">
                            {member.status ? `[${member.status.replace(/[[\]]/g, '')}]` : '[Focusing]'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer: Quick Status Switcher */}
              <div className="p-4 border-t border-[#FFFFCC]/10 bg-[#0c140c]/90">
                <div className="text-[11px] uppercase tracking-wider text-[#FFD700] font-mono mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#FFD700]" />
                  <span>Set Your Focus Intention</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { label: 'Deep Work', icon: BookOpen },
                    { label: 'Writing', icon: Sparkles },
                    { label: 'Coffee Rest', icon: Coffee }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => onUpdateStatus && onUpdateStatus(preset.label)}
                      className="px-2 py-2 rounded-xl bg-[#141f14] hover:bg-[#1f2d1f] border border-[#FFD700]/20 hover:border-[#FFD700]/50 text-[11px] text-[#FFFFCC] flex items-center justify-center gap-1 transition-all"
                    >
                      <preset.icon className="w-3 h-3 text-[#FFD700]" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
