const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');

// Se siamo in modalità Portable (Windows .exe portatile), salva tutti i dati
// (database quadri, foto salvate, impostazioni) direttamente nella cartella dell'eseguibile o chiavetta USB
if (process.env.PORTABLE_EXECUTABLE_DIR) {
  const portableDataDir = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'OperaViva_Dati');
  app.setPath('userData', portableDataDir);
}

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, '../build/icon.png');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0c0e14',
    title: "OperaViva | Archivio Personale d'Arte • Created by Marzio Sparla",
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // CRITICO: sandbox:true blocca IndexedDB/Dexie → schermata nera
      sandbox: false,
      // Permette il caricamento di risorse locali (font, css) dall'asar
      webSecurity: false,
    },
    show: false
  });

  // Rimuovi barra menu nativa standard per look moderno da atelier
  Menu.setApplicationMenu(null);

  // In produzione usare app.isPackaged è più affidabile di process.env.NODE_ENV
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('Errore caricamento app:', err);
      dialog.showErrorBox('Errore avvio OperaViva',
        "Impossibile caricare l'applicazione.\n\nPercorso: " + indexPath + '\nErrore: ' + err.message);
    });
  }

  // Mostra la finestra solo quando è pronta (evita flash bianco)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Fallback: se il renderer non si avvia entro 12 secondi, mostra comunque la finestra
  const showTimeout = setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 12000);

  mainWindow.once('show', () => clearTimeout(showTimeout));

  // Log e dialogo errori renderer
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Renderer failed:', errorCode, errorDescription, validatedURL);
    if (!isDev) {
      clearTimeout(showTimeout);
      mainWindow.show();
      dialog.showErrorBox('Errore caricamento OperaViva',
        'Codice errore: ' + errorCode + '\n' + errorDescription + '\nURL: ' + validatedURL);
    }
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process gone:', details);
    dialog.showErrorBox('OperaViva si è arrestata',
      'Il processo di rendering si è interrotto.\nMotivo: ' + details.reason);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
