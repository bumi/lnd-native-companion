const crypto = require('crypto');

function hasAllowance(allowances, origin) {
  if (origin && origin.domain) {
    const id = crypto.createHash('sha1').update(origin.domain).digest('hex');
    // TODO: add allowance checks
    return allowances[id];
  }
  return false;
}

module.exports = function (message) {
  const allowances = this.store.get('allowances', {});
  if (hasAllowance(allowances, message.origin)) {
    return this.ln('pay', {request: message.args.paymentRequest})
      .then(response => {
        this.sendMessage(response);
      })
      .catch(e => this.sendMessage({ error: e}));
  }
  return this.launchWindow('/', message);
}

