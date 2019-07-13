import React, { Component } from "react";
import { connect } from "react-redux";

import PointersCatalogue from "./PointersCatalogue";

import DefaultPathBackground from "../../../image assets/path-default-background.jpg";
import DefaultPointer from "../../../image assets/Pointers catalogue/1.png";

class PathInput extends Component {
  constructor(props) {
    super(props);
    this.loadBackgroundImage = this.loadBackgroundImage.bind(this);
    this.loadStartingSound = this.loadStartingSound.bind(this);
    this.loadOutcomeSound = this.loadOutcomeSound.bind(this);
  }

  state = {
    pathInputText: "",
    selectedPointers: [],
    backgroundImageCounter: 0,
    startingSoundCounter: 0,
    outcomeSoundArray: [],
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
        let selectedPointersFromFirestore = [];
        paragraphInFirestore.nextParagraphs.forEach(el => {
          if (el.selectedPointer) {
            selectedPointersFromFirestore.push(el.selectedPointer);
          } else
            selectedPointersFromFirestore.push({
              image: DefaultPointer,
              top: 0,
              left: 0
            });
        });
        await this.setState({
          pathInputText: paragraphInFirestore.inputText,
          selectedPointers: selectedPointersFromFirestore
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
        let selectedPointersFromFirestore = [];
        paragraphInFirestore.nextParagraphs.forEach(el => {
          if (el.selectedPointer) {
            selectedPointersFromFirestore.push(el.selectedPointer);
          } else
            selectedPointersFromFirestore.push({
              image: DefaultPointer,
              top: 0,
              left: 0
            });
        });
        await this.setState({
          pathInputText: paragraphInFirestore.inputText,
          selectedPointers: selectedPointersFromFirestore
        });
      }
    }

    if (
      prevProps &&
      this.props.nextParagraphs.length !== prevProps.nextParagraphs.length &&
      this.props.isPointAndClickPath === true
    ) {
      let updatedSelectedPointers = [...this.state.selectedPointers];
      if (this.props.nextParagraphs.length > prevProps.nextParagraphs.length) {
        updatedSelectedPointers.push({
          image: DefaultPointer,
          top: 0,
          left: 0
        });
      }
      if (this.props.nextParagraphs.length < prevProps.nextParagraphs.length) {
        let indexOfDeletedNextParagraph = this.props.nextParagraphs.findIndex(
          (el, index) =>
            prevProps.nextParagraphs[index] !== this.props.nextParagraphs[index]
        );

        updatedSelectedPointers.splice(indexOfDeletedNextParagraph, 1);
      }

      await this.setState({ selectedPointers: updatedSelectedPointers });
    }

    if (
      prevProps &&
      this.props.isPointAndClickPath === true &&
      prevProps.isPointAndClickPath === false
    ) {
      let updatedSelectedPointers = [...this.state.selectedPointers];
      this.props.nextParagraphs.forEach(() => {
        updatedSelectedPointers.push({
          image: DefaultPointer,
          top: 0,
          left: 0
        });
      });

      await this.setState({ selectedPointers: updatedSelectedPointers });
    }

    if (
      prevProps &&
      this.props.isPointAndClickPath === false &&
      prevProps.isPointAndClickPath === true
    ) {
      await this.setState({ selectedPointers: [] });
    }

    if (this.props.nextParagraphs !== prevProps.nextParagraphs) {
      await this.setState({ nextParagraphs: this.props.nextParagraphs });

      // adjusting outcomeSoundArray according to the number of next paragraphs
      if (this.props.nextParagraphs.length < prevProps.nextParagraphs.length) {
        let indexOfDeletedNextParagraph = prevProps.nextParagraphs.findIndex(
          (el, index) =>
            prevProps.nextParagraphs[index] !== this.props.nextParagraphs[index]
        );
        let newOutcomeSoundArray = this.state.outcomeSoundArray;
        newOutcomeSoundArray.splice(indexOfDeletedNextParagraph, 1);
        this.setState({ outcomeSoundArray: newOutcomeSoundArray });
      }
    }
  };

