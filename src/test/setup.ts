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
  frequency = { value: 0 };
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
  };
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  createOscillator = () => new MockOscillator();
  createGain = () => new MockGainNode();
  destination = {};
  close = vi.fn();
}

Object.defineProperty(window, 'AudioContext', {
  value: MockAudioContext,
  writable: true,
});
