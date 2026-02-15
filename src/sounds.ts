const MUTE_KEY = 'super-kid-app-muted';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === 'true';
}

export function setMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
}

/** Cheerful ascending ding — task completed */
export function playDing() {
  if (isMuted()) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.12);
  gain.gain.setValueAtTime(0.15, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.3);
}

/** Soft descending boop — task undone */
export function playBoop() {
  if (isMuted()) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(250, ac.currentTime + 0.15);
  gain.gain.setValueAtTime(0.1, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.2);
}

/** Triumphant 3-note fanfare — routine complete */
export function playFanfare() {
  if (isMuted()) return;
  const ac = getCtx();
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = ac.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Coin-like cha-ching — bonus stars awarded */
export function playChaChing() {
  if (isMuted()) return;
  const ac = getCtx();
  [0, 0.08].forEach((delay) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'square';
    osc.frequency.value = delay === 0 ? 1800 : 2400;
    const t = ac.currentTime + delay;
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  });
}

/** Soft click — tab switch */
export function playClick() {
  if (isMuted()) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.06, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.05);
}

// ── Task-specific sound effects ──────────────────────────────────

/** Helper: create white noise AudioBufferSourceNode */
function createNoiseSource(ac: AudioContext, duration: number): AudioBufferSourceNode {
  const buf = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  return src;
}

/** m1 — Wake up: alarm bell ring-ring */
function playWakeUp(ac: AudioContext) {
  // Two bell strikes with metallic harmonics
  [0, 0.18].forEach((delay) => {
    const t = ac.currentTime + delay;
    // Fundamental bell tone
    const osc1 = ac.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 1200;
    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.12, t + 0.005);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc1.connect(g1); g1.connect(ac.destination);
    osc1.start(t); osc1.stop(t + 0.15);
    // Higher harmonic for metallic ring
    const osc2 = ac.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 3100;
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.06, t + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc2.connect(g2); g2.connect(ac.destination);
    osc2.start(t); osc2.stop(t + 0.12);
    // Inharmonic overtone for bell character
    const osc3 = ac.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 2340;
    const g3 = ac.createGain();
    g3.gain.setValueAtTime(0, t);
    g3.gain.linearRampToValueAtTime(0.04, t + 0.003);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc3.connect(g3); g3.connect(ac.destination);
    osc3.start(t); osc3.stop(t + 0.1);
  });
}

/** m2 — Bathroom: toilet flush whoosh */
function playBathroom(ac: AudioContext) {
  const t = ac.currentTime;
  // White noise through sweeping bandpass for flush whoosh
  const noise = createNoiseSource(ac, 0.45);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(2000, t);
  bp.frequency.exponentialRampToValueAtTime(300, t + 0.4);
  bp.Q.value = 0.8;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
  gain.gain.setValueAtTime(0.12, t + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  noise.connect(bp); bp.connect(gain); gain.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.45);
  // Low rumble underneath
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.4);
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.08, t + 0.05);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(g2); g2.connect(ac.destination);
  osc.start(t); osc.stop(t + 0.4);
}

/** m3 — Get dressed: fabric rustling */
function playGetDressed(ac: AudioContext) {
  const t = ac.currentTime;
  // Two overlapping filtered noise bursts for rustling texture
  [0, 0.12].forEach((delay) => {
    const noise = createNoiseSource(ac, 0.2);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3000 + delay * 5000, t + delay);
    bp.frequency.exponentialRampToValueAtTime(1500, t + delay + 0.18);
    bp.Q.value = 1.5;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, t + delay);
    gain.gain.linearRampToValueAtTime(0.1, t + delay + 0.01);
    gain.gain.linearRampToValueAtTime(0.06, t + delay + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);
    noise.connect(bp); bp.connect(gain); gain.connect(ac.destination);
    noise.start(t + delay); noise.stop(t + delay + 0.2);
  });
}

