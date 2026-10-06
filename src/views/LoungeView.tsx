import React, { useState } from 'react';
import { UserProfile, Room, RoomMember, AudioVolumes, BackgroundSceneId } from '../types';
import { AvatarIcon } from '../utils/avatars';
import { StudyTableBackground } from '../components/StudyTableBackground';
import { BonfireBackground } from '../components/BonfireBackground';
import { AudioMixerBar } from '../components/AudioMixerBar';
import { MemberListDrawer } from '../components/MemberListDrawer';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { BorderBeam } from '../components/ui/BorderBeam';
import { AnimatedShinyText } from '../components/ui/AnimatedShinyText';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { NumberTicker } from '../components/ui/NumberTicker';
import {
  Plus,
  LogIn,
  Flame,
  Sparkles,
  Check,
  Copy,
  Eye,
  EyeOff,
  BookOpen,
  Clock,
  Compass,
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkle
} from 'lucide-react';

interface LoungeViewProps {
  user: UserProfile;
  isAfk: boolean;
  backgroundScene?: BackgroundSceneId;
  activeRoom: Room;
  members: RoomMember[];
  timerMinutes: number;
  timerSeconds: number;
  isRunning: boolean;
  phaseLabel: string;
  fourHourProgressPercent: number;
  audioVolumes: AudioVolumes;
  onAudioChange: (volumes: AudioVolumes) => void;
  onOpenPlanModal: () => void;
  onEnterZenMode: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onUpdateStatus: (newStatus: string) => void;
}

