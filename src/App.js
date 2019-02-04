import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';

const Proxy = require('braid-client').Proxy;

// Connects to Braid running on the node.
let braid = new Proxy({
  url: "http://localhost:8080/api/"
}, onOpen, onClose, onError, { strictSSL: false });

function onOpen() { console.log('Connected to node.'); }
function onClose() { console.log('Disconnected from node.'); }
function onError(err) { console.error(err); }

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodeData: '',
    };
  }

  startFlowButtonClicked() {
    braid.flows.whoAmIFlow(
      result => console.log("Hey, you're speaking to " + result + "!"),
      err => console.log(err));
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Welcome to the Bank of Corda.
          </p>
          <button onClick = {() => { this.startFlowButtonClicked() }}>Start IssueCash Flow</button>
        </header>
      </div>
    );
  }
}

export default App;
