import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AvatarIcon } from '../utils/avatars';
import { AvatarId, UserProfile } from '../types';
import { Trophy, Flame, Clock } from 'lucide-react';
import { subscribeLeaderboard } from '../lib/firebase';

interface LeaderboardUser {
  rank: number;
  name: string;
  username: string;
  avatarId: AvatarId;
  totalHours: number;
  streakDays: number;
  currentStatus: string;
  isCurrentUser?: boolean;
}

export const LeaderboardView: React.FC<{ currentUser?: UserProfile }> = ({ currentUser }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((realUsers) => {
      setLeaderboard(realUsers);
    });

    return () => unsubscribe();
  }, []);

  const effectiveUsers: LeaderboardUser[] = leaderboard.length > 0 ? leaderboard : (
    currentUser ? [{
      rank: 1,
      name: currentUser.name || 'Sanctuary Scholar',
      username: currentUser.username || 'scholar',
      avatarId: currentUser.avatarId || 'boy1',
      totalHours: currentUser.totalFocusHours || 0,
      streakDays: currentUser.streak || 0,
      currentStatus: currentUser.status || '[Studying]',
      isCurrentUser: true
    }] : []
  );

  return (
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto select-none bg-transparent text-white relative z-10 custom-scrollbar">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#0EA5E9] font-qurova">
          <Trophy className="w-4 h-4 text-[#0EA5E9]" />
          <span>Global Sanctuaries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-white mt-1">
          Focus Luminaries
        </h1>
        <p className="text-sm text-slate-300 mt-1 font-qurova">
          Leaderboard rankings are verified by real-time deep focus hours.
        </p>
      </motion.header>

      {/* Top 3 Podium Highlights */}
      {effectiveUsers.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="max-w-4xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {effectiveUsers.slice(0, 3).map((item) => {
            const podiumBorder =
              item.rank === 1
                ? 'border-[#0EA5E9] liquid-glass-card shadow-[0_0_28px_rgba(14,165,233,0.35)]'
                : item.rank === 2
                ? 'border-white/20 liquid-glass-card shadow-lg'
                : 'border-white/10 liquid-glass shadow-md';

            return (
              <motion.div
                key={item.username || item.rank}
                whileHover={{ y: -3 }}
                className={`p-5 rounded-3xl border flex flex-col items-center text-center relative backdrop-blur-2xl ${podiumBorder}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-3 ${
                    item.rank === 1
                      ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md'
                      : item.rank === 2
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  #{item.rank}
                </div>

                <AvatarIcon id={item.avatarId} className="w-14 h-14" />
                <h3 className="font-semibold text-lg text-white mt-2 truncate w-full">{item.name}</h3>
                <p className="text-xs text-[#0EA5E9] font-mono">@{item.username}</p>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-1 italic font-qurova">"{item.currentStatus}"</p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs">
                  <span className="flex items-center gap-1 font-mono text-white">
                    <Clock className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    {item.totalHours}h
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[#F59E0B]">
                    <Flame className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    {item.streakDays}d
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.section>
      )}

      {/* Ranks Table */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="max-w-4xl mx-auto mt-8 rounded-3xl liquid-glass-card overflow-hidden shadow-2xl backdrop-blur-2xl"
      >
        <div className="px-6 py-3 border-b border-white/10 grid grid-cols-12 text-[11px] uppercase tracking-wider text-slate-400 font-qurova font-semibold">
          <span className="col-span-1 text-center">Rank</span>
          <span className="col-span-6 sm:col-span-5">Scholar</span>
          <span className="hidden sm:block sm:col-span-3">Focus Domain</span>
          <span className="col-span-3 text-right">Deep Hours</span>
          <span className="col-span-2 text-right hidden sm:block">Streak</span>
        </div>

        {effectiveUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-qurova italic">
            Connecting to sanctuary database... Log your first focus session to appear here!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {effectiveUsers.map((soul) => (
              <div
                key={soul.username || soul.rank}
                className={`px-6 py-3.5 grid grid-cols-12 items-center text-sm transition-colors ${
                  soul.isCurrentUser
                    ? 'bg-white/[0.08] ring-1 ring-white/15'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="col-span-1 font-mono text-center text-xs text-[#0EA5E9] font-semibold">
                  #{soul.rank}
                </div>

                <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                  <AvatarIcon id={soul.avatarId} className="w-8 h-8 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-white text-xs sm:text-sm truncate flex items-center gap-1.5 font-qurova">
                      <span>{soul.name}</span>
                      {soul.isCurrentUser && (
                        <span className="text-[10px] text-[#0EA5E9] font-mono">(You)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">@{soul.username}</div>
                  </div>
                </div>

                <div className="hidden sm:block sm:col-span-3 text-xs text-slate-300 truncate pr-2 italic font-qurova">
                  {soul.currentStatus}
                </div>

                <div className="col-span-3 text-right font-mono text-xs sm:text-sm text-white font-medium">
                  {soul.totalHours} hrs
                </div>

                <div className="col-span-2 text-right hidden sm:flex items-center justify-end gap-1 font-mono text-xs text-[#F59E0B]">
                  <Flame className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{soul.streakDays}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </main>
  );
};
