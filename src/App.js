import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';
import axios from 'axios'

const Proxy = require('braid-client').Proxy;

class App extends Component {

  constructor(props) {

    super(props);
    this.state = {
      cordaNodeWebAddress:'',
      cordaNodes: [],
      errorMessage: ''
    };

    let onOpen = () => { console.log('Connected to the node.') };
    let onClose = () => { console.log('Disconnected from node.')} ;
    let onError = (err) => { console.error(err)} ;

    this.braid = new Proxy({
      url: 'http://localhost:9000/api/'
    }, onOpen, onClose, onError, { strictSSL: false });

  }

  addNodeButtonClickHandler() {
      axios.get(this.state.cordaNodeWebAddress + "/api/bank/simple-cash-query").then((res) => {
        console.log(res.data);
        if (!this.state.cordaNodes.includes(this.state.cordaNodeWebAddress)) {
          this.setState({
            cordaNodes: this.state.cordaNodes.concat(this.state.cordaNodeWebAddress)
          })
        }
      }).catch((e) => {
        console.log(e);
      })
  }

  getCashStatesButtonClickHandler() {
    axios.get(this.state.cordaNodeWebAddress + "/api/bank/simple-cash-query").then((res) => {
      console.log(res.data);
    }).catch((e) => {
      console.log(e);
    })
  }

  triggerCashIssueAndPaymentFlowClickHandler() {
    let data = {
      "amount": 9994,
      "issueToPartyName": "BigCorporation",
      "notaryName": "Notary Service"
    }

    var headers = {
      "Content-Type": "application/json" 
    }

    axios.post(this.state.cordaNodeWebAddress + "/api/bank/simple-issue-and-payment", JSON.stringify(data), headers).then((res) => {
      console.log(res.data);
    }).catch((e) => {
      console.log(e);
    })
  }

  handleNodeWebAddressChange(e) {
    this.setState({cordaNodeWebAddress: e.target.value})
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p className = "welcome-message">
            Welcome to the Bank of Corda.
          </p>
          <div>
            {this.state.cordaNodes.map((cordaNode) => {
              return (
              <div>
                <div>{cordaNode.toString()}</div>
                <button onClick = {(() => this.getCashStatesButtonClickHandler())}>Query for Cash States</button>
                <button onClick = {(() => this.triggerCashIssueAndPaymentFlowClickHandler())}>Start IssueAndPaymentFlow</button>
              </div>)
            })}
          </div>
          <input onChange = {(e) => { this.handleNodeWebAddressChange(e) }} placeholder = "Enter node web-server address"></input>
          {this.state.cordaNodes.length === 0 && this.state.cordaNodeWebAddress && this.state.cordaNodeWebAddress.length > 0 ? <button onClick = {() => { this.addNodeButtonClickHandler() }}>Connect</button> : null}
        </header>
      </div>
    );
  }
}

export default App;
