import React from 'react';
import { createHashHistory } from 'history';

import ipc from '../../utils/ipc';
import store from '../../utils/store';

const crypto = require('crypto');

export default class Settings extends React.Component {

  constructor (props) {
    super(props);
    this.history = createHashHistory();

    let accounts = store.get('accounts', {});
    let currentAccount = store.get('currentAccount', '');
    let account = accounts[currentAccount] || {macaroon: '', cert: '', socket: ''};
    this.state = {
      showNewForm: currentAccount === '',
      accounts,
      currentAccount,
      macaroon: account.macaroon,
      cert: account.cert,
      socket: account.socket
    }
  }

  save () {
    let accountId = this.getAccountId(this.state.socket);
    store.set('currentAccount', accountId);
    store.set(`accounts.${accountId}`, {
      macaroon: this.state.macaroon,
      cert: this.state.cert,
      socket: this.state.socket
    });
    this.history.goBack();
  }

  resetSettings () {
    store.clear();
    this.history.push('/');
  }

  getAccountId(socket) {
    return crypto.createHash('sha1').update(socket).digest('hex');
  }

  selectAccount (accountId) {
    if (accountId === 'new') {
      this.setState({
        showNewForm: true,
        currentAccount: '',
        macaroon: '',
        cert: '',
        socket: ''
      });
    } else {
      let account = this.state.accounts[accountId] || {};
      store.set('currentAccount', accountId);
      this.setState({
        showNewForm: false,
        currentAccount: accountId,
        macaroon: account.macaroon,
        cert: account.cert,
        socket: account.socket
      });
    this.history.goBack();
    }
  }

  render () {
    return (
      <div>
        Settings
        <p>{JSON.stringify(this.state)}</p>
        <select value={this.state.currentAccount} onChange={(e) => this.selectAccount(e.target.value)}>
          <option key={'new'} value={'new'}>New Account</option>
          {
            Object.keys(this.state.accounts).map((accountId, index) => {
              return <option key={accountId} value={accountId}>{this.state.accounts[accountId].socket}</option>
            })
          }
        </select>
        { this.state.showNewForm && (
          <div>
            New Account:
            <p>
              Macaroon: <input type="text" value={this.state.macaroon} onChange={(e) => this.setState({macaroon: e.target.value}) } />
            </p>
            <p>
              Cert: <input type="text" value={this.state.cert} onChange={(e) => this.setState({cert: e.target.value}) } />
            </p>
            <p>
              Address: <input type="text" value={this.state.socket} onChange={(e) => this.setState({socket: e.target.value}) } />
            </p>
            <button onClick={() => this.save()}>Save</button>
          </div>
        )}
        <p><button onClick={() => this.resetSettings()}>Reset settings</button></p>
      </div>
    );
  }
}

