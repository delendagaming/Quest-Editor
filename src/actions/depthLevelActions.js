import { ADD_DEPTH_LEVEL, DECREASE_DEPTH_LEVEL } from "./types";

export const addDepthLevel = () => {
  return {
    type: ADD_DEPTH_LEVEL
  };
};

export const decreaseDepthLevel = () => {
  return {
    type: DECREASE_DEPTH_LEVEL
  };
};
