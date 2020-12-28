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
      defaultMemo: args.defaultMemo
    };
  }

  makeInvoice () {
    const createInvoiceResponse = ipc.lnd('createInvoice', this.getInvoiceRequest());
    ipc.reply(createInvoiceResponse);
  }

  getInvoiceRequest () {
    return {
      memo: this.state.memo,
      amount: this.state.amount
    };
  }

  render () {
    return (
      <div>
        make Invoice
        <input type="text" onChange={(e) => this.setState({memo: e.target.value})} />
        <input type="text" onChange={(e) => this.setState({amount: e.target.value})} />
        <button onClick={() => this.makeInvoice()}>Make Invoice</button>
      </div>
    );
  }

}

