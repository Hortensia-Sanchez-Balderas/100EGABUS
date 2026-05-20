const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

console.log('Electron main process starting...');

function createWindow() {
  try {
    console.log('Creating window...');
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload-cjs.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const isDev = !app.isPackaged;
    console.log('isDev:', isDev);
    
    if (isDev) {
      console.log('Loading dev server: http://localhost:3000');
      mainWindow.loadURL('http://localhost:3000');
    } else {
      const indexPath = path.join(__dirname, 'dist/index.html');
      console.log('Loading file:', indexPath);
      mainWindow.loadFile(indexPath);
    }

    mainWindow.webContents.openDevTools();
    
    mainWindow.webContents.on('console-message', (level, message, line, sourceId) => {
      console.log(`[Console] ${message}`);
    });

    mainWindow.on('closed', () => {
      console.log('Window closed');
      mainWindow = null;
    });
    
    console.log('Window created successfully');
  } catch (err) {
    console.error('Error creating window:', err);
  }
}

app.on('ready', () => {
  try {
    console.log('App ready event fired');
    createWindow();
  } catch (err) {
    console.error('Error in ready event:', err);
  }
});

app.on('window-all-closed', () => {
  console.log('Window all closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('Activate event');
  if (mainWindow === null) {
    createWindow();
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const template = [
  {
    label: '100EGABUS',
    submenu: [
      { role: 'quit' },
    ],
  },
  {
    label: 'Editar',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
    ],
  },
  {
    label: 'Vista',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

console.log('Electron main process setup complete');
