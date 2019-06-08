import React, { Component } from "react";
import { connect } from "react-redux";

import DefaultBackground from "../../../notredame.jpg";

class NarrationInput extends Component {
  constructor(props) {
    super(props);
    this.loadBackgroundImage = this.loadBackgroundImage.bind(this);
    this.loadSoundTitle = this.loadSoundTitle.bind(this);
  }
  state = {};

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  loadBackgroundImage(e) {
    const selector = `outputIMG ${this.props.depthNumber} - ${
      this.props.paragraphNumber
    }`;
    var image = document.getElementById(selector);

    image.src = URL.createObjectURL(e.target.files[0]);
  }

  loadSoundTitle(e) {
    const soundTitle = e.target.parentNode.children[3];

    soundTitle.innerText = e.target.files[0].name;
  }

  setToSuddenDeath = () => {
    this.props.setToSuddenDeath();
  };

  setToVictory = e => {
    this.props.setToVictory(e.target);
  };

  render() {
    const followingParagraph = [];

    for (
      var j = 0;
      j < this.props.paragraphData.paragraphLinkRegister.length;
      j += 1
    ) {
      if (
        this.props.paragraphData.paragraphLinkRegister[j]
          .depthNumberOfLinkedParagraph === this.props.depthNumber &&
        this.props.paragraphData.paragraphLinkRegister[j]
          .paragraphNumberOfLinkedParagraph === this.props.paragraphNumber
      ) {
        followingParagraph.push(
          <div>
            <label
              style={{
                fontWeight: "500",
                fontSize: "0.8rem"
              }}
            >
              {`Following paragraph : ${
                this.props.paragraphData.paragraphLinkRegister[j].depthNumber
              }-${
                this.props.paragraphData.paragraphLinkRegister[j]
                  .paragraphNumber
              }`}
            </label>
            <div>
              <h4
                style={{
                  fontSize: "0.8rem",
                  display: "inline-block",
                  marginBottom: 0
                }}
              >
                Ending Sound
              </h4>{" "}
              <input
                type="file"
                accept="audio/wav"
                name="endingsound"
                id={`endingsound ${this.props.depthNumber} - ${
                  this.props.paragraphNumber
                }`}
                style={{ display: "none" }}
                onChange={this.loadSoundTitle}
              />
              <p style={{ marginBottom: 0, display: "inline-block" }}>
                <label
                  className="label-upload"
                  htmlFor={`endingsound ${this.props.depthNumber} - ${
                    this.props.paragraphNumber
                  }`}
                  style={{ cursor: "pointer", marginBottom: 0 }}
                >
                  (Upload Sound)
                </label>
              </p>
              <h5
                style={{
                  fontWeight: "400",
                  fontSize: "0.6rem",
                  lineHeight: 1,
                  paddingLeft: "5px",
                  display: "inline-block"
                }}
                id={`endingsoundtitle ${this.props.depthNumber} - ${
                  this.props.paragraphNumber
                }`}
              >
                {" "}
              </h5>
            </div>
          </div>
        );
      }
    }
    return (
      <div className="card-input">
        <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
          <h4
            style={{
              fontSize: "0.8rem",
              display: "inline-block",
              marginBottom: 0
            }}
          >
            Starting Sound
          </h4>{" "}
          <input
            type="file"
            accept="audio/wav"
            name="startingsound"
            id={`startingsound ${this.props.depthNumber} - ${
              this.props.paragraphNumber
            }`}
            style={{ display: "none" }}
            onChange={this.loadSoundTitle}
          />
          <p style={{ marginBottom: 0, display: "inline-block" }}>
            <label
              className="label-upload"
              htmlFor={`startingsound ${this.props.depthNumber} - ${
                this.props.paragraphNumber
              }`}
              style={{ cursor: "pointer", marginBottom: 0 }}
            >
              (Upload Sound)
            </label>
          </p>
          <h5
            style={{
              fontWeight: "400",
              fontSize: "0.6rem",
              lineHeight: 1,
              paddingLeft: "5px",
              display: "inline-block"
            }}
            id={`startingsoundtitle ${this.props.depthNumber} - ${
              this.props.paragraphNumber
            }`}
          >
            {" "}
          </h5>
        </div>
        <div
          className="card-image"
          style={{ paddingLeft: "10px", paddingRight: "10px" }}
        >
          <div>
            <h4 style={{ fontSize: "0.8rem", display: "inline-block" }}>
              Background Image
            </h4>{" "}
            <input
              type="file"
              accept="image/jpeg, image/png"
              name="image"
              id={`BGimage ${this.props.depthNumber} - ${
                this.props.paragraphNumber
              }`}
              style={{ display: "none" }}
              onChange={this.loadBackgroundImage}
            />
            <p style={{ marginBottom: 0, display: "inline-block" }}>
              <label
                className="label-upload"
                htmlFor={`BGimage ${this.props.depthNumber} - ${
                  this.props.paragraphNumber
                }`}
                style={{ cursor: "pointer", marginBottom: 0 }}
              >
                (Upload Image)
              </label>
            </p>
          </div>
          <div
            style={{ width: "324px", height: "210px", position: "relative" }}
          >
            <img
              src={DefaultBackground}
              className="card-img-top"
              alt="Background by default"
              style={{ width: "100%", height: "100%" }}
              id={`outputIMG ${this.props.depthNumber} - ${
                this.props.paragraphNumber
              }`}
            />
          </div>
        </div>
        <div
          className="card-body"
          style={{
            paddingLeft: "10px",
            paddingRight: "10px",
            paddingTop: "2px",
            paddingBottom: "5px"
          }}
        >
          <form onSubmit={this.onSubmit}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label
                htmlFor="Text"
                style={{
                  fontWeight: "500",
                  fontSize: "0.8rem",
                  marginBottom: "5px"
                }}
              >
                Text
              </label>
              <textarea
                type="text"
                className="form-control"
                name="narrationInputText"
                maxLength="750"
                placeholder="Write your narration here..."
                rows="4"
                required
                onChange={this.onChange}
                value={this.state.textInput}
                style={{ fontSize: "0.7rem", resize: "none" }}
              />
              {this.props.depthNumber === 0 ? null : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: "10px"
                  }}
                >
                  {!this.props.isVictory &&
                  !this.props.hasLinkToNextParagraph ? (
                    <div>
                      <label style={{ marginBottom: 0 }}>Sudden Death</label>
                      {"   "}
                      <input
                        type="checkbox"
                        name="suddendeath"
                        onChange={this.setToSuddenDeath}
                      />
                    </div>
                  ) : null}
                  {!this.props.isSuddenDeath &&
                  !this.props.hasLinkToNextParagraph ? (
                    <div>
                      <label style={{ marginBottom: 0 }}>Victory</label>
                      {"   "}
                      <input
                        type="checkbox"
                        name="victory"
                        onChange={this.setToVictory}
                      />
                    </div>
                  ) : null}
                </div>
              )}
              {followingParagraph}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  numDepthLevels: state.numDepthLevels,
  paragraphNumberTotal: state.paragraphNumberTotal,
  paragraphData: state.paragraphData
}))(NarrationInput);
