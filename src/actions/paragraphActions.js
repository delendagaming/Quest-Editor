import {
  ADD_PARAGRAPH_TO_TOTAL,
  DECREASE_PARAGRAPH_FROM_TOTAL,
  ADD_PARAGRAPH_LINK,
  REMOVE_PARAGRAPH_LINK,
  SET_TO_SUDDEN_DEATH,
  SET_TO_VICTORY,
  SET_TO_FINALBOSS,
  SET_PARAGRAPH_TYPE,
  SET_PARAGRAPH_LINK_STATUS
} from "./types";

export const addParagraphToTotal = (depthNumber, paragraphNumber) => {
  return {
    type: ADD_PARAGRAPH_TO_TOTAL,
    paragraphToAddInRegister: {
      depthNumber: depthNumber,
      paragraphNumber: paragraphNumber,
      paragraphSubTypes: {
        isSuddenDeath: false,
        isVictory: false,
        isFinalBossCombat: false
      },
      hasLinkToNextParagraph: false,
      hasLinkToPreviousParagraph: false,
      paragraphType: "narration",
      nextParagraphs: [],
      previousParagraphs: []
    }
  };
};

export const decreaseParagraphFromTotal = (depthNumber, paragraphNumber) => {
  return {
    type: DECREASE_PARAGRAPH_FROM_TOTAL,
    paragraphToDeleteInRegister: {
      depthNumber: depthNumber,
      paragraphNumber: paragraphNumber
    }
  };
};

export const setToSuddenDeathInRegister = (depthNumber, paragraphNumber) => {
  return {
    type: SET_TO_SUDDEN_DEATH,
    paragraphToSetToSuddenDeathInRegister: {
      depthNumber: depthNumber,
      paragraphNumber: paragraphNumber
    }
  };
};

export const setToVictoryInRegister = (depthNumber, paragraphNumber) => {
  return {
    type: SET_TO_VICTORY,
    paragraphToSetToVictoryInRegister: {
      depthNumber: depthNumber,
      paragraphNumber: paragraphNumber
    }
  };
};

export const setToFinalBossInRegister = (depthNumber, paragraphNumber) => {
  return {
    type: SET_TO_FINALBOSS,
    paragraphToSetToFinalBossInRegister: {
      depthNumber: depthNumber,
      paragraphNumber: paragraphNumber
    }
  };
};

export const setParagraphTypeInRegister = (
  depthNumber,
  paragraphNumber,
  paragraphType
) => {
  return {
    type: SET_PARAGRAPH_TYPE,
    paragraphType: paragraphType,
    paragraphToUpdateInRegisterWithType: {
      depthNumber: depthNumber,
      paragraphNumber: paragraphNumber
    }
  };
};

// single function to handle update of hasLinkToNextParagraph and hasLinkToPreviousParagraph
export const setParagraphLinkStatusInRegister = (
  depthNumber,
  paragraphNumber,
  nextorprevious,
  status
) => {
  return {
    type: SET_PARAGRAPH_LINK_STATUS,
    paragraphToUpdateInRegisterWithLinkStatus: {
      depthNumber: depthNumber,
      paragraphNumber: paragraphNumber
    },
    nextorprevious,
    status
  };
};

export const addParagraphLink = (
  depthNumber,
  paragraphNumber,
  depthNumberOfLinkedParagraph,
  paragraphNumberOfLinkedParagraph
) => {
  return {
    type: ADD_PARAGRAPH_LINK,
    paragraphLinkToAddInLinkRegister: {
      depthNumber,
      paragraphNumber,
      depthNumberOfLinkedParagraph,
      paragraphNumberOfLinkedParagraph
    }
  };
};

export const removeParagraphLink = (
  depthNumber,
  paragraphNumber,
  depthNumberOfLinkedParagraph,
  paragraphNumberOfLinkedParagraph
) => {
  return {
    type: REMOVE_PARAGRAPH_LINK,
    paragraphLinkToRemoveInLinkRegister: {
      depthNumber,
      paragraphNumber,
      depthNumberOfLinkedParagraph,
      paragraphNumberOfLinkedParagraph
    }
  };
};
