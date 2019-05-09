import React, { Component } from 'react';

import './App.css';

import { Container, Segment, Form, Image, Header } from 'semantic-ui-react';
import { Proxy } from'braid-client';
import { TemplateLibrary, Template, Clause } from '@accordproject/cicero-core';

const DEFAULT_TEMPLATE = `https://templates.accordproject.org/archives/promissory-note@0.11.1.cta`;

class App extends Component {

  constructor(props) {

    super(props);
    this.state = {
      promissoryNotesIssued: [],
      contractText: 'THIS IS THE CONTRACT',
      jsonData: JSON.stringify({
        '$class': 'org.accordproject.promissorynote.PromissoryNoteContract',
        'contractId': '157c367c-b39a-43bc-b260-07329b236ce3',
        'amount': {
          '$class': 'org.accordproject.money.MonetaryAmount',
          'doubleValue': 1000,
          'currencyCode': 'USD'
        },
        'date': '2018-01-30',
        'maker': 'Daniel Selman',
        'interestRate': 3.8,
        'individual': true,
        'makerAddress': '1 Main Street',
        'lender': 'Clause',
        'legalEntity': 'CORP',
        'lenderAddress': '246 5th Ave, 3rd Fl, New York, NY 10001',
        'principal': {
          '$class': 'org.accordproject.money.MonetaryAmount',
          'doubleValue': 500,
          'currencyCode': 'USD'
        },
        'maturityDate': '2019-01-20',
        'defaultDays': 90,
        'insolvencyDays': 90,
        'jurisdiction': 'New York, NY'
      })
    };

    let onOpen = () => { console.log('Connected to the node.'); };
    let onClose = () => { console.log('Disconnected from node.'); };
    let onError = (err) => { console.error(err); } ;

    this.braid = new Proxy({
      url: 'http://localhost:9002/api/'
    }, onOpen, onClose, onError, { strictSSL: false });

    this.issuePromissoryNotes = this.issuePromissoryNotes.bind(this);
    this.issuePromissoryNotesJSON = this.issuePromissoryNotesJSON.bind(this);
    this.getIssuedPromissoryNotes = this.getIssuedPromissoryNotes.bind(this);

    this.loadTemplateFromUrl = this.loadTemplateFromUrl.bind(this);
  }

  componentDidMount() {
    this.loadTemplateFromUrl(DEFAULT_TEMPLATE);
  }

  loadTemplateFromUrl(templateURL) {
    console.log(`Loading template:  ${templateURL}`);
    let newState = {};
    let promisedTemplate;
    try {
      promisedTemplate = Template.fromUrl(templateURL);
    } catch (error) {
      console.log(`LOAD FAILED! ${error.message}`); // Error!
      return false;
    }
    return promisedTemplate.then((template) => {
      newState.clause = new Clause(template);
      newState.contractText = template.getMetadata().getSamples().default;
      newState.jsonData = 'null';
      this.setState(newState);
      return true;
    }, (reason) => {
      console.log(`LOAD FAILED! ${reason.message}`); // Error!
      return false;
    });
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

  issuePromissoryNotesJSON() {
    const clause = this.state.clause;
    clause.parse(this.state.contractText);
    const jsonData = JSON.stringify(clause.getData(), null, 2);
    let braidPromise = this.braid.flows.PromissoryNoteIssueJSONFlow(this.state.contractText, jsonData);
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
      <Container className="App" style={{ marginTop: '3em', marginBottom: '3em' }}>
        <Image.Group size='small'>
          <Image src="static/cordalogo.png" />
          <Image src="static/aplogo.png" />
        </Image.Group>
        <Header as='h1' color="red">
          Welcome to the Corda & Accord Project Bank
        </Header>
        <div>
          <Form>
            <Form.TextArea label="Contract Text"
                           rows="25"
                           value={this.state.contractText}
                           onChange={(event,data) => this.setState({contractText : data.value})} />
            {this.state.loading ? <button>Talking to the node...</button> : <button onClick = {(() => this.issuePromissoryNotesJSON())}>Issue Note</button>}
            <button onClick = {(() => this.getIssuedPromissoryNotes())}>Get Promissory Notes</button>
          </Form>
        </div>
        <div>
          {this.state.promissoryNotesIssued.map((ele) => {
            const id = JSON.parse(ele).LinearId;
            return <Segment inverted key={id}>{ele}</Segment>;
          })}
        </div>
      </Container>
    );
  }
}

export default App;
