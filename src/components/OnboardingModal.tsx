import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, AvatarId } from '../types';
import { AVATAR_LIST, AvatarIcon } from '../utils/avatars';
import { Check, ShieldCheck, Sparkles, X, UserPlus, Flame } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onSave: (user: UserProfile) => void;
  onGoogleSignIn?: () => Promise<any>;
  onClose?: () => void;
  isFirstScreen?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  currentUser,
  onSave,
  onGoogleSignIn,
  onClose,
  isFirstScreen = false
}) => {
  const [step, setStep] = useState<'login' | 'setup'>('login');
  const [name, setName] = useState(currentUser.name || 'Scholar');
  const [bio, setBio] = useState(currentUser.bio || 'Deep cognitive focus and silent camaraderie.');
  const [gender, setGender] = useState<'male' | 'female' | 'non-binary'>(currentUser.gender || 'non-binary');
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
          setBio(profile.bio || 'Deep cognitive focus in the sanctuary.');
          setStatus(profile.status || 'Deep Focus');
          setAvatarId(profile.avatarId || 'boy1');
          onSave(profile);
          return;
        }
        setStep('setup');
      } catch (err) {
        console.warn('Google sign-in completed or window closed:', err);
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
    const cleanName = name.trim() || 'Focus Soul';
    const updated: UserProfile = {
      ...currentUser,
      name: cleanName,
      username: cleanName.toLowerCase().replace(/\s+/g, '_') || 'focus_soul',
      bio: bio.trim(),
      gender,
      avatarId,
      status: status.trim() || 'Deep Focus'
    };
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16] select-none overflow-hidden font-qurova">
      {/* 1. Instant Lightweight Ambient Background (Zero lag, pure CSS GPU accelerated) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(14,165,233,0.18)_0%,rgba(14,165,233,0.04)_45%,transparent_70%)] rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,rgba(245,158,11,0.02)_50%,transparent_70%)] rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-[#090D16]/80" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm sm:max-w-md p-7 sm:p-9 rounded-3xl bg-white/[0.06] border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white font-qurova"
      >
        {!isFirstScreen && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {step === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="text-center py-2"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] uppercase tracking-wider text-[#38BDF8] font-mono mb-2">
                <Flame className="w-3.5 h-3.5 text-[#0EA5E9]" />
                <span>Focus Sanctuary</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-handwritten-serif">
                StudyHub
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 font-handwritten-serif italic">
                A deliberate sanctuary for deep cognitive focus and silent camaraderie.
              </p>

              <div className="mt-7 space-y-3.5">
                {/* Primary Google Auth */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={signingIn}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-[#090D16] font-semibold text-sm transition-all shadow-lg hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
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
                  <span>{signingIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative px-3 bg-[#0E1524] text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                    or
                  </span>
                </div>

                {/* Secondary Create Scholar Persona */}
                <button
                  type="button"
                  onClick={() => setStep('setup')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-medium text-xs transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-[#38BDF8]" />
                  <span>Create Scholar Persona</span>
                </button>

                <p className="text-[11px] text-slate-400 leading-relaxed px-2 font-qurova pt-1">
                  Authenticate or personalize your persona to track routines and focus with peers in rooms.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="setup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleFinishSetup}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[#38BDF8] uppercase tracking-wider font-semibold font-qurova">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Set Up Your Account</span>
                </div>
                <h2 className="text-2xl font-semibold text-white mt-1 font-handwritten-serif">
                  Select Your Avatar
                </h2>
                <p className="text-xs text-slate-300 font-handwritten-serif italic">
                  Choose your sanctuary companion persona:
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
                          ? 'bg-[#0284C7]/25 border-[#38BDF8] ring-2 ring-[#38BDF8]/60 shadow-[0_0_16px_rgba(14,165,233,0.3)]'
                          : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <AvatarIcon id={av.id} className="w-11 h-11" />
                      <span className="text-[10px] text-white mt-1.5 font-medium truncate max-w-full font-qurova">
                        {av.name}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 bg-[#0EA5E9] text-white p-0.5 rounded-full shadow-md">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Form Fields */}
              <div className="space-y-3 pt-1 font-qurova">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Scholar Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                    placeholder="e.g. Sourav Nath"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Current Focus Task (Shown in Room)
                  </label>
                  <input
                    type="text"
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                    placeholder="e.g. Deep Focus, Math Problem Set..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Study Focus / Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#38BDF8] resize-none"
                    placeholder="What are you currently dedicating focus to?"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-1/3 py-3 rounded-xl border border-white/15 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] cursor-pointer transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] hover:brightness-110 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Enter Sanctuary →</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
