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

/** m1 — Wake up: alarm clock ringing (brrring-brrring!) */
function playWakeUp(ac: AudioContext) {
  // Two rings with rapid tremolo (hammer hitting bell)
  [0, 0.3].forEach((delay) => {
    const t = ac.currentTime + delay;
    const dur = 0.25;
    // Bell fundamental
    const osc1 = ac.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 1050;
    // Tremolo LFO — rapid amplitude wobble = ringing character
    const lfo = ac.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 20;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    // Main envelope
    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.14, t + 0.005);
    g1.gain.setValueAtTime(0.14, t + dur * 0.6);
    g1.gain.exponentialRampToValueAtTime(0.001, t + dur);
    lfoGain.connect(g1.gain);
    osc1.connect(g1); g1.connect(ac.destination);
    osc1.start(t); osc1.stop(t + dur);
    lfo.start(t); lfo.stop(t + dur);
    // Inharmonic overtone (bell character — non-integer ratio)
    const osc2 = ac.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 2730; // ~2.6x fundamental
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.05, t + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.7);
    osc2.connect(g2); g2.connect(ac.destination);
    osc2.start(t); osc2.stop(t + dur);
    // Strike transient — metallic ping
    const osc3 = ac.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 4200;
    const g3 = ac.createGain();
    g3.gain.setValueAtTime(0, t);
    g3.gain.linearRampToValueAtTime(0.04, t + 0.001);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc3.connect(g3); g3.connect(ac.destination);
    osc3.start(t); osc3.stop(t + 0.06);
  });
}

/** m2 — Bathroom: toilet flush (rushing water swoosh downward) */
function playBathroom(ac: AudioContext) {
  const t = ac.currentTime;
  // Handle click
  const click = createNoiseSource(ac, 0.03);
  const clickHp = ac.createBiquadFilter();
  clickHp.type = 'highpass';
  clickHp.frequency.value = 5000;
  const clickG = ac.createGain();
  clickG.gain.setValueAtTime(0, t);
  clickG.gain.linearRampToValueAtTime(0.1, t + 0.002);
  clickG.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  click.connect(clickHp); clickHp.connect(clickG); clickG.connect(ac.destination);
  click.start(t); click.stop(t + 0.03);
  // Main flush whoosh — noise sweeping from high to low
  const noise = createNoiseSource(ac, 0.6);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(3000, t + 0.04);
  bp.frequency.exponentialRampToValueAtTime(200, t + 0.55);
  bp.Q.value = 0.5;
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t + 0.04);
  g1.gain.linearRampToValueAtTime(0.14, t + 0.1);
  g1.gain.setValueAtTime(0.14, t + 0.2);
  g1.gain.linearRampToValueAtTime(0.08, t + 0.4);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  noise.connect(bp); bp.connect(g1); g1.connect(ac.destination);
  noise.start(t + 0.04); noise.stop(t + 0.65);
  // Low rumble for body
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, t + 0.05);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.55);
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t + 0.05);
  g2.gain.linearRampToValueAtTime(0.1, t + 0.1);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(g2); g2.connect(ac.destination);
  osc.start(t + 0.05); osc.stop(t + 0.55);
}

/** m3 — Get dressed: zipper (ascending buzzy sweep) */
function playGetDressed(ac: AudioContext) {
  const t = ac.currentTime;
  // Sawtooth sweep upward = buzzy "zzzzip!"
  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(2500, t + 0.3);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(800, t);
  bp.frequency.exponentialRampToValueAtTime(5000, t + 0.3);
  bp.Q.value = 1;
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.08, t + 0.01);
  g1.gain.setValueAtTime(0.08, t + 0.2);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
  osc.connect(bp); bp.connect(g1); g1.connect(ac.destination);
  osc.start(t); osc.stop(t + 0.32);
  // High-frequency noise texture on top
  const noise = createNoiseSource(ac, 0.3);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(3000, t);
  hp.frequency.exponentialRampToValueAtTime(8000, t + 0.3);
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.05, t + 0.02);
  g2.gain.setValueAtTime(0.05, t + 0.2);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  noise.connect(hp); hp.connect(g2); g2.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.3);
}

