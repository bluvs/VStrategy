const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');
const isDev = process.env.NODE_ENV !== 'production';

let wss = null; // WebSocket Server
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
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

// IPC do zarządzania serwerem WebSocket (HOST)
ipcMain.on('start-server', (event, port) => {
  if (wss) {
    wss.close();
  }
  try {
    wss = new WebSocket.Server({ port: port || 8080 });

    wss.on('connection', (ws) => {
      console.log('New client connected!');

      ws.on('message', (message) => {
        // Zwykły broadcast do wszystkich połączonych z wykluczeniem nadawcy
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
          }
        });
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    event.reply('server-status', { status: 'started', port: port || 8080 });
  } catch (error) {
    event.reply('server-status', { status: 'error', error: error.message });
  }
});

ipcMain.on('stop-server', (event) => {
  if (wss) {
    wss.close(() => {
      wss = null;
      event.reply('server-status', { status: 'stopped' });
    });
  } else {
    event.reply('server-status', { status: 'stopped' });
  }
});
