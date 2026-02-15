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

/** m1 — Wake up: rooster crow — 3 ascending sine notes */
function playWakeUp(ac: AudioContext) {
  const freqs = [300, 500, 800];
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ac.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  });
}

/** m2 — Bathroom: water flush — 3 descending sine notes */
function playBathroom(ac: AudioContext) {
  const freqs = [800, 500, 300];
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ac.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  });
}

/** m3 — Get dressed: zipper slide — fast ascending sine sweep */
function playGetDressed(ac: AudioContext) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2000, ac.currentTime + 0.15);
  gain.gain.setValueAtTime(0.1, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.15);
}

/** m4 — Breakfast: crunching — 4 rapid square-wave clicks */
function playBreakfast(ac: AudioContext) {
  for (let i = 0; i < 4; i++) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'square';
    osc.frequency.value = 400;
    const t = ac.currentTime + i * 0.06;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }
}

/** m5 — Shoes & socks: two stomps — 2 low triangle thuds */
function playShoes(ac: AudioContext) {
  [0, 0.12].forEach((delay) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 100;
    const t = ac.currentTime + delay;
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  });
}

/** m6 — Water bottle: water pour — descending sine sweep with wobble */
function playWaterBottle(ac: AudioContext) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ac.currentTime + 0.3);
  lfo.type = 'sine';
  lfo.frequency.value = 18;
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  gain.gain.setValueAtTime(0.1, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ac.destination);
  lfo.start(ac.currentTime);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.3);
  lfo.stop(ac.currentTime + 0.3);
}

/** m7 — Leave calmly: door close — low thud + high click */
function playLeaveCalmly(ac: AudioContext) {
  // Thud
  const osc1 = ac.createOscillator();
  const gain1 = ac.createGain();
  osc1.type = 'sine';
  osc1.frequency.value = 80;
  gain1.gain.setValueAtTime(0.18, ac.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
  osc1.connect(gain1);
  gain1.connect(ac.destination);
  osc1.start(ac.currentTime);
  osc1.stop(ac.currentTime + 0.1);
  // Click
  const osc2 = ac.createOscillator();
  const gain2 = ac.createGain();
  osc2.type = 'sine';
  osc2.frequency.value = 1200;
  const t2 = ac.currentTime + 0.06;
  gain2.gain.setValueAtTime(0.08, t2);
  gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.05);
  osc2.connect(gain2);
  gain2.connect(ac.destination);
  osc2.start(t2);
  osc2.stop(t2 + 0.05);
}

/** a1 — Lunchbox to sink: dish clink — 2 high triangle tones */
function playLunchbox(ac: AudioContext) {
  [1500, 2000].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = ac.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  });
}

/** a2 — Shoes to closet: soft thump — single low sine */
function playShoesToCloset(ac: AudioContext) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = 120;
  gain.gain.setValueAtTime(0.08, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.15);
}

/** a3 — Hebrew homework: pencil scratch — 3 short filtered noise bursts */
function playHomework(ac: AudioContext) {
  for (let i = 0; i < 3; i++) {
    const noise = createNoiseSource(ac, 0.04);
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4000;
    filter.Q.value = 2;
    const gain = ac.createGain();
    const t = ac.currentTime + i * 0.06;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.04);
  }
}

/** e1 — Tidy playroom: blocks tumble — 4 descending sine tones */
function playTidyPlayroom(ac: AudioContext) {
  const freqs = [600, 500, 400, 300];
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ac.currentTime + i * 0.07;
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  });
}

/** e2 — Shower: rain sprinkle — bandpass-filtered noise */
function playShower(ac: AudioContext) {
  const noise = createNoiseSource(ac, 0.3);
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 1;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.08, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, ac.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  noise.start(ac.currentTime);
  noise.stop(ac.currentTime + 0.3);
}

/** e3 — Brush teeth: brushing rhythm — 6 rapid alternating tones */
function playBrushTeeth(ac: AudioContext) {
  for (let i = 0; i < 6; i++) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = i % 2 === 0 ? 800 : 1000;
    const t = ac.currentTime + i * 0.04;
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.03);
  }
}

/** e4 — Bedtime story: page turn — short noise swoosh with envelope */
function playBedtimeStory(ac: AudioContext) {
  const noise = createNoiseSource(ac, 0.2);
  const filter = ac.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.001, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, ac.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  noise.start(ac.currentTime);
  noise.stop(ac.currentTime + 0.2);
}

/** e5 — Sleep in own bed: lullaby note — gentle descending sine */
function playSleepInBed(ac: AudioContext) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ac.currentTime + 0.4);
  gain.gain.setValueAtTime(0.1, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.4);
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
