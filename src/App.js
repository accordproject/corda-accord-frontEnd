import React, { Component, useCallback } from 'react';

import './App.css';

import { Container,
         Dropdown,
         Segment,
         Form,
         Image,
         Header,
         Button,
         Menu,
         Table,
         Modal,
         Dimmer,
         Loader, } from 'semantic-ui-react';
import { Proxy } from'braid-client';
import { TemplateLibrary, Template, Clause } from '@accordproject/cicero-core';
import { TemplateLoadingClauseEditor } from '@accordproject/cicero-ui';
import initialMarkdown from './initialMarkdown';
import moment from 'moment-mini';

const DEFAULT_TEMPLATE = 'http://localhost:8080/static/promissory-note@0.11.2.cta';
const CORDA_NODES = [{key:"O=Notary,L=London,C=GB",text:"O=Notary,L=London,C=GB",value:9003,initialMarkdown:initialMarkdown("Notary")},
                     {key:"O=Daniel,L=NY,C=US",text:"O=Daniel,L=NY,C=US",value:9005,initialMarkdown:initialMarkdown("Daniel")},
                     {key:"O=Clause Inc., L=NY, C=US",text:"O=Clause Inc., L=NY, C=US",value:9007,initialMarkdown:initialMarkdown("Clause Inc.")},
                     {key:"O=Jason,L=NY,C=US",text:"O=Jason,L=NY,C=US",value:9009,initialMarkdown:initialMarkdown("Jason")},
                     {key:"O=R3 LLC, L=NY, C=US",text:"O=R3 LLC, L=NY, C=US",value:9011,initialMarkdown:initialMarkdown("R3 LLC")}];
const seedMarkdown = (port) => {
  return CORDA_NODES.find(function(element) {
    return element.value === port;
  }).initialMarkdown;
};
const nodesTable = CORDA_NODES.map((element) => { return { key: element.key, text: element.text, value: element.value }; });

/**
 * A demo component that uses TemplateLoadingClauseEditor
 * @param {*} props
 */
// eslint-disable-next-line require-jsdoc, no-unused-vars
const PromissoryNoteEditor = (props) => {
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
          lockText={props.lockText}
          markdown={props.initialMarkdown}
          templateUrl={DEFAULT_TEMPLATE}
          onChange={onChange}
          onParse={onParse}
          showEditButton={false}
          showMessage={false}
          showParse={props.showParse}
        />
      </div>
  );
}

const formatDate = (date) => {
  const thisDate = moment(date).add(1,'days');
  return thisDate.format('MMMM DD, YYYY');
};

const AttachmentModal = (contractText, date) => (
  <Modal trigger={<Button compact fluid color='green' size='mini'>Retrieve</Button>}>
    <Modal.Header>As Issued On {formatDate(date)}</Modal.Header>
    <Modal.Content>
      <PromissoryNoteEditor
        lockText={true}
        initialMarkdown={ contractText }
        onChange={(value,contractText) => { }}
        onParse={(jsonData) => { }}
        showParse={false}
      />
    </Modal.Content>
  </Modal>
);

