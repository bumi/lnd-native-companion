const { ipcRenderer } = window.require('electron');

const ipc = {
  reply: (data) => {
    return ipcRenderer.sendSync('browser', data);
  },
  lnd: (command, args) => {
    return ipcRenderer.sendSync('lnd', command, args);
  },
  restart: () => {
    return ipcRenderer.sendSync('main', 'restart');
  }
};

export default ipc;

