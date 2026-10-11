import React, { useState, useEffect } from 'react';
import { UserProfile, AvatarId } from '../types';
import { AVATAR_LIST, AvatarIcon } from '../utils/avatars';
import { Check, ShieldCheck, Sparkles, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onSave: (user: UserProfile) => void;
  onGoogleSignIn?: () => Promise<any>;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  currentUser,
  onSave,
  onGoogleSignIn,
  onClose
}) => {
  const [step, setStep] = useState<'login' | 'setup'>('login');
  const [name, setName] = useState(currentUser.name || 'Sourav Nath');
  const [bio, setBio] = useState(currentUser.bio || 'Architecting high-scale distributed systems and deep learning algorithms.');
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>(currentUser.gender || 'male');
  const [avatarId, setAvatarId] = useState<AvatarId>(currentUser.avatarId || 'boy1');
  const [status, setStatus] = useState(currentUser.status || 'Deep Focus');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (currentUser.name && currentUser.name !== 'Focus Scholar') {
      setName(currentUser.name);
    }
    if (currentUser.bio) {
      setBio(currentUser.bio);
    }
    if (currentUser.status) {
      setStatus(currentUser.status);
    }
    if (currentUser.avatarId) {
      setAvatarId(currentUser.avatarId);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    if (onGoogleSignIn) {
      setSigningIn(true);
      try {
        const profile = await onGoogleSignIn();
        if (profile) {
          setName(profile.name);
          setBio(profile.bio);
          setStatus(profile.status);
          setAvatarId(profile.avatarId);
        }
        setStep('setup');
      } catch (err) {
        console.warn('Google sign-in completed or popup closed:', err);
        setStep('setup');
      } finally {
        setSigningIn(false);
      }
    } else {
      setStep('setup');
    }
  };

  const handleFinishSetup = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim() || 'Focus Soul',
      username: name.trim().toLowerCase().replace(/\s+/g, '_') || 'focus_soul',
      bio: bio.trim(),
      gender,
      avatarId,
      status: status.trim() || 'Studying'
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent select-none overflow-hidden">
      {/* 1. Full-screen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4"
      />

      {/* 2. Bottom Blur Overlay (no gradient darkening, only blur masked to bottom) */}
      <div
        className="fixed inset-0 w-full h-full backdrop-blur-xl pointer-events-none z-[1]"
        style={{
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 45%)'
        }}
      />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md p-8 sm:p-9 rounded-3xl liquid-glass-card border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl text-white font-qurova">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {step === 'login' ? (
          <div className="text-center py-2">
            <div className="text-[11px] uppercase tracking-widest text-[#0EA5E9] font-mono mb-1 font-semibold">
              Focus Sanctuary
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-normal font-serif">
              StudyHub
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 italic">
              A serene sanctuary for deep cognitive focus.
            </p>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl liquid-glass-btn text-white font-semibold text-sm transition-all shadow-lg hover:scale-[1.01] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{signingIn ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setStep('setup')}
                  className="text-xs text-slate-300 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white cursor-pointer font-qurova"
                >
                  Explore as Guest Scholar
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed px-4 font-qurova">
                By continuing, you join our global community of focused minds.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFinishSetup} className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#0EA5E9] uppercase tracking-wider font-semibold font-qurova">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalize Your Persona</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mt-1">Select Curated Avatar</h2>
              <p className="text-xs text-slate-300 font-qurova">
                Choose your focus companion:
              </p>
            </div>

            {/* 4 Curated Avatars */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {AVATAR_LIST.map((av) => {
                const isSelected = avatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setAvatarId(av.id);
                      setGender(av.gender);
                    }}
                    className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#162032] border-[#0EA5E9] ring-2 ring-[#0EA5E9] shadow-[0_0_12px_rgba(14,165,233,0.3)]'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <AvatarIcon id={av.id} className="w-12 h-12" />
                    <span className="text-[11px] text-white mt-1.5 font-medium truncate max-w-full font-qurova">
                      {av.name}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#0EA5E9] text-white p-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form Fields */}
            <div className="space-y-3 pt-2 font-qurova">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                  placeholder="e.g. Sourav"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Focus Status (Shown in Rooms)
                </label>
                <input
                  type="text"
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                  placeholder="e.g. Solving LeetCode, System Design..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9] resize-none"
                  placeholder="What are your goals or principles?"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl liquid-glass-primary text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Enter The Sanctuary</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
