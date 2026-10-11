import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { RoutineMatrix } from '../components/RoutineMatrix';
import { Flame, CheckCircle2, Target } from 'lucide-react';

// Simple, classy, aesthetic icon animation wrapper - strictly classic & simple
const ClassyIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
  type?: 'pulse' | 'float';
}> = ({ children, className = '', type = 'pulse' }) => {
  const getAnimation = () => {
    if (type === 'float') {
      return {
        y: [0, -1.8, 0],
        scale: [1, 1.06, 1],
        filter: [
          'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
          'drop-shadow(0 0 4px rgba(255,255,255,0.75))',
          'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
        ]
      };
    }
    return {
      scale: [1, 1.08, 1],
      filter: [
        'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
        'drop-shadow(0 0 5px rgba(255,255,255,0.8))',
        'drop-shadow(0 0 1px rgba(255,255,255,0.3))'
      ]
    };
  };

  return (
    <motion.span
      animate={getAnimation()}
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
    >
      {children}
    </motion.span>
  );
};

interface TrackerViewProps {
  user: UserProfile;
}

export const TrackerView: React.FC<TrackerViewProps> = ({ user }) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Tracker Header */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-7 backdrop-blur-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Routine Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Track daily habits across the 7-day cycle. Tap any cell to toggle.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <div className="px-3.5 py-2 rounded-2xl liquid-glass text-right group">
              <div className="text-[10px] text-slate-400 font-medium">Streak</div>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 justify-end">
                <ClassyIcon type="pulse">
                  <Flame className="w-3.5 h-3.5 text-white fill-white" />
                </ClassyIcon>
                <span>{user.streak}d</span>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-2xl liquid-glass text-right">
              <div className="text-[10px] text-slate-400 font-medium">Daily Goals</div>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 justify-end">
                <ClassyIcon type="float">
                  <Target className="w-3.5 h-3.5 text-white" />
                </ClassyIcon>
                <span>Numeric</span>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-2xl liquid-glass text-right">
              <div className="text-[10px] text-slate-400 font-medium">Target Plan</div>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 justify-end">
                <ClassyIcon type="pulse">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </ClassyIcon>
                <span>{user.dailyGoalHours}h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plain, Solid RoutineMatrix Component */}
      <RoutineMatrix user={user} />
    </div>
  );
};

