import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";
import { Prompt } from "react-router-dom";

import uuid from "uuid";

import Spinner from "../../layout/Spinner";
import Paragraph from "./Paragraph";
import DepthLevel from "./DepthLevel";

import {
  addDepthLevel,
  decreaseDepthLevel,
  clearQuestData
} from "../../../actions/depthLevelActions";
import {
  addParagraphToTotal,
  decreaseParagraphFromTotal,
  syncRegistersInRedux,
  setToGlobalSaving
} from "../../../actions/paragraphActions";

class QuestBuilder extends Component {
  state = {
    initialID: "",
    isLoading: true,
    bytesLimitForUploads: 5000000
  };

  scrollToTarget(target) {
    target.scrollIntoView({ behavior: "smooth" });
  }

  onAddDepthLevel = async () => {
    let targetScroll = document.getElementById("targetscroll");

    await this.props.addDepthLevel(this.state.numDepthLevels);

    await this.props.addParagraphToTotal(
      this.props.numDepthLevels.numDepthLevels - 1,
      1
    );
    this.scrollToTarget(targetScroll);
  };

  onDeleteDepthLevel = targetScroll => {
    this.props.decreaseDepthLevel(this.state.numDepthLevels);
  };

  // fetching numDepthLevels from firestore to set the initial number of depth levels to render
  componentDidMount = async () => {
    if (
      this.props.QuestUnderEdition !== undefined &&
      this.props.QuestUnderEdition.id === this.props.match.params.id
    ) {
      await this.setState({
        numDepthLevels: this.props.QuestUnderEdition.numDepthLevels
      });
      // initial sync between Redux and Firestore for paragraphRegister and paragraphLinkRegister using shallow copies, also adjusting numDepthLevels in Redux

      let paragraphRegisterFromFirestore = [];
      this.props.QuestUnderEdition.paragraphRegister.forEach(el =>
        paragraphRegisterFromFirestore.push({ ...el })
      );

      let paragraphLinkRegisterFromFirestore = [];
      this.props.QuestUnderEdition.paragraphLinkRegister.forEach(el =>
        paragraphLinkRegisterFromFirestore.push({ ...el })
      );

      let numDepthLevelsFromFirestore = this.props.QuestUnderEdition
        .numDepthLevels;

      await this.props.syncRegistersInRedux(
        paragraphRegisterFromFirestore,
        paragraphLinkRegisterFromFirestore,
        numDepthLevelsFromFirestore
      );
      if (
        this.props.QuestUnderEdition.Paragraphs.find(el => el.depthNumber === 0)
      ) {
        const startingParagraph = this.props.QuestUnderEdition.Paragraphs.find(
          el => el.depthNumber === 0
        );
        await this.setState({
          initialID: startingParagraph.id
        });
      } else {
        const initialID = uuid.v4();
        await this.setState({ initialID });
      }

      await this.setState({ isLoading: false });
    } else await this.setState({ isLoading: true });
  };

  // fetching numDepthLevels from firestore to set the initial number of depth levels to render
  componentDidUpdate = async prevProps => {
    // sync only if change of QuestUnderEdition props while previous QuestUnderEdition props is undefined or has a different id and new QuestUnderEdition.id props match the id in the route
    if (
      this.props.QuestUnderEdition !== prevProps.QuestUnderEdition &&
      (prevProps.QuestUnderEdition === undefined ||
        (prevProps.QuestUnderEdition.id &&
          prevProps.QuestUnderEdition.id !== this.props.match.params.id)) &&
      this.props.QuestUnderEdition.id === this.props.match.params.id
    ) {
      await this.setState({
        numDepthLevels: this.props.QuestUnderEdition.numDepthLevels
      });
      // initial sync between Redux and Firestore for paragraphRegister and paragraphLinkRegister using shallow copies

      let paragraphRegisterFromFirestore = [];
      this.props.QuestUnderEdition.paragraphRegister.forEach(el =>
        paragraphRegisterFromFirestore.push({ ...el })
      );

      let paragraphLinkRegisterFromFirestore = [];
      this.props.QuestUnderEdition.paragraphLinkRegister.forEach(el =>
        paragraphLinkRegisterFromFirestore.push({ ...el })
      );

      let numDepthLevelsFromFirestore = this.props.QuestUnderEdition
        .numDepthLevels;

      await this.props.syncRegistersInRedux(
        paragraphRegisterFromFirestore,
        paragraphLinkRegisterFromFirestore,
        numDepthLevelsFromFirestore
      );
      if (
        this.props.QuestUnderEdition.Paragraphs.find(el => el.depthNumber === 0)
      ) {
        const startingParagraph = this.props.QuestUnderEdition.Paragraphs.find(
          el => el.depthNumber === 0
        );
        await this.setState({
          initialID: startingParagraph.id
        });
      } else {
        const initialID = uuid.v4();
        await this.setState({ initialID });
      }

      await this.setState({ isLoading: false });
    }

    if (
      this.props.numDepthLevels.numDepthLevels !==
      prevProps.numDepthLevels.numDepthLevels
    ) {
      await this.setState({
        numDepthLevels: this.props.numDepthLevels.numDepthLevels
      });
    }
  };

