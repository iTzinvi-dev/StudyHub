import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { UserProfile, AvatarId, ThemeMode, BackgroundSceneId } from '../types';
import { AVATAR_LIST, AvatarIcon } from '../utils/avatars';
import { WeeklyFocusHeatmap } from '../components/WeeklyFocusHeatmap';
import { ActivityHeatmap30d } from '../components/ActivityHeatmap30d';
import { useFirebase } from '../hooks/useFirebase';
import { FocusSessionRecord } from '../lib/firebase';
import {
  Edit2,
  Share2,
  Layers,
  Moon,
  Sun,
  Laptop,
  Check,
  ChevronDown,
  Palette,
  Clock,
  Zap,
  BookOpen,
  Flame,
  CloudRain,
  LogIn,
  Sparkles,
  Shield,
  Target
} from 'lucide-react';

/**
 * Smooth Framer Motion Count-Up Component for totalFocusHours.
 * Smoothly interpolates from 0 to target value on initialization with easing.
 */
export const AnimatedFocusHours: React.FC<{ value: number; duration?: number }> = ({
  value,
  duration = 1.6
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0.0');
  const count = useMotionValue(0);

  useEffect(() => {
    // Smooth deceleration animation on component initialization
    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // Smooth cubic-bezier curve
      onUpdate: (latest) => {
        setDisplayValue(latest.toFixed(1));
      }
    });

    return () => controls.stop();
  }, [value, duration, count]);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="tabular-nums font-mono"
    >
      {displayValue}
    </motion.span>
  );
};

interface ProfileViewProps {
  user: UserProfile;
  themeMode: ThemeMode;
  backgroundScene: BackgroundSceneId;
  sessionsByDate?: Record<string, number>;
  sessionRecords?: FocusSessionRecord[];
  loadingSessions?: boolean;
  onUpdateUser: (user: UserProfile) => void;
  onOpenShareModal: () => void;
  onOpenLogin?: () => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onBackgroundSceneChange: (scene: BackgroundSceneId) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  themeMode,
  backgroundScene,
  sessionsByDate,
  sessionRecords,
  loadingSessions,
  onUpdateUser,
  onOpenShareModal,
  onOpenLogin,
  onThemeModeChange,
  onBackgroundSceneChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [status, setStatus] = useState(user.status);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(user.avatarId);
  const [freezeNotice, setFreezeNotice] = useState<string | null>(null);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  // Extract verified focus history from Firestore via useFirebase fallback
  const fallbackFirebase = useFirebase(user);
  const activeSessionRecords = sessionRecords ?? fallbackFirebase.sessionRecords;
  const activeSessionsByDate = sessionsByDate ?? fallbackFirebase.sessionsByDate;
  const activeLoadingSessions = loadingSessions ?? fallbackFirebase.loadingSessions;

