import React from 'react';

import ipc from '../../utils/ipc';
import store from '../../utils/store';

const crypto = require('crypto');

export default class Enable extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      remember: false,
      enabledSites: store.get('enabledSites'),
      ...props.origin
    }
  }

  get domainId() {
    return crypto.createHash('sha1').update(this.state.domain).digest('hex');
  }

  allow () {
    if (this.state.remember) {
      store.set(`enabledSites.${this.domainId}`, true);
    }
    ipc.reply({enabled: true});
  }

  reject () {
    if (this.state.remember) {
      store.set(`enabledSites.${this.domainId}`, false);
    }
    ipc.reply({enabled: false});
  }

  toggleRemember () {
    this.setState({remember: !this.state.remember});
  }

  render () {
    return (
      <div>
        Enable?
        <p>{JSON.stringify(this.state)}</p>
        <input type="checkbox" onChange={() => this.toggleRemember()} />Remember?
        <button onClick={() => this.reject()}>Reject</button>
        <button onClick={() => this.allow()}>Enable</button>
      </div>
    );
  }
}


