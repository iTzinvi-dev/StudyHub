import React, { useState, useEffect } from 'react';
import { AvatarIcon } from '../utils/avatars';
import { AvatarId, UserProfile } from '../types';
import { Trophy, Flame, Clock } from 'lucide-react';
import { subscribeLeaderboard, auth } from '../lib/firebase';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLeaderboard((realUsers) => {
      setLeaderboard(realUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Effective list: If Firestore has real users, use them; if empty, include current user
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
    <main className="flex-1 p-6 sm:p-10 overflow-y-auto select-none bg-[#1A1A00]/95 text-[#FFFFCC]">
      <header className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FFD700]">
          <Trophy className="w-4 h-4 text-[#FFD700]" />
          <span>Global Sanctuaries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#FFFFCC] mt-1">Focus Luminaries</h1>
        <p className="text-sm text-[#E6E6B8]/75 mt-1">
          users ranking are strictly verified by real-time deep work hours
        </p>
      </header>

      {/* Top 3 Podium Highlights */}
      {effectiveUsers.length > 0 && (
        <section className="max-w-4xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {effectiveUsers.slice(0, 3).map((item) => {
            const podiumBorder =
              item.rank === 1
                ? 'border-[#FFD700] bg-[#2A2A05] shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                : item.rank === 2
                ? 'border-[#E6E6B8]/60 bg-[#242403]'
                : 'border-[#CD7F32]/60 bg-[#212102]';

            return (
              <div
                key={item.username || item.rank}
                className={`p-5 rounded-2xl border flex flex-col items-center text-center relative ${podiumBorder}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-serif text-xs font-bold mb-3 ${
                    item.rank === 1
                      ? 'bg-[#FFD700] text-[#1A1A00]'
                      : item.rank === 2
                      ? 'bg-[#E6E6B8] text-[#1A1A00]'
                      : 'bg-[#CD7F32] text-[#FFFFCC]'
                  }`}
                >
                  #{item.rank}
                </div>

                <AvatarIcon id={item.avatarId} className="w-14 h-14" />
                <h3 className="font-serif text-lg text-[#FFFFCC] mt-2 truncate w-full">{item.name}</h3>
                <p className="text-xs text-[#FFD700] font-mono">@{item.username}</p>
                <p className="text-[11px] text-[#E6E6B8]/70 mt-1 line-clamp-1 italic">"{item.currentStatus}"</p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#FFFFCC]/10 text-xs">
                  <span className="flex items-center gap-1 font-mono text-[#FFFFCC]">
                    <Clock className="w-3.5 h-3.5 text-[#FFD700]" />
                    {item.totalHours}h
                  </span>
                  <span className="flex items-center gap-1 font-mono text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {item.streakDays}d
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Ranks Table */}
      <section className="max-w-4xl mx-auto mt-8 rounded-2xl bg-[#2A2A05]/60 border border-[#FFD700]/25 overflow-hidden shadow-xl">
        <div className="px-6 py-3 border-b border-[#FFFFCC]/10 grid grid-cols-12 text-[11px] uppercase tracking-wider text-[#E6E6B8]/60 font-semibold">
          <span className="col-span-1 text-center">Rank</span>
          <span className="col-span-6 sm:col-span-5">Scholar</span>
          <span className="hidden sm:block sm:col-span-3">Focus Domain</span>
          <span className="col-span-3 text-right">Deep Hours</span>
          <span className="col-span-2 text-right hidden sm:block">Streak</span>
        </div>

        {effectiveUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#E6E6B8]/60 font-serif italic">
            Connecting to sanctuary database... Log your first focus session to appear here!
          </div>
        ) : (
          <div className="divide-y divide-[#FFFFCC]/5">
            {effectiveUsers.map((soul) => (
              <div
                key={soul.username || soul.rank}
                className={`px-6 py-3.5 grid grid-cols-12 items-center text-sm transition-colors ${
                  soul.isCurrentUser
                    ? 'bg-[#333308] border-l-4 border-l-[#FFD700]'
                    : 'hover:bg-[#2A2A05]/80'
                }`}
              >
                <div className="col-span-1 font-mono text-center text-xs text-[#FFD700] font-semibold">
                  #{soul.rank}
                </div>

                <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                  <AvatarIcon id={soul.avatarId} className="w-8 h-8 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-[#FFFFCC] text-xs sm:text-sm truncate flex items-center gap-1.5">
                      <span>{soul.name}</span>
                      {soul.isCurrentUser && (
                        <span className="text-[10px] text-[#FFD700] font-normal">(You)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#E6E6B8]/50 font-mono truncate">@{soul.username}</div>
                  </div>
                </div>

                <div className="hidden sm:block sm:col-span-3 text-xs text-[#E6E6B8]/75 truncate pr-2 italic font-serif">
                  {soul.currentStatus}
                </div>

                <div className="col-span-3 text-right font-mono text-xs sm:text-sm text-[#FFD700] font-medium">
                  {soul.totalHours} hrs
                </div>

                <div className="col-span-2 text-right hidden sm:flex items-center justify-end gap-1 font-mono text-xs text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{soul.streakDays}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