/** m4 — Breakfast: crunching/chewing rhythm */
function playBreakfast(ac: AudioContext) {
  const t = ac.currentTime;
  // 5 crunchy clicks with noise + pitched component
  for (let i = 0; i < 5; i++) {
    const offset = i * 0.07;
    // Noise crunch
    const noise = createNoiseSource(ac, 0.05);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2000 + Math.random() * 2000;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0, t + offset);
    gn.gain.linearRampToValueAtTime(0.1, t + offset + 0.003);
    gn.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);
    noise.connect(hp); hp.connect(gn); gn.connect(ac.destination);
    noise.start(t + offset); noise.stop(t + offset + 0.05);
    // Square click for crunchiness
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 300 + i * 40;
    const go = ac.createGain();
    go.gain.setValueAtTime(0, t + offset);
    go.gain.linearRampToValueAtTime(0.05, t + offset + 0.002);
    go.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.03);
    osc.connect(go); go.connect(ac.destination);
    osc.start(t + offset); osc.stop(t + offset + 0.04);
  }
}

/** m5 — Shoes: two quick tap-taps on floor */
function playShoes(ac: AudioContext) {
  [0, 0.13].forEach((delay) => {
    const t = ac.currentTime + delay;
    // Impact thud (low)
    const osc1 = ac.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, t);
    osc1.frequency.exponentialRampToValueAtTime(60, t + 0.08);
    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.2, t + 0.003);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc1.connect(g1); g1.connect(ac.destination);
    osc1.start(t); osc1.stop(t + 0.1);
    // Tap click (high transient)
    const noise = createNoiseSource(ac, 0.03);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3000;
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.08, t + 0.001);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    noise.connect(hp); hp.connect(g2); g2.connect(ac.destination);
    noise.start(t); noise.stop(t + 0.03);
  });
}

/** m6 — Water bottle: liquid pouring with bubbles */
function playWaterBottle(ac: AudioContext) {
  const t = ac.currentTime;
  // Continuous pour (filtered noise descending)
  const noise = createNoiseSource(ac, 0.4);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(800, t);
  bp.frequency.exponentialRampToValueAtTime(400, t + 0.35);
  bp.Q.value = 2;
  const gn = ac.createGain();
  gn.gain.setValueAtTime(0, t);
  gn.gain.linearRampToValueAtTime(0.08, t + 0.03);
  gn.gain.setValueAtTime(0.08, t + 0.25);
  gn.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  noise.connect(bp); bp.connect(gn); gn.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.4);
  // Bubble pops (short sine blips at random-ish intervals)
  [0.05, 0.12, 0.18, 0.23, 0.28].forEach((d) => {
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500 + d * 400, t + d);
    osc.frequency.exponentialRampToValueAtTime(300, t + d + 0.04);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t + d);
    g.gain.linearRampToValueAtTime(0.06, t + d + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.04);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t + d); osc.stop(t + d + 0.05);
  });
}

/** m7 — Leave calmly: door click shut */
function playLeaveCalmly(ac: AudioContext) {
  const t = ac.currentTime;
  // Heavy door thud
  const osc1 = ac.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(100, t);
  osc1.frequency.exponentialRampToValueAtTime(40, t + 0.12);
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.2, t + 0.004);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  osc1.connect(g1); g1.connect(ac.destination);
  osc1.start(t); osc1.stop(t + 0.15);
  // Latch click (sharp high transient)
  const noise = createNoiseSource(ac, 0.04);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 4000;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t + 0.01);
  g2.gain.linearRampToValueAtTime(0.1, t + 0.012);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  noise.connect(hp); hp.connect(g2); g2.connect(ac.destination);
  noise.start(t + 0.01); noise.stop(t + 0.05);
  // Resonant wood body
  const osc2 = ac.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 180;
  const g3 = ac.createGain();
  g3.gain.setValueAtTime(0, t);
  g3.gain.linearRampToValueAtTime(0.08, t + 0.005);
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc2.connect(g3); g3.connect(ac.destination);
  osc2.start(t); osc2.stop(t + 0.1);
}

