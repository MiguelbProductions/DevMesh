const { app, BrowserWindow } = require('electron');
const path = require('path');
const expressApp = require('./main'); 

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    useContentSize: true,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  mainWindow.maximize()
  mainWindow.webContents.openDevTools()

  mainWindow.loadURL('http://localhost:8001/');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);
