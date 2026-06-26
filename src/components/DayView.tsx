import { format, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { GoogleEvent } from '../types';
import { EventCard } from './EventCard';

interface Props { selectedDate: Date; events: GoogleEvent[] }

export function DayView({ selectedDate, events }: Props) {
  return (
    <div className="day-view">
      <div className="day-header">
        <Calendar size={18} />
        <div className="day-info">
          <h2 className="day-name">{format(selectedDate, 'EEEE', { locale: ru })}</h2>
          <span className="day-full-date">{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</span>
        </div>
        {isToday(selectedDate) && <span className="today-badge">Сегодня</span>}
      </div>
      <div className="events-list">
        {events.length === 0
          ? <div className="no-events"><Clock size={48} className="no-events-icon" /><p>Нет событий</p></div>
          : events.map(e => <EventCard key={e.id} event={e} />)}
      </div>
    </div>
  );
}
