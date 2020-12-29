import React from 'react';

import ipc from '../../utils/ipc';

export default class MakeInvoice extends React.Component {
  constructor (props) {
    super(props);
    const args = props.args || {};
    this.state = {
      amount: args.amount,
      defaultAmount: args.defaultAmount,
      minimumAmount: args.minimumAmount,
      maximumAmount: args.maximumAmount,
      memo: args.defaultMemo
    };
  }

  makeInvoice () {
    const createInvoiceResponse = ipc.lnd('createInvoice', this.getInvoiceRequest());
    ipc.reply({paymentRequest: createInvoiceResponse.data.request});
  }

  getInvoiceRequest () {
    return {
      description: this.state.memo,
      tokens: parseInt(this.state.amount),
      is_including_private_channels: true
    };
  }

  render () {
    return (
      <div>
        make Invoice
        Memo: <input type="text" value={this.state.memo} onChange={(e) => this.setState({memo: e.target.value})} />
        Amount: <input type="text" value={this.state.amount }onChange={(e) => this.setState({amount: e.target.value})} />
        <button onClick={() => this.makeInvoice()}>Make Invoice</button>
      </div>
    );
  }

}

