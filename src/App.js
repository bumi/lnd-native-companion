import React from 'react';
import {HashRouter,Link,Route,Switch, useHistory} from "react-router-dom";
import { createHashHistory } from 'history';

import logo from './logo.svg';
import './App.css';

//const Store = require('electron-store');
//const store = new Store();

const { ipcRenderer } = window.require('electron');

const browserChannel = "browser";
const lndChannel = "lnd";
const storageChannel = "store";

const store = {
  get: (key, defaultValue) => {
    return ipcRenderer.sendSync(storageChannel, 'get', key) || defaultValue;
  },
  set: (key, value) => {
    return ipcRenderer.sendSync(storageChannel, 'set', key, value);
  }
};

const reply = (data) => {
  return ipcRenderer.sendSync(browserChannel, data);
}

const Home = () => {
  return(
    <div>Home</div>
  )
};

const NotSupported = () => {
  return (
    <div>Not supported</div>
  )
}

class SendPayment extends React.Component {
  constructor (props) {
    super(props);
    const args = props.args || {};
    this.state = {
      paymentRequest: args.paymentRequest,
    };
  }

  pay () {
    const payResponse = ipcRenderer.sendSync(lndChannel, 'pay', {request: this.state.paymentRequest});
    ipcRenderer.sendSync(browserChannel, payResponse);
  }

  render () {
    return (
      <div>
        pay
        <p>{this.state.paymentRequest}</p>
        <button onClick={() => this.pay()}>Pay</button>
      </div>
    );
  }

}
class MakeInvoice extends React.Component {
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
    const createInvoiceResponse = ipcRenderer.sendSync(lndChannel, 'createInvoice', this.getInvoiceRequest());
    ipcRenderer.sendSync(browserChannel, createInvoiceResponse);
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

class SignMessage extends React.Component {

  constructor (props) {
    super(props);
    this.state = { message: props.args.message };
  }

  sign () {
    const signature = ipcRenderer.sendSync(lndChannel, 'signMessage', {message: this.state.message});
    ipcRenderer.sendSync(browserChannel, signature);
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

class Enable extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      remember: false,
      enabledSites: store.get('enabledSites'),
      ...props.origin
    }
  }

  allow () {
    if (this.state.remember) {
      store.set(`enabledSites.${this.state.domain}`, true);
    }
    reply({enabled: true});
  }

  reject () {
    if (this.state.remember) {
      store.set(`enabledSites.${this.state.domain}`, false);
    }
    reply({enabled: false});
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


class Settings extends React.Component {

  constructor (props) {
    super(props);
    this.state = store.get('settings.lnd', {});
  }

  save () {
    store.set({
      'settings.lnd': {
        macaroon: this.state.macaroon,
        cert: this.state.cert,
        socket: this.state.socket
      }
    });
  }

  render () {
    return (
      <div>
        Settings
        <p>{JSON.stringify(this.state)}</p>
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
    );
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    this.state = {args: {}, origin: {}};
  }

  componentDidMount () {
    ipcRenderer.on('main', (event, data) => {
      this.setState({args: data.args, origin: data.origin});
      this.history.push(data.command);
    });
  }

  render () {
    return (
      <HashRouter>
        <div className="App">
          <p>
            <img src={this.state.origin.icon} alt={this.state.origin.name} />
            {this.state.origin.domain}
          </p>
          <p>
            <Link to="/settings">Settings</Link>
          </p>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/settings" render={(props) => <Settings />} />
            <Route exact path="/enable" render={(props) => <Enable args={this.state.args} origin={this.state.origin} />} />
            <Route exact path="/signMessage" render={(props) => <SignMessage args={this.state.args} origin={this.state.origin} />} />
            <Route exact path="/makeInvoice" render={(props) => <MakeInvoice args={this.state.args} origin={this.state.origin} />} />
            <Route exact path="/SendPayment" render={(props) => <SendPayment args={this.state.args} origin={this.state.origin} />} />
            <Route component={NotSupported} />
          </Switch>
        </div>
      </HashRouter>
    );
  }
}

export default App;
