import { AudioVolumes } from '../types';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isUserGestureUnlocked = false;

  private rainGain: GainNode | null = null;
  private fireGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private fireTimer: number | null = null;
  private chordTimer: number | null = null;

  // Active state flags
  private isVisible: boolean = typeof document !== 'undefined' ? !document.hidden : true;
  private currentVolumes: AudioVolumes = { rain: 0.65, fire: 0.45, music: 0.3, master: 0.8 };

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // 1. Listen for Tab Switching and Window Visibility
      document.addEventListener('visibilitychange', this.handleVisibilityChange);

      // 2. Listen for Page Exit / Closing / Navigation
      window.addEventListener('pagehide', this.handlePageExit);
      window.addEventListener('beforeunload', this.handlePageExit);

      // 3. User gesture unlocker (resolves browser autoplay policy cleanly)
      const unlockAudio = () => {
        this.isUserGestureUnlocked = true;
        if (this.ctx && this.ctx.state === 'suspended' && this.isVisible) {
          this.ctx.resume().catch(() => {});
        }
        document.removeEventListener('pointerdown', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      };

      document.addEventListener('pointerdown', unlockAudio, { passive: true });
      document.addEventListener('keydown', unlockAudio, { passive: true });
      document.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  private handleVisibilityChange = () => {
    const visible = typeof document !== 'undefined' ? !document.hidden : true;
    this.setVisibility(visible);
  };

  private handlePageExit = () => {
    // When closing tab, refreshing, or navigating away, instantly mute and suspend
    this.setVisibility(false);
    if (this.ctx && this.ctx.state === 'running') {
      try {
        this.ctx.suspend();
      } catch {
        // ignore
      }
    }
  };

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && this.isUserGestureUnlocked && this.isVisible) {
      this.ctx.resume().catch(() => {});
    }
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.masterGain = this.ctx.createGain();
      // Start at 0 if hidden, or configured volume if visible
      const initialMaster = this.isVisible ? this.currentVolumes.master : 0;
      this.masterGain.gain.setValueAtTime(initialMaster, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Rain channel
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.rainGain.connect(this.masterGain);
      this.setupRainNode();

      // Fire channel
      this.fireGain = this.ctx.createGain();
      this.fireGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.fireGain.connect(this.masterGain);
      this.setupFireRumble();

      // Music channel
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Audio engine initialization notice:', err);
    }
  }

  private setupRainNode() {
    if (!this.ctx || !this.rainGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.rainGain);
      noise.start();
    } catch {
      // ignore
    }
  }

  private setupFireRumble() {
    if (!this.ctx || !this.fireGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.15;
      }

      const rumble = this.ctx.createBufferSource();
      rumble.buffer = buffer;
      rumble.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      rumble.connect(filter);
      filter.connect(this.fireGain);
      rumble.start();

      if (this.isVisible) {
        this.scheduleFireCrackles();
      }
    } catch {
      // ignore
    }
  }

  private scheduleFireCrackles = () => {
    if (!this.isVisible || !this.ctx || !this.fireGain) return;
    const delay = Math.random() * 280 + 80;
    this.fireTimer = window.setTimeout(() => {
      this.playSingleCrackle();
      if (this.isVisible) {
        this.scheduleFireCrackles();
      }
    }, delay);
  };

  private playSingleCrackle() {
    if (
      !this.isVisible ||
      !this.ctx ||
      !this.fireGain ||
      this.fireGain.gain.value <= 0.01 ||
      this.currentVolumes.fire <= 0.01 ||
      this.currentVolumes.master <= 0.01
    ) {
      return;
    }

    try {
      const osc = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();

      osc.type = Math.random() > 0.4 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(Math.random() * 1200 + 400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.04);

      crackGain.gain.setValueAtTime(Math.random() * 0.25 + 0.05, this.ctx.currentTime);
      crackGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(crackGain);
      crackGain.connect(this.fireGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  }

  /**
   * Set user volume preferences and apply them based on current visibility.
   */
  public setVolumes(volumes: AudioVolumes) {
    this.currentVolumes = { ...volumes };
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Only emit audible master volume if user is actively VISITING the web app
      const effectiveMaster = this.isVisible ? volumes.master : 0;

      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(effectiveMaster, t, 0.04);
      }
      if (this.rainGain) {
        this.rainGain.gain.setTargetAtTime(volumes.rain, t, 0.05);
      }
      if (this.fireGain) {
        this.fireGain.gain.setTargetAtTime(volumes.fire, t, 0.05);
      }
      if (this.musicGain) {
        this.musicGain.gain.setTargetAtTime(volumes.music, t, 0.05);
      }

      if (this.isVisible && volumes.music > 0.02 && !this.chordTimer) {
        this.startLofiEngine();
      } else if ((!this.isVisible || volumes.music <= 0.02) && this.chordTimer) {
        window.clearInterval(this.chordTimer);
        this.chordTimer = null;
      }

      if (this.isVisible && volumes.fire > 0.01 && !this.fireTimer) {
        this.scheduleFireCrackles();
      } else if ((!this.isVisible || volumes.fire <= 0.01) && this.fireTimer) {
        window.clearTimeout(this.fireTimer);
        this.fireTimer = null;
      }
    } catch {
      // ignore
    }
  }

  /**
   * Turn audio ON when user visits the web app, and OFF when user exits or switches tab.
   */
  public setVisibility(visible: boolean) {
    if (this.isVisible === visible) return;
    this.isVisible = visible;

    if (!visible) {
      // 1. Instantly mute master gain down to 0
      if (this.ctx && this.masterGain) {
        try {
          this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
        } catch {
          // ignore
        }
      }

      // 2. Halt all crackle timeouts and chord intervals to eliminate background sound & CPU
      if (this.fireTimer) {
        window.clearTimeout(this.fireTimer);
        this.fireTimer = null;
      }
      if (this.chordTimer) {
        window.clearInterval(this.chordTimer);
        this.chordTimer = null;
      }

      // 3. Suspend AudioContext
      if (this.ctx && this.ctx.state === 'running') {
        try {
          this.ctx.suspend().catch(() => {});
        } catch {
          // ignore
        }
      }
    } else {
      // Returning to the web app: Turn audio back on according to user's volume settings
      if (this.ctx) {
        if (this.ctx.state === 'suspended' && this.isUserGestureUnlocked) {
          try {
            this.ctx.resume().catch(() => {});
          } catch {
            // ignore
          }
        }

        if (this.masterGain) {
          try {
            this.masterGain.gain.setTargetAtTime(
              this.currentVolumes.master,
              this.ctx.currentTime,
              0.08
            );
          } catch {
            // ignore
          }
        }
      }

      // Resume generators if enabled in volumes
      if (this.currentVolumes.fire > 0.01 && !this.fireTimer) {
        this.scheduleFireCrackles();
      }
      if (this.currentVolumes.music > 0.02 && !this.chordTimer) {
        this.startLofiEngine();
      }
    }
  }

  private startLofiEngine() {
    if (!this.isVisible) return;

    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0], // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 349.23] // G7
    ];
    let chordIndex = 0;

    const playChord = () => {
      if (
        !this.isVisible ||
        !this.ctx ||
        !this.musicGain ||
        this.musicGain.gain.value <= 0.01 ||
        this.currentVolumes.music <= 0.01 ||
        this.currentVolumes.master <= 0.01
      ) {
        return;
      }

      const notes = chords[chordIndex % chords.length];
      chordIndex++;

      notes.forEach((freq) => {
        if (!this.ctx || !this.musicGain || !this.isVisible) return;
        try {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(650, this.ctx.currentTime);

          const now = this.ctx.currentTime;
          noteGain.gain.setValueAtTime(0.0001, now);
          noteGain.gain.linearRampToValueAtTime(0.04, now + 1.2);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + 5.0);
        } catch {
          // ignore
        }
      });
    };

    playChord();
    this.chordTimer = window.setInterval(playChord, 5200);
  }

  public destroy() {
    if (this.fireTimer) window.clearTimeout(this.fireTimer);
    if (this.chordTimer) window.clearInterval(this.chordTimer);
    if (this.ctx) {
      try {
        this.ctx.close().catch(() => {});
      } catch {
        // ignore
      }
      this.ctx = null;
    }
    this.isInitialized = false;

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('pagehide', this.handlePageExit);
      window.removeEventListener('beforeunload', this.handlePageExit);
    }
  }
}

export const soundEngine = new AmbientAudioEngine();
