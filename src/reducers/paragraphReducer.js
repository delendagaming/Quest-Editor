import {
  ADD_PARAGRAPH_TO_TOTAL,
  DECREASE_PARAGRAPH_FROM_TOTAL,
  ADD_PARAGRAPH_LINK,
  REMOVE_PARAGRAPH_LINK,
  SET_TO_SUDDEN_DEATH,
  SET_TO_VICTORY,
  SET_PARAGRAPH_TYPE,
  SET_PARAGRAPH_LINK_STATUS,
  SET_TO_FINALBOSS
} from "../actions/types";

const initialState = {
  paragraphNumberTotal: 1,
  paragraphRegister: [
    {
      depthNumber: 0,
      paragraphNumber: 1,

      hasLinkToNextParagraph: false,
      hasLinkToPreviousParagraph: true,
      paragraphType: "narration",
      paragraphSubTypes: {
        isSuddenDeath: false,
        isVictory: false,
        isFinalBossCombat: false
      },
      nextParagraphs: [],
      previousParagraphs: []
    }
  ],
  paragraphLinkRegister: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_PARAGRAPH_TO_TOTAL:
      return {
        ...state,
        paragraphNumberTotal: state.paragraphNumberTotal + 1,
        paragraphRegister: state.paragraphRegister.concat(
          action.paragraphToAddInRegister
        )
      };
    case DECREASE_PARAGRAPH_FROM_TOTAL:
      let paragraphsToUpdate = state.paragraphRegister.filter((el, index) => {
        return (
          el.depthNumber === action.paragraphToDeleteInRegister.depthNumber &&
          el.paragraphNumber >
            action.paragraphToDeleteInRegister.paragraphNumber
        );
      });

      let paragraphsToUpdateFinal = [];

      paragraphsToUpdate.forEach(el => {
        paragraphsToUpdateFinal.push({
          depthNumber: action.paragraphToDeleteInRegister.depthNumber,
          paragraphNumber: el.paragraphNumber - 1
        });
      });

      // unchanged paragraphs with lower depth number or (same depth number + lower paragraph number)

      let paragraphBeforeUpdate = state.paragraphRegister.filter(
        (el, index) => {
          return (
            el.depthNumber < action.paragraphToDeleteInRegister.depthNumber ||
            (el.paragraphNumber <
              action.paragraphToDeleteInRegister.paragraphNumber &&
              el.depthNumber === action.paragraphToDeleteInRegister.depthNumber)
          );
        }
      );

      // unchanged paragraphs with higher depth number

      let paragraphAfterUpdate = state.paragraphRegister.filter((el, index) => {
        return el.depthNumber > action.paragraphToDeleteInRegister.depthNumber;
      });

      // combining all three arrays to have the new paragraphRegister without the deleted value and with adjusted paragraphNumbers where necessary
      let paragraphRegisterWithoutDeletedParagraph = [
        ...paragraphBeforeUpdate,
        ...paragraphsToUpdateFinal,
        ...paragraphAfterUpdate
      ];

      return {
        ...state,
        paragraphNumberTotal: state.paragraphNumberTotal - 1,
        paragraphRegister: paragraphRegisterWithoutDeletedParagraph
      };

    case ADD_PARAGRAPH_LINK:
      let UpdatedParagraphRegisterWithLinks = state.paragraphRegister;

      let childParagraphAdd = UpdatedParagraphRegisterWithLinks.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphLinkToAddInLinkRegister.depthNumber &&
          paragraph.paragraphNumber ===
            action.paragraphLinkToAddInLinkRegister.paragraphNumber
      );
      childParagraphAdd.hasLinkToPreviousParagraph = true;
      childParagraphAdd.previousParagraphs.push({
        depthNumber:
          action.paragraphLinkToAddInLinkRegister.depthNumberOfLinkedParagraph,
        paragraphNumber:
          action.paragraphLinkToAddInLinkRegister
            .paragraphNumberOfLinkedParagraph
      });

      let parentParagraphAdd = UpdatedParagraphRegisterWithLinks.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphLinkToAddInLinkRegister
              .depthNumberOfLinkedParagraph &&
          paragraph.paragraphNumber ===
            action.paragraphLinkToAddInLinkRegister
              .paragraphNumberOfLinkedParagraph
      );
      parentParagraphAdd.hasLinkToNextParagraph = true;
      parentParagraphAdd.nextParagraphs.push({
        depthNumber: action.paragraphLinkToAddInLinkRegister.depthNumber,
        paragraphNumber: action.paragraphLinkToAddInLinkRegister.paragraphNumber
      });

      return {
        ...state,
        paragraphLinkRegister: state.paragraphLinkRegister.concat(
          action.paragraphLinkToAddInLinkRegister
        ),
        paragraphRegister: UpdatedParagraphRegisterWithLinks
      };
    case REMOVE_PARAGRAPH_LINK:
      let UpdatedParagraphRegisterWithDeletedLinks = state.paragraphRegister;

      let childParagraphRemove = UpdatedParagraphRegisterWithDeletedLinks.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphLinkToRemoveInLinkRegister.depthNumber &&
          paragraph.paragraphNumber ===
            action.paragraphLinkToRemoveInLinkRegister.paragraphNumber
      );
      childParagraphRemove.previousParagraphs = childParagraphRemove.previousParagraphs.filter(
        previousParagraph =>
          previousParagraph.depthNumber !==
            action.paragraphLinkToRemoveInLinkRegister
              .depthNumberOfLinkedParagraph ||
          previousParagraph.paragraphNumber !==
            action.paragraphLinkToRemoveInLinkRegister
              .paragraphNumberOfLinkedParagraph
      );
      if (childParagraphRemove.previousParagraphs.length === 0) {
        childParagraphRemove.hasLinkToPreviousParagraph = false;
      }

      let parentParagraphRemove = UpdatedParagraphRegisterWithDeletedLinks.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphLinkToRemoveInLinkRegister
              .depthNumberOfLinkedParagraph &&
          paragraph.paragraphNumber ===
            action.paragraphLinkToRemoveInLinkRegister
              .paragraphNumberOfLinkedParagraph
      );
      parentParagraphRemove.nextParagraphs = parentParagraphRemove.nextParagraphs.filter(
        previousParagraph =>
          previousParagraph.depthNumber !==
            action.paragraphLinkToRemoveInLinkRegister.depthNumber ||
          previousParagraph.paragraphNumber !==
            action.paragraphLinkToRemoveInLinkRegister.paragraphNumber
      );
      if (parentParagraphRemove.nextParagraphs.length === 0) {
        parentParagraphRemove.hasLinkToNextParagraph = false;
      }

      return {
        ...state,
        paragraphLinkRegister: state.paragraphLinkRegister.filter(
          paragraphLink =>
            paragraphLink.depthNumber !==
              action.paragraphLinkToRemoveInLinkRegister.depthNumber ||
            paragraphLink.paragraphNumber !==
              action.paragraphLinkToRemoveInLinkRegister.paragraphNumber ||
            paragraphLink.depthNumberOfLinkedParagraph !==
              action.paragraphLinkToRemoveInLinkRegister
                .depthNumberOfLinkedParagraph ||
            paragraphLink.paragraphNumberOfLinkedParagraph !==
              action.paragraphLinkToRemoveInLinkRegister
                .paragraphNumberOfLinkedParagraph
        ),
        paragraphRegister: UpdatedParagraphRegisterWithDeletedLinks
      };
    case SET_TO_SUDDEN_DEATH:
      // finding the paragraph to update in the register
      let paragraphToUpdateWithSuddenDeath = state.paragraphRegister.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphToSetToSuddenDeathInRegister.depthNumber &&
          paragraph.paragraphNumber ===
            action.paragraphToSetToSuddenDeathInRegister.paragraphNumber
      );
      // setting its sudden death value to true
      paragraphToUpdateWithSuddenDeath.paragraphSubTypes.isSuddenDeath = !paragraphToUpdateWithSuddenDeath.isSuddenDeath;
      // replacing the paragraph object in the original register with the updated paragraph object
      let updatedRegisterWithSuddenDeath = state.paragraphRegister;
      updatedRegisterWithSuddenDeath[
        state.paragraphRegister.findIndex(
          paragraph =>
            paragraph.depthNumber ===
              action.paragraphToSetToSuddenDeathInRegister.depthNumber &&
            paragraph.paragraphNumber ===
              action.paragraphToSetToSuddenDeathInRegister.paragraphNumber
        )
      ] = paragraphToUpdateWithSuddenDeath;

      return {
        ...state,
        paragraphRegister: updatedRegisterWithSuddenDeath
      };
    case SET_TO_VICTORY:
      // finding the paragraph to update in the register
      let paragraphToUpdateWithVictory = state.paragraphRegister.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphToSetToVictoryInRegister.depthNumber &&
          paragraph.paragraphNumber ===
            action.paragraphToSetToVictoryInRegister.paragraphNumber
      );
      // toggle its sudden death value
      paragraphToUpdateWithVictory.paragraphSubTypes.isVictory = !paragraphToUpdateWithVictory.isVictory;
      // replacing the paragraph object in the original register with the updated paragraph object
      let updatedRegisterWithVictory = state.paragraphRegister;
      updatedRegisterWithVictory[
        state.paragraphRegister.findIndex(
          paragraph =>
            paragraph.depthNumber ===
              action.paragraphToSetToVictoryInRegister.depthNumber &&
            paragraph.paragraphNumber ===
              action.paragraphToSetToVictoryInRegister.paragraphNumber
        )
      ] = paragraphToUpdateWithVictory;

      return {
        ...state,
        paragraphRegister: updatedRegisterWithVictory
      };

    case SET_TO_FINALBOSS:
      // finding the paragraph to update in the register
      let paragraphToUpdateWithFinalBoss = state.paragraphRegister.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphToSetToFinalBossInRegister.depthNumber &&
          paragraph.paragraphNumber ===
            action.paragraphToSetToFinalBossInRegister.paragraphNumber
      );
      // setting its final boss combat value to true
      paragraphToUpdateWithFinalBoss.paragraphSubTypes.isFinalBossCombat = !paragraphToUpdateWithFinalBoss.isFinalBossCombat;
      // replacing the paragraph object in the original register with the updated paragraph object
      let updatedRegisterWithFinalBoss = state.paragraphRegister;
      updatedRegisterWithFinalBoss[
        state.paragraphRegister.findIndex(
          paragraph =>
            paragraph.depthNumber ===
              action.paragraphToSetToFinalBossInRegister.depthNumber &&
            paragraph.paragraphNumber ===
              action.paragraphToSetToFinalBossInRegister.paragraphNumber
        )
      ] = paragraphToUpdateWithFinalBoss;

      return {
        ...state,
        paragraphRegister: updatedRegisterWithFinalBoss
      };

    case SET_PARAGRAPH_TYPE:
      // finding the paragraph to update in the register
      let paragraphToUpdateWithType = state.paragraphRegister.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphToUpdateInRegisterWithType.depthNumber &&
          paragraph.paragraphNumber ===
            action.paragraphToUpdateInRegisterWithType.paragraphNumber
      );
      // setting its paragraphType value
      paragraphToUpdateWithType.paragraphType = action.paragraphType;

      // clear the paragraph subtypes
      let keys = Object.keys(paragraphToUpdateWithType.paragraphSubTypes);
      let clearedParagraphSubTypes = {};

      for (var j = 0; j < keys.length; j++) {
        clearedParagraphSubTypes[keys[j]] = false;
      }
      paragraphToUpdateWithType.paragraphSubTypes = clearedParagraphSubTypes;

      // replacing the paragraph object in the original register with the updated paragraph object
      let updatedRegisterWithParagraphType = state.paragraphRegister;
      updatedRegisterWithParagraphType[
        state.paragraphRegister.findIndex(
          paragraph =>
            paragraph.depthNumber ===
              action.paragraphToUpdateInRegisterWithType.depthNumber &&
            paragraph.paragraphNumber ===
              action.paragraphToUpdateInRegisterWithType.paragraphNumber
        )
      ] = paragraphToUpdateWithType;

      return {
        ...state,
        paragraphRegister: updatedRegisterWithParagraphType
      };

    case SET_PARAGRAPH_LINK_STATUS:
      // finding the paragraph to update in the register
      let paragraphToUpdateWithLinkStatus = state.paragraphRegister.find(
        paragraph =>
          paragraph.depthNumber ===
            action.paragraphToUpdateInRegisterWithLinkStatus.depthNumber &&
          paragraph.paragraphNumber ===
            action.paragraphToUpdateInRegisterWithLinkStatus.paragraphNumber
      );
      // setting its hasLinkToNextParagraph or hasLinkToPreviousParagraph value according to nextorprevious input
      if (action.nextorprevious === "next") {
        paragraphToUpdateWithLinkStatus.hasLinkToNextParagraph = action.status;
      } else if (action.nextorprevious === "previous") {
        paragraphToUpdateWithLinkStatus.hasLinkToPreviousParagraph =
          action.status;
      }
      // replacing the paragraph object in the original register with the updated paragraph object
      let updatedRegisterWithParagraphLinkStatus = state.paragraphRegister;
      updatedRegisterWithParagraphLinkStatus[
        state.paragraphRegister.findIndex(
          paragraph =>
            paragraph.depthNumber ===
              action.paragraphToUpdateInRegisterWithLinkStatus.depthNumber &&
            paragraph.paragraphNumber ===
              action.paragraphToUpdateInRegisterWithLinkStatus.paragraphNumber
        )
      ] = paragraphToUpdateWithLinkStatus;

      return {
        ...state,
        paragraphRegister: updatedRegisterWithParagraphLinkStatus
      };

    default:
      return state;
  }
}
