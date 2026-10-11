import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Music,
  Check,
  Play,
  Search,
  Youtube
} from 'lucide-react';
import { SoundscapeTrack } from '../types';
import { CURATED_SOUNDSCAPES } from '../utils/soundscapes';
import { SoundscapeArtwork } from './SoundscapeArtworks';

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
    const matchesQuery = track.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputUrl.trim()) {
      onSetCustomUrl(customInputUrl.trim());
      setCustomInputUrl('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="soundscape-modal-title"
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/15 shadow-2xl text-white backdrop-blur-2xl overflow-hidden font-qurova"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] text-white shadow-[0_0_16px_rgba(14,165,233,0.35)]">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 id="soundscape-modal-title" className="text-2xl sm:text-3xl font-semibold text-white">
                  Music Library
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#0EA5E9] cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Custom URL Filter Bar */}
          <div className="py-4 space-y-3 shrink-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                />
              </div>

              {/* Custom YouTube URL Form */}
              <form onSubmit={handleApplyCustomUrl} className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="Paste YouTube music URL..."
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                />
                <button
                  type="submit"
                  disabled={!customInputUrl.trim()}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white font-semibold text-xs transition-all disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-md hover:brightness-110"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Play</span>
                </button>
              </form>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white font-semibold shadow-md'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Music Grid */}
          <div className="flex-1 overflow-y-auto pr-1 my-2 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTracks.map((track) => {
                const isSelected = activeTrack.id === track.id;
                return (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectTrack(track);
                      onClose();
                    }}
                    className={`group p-2.5 rounded-2xl border text-center cursor-pointer transition-all duration-200 relative flex flex-col items-center justify-between overflow-hidden ${
                      isSelected
                        ? 'bg-[#162032] border-[#0EA5E9] ring-2 ring-[#0EA5E9] shadow-[0_0_24px_rgba(14,165,233,0.35)]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/25 hover:shadow-xl'
                    }`}
                  >
                    {/* SVG Artwork */}
                    <div className="relative w-full rounded-xl overflow-hidden bg-[#090D16] border border-white/10 group-hover:border-[#0EA5E9]/40 transition-colors">
                      <SoundscapeArtwork
                        trackId={track.id}
                        className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Active indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0EA5E9] text-white text-[10px] font-bold font-mono shadow-md">
                          {isPlaying ? (
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          ) : (
                            <Check className="w-3 h-3 stroke-[3]" />
                          )}
                        </div>
                      )}

                      {/* Play hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Music Title */}
                    <div className="mt-2.5 px-1 pb-1 w-full text-center">
                      <h3 className="font-medium text-sm sm:text-base text-white group-hover:text-[#0EA5E9] transition-colors leading-snug line-clamp-1">
                        {track.title}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredTracks.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-qurova">
                <Music className="w-8 h-8 text-[#0EA5E9]/40 mx-auto mb-2" />
                <p className="text-sm">No music matched "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-2 text-xs text-[#0EA5E9] hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
