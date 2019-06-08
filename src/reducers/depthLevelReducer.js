import { ADD_DEPTH_LEVEL, DECREASE_DEPTH_LEVEL } from "../actions/types";

const initialState = {
  numDepthLevels: 0
};

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_DEPTH_LEVEL:
      return {
        ...state,
        numDepthLevels: state.numDepthLevels + 1
      };
    case DECREASE_DEPTH_LEVEL:
      return {
        ...state,
        numDepthLevels: state.numDepthLevels - 1
      };
    default:
      return state;
  }
}