  const handleUseFreezeTicket = () => {
    if (user.freezeTickets <= 0) {
      setFreezeNotice('No Freeze Tickets remaining for this month.');
      return;
    }
    const updated: UserProfile = {
      ...user,
      freezeTickets: user.freezeTickets - 1
    };
    onUpdateUser(updated);
    setFreezeNotice('🛡️ Streak Freeze Ticket activated! Your streak is shielded today.');
    setTimeout(() => setFreezeNotice(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      username: name.trim().toLowerCase().replace(/\s+/g, '_') || user.username,
      bio: bio.trim(),
      status: status.trim() || user.status,
      avatarId: selectedAvatar
    };
    onUpdateUser(updated);
    setIsEditing(false);
  };

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto select-none bg-transparent text-white relative z-10 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8 font-qurova">
        {/* Profile Card Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="liquid-glass-card rounded-3xl p-6 sm:p-8 backdrop-blur-2xl relative"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#0EA5E9] shadow-[0_0_18px_rgba(14,165,233,0.35)]">
                  <AvatarIcon id={user.avatarId} className="w-full h-full" />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090D16]" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white">{user.name}</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.08] text-[#0EA5E9] border border-white/15 font-mono">
                    @{user.username}
                  </span>
                </div>
                <p className="text-xs text-[#0EA5E9] mt-1 font-medium">Status: [{user.status}]</p>
                <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">{user.bio}</p>

                {/* Quick Persona Metric Chips */}
                <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-white/10 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span className="text-slate-300">Lifetime Focus:</span>
                    <strong className="text-white font-mono flex items-baseline gap-0.5">
                      <AnimatedFocusHours value={user.totalFocusHours ?? 0} />
                      <span className="text-[10px] text-[#38BDF8]">h</span>
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs shadow-xs">
                    <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-slate-300">Streak:</span>
                    <strong className="text-white font-mono">{user.streak}d</strong>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300">Shields:</span>
                    <strong className="text-white font-mono">{user.freezeTickets}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-xl liquid-glass-btn text-xs font-semibold text-white flex items-center gap-1.5 shadow-md cursor-pointer"
                  title="Open Authentication / Sign In"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Account / Login</span>
                </button>
              )}

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-xl liquid-glass-btn text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Persona'}</span>
              </button>

              <button
                onClick={onOpenShareModal}
                className="px-4 py-2 rounded-xl liquid-glass-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-white" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>

          {/* Edit Form Drawer */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-in fade-in">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#0EA5E9] font-mono">
                Choose Curated Avatar
              </div>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_LIST.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedAvatar === av.id
                        ? 'bg-[#162032] border-[#0EA5E9] ring-1 ring-[#0EA5E9]'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <AvatarIcon id={av.id} className="w-10 h-10" />
                    <span className="text-[11px] text-white">{av.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Current Focus Topic</label>
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white resize-none focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl liquid-glass-primary text-white text-xs font-semibold cursor-pointer shadow-md"
                >
                  Save Persona
                </button>
              </div>
            </form>
          )}

          {freezeNotice && (
            <div className="mt-4 p-3 rounded-xl bg-[#162032] border border-[#0EA5E9]/50 text-xs text-white text-center font-medium animate-in fade-in">
              {freezeNotice}
            </div>
          )}
        </motion.section>

        {/* Lifetime Focus & Habit Overview KPI Strip (with Framer Motion totalFocusHours count-up) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-qurova"
        >
          {/* Card 1: Total Focus Hours with Framer Motion Count-up */}
          <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Focus</span>
              <div className="p-2 rounded-xl bg-white/[0.08] text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                <Clock className="w-4 h-4 text-[#38BDF8]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                <AnimatedFocusHours value={user.totalFocusHours ?? 0} />
              </span>
              <span className="text-xs font-mono text-[#38BDF8] font-semibold">hrs</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#38BDF8]" />
              <span>Verified lifetime focus</span>
            </div>
          </div>

          {/* Card 2: Streak Days */}
          <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Current Streak</span>
              <div className="p-2 rounded-xl bg-white/[0.08] text-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <Flame className="w-4 h-4 fill-[#F59E0B] animate-pulse" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                {user.streak}
              </span>
              <span className="text-xs font-mono text-[#F59E0B] font-semibold">days</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Consecutive study days</span>
            </div>
          </div>

          {/* Card 3: Today's Focus */}
          <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Today's Focus</span>
              <div className="p-2 rounded-xl bg-white/[0.08] text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                {Math.round((user.todayMinutes / 60) * 10) / 10}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">/ 4h</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>{Math.min(100, Math.round((user.todayMinutes / 240) * 100))}% daily target</span>
            </div>
          </div>

          {/* Card 4: Freeze Shields */}
          <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Shield Tickets</span>
              <div className="p-2 rounded-xl bg-white/[0.08] text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                <Shield className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                {user.freezeTickets}
              </span>
              <span className="text-xs font-mono text-sky-400 font-semibold">shield{user.freezeTickets === 1 ? '' : 's'}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Streak protection reserve</span>
            </div>
          </div>
        </motion.section>

        {/* Weekly Focus Heatmap (Recharts) */}
        <WeeklyFocusHeatmap
          streak={user.streak}
          freezeTickets={user.freezeTickets}
          sessionsByDate={activeSessionsByDate}
          sessionRecords={activeSessionRecords}
          todayMinutes={user.todayMinutes}
          onUseFreezeTicket={handleUseFreezeTicket}
        />

        {/* 2 Sanctuary Background Selection Options */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="liquid-glass-card rounded-3xl p-6 sm:p-8 backdrop-blur-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[#0EA5E9]" />
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Sanctuary Background
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Select your background sanctuary scene: Rainy Study Desk or Crackling Bonfire Hearth.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-[#0EA5E9] uppercase px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/15 self-start sm:self-auto">
              {backgroundScene === 'study-desk' ? 'Study Desk Scene' : 'Bonfire Hearth Scene'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Background Option 1: Rainy Study Desk */}
            <button
              type="button"
              onClick={() => onBackgroundSceneChange('study-desk')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between overflow-hidden group cursor-pointer ${
                backgroundScene === 'study-desk'
                  ? 'bg-[#162032] border-[#0EA5E9] ring-1 ring-[#0EA5E9] shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                  : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0EA5E9]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#0EA5E9]/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/[0.08] border border-white/15 text-[#0EA5E9]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#0EA5E9] border border-white/10">
                      Rainy Study Desk
                    </span>
                  </div>

                  {backgroundScene === 'study-desk' ? (
                    <span className="p-1 rounded-full bg-[#0EA5E9] text-white shadow-[0_0_8px_#0EA5E9]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono group-hover:text-[#0EA5E9] transition-colors">
                      Select
                    </span>
                  )}
                </div>

                <h3 className="text-lg text-white font-medium group-hover:text-[#0EA5E9] transition-colors">
                  Rainy Study Table Sanctuary
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-qurova">
                  Wide study desk with notes, warm glowing brass banker's lamp, and gentle rain beads streaming on the window.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                  Window Droplets & Warm Glow
                </span>
                <span className="text-[#0EA5E9]">Default Scene</span>
              </div>
            </button>

            {/* Background Option 2: Crackling Bonfire Hearth */}
            <button
              type="button"
              onClick={() => onBackgroundSceneChange('bonfire-hearth')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between overflow-hidden group cursor-pointer ${
                backgroundScene === 'bonfire-hearth'
                  ? 'bg-[#162032] border-[#0EA5E9] ring-1 ring-[#0EA5E9] shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                  : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#F59E0B]/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/[0.08] border border-white/15 text-[#F59E0B]">
                      <Flame className="w-4 h-4 fill-[#F59E0B]" />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#F59E0B] border border-white/10">
                      Bonfire Hearth
                    </span>
                  </div>

                  {backgroundScene === 'bonfire-hearth' ? (
                    <span className="p-1 rounded-full bg-[#0EA5E9] text-white shadow-[0_0_8px_#0EA5E9]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono group-hover:text-[#0EA5E9] transition-colors">
                      Select
                    </span>
                  )}
                </div>

                <h3 className="text-lg text-white font-medium group-hover:text-[#0EA5E9] transition-colors">
                  Crackling Bonfire Sanctuary
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-qurova">
                  Evening hearth fire with warm oak embers, rising sparks, and deep forest solitude under the nocturnal sky.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Floating Sparks & Dark Velvet
                </span>
                <span className="text-[#F59E0B]">Warm Hearth</span>
              </div>
            </button>
          </div>
        </motion.section>

        {/* Appearance & Theme (Pure Liquid Glass - click to toggle selector with 3 options) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="liquid-glass-card rounded-3xl p-5 sm:p-6 backdrop-blur-2xl relative overflow-hidden"
        >
          {/* Header with Click-to-Toggle Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.08] text-[#38BDF8]">
                <Palette className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-white">Theme</h2>
            </div>

            {/* Click to Toggle Theme Selector */}
            <button
              type="button"
              onClick={() => setIsThemeDropdownOpen((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-xl liquid-glass-btn text-xs font-semibold text-white flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <span className="capitalize">{themeMode === 'system' ? 'default' : themeMode}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Toggleable 3 Liquid Glass Choices */}
          <AnimatePresence initial={false}>
            {isThemeDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {/* 1. Light Option */}
                  <button
                    type="button"
                    onClick={() => {
                      onThemeModeChange('light');
                      setIsThemeDropdownOpen(false);
                    }}
                    className={`p-4 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      themeMode === 'light'
                        ? 'liquid-glass-btn-matcha border-[#A3E635] text-white shadow-[0_0_16px_rgba(163,230,53,0.3)]'
                        : 'liquid-glass-btn text-slate-300 hover:text-white'
                    }`}
                  >
                    <Sun className={`w-5 h-5 ${themeMode === 'light' ? 'text-[#0A1C05]' : 'text-amber-300'}`} />
                    <span className={`text-xs font-semibold capitalize ${themeMode === 'light' ? 'text-[#0A1C05]' : 'text-white'}`}>
                      light
                    </span>
                  </button>

                  {/* 2. Dark Option */}
                  <button
                    type="button"
                    onClick={() => {
                      onThemeModeChange('dark');
                      setIsThemeDropdownOpen(false);
                    }}
                    className={`p-4 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      themeMode === 'dark'
                        ? 'liquid-glass-btn-matcha border-[#A3E635] text-white shadow-[0_0_16px_rgba(163,230,53,0.3)]'
                        : 'liquid-glass-btn text-slate-300 hover:text-white'
                    }`}
                  >
                    <Moon className={`w-5 h-5 ${themeMode === 'dark' ? 'text-[#0A1C05]' : 'text-sky-300'}`} />
                    <span className={`text-xs font-semibold capitalize ${themeMode === 'dark' ? 'text-[#0A1C05]' : 'text-white'}`}>
                      dark
                    </span>
                  </button>

                  {/* 3. Default Option */}
                  <button
                    type="button"
                    onClick={() => {
                      onThemeModeChange('system');
                      setIsThemeDropdownOpen(false);
                    }}
                    className={`p-4 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer ${
                      themeMode === 'system'
                        ? 'liquid-glass-btn-matcha border-[#A3E635] text-white shadow-[0_0_16px_rgba(163,230,53,0.3)]'
                        : 'liquid-glass-btn text-slate-300 hover:text-white'
                    }`}
                  >
                    <Laptop className={`w-5 h-5 ${themeMode === 'system' ? 'text-[#0A1C05]' : 'text-slate-300'}`} />
                    <span className={`text-xs font-semibold capitalize ${themeMode === 'system' ? 'text-[#0A1C05]' : 'text-white'}`}>
                      default
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Active Theme Summary when collapsed */}
          {!isThemeDropdownOpen && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span className="text-slate-400">Current Theme:</span>
              <span className="capitalize font-mono font-semibold text-white px-2 py-0.5 rounded-lg bg-white/[0.04]">
                {themeMode === 'system' ? 'default' : themeMode}
              </span>
            </div>
          )}
        </motion.section>

        {/* 30-Day Activity Heatmap */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <ActivityHeatmap30d
            sessionsByDate={activeSessionsByDate}
            sessionRecords={activeSessionRecords}
            todayMinutes={user.todayMinutes}
            streak={user.streak}
            loading={activeLoadingSessions}
          />
        </motion.section>
      </div>
    </main>
  );
};