/** m4 — Breakfast: crunching cereal (rapid crackly pops) */
function playBreakfast(ac: AudioContext) {
  const t = ac.currentTime;
  // 6 distinct crunches with crackle + body
  const gaps = [0, 0.065, 0.12, 0.19, 0.25, 0.3];
  gaps.forEach((d, i) => {
    // Crackle pop — short highpass noise burst
    const noise = createNoiseSource(ac, 0.04);
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3000 + (i % 3) * 800;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0, t + d);
    gn.gain.linearRampToValueAtTime(0.12, t + d + 0.001);
    gn.gain.exponentialRampToValueAtTime(0.001, t + d + 0.035);
    noise.connect(hp); hp.connect(gn); gn.connect(ac.destination);
    noise.start(t + d); noise.stop(t + d + 0.04);
    // Jaw thud — low square click for body
    const osc = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 250 + (i % 2) * 80;
    const go = ac.createGain();
    go.gain.setValueAtTime(0, t + d);
    go.gain.linearRampToValueAtTime(0.06, t + d + 0.001);
    go.gain.exponentialRampToValueAtTime(0.001, t + d + 0.025);
    osc.connect(go); go.connect(ac.destination);
    osc.start(t + d); osc.stop(t + d + 0.03);
  });
}

/** m5 — Shoes: two footstep thuds on hard floor */
function playShoes(ac: AudioContext) {
  // Left foot, then right foot (slightly lighter)
  [{ delay: 0, vol: 0.2 }, { delay: 0.18, vol: 0.16 }].forEach(({ delay, vol }) => {
    const t = ac.currentTime + delay;
    // Impact — sine dropping fast
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(vol, t + 0.003);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g1); g1.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.12);
    // Sole slap — noise transient
    const noise = createNoiseSource(ac, 0.04);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2500;
    bp.Q.value = 0.8;
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(vol * 0.4, t + 0.001);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    noise.connect(bp); bp.connect(g2); g2.connect(ac.destination);
    noise.start(t); noise.stop(t + 0.04);
    // Floor resonance
    const osc2 = ac.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = 120;
    const g3 = ac.createGain();
    g3.gain.setValueAtTime(0, t);
    g3.gain.linearRampToValueAtTime(vol * 0.3, t + 0.005);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc2.connect(g3); g3.connect(ac.destination);
    osc2.start(t); osc2.stop(t + 0.08);
  });
}

/** m6 — Water bottle: glug-glug-glug into a bottle */
function playWaterBottle(ac: AudioContext) {
  const t = ac.currentTime;
  // Core wobbling tone — strong LFO modulating pitch = "glug" character
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, t);
  osc.frequency.linearRampToValueAtTime(350, t + 0.45);
  const lfo = ac.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 7; // Glug rate
  const lfoGain = ac.createGain();
  lfoGain.gain.value = 120; // Deep wobble
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.1, t + 0.03);
  g1.gain.setValueAtTime(0.1, t + 0.3);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  osc.connect(g1); g1.connect(ac.destination);
  osc.start(t); osc.stop(t + 0.5);
  lfo.start(t); lfo.stop(t + 0.5);
  // Bubbly water noise underneath
  const noise = createNoiseSource(ac, 0.45);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(600, t);
  bp.frequency.exponentialRampToValueAtTime(300, t + 0.4);
  bp.Q.value = 3;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.05, t + 0.05);
  g2.gain.setValueAtTime(0.05, t + 0.3);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  noise.connect(bp); bp.connect(g2); g2.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.45);
}

