import React from 'react';

import ipc from '../../utils/ipc';

export default class SignMessage extends React.Component {

  constructor (props) {
    super(props);
    this.state = { message: props.args.message };
  }

  sign () {
    const resp = ipc.lnd('signMessage', {message: this.state.message});
    ipc.reply({message: this.state.message, signature: resp.data.signature});
  }

  render () {
    return (
      <div>
        Sign
        <p>{JSON.stringify(this.state.message)}</p>
        <button onClick={() => this.sign()}>Sign</button>
      </div>
    );
  }
}

