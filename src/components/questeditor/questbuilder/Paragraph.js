import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";
import ipfsClient from "ipfs-http-client";

import NarrationInput from "./NarrationInput";
import DialogueInput from "./DialogueInput";
import PathInput from "./PathInput";
import RiddleInput from "./RiddleInput";
import CombatInput from "./CombatInput";
import LinkSelection from "./LinkSelection";
import Spinner from "../../layout/Spinner";

import {
  addParagraphLink,
  removeParagraphLink,
  setToSuddenDeathInRegister,
  setToVictoryInRegister,
  setParagraphTypeInRegister,
  setParagraphLinkStatusInRegister,
  setToFinalBossInRegister
} from "../../../actions/paragraphActions";

class Paragraph extends Component {
  constructor(props) {
    super(props);
    this.paragraphRef = React.createRef();
  }

  state = {
    isSaving: false,
    paragraphType: "narration",
    paragraphSubTypes: {
      isSuddenDeath: false,
      isVictory: false,
      isTextualRiddle: false,
      isGraphicalRiddle: false,
      isPointAndClickPath: false,
      isTextualPath: false,
      isMobCombat: false,
      isEliteMobCombat: false,
      isFinalBossCombat: false
    },
    hasLinkToPreviousParagraph: false,
    hasLinkToNextParagraph: false,
    nextParagraphs: [],
    previousParagraphs: [],
    selectedMonster: {},
    backgroundImageURL: "",
    startingSoundURL: ""
  };

