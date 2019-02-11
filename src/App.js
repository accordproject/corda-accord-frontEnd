import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';

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
      url: 'http://localhost:9002/api/'
    }, onOpen, onClose, onError, { strictSSL: false });

  }
  
  async getIssuedPromissoryNotes() {
    console.log(this.braid);
    let data = await this.braid.PromissoryNotesInterface.getIssuedPromissoryNotes();
    console.log(data);
    this.setState({
      promissoryNotesIssues: data
    })
  }

  issuePromissoryNotes() {
    console.log("clicked");
    console.log(this.braid.flows.PromissoryNoteIssueFlow)
    let braidPromise = this.braid.flows.PromissoryNoteIssueFlow("ParticipantA", "ParticipantB");
    braidPromise.then((data) => {
      console.log("happening");
      console.log(data)
    }).catch((error) => {
      console.log(error);
    });
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
            <button onClick = {(() => this.issuePromissoryNotes())}>Issue Promissory Note</button>
            <button onClick = {(() => this.getIssuedPromissoryNotes())}>Get Promissory Notes</button>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
