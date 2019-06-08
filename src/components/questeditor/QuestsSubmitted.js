import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";

import Spinner from "../layout/Spinner";
import Admins from "../auth/Admin";

class QuestsSubmitted extends Component {
  state = {
    questsSubmittedTotal: null,
    questsSubmittedFromScribeTotal: null
  };

  // Filter quests submitted by ScribeID and determine total number of quests submitted from the scribe
  static getDerivedStateFromProps(props, state) {
    const questsSubmitted = props.questsSubmitted;
    var user = props.firebase.auth().currentUser;

    if (questsSubmitted) {
      if (Admins.includes(user.uid)) {
        var questsSubmittedFromScribe = questsSubmitted;
      } else {
        questsSubmittedFromScribe = questsSubmitted.filter(
          quest => quest.ScribeID === user.uid
        );
      }
      return {
        questsSubmittedFromScribeTotal: questsSubmittedFromScribe.length,
        questsSubmittedFromScribe
      };
    }
    return null;
  }

  render() {
    const {
      questsSubmittedFromScribe,
      questsSubmittedFromScribeTotal
    } = this.state;

    if (questsSubmittedFromScribe) {
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
            Quests Submitted : <span>{questsSubmittedFromScribeTotal}</span>
          </h3>
          <table className="table">
            <thead className="thead-inverse">
              <tr>
                <th>Title</th>
                <th>Date of submission</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questsSubmittedFromScribe.map(questSubmittedFromScribe => (
                <tr key={questSubmittedFromScribe.id}>
                  <td>{questSubmittedFromScribe.Title}</td>
                  <td>{questSubmittedFromScribe.SubmissionDate}</td>
                  <td>{questSubmittedFromScribe.Status}</td>
                  {questSubmittedFromScribe.Status === "Submitted" ? (
                    <td>
                      <Link to={`/`} className="btn btn-secondary btn-sm">
                        <i className="fas fa-arrow-circle-right" /> Withdraw
                      </Link>
                    </td>
                  ) : (
                    <td> </td>
                  )}
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

QuestsSubmitted.propTypes = {
  firestore: PropTypes.object.isRequired,
  questsSubmitted: PropTypes.array
};

export default compose(
  firestoreConnect([{ collection: "QuestsSubmitted" }]),
  connect((state, props) => ({
    questsSubmitted: state.firestore.ordered.QuestsSubmitted
  }))
)(QuestsSubmitted);
