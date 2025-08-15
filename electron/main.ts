import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { setupDbIpcHandlers } from './db/handlers.ts'
import { setupPrintUtilities } from "./utilities/printUtilities.ts";
import fs from 'fs';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    height: 768,
    width: 1024,
    autoHideMenuBar: true,
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  setupDbIpcHandlers();
  setupPrintUtilities()
  createWindow();
  // Handler para copia de seguridad
  ipcMain.handle('db:realizarCopiaSeguridad', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'my-database.sqlite');
      // Pedir al usuario la ubicación de guardado
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Guardar copia de seguridad',
        defaultPath: `lavanderia-backup-${new Date().toISOString().slice(0, 10)}.sqlite`,
        filters: [
          { name: 'SQLite Database', extensions: ['sqlite'] },
          { name: 'Todos los archivos', extensions: ['*'] }
        ]
      });
      if (canceled || !filePath) return false;
      await fs.promises.copyFile(dbPath, filePath);
      return true;
    } catch (e) {
      console.error('Error al realizar copia de seguridad:', e);
      return false;
    }
  });

  ipcMain.handle('db:cargarCopiaSeguridad', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'my-database.sqlite');
      // Pedir al usuario el archivo de backup
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Seleccionar copia de seguridad',
        filters: [
          { name: 'SQLite Database', extensions: ['sqlite'] },
          { name: 'Todos los archivos', extensions: ['*'] }
        ],
        properties: ['openFile']
      });
      if (canceled || !filePaths || filePaths.length === 0) return false;
      await fs.promises.copyFile(filePaths[0], dbPath);
      return true;
    } catch (e) {
      console.error('Error al cargar copia de seguridad:', e);
      return false;
    }
  });
})
