import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AudioVolumes, SoundscapeTrack } from '../types';
import { CURATED_SOUNDSCAPES } from '../utils/soundscapes';
import { SoundscapeLibraryModal } from '../components/SoundscapeLibraryModal';
import { SoundscapeArtwork } from '../components/SoundscapeArtworks';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { BorderBeam } from '../components/ui/BorderBeam';
import {
  CloudRain,
  Flame,
  Music2,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Pause,
  Radio,
  Library,
  Check
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
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto select-none bg-transparent text-white relative z-10 custom-scrollbar">
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
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold text-white mt-1">
          Environment
        </h1>
      </motion.header>

      <div className="max-w-4xl mx-auto mt-8 space-y-8">
        {/* 1. YouTube 10-Hour Ambient Audio Engine (Primary Feature Card) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="relative overflow-hidden p-6 sm:p-8 rounded-3xl liquid-glass-card backdrop-blur-2xl"
        >
          <BorderBeam size={260} duration={16} colorFrom="#0EA5E9" colorTo="transparent" />

          {/* Top row: Status & Library CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className={`w-4 h-4 text-[#0EA5E9] ${isYouTubePlaying ? 'animate-pulse' : ''}`} />
                <span className="text-[11px] uppercase tracking-widest text-[#0EA5E9] font-semibold font-mono">
                  10-Hour Ambient Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-slate-300 font-mono border border-white/10">
                  Invisible Stream
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                {activeSoundscape.title}
              </h2>
            </div>

            <ShimmerButton
              onClick={() => setIsLibraryOpen(true)}
              shimmerColor="#38BDF8"
              background="linear-gradient(135deg, #0284C7, #0369A1)"
              className="py-2.5 px-5 rounded-2xl text-white font-qurova font-semibold text-xs border border-white/20 flex items-center gap-2 shrink-0 shadow-lg cursor-pointer"
            >
              <Library className="w-4 h-4 text-white" />
              <span>Browse Music Library</span>
            </ShimmerButton>
          </div>

          {/* Player Controls Bar */}
          <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 rounded-2xl bg-white/[0.04] border border-white/10 font-qurova">
            {/* Play/Pause & Equalizer Visualizer */}
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleYouTubePlay}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] hover:brightness-110 text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:scale-105 shrink-0 cursor-pointer"
                title={isYouTubePlaying ? 'Pause Ambient Stream' : 'Play 10h Ambient Stream'}
                aria-label={isYouTubePlaying ? 'Pause' : 'Play'}
              >
                {isYouTubePlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    {isYouTubePlaying ? 'Stream Active & Playing' : 'Stream Paused'}
                  </span>
                  {isYouTubePlaying && (
                    <div className="flex items-end gap-1 h-3.5">
                      <span className="w-1 bg-[#0EA5E9] rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                      <span className="w-1 bg-[#0EA5E9] rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
                      <span className="w-1 bg-[#0EA5E9] rounded-full animate-bounce h-3.5" />
                      <span className="w-1 bg-[#0EA5E9] rounded-full animate-bounce [animation-delay:-0.25s] h-1.5" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeSoundscape.badge} · 10h Infinite Loop
                </span>
              </div>
            </div>

            {/* Volume Slider & Mute */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={onToggleYouTubeMute}
                className="p-2 rounded-xl text-slate-400 hover:text-[#0EA5E9] hover:bg-white/10 transition-colors cursor-pointer"
                title={isYouTubeMuted ? 'Unmute' : 'Mute Stream'}
              >
                {isYouTubeMuted ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#0EA5E9]" />
                )}
              </button>

              <div className="flex-1 md:w-44 flex flex-col">
                <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1 font-mono">
                  <span>Stream Volume</span>
                  <span className="text-[#0EA5E9]">
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
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
                />
              </div>
            </div>
          </div>

          {/* Quick Soundscape Switcher with SVG & Name */}
          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2.5 flex items-center gap-1.5 font-qurova">
              <Sparkles className="w-3 h-3 text-[#0EA5E9]" />
              Quick Ambient Switcher
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickPicks.map((pick) => {
                const isSelected = activeSoundscape.id === pick.id;
                return (
                  <button
                    key={pick.id}
                    onClick={() => {
                      onSelectSoundscape(pick);
                      if (!isYouTubePlaying) onToggleYouTubePlay();
                    }}
                    className={`p-2 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden group ${
                      isSelected
                        ? 'bg-[#162032] border-[#0EA5E9] shadow-[0_0_18px_rgba(14,165,233,0.35)]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="relative w-full rounded-xl overflow-hidden bg-[#090D16] border border-white/10">
                      <SoundscapeArtwork trackId={pick.id} className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300" />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-[#0EA5E9] text-white shadow">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-white group-hover:text-[#0EA5E9] transition-colors mt-2 truncate w-full px-1">
                      {pick.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* 2. Supplementary Binaural Synthesizers & Sound Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sliders Panel */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="p-6 rounded-3xl liquid-glass-card shadow-xl space-y-6 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Local Synthesizers</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-[#0EA5E9] border border-[#0EA5E9]/30">
                Binaural WebAudio
              </span>
            </div>

            {/* Master Volume */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2 font-qurova">
                <span className="flex items-center gap-2 text-white font-medium">
                  <Volume2 className="w-4 h-4 text-[#0EA5E9]" />
                  Local Master
                </span>
                <span className="font-mono text-[#0EA5E9]">{Math.round(volumes.master * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes.master}
                onChange={(e) => onChange({ ...volumes, master: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
              />
            </div>

            {/* Rain Channel */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2 font-qurova">
                <span className="flex items-center gap-2 text-white font-medium">
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  Rain & Window Beads
                </span>
                <span className="font-mono text-[#0EA5E9]">{Math.round(volumes.rain * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes.rain}
                onChange={(e) => onChange({ ...volumes, rain: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-qurova">
                Lowpass biquad filtered pink noise with organic drop modulation.
              </p>
            </div>

            {/* Campfire Channel */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2 font-qurova">
                <span className="flex items-center gap-2 text-white font-medium">
                  <Flame className="w-4 h-4 text-[#F59E0B]" />
                  Bonfire Crackle
                </span>
                <span className="font-mono text-[#F59E0B]">{Math.round(volumes.fire * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes.fire}
                onChange={(e) => onChange({ ...volumes, fire: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-qurova">
                Warm low rumble with procedural sporadic hearth ember snaps.
              </p>
            </div>

            {/* Lofi Music Channel */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2 font-qurova">
                <span className="flex items-center gap-2 text-white font-medium">
                  <Music2 className="w-4 h-4 text-white" />
                  Lofi Chords
                </span>
                <span className="font-mono text-[#0EA5E9]">{Math.round(volumes.music * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes.music}
                onChange={(e) => onChange({ ...volumes, music: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-qurova">
                Pentatonic minor 7th progressions with tape flutter and vinyl dust.
              </p>
            </div>
          </motion.section>

          {/* Quick Presets Panel */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="p-6 rounded-3xl liquid-glass-card shadow-xl flex flex-col justify-between backdrop-blur-2xl"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">Synthesizer Presets</h2>
                <span className="text-xs text-slate-400 font-qurova">One-click mixes</span>
              </div>

              <div className="mt-4 space-y-3 font-qurova">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onChange(p.settings)}
                    className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#0EA5E9]/50 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-white group-hover:text-[#0EA5E9] transition-colors">
                        {p.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.08] text-[#0EA5E9] border border-[#0EA5E9]/30">
                        Apply
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
};
