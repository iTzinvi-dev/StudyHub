class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  private rainGain: GainNode | null = null;
  private fireGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private fireTimer: number | null = null;
  private chordTimer: number | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public init() {
    if (this.isInitialized) return;
    this.initContext();
    if (!this.ctx) return;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
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
  }

  private setupRainNode() {
    if (!this.ctx || !this.rainGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation for soothing rain
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
  }

  private setupFireRumble() {
    if (!this.ctx || !this.fireGain) return;
    // Low frequency fireplace rumble
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
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

    // Crackle & pop generator
    this.scheduleFireCrackles();
  }

  private scheduleFireCrackles = () => {
    if (!this.ctx || !this.fireGain) return;
    const delay = Math.random() * 280 + 80;
    this.fireTimer = window.setTimeout(() => {
      this.playSingleCrackle();
      this.scheduleFireCrackles();
    }, delay);
  };

  private playSingleCrackle() {
    if (!this.ctx || !this.fireGain || this.fireGain.gain.value <= 0.01) return;
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
  }

  public setVolumes(volumes: { rain: number; fire: number; music: number; master: number }) {
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(volumes.master, t, 0.05);
    if (this.rainGain) this.rainGain.gain.setTargetAtTime(volumes.rain, t, 0.05);
    if (this.fireGain) this.fireGain.gain.setTargetAtTime(volumes.fire, t, 0.05);
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(volumes.music, t, 0.05);

    if (volumes.music > 0.02 && !this.chordTimer) {
      this.startLofiEngine();
    } else if (volumes.music <= 0.02 && this.chordTimer) {
      window.clearInterval(this.chordTimer);
      this.chordTimer = null;
    }
  }

  private startLofiEngine() {
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];
    let chordIndex = 0;

    const playChord = () => {
      if (!this.ctx || !this.musicGain || this.musicGain.gain.value <= 0.01) return;
      const notes = chords[chordIndex % chords.length];
      chordIndex++;

      notes.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
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
      });
    };

    playChord();
    this.chordTimer = window.setInterval(playChord, 5200);
  }

  public destroy() {
    if (this.fireTimer) window.clearTimeout(this.fireTimer);
    if (this.chordTimer) window.clearInterval(this.chordTimer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

export const soundEngine = new AmbientAudioEngine();
