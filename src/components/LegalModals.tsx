import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Users } from 'lucide-react';

export type LegalType = 'terms' | 'privacy' | 'guidelines' | null;

interface LegalModalProps {
  type: LegalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'guidelines'>('terms');

  useEffect(() => {
    if (type) setActiveTab(type);
  }, [type]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0B0F19]/95 border border-white/15 shadow-2xl text-white overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.04]">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#0EA5E9] font-semibold font-mono">Sanctuary Governance</div>
            <h2 className="text-2xl font-semibold text-white mt-0.5">Trust, Sanctuary & Conduct</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 px-6 gap-6 text-sm font-medium font-qurova">
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#0EA5E9] text-[#0EA5E9]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#0EA5E9] text-[#0EA5E9]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'guidelines'
                ? 'border-[#0EA5E9] text-[#0EA5E9]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Community Guidelines</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed font-qurova">
          {activeTab === 'terms' && (
            <>
              <h3 className="text-lg font-semibold text-[#0EA5E9]">1. The Sanctuary Covenant</h3>
              <p>
                StudyHub is built as an anti-distraction, human-crafted focus engine. By entering any room, public
                or private, you agree to honor the atmosphere of deep work and uninterrupted immersion.
              </p>
              <h3 className="text-lg font-semibold text-[#0EA5E9]">2. Personal Audio & Data Sovereignty</h3>
              <p>
                All ambient audio mixing (rain, fire, and lofi chords) generates completely locally on your hardware
                via Web Audio API synthesizers. No sound streams are transmitted over network sockets or shared with others.
              </p>
              <h3 className="text-lg font-semibold text-[#0EA5E9]">3. Streaks & Gamification</h3>
              <p>
                Streaks require completion of at least 4 hours of genuine focus within a 24-hour cycle. Monthly Freeze
                Tickets are provided to safeguard physical well-being and rest days.
              </p>
            </>
          )}

          {activeTab === 'privacy' && (
            <>
              <h3 className="text-lg font-semibold text-[#0EA5E9]">1. Zero Telemetry & Respect for Solitude</h3>
              <p>
                We do not track your browsing history, run third-party advertising cookies, or sell user behavior data.
                Your study timer, streak logs, and preferences remain stored in your browser's local sandbox.
              </p>
              <h3 className="text-lg font-semibold text-[#0EA5E9]">2. Real-Time Presence Detection</h3>
              <p>
                To provide accountability in study rooms without invasive webcam surveillance, StudyHub checks the
                browser's Page Visibility API. When you leave the tab, your presence flips to [AFK]. No screen contents
                or keystrokes are recorded.
              </p>
              <h3 className="text-lg font-semibold text-[#0EA5E9]">3. AI Query Handling</h3>
              <p>
                Questions asked to the AI Mentor or Active Recall Generator are passed securely for inference. No chat logs
                are repurposed for ad profiling.
              </p>
            </>
          )}

          {activeTab === 'guidelines' && (
            <>
              <h3 className="text-lg font-semibold text-[#0EA5E9]">1. The Silent Camaraderie</h3>
              <p>
                The room ecosystem is designed for shared focus without chaotic chat feeds. Respect everyone's concentration
                by keeping status descriptions constructive and inspirational.
              </p>
              <h3 className="text-lg font-semibold text-[#0EA5E9]">2. Curated Identity Standard</h3>
              <p>
                Custom arbitrary photo uploads are restricted to preserve the serene aesthetic of the sanctuary.
                Select among our curated avatars with pride.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
