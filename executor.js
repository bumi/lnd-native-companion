const { BrowserWindow, Notification } = require('electron')
const lnService = require('ln-service');
const Store = require('electron-store');

const sendMessage = require('./sendMessage');
const commands = require('./commands');

module.exports = class Executor {
  constructor(app) {
    this.app = app;
    this.initStore();
    this.currentAccount = this.store.get('currentAccount', null);
    this.initLnd();
    this.sendMessage = sendMessage;
  }

  quit () {
    this.app.quit();
  }

  ln(command, args) {
    // TODO: nice notifications for each lnd call
    new Notification({title: 'Lightning', body: `Executing ${command} - ${JSON.stringify(args)}`}).show();
    return lnService[command]({
      lnd: this.lnd,
      ...args
    });
  }

  get accounts () {
    if (!this._accounts) {
      this._accounts = this.store.get('accounts', {});
    }
    return this._accounts;
  }

  initStore () {
    this.store = new Store();
    this.store.onDidChange('currentAccount', (newValue, oldValue) => {
      this.initLnd();
    });
    this.store.onDidChange('accounts', (newValue, oldValue) => {
      this._accounts = newValue;
    });
  }

  initLnd () {
    let account = this.accounts[this.currentAccount];
    if (account) {
      this.lnd = lnService.authenticatedLndGrpc({
        cert: account.cert,
        macaroon: account.macaroon,
        socket: account.socket
      }).lnd;
    } else {
      this.lnd = null;
    }
  }

  processMessage () {
    if (!this.currentBrowserMessage) {
      return;
    }
    if (Object.keys(this.accounts).length === 0) {
      console.log(`No accounts found. Starting Setup`);
      return this.show('setup');
    }
    const cmd = commands[this.currentBrowserMessage.command];
    if (cmd) {
      return cmd.apply(this, [this.currentBrowserMessage]);
    } else {
      return this.show(this.currentBrowserMessage.command, this.currentBrowserMessage);
    }
  }

  handleBrowserMessage(message) {
    this.currentBrowserMessage = message;
    this.processMessage();
  }

  show(route, message) {
    if (this.window) {
      this.window.loadURL(`http://localhost:3000/#/${route}`);
      if (message) {
        this.window.webContents.send('main', message);
      }
    } else {
      this.launchWindow(route, message);
    }
  }

  launchWindow(route, message) {
    return this.app.whenReady().then(() => {
      this.window = new BrowserWindow({
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
      this.window.webContents.openDevTools();
      this.window.removeMenu();

      this.window.loadURL(`http://localhost:3000/#/${route}`);

      this.window.once('ready-to-show', () => {
        this.window.show()
      });
      if (message) {
        this.window.webContents.on('did-finish-load', () => {
          this.window.webContents.send('main', message);
        });
      }
      return this.window;
    });
  }
}
