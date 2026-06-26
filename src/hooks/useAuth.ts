import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuthUrl, loadTokens, saveTokens, clearTokens, getCalendars } from '../services/googleApi';
import { GOOGLE_CLIENT_ID } from '../config';
import { GoogleCalendar } from '../types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const t = await loadTokens();
      if (t) setIsAuthenticated(true);
      setIsLoading(false);
    })();
  }, []);

  const pollAndExchange = useCallback(async () => {
    try {
      const code = await window.electronAPI.getAuthCode();
      if (!code) return;

      clearInterval(pollingRef.current!);
      pollingRef.current = null;
      setIsLoading(true);

      const verifier = localStorage.getItem('oauth_verifier');
      if (!verifier) { console.warn('[auth] no verifier'); setIsLoading(false); return; }

      const result = await window.electronAPI.exchangeCode({ code, codeVerifier: verifier, clientId: GOOGLE_CLIENT_ID });

      if (result.access_token) {
        await saveTokens(result);
        setIsAuthenticated(true);
        localStorage.removeItem('oauth_verifier');
        getCalendars().then(setCalendars).catch(() => {});
      } else {
        console.warn('[auth] exchange failed:', result);
        if (pollingRef.current === null) {
          pollingRef.current = setInterval(pollAndExchange, 500);
        }
      }
      setIsLoading(false);
    } catch (e) {
      console.error('[auth] poll error:', e);
      setIsLoading(false);
      if (pollingRef.current === null) {
        pollingRef.current = setInterval(pollAndExchange, 500);
      }
    }
  }, []);

  const login = useCallback(async () => {
    const { url, verifier } = await getAuthUrl();
    localStorage.setItem('oauth_verifier', verifier);
    window.open(url, '_blank');
    pollingRef.current = setInterval(pollAndExchange, 500);
  }, [pollAndExchange]);

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
    setCalendars([]);
  }, []);

  return { isAuthenticated, isLoading, calendars, login, logout };
}
