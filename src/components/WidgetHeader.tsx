import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X, Minus, RefreshCw, Pin } from 'lucide-react';
import { ViewMode } from '../types';

interface Props {
  viewMode: ViewMode;
  onToggleView: () => void;
  onRefresh: () => void;
  isAuthenticated: boolean;
  eventsLoading: boolean;
}

export function WidgetHeader({ viewMode, onToggleView, onRefresh, isAuthenticated, eventsLoading }: Props) {
  const [time, setTime] = useState(new Date());
  const [isOnTop, setIsOnTop] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    window.electronAPI?.onTopChanged((val) => setIsOnTop(val));
  }, []);

  return (
    <div className="widget-header drag-region">
      <div className="header-top">
        <div className="header-time">
          <span className="time-digital">{format(time, 'HH:mm')}</span>
          <span className="time-date">{format(time, 'd MMMM, EEEE', { locale: ru })}</span>
        </div>
        <div className="header-controls no-drag">
          <button className={`header-btn ${eventsLoading ? 'spinning' : ''}`} onClick={onRefresh} title="Обновить"><RefreshCw size={14} /></button>
          <button className={`header-btn ${isOnTop ? 'active' : ''}`} onClick={() => window.electronAPI?.toggleOnTop()} title={isOnTop ? 'Открепить' : 'Поверх всех'}><Pin size={14} /></button>
          <button className="header-btn" onClick={() => window.electronAPI?.minimize()} title="Свернуть"><Minus size={14} /></button>
          <button className="header-btn close-btn" onClick={() => window.electronAPI?.close()} title="Закрыть"><X size={14} /></button>
        </div>
      </div>
      <div className="view-toggle no-drag">
        <button className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => viewMode !== 'calendar' && onToggleView()}>Календарь</button>
        <button className={`toggle-btn ${viewMode === 'events' ? 'active' : ''}`} onClick={() => viewMode !== 'events' && onToggleView()}>Сегодня</button>
      </div>
    </div>
  );
}
