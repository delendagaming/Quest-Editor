import React, { Component } from "react";
import { connect } from "react-redux";

import DialogueDefaultBackground from "../../../image assets/dialogue-default-background.jpg";

class DialogueInput extends Component {
  constructor(props) {
    super(props);
    this.loadBackgroundImage = this.loadBackgroundImage.bind(this);
    this.loadStartingSound = this.loadStartingSound.bind(this);
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

  loadStartingSound(e) {
    const selector = `startingsoundtitle ${this.props.depthNumber} - ${
      this.props.paragraphNumber
    }`;
    var startingSoundTitle = document.getElementById(selector);

    startingSoundTitle.innerText = e.target.files[0].name;
  }

  loadOutcomeSound(e) {
    const outcomeSoundTitle = e.target.parentNode.children[2];

    outcomeSoundTitle.innerText = e.target.files[0].name;
  }

  render() {
    // check all paragraph links and render paragraph outcomes
    const paragraphOutcomes = [];

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
        paragraphOutcomes.push(
          <div style={{ marginTop: "5px" }}>
            <label
              style={{
                fontWeight: "400",
                fontSize: "0.6rem",
                lineHeight: "0.8rem",
                paddingLeft: "5px",
                display: "inline-block",
                verticalAlign: "top"
              }}
            >
              {`Answer leading to ${
                this.props.paragraphData.paragraphLinkRegister[j].depthNumber
              }-${
                this.props.paragraphData.paragraphLinkRegister[j]
                  .paragraphNumber
              }`}
            </label>
            <div>
              <div
                style={{
                  display: "inline-block",
                  width: "60%",
                  verticalAlign: "top"
                }}
              >
                <textarea
                  type="text"
                  className="form-control"
                  name={`paragraphOutcomeText${
                    this.props.paragraphData.paragraphLinkRegister[j]
                      .depthNumber
                  }-${
                    this.props.paragraphData.paragraphLinkRegister[j]
                      .paragraphNumber
                  }`}
                  maxLength="150"
                  placeholder={`Write your answer leading to ${
                    this.props.paragraphData.paragraphLinkRegister[j]
                      .depthNumber
                  }-${
                    this.props.paragraphData.paragraphLinkRegister[j]
                      .paragraphNumber
                  }...`}
                  rows="1"
                  required
                  onChange={this.onChange}
                  value={this.state.textInput}
                  style={{
                    fontSize: "0.6rem",
                    resize: "none",
                    width: "100%",
                    top: 0
                  }}
                />
              </div>
              <div
                style={{
                  display: "inline-block",
                  overflowWrap: "break-word",
                  width: "40%",
                  verticalAlign: "top"
                }}
              >
                <input
                  type="file"
                  accept="audio/wav"
                  name="outcomesound"
                  id={`outcomesound ${this.props.depthNumber} - ${
                    this.props.paragraphNumber
                  } - ${j + 1}`}
                  style={{ display: "none" }}
                  onChange={this.loadOutcomeSound}
                />
                <p
                  style={{
                    marginBottom: 0,
                    display: "inline-block",
                    paddingLeft: "5px",
                    lineHeight: "0.8",
                    verticalAlign: "top"
                  }}
                >
                  <label
                    className="label-upload"
                    htmlFor={`outcomesound ${this.props.depthNumber} - ${
                      this.props.paragraphNumber
                    } - ${j + 1}`}
                    style={{
                      cursor: "pointer",
                      marginBottom: 0,
                      fontSize: "0.65rem",
                      verticalAlign: "top"
                    }}
                  >
                    (Upload Sound)
                  </label>
                </p>
                <h5
                  style={{
                    fontWeight: "400",
                    fontSize: "0.5rem",
                    lineHeight: "0.75",
                    paddingLeft: "5px",
                    overflowWrap: "break-word",
                    marginBottom: 0,
                    verticalAlign: "top"
                  }}
                  id={`outcomesoundtitle ${this.props.depthNumber} - ${
                    this.props.paragraphNumber
                  } - ${j + 1}`}
                >
                  {" "}
                </h5>
              </div>
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
            onChange={this.loadStartingSound}
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
              src={DialogueDefaultBackground}
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
                name="dialogueInputText"
                maxLength="750"
                placeholder="Write your dialogue line here..."
                rows="4"
                required
                onChange={this.onChange}
                value={this.state.textInput}
                style={{ fontSize: "0.7rem", resize: "none" }}
              />
            </div>
          </form>
          <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
            <div>{paragraphOutcomes}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  numDepthLevels: state.numDepthLevels,
  paragraphNumberTotal: state.paragraphNumberTotal,
  paragraphData: state.paragraphData
}))(DialogueInput);
