import React, { Component } from "react";
import { connect } from "react-redux";

import DefaultBackground from "../../../notredame.jpg";

class NarrationInput extends Component {
  constructor(props) {
    super(props);
    this.loadBackgroundImage = this.loadBackgroundImage.bind(this);
    this.loadStartingSound = this.loadStartingSound.bind(this);
    this.loadOutcomeSound = this.loadOutcomeSound.bind(this);
  }
  state = {
    narrationInputText: "",
    backgroundImageCounter: 0,
    startingSoundCounter: 0,
    outcomeSoundArray: []
  };

  componentDidMount = async () => {
    if (this.props.QuestUnderEdition !== undefined) {
      if (
        this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.props.id
        )
      ) {
        let paragraphInFirestore = this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.props.id
        );
        await this.setState({
          narrationInputText: paragraphInFirestore.inputText
        });

        if (
          paragraphInFirestore.nextParagraphs.some(
            el => el.outcomeSoundURL !== undefined
          )
        ) {
          let syncedOutcomeSoundArray = [];

          paragraphInFirestore.nextParagraphs.forEach((elem, index) => {
            if (elem.outcomeSoundURL !== undefined) {
              syncedOutcomeSoundArray[index] = {
                outcomeSoundCounter: 0,
                rankInNextParagraphs: index,
                outcomeSoundURL: elem.outcomeSoundURL
              };
            }
          });
          await this.setState({ outcomeSoundArray: syncedOutcomeSoundArray });
        }
      }
    }
  };

  componentDidUpdate = async prevProps => {
    if (this.props.id !== prevProps.id) {
      if (
        this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.props.id
        )
      ) {
        let paragraphInFirestore = this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.props.id
        );
        await this.setState({
          narrationInputText: paragraphInFirestore.inputText
        });

        if (
          paragraphInFirestore.nextParagraphs.some(
            el => el.outcomeSoundURL !== undefined
          )
        ) {
          let syncedOutcomeSoundArray = [];

          paragraphInFirestore.nextParagraphs.forEach((elem, index) => {
            if (elem.outcomeSoundURL !== undefined) {
              syncedOutcomeSoundArray[index] = {
                outcomeSoundCounter: 0,
                rankInNextParagraphs: index,
                outcomeSoundURL: elem.outcomeSoundURL
              };
            }
          });
          await this.setState({ outcomeSoundArray: syncedOutcomeSoundArray });
        }
      }
    }
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  loadBackgroundImage(e) {
    if (e.target.files[0].size > this.props.bytesLimitForUploads) {
      window.alert(
        `The file size cannot exceed ${this.props.bytesLimitForUploads /
          1000000} MB.`
      );
    } else {
      const selector = `outputIMG ${this.props.depthNumber} - ${
        this.props.paragraphNumber
      }`;
      var image = document.getElementById(selector);

      image.src = URL.createObjectURL(e.target.files[0]);
      this.setState({
        backgroundImage: e.target.files[0],
        backgroundImageCounter: 1
      });
    }
  }

  loadStartingSound = async e => {
    let file = e.target.files[0];
    if (file.size > this.props.bytesLimitForUploads) {
      window.alert(
        `The file size cannot exceed ${this.props.bytesLimitForUploads /
          1000000} MB.`
      );
    } else {
      await this.setState({
        startingSound: file,
        startingSoundCounter: 1
      });
      let controls = document.getElementById(
        `startingSoundControls ${this.props.depthNumber} - ${
          this.props.paragraphNumber
        }`
      );
      controls.src = URL.createObjectURL(file);
    }
  };

  loadOutcomeSound = async e => {
    let file = e.target.files[0];
    if (file.size > this.props.bytesLimitForUploads) {
      window.alert(
        `The file size cannot exceed ${this.props.bytesLimitForUploads /
          1000000} MB.`
      );
    } else {
      let newOutcomeSoundArray = this.state.outcomeSoundArray;
      let rankInNextParagraphs = parseInt(
        e.target.getAttribute("rankinnextparagraphs"),
        10
      );
      let outcomeSoundURL = URL.createObjectURL(file);
      newOutcomeSoundArray[rankInNextParagraphs] = {
        outcomeSound: file,
        outcomeSoundCounter: 1,
        rankInNextParagraphs: rankInNextParagraphs,
        outcomeSoundURL
      };

      await this.setState({
        outcomeSoundArray: newOutcomeSoundArray
      });
    }
  };

  setToSuddenDeath = () => {
    this.props.setToSuddenDeath();
  };

  setToVictory = e => {
    this.props.setToVictory(e.target);
  };

  deleteParagraph = e => {
    this.props.deleteParagraph(e);
  };

  saveParagraph = async e => {
    e.preventDefault();
    let inputs = [];
    inputs.push(this.state.narrationInputText);

    if (this.state.backgroundImage && this.state.backgroundImageCounter === 1) {
      inputs.push(this.state.backgroundImage);
      // setting the counters to 0 so that files aren't uploaded again to Firebase in case of a new save, except if a new file has been selected by the user
      await this.setState({
        backgroundImageCounter: 0
      });
    } else if (
      this.state.backgroundImage &&
      this.state.backgroundImageCounter === 0
    ) {
      inputs.push("already uploaded");
    } else inputs.push(null);

    if (this.state.startingSound && this.state.startingSoundCounter === 1) {
      inputs.push(this.state.startingSound);
      // setting the counters to 0 so that files aren't uploaded again to Firebase in case of a new save, except if a new file has been selected by the user
      await this.setState({
        startingSoundCounter: 0
      });
    } else if (
      this.state.startingSound &&
      this.state.startingSoundCounter === 0
    ) {
      inputs.push("already uploaded");
    } else inputs.push(null);

    // need to make a shallow copy of the objects for the inputs, otherwise the following reset would affect them before the save function is launched
    let inputArray = [];
    this.state.outcomeSoundArray.forEach(el => inputArray.push({ ...el }));
    inputs.push(inputArray);

    let resetOutcomeSoundArray = this.state.outcomeSoundArray;
    resetOutcomeSoundArray.map(el => (el.outcomeSoundCounter = 0));
    await this.setState({ outcomeSoundArray: resetOutcomeSoundArray });

    await this.props.saveParagraph(...inputs);
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
                } - ${followingParagraph.length}`}
                style={{ display: "none" }}
                rankinnextparagraphs={followingParagraph.length}
                onChange={this.loadOutcomeSound}
              />
              <p style={{ marginBottom: 0, display: "inline-block" }}>
                <label
                  className="label-upload"
                  htmlFor={`endingsound ${this.props.depthNumber} - ${
                    this.props.paragraphNumber
                  } - ${followingParagraph.length}`}
                  style={{ cursor: "pointer", marginBottom: 0 }}
                >
                  (Upload Sound)
                </label>
              </p>
              {this.state.outcomeSoundArray[followingParagraph.length] ? (
                <audio
                  controls
                  src={
                    this.state.outcomeSoundArray[followingParagraph.length]
                      .outcomeSoundURL
                      ? this.state.outcomeSoundArray[followingParagraph.length]
                          .outcomeSoundURL
                      : null
                  }
                  style={{
                    display: "inline-block",
                    width: "140px",
                    height: "15px",
                    paddingTop: "3px",
                    paddingLeft: "5px"
                  }}
                  id={`outcomeSoundControls ${this.props.depthNumber} - ${
                    this.props.paragraphNumber
                  } - ${followingParagraph.length}`}
                >
                  Your browser does not support the
                  <code>audio</code> element.
                </audio>
              ) : null}
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
          {this.state.startingSound || this.props.startingSoundURL ? (
            <audio
              controls
              src={
                this.props.startingSoundURL ? this.props.startingSoundURL : null
              }
              style={{
                display: "inline-block",
                width: "140px",
                height: "15px",
                paddingTop: "3px",
                paddingLeft: "5px"
              }}
              id={`startingSoundControls ${this.props.depthNumber} - ${
                this.props.paragraphNumber
              }`}
            >
              Your browser does not support the
              <code>audio</code> element.
            </audio>
          ) : null}
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
              src={
                this.props.backgroundImageURL
                  ? this.props.backgroundImageURL
                  : DefaultBackground
              }
              className="card-img-top"
              alt="Background by default"
              style={{ width: "100%", height: "100%", zIndex: 1 }}
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
                value={this.state.narrationInputText}
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
                        checked={this.props.isSuddenDeath}
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
                        checked={this.props.isVictory}
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
        <div style={{ marginTop: "5px" }}>
          <input
            type="submit"
            value="Save Paragraph"
            className="btn btn-dark paragraph-save"
            style={{ display: "inline-block", width: "50%" }}
            onClick={this.saveParagraph}
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
    );
  }
}

export default connect(state => ({
  numDepthLevels: state.numDepthLevels,
  paragraphNumberTotal: state.paragraphNumberTotal,
  paragraphData: state.paragraphData
}))(NarrationInput);
