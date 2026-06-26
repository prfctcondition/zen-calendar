// Zen Calendar — Google OAuth Configuration
// 1. Go to https://console.cloud.google.com
// 2. Create a project → APIs & Services → Library → Google Calendar API → Enable
// 3. OAuth consent screen → External → Fill in required fields
// 4. Credentials → Create OAuth client ID → Desktop application
// 5. Authorized redirect URIs: http://localhost:4123/callback
// 6. Copy your Client ID below

export const GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
export const GOOGLE_CLIENT_SECRET = ''; // Not needed for PKCE desktop apps
export const GOOGLE_REDIRECT_URI = 'http://localhost:4123/callback';
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
