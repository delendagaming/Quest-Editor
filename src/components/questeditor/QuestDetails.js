import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";

import Spinner from "../layout/Spinner";
import curday from "./CurrentDay";

class QuestDetails extends Component {
  constructor(props) {
    super(props);

    // create refs
    this.TitleInput = React.createRef();
    this.TagsInput = React.createRef();
    this.PriceInput = React.createRef();
    this.LevelInput = React.createRef();
    this.LinkInput = React.createRef();
    this.LocationInput = React.createRef();
    this.SummaryInput = React.createRef();
  }

  onSubmit = async e => {
    e.preventDefault();

    const { firestore, QuestUnderEdition } = this.props;

    const questUpdate = {
      Title: this.TitleInput.current.value,
      Tags: this.TagsInput.current.value,
      Price: this.PriceInput.current.value,
      Level: this.LevelInput.current.value,
      Link: this.LinkInput.current.value,
      Location: this.LocationInput.current.value,
      Summary: this.SummaryInput.current.value,
      LastEditDate: curday()
    };

    firestore
      .update(
        { collection: "QuestsInProgress", doc: QuestUnderEdition.id },
        questUpdate
      )
      .then(() => this.props.history.push("/questeditor/inprogress/"));
  };

  render() {
    const QuestUnderEdition = this.props.QuestUnderEdition;

    if (QuestUnderEdition) {
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
              textAlign: "center",
              paddingTop: "15px"
            }}
          >
            Quest Parameters{" "}
          </h1>
          <div style={{ height: "15px" }} />
          <div className="row">
            <Link to="/questeditor/inprogress/" className="btn" id="BackToMenu">
              <i className="fas fa-arrow-circle-left" id="BackToMenu" /> Back to
              Quests in Progress
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
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  defaultValue={QuestUnderEdition.Title}
                  onChange={this.onChange}
                  ref={this.TitleInput}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="QuestTags">Tags</label>
                <input
                  type="text"
                  className="form-control"
                  name="Tags"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  defaultValue={QuestUnderEdition.Tags}
                  onChange={this.onChange}
                  ref={this.TagsInput}
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
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  defaultValue={QuestUnderEdition.Price}
                  onChange={this.onChange}
                  ref={this.PriceInput}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="QuestLevel">Level</label>
                <input
                  type="text"
                  className="form-control"
                  name="Level"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  defaultValue={QuestUnderEdition.Level}
                  onChange={this.onChange}
                  ref={this.LevelInput}
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
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  defaultValue={QuestUnderEdition.Link}
                  onChange={this.onChange}
                  ref={this.LinkInput}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="QuestLocation">Location</label>
                <input
                  type="text"
                  className="form-control"
                  name="Location"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  defaultValue={QuestUnderEdition.Location}
                  onChange={this.onChange}
                  ref={this.LocationInput}
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
                rows="2"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                defaultValue={QuestUnderEdition.Summary}
                onChange={this.onChange}
                ref={this.SummaryInput}
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
              Save and update quest parameters{" "}
            </button>
          </form>
          <div className="row">
            <Link
              to={`/questeditor/questbuilder/${QuestUnderEdition.id}`}
              className="btn btn-dark"
              style={{
                width: "25%",
                margin: "auto",
                display: "block",
                marginTop: "65px"
              }}
            >
              Go to Quest Builder
            </Link>
          </div>
        </div>
      );
    } else
      return (
        <Spinner
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            marginTop: "-50px"
          }}
        />
      );
  }
}

QuestDetails.propTypes = {
  firestore: PropTypes.object.isRequired
};

export default compose(
  firestoreConnect(props => [
    {
      collection: "QuestsInProgress",
      storeAs: "QuestUnderEdition",
      doc: props.match.params.id
    }
  ]),
  connect(({ firestore: { ordered } }, props) => ({
    QuestUnderEdition: ordered.QuestUnderEdition && ordered.QuestUnderEdition[0]
  }))
)(QuestDetails);
