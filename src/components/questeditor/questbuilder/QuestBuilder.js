import React, { Component } from "react";
import { connect } from "react-redux";
import uuid from "uuid";

import Paragraph from "./Paragraph";
import DepthLevel from "./DepthLevel";

import {
  addDepthLevel,
  decreaseDepthLevel
} from "../../../actions/depthLevelActions";
import {
  addParagraphToTotal,
  decreaseParagraphFromTotal
} from "../../../actions/paragraphActions";

// TBD: full quest save only if all paragraphs are linked/death/victory)
class QuestBuilder extends Component {
  state = {};

  scrollToBottom() {
    this.el.scrollIntoView({ behavior: "smooth" });
  }

  onAddDepthLevel = async () => {
    await this.props.addDepthLevel();
    await this.props.addParagraphToTotal(
      this.props.numDepthLevels.numDepthLevels,
      1
    );
    this.scrollToBottom();
  };

  onDeleteDepthLevel = () => {
    this.props.decreaseDepthLevel();
  };

  render() {
    const depthLevels = [];

    for (var i = 1; i <= this.props.numDepthLevels.numDepthLevels; i += 1) {
      depthLevels.push(
        <DepthLevel
          key={i}
          depthNumber={i}
          addParagraphToTotal={this.props.addParagraphToTotal}
          decreaseParagraphFromTotal={this.props.decreaseParagraphFromTotal}
          deleteDepthLevel={this.onDeleteDepthLevel}
          numDepthLevels={this.props.numDepthLevels}
        />
      );
    }

    return (
      <div className="quest-builder-container">
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
            value="Save Quest In Progress"
            className="btn btn-dark btn-block"
            style={{
              width: "auto",
              float: "right",
              marginRight: "20px",
              display: "inline-block"
            }}
            id="savequest"
          />
        </div>
        <div className="depth-levels-container" style={{ marginTop: "10px" }}>
          <div className="depth-level-0">
            <div
              className="level-depth-separation"
              style={{ textAlign: "center" }}
            >
              <h5>Depth Level 0</h5>
            </div>
            <Paragraph
              id={uuid.v4()}
              depthNumber={0}
              paragraphNumber={1}
              deleteParagraph={() => {
                window.alert("You cannot delete the starting paragraph.");
              }}
            />
            <div
              className="depth-level-additional"
              style={{ marginTop: "10px" }}
            >
              {depthLevels}
            </div>
            <div
              ref={el => {
                this.el = el;
              }}
            >
              <input
                type="submit"
                value="Add Another Depth Level"
                className="btn btn-dark btn-block"
                onClick={this.onAddDepthLevel}
                style={{ marginTop: "5px" }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    numDepthLevels: state.numDepthLevels,
    paragraphNumberTotal: state.paragraphNumberTotal
  }),
  {
    addDepthLevel,
    decreaseDepthLevel,
    addParagraphToTotal,
    decreaseParagraphFromTotal
  }
)(QuestBuilder);
