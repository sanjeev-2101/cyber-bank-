// Web Audio API Synthesizer for Cyber Theme Sound Effects
// Generates audio dynamically in the browser - zero external assets needed!

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (isMuted) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const toggleMute = (): boolean => {
  isMuted = !isMuted;
  if (isMuted && audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  return isMuted;
};

export const getMuteState = (): boolean => {
  return isMuted;
};

// 1. Futuristic Digital UI Click Sound
export const playClickSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

// 2. High-Priority Threat Alert Warbling Alarm Sound
let alarmInterval: any = null;
export const playAlarmSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // If already playing, don't overlap
  if (alarmInterval) return;

  let osc1: OscillatorNode | null = ctx.createOscillator();
  let osc2: OscillatorNode | null = ctx.createOscillator();
  let gain: GainNode | null = ctx.createGain();

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.type = 'sawtooth';
  osc2.type = 'triangle';

  gain.gain.setValueAtTime(0.12, ctx.currentTime);

  let high = true;
  alarmInterval = setInterval(() => {
    if (!osc1 || !osc2 || !gain || isMuted) {
      stopAlarmSound();
      return;
    }
    const freq1 = high ? 650 : 450;
    const freq2 = high ? 653 : 453;
    osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
    osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
    high = !high;
  }, 180);

  osc1.start();
  osc2.start();

  // Automatically fade and stop alarm after 3 seconds
  setTimeout(() => {
    stopAlarmSound();
  }, 3000);

  function stopAlarmSound() {
    if (alarmInterval) {
      clearInterval(alarmInterval);
      alarmInterval = null;
    }
    try {
      if (gain) {
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      }
      setTimeout(() => {
        if (osc1) osc1.stop();
        if (osc2) osc2.stop();
        osc1 = null;
        osc2 = null;
        gain = null;
      }, 350);
    } catch (e) {
      // Ignore if context closed
    }
  }
};

// 3. Cyber Action Success / Access Restored Chime
export const playSuccessSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (Cyber Arpeggio)
  
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    gain.gain.setValueAtTime(0.1, now + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.2);

    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.25);
  });
};

// 4. Lattice Cryptography Encryption Simulation Sweep
export const playQuantumSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(100, now);
  filter.frequency.exponentialRampToValueAtTime(2000, now + 0.8);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  osc.start(now);
  osc.stop(now + 0.9);
};
