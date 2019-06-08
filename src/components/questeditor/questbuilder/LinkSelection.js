import React, { Component } from "react";
import { connect } from "react-redux";

class LinkSelection extends Component {
  state = {
    isLinked: false
  };

  toggleParagraphLink = async e => {
    let parentNode = e.target.parentNode;
    await this.setState({
      isLinked: !this.state.isLinked
    });
    let result = await this.props.toggleParagraphLink(
      parentNode,
      this.props.depthNumberOfLinkedParagraph,
      this.props.paragraphNumberOfLinkedParagraph,
      this.state.isLinked
    );
    // revert change of state if this.props.toggleParagraphLink indicated that this link cannot be toggled
    if (result === "unlink") {
      await this.setState({
        isLinked: !this.state.isLinked
      });
    }
  };

  render() {
    return (
      <h5
        className={`paragraph-link ${this.props.display} ${
          this.state.isLinked ? "linked" : ""
        }`}
        onClick={this.toggleParagraphLink}
      >
        {this.props.paragraphData.paragraphRegister[this.props.rank]
          .depthNumber === 0
          ? "START"
          : `Paragraph ${
              this.props.paragraphData.paragraphRegister[this.props.rank]
                .depthNumber
            } - ${
              this.props.paragraphData.paragraphRegister[this.props.rank]
                .paragraphNumber
            }`}
      </h5>
    );
  }
}

export default connect(state => ({
  numDepthLevels: state.numDepthLevels,
  paragraphNumberTotal: state.paragraphNumberTotal,
  paragraphData: state.paragraphData
}))(LinkSelection);
