import React, { Component, useCallback } from 'react';

import './App.css';

import { Container, Segment, Form, Image, Header, Divider } from 'semantic-ui-react';
import { Proxy } from'braid-client';
import { TemplateLibrary, Template, Clause } from '@accordproject/cicero-core';
import { TemplateLoadingClauseEditor } from '@accordproject/cicero-ui';

const DEFAULT_TEMPLATE = 'http://localhost:8080/static/promissory-note@0.11.2.cta';
const initialMarkdown = `# PROMISSORY NOTE

1000 USD 01/30/2018

FOR VALUE RECEIVED, the undersigned, "Daniel Selman", an individual residing at "1 Main Street" (“Maker”), hereby promises to pay to the order of "Clause", a CORP, having offices at "246 5th Ave, 3rd Fl, New York, NY 10001", or its successors and permitted assigns (“Lender” or the “Company”), the principal sum of 500 USD, plus any and all interest accrued thereon at the Note Rate (defined below), each due and payable in cash in lawful money of the United States on the dates and in the manner set forth in this Promissory Note (this “Note”).

## Interest.

The principal amount of this Note shall bear interest at 3.8% per annum (the “Note Rate”). Interest shall be computed on the basis of a three hundred and sixty-five (365) day year and charged for the actual number of days elapsed. Interest shall accrue on the original principal balance only and there shall be no accrual of interest upon interest.

## Payment of Principal and Interest.

The principal amount of this Note and the interest thereon shall be due and payable in full on the earlier of (a) 01/20/2019 or (b) ten (10) days prior to the Company filing an S-1 registration statement with the U.S. Securities and Exchange Commission in contemplation of an initial public offering (“IPO”). As used herein, IPO means the closing of a firm commitment underwritten public offering pursuant to a registration statement under the Securities Act of 1933, as amended.

## Prepayment.

The Maker may prepay any portion of the principal balance of this Note at any time without penalty.

## Default.

Each of the following shall constitute an event of default (“Event of Default”) under this Note:
(a) the Maker shall fail to pay when due (whether by acceleration or otherwise) principal or interest on this Note, and such default shall have continued for a period of 90 days;
(b) a proceeding (other than a proceeding commenced by the Maker) shall have been instituted in a court having jurisdiction seeking a decree or order for relief in respect of the Maker in an involuntary case under any applicable bankruptcy, insolvency or other similar law now or hereafter in effect, and such proceedings shall remain undismissed or unstayed and in effect for a period of 90 days (so long as the Maker is diligently proceeding to effect such dismissal or stay) or such court shall enter a decree or order granting the relief sought in such proceeding; or
(c) the Maker commences a voluntary case under any applicable bankruptcy, insolvency or other similar law now or hereafter in effect, consents to the entry of an order for relief in an involuntary case under any such law, or makes a general assignment for the benefit of creditors, or fails generally to pay his debts as they become due, or takes any action in furtherance of any of the foregoing.

## Remedies.

Upon the occurrence of any Event of Default, the Lender may, without notice or demand to the Maker, exercise any or all of the following remedies:
(a) declare all unpaid principal owing under this Note, together with all accrued and unpaid interest and other amounts owing hereunder, to be immediately due and payable without demand, protest, notice of protest, notice of default, presentment for payment or further notice of any kind; or
(b) proceed to enforce such other and additional rights and remedies as the Lender may be provided by applicable law.

## Governing Law.

This Note shall be governed by, and construed and enforced in accordance with, the internal laws (other than the choice of law principles thereof) of "New York, NY".

## Waiver.

No failure to exercise and no delay in exercising any right, power or privilege hereunder shall operate as a waiver thereof, nor shall any single or partial exercise of any right, power or privilege hereunder preclude any other or further exercise thereof or the exercise of any other right, power or privilege. The rights and remedies herein provided are cumulative and not exclusive of any rights or remedies provided by law.

## Savings Clause.

Notwithstanding any provision contained in this Note, the Lender shall not be entitled to receive, collect or apply as interest on this Note any amount in excess of the highest lawful rate permissible under any law which a court of competent jurisdiction may deem applicable hereto. If the Lender ever receives, collects or applies as interest any such excess, the amount that would be excessive interest shall be deemed to be a partial payment of principal and treated hereunder as such, and, if the principal balance of this Note is paid in full, any remaining excess shall promptly be paid to the Maker.

## Amendment.

This Note may be amended or modified only upon the written consent of both the Lender and the Maker. Any amendment must specifically state the provision or provisions to be amended and the manner in which such provision or provisions are to be amended.

## Entire Agreement.

This Note constitutes the entire agreement of the Maker and the Lender with respect to the subject matter hereof and supersedes all other prior arrangements, understandings, statements, representations and warranties, expressed or implied, and no oral statements or prior written statements not contained in this Note shall have any force and effect.

## Counterparts.

This Note may be executed in counterparts, each of which shall constitute an original and all of which shall constitute one and the same instrument.

## Assignment.

This Note may not be assigned and/or transferred in whole or in part by the Maker without the prior written consent of the Lender, which consent shall be in the Lender’s sole and absolute discretion. This Note may be assigned and/or transferred in whole or in part by the Lender at any time. The obligations of the Maker hereunder shall bind his heirs and permitted assigns, and all rights, benefits and privileges conferred on the Lender by this Note shall be and hereby are extended to, conferred upon, and may be enforced by, the successors and assigns of the Lender.

IN WITNESS WHEREOF, the Maker has executed this Note as of the date and year first above written.`;

/**
 * A demo component that uses TemplateLoadingClauseEditor
 * @param {*} props
 */
// eslint-disable-next-line require-jsdoc, no-unused-vars
function PromissoryNote(props) {
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
        markdown={initialMarkdown}
        templateUrl={DEFAULT_TEMPLATE}
        onChange={onChange}
        onParse={onParse}
        />
    </div>
  );
}
class App extends Component {

  constructor(props) {

    super(props);
    this.state = {
      promissoryNotesIssued: [],
      owner: '',
      contractText: 'Contract not loaded...',
      jsonData: 'null'
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
          <PromissoryNote
            onChange={(value,contractText) => { this.setState({ contractText }); }}
            onParse={(jsonData) => { this.setState({ jsonData: JSON.stringify(jsonData) }); }}
          />
          <Divider />
          {this.state.loading ? <button>Talking to the node...</button> : <button onClick = {(() => this.issuePromissoryNotesJSON())}>Issue New Note</button>}
          <button onClick = {(() => this.getIssuedPromissoryNotes())}>Get All Existing Notes</button>
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
