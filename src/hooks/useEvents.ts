import { useState, useEffect, useCallback } from 'react';
import { GoogleEvent } from '../types';
import { getEvents } from '../services/googleApi';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns';

export function useEvents(isAuthenticated: boolean) {
  const [monthEvents, setMonthEvents] = useState<GoogleEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const fetchMonthEvents = useCallback(async (date: Date) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const start = startOfMonth(date).toISOString();
      const end = endOfMonth(date).toISOString();
      const events = await getEvents(start, end);
      setMonthEvents(events);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => { fetchMonthEvents(currentMonth); }, [currentMonth, fetchMonthEvents]);

  const getEventsForDate = useCallback((date: Date): GoogleEvent[] =>
    monthEvents.filter(e => isSameDay(new Date(e.start.dateTime || e.start.date || ''), date)),
  [monthEvents]);

  const getDaysInMonth = useCallback((): Date[] =>
    eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }),
  [currentMonth]);

  const prevMonth = useCallback(() => setCurrentMonth(d => subMonths(d, 1)), []);
  const nextMonth = useCallback(() => setCurrentMonth(d => addMonths(d, 1)), []);

  return { monthEvents, selectedDate, setSelectedDate, currentMonth, getEventsForDate, getDaysInMonth, prevMonth, nextMonth, isLoading, refresh: () => fetchMonthEvents(currentMonth) };
}