/** a1 — Lunchbox to sink: metallic dish clank */
function playLunchbox(ac: AudioContext) {
  const t = ac.currentTime;
  // Primary metallic ping
  const osc1 = ac.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 2200;
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.12, t + 0.002);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc1.connect(g1); g1.connect(ac.destination);
  osc1.start(t); osc1.stop(t + 0.3);
  // Inharmonic overtone for metallic quality
  const osc2 = ac.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 3700;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.06, t + 0.002);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc2.connect(g2); g2.connect(ac.destination);
  osc2.start(t); osc2.stop(t + 0.2);
  // Impact noise transient
  const noise = createNoiseSource(ac, 0.03);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 5000;
  bp.Q.value = 1;
  const g3 = ac.createGain();
  g3.gain.setValueAtTime(0, t);
  g3.gain.linearRampToValueAtTime(0.08, t + 0.001);
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  noise.connect(bp); bp.connect(g3); g3.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.03);
}

/** a2 — Shoes to closet: soft thud */
function playShoesToCloset(ac: AudioContext) {
  const t = ac.currentTime;
  // Soft padded impact
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(gain); gain.connect(ac.destination);
  osc.start(t); osc.stop(t + 0.2);
  // Muffled noise for soft landing
  const noise = createNoiseSource(ac, 0.08);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 800;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.06, t + 0.003);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  noise.connect(lp); lp.connect(g2); g2.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.08);
}

/** a3 — Hebrew homework: pencil scribbling */
function playHomework(ac: AudioContext) {
  const t = ac.currentTime;
  // 4 scratchy bursts with varying pitch for realism
  const offsets = [0, 0.08, 0.17, 0.26];
  const durations = [0.06, 0.07, 0.05, 0.06];
  offsets.forEach((d, i) => {
    const noise = createNoiseSource(ac, durations[i]);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3000 + i * 500;
    bp.Q.value = 3;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, t + d);
    gain.gain.linearRampToValueAtTime(0.09, t + d + 0.005);
    gain.gain.linearRampToValueAtTime(0.06, t + d + durations[i] * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + d + durations[i]);
    noise.connect(bp); bp.connect(gain); gain.connect(ac.destination);
    noise.start(t + d); noise.stop(t + d + durations[i]);
  });
}

/** e1 — Tidy playroom: blocks tumbling cascade */
function playTidyPlayroom(ac: AudioContext) {
  const t = ac.currentTime;
  // 6 tumbling impacts with accelerating rhythm, descending pitch
  const delays = [0, 0.07, 0.13, 0.18, 0.22, 0.25];
  const freqs = [800, 680, 560, 440, 350, 280];
  delays.forEach((d, i) => {
    // Wooden knock
    const osc = ac.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqs[i], t + d);
    osc.frequency.exponentialRampToValueAtTime(freqs[i] * 0.6, t + d + 0.04);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t + d);
    g.gain.linearRampToValueAtTime(0.1 - i * 0.01, t + d + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.05);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t + d); osc.stop(t + d + 0.06);
    // Click transient
    const noise = createNoiseSource(ac, 0.015);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3000;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0, t + d);
    gn.gain.linearRampToValueAtTime(0.04, t + d + 0.001);
    gn.gain.exponentialRampToValueAtTime(0.001, t + d + 0.01);
    noise.connect(hp); hp.connect(gn); gn.connect(ac.destination);
    noise.start(t + d); noise.stop(t + d + 0.015);
  });
}

/** e2 — Shower: water spray (sustained filtered noise fade) */
function playShower(ac: AudioContext) {
  const t = ac.currentTime;
  // Main spray — bandpass noise with shimmer
  const noise = createNoiseSource(ac, 0.45);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(4000, t);
  bp.frequency.linearRampToValueAtTime(2500, t + 0.4);
  bp.Q.value = 0.6;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
  gain.gain.setValueAtTime(0.12, t + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  noise.connect(bp); bp.connect(gain); gain.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.45);
  // Higher spray layer for sparkle
  const noise2 = createNoiseSource(ac, 0.4);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6000;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.04, t + 0.08);
  g2.gain.setValueAtTime(0.04, t + 0.15);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  noise2.connect(hp); hp.connect(g2); g2.connect(ac.destination);
  noise2.start(t); noise2.stop(t + 0.4);
}

