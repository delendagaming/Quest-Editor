import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";
import Web3 from "C:/Users/AXlHT/AppData/Roaming/npm/node_modules/web3/src/index";

import Spinner from "../layout/Spinner";
import Admins from "../auth/Admin";

const firebase = require("firebase");
// Required for side-effects
require("firebase/functions");

class QuestsSubmitted extends Component {
  state = {
    questsSubmittedTotal: null,
    questsSubmittedFromScribeTotal: null
  };

  // Filter quests submitted by ScribeID and determine total number of quests submitted from the scribe
  static getDerivedStateFromProps(props, state) {
    const questsSubmitted = props.questsSubmitted;
    var user = props.firebase.auth().currentUser;

    if (questsSubmitted) {
      if (Admins.includes(user.uid)) {
        var questsSubmittedFromScribe = questsSubmitted;
      } else {
        questsSubmittedFromScribe = questsSubmitted.filter(
          quest => quest.ScribeID === user.uid
        );
      }
      return {
        questsSubmittedFromScribeTotal: questsSubmittedFromScribe.length,
        questsSubmittedFromScribe
      };
    }
    return null;
  }

  onGenerateVerifier = async e => {
    // fetch quest ID

    const id = e.target.getAttribute("data-id");

    // get Paragraphs Array

    let questSubmitted = {
      ...this.props.questsSubmitted.find(el => el.id === id)
    };
    let paragraphsArray = questSubmitted.Paragraphs;

    // create paragraphsMapping and outcomeArrayLengths out of Paragraphs Array

    let orderedParagraphsArray = [];
    paragraphsArray.forEach(el => {
      let indexOfNextParagraph = orderedParagraphsArray.findIndex(
        elem =>
          elem.depthNumber > el.depthNumber ||
          (elem.depthNumber === el.depthNumber &&
            elem.paragraphNumber > el.paragraphNumber)
      );
      if (indexOfNextParagraph === -1) {
        orderedParagraphsArray.push(el);
      } else if (indexOfNextParagraph === 0) {
        orderedParagraphsArray.unshift(el);
      } else {
        orderedParagraphsArray.splice(indexOfNextParagraph, 0, el);
      }
    });

    let paragraphsMapping = [];

    //added for new circuit
    paragraphsMapping[orderedParagraphsArray.length] = [
      orderedParagraphsArray.length
    ];
    paragraphsMapping[orderedParagraphsArray.length + 1] = [
      orderedParagraphsArray.length + 1
    ];
    // end of addition

    orderedParagraphsArray.forEach((el, index) => {
      let outcomeArray = [];
      if (el.nextParagraphs.length > 0) {
        el.nextParagraphs.forEach(elem => {
          let indexInParagraphsArray = orderedParagraphsArray.findIndex(
            parag =>
              elem.paragraphNumber === parag.paragraphNumber &&
              elem.depthNumber === parag.depthNumber
          );
          outcomeArray.push(indexInParagraphsArray);
        });
      } else if (el.paragraphSubTypes.isSuddenDeath === true) {
        outcomeArray = [orderedParagraphsArray.length];
      } else if (el.paragraphSubTypes.isVictory === true) {
        outcomeArray = [orderedParagraphsArray.length + 1];
      } else window.alert("Error in creating paragraphsMapping.");

      paragraphsMapping[index] = outcomeArray;
    });

    let outcomeArrayLengths = [];
    paragraphsMapping.forEach(el => outcomeArrayLengths.push(el.length));
    let paragraphsMappingString = "";
    paragraphsMapping.forEach(
      el =>
        (paragraphsMappingString = paragraphsMappingString.concat(`,[${el}]`))
    );
    paragraphsMappingString = paragraphsMappingString.substring(1);

    await this.setState({
      paragraphsMapping: `[${paragraphsMappingString}]`,
      mappingLength: paragraphsMapping.length
    });

    // create circuit.circom file in local storage and save in Firebase storage

    const firebase = this.props.firebase;
    /*
    let circuit = `include "../srv/node_modules/circomlib/circuits/gates.circom";
    include "../srv/node_modules/circomlib/circuits/comparators.circom";
    
    template Quest(n) {
        signal private input moves[n];
        signal victory;
        signal alive;
        signal pathcheck;
        signal output outcome;
       
    
        var paragraphsMapping = [${paragraphsMappingString}];
        //var paragraphsMappingLength = 11;
        var outcomeArrayLengths = [${outcomeArrayLengths}];
       // var outcomeExists = 0;
        //var victoryVar = 0;
        //var aliveVar = 1;
    
    
       var countercheck = 0;
       var movesnumber = 0;
    
        for (var j=0; j<n; j++) {
    
            if(moves[j] > 0) {
                movesnumber++;
    
                for (var k=0 ; k < outcomeArrayLengths[j]; k++ ) {
                    
                    if (moves[j] == paragraphsMapping[j][k]) {
                        countercheck++;
                    }
                }
    
            }
    
        }
    
        pathcheck <-- (countercheck == movesnumber);
        pathcheck === 1;
    
    
    
    //check if player reached victory or sudden death paragraph
        for (var i = 0; i < n; i++) {
           if( moves[i] > 0 && paragraphsMapping[i][0] == 777) {
               victory <-- 1;
               alive <-- 1;
           } 
    
            if( moves[i] > 0 && paragraphsMapping[i][0] == 666) {
               alive <-- 0;
               victory <-- 0;
           }  
        }
    
     
    
        component and1 = AND();
        and1.a <-- alive;
        and1.b <-- victory;
        outcome <-- and1.out;
    
        outcome === 1;
    
    }
    
    component main = Quest(${paragraphsMapping.length});`;
*/

    let circuit = `
    
    template Quest(n) {
        signal private input moves[n];
        signal output outcome;
       
    
        var paragraphsMapping = [${paragraphsMappingString}];
        var outcomeArrayLengths = [${outcomeArrayLengths}];    

        var movesnumber = 0;
        var j = 0;
        var i;
        var k;

    for (i=0; i<n; i++) {

        movesnumber++;

                for (k = 0 ; k < outcomeArrayLengths[j]; k++ ) {
                
                    if (moves[i] == paragraphsMapping[j][k]) {
                        movesnumber--;
                        j = moves[i];

                        if (j == ${orderedParagraphsArray.length +
                          1} && movesnumber == 0) {
                            i = n;
                            outcome <-- 1;
                    }
                }                    
            }       
    }


        // check that player has reached a victory paragraph as his last move
        outcome === 1;

    }
    
    component main = Quest(${paragraphsMapping.length});`;

    let generateAndDeployVerifierCF = firebase
      .functions()
      .httpsCallable("generateAndDeployVerifier");
    let response = await generateAndDeployVerifierCF(circuit);

    console.log(response.data);

    var file1 = new File([response.data.verifierCode], "verifier.sol");
    firebase.uploadFile(id, file1, null, {
      name: "verifier.sol"
    });

    var file2 = new File([circuit], "circuit.circom");
    firebase.uploadFile(id, file2, null, {
      name: "circuit.circom"
    });

    await this.setState({
      cirDef: response.data.cirDef,
      verifierCode: response.data.verifierCode,
      provingKey: response.data.provingKey,
      verificationKey: response.data.verificationKey
    });
    window.alert("Verifier contract created and saved !");
  };

