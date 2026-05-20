const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const logFile = path.join(app.getPath('userData'), 'debug.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const fullMsg = `[${timestamp}] ${msg}`;
  console.log(fullMsg);
  fs.appendFileSync(logFile, fullMsg + '\n');
}

log('=== App started ===');

app.on('ready', () => {
  log('ready event fired');
  
  try {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false, // No mostrar hasta que esté listo
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      }
    });
    
    log('BrowserWindow created');
    
    const isDev = !app.isPackaged;
    log('isDev: ' + isDev);
    
    if (isDev) {
      const url = 'http://localhost:3000';
      log('Loading URL: ' + url);
      mainWindow.loadURL(url);
    } else {
      const file = path.join(__dirname, 'dist/index.html');
      log('Loading file: ' + file);
      if (fs.existsSync(file)) {
        mainWindow.loadFile(file);
      } else {
        log('ERROR: File not found: ' + file);
      }
    }
    
    mainWindow.once('ready-to-show', () => {
      log('Window ready to show');
      mainWindow.show();
      mainWindow.webContents.openDevTools();
    });
    
    mainWindow.on('closed', () => {
      log('Window closed');
      mainWindow = null;
    });
    
    mainWindow.webContents.on('crashed', () => {
      log('RENDERER CRASHED');
    });
    
    log('Window setup complete');
    
  } catch (err) {
    log('ERROR in ready: ' + err.message + ' | ' + err.stack);
  }
});

app.on('window-all-closed', () => {
  log('window-all-closed event');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (err) => {
  log('UNCAUGHT EXCEPTION: ' + err.message + ' | ' + err.stack);
  process.exit(1);
});

log('Main script loaded, waiting for app ready...');
