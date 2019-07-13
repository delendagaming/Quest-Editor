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

  onWithdrawClick = async e => {
    const id = e.target.getAttribute("data-id");
    let questSubmitted = {
      ...this.props.questsSubmitted.find(el => el.id === id)
    };

    if (questSubmitted.Status !== "Submitted") {
      window.alert("You cannot withdraw this Quest.");
    } else if (
      window.confirm(
        `Are you sure you want to withdraw the Quest '${
          questSubmitted.Title
        }' ?`
      )
    ) {
      questSubmitted.Status = "Withdrawn";
      questSubmitted.SubmissionDate = "";

      const result = await this.props.firestore.add(
        { collection: "QuestsInProgress" },
        questSubmitted
      );
      await this.props.firestore.update(
        { collection: "QuestsInProgress", doc: result.id },
        {
          id: result.id
        }
      );
      await this.props.firestore.delete({
        collection: "QuestsSubmitted",
        doc: id
      });
      window.alert(
        "Your Quest has been properly withdrawn and you can now access it in the Quest Editor."
      );
      this.props.history.push(`/questeditor/inprogress/`);
    }
  };

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
                      <button
                        data-id={questSubmittedFromScribe.id}
                        data-title={questSubmittedFromScribe.Title}
                        onClick={this.onWithdrawClick}
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="fas fa-arrow-circle-down" /> Withdraw
                      </button>
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
