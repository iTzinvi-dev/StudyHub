import React, { useState } from 'react';
import { UserProfile, Room, RoomMember, AudioVolumes, BackgroundSceneId, TabType } from '../types';
import { AvatarIcon } from '../utils/avatars';
import { AudioMixerBar } from '../components/AudioMixerBar';
import { MemberListDrawer } from '../components/MemberListDrawer';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { BorderBeam } from '../components/ui/BorderBeam';
import { AnimatedShinyText } from '../components/ui/AnimatedShinyText';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { NumberTicker } from '../components/ui/NumberTicker';
import {
  Home,
  CalendarCheck,
  Brain,
  Trophy,
  User,
  Plus,
  LogIn,
  Flame,
  Sparkles,
  Check,
  Copy,
  Eye,
  EyeOff,
  BookOpen,
  Clock,
  Compass,
  Layers,
  ChevronRight,
  TrendingUp,
  Sliders,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface LoungeViewProps {
  user: UserProfile;
  isAfk: boolean;
  backgroundScene?: BackgroundSceneId;
  activeRoom: Room;
  members: RoomMember[];
  currentTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
  initialMinutes?: number;
  timerMinutes: number;
  timerSeconds: number;
  isRunning: boolean;
  phaseLabel: string;
  fourHourProgressPercent: number;
  audioVolumes: AudioVolumes;
  onAudioChange: (volumes: AudioVolumes) => void;
  onOpenPlanModal: () => void;
  onEnterZenMode: () => void;
  onToggleTimer?: () => void;
  onResetTimer?: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onUpdateStatus: (newStatus: string) => void;
}

export const LoungeView: React.FC<LoungeViewProps> = ({
  user,
  isAfk,
  backgroundScene = 'study-desk',
  activeRoom,
  members,
  currentTab = 'lounge',
  onSelectTab,
  initialMinutes = 50,
  timerMinutes,
  timerSeconds,
  isRunning,
  phaseLabel,
  fourHourProgressPercent,
  audioVolumes,
  onAudioChange,
  onOpenPlanModal,
  onEnterZenMode,
  onToggleTimer,
  onResetTimer,
  onCreateRoom,
  onJoinRoom,
  onUpdateStatus
}) => {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState(user.status);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSanctuaryView, setIsSanctuaryView] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);

  const loungeNavTabs: { tab: TabType; label: string; icon: React.ReactNode }[] = [
    { tab: 'lounge', label: 'Global Lounge', icon: <Home className="w-3.5 h-3.5" /> },
    { tab: 'tracker', label: 'Routine Tracker', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { tab: 'environment', label: 'Environment', icon: <Sliders className="w-3.5 h-3.5" /> },
    { tab: 'mentor', label: 'AI Mentor', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { tab: 'quizzes', label: 'Test', icon: <Brain className="w-3.5 h-3.5" /> },
    { tab: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
    { tab: 'profile', label: 'Profile Vault', icon: <User className="w-3.5 h-3.5" /> }
  ];

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusInput.trim()) {
      onUpdateStatus(statusInput.trim());
      setIsEditingStatus(false);
    }
  };

  // 4x7 Consistency Grid mockup (28 days)
  const gridCells = [
    [0, 1, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 1, 1]
  ];

  const formattedTime = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`;
  
  // Real mathematically synchronized progress calculation
  const totalSessionSecs = Math.max(60, initialMinutes * 60);
  const currentSecs = timerMinutes * 60 + timerSeconds;
  const hasStartedSession = currentSecs < totalSessionSecs;
  const sessionProgress = Math.max(0, Math.min(1, 1 - currentSecs / totalSessionSecs));

  return (
    <main className="lounge-view-root font-qurov relative flex-1 flex flex-col justify-between p-4 sm:p-7 overflow-hidden select-none bg-transparent">

      {/* Top Header Bar */}
      <header className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight drop-shadow-md font-handwritten-serif">
              {activeRoom.name}
            </h1>
            {activeRoom.isPrivate && (
              <button
                type="button"
                onClick={handleCopyRoomCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.08] border border-white/15 text-xs text-white font-qurov hover:bg-white/[0.14] transition-colors backdrop-blur-md cursor-pointer"
                title="Click to copy room code"
              >
                <span>{activeRoom.code}</span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#0EA5E9]" />}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsMemberListOpen(true)}
            className="text-xs sm:text-sm text-slate-300 hover:text-white mt-0.5 flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation text-left group font-handwritten-serif"
            title="Open Room Presence Member List"
          >
            <Compass className="w-3.5 h-3.5 text-[#0EA5E9] group-hover:rotate-45 transition-transform" />
            <span>{members.length} {members.length === 1 ? 'Soul' : 'Souls'} Focusing Together</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sanctuary / Focus View Toggle */}
          <button
            type="button"
            onClick={() => setIsSanctuaryView((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-qurov font-medium transition-all shadow-md cursor-pointer touch-manipulation ${
              isSanctuaryView
                ? 'liquid-glass-primary text-white border-white/40 shadow-[0_0_18px_rgba(14,165,233,0.5)]'
                : 'liquid-glass-btn text-white/90'
            }`}
            title={isSanctuaryView ? 'Show study cards' : 'View full study table and ambient scene'}
          >
            {isSanctuaryView ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="hidden sm:inline font-handwritten-serif text-sm">Show Cards</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span className="hidden sm:inline font-handwritten-serif text-sm">View Sanctuary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCreateRoom}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl liquid-glass-btn text-white text-xs font-qurov font-medium transition-all shadow-md cursor-pointer touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-handwritten-serif text-sm">Create Room</span>
          </button>

          <button
            type="button"
            onClick={() => setJoinModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl liquid-glass-btn text-white text-xs font-qurov font-medium transition-all shadow-md cursor-pointer touch-manipulation"
          >
            <LogIn className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-handwritten-serif text-sm">Join Room</span>
          </button>
        </div>
      </header>

      {/* Global Lounge Navigation Tabs Bar (Pure Liquid Glass) */}
      {onSelectTab && (
        <nav
          className="relative z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-x-auto max-w-full custom-scrollbar my-2"
          aria-label="Sanctuary Navigation Tabs"
        >
          {loungeNavTabs.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => onSelectTab(item.tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-qurov transition-all duration-200 shrink-0 cursor-pointer touch-manipulation ${
                  isActive
                    ? 'bg-[#0284C7]/80 text-white font-semibold border border-white/30 shadow-[0_0_16px_rgba(14,165,233,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.07] border border-transparent'
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="font-handwritten-serif text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Mobile Quick Souls Counter Bar */}
      <div className="flex lg:hidden items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg my-1 relative z-10">
        <button
          type="button"
          onClick={() => setIsMemberListOpen(true)}
          className="flex items-center gap-2.5 text-left cursor-pointer touch-manipulation w-full"
        >
          <div className="relative">
            <AvatarIcon id={user.avatarId} className="w-8 h-8" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#090D16] ${isAfk ? 'bg-rose-500' : 'bg-emerald-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-handwritten-serif text-white font-semibold">The Souls in Room</span>
              <span className="text-xs text-[#38BDF8] font-qurov font-medium">{members.length} {members.length === 1 ? 'Soul' : 'Souls'} · View All →</span>
            </div>
            <p className="text-xs text-slate-300 truncate font-handwritten-serif italic">
              You: [{user.status || 'Deep Focus'}]
            </p>
          </div>
        </button>
      </div>

      {/* Main Workspace Grid (Left card, Center Master Timer, Right card) */}
      <section className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 my-4">
        {/* Left Card: Your Progress (Pure Liquid Glass) */}
        <SpotlightCard
          className={`lg:col-span-3 flex-col p-6 rounded-3xl bg-white/[0.04] border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.18)] backdrop-blur-2xl transition-all duration-500 relative ${
            isSanctuaryView ? 'opacity-0 pointer-events-none scale-95 hidden' : 'hidden lg:flex'
          }`}
        >
          <BorderBeam size={220} duration={16} delay={0} colorFrom="#0EA5E9" colorTo="transparent" />

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white font-handwritten-serif">Your Progress</h2>
            <TrendingUp className="w-4 h-4 text-[#0EA5E9]" />
          </div>

          <div className="flex items-baseline justify-between mt-4">
            <div>
              <div className="flex items-baseline gap-1 font-qurov">
                <span className="text-3xl font-bold text-white">
                  <NumberTicker value={user.streak} />
                </span>
                <Flame className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B] inline ml-0.5 animate-pulse" />
              </div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-handwritten-serif">Streak</span>
            </div>

            <div>
              <div className="text-3xl font-bold text-white font-qurov">
                <NumberTicker value={user.totalFocusHours} />h
              </div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-handwritten-serif">Total Focus</span>
            </div>
          </div>

          {/* Consistency Grid */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400 font-handwritten-serif mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#0EA5E9]" />
                Consistency Grid
              </span>
              <span className="text-[#0EA5E9] font-qurov text-xs">28 Days</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-white/[0.04] border border-white/10">
              {gridCells.flatMap((row, rIdx) =>
                row.map((val, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    title={val ? '≥ 4h Focus achieved' : 'Light focus period'}
                    className={`w-4 h-4 rounded-xs transition-all ${
                      val
                        ? 'bg-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.6)]'
                        : 'bg-white/[0.06] hover:bg-white/[0.12]'
                    }`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Daily Goal (4h) Progress */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5 font-handwritten-serif text-sm">
                <BookOpen className="w-3.5 h-3.5 text-[#0EA5E9]" />
                Daily Goal (4h)
              </span>
              <span className="text-white font-semibold font-qurov">{fourHourProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                style={{ width: `${Math.min(100, fourHourProgressPercent)}%` }}
              />
            </div>
          </div>
        </SpotlightCard>

        {/* Center: Master Floating Timer Core */}
        <div className={`flex flex-col items-center justify-center transition-all duration-500 ${
          isSanctuaryView ? 'col-span-12 my-auto' : 'col-span-1 lg:col-span-6'
        }`}>
          {/* Concentric Clock Core Container (Strictly square, perfectly centered) */}
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] flex items-center justify-center">
            {/* Ambient Cozy Glow Halo - Soft, Warm Deep Atmospheric Bloom */}
            <div className="absolute inset-4 sm:inset-6 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.12)_0%,rgba(14,165,233,0.03)_50%,transparent_72%)] blur-2xl pointer-events-none -z-10" />

            {/* Subtle Concentric Rings & Hour Markers SVG */}
            <svg
              className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none"
              viewBox="0 0 360 360"
            >
              <defs>
                <linearGradient id="loungeTimerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>

              {/* 12 Celestial Micro-Tick Marks */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 180 + 171 * Math.cos(angle);
                const y1 = 180 + 171 * Math.sin(angle);
                const x2 = 180 + 175 * Math.cos(angle);
                const y2 = 180 + 175 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={i % 3 === 0 ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={i % 3 === 0 ? '1.5' : '1'}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Outer Daily 4h Progress Hairline Track */}
              <circle
                cx="180"
                cy="180"
                r="164"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1.5"
              />
              <circle
                cx="180"
                cy="180"
                r="164"
                fill="none"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 164}
                strokeDashoffset={2 * Math.PI * 164 * (1 - Math.min(1, fourHourProgressPercent / 100))}
                className="transition-all duration-700"
              />

              {/* Inner Active Session Ring - Glowing fine hairline arc */}
              <circle
                cx="180"
                cy="180"
                r="150"
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="2"
              />
              <circle
                cx="180"
                cy="180"
                r="150"
                fill="none"
                stroke="url(#loungeTimerGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 150}
                strokeDashoffset={2 * Math.PI * 150 * (1 - sessionProgress)}
                className="transition-all duration-500 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              />
            </svg>

            {/* Modern Cozy Pure Transparent Liquid Glass Timer Disc */}
            <div
              onClick={onEnterZenMode}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onEnterZenMode();
              }}
              className="group relative z-10 w-[210px] h-[210px] sm:w-[240px] sm:h-[240px] md:w-[270px] md:h-[270px] rounded-full liquid-glass-clock flex flex-col items-center justify-center p-3 sm:p-4 transition-all duration-300 hover:scale-[1.025] active:scale-[0.98] cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
              title={hasStartedSession ? 'Click to Resume in Zen Sanctuary' : 'Click to Start in Zen Sanctuary'}
            >
              {/* Cozy Pill Phase Badge */}
              <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-handwritten-serif tracking-widest text-[#38BDF8] flex items-center gap-1.5 backdrop-blur-md mb-1 sm:mb-2">
                <Clock className="w-3 h-3 text-[#38BDF8]" />
                <span className="truncate max-w-[130px] sm:max-w-[160px] uppercase font-semibold">{phaseLabel}</span>
              </div>

              {/* Central Digits in Qurov Font - Aesthetic, Smooth, Transitive and Simple */}
              <div className="text-5xl sm:text-6xl md:text-7xl font-qurov timer-digits-qurov font-light text-white tracking-[-0.035em] my-1 drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] group-hover:text-[#38BDF8] transition-all duration-300 ease-out leading-none tabular-nums">
                {formattedTime}
              </div>

              {/* Cozy Status Pill */}
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-handwritten-serif backdrop-blur-md mt-1 sm:mt-2">
                {hasStartedSession ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-200 font-medium">Paused • Click to Resume</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                    <span className="text-slate-300">Ready • Starts in Zen</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Uncluttered Cozy Liquid Glass Action Dock */}
          <div className="flex flex-col items-center mt-6 sm:mt-7 z-10 select-none">
            {/* Primary Action Buttons Row */}
            <div className="flex items-center justify-center gap-3 sm:gap-3.5 flex-wrap">
              {/* 1. Enter / Resume Zen Sanctuary (Mandatory for Timer) */}
              <button
                onClick={onEnterZenMode}
                className="liquid-glass-primary flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-2xl text-sm sm:text-base font-handwritten-serif font-semibold text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={hasStartedSession ? 'Resume Focus Session in Zen Sanctuary' : 'Start Focus Session in Zen Sanctuary'}
              >
                {hasStartedSession ? (
                  <>
                    <Play className="w-4 h-4 fill-current text-white" />
                    <span>Resume in Zen Sanctuary</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Start in Zen Sanctuary</span>
                  </>
                )}
              </button>

              {/* 2. Adjust Focus Plan */}
              <button
                onClick={onOpenPlanModal}
                className="liquid-glass-btn flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-qurov font-medium text-slate-200 hover:text-white shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title="Adjust session duration, intervals & phase targets"
              >
                <Sliders className="w-4 h-4 text-[#38BDF8]" />
                <span className="hidden sm:inline font-handwritten-serif text-sm">Adjust Plan</span>
              </button>

              {/* 3. Reset Session Button (if session was started) */}
              {hasStartedSession && onResetTimer && (
                <button
                  onClick={onResetTimer}
                  className="liquid-glass-btn flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-qurov font-medium text-slate-300 hover:text-white shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  title="Reset timer to beginning"
                >
                  <RotateCcw className="w-4 h-4 text-[#38BDF8]" />
                  <span className="hidden sm:inline font-handwritten-serif text-sm">Reset</span>
                </button>
              )}
            </div>

            {/* Calm Daily Target Pill below dock */}
            <div className="mt-3.5 flex items-center gap-2 text-xs font-qurov text-slate-300 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xs">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-slate-400 font-handwritten-serif text-sm">Daily Target (4h):</span>
              <strong className={fourHourProgressPercent >= 100 ? 'text-[#39D353]' : 'text-[#38BDF8]'}>
                {fourHourProgressPercent}%
              </strong>
            </div>
          </div>
        </div>

        {/* Right Card: The Souls Member List (Pure Liquid Glass) */}
        <SpotlightCard
          className={`lg:col-span-3 flex-col p-6 rounded-3xl bg-white/[0.04] border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.18)] backdrop-blur-2xl max-h-[480px] transition-all duration-500 relative ${
            isSanctuaryView ? 'opacity-0 pointer-events-none scale-95 hidden' : 'hidden lg:flex'
          }`}
        >
          <BorderBeam size={220} duration={18} delay={6} colorFrom="#0EA5E9" colorTo="transparent" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => setIsMemberListOpen(true)}
              className="flex items-center gap-2 group cursor-pointer text-left"
              title="Click to view detailed room activity and what peers are doing"
            >
              <h2 className="text-2xl font-semibold text-white font-handwritten-serif group-hover:text-[#38BDF8] transition-colors">
                The Souls
              </h2>
              <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#0EA5E9]/20 text-[#38BDF8] font-qurov border border-[#0EA5E9]/30">
                {members.length} {members.length === 1 ? 'Soul' : 'Souls'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsMemberListOpen(true)}
              className="text-xs text-[#38BDF8] hover:text-white font-qurov cursor-pointer transition-colors"
            >
              View All →
            </button>
          </div>

          {/* Member items list */}
          <div className="space-y-3 mt-4 overflow-y-auto pr-1 custom-scrollbar">
            {/* Current user row (Pure Liquid Glass) */}
            <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center gap-3 backdrop-blur-xl hover:bg-white/[0.09] transition-colors">
              <div className="relative">
                <AvatarIcon id={user.avatarId} className="w-10 h-10" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#090D16] ${
                    isAfk ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-handwritten-serif font-semibold text-white flex items-center gap-1">
                    You <span className="text-xs text-[#0EA5E9] font-normal">(Self)</span>
                  </span>
                  {isAfk ? (
                    <span className="text-[10px] text-rose-400 font-bold uppercase font-qurov">[AFK]</span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-semibold font-qurov">[Studying]</span>
                  )}
                </div>

                {isEditingStatus ? (
                  <form onSubmit={handleSaveStatus} className="mt-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full text-xs font-handwritten-serif px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/20 text-white focus:outline-none"
                      autoFocus
                    />
                    <button type="submit" className="text-xs px-1.5 py-0.5 bg-[#0EA5E9] text-white rounded font-bold font-qurov cursor-pointer">
                      ✓
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className="text-xs text-slate-300 truncate block hover:text-[#38BDF8] text-left transition-colors font-handwritten-serif cursor-pointer touch-manipulation"
                    title="Click to edit status"
                  >
                    [{user.status || 'Deep Focus'}]
                  </button>
                )}
              </div>
            </div>

            {/* Other peers (exclude self from peer list) */}
            {members.filter((m) => m.id !== user.id && !m.isSelf).length === 0 ? (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400 font-qurov backdrop-blur-md">
                No peers in room yet. Tap header to explore details.
              </div>
            ) : (
              members.filter((m) => m.id !== user.id && !m.isSelf).map((member) => (
                <div
                  key={member.id}
                  onClick={() => setIsMemberListOpen(true)}
                  className="p-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/25 flex items-center gap-3 transition-colors cursor-pointer touch-manipulation group backdrop-blur-md"
                  title="Click to view details of what this member is doing"
                >
                  <div className="relative">
                    <AvatarIcon id={member.avatarId} className="w-9 h-9" />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#090D16] ${
                        member.isAfk ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-handwritten-serif font-medium text-white group-hover:text-[#38BDF8] transition-colors truncate">
                        {member.name}
                      </span>
                      {member.isAfk ? (
                        <span className="text-[10px] text-rose-400 font-semibold font-qurov">[AFK]</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-qurov">[Studying]</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate italic font-handwritten-serif">
                      [{member.status ? member.status.replace(/[[\]]/g, '') : 'Studying'}]
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => setIsMemberListOpen(true)}
              className="text-xs text-slate-400 hover:text-white italic font-handwritten-serif cursor-pointer transition-colors"
            >
              Tap to see what everyone is studying →
            </button>
          </div>
        </SpotlightCard>
      </section>

      {/* Bottom Floating Local Audio Mixer Bar */}
      <footer className="relative z-20 flex justify-center pb-1">
        <AudioMixerBar volumes={audioVolumes} onChange={onAudioChange} />
      </footer>

      {/* Join Room Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0B0F19]/95 border border-white/15 shadow-2xl text-white backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white font-handwritten-serif">Join a Private Sanctum</h3>
            <p className="text-xs text-slate-300 mt-1 font-handwritten-serif">
              Enter your peer's room invite code (e.g. FOCUS-9X2) to study together.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (joinCodeInput.trim()) {
                  onJoinRoom(joinCodeInput.trim().toUpperCase());
                  setJoinModalOpen(false);
                }
              }}
              className="mt-5 space-y-4"
            >
              <input
                type="text"
                required
                placeholder="FOCUS-9X2"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-center font-qurov text-base tracking-widest text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
              />

              <div className="flex gap-2 font-qurov">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-white/15 text-xs font-medium text-slate-300 hover:bg-white/[0.08] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:brightness-110 text-white font-semibold text-xs transition-all shadow-lg cursor-pointer"
                >
                  Enter Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Room Presence Sliding Drawer */}
      <MemberListDrawer
        members={members}
        currentRoomName={activeRoom.name}
        currentUser={user}
        isCurrentUserAfk={isAfk}
        onUpdateStatus={onUpdateStatus}
        isOpen={isMemberListOpen}
        onOpen={() => setIsMemberListOpen(true)}
        onClose={() => setIsMemberListOpen(false)}
        onToggle={(val) => setIsMemberListOpen(val)}
      />
    </main>
  );
};
