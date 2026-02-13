import { useEffect, useState } from 'react';
import {
  CONFETTI_PARTICLE_COUNT,
  CONFETTI_AUTO_CLOSE_MS,
  CONFETTI_COLORS,
  CELEBRATION_NOTES,
} from '../constants';

interface ConfettiOverlayProps {
  kidName: string;
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

export function ConfettiOverlay({ kidName, onClose }: ConfettiOverlayProps) {
  const [confetti, setConfetti] = useState<
    Array<{ id: number; left: number; delay: number; duration: number; color: string }>
  >([]);

  useEffect(() => {
    const particles = Array.from({ length: CONFETTI_PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
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
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 w-2 h-2 animate-fall"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            backgroundColor: particle.color,
          }}
        />
      ))}

      <div className="relative z-10 text-center animate-bounce-in">
        <div className="text-9xl mb-4">🎉</div>
        <h1 className="text-6xl font-bold text-white mb-4">Super Kid!</h1>
        <p className="text-3xl text-yellow-300 font-semibold">{kidName}</p>
        <div className="mt-8 text-7xl animate-pulse">⭐</div>
      </div>
    </div>
  );
}
