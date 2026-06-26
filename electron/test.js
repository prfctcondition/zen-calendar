const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 400, height: 300,
    show: true,
    title: 'TEST',
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });
  win.loadURL('data:text/html,<h1>Hello</h1>');
  win.on('closed', () => { app.quit(); console.log('closed'); });
  console.log('window created');
});
console.log('ready');
