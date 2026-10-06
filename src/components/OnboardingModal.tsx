import React, { useState, useEffect } from 'react';
import { UserProfile, AvatarId } from '../types';
import { AVATAR_LIST, AvatarIcon } from '../utils/avatars';
import { StudyTableBackground } from './StudyTableBackground';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onSave: (user: UserProfile) => void;
  onGoogleSignIn?: () => Promise<any>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  currentUser,
  onSave,
  onGoogleSignIn
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070D08] select-none">
      {/* Background video component for landing / sign in page */}
      <StudyTableBackground darkness="normal" />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md p-8 sm:p-9 rounded-3xl bg-[#1A1A00]/85 border border-[#FFD700]/30 shadow-2xl backdrop-blur-md text-[#FFFFCC]">
        {step === 'login' ? (
          <div className="text-center py-2">
            <div className="text-[11px] uppercase tracking-widest text-[#FFD700] font-mono mb-1">
              Focus Sanctuary
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#FFFFCC] tracking-normal font-normal">
              StudyHub
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#E6E6B8]/80 font-serif italic">
              A human-crafted sanctuary for deep cognitive focus.
            </p>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-medium text-sm transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-[1.01]"
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
                <span>Continue with Google</span>
              </button>

              <p className="text-[11px] text-[#E6E6B8]/60 leading-relaxed px-4">
                By continuing, you join our global community of focused minds.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFinishSetup} className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#FFD700] uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalize Your Persona</span>
              </div>
              <h2 className="text-2xl font-serif text-[#FFFFCC] mt-1">Select Curated Avatar</h2>
              <p className="text-xs text-[#E6E6B8]/70">
                Custom uploads are disabled to preserve the serene aesthetic. Choose your companion:
              </p>
            </div>

            {/* 4 Curated Avatars (2 boys, 2 girls) */}
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
                    className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#2A2A05] border-[#FFD700] ring-2 ring-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                        : 'bg-[#1E1E02] border-[#FFFFCC]/15 hover:border-[#FFD700]/50'
                    }`}
                  >
                    <AvatarIcon id={av.id} className="w-12 h-12" />
                    <span className="text-[11px] text-[#FFFFCC] mt-1.5 font-medium truncate max-w-full">
                      {av.name}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 bg-[#FFD700] text-[#1A1A00] p-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#E6E6B8]/80 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#2A2A05] border border-[#FFD700]/30 text-sm text-[#FFFFCC] focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                  placeholder="e.g. Sourav"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E6E6B8]/80 mb-1">
                  Current Focus Status (Shown in Rooms)
                </label>
                <input
                  type="text"
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#2A2A05] border border-[#FFD700]/30 text-sm text-[#FFFFCC] focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                  placeholder="e.g. Solving LeetCode, System Design..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E6E6B8]/80 mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#2A2A05] border border-[#FFD700]/30 text-sm text-[#FFFFCC] focus:outline-none focus:ring-1 focus:ring-[#FFD700] resize-none"
                  placeholder="What are your goals or principles?"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-semibold text-sm transition-all shadow-md hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#1A1A00]" />
                <span>Enter The Sanctuary</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
