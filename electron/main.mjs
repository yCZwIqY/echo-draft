import { fileURLToPath } from 'url';
import path from 'path';

import { app, BrowserWindow } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL ?? 'http://localhost:3000';
const RETRY_DELAY_MS = 1000;

function loadRenderer(mainWindow) {
  mainWindow.loadURL(DEV_SERVER_URL).catch(() => {
    setTimeout(() => {
      if (!mainWindow.isDestroyed()) {
        loadRenderer(mainWindow);
      }
    }, RETRY_DELAY_MS);
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    show: false,
    webPreferences: {
      preload: path.resolve(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModules: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      if (!mainWindow.isDestroyed()) {
        loadRenderer(mainWindow);
      }
    }, RETRY_DELAY_MS);
  });

  loadRenderer(mainWindow);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
