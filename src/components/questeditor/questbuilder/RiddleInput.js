import React, { Component } from "react";
import { connect } from "react-redux";

import DefaultRiddleQuestion from "../../../image assets/riddle-default-question.jpg";
import DefaultAnswer from "../../../image assets/riddle-default-answer.jpg";

class RiddleInput extends Component {
  constructor(props) {
    super(props);
    this.loadBackgroundImage = this.loadBackgroundImage.bind(this);
    this.loadStartingSound = this.loadStartingSound.bind(this);
    this.loadOutcomeImage = this.loadOutcomeImage.bind(this);
    this.loadOutcomeSound = this.loadOutcomeSound.bind(this);
  }
  state = {
    riddleInputText: "",
    backgroundImageCounter: 0,
    startingSoundCounter: 0,
    outcomeSoundArray: [],
    outcomeImageArray: [],
    nextParagraphs: []
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
          riddleInputText: paragraphInFirestore.inputText
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

        if (
          paragraphInFirestore.nextParagraphs.some(
            el => el.outcomeImageURL !== undefined
          )
        ) {
          let syncedOutcomeImageArray = [];

          paragraphInFirestore.nextParagraphs.forEach((elem, index) => {
            if (elem.outcomeImageURL !== undefined) {
              syncedOutcomeImageArray[index] = {
                outcomeImageCounter: 0,
                rankInNextParagraphs: index,
                outcomeImageURL: elem.outcomeImageURL
              };
            }
          });
          await this.setState({ outcomeImageArray: syncedOutcomeImageArray });
        }
      }
    }
    if (this.props.nextParagraphs) {
      await this.setState({ nextParagraphs: this.props.nextParagraphs });
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
          riddleInputText: paragraphInFirestore.inputText
        });
      }
    }

    if (this.props.nextParagraphs !== prevProps.nextParagraphs) {
      await this.setState({ nextParagraphs: this.props.nextParagraphs });
    }

    // adjusting outcomeSoundArray and outcomeImageArray according to the number of next paragraphs
    if (this.props.nextParagraphs.length < prevProps.nextParagraphs.length) {
      let indexOfDeletedNextParagraph = prevProps.nextParagraphs.findIndex(
        (el, index) =>
          prevProps.nextParagraphs[index] !== this.props.nextParagraphs[index]
      );

      let newOutcomeSoundArray = this.state.outcomeSoundArray;
      newOutcomeSoundArray.splice(indexOfDeletedNextParagraph, 1);
      this.setState({ outcomeSoundArray: newOutcomeSoundArray });
      let newOutcomeImageArray = this.state.outcomeImageArray;
      newOutcomeImageArray.splice(indexOfDeletedNextParagraph, 1);
      this.setState({ outcomeImageArray: newOutcomeImageArray });
    }
  };

  onChangeInputText = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onChangeOutcomeText = async e => {
    let outcomeDepthNumber = parseInt(e.target.getAttribute("data-depnum"), 10);

    let outcomeParagraphNumber = parseInt(
      e.target.getAttribute("data-parnum"),
      10
    );

    let nextParagraphsUpdated = [...this.state.nextParagraphs];
    let nextParagraphToUpdate = {
      ...nextParagraphsUpdated.find(
        el =>
          el.depthNumber === outcomeDepthNumber &&
          el.paragraphNumber === outcomeParagraphNumber
      )
    };

    nextParagraphToUpdate.outcomeText = e.target.value;

    let index = nextParagraphsUpdated.findIndex(
      el =>
        el.depthNumber === outcomeDepthNumber &&
        el.paragraphNumber === outcomeParagraphNumber
    );

    nextParagraphsUpdated[index] = nextParagraphToUpdate;

    await this.setState({ nextParagraphs: nextParagraphsUpdated });
    await this.props.changeOutcomeText(
      outcomeDepthNumber,
      outcomeParagraphNumber,
      nextParagraphToUpdate.outcomeText
    );
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
      let image = document.getElementById(selector);
      image.src = URL.createObjectURL(e.target.files[0]);

      this.setState({
        backgroundImage: e.target.files[0],
        backgroundImageCounter: 1
      });
    }
  }

  loadOutcomeImage(e) {
    if (e.target.files[0].size > this.props.bytesLimitForUploads) {
      window.alert(
        `The file size cannot exceed ${this.props.bytesLimitForUploads /
          1000000} MB.`
      );
    } else {
      let outcomeImageURL = URL.createObjectURL(e.target.files[0]);

      let newOutcomeImageArray = this.state.outcomeImageArray;
      let rankInNextParagraphs = parseInt(
        e.target.getAttribute("rankinnextparagraphs"),
        10
      );
      newOutcomeImageArray[rankInNextParagraphs] = {
        outcomeImage: e.target.files[0],
        outcomeImageCounter: 1,
        rankInNextParagraphs: rankInNextParagraphs,
        outcomeImageURL
      };

      this.setState({
        outcomeImageArray: newOutcomeImageArray
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

  setToGraphicalRiddle = () => {
    this.props.setToGraphicalRiddle();
  };

  setToTextualRiddle = () => {
    this.props.setToTextualRiddle();
  };

  deleteParagraph = e => {
    this.props.deleteParagraph(e);
  };

  saveParagraph = async e => {
    e.preventDefault();
    let inputs = [];
    inputs.push(this.state.riddleInputText);

    if (this.state.backgroundImage && this.state.backgroundImageCounter === 1) {
      inputs.push(this.state.backgroundImage);
      // setting the counters to 0 so that files aren't uploaded again to Firebase in case of a new save, except if a new file has been uploaded by the user
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
      // setting the counters to 0 so that files aren't uploaded again to Firebase in case of a new save, except if a new file has been uploaded by the user
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
    let inputArraySounds = [];
    this.state.outcomeSoundArray.forEach(el =>
      inputArraySounds.push({ ...el })
    );
    inputs.push(inputArraySounds);

    let resetOutcomeSoundArray = this.state.outcomeSoundArray;
    resetOutcomeSoundArray.map(el => (el.outcomeSoundCounter = 0));
    await this.setState({ outcomeSoundArray: resetOutcomeSoundArray });

    // need to make a shallow copy of the objects for the inputs, otherwise the following reset would affect them before the save function is launched
    let inputArrayImages = [];
    this.state.outcomeImageArray.forEach(el =>
      inputArrayImages.push({ ...el })
    );
    inputs.push(inputArrayImages);

    let resetOutcomeImageArray = this.state.outcomeImageArray;
    resetOutcomeImageArray.map(el => (el.outcomeImageCounter = 0));
    await this.setState({ outcomeImageArray: resetOutcomeImageArray });

    // pass on inputs to paragraph component
    await this.props.saveParagraph(...inputs);
  };

  render() {
    // check all paragraph links and render paragraph outcomes
    let paragraphOutcomes = [];

    switch (true) {
      case this.props.isTextualRiddle:
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
                    this.props.paragraphData.paragraphLinkRegister[j]
                      .depthNumber
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
                      onChange={this.onChangeOutcomeText}
                      value={
                        this.state.nextParagraphs[paragraphOutcomes.length]
                          ? this.state.nextParagraphs[paragraphOutcomes.length]
                              .outcomeText
                          : ""
                      }
                      data-depnum={
                        this.props.paragraphData.paragraphLinkRegister[j]
                          .depthNumber
                      }
                      data-parnum={
                        this.props.paragraphData.paragraphLinkRegister[j]
                          .paragraphNumber
                      }
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
                      // index in the nextParagraphs array
                      rankinnextparagraphs={paragraphOutcomes.length}
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
                    {this.state.outcomeSoundArray[paragraphOutcomes.length] ? (
                      <audio
                        controls
                        src={
                          this.state.outcomeSoundArray[paragraphOutcomes.length]
                            .outcomeSoundURL
                            ? this.state.outcomeSoundArray[
                                paragraphOutcomes.length
                              ].outcomeSoundURL
                            : null
                        }
                        style={{
                          display: "inline-block",
                          width: "140px",
                          height: "15px",
                          paddingBottom: "3px",
                          paddingLeft: "5px"
                        }}
                        id={`outcomeSoundControls ${this.props.depthNumber} - ${
                          this.props.paragraphNumber
                        } - ${paragraphOutcomes.length}`}
                      >
                        Your browser does not support the
                        <code>audio</code> element.
                      </audio>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          }
        }
        break;
      case this.props.isGraphicalRiddle:
        for (
          var k = 0;
          k < this.props.paragraphData.paragraphLinkRegister.length;
          k += 1
        ) {
          if (
            this.props.paragraphData.paragraphLinkRegister[k]
              .depthNumberOfLinkedParagraph === this.props.depthNumber &&
            this.props.paragraphData.paragraphLinkRegister[k]
              .paragraphNumberOfLinkedParagraph === this.props.paragraphNumber
          ) {
            paragraphOutcomes.push(
              <div style={{ marginTop: "5px" }}>
                <h4
                  style={{
                    fontWeight: "400",
                    fontSize: "0.6rem",
                    lineHeight: "0.8rem",
                    paddingLeft: "5px",
                    display: "inline-block",
                    verticalAlign: "top",
                    marginBottom: 0
                  }}
                >
                  {`Answer leading to ${
                    this.props.paragraphData.paragraphLinkRegister[k]
                      .depthNumber
                  }-${
                    this.props.paragraphData.paragraphLinkRegister[k]
                      .paragraphNumber
                  }`}
                </h4>
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  name="image"
                  id={`answerimage ${this.props.depthNumber} - ${
                    this.props.paragraphNumber
                  } - ${k + 1}`}
                  style={{ display: "none" }}
                  onChange={this.loadOutcomeImage}
                  // index in the nextParagraphs array
                  rankinnextparagraphs={paragraphOutcomes.length}
                />{" "}
                <p style={{ marginBottom: 0, display: "inline-block" }}>
                  <label
                    className="label-upload"
                    htmlFor={`answerimage ${this.props.depthNumber} - ${
                      this.props.paragraphNumber
                    } - ${k + 1}`}
                    style={{
                      cursor: "pointer",
                      marginBottom: 0,
                      fontSize: "0.6rem",
                      verticalAlign: "top",
                      lineHeight: "0.8rem"
                    }}
                  >
                    (Upload Image)
                  </label>
                </p>
                <div>
                  <div
                    style={{
                      display: "inline-block",
                      width: "60%",
                      verticalAlign: "top"
                    }}
                  >
                    <img
                      src={
                        this.state.outcomeImageArray[
                          paragraphOutcomes.length
                        ] &&
                        this.state.outcomeImageArray[paragraphOutcomes.length]
                          .outcomeImageURL
                          ? this.state.outcomeImageArray[
                              paragraphOutcomes.length
                            ].outcomeImageURL
                          : DefaultAnswer
                      }
                      className="card-img-top"
                      alt="Answer by default"
                      style={{ width: "100%", maxHeight: "30px" }}
                      id={`answerIMG ${this.props.depthNumber} - ${
                        this.props.paragraphNumber
                      } - ${k + 1}`}
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
                      } - ${k + 1}`}
                      style={{ display: "none" }}
                      //  index in the nextParagraphs array
                      rankinnextparagraphs={paragraphOutcomes.length}
                      onChange={this.loadOutcomeSound}
                    />
                    <p
                      style={{
                        marginBottom: 0,
                        display: "inline-block",
                        paddingLeft: "5px",
                        lineHeight: "0.8rem",
                        verticalAlign: "top"
                      }}
                    >
                      <label
                        className="label-upload"
                        htmlFor={`outcomesound ${this.props.depthNumber} - ${
                          this.props.paragraphNumber
                        } - ${k + 1}`}
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
                    {this.state.outcomeSoundArray[paragraphOutcomes.length] ? (
                      <audio
                        controls
                        src={
                          this.state.outcomeSoundArray[paragraphOutcomes.length]
                            .outcomeSoundURL
                            ? this.state.outcomeSoundArray[
                                paragraphOutcomes.length
                              ].outcomeSoundURL
                            : null
                        }
                        style={{
                          display: "inline-block",
                          width: "140px",
                          height: "15px",
                          paddingBottom: "3px",
                          paddingLeft: "5px"
                        }}
                        id={`outcomeSoundControls ${this.props.depthNumber} - ${
                          this.props.paragraphNumber
                        } - ${paragraphOutcomes.length}`}
                      >
                        Your browser does not support the
                        <code>audio</code> element.
                      </audio>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          }
        }
        break;
      default:
        paragraphOutcomes = [];
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
                  : DefaultRiddleQuestion
              }
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
                name="riddleInputText"
                maxLength="750"
                placeholder="Write your riddle description here..."
                rows="4"
                required
                onChange={this.onChangeInputText}
                value={this.state.riddleInputText}
                style={{ fontSize: "0.7rem", resize: "none" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "10px"
                }}
              >
                {!this.props.isGraphicalRiddle ? (
                  <div>
                    <label style={{ marginBottom: 0 }}>Textual</label>
                    {"   "}
                    <input
                      type="checkbox"
                      checked={this.props.isTextualRiddle}
                      name="textualriddle"
                      onChange={this.setToTextualRiddle}
                    />
                  </div>
                ) : null}
                {!this.props.isTextualRiddle ? (
                  <div>
                    <label style={{ marginBottom: 0 }}>Graphical</label>
                    {"   "}
                    <input
                      type="checkbox"
                      checked={this.props.isGraphicalRiddle}
                      name="graphicalriddle"
                      onChange={this.setToGraphicalRiddle}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </form>
          <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
            <div>{paragraphOutcomes}</div>
          </div>
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
            onClick={this.props.deleteParagraph}
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
}))(RiddleInput);
