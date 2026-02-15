import '@testing-library/jest-dom/vitest';

// Mock speechSynthesis
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: () => [],
    onvoiceschanged: null,
    paused: false,
    pending: false,
    speaking: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  },
  writable: true,
});

// Mock AudioContext
class MockOscillator {
  type = 'sine';
  frequency = {
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  disconnect = vi.fn();
}

class MockGainNode {
  gain = {
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockBiquadFilterNode {
  type = 'lowpass';
  frequency = { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() };
  Q = { value: 0 };
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockBufferSourceNode {
  buffer = null;
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
  disconnect = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state = 'running';
  createOscillator = () => new MockOscillator();
  createGain = () => new MockGainNode();
  createBiquadFilter = () => new MockBiquadFilterNode();
  createBufferSource = () => new MockBufferSourceNode();
  createBuffer = (_channels: number, length: number, sampleRate: number) => ({
    length, sampleRate, numberOfChannels: 1,
    getChannelData: () => new Float32Array(length),
  });
  destination = {};
  close = vi.fn();
  resume = vi.fn(() => Promise.resolve());
}

Object.defineProperty(window, 'AudioContext', {
  value: MockAudioContext,
  writable: true,
});
