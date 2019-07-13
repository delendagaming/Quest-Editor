import React, { Component } from "react";
import { firestoreConnect } from "react-redux-firebase";
import { compose } from "redux";
import { connect } from "react-redux";

import uuid from "uuid";

import Paragraph from "./Paragraph";

class DepthLevel extends Component {
  onDeleteParagraph = async (e, paragraphID) => {
    const parNumber = parseInt(e.target.getAttribute("paragraphnumber"), 10);
    if (this.state.paragraphsInDepthLevel > 1) {
      if (
        window.confirm(
          `Are you sure you want to delete this paragraph ? \n \n All content will be deleted and CANNOT BE RECOVERED.`
        )
      ) {
        // removing paragraph in state, then filling the empty slot by cloning the next paragraphs and decreasing their paragraph number
        await this.props.decreaseParagraphFromTotal(
          this.props.depthNumber,
          parNumber
        );
        await this.setState({
          paragraphsInDepthLevel: this.state.paragraphsInDepthLevel - 1,
          paragraphsArray: this.state.paragraphsArray.filter((el, index) => {
            return index + 1 !== parNumber;
          })
        });

        let paragraphsToUpdate = this.state.paragraphsArray.filter(
          (el, index) => {
            return index >= parNumber - 1;
          }
        );

        let paragraphsToUpdateFinal = [];

        paragraphsToUpdate.forEach(el => {
          paragraphsToUpdateFinal.push(
            React.cloneElement(el, {
              paragraphNumber: el.props.paragraphNumber - 1
            })
          );
        });

        let paragraphsUnchanged = this.state.paragraphsArray.filter(
          (el, index) => {
            return index < parNumber - 1;
          }
        );

        await this.setState({
          paragraphsArray: [...paragraphsUnchanged, ...paragraphsToUpdateFinal]
        });
      }
      // delete in Firestore database if paragraph has already been saved + update paragraphRegister and paragraphLinkRegister
      const { firestore } = this.props;
      let paragraphToDeleteInDatabase = this.props.QuestUnderEdition.Paragraphs.find(
        el => el.id === paragraphID
      );

      if (paragraphToDeleteInDatabase) {
        await firestore.update(
          {
            collection: "QuestsInProgress",
            doc: this.props.QuestUnderEdition.id
          },
          {
            Paragraphs: firestore.FieldValue.arrayRemove(
              paragraphToDeleteInDatabase
            ),
            NbParagraphs: this.props.paragraphData.paragraphNumberTotal,
            paragraphRegister: this.props.paragraphData.paragraphRegister,
            paragraphLinkRegister: this.props.paragraphData
              .paragraphLinkRegister
          }
        );

        // delete files in Firebase Storage if existing

        // Get a reference to the storage service, which is used to create references in your storage bucket
        const storage = this.props.firebase.storage();

        // Create a storage reference from our storage service
        const storageRef = storage.ref();
        const paragraphRef = storageRef.child(
          `${this.props.QuestUnderEdition.id}/Paragraph ${
            this.props.depthNumber
          } - ${parNumber}`
        );
        const paragraphList = await paragraphRef.listAll(); // list of content inside paragraph

        // delete startingSound and backgroundImage
        if (paragraphList.items.length > 0) {
          paragraphList.items.forEach(el => el.delete());
        }
        // delete outcome sounds and images if present
        if (paragraphList.prefixes.length > 0) {
          const soundsFolder = paragraphList.prefixes[0].child("Sounds");

          const soundsList = await soundsFolder.listAll();

          soundsList.items.forEach(el => el.delete());

          const imagesFolder = paragraphList.prefixes[0].child("Images");

          const imagesList = await imagesFolder.listAll();

          imagesList.items.forEach(el => el.delete());
        }
      }
    } else {
      window.alert(
        "You cannot delete this paragraph, because there must be at least one paragraph in each depth level."
      );
    }
  };

