module.exports = function (message) {
  this.ln('getWalletInfo').then(info => {
    this.sendMessage(info);
    this.quit();
  });
}

