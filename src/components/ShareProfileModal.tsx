import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AvatarIcon } from '../utils/avatars';
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

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-2xl bg-[#1A1A00] border border-[#FFD700]/30 shadow-2xl text-[#FFFFCC]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#FFFFCC]/60 hover:text-[#FFFFCC] hover:bg-[#2A2A05]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-[#FFD700] uppercase tracking-wider mb-2">
          <Share2 className="w-4 h-4" />
          <span>Public Focus Passport</span>
        </div>

        {/* Passport Card Preview */}
        <div className="p-5 rounded-xl bg-[#2A2A05]/80 border border-[#FFD700]/30 mt-3 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="relative">
              <AvatarIcon id={user.avatarId} className="w-16 h-16" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1A1A00]" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-[#FFFFCC]">{user.name}</h3>
              <p className="text-xs text-[#FFD700] font-mono">@{user.username}</p>
              <p className="text-xs text-[#E6E6B8]/75 mt-1 line-clamp-1 italic">"{user.status}"</p>
            </div>
          </div>

          <p className="text-xs text-[#E6E6B8]/70 mt-3 leading-relaxed border-t border-[#FFFFCC]/10 pt-3">
            {user.bio || 'Immersed in deep intellectual craftsmanship.'}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#FFFFCC]/10 text-center">
            <div className="p-2 rounded-lg bg-[#1A1A00]/70 border border-[#FFFFCC]/10">
              <div className="flex items-center justify-center gap-1 text-[#FFD700] text-sm font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{user.streak}</span>
              </div>
              <div className="text-[10px] text-[#E6E6B8]/60 uppercase tracking-wider mt-0.5">Day Streak</div>
            </div>

            <div className="p-2 rounded-lg bg-[#1A1A00]/70 border border-[#FFFFCC]/10">
              <div className="flex items-center justify-center gap-1 text-[#FFFFCC] text-sm font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>{user.totalFocusHours}h</span>
              </div>
              <div className="text-[10px] text-[#E6E6B8]/60 uppercase tracking-wider mt-0.5">Total Focus</div>
            </div>

            <div className="p-2 rounded-lg bg-[#1A1A00]/70 border border-[#FFFFCC]/10">
              <div className="flex items-center justify-center gap-1 text-[#FFFFCC] text-sm font-semibold">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.freezeTickets}</span>
              </div>
              <div className="text-[10px] text-[#E6E6B8]/60 uppercase tracking-wider mt-0.5">Freeze Tix</div>
            </div>
          </div>
        </div>

        {/* Copy share link */}
        <div className="mt-5 space-y-2">
          <label className="text-xs text-[#E6E6B8]/80 font-medium">Shareable Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={profileUrl}
              className="flex-1 px-3 py-2 rounded-lg bg-[#2A2A05] border border-[#FFD700]/30 text-xs font-mono text-[#FFFFCC] select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-lg bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-semibold text-xs flex items-center gap-1.5 transition-colors"
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
