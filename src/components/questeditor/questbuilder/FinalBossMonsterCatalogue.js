import React, { Component } from "react";

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
}

const images = importAll(
  require.context(
    `../../../image assets/Monsters catalogue/final bosses`,
    false,
    /\.(png|jpe?g|svg)$/
  )
);

export default class MobMonsterCatalogue extends Component {
  state = {
    monsterArray: [
      {
        name: "Ragnarosito",
        attackPoints: 15,
        defensePoints: 12,
        healthPoints: 20
      },
      {
        name: "The Beakster",
        attackPoints: 18,
        defensePoints: 10,
        healthPoints: 16
      }
    ]
  };

  selectMonster = e => {
    this.state.monsterArray.forEach(el => (el.isSelected = false));
    let monsterArrayWithSelection = this.state.monsterArray;
    monsterArrayWithSelection[
      e.currentTarget.getAttribute("id")
    ].isSelected = !monsterArrayWithSelection[
      e.currentTarget.getAttribute("id")
    ].isSelected;
    // uploading monster characteristics and image to CombatInput component
    this.props.selectMonster(
      this.state.monsterArray[e.currentTarget.getAttribute("id")],
      e.currentTarget.children[0].src
    );
    this.setState({
      monsterArray: monsterArrayWithSelection
    });
  };

  render() {
    let catalogue = [];
    for (var i = 1; i <= Object.keys(images).length; i++) {
      catalogue.push(
        <div
          className={`monster-selection ${
            this.state.monsterArray[i - 1].isSelected ? "selected" : null
          }`}
          style={{ display: "inline-block", width: "100%" }}
          onClick={this.selectMonster}
          id={i - 1}
        >
          <img
            src={images[`${i}.png`]}
            className="mob-img"
            alt="Mob"
            style={{
              height: "135px",
              width: "135px",
              display: "inline-block",
              verticalAlign: "top"
            }}
          />
          <div style={{ display: "inline-block" }}>
            <h5 style={{ fontSize: "0.8rem", marginBottom: 0 }}>
              {this.state.monsterArray[i - 1].name}
            </h5>
            <h5
              style={{
                fontSize: "0.6rem",
                fontStyle: "italic",
                marginBottom: 0,
                marginLeft: "5px"
              }}
            >
              Attack Points : {this.state.monsterArray[i - 1].attackPoints}
            </h5>
            <h5
              style={{
                fontSize: "0.6rem",
                fontStyle: "italic",
                marginBottom: 0,
                marginLeft: "5px"
              }}
            >
              Defense Points : {this.state.monsterArray[i - 1].defensePoints}
            </h5>
            <h5
              style={{
                fontSize: "0.6rem",
                fontStyle: "italic",
                marginBottom: 0,
                marginLeft: "5px"
              }}
            >
              Health Points : {this.state.monsterArray[i - 1].healthPoints}
            </h5>
          </div>
        </div>
      );
    }

    return <div>{catalogue}</div>;
  }
}
