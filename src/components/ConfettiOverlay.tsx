import { useEffect, useState } from 'react';
import {
  CONFETTI_PARTICLE_COUNT,
  CONFETTI_AUTO_CLOSE_MS,
  CONFETTI_COLORS,
  CELEBRATION_NOTES,
} from '../constants';

interface ConfettiOverlayProps {
  kidName: string;
  avatar: string;
  onClose: () => void;
}

function playNote(
  audioContext: AudioContext,
  frequency: number,
  duration: number,
) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration,
  );
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export function ConfettiOverlay({ kidName, avatar, onClose }: ConfettiOverlayProps) {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; left: number; delay: number; duration: number; color: string; type: 'square' | 'star' }>
  >([]);

  useEffect(() => {
    const particles = Array.from({ length: CONFETTI_PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      type: (Math.random() > 0.6 ? 'star' : 'square') as 'square' | 'star',
    }));
    setConfetti(particles);

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      playNote(audioContext, CELEBRATION_NOTES.C5, 0.5);
      setTimeout(() => playNote(audioContext, CELEBRATION_NOTES.E5, 0.5), 200);
      setTimeout(() => playNote(audioContext, CELEBRATION_NOTES.G5, 0.7), 400);
    } catch {
      // Audio not supported - silently continue
    }

    const timer = setTimeout(() => onClose(), CONFETTI_AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 cursor-pointer"
      onClick={onClose}
      role="dialog"
      aria-label={`Celebration for ${kidName}`}
    >
      {/* Confetti + stars raining */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 animate-fall"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.type === 'star' ? (
            <span className="text-2xl" style={{ color: particle.color }}>⭐</span>
          ) : (
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: particle.color }} />
          )}
        </div>
      ))}

      {/* Super-Kid transformation */}
      <div className="relative z-10 text-center super-kid-entrance">
        {/* Cape behind avatar */}
        <div className="cape-flutter absolute left-1/2 -translate-x-1/2 top-8 w-32 h-40 bg-gradient-to-b from-red-500 to-red-700 rounded-b-full opacity-80" />

        {/* Avatar with golden glow */}
        <div className="relative inline-block mb-4">
          <div className="golden-glow absolute inset-0 rounded-full" />
          <img
            src={avatar}
            alt={kidName}
            className="relative w-28 h-28 rounded-full object-cover border-4 border-yellow-400 shadow-2xl"
          />
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg" dir="rtl">
          לונה גאה בך — {kidName} סופר סיסטר! 🐕⭐
        </h1>
        <div className="text-5xl mt-2">🦸‍♀️</div>
      </div>
    </div>
  );
}