/** e3 — Brush teeth: fast rhythmic brushing tick-tick-tick */
function playBrushTeeth(ac: AudioContext) {
  const t = ac.currentTime;
  // 8 rapid brush strokes, alternating character, accelerating
  for (let i = 0; i < 8; i++) {
    const offset = i * 0.045;
    // Noise scrub
    const noise = createNoiseSource(ac, 0.035);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = i % 2 === 0 ? 3500 : 4500;
    bp.Q.value = 2;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0, t + offset);
    gn.gain.linearRampToValueAtTime(0.08, t + offset + 0.003);
    gn.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.03);
    noise.connect(bp); bp.connect(gn); gn.connect(ac.destination);
    noise.start(t + offset); noise.stop(t + offset + 0.035);
    // Tonal tick
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.value = i % 2 === 0 ? 900 : 1100;
    const go = ac.createGain();
    go.gain.setValueAtTime(0, t + offset);
    go.gain.linearRampToValueAtTime(0.03, t + offset + 0.002);
    go.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.02);
    osc.connect(go); go.connect(ac.destination);
    osc.start(t + offset); osc.stop(t + offset + 0.025);
  }
}

/** e4 — Bedtime story: gentle page turn whoosh */
function playBedtimeStory(ac: AudioContext) {
  const t = ac.currentTime;
  // Soft filtered noise swoosh with asymmetric envelope
  const noise = createNoiseSource(ac, 0.3);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(2000, t);
  bp.frequency.exponentialRampToValueAtTime(4000, t + 0.1);
  bp.frequency.exponentialRampToValueAtTime(1500, t + 0.3);
  bp.Q.value = 0.8;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.09, t + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  noise.connect(bp); bp.connect(gain); gain.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.3);
  // Gentle fluttery rustle on top
  const noise2 = createNoiseSource(ac, 0.15);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 5000;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t + 0.02);
  g2.gain.linearRampToValueAtTime(0.03, t + 0.06);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  noise2.connect(hp); hp.connect(g2); g2.connect(ac.destination);
  noise2.start(t + 0.02); noise2.stop(t + 0.2);
}

/** e5 — Sleep in own bed: soft lullaby — 3 gentle descending notes */
function playSleepInBed(ac: AudioContext) {
  const t = ac.currentTime;
  // E4 → C4 → A3: gentle descending lullaby melody
  const notes = [329.63, 261.63, 220.00];
  notes.forEach((freq, i) => {
    const start = t + i * 0.14;
    // Soft sine tone
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
    osc.connect(gain); gain.connect(ac.destination);
    osc.start(start); osc.stop(start + 0.14);
    // Soft triangle harmonic for warmth
    const osc2 = ac.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, start);
    g2.gain.linearRampToValueAtTime(0.03, start + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
    osc2.connect(g2); g2.connect(ac.destination);
    osc2.start(start); osc2.stop(start + 0.12);
  });
}

/** Map of task IDs to their themed sound functions */
const TASK_SOUND_MAP: Record<string, (ac: AudioContext) => void> = {
  m1: playWakeUp, m2: playBathroom, m3: playGetDressed, m4: playBreakfast,
  m5: playShoes, m6: playWaterBottle, m7: playLeaveCalmly,
  a1: playLunchbox, a2: playShoesToCloset, a3: playHomework,
  e1: playTidyPlayroom, e2: playShower, e3: playBrushTeeth,
  e4: playBedtimeStory, e5: playSleepInBed,
};

/** Play a unique themed sound for the given task ID */
export function playTaskSound(taskId: string) {
  if (isMuted()) return;
  const fn = TASK_SOUND_MAP[taskId];
  if (fn) fn(getCtx());
}

/** Gentle pop — kid selected */
export function playPop() {
  if (isMuted()) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.06);
  gain.gain.setValueAtTime(0.12, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.1);
}