export const LoungeView: React.FC<LoungeViewProps> = ({
  user,
  isAfk,
  backgroundScene = 'study-desk',
  activeRoom,
  members,
  timerMinutes,
  timerSeconds,
  isRunning,
  phaseLabel,
  fourHourProgressPercent,
  audioVolumes,
  onAudioChange,
  onOpenPlanModal,
  onEnterZenMode,
  onCreateRoom,
  onJoinRoom,
  onUpdateStatus
}) => {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState(user.status);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSanctuaryView, setIsSanctuaryView] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusInput.trim()) {
      onUpdateStatus(statusInput.trim());
      setIsEditingStatus(false);
    }
  };

  // 4x7 Consistency Grid mockup (28 days)
  const gridCells = [
    [0, 1, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 1, 1]
  ];

  const formattedTime = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`;

  // Session progress calculation
  const totalPhaseSecs = Math.max(1, timerMinutes * 60 + timerSeconds);
  const sessionProgress = isRunning ? 0.35 : 0.85;

  return (
    <main className="relative flex-1 flex flex-col justify-between p-4 sm:p-7 overflow-hidden select-none">
      {backgroundScene === 'bonfire-hearth' ? (
        <div className={`absolute inset-0 transition-opacity duration-700 ${isSanctuaryView ? 'opacity-95' : 'opacity-85'}`}>
          <BonfireBackground />
        </div>
      ) : (
        <StudyTableBackground darkness={isSanctuaryView ? 'subtle' : 'normal'} />
      )}

      {/* Top Header Bar */}
      <header className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#FFD700] italic font-normal tracking-wide drop-shadow-md">
              {activeRoom.name}
            </h1>
            {activeRoom.isPrivate && (
              <button
                onClick={handleCopyRoomCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b14]/75 border border-[#FFD700]/30 text-xs text-[#FFFFCC] font-mono hover:bg-[#1e291e]/90 transition-colors backdrop-blur-md"
                title="Click to copy room code"
              >
                <span>{activeRoom.code}</span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#FFD700]" />}
              </button>
            )}
          </div>
          <button
            onClick={() => setIsMemberListOpen(true)}
            className="text-xs sm:text-sm text-[#E6E6B8]/75 hover:text-[#FFD700] mt-0.5 flex items-center gap-1.5 transition-colors cursor-pointer text-left group"
            title="Open Room Presence Member List"
          >
            <Compass className="w-3.5 h-3.5 text-[#FFD700]/80 group-hover:rotate-45 transition-transform" />
            <span>{members.length} {members.length === 1 ? 'Soul' : 'Souls'} Focusing Together</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sanctuary / Focus View Toggle: Gives clear, unobstructed view of study table and rainy window */}
          <button
            onClick={() => setIsSanctuaryView((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all shadow-md backdrop-blur-md ${
              isSanctuaryView
                ? 'bg-[#FFD700]/25 border-[#FFD700] text-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.35)]'
                : 'bg-[#141b14]/75 hover:bg-[#1e291e]/90 border-[#FFD700]/30 text-[#FFFFCC] hover:border-[#FFD700]'
            }`}
            title={isSanctuaryView ? 'Show study cards' : 'View full study table and rainy window'}
          >
            {isSanctuaryView ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="hidden sm:inline">Show Cards</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#FFD700]" />
                <span className="hidden sm:inline">View Sanctuary</span>
              </>
            )}
          </button>

          <button
            onClick={onCreateRoom}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141b14]/75 hover:bg-[#1e291e]/90 border border-[#FFD700]/30 text-[#FFFFCC] text-xs font-medium transition-all shadow-md hover:border-[#FFD700] backdrop-blur-md"
          >
            <Plus className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Create Room</span>
          </button>

          <button
            onClick={() => setJoinModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141b14]/75 hover:bg-[#1e291e]/90 border border-[#FFD700]/30 text-[#FFFFCC] text-xs font-medium transition-all shadow-md hover:border-[#FFD700] backdrop-blur-md"
          >
            <LogIn className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Join Room</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Grid (Left card, Center Master Timer, Right card) */}
      <section className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 my-4">
        {/* Left Card: Your Progress (21st.dev SpotlightCard + BorderBeam + NumberTicker) */}
        <SpotlightCard
          className={`lg:col-span-3 flex-col p-6 rounded-3xl bg-[#0c120c]/45 hover:bg-[#0c120c]/60 border border-[#FFD700]/20 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-500 relative ${
            isSanctuaryView ? 'opacity-0 pointer-events-none scale-95 hidden' : 'hidden lg:flex'
          }`}
        >
          <BorderBeam size={200} duration={16} delay={0} colorFrom="#FFD700" colorTo="transparent" />

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif text-[#FFD700] italic">Your Progress</h2>
            <TrendingUp className="w-4 h-4 text-[#FFD700]/70" />
          </div>

          <div className="flex items-baseline justify-between mt-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-[#FFFFCC]">
                  <NumberTicker value={user.streak} />
                </span>
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 inline ml-0.5 animate-pulse" />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#E6E6B8]/60 font-medium">Streak</span>
            </div>

            <div>
              <div className="font-serif text-3xl font-bold text-[#FFFFCC]">
                <NumberTicker value={user.totalFocusHours} />h
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#E6E6B8]/60 font-medium">Total Focus</span>
            </div>
          </div>

          {/* Consistency Grid */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#E6E6B8]/70 font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#FFD700]/80" />
                Consistency Grid
              </span>
              <span className="text-[#FFD700]/80 font-mono">28 Days</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-[#090e09]/65 border border-[#FFD700]/15">
              {gridCells.flatMap((row, rIdx) =>
                row.map((val, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    title={val ? '≥ 4h Focus achieved' : 'Light study day'}
                    className={`w-4 h-4 rounded-xs transition-all ${
                      val
                        ? 'bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.5)]'
                        : 'bg-[#1e291e]/50 hover:bg-[#283828]'
                    }`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Daily Goal (4h) Progress */}
          <div className="mt-6 pt-4 border-t border-[#FFFFCC]/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#E6E6B8]/80 font-medium flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#FFD700]" />
                Daily Goal (4h)
              </span>
              <span className="text-[#FFD700] font-semibold">{fourHourProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#141b14] overflow-hidden border border-[#FFD700]/20">
              <div
                className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFFFCC] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,215,0,0.4)]"
                style={{ width: `${Math.min(100, fourHourProgressPercent)}%` }}
              />
            </div>
          </div>
        </SpotlightCard>

        {/* Center: Master Floating Timer Core */}
        <div className={`flex flex-col items-center justify-center transition-all duration-500 ${
          isSanctuaryView ? 'col-span-12 my-auto' : 'col-span-1 lg:col-span-6'
        }`}>
          <div className="relative flex items-center justify-center">
            {/* Outer 4-Hour Completion Ring */}
            <svg className="w-80 h-80 sm:w-96 sm:h-96 transform -rotate-90 pointer-events-none drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="rgba(255, 255, 204, 0.08)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="#FFD700"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - fourHourProgressPercent / 100)}
                className="transition-all duration-700"
              />
            </svg>

            {/* Inner Active Session Ring */}
            <svg className="absolute w-64 h-64 sm:w-80 sm:h-80 transform -rotate-90 pointer-events-none" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="74"
                fill="none"
                stroke="rgba(255, 215, 0, 0.12)"
                strokeWidth="4"
              />
              <circle
                cx="100"
                cy="100"
                r="74"
                fill="none"
                stroke="#FFD700"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 74}
                strokeDashoffset={2 * Math.PI * 74 * (1 - sessionProgress)}
                className="transition-all duration-500 shadow-[0_0_15px_#FFD700]"
              />
            </svg>

            {/* Interactive Timer Core Button */}
            <div
              onClick={onOpenPlanModal}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpenPlanModal();
              }}
              className="group absolute cursor-pointer flex flex-col items-center justify-center p-6 rounded-full transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
              title="Click to review or modify session plan"
            >
              <AnimatedShinyText className="text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFD700]" />
                {phaseLabel}
              </AnimatedShinyText>

              <div className="font-serif text-6xl sm:text-7xl font-normal text-[#FFFFCC] tracking-tight my-2 drop-shadow-md group-hover:text-[#FFD700] transition-colors">
                {formattedTime}
              </div>

              {/* 21st.dev Shimmer Button */}
              <ShimmerButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEnterZenMode();
                }}
                shimmerColor="#FFD700"
                background="rgba(14, 22, 14, 0.9)"
                className="mt-2 py-2 px-6 rounded-full text-[#FFFFCC] font-semibold text-sm hover:text-white border border-[#FFD700]/40 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span>Approve Plan</span>
              </ShimmerButton>

              <span className="text-[10px] tracking-wider uppercase text-[#E6E6B8]/60 mt-2 font-medium flex items-center gap-1">
                Click To Adjust Plan
                <ChevronRight className="w-3 h-3 text-[#FFD700]/70" />
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: The Souls Member List (21st.dev SpotlightCard + BorderBeam) */}
        <SpotlightCard
          className={`lg:col-span-3 flex-col p-6 rounded-3xl bg-[#0c120c]/45 hover:bg-[#0c120c]/60 border border-[#FFD700]/20 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl max-h-[480px] transition-all duration-500 relative ${
            isSanctuaryView ? 'opacity-0 pointer-events-none scale-95 hidden' : 'hidden lg:flex'
          }`}
        >
          <BorderBeam size={220} duration={18} delay={6} colorFrom="#FFD700" colorTo="transparent" />

          <div className="flex items-center justify-between pb-3 border-b border-[#FFFFCC]/10">
            <h2 className="text-2xl font-serif text-[#FFD700] italic">The Souls</h2>
            <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#141b14] text-[#FFD700] font-mono border border-[#FFD700]/30">
              Lounge
            </span>
          </div>

          {/* Member items list */}
          <div className="space-y-3 mt-4 overflow-y-auto pr-1">
            {/* Current user row */}
            <div className="p-2.5 rounded-2xl bg-[#141b14]/85 border border-[#FFD700]/35 flex items-center gap-3">
              <div className="relative">
                <AvatarIcon id={user.avatarId} className="w-10 h-10" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c120c] ${
                    isAfk ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#FFFFCC] flex items-center gap-1">
                    You <span className="text-[10px] text-[#FFD700] font-normal">(Self)</span>
                  </span>
                  {isAfk && <span className="text-[10px] text-rose-400 font-bold uppercase">[AFK]</span>}
                </div>

                {isEditingStatus ? (
                  <form onSubmit={handleSaveStatus} className="mt-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full text-[11px] px-1.5 py-0.5 rounded bg-[#0c120c] border border-[#FFD700]/50 text-[#FFFFCC] focus:outline-none"
                      autoFocus
                    />
                    <button type="submit" className="text-[10px] px-1 bg-[#FFD700] text-[#1A1A00] rounded font-bold">
                      ✓
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className="text-[11px] text-[#E6E6B8]/80 truncate block hover:text-[#FFD700] text-left transition-colors"
                    title="Click to edit status"
                  >
                    [{user.status}]
                  </button>
                )}
              </div>
            </div>

            {/* Other peers */}
            {members.map((member) => (
              <div
                key={member.id}
                className="p-2 rounded-2xl bg-[#101710]/45 border border-[#FFFFCC]/10 flex items-center gap-3 hover:bg-[#141b14]/70 transition-colors"
              >
                <div className="relative">
                  <AvatarIcon id={member.avatarId} className="w-9 h-9" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0c120c] ${
                      member.isAfk ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#FFFFCC] truncate">{member.name}</span>
                    {member.isAfk ? (
                      <span className="text-[10px] text-rose-400 font-semibold">[AFK]</span>
                    ) : (
                      <span className="text-[10px] text-emerald-400/80">Studying</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#E6E6B8]/70 truncate italic">[{member.status}]</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#FFFFCC]/10 text-center">
            <span className="text-[10px] text-[#E6E6B8]/60 italic font-serif">
              No messy feed. Only presence.
            </span>
          </div>
        </SpotlightCard>
      </section>

      {/* Bottom Floating Local Audio Mixer Bar */}
      <footer className="relative z-20 flex justify-center pb-1">
        <AudioMixerBar volumes={audioVolumes} onChange={onAudioChange} />
      </footer>

      {/* Join Room Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0c120c]/90 border border-[#FFD700]/30 shadow-2xl text-[#FFFFCC] backdrop-blur-xl">
            <h3 className="text-2xl font-serif text-[#FFD700] italic">Join a Private Sanctum</h3>
            <p className="text-xs text-[#E6E6B8]/75 mt-1">
              Enter your peer's room invite code (e.g. FOCUS-9X2) to study together.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (joinCodeInput.trim()) {
                  onJoinRoom(joinCodeInput.trim().toUpperCase());
                  setJoinModalOpen(false);
                }
              }}
              className="mt-5 space-y-4"
            >
              <input
                type="text"
                required
                placeholder="FOCUS-9X2"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141b14] border border-[#FFD700]/40 text-center font-mono text-base tracking-widest text-[#FFFFCC] uppercase focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl border border-[#FFFFCC]/20 text-xs font-medium text-[#FFFFCC]/70 hover:bg-[#141b14]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-[#FFFFCC] hover:bg-[#FFD700] text-[#1A1A00] font-semibold text-xs transition-colors shadow-md"
                >
                  Enter Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Room Presence Sliding Drawer */}
      <MemberListDrawer
        users={members}
        currentRoomName={activeRoom.name}
        currentUser={user}
        isCurrentUserAfk={isAfk}
        onUpdateStatus={onUpdateStatus}
        isOpen={isMemberListOpen}
        onToggle={setIsMemberListOpen}
      />
    </main>
  );
};
