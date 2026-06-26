import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { GoogleEvent } from '../types';

interface Props { event: GoogleEvent; calendarColor?: string }

export function EventCard({ event }: Props) {
  const isAllDay = !!event.start.date;
  const startTime = event.start.dateTime ? format(new Date(event.start.dateTime), 'HH:mm', { locale: ru }) : null;
  const endTime = event.end.dateTime ? format(new Date(event.end.dateTime), 'HH:mm', { locale: ru }) : null;

  return (
    <div className="event-card" style={{ borderLeftColor: '#FFFFFF' }}>
      <div className="event-time">
        {isAllDay
          ? <span className="all-day-badge">Весь день</span>
          : <span className="time-range"><Clock size={12} />{startTime}—{endTime}</span>}
      </div>
      <h4 className="event-title">{event.summary}</h4>
    </div>
  );
}
