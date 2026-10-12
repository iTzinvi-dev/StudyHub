import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AvatarIcon } from '../utils/avatars';
import { copyTextToClipboard } from '../utils/storage';
import { X, Copy, Check, Share2, Flame, Clock, Award } from 'lucide-react';

interface ShareProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({ user, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const profileUrl = `${window.location.origin}/p/${user.username || 'sourav'}`;

  const handleCopy = async () => {
    await copyTextToClipboard(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#0B0F19]/95 border border-white/15 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#0EA5E9] uppercase tracking-wider mb-2 font-mono">
          <Share2 className="w-4 h-4 text-[#0EA5E9]" />
          <span>Public Focus Passport</span>
        </div>

        {/* Passport Card Preview */}
        <div className="p-5 rounded-2xl bg-[#121828]/90 border border-white/10 mt-3 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="relative">
              <AvatarIcon id={user.avatarId} className="w-16 h-16" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#090D16]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{user.name}</h3>
              <p className="text-xs text-[#0EA5E9] font-mono">@{user.username}</p>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1 italic font-qurova">"{user.status}"</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed border-t border-white/10 pt-3 font-qurova">
            {user.bio || 'Immersed in deep intellectual craftsmanship.'}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-center gap-1 text-[#F59E0B] text-sm font-semibold">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                <span>{user.streak}</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 font-mono">Day Streak</div>
            </div>

            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-center gap-1 text-white text-sm font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#0EA5E9]" />
                <span>{user.totalFocusHours}h</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 font-mono">Total Focus</div>
            </div>

            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center justify-center gap-1 text-white text-sm font-semibold">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.freezeTickets}</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 font-mono">Freeze Tix</div>
            </div>
          </div>
        </div>

        {/* Copy share link */}
        <div className="mt-5 space-y-2 font-qurova">
          <label className="text-xs text-slate-300 font-medium">Shareable Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={profileUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs font-mono text-white select-all focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-[#0EA5E9] hover:bg-[#38BDF8] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
