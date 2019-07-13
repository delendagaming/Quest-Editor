import {
  ADD_DEPTH_LEVEL,
  DECREASE_DEPTH_LEVEL,
  CLEAR_QUEST_DATA,
  SYNC_REGISTERS_IN_REDUX
} from "../actions/types";

const initialState = {
  numDepthLevels: 1
};

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_DEPTH_LEVEL:
      // setting the numDepthLevels of Redux store to the value of numDepthLevels from firestore and adding one
      if (action.currentNumDepthLevels !== state.numDepthLevels) {
        console.log("sync with firestore");
        console.log(action.currentNumDepthLevels);
        console.log(state.numDepthLevels);
        return {
          ...state,
          numDepthLevels: action.currentNumDepthLevels + 1
        };
      } else {
        console.log("normal");

        return {
          ...state,
          numDepthLevels: state.numDepthLevels + 1
        };
      }

    // setting the numDepthLevels of Redux store to the value of numDepthLevels from firestore and decreasing by one

    case DECREASE_DEPTH_LEVEL:
      if (action.currentNumDepthLevels !== state.numDepthLevels) {
        console.log("option 1");
        console.log(action.currentNumDepthLevels);

        return {
          ...state,
          numDepthLevels: action.currentNumDepthLevels - 1
        };
      } else {
        console.log("option 2");
        console.log(state.numDepthLevels);
        return {
          ...state,
          numDepthLevels: state.numDepthLevels - 1
        };
      }

    case CLEAR_QUEST_DATA:
      return {
        ...state,
        numDepthLevels: 1
      };

    case SYNC_REGISTERS_IN_REDUX:
      return {
        ...state,
        numDepthLevels: action.numDepthLevelsFromFirestore
      };

    default:
      return state;
  }
}
