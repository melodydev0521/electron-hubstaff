'use strict';
const {app, BrowserWindow} = require('electron');
// Associated cmd switches:
// app.commandLine.appendSwitch('--allow-http-screen-capture');
// app.commandLine.appendSwitch('--enable-usermedia-screen-capturing');

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();
require('electron-unhandled')();

// Prevent window being garbage collected
let mainWindow;

function onClosed() {
    // Dereference the window
    // For multiple windows store them in an array
    mainWindow = null;
}

function createMainWindow() {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        title: require('./package.json').productName,
        height: 680,
        width: 340,
        minWidth: 340,
        maxWidth: 500,
        minHeight: 680,
        icon: './src/icon.jpeg',
        webPreferences: {
            devTools: false,
            nodeIntegration: true,
            preload: require('path').join(__dirname, 'preload.js')
        }
    });

    const url = require('url').format({
        protocol: 'file',
        slashes: true,
        pathname: require('path').join(__dirname, 'src/index.html')
    });

    win.loadURL(url);
    win.on('closed', onClosed);

    return win;
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
});

app.on('ready', () => {
    mainWindow = createMainWindow();
});
