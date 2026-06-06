import { app, BrowserWindow } from 'electron';
import { registerIpcHandlers } from './ipc/index.js';
import { createMainWindow } from './windows/main-window.js';

app.setName('그루미');

registerIpcHandlers(app);

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
