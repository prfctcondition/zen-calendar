# Zen Calendar — Google Calendar API Setup

## For users

Just install the app and sign in with Google. The Client ID is already configured in the app.

## For developers (building from source)

1. Go to https://console.cloud.google.com
2. Create a project → **APIs & Services** → **Library** → enable **Google Calendar API**
3. **OAuth consent screen** → **External** → fill required fields → add `.../auth/calendar.readonly` scope
4. **Credentials** → **Create OAuth client ID** → **Desktop application**
5. Add `http://localhost:4123/callback` as an authorized redirect URI
6. Copy your Client ID to `src/config.ts`

```bash
npm install
npm run build
npx electron .
```
