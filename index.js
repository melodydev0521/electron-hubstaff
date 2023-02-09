'use strict';
const {app, BrowserWindow} = require('electron');
// Associated cmd switches:
// app.commandLine.appendSwitch('--allow-http-screen-capture');
// app.commandLine.appendSwitch('--enable-usermedia-screen-capturing');

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();
require('electron-unhandled')();


if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

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
        pathname: require('path').join(__dirname, 'src/login.html')
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

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
    return false;
    }
    const ChildProcess = require('child_process');
    const path = require('path');
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
    const spawn = function(command, args) {
    let spawnedProcess, error;
    try {
    spawnedProcess = ChildProcess.spawn(command, args, {
    detached: true
    });
    } catch (error) {}
    return spawnedProcess;
    };
    const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
    };
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
    // Optionally do things such as:
    // - Add your .exe to the PATH
    // - Write to the registry for things like file associations and
    //   explorer context menus
    // Install desktop and start menu shortcuts
    spawnUpdate(['--createShortcut', exeName]);
    setTimeout(application.quit, 1000);
    return true;
    case '--squirrel-uninstall':
    // Undo anything you did in the --squirrel-install and
    // --squirrel-updated handlers
    // Remove desktop and start menu shortcuts
    spawnUpdate(['--removeShortcut', exeName]);
    setTimeout(application.quit, 1000);
    return true;
    case '--squirrel-obsolete':
    // This is called on the outgoing version of your app before
    // we update to the new version - it's the opposite of
    // --squirrel-updated
    application.quit();
    return true;
    }
};
