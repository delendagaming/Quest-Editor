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
  }

  state = {
    selectedPointers: [{ image: DefaultPointer, top: 0, left: 0 }]
  };

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

  setToPointAndClickPath = () => {
    this.props.setToPointAndClickPath();
  };

  setToTextualPath = () => {
    this.props.setToTextualPath();
  };

  selectPointer = (rank, imageSRC) => {
    let updatedSelectedPointers = this.state.selectedPointers;
    updatedSelectedPointers[rank] = { image: imageSRC, top: 0, left: 0 };
    this.setState({
      selectedPointers: updatedSelectedPointers
    });
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

  drop = event => {
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

    let rank = pointerInMovement.getAttribute("rank");
    let updatedSelectedPointersWithCoordinates = this.state.selectedPointers;
    updatedSelectedPointersWithCoordinates[rank].left = parseInt(
      pointerInMovement.style.left,
      10
    );
    updatedSelectedPointersWithCoordinates[rank].top = parseInt(
      pointerInMovement.style.top,
      10
    );
    this.setState({ selectedPointers: updatedSelectedPointersWithCoordinates });

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
                        rank={k}
                        selectPointer={this.selectPointer}
                      />
                    }
                  </div>
                </li>
                <img
                  src={
                    this.state.selectedPointers[k]
                      ? this.state.selectedPointers[k].image
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
                    } - ${k + 1}`}
                  >
                    {" "}
                  </h5>
                </div>
              </div>
            );
            draggablePointers.push(
              <img
                src={
                  this.state.selectedPointers[k]
                    ? this.state.selectedPointers[k].image
                    : DefaultPointer
                }
                className="card-img-top-pointer"
                alt="Answer by default"
                draggable="true"
                style={{ maxHeight: "50px", maxWidth: "50px" }}
                id={`draggableIMG ${this.props.depthNumber} - ${
                  this.props.paragraphNumber
                } - ${k}`}
                onDragStart={this.drag_start}
                rank={k}
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
            onDragOver={this.drag_over}
            onDrop={this.drop}
          >
            <img
              src={DefaultPathBackground}
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
                value={this.state.textInput}
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
      </div>
    );
  }
}

export default connect(state => ({
  numDepthLevels: state.numDepthLevels,
  paragraphNumberTotal: state.paragraphNumberTotal,
  paragraphData: state.paragraphData
}))(PathInput);
