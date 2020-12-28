const { app, BrowserWindow, ipcMain } = require('electron')
const sendMessage = require('./protocol')(handleBrowserMessage);
const lnService = require('ln-service');
const Store = require('electron-store');
const store = new Store();

const Executor = require('./executor');

const lndChannel = "lnd";
const browserChannel = "browser";
const storageChannel = "store";

const executor = new Executor(app);

function handleBrowserMessage(message) {
  executor.handleBrowserMessage(message);
}

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on(lndChannel, (event, command, args) => {
  executor.ln(command, args)
    .then(response => {
      event.returnValue = {data: response};
    })
    .catch(error => {
      event.returnValue = {error: error};
    });
});

ipcMain.on(browserChannel, (event, message) => {
  executor.sendMessage(message);
  event.returnValue = 'sent';
});

ipcMain.on(storageChannel, (event, command, ...args) => {
  if (command === 'get') {
    event.returnValue = executor.store.get(...args);
  } else if (command === 'set') {
    event.returnValue = executor.store.set(...args);
  }
});
