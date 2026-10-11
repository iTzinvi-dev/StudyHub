import React, { useState, useEffect } from 'react';
import { X, Flame, Sparkles, Clock, Target } from 'lucide-react';
import { ShimmerButton } from './ui/ShimmerButton';

interface FocusPlanModalProps {
  isOpen: boolean;
  currentMinutes: number;
  currentPhase: string;
  onClose: () => void;
  onApprove: (minutes: number, phaseName: string) => void;
}

export const FocusPlanModal: React.FC<FocusPlanModalProps> = ({
  isOpen,
  currentMinutes,
  currentPhase,
  onClose,
  onApprove
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(currentMinutes);
  const [selectedPhase, setSelectedPhase] = useState(currentPhase);
  const [customInput, setCustomInput] = useState<string>('');

  useEffect(() => {
    setSelectedMinutes(currentMinutes);
    setSelectedPhase(currentPhase);
  }, [currentMinutes, currentPhase, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') handleConfirm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedMinutes, selectedPhase]);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'pomodoro',
      title: 'Pomodoro',
      minutes: 25,
      desc: 'Standard cadence for rapid sprints & crisp momentum.',
      icon: <Clock className="w-4 h-4 text-[#0EA5E9]" />
    },
    {
      id: 'deep-work',
      title: 'Deep Work',
      minutes: 50,
      desc: 'Optimal cognitive immersion with low distraction overhead.',
      icon: <Target className="w-4 h-4 text-[#0EA5E9]" />
    },
    {
      id: 'hyper-focus',
      title: 'Hyper Focus',
      minutes: 90,
      desc: 'Full ultradian rhythm block for deep architectural flow.',
      icon: <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
    }
  ];

  const handleSelectPreset = (minutes: number, title: string) => {
    setSelectedMinutes(minutes);
    setSelectedPhase(`${title.toUpperCase()} PHASE`);
    setCustomInput('');
  };

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 300) {
      setSelectedMinutes(num);
      setSelectedPhase('CUSTOM FOCUS');
    }
  };

  const handleConfirm = () => {
    onApprove(selectedMinutes, selectedPhase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-modal-title"
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0B0F19]/95 border border-white/15 shadow-2xl text-white backdrop-blur-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#0EA5E9] cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-[#0EA5E9] fill-[#0EA5E9]/20 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-[#0EA5E9] font-medium font-mono">Session Architecture</span>
        </div>
        <h2 id="plan-modal-title" className="text-2xl sm:text-3xl font-semibold text-white">
          Design Your Focus Sanctuary
        </h2>
        <p className="mt-1 text-sm text-slate-300 font-qurova">
          Select an intentional duration. Once approved, all worldly distractions dissolve into deep focus.
        </p>

        <div className="mt-6 space-y-3 font-qurova">
          {presets.map((p) => {
            const isSelected = selectedMinutes === p.minutes && !customInput;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.minutes, p.title)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#162032] border-[#0EA5E9] shadow-[0_0_15px_rgba(14,165,233,0.3)] ring-1 ring-[#0EA5E9]'
                    : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.08] border border-white/10 mt-0.5 text-[#0EA5E9]">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white">{p.title}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{p.desc}</p>
                  </div>
                </div>
                <div className="text-right pl-3">
                  <span className="text-2xl font-semibold text-[#0EA5E9] font-qurov tabular-nums">{p.minutes}</span>
                  <span className="text-xs text-slate-400 ml-1 font-mono">min</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom duration option */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4 font-qurova">
          <label htmlFor="custom-duration" className="text-xs text-slate-300 font-medium">
            Custom Interval (Minutes)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="custom-duration"
              type="number"
              min="1"
              max="300"
              placeholder="e.g. 45"
              value={customInput}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="w-20 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/15 text-center font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
            />
            <span className="text-xs text-slate-400">min</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 font-qurova">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl liquid-glass-btn text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-2/3 py-2.5 px-6 rounded-xl liquid-glass-primary text-white font-semibold text-sm border border-white/20 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Approve Plan & Enter Zen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
