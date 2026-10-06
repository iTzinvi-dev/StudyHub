import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Coffee,
  Trees,
  Waves,
  CloudRain,
  Flame,
  Music,
  Check,
  Play,
  Search,
  Youtube,
  Clock,
  Radio
} from 'lucide-react';
import { SoundscapeTrack } from '../types';
import { CURATED_SOUNDSCAPES } from '../utils/soundscapes';
import { ShimmerButton } from './ui/ShimmerButton';

interface SoundscapeLibraryModalProps {
  isOpen: boolean;
  activeTrack: SoundscapeTrack;
  isPlaying: boolean;
  onClose: () => void;
  onSelectTrack: (track: SoundscapeTrack) => void;
  onSetCustomUrl: (url: string) => void;
}

export const SoundscapeLibraryModal: React.FC<SoundscapeLibraryModalProps> = ({
  isOpen,
  activeTrack,
  isPlaying,
  onClose,
  onSelectTrack,
  onSetCustomUrl
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInputUrl, setCustomInputUrl] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Cozy & Library', 'Rain & Storm', 'Nature & Wild', 'Meditation'];

  const filteredTracks = CURATED_SOUNDSCAPES.filter((track) => {
    const matchesCategory = selectedCategory === 'All' || track.category === selectedCategory;
    const matchesQuery =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cozy & Library':
        return <BookOpen className="w-4 h-4 text-[#FFD700]" />;
      case 'Rain & Storm':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'Nature & Wild':
        return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'Meditation':
        return <Sparkles className="w-4 h-4 text-amber-300" />;
      default:
        return <Music className="w-4 h-4 text-[#FFD700]" />;
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputUrl.trim()) {
      onSetCustomUrl(customInputUrl.trim());
      setCustomInputUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="soundscape-modal-title"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col p-6 sm:p-8 rounded-3xl bg-[#0a0f0a]/95 border border-[#FFD700]/30 shadow-2xl text-[#FFFFCC] backdrop-blur-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#FFFFCC]/10 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-[#FFD700] animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-[#FFD700] font-medium">
                10-Hour Ambient YouTube Engine
              </span>
            </div>
            <h2 id="soundscape-modal-title" className="text-2xl sm:text-3xl font-serif text-[#FFFFCC] italic">
              Soundscape Library
            </h2>
            <p className="text-xs sm:text-sm text-[#E6E6B8]/70 mt-0.5">
              Select a continuous 10-hour background acoustic stream. Zero video display overhead, pure uninterrupted immersion.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#FFFFCC]/60 hover:text-[#FFFFCC] hover:bg-[#141d14] transition-colors focus-visible:ring-2 focus-visible:ring-[#FFD700]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="py-4 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFFFCC]/40" />
              <input
                type="text"
                placeholder="Search rain, library, campfire, cafe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141d14] border border-[#FFD700]/25 text-xs text-[#FFFFCC] placeholder-[#FFFFCC]/30 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              />
            </div>

            {/* Custom YouTube URL Form */}
            <form onSubmit={handleApplyCustomUrl} className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Paste any YouTube URL..."
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 rounded-xl bg-[#141d14] border border-[#FFD700]/25 text-xs text-[#FFFFCC] placeholder-[#FFFFCC]/30 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              />
              <button
                type="submit"
                disabled={!customInputUrl.trim()}
                className="px-3 py-2 rounded-xl bg-[#FFD700]/20 hover:bg-[#FFD700] hover:text-[#0a0f0a] text-[#FFD700] border border-[#FFD700]/40 text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap flex items-center gap-1.5"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Play URL</span>
              </button>
            </form>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#FFD700] text-[#0a0f0a] font-semibold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                      : 'bg-[#141d14]/70 hover:bg-[#1c271c] text-[#FFFFCC]/70 border border-[#FFFFCC]/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Soundscape Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 my-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredTracks.map((track) => {
              const isSelected = activeTrack.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    onSelectTrack(track);
                    onClose();
                  }}
                  className={`group p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#162216] border-[#FFD700] ring-1 ring-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                      : 'bg-[#101710]/60 hover:bg-[#141f14] border-[#FFFFCC]/15 hover:border-[#FFD700]/40'
                  }`}
                >
                  <div>
                    {/* Header badge & icon */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[#080d08] border border-[#FFD700]/20">
                          {getCategoryIcon(track.category)}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#FFD700]/80 font-mono">
                            {track.badge}
                          </span>
                          <h3 className="font-serif text-base text-[#FFFFCC] group-hover:text-[#FFD700] transition-colors leading-tight">
                            {track.title}
                          </h3>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFD700] text-[#0a0f0a] text-[10px] font-bold font-mono">
                          {isPlaying ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                              <span>LIVE</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>READY</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#FFFFCC]/40 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {track.durationLabel}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#E6E6B8]/70 leading-relaxed line-clamp-2">
                      {track.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#FFFFCC]/10 flex items-center justify-between text-[11px]">
                    <span className="text-[#FFFFCC]/50">{track.category}</span>
                    <span className="text-[#FFD700] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      {isSelected && isPlaying ? 'Currently Playing' : 'Switch To This Track'}
                      <Play className="w-3 h-3 fill-[#FFD700]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTracks.length === 0 && (
            <div className="py-12 text-center text-[#E6E6B8]/60">
              <Music className="w-8 h-8 text-[#FFD700]/40 mx-auto mb-2" />
              <p className="text-sm">No soundscapes matched "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-2 text-xs text-[#FFD700] hover:underline"
              >
                Clear search filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#FFFFCC]/10 flex items-center justify-between text-xs text-[#E6E6B8]/60 shrink-0">
          <span>Powered by YouTube API · 100% Invisible Background Stream</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141d14] hover:bg-[#1c271c] text-[#FFFFCC] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
