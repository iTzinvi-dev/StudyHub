import React from 'react';
import { CloudRain, Music2, Flame, Volume2, VolumeX } from 'lucide-react';
import { AudioVolumes } from '../types';

interface AudioMixerBarProps {
  volumes: AudioVolumes;
  onChange: (volumes: AudioVolumes) => void;
  className?: string;
}

export const AudioMixerBar: React.FC<AudioMixerBarProps> = ({ volumes, onChange, className = '' }) => {
  const isMuted = volumes.master === 0;

  const toggleMaster = () => {
    onChange({
      ...volumes,
      master: isMuted ? 0.8 : 0
    });
  };

  return (
    <div className={`flex items-center gap-3 sm:gap-4 px-5 py-2 rounded-full bg-[#0c120c]/75 backdrop-blur-xl border border-[#FFD700]/25 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all ${className}`}>
      <button
        onClick={toggleMaster}
        className="text-[#FFFFCC]/80 hover:text-[#FFD700] transition-colors p-1.5 rounded-full hover:bg-[#141d14]"
        title={isMuted ? 'Unmute Audio' : 'Mute All'}
        aria-label="Toggle sound master"
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#FFD700]" />}
      </button>

      {/* Rain slider */}
      <div className="flex items-center gap-2 group">
        <CloudRain className="w-4 h-4 text-[#FFFFCC]/70 group-hover:text-[#FFD700] transition-colors" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volumes.rain}
          onChange={(e) => onChange({ ...volumes, rain: parseFloat(e.target.value) })}
          className="w-16 sm:w-20 h-1.5 bg-[#141d14] rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
          title={`Rain: ${Math.round(volumes.rain * 100)}%`}
        />
      </div>

      <div className="w-px h-4 bg-[#FFD700]/20" />

      {/* Music slider */}
      <div className="flex items-center gap-2 group">
        <Music2 className="w-4 h-4 text-[#FFFFCC]/70 group-hover:text-[#FFD700] transition-colors" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volumes.music}
          onChange={(e) => onChange({ ...volumes, music: parseFloat(e.target.value) })}
          className="w-16 sm:w-20 h-1.5 bg-[#141d14] rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
          title={`Lofi Chords: ${Math.round(volumes.music * 100)}%`}
        />
      </div>

      <div className="w-px h-4 bg-[#FFD700]/20" />

      {/* Fire slider */}
      <div className="flex items-center gap-2 group">
        <Flame className="w-4 h-4 text-[#FFFFCC]/70 group-hover:text-[#FFD700] transition-colors" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volumes.fire}
          onChange={(e) => onChange({ ...volumes, fire: parseFloat(e.target.value) })}
          className="w-16 sm:w-20 h-1.5 bg-[#141d14] rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
          title={`Bonfire Crackle: ${Math.round(volumes.fire * 100)}%`}
        />
      </div>
    </div>
  );
};
