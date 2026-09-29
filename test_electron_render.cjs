const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    show: false
  });

  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER ${level}] ${message} (at ${sourceId}:${line})`);
  });

  win.webContents.on('did-fail-load', (e, code, desc, url) => {
    console.error(`[DID FAIL LOAD] code=${code} desc=${desc} url=${url}`);
  });

  const distPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Loading:', distPath);
  try {
    await win.loadFile(distPath);
    console.log('loadFile resolved successfully!');
    
    // Wait 3 seconds to let React mount and Dexie initialize
    setTimeout(async () => {
      const rootHtml = await win.webContents.executeJavaScript('document.getElementById("root").innerHTML');
      console.log('Root HTML length:', rootHtml.length);
      console.log('Root HTML preview:', rootHtml.slice(0, 200));
      app.quit();
    }, 3000);
  } catch (err) {
    console.error('loadFile caught error:', err);
    app.quit();
  }
});