/** m7 — Leave calmly: door closing (thunk + latch click) */
function playLeaveCalmly(ac: AudioContext) {
  const t = ac.currentTime;
  // Heavy door impact
  const osc1 = ac.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(120, t);
  osc1.frequency.exponentialRampToValueAtTime(35, t + 0.15);
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.22, t + 0.003);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc1.connect(g1); g1.connect(ac.destination);
  osc1.start(t); osc1.stop(t + 0.2);
  // Wood panel resonance
  const osc2 = ac.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 200;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.08, t + 0.004);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc2.connect(g2); g2.connect(ac.destination);
  osc2.start(t); osc2.stop(t + 0.12);
  // Latch snap — sharp click after impact
  const click = createNoiseSource(ac, 0.025);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 5000;
  const g3 = ac.createGain();
  g3.gain.setValueAtTime(0, t + 0.08);
  g3.gain.linearRampToValueAtTime(0.12, t + 0.082);
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  click.connect(hp); hp.connect(g3); g3.connect(ac.destination);
  click.start(t + 0.08); click.stop(t + 0.11);
  // Body noise thump
  const thump = createNoiseSource(ac, 0.06);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 500;
  const g4 = ac.createGain();
  g4.gain.setValueAtTime(0, t);
  g4.gain.linearRampToValueAtTime(0.1, t + 0.002);
  g4.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  thump.connect(lp); lp.connect(g4); g4.connect(ac.destination);
  thump.start(t); thump.stop(t + 0.06);
}

/** a1 — Lunchbox to sink: metallic clink (bright ringing ping) */
function playLunchbox(ac: AudioContext) {
  const t = ac.currentTime;
  // Strike noise transient
  const noise = createNoiseSource(ac, 0.02);
  const nhp = ac.createBiquadFilter();
  nhp.type = 'bandpass';
  nhp.frequency.value = 6000;
  nhp.Q.value = 1;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.1, t + 0.001);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
  noise.connect(nhp); nhp.connect(ng); ng.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.02);
  // Primary clink tone — bright and short
  const osc1 = ac.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 2800;
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.13, t + 0.001);
  g1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc1.connect(g1); g1.connect(ac.destination);
  osc1.start(t); osc1.stop(t + 0.35);
  // Inharmonic overtone — metallic shimmer
  const osc2 = ac.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 4500; // non-integer ratio to fundamental
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.06, t + 0.001);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc2.connect(g2); g2.connect(ac.destination);
  osc2.start(t); osc2.stop(t + 0.2);
  // Second clink partial
  const osc3 = ac.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.value = 1800;
  const g3 = ac.createGain();
  g3.gain.setValueAtTime(0, t);
  g3.gain.linearRampToValueAtTime(0.07, t + 0.002);
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  osc3.connect(g3); g3.connect(ac.destination);
  osc3.start(t); osc3.stop(t + 0.25);
}

/** a2 — Shoes to closet: soft thud on wood shelf */
function playShoesToCloset(ac: AudioContext) {
  const t = ac.currentTime;
  // Soft impact
  const osc1 = ac.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(130, t);
  osc1.frequency.exponentialRampToValueAtTime(55, t + 0.1);
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.14, t + 0.004);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc1.connect(g1); g1.connect(ac.destination);
  osc1.start(t); osc1.stop(t + 0.2);
  // Woody resonance — gives it the "shelf" character
  const osc2 = ac.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 280;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.06, t + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc2.connect(g2); g2.connect(ac.destination);
  osc2.start(t); osc2.stop(t + 0.1);
  // Muffled padding noise
  const noise = createNoiseSource(ac, 0.06);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 600;
  const g3 = ac.createGain();
  g3.gain.setValueAtTime(0, t);
  g3.gain.linearRampToValueAtTime(0.07, t + 0.002);
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  noise.connect(lp); lp.connect(g3); g3.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.06);
}

