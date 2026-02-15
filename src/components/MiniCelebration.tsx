interface MiniCelebrationProps {
  avatar: string;
  kidName: string;
  message: string;
}

export function MiniCelebration({ avatar, kidName, message }: MiniCelebrationProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      role="dialog"
      aria-label={`${kidName} completed a routine`}
    >
      <div className="mini-celebrate text-center">
        <div className="relative inline-block mb-2">
          <img
            src={avatar}
            alt={kidName}
            className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 shadow-lg shadow-yellow-400/50"
          />
          {/* Sparkles */}
          <span className="absolute -top-2 -left-2 text-lg sparkle-1">✨</span>
          <span className="absolute -top-1 -right-3 text-lg sparkle-2">✨</span>
          <span className="absolute -bottom-1 left-0 text-lg sparkle-3">✨</span>
        </div>
        <div className="text-2xl font-extrabold text-white drop-shadow-lg" dir="rtl">
          {message}
        </div>
      </div>
    </div>
  );
}
