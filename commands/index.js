const fs = require('fs');

const commands = {
  getInfo: require('./getInfo'),
  enable: require('./enable'),
  sendPayment: require('./sendPayment')
};

module.exports = commands;
