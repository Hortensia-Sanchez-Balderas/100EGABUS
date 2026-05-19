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

  // Load test HTML
  const testPath = `file://${path.join(__dirname, 'test.html')}`;
  console.log('Loading:', testPath);
  mainWindow.loadURL(testPath);

  mainWindow.webContents.openDevTools();

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
