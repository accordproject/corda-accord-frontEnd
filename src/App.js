import React, { Component } from 'react';
import cordalogo from './cordalogo.png';
import aplogo from './aplogo.png';
import './App.css';
import { Container, Segment, Input, Form } from 'semantic-ui-react';

const Proxy = require('braid-client').Proxy;

class App extends Component {

  constructor(props) {

    super(props);
    this.state = {
      promissoryNotesIssued: []
    };

    let onOpen = () => { console.log('Connected to the node.'); };
    let onClose = () => { console.log('Disconnected from node.'); };
    let onError = (err) => { console.error(err); } ;

    this.braid = new Proxy({
      url: 'http://localhost:9002/api/'
    }, onOpen, onClose, onError, { strictSSL: false });

    this.issuePromissoryNotes = this.issuePromissoryNotes.bind(this);
    this.getIssuedPromissoryNotes = this.getIssuedPromissoryNotes.bind(this);
  }
  
  async getIssuedPromissoryNotes() {
    let data = await this.braid.PromissoryNotesInterface.getIssuedPromissoryNotes();
    this.setState({
      promissoryNotesIssued: JSON.parse(data)
    });
  }

  issuePromissoryNotes() {
    let braidPromise = this.braid.flows.PromissoryNoteIssueFlow();
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
          <Container style={{ marginTop: '7em', marginBottom: '9em' }}>
            <img src={cordalogo} className="App-logo" alt="logo" />
            <img src={aplogo} className="App-logo" alt="logo" />
            <p className = "welcome-message">
              Welcome to the Corda & Accord Project Bank
            </p>
            <div>
              {this.state.loading ? <button>Talking to the node...</button> : <button onClick = {(() => this.issuePromissoryNotes())}>Issue Promissory Note</button>}
              <button onClick = {(() => this.getIssuedPromissoryNotes())}>Get Promissory Notes</button>
            </div>
            <div>
              {this.state.promissoryNotesIssued.map((ele) => {
                  const id = JSON.parse(ele).LinearId;
                  return <Segment inverted key={id}>{ele}</Segment>;
              })}
            </div>
          </Container>
        </header>
      </div>
    );
  }
}

export default App;
