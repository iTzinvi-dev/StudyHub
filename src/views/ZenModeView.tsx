import React, { useState, useEffect } from 'react';
import { RoomMember, AudioVolumes } from '../types';
import { AvatarIcon } from '../utils/avatars';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  Flame,
  CloudRain,
  Wind,
  Music,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ZenModeViewProps {
  timerMinutes: number;
  timerSeconds: number;
  isRunning: boolean;
  phaseLabel: string;
  fourHourProgressPercent: number;
  members: RoomMember[];
  audioVolumes: AudioVolumes;
  onAudioChange: (volumes: AudioVolumes) => void;
  onToggleTimer: () => void;
  onSkipTimer: () => void;
  onFinishSession: () => void;
  onExitZen: () => void;
}

export const ZenModeView: React.FC<ZenModeViewProps> = ({
  timerMinutes,
  timerSeconds,
  isRunning,
  phaseLabel,
  fourHourProgressPercent,
  members,
  audioVolumes,
  onAudioChange,
  onToggleTimer,
  onSkipTimer,
  onFinishSession,
  onExitZen
}) => {
  const [ultraZen, setUltraZen] = useState(false);

  // Listen for 'z' or 'Z' key to toggle Ultra Zen Mode
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
    // Fire celebratory golden confetti
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFFFCC', '#FFA500', '#E6E6B8']
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent select-none flex flex-col justify-between p-6 sm:p-10 z-10">

      {/* Top Bar: Return to Lounge & Soul Avatars */}
      <div
        className={`relative z-20 flex items-center justify-between transition-opacity duration-500 ${
          ultraZen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={onExitZen}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1A1A00]/60 hover:bg-[#2A2A05]/90 border border-[#FFD700]/30 text-[#FFFFCC] text-sm font-serif italic transition-all backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#FFD700]" />
          <span>Lounge</span>
        </button>

        {/* Member Souls Cluster */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A00]/60 border border-[#FFD700]/25 backdrop-blur-md">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((m) => (
              <div key={m.id} className="w-7 h-7 rounded-full overflow-hidden border border-[#1A1A00]">
                <AvatarIcon id={m.avatarId} className="w-full h-full" />
              </div>
            ))}
          </div>
          <span className="text-[11px] font-mono text-[#FFD700] ml-1.5">+{members.length + 28}</span>
        </div>
      </div>

      {/* Center: Bonfire Master Timer Overlay with Dual Ring */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          {/* Outer 4-Hour Daily Completion Ring */}
          <svg className="w-80 h-80 sm:w-96 sm:h-96 transform -rotate-90 pointer-events-none" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="rgba(255, 255, 204, 0.15)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="#FFD700"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - fourHourProgressPercent / 100)}
              className="transition-all duration-700"
            />
          </svg>

          {/* Inner Active Session Ring */}
          <svg className="absolute w-64 h-64 sm:w-80 sm:h-80 transform -rotate-90 pointer-events-none" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="74"
              fill="none"
              stroke="rgba(255, 215, 0, 0.1)"
              strokeWidth="3"
            />
            <circle
              cx="100"
              cy="100"
              r="74"
              fill="none"
              stroke="#FFD700"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 74}
              strokeDashoffset={2 * Math.PI * 74 * 0.25}
              className="transition-all duration-500 shadow-[0_0_20px_#FFD700]"
            />
          </svg>

          {/* Center Digits & Phase Label */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <div className="font-serif text-7xl sm:text-8xl font-normal text-[#FFD700] tracking-tight drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
              {formattedTime}
            </div>

            <div className="mt-2 text-xs uppercase tracking-widest text-[#FFFFCC]/80 font-medium">
              {phaseLabel}
            </div>
          </div>
        </div>

        {/* Action Controls directly under the bonfire timer */}
        <div
          className={`flex items-center gap-4 mt-8 transition-opacity duration-500 ${
            ultraZen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Pause / Play */}
          <button
            onClick={onToggleTimer}
            className="w-12 h-12 rounded-full bg-[#1A1A00]/80 hover:bg-[#2A2A05] border border-[#FFD700]/30 text-[#FFFFCC] flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
            title={isRunning ? 'Pause' : 'Resume'}
            aria-label={isRunning ? 'Pause session' : 'Resume session'}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* I'm Done CTA */}
          <button
            onClick={handleDoneClick}
            className="py-3 px-8 rounded-full bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-semibold text-sm transition-all shadow-[0_0_25px_rgba(255,215,0,0.3)] hover:scale-105"
          >
            I'm Done
          </button>

          {/* Skip / Next */}
          <button
            onClick={onSkipTimer}
            className="w-12 h-12 rounded-full bg-[#1A1A00]/80 hover:bg-[#2A2A05] border border-[#FFD700]/30 text-[#FFFFCC] flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
            title="Next Phase"
            aria-label="Skip session"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Sound Toggles & Ultra Zen Switch */}
      <div className="relative z-20 flex flex-col items-center gap-2">
        <div
          className={`flex items-center gap-6 px-6 py-2.5 rounded-full bg-[#1A1A00]/70 border border-[#FFD700]/25 backdrop-blur-md transition-opacity duration-500 ${
            ultraZen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <button
            onClick={() => toggleSound('fire')}
            className={`p-1.5 transition-colors ${
              audioVolumes.fire > 0 ? 'text-[#FFD700]' : 'text-[#FFFFCC]/40 hover:text-[#FFFFCC]'
            }`}
            title="Toggle Fire Crackle"
          >
            <Flame className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleSound('rain')}
            className={`p-1.5 transition-colors ${
              audioVolumes.rain > 0 ? 'text-[#FFD700]' : 'text-[#FFFFCC]/40 hover:text-[#FFFFCC]'
            }`}
            title="Toggle Rain Ambience"
          >
            <CloudRain className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleSound('music')}
            className={`p-1.5 transition-colors ${
              audioVolumes.music > 0 ? 'text-[#FFD700]' : 'text-[#FFFFCC]/40 hover:text-[#FFFFCC]'
            }`}
            title="Toggle Lofi Chords"
          >
            <Music className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-[#FFFFCC]/20" />

          {/* Hide UI toggle */}
          <button
            onClick={() => setUltraZen(true)}
            className="flex items-center gap-1.5 text-xs text-[#FFFFCC]/80 hover:text-[#FFD700] transition-colors"
            title="Hide all controls"
          >
            <Eye className="w-4 h-4" />
            <span>HIDE UI</span>
          </button>
        </div>

        {/* Ultra zen helper note */}
        <div
          onClick={() => setUltraZen((prev) => !prev)}
          className="text-[10px] tracking-widest text-[#FFFFCC]/50 uppercase cursor-pointer hover:text-[#FFD700] transition-colors mt-1"
        >
          {ultraZen ? 'Click or Press [Z] to restore controls' : 'Press [Z] for Ultra Zen Mode'}
        </div>
      </div>
    </div>
  );
};
