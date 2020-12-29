const { BrowserWindow } = require('electron')
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
    return lnService[command]({
      lnd: this.lnd,
      ...args
    });
  }

  get accounts () {
    return this.store.get('accounts', {});
  }

  initStore () {
    this.store = new Store();
    this.store.onDidChange('currentAccount', (newValue, oldValue) => {
      this.initLnd();
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

  handleBrowserMessage(message) {
    const cmd = commands[message.command];
    if (cmd) {
      return cmd.apply(this, [message]);
    } else {
      return this.show(`/${message.command}`, message);
    }
  }

  show(route, message) {
    if (this.window) {
      this.window.loadURL(`http://localhost:3002/#${route}`);
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

      this.window.loadURL(`http://localhost:3002/#${route}`);

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
