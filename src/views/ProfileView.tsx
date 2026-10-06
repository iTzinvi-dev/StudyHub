import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, AvatarId, ThemeMode, BackgroundSceneId } from '../types';
import { AVATAR_LIST, AvatarIcon } from '../utils/avatars';
import { subscribeUserSessions, auth, FocusSessionRecord } from '../lib/firebase';
import {
  Flame,
  Clock,
  Award,
  Shield,
  Share2,
  Check,
  Edit2,
  Moon,
  Sun,
  Laptop,
  Palette,
  BookOpen,
  CloudRain,
  Sparkles,
  Layers,
  Calendar,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  themeMode: ThemeMode;
  backgroundScene: BackgroundSceneId;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenShareModal: () => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  onBackgroundSceneChange: (scene: BackgroundSceneId) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  themeMode,
  backgroundScene,
  onUpdateUser,
  onOpenShareModal,
  onThemeModeChange,
  onBackgroundSceneChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [status, setStatus] = useState(user.status);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(user.avatarId);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: number; hours: number; date: string; fullDate: string } | null>(null);
  const [freezeNotice, setFreezeNotice] = useState<string | null>(null);
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, number>>({});
  const [sessionRecords, setSessionRecords] = useState<FocusSessionRecord[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Real-time synchronization of user's personal focus sessions directly from Firestore
  useEffect(() => {
    const targetUserId = auth.currentUser?.uid || user?.id;
    if (!targetUserId) {
      setLoadingSessions(false);
      return;
    }

    setLoadingSessions(true);
    const unsubscribe = subscribeUserSessions(targetUserId, (sessions, allRecords) => {
      setSessionsByDate(sessions);
      setSessionRecords(allRecords);
      setLoadingSessions(false);
    });

    return () => unsubscribe();
  }, [user.id]);

  // Generate 12-week consistency heatmap from actual Firestore deep work history
  const { heatmapData, totalTrackedHours, goalMetDaysCount, activeDaysCount } = useMemo(() => {
    const days: { day: number; hours: number; date: string; fullDate: string }[] = [];
    const now = new Date();
    let totalHoursSum = 0;
    let goalCount = 0;
    let activeCount = 0;

    for (let i = 83; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;

      // Extract verified logged hours from personal Firestore session history
      let hours = sessionsByDate[dateStr] || 0;
      if (isToday && user.todayMinutes > 0) {
        const todayHours = Math.round((user.todayMinutes / 60) * 10) / 10;
        hours = Math.max(hours, todayHours);
      }
      hours = Math.round(hours * 10) / 10;

      if (hours > 0) activeCount++;
      if (hours >= 4) goalCount++;
      totalHoursSum += hours;

      days.push({
        day: 84 - i,
        hours,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateStr
      });
    }

    return {
      heatmapData: days,
      totalTrackedHours: Math.round(totalHoursSum * 10) / 10,
      goalMetDaysCount: goalCount,
      activeDaysCount: activeCount
    };
  }, [sessionsByDate, user.todayMinutes]);

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
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto select-none bg-[#1A1A00]/95 text-[#FFFFCC]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#2A2A05]/70 border border-[#FFD700]/30 shadow-2xl relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                  <AvatarIcon id={user.avatarId} className="w-full h-full" />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#1A1A00]" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-serif text-[#FFFFCC]">{user.name}</h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1A1A00] text-[#FFD700] border border-[#FFD700]/25 font-mono">
                    @{user.username}
                  </span>
                </div>
                <p className="text-xs text-[#FFD700] mt-1 font-medium">Status: [{user.status}]</p>
                <p className="text-xs text-[#E6E6B8]/75 mt-1 max-w-lg leading-relaxed">{user.bio}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-xl bg-[#2A2A05] hover:bg-[#333308] border border-[#FFD700]/30 text-xs font-semibold text-[#FFFFCC] flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Persona'}</span>
              </button>

              <button
                onClick={onOpenShareModal}
                className="px-4 py-2 rounded-xl bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Share2 className="w-3.5 h-3.5 text-[#1A1A00]" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>

          {/* Edit Form Drawer */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-[#FFFFCC]/10 space-y-4 animate-in fade-in">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#FFD700]">
                Choose Curated Avatar
              </div>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_LIST.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedAvatar === av.id
                        ? 'bg-[#333308] border-[#FFD700] ring-1 ring-[#FFD700]'
                        : 'bg-[#1A1A00] border-[#FFFFCC]/10 hover:border-[#FFD700]/40'
                    }`}
                  >
                    <AvatarIcon id={av.id} className="w-10 h-10" />
                    <span className="text-[11px] text-[#FFFFCC]">{av.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs text-[#E6E6B8]/70 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1A1A00] border border-[#FFD700]/30 text-xs text-[#FFFFCC]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#E6E6B8]/70 mb-1">Current Focus Topic</label>
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1A1A00] border border-[#FFD700]/30 text-xs text-[#FFFFCC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#E6E6B8]/70 mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#1A1A00] border border-[#FFD700]/30 text-xs text-[#FFFFCC] resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] text-xs font-semibold"
                >
                  Save Persona
                </button>
              </div>
            </form>
          )}

          {/* Gamification Stats Triplets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#FFFFCC]/10">
            <div className="p-4 rounded-2xl bg-[#1A1A00]/80 border border-[#FFD700]/20 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#2A2A05] text-amber-500">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-serif text-[#FFFFCC]">{user.streak} Days</div>
                <div className="text-[11px] text-[#E6E6B8]/60 uppercase tracking-wider">Unbroken Streak</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A1A00]/80 border border-[#FFD700]/20 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#2A2A05] text-[#FFD700]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-serif text-[#FFFFCC]">{user.totalFocusHours} Hours</div>
                <div className="text-[11px] text-[#E6E6B8]/60 uppercase tracking-wider">Deep Solitude</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A1A00]/80 border border-[#FFD700]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#2A2A05] text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-serif text-[#FFFFCC]">{user.freezeTickets} Left</div>
                  <div className="text-[11px] text-[#E6E6B8]/60 uppercase tracking-wider">Freeze Tickets</div>
                </div>
              </div>

              <button
                onClick={handleUseFreezeTicket}
                disabled={user.freezeTickets <= 0}
                className="px-3 py-1.5 rounded-lg bg-[#2A2A05] hover:bg-[#333308] border border-[#FFD700]/30 text-[11px] font-semibold text-[#FFD700] disabled:opacity-40 transition-colors"
                title="Protect today's streak"
              >
                Use Ticket
              </button>
            </div>
          </div>

          {freezeNotice && (
            <div className="mt-4 p-3 rounded-xl bg-[#333308] border border-[#FFD700]/50 text-xs text-[#FFFFCC] text-center font-medium animate-in fade-in">
              {freezeNotice}
            </div>
          )}
        </section>

        {/* 2 Sanctuary Background Selection Options */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[var(--zen-surface)]/70 border border-[var(--zen-border)] shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--zen-cream)]/10">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[var(--zen-gold)]" />
              <div>
                <h2 className="text-xl sm:text-2xl font-serif text-[var(--zen-cream)] italic">
                  Sanctuary Background
                </h2>
                <p className="text-xs text-[var(--zen-muted)]/75 mt-0.5">
                  Select your background sanctuary scene: Rainy Study Desk or Crackling Bonfire Hearth.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-[var(--zen-gold)] uppercase px-2.5 py-1 rounded-md bg-[var(--zen-bg)] border border-[var(--zen-border)] self-start sm:self-auto">
              {backgroundScene === 'study-desk' ? 'Study Desk Scene' : 'Bonfire Hearth Scene'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Background Option 1: Rainy Study Desk */}
            <button
              type="button"
              onClick={() => onBackgroundSceneChange('study-desk')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between overflow-hidden group ${
                backgroundScene === 'study-desk'
                  ? 'bg-[#0f1710] border-[#FFD700] ring-1 ring-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.25)]'
                  : 'bg-[#141b14]/50 border-[#FFFFCC]/10 hover:border-[#FFD700]/40 hover:bg-[#141b14]'
              }`}
            >
              {/* Subtle visual ambient tint */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#080d08] border border-[#FFD700]/30 text-[#FFD700]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#1b251b] text-[#FFD700] border border-[#FFD700]/25">
                      Rainy Study Desk
                    </span>
                  </div>

                  {backgroundScene === 'study-desk' ? (
                    <span className="p-1 rounded-full bg-[#FFD700] text-[#070B07] shadow-[0_0_8px_#FFD700]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#FFFFCC]/40 font-mono group-hover:text-[#FFD700] transition-colors">
                      Select
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg text-[#FFFFCC] font-normal group-hover:text-[#FFD700] transition-colors">
                  Rainy Study Table Sanctuary
                </h3>
                <p className="text-xs text-[#E6E6B8]/75 mt-1.5 leading-relaxed">
                  Wide mahogany study desk with books, notes, glowing vintage brass lamp, and animated rain streaming on the night window.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#FFFFCC]/10 flex items-center justify-between text-[11px] text-[#E6E6B8]/60 font-mono">
                <span className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                  Window Droplets & Lamp Glow
                </span>
                <span className="text-[#FFD700]">Default Focal</span>
              </div>
            </button>

            {/* Background Option 2: Crackling Bonfire Hearth */}
            <button
              type="button"
              onClick={() => onBackgroundSceneChange('bonfire-hearth')}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between overflow-hidden group ${
                backgroundScene === 'bonfire-hearth'
                  ? 'bg-[#180e07] border-[#FF8A3D] ring-1 ring-[#FF8A3D] shadow-[0_0_20px_rgba(255,138,61,0.25)]'
                  : 'bg-[#141b14]/50 border-[#FFFFCC]/10 hover:border-[#FF8A3D]/40 hover:bg-[#141b14]'
              }`}
            >
              {/* Subtle visual ambient tint */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-600/20 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#120703] border border-[#FF8A3D]/30 text-[#FF8A3D]">
                      <Flame className="w-4 h-4 fill-[#FF8A3D]" />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#241208] text-[#FF8A3D] border border-[#FF8A3D]/25">
                      Bonfire Hearth
                    </span>
                  </div>

                  {backgroundScene === 'bonfire-hearth' ? (
                    <span className="p-1 rounded-full bg-[#FF8A3D] text-[#120703] shadow-[0_0_8px_#FF8A3D]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#FFFFCC]/40 font-mono group-hover:text-[#FF8A3D] transition-colors">
                      Select
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg text-[#FFFFCC] font-normal group-hover:text-[#FF8A3D] transition-colors">
                  Crackling Bonfire Sanctuary
                </h3>
                <p className="text-xs text-[#E6E6B8]/75 mt-1.5 leading-relaxed">
                  Wilderness evening bonfire with glowing oak coals, dancing sparks, rising embers, and deep forest solitude under the nocturnal sky.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#FFFFCC]/10 flex items-center justify-between text-[11px] text-[#E6E6B8]/60 font-mono">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Floating Sparks & Deep Night
                </span>
                <span className="text-[#FF8A3D]">Warm Hearth</span>
              </div>
            </button>
          </div>
        </section>

        {/* Appearance & Theme Selection (Light / Dark / System Default) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[var(--zen-surface)]/70 border border-[var(--zen-border)] shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--zen-cream)]/10">
            <div className="flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-[var(--zen-gold)]" />
              <div>
                <h2 className="text-xl sm:text-2xl font-serif text-[var(--zen-cream)] italic">
                  Appearance & Theme
                </h2>
                <p className="text-xs text-[var(--zen-muted)]/75 mt-0.5">
                  Choose your focus visual tone: signature dark velvet, warm light parchment, or system default.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-[var(--zen-gold)] uppercase px-2.5 py-1 rounded-md bg-[var(--zen-bg)] border border-[var(--zen-border)]">
              {themeMode === 'system' ? 'System Sync' : `${themeMode.toUpperCase()} MODE`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {/* Dark Theme Option */}
            <button
              type="button"
              onClick={() => onThemeModeChange('dark')}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between ${
                themeMode === 'dark'
                  ? 'bg-[#0E150E] border-[#FFD700] ring-1 ring-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                  : 'bg-[#141b14]/50 border-[#FFFFCC]/10 hover:border-[#FFD700]/40 hover:bg-[#141b14]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-[#070B07] border border-[#FFD700]/30 text-[#FFD700]">
                    <Moon className="w-4 h-4" />
                  </div>
                  {themeMode === 'dark' && (
                    <span className="p-0.5 rounded-full bg-[#FFD700] text-[#070B07]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-base text-[#FFFFCC] font-semibold">Dark Theme</h3>
                <p className="text-[11px] text-[#E6E6B8]/70 mt-1 leading-snug">
                  Obsidian velvet noir with antique gold. Deep contrast for night solitude and OLED efficiency.
                </p>
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#FFFFCC]/10">
                <span className="w-4 h-4 rounded-full bg-[#070B07] border border-white/20" title="Background" />
                <span className="w-4 h-4 rounded-full bg-[#0E150E] border border-white/20" title="Surface" />
                <span className="w-4 h-4 rounded-full bg-[#FFD700] shadow-[0_0_6px_#FFD700]" title="Gold Accent" />
                <span className="w-4 h-4 rounded-full bg-[#FFFFCC]" title="Cream Text" />
              </div>
            </button>

            {/* Light Theme Option */}
            <button
              type="button"
              onClick={() => onThemeModeChange('light')}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between ${
                themeMode === 'light'
                  ? 'bg-[#EBE5D8] border-[#B8860B] ring-1 ring-[#B8860B] shadow-[0_0_15px_rgba(184,134,11,0.2)] text-[#1A1813]'
                  : 'bg-[#141b14]/50 border-[#FFFFCC]/10 hover:border-[#FFD700]/40 hover:bg-[#141b14]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-[#F6F3EC] border border-[#B8860B]/30 text-[#B8860B]">
                    <Sun className="w-4 h-4" />
                  </div>
                  {themeMode === 'light' && (
                    <span className="p-0.5 rounded-full bg-[#B8860B] text-white">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h3 className={`font-serif text-base font-semibold ${themeMode === 'light' ? 'text-[#1A1813]' : 'text-[#FFFFCC]'}`}>
                  Light Theme
                </h3>
                <p className={`text-[11px] mt-1 leading-snug ${themeMode === 'light' ? 'text-[#5C5648]' : 'text-[#E6E6B8]/70'}`}>
                  Warm academic ivory and parchment with rich bronze gold. Crisp clarity for bright sunlight.
                </p>
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-black/10">
                <span className="w-4 h-4 rounded-full bg-[#F6F3EC] border border-black/20" title="Background" />
                <span className="w-4 h-4 rounded-full bg-[#EBE5D8] border border-black/20" title="Surface" />
                <span className="w-4 h-4 rounded-full bg-[#B8860B]" title="Gold Accent" />
                <span className="w-4 h-4 rounded-full bg-[#1A1813]" title="Dark Text" />
              </div>
            </button>

            {/* System Default Option */}
            <button
              type="button"
              onClick={() => onThemeModeChange('system')}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between ${
                themeMode === 'system'
                  ? 'bg-[var(--zen-surface-elevated)] border-[var(--zen-gold)] ring-1 ring-[var(--zen-gold)] shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                  : 'bg-[#141b14]/50 border-[#FFFFCC]/10 hover:border-[#FFD700]/40 hover:bg-[#141d14]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-[var(--zen-bg)] border border-[var(--zen-border)] text-cyan-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  {themeMode === 'system' && (
                    <span className="p-0.5 rounded-full bg-[var(--zen-gold)] text-[#070B07]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-base text-[var(--zen-cream)] font-semibold">System Default</h3>
                <p className="text-[11px] text-[var(--zen-muted)]/70 mt-1 leading-snug">
                  Automatically syncs with your operating system or browser display preference.
                </p>
              </div>

              {/* Swatches */}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[var(--zen-cream)]/10 text-[10px] text-[var(--zen-muted)] font-mono">
                <span>Auto Day / Night</span>
              </div>
            </button>
          </div>
        </section>

        {/* GitHub-Style Consistency Grid (Heatmap) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#2A2A05]/70 border border-[#FFD700]/30 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FFFFCC]/10">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FFD700]" />
                <h2 className="text-2xl font-serif text-[#FFFFCC]">Consistency Heatmap</h2>
              </div>
              <p className="text-xs text-[#E6E6B8]/75 mt-0.5">
                Daily target: <strong className="text-[#FFD700]">≥ 4 hours</strong> of verified deep focus. Click any
                square to inspect.
              </p>
            </div>

            {/* Inspected Day or Overall Metric */}
            {selectedDayInfo ? (
              <div className="text-xs px-3.5 py-1.5 rounded-xl bg-[#1A1A00] border border-[#FFD700]/40 text-[#FFD700] font-mono flex items-center gap-2 shadow-md">
                <Clock className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>
                  Day {selectedDayInfo.day} ({selectedDayInfo.date}): <strong>{selectedDayInfo.hours} hrs</strong>
                  {selectedDayInfo.hours >= 4 ? ' 🔥 Goal Met' : ''}
                </span>
              </div>
            ) : (
              <div className="text-xs px-3.5 py-1.5 rounded-xl bg-[#1A1A00] border border-[#FFD700]/20 text-[#E6E6B8]/80 font-mono">
                {totalTrackedHours}h verified across {activeDaysCount} active days
              </div>
            )}
          </div>

          {/* Quick Metrics Bar directly from Firestore */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-[#1A1A00]/70 border border-[#FFFFCC]/10">
              <span className="text-[10px] uppercase font-mono text-[#E6E6B8]/60">84-Day Total</span>
              <div className="text-base font-serif text-[#FFD700] mt-0.5">{totalTrackedHours} hrs</div>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A00]/70 border border-[#FFFFCC]/10">
              <span className="text-[10px] uppercase font-mono text-[#E6E6B8]/60">Target Days (≥4h)</span>
              <div className="text-base font-serif text-amber-400 mt-0.5">{goalMetDaysCount} days</div>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A00]/70 border border-[#FFFFCC]/10">
              <span className="text-[10px] uppercase font-mono text-[#E6E6B8]/60">Active Days</span>
              <div className="text-base font-serif text-[#FFFFCC] mt-0.5">{activeDaysCount} / 84</div>
            </div>
            <div className="p-3 rounded-xl bg-[#1A1A00]/70 border border-[#FFFFCC]/10">
              <span className="text-[10px] uppercase font-mono text-[#E6E6B8]/60">Logged Sessions</span>
              <div className="text-base font-serif text-emerald-400 mt-0.5">{sessionRecords.length} logged</div>
            </div>
          </div>

          {/* Grid display from actual Firestore database history */}
          <div className="mt-6 overflow-x-auto pb-2">
            {loadingSessions ? (
              <div className="p-8 text-center text-xs text-[#E6E6B8]/60 font-serif italic">
                Synchronizing verified deep work sessions from Firestore...
              </div>
            ) : (
              <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 p-3 rounded-2xl bg-[#1A1A00]/80 border border-[#FFD700]/15">
                {heatmapData.map((d) => {
                  const isSelected = selectedDayInfo?.day === d.day;
                  let bg = 'bg-[#222204]';
                  if (d.hours >= 6) {
                    bg = 'bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]';
                  } else if (d.hours >= 4) {
                    bg = 'bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.4)]';
                  } else if (d.hours >= 2) {
                    bg = 'bg-[#8A7922]';
                  } else if (d.hours > 0) {
                    bg = 'bg-[#4B4B0C]';
                  }

                  return (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDayInfo({ day: d.day, hours: d.hours, date: d.date, fullDate: d.fullDate })}
                      className={`w-3.5 h-3.5 rounded-xs transition-all cursor-pointer ${bg} ${
                        isSelected ? 'ring-2 ring-[#FFFFCC] scale-125 z-10' : 'hover:scale-110'
                      }`}
                      title={`${d.date}: ${d.hours} hours`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Inspected Day Sessions List */}
          {selectedDayInfo && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#141d14]/70 border border-[#FFD700]/20 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px] text-[#E6E6B8]/70 border-b border-[#FFFFCC]/10 pb-1.5 mb-2">
                <span>Inspected: Day {selectedDayInfo.day} ({selectedDayInfo.fullDate})</span>
                <span className="text-[#FFD700] font-bold">{selectedDayInfo.hours} total hours</span>
              </div>

              {sessionRecords.filter((s) => s.date === selectedDayInfo.fullDate).length > 0 ? (
                <div className="space-y-1.5">
                  {sessionRecords
                    .filter((s) => s.date === selectedDayInfo.fullDate)
                    .map((s, idx) => (
                      <div key={s.id || idx} className="flex items-center justify-between text-[11px] font-mono text-[#FFFFCC]/90">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-[#FFD700]" />
                          {s.phase}
                        </span>
                        <span className="text-[#FFD700]">{s.minutes} min ({s.hours}h)</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#E6E6B8]/60 italic font-serif">
                  {selectedDayInfo.hours > 0
                    ? `${selectedDayInfo.hours} hours logged for this cycle.`
                    : 'No verified focus sessions logged on this day.'}
                </p>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] text-[#E6E6B8]/60 mt-4 pt-3 border-t border-[#FFFFCC]/10">
            <span>Past 12 Weeks (84 Days)</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-3 h-3 rounded-xs bg-[#222204]" title="0 hours" />
              <span className="w-3 h-3 rounded-xs bg-[#4B4B0C]" title="< 2 hours" />
              <span className="w-3 h-3 rounded-xs bg-[#8A7922]" title="2 - 4 hours" />
              <span className="w-3 h-3 rounded-xs bg-[#D4AF37]" title="4 - 6 hours (Target Met)" />
              <span className="w-3 h-3 rounded-xs bg-[#FFD700]" title="≥ 6 hours" />
              <span>More (≥ 4h Goal)</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