const issuedPane = (issued, owner) => {
  return (
    <div>
      <Table celled color="green" key="owed" compact='very'>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan='5'>Owed</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>By</Table.HeaderCell>
            <Table.HeaderCell>Principal</Table.HeaderCell>
            <Table.HeaderCell>Issued</Table.HeaderCell>
            <Table.HeaderCell>Maturity</Table.HeaderCell>
            <Table.HeaderCell>Contract Text</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            issued.map((ele) => {
              const data =JSON.parse(ele);
              if (data.LenderCordaParty === owner) {
                const id = data.LinearId;
                return <Table.Row key={id}>
                         <Table.Cell>{data.MakerCordaParty}</Table.Cell>
                         <Table.Cell>{data.AmountQuantity + ' ' + data.AmountToken}</Table.Cell>
                         <Table.Cell>{formatDate(data.IssuedOn)}</Table.Cell>
                         <Table.Cell>{formatDate(data.MaturityDate)}</Table.Cell>
                         <Table.Cell>{AttachmentModal(data.ContractText, data.IssuedOn)}</Table.Cell>
                       </Table.Row>;
              } else {
                return null;
              }
            })
          }
        </Table.Body>
      </Table>
      <Table celled color="red" key="due" compact='very'>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan='5'>Due</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>To</Table.HeaderCell>
            <Table.HeaderCell>Principal</Table.HeaderCell>
            <Table.HeaderCell>Issued</Table.HeaderCell>
            <Table.HeaderCell>Maturity</Table.HeaderCell>
            <Table.HeaderCell>Contract Text</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            issued.map((ele) => {
              const data =JSON.parse(ele);
              if (data.MakerCordaParty === owner) {
                const id = data.LinearId;
                return <Table.Row key={id}>
                         <Table.Cell>{data.LenderCordaParty}</Table.Cell>
                         <Table.Cell>{data.AmountQuantity + ' ' + data.AmountToken}</Table.Cell>
                         <Table.Cell>{formatDate(data.IssuedOn)}</Table.Cell>
                         <Table.Cell>{formatDate(data.MaturityDate)}</Table.Cell>
                         <Table.Cell>{AttachmentModal(data.ContractText, data.IssuedOn)}</Table.Cell>
                       </Table.Row>;
              } else {
                return null;
              }
            })
          }
        </Table.Body>
      </Table>
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
      contractText: initialMarkdown("Daniel"),
      jsonData: 'null',
      active: false,
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.connectToBraid = this.connectToBraid.bind(this);
    this.issuePromissoryNotesJSON = this.issuePromissoryNotesJSON.bind(this);
    this.getIssuedPromissoryNotes = this.getIssuedPromissoryNotes.bind(this);
    this.getOwner = this.getOwner.bind(this);

  }

  async connectToBraid(port) {
    const onOpen = () => {
      this.getOwner();
      this.getIssuedPromissoryNotes();
      this.setState({active:false});
      console.log('Connected to the node.');
    };
    const onClose = () => { console.log('Disconnected from node.'); };
    const onError = (err) => { console.error(err); } ;

    this.braid = new Proxy({
      url: `http://localhost:${port}/api/`
    }, onOpen, onClose, onError, { strictSSL: false });
  }

  componentDidMount() {
    this.connectToBraid(9005);
  }
  
  async getIssuedPromissoryNotes() {
    let data = await this.braid.PromissoryNotesInterface.getIssuedPromissoryNotes();
    //console.log('NEW DATA' + JSON.stringify(data));
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

  issuePromissoryNotesJSON() {
    const { jsonData, contractText } = this.state;
    //console.log(`ISSUING Note with data: ${JSON.stringify(jsonData)}`);
    let braidPromise = this.braid.flows.PromissoryNoteIssueJSONFlow(contractText, jsonData);
    this.setState({
      loading: true
    });
    braidPromise.then((data) => {
      //console.log(data);
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
        <Dimmer.Dimmable as={Segment} dimmed={this.state.active}>
          <Dimmer active={this.state.active} inverted>
            <Loader>Connecting</Loader>
          </Dimmer>
        <Image.Group size='small'>
          <Image src="static/cordalogo.png" />
          <Image src="static/aplogo.png" />
        </Image.Group>
        <Header as='h1' color="red">
          Welcome to the Corda & Accord Project Bank
        </Header>
        <Header as='h3' color="red">
          <Dropdown
            onChange={((event, data) => {
              console.log('switching to node: ' + JSON.stringify(data.value));
              this.setState({active:true});
              this.setState({contractText:seedMarkdown(data.value)});
              this.connectToBraid(data.value);
            })}
            options={nodesTable}
            defaultValue={nodesTable[1].value}
          />
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
                this.getIssuedPromissoryNotes();
                this.setState({ issuing: false });
              })}
            >
              Notes Records
            </Menu.Item>
          </Menu>
          { !this.state.active ?
            <Segment>
              { this.state.issuing?
                <div>
                  { this.state.loading ?
                    <Button fluid
                            color='red'>Talking to the node...</Button> :
                    <Button fluid
                            color='red'
                            onClick = {(() => this.issuePromissoryNotesJSON())}>Sign & Issue</Button> }
                  <PromissoryNoteEditor
                    lockText={false}
                    initialMarkdown={ this.state.contractText }
                    onChange={(value,contractText) => { this.setState({ contractText }); }}
                    onParse={(jsonData) => { this.setState({ jsonData: JSON.stringify(jsonData) }); }}
                    showParse={true}
                  />
                </div> : issuedPane(this.state.promissoryNotesIssued, this.state.owner)
              }
            </Segment> : <Segment></Segment> }
        </div>
        </Dimmer.Dimmable>
      </Container>
    );
  }
}

export default App;
