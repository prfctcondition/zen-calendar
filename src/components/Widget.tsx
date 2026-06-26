import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useWidgetSize } from '../hooks/useWidgetSize';
import { useWallpaperColors } from '../hooks/useWallpaperColors';
import { useNotifications } from '../hooks/useNotifications';
import { AuthScreen } from './AuthScreen';
import { WidgetHeader } from './WidgetHeader';
import { CalendarView } from './CalendarView';
import { DayView } from './DayView';
import { ViewMode } from '../types';
import { X } from 'lucide-react';

export function Widget() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const { selectedDate, setSelectedDate, currentMonth, getEventsForDate, prevMonth, nextMonth, refresh, isLoading: eventsLoading } = useEvents(isAuthenticated);
  const size = useWidgetSize();
  const colors = useWallpaperColors();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  const todayEvents = useMemo(() => getEventsForDate(new Date()), [getEventsForDate]);
  useNotifications(todayEvents);

  return (
    <div className={`widget ${eventsLoading ? 'loading-events' : ''}`}
      style={{
        width: size.width,
        height: size.height,
        fontSize: size.fontSize,
        '--text-primary': colors.text,
        '--text-secondary': colors.textSecondary,
        '--text-muted': colors.muted,
        '--accent': colors.accent,
        '--accent-hover': colors.accent,
      } as React.CSSProperties}>
      {!isAuthenticated && !isLoading && (
        <button className="widget-close no-drag" onClick={() => window.electronAPI?.close()} title="Закрыть">
          <X size={14} />
        </button>
      )}

      {isLoading && <div className="loading"><div className="spinner" /></div>}
      {!isLoading && !isAuthenticated && <AuthScreen onLogin={login} isLoading={isLoading} />}
      {isAuthenticated && (
        <>
          <WidgetHeader
            viewMode={viewMode}
            onToggleView={() => setViewMode(m => m === 'calendar' ? 'events' : 'calendar')}
            onRefresh={refresh}
            onLogout={logout}
            isAuthenticated={isAuthenticated}
            eventsLoading={eventsLoading}
          />
          {viewMode === 'calendar'
            ? <CalendarView currentMonth={currentMonth} onPrevMonth={prevMonth} onNextMonth={nextMonth}
                selectedDate={selectedDate} onDateSelect={d => { setSelectedDate(d); setViewMode('events'); }}
                getEventsForDate={getEventsForDate} />
            : <DayView selectedDate={selectedDate} events={getEventsForDate(selectedDate)} />}
        </>
      )}
    </div>
  );
}
