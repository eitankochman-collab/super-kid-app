import { getScheduleForDay } from '../scheduleStorage';
import { HEBREW_DAYS } from '../constants';

interface WeeklyScheduleModalProps {
  kidId: string;
  kidHebrewName: string;
  kidColor: string;
  onClose: () => void;
}

export function WeeklyScheduleModal({ kidId, kidHebrewName, kidColor, onClose }: WeeklyScheduleModalProps) {
  const today = new Date().getDay();

  // Day labels: Sun(0)..Sat(6) but display Mon-Fri with Sat/Sun as weekend
  const days = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">📅 השבוע של {kidHebrewName}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* 7-column grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((dayIdx) => {
            const isWeekendDay = dayIdx === 0 || dayIdx === 6;
            const isToday = dayIdx === today;
            const daySchedule = getScheduleForDay(dayIdx);

            return (
              <div
                key={dayIdx}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all min-h-[140px] ${
                  isToday
                    ? 'border-purple-400 ring-2 ring-purple-400 bg-purple-50'
                    : isWeekendDay
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-200 bg-white'
                }`}
              >
                {/* Day name */}
                <span className={`text-xs font-bold mb-2 ${isToday ? 'text-purple-600' : 'text-gray-500'}`}>
                  {HEBREW_DAYS[dayIdx]}
                </span>

                {isWeekendDay ? (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-2xl">🌴</span>
                  </div>
                ) : daySchedule ? (
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    {/* Dropoff */}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${kidColor} flex items-center justify-center text-sm shadow-sm`} title={daySchedule.dropoff === 'אבא' ? 'אבא מפזר' : 'אמא מפזרת'}>
                      {daySchedule.dropoff === 'אבא' ? '👨' : '👩'}
                    </div>

                    {/* After school */}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${kidColor} flex items-center justify-center text-sm shadow-sm`} title={daySchedule.afterSchool === 'tzaharon' ? 'צהרון' : `איסוף ${daySchedule.pickupTimes[kidId] || ''}`}>
                      {daySchedule.afterSchool === 'tzaharon' ? '🏠' : '🕐'}
                    </div>
                    {daySchedule.afterSchool === 'pickup' && daySchedule.pickupTimes[kidId] && (
                      <span className="text-[9px] font-bold text-gray-500">{daySchedule.pickupTimes[kidId]}</span>
                    )}

                    {/* Tutoring */}
                    {daySchedule.tutoring && (
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${kidColor} flex items-center justify-center text-sm shadow-sm`} title={`חונכות עם ${daySchedule.tutoring}`}>
                        📚
                      </div>
                    )}

                    {/* Special event */}
                    {daySchedule.specialEvent && (
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${kidColor} flex items-center justify-center text-sm shadow-sm`} title={daySchedule.specialEvent}>
                        {daySchedule.specialEventEmoji || '🎉'}
                      </div>
                    )}

                    {/* Pickup */}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${kidColor} flex items-center justify-center text-sm shadow-sm`} title={daySchedule.pickup === 'אבא' ? 'אבא אוסף' : 'אמא אוספת'}>
                      🚗
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs text-gray-500">
          <span>👨/👩 הסעה</span>
          <span>🏠 צהרון</span>
          <span>🕐 איסוף</span>
          <span>📚 חונכות</span>
          <span>🚗 חזרה</span>
        </div>
      </div>
    </div>
  );
}
