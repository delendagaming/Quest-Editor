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
    `../../../image assets/Pointers catalogue`,
    false,
    /\.(png|jpe?g|svg)$/
  )
);

export default class PointersCatalogue extends Component {
  state = {
    pointerArray: [
      { id: 1, isSelected: true },
      { id: 2, isSelected: false },
      { id: 3, isSelected: false },
      { id: 4, isSelected: false },
      { id: 5, isSelected: false },
      { id: 6, isSelected: false }
    ]
  };

  selectPointer = e => {
    let pointerArrayWithSelection = this.state.pointerArray;
    pointerArrayWithSelection.forEach(el => (el.isSelected = false));
    pointerArrayWithSelection[
      e.currentTarget.getAttribute("id")
    ].isSelected = !pointerArrayWithSelection[
      e.currentTarget.getAttribute("id")
    ].isSelected;
    this.setState({
      pointerArray: pointerArrayWithSelection
    });

    this.props.selectPointer(this.props.rank, e.currentTarget.children[0].src);
  };

  render() {
    let pointersCatalogue = [];
    for (var i = 1; i <= Object.keys(images).length; i++) {
      pointersCatalogue.push(
        <div
          className={`pointer-selection ${
            this.state.pointerArray[i - 1].isSelected ? "selected" : null
          }`}
          style={{ display: "inline-block" }}
          onClick={this.selectPointer}
          id={i - 1}
        >
          <img
            src={images[`${i}.png`]}
            className="pointer-img"
            alt="pointer"
            style={{
              height: "45px",
              width: "45px",
              display: "inline-block",
              verticalAlign: "top"
            }}
          />
        </div>
      );
    }
    return <div>{pointersCatalogue}</div>;
  }
}
