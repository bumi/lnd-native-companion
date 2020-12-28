import React from 'react';

import ipc from '../../utils/ipc';
import store from '../../utils/store';

const crypto = require('crypto');

export default class SendPayment extends React.Component {
  constructor (props) {
    super(props);
    const args = props.args || {};
    this.state = {
      paymentRequest: args.paymentRequest,
      remember: false
    };
  }

  pay () {
    if (this.state.remember && this.props.origin) {
      const id = crypto.createHash('sha1').update(this.props.origin.domain).digest('hex');
      store.set(`allowances.${id}`, {
        domain: this.props.origin.domain,
        amount: 0,
        timeframe: 0
      });
    }
    const payResponse = ipc.lnd('pay', {request: this.state.paymentRequest});
    ipc.reply(payResponse);
  }

  // TODO: implement proper allowance
  toggleAllowance () {
    this.setState({remember: !this.state.remember});
  }

  render () {
    return (
      <div>
        pay
        <p>{this.state.paymentRequest}</p>
        <p>{this.props.origin.domain}</p>
        <input type="checkbox" onChange={() => this.toggleAllowance()} />Remember?
        <button onClick={() => this.pay()}>Pay</button>
      </div>
    );
  }

}

