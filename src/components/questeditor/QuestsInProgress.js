import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";

import Spinner from "../layout/Spinner";
import Admins from "../auth/Admin";

class QuestsInProgress extends Component {
  state = {
    questsInProgressTotal: null,
    questsInProgressFromScribeTotal: null,
    questsInProgressFromScribe: null
  };

  // Filter quests in progress by ScribeID and determine total number of quests in progress from the scribe
  static getDerivedStateFromProps(props, state) {
    const questsInProgress = props.questsInProgress;
    var user = props.firebase.auth().currentUser;

    if (questsInProgress) {
      if (Admins.includes(user.uid)) {
        var questsInProgressFromScribe = questsInProgress;
      } else {
        questsInProgressFromScribe = questsInProgress.filter(
          quest => quest.ScribeID === user.uid
        );
      }
      return {
        questsInProgressFromScribeTotal: questsInProgressFromScribe.length,
        questsInProgressFromScribe
      };
    }
    return null;
  }

  // delete quest in progress
  onDeleteClick = e => {
    const { firestore } = this.props;
    const id = e.target.getAttribute("data-id");
    const title = e.target.getAttribute("data-title");

    if (
      window.confirm(
        `Are you sure you want to delete the "${title}" Quest (id: ${id}) ? \n \n All content will be deleted and CANNOT BE RECOVERED.`
      )
    ) {
      firestore.delete({
        collection: "QuestsInProgress",
        doc: id
      });
    }
  };

  render() {
    const {
      questsInProgressFromScribe,
      questsInProgressFromScribeTotal
    } = this.state;

    if (questsInProgressFromScribe) {
      return (
        <div
          className="container"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            marginTop: "-50px"
          }}
        >
          <div className="row">
            <Link to="/questeditor/menu/" className="btn" id="BackToMenu">
              <i className="fas fa-arrow-circle-left" id="BackToMenu" /> Back to
              Menu
            </Link>
          </div>
          <h3>
            Quests In Progress : <span>{questsInProgressFromScribeTotal}</span>
          </h3>
          <table className="table">
            <thead className="thead-inverse">
              <tr>
                <th>Title</th>
                <th>Date of creation</th>
                <th>Date of last edit</th>
                <th>Nb of paragraphs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questsInProgressFromScribe.map(questInProgressFromScribe => (
                <tr key={questInProgressFromScribe.id}>
                  <td>{questInProgressFromScribe.Title}</td>
                  <td>{questInProgressFromScribe.CreationDate}</td>
                  <td>{questInProgressFromScribe.LastEditDate}</td>
                  <td>{questInProgressFromScribe.NbParagraphs}</td>
                  <td>
                    <Link
                      to={`/questeditor/details/${
                        questInProgressFromScribe.id
                      }`}
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="fas fa-arrow-circle-right" /> Edit
                    </Link>
                    <button
                      data-id={questInProgressFromScribe.id}
                      data-title={questInProgressFromScribe.Title}
                      onClick={this.onDeleteClick}
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="fas fa-ban" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

QuestsInProgress.propTypes = {
  firestore: PropTypes.object.isRequired,
  questsInProgress: PropTypes.array
};

export default compose(
  firestoreConnect([{ collection: "QuestsInProgress" }]),
  connect((state, props) => ({
    questsInProgress: state.firestore.ordered.QuestsInProgress
  }))
)(QuestsInProgress);
