const { ipcRenderer } = window.require('electron');

const store = {
  get: (key, defaultValue) => {
    return ipcRenderer.sendSync('store', 'get', key) || defaultValue;
  },
  set: (key, value) => {
    return ipcRenderer.sendSync('store', 'set', key, value);
  }
};

export default store;
