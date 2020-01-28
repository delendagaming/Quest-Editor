import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";
import Web3 from "web3";
import ipfsClient from "ipfs-http-client";
import snarkjs from "snarkjs";

import { ethers } from "ethers";
import {
  NonceTxMiddleware,
  SignedEthTxMiddleware,
  CryptoUtils,
  Client,
  LoomProvider,
  Address,
  LocalAddress,
  Contracts,
  EthersSigner,
  createDefaultTxMiddleware
} from "loom-js";

import Spinner from "../layout/Spinner";
import Admins from "../auth/Admin";

const firebase = require("firebase");
// Required for side-effects
require("firebase/functions");

class QuestsSubmitted extends Component {
  state = {
    questsSubmittedTotal: null,
    questsSubmittedFromScribeTotal: null,
    loom: {
      counter: 0,
      pending: true,
      web3js: null,
      chainId: "extdev-plasma-us1",
      writeUrl: "wss://extdev-plasma-us1.dappchains.com/websocket",
      readUrl: "wss://extdev-plasma-us1.dappchains.com/queryws",
      networkId: 9545242630824,
      callerChainId: "eth",
      ethAddress: null,
      client: null,
      loomProvider: null,
      contract: null,
      publicKey: null
    }
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

  async componentDidMount() {
    // initiate web3
    let web3js;
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      web3js = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      await window.web3.currentProvider.enable();
      window.web3 = new Web3(window.web3.currentProvider);
      console.log(window.web3);
      web3js = new Web3(window.web3.currentProvider);
      console.log(web3js);
    } else {
      console.log("Metamask is not Enabled");
    }
    if (web3js) {
      const newLoom = this.state.loom;
      newLoom.web3js = web3js;

      await this.setState({
        loom: newLoom
      });
    }

    // initiate loom
    const privateKey = CryptoUtils.generatePrivateKey();
    const newLoom2 = this.state.loom;
    newLoom2.publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);
    await this.setState({
      loom: newLoom2
    });

    const client = new Client(
      this.state.loom.chainId,
      this.state.loom.writeUrl,
      this.state.loom.readUrl
    );
    const newLoom3 = this.state.loom;
    newLoom3.client = client;
    await this.setState({
      loom: newLoom3
    });

    const ethersProvider = new ethers.providers.Web3Provider(
      this.state.loom.web3js.currentProvider
    );
    const signer = ethersProvider.getSigner();
    const ethAddress = await signer.getAddress();

    const newLoom4 = this.state.loom;
    newLoom4.ethAddress = ethAddress;

    await this.setState({
      loom: newLoom4
    });

    const to = new Address(
      this.state.loom.callerChainId,
      LocalAddress.fromHexString(this.state.loom.ethAddress)
    );
    const from = new Address(
      this.state.loom.client.chainId,
      LocalAddress.fromPublicKey(this.state.loom.publicKey)
    );

    const txMiddleware = createDefaultTxMiddleware(
      this.state.loom.client,
      privateKey
    );

    const newLoom5 = this.state.loom;
    newLoom5.client.txMiddleware = txMiddleware;

    await this.setState({
      loom: newLoom5
    });

    const addressMapper = await Contracts.AddressMapper.createAsync(
      this.state.loom.client,
      from
    );

    if (await addressMapper.hasMappingAsync(to)) {
      console.log("Mapping already exists.");
    } else {
      console.log("Adding a new mapping.");
      const ethersSigner = new EthersSigner(signer);
      await addressMapper.addIdentityMappingAsync(from, to, ethersSigner);
    }

    const newLoom6 = this.state.loom;
    newLoom6.loomProvider = new LoomProvider(
      this.state.loom.client,
      privateKey
    );

    await this.setState({
      loom: newLoom6
    });

    const newLoom7 = this.state.loom;
    newLoom7.loomProvider.callerChainId = this.state.loom.callerChainId;

    await this.setState({
      loom: newLoom7
    });
    this.state.loom.loomProvider.setMiddlewaresForAddress(to.local.toString(), [
      new NonceTxMiddleware(to, this.state.loom.client),
      new SignedEthTxMiddleware(signer)
    ]);
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