  componentWillUnmount = async () => {
    this.props.clearQuestData();
  };

  onSaveUnderEdition = async e => {
    // inform all paragraphs that a global save is ongoing to stop the normal "paragraph data has been saved" message
    await this.props.setToGlobalSaving();

    // getting HMTLCollection then array of all "Save Paragraph" buttons
    let saveInputElementsHTMLCollection = document.getElementsByClassName(
      "paragraph-save"
    );
    let saveInputElementsArray = Array.from(saveInputElementsHTMLCollection);

    // programmatically click on all of them
    saveInputElementsArray.map(el => el.click());

    // leave 1 second so Paragraphs have the state of "isSaving" as true after clicking on them
    let checkIfSavingIsFinished = () => {
      setTimeout(checkHTMLCollection, 2000);
    };

    // loop until all paragraphs have the state of "isSaving" as false
    let checkHTMLCollection = async () => {
      let paragraphsSavingHTMLCollection = document.getElementsByClassName(
        "isSaving"
      );
      if (paragraphsSavingHTMLCollection.length === 0) {
        // mark the QuestUnderEdition as having gone through a Global Save
        await this.props.firestore.update(
          {
            collection: "QuestsInProgress",
            doc: this.props.QuestUnderEdition.id
          },
          {
            globalSaveCounter: 1
          }
        );
        // remove isGlobalSaving in Redux
        await this.props.setToGlobalSaving();
        window.alert("Full save complete !");
      } else checkIfSavingIsFinished();
    };

    // this bindings to access this.props and function execution
    checkIfSavingIsFinished.bind(this);
    checkHTMLCollection.bind(this);
    checkIfSavingIsFinished();
  };

  render() {
    if (!this.state.isLoading) {
      const depthLevels = [];
      const QuestUnderEdition = this.props.QuestUnderEdition;

      for (var i = 1; i < this.state.numDepthLevels; i += 1) {
        depthLevels.push(
          <DepthLevel
            key={i}
            depthNumber={i}
            addParagraphToTotal={this.props.addParagraphToTotal}
            decreaseParagraphFromTotal={this.props.decreaseParagraphFromTotal}
            deleteDepthLevel={this.onDeleteDepthLevel}
            numDepthLevels={this.state.numDepthLevels}
            QuestUnderEdition={
              this.props.QuestUnderEdition ? this.props.QuestUnderEdition : null
            }
            bytesLimitForUploads={this.state.bytesLimitForUploads}
          />
        );
      }

      return (
        <div className="quest-builder-container">
          <Prompt
            message={`Are you sure you want to leave the page ? All unsaved changes will be lost.`}
          />
          <div style={{ position: "relative" }}>
            <h2
              style={{
                position: "relative",
                margin: "auto",
                display: "inline-block",
                textAlign: "center",
                left: "50%",
                transform: "translateX(-50%)"
              }}
            >
              Quest Builder
            </h2>
            <input
              type="submit"
              value="Global Save"
              className="btn btn-dark btn-block"
              style={{
                width: "auto",
                float: "right",
                marginRight: "20px",
                display: "inline-block"
              }}
              id="savequest"
              onClick={this.onSaveUnderEdition}
            />
            <hr />
            <h3
              style={{
                textAlign: "center",
                fontStyle: "italic",
                display: "block"
              }}
            >
              {QuestUnderEdition.Title}
            </h3>
          </div>
          <div className="depth-levels-container" style={{ marginTop: "10px" }}>
            <div className="depth-level-0">
              <div
                className="level-depth-separation"
                style={{ textAlign: "center" }}
                onClick={this.onSaveUnderEdition}
              >
                <h5>Depth Level 0</h5>
              </div>
              <Paragraph
                key={1}
                id={this.state.initialID}
                depthNumber={0}
                paragraphNumber={1}
                bytesLimitForUploads={this.state.bytesLimitForUploads}
              />
              <div
                className="depth-level-additional"
                style={{ marginTop: "10px" }}
              >
                {depthLevels}
              </div>
              <div>
                <input
                  type="submit"
                  value="Add Another Depth Level"
                  className="btn btn-dark btn-block"
                  onClick={e => this.onAddDepthLevel(e)}
                  style={{ marginTop: "5px" }}
                  id="targetscroll"
                />
              </div>
            </div>
          </div>
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

export default compose(
  firestoreConnect(props => [
    {
      collection: "QuestsInProgress",
      storeAs: "QuestUnderEdition",
      doc: props.match.params.id
    }
  ]),
  connect(
    state => ({
      numDepthLevels: state.numDepthLevels,
      paragraphNumberTotal: state.paragraphNumberTotal,
      QuestUnderEdition:
        state.firestore.ordered.QuestUnderEdition &&
        state.firestore.ordered.QuestUnderEdition[0]
    }),
    {
      addDepthLevel,
      decreaseDepthLevel,
      addParagraphToTotal,
      decreaseParagraphFromTotal,
      syncRegistersInRedux,
      clearQuestData,
      setToGlobalSaving
    }
  )
)(QuestBuilder);
