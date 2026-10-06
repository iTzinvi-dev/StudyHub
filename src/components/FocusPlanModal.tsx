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
      icon: <Clock className="w-4 h-4 text-[#FFD700]" />
    },
    {
      id: 'deep-work',
      title: 'Deep Work',
      minutes: 50,
      desc: 'Optimal cognitive immersion with low distraction overhead.',
      icon: <Target className="w-4 h-4 text-[#FFD700]" />
    },
    {
      id: 'hyper-focus',
      title: 'Hyper Focus',
      minutes: 90,
      desc: 'Full ultradian rhythm block for deep architectural flow.',
      icon: <Sparkles className="w-4 h-4 text-[#FFD700]" />
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
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0c120c]/95 border border-[#FFD700]/30 shadow-2xl text-[#FFFFCC] backdrop-blur-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#FFFFCC]/60 hover:text-[#FFFFCC] hover:bg-[#141b14] transition-colors focus-visible:ring-2 focus-visible:ring-[#FFD700]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-[#FFD700] fill-[#FFD700]/30 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-[#FFD700] font-medium">Session Architecture</span>
        </div>
        <h2 id="plan-modal-title" className="text-2xl sm:text-3xl font-serif text-[#FFFFCC] italic">
          Design Your Focus Sanctuary
        </h2>
        <p className="mt-1 text-sm text-[#E6E6B8]/75">
          Select an intentional duration. Once approved, all worldly distractions dissolve into the bonfire.
        </p>

        <div className="mt-6 space-y-3">
          {presets.map((p) => {
            const isSelected = selectedMinutes === p.minutes && !customInput;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.minutes, p.title)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#141d14] border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.25)] ring-1 ring-[#FFD700]'
                    : 'bg-[#101710]/50 border-[#FFFFCC]/15 hover:border-[#FFD700]/40 hover:bg-[#141d14]/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#080d08] border border-[#FFD700]/25 mt-0.5">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[#FFFFCC]">{p.title}</h3>
                    <p className="text-xs text-[#E6E6B8]/70 mt-0.5">{p.desc}</p>
                  </div>
                </div>
                <div className="text-right pl-3">
                  <span className="font-serif text-2xl text-[#FFD700]">{p.minutes}</span>
                  <span className="text-xs text-[#E6E6B8]/60 ml-1">min</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom duration option */}
        <div className="mt-4 pt-4 border-t border-[#FFFFCC]/10 flex items-center justify-between gap-4">
          <label htmlFor="custom-duration" className="text-xs text-[#E6E6B8]/80 font-medium">
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
              className="w-20 px-3 py-1.5 rounded-lg bg-[#141d14] border border-[#FFD700]/30 text-center font-mono text-sm text-[#FFFFCC] focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
            <span className="text-xs text-[#E6E6B8]/60">min</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl border border-[#FFFFCC]/20 text-sm font-medium text-[#FFFFCC]/80 hover:bg-[#141d14] transition-colors"
          >
            Cancel
          </button>
          <ShimmerButton
            onClick={handleConfirm}
            shimmerColor="#FFD700"
            background="rgba(255, 215, 0, 0.15)"
            className="w-full sm:w-2/3 py-2.5 px-6 rounded-xl text-[#FFFFCC] font-semibold text-sm border border-[#FFD700]/40 flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <span>Approve Plan & Enter Zen</span>
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
};
