import React, { Component } from 'react';
import logo from './logo.png';
import './App.css';

const Proxy = require('braid-client').Proxy;

class App extends Component {

  constructor(props) {

    super(props);
    this.state = {
      promissoryNotesIssued: []
    };

    let onOpen = () => { console.log('Connected to the node.') };
    let onClose = () => { console.log('Disconnected from node.')} ;
    let onError = (err) => { console.error(err)} ;

    this.braid = new Proxy({
      url: 'http://localhost:9002/api/'
    }, onOpen, onClose, onError, { strictSSL: false });

  }
  
  async getIssuedPromissoryNotes() {
    let data = await this.braid.PromissoryNotesInterface.getIssuedPromissoryNotes();
    this.setState({
      promissoryNotesIssued: JSON.parse(data)
    })
  }

  issuePromissoryNotes() {
    let braidPromise = this.braid.flows.PromissoryNoteIssueFlow("ParticipantA", "ParticipantB");
    this.setState({
      loading: true
    });
    braidPromise.then((data) => {
      console.log(data);
      this.setState({
        loading: false
      });
    }).catch((error) => {
      console.log(error);
      this.setState({
        loading: false
      });
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
            {this.state.loading ? <button>Talking to the node...</button> : <button onClick = {(() => this.issuePromissoryNotes())}>Issue Promissory Note</button>}
            <button onClick = {(() => this.getIssuedPromissoryNotes())}>Get Promissory Notes</button>
          </div>
          <div className = "promissory-notes">
            {this.state.promissoryNotesIssued.map((ele) => {
              return (<div>{ele}</div>)
            })}
          </div>
        </header>
      </div>
    );
  }
}

export default App;