  onDeployVerifier = async e => {
    // fetch quest ID

    const id = e.target.getAttribute("data-id");

    // check if Verifier contract already deployed for this Quest, if yes show alert with address of existing contract

    let questSubmitted = {
      ...this.props.questsSubmitted.find(el => el.id === id)
    };

    if (questSubmitted.verifierContractAddress != undefined) {
      if (
        !window.confirm(
          `A Verifier contract has already been deployed at the address ${questSubmitted.verifierContractAddress}. Are you sure you want to deploy a Verifier contract again for this Quest ?`
        )
      ) {
        return;
      }
    }

    // fetch verifier.sol from Firebase Storage and throw error if no file is found

    const storage = this.props.firebase.storage();
    let storageRef = storage.ref();

    let verifierRef = storageRef.child(`${id}/verifier.sol`);

    verifierRef
      .getDownloadURL()
      .then(url => console.log(url))
      .catch(err => {
        console.log(err);
        window.alert("No verifier.sol file was found !");
        return;
      });

    // compile verifier.sol, get account, deploy contract and return contract address

    let deployVerifierContract = firebase
      .functions()
      .httpsCallable("deployVerifierContract");
    let compilation = await deployVerifierContract(this.state.verifierCode);

    await this.setState({ contractInterface: compilation.data.interface });

    const web3 = new Web3(window.web3.currentProvider);

    // get account, deploy contract and save address

    const deploy = async () => {
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);

      console.log("Attempting to deploy from account ", accounts[0]);

      const result = await new web3.eth.Contract(
        JSON.parse(compilation.data.interface)
      )
        .deploy({ data: compilation.data.bytecode })
        .send({ gas: "2000000", from: accounts[0] });

      console.log("Contract deployed to ", result.options.address);
      return result.options.address;
    };

