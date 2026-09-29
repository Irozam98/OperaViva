const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

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
      preload: path.join(__dirname, 'preload.cjs'),
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

// Handler per Salva PDF con finestra nativa "Salva con nome"
ipcMain.handle('save-pdf', async (event, { defaultFileName, title, landscape } = {}) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: title || 'Salva Documento PDF',
      defaultPath: defaultFileName || 'OperaViva_Documento.pdf',
      filters: [
        { name: 'Documento PDF (*.pdf)', extensions: ['pdf'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    const pdfBuffer = await event.sender.printToPDF({
      pageSize: 'A4',
      landscape: !!landscape,
      printBackground: true,
      preferCSSPageSize: true
    });

    await fs.promises.writeFile(filePath, pdfBuffer);
    return { success: true, filePath };
  } catch (err) {
    console.error('Errore durante la generazione PDF:', err);
    return { success: false, error: err.message };
  }
});

// Handler per Anteprima PDF: salva in temp e apre nel visualizzatore di sistema (Edge, Acrobat, etc.)
ipcMain.handle('preview-pdf', async (event, { title, landscape } = {}) => {
  try {
    const pdfBuffer = await event.sender.printToPDF({
      pageSize: 'A4',
      landscape: !!landscape,
      printBackground: true,
      preferCSSPageSize: true
    });

    const tempDir = app.getPath('temp');
    const safeTitle = (title || 'Anteprima').replace(/[^a-zA-Z0-9_-]/g, '_');
    const tempFileName = `OperaViva_${safeTitle}_${Date.now()}.pdf`;
    const tempFilePath = path.join(tempDir, tempFileName);

    await fs.promises.writeFile(tempFilePath, pdfBuffer);
    await shell.openPath(tempFilePath);
    return { success: true, tempFilePath };
  } catch (err) {
    console.error('Errore durante anteprima PDF:', err);
    return { success: false, error: err.message };
  }
});

// Handler per Stampa con dialogo di sistema e background a colori sempre abilitato
ipcMain.handle('print', async (event) => {
  try {
    event.sender.print({
      silent: false,
      printBackground: true
    });
    return true;
  } catch (err) {
    console.error('Errore durante la stampa:', err);
    return false;
  }
});

// Handler per aprire file o percorsi nel sistema
ipcMain.handle('open-path', async (event, targetPath) => {
  if (targetPath) {
    try {
      await shell.openPath(targetPath);
      return true;
    } catch (err) {
      console.error('Errore openPath:', err);
      return false;
    }
  }
  return false;
});

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

