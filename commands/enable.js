const crypto = require('crypto');

module.exports = function (message) {
  const origin = message.origin;
  const enabledSites = this.store.get('enabledSites', {});
  // TODO: more detailed check
  const id = crypto.createHash('sha1').update(origin.domain).digest('hex');
  if (enabledSites[id] === true) {
    this.sendMessage({enabled: true});
  } else {
    this.show('/', message);
  }
}

