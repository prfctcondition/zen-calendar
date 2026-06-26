const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');

Menu.setApplicationMenu(null);

let mainWindow;
let distServer;
let oauthServer;
let pendingAuthCode = null;
const DIST_PORT = 5174;
const DIST_DIR = path.join(__dirname, '..', 'dist');
const OAUTH_PORT = 4123;

function serveStatic(req, res) {
  const urlPath = req.url.split('?')[0].replace(/\.\./g, '');
  const fp = path.join(DIST_DIR, urlPath === '/' ? '/index.html' : urlPath);
  fs.readFile(fp, (e, d) => {
    if (e) { res.writeHead(404); res.end('404'); return; }
    const m = { html: 'text/html', js: 'application/javascript', css: 'text/css', svg: 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': m[path.extname(fp).slice(1)] || 'text/plain' });
    res.end(d);
  });
}

function startDistServer() {
  return new Promise(r => { distServer = http.createServer(serveStatic).listen(DIST_PORT, '127.0.0.1', r); });
}

function startOAuthServer() {
  return new Promise(r => {
    oauthServer = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${OAUTH_PORT}`);
      if (url.pathname === '/auth-code') {
        res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end(pendingAuthCode || ''); return;
      }
      const code = url.searchParams.get('code');
      if (code) { pendingAuthCode = code; res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<h3>Authorized! You can close this tab.</h3>'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<h3>OAuth server running</h3>');
    });
    oauthServer.on('error', () => {}); oauthServer.listen(OAUTH_PORT, '127.0.0.1', r);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    show: true,
    backgroundColor: '#00000000',
    icon: path.join(__dirname, 'app.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(`http://127.0.0.1:${DIST_PORT}`);

  mainWindow.on('ready-to-show', () => {
    // Remove invisible resize border
    try {
      const hwndBuf = mainWindow.getNativeWindowHandle();
      const hwndInt = Number(hwndBuf.readBigUInt64LE(0));
      const ps = path.join(__dirname, 'fix-border.ps1');
      execSync(`powershell -ExecutionPolicy Bypass -File "${ps}" -hwnd ${hwndInt}`, { timeout: 5000, stdio: 'ignore' });
    } catch (_) {}
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-close', () => mainWindow?.close());
ipcMain.on('window-toggle-on-top', () => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const next = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(next);
  mainWindow.webContents.send('on-top-changed', next);
});

ipcMain.handle('get-auth-code', () => { const c = pendingAuthCode; pendingAuthCode = null; return c; });

ipcMain.handle('exchange-code', async (_, { code, codeVerifier, clientId, clientSecret }) => {
  const params = { code, client_id: clientId, redirect_uri: `http://localhost:${OAUTH_PORT}/callback`, grant_type: 'authorization_code', code_verifier: codeVerifier };
  if (clientSecret) params.client_secret = clientSecret;
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
  return res.json();
});

ipcMain.handle('refresh-token', async (_, { refreshToken, clientId, clientSecret }) => {
  const params = { refresh_token: refreshToken, client_id: clientId, grant_type: 'refresh_token' };
  if (clientSecret) params.client_secret = clientSecret;
  const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
  return res.json();
});

ipcMain.handle('get-wallpaper', () => {
  try {
    const ps = path.join(__dirname, 'wallpaper.ps1');
    const out = execSync(`powershell -ExecutionPolicy Bypass -File "${ps}"`, { timeout: 5000, encoding: 'utf-8' }).trim();
    if (!out) return null;
    const [filePath, dataUri] = out.split('|');
    return { filePath, dataUri };
  } catch (_) { return null; }
});

ipcMain.handle('save-tokens', (_, tokens) => {
  try {
    if (tokens) {
      fs.writeFileSync(path.join(app.getPath('userData'), 'tokens.json'), JSON.stringify(tokens));
    } else {
      const p = path.join(app.getPath('userData'), 'tokens.json');
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  } catch (_) {}
});

ipcMain.handle('load-tokens', () => {
  try { return JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'tokens.json'), 'utf-8')); } catch (_) { return null; }
});

ipcMain.handle('get-screen-size', () => {
  const d = screen.getPrimaryDisplay();
  return { width: d.workArea.width, height: d.workArea.height };
});

app.whenReady().then(async () => {
  await startDistServer();
  await startOAuthServer();
  createWindow();
});

app.on('before-quit', () => { distServer?.close(); oauthServer?.close(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
