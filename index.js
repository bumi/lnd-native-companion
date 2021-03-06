const { app, ipcMain } = require('electron')

const log = require('electron-log');
log.transports.file.level = true;
log.transports.console.level = false;
console.log = log.log;

const receiveMessages = require('./receiveMessages');

const Executor = require('./executor');

const lndChannel = "lnd";
const browserChannel = "browser";
const storageChannel = "store";
const mainChannel = "main";

const executor = new Executor(app);

receiveMessages(message => {
  app.whenReady().then(() => {
    log.info(`New browser message: ${JSON.stringify(message)}`);
    executor.handleBrowserMessage(message);
  });
});

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
  } else if (command === 'clear') {
    event.returnValue = executor.store.clear();
  }
});

ipcMain.on(mainChannel, (event, command) => {
  console.log(`Main channel ipc command: ${command}`);
  if (command === 'restart') {
    executor.processMessage();
  }
});
