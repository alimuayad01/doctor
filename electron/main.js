const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, shell } = require('electron');

const createDataDirs = () => {
  const dataRoot = app.getPath('userData');
  const uploadsDir = path.join(dataRoot, 'uploads');
  const backupsDir = path.join(dataRoot, 'backups');

  ['avatars', 'credentials', 'institutions', 'labs', 'misc', 'cases'].forEach((folder) => {
    fs.mkdirSync(path.join(uploadsDir, folder), { recursive: true });
  });
  fs.mkdirSync(backupsDir, { recursive: true });

  process.env.UPLOADS_DIR = uploadsDir;
  process.env.BACKUPS_DIR = backupsDir;
  process.env.ENABLE_GRPC = process.env.ENABLE_GRPC || 'false';
  process.env.NODE_ENV = process.env.NODE_ENV || 'desktop';
};

const createWindow = async () => {
  createDataDirs();

  const { startServer } = require('../server/index');
  const server = await startServer({ port: 0, enableGrpc: false });
  const port = server.address().port;

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'طبيبي',
    backgroundColor: '#f8fafc',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  await win.loadURL(`http://127.0.0.1:${port}/`);
};

app.whenReady().then(createWindow).catch((err) => {
  console.error('Failed to start desktop app:', err);
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
