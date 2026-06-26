# Zen Calendar — Google Calendar API Setup

## 1. Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Name it `Zen Calendar`
4. Click **Create**

## 2. Enable Google Calendar API

1. **APIs & Services** → **Library**
2. Search: `Google Calendar API`
3. Click **Enable**

## 3. Configure OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**
2. Choose **External** → **Create**
3. App name: `Zen Calendar`
4. User support email: your email
5. Developer contact: your email
6. Click **Save and Continue**
7. **Scopes**: Add Scopes → `.../auth/calendar.readonly` → Add
8. Click **Save and Continue** (twice)
9. Back to Dashboard

## 4. Create OAuth 2.0 Client ID

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**
3. Application type: **Desktop application**
4. Name: `Zen Calendar Desktop`
5. **Authorized redirect URIs**: add `http://localhost:4123/callback`
6. Click **Create**
7. Copy your **Client ID**

## 5. Configure the app

Copy `src/config.example.ts` to `src/config.ts` and paste your Client ID:

```ts
export const GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
```

## 6. Run

```bash
npm install
npm run build
npx electron .
```