  state = {
    paragraphsInDepthLevel: 1,
    paragraphsArray: [
      <Paragraph
        key={1}
        id={uuid.v4()}
        paragraphNumber={1}
        depthNumber={this.props.depthNumber}
        deleteParagraph={this.onDeleteParagraph}
        questID={this.props.questID}
        numDepthLevels={this.props.numDepthLevels.numDepthLevels}
        bytesLimitForUploads={this.props.bytesLimitForUploads}
      />
    ],
    linkedParagraphs: 0
  };

  componentDidMount = async () => {
    if (this.props.QuestUnderEdition !== undefined) {
      let paragraphsToPrint = this.props.QuestUnderEdition.Paragraphs.filter(
        el => el.depthNumber === this.props.depthNumber
      );

      if (paragraphsToPrint.length > 0) {
        let linkedParagraphs = paragraphsToPrint.filter(
          el => el.hasLinkToPreviousParagraph === true
        );

        // finding out the highest paragraph number among the saved paragraphs, then filling the paragraphsArrayFromFirestore Array with default paragraphs
        let parNumberArray = [];
        paragraphsToPrint.forEach(el =>
          parNumberArray.push(el.paragraphNumber)
        );
        let max = parNumberArray.reduce(function(a, b) {
          return Math.max(a, b);
        });

        let paragraphsArrayFromFirestore = [];

        for (var i = 1; i <= max; i++) {
          paragraphsArrayFromFirestore.push(
            <Paragraph
              key={i - 1}
              id={uuid.v4()}
              paragraphNumber={i}
              depthNumber={this.props.depthNumber}
              deleteParagraph={this.onDeleteParagraph}
              questID={this.props.questID}
              numDepthLevels={this.props.numDepthLevels.numDepthLevels}
              bytesLimitForUploads={this.props.bytesLimitForUploads}
            />
          );
        }

        // replacing default paragraphs with saved paragraphs

        paragraphsToPrint.forEach(el => {
          paragraphsArrayFromFirestore[el.paragraphNumber - 1] = (
            <Paragraph
              key={el.paragraphNumber - 1}
              id={el.id}
              paragraphNumber={el.paragraphNumber}
              depthNumber={el.depthNumber}
              deleteParagraph={this.onDeleteParagraph}
              questID={this.props.QuestUnderEdition.id}
              numDepthLevels={this.props.QuestUnderEdition.numDepthLevels}
              bytesLimitForUploads={this.props.bytesLimitForUploads}
            />
          );
        });

        await this.setState({
          paragraphsInDepthLevel: paragraphsToPrint.length,
          linkedParagraphs: linkedParagraphs.length,
          paragraphsArray: paragraphsArrayFromFirestore
        });
      }
    }
  };

  onAddParagraph = async () => {
    await this.setState({
      paragraphsInDepthLevel: this.state.paragraphsInDepthLevel + 1
    });

    await this.setState({
      paragraphsArray: [
        ...this.state.paragraphsArray,
        <Paragraph
          key={this.state.paragraphsInDepthLevel}
          paragraphNumber={this.state.paragraphsInDepthLevel}
          depthNumber={this.props.depthNumber}
          id={uuid.v4()}
          deleteParagraph={this.onDeleteParagraph}
          questID={this.props.questID}
          numDepthLevels={this.props.numDepthLevels.numDepthLevels}
          bytesLimitForUploads={this.props.bytesLimitForUploads}
        />
      ]
    });
    await this.props.addParagraphToTotal(
      this.props.depthNumber,
      this.state.paragraphsInDepthLevel
    );

    this.el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  };