/** a3 — Hebrew homework: pencil writing on paper (scratchy strokes) */
function playHomework(ac: AudioContext) {
  const t = ac.currentTime;
  // 5 pencil strokes — alternating long/short like writing
  const strokes = [
    { off: 0, dur: 0.08, freq: 3500 },
    { off: 0.1, dur: 0.06, freq: 4000 },
    { off: 0.18, dur: 0.1, freq: 3200 },
    { off: 0.3, dur: 0.05, freq: 4500 },
    { off: 0.37, dur: 0.07, freq: 3800 },
  ];
  strokes.forEach(({ off, dur, freq }) => {
    // Scratchy bandpass noise
    const noise = createNoiseSource(ac, dur);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = 4;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, t + off);
    gain.gain.linearRampToValueAtTime(0.09, t + off + 0.004);
    gain.gain.setValueAtTime(0.07, t + off + dur * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + off + dur);
    noise.connect(bp); bp.connect(gain); gain.connect(ac.destination);
    noise.start(t + off); noise.stop(t + off + dur);
    // Faint tonal scratch underneath
    const osc = ac.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq * 0.3;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000;
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t + off);
    g2.gain.linearRampToValueAtTime(0.02, t + off + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.001, t + off + dur * 0.8);
    osc.connect(lp); lp.connect(g2); g2.connect(ac.destination);
    osc.start(t + off); osc.stop(t + off + dur);
  });
}

/** e1 — Tidy playroom: toy blocks cascading into a pile */
function playTidyPlayroom(ac: AudioContext) {
  const t = ac.currentTime;
  // 7 wooden clonks — accelerating, descending pitch, like blocks tumbling
  const delays = [0, 0.08, 0.14, 0.19, 0.23, 0.26, 0.28];
  const freqs = [900, 780, 660, 540, 440, 360, 300];
  delays.forEach((d, i) => {
    // Wooden "clonk" — triangle wave with fast pitch drop
    const osc = ac.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freqs[i], t + d);
    osc.frequency.exponentialRampToValueAtTime(freqs[i] * 0.5, t + d + 0.05);
    const g = ac.createGain();
    const vol = 0.12 - i * 0.008;
    g.gain.setValueAtTime(0, t + d);
    g.gain.linearRampToValueAtTime(vol, t + d + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.06);
    osc.connect(g); g.connect(ac.destination);
    osc.start(t + d); osc.stop(t + d + 0.07);
    // Click on impact
    const noise = createNoiseSource(ac, 0.012);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2500 + i * 300;
    bp.Q.value = 1;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0, t + d);
    gn.gain.linearRampToValueAtTime(0.05, t + d + 0.001);
    gn.gain.exponentialRampToValueAtTime(0.001, t + d + 0.01);
    noise.connect(bp); bp.connect(gn); gn.connect(ac.destination);
    noise.start(t + d); noise.stop(t + d + 0.012);
  });
}

/** e2 — Shower: water spraying (sustained shimmering noise) */
function playShower(ac: AudioContext) {
  const t = ac.currentTime;
  // Main water spray body
  const noise1 = createNoiseSource(ac, 0.6);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(3500, t);
  bp.frequency.linearRampToValueAtTime(2800, t + 0.5);
  bp.Q.value = 0.5;
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.12, t + 0.06);
  g1.gain.setValueAtTime(0.12, t + 0.35);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  noise1.connect(bp); bp.connect(g1); g1.connect(ac.destination);
  noise1.start(t); noise1.stop(t + 0.6);
  // Sparkle layer — high frequency droplets
  const noise2 = createNoiseSource(ac, 0.55);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7000;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(0.04, t + 0.1);
  g2.gain.setValueAtTime(0.04, t + 0.3);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  noise2.connect(hp); hp.connect(g2); g2.connect(ac.destination);
  noise2.start(t); noise2.stop(t + 0.55);
  // Shimmer modulation — LFO on a mid tone for "patter" feel
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 2000;
  const lfo = ac.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 12;
  const lfoG = ac.createGain();
  lfoG.gain.value = 0.02;
  lfo.connect(lfoG);
  const g3 = ac.createGain();
  g3.gain.setValueAtTime(0, t);
  g3.gain.linearRampToValueAtTime(0.03, t + 0.08);
  g3.gain.setValueAtTime(0.03, t + 0.3);
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  lfoG.connect(g3.gain);
  osc.connect(g3); g3.connect(ac.destination);
  osc.start(t); osc.stop(t + 0.55);
  lfo.start(t); lfo.stop(t + 0.55);
}

