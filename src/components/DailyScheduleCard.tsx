import { getTodaySchedule } from '../scheduleStorage';

interface DailyScheduleCardProps {
  kidId: string;
  kidHebrewName: string;
  kidColor: string;
  isWeekend: boolean;
  onShowWeekly: () => void;
}

interface TimelineItem {
  emoji: string;
  text: string;
}

export function DailyScheduleCard({ kidId, kidHebrewName, kidColor, isWeekend, onShowWeekly }: DailyScheduleCardProps) {
  if (isWeekend) {
    return (
      <div className="mb-3 px-4 py-3 bg-white/80 rounded-2xl shadow-sm" dir="rtl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <span className="text-lg font-bold text-gray-700">סוף שבוע!</span>
              <div className="text-xs font-semibold text-gray-400">Weekend!</div>
            </div>
          </div>
          <button
            onClick={onShowWeekly}
            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-200 transition-colors active:scale-95"
          >
            📅 השבוע / This Week
          </button>
        </div>
      </div>
    );
  }

  const schedule = getTodaySchedule(isWeekend);
  if (!schedule) return null;

  const items: TimelineItem[] = [];

  // Dropoff
  const isDropoffAbba = schedule.dropoff === 'אבא';
  items.push({
    emoji: '🚗',
    text: isDropoffAbba ? 'אבא מפזר' : 'אמא מפזרת',
  });

  // School
  items.push({ emoji: '🏫', text: 'בית ספר' });

  // After school
  if (schedule.afterSchool === 'tzaharon') {
    items.push({ emoji: '🏠', text: 'צהרון' });
  } else {
    const time = schedule.pickupTimes[kidId] || '';
    items.push({ emoji: '🕐', text: time ? `איסוף ב-${time}` : 'איסוף' });
  }

  // Tutoring
  if (schedule.tutoring) {
    items.push({ emoji: '📚', text: `חונכות עם ${schedule.tutoring}` });
  }

  // Special event
  if (schedule.specialEvent) {
    items.push({
      emoji: schedule.specialEventEmoji || '🎉',
      text: schedule.specialEvent,
    });
  }

  // Pickup
  const isPickupAbba = schedule.pickup === 'אבא';
  items.push({
    emoji: '🚗',
    text: isPickupAbba ? 'אבא אוסף' : 'אמא אוספת',
  });

  return (
    <div className="mb-3 bg-white/80 rounded-2xl shadow-sm overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-sm font-bold text-gray-700">📅 היום של {kidHebrewName}</span>
        <button
          onClick={onShowWeekly}
          className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-200 transition-colors active:scale-95"
        >
          📅 השבוע / This Week
        </button>
      </div>

      {/* Timeline — horizontal scrollable */}
      <div className="flex gap-3 px-4 pb-3 overflow-x-auto">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center min-w-[64px] flex-shrink-0">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${kidColor} flex items-center justify-center text-xl shadow-sm`}>
              {item.emoji}
            </div>
            <span className="text-[10px] font-semibold text-gray-600 mt-1 text-center leading-tight max-w-[72px]">
              {item.text}
            </span>
            {i < items.length - 1 && (
              <div className="absolute" style={{ display: 'none' }}>→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
