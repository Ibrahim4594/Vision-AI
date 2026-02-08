// Simple synth for UI sounds to improve accessibility without external assets

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx && typeof window !== 'undefined') {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0, pan: number = 0) => {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  // Stereo Panner for spatial audio
  // Fallback for browsers that might not support createStereoPanner (older Safari)
  let panner: StereoPannerNode | null = null;
  if (audioCtx.createStereoPanner) {
    panner = audioCtx.createStereoPanner();
    panner.pan.setValueAtTime(pan, audioCtx.currentTime + startTime);
  }

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
  
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + duration);

  osc.connect(gain);
  
  if (panner) {
      gain.connect(panner);
      panner.connect(audioCtx.destination);
  } else {
      gain.connect(audioCtx.destination);
  }

  osc.start(audioCtx.currentTime + startTime);
  osc.stop(audioCtx.currentTime + startTime + duration);
};

export const playSound = {
  click: () => playTone(800, 'sine', 0.1),
  
  modeSwitch: () => {
    playTone(400, 'sine', 0.1);
    playTone(600, 'sine', 0.1, 0.1);
  },

  shutter: () => {
    // Simulated shutter sound with noise/tone
    playTone(200, 'square', 0.05);
    playTone(150, 'square', 0.05, 0.05);
  },

  success: () => {
    playTone(500, 'sine', 0.1);
    playTone(1000, 'sine', 0.2, 0.1);
  },

  error: () => {
    playTone(200, 'sawtooth', 0.2);
    playTone(150, 'sawtooth', 0.4, 0.2);
  },

  hazard: (pan: number = 0) => {
    playTone(150, 'sawtooth', 0.1, 0, pan);
    playTone(150, 'sawtooth', 0.1, 0.15, pan);
    playTone(150, 'sawtooth', 0.1, 0.3, pan);
  },

  ping: (pan: number = 0) => {
    playTone(880, 'sine', 0.05, 0, pan);
    playTone(880, 'sine', 0.05, 0.1, pan);
  }
};