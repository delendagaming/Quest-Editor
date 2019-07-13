import {
  ADD_DEPTH_LEVEL,
  DECREASE_DEPTH_LEVEL,
  CLEAR_QUEST_DATA
} from "./types";

export const addDepthLevel = currentNumDepthLevels => {
  return {
    type: ADD_DEPTH_LEVEL,
    currentNumDepthLevels: currentNumDepthLevels
  };
};

export const decreaseDepthLevel = currentNumDepthLevels => {
  return {
    type: DECREASE_DEPTH_LEVEL,
    currentNumDepthLevels: currentNumDepthLevels
  };
};

export const clearQuestData = () => {
  return {
    type: CLEAR_QUEST_DATA
  };
};