  onChange = e => {
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

  setToPointAndClickPath = () => {
    this.props.setToPointAndClickPath();
  };

  setToTextualPath = () => {
    this.props.setToTextualPath();
  };

  deleteParagraph = e => {
    this.props.deleteParagraph(e);
  };

  saveParagraph = async e => {
    e.preventDefault();
    let inputs = [];
    inputs.push(this.state.pathInputText);

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
    let inputArray = [];
    this.state.outcomeSoundArray.forEach(el => inputArray.push({ ...el }));
    inputs.push(inputArray);

    let resetOutcomeSoundArray = this.state.outcomeSoundArray;
    resetOutcomeSoundArray.map(el => (el.outcomeSoundCounter = 0));
    await this.setState({ outcomeSoundArray: resetOutcomeSoundArray });

    await this.props.saveParagraph(...inputs);
  };

  selectPointer = async (rankInNextParagraphs, imageSRC) => {
    let updatedSelectedPointers = this.state.selectedPointers;
    updatedSelectedPointers[rankInNextParagraphs] = {
      image: imageSRC,
      top: 0,
      left: 0
    };
    await this.setState({
      selectedPointers: updatedSelectedPointers
    });
    // updating nextParagraphs in Paragraph state
    await this.props.selectPointer(updatedSelectedPointers);
  };

  drag_start = async event => {
    var pointerInMovement = event.target;

    var style = window.getComputedStyle(event.target, null);
    var offset_data =
      parseInt(style.getPropertyValue("left"), 10) -
      event.clientX +
      "," +
      (parseInt(style.getPropertyValue("top"), 10) - event.clientY);

    event.dataTransfer.setData("text/plain", offset_data);
    this.setState({
      pointerInMovement: pointerInMovement,
      offset_data: offset_data
    });
  };

  drag_over = event => {
    var offset;
    try {
      offset = event.dataTransfer.getData("text/plain").split(",");
    } catch (e) {
      offset = this.state.offset_data.split(",");
    }
    let pointerInMovement = this.state.pointerInMovement;
    pointerInMovement.style.left =
      event.clientX + parseInt(offset[0], 10) + "px";
    pointerInMovement.style.top =
      event.clientY + parseInt(offset[1], 10) + "px";
    event.preventDefault();
    return false;
  };

  drop = async event => {
    var offset;
    try {
      offset = event.dataTransfer.getData("text/plain").split(",");
    } catch (e) {
      offset = this.state.offset_data.split(",");
    }

    let pointerInMovement = this.state.pointerInMovement;

    // check to maintain dragged image inside the drop zone (assuming 324x210 drop zone and 50x50 pointer image)

    if (event.clientX + parseInt(offset[0], 10) < 0) {
      pointerInMovement.style.left = 0 + "px";
    } else if (event.clientX + parseInt(offset[0], 10) > 274) {
      pointerInMovement.style.left = 274 + "px";
    } else {
      pointerInMovement.style.left =
        event.clientX + parseInt(offset[0], 10) + "px";
    }
    if (event.clientY + parseInt(offset[1], 10) < 0) {
      pointerInMovement.style.top = 0 + "px";
    } else if (event.clientY + parseInt(offset[1], 10) > 160) {
      pointerInMovement.style.top = 160 + "px";
    } else {
      pointerInMovement.style.top =
        event.clientY + parseInt(offset[1], 10) + "px";
    }

    event.preventDefault();

    let rankInNextParagraphs = pointerInMovement.getAttribute(
      "rankinnextparagraphs"
    );
    let updatedSelectedPointersWithCoordinates = [];
    this.state.selectedPointers.forEach(el =>
      updatedSelectedPointersWithCoordinates.push({ ...el })
    );

    updatedSelectedPointersWithCoordinates[
      rankInNextParagraphs
    ].left = parseInt(pointerInMovement.style.left, 10);
    updatedSelectedPointersWithCoordinates[rankInNextParagraphs].top = parseInt(
      pointerInMovement.style.top,
      10
    );
    await this.setState({
      selectedPointers: updatedSelectedPointersWithCoordinates
    });
    // updating nextParagraphs in Paragraph state
    await this.props.selectPointer(updatedSelectedPointersWithCoordinates);

    return false;
  };

  render() {
    // check all paragraph links and render paragraph outcomes
    let paragraphOutcomes = [];
    let draggablePointers = [];

    switch (true) {
      case this.props.isTextualPath:
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
                  {`Choice leading to ${
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
                      placeholder={`Write your path choice to ${
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
                      //  index in the nextParagraphs array
                      rankinnextparagraphs={paragraphOutcomes.length}
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
      case this.props.isPointAndClickPath:
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
              <div style={{ marginTop: "5px", position: "relative" }}>
                <li className="dropdown">
                  <a
                    className="dropdown-toggle"
                    href="#"
                    id="dropdown03"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    style={{
                      fontWeight: "500",
                      fontSize: "0.8rem"
                    }}
                  >
                    {`Pointer leading to ${
                      this.props.paragraphData.paragraphLinkRegister[k]
                        .depthNumber
                    }-${
                      this.props.paragraphData.paragraphLinkRegister[k]
                        .paragraphNumber
                    }`}
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
                    id={k}
                  >
                    {
                      <PointersCatalogue
                        //  index in the nextParagraphs array --> -1 not included due to different timing in calculation of props value (?)
                        rankinnextparagraphs={paragraphOutcomes.length}
                        selectPointer={this.selectPointer}
                      />
                    }
                  </div>
                </li>
                <img
                  src={
                    this.state.selectedPointers[paragraphOutcomes.length]
                      ? this.state.selectedPointers[paragraphOutcomes.length]
                          .image
                      : DefaultPointer
                  }
                  className="card-img-top"
                  alt="Answer by default"
                  style={{ maxHeight: "50px", maxWidth: "50px" }}
                  id={`answerIMG ${this.props.depthNumber} - ${
                    this.props.paragraphNumber
                  } - ${k + 1}`}
                />
                <div
                  style={{
                    display: "inline-block",
                    overflowWrap: "break-word",
                    width: "40%",
                    verticalAlign: "top",
                    marginTop: "10px"
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
                    // index in the nextParagraphs array
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
            );

            draggablePointers.push(
              <img
                src={
                  this.state.selectedPointers[paragraphOutcomes.length - 1]
                    ? this.state.selectedPointers[paragraphOutcomes.length - 1]
                        .image
                    : DefaultPointer
                }
                className="card-img-top-pointer"
                alt="Answer by default"
                draggable="true"
                style={{
                  maxHeight: "50px",
                  maxWidth: "50px",
                  position: "absolute",
                  top: `${
                    this.state.selectedPointers[paragraphOutcomes.length - 1]
                      ? this.state.selectedPointers[
                          paragraphOutcomes.length - 1
                        ].top
                      : 0
                  }px`,
                  left: `${
                    this.state.selectedPointers[paragraphOutcomes.length - 1]
                      ? this.state.selectedPointers[
                          paragraphOutcomes.length - 1
                        ].left
                      : 0
                  }px`
                }}
                id={`draggableIMG ${this.props.depthNumber} - ${
                  this.props.paragraphNumber
                } - ${k}`}
                onDragStart={this.drag_start}
                // index in the nextParagraphs array
                rankinnextparagraphs={paragraphOutcomes.length - 1}
              />
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
            onDragOver={this.drag_over}
            onDrop={this.drop}
          >
            <img
              src={
                this.props.backgroundImageURL
                  ? this.props.backgroundImageURL
                  : DefaultPathBackground
              }
              className="card-img-top"
              alt="Background by default"
              style={{ width: "100%", height: "100%" }}
              id={`outputIMG ${this.props.depthNumber} - ${
                this.props.paragraphNumber
              }`}
            />
            {draggablePointers}
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
                name="pathInputText"
                maxLength="750"
                placeholder="Write your path choice description here..."
                rows="4"
                required
                onChange={this.onChange}
                value={this.state.pathInputText}
                style={{ fontSize: "0.7rem", resize: "none" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "10px"
                }}
              >
                {!this.props.isPointAndClickPath ? (
                  <div>
                    <label style={{ marginBottom: 0 }}>Textual</label>
                    {"   "}
                    <input
                      type="checkbox"
                      checked={this.props.isTextualPath}
                      name="textualpath"
                      onChange={this.setToTextualPath}
                    />
                  </div>
                ) : null}
                {!this.props.isTextualPath ? (
                  <div>
                    <label style={{ marginBottom: 0 }}>Point & Click</label>
                    {"   "}
                    <input
                      type="checkbox"
                      checked={this.props.isPointAndClickPath}
                      name="pointandclickpath"
                      onChange={this.setToPointAndClickPath}
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
}))(PathInput);