/** e3 — Brush teeth: fast rhythmic brushing (chicka-chicka-chicka) */
function playBrushTeeth(ac: AudioContext) {
  const t = ac.currentTime;
  // 10 rapid brush strokes — alternating back & forth
  for (let i = 0; i < 10; i++) {
    const off = i * 0.04;
    // Noise scrub — alternating filter center = back/forth character
    const noise = createNoiseSource(ac, 0.032);
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = i % 2 === 0 ? 4000 : 5500;
    bp.Q.value = 2.5;
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0, t + off);
    gn.gain.linearRampToValueAtTime(0.09, t + off + 0.002);
    gn.gain.linearRampToValueAtTime(0.06, t + off + 0.015);
    gn.gain.exponentialRampToValueAtTime(0.001, t + off + 0.03);
    noise.connect(bp); bp.connect(gn); gn.connect(ac.destination);
    noise.start(t + off); noise.stop(t + off + 0.032);
  }
  // Subtle tonal bed underneath for warmth
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 300;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.02, t + 0.02);
  g.gain.setValueAtTime(0.02, t + 0.3);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
  osc.connect(g); g.connect(ac.destination);
  osc.start(t); osc.stop(t + 0.42);
}

/** e4 — Bedtime story: page turning (soft breathy whoosh) */
function playBedtimeStory(ac: AudioContext) {
  const t = ac.currentTime;
  // Main whoosh — lowpass filtered noise with fast arc
  const noise = createNoiseSource(ac, 0.35);
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1500, t);
  lp.frequency.linearRampToValueAtTime(4000, t + 0.1);
  lp.frequency.exponentialRampToValueAtTime(1000, t + 0.35);
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(0.1, t + 0.07);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  noise.connect(lp); lp.connect(g1); g1.connect(ac.destination);
  noise.start(t); noise.stop(t + 0.35);
  // Soft air puff
  const noise2 = createNoiseSource(ac, 0.2);
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 800;
  bp.Q.value = 0.5;
  const g2 = ac.createGain();
  g2.gain.setValueAtTime(0, t + 0.03);
  g2.gain.linearRampToValueAtTime(0.05, t + 0.08);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  noise2.connect(bp); bp.connect(g2); g2.connect(ac.destination);
  noise2.start(t + 0.03); noise2.stop(t + 0.25);
}

/** e5 — Sleep in own bed: music box (3 gentle descending bell-plinks) */
function playSleepInBed(ac: AudioContext) {
  const t = ac.currentTime;
  // C6 → A5 → F5: sweet descending music box melody
  const notes = [1046.5, 880.0, 698.5];
  notes.forEach((freq, i) => {
    const start = t + i * 0.18;
    // Music box tine — pure sine with sharp attack
    const osc1 = ac.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;
    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0, start);
    g1.gain.linearRampToValueAtTime(0.12, start + 0.002);
    g1.gain.exponentialRampToValueAtTime(0.02, start + 0.1);
    g1.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    osc1.connect(g1); g1.connect(ac.destination);
    osc1.start(start); osc1.stop(start + 0.25);
    // Metallic shimmer — inharmonic overtone gives music-box quality
    const osc2 = ac.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 3.2; // Non-integer = metallic
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, start);
    g2.gain.linearRampToValueAtTime(0.03, start + 0.001);
    g2.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
    osc2.connect(g2); g2.connect(ac.destination);
    osc2.start(start); osc2.stop(start + 0.08);
    // Soft octave above for sparkle
    const osc3 = ac.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 2;
    const g3 = ac.createGain();
    g3.gain.setValueAtTime(0, start);
    g3.gain.linearRampToValueAtTime(0.04, start + 0.002);
    g3.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
    osc3.connect(g3); g3.connect(ac.destination);
    osc3.start(start); osc3.stop(start + 0.12);
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
