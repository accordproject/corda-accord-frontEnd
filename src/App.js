import React, { Component, useCallback } from 'react';

import './App.css';

import { Container,
         Segment,
         Form,
         Image,
         Header,
         Button,
         Menu,
         Table } from 'semantic-ui-react';
import { Proxy } from'braid-client';
import { TemplateLibrary, Template, Clause } from '@accordproject/cicero-core';
import { TemplateLoadingClauseEditor } from '@accordproject/cicero-ui';
import initialMarkdown from './initialMarkdown';

const DEFAULT_TEMPLATE = 'http://localhost:8080/static/promissory-note@0.11.2.cta';

/**
 * A demo component that uses TemplateLoadingClauseEditor
 * @param {*} props
 */
// eslint-disable-next-line require-jsdoc, no-unused-vars
function PromissoryNoteEditor(props) {
  /**
   * Called when the data in the editor has been modified
   */
  const onChange = useCallback((value, markdown) => {
    props.onChange(value,markdown);
  }, []);

  /**
   * Called when the data in the editor has been parsed
   */
  const onParse = useCallback((newParseResult) => {
    props.onParse(newParseResult);
  }, []);

  return (
      <div>
        <TemplateLoadingClauseEditor
          lockText={false}
          markdown={props.initialMarkdown}
          templateUrl={DEFAULT_TEMPLATE}
          onChange={onChange}
          onParse={onParse}
          showEditButton={false}
          showMessage={false}
        />
      </div>
  );
}
class App extends Component {

  constructor(props) {

    super(props);
    this.state = {
      loading: false,
      issuing: true,
      promissoryNotesIssued: [],
      owner: '',
      contractText: initialMarkdown,
      jsonData: 'null',
    };

    const onOpen = () => {
      this.getOwner();
      console.log('Connected to the node.');
    };
    const onClose = () => { console.log('Disconnected from node.'); };
    const onError = (err) => { console.error(err); } ;

    this.braid = new Proxy({
      url: 'http://localhost:9002/api/'
    }, onOpen, onClose, onError, { strictSSL: false });

    this.issuePromissoryNotes = this.issuePromissoryNotes.bind(this);
    this.issuePromissoryNotesJSON = this.issuePromissoryNotesJSON.bind(this);
    this.getIssuedPromissoryNotes = this.getIssuedPromissoryNotes.bind(this);
    this.getOwner = this.getOwner.bind(this);

  }

  async getIssuedPromissoryNotes() {
    let data = await this.braid.PromissoryNotesInterface.getIssuedPromissoryNotes();
    console.log('DATA' + JSON.stringify(data));
    this.setState({
      promissoryNotesIssued: JSON.parse(data)
    });
  }

  async getOwner() {
    let data = await this.braid.PromissoryNotesInterface.getOwner();
    this.setState({
      owner: data
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
    const { jsonData, contractText } = this.state;
    let braidPromise = this.braid.flows.PromissoryNoteIssueJSONFlow(contractText, jsonData);
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
        <Header as='h3' color="red">
          ({ this.state.owner })
        </Header>
        <div>
          <Menu color='red'>
            <Menu.Item
              name='issuing'
              active={this.state.issuing}
              onClick={(() => { this.setState({ issuing: true }); })}
            >
              Notes Issuance
            </Menu.Item>
            <Menu.Item
              name='records'
              active={!this.state.issuing}
              onClick={(() => {
                this.setState({ issuing: false });
                this.getIssuedPromissoryNotes();
              })}
            >
              Notes Records
            </Menu.Item>
          </Menu>
           <Segment>
             { this.state.issuing ?
               <div>
                 { this.state.loading ?
                   <Button fluid
                           color='red'>Talking to the node...</Button> :
                   <Button fluid
                           color='red'
                           onClick = {(() => this.issuePromissoryNotesJSON())}>Sign & Issue</Button> }
                 <PromissoryNoteEditor
                   initialMarkdown={ this.state.contractText }
                   onChange={(value,contractText) => { this.setState({ contractText }); }}
                   onParse={(jsonData) => { this.setState({ jsonData: JSON.stringify(jsonData) }); }}
                 />
               </div> :
               <Table celled>
               <Table.Header>
               <Table.Row>
               <Table.HeaderCell>Maker</Table.HeaderCell>
               <Table.HeaderCell>Issuer</Table.HeaderCell>
               <Table.HeaderCell>Amount</Table.HeaderCell>
               <Table.HeaderCell>Issued</Table.HeaderCell>
               </Table.Row>
               </Table.Header>
               <Table.Body>
                 {
                   this.state.promissoryNotesIssued.map((ele) => {
                     const data =JSON.parse(ele);
                     const id = data.LinearId;
                     return <Table.Row key={id}>
                              <Table.Cell>{data.MakerCordaParty}</Table.Cell>
                              <Table.Cell>{data.LenderCordaParty}</Table.Cell>
                              <Table.Cell>{data.AmountQuantity + ' ' + data.AmountToken}</Table.Cell>
                              <Table.Cell>{data.IssuedOn}</Table.Cell>
                            </Table.Row>; })
                 }
               </Table.Body>
               </Table>
             }
           </Segment>
        </div>
      </Container>
    );
  }
}

export default App;