  componentDidMount = async () => {
    if (
      this.props.QuestUnderEdition
      // && this.props.QuestUnderEdition.id === this.props.match.params.id
    ) {
      if (
        this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.props.id
        )
      ) {
        let paragraphInFirestore = this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.props.id
        );

        await this.setState({
          paragraphType: paragraphInFirestore.paragraphType,
          paragraphSubTypes: paragraphInFirestore.paragraphSubTypes,
          hasLinkToPreviousParagraph:
            paragraphInFirestore.hasLinkToPreviousParagraph,
          hasLinkToNextParagraph: paragraphInFirestore.hasLinkToNextParagraph,
          nextParagraphs: paragraphInFirestore.nextParagraphs,
          previousParagraphs: paragraphInFirestore.previousParagraphs,
          selectedMonster: paragraphInFirestore.selectedMonster,
          backgroundImageURL: paragraphInFirestore.backgroundImageURL,
          startingSoundURL: paragraphInFirestore.startingSoundURL
        });
      }
    }

    if (this.props.depthNumber === 0) {
      await this.setState({ hasLinkToPreviousParagraph: true });
    }
  };

  componentDidUpdate = async prevProps => {
    if (
      this.props.id !== prevProps.id &&
      this.props.QuestUnderEdition
      //&& this.props.QuestUnderEdition.id === this.props.match.params.id
    ) {
      if (
        this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.props.id
        )
      ) {
        let paragraphInFirestore = this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.props.id
        );

        await this.setState({
          paragraphType: paragraphInFirestore.paragraphType,
          paragraphSubTypes: paragraphInFirestore.paragraphSubTypes,
          hasLinkToPreviousParagraph:
            paragraphInFirestore.hasLinkToPreviousParagraph,
          hasLinkToNextParagraph: paragraphInFirestore.hasLinkToNextParagraph,
          nextParagraphs: paragraphInFirestore.nextParagraphs,
          previousParagraphs: paragraphInFirestore.previousParagraphs,
          selectedMonster: paragraphInFirestore.selectedMonster,
          backgroundImageURL: paragraphInFirestore.backgroundImageURL,
          startingSoundURL: paragraphInFirestore.startingSoundURL
        });
      }
    }
  };

  // update paragraph if paragraph link is detected from Redux store
  static getDerivedStateFromProps(props, state) {
    let paragraphInRegister = props.paragraphData.paragraphRegister.find(
      el =>
        el.depthNumber === props.depthNumber &&
        el.paragraphNumber === props.paragraphNumber
    );
    // check if one of the outcomeTexts of the paragraph has been changed
    /*if (
      paragraphInRegister &&
      paragraphInRegister.nextParagraphs.length > 0 &&
      paragraphInRegister.nextParagraphs.length === state.nextParagraphs.length
    ) {
      let comparisonArray = [];
      var checkOutcomeTexts;

      paragraphInRegister.nextParagraphs.forEach(el => {
        state.nextParagraphs.forEach(elem => {
          if (el.outcomeText !== elem.outcomeText) {
            comparisonArray.push(false);
          }
        });
      });

      comparisonArray.length > 0
        ? (checkOutcomeTexts = true)
        : (checkOutcomeTexts = false);

      // check if a pointer has been added to a nextParagraph (path paragraph of point & click sub-type)

      let comparisonArray2 = [];
      var checkSelectedPointers;

      paragraphInRegister.nextParagraphs.forEach(el => {
        state.nextParagraphs.forEach(elem => {
          if (el.selectedPointer !== elem.selectedPointer) {
            comparisonArray2.push(false);
          }
        });
      });

      comparisonArray2.length > 0
        ? (checkSelectedPointers = true)
        : (checkSelectedPointers = false);
    }

    if (checkOutcomeTexts === true || checkSelectedPointers === true) {
      return null;
    } else*/ if (
      paragraphInRegister &&
      paragraphInRegister.nextParagraphs &&
      paragraphInRegister.nextParagraphs.length > state.nextParagraphs.length
    ) {
      let updatedNextParagraphs = [...state.nextParagraphs];
      updatedNextParagraphs.push(
        paragraphInRegister.nextParagraphs[
          paragraphInRegister.nextParagraphs.length - 1
        ]
      );
      return {
        nextParagraphs: updatedNextParagraphs,
        hasLinkToNextParagraph: paragraphInRegister.hasLinkToNextParagraph
      };
    } else if (
      paragraphInRegister &&
      paragraphInRegister.nextParagraphs &&
      paragraphInRegister.nextParagraphs.length < state.nextParagraphs.length
    ) {
      let indexOfDeletedParagraph = state.nextParagraphs.findIndex(el =>
        paragraphInRegister.nextParagraphs.find(
          elem => elem.paragraphNumber !== el.paragraphNumber
        )
      );

      let updatedNextParagraphs = [...state.nextParagraphs];
      updatedNextParagraphs.splice(indexOfDeletedParagraph, 1);

      return {
        nextParagraphs: updatedNextParagraphs,
        hasLinkToNextParagraph: paragraphInRegister.hasLinkToNextParagraph
      };
    } else if (
      paragraphInRegister &&
      paragraphInRegister.previousParagraphs &&
      paragraphInRegister.previousParagraphs.length > 0
    ) {
      return {
        previousParagraphs: paragraphInRegister.previousParagraphs,
        hasLinkToPreviousParagraph:
          paragraphInRegister.hasLinkToPreviousParagraph
      };
    } else if (
      paragraphInRegister &&
      paragraphInRegister.previousParagraphs &&
      paragraphInRegister.previousParagraphs.length === 0 &&
      props.depthNumber !== 0
    ) {
      return {
        previousParagraphs: paragraphInRegister.previousParagraphs,
        hasLinkToPreviousParagraph: false
      };
    } else {
      return null;
    }
  }

  deleteParagraph = e => {
    if (this.props.depthNumber === 0) {
      window.alert("You cannot delete the starting paragraph.");
    } else if (
      this.state.hasLinkToNextParagraph ||
      this.state.hasLinkToPreviousParagraph
    ) {
      window.alert(
        "You cannot delete a paragraph that has links to previous or next paragraphs. You must remove these links first."
      );
    } else if (this.state.isSaving) {
      window.alert("You cannot delete a paragraph while it is saving.");
    } else {
      this.props.deleteParagraph(e, this.props.id);
    }
  };

  saveParagraph = async (
    inputText = null,
    backgroundImage = null,
    startingSound = null,
    outcomeSoundArray = null,
    outcomeImageArray = null
  ) => {
    if (this.state.isSaving) {
      window.alert(
        "You must wait for the current save to finish before you can save again."
      );
    } else {
      await this.setState({ isSaving: true });
      const { firestore, QuestUnderEdition } = this.props;

      const {
        paragraphType,
        paragraphSubTypes,
        hasLinkToPreviousParagraph,
        hasLinkToNextParagraph,
        nextParagraphs,
        previousParagraphs
      } = this.state;
      const { depthNumber, paragraphNumber, id } = this.props;

      // shallow copy needed for data synced from Firestore
      let nextParagraphsCopy = [];
      [...this.state.nextParagraphs].forEach(el =>
        nextParagraphsCopy.push({ ...el })
      );

      const paragraphData = {
        depthNumber,
        paragraphNumber,
        id,
        hasLinkToNextParagraph,
        hasLinkToPreviousParagraph,
        nextParagraphs: nextParagraphsCopy,
        previousParagraphs,
        paragraphSubTypes,
        paragraphType
      };

      if (inputText) {
        paragraphData.inputText = inputText;
      }

      if (this.state.paragraphType === "combat" && this.state.selectedMonster) {
        paragraphData.selectedMonster = this.state.selectedMonster;
      }

      if (this.state.backgroundImageURL) {
        paragraphData.backgroundImageURL = this.state.backgroundImageURL;
      }

      if (this.state.startingSoundURL) {
        paragraphData.startingSoundURL = this.state.startingSoundURL;
      }

      let paragraphAlreadyInDatabase = QuestUnderEdition.Paragraphs.find(
        el => el.id === id
      );

      //Connecting to the ipfs network via infura gateway
      const ipfs = ipfsClient("ipfs.infura.io", "5001", { protocol: "https" });

      // uploading files to Firebase Storage if new files selected, delete existing paragraph files if they are not part of the last save

      // Get a reference to the storage service, which is used to create references in your storage bucket
      const storage = this.props.firebase.storage();

      // Create a storage reference from our storage service
      const storageRef = storage.ref();
      const paragraphRef = storageRef.child(
        `${this.props.QuestUnderEdition.id}/Paragraph ${this.props.depthNumber} - ${this.props.paragraphNumber}`
      );
      //const paragraphList = await paragraphRef.listAll();

      if (backgroundImage && backgroundImage !== "already uploaded") {
        let snapshot = await this.props.firebase.uploadFile(
          `${this.props.QuestUnderEdition.id}/Paragraph ${this.props.depthNumber} - ${this.props.paragraphNumber}`,
          backgroundImage,
          null,
          {
            name: `backgroundImage${backgroundImage.name.substring(
              backgroundImage.name.lastIndexOf(".")
            )}`
          }
        );
        let gsReference = await storage.refFromURL(
          `gs://${snapshot.uploadTaskSnapshot.metadata.bucket}/${snapshot.uploadTaskSnapshot.metadata.fullPath}`
        );
        let backgroundImageURL = await gsReference.getDownloadURL();
        paragraphData.backgroundImageURL = backgroundImageURL;

        // upload to IPFS
        const resultsBackgroundImage = await ipfs.add(backgroundImage);
        const hashBackgroundImage = resultsBackgroundImage[0].hash;
        const backgroundImageURLonIPFS = `https://gateway.ipfs.io/ipfs/${hashBackgroundImage}`;
        paragraphData.backgroundImageURLonIPFS = backgroundImageURLonIPFS;
      } else if (backgroundImage && backgroundImage === "already uploaded") {
        paragraphData.backgroundImageURL =
          paragraphAlreadyInDatabase.backgroundImageURL;
        paragraphData.backgroundImageURLonIPFS =
          paragraphAlreadyInDatabase.backgroundImageURLonIPFS;
      }

      if (startingSound && startingSound !== "already uploaded") {
        let snapshot = await this.props.firebase.uploadFile(
          `${this.props.QuestUnderEdition.id}/Paragraph ${this.props.depthNumber} - ${this.props.paragraphNumber}`,
          startingSound,
          null,
          {
            name: `startingSound${startingSound.name.substring(
              startingSound.name.lastIndexOf(".")
            )}`
          }
        );
        let gsReference = await storage.refFromURL(
          `gs://${snapshot.uploadTaskSnapshot.metadata.bucket}/${snapshot.uploadTaskSnapshot.metadata.fullPath}`
        );

        let startingSoundURL = await gsReference.getDownloadURL();
        paragraphData.startingSoundURL = startingSoundURL;

        // upload on IPFS
        const resultsStartingSound = await ipfs.add(startingSound);
        const hashStartingSound = resultsStartingSound[0].hash;
        const startingSoundURLonIPFS = `https://gateway.ipfs.io/ipfs/${hashStartingSound}`;
        paragraphData.startingSoundURLonIPFS = startingSoundURLonIPFS;
      } else if (startingSound && startingSound === "already uploaded") {
        paragraphData.startingSoundURL =
          paragraphAlreadyInDatabase.startingSoundURL;
        paragraphData.startingSoundURLonIPFS =
          paragraphAlreadyInDatabase.startingSoundURLonIPFS;
      }

      let outcomeSoundsFiles = await paragraphRef
        .child("Outcomes")
        .child("Sounds")
        .listAll();

      // declaring async function to process outcomeSound uploads in parallel then waiting for all promises to return before continuing execution
      async function processOutcomeSounds(outcomeSounds) {
        async function processOutcomeSound(outcomeSound) {
          let snapshot = await this.props.firebase.uploadFile(
            `${this.props.QuestUnderEdition.id}/Paragraph ${this.props.depthNumber} - ${this.props.paragraphNumber}/Outcomes/Sounds`,
            outcomeSound.outcomeSound,
            null,
            {
              name: `outcomeSound_${
                outcomeSound.rankInNextParagraphs
              }${outcomeSound.outcomeSound.name.substring(
                outcomeSound.outcomeSound.name.lastIndexOf(".")
              )}`
            }
          );
          let gsReference = await storage.refFromURL(
            `gs://${snapshot.uploadTaskSnapshot.metadata.bucket}/${snapshot.uploadTaskSnapshot.metadata.fullPath}`
          );
          let outcomeSoundURL = await gsReference.getDownloadURL();
          paragraphData.nextParagraphs[
            outcomeSound.rankInNextParagraphs
          ].outcomeSoundURL = outcomeSoundURL;
        }
        let boundedprocessOutcomeSound = processOutcomeSound.bind(this);
        const promises = outcomeSounds.map(boundedprocessOutcomeSound);
        await Promise.all(promises);
      }
      let boundedprocessOutcomeSounds = processOutcomeSounds.bind(this);

      if (
        outcomeSoundArray &&
        outcomeSoundArray.length === 0 &&
        outcomeSoundsFiles.items.length > 0
      ) {
        //clear all
        for (const el of outcomeSoundsFiles.items) {
          await el.delete();
        }
      } else if (outcomeSoundArray && outcomeSoundArray.length > 0) {
        //clear all
        for (const el of outcomeSoundsFiles.items) {
          await el.delete();
        }
        // upload all including outcome sounds with a counter of 0
        await boundedprocessOutcomeSounds(outcomeSoundArray);
      }

      // upload on IPFS
      if (outcomeSoundArray) {
        for (const outcomeSound of outcomeSoundArray) {
          if (outcomeSound.outcomeSoundCounter === 1) {
            const resultsOutcomeSound = await ipfs.add(
              outcomeSound.outcomeSound
            );
            const hashOutcomeSound = resultsOutcomeSound[0].hash;
            const outcomeSoundURLonIPFS = `https://gateway.ipfs.io/ipfs/${hashOutcomeSound}`;

            paragraphData.nextParagraphs[
              outcomeSound.rankInNextParagraphs
            ].outcomeSoundURLonIPFS = outcomeSoundURLonIPFS;
          } else {
            paragraphData.nextParagraphs[
              outcomeSound.rankInNextParagraphs
            ].outcomeSoundURLonIPFS =
              paragraphAlreadyInDatabase.nextParagraphs[
                outcomeSound.rankInNextParagraphs
              ].outcomeSoundURLonIPFS;
          }
        }
      }
      let outcomeImagesFiles = await paragraphRef
        .child("Outcomes")
        .child("Images")
        .listAll();

      // declaring async function to process outcomeImage uploads in parallel then waiting for all promises to return before continuing execution
      async function processOutcomeImages(outcomeImages) {
        async function processOutcomeImage(outcomeImage) {
          let snapshot = await this.props.firebase.uploadFile(
            `${this.props.QuestUnderEdition.id}/Paragraph ${this.props.depthNumber} - ${this.props.paragraphNumber}/Outcomes/Images`,
            outcomeImage.outcomeImage,
            null,
            {
              name: `outcomeImage_${
                outcomeImage.rankInNextParagraphs
              }${outcomeImage.outcomeImage.name.substring(
                outcomeImage.outcomeImage.name.lastIndexOf(".")
              )}`
            }
          );
          let gsReference = await storage.refFromURL(
            `gs://${snapshot.uploadTaskSnapshot.metadata.bucket}/${snapshot.uploadTaskSnapshot.metadata.fullPath}`
          );
          let outcomeImageURL = await gsReference.getDownloadURL();
          paragraphData.nextParagraphs[
            outcomeImages.indexOf(outcomeImage)
          ].outcomeImageURL = outcomeImageURL;
        }
        let boundedprocessOutcomeImage = processOutcomeImage.bind(this);
        const promises = outcomeImages.map(boundedprocessOutcomeImage);
        await Promise.all(promises);
      }
      let boundedprocessOutcomeImages = processOutcomeImages.bind(this);

      if (
        outcomeImageArray &&
        outcomeImageArray.length === 0 &&
        outcomeImagesFiles.items.length > 0
      ) {
        //clear all
        for (const el of outcomeImagesFiles.items) {
          await el.delete();
        }
      } else if (outcomeImageArray && outcomeImageArray.length > 0) {
        //clear all
        for (const el of outcomeImagesFiles.items) {
          await el.delete();
        }
        // upload all including outcome images with a counter of 0
        await boundedprocessOutcomeImages(outcomeImageArray);
      }

      // upload on IPFS
      if (outcomeImageArray) {
        for (const outcomeImage of outcomeImageArray) {
          if (outcomeImage.outcomeImageCounter === 1) {
            const resultsOutcomeImage = await ipfs.add(
              outcomeImage.outcomeImage
            );
            const hashOutcomeImage = resultsOutcomeImage[0].hash;
            const outcomeImageURLonIPFS = `https://gateway.ipfs.io/ipfs/${hashOutcomeImage}`;

            paragraphData.nextParagraphs[
              outcomeImage.rankInNextParagraphs
            ].outcomeImageURLonIPFS = outcomeImageURLonIPFS;
          } else {
            paragraphData.nextParagraphs[
              outcomeImage.rankInNextParagraphs
            ].outcomeImageURLonIPFS =
              paragraphAlreadyInDatabase.nextParagraphs[
                outcomeImage.rankInNextParagraphs
              ].outcomeImageURLonIPFS;
          }
        }
      }

      console.log(paragraphData);
      // removing existing entry in Firestore to avoid duplicates
      if (paragraphAlreadyInDatabase) {
        (async function() {
          await firestore.update(
            { collection: "QuestsInProgress", doc: QuestUnderEdition.id },
            {
              Paragraphs: firestore.FieldValue.arrayRemove(
                paragraphAlreadyInDatabase
              )
            }
          );
        })();
      }

      // update Quest information and add Paragraph data to Firestore
      await firestore.update(
        { collection: "QuestsInProgress", doc: QuestUnderEdition.id },
        {
          Paragraphs: firestore.FieldValue.arrayUnion(paragraphData),
          numDepthLevels: this.props.numDepthLevels.numDepthLevels,
          NbParagraphs: this.props.paragraphData.paragraphNumberTotal,
          paragraphRegister: this.props.paragraphData.paragraphRegister,
          paragraphLinkRegister: this.props.paragraphData.paragraphLinkRegister
        }
      );
      await this.setState({ isSaving: false });

      // reset the globalSaveCounter every time a Paragraph Save is done
      if (
        this.props.QuestUnderEdition.globalSaveCounter === 1 &&
        !this.props.paragraphData.isGlobalSaving
      ) {
        await this.props.firestore.update(
          {
            collection: "QuestsInProgress",
            doc: this.props.QuestUnderEdition.id
          },
          {
            globalSaveCounter: 0
          }
        );
      }

      if (!this.props.paragraphData.isGlobalSaving) {
        window.alert("Paragraph data has been saved !");
      }
    }
  };

  changeParagraphType = e => {
    // check if paragraph is linked to a previous final boss paragraph, if yes paragraph type cannot be changed
    let prevParagraphsInRegister = [];

    for (var i = 0; i < this.state.previousParagraphs.length; i++) {
      let prevParagraphInRegister;
      prevParagraphInRegister = this.props.paragraphData.paragraphRegister.find(
        el =>
          this.state.previousParagraphs[i].depthNumber === el.depthNumber &&
          this.state.previousParagraphs[i].paragraphNumber ===
            el.paragraphNumber
      );
      prevParagraphsInRegister.push(prevParagraphInRegister);
    }

    if (
      e.currentTarget.id !== "narration" &&
      prevParagraphsInRegister.some(
        el => el.paragraphSubTypes.isFinalBossCombat === true
      )
    ) {
      window.alert(
        "A Paragraph linked from a 'Final Boss' Paragraph can only be of 'Narration' type."
      );
    } else if (
      this.state.paragraphSubTypes.isFinalBossCombat === true &&
      this.state.nextParagraphs.find(el =>
        this.props.paragraphData.paragraphRegister.find(
          elem => elem.paragraphSubTypes.isVictory === true
        )
      )
    ) {
      window.alert(
        "This paragraph is linked to a Victory paragraph and of 'Final Boss' type. If you want to change the paragraph type, you must first remove the link to the 'Victory' paragraph."
      );
    } else if (
      (e.currentTarget.id === "narration" || e.currentTarget.id === "combat") &&
      this.state.nextParagraphs.length > 1
    ) {
      window.alert(
        "A paragraph of 'narration' or 'combat' type can only have one next paragraph. You must remove links to next paragraphs."
      );
    } else if (
      e.currentTarget.id !== this.state.paragraphType &&
      window.confirm(
        `Are you sure you want to change the Paragraph Type ? \n \n All content from the current Paragraph inputs will be deleted and CANNOT BE RECOVERED.`
      )
    ) {
      {
        // clear the state from paragraph subtypes
        let keys = Object.keys({ ...this.state.paragraphSubTypes });
        let stateWithClearedParagraphSubtypes = {};

        for (var j = 0; j < keys.length; j++) {
          stateWithClearedParagraphSubtypes[keys[j]] = false;
        }

        this.setState({
          paragraphSubTypes: stateWithClearedParagraphSubtypes
        });

        // clear existing outcome texts/sounds/images
        let clearedNextParagraphs = [];
        [...this.state.nextParagraphs].forEach(el =>
          clearedNextParagraphs.push({ ...el })
        );
        clearedNextParagraphs.map(el => {
          delete el.outcomeText;
          delete el.outcomeSoundURL;
          delete el.outcomeImageURL;
        });
        this.setState({
          nextParagraphs: clearedNextParagraphs
        });

        // clear selected Monster
        if (this.state.selectedMonster !== {}) {
          this.setState({ selectedMonster: {} });
        }

        var tabs = e.currentTarget.parentElement.children;
        for (var k = 0; k < tabs.length; k++) {
          tabs[k].className = tabs[k].className.replace(" active", "");
        }
        e.currentTarget.className += " active";

        this.setState({ paragraphType: e.currentTarget.id });

        this.props.setParagraphTypeInRegister(
          this.props.depthNumber,
          this.props.paragraphNumber,
          e.currentTarget.id
        );
      }
    }
  };

  changeOutcomeText = async (depthNumber, paragraphNumber, outcomeText) => {
    let updatedNextParagraph = {
      ...this.state.nextParagraphs.find(
        el =>
          el.depthNumber === depthNumber &&
          el.paragraphNumber === paragraphNumber
      )
    };

    updatedNextParagraph.outcomeText = outcomeText;
    let updatedNextParagraphs = [...this.state.nextParagraphs];

    let index = updatedNextParagraphs.findIndex(
      el =>
        el.depthNumber === depthNumber && el.paragraphNumber === paragraphNumber
    );

    updatedNextParagraphs[index] = updatedNextParagraph;

    await this.setState({
      nextParagraphs: updatedNextParagraphs
    });
  };

  selectPointer = async selectedPointers => {
    let updatedNextParagraphs = [];

    this.state.nextParagraphs.forEach(el =>
      updatedNextParagraphs.push({ ...el })
    );

    updatedNextParagraphs.map((el, index) => {
      el.selectedPointer = selectedPointers[index];
    });

    await this.setState({
      nextParagraphs: updatedNextParagraphs
    });
  };

  selectMonster = async selectedMonster => {
    await this.setState({
      selectedMonster: selectedMonster
    });
  };

  setToSuddenDeath = async e => {
    await this.props.setToSuddenDeathInRegister(
      this.props.depthNumber,
      this.props.paragraphNumber
    );
    let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
    updatedStateSubTypes.isSuddenDeath = !updatedStateSubTypes.isSuddenDeath;
    await this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToVictory = async target => {
    let prevParagraphsInRegister = [];

    for (var i = 0; i < this.state.previousParagraphs.length; i++) {
      let prevParagraphInRegister;
      prevParagraphInRegister = this.props.paragraphData.paragraphRegister.find(
        el =>
          this.state.previousParagraphs[i].depthNumber === el.depthNumber &&
          this.state.previousParagraphs[i].paragraphNumber ===
            el.paragraphNumber
      );
      prevParagraphsInRegister.push(prevParagraphInRegister);
    }

    if (
      prevParagraphsInRegister.length === 0 ||
      !prevParagraphsInRegister.every(
        el => el.paragraphSubTypes.isFinalBossCombat === true
      )
    ) {
      window.alert(
        "A 'victory' paragraph can only be linked from a 'final boss' paragraph."
      );
      target.checked = false;
    } else {
      await this.props.setToVictoryInRegister(
        this.props.depthNumber,
        this.props.paragraphNumber
      );
      let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
      updatedStateSubTypes.isVictory = !updatedStateSubTypes.isVictory;
      await this.setState({
        paragraphSubTypes: updatedStateSubTypes
      });
    }
  };

  setToTextualRiddle = async e => {
    let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
    updatedStateSubTypes.isTextualRiddle = !updatedStateSubTypes.isTextualRiddle;

    if (!updatedStateSubTypes.isTextualRiddle) {
      // clear existing outcome texts
      let clearedNextParagraphs = this.state.nextParagraphs;
      clearedNextParagraphs = clearedNextParagraphs.map(
        el => ({ ...el }.outcomeText = "")
      );
      await this.setState({
        nextParagraphs: clearedNextParagraphs
      });
    }

    await this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToGraphicalRiddle = async e => {
    let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
    updatedStateSubTypes.isGraphicalRiddle = !updatedStateSubTypes.isGraphicalRiddle;
    await this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToTextualPath = async e => {
    let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
    updatedStateSubTypes.isTextualPath = !updatedStateSubTypes.isTextualPath;

    if (!updatedStateSubTypes.isTextualPath) {
      // clear existing outcome texts
      let clearedNextParagraphs = this.state.nextParagraphs;
      clearedNextParagraphs = clearedNextParagraphs.map(
        el => ({ ...el }.outcomeText = "")
      );
      await this.setState({
        nextParagraphs: clearedNextParagraphs
      });
    }

    await this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToPointAndClickPath = async e => {
    let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
    updatedStateSubTypes.isPointAndClickPath = !updatedStateSubTypes.isPointAndClickPath;
    await this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToMobCombat = async e => {
    let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
    if (updatedStateSubTypes.isMobCombat) {
      await this.setState({ selectedMonster: {} });
    }
    updatedStateSubTypes.isMobCombat = !updatedStateSubTypes.isMobCombat;
    await this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToEliteMobCombat = async e => {
    let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
    if (updatedStateSubTypes.isEliteMobCombat) {
      await this.setState({ selectedMonster: {} });
    }
    updatedStateSubTypes.isEliteMobCombat = !updatedStateSubTypes.isEliteMobCombat;
    await this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToFinalBossCombat = async e => {
    let updatedStateSubTypes = { ...this.state.paragraphSubTypes };
    if (updatedStateSubTypes.isFinalBossCombat) {
      await this.setState({ selectedMonster: {} });
    }
    updatedStateSubTypes.isFinalBossCombat = !updatedStateSubTypes.isFinalBossCombat;
    await this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
    await this.props.setToFinalBossInRegister(
      this.props.depthNumber,
      this.props.paragraphNumber
    );
  };

  toggleParagraphLink = (
    parentNode,
    depthNumberOfLinkedParagraph,
    paragraphNumberOfLinkedParagraph,
    isLinked
  ) => {
    let prevParagraph = this.props.paragraphData.paragraphRegister.find(
      el =>
        el.depthNumber === depthNumberOfLinkedParagraph &&
        el.paragraphNumber === paragraphNumberOfLinkedParagraph
    );

    switch (true) {
      // if link is made from a Final Boss Paragraph, alert that Paragraph Type must be set to Narration

      case isLinked &&
        prevParagraph.paragraphSubTypes.isFinalBossCombat &&
        this.state.paragraphType !== "narration":
        alert(
          "Only a Paragraph of 'Narration' Type can be linked from a Final Boss Paragraph."
        );
        return "unlink";

      // if Paragraph is already set to Victory Type, it can be linked only from previous Final Boss Paragraphs

      case this.state.paragraphSubTypes.isVictory &&
        !prevParagraph.paragraphSubTypes.isFinalBossCombat:
        alert(
          "A Paragraph of 'Victory' Type can only be linked from a Final Boss Paragraph."
        );
        return "unlink";

      case isLinked:
        this.props.addParagraphLink(
          this.props.depthNumber,
          this.props.paragraphNumber,
          depthNumberOfLinkedParagraph,
          paragraphNumberOfLinkedParagraph
        );
        this.setState({
          hasLinkToPreviousParagraph: true
        });
        break;
      case !isLinked:
        this.props.removeParagraphLink(
          this.props.depthNumber,
          this.props.paragraphNumber,
          depthNumberOfLinkedParagraph,
          paragraphNumberOfLinkedParagraph
        );
        break;
      default:
        return;
    }
  };

  render() {
    // create dropdown list of previous paragraphs that can be potential links to the paragraph
    const paragraphLinksSelection = [];

    for (
      var i = 0;
      i < this.props.paragraphData.paragraphRegister.length;
      i += 1
    ) {
      // printing all paragraphs from lower depth levels, but hiding "sudden death", "victory" and already-linked narration or combat paragraphs (only visible for the paragraph linked next)
      if (
        this.props.paragraphData.paragraphRegister[i].depthNumber <
          this.props.depthNumber &&
        (this.props.paragraphData.paragraphRegister[i].paragraphSubTypes
          .isSuddenDeath ||
          this.props.paragraphData.paragraphRegister[i].paragraphSubTypes
            .isVictory ||
          ((this.props.paragraphData.paragraphRegister[i].paragraphType ===
            "narration" ||
            this.props.paragraphData.paragraphRegister[i].paragraphType ===
              "combat") &&
            this.props.paragraphData.paragraphRegister[i]
              .hasLinkToNextParagraph &&
            !this.props.paragraphData.paragraphRegister[i].nextParagraphs.some(
              nextParagraph =>
                nextParagraph.depthNumber === this.props.depthNumber &&
                nextParagraph.paragraphNumber === this.props.paragraphNumber
            )))
      ) {
        paragraphLinksSelection.push(
          <LinkSelection
            rank={i}
            display="hide"
            toggleParagraphLink={this.toggleParagraphLink}
            depthNumberOfLinkedParagraph={
              this.props.paragraphData.paragraphRegister[i].depthNumber
            }
            paragraphNumberOfLinkedParagraph={
              this.props.paragraphData.paragraphRegister[i].paragraphNumber
            }
            isLinked={
              this.state.previousParagraphs.find(
                el =>
                  el.depthNumber ===
                    this.props.paragraphData.paragraphRegister[i].depthNumber &&
                  el.paragraphNumber ===
                    this.props.paragraphData.paragraphRegister[i]
                      .paragraphNumber
              )
                ? true
                : false
            }
          />
        );
      } else if (
        this.props.paragraphData.paragraphRegister[i].depthNumber <
        this.props.depthNumber
      ) {
        paragraphLinksSelection.push(
          <LinkSelection
            rank={i}
            display="show"
            toggleParagraphLink={this.toggleParagraphLink}
            depthNumberOfLinkedParagraph={
              this.props.paragraphData.paragraphRegister[i].depthNumber
            }
            paragraphNumberOfLinkedParagraph={
              this.props.paragraphData.paragraphRegister[i].paragraphNumber
            }
            isLinked={
              this.state.previousParagraphs.find(
                el =>
                  el.depthNumber ===
                    this.props.paragraphData.paragraphRegister[i].depthNumber &&
                  el.paragraphNumber ===
                    this.props.paragraphData.paragraphRegister[i]
                      .paragraphNumber
              )
                ? true
                : false
            }
          />
        );
      }
    }

    return (
      <div
        style={{
          margin: "0px auto",
          paddingRight: "20px",
          verticalAlign: "top",
          position: "relative"
        }}
        className={this.state.isSaving ? "isSaving" : null}
      >
        <div
          className={`card paragraph ${
            this.state.hasLinkToNextParagraph ? "linked-to-next" : null
          } ${
            this.state.hasLinkToPreviousParagraph ? "linked-to-previous" : null
          } ${
            this.state.paragraphSubTypes.isSuddenDeath ? "suddendeath" : null
          } ${this.state.paragraphSubTypes.isVictory ? "victory" : null}`}
          ref={this.paragraphRef}
        >
          {this.state.isSaving ? (
            <Spinner
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -40%)",
                marginTop: "-50px"
              }}
            />
          ) : null}
          <div className="card-header">
            <button
              className={`paragraph-type ${this.props.depthNumber} - ${
                this.props.newParagraphNumber
                  ? this.props.newParagraphNumber
                  : this.props.paragraphNumber
              } ${this.state.paragraphType === "narration" ? "active" : null}`}
              id="narration"
              onClick={this.changeParagraphType}
            >
              Narration
            </button>
            <button
              className={`paragraph-type ${this.props.depthNumber} - ${
                this.props.newParagraphNumber
                  ? this.props.newParagraphNumber
                  : this.props.paragraphNumber
              } ${this.state.paragraphType === "dialogue" ? "active" : null}`}
              id="dialogue"
              onClick={this.changeParagraphType}
            >
              Dialogue
            </button>
            <button
              className={`paragraph-type ${this.props.depthNumber} - ${
                this.props.newParagraphNumber
                  ? this.props.newParagraphNumber
                  : this.props.paragraphNumber
              } ${this.state.paragraphType === "path" ? "active" : null}`}
              id="path"
              onClick={this.changeParagraphType}
            >
              Path
            </button>
            <button
              className={`paragraph-type ${this.props.depthNumber} - ${
                this.props.newParagraphNumber
                  ? this.props.newParagraphNumber
                  : this.props.paragraphNumber
              } ${this.state.paragraphType === "riddle" ? "active" : null}`}
              id="riddle"
              onClick={this.changeParagraphType}
            >
              Riddle
            </button>
            <button
              className={`paragraph-type ${this.props.depthNumber} - ${
                this.props.newParagraphNumber
                  ? this.props.newParagraphNumber
                  : this.props.paragraphNumber
              } ${this.state.paragraphType === "combat" ? "active" : null}`}
              id="combat"
              onClick={this.changeParagraphType}
            >
              Combat
            </button>
          </div>
          <h3
            className="card-title"
            style={{
              fontSize: "1rem",
              marginBottom: "5px",
              marginTop: "5px",
              textAlign: "center"
            }}
          >
            {this.props.depthNumber === 0
              ? "START"
              : `§ ${this.props.depthNumber} - ${
                  this.props.newParagraphNumber
                    ? this.props.newParagraphNumber
                    : this.props.paragraphNumber
                }`}
          </h3>
          {this.props.depthNumber === 0 ? null : (
            <li className="dropdown" style={{ marginBottom: "5px" }}>
              <a
                className="dropdown-toggle"
                href="#"
                id="dropdown03"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                style={{
                  fontWeight: "500",
                  fontSize: "0.8rem",
                  paddingLeft: "10px"
                }}
              >
                Paragraph linked from
              </a>
              <div
                className="dropdown-menu"
                aria-labelledby="dropdown03"
                style={{
                  backgroundColor: "rgba(47, 48, 47, 0.966)",
                  maxHeight: "150px",
                  overflowY: "scroll",
                  border: "2px solid black"
                }}
              >
                {paragraphLinksSelection}
              </div>
            </li>
          )}
          {this.state.paragraphType === "narration" ? (
            <NarrationInput
              depthNumber={this.props.depthNumber}
              paragraphNumber={this.props.paragraphNumber}
              setToSuddenDeath={this.setToSuddenDeath}
              setToVictory={this.setToVictory}
              isVictory={this.state.paragraphSubTypes.isVictory}
              isSuddenDeath={this.state.paragraphSubTypes.isSuddenDeath}
              hasLinkToNextParagraph={this.state.hasLinkToNextParagraph}
              deleteParagraph={this.deleteParagraph}
              saveParagraph={this.saveParagraph}
              QuestUnderEdition={
                this.props.QuestUnderEdition
                  ? this.props.QuestUnderEdition
                  : null
              }
              id={this.props.id}
              nextParagraphs={this.state.nextParagraphs}
              backgroundImageURL={
                this.state.backgroundImageURL
                  ? this.state.backgroundImageURL
                  : null
              }
              startingSoundURL={
                this.state.startingSoundURL ? this.state.startingSoundURL : null
              }
              bytesLimitForUploads={this.props.bytesLimitForUploads}
            />
          ) : null}
          {this.state.paragraphType === "dialogue" ? (
            <DialogueInput
              depthNumber={this.props.depthNumber}
              paragraphNumber={this.props.paragraphNumber}
              deleteParagraph={this.deleteParagraph}
              saveParagraph={this.saveParagraph}
              changeOutcomeText={this.changeOutcomeText}
              QuestUnderEdition={
                this.props.QuestUnderEdition
                  ? this.props.QuestUnderEdition
                  : null
              }
              id={this.props.id}
              nextParagraphs={this.state.nextParagraphs}
              backgroundImageURL={
                this.state.backgroundImageURL
                  ? this.state.backgroundImageURL
                  : null
              }
              startingSoundURL={
                this.state.startingSoundURL ? this.state.startingSoundURL : null
              }
              bytesLimitForUploads={this.props.bytesLimitForUploads}
            />
          ) : null}
          {this.state.paragraphType === "path" ? (
            <PathInput
              depthNumber={this.props.depthNumber}
              paragraphNumber={this.props.paragraphNumber}
              setToTextualPath={this.setToTextualPath}
              setToPointAndClickPath={this.setToPointAndClickPath}
              isTextualPath={this.state.paragraphSubTypes.isTextualPath}
              isPointAndClickPath={
                this.state.paragraphSubTypes.isPointAndClickPath
              }
              deleteParagraph={this.deleteParagraph}
              saveParagraph={this.saveParagraph}
              changeOutcomeText={this.changeOutcomeText}
              selectPointer={this.selectPointer}
              QuestUnderEdition={
                this.props.QuestUnderEdition
                  ? this.props.QuestUnderEdition
                  : null
              }
              id={this.props.id}
              nextParagraphs={this.state.nextParagraphs}
              backgroundImageURL={
                this.state.backgroundImageURL
                  ? this.state.backgroundImageURL
                  : null
              }
              startingSoundURL={
                this.state.startingSoundURL ? this.state.startingSoundURL : null
              }
              bytesLimitForUploads={this.props.bytesLimitForUploads}
            />
          ) : null}
          {this.state.paragraphType === "riddle" ? (
            <RiddleInput
              depthNumber={this.props.depthNumber}
              paragraphNumber={this.props.paragraphNumber}
              setToTextualRiddle={this.setToTextualRiddle}
              setToGraphicalRiddle={this.setToGraphicalRiddle}
              isTextualRiddle={this.state.paragraphSubTypes.isTextualRiddle}
              isGraphicalRiddle={this.state.paragraphSubTypes.isGraphicalRiddle}
              deleteParagraph={this.deleteParagraph}
              saveParagraph={this.saveParagraph}
              changeOutcomeText={this.changeOutcomeText}
              QuestUnderEdition={
                this.props.QuestUnderEdition
                  ? this.props.QuestUnderEdition
                  : null
              }
              id={this.props.id}
              nextParagraphs={this.state.nextParagraphs}
              backgroundImageURL={
                this.state.backgroundImageURL
                  ? this.state.backgroundImageURL
                  : null
              }
              startingSoundURL={
                this.state.startingSoundURL ? this.state.startingSoundURL : null
              }
              bytesLimitForUploads={this.props.bytesLimitForUploads}
            />
          ) : null}
          {this.state.paragraphType === "combat" ? (
            <CombatInput
              selectMonster={this.selectMonster}
              depthNumber={this.props.depthNumber}
              paragraphNumber={this.props.paragraphNumber}
              setToMobCombat={this.setToMobCombat}
              setToEliteMobCombat={this.setToEliteMobCombat}
              setToFinalBossCombat={this.setToFinalBossCombat}
              isMobCombat={this.state.paragraphSubTypes.isMobCombat}
              isEliteMobCombat={this.state.paragraphSubTypes.isEliteMobCombat}
              isFinalBossCombat={this.state.paragraphSubTypes.isFinalBossCombat}
              deleteParagraph={this.deleteParagraph}
              saveParagraph={this.saveParagraph}
              QuestUnderEdition={
                this.props.QuestUnderEdition
                  ? this.props.QuestUnderEdition
                  : null
              }
              id={this.props.id}
              nextParagraphs={this.state.nextParagraphs}
              selectedMonster={this.state.selectedMonster}
              backgroundImageURL={
                this.state.backgroundImageURL
                  ? this.state.backgroundImageURL
                  : null
              }
              startingSoundURL={
                this.state.startingSoundURL ? this.state.startingSoundURL : null
              }
              bytesLimitForUploads={this.props.bytesLimitForUploads}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default compose(
  firestoreConnect(props => [
    {
      collection: "QuestsInProgress",
      storeAs: "QuestUnderEdition",
      doc: props.questID
    }
  ]),
  connect(
    state => ({
      numDepthLevels: state.numDepthLevels,
      paragraphNumberTotal: state.paragraphNumberTotal,
      paragraphData: state.paragraphData,
      QuestUnderEdition:
        state.firestore.ordered.QuestUnderEdition &&
        state.firestore.ordered.QuestUnderEdition[0]
    }),
    {
      addParagraphLink,
      removeParagraphLink,
      setToSuddenDeathInRegister,
      setToVictoryInRegister,
      setParagraphTypeInRegister,
      setParagraphLinkStatusInRegister,
      setToFinalBossInRegister
    }
  )
)(Paragraph);
