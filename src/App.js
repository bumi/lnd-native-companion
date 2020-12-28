import React from 'react';
import {HashRouter,Link,Route,Switch, useHistory} from "react-router-dom";
import { createHashHistory } from 'history';

import logo from './logo.svg';
import './App.css';

import Enable from './components/Enable';
import Home from './components/Home';
import MakeInvoice from './components/SendPayment';
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
