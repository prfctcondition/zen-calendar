import { GoogleEvent, GoogleCalendar, AuthTokens } from '../types';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, GOOGLE_SCOPES } from '../config';

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
let tokens: AuthTokens | null = null;

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function getAuthUrl(): Promise<{ url: string; verifier: string }> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });
  return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, verifier };
}

export async function loadTokens(): Promise<AuthTokens | null> {
  const t = await window.electronAPI.loadTokens();
  if (t) { tokens = t; return tokens; }
  return null;
}

export async function saveTokens(t: AuthTokens): Promise<void> {
  tokens = t;
  await window.electronAPI.saveTokens(t);
}

export function clearTokens(): void {
  tokens = null;
}

async function fetchWithAuth(url: string): Promise<Response> {
  if (!tokens?.access_token) throw new Error('Not authenticated');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (res.status === 401 && tokens.refresh_token) {
    const refreshed = await window.electronAPI.refreshToken({ refreshToken: tokens.refresh_token, clientId: GOOGLE_CLIENT_ID });
    tokens = { ...tokens, ...refreshed };
    await window.electronAPI.saveTokens(tokens);
    return fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  }
  return res;
}

export async function getCalendars(): Promise<GoogleCalendar[]> {
  const res = await fetchWithAuth(`${CALENDAR_API}/users/me/calendarList`);
  return (await res.json()).items || [];
}

export async function getEvents(timeMin: string, timeMax: string, calendarIds?: string[]): Promise<GoogleEvent[]> {
  const ids = calendarIds || ['primary'];
  const all: GoogleEvent[] = [];
  for (const calId of ids) {
    const res = await fetchWithAuth(
      `${CALENDAR_API}/calendars/${encodeURIComponent(calId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
    );
    const data = await res.json();
    (data.items || []).forEach((e: GoogleEvent) => all.push({ ...e, calendarId: calId }));
  }
  all.sort((a, b) => ((a.start.dateTime || a.start.date || '') > (b.start.dateTime || b.start.date || '') ? 1 : -1));
  return all;
}
