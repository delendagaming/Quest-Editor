import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { firestoreConnect } from "react-redux-firebase";

import curday from "./CurrentDay";
import QuestTemplate from "./questbuilder/QuestTemplate";

class NewQuest extends Component {
  state = QuestTemplate;

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  onSubmit = async e => {
    e.preventDefault();
    var user = this.props.firebase.auth().currentUser;
    var ScribeID = user.uid;
    var ScribeName = user.displayName;
    var ScribeEmail = user.email;

    await this.setState({
      CreationDate: curday(),
      LastEditDate: curday(),
      ScribeID,
      ScribeName,
      ScribeEmail
    });
    const newQuest = this.state;
    const { firestore } = this.props;
    firestore
      .add({ collection: "QuestsInProgress" }, newQuest)
      .then(() => this.props.history.push("/questeditor/builder/new"));
  };

  render() {
    return (
      <div
        className="container"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -40%)",
          marginTop: "-50px",
          width: "60%"
        }}
      >
        <h1
          style={{
            margin: "auto",
            display: "block",
            textAlign: "center"
          }}
        >
          Quest Parameters{" "}
        </h1>
        <div style={{ height: "30px" }} />
        <div className="row">
          <Link to="/questeditor/menu/" className="btn" id="BackToMenu">
            <i className="fas fa-arrow-circle-left" id="BackToMenu" /> Back to
            Menu
          </Link>
        </div>
        <form onSubmit={this.onSubmit}>
          <div
            className="form-row"
            style={{ paddingLeft: "10px", paddingRight: "10px" }}
          >
            <div className="form-group col-md-6">
              <label htmlFor="QuestTitle">Title</label>
              <input
                type="text"
                className="form-control"
                name="Title"
                placeholder="Into the Abyss"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                value={this.state.title}
                onChange={this.onChange}
                required
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="QuestTags">Tags</label>
              <input
                type="text"
                className="form-control"
                name="Tags"
                placeholder="#horror #riddle #dark"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                value={this.state.tags}
                onChange={this.onChange}
                required
              />
            </div>
          </div>
          <div
            className="form-row"
            style={{ paddingLeft: "10px", paddingRight: "10px" }}
          >
            <div className="form-group col-md-6">
              <label htmlFor="QuestPrice">Price</label>
              <input
                type="text"
                className="form-control"
                name="Price"
                placeholder="2000"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                value={this.state.price}
                onChange={this.onChange}
                required
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="QuestLevel">Level</label>
              <input
                type="text"
                className="form-control"
                name="Level"
                placeholder="1"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                value={this.state.level}
                onChange={this.onChange}
                required
              />
            </div>
          </div>
          <div
            className="form-row"
            style={{ paddingLeft: "10px", paddingRight: "10px" }}
          >
            <div className="form-group col-md-6">
              <label htmlFor="QuestLink">Link</label>
              <input
                type="text"
                className="form-control"
                name="Link"
                placeholder="Linked to Quest sg7uwerh3 : Wandering In The Desert"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                value={this.state.link}
                onChange={this.onChange}
              />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor="QuestLocation">Location</label>
              <input
                type="text"
                className="form-control"
                name="Location"
                placeholder="GPS coordinates -22.5834697346"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                value={this.state.location}
                onChange={this.onChange}
                required
              />
            </div>
          </div>
          <div
            className="form-row"
            style={{
              paddingLeft: "10px",
              paddingRight: "10px",
              paddingBottom: "10px"
            }}
          >
            <label htmlFor="Text">Summary</label>
            <textarea
              type="text"
              className="form-control"
              name="Summary"
              maxLength="100"
              placeholder="You will enter the Abyss of Agamazos, where many heroes have perished. Fire demons and the Crystal Magician await you there..."
              rows="2"
              required
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)"
              }}
              value={this.state.summary}
              onChange={this.onChange}
            />
          </div>
          <div style={{ height: "10px" }} />
          <button
            type="submit"
            className="btn btn-dark"
            style={{
              left: "50%",
              position: "absolute",
              transform: "translateX(-50%)",
              marginTop: "15px"
            }}
          >
            Save and start creating{" "}
          </button>
        </form>
      </div>
    );
  }
}

NewQuest.propTypes = {
  firestore: PropTypes.object.isRequired
};

export default firestoreConnect()(NewQuest);
