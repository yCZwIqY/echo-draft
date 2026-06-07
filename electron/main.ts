import { app, BrowserWindow, protocol } from 'electron';
import { registerIpcHandlers } from './ipc/index.js';
import { registerRendererProtocol } from './renderer-protocol.js';
import { createMainWindow } from './windows/main-window.js';

app.setName('그루미');
app.setAppUserModelId('com.groomi.app');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
    },
  },
]);

registerIpcHandlers(app);

app.whenReady().then(() => {
  registerRendererProtocol();
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
