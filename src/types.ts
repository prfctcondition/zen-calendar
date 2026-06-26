export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  colorId?: string;
  calendarId?: string;
  hangoutLink?: string;
  conferenceData?: { conferenceSolution?: { name?: string } };
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export type ViewMode = 'calendar' | 'events';

interface ExchangeParams {
  code: string;
  codeVerifier: string;
  clientId: string;
}

interface RefreshParams {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void;
      close: () => void;
      toggleOnTop: () => void;
      onTopChanged: (cb: (val: boolean) => void) => void;
      getScreenSize: () => Promise<{ width: number; height: number }>;
      getAuthCode: () => Promise<string | null>;
      getWallpaper: () => Promise<{ filePath: string; dataUri: string } | null>;
      exchangeCode: (params: ExchangeParams) => Promise<any>;
      refreshToken: (params: RefreshParams) => Promise<any>;
      saveTokens: (tokens: any) => Promise<void>;
      loadTokens: () => Promise<any>;
    };
  }
}
