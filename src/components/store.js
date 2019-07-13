import { createStore, combineReducers, compose } from "redux";
import firebase from "firebase";
import "firebase/firestore";
import { reactReduxFirebase, firebaseReducer } from "react-redux-firebase";
import { reduxFirestore, firestoreReducer } from "redux-firestore";

// Reducers
import notifyReducer from "../reducers/notifyReducer";
import depthLevelReducer from "../reducers/depthLevelReducer";
import paragraphReducer from "../reducers/paragraphReducer";

const firebaseConfig = {
  apiKey: "AIzaSyAb4GBXr2OHnzMnvBrZlfWqyQt0crnmgAg",
  authDomain: "delendaproto.firebaseapp.com",
  databaseURL: "https://delendaproto.firebaseio.com",
  projectId: "delendaproto",
  storageBucket: "delendaproto.appspot.com",
  messagingSenderId: "598525885409"
};

// react-redux-firebase config
const rrfConfig = {
  userProfile: "users",
  useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
};

// Initialize firebase instance
firebase.initializeApp(firebaseConfig);

// Initialize firestore
firebase.firestore();

// Add reactReduxFirebase enhancer when making store creator
const createStoreWithFirebase = compose(
  reactReduxFirebase(firebase, rrfConfig), // firebase instance as first argument
  reduxFirestore(firebase) // <- needed if using firestore
)(createStore);

// Add firebase to reducers
const rootReducer = combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer, // <- needed if using firestore
  notify: notifyReducer,
  numDepthLevels: depthLevelReducer,
  paragraphData: paragraphReducer
});

// create initial state
const initialState = {};
const store = createStoreWithFirebase(
  rootReducer,
  initialState,
  compose(
    reactReduxFirebase(firebase),
    window.__REDUX_DEVTOOLS_EXTENSION__
      ? window.__REDUX_DEVTOOLS_EXTENSION__ &&
          window.__REDUX_DEVTOOLS_EXTENSION__()
      : f => f
  )
);

export default store;
