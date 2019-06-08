import React, { Component } from "react";
import { Link } from "react-router-dom";
import { firebaseConnect } from "react-redux-firebase";

import Spinner from "../layout/Spinner";

class QuestEditorMenu extends Component {
  render() {
    var user = this.props.firebase.auth().currentUser;
    if (!user.displayName) {
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
    } else {
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
          <h1
            style={{
              margin: "auto",
              display: "block",
              textAlign: "center"
            }}
          >
            {`Welcome, ${user.displayName} !`}
          </h1>
          <div style={{ height: "30px" }} />
          <Link
            to={`/questeditor/newquest/`}
            className="btn btn-dark"
            style={{ width: "25%", margin: "auto", display: "block" }}
          >
            New Quest
          </Link>
          <div style={{ height: "30px" }} />
          <Link
            to={`/questeditor/inprogress/`}
            className="btn btn-dark"
            style={{ width: "25%", margin: "auto", display: "block" }}
          >
            Quests In Progress
          </Link>
          <div style={{ height: "30px" }} />
          <Link
            to={`/questeditor/submitted/`}
            className="btn btn-dark"
            style={{ width: "25%", margin: "auto", display: "block" }}
          >
            Quests Submitted
          </Link>
        </div>
      );
    }
  }
}

export default firebaseConnect()(QuestEditorMenu);
