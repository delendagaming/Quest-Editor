import React, { Component } from "react";
import { connect } from "react-redux";

import MobMonsterCatalogue from "./MobMonsterCatalogue";
import EliteMobMonsterCatalogue from "./EliteMobMonsterCatalogue";
import FinalBossMonsterCatalogue from "./FinalBossMonsterCatalogue";

import DefaultCombatBackground from "../../../image assets/combat-default-background.jpg";

class CombatInput extends Component {
  constructor(props) {
    super(props);
    this.loadBackgroundImage = this.loadBackgroundImage.bind(this);
    this.loadStartingSound = this.loadStartingSound.bind(this);
  }
  state = {
    selectedMonster: {},
    combatInputText: "",
    backgroundImageCounter: 0
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
          combatInputText: paragraphInFirestore.inputText
        });
      }
    }

    if (this.state.selectedMonster !== this.props.selectedMonster) {
      await this.setState({ selectedMonster: this.props.selectedMonster });
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
          combatInputText: paragraphInFirestore.inputText
        });
      }
    }
  };

  onChangeInputText = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  loadBackgroundImage = async e => {
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

      await this.setState({
        backgroundImage: e.target.files[0],
        backgroundImageCounter: 1
      });
    }
  };

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

  setToMobCombat = async () => {
    if (this.props.isMobCombat) {
      await this.setState({ selectedMonster: {} });
    }
    await this.props.setToMobCombat();
  };
  setToEliteMobCombat = async () => {
    if (this.props.isEliteMobCombat) {
      await this.setState({ selectedMonster: {} });
    }
    await this.props.setToEliteMobCombat();
  };
  setToFinalBossCombat = async () => {
    if (
      this.props.nextParagraphs.find(el =>
        this.props.paragraphData.paragraphRegister.find(
          elem => elem.paragraphSubTypes.isVictory === true
        )
      )
    ) {
      window.alert(
        "This paragraph is linked to a Victory paragraph and must be of 'Final Boss' type. If you want to change the type of mob, you must first remove the link to the 'Victory' paragraph."
      );
    } else {
      if (this.props.isFinalBossCombat) {
        await this.setState({ selectedMonster: {} });
      }
      await this.props.setToFinalBossCombat();
    }
  };

  deleteParagraph = e => {
    this.props.deleteParagraph(e);
  };

  saveParagraph = async e => {
    e.preventDefault();
    let inputs = [];
    inputs.push(this.state.combatInputText);

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

    await this.props.saveParagraph(...inputs);
  };

  selectMonster = async (monsterArray, monsterImage) => {
    let updatedSelectedMonster = { ...this.state.selectedMonster };
    updatedSelectedMonster.characteristics = monsterArray;
    updatedSelectedMonster.image = monsterImage;
    updatedSelectedMonster.left = 0;
    updatedSelectedMonster.top = 0;
    await this.setState({
      selectedMonster: updatedSelectedMonster
    });
    await this.props.selectMonster(updatedSelectedMonster);
  };

  drag_start = async event => {
    var monsterInMovement = event.target;

    var style = window.getComputedStyle(event.target, null);
    var offset_data =
      parseInt(style.getPropertyValue("left"), 10) -
      event.clientX +
      "," +
      (parseInt(style.getPropertyValue("top"), 10) - event.clientY);

    event.dataTransfer.setData("text/plain", offset_data);
    this.setState({
      monsterInMovement: monsterInMovement,
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
    let monsterInMovement = this.state.monsterInMovement;
    monsterInMovement.style.left =
      event.clientX + parseInt(offset[0], 10) + "px";
    monsterInMovement.style.top =
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

    let monsterInMovement = this.state.monsterInMovement;

    // check to maintain dragged image inside the drop zone (assuming 324x210 drop zone and 135x135 monster image)

    if (event.clientX + parseInt(offset[0], 10) < 0) {
      monsterInMovement.style.left = 0 + "px";
    } else if (event.clientX + parseInt(offset[0], 10) > 189) {
      monsterInMovement.style.left = 189 + "px";
    } else {
      monsterInMovement.style.left =
        event.clientX + parseInt(offset[0], 10) + "px";
    }
    if (event.clientY + parseInt(offset[1], 10) < 0) {
      monsterInMovement.style.top = 0 + "px";
    } else if (event.clientY + parseInt(offset[1], 10) > 75) {
      monsterInMovement.style.top = 75 + "px";
    } else {
      monsterInMovement.style.top =
        event.clientY + parseInt(offset[1], 10) + "px";
    }

    event.preventDefault();

    let updatedSelectedMonsterWithCoordinates = {
      ...this.state.selectedMonster
    };
    updatedSelectedMonsterWithCoordinates.left = parseInt(
      monsterInMovement.style.left,
      10
    );
    updatedSelectedMonsterWithCoordinates.top = parseInt(
      monsterInMovement.style.top,
      10
    );
    await this.setState({
      selectedMonster: updatedSelectedMonsterWithCoordinates
    });
    await this.props.selectMonster(updatedSelectedMonsterWithCoordinates);

    return false;
  };

  render() {
    let MonsterSelection = [];

    switch (true) {
      case this.props.isMobCombat:
        MonsterSelection.push(
          <MobMonsterCatalogue selectMonster={this.selectMonster} />
        );
        break;
      case this.props.isEliteMobCombat:
        MonsterSelection.push(
          <EliteMobMonsterCatalogue selectMonster={this.selectMonster} />
        );
        break;

      case this.props.isFinalBossCombat:
        MonsterSelection.push(
          <FinalBossMonsterCatalogue selectMonster={this.selectMonster} />
        );
        break;

      default:
        MonsterSelection = [];
    }

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
            onDragOver={this.drag_over}
            onDrop={this.drop}
          >
            <img
              src={
                this.props.backgroundImageURL
                  ? this.props.backgroundImageURL
                  : DefaultCombatBackground
              }
              className="card-img-top"
              alt="Background by default"
              style={{ width: "100%", height: "100%" }}
              id={`outputIMG ${this.props.depthNumber} - ${
                this.props.paragraphNumber
              }`}
            />
            <img
              src={this.state.selectedMonster.image}
              className={`card-img-top-monster ${
                this.state.selectedMonster.image ? null : "hide"
              }`}
              draggable="true"
              alt="monster"
              style={{
                height: "135px",
                width: "135px",
                top: `${
                  this.state.selectedMonster
                    ? this.state.selectedMonster.top
                    : 0
                }px`,
                left: `${
                  this.state.selectedMonster
                    ? this.state.selectedMonster.left
                    : 0
                }px`
              }}
              onDragStart={this.drag_start}
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
                name="combatInputText"
                maxLength="750"
                placeholder="Write your combat introduction text here..."
                rows="4"
                required
                onChange={this.onChangeInputText}
                value={this.state.combatInputText}
                style={{ fontSize: "0.7rem", resize: "none" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "10px",
                  marginBottom: "5px"
                }}
              >
                {!this.props.isEliteMobCombat &&
                !this.props.isFinalBossCombat ? (
                  <div>
                    <label style={{ marginBottom: 0 }}>Mob</label>
                    {"   "}
                    <input
                      type="checkbox"
                      checked={this.props.isMobCombat}
                      name="mobcombat"
                      onChange={this.setToMobCombat}
                    />
                  </div>
                ) : null}
                {!this.props.isMobCombat && !this.props.isFinalBossCombat ? (
                  <div>
                    <label style={{ marginBottom: 0 }}>Elite Mob</label>
                    {"   "}
                    <input
                      type="checkbox"
                      checked={this.props.isEliteMobCombat}
                      name="elitemobcombat"
                      onChange={this.setToEliteMobCombat}
                    />
                  </div>
                ) : null}
                {!this.props.isMobCombat && !this.props.isEliteMobCombat ? (
                  <div>
                    <label style={{ marginBottom: 0 }}>Final Boss</label>
                    {"   "}
                    <input
                      type="checkbox"
                      checked={this.props.isFinalBossCombat}
                      name="finalbosscombat"
                      onChange={this.setToFinalBossCombat}
                    />
                  </div>
                ) : null}
              </div>
              {this.props.isMobCombat ||
              this.props.isEliteMobCombat ||
              this.props.isFinalBossCombat ? (
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
                      fontSize: "0.8rem"
                    }}
                  >
                    Monster Selection
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
                    {MonsterSelection}
                  </div>
                </li>
              ) : null}
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
}))(CombatInput);
