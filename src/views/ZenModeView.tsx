import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomMember, AudioVolumes, SoundscapeTrack } from '../types';
import { CURATED_SOUNDSCAPES } from '../utils/soundscapes';
import { AvatarIcon } from '../utils/avatars';
import { auth } from '../lib/firebase';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  Flame,
  CloudRain,
  Music,
  Disc,
  EyeOff,
  CheckCircle2,
  Clock,
  Sparkles,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ZenModeViewProps {
  initialMinutes?: number;
  timerMinutes: number;
  timerSeconds: number;
  isRunning: boolean;
  phaseLabel: string;
  fourHourProgressPercent: number;
  members: RoomMember[];
  zenMembers?: RoomMember[];
  currentUser?: { id: string; name: string; avatarId?: any };
  audioVolumes: AudioVolumes;
  activeSoundscape?: SoundscapeTrack;
  isRawVideo?: boolean;
  onToggleRawVideo?: () => void;
  onAudioChange: (volumes: AudioVolumes) => void;
  onSelectSoundscape?: (track: SoundscapeTrack) => void;
  onToggleTimer: () => void;
  onSkipTimer: () => void;
  onFinishSession: () => void;
  onExitZen: () => void;
}

export const ZenModeView: React.FC<ZenModeViewProps> = ({
  initialMinutes = 50,
  timerMinutes,
  timerSeconds,
  isRunning,
  phaseLabel,
  fourHourProgressPercent,
  members,
  zenMembers,
  currentUser,
  audioVolumes,
  activeSoundscape,
  isRawVideo = true,
  onToggleRawVideo,
  onAudioChange,
  onSelectSoundscape,
  onToggleTimer,
  onSkipTimer,
  onFinishSession,
  onExitZen
}) => {
  const [ultraZen, setUltraZen] = useState(false);

  // Real authenticated users present in Zen Sanctuary from Firestore data store
  const effectiveZenMembers = useMemo(() => {
    const list = [...(zenMembers || [])];
    const currentUid = auth.currentUser?.uid || currentUser?.id;

    // If current user is actively focusing in Zen Mode, ensure they are represented
    if (currentUid && !list.some((m) => m.id === currentUid)) {
      list.unshift({
        id: currentUid,
        name: currentUser?.name || auth.currentUser?.displayName || 'Focus Scholar',
        avatarId: (currentUser?.avatarId || 'boy1') as any,
        status: '[In Zen Mode]',
        isAfk: false,
        focusMinutesToday: 180,
        isSelf: true
      });
    }

    // Baseline fallback if Firestore has no records yet
    if (list.length === 0) {
      list.push({
        id: currentUid || 'self',
        name: currentUser?.name || 'Focus Scholar',
        avatarId: (currentUser?.avatarId || 'boy1') as any,
        status: '[In Zen Mode]',
        isAfk: false,
        focusMinutesToday: 180,
        isSelf: true
      });
    }

    return list;
  }, [zenMembers, currentUser]);

  const zenUserCount = effectiveZenMembers.length;

  // Listen for 'z' or 'Z' key to toggle Ultra Zen Mode, or Escape to exit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z') {
        setUltraZen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (ultraZen) {
          setUltraZen(false);
        } else {
          onExitZen();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [ultraZen, onExitZen]);

  const handleDoneClick = () => {
    // Fire celebratory Apple Azure & Diamond confetti
    confetti({
      particleCount: 80,
      spread: 85,
      origin: { y: 0.65 },
      colors: ['#0EA5E9', '#38BDF8', '#FFFFFF', '#6366F1', '#39D353']
    });
    onFinishSession();
  };

  const formattedTime = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`;

  // Quick sound volume toggle helpers
  const toggleSound = (key: 'fire' | 'rain' | 'music') => {
    const current = audioVolumes[key];
    onAudioChange({
      ...audioVolumes,
      [key]: current > 0 ? 0 : 0.6
    });
  };

  // Accurate session progress calculation based on initial minutes
  const sessionTotalEstimate = Math.max(60, initialMinutes * 60);
  const remainingSecs = timerMinutes * 60 + timerSeconds;
  const sessionPercent = Math.max(0, Math.min(1, 1 - remainingSecs / sessionTotalEstimate));

  return (
    <div
      onClick={() => {
        // If in ultra zen mode, tapping the screen anywhere restores controls
        if (ultraZen) setUltraZen(false);
      }}
      className="zen-view-root font-qurov relative w-screen h-screen min-h-screen overflow-hidden bg-transparent select-none flex flex-col justify-between p-4 sm:p-6 lg:p-8 z-10"
    >
      {/* 1. Top Bar: Return to Lounge, Raw Video Toggle & Real Authenticated Zen Souls */}
      <header
        className={`relative z-20 flex items-center justify-between gap-3 transition-opacity duration-500 ${
          ultraZen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={onExitZen}
          className="liquid-glass-btn flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-white text-xs sm:text-sm font-qurov font-medium transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
          title="Exit Zen Mode and return to The Lounge"
        >
          <ArrowLeft className="w-4 h-4 text-[#38BDF8]" />
          <span className="font-handwritten-serif text-sm sm:text-base">Exit to Lounge</span>
        </button>

        {/* Center: Raw Toggle Button */}
        {onToggleRawVideo && (
          <button
            onClick={onToggleRawVideo}
            className="liquid-glass-btn flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-qurov font-medium text-white transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            title={isRawVideo ? 'Raw: ON' : 'Raw: OFF'}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{isRawVideo ? 'Raw: ON' : 'Raw: OFF'}</span>
          </button>
        )}

        {/* Real Authenticated Users in Zen Mode from Firebase Data Store */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full liquid-glass-btn shadow-md">
          <div className="flex -space-x-2">
            {effectiveZenMembers.slice(0, 3).map((m) => (
              <div key={m.id} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-[#090D16]">
                <AvatarIcon id={m.avatarId} className="w-full h-full" />
              </div>
            ))}
          </div>
          <span className="text-[11px] font-qurov text-slate-200 ml-1">
            {zenUserCount} {zenUserCount === 1 ? 'User in Zen' : 'Users in Zen'}
          </span>
        </div>
      </header>

      {/* 2. Main Center: Full-Screen Majestic Timer Canvas */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center my-auto w-full max-w-4xl mx-auto px-4 py-2">
        {/* Floating Phase Badge in Pure Liquid Glass */}
        <div
          className={`px-5 py-1.5 rounded-full liquid-glass text-xs sm:text-sm font-handwritten-serif tracking-widest uppercase text-[#38BDF8] flex items-center gap-2 mb-2 sm:mb-4 transition-opacity duration-500 shadow-md ${
            ultraZen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>{phaseLabel}</span>
        </div>

        {/* Monumental Hero Digits in Qurov Font - Aesthetic, Smooth, Transitive and Simple */}
        <div
          className="text-[clamp(5.5rem,19vw,14.5rem)] lg:text-[clamp(6.5rem,21vw,16rem)] font-qurov timer-digits-qurov font-light sm:font-normal text-white tracking-[-0.035em] leading-none my-1 sm:my-3 select-none text-center drop-shadow-[0_12px_48px_rgba(0,0,0,0.92)] tabular-nums transition-all duration-300 ease-out"
          style={{ textShadow: '0 4px 32px rgba(0,0,0,0.9), 0 0 48px rgba(56,189,248,0.18)' }}
        >
          {formattedTime}
        </div>

        {/* Expansive Horizontal Session & Daily Goal Progress Capsule in Pure Liquid Glass */}
        <div
          className={`w-full max-w-md sm:max-w-lg mt-3 sm:mt-5 transition-opacity duration-500 ${
            ultraZen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="p-3 sm:p-4 rounded-2xl liquid-glass shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2 px-1">
              <span className="flex items-center gap-1.5 text-slate-200 font-handwritten-serif text-sm sm:text-base">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isRunning ? 'In Deep Focus Session' : 'Paused'}</span>
              </span>
              <span className="flex items-center gap-1.5 font-qurov text-xs">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="text-slate-400 font-handwritten-serif text-xs sm:text-sm">Target (4h):</span>
                <strong className={fourHourProgressPercent >= 100 ? 'text-[#39D353]' : 'text-[#38BDF8]'}>
                  {fourHourProgressPercent}%
                </strong>
              </span>
            </div>

            <div className="w-full h-1.5 sm:h-2 rounded-full bg-white/[0.08] overflow-hidden backdrop-blur-md">
              <div
                className="h-full bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] rounded-full transition-all duration-500 shadow-[0_0_14px_rgba(56,189,248,0.7)]"
                style={{ width: `${Math.max(3, Math.min(100, Math.round(sessionPercent * 100)))}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Pure Liquid Glass Action Controls directly under the timer */}
        <div
          className={`flex items-center gap-4 sm:gap-6 mt-6 sm:mt-8 transition-opacity duration-500 ${
            ultraZen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Pause / Play with Liquid Glass */}
          <button
            onClick={onToggleTimer}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full liquid-glass-btn text-white flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            title={isRunning ? 'Pause Session' : 'Resume Session'}
            aria-label={isRunning ? 'Pause session' : 'Resume session'}
          >
            {isRunning ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-[#38BDF8]" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5 text-[#38BDF8]" />
            )}
          </button>

          {/* Complete Session CTA with Pure Liquid Glass Primary */}
          <button
            onClick={handleDoneClick}
            className="py-3.5 sm:py-4 px-8 sm:px-10 rounded-full liquid-glass-primary text-white font-handwritten-serif text-lg tracking-wide transition-all shadow-[0_0_32px_rgba(14,165,233,0.48)] hover:shadow-[0_0_48px_rgba(56,189,248,0.65)] hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2.5 border border-white/30"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span>Complete Session</span>
          </button>

          {/* Skip / Next Phase with Liquid Glass */}
          <button
            onClick={onSkipTimer}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full liquid-glass-btn text-slate-200 hover:text-white flex items-center justify-center transition-all hover:scale-108 active:scale-95 cursor-pointer shadow-[0_8px_28px_rgba(0,0,0,0.5)]"
            title="Advance to Next Phase"
            aria-label="Skip session"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 text-[#38BDF8]" />
          </button>
        </div>
      </main>

      {/* 4. Bottom Bar: Floating Pure Liquid Glass Dock with Handwritten Serif and Qurov Font */}
      <footer className="relative z-20 flex flex-col items-center gap-2.5">
        <div
          className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full liquid-glass transition-opacity duration-500 shadow-2xl backdrop-blur-2xl ${
            ultraZen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Hearth Button in Liquid Glass */}
          <button
            onClick={() => toggleSound('fire')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full liquid-glass-btn text-xs font-qurov transition-all flex items-center gap-2 cursor-pointer ${
              audioVolumes.fire > 0
                ? 'text-[#F59E0B] border-[#F59E0B]/50 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Toggle Hearth Ambience"
          >
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline font-handwritten-serif text-sm">Hearth</span>
          </button>

          {/* Rain Button in Liquid Glass */}
          <button
            onClick={() => toggleSound('rain')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full liquid-glass-btn text-xs font-qurov transition-all flex items-center gap-2 cursor-pointer ${
              audioVolumes.rain > 0
                ? 'text-[#38BDF8] border-[#38BDF8]/50 shadow-[0_0_16px_rgba(56,189,248,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Toggle Rain Ambience"
          >
            <CloudRain className="w-4 h-4" />
            <span className="hidden sm:inline font-handwritten-serif text-sm">Rain</span>
          </button>

          {/* Lofi Button in Liquid Glass */}
          <button
            onClick={() => toggleSound('music')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full liquid-glass-btn text-xs font-qurov transition-all flex items-center gap-2 cursor-pointer ${
              audioVolumes.music > 0
                ? 'text-[#818CF8] border-[#818CF8]/50 shadow-[0_0_16px_rgba(129,140,248,0.35)]'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Toggle Lofi Ambience"
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline font-handwritten-serif text-sm">Lofi</span>
          </button>

          {/* Quick Ambient Soundscape Cycle Button in Liquid Glass */}
          {activeSoundscape && onSelectSoundscape && (
            <button
              onClick={() => {
                const idx = CURATED_SOUNDSCAPES.findIndex((s) => s.id === activeSoundscape.id);
                const nextTrack = CURATED_SOUNDSCAPES[(idx + 1) % CURATED_SOUNDSCAPES.length];
                onSelectSoundscape(nextTrack);
              }}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full liquid-glass-btn text-xs font-qurov text-white transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
              title="Switch Ambient Soundscape (Cross-fades music gently)"
            >
              <Disc className="w-3.5 h-3.5 text-[#38BDF8] animate-[spin_8s_linear_infinite]" />
              <span className="truncate max-w-[90px] sm:max-w-[120px] font-handwritten-serif text-sm">{activeSoundscape.title}</span>
            </button>
          )}

          <div className="w-px h-5 bg-white/20 mx-0.5" />

          {/* Hide UI / Clean View toggle in Liquid Glass */}
          <button
            onClick={() => setUltraZen(true)}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full liquid-glass-btn text-xs font-qurov text-slate-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95"
            title="Hide all controls for pure fullscreen whole screen focus"
          >
            <EyeOff className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-handwritten-serif text-sm hidden sm:inline">Clean View</span>
          </button>
        </div>

        {/* Ultra zen helper note */}
        <div
          onClick={() => setUltraZen((prev) => !prev)}
          className="text-xs tracking-widest text-slate-400/90 cursor-pointer hover:text-white transition-colors mt-0.5 font-handwritten-serif drop-shadow-sm"
        >
          {ultraZen ? 'Tap screen or press [Z] to restore controls' : 'Press [Z] for Pure Timer Screen'}
        </div>
      </footer>
    </div>
  );
};

