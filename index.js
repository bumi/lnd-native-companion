const { app, BrowserWindow, ipcMain } = require('electron')
const sendMessage = require('./protocol')(handleBrowserMessage);
const lnService = require('ln-service');
const Store = require('electron-store');
const store = new Store();

const lndChannel = "lnd";
const browserChannel = "browser";
const storageChannel = "store";

store.onDidChange('settings.lnd', (newValue, oldValue) => {
  initLnd(newValue);
});

let lnd = null;
function initLnd(settings) {
  if (!settings) { return; }
  lnd = lnService.authenticatedLndGrpc(settings).lnd;
};
initLnd(store.get('settings.lnd', null));


function handleBrowserMessage(message){
  // TODO: validate message to have origin data and arguments
  app.whenReady().then(() => {
    if (message.command === 'enable') {
      const origin = message.origin;
      const enabledSites = store.get('enabledSites', {});
      // TODO: more detailed check
      if (enabledSites[origin.domain] === true) {
        sendMessage({enabled: true});
      } else {
        launchWindow().then(win => {
          win.webContents.on('did-finish-load', () => {
            win.webContents.send('main', message);
          });
        });
      }
    } else if (message.command === 'getInfo') {
      lnService.getWalletInfo({lnd}).then(info => {
        sendMessage(info);
        app.quit();
      });
      return;
    } else {
      launchWindow('').then(win => {
        win.webContents.on('did-finish-load', () => {
          win.webContents.send('main', message);
        })
      });
    }
  });
}

function launchWindow(route) {
  if (!route) {
    route = '';
  }
  return app.whenReady().then(() => {
    const window = new BrowserWindow({
      width: 800,
      height: 600,
      modal: true,
      minimizable: false,
      maximizable: false,
      title: 'Joule',
      backgroundColor: "#D6D8DC",
      show: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        devTools: true
      }
    });
    window.webContents.openDevTools();
    window.removeMenu();

    window.loadURL(`http://localhost:3002/#/${route}`);

    window.once('ready-to-show', () => {
      window.show()
    });
    return window;
  });
}

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on(lndChannel, (event, command, args) => {
  if (lnService.hasOwnProperty(command)) {
    lnService[command]({lnd, ...args})
      .then(response => {
        event.returnValue = {data: response};
      })
      .catch(error => {
        event.returnValue = {error: error};
      });
  } else {
    event.returnValue = {error: new Error(`${command} undefined`)};
  }
});

ipcMain.on(browserChannel, (event, message) => {
  sendMessage(message);
  event.returnValue = 'sent';
});

ipcMain.on(storageChannel, (event, command, ...args) => {
  if (command === 'get') {
    event.returnValue = store.get(...args);
  } else if (command === 'set') {
    event.returnValue = store.set(...args);
  }
});
