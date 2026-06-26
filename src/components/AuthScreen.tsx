import { LogIn } from 'lucide-react';

interface Props { onLogin: () => void; isLoading: boolean }

export function AuthScreen({ onLogin, isLoading }: Props) {
  return (
    <div className="auth-screen">
      <div className="auth-logo">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h1 className="auth-title">Zen Calendar</h1>
      <p className="auth-subtitle">Синхронизация с Google Календарём</p>
      <button className="auth-button" onClick={onLogin} disabled={isLoading}>
        <LogIn size={20} />
        <span>Войти через Google</span>
      </button>
    </div>
  );
}
