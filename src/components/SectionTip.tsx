import React from 'react';
import { TabType } from '../types';
import { Sparkles, X, Lightbulb } from 'lucide-react';

interface SectionTipProps {
  currentTab: TabType;
  seenTabs: Record<string, boolean>;
  onDismiss: (tab: TabType) => void;
}

const SECTION_TIPS: Record<TabType, { title: string; hint: string }> = {
  lounge: {
    title: 'The Lounge & Real-time Presence',
    hint: 'Focus in silence alongside global souls. Switch tabs and your status updates to [AFK] automatically. Click the timer to set your focus plan.'
  },
  environment: {
    title: 'Local Non-Synced Binaural Mixer',
    hint: 'Craft your ideal acoustic sanctuary with rain, crackling fire, and calming lofi pentatonic chords. Runs 100% locally on your machine.'
  },
  mentor: {
    title: 'KaTeX AI Academic Mentor',
    hint: 'Ask math, algorithm, and physics doubts. Mathematical formulas and fractions are strictly typeset with zero slop.'
  },
  quizzes: {
    title: 'Active Recall Generator',
    hint: 'Enter any topic and challenge yourself with structured active recall tests. Strengthens long-term synaptic retention.'
  },
  leaderboard: {
    title: 'Global Top 10 Souls',
    hint: 'Rankings for deep study consistency. Daily 4-hour threshold unlocks streak multipliers and top tier standings.'
  },
  profile: {
    title: 'Your Heatmap & Streak Vault',
    hint: 'Review your 4h consistency grid. Use monthly Freeze Tickets if unwell so your streak never breaks.'
  }
};

export const SectionTip: React.FC<SectionTipProps> = ({ currentTab, seenTabs, onDismiss }) => {
  const isSeen = seenTabs[currentTab];
  if (isSeen) return null;

  const tip = SECTION_TIPS[currentTab];
  if (!tip) return null;

  return (
    <div className="fixed top-20 right-6 z-40 max-w-sm p-4 rounded-xl bg-[#2A2A05]/95 border border-[#FFD700]/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 fade-in duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#FFD700]">
          <Lightbulb className="w-4 h-4 text-[#FFD700]" />
          <span>Sanctuary Tip</span>
        </div>
        <button
          onClick={() => onDismiss(currentTab)}
          className="text-[#FFFFCC]/50 hover:text-[#FFFFCC] transition-colors p-0.5"
          aria-label="Dismiss tip"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <h3 className="mt-1 font-serif text-lg text-[#FFFFCC] font-normal">{tip.title}</h3>
      <p className="mt-1 text-xs text-[#E6E6B8]/80 leading-relaxed">{tip.hint}</p>
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onDismiss(currentTab)}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] transition-colors shadow-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
