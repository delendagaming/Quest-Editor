import React, { Component } from "react";
import uuid from "uuid";

import Paragraph from "./Paragraph";

class DepthLevel extends Component {
  onDeleteParagraph = async e => {
    const dataID = parseInt(e.target.getAttribute("paragraphnumber"), 10);
    if (this.state.paragraphsInDepthLevel > 1) {
      if (
        window.confirm(
          `Are you sure you want to delete this paragraph ? \n \n All content will be deleted and CANNOT BE RECOVERED.`
        )
      ) {
        this.props.decreaseParagraphFromTotal(this.props.depthNumber, dataID);
        await this.setState({
          paragraphsInDepthLevel: this.state.paragraphsInDepthLevel - 1,
          paragraphsArray: this.state.paragraphsArray.filter((el, index) => {
            return index + 1 !== dataID;
          })
        });

        let paragraphsToUpdate = this.state.paragraphsArray.filter(
          (el, index) => {
            return index >= dataID - 1;
          }
        );

        let paragraphsToUpdateFinal = [];

        paragraphsToUpdate.forEach(el => {
          paragraphsToUpdateFinal.push(
            React.cloneElement(el, {
              paragraphNumber: el.props.paragraphNumber - 1
            })
          );
        });

        let paragraphsUnchanged = this.state.paragraphsArray.filter(
          (el, index) => {
            return index < dataID - 1;
          }
        );

        await this.setState({
          paragraphsArray: [...paragraphsUnchanged, ...paragraphsToUpdateFinal]
        });
      }
    } else {
      window.alert(
        "You cannot delete this paragraph, because there must be at least one paragraph in each depth level."
      );
    }
  };

  state = {
    paragraphsInDepthLevel: 1,
    paragraphsArray: [
      <Paragraph
        key={1}
        id={uuid.v4()}
        paragraphNumber={1}
        depthNumber={this.props.depthNumber}
        deleteParagraph={this.onDeleteParagraph}
      />
    ],
    linkedParagraphs: 0
  };

  onAddParagraph = async () => {
    await this.setState({
      paragraphsInDepthLevel: this.state.paragraphsInDepthLevel + 1
    });

    await this.setState({
      paragraphsArray: [
        ...this.state.paragraphsArray,
        <Paragraph
          key={this.state.paragraphsInDepthLevel}
          paragraphNumber={this.state.paragraphsInDepthLevel}
          depthNumber={this.props.depthNumber}
          id={uuid.v4()}
          deleteParagraph={this.onDeleteParagraph}
        />
      ]
    });
    await this.props.addParagraphToTotal(
      this.props.depthNumber,
      this.state.paragraphsInDepthLevel
    );

    this.el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  };

  onDeleteDepthLevel = e => {
    let linkedParagraphs = e.target.parentElement.parentElement.parentElement.children[1].getElementsByClassName(
      "linked-to-previous"
    );

    if (linkedParagraphs.length !== 0) {
      window.alert(
        "This depth level contains paragraphs that are linked to next or previous paragraphs. You must remove these links before you can delete these paragraphs and the depth level."
      );
    } else if (
      window.confirm(
        `Are you sure you want to delete this depth level ? \n \n All content from the paragraphs inside this depth level will be deleted and CANNOT BE RECOVERED.`
      )
    ) {
      for (var i = 1; i <= this.state.paragraphsInDepthLevel; i += 1) {
        this.props.decreaseParagraphFromTotal(this.props.depthNumber, i);
      }
      this.props.deleteDepthLevel();
    }
  };

  render() {
    return (
      <div>
        <div
          className="level-depth-separation"
          style={{ textAlign: "center", marginTop: "10px" }}
        >
          <h5 style={{ display: "inline-block", marginBottom: "0.25rem" }}>
            Depth Level {this.props.depthNumber}
          </h5>
          {this.props.depthNumber ===
          this.props.numDepthLevels.numDepthLevels ? (
            <button
              style={{
                display: "inline-block",
                backgroundColor: "transparent",
                border: "none"
              }}
              onClick={this.onDeleteDepthLevel}
            >
              <i className="fas fa-trash-alt" />
            </button>
          ) : null}
        </div>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            overflowX: "auto"
          }}
        >
          {this.state.paragraphsArray}
          <input
            type="submit"
            value="Add Paragraph"
            className="btn btn-dark btn-block"
            style={{ width: "auto", margin: "auto" }}
            onClick={this.onAddParagraph}
            ref={el => {
              this.el = el;
            }}
          />
        </div>
      </div>
    );
  }
}

export default DepthLevel;