    console.log(response.data.verifierCode);

    window.alert("Verifier contract created and saved !");
  };

  onDeployVerifier = async e => {
    // fetch quest ID

    const id = e.target.getAttribute("data-id");

    // check if Verifier contract already deployed for this Quest, if yes show alert with address of existing contract

    let questSubmitted = {
      ...this.props.questsSubmitted.find(el => el.id === id)
    };

    if (questSubmitted.verifierContractAddress !== undefined) {
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

    //const web3 = new Web3(window.web3.currentProvider);
    const web3 = new Web3(this.state.loom.loomProvider);
    // deploy contract and save address

    const contract = await new web3.eth.Contract(
      JSON.parse(compilation.data.interface)
    );
    contract.setProvider(this.state.loom.loomProvider);

    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    //console.log("Attempting to deploy from account ", accounts[0]);
    /*
      const result = await new web3.eth.Contract(
        JSON.parse(compilation.data.interface)
      )
        .deploy({ data: compilation.data.bytecode })
        .send({ gas: "2000000", from: accounts[0] });
*/

    const result = await contract
      .deploy({ data: compilation.data.bytecode })
      .send({ from: accounts[0] });

    console.log("Contract deployed to ", result.options.address);

    let verifierContractAddress = result.options.address;

    // save contract address in Firestore

    await this.props.firestore.update(
      { collection: "QuestsSubmitted", doc: id },
      {
        verifierContractAddress: verifierContractAddress
      }
    );

    // updating the questSubmitted object in case verifierContractAddress was changed
    questSubmitted = {
      ...this.props.questsSubmitted.find(el => el.id === id)
    };

    //Connecting to the ipfs network via infura gateway
    const ipfs = ipfsClient("ipfs.infura.io", "5001", { protocol: "https" });

    // uploading questObject to IPFS and recovering URL

    const questObjectString = JSON.stringify(questSubmitted);
    console.log(questObjectString);

    const questObjectBuffer = Buffer.from(questObjectString);
    console.log(questObjectBuffer);

    const resultsQuestObject = await ipfs.add(questObjectBuffer);
    const hashQuestObject = resultsQuestObject[0].hash;
    const questObjectURLonIPFS = `https://gateway.ipfs.io/ipfs/${hashQuestObject}`;

    console.log(questObjectURLonIPFS);

    // uploading cirDef to IPFS and recovering URL

    const cirDefString = JSON.stringify(this.state.cirDef);
    console.log(cirDefString);

    const cirDefBuffer = Buffer.from(cirDefString);
    console.log(cirDefBuffer);

    const resultsCirDef = await ipfs.add(cirDefBuffer);
    const hashCirDef = resultsCirDef[0].hash;
    const cirDefURLonIPFS = `https://gateway.ipfs.io/ipfs/${hashCirDef}`;

    console.log(cirDefURLonIPFS);

    // uploading provingKey to IPFS and recovering URL

    const provingKeyString = this.state.provingKey;
    console.log(provingKeyString);

    const provingKeyBuffer = Buffer.from(provingKeyString);
    console.log(provingKeyBuffer);

    const resultsProvingKey = await ipfs.add(provingKeyBuffer);
    const hashProvingKey = resultsProvingKey[0].hash;
    const provingKeyURLonIPFS = `https://gateway.ipfs.io/ipfs/${hashProvingKey}`;

    console.log(provingKeyURLonIPFS);

    // initialize controller contract (deployed on extdev)
    const controllerContractAddress = window.prompt(
      "Please enter the address of the Controller Contract"
    ); // to get from console in truffle contracts deployment script (ubuntu)

    const contractInterface = [
      {
        constant: true,
        inputs: [
          {
            name: "",
            type: "bytes32"
          }
        ],
        name: "questRegister",
        outputs: [
          {
            name: "creator",
            type: "address"
          },
          {
            name: "identifier",
            type: "string"
          },
          {
            name: "verifierAddress",
            type: "address"
          },
          {
            name: "questPrice",
            type: "uint256"
          },
          {
            name: "questObjectURLonIPFS",
            type: "string"
          },
          {
            name: "cirDefURLonIPFS",
            type: "string"
          },
          {
            name: "provingKeyURLonIPFS",
            type: "string"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            name: "ERC20input",
            type: "address"
          },
          {
            name: "ERC721input",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "payer",
            type: "address"
          },
          {
            indexed: false,
            name: "recipient",
            type: "address"
          },
          {
            indexed: false,
            name: "identifierForQuest",
            type: "string"
          }
        ],
        name: "paymentForQuest",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "player",
            type: "address"
          },
          {
            indexed: false,
            name: "questName",
            type: "string"
          },
          {
            indexed: false,
            name: "tokenID",
            type: "uint256"
          }
        ],
        name: "victory",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "player",
            type: "address"
          },
          {
            indexed: false,
            name: "questName",
            type: "string"
          }
        ],
        name: "incorrectPath",
        type: "event"
      },
      {
        constant: true,
        inputs: [
          {
            name: "questName",
            type: "string"
          }
        ],
        name: "getHash",
        outputs: [
          {
            name: "",
            type: "bytes32"
          }
        ],
        payable: false,
        stateMutability: "pure",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          },
          {
            name: "creatorInput",
            type: "address"
          },
          {
            name: "identifierInput",
            type: "string"
          },
          {
            name: "verifierInput",
            type: "address"
          },
          {
            name: "priceInput",
            type: "uint256"
          },
          {
            name: "questObjectURLinput",
            type: "string"
          },
          {
            name: "cirDefURLinput",
            type: "string"
          },
          {
            name: "provingKeyURLinput",
            type: "string"
          }
        ],
        name: "addEntry",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          }
        ],
        name: "playerPayment",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          },
          {
            name: "a",
            type: "uint256[2]"
          },
          {
            name: "a_p",
            type: "uint256[2]"
          },
          {
            name: "b",
            type: "uint256[2][2]"
          },
          {
            name: "b_p",
            type: "uint256[2]"
          },
          {
            name: "c",
            type: "uint256[2]"
          },
          {
            name: "c_p",
            type: "uint256[2]"
          },
          {
            name: "h",
            type: "uint256[2]"
          },
          {
            name: "k",
            type: "uint256[2]"
          },
          {
            name: "input",
            type: "uint256[1]"
          }
        ],
        name: "checkAndMint",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "abandonCurrentQuest",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ];

    let controllerContract = await new web3.eth.Contract(
      contractInterface,
      controllerContractAddress
    );
    controllerContract.setProvider(this.state.loom.loomProvider);

    try {
      await controllerContract.methods
        .addEntry(
          questSubmitted.Title,
          questSubmitted.ScribeLoomAddress,
          questSubmitted.id,
          verifierContractAddress,
          parseInt(questSubmitted.Price),
          questObjectURLonIPFS,
          cirDefURLonIPFS,
          provingKeyURLonIPFS
        )
        .send({ from: accounts[1] });
    } catch (err) {
      console.log(`Transaction failed : ${err}`);
    }

    window.alert(`Verifier entry added to Quest Register !`);
  };

  onGenerateInputProofAndVerify = async e => {
    // fetch user input of paragraph plays

    let userInput = window.prompt(
      `The paragraphs mapping is ${this.state.paragraphsMapping} Please enter the paragraph plays to test.`
    );
    userInput = userInput.toString();
    let movesArray = [];

    movesArray = userInput.split(" ");

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

    //const web3 = new Web3(window.web3.currentProvider);
    const web3 = new Web3(this.state.loom.loomProvider);
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    let verifierContract = await new web3.eth.Contract(
      JSON.parse(this.state.contractInterface),
      address
    );
    verifierContract.setProvider(this.state.loom.loomProvider);

    // return result and show it in window.alert

    let argumentsForCall = JSON.parse("[" + response.data + "]");
    console.log(...argumentsForCall);

    const check = await verifierContract.methods
      .verifyProof(...argumentsForCall)
      .call({ from: accounts[1] });

    window.alert(check);

    // clear state
  };

  onLaunchPayment = async e => {
    const web3 = new Web3(this.state.loom.loomProvider);

    const accounts = await web3.eth.getAccounts();

    const questName = window.prompt(
      "Enter the name of the quest you wish to purchase"
    );

    // initialize QuestToken contract (deployed on extdev)

    const questTokenContractAddress = window.prompt(
      "Please enter the address of the QuestToken Contract"
    ); // to get from console in truffle contracts deployment script (ubuntu)

    const questTokenContractInterface = [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "spender",
            type: "address"
          },
          {
            name: "value",
            type: "uint256"
          }
        ],
        name: "approve",
        outputs: [
          {
            name: "",
            type: "bool"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "gateway",
        outputs: [
          {
            name: "",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "sender",
            type: "address"
          },
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        name: "transferFrom",
        outputs: [
          {
            name: "",
            type: "bool"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [
          {
            name: "",
            type: "uint8"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "spender",
            type: "address"
          },
          {
            name: "addedValue",
            type: "uint256"
          }
        ],
        name: "increaseAllowance",
        outputs: [
          {
            name: "",
            type: "bool"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          {
            name: "account",
            type: "address"
          }
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
          {
            name: "",
            type: "string"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "spender",
            type: "address"
          },
          {
            name: "subtractedValue",
            type: "uint256"
          }
        ],
        name: "decreaseAllowance",
        outputs: [
          {
            name: "",
            type: "bool"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        name: "transfer",
        outputs: [
          {
            name: "",
            type: "bool"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: true,
        inputs: [
          {
            name: "owner",
            type: "address"
          },
          {
            name: "spender",
            type: "address"
          }
        ],
        name: "allowance",
        outputs: [
          {
            name: "",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            name: "_gateway",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "from",
            type: "address"
          },
          {
            indexed: true,
            name: "to",
            type: "address"
          },
          {
            indexed: false,
            name: "value",
            type: "uint256"
          }
        ],
        name: "Transfer",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "owner",
            type: "address"
          },
          {
            indexed: true,
            name: "spender",
            type: "address"
          },
          {
            indexed: false,
            name: "value",
            type: "uint256"
          }
        ],
        name: "Approval",
        type: "event"
      },
      {
        constant: false,
        inputs: [
          {
            name: "_amount",
            type: "uint256"
          }
        ],
        name: "mintToGateway",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ];

    let questTokenContract = await new web3.eth.Contract(
      questTokenContractInterface,
      questTokenContractAddress
    );
    questTokenContract.setProvider(this.state.loom.loomProvider);

    // initialize controller contract (deployed on extdev)
    const controllerContractAddress = window.prompt(
      "Please enter the address of the Controller Contract"
    ); // to get from console in truffle contracts deployment script (ubuntu)

    const controllerContractInterface = [
      {
        constant: true,
        inputs: [
          {
            name: "",
            type: "bytes32"
          }
        ],
        name: "questRegister",
        outputs: [
          {
            name: "creator",
            type: "address"
          },
          {
            name: "identifier",
            type: "string"
          },
          {
            name: "verifierAddress",
            type: "address"
          },
          {
            name: "questPrice",
            type: "uint256"
          },
          {
            name: "questObjectURLonIPFS",
            type: "string"
          },
          {
            name: "cirDefURLonIPFS",
            type: "string"
          },
          {
            name: "provingKeyURLonIPFS",
            type: "string"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            name: "ERC20input",
            type: "address"
          },
          {
            name: "ERC721input",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "payer",
            type: "address"
          },
          {
            indexed: false,
            name: "recipient",
            type: "address"
          },
          {
            indexed: false,
            name: "identifierForQuest",
            type: "string"
          }
        ],
        name: "paymentForQuest",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "player",
            type: "address"
          },
          {
            indexed: false,
            name: "questName",
            type: "string"
          },
          {
            indexed: false,
            name: "tokenID",
            type: "uint256"
          }
        ],
        name: "victory",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "player",
            type: "address"
          },
          {
            indexed: false,
            name: "questName",
            type: "string"
          }
        ],
        name: "incorrectPath",
        type: "event"
      },
      {
        constant: true,
        inputs: [
          {
            name: "questName",
            type: "string"
          }
        ],
        name: "getHash",
        outputs: [
          {
            name: "",
            type: "bytes32"
          }
        ],
        payable: false,
        stateMutability: "pure",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          },
          {
            name: "creatorInput",
            type: "address"
          },
          {
            name: "identifierInput",
            type: "string"
          },
          {
            name: "verifierInput",
            type: "address"
          },
          {
            name: "priceInput",
            type: "uint256"
          },
          {
            name: "questObjectURLinput",
            type: "string"
          },
          {
            name: "cirDefURLinput",
            type: "string"
          },
          {
            name: "provingKeyURLinput",
            type: "string"
          }
        ],
        name: "addEntry",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          }
        ],
        name: "playerPayment",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          },
          {
            name: "a",
            type: "uint256[2]"
          },
          {
            name: "a_p",
            type: "uint256[2]"
          },
          {
            name: "b",
            type: "uint256[2][2]"
          },
          {
            name: "b_p",
            type: "uint256[2]"
          },
          {
            name: "c",
            type: "uint256[2]"
          },
          {
            name: "c_p",
            type: "uint256[2]"
          },
          {
            name: "h",
            type: "uint256[2]"
          },
          {
            name: "k",
            type: "uint256[2]"
          },
          {
            name: "input",
            type: "uint256[1]"
          }
        ],
        name: "checkAndMint",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "abandonCurrentQuest",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ];

    let controllerContract = await new web3.eth.Contract(
      controllerContractInterface,
      controllerContractAddress
    );
    controllerContract.setProvider(this.state.loom.loomProvider);

    // listening to payment event

    controllerContract.once("paymentForQuest", function(err, result) {
      if (err) {
        console.log(`Payment failed : ${err}`); // --> to use in loading screen
      }
      console.log("Payment to Quest Creator successful"); // --> to use in loading screen
    });

    // get hash of quest name

    let questNameHash;

    try {
      questNameHash = await controllerContract.methods
        .getHash(questName)
        .call({ from: accounts[1] });
    } catch (err) {
      console.log(`Hash of quest name could not be recovered : ${err}`);
    }

    // get quest entry from quest register

    let questEntry;

    try {
      questEntry = await controllerContract.methods
        .questRegister(questNameHash)
        .call({ from: accounts[1] });
    } catch (err) {
      console.log(
        `Quest Entry could not be recovered from Quest Register : ${err}`
      );
    }

    // increase allowance of tokens to Quest Controller contract

    try {
      await questTokenContract.methods
        .approve(controllerContractAddress, parseInt(questEntry.questPrice))
        .send({ from: accounts[1] });
    } catch (err) {
      console.log(
        `Token allowance to Quest Controller contract could not be realized : ${err}`
      );
    }

    // spend allowance of tokens towards creator

    try {
      console.log("Payment launched"); // --> to use in loading screen
      await controllerContract.methods
        .playerPayment(questName)
        .send({ from: accounts[1] });
    } catch (err) {
      console.log(`Payment failed : ${err}`); // --> to use in loading screen
    }
  };

  onSendSolution = async e => {
    const web3 = new Web3(this.state.loom.loomProvider);
    const accounts = await web3.eth.getAccounts();

    // initialize controller contract (deployed on extdev)
    const controllerContractAddress = window.prompt(
      "Please enter the address of the Controller Contract"
    ); // to get from console in truffle contracts deployment script (ubuntu)

    const controllerContractInterface = [
      {
        constant: true,
        inputs: [
          {
            name: "",
            type: "bytes32"
          }
        ],
        name: "questRegister",
        outputs: [
          {
            name: "creator",
            type: "address"
          },
          {
            name: "identifier",
            type: "string"
          },
          {
            name: "verifierAddress",
            type: "address"
          },
          {
            name: "questPrice",
            type: "uint256"
          },
          {
            name: "questObjectURLonIPFS",
            type: "string"
          },
          {
            name: "cirDefURLonIPFS",
            type: "string"
          },
          {
            name: "provingKeyURLonIPFS",
            type: "string"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            name: "ERC20input",
            type: "address"
          },
          {
            name: "ERC721input",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "payer",
            type: "address"
          },
          {
            indexed: false,
            name: "recipient",
            type: "address"
          },
          {
            indexed: false,
            name: "identifierForQuest",
            type: "string"
          }
        ],
        name: "paymentForQuest",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "player",
            type: "address"
          },
          {
            indexed: false,
            name: "questName",
            type: "string"
          },
          {
            indexed: false,
            name: "tokenID",
            type: "uint256"
          }
        ],
        name: "victory",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "player",
            type: "address"
          },
          {
            indexed: false,
            name: "questName",
            type: "string"
          }
        ],
        name: "incorrectPath",
        type: "event"
      },
      {
        constant: true,
        inputs: [
          {
            name: "questName",
            type: "string"
          }
        ],
        name: "getHash",
        outputs: [
          {
            name: "",
            type: "bytes32"
          }
        ],
        payable: false,
        stateMutability: "pure",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          },
          {
            name: "creatorInput",
            type: "address"
          },
          {
            name: "identifierInput",
            type: "string"
          },
          {
            name: "verifierInput",
            type: "address"
          },
          {
            name: "priceInput",
            type: "uint256"
          },
          {
            name: "questObjectURLinput",
            type: "string"
          },
          {
            name: "cirDefURLinput",
            type: "string"
          },
          {
            name: "provingKeyURLinput",
            type: "string"
          }
        ],
        name: "addEntry",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          }
        ],
        name: "playerPayment",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          },
          {
            name: "a",
            type: "uint256[2]"
          },
          {
            name: "a_p",
            type: "uint256[2]"
          },
          {
            name: "b",
            type: "uint256[2][2]"
          },
          {
            name: "b_p",
            type: "uint256[2]"
          },
          {
            name: "c",
            type: "uint256[2]"
          },
          {
            name: "c_p",
            type: "uint256[2]"
          },
          {
            name: "h",
            type: "uint256[2]"
          },
          {
            name: "k",
            type: "uint256[2]"
          },
          {
            name: "input",
            type: "uint256[1]"
          }
        ],
        name: "checkAndMint",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "abandonCurrentQuest",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ];

    let controllerContract = await new web3.eth.Contract(
      controllerContractInterface,
      controllerContractAddress
    );
    controllerContract.setProvider(this.state.loom.loomProvider);

    // getting questEntry object from Quest Register on extdev

    // get quest name

    const questName = window.prompt(
      "Enter the name of the quest you wish to resolve"
    );

    // get hash of quest name

    let questNameHash;

    try {
      questNameHash = await controllerContract.methods
        .getHash(questName)
        .call({ from: accounts[1] });
    } catch (err) {
      console.log(`Hash of quest name could not be recovered : ${err}`);
    }

    // get quest entry from quest register

    let questEntry;

    try {
      questEntry = await controllerContract.methods
        .questRegister(questNameHash)
        .call({ from: accounts[1] });
    } catch (err) {
      console.log(
        `Quest Entry could not be recovered from Quest Register : ${err}`
      );
    }

    // get questObject from IPFS

    let response;
    let questObject;

    try {
      response = await fetch(questEntry.questObjectURLonIPFS);
      questObject = await response.json();
    } catch (err) {
      console.log(`Quest Object could not be recovered from IPFS : ${err}`);
    }

    // formatting the Paragraph object for readability (NB : not necessary in-game)

    let paragraphsArray = questObject.Paragraphs;

    // create paragraphsMapping out of Paragraphs Array

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

    console.log(orderedParagraphsArray);

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

    let paragraphsMappingString = "";
    paragraphsMapping.forEach(
      el =>
        (paragraphsMappingString = paragraphsMappingString.concat(`,[${el}]`))
    );
    paragraphsMappingString = paragraphsMappingString.substring(1);

    // getting user input (TBD : in-game format for user input) and converting to expected format for ZKP

    let userInput = window.prompt(
      `The paragraphs mapping is [${paragraphsMappingString}] Please enter the paragraph plays to test.`
    );
    userInput = userInput.toString();

    let movesArrayString = [];
    movesArrayString = userInput.split(" ");
    let movesArray = [];
    movesArrayString.forEach(el => movesArray.push(parseInt(el, 10)));

    let gap = paragraphsMapping.length - movesArray.length;

    for (var j = 0; j < gap; j++) {
      movesArray.push(0);
    }

    let inputJSON = { moves: movesArray };

    console.log(inputJSON);

    // fetching cirDef and provingKey from IPFS

    let response2;
    let cirDef;

    try {
      response2 = await fetch(questEntry.cirDefURLonIPFS);
      cirDef = await response2.json();
    } catch (err) {
      console.log(
        `Circuit definition could not be recovered from IPFS : ${err}`
      );
    }

    let response3;
    let provingKey;

    try {
      response3 = await fetch(questEntry.provingKeyURLonIPFS);
      provingKey = await response3.json();
    } catch (err) {
      console.log(`Proving Key could not be recovered from IPFS : ${err}`);
    }
    provingKey = snarkjs.unstringifyBigInts(provingKey);

    // generate proof

    const cir = new snarkjs.Circuit(cirDef);

    let witness;

    try {
      witness = cir.calculateWitness(inputJSON);
    } catch (err) {
      window.alert("Path does not respect constraints !");
    }

    const protocol = provingKey.protocol;
    if (!snarkjs[protocol]) throw new Error("Invalid protocol");

    const { proof, publicSignals } = await snarkjs[protocol].genProof(
      provingKey,
      witness
    );

    // create arguments for contract call

    const p256 = function(n) {
      let nstr = n.toString(16);
      while (nstr.length < 64) nstr = "0" + nstr;
      nstr = `"0x${nstr}"`;
      return nstr;
    };

    let inputs = "";
    for (let i = 0; i < publicSignals.length; i++) {
      if (inputs != "") inputs = inputs + ",";
      inputs = inputs + p256(publicSignals[i]);
    }

    let S;
    if (typeof proof.protocol === "undefined" || proof.protocol == "original") {
      S =
        `[${p256(proof.pi_a[0])}, ${p256(proof.pi_a[1])}],` +
        `[${p256(proof.pi_ap[0])}, ${p256(proof.pi_ap[1])}],` +
        `[[${p256(proof.pi_b[0][1])}, ${p256(proof.pi_b[0][0])}],[${p256(
          proof.pi_b[1][1]
        )}, ${p256(proof.pi_b[1][0])}]],` +
        `[${p256(proof.pi_bp[0])}, ${p256(proof.pi_bp[1])}],` +
        `[${p256(proof.pi_c[0])}, ${p256(proof.pi_c[1])}],` +
        `[${p256(proof.pi_cp[0])}, ${p256(proof.pi_cp[1])}],` +
        `[${p256(proof.pi_h[0])}, ${p256(proof.pi_h[1])}],` +
        `[${p256(proof.pi_kp[0])}, ${p256(proof.pi_kp[1])}],` +
        `[${inputs}]`;
    } else if (proof.protocol == "groth" || proof.protocol == "kimleeoh") {
      S =
        `[${p256(proof.pi_a[0])}, ${p256(proof.pi_a[1])}],` +
        `[[${p256(proof.pi_b[0][1])}, ${p256(proof.pi_b[0][0])}],[${p256(
          proof.pi_b[1][1]
        )}, ${p256(proof.pi_b[1][0])}]],` +
        `[${p256(proof.pi_c[0])}, ${p256(proof.pi_c[1])}],` +
        `[${inputs}]`;
    } else {
      throw new Error("InvalidProof");
    }

    console.log(S);

    const ZKParguments = JSON.parse("[" + S + "]");

    console.log(ZKParguments);
    console.log(...ZKParguments);

    // listen to victory event and call checkAndMint function of controller contract

    controllerContract.once("victory", function(err, result) {
      if (err) {
        console.log(`Path check and loot attribution failed : ${err}`); // --> to use in loading screen
      }
      console.log("Path check and loot attribution successful !"); // --> to use in loading screen
    });

    try {
      await controllerContract.methods
        .checkAndMint(questName, ...ZKParguments)
        .send({ from: accounts[1] });
    } catch (err) {
      console.log(`checkAndMint transaction failed : ${err}`);
    }
  };

  onAbandonQuest = async e => {
    const web3 = new Web3(this.state.loom.loomProvider);
    const accounts = await web3.eth.getAccounts();

    // initialize controller contract (deployed on extdev)
    const controllerContractAddress = window.prompt(
      "Please enter the address of the Controller Contract"
    ); // to get from console in truffle contracts deployment script (ubuntu)

    const controllerContractInterface = [
      {
        constant: true,
        inputs: [
          {
            name: "",
            type: "bytes32"
          }
        ],
        name: "questRegister",
        outputs: [
          {
            name: "creator",
            type: "address"
          },
          {
            name: "identifier",
            type: "string"
          },
          {
            name: "verifierAddress",
            type: "address"
          },
          {
            name: "questPrice",
            type: "uint256"
          },
          {
            name: "questObjectURLonIPFS",
            type: "string"
          },
          {
            name: "cirDefURLonIPFS",
            type: "string"
          },
          {
            name: "provingKeyURLonIPFS",
            type: "string"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            name: "ERC20input",
            type: "address"
          },
          {
            name: "ERC721input",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "payer",
            type: "address"
          },
          {
            indexed: false,
            name: "recipient",
            type: "address"
          },
          {
            indexed: false,
            name: "identifierForQuest",
            type: "string"
          }
        ],
        name: "paymentForQuest",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "player",
            type: "address"
          },
          {
            indexed: false,
            name: "questName",
            type: "string"
          },
          {
            indexed: false,
            name: "tokenID",
            type: "uint256"
          }
        ],
        name: "victory",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            name: "player",
            type: "address"
          },
          {
            indexed: false,
            name: "questName",
            type: "string"
          }
        ],
        name: "incorrectPath",
        type: "event"
      },
      {
        constant: true,
        inputs: [
          {
            name: "questName",
            type: "string"
          }
        ],
        name: "getHash",
        outputs: [
          {
            name: "",
            type: "bytes32"
          }
        ],
        payable: false,
        stateMutability: "pure",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          },
          {
            name: "creatorInput",
            type: "address"
          },
          {
            name: "identifierInput",
            type: "string"
          },
          {
            name: "verifierInput",
            type: "address"
          },
          {
            name: "priceInput",
            type: "uint256"
          },
          {
            name: "questObjectURLinput",
            type: "string"
          },
          {
            name: "cirDefURLinput",
            type: "string"
          },
          {
            name: "provingKeyURLinput",
            type: "string"
          }
        ],
        name: "addEntry",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          }
        ],
        name: "playerPayment",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [
          {
            name: "questName",
            type: "string"
          },
          {
            name: "a",
            type: "uint256[2]"
          },
          {
            name: "a_p",
            type: "uint256[2]"
          },
          {
            name: "b",
            type: "uint256[2][2]"
          },
          {
            name: "b_p",
            type: "uint256[2]"
          },
          {
            name: "c",
            type: "uint256[2]"
          },
          {
            name: "c_p",
            type: "uint256[2]"
          },
          {
            name: "h",
            type: "uint256[2]"
          },
          {
            name: "k",
            type: "uint256[2]"
          },
          {
            name: "input",
            type: "uint256[1]"
          }
        ],
        name: "checkAndMint",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "abandonCurrentQuest",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ];

    let controllerContract = await new web3.eth.Contract(
      controllerContractInterface,
      controllerContractAddress
    );
    controllerContract.setProvider(this.state.loom.loomProvider);

    // call abandonCurrentQuest function of Quest Controller contract

    try {
      await controllerContract.methods
        .abandonCurrentQuest()
        .send({ from: accounts[1] });
      console.log(
        "Current Quest has been abandoned. You may start a new Quest."
      );
    } catch (err) {
      console.log(`abandonCurrentQuest function failed : ${err}`);
    }
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
    /*
    const getProvider = async () => {
      await window.web3.currentProvider.enable(); // request authentication
    };
    getProvider();
*/
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
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onLaunchPayment}
                        className="btn btn-primary btn-sm"
                      >
                        Launch Payment
                      </button>
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onSendSolution}
                        className="btn btn-primary btn-sm"
                      >
                        Send Solution
                      </button>
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onAbandonQuest}
                        className="btn btn-primary btn-sm"
                      >
                        Abandon Quest
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
