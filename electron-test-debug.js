const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
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
  
  // Cargar el archivo HTML de test
  const testUrl = isDev
    ? `file://${path.join(__dirname, 'test-simple.html')}`
    : `file://${path.join(__dirname, 'test-simple.html')}`;

  console.log('Loading URL:', testUrl);
  mainWindow.loadURL(testUrl);

  // Abrir DevTools para ver errores
  mainWindow.webContents.openDevTools();

  // Logear todo lo que suceda
  mainWindow.webContents.on('console-message', (level, message, line, sourceId) => {
    console.log(`[${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  mainWindow.webContents.on('crashed', () => {
    console.log('WebContents crashed');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