    let address = await deploy();

    // save contract address in Firestore and success message

    await this.props.firestore.update(
      { collection: "QuestsSubmitted", doc: id },
      {
        verifierContractAddress: address
      }
    );

    window.alert(`Contract deployed at address ${address} !`);
  };

  onGenerateInputProofAndVerify = async e => {
    // fetch user input of paragraph plays

    let userInput = window.prompt(
      `The paragraphs mapping is ${this.state.paragraphsMapping} Please enter the paragraph plays to test.`
    );
    userInput = userInput.toString();
    let movesArray = [];

    /* if (
        userInput.substring(i, i + 1) === "6" &&
        userInput.substring(i + 1, i + 2) === "6" &&
        userInput.substring(i + 2, i + 3) === "6"
      ) {
        movesArray.push("666");
        i = i + 2;
      } else if (
        userInput.substring(i, i + 1) === "7" &&
        userInput.substring(i + 1, i + 2) === "7" &&
        userInput.substring(i + 2, i + 3) === "7"
      ) {
        movesArray.push("777");
        i = i + 2;
      } else*/ movesArray = userInput.split(
      " "
    );

    let gap = this.state.mappingLength - movesArray.length;

    for (var j = 0; j < gap; j++) {
      movesArray.push("0");
    }

    let inputJSON = `{ "moves": [${movesArray}] }`;

    // generate input.json from user input and save it in Firebase storage of the Quest
    // use snarkjs library to calculate the witness from input.json and save witness.json in Firebase storage of the Quest
    // use snarkjs library to create the proof from witness.json and proving_key.json and save proof.json and public.json in Firebase storage of the Quest
    // run verification via snarkjs verify from verification_key.json, proof.json and public.json and do a window.alert with the result

    let generateInputProofAndVerify = firebase
      .functions()
      .httpsCallable("generateInputProofAndVerify");

    let data = {};
    data.cirDef = this.state.cirDef;
    data.provingKey = this.state.provingKey;
    data.inputJSON = inputJSON;
    data.verificationKey = this.state.verificationKey;

    let response = await generateInputProofAndVerify(data);

    await this.setState({
      proofJSONresponse: response.data.proofJSONresponse,
      publicJSONresponse: response.data.publicJSONresponse
    });

    window.alert(response.data.message);
  };

  onTestVerifierContract = async e => {
    // fetch quest ID

    const id = e.target.getAttribute("data-id");
    let questSubmitted = {
      ...this.props.questsSubmitted.find(el => el.id === id)
    };

    // use snarkjs library to generate call

    let data = {};
    data.publicJSONresponse = this.state.publicJSONresponse;
    data.proofJSONresponse = this.state.proofJSONresponse;

    let testVerifierContract = firebase
      .functions()
      .httpsCallable("testVerifierContract");

    let response = await testVerifierContract(data);

    console.log(response);

    // get Verifier contract address from Firebase database then send call to it

    let address = questSubmitted.verifierContractAddress;
    const web3 = new Web3(window.web3.currentProvider);

    let verifierContract = await new web3.eth.Contract(
      JSON.parse(this.state.contractInterface),
      address
    );
    verifierContract.setProvider(window.web3.currentProvider);

    // return result and show it in window.alert

    let argumentsForCall = JSON.parse("[" + response.data + "]");
    console.log(...argumentsForCall);

    const check = await verifierContract.methods
      .verifyProof(...argumentsForCall)
      .call();

    window.alert(check);

    // clear state
  };

  onWithdrawClick = async e => {
    const id = e.target.getAttribute("data-id");

    let questSubmitted = {
      ...this.props.questsSubmitted.find(el => el.id === parseInt(id, 10))
    };

    if (questSubmitted.Status !== "Submitted") {
      window.alert("You cannot withdraw this Quest.");
    } else if (
      window.confirm(
        `Are you sure you want to withdraw the Quest '${questSubmitted.Title}' ?`
      )
    ) {
      questSubmitted.Status = "Withdrawn";
      questSubmitted.SubmissionDate = "";

      const result = await this.props.firestore.add(
        { collection: "QuestsInProgress" },
        questSubmitted
      );
      await this.props.firestore.update(
        { collection: "QuestsInProgress", doc: result.id },
        {
          id: result.id
        }
      );
      await this.props.firestore.delete({
        collection: "QuestsSubmitted",
        doc: id
      });
      window.alert(
        "Your Quest has been properly withdrawn and you can now access it in the Quest Editor."
      );
      this.props.history.push(`/questeditor/inprogress/`);
    }
  };

  render() {
    const {
      questsSubmittedFromScribe,
      questsSubmittedFromScribeTotal
    } = this.state;

    // get authorization to connect to user wallet and instantiate web3

    const getProvider = async () => {
      await window.web3.currentProvider.enable(); // request authentication
    };
    getProvider();

    if (questsSubmittedFromScribe) {
      return (
        <div
          className="container"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            marginTop: "-50px"
          }}
        >
          <div className="row">
            <Link to="/questeditor/menu/" className="btn" id="BackToMenu">
              <i className="fas fa-arrow-circle-left" id="BackToMenu" /> Back to
              Menu
            </Link>
          </div>
          <h3>
            Quests Submitted : <span>{questsSubmittedFromScribeTotal}</span>
          </h3>
          <table className="table">
            <thead className="thead-inverse">
              <tr>
                <th>Title</th>
                <th>Date of submission</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questsSubmittedFromScribe.map(questSubmittedFromScribe => (
                <tr key={questSubmittedFromScribe.id}>
                  <td>{questSubmittedFromScribe.Title}</td>
                  <td>{questSubmittedFromScribe.SubmissionDate}</td>
                  <td>{questSubmittedFromScribe.Status}</td>
                  {questSubmittedFromScribe.Status === "Submitted" ? (
                    <td>
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onWithdrawClick}
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="fas fa-arrow-circle-down" /> Withdraw
                      </button>
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onGenerateVerifier}
                        className="btn btn-secondary btn-sm"
                      >
                        Generate Verifier
                      </button>
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onDeployVerifier}
                        className="btn btn-secondary btn-sm"
                      >
                        Deploy Verifier
                      </button>
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onGenerateInputProofAndVerify}
                        className="btn btn-secondary btn-sm"
                      >
                        Test Proof
                      </button>
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onTestVerifierContract}
                        className="btn btn-secondary btn-sm"
                      >
                        Test Verifier
                      </button>
                    </td>
                  ) : (
                    <td> </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else
      return (
        <Spinner
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            marginTop: "-50px"
          }}
        />
      );
  }
}

QuestsSubmitted.propTypes = {
  firestore: PropTypes.object.isRequired,
  questsSubmitted: PropTypes.array
};

export default compose(
  firestoreConnect([{ collection: "QuestsSubmitted" }]),
  connect((state, props) => ({
    questsSubmitted: state.firestore.ordered.QuestsSubmitted
  }))
)(QuestsSubmitted);