  onDeleteDepthLevel = async e => {
    let linkedParagraphs = e.currentTarget.parentElement.parentElement.children[1].getElementsByClassName(
      "linked-to-previous"
    );

    if (linkedParagraphs.length !== 0) {
      window.alert(
        "This depth level contains paragraphs that are linked to next or previous paragraphs. You must remove these links before you can delete these paragraphs and the depth level."
      );
    } else if (
      window.confirm(
        `Are you sure you want to delete this depth level ? \n \n All content from the paragraphs inside this depth level will be deleted and CANNOT BE RECOVERED.`
      )
    ) {
      for (var i = 1; i <= this.state.paragraphsInDepthLevel; i += 1) {
        // delete paragraph in Redux store
        await this.props.decreaseParagraphFromTotal(this.props.depthNumber, i);

        // delete paragraph in Firestore database and Firebase Storage if present
        const { firestore } = this.props;
        let paragraphToDeleteInDatabase = this.props.QuestUnderEdition.Paragraphs.find(
          el => el.id === this.state.paragraphsArray[i - 1].props.id
        );

        if (paragraphToDeleteInDatabase) {
          await firestore.update(
            {
              collection: "QuestsInProgress",
              doc: this.props.QuestUnderEdition.id
            },
            {
              Paragraphs: firestore.FieldValue.arrayRemove(
                paragraphToDeleteInDatabase
              )
            }
          );

          // delete files in Firebase Storage if existing

          // Get a reference to the storage service, which is used to create references in your storage bucket
          const storage = this.props.firebase.storage();

          // Create a storage reference from our storage service
          const storageRef = storage.ref();
          const paragraphRef = storageRef.child(
            `${this.props.QuestUnderEdition.id}/Paragraph ${
              this.props.depthNumber
            } - ${i}`
          );
          const paragraphList = await paragraphRef.listAll(); // list of content inside paragraph

          // delete startingSound and backgroundImage
          if (paragraphList.items.length > 0) {
            paragraphList.items.forEach(el => el.delete());
          }
          // delete outcome sounds and images if present
          if (paragraphList.prefixes.length > 0) {
            const soundsFolder = paragraphList.prefixes[0].child("Sounds");

            const soundsList = await soundsFolder.listAll();

            soundsList.items.forEach(el => el.delete());

            const imagesFolder = paragraphList.prefixes[0].child("Images");

            const imagesList = await imagesFolder.listAll();

            imagesList.items.forEach(el => el.delete());
          }
        }
      }

      await this.props.deleteDepthLevel();
      await this.props.firestore.update(
        {
          collection: "QuestsInProgress",
          doc: this.props.QuestUnderEdition.id
        },
        {
          numDepthLevels: this.props.numDepthLevels.numDepthLevels
          //NbParagraphs: this.props.paragraphData.paragraphNumberTotal,
          // paragraphRegister: this.props.paragraphData.paragraphRegister,
          // paragraphLinkRegister: this.props.paragraphData.paragraphLinkRegister
        }
      );
    }
  };

  render() {
    return (
      <div>
        <div
          className="level-depth-separation"
          style={{ textAlign: "center", marginTop: "10px" }}
        >
          <h5 style={{ display: "inline-block", marginBottom: "0.25rem" }}>
            Depth Level {this.props.depthNumber}
          </h5>
          {this.props.depthNumber ===
          this.props.numDepthLevels.numDepthLevels - 1 ? (
            <button
              style={{
                display: "inline-block",
                backgroundColor: "transparent",
                border: "none"
              }}
              onClick={this.onDeleteDepthLevel}
            >
              <i className="fas fa-trash-alt" />
            </button>
          ) : null}
        </div>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            overflowX: "auto"
          }}
        >
          {this.state.paragraphsArray}
          <input
            type="submit"
            value="Add Paragraph"
            className="btn btn-dark btn-block"
            style={{ width: "auto", margin: "auto" }}
            onClick={this.onAddParagraph}
            ref={el => {
              this.el = el;
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose(
  firestoreConnect(props => [
    {
      collection: "QuestsInProgress",
      storeAs: "QuestUnderEdition",
      doc: props.QuestUnderEdition.id
    }
  ]),
  connect(state => ({
    numDepthLevels: state.numDepthLevels,
    paragraphNumberTotal: state.paragraphNumberTotal,
    paragraphData: state.paragraphData
  }))
)(DepthLevel);
