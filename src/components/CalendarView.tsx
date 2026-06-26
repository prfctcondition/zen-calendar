import { format, startOfMonth, startOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GoogleEvent } from '../types';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

interface Props {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedDate: Date;
  onDateSelect: (d: Date) => void;
  getEventsForDate: (d: Date) => GoogleEvent[];
}

export function CalendarView({ currentMonth, onPrevMonth, onNextMonth, selectedDate, onDateSelect, getEventsForDate }: Props) {
  const calStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(calStart, i));

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="calendar-view">
      <div className="calendar-nav no-drag">
        <button className="nav-btn" onClick={onPrevMonth}><ChevronLeft size={20} /></button>
        <h2 className="month-title">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</h2>
        <button className="nav-btn" onClick={onNextMonth}><ChevronRight size={20} /></button>
      </div>
      <div className="weekday-header">
        {WEEKDAYS.map(w => <div key={w} className="weekday-cell">{w}</div>)}
      </div>
      <div className="days-grid">
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const dayEvents = getEventsForDate(day);
            const isCurrent = isSameMonth(day, currentMonth);
            const today = isSameDay(day, new Date());
            const selected = isSameDay(day, selectedDate);
            return (
              <button key={`${wi}-${di}`}
                className={`day-cell ${!isCurrent ? 'other-month' : ''} ${today ? 'today' : ''} ${selected ? 'selected' : ''}`}
                onClick={() => onDateSelect(day)}>
                <span className="day-number">{format(day, 'd')}</span>
                {dayEvents.length > 0 && <div className="event-dots">{dayEvents.slice(0, 3).map((_, i) => <span key={i} className="event-dot" />)}</div>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
