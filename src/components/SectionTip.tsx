import React from 'react';
import { TabType } from '../types';
import { X, Lightbulb } from 'lucide-react';

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
  tracker: {
    title: 'Routine Tracker',
    hint: 'Track daily habits across the 7-day cycle. Tap any cell to toggle.'
  },
  environment: {
    title: 'Local Non-Synced Binaural Mixer',
    hint: 'Craft your ideal acoustic sanctuary with rain, crackling fire, and calming lofi pentatonic chords. Runs 100% locally on your machine.'
  },
  mentor: {
    title: 'AI Mentor Sanctuary',
    hint: 'Ask about any topic — science, history, philosophy, coding, math, or literature with deep, intuitive explanations.'
  },
  quizzes: {
    title: 'Active Recall Generator',
    hint: 'Enter any topic — including math formulas, physics, and science with full KaTeX notation. Strengthens long-term retention.'
  },
  leaderboard: {
    title: 'Global Top 10 Souls',
    hint: 'Rankings for deep study consistency. Daily 4-hour threshold unlocks streak multipliers and top tier standings.'
  },
  profile: {
    title: 'Profile Vault',
    hint: 'Customize your persona, avatar, sanctuary theme, and track your weekly focus heatmaps.'
  }
};

export const SectionTip: React.FC<SectionTipProps> = ({ currentTab, seenTabs, onDismiss }) => {
  const isSeen = seenTabs[currentTab];
  if (isSeen) return null;

  const tip = SECTION_TIPS[currentTab];
  if (!tip) return null;

  return (
    <div className="fixed top-20 right-6 z-40 max-w-sm p-4 rounded-2xl bg-[#0F172A]/95 border border-white/15 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-3 fade-in duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#0EA5E9]">
          <Lightbulb className="w-4 h-4 text-[#0EA5E9]" />
          <span className="uppercase tracking-wider text-[11px] font-semibold font-mono">Sanctuary Tip</span>
        </div>
        <button
          onClick={() => onDismiss(currentTab)}
          className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
          aria-label="Dismiss tip"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <h3 className="mt-1.5 font-semibold text-lg text-white">{tip.title}</h3>
      <p className="mt-1 text-xs text-slate-300 leading-relaxed font-qurova">{tip.hint}</p>
      <div className="mt-3.5 flex justify-end">
        <button
          onClick={() => onDismiss(currentTab)}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#0EA5E9] hover:bg-[#38BDF8] text-white transition-colors shadow-sm cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
