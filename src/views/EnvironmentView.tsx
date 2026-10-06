import React, { useState } from 'react';
import { AudioVolumes, SoundscapeTrack } from '../types';
import { CURATED_SOUNDSCAPES } from '../utils/soundscapes';
import { SoundscapeLibraryModal } from '../components/SoundscapeLibraryModal';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { BorderBeam } from '../components/ui/BorderBeam';
import { AnimatedShinyText } from '../components/ui/AnimatedShinyText';
import {
  CloudRain,
  Flame,
  Music2,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Play,
  Pause,
  Radio,
  Library,
  BookOpen,
  Coffee,
  Trees,
  Check,
  RotateCcw
} from 'lucide-react';

interface EnvironmentViewProps {
  volumes: AudioVolumes;
  onChange: (volumes: AudioVolumes) => void;
  // YouTube ambient state & controls
  activeSoundscape: SoundscapeTrack;
  isYouTubePlaying: boolean;
  youTubeVolume: number;
  isYouTubeMuted: boolean;
  onToggleYouTubePlay: () => void;
  onSetYouTubeVolume: (vol: number) => void;
  onToggleYouTubeMute: () => void;
  onSelectSoundscape: (track: SoundscapeTrack) => void;
  onSetCustomYouTubeUrl: (url: string) => void;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({
  volumes,
  onChange,
  activeSoundscape,
  isYouTubePlaying,
  youTubeVolume,
  isYouTubeMuted,
  onToggleYouTubePlay,
  onSetYouTubeVolume,
  onToggleYouTubeMute,
  onSelectSoundscape,
  onSetCustomYouTubeUrl
}) => {
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const presets = [
    {
      name: 'Rainy Mountain Cabin',
      desc: 'Heavy raindrops against the wooden roof with a quiet crackling hearth.',
      settings: { rain: 0.85, fire: 0.45, music: 0.2, master: 0.8 }
    },
    {
      name: 'Campfire in Deep Pines',
      desc: 'Lively sparks and warm hearth embers under a starry quiet sky.',
      settings: { rain: 0, fire: 0.9, music: 0.15, master: 0.8 }
    },
    {
      name: 'Lofi Midnight Study',
      desc: 'Lush pentatonic chords, soft rainfall, and gentle ambient warmth.',
      settings: { rain: 0.4, fire: 0.3, music: 0.8, master: 0.85 }
    },
    {
      name: 'Zen Solitude',
      desc: 'Subtle minimal fire glow for zero acoustic clutter.',
      settings: { rain: 0, fire: 0.15, music: 0, master: 0.7 }
    }
  ];

  const quickPicks = CURATED_SOUNDSCAPES.slice(0, 4);

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto select-none bg-[var(--zen-bg)]/95 text-[var(--zen-cream)]">
      {/* Soundscape Library Modal */}
      <SoundscapeLibraryModal
        isOpen={isLibraryOpen}
        activeTrack={activeSoundscape}
        isPlaying={isYouTubePlaying}
        onClose={() => setIsLibraryOpen(false)}
        onSelectTrack={(track) => {
          onSelectSoundscape(track);
          if (!isYouTubePlaying) onToggleYouTubePlay();
        }}
        onSetCustomUrl={(url) => {
          onSetCustomYouTubeUrl(url);
          if (!isYouTubePlaying) onToggleYouTubePlay();
        }}
      />

      {/* Header */}
      <header className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-[var(--zen-cream)] mt-1 font-normal italic">
          Environment
        </h1>
      </header>

      <div className="max-w-4xl mx-auto mt-8 space-y-8">
        {/* 1. YouTube 10-Hour Ambient Audio Engine (Primary Feature Card) */}
        <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[#0c120c]/80 border border-[#FFD700]/30 shadow-2xl backdrop-blur-xl">
          <BorderBeam size={260} duration={16} colorFrom="#FFD700" colorTo="transparent" />

          {/* Top row: Status & Library CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#FFFFCC]/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className={`w-4 h-4 text-[#FFD700] ${isYouTubePlaying ? 'animate-pulse' : ''}`} />
                <span className="text-[11px] uppercase tracking-widest text-[#FFD700] font-semibold font-mono">
                  10-Hour Ambient YouTube Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#141d14] text-[10px] text-[#FFFFCC]/60 font-mono border border-[#FFD700]/20">
                  Invisible Stream
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#FFFFCC] italic font-normal">
                {activeSoundscape.title}
              </h2>
              <p className="text-xs text-[#E6E6B8]/75 mt-1 max-w-lg leading-relaxed">
                {activeSoundscape.description}
              </p>
            </div>

            <ShimmerButton
              onClick={() => setIsLibraryOpen(true)}
              shimmerColor="#FFD700"
              background="rgba(255, 215, 0, 0.15)"
              className="py-2.5 px-5 rounded-2xl text-[#FFFFCC] font-semibold text-xs border border-[#FFD700]/40 flex items-center gap-2 shrink-0 shadow-lg"
            >
              <Library className="w-4 h-4 text-[#FFD700]" />
              <span>Browse Soundscape Library</span>
            </ShimmerButton>
          </div>

          {/* Player Controls Bar */}
          <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 rounded-2xl bg-[#080d08]/80 border border-[#FFD700]/15">
            {/* Play/Pause & Equalizer Visualizer */}
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleYouTubePlay}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#E6B800] hover:from-[#FFFFCC] hover:to-[#FFD700] text-[#0a0f0a] flex items-center justify-center transition-all shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:scale-105 shrink-0"
                title={isYouTubePlaying ? 'Pause Ambient Stream' : 'Play 10h Ambient Stream'}
                aria-label={isYouTubePlaying ? 'Pause' : 'Play'}
              >
                {isYouTubePlaying ? (
                  <Pause className="w-5 h-5 fill-[#0a0f0a]" />
                ) : (
                  <Play className="w-5 h-5 fill-[#0a0f0a] ml-0.5" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#FFFFCC]">
                    {isYouTubePlaying ? 'Stream Active & Playing' : 'Stream Paused'}
                  </span>
                  {isYouTubePlaying && (
                    <div className="flex items-end gap-1 h-3.5">
                      <span className="w-1 bg-[#FFD700] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                      <span className="w-1 bg-[#FFD700] rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
                      <span className="w-1 bg-[#FFD700] rounded-full animate-bounce h-3.5" />
                      <span className="w-1 bg-[#FFD700] rounded-full animate-bounce [animation-delay:-0.25s] h-1.5" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-[#E6E6B8]/60 font-mono">
                  {activeSoundscape.badge} · 10h Infinite Loop
                </span>
              </div>
            </div>

            {/* Volume Slider & Mute */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={onToggleYouTubeMute}
                className="p-2 rounded-xl text-[#FFFFCC]/70 hover:text-[#FFD700] hover:bg-[#141d14] transition-colors"
                title={isYouTubeMuted ? 'Unmute' : 'Mute Stream'}
              >
                {isYouTubeMuted ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#FFD700]" />
                )}
              </button>

              <div className="flex-1 md:w-44 flex flex-col">
                <div className="flex items-center justify-between text-[11px] text-[#E6E6B8]/70 mb-1 font-mono">
                  <span>Stream Volume</span>
                  <span className="text-[#FFD700]">
                    {isYouTubeMuted ? '0%' : `${Math.round(youTubeVolume * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={isYouTubeMuted ? 0 : youTubeVolume}
                  onChange={(e) => onSetYouTubeVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#141d14] rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                />
              </div>
            </div>
          </div>

          {/* Quick Soundscape Switcher Chips */}
          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-widest text-[#E6E6B8]/60 font-semibold mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#FFD700]" />
              Quick Ambient Switcher
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {quickPicks.map((pick) => {
                const isSelected = activeSoundscape.id === pick.id;
                return (
                  <button
                    key={pick.id}
                    onClick={() => {
                      onSelectSoundscape(pick);
                      if (!isYouTubePlaying) onToggleYouTubePlay();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#141d14] border-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                        : 'bg-[#101710]/50 hover:bg-[#141d14] border-[#FFFFCC]/10 hover:border-[#FFD700]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-[#FFD700] font-mono">
                        {pick.badge}
                      </span>
                      {isSelected && <Check className="w-3 h-3 text-[#FFD700]" />}
                    </div>
                    <span className="text-xs font-serif text-[#FFFFCC] mt-1 truncate">
                      {pick.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Supplementary Binaural Synthesizers & Sound Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sliders Panel */}
          <section className="p-6 rounded-3xl bg-[var(--zen-surface)]/70 border border-[var(--zen-border)] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif text-[var(--zen-gold)] italic">Local Synthesizers</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#141d14] text-[#FFD700] border border-[#FFD700]/25">
                Binaural WebAudio
              </span>
            </div>

            {/* Master Volume */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 text-[var(--zen-cream)] font-medium">
                  <Volume2 className="w-4 h-4 text-[var(--zen-gold)]" />
                  Local Master
                </span>
                <span className="font-mono text-[var(--zen-gold)]">{Math.round(volumes.master * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes.master}
                onChange={(e) => onChange({ ...volumes, master: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-[var(--zen-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--zen-gold)]"
              />
            </div>

            {/* Rain Channel */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 text-[var(--zen-cream)] font-medium">
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  Rain & Window Beads
                </span>
                <span className="font-mono text-[var(--zen-gold)]">{Math.round(volumes.rain * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes.rain}
                onChange={(e) => onChange({ ...volumes, rain: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-[var(--zen-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--zen-gold)]"
              />
              <p className="text-[11px] text-[var(--zen-muted)]/60 mt-1">
                Lowpass biquad filtered pink noise with organic drop modulation.
              </p>
            </div>

            {/* Campfire Channel */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 text-[var(--zen-cream)] font-medium">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Bonfire Crackle
                </span>
                <span className="font-mono text-[var(--zen-gold)]">{Math.round(volumes.fire * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes.fire}
                onChange={(e) => onChange({ ...volumes, fire: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-[var(--zen-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--zen-gold)]"
              />
              <p className="text-[11px] text-[var(--zen-muted)]/60 mt-1">
                Warm low rumble with procedural sporadic hearth ember snaps.
              </p>
            </div>

            {/* Lofi Music Channel */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 text-[var(--zen-cream)] font-medium">
                  <Music2 className="w-4 h-4 text-purple-400" />
                  Lofi Chords
                </span>
                <span className="font-mono text-[var(--zen-gold)]">{Math.round(volumes.music * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes.music}
                onChange={(e) => onChange({ ...volumes, music: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-[var(--zen-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--zen-gold)]"
              />
              <p className="text-[11px] text-[var(--zen-muted)]/60 mt-1">
                Pentatonic minor 7th progressions with tape flutter and vinyl dust.
              </p>
            </div>
          </section>

          {/* Quick Presets Panel */}
          <section className="p-6 rounded-3xl bg-[var(--zen-surface)]/70 border border-[var(--zen-border)] shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--zen-cream)]/10">
                <h2 className="text-xl font-serif text-[var(--zen-gold)] italic">Synthesizer Presets</h2>
                <span className="text-xs text-[var(--zen-muted)]/60">One-click mixes</span>
              </div>

              <div className="mt-4 space-y-3">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onChange(p.settings)}
                    className="w-full p-3.5 rounded-2xl bg-[var(--zen-surface-elevated)]/40 hover:bg-[var(--zen-surface-elevated)]/80 border border-[var(--zen-cream)]/10 hover:border-[var(--zen-gold)]/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base text-[var(--zen-cream)] group-hover:text-[var(--zen-gold)] transition-colors">
                        {p.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--zen-surface)] text-[var(--zen-gold)] border border-[var(--zen-gold)]/20">
                        Apply
                      </span>
                    </div>
                    <p className="text-xs text-[var(--zen-muted)]/70 mt-1 leading-snug">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
