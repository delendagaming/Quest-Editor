import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";

import Spinner from "../layout/Spinner";
import Admins from "../auth/Admin";
import curday from "./CurrentDay";

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
  onDeleteClick = async e => {
    const { firestore } = this.props;
    const id = e.target.getAttribute("data-id");
    const title = e.target.getAttribute("data-title");

    if (
      window.confirm(
        `Are you sure you want to delete the Quest "${title}" ? \n \n All content will be deleted and CANNOT BE RECOVERED.`
      )
    ) {
      // deleting data from Firestore

      await firestore.delete({
        collection: "QuestsInProgress",
        doc: id
      });
      // deleting files from Storage

      // Get a reference to the storage service, which is used to create references in your storage bucket
      let storage = this.props.firebase.storage();

      // Create a storage reference from our storage service
      let storageRef = storage.ref();

      let questRef = storageRef.child(`${id}`);
      const questParagraphList = await questRef.listAll();

      await questParagraphList.prefixes.forEach(async el => {
        let startingSoundAndImageFiles = await el.listAll();
        await startingSoundAndImageFiles.items.forEach(elem => elem.delete());

        let outcomeSoundsFiles = await el
          .child("Outcomes")
          .child("Sounds")
          .listAll();
        await outcomeSoundsFiles.items.forEach(soundFile => soundFile.delete());

        let outcomeImagesFiles = await el
          .child("Outcomes")
          .child("Images")
          .listAll();
        await outcomeImagesFiles.items.forEach(imageFile => imageFile.delete());
      });
    }
  };

  onSubmitClick = async e => {
    const id = e.target.getAttribute("data-id");
    let questInProgress = {
      ...this.props.questsInProgress.find(el => el.id === id)
    };
    console.log(JSON.stringify(questInProgress));

    if (questInProgress.globalSaveCounter !== 1) {
      window.alert(
        "You must do a Global Save before you can submit this Quest."
      );
    } else if (
      !questInProgress.Paragraphs.some(
        el => el.paragraphSubTypes.isVictory === true
      )
    ) {
      window.alert(
        "The Quest must have at least one Victory Paragraph. Please edit the Quest and make a Global Save."
      );
    } else if (
      !questInProgress.Paragraphs.some(
        el => el.paragraphSubTypes.isFinalBossCombat === true
      )
    ) {
      window.alert(
        "The Quest must have at least one Final Boss Paragraph. Please edit the Quest and make a Global Save."
      );
    } else if (
      !questInProgress.Paragraphs.every(
        el => el.hasLinkToPreviousParagraph === true
      )
    ) {
      window.alert(
        "All Paragraphs of the Quest must be linked to at least one previous Paragraph. Please edit the Quest and make a Global Save."
      );
    } else if (
      !questInProgress.Paragraphs.every(
        el =>
          el.hasLinkToNextParagraph === true ||
          el.paragraphSubTypes.isVictory === true ||
          el.paragraphSubTypes.isSuddenDeath === true
      )
    ) {
      window.alert(
        "All Paragraphs of the Quest must be linked to at least one next Paragraph or be of Victory or Sudden Death type. Please edit the Quest and make a Global Save."
      );
    } else {
      if (
        window.confirm(
          `Are you sure you want to submit the Quest '${questInProgress.Title}'?`
        )
      ) {
        questInProgress.Status = "Submitted";
        questInProgress.SubmissionDate = curday();

        // Adding submitted quest to QuestsSubmitted collection in firestore and update new ID
        const result = await this.props.firestore.add(
          { collection: "QuestsSubmitted" },
          questInProgress
        );
        await this.props.firestore.update(
          { collection: "QuestsSubmitted", doc: result.id },
          {
            id: result.id
          }
        );
        // Delete from QuestsInProgress collection in firestore
        await this.props.firestore.delete({
          collection: "QuestsInProgress",
          doc: id
        });

        window.alert(
          `Your Quest has been properly submitted and will now be reviewed by the Team.`
        );
        this.props.history.push(`/questeditor/submitted/`);
      }
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
                      to={`/questeditor/details/${questInProgressFromScribe.id}`}
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
                    <button
                      data-id={questInProgressFromScribe.id}
                      data-title={questInProgressFromScribe.Title}
                      onClick={this.onSubmitClick}
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="fas fa-arrow-circle-up" /> Submit
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
