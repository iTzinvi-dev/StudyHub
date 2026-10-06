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
  HelpCircle
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
    { tab: 'lounge', label: 'The Lounge', icon: <Home className="w-5 h-5" /> },
    { tab: 'environment', label: 'Environment', icon: <Sliders className="w-5 h-5" /> },
    { tab: 'mentor', label: 'AI Mentor', icon: <Sparkles className="w-5 h-5" /> },
    { tab: 'quizzes', label: 'Test', icon: <Brain className="w-5 h-5" /> },
    { tab: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> },
    { tab: 'profile', label: 'Profile Vault', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <aside className="w-16 sm:w-20 shrink-0 bg-[#0a0f0a] border-r border-[#FFD700]/15 flex flex-col items-center justify-between py-5 z-30 select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Top brand flame logo */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => onSelectTab('lounge')}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#E6B800] hover:from-[#FFFFCC] hover:to-[#FFD700] text-[#0a0f0a] flex items-center justify-center transition-all shadow-[0_0_20px_rgba(255,215,0,0.35)] hover:scale-105"
          title="StudyHub"
          aria-label="StudyHub Home"
        >
          <Flame className="w-6 h-6 fill-[#0a0f0a] animate-pulse" />
        </button>

        {/* Navigation list */}
        <nav className="flex flex-col items-center gap-3 mt-4" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-[#141d14] text-[#FFD700] border border-[#FFD700]/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                    : 'text-[#FFFFCC]/60 hover:text-[#FFFFCC] hover:bg-[#141d14]/60'
                }`}
                title={item.label}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -left-1.5 w-1 h-5 rounded-full bg-[#FFD700] shadow-[0_0_8px_#FFD700]" />
                )}

                {item.icon}

                {/* Floating tooltip */}
                <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#0e170e] border border-[#FFD700]/30 text-xs text-[#FFFFCC] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 backdrop-blur-md">
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
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#FFFFCC]/50 hover:text-[#FFD700] hover:bg-[#141d14]/70 transition-colors"
          title="Section Tips & Guide"
          aria-label="Help and tips"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => onOpenLegal('guidelines')}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#FFFFCC]/50 hover:text-[#FFD700] hover:bg-[#141d14]/70 transition-colors"
          title="Terms & Community Guidelines"
          aria-label="Legal terms and guidelines"
        >
          <Shield className="w-4 h-4" />
        </button>

        <div className="w-8 h-px bg-[#FFFFCC]/10 my-1" />

        {/* User Avatar with Presence Indicator */}
        <button
          onClick={() => onSelectTab('profile')}
          className="relative group focus:outline-none focus:ring-2 focus:ring-[#FFD700] rounded-full"
          title={`${user.name} (${isAfk ? 'AFK' : 'Focusing'})`}
          aria-label="Open profile"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#FFD700]/40 hover:border-[#FFD700] transition-colors shadow-sm">
            <AvatarIcon id={user.avatarId} className="w-full h-full" />
          </div>

          {/* Presence status dot */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0f0a] transition-colors ${
              isAfk ? 'bg-rose-500' : 'bg-emerald-400'
            }`}
          />

          <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-[#0e170e] border border-[#FFD700]/30 text-[11px] text-[#FFFFCC] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 backdrop-blur-md">
            {user.name} · {isAfk ? 'AFK' : 'Active'}
          </span>
        </button>
      </div>
    </aside>
  );
};
