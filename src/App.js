import React from 'react';
import {HashRouter,Link,Route,Switch,Redirect,useHistory} from "react-router-dom";
import { createHashHistory } from 'history';

import logo from './logo.svg';
import './App.css';

import store from './utils/store';

import Enable from './components/Enable';
import Home from './components/Home';
import MakeInvoice from './components/MakeInvoice';
import Settings from './components/Settings';
import SendPayment from './components/SendPayment';
import SignMessage from './components/SignMessage';

const { ipcRenderer } = window.require('electron');

const NotSupported = () => {
  return (
    <div>Not supported</div>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.history = createHashHistory();
    this.state = {
      args: {},
      origin: {},
      accounts: store.get('accounts', {}),
      currentCommand: 'home'
    };
  }

  componentDidMount () {
    ipcRenderer.on('main', (event, data) => {
      this.setState({args: data.args, origin: data.origin, currentCommand: data.command});
      // if there are no accounts yet we direct the user to the settings page
      if (Object.keys(this.state.accounts).length === 0) {
        this.history.push('/setup');
      } else {
        this.history.push(`/${data.command}`);
      }
    });
  }

  render () {
    return (
      <HashRouter>
        <div className="App">
          <div>
            {this.state.origin && (
              <div>
                <img src={this.state.origin.icon} alt={this.state.origin.name} />
                {this.state.origin.domain}
              </div>
            )}
          </div>
          <p>
            <Link to="/settings">Settings</Link>
          </p>
          <Switch>
            <Redirect exact from="/" to={this.state.currentCommand} />
            <Route exact path="/home" render={(props) => <Home args={this.state.args} origin={this.state.origin} />} />
            <Route exact path="/settings" render={(props) => <Settings />} />
            <Route exact path="/setup" render={(props) => <Settings />} />
            <Route exact path="/enable" render={(props) => <Enable args={this.state.args} origin={this.state.origin} />} />
            <Route exact path="/signMessage" render={(props) => <SignMessage args={this.state.args} origin={this.state.origin} />} />
            <Route exact path="/makeInvoice" render={(props) => <MakeInvoice args={this.state.args} origin={this.state.origin} />} />
            <Route exact path="/sendPayment" render={(props) => <SendPayment args={this.state.args} origin={this.state.origin} />} />
            <Route component={NotSupported} />
          </Switch>
        </div>
      </HashRouter>
    );
  }
}

export default App;
