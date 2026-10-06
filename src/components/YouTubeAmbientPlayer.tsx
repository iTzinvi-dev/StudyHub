import React, { useRef } from 'react';
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

  // Note: react-player supports loop, volume (0-1), playing, muted
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
        url={activeTrack.youtubeUrl}
        src={activeTrack.youtubeUrl}
        playing={isPlaying}
        loop={true}
        volume={isMuted ? 0 : volume}
        muted={isMuted}
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
