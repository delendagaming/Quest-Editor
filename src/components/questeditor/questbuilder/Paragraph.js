import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";

import NarrationInput from "./NarrationInput";
import DialogueInput from "./DialogueInput";
import PathInput from "./PathInput";
import RiddleInput from "./RiddleInput";
import CombatInput from "./CombatInput";
import LinkSelection from "./LinkSelection";

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
    previousParagraphs: []
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // update paragraph if paragraph link is detected from Redux store
  static getDerivedStateFromProps(props, state) {
    let paragraphInRegister = props.paragraphData.paragraphRegister.find(
      el =>
        el.depthNumber === props.depthNumber &&
        el.paragraphNumber === props.paragraphNumber
    );

    if (paragraphInRegister && paragraphInRegister.nextParagraphs.length > 0) {
      return {
        nextParagraphs: paragraphInRegister.nextParagraphs,
        hasLinkToNextParagraph: true
      };
    } else if (
      paragraphInRegister &&
      paragraphInRegister.previousParagraphs.length > 0
    ) {
      return {
        previousParagraphs: paragraphInRegister.previousParagraphs
      };
    } else
      return {
        previousParagraphs: [],
        hasLinkToPreviousParagraph: false,
        nextParagraphs: [],
        hasLinkToNextParagraph: false
      };
  }

  deleteParagraph = e => {
    if (
      this.state.hasLinkToNextParagraph ||
      this.state.hasLinkToPreviousParagraph
    ) {
      window.alert(
        "You cannot delete a paragraph that has links to previous or next paragraphs. You must remove these links first."
      );
    } else this.props.deleteParagraph(e);
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
        let keys = Object.keys(this.state.paragraphSubTypes);
        let stateWithClearedParagraphSubtypes = {};

        for (var j = 0; j < keys.length; j++) {
          stateWithClearedParagraphSubtypes[keys[j]] = false;
        }

        this.setState({
          paragraphSubTypes: stateWithClearedParagraphSubtypes
        });
        var tabs = e.target.parentNode.children;
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

  // TBD, connection with Firebase
  onSubmit = e => {
    e.preventDefault();
    const newParagraph = this.state;
  };

  setToSuddenDeath = e => {
    this.props.setToSuddenDeathInRegister(
      this.props.depthNumber,
      this.props.paragraphNumber
    );
    let updatedStateSubTypes = this.state.paragraphSubTypes;
    updatedStateSubTypes.isSuddenDeath = !updatedStateSubTypes.isSuddenDeath;
    this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToVictory = target => {
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
      this.props.setToVictoryInRegister(
        this.props.depthNumber,
        this.props.paragraphNumber
      );
      let updatedStateSubTypes = this.state.paragraphSubTypes;
      updatedStateSubTypes.isVictory = !updatedStateSubTypes.isVictory;
      this.setState({
        paragraphSubTypes: updatedStateSubTypes
      });
    }
  };

  setToTextualRiddle = e => {
    let updatedStateSubTypes = this.state.paragraphSubTypes;
    updatedStateSubTypes.isTextualRiddle = !updatedStateSubTypes.isTextualRiddle;
    this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToGraphicalRiddle = e => {
    let updatedStateSubTypes = this.state.paragraphSubTypes;
    updatedStateSubTypes.isGraphicalRiddle = !updatedStateSubTypes.isGraphicalRiddle;
    this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToTextualPath = e => {
    let updatedStateSubTypes = this.state.paragraphSubTypes;
    updatedStateSubTypes.isTextualPath = !updatedStateSubTypes.isTextualPath;
    this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToPointAndClickPath = e => {
    let updatedStateSubTypes = this.state.paragraphSubTypes;
    updatedStateSubTypes.isPointAndClickPath = !updatedStateSubTypes.isPointAndClickPath;
    this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToMobCombat = e => {
    let updatedStateSubTypes = this.state.paragraphSubTypes;
    updatedStateSubTypes.isMobCombat = !updatedStateSubTypes.isMobCombat;
    this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToEliteMobCombat = e => {
    let updatedStateSubTypes = this.state.paragraphSubTypes;
    updatedStateSubTypes.isEliteMobCombat = !updatedStateSubTypes.isEliteMobCombat;
    this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
  };

  setToFinalBossCombat = e => {
    let updatedStateSubTypes = this.state.paragraphSubTypes;
    updatedStateSubTypes.isFinalBossCombat = !updatedStateSubTypes.isFinalBossCombat;
    this.setState({
      paragraphSubTypes: updatedStateSubTypes
    });
    this.props.setToFinalBossInRegister(
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
          />
        );
      }
    }

    return (
      <div
        style={{
          margin: "0px auto",
          paddingRight: "20px",
          verticalAlign: "top"
        }}
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
          <div className="card-header">
            <button
              className={`paragraph-type ${this.props.depthNumber} - ${
                this.props.newParagraphNumber
                  ? this.props.newParagraphNumber
                  : this.props.paragraphNumber
              } active`}
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
              }`}
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
              }`}
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
              }`}
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
              }`}
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
          {this.state.paragraphType === "narration" ? (
            <NarrationInput
              depthNumber={this.props.depthNumber}
              paragraphNumber={this.props.paragraphNumber}
              setToSuddenDeath={this.setToSuddenDeath}
              setToVictory={this.setToVictory}
              isVictory={this.state.paragraphSubTypes.isVictory}
              isSuddenDeath={this.state.paragraphSubTypes.isSuddenDeath}
              hasLinkToNextParagraph={this.state.hasLinkToNextParagraph}
            />
          ) : null}
          {this.state.paragraphType === "dialogue" ? (
            <DialogueInput
              depthNumber={this.props.depthNumber}
              paragraphNumber={this.props.paragraphNumber}
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
            />
          ) : null}
          {this.state.paragraphType === "combat" ? (
            <CombatInput
              depthNumber={this.props.depthNumber}
              paragraphNumber={this.props.paragraphNumber}
              setToMobCombat={this.setToMobCombat}
              setToEliteMobCombat={this.setToEliteMobCombat}
              setToFinalBossCombat={this.setToFinalBossCombat}
              isMobCombat={this.state.paragraphSubTypes.isMobCombat}
              isEliteMobCombat={this.state.paragraphSubTypes.isEliteMobCombat}
              isFinalBossCombat={this.state.paragraphSubTypes.isFinalBossCombat}
            />
          ) : null}
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

          <div style={{ marginTop: "5px" }}>
            <input
              type="submit"
              value="Save Paragraph"
              className="btn btn-dark paragraph-save"
              style={{ display: "inline-block", width: "50%" }}
            />

            <input
              type="submit"
              value="Delete Paragraph"
              paragraphnumber={this.props.paragraphNumber}
              className="btn btn-dark paragraph-delete"
              style={{ display: "inline-block", width: "50%" }}
              onClick={this.deleteParagraph}
            />
          </div>
        </div>
      </div>
    );
  }
}

//render dropdown list with all paragraphs of lower depth level (starting paragraph only for depth level 1) DONE
//add paragraph link to paragraph state
//add link to redux store
//add link and action choice text to parent paragraph state
//render required field for action choice text

export default connect(
  state => ({
    numDepthLevels: state.numDepthLevels,
    paragraphNumberTotal: state.paragraphNumberTotal,
    paragraphData: state.paragraphData
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
)(Paragraph);
