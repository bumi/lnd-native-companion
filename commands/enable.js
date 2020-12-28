module.exports = function (message) {
  const origin = message.origin;
  const enabledSites = this.store.get('enabledSites', {});
  // TODO: more detailed check
  if (enabledSites[origin.domain] === true) {
    this.sendMessage({enabled: true});
  } else {
    this.launchWindow('/', message);
  }
}

