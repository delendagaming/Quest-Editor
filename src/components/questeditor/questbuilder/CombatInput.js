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
    selectedMonster: {}
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

  setToMobCombat = () => {
    this.props.setToMobCombat();
  };
  setToEliteMobCombat = () => {
    this.props.setToEliteMobCombat();
  };
  setToFinalBossCombat = () => {
    this.props.setToFinalBossCombat();
  };

  selectMonster = (monsterArray, monsterImage) => {
    let updatedSelectedMonster = this.state.selectedMonster;
    updatedSelectedMonster.characteristics = monsterArray;
    updatedSelectedMonster.image = monsterImage;
    this.setState({
      selectedMonster: updatedSelectedMonster
    });
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

  drop = event => {
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

    let updatedSelectedMonsterWithCoordinates = this.state.selectedMonster;
    updatedSelectedMonsterWithCoordinates.left = parseInt(
      monsterInMovement.style.left,
      10
    );
    updatedSelectedMonsterWithCoordinates.top = parseInt(
      monsterInMovement.style.top,
      10
    );
    this.setState({ selectedMonster: updatedSelectedMonsterWithCoordinates });

    return false;
  };

  render() {
    let MonsterSelection = [];

    switch (true) {
      case this.props.isMobCombat:
        MonsterSelection.push(
          <MobMonsterCatalogue
            isMobCombat={this.props.isMobCombat}
            selectMonster={this.selectMonster}
          />
        );
        break;
      case this.props.isEliteMobCombat:
        MonsterSelection.push(
          <EliteMobMonsterCatalogue
            isMobCombat={this.props.isMobCombat}
            selectMonster={this.selectMonster}
          />
        );
        break;

      case this.props.isFinalBossCombat:
        MonsterSelection.push(
          <FinalBossMonsterCatalogue
            isMobCombat={this.props.isMobCombat}
            selectMonster={this.selectMonster}
          />
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
              src={DefaultCombatBackground}
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
              style={{ height: "135px", width: "135px" }}
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
                onChange={this.onChange}
                value={this.state.textInput}
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
      </div>
    );
  }
}

export default connect(state => ({
  numDepthLevels: state.numDepthLevels,
  paragraphNumberTotal: state.paragraphNumberTotal,
  paragraphData: state.paragraphData
}))(CombatInput);
