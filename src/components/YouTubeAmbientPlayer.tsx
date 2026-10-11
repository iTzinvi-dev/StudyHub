import React, { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { SoundscapeTrack } from '../types';

interface YouTubeAmbientPlayerProps {
  activeTrack: SoundscapeTrack;
  isPlaying: boolean;
  volume: number; // 0 to 1
  isMuted: boolean;
  onReady?: () => void;
  onError?: (err: unknown) => void;
}

export const YouTubeAmbientPlayer: React.FC<YouTubeAmbientPlayerProps> = ({
  activeTrack,
  isPlaying,
  volume,
  isMuted,
  onReady,
  onError
}) => {
  const playerRef = useRef<any>(null);
  const Player = ReactPlayer as any;

  // Tab visibility tracking: Turns off audio when user switches tabs or exits the web app
  const [isTabVisible, setIsTabVisible] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(typeof document !== 'undefined' ? !document.hidden : true);
    };
    const handleExit = () => {
      setIsTabVisible(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleExit);
    window.addEventListener('beforeunload', handleExit);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleExit);
      window.removeEventListener('beforeunload', handleExit);
    };
  }, []);

  // The track currently loaded in the underlying YouTube player
  const [currentTrack, setCurrentTrack] = useState<SoundscapeTrack>(activeTrack);
  // Fade factor from 1.0 (full volume) down to 0.0 (silent dip) during soundscape transitions
  const [fadeFactor, setFadeFactor] = useState<number>(1);

  // Keep references to current prop values for safe asynchronous intervals
  const targetTrackRef = useRef<SoundscapeTrack>(activeTrack);
  targetTrackRef.current = activeTrack;

  const currentTrackRef = useRef<SoundscapeTrack>(currentTrack);
  currentTrackRef.current = currentTrack;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const animationTimerRef = useRef<any>(null);

  // Cross-fade dip and restore effect whenever activeTrack changes
  useEffect(() => {
    // If active track is the same as currently loaded track, nothing to change
    if (activeTrack.id === currentTrackRef.current.id && activeTrack.youtubeUrl === currentTrackRef.current.youtubeUrl) {
      return;
    }

    // If player is paused, muted, tab is hidden, or volume is zero, switch immediately
    if (!isPlayingRef.current || !isTabVisible || isMutedRef.current || volumeRef.current <= 0.01) {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      setCurrentTrack(activeTrack);
      setFadeFactor(1);
      return;
    }

    // Clear any existing animation
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    // Step 1: Gentle Dip - fade volume down smoothly over 350ms
    const fadeOutDuration = 350;
    const intervalMs = 25;
    const fadeOutSteps = Math.max(1, Math.floor(fadeOutDuration / intervalMs));
    let step = 0;
    const startFactor = fadeFactor;

    animationTimerRef.current = setInterval(() => {
      step++;
      const progress = Math.min(1, step / fadeOutSteps);
      const factor = startFactor * (0.5 + 0.5 * Math.cos(Math.PI * progress));
      setFadeFactor(Math.max(0, factor));

      if (progress >= 1) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
        setFadeFactor(0);

        // Step 2: Swap the track at the bottom of the dip
        const nextTrack = targetTrackRef.current;
        setCurrentTrack(nextTrack);

        // Step 3: Gentle Restore - fade volume back up over 450ms after a brief buffer
        setTimeout(() => {
          let inStep = 0;
          const fadeInDuration = 450;
          const fadeInSteps = Math.max(1, Math.floor(fadeInDuration / intervalMs));

          animationTimerRef.current = setInterval(() => {
            inStep++;
            const inProgress = Math.min(1, inStep / fadeInSteps);
            const restoredFactor = 0.5 - 0.5 * Math.cos(Math.PI * inProgress);
            setFadeFactor(Math.min(1, restoredFactor));

            if (inProgress >= 1) {
              clearInterval(animationTimerRef.current);
              animationTimerRef.current = null;
              setFadeFactor(1);
            }
          }, intervalMs);
        }, 120);
      }
    }, intervalMs);

    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [activeTrack.id, activeTrack.youtubeUrl, isTabVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, []);

  // Compute final effective volume and mute state based on user settings AND tab visibility
  const targetVol = isMuted ? 0 : volume;
  const effectivePlaying = isPlaying && isTabVisible;
  const effectiveVolume = isTabVisible ? Math.max(0, Math.min(1, targetVol * fadeFactor)) : 0;
  const effectiveMuted = isMuted || !isTabVisible || fadeFactor === 0;

  // The wrapper is completely hidden off-screen (0px width and height, pointer-events-none, aria-hidden)
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: -9999,
        left: -9999,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: -9999
      }}
    >
      <Player
        ref={playerRef}
        url={currentTrack.youtubeUrl}
        src={currentTrack.youtubeUrl}
        playing={effectivePlaying}
        loop={true}
        volume={effectiveVolume}
        muted={effectiveMuted}
        width="0px"
        height="0px"
        playsinline={true}
        onReady={onReady}
        onError={onError}
        config={{
          youtube: {
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            rel: 0
          }
        }}
      />
    </div>
  );
};
