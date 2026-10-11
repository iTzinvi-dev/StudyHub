import React from 'react';
import { TabType, UserProfile } from '../types';
import { AvatarIcon } from '../utils/avatars';
import {
  Flame,
  Home,
  Sliders,
  Sparkles,
  Brain,
  Trophy,
  User,
  Shield,
  HelpCircle,
  CalendarCheck
} from 'lucide-react';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  user: UserProfile;
  isAfk: boolean;
  onOpenLegal: (type: 'terms' | 'privacy' | 'guidelines') => void;
  onOpenTip: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  isAfk,
  onOpenLegal,
  onOpenTip
}) => {
  const navItems: { tab: TabType; label: string; icon: React.ReactNode }[] = [
    { tab: 'lounge', label: 'Global Lounge', icon: <Home className="w-5 h-5" /> },
    { tab: 'tracker', label: 'Routine Tracker', icon: <CalendarCheck className="w-5 h-5" /> },
    { tab: 'environment', label: 'Environment', icon: <Sliders className="w-5 h-5" /> },
    { tab: 'mentor', label: 'AI Mentor', icon: <Sparkles className="w-5 h-5" /> },
    { tab: 'quizzes', label: 'Test', icon: <Brain className="w-5 h-5" /> },
    { tab: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> },
    { tab: 'profile', label: 'Profile Vault', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-16 sm:w-20 shrink-0 bg-[#0B0F19]/85 border-r border-white/[0.08] flex flex-col items-center justify-between py-5 z-30 select-none shadow-[4px_0_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      {/* Top brand flame logo */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => onSelectTab('lounge')}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0EA5E9] via-[#0284C7] to-[#0369A1] hover:from-[#38BDF8] hover:to-[#0EA5E9] text-white flex items-center justify-center transition-all shadow-[0_0_24px_rgba(14,165,233,0.35)] hover:scale-105 cursor-pointer touch-manipulation group relative overflow-hidden"
          title="StudyHub"
          aria-label="StudyHub Home"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_70%)] opacity-70" />
          <Flame className="w-6 h-6 fill-white text-white transition-colors relative z-10 animate-pulse" />
        </button>

        {/* Navigation list */}
        <nav className="flex flex-col items-center gap-3 mt-4" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => onSelectTab(item.tab)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer touch-manipulation ${
                  isActive
                    ? 'bg-white/[0.12] text-white border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(14,165,233,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
                title={item.label}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -left-1.5 w-1 h-5 rounded-full bg-[#0EA5E9] shadow-[0_0_10px_#0EA5E9]" />
                )}

                {item.icon}

                {/* Floating tooltip */}
                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#0F172A]/95 border border-white/15 text-xs text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-[0_12px_28px_rgba(0,0,0,0.6)] z-50 backdrop-blur-xl">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom controls: Tip, Legal & User Avatar */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onOpenTip}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0EA5E9] hover:bg-white/[0.06] transition-colors"
          title="Section Tips & Guide"
          aria-label="Help and tips"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => onOpenLegal('guidelines')}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0EA5E9] hover:bg-white/[0.06] transition-colors"
          title="Terms & Community Guidelines"
          aria-label="Legal terms and guidelines"
        >
          <Shield className="w-4 h-4" />
        </button>

        <div className="w-8 h-px bg-white/10 my-1" />

        {/* User Avatar with Presence Indicator */}
        <button
          onClick={() => onSelectTab('profile')}
          className="relative group focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] rounded-full"
          title={`${user.name} (${isAfk ? 'AFK' : 'Focusing'})`}
          aria-label="Open profile"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-[#0EA5E9] transition-colors shadow-sm">
            <AvatarIcon id={user.avatarId} className="w-full h-full" />
          </div>

          {/* Presence status dot */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#090D16] transition-colors ${
              isAfk ? 'bg-rose-500' : 'bg-emerald-400'
            }`}
          />

          <span className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#0F172A]/95 border border-white/15 text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 backdrop-blur-xl">
            {user.name} · {isAfk ? 'AFK' : 'Active'}
          </span>
        </button>
      </div>
    </aside>
  );
};
